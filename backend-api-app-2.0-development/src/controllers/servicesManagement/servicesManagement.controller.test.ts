import { PrismaClient, JobType, JobSubType } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, res, next } from '../../utils/tests/express.mock';

import ServicesManagementController from './servicesManagement.controller';

describe('ServicesManagementController', () => {
  const prisma = mockDeep<PrismaClient>();
  const jobType: JobType = {
    id: 14,
    description: 'super clean desc',
    shortDescription: 'super clean',
    isOnBookingPortal: true,
    jobSubTypes: [
      {
        name: 'test',
        description: 'desc',
        cost: 11,
        additionalNotes: 'ddf',
        customTaxRate: null,
        isTaxable: true,
        taxRateId: 12,
      },
    ],
  } as unknown as JobType;

  const jobSubTypes = [
    {
      name: 'test',
      description: 'desc',
      cost: 11,
      additionalNotes: 'ddf',
      customTaxRate: null,
      isTaxable: true,
      taxRateId: 12,
    },
  ] as unknown as JobSubType[];

  // Commenting out tests for now. Need to update them to new jobSubType testing.
  // describe('addJobType', () => {
  //   it('adds a jobType', async () => {
  //     prisma.jobType.create.mockResolvedValue(jobType);
  //     prismaMock.setPrismaClientMock(prisma);

  //     const controller = new ServicesManagementController();
  //     req.body = {
  //       jobType: { ...jobType },
  //     };

  //     await controller.addJobType(req, res as Response, next);

  //     expect(prisma.jobType.create).toHaveBeenCalled();
  //   });
  // });

  // describe('updateJobType', () => {
  //   it('updates jobType', async () => {
  //     prisma.$transaction.mockResolvedValue(jest.fn());
  //     prismaMock.setPrismaClientMock(prisma);

  //     const controller = new ServicesManagementController();
  //     req.body = {
  //       jobType: { ...jobType },
  //     };

  //     await controller.updateJobType(req, res as Response, next);

  //     expect(prisma.$transaction).toHaveBeenCalled();
  //   });
  // });

  describe('getAllJobSubTypes', () => {
    it('get all job sub types', async () => {
      prisma.jobSubType.findMany.mockResolvedValue(jobSubTypes);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new ServicesManagementController();
      await controller.getAllJobSubTypes(req, res as Response);

      expect(prisma.jobSubType.findMany).toHaveBeenCalled();
    });
  });
});
