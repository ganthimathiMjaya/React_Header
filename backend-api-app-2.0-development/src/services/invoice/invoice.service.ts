import { InvoiceRepository } from '../../repositories/invoice/invoice.repository';
import { JobRepository } from '../../repositories/job/job.repository';
import { InvoiceDto } from '../../dto/invoice.dto';
import { LineItemsDto } from '../../dto/lineItems.dto';
import {
  createInvoiceNumberFromInvoice,
  createInvoiceNumberFromName,
} from '../../utils/reports/invoice/createInvoiceRecords';
import QBPushInvoicesService from '../qb/qbPushInvoices.service';

const invoiceRepository = new InvoiceRepository();
const jobRepository = new JobRepository();
const qbPusInvoicesService = new QBPushInvoicesService();

export class InvoiceService {
  private invoiceFromDbRecord(invoice: any): InvoiceDto {
    const canSyncToQuickBooks = qbPusInvoicesService.isValidToSync(invoice);
    const subTotal = invoice.invoiceDetail
      .map((invoiceDetail: any) => invoiceDetail.amount)
      .reduce((a: number, c: number) => a + c, 0);
    const tax = invoice.invoiceDetail
      .filter((invoiceDetail: any) => invoiceDetail.isTaxable)
      .map(
        (invoiceDetail: any) => invoiceDetail.amount * (invoice.taxRate / 100)
      )
      .reduce((a: number, c: number) => a + c, 0);
    return new InvoiceDto({
      id: invoice.id,
      statusId: invoice.statusId,
      statusName: invoice.status?.desc,
      invoiceNo: invoice.invoiceNo,
      terms: invoice.terms,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      customerId: invoice.customer?.id,
      customerName: invoice.customer?.name,
      projectId: invoice.projectId,
      projectName: invoice.projectName,
      accountingSoftware: invoice.projectAccountingSoftware,
      lineItemsCount: invoice.invoiceDetail?.length,
      taxRate: invoice.taxRate,
      messageOnInvoice: invoice.messageOnInvoice,
      total: subTotal + tax, // invoice.total,
      subTotal,
      tax,
      billingEmail: invoice.billingEmail,
      invoicingNotes: invoice.notes,
      customerNotes: invoice.customer?.notes, // Customer Invoicing Notes
      projectInvoicingNotes: invoice.projectBillingNotes,
      billingAddress: {
        line1: invoice.billingLine1,
        line2: invoice.billingLine2,
        city: invoice.billingCity,
        state: invoice.billingState,
        zipCode: invoice.billingZipcode,
      },
      projectAddress: {
        line1: invoice.projectLine1,
        line2: invoice.projectLine2,
        city: invoice.projectCity,
        state: invoice.projectState,
        zipCode: invoice.projectZipcode,
      },
      invoiceDetails: invoice.invoiceDetail,
      canSyncToQuickBooks,
      syncToQb: invoice.syncToQb,
      qbId: invoice.qbId,
      qbSyncToken: invoice.qbSyncToken,
      scrappySyncToken: invoice.scrappySyncToken,
      qbLastSynced: invoice.qbLastSynced,
      qbSyncFailed: invoice.qbSyncFailed,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    });
  }

  async getInvoice(
    orgId: string,
    invoiceId: string
  ): Promise<InvoiceDto | null> {
    const invoice = await invoiceRepository.getInvoice(orgId, invoiceId);
    if (invoice) {
      return this.invoiceFromDbRecord(invoice);
    } else {
      return null;
    }
  }

  async getInvoices(orgId: string): Promise<InvoiceDto[]> {
    const invoices = await invoiceRepository.getInvoices(orgId);
    return invoices.map((invoice) => this.invoiceFromDbRecord(invoice));
  }

