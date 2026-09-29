import {
  PrismaClient,
  Job,
  Invoice,
  InvoiceStatus,
  InvoiceDetail,
  Customer,
  JobType,
  JobSubType,
} from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import {
  req,
  res,
  next,
  getResponseObject,
} from '../../utils/tests/express.mock';
import { InvoiceService } from './invoice.service';
import { InvoicingQueueStatus } from '../../utils/enums/job.status';
import * as faker from '@faker-js/faker';

describe('InvoiceController', () => {
  const prisma = mockDeep<PrismaClient>();

  describe('combineInvoices', () => {
    it('refuses to combine invoices with differing project names', async () => {
      const mockedInvoices = [
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
        } as Invoice,
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test2',
        } as Invoice,
      ];

      const invoiceIds = ['abc', '123'];

      prisma.invoice.findMany.mockResolvedValue(mockedInvoices);

      prismaMock.setPrismaClientMock(prisma);

      const service = new InvoiceService();
      await expect(
        service.combineInvoices(faker.faker.datatype.uuid(), invoiceIds)
      ).rejects.toThrow('Invoices are incompatible and cannot be combined');
    });

    it('refuses to combine invoices with differing tax rates', async () => {
      const mockedInvoices = [
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
          taxRate: 5,
        } as Invoice,
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
          taxRate: 2,
        } as Invoice,
      ];

      const invoiceIds = ['abc', '123'];

      prisma.invoice.findMany.mockResolvedValue(mockedInvoices);

      prismaMock.setPrismaClientMock(prisma);

      const service = new InvoiceService();
      await expect(
        service.combineInvoices(faker.faker.datatype.uuid(), invoiceIds)
      ).rejects.toThrow('Invoices are incompatible and cannot be combined');
    });

    it('refuses to combine invoices with incorrect statuses', async () => {
      const mockedInvoices = [
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
          taxRate: 2,
          status: {
            code: 'CRD',
          } as InvoiceStatus,
        } as unknown as Invoice,
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
          taxRate: 2,
          status: {
            code: 'BLA',
          } as InvoiceStatus,
        } as unknown as Invoice,
      ];

      const invoiceIds = ['abc', '123'];

      prisma.invoice.findMany.mockResolvedValue(mockedInvoices);

      prismaMock.setPrismaClientMock(prisma);

      const service = new InvoiceService();
      await expect(
        service.combineInvoices(faker.faker.datatype.uuid(), invoiceIds)
      ).rejects.toThrow('Invoices are incompatible and cannot be combined');
    });

    it('combines invoices with compatible fields', async () => {
      const mockedInvoices = [
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
          taxRate: 2,
          customer: {
            name: 'name',
          },
          invoiceDetail: [
            {
              id: faker.faker.datatype.uuid(),
              jobId: faker.faker.datatype.uuid(),
            } as InvoiceDetail,
          ],
          status: {
            code: 'CRD',
          } as InvoiceStatus,
        } as unknown as Invoice,
        {
          id: faker.faker.datatype.uuid(),
          projectName: 'test1',
          taxRate: 2,
          customer: {
            name: 'name',
          },
          invoiceDetail: [
            {
              id: faker.faker.datatype.uuid(),
              jobId: faker.faker.datatype.uuid(),
            } as InvoiceDetail,
          ],
          status: {
            code: 'SNT',
          } as InvoiceStatus,
        } as unknown as Invoice,
      ];

      const invoiceIds = ['abc', '123'];

      const newInvoice = {
        id: faker.faker.datatype.uuid(),
        projectName: 'test1',
        taxRate: 2,
        status: {
          code: 'CRD',
        } as InvoiceStatus,
      } as unknown as Invoice;

      prisma.invoice.findMany.mockResolvedValue(mockedInvoices);
      prisma.invoice.create.mockResolvedValue(newInvoice);
      prisma.invoiceStatus.findFirstOrThrow.mockResolvedValue({
        id: 1,
      } as unknown as InvoiceStatus);

      prismaMock.setPrismaClientMock(prisma);

      const service = new InvoiceService();

      await expect(
        service.combineInvoices(faker.faker.datatype.uuid(), invoiceIds)
      ).resolves.toBeDefined();

      expect(prisma.invoice.create).toHaveBeenCalledTimes(1);
      expect(prisma.invoiceDetail.create).toHaveBeenCalledTimes(2);
      expect(prisma.invoice.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.invoiceDetail.updateMany).toHaveBeenCalledTimes(1);
    });
  });
});
