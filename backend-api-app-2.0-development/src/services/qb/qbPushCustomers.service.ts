import { QBIntegrationRepository } from '../../repositories/qb/qb.repository';
import { CustomerRepository } from '../../repositories/customer/customer.repository';
import { Customer } from '@prisma/client';
import QBClient from './qb.client';
import { replace } from 'lodash';
import QBFetchAllService from './qbFetchAll.service';

const qbIntegrationRepository = new QBIntegrationRepository();
const customerRepository = new CustomerRepository();
const qBFetchAllService = new QBFetchAllService();
const qbClient = new QBClient();

export default class QBPushCustomersService {
  public async getTokens(orgId: string) {
    return qbIntegrationRepository.getTokens(orgId);
  }

  public async pushCustomers(orgId: string) {
    const tokens = await this.getTokens(orgId);
    if (!tokens || !tokens.accessToken) {
      console.warn(
        'Unable to push customers. No QB tokens found for org: ',
        orgId
      );
      return;
    }

    const newCustomers = await customerRepository.findAllQbIdNull(orgId);
    const existingCustomers = await customerRepository.findAllQbIdNotNull(
      orgId
    );
    const qbCustomers = await qBFetchAllService.getAllCustomers(orgId);
    //Using map with all customers to reduce number of calls to QB
    const qbCustomersIdMap: Map<string, any> = new Map();
    const qbCustomersNameMap: Map<string, any> = new Map();
    qbCustomers.forEach((qbCustomer) => {
      qbCustomersIdMap.set(qbCustomer.Id, qbCustomer);
      qbCustomersNameMap.set(qbCustomer.CompanyName, qbCustomer);
    });
    //Running sync first to avoid also synching the newly created ones.
    await this.syncExistingCustomers(
      orgId,
      existingCustomers,
      qbCustomersIdMap
    );
    //Function would check if customer already exists in QB and use that id if so. Otherwise create a new QB customer.
    await this.pushNewCustomers(orgId, newCustomers, qbCustomersNameMap);

    return { ok: true };
  }

  public async pushNewCustomers(
    orgId: string,
    customers: Customer[],
    qbCustomersMap: Map<string, any>
  ) {
    return await Promise.all(
      customers.map(async (customer) => {
        //check if customer already exists in QB
        const qbCustomer = qbCustomersMap.get(customer.name);
        if (qbCustomer) {
          //Use QB existing customer id
          customer.qbId = qbCustomer.Id;
          customer.qbSyncToken = qbCustomer.SyncToken;
          customer.scrappySyncToken = qbCustomer.SyncToken;
        } else {
          //Create customer in QB.
          const response = await this.createQbCustomer(orgId, customer);
          customer.qbId = response.Customer.Id;
          customer.qbSyncToken = response.Customer.SyncToken;
          customer.scrappySyncToken = response.Customer.SyncToken;
        }
        // Need to save off Id and SyncToken for the newly created object.
        await customerRepository.update(orgId, customer.id, customer);
      })
    );
  }

  public async syncExistingCustomers(
    orgId: string,
    customers: Customer[],
    qbCustomersMap: Map<string, any>
  ) {
    return await Promise.all(
      customers.map(async (customer) => {
        //fetch latest version of customer
        const qbCustomer = qbCustomersMap.get(customer.qbId || '');

        if (qbCustomer) {
          //check which system has the most recent version. This is the current logic for resolving conflicts.
          if (
            (customer.scrappySyncToken === customer.qbSyncToken &&
              customer.scrappySyncToken === qbCustomer.SyncToken) ||
            (customer.scrappySyncToken === null &&
              customer.qbSyncToken === qbCustomer.SyncToken)
          ) {
            //All values are the same; no need to sync data.
          } else {
            if (
              Number(qbCustomer.SyncToken) >
              Number(customer.scrappySyncToken || customer.qbSyncToken)
            ) {
              //QB data is most recent. Update Scrappy.
              customer.qbSyncToken = qbCustomer.SyncToken;
              customer.scrappySyncToken = qbCustomer.SyncToken;
              customer.name = qbCustomer.CompanyName;
              customer.active = qbCustomer.Active;
              customer.billingAddressLine1 = qbCustomer.BillAddr.Line1;
              customer.billingCity = qbCustomer.BillAddr.City;
              customer.billingState =
                qbCustomer.BillAddr.CountrySubDivisionCode;
              customer.billingZipcode = qbCustomer.BillAddr.PostalCode;
              customer.billingPhone = qbCustomer.PrimaryPhone.FreeFormNumber;
              customer.billingEmail = qbCustomer.PrimaryEmailAddr?.Address;
              await customerRepository.update(orgId, customer.id, customer);
            } else {
              //Every other case Scrappy data would be sent over to QB.
              //This includes scrappy data is more recent, or user applied same number of changes in both systems, causing a false positive. In such case, Scrappy wins.
              const updatedQbCustomer: any = await this.updateQbCustomer(
                orgId,
                customer,
                qbCustomer.SyncToken
              );
              //reset both to be the same.
              customer.qbSyncToken = updatedQbCustomer.SyncToken;
              customer.scrappySyncToken = updatedQbCustomer.SyncToken;
              await customerRepository.update(orgId, customer.id, customer);
            }
          }
        }
      })
    );
  }

