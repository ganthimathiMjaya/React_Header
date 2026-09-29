import { expect, jest } from '@jest/globals';
import { JobInsights } from '../../dto/jobInsights';
import ScheduledNotificationService from '../scheduledNotifications/scheduledNotification.service';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { InsightsJobDetail, InvoiceStatus, PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

let mockedJobController = jest.mock;
let mockGetJobsAddedPastThirtyDays = jest.fn().mockReturnValue(1);
let mockGetJobsCompletedPastThirtyDays = jest.fn().mockReturnValue(5);
let mockGetJobsCompletedPastDays = jest.fn().mockReturnValue(5);
jest.mock('../../controllers/job/job.controller.ts', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        JobController: mockedJobController,
        getJobsAddedPastThirtyDays: mockGetJobsAddedPastThirtyDays,
        getJobsCompletedPastThirtyDays: mockGetJobsCompletedPastThirtyDays,
        getJobsCompletedPastDays: mockGetJobsCompletedPastDays,
      };
    }),
  };
});

let mockedScheduledNotificationRepository = jest.mock;
let mockUpdateJobHeaderStatusById = jest
  .fn()
  .mockImplementation(async (id, statusCode) => {});

let mockUpdateJobDetailStatusById = jest
  .fn()
  .mockImplementation(async (id, statusCode) => {});

let mockGetFailedInsights = jest.fn().mockImplementation(async () => {
  return [
    {
      adminUserId: 1,
      user: {
        contact: {
          email: {
            address: 'test@test.com',
          },
        },
      },
      orgId: 'orgId',
      id: 1,
      insightsJobHeaderId: 1,
    },
  ];
});

let mockGetNewLicensees = jest.fn().mockImplementation(async () => {
  return [
    {
      id: 1,
      userOrganizations: [
        {
          orgId: 'test',
        },
      ],
      contact: {
        email: {
          address: 'test@test.com',
        },
      },
    },
  ];
});

let mockGetInsightsJobStatus = jest
  .fn()
  .mockImplementation(async (statusCode) => {
    return {
      id: 1,
      code: 'test',
      desc: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };
  });

let mockGetExistingLicensees = jest.fn().mockImplementation(async () => {
  return [
    {
      user: {
        id: 1,
        contact: {
          email: {
            address: 'test@test.com',
          },
        },
        userOrganizations: [
          {
            orgId: 'test',
          },
        ],
      },
    },
  ];
});

let mockDetermineIfInsightsJobHeaderAlreadyProcessed = jest
  .fn()
  .mockImplementation(async () => {
    return 0;
  });

let mockDetermineIfInsightsJobDetailAlreadyProcessed = jest
  .fn()
  .mockImplementation(async (id) => {
    return 0;
  });

jest.mock(
  '../../repositories/scheduledNotifications/scheduledNotification.repository',
  () => {
    return {
      __esModule: true,
      default: jest.fn().mockImplementation(() => {
        return {
          ScheduledNotificationRepository:
            mockedScheduledNotificationRepository,
          updateJobHeaderStatusById: mockUpdateJobHeaderStatusById,
          updateJobDetailStatusById: mockUpdateJobDetailStatusById,
          getFailedInsights: mockGetFailedInsights,
          getNewLicensees: mockGetNewLicensees,
          getInsightsJobStatus: mockGetInsightsJobStatus,
          getExistingLicensees: mockGetExistingLicensees,
          determineIfInsightsJobHeaderAlreadyProcessed:
            mockDetermineIfInsightsJobHeaderAlreadyProcessed,
          determineIfInsightsJobDetailAlreadyProcessed:
            mockDetermineIfInsightsJobDetailAlreadyProcessed,
        };
      }),
    };
  }
);

describe('ScheduledNotificationService', () => {
  const prisma = mockDeep<PrismaClient>();
  describe('getJobInsights', () => {
    it('getJobInsights', async () => {
      prismaMock.prismaClientBypassMock.invoiceStatus.findFirstOrThrow.mockResolvedValue(
        { id: 1 } as unknown as InvoiceStatus
      );
      prisma.invoiceDetail.findMany.mockResolvedValue([]);
      prismaMock.setPrismaClientMock(prisma);

      const service = new ScheduledNotificationService();
      let actual = await service.getJobInsights('orgId');

      expect(mockGetJobsAddedPastThirtyDays).toBeCalled();
      expect(mockGetJobsCompletedPastDays).toBeCalled();
      let expected = new JobInsights('orgId', 1, 5, 0, 0, 0, 0);

      expect(actual).toEqual(expected);
    });
  });
});

describe('ScheduledNotificationService', () => {
  describe('finalizeJobHeaderStatusComp', () => {
    it('finalizeJobHeaderStatusComp', async () => {
      const service = new ScheduledNotificationService();
      await service.finalizeJobHeaderStatus(1, 0, 5);

      expect(mockUpdateJobHeaderStatusById).toHaveBeenCalledWith(1, 'COMP');
    });
  });
});

