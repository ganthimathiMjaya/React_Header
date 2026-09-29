import { JobSubType } from '@prisma/client';
import QBClient from './qb.client';
import { replace } from 'lodash';
import ServicesManagementRepository from '../../repositories/serviceManagement/servicesManagement.repository';
import QBFetchAllService from './qbFetchAll.service';

const serviceMgmRepository = new ServicesManagementRepository();
const qBFetchAllService = new QBFetchAllService();
const qbClient = new QBClient();

export default class QBPushServicesService {
  public async pushJobSubTypes(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    if (!tokens || !tokens.accessToken) {
      console.warn(
        'Unable to push services. No QB tokens found for org: ',
        orgId
      );
      return;
    }
    const qbServices = await qBFetchAllService.getAllItems(orgId);
    //Using map with all customers to reduce number of calls to QB
    const qbServicesIdMap: Map<string, any> = new Map();
    const qbServicesNameMap: Map<string, any> = new Map();
    qbServices.forEach((qbItem: any) => {
      qbServicesIdMap.set(qbItem.Id, qbItem);
      qbServicesNameMap.set(qbItem.Name, qbItem);
    });

    const newServices = await serviceMgmRepository.findAllJobSubTypeQbIdNull(
      orgId
    );
    const existingServices =
      await serviceMgmRepository.findAllJobSubTypeQbIdNotNull(orgId);
    //Running sync first to avoid also synching the newly created ones.
    await this.syncExistingServices(orgId, existingServices, qbServicesIdMap);
    //Function would check if service already exists in QB and use that id if so. Otherwise create a new QB Item.
    await this.pushNewServices(orgId, newServices, qbServicesNameMap);

    return { ok: true };
  }

  public async pushNewServices(
    orgId: string,
    services: JobSubType[],
    qbServicesMap: Map<string, any>
  ) {
    return await Promise.all(
      services.map(async (service) => {
        //check if service already exists in QB
        const qbItem = qbServicesMap.get(service.name);
        if (qbItem) {
          //Use QB existing item id
          service.qbId = qbItem.Id;
          service.qbSyncToken = qbItem.SyncToken;
          service.scrappySyncToken = qbItem.SyncToken;
        } else {
          //Create item in QB.
          const response = await this.createQbItem(orgId, service);
          service.qbId = response.Item.Id;
          service.qbSyncToken = response.Item.SyncToken;
          service.scrappySyncToken = response.Item.SyncToken;
        }
        // Need to save off Id and SyncToken for the newly created object.
        await serviceMgmRepository.updateOldJobSubType(orgId, service.id, service);
      })
    );
  }

  public async syncExistingServices(
    orgId: string,
    services: JobSubType[],
    qbServicesMap: Map<string, any>
  ) {
    return await Promise.all(
      services.map(async (service: JobSubType) => {
        //fetch latest version of item
        const qbItem = qbServicesMap.get(service.qbId || '');

        if (qbItem) {
          //check which system has the most recent version. This is the current logic for resolving conflicts.
          if (
            (service.scrappySyncToken === service.qbSyncToken &&
              service.scrappySyncToken === qbItem.SyncToken) ||
            (service.scrappySyncToken === null &&
              service.qbSyncToken === qbItem.SyncToken)
          ) {
            //All values are the same; no need to sync data.
          } else {
            if (
              Number(qbItem.SyncToken) >
              Number(service.scrappySyncToken || service.qbSyncToken)
            ) {
              //QB data is most recent. Update Scrappy.
              service.qbSyncToken = qbItem.SyncToken;
              service.scrappySyncToken = qbItem.SyncToken;
              service.name = qbItem.Name;
              service.description = qbItem.Description;
              service.isDeleted = !qbItem.Active;
              service.cost = qbItem.UnitPrice || 0;
              service.isTaxable = qbItem.Taxable;
              service.qbIncomeAccountRef = qbItem.IncomeAccountRef?.value;

              await serviceMgmRepository.updateOldJobSubType(
                orgId,
                service.id,
                service
              );
            } else {
              //Every other case Scrappy data would be sent over to QB.
              //This includes scrappy data is more recent, or user applied same number of changes in both systems, causing a false positive. In such case, Scrappy wins.
              const updatedQbItem: any = await this.updateQbItem(
                orgId,
                service,
                qbItem.SyncToken
              );
              //reset both to be the same.
              service.qbSyncToken = updatedQbItem.SyncToken;
              service.scrappySyncToken = updatedQbItem.SyncToken;
              await serviceMgmRepository.updateOldJobSubType(
                orgId,
                service.id,
                service
              );
            }
          }
        }
      })
    );
  }

  public async getQbItemByName(orgId: string, name: string): Promise<any> {
    const tokens = await qbClient.getTokens(orgId);
    //Need to scape Actual apostrophe and single quotes so the query does not fail
    const nameScapedApostrophe = replace(name, /’/g, `\\’`);
    const nameScapedSingleQuote = replace(nameScapedApostrophe, /'/g, `\\'`);
    const query = `select * from
  Item Where Name = '${nameScapedSingleQuote}'`;
    const url = `${process.env.QUICKBOOKS_URL}/v3/company/${
      tokens!.companyId
    }/query?query=${encodeURIComponent(query)}&minorversion=14`;
    const results = await qbClient.makeGetRequest(orgId, url, tokens);
    const filteredItems = results?.QueryResponse?.Item;

    if (filteredItems?.length) {
      //Item name should be unique in QB.
      const qbItem = filteredItems[0];
      return qbItem;
    }
    return null;
  }

  public async getQbItemById(orgId: string, id: string | null): Promise<any> {
    if (!id) return undefined;
    const tokens = await qbClient.getTokens(orgId);
    const url = `${process.env.QUICKBOOKS_URL}/v3/company/${
      tokens!.companyId
    }/item/${id}`;
    const result = await qbClient.makeGetRequest(orgId, url, tokens);
    return result?.Item;
  }

  public async createQbItem(orgId: string, service: JobSubType) {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/item?minorversion=14`,
      tokens,
      {
        Type: 'Service',
        TrackQtyOnHand: false,
        Name: service.name,
        Description: service.description,
        UnitPrice: service.cost,
        Taxable: service.isTaxable,
        Active: !service.isDeleted,
        IncomeAccountRef: {
          value: service.qbIncomeAccountRef,
        },
      }
    );
    if (response.error) {
      console.error('error createQbItem: ', response.error);
      throw new Error('Something went wrong creating QuickBooks item');
    }
    return response;
  }

  public async updateQbItem(
    orgId: string,
    service: JobSubType,
    qbCurrentSyncToken: string
  ) {
    const tokens = await qbClient.getTokens(orgId);
    const response = await qbClient.makePostRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/item?minorversion=69`,
      tokens,
      {
        Id: service.qbId,
        SyncToken: qbCurrentSyncToken, //Must be the current one. QB would handle the increment
        Name: service.name,
        Description: service.description,
        UnitPrice: service.cost,
        Taxable: service.isTaxable,
        Active: !service.isDeleted,
        IncomeAccountRef: {
          value: service.qbIncomeAccountRef,
        },
        sparse: true,
      }
    );
    if (response.error) {
      console.error('error updateQbItem: ', response.error);
      throw new Error('Something went wrong updating QuickBooks item');
    }
    return response.Item;
  }
}