  async createBlankInvoice(
    orgId: string,
    body: {
      invoiceNo: string;
      billingEmail: string | null;
      billingPhone: string | null;
      customerId: string;
      invoiceDate: string;
      messageOnInvoice: string | null;
      statusId: number;
      projectId: string | null;
      terms: number;
      taxRate?: number;
      customerName: string | undefined;
      projectName: string | undefined;
      projectBillingNotes: string | null | undefined;
      projectAccountingSoftware: string | null | undefined;
      projectCommunityName: string | null | undefined;
      billingLine1: string | undefined;
      billingLine2: string | null | undefined;
      billingCity: string | undefined;
      billingState: string | undefined;
      billingZipcode: string | undefined;
      projectLine1: string | undefined;
      projectLine2: string | null | undefined;
      projectLine3: string | null | undefined;
      projectCity: string | undefined;
      projectState: string | undefined;
      projectZipcode: string | undefined;
    }
  ) {
    //Requirement in DIAL-404 that terms defautl to 30 days - Danielle
    if (!body.terms) {
      body.terms = 30;
    }

    const invoiceDate = new Date(body.invoiceDate);
    const dueDate = new Date(body.invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + body.terms);

    return invoiceRepository.createInvoice(orgId, {
      ...body,
      dueDate: dueDate,
      invoiceDate: invoiceDate,
      invoiceNo: createInvoiceNumberFromName(body.customerName),
    });
  }

  async updateInvoice(
    orgId: string,
    invoiceId: string,
    body: {
      invoiceNo: string;
      billingEmail: string | null;
      customerId: string;
      invoiceDate: string;
      messageOnInvoice: string | null;
      statusId: number;
      projectId: string | null;
      terms: number;
      taxRate?: number;
      projectName: string | undefined;
      projectBillingNotes: string | null | undefined;
      projectAccountingSoftware: string | null | undefined;
      projectCommunityName: string | null | undefined;
      billingLine1: string | undefined;
      billingLine2: string | null | undefined;
      billingLine3: string | null | undefined;
      billingCity: string | undefined;
      billingState: string | undefined;
      billingZipcode: string | undefined;
      projectLine1: string | undefined;
      projectLine2: string | null | undefined;
      projectLine3: string | null | undefined;
      projectCity: string | undefined;
      projectState: string | undefined;
      projectZipcode: string | undefined;
    }
  ) {
    const invoiceDate = new Date(body.invoiceDate);
    const dueDate = new Date(body.invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + body.terms);

    return invoiceRepository.updateInvoice(orgId, invoiceId, {
      ...body,
      dueDate: dueDate,
      invoiceDate: invoiceDate,
    });
  }