describe('ScheduledNotificationService', () => {
  describe('finalizeJobHeaderStatusPart', () => {
    it('finalizeJobHeaderStatusPart', async () => {
      const service = new ScheduledNotificationService();
      await service.finalizeJobHeaderStatus(1, 1, 5);

      expect(mockUpdateJobHeaderStatusById).toHaveBeenCalledWith(1, 'PART');
    });
  });
});

describe('ScheduledNotificationService', () => {
  describe('finalizeJobHeaderStatusFail', () => {
    it('finalizeJobHeaderStatusFail', async () => {
      const service = new ScheduledNotificationService();
      await service.finalizeJobHeaderStatus(1, 5, 5);

      expect(mockUpdateJobHeaderStatusById).toHaveBeenCalledWith(1, 'FAIL');
    });
  });
});

describe('ScheduledNotificationService', () => {
  describe('retryFailedInsightsSuccess', () => {
    it('retryFailedInsightsSuccess', async () => {
      const service = new ScheduledNotificationService();

      const mockedJobDetail = {
        id: 1,
        insightsJobHeaderId: 1,
        insightsJobStatusId: 1,
        adminUserId: 1,
        createdAt: new Date(),
        failureDate: new Date(),
        isDeleted: false,
        orgId: '1',
        updatedAt: new Date(),
      } as InsightsJobDetail;

      let mockedArr = [];
      mockedArr.push(mockedJobDetail);

      prismaMock.prismaClientBypassMock.insightsJobDetail.findMany.mockResolvedValue(
        mockedArr
      );

      prismaMock.prismaClientBypassMock.insightsJobDetail.findFirst.mockResolvedValue(
        mockedJobDetail
      );

      jest
        .spyOn(service, 'getJobInsights')
        .mockImplementation(async (orgId) => {
          return {
            jobsAdded: 1,
            jobsCompleted: 1,
            orgId: 'orgId',
            totalRevenue: 0,
            totalRevenueYtd: 0,
            last60DaysJobsCompleted: 100,
            last60DaysRevenue: 100,
          };
        });

      jest
        .spyOn(service, 'sendInsightsEmail')
        .mockImplementation(async (jobInsights) => {});

      await service.retryFailedInsights();

      expect(mockUpdateJobDetailStatusById).toHaveBeenCalledWith(1, 'COMP');
    });
  });
});

describe('ScheduledNotificationService', () => {
  describe('processNewThirtyDayRollingInsightsSuccess', () => {
    it('processNewThirtyDayRollingInsightsSuccess', async () => {
      const service = new ScheduledNotificationService();

      prismaMock.prismaClientBypassMock.insightsJobHeader.create.mockResolvedValue(
        {
          id: 1,
          insightsJobStatusId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        }
      );

      prismaMock.prismaClientBypassMock.insightsJobDetail.create.mockResolvedValue(
        {
          id: 1,
          insightsJobHeaderId: 1,
          insightsJobStatusId: 1,
          adminUserId: 1,
          orgId: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
          failureDate: null,
          isDeleted: false,
        }
      );

      jest
        .spyOn(service, 'getJobInsights')
        .mockImplementation(async (orgId) => {
          return {
            jobsAdded: 1,
            jobsCompleted: 1,
            orgId: 'orgId',
            totalRevenue: 0,
            totalRevenueYtd: 0,
            last60DaysJobsCompleted: 100,
            last60DaysRevenue: 100,
          };
        });

      jest
        .spyOn(service, 'sendInsightsEmail')
        .mockImplementation(async (jobInsights) => {});

      await service.processNewThirtyDayRollingInsights();

      expect(mockUpdateJobDetailStatusById).toHaveBeenCalledWith(1, 'COMP');
    });
  });
});

describe('ScheduledNotificationService', () => {
  describe('processExistingThirtyDayRollingInsightsSuccess', () => {
    it('processExistingThirtyDayRollingInsightsSuccess', async () => {
      const service = new ScheduledNotificationService();

      prismaMock.prismaClientBypassMock.insightsJobHeader.create.mockResolvedValue(
        {
          id: 1,
          insightsJobStatusId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        }
      );

      prismaMock.prismaClientBypassMock.insightsJobDetail.create.mockResolvedValue(
        {
          id: 1,
          insightsJobHeaderId: 1,
          insightsJobStatusId: 1,
          adminUserId: 1,
          orgId: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
          failureDate: null,
          isDeleted: false,
        }
      );

      jest
        .spyOn(service, 'getJobInsights')
        .mockImplementation(async (orgId) => {
          return {
            jobsAdded: 1,
            jobsCompleted: 1,
            orgId: 'orgId',
            totalRevenue: 0,
            totalRevenueYtd: 0,
            last60DaysJobsCompleted: 100,
            last60DaysRevenue: 100,
          };
        });

      jest
        .spyOn(service, 'sendInsightsEmail')
        .mockImplementation(async (jobInsights) => {});

      await service.processExistingThirtyDayRollingInsights();

      expect(mockUpdateJobDetailStatusById).toHaveBeenCalledWith(1, 'COMP');
    });
  });
});
