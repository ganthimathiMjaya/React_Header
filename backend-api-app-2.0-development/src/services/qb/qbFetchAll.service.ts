import QBClient from './qb.client';

const qbClient = new QBClient();
export const QB_MAX_RESULTS = 1000;

export default class QBFetchAllService {
  public async getCustomersCount(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = 'SELECT COUNT(*) FROM Customer Where Job = false';
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=14`,
      tokens
    );
    return response?.QueryResponse?.totalCount;
  }

  public async getItemsCount(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = "SELECT COUNT(*) FROM Item WHERE Type = 'Service'";
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=14`,
      tokens
    );
    return response?.QueryResponse?.totalCount;
  }

  public async getCustomersPage(orgId: string, startPosition: number) {
    // There is no GET all endpoint for QB, since they aren't REST. Instead we have to build up an SQL like query to send. Docs on this available on the QB dev site.
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = `SELECT * FROM Customer Where Job = false STARTPOSITION ${startPosition} MAXRESULTS ${QB_MAX_RESULTS}`;
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=14`,
      tokens
    );
    return response?.QueryResponse?.Customer;
  }

  public async getAllCustomers(orgId: string): Promise<any[]> {
    let allCustomers: any[] = [];
    const customersCount = await this.getCustomersCount(orgId);
    if (customersCount) {
      const totalPages = Math.ceil(customersCount / QB_MAX_RESULTS);
      for (let page = 0; page < totalPages; page++) {
        const startPosition = 1 + page * QB_MAX_RESULTS;
        const qbCustomers = await this.getCustomersPage(orgId, startPosition);
        const filteredQbCustomers = qbCustomers.filter(
          (qbCustomer: any) => qbCustomer.BillAddr && qbCustomer.CompanyName
        );
        allCustomers = [...allCustomers, ...filteredQbCustomers];
      }
    }
    return allCustomers;
  }

  public async getAllItems(orgId: string): Promise<any[]> {
    //It's assumed that ALL licensees would have less than 1,000 items (services)
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = `select * from
Item where Type = 'Service' STARTPOSITION ${1} MAXRESULTS ${QB_MAX_RESULTS}`;
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=69`,
      tokens
    );
    return response?.QueryResponse?.Item || [];
  }

  public async getAllTerms(orgId: string): Promise<any[]> {
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = `select * from
Term where Active = true STARTPOSITION ${1} MAXRESULTS ${QB_MAX_RESULTS}`;
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=69`,
      tokens
    );
    return response?.QueryResponse?.Term || [];
  }

  public async getAllTaxRates(orgId: string): Promise<any[]> {
    const tokens = await qbClient.getTokens(orgId);
    //Skip this type of rate, there is no taxCode associated.
    const customerQuery = `select * from
TaxRate where SpecialTaxType != 'ADJUSTMENT_RATE' STARTPOSITION ${1} MAXRESULTS ${QB_MAX_RESULTS}`;
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=69`,
      tokens
    );
    return response?.QueryResponse?.TaxRate || [];
  }

  public async getAllTaxCodes(orgId: string): Promise<any[]> {
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = `select * from
TaxCode STARTPOSITION ${1} MAXRESULTS ${QB_MAX_RESULTS}`;
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=69`,
      tokens
    );
    return response?.QueryResponse?.TaxCode || [];
  }

  public async getTaxAgency(orgId: string, agencyName: string): Promise<any> {
    const tokens = await qbClient.getTokens(orgId);
    const customerQuery = `select * from
TaxAgency where Name = '${agencyName}'`;
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/query?query=${customerQuery}&minorversion=69`,
      tokens
    );
    const agencies = response?.QueryResponse?.TaxAgency;
    return agencies?.length ? agencies[0] : null;
  }

  public async getCustomFields(orgId: string): Promise<any> {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/preferences`,
      tokens
    );
    const customFields = response?.Preferences?.SalesFormsPrefs?.CustomField;
    return customFields || [];
  }
}