  async combineInvoices(orgId: string, invoiceIds: string[]) {
    const invoices = await invoiceRepository.getByIds(orgId, invoiceIds);
    if (invoices.length > 1) {
      // This works due to the sort in getByIds - Danielle
      const newestInvoice = invoices[0];

      // Determine if the invoices are valid matches for combining - Danielle
      const nonMatchingInvoices = invoices
        .map((invoice) => {
          if (invoice.projectId !== newestInvoice.projectId) {
            return invoice;
          }
          if (invoice.taxRate !== newestInvoice.taxRate) {
            return invoice;
          }
          if (
            invoice.status?.code !== 'CRD' &&
            invoice.status?.code !== 'SNT'
          ) {
            return invoice;
          }
          return null;
        })
        .filter((invoice) => invoice !== null);

      if (nonMatchingInvoices.length > 0) {
        throw new Error('Invoices are incompatible and cannot be combined');
      }

      // Determine some of the invoice values for the new invoice - Danielle
      const lineItems = invoices.flatMap((invoice) => invoice.invoiceDetail);
      const invoiceNo = createInvoiceNumberFromInvoice(newestInvoice);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + newestInvoice.terms!);

      // Create the new invoice header - Danielle
      const newInvoice = await invoiceRepository.createInvoice(orgId, {
        customerId: newestInvoice.customerId!,
        statusId: newestInvoice.statusId!,
        projectId: newestInvoice.projectId,
        terms: newestInvoice.terms!,
        taxRate: newestInvoice.taxRate!,
        messageOnInvoice: newestInvoice.messageOnInvoice!,
        projectName: newestInvoice.projectName!,
        billingLine1: newestInvoice.customer?.billingAddressLine1!,
        billingLine2: newestInvoice.customer?.billingAddressLine2!,
        billingCity: newestInvoice.customer?.billingCity!,
        billingState: newestInvoice.customer?.billingState!,
        billingZipcode: newestInvoice.customer?.billingZipcode!,
        billingEmail: newestInvoice.customer?.billingEmail!,
        billingPhone: newestInvoice.customer?.billingPhone!,
        projectLine1: newestInvoice.projectLine1!,
        projectLine2: newestInvoice.projectLine2!,
        projectLine3: newestInvoice.projectLine3!,
        projectCity: newestInvoice.projectCity!,
        projectState: newestInvoice.projectState!,
        projectZipcode: newestInvoice.projectZipcode!,
        projectBillingNotes: newestInvoice.projectBillingNotes!,
        projectAccountingSoftware: newestInvoice.projectAccountingSoftware!,
        projectCommunityName: newestInvoice.projectCommunityName!,
        invoiceNo: invoiceNo,
        invoiceDate: new Date(),
        dueDate: dueDate,
      });

      // Build the new invoice line items - Danielle
      const newLineItems = lineItems.map((oldLineItem, index) => {
        return {
          jobId: oldLineItem.jobId,
          taxRate: oldLineItem.taxRate,
          isTaxable: oldLineItem.isTaxable,
          quantity: oldLineItem.quantity,
          description: oldLineItem.description,
          serviceDate: oldLineItem.serviceDate,
          jobTypeId: oldLineItem.jobTypeId,
          jobSubTypeId: oldLineItem.jobSubTypeId,
          crewFirstName: oldLineItem.crewFirstName,
          crewLastName: oldLineItem.crewLastName,
          orgId: orgId,
          cost: oldLineItem.cost,
          lineItemType: oldLineItem.lineItemType,
          amount: oldLineItem.amount,
          invoiceId: newInvoice.id,
          invoiceLineNo: index + 1,
        };
      });

      // Save the new invoice line items - Danielle
      await Promise.all(
        newLineItems.map((invoice) =>
          invoiceRepository.saveInvoiceDetail(orgId, invoice)
        )
      );

      // Mark the previous line items as deleted - Danielle
      await invoiceRepository.softDeleteInvoiceDetails(
        orgId,
        lineItems.map((oldLineItem) => oldLineItem.id)
      );

      // Mark the previous invoices as deleted - Danielle
      await invoiceRepository.softDeleteInvoices(
        orgId,
        invoices.map((invoice) => invoice.id)
      );

      return newInvoice;
    } else {
      throw new Error('More than one invoice must be specified');
    }
  }

  async getJobsForValidation(orgId: string, jobIds: string[]) {
    return invoiceRepository.getJobsForValidation(orgId, jobIds);
  }

  async discardInvoices(orgId: string, invoiceIds: string[]) {
    await invoiceRepository.discardInvoices(orgId, invoiceIds);
  }

  async queueInvoices(orgId: string, invoiceIds: string[]) {
    await invoiceRepository.queueInvoice(orgId, invoiceIds);
  }

  async createLineItem(orgId: string, _invoiceId: string, body: any) {
    return await invoiceRepository.createInvoiceDetails(orgId, [
      {
        ...body,
        serviceDate: new Date(body.serviceDate),
      },
    ]);
  }

  async createLineItems(orgId: string, _invoiceId: string, body: LineItemsDto) {
    //Using create many here won't work as prisma can't create multiple records while creating multiple recordsa
    //See: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-multiple-records-and-multiple-related-records
    // - Danielle
    return Promise.all(
      body.lineItems.map(async (lineItem) => {
        return await invoiceRepository.createInvoiceDetail(orgId, {
          ...lineItem,
          ...(lineItem.customFields && {
            customFields: { createMany: { data: lineItem.customFields } },
          }),
          serviceDate: new Date(lineItem.serviceDate),
        });
      })
    );
  }

  async updateLineItem(
    orgId: string,
    _invoiceId: string,
    lineItemId: string,
    body: any
  ) {
    return await invoiceRepository.updateInvoiceDetail(orgId, lineItemId, {
      ...body,
      serviceDate: new Date(body.serviceDate),
    });
  }

  async updateLineItems(orgId: string, body: LineItemsDto) {
    Promise.all(
      body.lineItems.map(async (lineItem) => {
        await this.updateLineItemCustomFields(
          orgId,
          '',
          lineItem.id,
          lineItem.customFields
        );
        return await invoiceRepository.updateInvoiceDetail(orgId, lineItem.id, {
          ...lineItem,
          customFields: undefined,
          serviceDate: new Date(lineItem.serviceDate),
        });
      })
    );
  }

  async deleteLineItem(orgId: string, _invoiceId: string, lineItemId: string) {
    //We also need to set the associated job (if found) to isDiscarded = true
    const lineItem = await invoiceRepository.getInvoiceDetail(
      orgId,
      lineItemId
    );

    if (lineItem && lineItem.jobId) {
      const job = await jobRepository.discardJob(orgId, lineItem.jobId);
    }

    await invoiceRepository.softDeleteInvoiceDetails(orgId, [lineItemId]);
  }

  async createLineItemCustomFields(
    orgId: string,
    _invoiceId: string,
    lineItemId: string,
    customFields: any[]
  ) {
    return await invoiceRepository.createInvoiceDetailCustomFields(
      orgId,
      customFields.map((customField: any) => {
        return {
          ...customField,
          invoiceDetailId: lineItemId,
        };
      })
    );
  }

  async updateLineItemCustomFields(
    orgId: string,
    _invoiceId: string,
    lineItemId: string,
    customFields: any[]
  ) {
    return await Promise.all(
      customFields.map(async (customField: any) => {
        return await invoiceRepository.updateInvoiceDetailCustomField(
          orgId,
          customField.id,
          customField
        );
      })
    );
  }

  async deleteLineItemCustomFields(
    orgId: string,
    _invoiceId: string,
    lineItemId: string,
    customFieldIds: string[]
  ) {
    return await invoiceRepository.deleteInvoiceDetailCustomFields(
      orgId,
      customFieldIds
    );
  }

  async markInvoicesSent(orgId: string, invoiceIds: string[]) {
    await invoiceRepository.markInvoicesSent(orgId, invoiceIds);
  }

  async markInvoicesPaid(orgId: string, invoiceIds: string[]) {
    await invoiceRepository.markInvoicesPaid(orgId, invoiceIds);
  }

  async markInvoicesCreated(orgId: string, invoiceIds: string[]) {
    await invoiceRepository.markInvoicesCreated(orgId, invoiceIds);
  }

  async countInvoicesByIds(orgId: string, invoiceIds: string[]) {
    return await invoiceRepository.countInvoicesByIds(orgId, invoiceIds);
  }

  async getYtdRevenue(orgId: string) {
    const revenues = await invoiceRepository.getYtdRevenue(orgId);
    return this.sumRevenue(revenues);
  }

  async getRevenueWithinPastDays(orgId: string, pastDays: number) {
    const revenues = await invoiceRepository.getRevenueWithinPastDays(
      orgId,
      pastDays
    );
    return this.sumRevenue(revenues);
  }

  async isAnyStatusPaid(orgId: string, invoiceIds: string[]) {
    return (await invoiceRepository.isAnyStatusPaid(orgId, invoiceIds)) > 0
      ? true
      : false;
  }

  sumRevenue(
    revenues: {
      id: string;
      amount: number | null;
      taxRate: number | null;
      isTaxable: boolean | null;
    }[]
  ) {
    let totalRevenue = 0;
    for (let revenue of revenues) {
      if (revenue.isTaxable) {
        const subtotal = revenue.amount ? revenue.amount : 0;
        const tax =
          (revenue.taxRate ? revenue.taxRate / 100 : 0) *
          (revenue.amount ? revenue.amount : 0);
        const total = subtotal + tax;

        totalRevenue = totalRevenue + total;
      } else {
        totalRevenue = totalRevenue + (revenue.amount ? revenue.amount : 0);
      }
    }

    return totalRevenue;
  }
}
