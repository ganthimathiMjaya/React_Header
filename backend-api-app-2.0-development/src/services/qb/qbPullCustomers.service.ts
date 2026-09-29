import { difference } from 'lodash';
import { CustomerRepository } from '../../repositories/customer/customer.repository';
import QBClient from './qb.client';
import UserRepository from '../../repositories/user/user.repository';
import { Customer, Admin } from '@prisma/client';
import QBFetchAllService from './qbFetchAll.service';

const customerRepository = new CustomerRepository();
const userRepository = new UserRepository();
const qbClient = new QBClient();
const qBFetchAllService = new QBFetchAllService();
export const QB_MAX_RESULTS = 1000;

export default class QBPullCustomersService {
  public async pullCustomers(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    if (!tokens || !tokens.accessToken) {
      console.warn(
        'Unable to pull customers. No QB tokens found for org: ',
        orgId
      );
      return;
    }
    const customersCount = await qBFetchAllService.getCustomersCount(orgId);
    if (customersCount) {
      //get any admin id for creating customers.
      const admin: Admin | null | undefined =
        await userRepository.findFirstOrgAdmin(orgId);

      const totalPages = Math.ceil(customersCount / QB_MAX_RESULTS);
      for (let page = 0; page < totalPages; page++) {
        const startPosition = 1 + page * QB_MAX_RESULTS;
        const qbCustomers = await qBFetchAllService.getCustomersPage(
          orgId,
          startPosition
        );
        const filteredQbCustomers = qbCustomers.filter(
          (qbCustomer: any) => qbCustomer.BillAddr && qbCustomer.CompanyName
        );
        const filteredQbCustomerIds: string[] = filteredQbCustomers.map(
          (item: any) => item.Id
        );
        const scrappyMatchingIds: any[] =
          await customerRepository.findAllQbIdMatches(
            orgId,
            filteredQbCustomerIds
          );
        const existingCustomersMap: Map<string, string> = new Map();
        (await customerRepository.findAllCustomerNames(orgId)).map(
          (item: any) => existingCustomersMap.set(item.name, item.id)
        );
        const idsToBeCreated = difference(
          filteredQbCustomerIds,
          scrappyMatchingIds.map((item: any) => item.qbId)
        );
        const newCustomers: Customer[] = [];
        const existingCustomers: Customer[] = [];
        filteredQbCustomers.forEach((qbCustomer: any) => {
          if (idsToBeCreated.includes(qbCustomer.Id)) {
            const existingCustomerId = existingCustomersMap.get(
              qbCustomer.CompanyName
            );
            if (existingCustomerId) {
              existingCustomers.push({
                id: existingCustomerId,
                qbSyncToken: qbCustomer.SyncToken,
                scrappySyncToken: qbCustomer.SyncToken,
                qbId: qbCustomer.Id,
              } as Customer);
            } else {
              newCustomers.push({
                createdBy: {
                  connect: {
                    id: admin?.userId,
                  },
                },
                name: qbCustomer.CompanyName,

                qbSyncToken: qbCustomer.SyncToken,
                scrappySyncToken: qbCustomer.SyncToken,
                qbId: qbCustomer.Id,
                billingAddressLine1: qbCustomer.BillAddr.Line1 || '',
                billingCity: qbCustomer.BillAddr.City || '',
                billingState: qbCustomer.BillAddr.CountrySubDivisionCode || '',
                billingZipcode: qbCustomer.BillAddr.PostalCode || '',
                billingPhone:
                  qbCustomer.PrimaryPhone?.FreeFormNumber?.replace(/\D/g, '') ||
                  '',
                billingEmail: qbCustomer.PrimaryEmailAddr?.Address || '',
                email: qbCustomer.PrimaryEmailAddr?.Address || '',
                phone:
                  qbCustomer.PrimaryPhone?.FreeFormNumber?.replace(/\D/g, '') ||
                  '',
                active: qbCustomer.Active,
                //default to 30 - no equivalent value in QB.
                terms: 30,
                sameAsCompanyAddress: true,
                location: {
                  create: {
                    name: 'QB Integration - Billing Address',
                    address: {
                      create: {
                        line1: qbCustomer.BillAddr.Line1 || '',
                        line2: '',
                        city: qbCustomer.BillAddr.City || '',
                        state: qbCustomer.BillAddr.CountrySubDivisionCode || '',
                        county: '',
                        zipcode: qbCustomer.BillAddr.PostalCode || '',
                        active: true,
                      },
                    },
                    community: '',
                  },
                },
              } as unknown as Customer);
            }
          }
        });
        if (newCustomers.length) {
          const promises = newCustomers.map(async (newCustomer: Customer) => {
            await customerRepository.create(orgId, newCustomer);
          });
          await Promise.all(promises);
        }
        if (existingCustomers.length) {
          const promisesExisting = existingCustomers.map(
            async (customer: Customer) => {
              await customerRepository.update(orgId, customer.id, {
                qbSyncToken: customer.qbSyncToken,
                scrappySyncToken: customer.scrappySyncToken,
                qbId: customer.qbId,
              });
            }
          );
          await Promise.all(promisesExisting);
        }
      }
    }
  }
}
