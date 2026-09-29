import { Invoice } from '@prisma/client';
import QBClient from './qb.client';
import QBFetchAllService from './qbFetchAll.service';
import {
  InvoiceRepository,
  InvoiceWithDetails,
} from '../../repositories/invoice/invoice.repository';

const invoiceRepository = new InvoiceRepository();
const qBFetchAllService = new QBFetchAllService();
const qbClient = new QBClient();

const SCRAPPY_TAX_AGENCY_NAME = 'Scrappy Tax Agency';

export default class QBPushInvoicesService {
  public async pushInvoicesQueue(orgId: string, invoiceIds: string[]) {
    return invoiceRepository.updateQbSync(orgId, invoiceIds);
  }

  public async getInvoicesToSync(orgId: string, invoiceIds?: string[]) {
    //Filtering out already paid ones.
    if (invoiceIds) {
      //Invoices already validated in qb route validator
      return invoiceRepository.getInvoicesToSync(orgId, invoiceIds);
    }
    const invoices: InvoiceWithDetails[] =
      await invoiceRepository.getInvoicesToSync(orgId);
    //Only sync valid invoices
    return invoices.filter((invoice: any) => this.isValidToSync(invoice));
  }

  public async pushInvoices(orgId: string, invoiceIds?: string[]) {
    const tokens = await qbClient.getTokens(orgId);
    if (!tokens || !tokens.accessToken) {
      console.warn(
        'Unable to push invoices. No QB tokens found for org: ',
        orgId
      );
      return;
    }
    //Optionally pass an array of ids, if not, fetch all qualifying invoices.
    const invoicesToSync = await this.getInvoicesToSync(orgId, invoiceIds);
    if (invoicesToSync.length) {
      const newQbInvoices: InvoiceWithDetails[] = [];
      const existingQbInvoices: InvoiceWithDetails[] = [];
      invoicesToSync.forEach((invoice: InvoiceWithDetails) => {
        if (invoice.qbId) {
          existingQbInvoices.push(invoice);
        } else {
          newQbInvoices.push(invoice);
        }
      });
      const terms: Set<number> = new Set();
      const taxes: Set<number> = new Set();
      invoicesToSync.forEach((invoice: Invoice) => {
        terms.add(invoice.terms || 0);
        taxes.add(invoice.taxRate || 0);
      });
      const qbTerms = await this.getOrCreateTerms(orgId, terms);
      //We need to taxCodeId for creating the QB Invoice and setting the taxes.
      const qbTaxes = await this.getOrCreateTaxes(orgId, taxes);
      //const qbCustomFields = await qBFetchAllService.getCustomFields(orgId);
      //TODO: custom fields. Not currently implemented. Waiting for product since Scrappy custom fields are per line item, and QB custom fields are per invoice.
      //const qbCustomFieldsMap = this.formatQbCustomFields(qbCustomFields);
      const qbCustomFieldsMap = new Map();
      await this.pushNewInvoices(
        orgId,
        newQbInvoices,
        qbTerms,
        qbTaxes,
        qbCustomFieldsMap
      );

      await this.pushExistingInvoices(
        orgId,
        existingQbInvoices,
        qbTerms,
        qbTaxes,
        qbCustomFieldsMap
      );
    }
    return { ok: true };
  }

  public formatQbCustomFields(qbCustomFields: any[]) {
    const qbCustomFieldsMap: Map<String, any> = new Map();
    //QB Preferences custom field array should contain two items.
    if (qbCustomFields.length != 2) {
      return qbCustomFieldsMap;
    }
    const customFieldSettings = qbCustomFields[0].CustomField;
    const customFieldEnabled = qbCustomFields[1].CustomField;
    if (!customFieldSettings?.length || !customFieldEnabled?.length) {
      return qbCustomFieldsMap;
    }
    customFieldEnabled.forEach((customField: any) =>
      qbCustomFieldsMap.set(customField.StringValue, customField)
    );
    return customFieldEnabled;
  }

