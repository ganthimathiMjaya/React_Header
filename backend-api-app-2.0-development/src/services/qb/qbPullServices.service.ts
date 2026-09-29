import { difference } from 'lodash';
import QBClient from './qb.client';
import { JobSubType, OrganizationTaxRate, JobType } from '@prisma/client';
import QBFetchAllService from './qbFetchAll.service';
import ServicesManagementRepository from '../../repositories/serviceManagement/servicesManagement.repository';

const servicesMgmtRepository = new ServicesManagementRepository();
const qbClient = new QBClient();
const qBFetchAllService = new QBFetchAllService();

export default class QBPullServicesService {
  public async pullJobSubTypes(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    if (!tokens || !tokens.accessToken) {
      console.warn(
        'Unable to pull services. No QB tokens found for org: ',
        orgId
      );
      return;
    }
    //We assume no organization has more than 1,000 services, so no pagination here.
    const qbItems = await qBFetchAllService.getAllItems(orgId);

    const filteredQbItems = qbItems.filter((qbItem: any) => qbItem.Name);
    const filteredQbItemIds: string[] = filteredQbItems.map(
      (item: any) => item.Id
    );
    const scrappyMatchingIds: any[] =
      await servicesMgmtRepository.findAllQbIdMatches(orgId, filteredQbItemIds);
    const existingServicesMap: Map<string, number> = new Map();
    (await servicesMgmtRepository.findAllServiceNames(orgId)).map(
      (service: any) => existingServicesMap.set(service.name, service.id)
    );
    const idsToBeCreated = difference(
      filteredQbItemIds,
      scrappyMatchingIds.map((item: any) => item.qbId)
    );

    const defaultJobType: JobType = await this.getDefaultJobType(orgId);

    const defaultTaxRate: OrganizationTaxRate | undefined | null =
      await servicesMgmtRepository.getRandomTaxRate(orgId);

    const newServices: JobSubType[] = [];
    const existingServices: JobSubType[] = [];
    filteredQbItems.forEach((qbItem: any) => {
      if (idsToBeCreated.includes(qbItem.Id)) {
        const existingItemId = existingServicesMap.get(qbItem.Name);
        if (existingItemId) {
          existingServices.push({
            id: existingItemId,
            qbSyncToken: qbItem.SyncToken,
            scrappySyncToken: qbItem.SyncToken,
            qbId: qbItem.Id,
          } as JobSubType);
        } else {
          if (qbItem.Taxable && !defaultTaxRate) {
            console.warn(
              'Warning: unable to pull taxable service since there is no default tax-rate for org: ',
              orgId
            );
          } else {
            newServices.push({
              jobTypeId: defaultJobType.id,
              name: qbItem.Name,
              description: qbItem.Description || '',
              cost: qbItem.UnitPrice,
              taxRateId: qbItem.Taxable ? defaultTaxRate?.id : undefined,
              isTaxable: qbItem.Taxable,
              qbIncomeAccountRef: qbItem.IncomeAccountRef?.value,
              qbSyncToken: qbItem.SyncToken,
              scrappySyncToken: qbItem.SyncToken,
              qbId: qbItem.Id,
              isDeleted: qbItem.Active ? false : true,
            } as unknown as JobSubType);
          }
        }
      }
    });
    if (newServices.length) {
      const promises = newServices.map(async (newService: JobSubType) => {
        await servicesMgmtRepository.createJobSubType(orgId, newService);
      });
      await Promise.all(promises);
    }
    if (existingServices.length) {
      const promisesExisting = existingServices.map(
        async (service: JobSubType) => {
          await servicesMgmtRepository.updateOldJobSubType(orgId, service.id, {
            qbSyncToken: service.qbSyncToken,
            scrappySyncToken: service.scrappySyncToken,
            qbId: service.qbId,
          });
        }
      );
      await Promise.all(promisesExisting);
    }
  }

  public async getDefaultJobType(orgId: string) {
    const defaultJobTypeName = 'QuickBooks Other';
    let defaultJobType = await servicesMgmtRepository.getJobTypeByName(
      orgId,
      defaultJobTypeName
    );
    if (!defaultJobType) {
      defaultJobType = await servicesMgmtRepository.createJobType(orgId, {
        orgId,
        description: defaultJobTypeName,
        shortDescription: defaultJobTypeName,
        isOnBookingPortal: false,
      });
    }
    return defaultJobType;
  }
}
