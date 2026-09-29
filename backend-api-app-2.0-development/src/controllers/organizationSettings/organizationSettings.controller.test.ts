import {
  PrismaClient,
  OrganizationSetting,
  OrganizationCustomField,
  OrganizationCustomFieldCategory,
  OrganizationTaxRate,
} from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, res, next } from '../../utils/tests/express.mock';

import OrganizationSettingsController from './organizationSettings.controller';

describe('OrganizationSettingsController', () => {
  const prisma = mockDeep<PrismaClient>();
  describe('getTaxRates', () => {
    it('returns tax rates', async () => {
      const mockedTaxes: OrganizationTaxRate[] = [
        {
          id: 123,
          name: 'name',
        } as unknown as OrganizationTaxRate,
      ];
      prisma.organizationTaxRate.findMany.mockResolvedValue(mockedTaxes);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new OrganizationSettingsController();

      await controller.getTaxRates(req, res as Response, next);

      expect(prisma.organizationTaxRate.findMany).toHaveBeenCalled();
    });
  });

  describe('createTaxRates', () => {
    it('creates tax rates', async () => {
      const taxRate: OrganizationTaxRate = {
        id: 123,
        name: 'name',
      } as unknown as OrganizationTaxRate;
      prisma.organizationTaxRate.findMany.mockResolvedValue([
        {
          ...taxRate,
        },
      ]);
      prisma.organizationTaxRate.createMany.mockResolvedValue({ count: 1 });
      prisma.organizationSetting.findFirstOrThrow.mockResolvedValue({
        id: 1,
      } as unknown as OrganizationSetting);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new OrganizationSettingsController();

      req.body = [{ id: 1, name: 'name' }];
      await controller.createTaxRates(req, res as Response, next);

      expect(prisma.organizationTaxRate.createMany).toHaveBeenCalled();
      expect(prisma.organizationTaxRate.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteTaxRate', () => {
    it('deletes tax rates', async () => {
      prisma.organizationTaxRate.deleteMany.mockResolvedValue({ count: 1 });

      prismaMock.setPrismaClientMock(prisma);

      const controller = new OrganizationSettingsController();

      req.body = [1];
      await controller.deleteTaxRates(req, res as Response, next);

      expect(prisma.organizationTaxRate.deleteMany).toHaveBeenCalled();
    });
  });

  describe('getCustomFields', () => {
    it('returns custom fields', async () => {
      const mockedSettings: OrganizationCustomField[] = [
        {
          id: 123,
          name: 'name',
        } as unknown as OrganizationCustomField,
      ];
      prisma.organizationCustomField.findMany.mockResolvedValue(mockedSettings);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new OrganizationSettingsController();

      await controller.getCustomFields(req, res as Response, next);

      expect(prisma.organizationCustomField.findMany).toHaveBeenCalled();
    });
  });

  describe('upsertCustomFields', () => {
    it('upserts custom fields', async () => {
      const mockedSettings: OrganizationCustomField = {
        id: 123,
        name: 'name',
      } as unknown as OrganizationCustomField;
      prismaMock.prismaClientBypassMock.organizationCustomFieldCategory.findFirstOrThrow.mockResolvedValue(
        { id: 1 } as unknown as OrganizationCustomFieldCategory
      );
      prisma.organizationSetting.findFirstOrThrow.mockResolvedValue({
        id: 1,
      } as unknown as OrganizationSetting);
      prisma.organizationCustomField.upsert.mockResolvedValue(mockedSettings);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new OrganizationSettingsController();

      req.body = [{ id: 1, name: 'name' }];
      await controller.upsertCustomFields(req, res as Response, next);

      expect(prisma.organizationCustomField.upsert).toHaveBeenCalled();
      expect(prisma.organizationCustomField.findMany).toHaveBeenCalled();
    });
  });

  describe('getCompanyInfo', () => {
    it('returns company info', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new OrganizationSettingsController();
      await controller.getCompanyInfo(req, res as Response, next);

      expect(prisma.organizationSetting.findFirstOrThrow).toHaveBeenCalled();
    });
  });

  describe('addCompanyInfo', () => {
    it('adds company info when there is no org setting record', async () => {
      prismaMock.setPrismaClientMock(prisma);

      prisma.organizationSetting.count.mockResolvedValue(0);

      const controller = new OrganizationSettingsController();
      await controller.addCompanyInfo(req, res as Response, next);

      expect(prisma.organizationSetting.create).toHaveBeenCalled();
    });
  });

  describe('addCompanyInfo', () => {
    it('adds company info when there is a org setting record', async () => {
      prismaMock.setPrismaClientMock(prisma);

      prisma.organizationSetting.count.mockResolvedValue(1);
      prisma.organizationSetting.findFirstOrThrow.mockResolvedValue({
        id: 1,
      } as unknown as OrganizationSetting);
      const controller = new OrganizationSettingsController();
      await controller.addCompanyInfo(req, res as Response, next);

      expect(prisma.organizationSetting.update).toHaveBeenCalled();
    });
  });

  describe('updateCompanyInfo', () => {
    it('update company info', async () => {
      prismaMock.setPrismaClientMock(prisma);

      req.params = {
        orgSettingId: '1',
      };

      const controller = new OrganizationSettingsController();
      await controller.updateCompanyInfo(req, res as Response, next);

      expect(prisma.organizationSetting.update).toHaveBeenCalled();
    });
  });

  describe('updateCompanyInfoFailure', () => {
    it('update company info fails due to missing orgSettingId', async () => {
      prismaMock.setPrismaClientMock(prisma);

      req.params = {
        orgSettingId: '',
      };

      const controller = new OrganizationSettingsController();
      await controller.updateCompanyInfo(req, res as Response, next);

      expect(prisma.organizationSetting.update).toHaveBeenCalledTimes(0);
    });
  });
});