  public async getQbCustomerByCompanyName(
    orgId: string,
    name: string
  ): Promise<any> {
    const tokens = await this.getTokens(orgId);
    //Need to scape Actual apostrophe and single quotes so the query does not fail
    const nameScapedApostrophe = replace(name, /’/g, `\\’`);
    const nameScapedSingleQuote = replace(nameScapedApostrophe, /'/g, `\\'`);
    const query = `select * from
Customer Where CompanyName= '${nameScapedSingleQuote}'`;
    const url = `${process.env.QUICKBOOKS_URL}/v3/company/${
      tokens!.companyId
    }/query?query=${encodeURIComponent(query)}&minorversion=14`;
    const results = await qbClient.makeGetRequest(orgId, url, tokens);
    const filteredCustomers = results?.QueryResponse?.Customer;

    if (filteredCustomers?.length) {
      //CustomerName is unique in QB.
      const qbCustomer = filteredCustomers[0];
      return qbCustomer;
    }
    return null;
  }

  public async getQbCustomerById(
    orgId: string,
    id: string | null
  ): Promise<any> {
    if (!id) return undefined;
    const tokens = await this.getTokens(orgId);
    const url = `${process.env.QUICKBOOKS_URL}/v3/company/${
      tokens!.companyId
    }/customer/${id}`;
    const result = await qbClient.makeGetRequest(orgId, url, tokens);
    return result?.Customer;
  }

  public async createQbCustomer(orgId: string, customer: Customer) {
    const tokens = await this.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/customer?minorversion=14`,
      tokens,
      {
        DisplayName: customer.name,
        CompanyName: customer.name,
        Active: customer.active,
        BillAddr: {
          Line1: customer.billingAddressLine1,
          City: customer.billingCity,
          CountrySubDivisionCode: customer.billingState,
          PostalCode: customer.billingZipcode,
        },
        PrimaryPhone: { FreeFormNumber: customer.billingPhone },
        PrimaryEmailAddr: { Address: customer.billingEmail },
      }
    );
    if (response.error) {
      console.error('error createQbCustomer: ', response.error);
      throw new Error('Something went wrong creating QuickBooks customer');
    }
    return response;
  }

  public async updateQbCustomer(
    orgId: string,
    customer: Customer,
    qbCurrentSyncToken: string
  ) {
    const tokens = await this.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/customer?minorversion=69`,
      tokens,
      {
        Id: customer.qbId,
        Active: customer.active,
        SyncToken: qbCurrentSyncToken, //Must be the current one. QB would handle the increment
        DisplayName: customer.name,
        CompanyName: customer.name,
        BillAddr: {
          Line1: customer.billingAddressLine1,
          City: customer.billingCity,
          CountrySubDivisionCode: customer.billingState,
          PostalCode: customer.billingZipcode,
        },
        PrimaryPhone: { FreeFormNumber: customer.billingPhone },
        PrimaryEmailAddr: { Address: customer.billingEmail },
        //use sparse to maintain other fields in QB. - https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/customer#sparse-update-a-customer
        sparse: true,
      }
    );
    if (response.error) {
      console.error('error updateQbCustomer: ', response.error);
      throw new Error('Something went wrong updating QuickBooks customer');
    }
    return response.Customer;
  }
}