  public async getOrCreateTerms(
    orgId: string,
    terms: Set<number>
  ): Promise<Map<number, any>> {
    //NOTE: terms could with the same dueDays could be overridden in the map. The effect would be that the invoice would end up with ANY term name that matches the number of days.
    const qbTerms = await qBFetchAllService.getAllTerms(orgId);
    const qbTermsMap = new Map();
    qbTerms.forEach((qbTerm: any) => {
      qbTermsMap.set(qbTerm.DueDays, qbTerm);
    });
    //Look for missing QB terms.
    const termsArr = Array.from(terms);
    for (let i = 0; i < termsArr.length; i++) {
      const term = termsArr[i];
      const matchingTerm = qbTermsMap.get(term);
      if (!matchingTerm) {
        //Create term in QB.
        const newTerm = await this.createQbTerm(orgId, term);
        qbTermsMap.set(newTerm.Term.DueDays, newTerm.Term);
      }
    }
    return qbTermsMap;
  }

  public async createQbTerm(orgId: string, term: number) {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${tokens!.companyId}/term`,
      tokens,
      {
        DueDays: term,
        Name: `Scrappy Term ${term}`,
      }
    );
    if (response.error) {
      console.error('error createQbTerm: ', response.error);
      throw new Error('Something went wrong creating QuickBooks term');
    }
    return response;
  }

  public async getOrCreateTaxes(
    orgId: string,
    taxes: Set<number>
  ): Promise<Map<number, any>> {
    //NOTE: taxes with the same rate could be overridden in the map. The effect would be that the invoice would end up with ANY tax name that matches the rate. eg: [{name: 'My Tax', rate: 10}, {name: 'Other Tax', rate: 10}]. Since rate is the same, any would be picked.
    const qbTaxAgency = await this.getOrCreateTaxAgency(orgId);
    const qbTaxRates = await qBFetchAllService.getAllTaxRates(orgId);
    const qbTaxCodes = await qBFetchAllService.getAllTaxCodes(orgId);
    const filteredTaxCode = qbTaxCodes.filter(
      (item: any) => item.SalesTaxRateList?.TaxRateDetail?.length
    );
    const qbTaxesMap = new Map();
    qbTaxRates.forEach((qbTaxRate: any) => {
      //Find the FIRST matching corresponding taxCode.
      const taxCode = filteredTaxCode.find((qbTaxCode: any) => {
        const taxRatesDetails = qbTaxCode.SalesTaxRateList.TaxRateDetail;
        const match = taxRatesDetails.find(
          (i: any) => i.TaxRateRef?.value === qbTaxRate.Id
        );
        if (match) {
          return true;
        }
        return false;
      });
      //Inject taxCodeId
      if (taxCode) {
        qbTaxesMap.set(qbTaxRate.RateValue, {
          ...qbTaxRate,
          TaxCodeId: taxCode.Id,
        });
      }
    });
    //Look for missing QB tax-rates.
    const taxArr = Array.from(taxes);
    for (let i = 0; i < taxArr.length; i++) {
      const tax = taxArr[i];
      const matchingTax = qbTaxesMap.get(tax);
      if (!matchingTax) {
        //Create tax in QB.
        const newTax = await this.createQbTax(orgId, tax, qbTaxAgency.Id);
        qbTaxesMap.set(newTax.TaxRateDetails[0].RateValue, newTax);
      }
    }
    return qbTaxesMap;
  }

  public async getOrCreateTaxAgency(orgId: string) {
    const qbTaxAgency = await qBFetchAllService.getTaxAgency(
      orgId,
      SCRAPPY_TAX_AGENCY_NAME
    );
    if (!qbTaxAgency) {
      //create only one taxAgency for re-usability.
      const newTaxAgency = await this.createQbTaxAgency(orgId);
      return newTaxAgency;
    }
    return qbTaxAgency;
  }

  public async createQbTaxAgency(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/taxagency?minorversion=69`,
      tokens,
      {
        DisplayName: SCRAPPY_TAX_AGENCY_NAME,
      }
    );
    if (response.error) {
      console.error('error createQbTaxAgency: ', response.error);
      throw new Error('Something went wrong creating QuickBooks taxAgency');
    }
    return response.TaxAgency;
  }

  public async createQbTax(orgId: string, tax: number, taxAgencyId: string) {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/taxservice/taxcode?minorversion=69`,
      tokens,
      {
        TaxRateDetails: [
          {
            RateValue: tax,
            TaxApplicableOn: 'Sales',
            TaxAgencyId: taxAgencyId,
            TaxRateName: `Scrappy Tax ${tax}`,
          },
        ],
        TaxCode: `Scrappy TaxCode ${tax}`,
      }
    );
    if (response.error) {
      console.error('error createQbTerm: ', response.error);
      throw new Error('Something went wrong creating QuickBooks taxRate');
    }
    return response;
  }

  public async pushNewInvoices(
    orgId: string,
    invoices: InvoiceWithDetails[],
    qbTermsMap: Map<number, any>,
    qbTaxesMap: Map<number, any>,
    qbCustomFieldsMap: Map<string, any>
  ) {
    return await Promise.all(
      invoices.map(async (invoice: InvoiceWithDetails) => {
        //Create invoice in QB.
        const currentDate = new Date();
        let dataToUpdate = {};
        try {
          const response = await this.createQbInvoice(
            orgId,
            invoice,
            qbTermsMap,
            qbTaxesMap,
            qbCustomFieldsMap
          );
          dataToUpdate = {
            qbId: response.Invoice?.Id,
            qbSyncToken: response.Invoice?.SyncToken,
            scrappySyncToken: response.Invoice?.SyncToken,
            syncToQb: null,
            qbLastSynced: currentDate,
            updatedAt: currentDate,
            qbSyncFailed: false,
          };
        } catch (error) {
          invoice.qbSyncFailed = true;
          dataToUpdate = { qbSyncFailed: true };
        }
        // Need to save off Id and SyncToken for the newly created object.
        await invoiceRepository.updateInvoice(
          orgId,
          invoice.id,
          dataToUpdate as unknown as any
        );
      })
    );
  }

  public formatQbDate(date: Date | null | undefined, separator: string) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String((date.getMonth() || 0) + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
  }

  public async createQbInvoice(
    orgId: string,
    invoice: InvoiceWithDetails,
    qbTermsMap: Map<number, any>,
    qbTaxesMap: Map<number, any>,
    qbCustomFieldsMap: Map<string, any>
  ) {
    const tokens = await qbClient.getTokens(orgId);
    const taxRate = qbTaxesMap.get(invoice.taxRate || 0);
    const taxCodeId = taxRate?.TaxCodeId;
    const totalTaxableAmount = invoice.invoiceDetail?.reduce(
      (acc: number, detail: any) =>
        acc + (detail.isTaxable ? detail.amount || 0 : 0),
      0
    );
    const totalTax = invoice.taxRate
      ? totalTaxableAmount * (invoice.taxRate / 100)
      : 0;

    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/invoice?minorversion=14`,
      tokens,
      {
        ...this.getQuickBooksInvoicePayload(
          invoice,
          qbTermsMap,
          taxCodeId,
          totalTax
        ),
      }
    );
    if (response.error) {
      console.error('error createQbInvoice: ', response.error);
      throw new Error('Something went wrong creating QuickBooks invoice');
    }
    return response;
  }

  public async pushExistingInvoices(
    orgId: string,
    invoices: InvoiceWithDetails[],
    qbTermsMap: Map<number, any>,
    qbTaxesMap: Map<number, any>,
    qbCustomFieldsMap: Map<string, any>
  ) {
    return await Promise.all(
      invoices.map(async (invoice: InvoiceWithDetails) => {
        //Update invoice in QB.
        const currentDate = new Date();
        let dataToUpdate = {};
        try {
          const response = await this.updateQbInvoice(
            orgId,
            invoice,
            qbTermsMap,
            qbTaxesMap,
            qbCustomFieldsMap
          );
          dataToUpdate = {
            qbSyncToken: response.Invoice?.SyncToken,
            scrappySyncToken: response.Invoice?.SyncToken,
            syncToQb: null,
            qbLastSynced: currentDate,
            updatedAt: currentDate,
            qbSyncFailed: false,
          };
        } catch (error) {
          invoice.qbSyncFailed = true;
          dataToUpdate = { qbSyncFailed: true };
        }
        // Need to save off Id and SyncToken for the newly created object.
        await invoiceRepository.updateInvoice(
          orgId,
          invoice.id,
          dataToUpdate as unknown as any
        );
      })
    );
  }

  public async updateQbInvoice(
    orgId: string,
    invoice: InvoiceWithDetails,
    qbTermsMap: Map<number, any>,
    qbTaxesMap: Map<number, any>,
    qbCustomFieldsMap: Map<string, any>
  ) {
    const qbInvoice = await this.getInvoice(orgId, invoice.qbId || '');

    const tokens = await qbClient.getTokens(orgId);
    const taxRate = qbTaxesMap.get(invoice.taxRate || 0);
    const taxCodeId = taxRate?.TaxCodeId;
    const totalTaxableAmount = invoice.invoiceDetail?.reduce(
      (acc: number, detail: any) =>
        acc + (detail.isTaxable ? detail.amount || 0 : 0),
      0
    );
    const totalTax = invoice.taxRate
      ? totalTaxableAmount * (invoice.taxRate / 100)
      : 0;

    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/invoice?minorversion=14`,
      tokens,
      {
        ...this.getQuickBooksInvoicePayload(
          invoice,
          qbTermsMap,
          taxCodeId,
          totalTax
        ),
        Id: invoice.qbId,
        SyncToken: qbInvoice.SyncToken,
        //Since we're setting sparse, any other field we don't send would remain the same. If removed, then QB would perform a full update, setting to null any other field NOT set in the request.
        sparse: true,
      }
    );
    if (response.error) {
      console.error('error updateQbInvoice: ', response.Fault);
      throw new Error('Something went wrong updating QuickBooks invoice');
    }
    return response;
  }

  public getQuickBooksInvoicePayload(
    invoice: InvoiceWithDetails,
    qbTermsMap: Map<number, any>,
    taxCodeId: string | undefined,
    totalTax: number
  ) {
    return {
      DocNumber: invoice.invoiceNo,
      BillEmail: {
        Address: invoice.billingEmail,
      },
      DueDate: this.formatQbDate(invoice.dueDate, '-'),
      TxnDate: this.formatQbDate(invoice.invoiceDate, '/'),
      CustomerMemo: {
        value: invoice.messageOnInvoice,
      },
      BillAddr: {
        Line1: invoice.billingLine1,
        Line2: invoice.billingLine2,
        City: invoice.billingCity,
        CountrySubDivisionCode: invoice.billingState,
        PostalCode: invoice.billingZipcode,
        Country: 'USD',
      },
      Line: invoice.invoiceDetail?.map((detail: any) => ({
        DetailType: 'SalesItemLineDetail',
        Amount: detail.amount,
        Description: detail.description,
        SalesItemLineDetail: {
          ItemRef: {
            value: detail.jobSubType?.qbId,
          },
          Qty: detail.quantity,
          UnitPrice: detail.cost,
          ...(detail.isTaxable
            ? {
                TaxCodeRef: {
                  value: 'TAX',
                },
              }
            : {}),
        },
      })),
      SalesTermRef: {
        value: qbTermsMap.get(invoice.terms || 0)?.Id,
      },
      CustomerRef: {
        value: invoice.customer?.qbId,
      },
      ...(invoice.taxRate
        ? {
            TxnTaxDetail: {
              TxnTaxCodeRef: {
                value: taxCodeId,
              },
              TotalTax: totalTax,
            },
          }
        : {}),
    };
  }

  public async getInvoice(orgId: string, qbId: string) {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/invoice/${qbId}`,
      tokens
    );
    return response.Invoice;
  }

  public async allInvoiceCustomersSynched(orgId: string, invoiceIds: string[]) {
    const invoices = await invoiceRepository.getInvoicesByIds(
      orgId,
      invoiceIds
    );
    let isValid = true;
    invoices.forEach((invoice: any) => {
      if (!invoice.customer.qbId) {
        isValid = false;
      }
      invoice.invoiceDetail.forEach((detail: any) => {
        if (!detail.jobSubType.qbId) {
          isValid = false;
        }
      });
    });
    return isValid;
  }

  isValidToSync(invoice: any) {
    let isValid = true;
    if (!invoice.customer.qbId) {
      isValid = false;
    }
    invoice.invoiceDetail.forEach((detail: any) => {
      if (!detail.jobSubType.qbId) {
        isValid = false;
      }
    });
    return isValid;
  }
}
