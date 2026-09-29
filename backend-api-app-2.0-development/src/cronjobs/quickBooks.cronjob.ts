import QBPushCustomersService from '../services/qb/qbPushCustomers.service';
import QBPullCustomersService from '../services/qb/qbPullCustomers.service';
import QBPushServicesService from '../services/qb/qbPushServices.service';
import QBPushInvoicesService from '../services/qb/qbPushInvoices.service';
import QBPullServicesService from '../services/qb/qbPullServices.service';
import OrganizationSettingsService from '../services/organizationSettings/organizationSettings.service';

const qbPushCustomersService = new QBPushCustomersService();
const qbPullCustomersService = new QBPullCustomersService();
const qbPushServicesService = new QBPushServicesService();
const qbPushInvoicesService = new QBPushInvoicesService();
const orgSettingsService = new OrganizationSettingsService();
const qbPullServicesService = new QBPullServicesService();

export const pushCustomersJob = async () => {
  const organizations =
    await orgSettingsService.getOrganizationsQuickBooksEnabled();
  //Run each sequentially. If it fails for one org, continue to next one.
  for (const organization of organizations) {
    const orgId = organization.id;
    try {
      await qbPushCustomersService.pushCustomers(orgId);
    } catch (error: any) {
      console.error(
        'Error, something went wrong pushCustomersJob for orgId: ',
        orgId,
        error
      );
    }
  }
};

export const pullCustomersJob = async () => {
  const organizations =
    await orgSettingsService.getOrganizationsQuickBooksEnabled();
  //Run each sequentially. If it fails for one org, continue to next one.
  for (const organization of organizations) {
    const orgId = organization.id;
    try {
      await qbPullCustomersService.pullCustomers(orgId);
    } catch (error: any) {
      console.error(
        'Error, something went wrong pullCustomersJob for orgId: ',
        orgId,
        error
      );
    }
  }
};

export const pullServicesJob = async () => {
  const organizations =
    await orgSettingsService.getOrganizationsQuickBooksEnabled();
  //Run each sequentially. If it fails for one org, continue to next one.
  for (const organization of organizations) {
    const orgId = organization.id;
    try {
      await qbPullServicesService.pullJobSubTypes(orgId);
    } catch (error: any) {
      console.error(
        'Error, something went wrong pullServicesJob for orgId: ',
        orgId,
        error
      );
    }
  }
};

export const pushServicesJob = async () => {
  const organizations =
    await orgSettingsService.getOrganizationsQuickBooksEnabled();
  for (const organization of organizations) {
    const orgId = organization.id;
    try {
      await qbPushServicesService.pushJobSubTypes(orgId);
    } catch (error: any) {
      console.error(
        'Error, something went wrong pushServicesJob for orgId: ',
        orgId,
        error
      );
    }
  }
};

export const pushInvoicesJob = async () => {
  const organizations =
    await orgSettingsService.getOrganizationsQuickBooksEnabled();
  for (const organization of organizations) {
    const orgId = organization.id;
    try {
      await qbPushInvoicesService.pushInvoices(orgId);
    } catch (error: any) {
      console.error(
        'Error, something went wrong pushInvoicesJob for orgId: ',
        orgId,
        error
      );
    }
  }
};
