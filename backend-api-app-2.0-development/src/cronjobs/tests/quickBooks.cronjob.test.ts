const pushCustomers = jest.fn();
const pullCustomers = jest.fn();
const pushJobSubTypes = jest.fn();
const pullJobSubTypes = jest.fn();
const pushInvoices = jest.fn();

import { mockDeep, mockReset } from 'jest-mock-extended';
import { Organization, PrismaClient } from '@prisma/client';
import {
  pushCustomersJob,
  pullCustomersJob,
  pushServicesJob,
  pushInvoicesJob,
  pullServicesJob,
} from '../quickBooks.cronjob';
import { prismaMock } from '../../utils/prisma/prisma.mock';

jest.mock('../../services/qb/qbPushCustomers.service', () => ({
  __esModule: true,
  ...(jest.requireActual('../../services/qb/qbPushCustomers.service') as any),
  pushCustomers,
  QBIntegrationService: jest.fn(() => ({ pushCustomers })),
  default: jest.fn(() => ({ pushCustomers })),
}));

jest.mock('../../services/qb/qbPullCustomers.service', () => ({
  __esModule: true,
  ...(jest.requireActual('../../services/qb/qbPullCustomers.service') as any),
  pullCustomers,
  QBPullService: jest.fn(() => ({ pullCustomers })),
  default: jest.fn(() => ({ pullCustomers })),
}));

jest.mock('../../services/qb/qbPushServices.service', () => ({
  __esModule: true,
  ...(jest.requireActual('../../services/qb/qbPushServices.service') as any),
  pushJobSubTypes,
  QBPushServicesService: jest.fn(() => ({ pushJobSubTypes })),
  default: jest.fn(() => ({ pushJobSubTypes })),
}));

jest.mock('../../services/qb/qbPullServices.service', () => ({
  __esModule: true,
  ...(jest.requireActual('../../services/qb/qbPullServices.service') as any),
  pullJobSubTypes,
  QBPullServicesService: jest.fn(() => ({ pullJobSubTypes })),
  default: jest.fn(() => ({ pullJobSubTypes })),
}));

jest.mock('../../services/qb/qbPushInvoices.service', () => ({
  __esModule: true,
  ...(jest.requireActual('../../services/qb/qbPushInvoices.service') as any),
  pushInvoices,
  QBPushInvoicesService: jest.fn(() => ({ pushInvoices })),
  default: jest.fn(() => ({ pushInvoices })),
}));

describe('QuickBooks CronJob', () => {
  beforeEach(() => {
    mockReset(pushCustomers);
  });

  const prisma = mockDeep<PrismaClient>();

  describe('pushCustomersJob', () => {
    it('calls pushCustomers', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [
          {
            id: 'id',
            OrganizationSetting: { quickbooksEnabled: true },
          } as unknown as Organization,
        ]
      );
      prismaMock.setPrismaClientMock(prisma);

      await pushCustomersJob();

      expect(pushCustomers).toHaveBeenCalledWith('id');
    });
  });

  describe('pullCustomersJob', () => {
    it('calls pullCustomers', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [
          {
            id: 'id',
            OrganizationSetting: { quickbooksEnabled: true },
          } as unknown as Organization,
        ]
      );
      prismaMock.setPrismaClientMock(prisma);

      await pullCustomersJob();

      expect(pullCustomers).toHaveBeenCalledWith('id');
    });
  });

  describe('pushServicesJob', () => {
    it('calls pushJobSubTypes', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [
          {
            id: 'id',
            OrganizationSetting: { quickbooksEnabled: true },
          } as unknown as Organization,
        ]
      );
      prismaMock.setPrismaClientMock(prisma);

      await pushServicesJob();

      expect(pushJobSubTypes).toHaveBeenCalledWith('id');
    });
  });

  describe('pullServicesJob', () => {
    it('calls pullJobSubTypes', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [
          {
            id: 'id',
            OrganizationSetting: { quickbooksEnabled: true },
          } as unknown as Organization,
        ]
      );
      prismaMock.setPrismaClientMock(prisma);

      await pullServicesJob();

      expect(pullJobSubTypes).toHaveBeenCalledWith('id');
    });
  });

  describe('pushInvoicesJob', () => {
    it('calls pushInvoices', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [
          {
            id: 'id',
            OrganizationSetting: { quickbooksEnabled: true },
          } as unknown as Organization,
        ]
      );
      prismaMock.setPrismaClientMock(prisma);

      await pushInvoicesJob();

      expect(pushJobSubTypes).toHaveBeenCalledWith('id');
    });
  });
});
