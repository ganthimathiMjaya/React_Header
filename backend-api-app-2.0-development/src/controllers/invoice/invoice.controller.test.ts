import { mockPuppeteerUtil } from '../../utils/pdf/puppeteer.util.mock';
import { mockSendGrid } from '../../utils/sendgrid/sendgrid.mock';
import {
  PrismaClient,
  Job,
  Invoice,
  InvoiceDetail,
  Customer,
  JobType,
  JobSubType,
  InvoiceStatus,
  OrganizationSetting,
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
import InvoiceController from './invoice.controller';
import { InvoicingQueueStatus } from '../../utils/enums/job.status';
import * as faker from '@faker-js/faker';

describe('InvoiceController', () => {
  const prisma = mockDeep<PrismaClient>();
  const job = {
    id: '123',
    scheduledDate: new Date(),
    techReference: '123',
    jobScope: 'scope',
    customer: {
      name: 'name',
      email: 'test@test.com',
    } as unknown as Customer,
    jobType: {
      shortDescription: 'desc',
    } as unknown as JobType,
    jobSubType: {
      name: 'name',
      cost: 10.0,
      isTaxable: true,
      taxRateId: 1,
    } as unknown as JobSubType,
    tenantOrganization: {
      OrganizationSetting: [{ taxRate: 10 }],
    },
  } as unknown as Job;
  const mockedJobs = [{ ...job }];

  describe('createBlankInvoice', () => {
    it('creates an invoice from supplied data', async () => {
      prisma.invoiceStatus.findFirstOrThrow.mockResolvedValue({
        id: 1,
      } as unknown as InvoiceStatus);
      prismaMock.setPrismaClientMock(prisma);

      req.body = {
        invoiceNo: '1234',
        billingEmail: 'test@test.com',
        customerId: '12345',
        dueDate: '10-12-2023 00:00:00',
        invoiceDate: '10-12-2023 00:00:00',
        messageOnInvoice: 'message',
        statusId: 4,
        terms: 30,
        customerName: 'test',
        projectName: 'test',
        projectBillingNotes: 'test',
        billingLine1: '123',
        billingCity: '456',
        billingState: '789',
        billingZipcode: '012',
        projectLine1: '123',
        projectCity: '456',
        projectState: '789',
        projectZipcode: '012',
      };

      const controller = new InvoiceController();
      await controller.createBlankInvoice(req, res as Response, next);

      expect(prisma.invoice.create).toHaveBeenCalled();
    });
  });

  describe('updateInvoice', () => {
    it('updates an invoice from supplied data', async () => {
      prismaMock.setPrismaClientMock(prisma);

      req.body = {
        invoiceNo: '1234',
        billingEmail: 'test@test.com',
        customerId: '12345',
        dueDate: '10-12-2023 00:00:00',
        invoiceDate: '10-12-2023 00:00:00',
        messageOnInvoice: 'message',
        statusId: 4,
        terms: 30,
        projectName: 'test',
        projectBillingNotes: 'test',
        billingLine1: '123',
        billingCity: '456',
        billingState: '789',
        billingZipcode: '012',
        projectLine1: '123',
        projectCity: '456',
        projectState: '789',
        projectZipcode: '012',
      };

      req.params = { invoiceId: faker.faker.datatype.uuid() };

      const controller = new InvoiceController();
      await controller.updateInvoice(req, res as Response, next);
      const dueDate = new Date(req.body.invoiceDate);
      dueDate.setDate(dueDate.getDate() + req.body.terms);

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: {
          id: req.params.invoiceId,
        },
        data: {
          ...req.body,
          dueDate: dueDate,
          invoiceDate: new Date(req.body.invoiceDate),
        },
      });
    });
  });

  describe('getQueueJobs', () => {
    it('returns queue jobs', async () => {
      const mockedJobs = [{ id: '123' } as Job];
      prisma.job.findMany.mockResolvedValue([...mockedJobs]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.getQueueJobs(req, res as Response, next);

      expect(prisma.job.findMany).toHaveBeenCalled();
    });

    it('returns Missing Info status', async () => {
      const newJob = { ...job };
      newJob.techReference = '';
      prisma.job.findMany.mockResolvedValue([newJob]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.getQueueJobs(req, res as Response, next);
      const responseObj: any = getResponseObject();
      const status = responseObj?.length ? responseObj[0].invoicingStatus : '';

      expect(prisma.job.findMany).toHaveBeenCalled();
      expect(status).toEqual(InvoicingQueueStatus.MissingInfo);
    });

    it('returns Ready status', async () => {
      prisma.job.findMany.mockResolvedValue([...mockedJobs]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.getQueueJobs(req, res as Response, next);
      const responseObj: any = getResponseObject();
      const status = responseObj?.length ? responseObj[0].invoicingStatus : '';

      expect(prisma.job.findMany).toHaveBeenCalled();
      expect(status).toEqual(InvoicingQueueStatus.Ready);
    });
  });

  describe('getInvoices', () => {
    it('returns invoices', async () => {
      const mockedInvoice = [{ id: '123' } as Invoice];
      prisma.invoice.findMany.mockResolvedValue([...mockedInvoice]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.getInvoices(req, res as Response, next);

      expect(prisma.invoice.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteLineItem', () => {
    it('sets an invoiceDetail record to isDeleted and its associated job to isDiscarded', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const jobId = faker.faker.datatype.uuid();
      prisma.invoiceDetail.findFirst.mockResolvedValue({
        jobId: jobId,
      } as unknown as InvoiceDetail);

      const controller = new InvoiceController();

      req.params.lineItemId = faker.faker.datatype.uuid();

      await controller.deleteLineItem(req, res as Response, next);

      expect(prisma.invoiceDetail.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [req.params.lineItemId] } },
        data: { isDeleted: true },
      });
      expect(prisma.job.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: { isDiscarded: true },
      });
    });

    it('sets an invoiceDetail record to isDeleted and skips job if not present', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const jobId = faker.faker.datatype.uuid();
      prisma.invoiceDetail.findFirst.mockResolvedValue({
        jobId: undefined,
      } as unknown as InvoiceDetail);

      const controller = new InvoiceController();

      req.params.lineItemId = faker.faker.datatype.uuid();

      await controller.deleteLineItem(req, res as Response, next);

      expect(prisma.invoiceDetail.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [req.params.lineItemId] } },
        data: { isDeleted: true },
      });
      expect(prisma.job.update).toHaveBeenCalledTimes(0);
    });
  });

  describe('createLineItem', () => {
    it('creates an invoiceDetail record', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.createLineItem(req, res as Response, next);

      expect(prisma.invoiceDetail.createMany).toHaveBeenCalled();
    });
  });

  describe('updateLineItem', () => {
    it('updates an invoiceDetail record', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.updateLineItem(req, res as Response, next);

      expect(prisma.invoiceDetail.update).toHaveBeenCalled();
    });
  });

  describe('createLineItems', () => {
    it('creates an invoiceDetail record', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = {
        lineItems: [{}, {}],
      };
      await controller.createLineItems(req, res as Response, next);

      expect(prisma.invoiceDetail.create).toHaveBeenCalled();
    });
  });

  describe('updateLineItems', () => {
    it('updates an invoiceDetail record', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = {
        lineItems: [{ customFields: [] }, { customFields: [] }],
      };
      await controller.updateLineItems(req, res as Response, next);

      expect(prisma.invoiceDetail.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('createLineItemCustomFields', () => {
    it('creates invoiceDetailCustomField records', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = [{}, {}];
      await controller.createLineItemCustomFields(req, res as Response, next);

      expect(prisma.invoiceDetailCustomField.createMany).toHaveBeenCalled();
    });
  });

  describe('updateLineItemCustomFields', () => {
    it('updates invoiceDetailCustomField records', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = [{}, {}];
      await controller.updateLineItemCustomFields(req, res as Response, next);

      expect(prisma.invoiceDetailCustomField.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteLineItemCustomFields', () => {
    it('deletes invoiceDetailCustomField records', async () => {
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = ['', ''];
      await controller.deleteLineItemCustomFields(req, res as Response, next);

      expect(prisma.invoiceDetailCustomField.updateMany).toHaveBeenCalled();
    });
  });

  describe('getQueueJobsCount', () => {
    it('returns count', async () => {
      prisma.job.count.mockResolvedValue(2);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      await controller.getQueueJobsCount(req, res as Response, next);

      expect(prisma.job.count).toHaveBeenCalled();
    });
  });

  describe('getYtdRevenue', () => {
    it('returns revenue', async () => {
      const mockedInvoiceDetails = [
        {
          id: '123',
          amount: 123,
          taxRate: 10,
          isTaxable: true,
          cost: 123,
          crewFirstName: 'Test',
          crewLastName: 'Test',
          description: 'test',
          invoiceId: 'test',
          invoiceLineNo: 1,
          isDeleted: false,
          jobId: 'test',
          jobSubTypeId: 1,
          jobTypeId: 1,
          lineItemType: 'test',
          orgId: 'test',
          qbClass: 'test',
          qbRef: 'test',
          quantity: 1,
          serviceDate: new Date(),
        } as InvoiceDetail,
      ];
      prisma.invoiceDetail.findMany.mockResolvedValue([
        ...mockedInvoiceDetails,
      ]);

      const mockedInvoiceStatus = {
        id: 1,
      } as InvoiceStatus;

      prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow.mockResolvedValue(
        mockedInvoiceStatus
      );

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();

      await controller.getYtdRevenue(req, res as Response, next);

      expect(prisma.invoiceDetail.findMany).toHaveBeenCalled();
    });
  });

  describe('markInvoicesSent', () => {
    it('marks invoices sent', async () => {
      prisma.invoice.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow.mockResolvedValue(
        {
          id: 1,
        } as InvoiceStatus
      );

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();

      req.body = { invoiceIds: ['1'] };
      await controller.markInvoicesSent(req, res as Response, next);

      expect(
        prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow
      ).toHaveBeenCalled();
      expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
        data: { statusId: 1 },
        where: { id: { in: ['1'] } },
      });
    });
  });

  describe('markInvoicesPaid', () => {
    it('marks invoices paid', async () => {
      prisma.invoice.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow.mockResolvedValue(
        {
          id: 1,
        } as InvoiceStatus
      );

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = { invoiceIds: ['1'] };
      await controller.markInvoicesPaid(req, res as Response, next);

      expect(
        prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow
      ).toHaveBeenCalled();
      expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
        data: { statusId: 1, processed: true },
        where: { id: { in: ['1'] } },
      });
    });
  });

  describe('markInvoicesCreated', () => {
    it('marks invoices created', async () => {
      prisma.invoice.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow.mockResolvedValue(
        {
          id: 1,
        } as InvoiceStatus
      );

      prismaMock.setPrismaClientMock(prisma);

      const controller = new InvoiceController();
      req.body = { invoiceIds: ['1'] };
      await controller.markInvoicesCreated(req, res as Response, next);

      expect(
        prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow
      ).toHaveBeenCalled();
      expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
        data: { statusId: 1, processed: false },
        where: { id: { in: ['1'] } },
      });
    });
  });

  describe('getInvoicesPdf', () => {
    it('returns a pdf if only one id is passed', async () => {
      prisma.invoice.findMany.mockResolvedValue([
        { id: '1' } as unknown as Invoice,
      ]);
      prisma.organizationSetting.findFirstOrThrow.mockResolvedValue({
        id: '1',
      } as unknown as OrganizationSetting);

      prismaMock.setPrismaClientMock(prisma);
      mockPuppeteerUtil.generatePdf.mockResolvedValue(null);
      mockPuppeteerUtil.getLogoDataUrl.mockResolvedValue(null);

      const controller = new InvoiceController();
      req.body = { invoiceIds: ['1'] };

      await controller.getInvoicesPdf(req, res as Response, next);

      expect(prisma.invoice.findMany).toHaveBeenCalled();
      expect(mockPuppeteerUtil.generatePdf).toHaveBeenCalled();
    });
  });

  describe('sendInvoices', () => {
    it('sends an email with pdf', async () => {
      prisma.invoice.findMany.mockResolvedValue([
        { id: '1' } as unknown as Invoice,
      ]);
      prisma.organizationSetting.findFirstOrThrow.mockResolvedValue({
        id: '1',
      } as unknown as OrganizationSetting);

      prismaMock.setPrismaClientMock(prisma);
      mockPuppeteerUtil.generatePdf.mockResolvedValue(null);
      mockPuppeteerUtil.getLogoDataUrl.mockResolvedValue(null);

      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const controller = new InvoiceController();
      req.body = { invoiceIds: ['1'] };

      await controller.sendInvoices(req, res as Response, next);

      expect(prisma.invoice.findMany).toHaveBeenCalled();
      expect(mockPuppeteerUtil.generatePdf).toHaveBeenCalled();
    });
  });
});
