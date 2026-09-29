import { mockSendGrid } from '../../utils/sendgrid/sendgrid.mock';
import { mockGeocoder } from '../../utils/geocoder/geocoder.mock';
import {
  PrismaClient,
  User,
  Job,
  Notification,
  EtaStatus,
  Location,
  Project,
  Customer,
  OrganizationJobCustomField,
} from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { sendPushNotifications } from '../../services/pushNotification/pushNotification.mock';
import { req, res, next } from '../../utils/tests/express.mock';
import JobController from './job.controller';
import { CustomerWithUsersAndDevices } from '../../services/pushNotification/userPushNotification.service';
import JobStatus from '../../utils/enums/job.status';

describe('JobController', () => {
  const prisma = mockDeep<PrismaClient>();

  describe('updateJobCustomFields', () => {
    it('updates customFields', async () => {
      const mockedRecord = {
        id: '123',
      } as unknown as OrganizationJobCustomField;
      prisma.organizationJobCustomField.update.mockResolvedValue(mockedRecord);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { customFields: [{ id: '111', value: 'value' }] };
      await controller.updateJobCustomFields(req, res as Response, next);

      expect(prisma.organizationJobCustomField.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { value: 'value' },
          where: { id: '111' },
        })
      );
    });
  });

  describe('pushJob', () => {
    it('pushes the job', async () => {
      const mockedJob = { id: '123' } as Job;
      prisma.job.update.mockResolvedValue(mockedJob);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const mockedNotification = { id: '123' } as Notification;
      prisma.notification.create.mockResolvedValue(mockedNotification);

      const mockedUser = { id: 123 } as User;
      prisma.user.findFirstOrThrow.mockResolvedValue(mockedUser);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.notification.create.mockResolvedValue(mockedNotification);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { appNotes: 'notes' };
      await controller.pushJob(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { appNotes: 'notes', statusId: JobStatus.NeedsApproval },
        })
      );
    });
  });

  describe('cancel', () => {
    it('sets the job to needs approval', async () => {
      const mockedJob = { id: '123', scheduledDate: new Date() } as Job;
      prisma.job.findFirstOrThrow.mockResolvedValue(mockedJob);
      prisma.job.update.mockResolvedValue(mockedJob);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const mockedNotification = { id: '123' } as Notification;
      prisma.notification.create.mockResolvedValue(mockedNotification);

      const mockedUser = { id: 123 } as User;
      prisma.user.findFirstOrThrow.mockResolvedValue(mockedUser);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.notification.create.mockResolvedValue(mockedNotification);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      await controller.cancel(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { statusId: JobStatus.NeedsApproval },
        })
      );
    });

    it('cancels the job', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const mockedJob = { id: '123', scheduledDate: futureDate } as Job;
      prisma.job.findFirstOrThrow.mockResolvedValue(mockedJob);
      prisma.job.update.mockResolvedValue(mockedJob);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const mockedNotification = { id: '123' } as Notification;
      prisma.notification.create.mockResolvedValue(mockedNotification);

      const mockedUser = { id: 123 } as User;
      prisma.user.findFirstOrThrow.mockResolvedValue(mockedUser);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.notification.create.mockResolvedValue(mockedNotification);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      await controller.cancel(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { statusId: JobStatus.Cancelled } })
      );
    });
  });

  describe('reschedule', () => {
    it('sets the job to needs approval', async () => {
      const mockedJob = { id: '123', scheduledDate: new Date() } as Job;
      prisma.job.findFirstOrThrow.mockResolvedValue(mockedJob);
      prisma.job.update.mockResolvedValue(mockedJob);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const mockedNotification = { id: '123' } as Notification;
      prisma.notification.create.mockResolvedValue(mockedNotification);

      const mockedUser = { id: 123 } as User;
      prisma.user.findFirstOrThrow.mockResolvedValue(mockedUser);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.notification.create.mockResolvedValue(mockedNotification);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.params = { jobId: '1' };
      req.body = { scheduledDate: '2323-01-01', timeSlot: 'Anytime' };
      await controller.reschedule(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            statusId: JobStatus.NeedsApproval,
          },
        })
      );
    });

    it('reschedules the job', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const mockedJob = { id: '123', scheduledDate: futureDate } as Job;
      prisma.job.findFirstOrThrow.mockResolvedValue(mockedJob);
      prisma.job.update.mockResolvedValue(mockedJob);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const mockedNotification = { id: '123' } as Notification;
      prisma.notification.create.mockResolvedValue(mockedNotification);

      const mockedUser = { id: 123 } as User;
      prisma.user.findFirstOrThrow.mockResolvedValue(mockedUser);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.notification.create.mockResolvedValue(mockedNotification);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.params = { jobId: '1' };
      req.body = { scheduledDate: '2030-01-01', timeSlot: 'Anytime' };
      await controller.reschedule(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            scheduledDate: new Date('2030-01-01T00:00:00.000Z'),
            timeSlot: 'Anytime',
          },
        })
      );
    });
  });

  describe('reportJob', () => {
    it('reports the job', async () => {
      const mockedJob = { id: '123' } as Job;
      prisma.job.update.mockResolvedValue(mockedJob);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const mockedNotification = { id: '123' } as Notification;
      prisma.notification.create.mockResolvedValue(mockedNotification);

      const mockedUser = { id: 123 } as User;
      prisma.user.findFirstOrThrow.mockResolvedValue(mockedUser);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.notification.create.mockResolvedValue(mockedNotification);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { notes: 'notes' };
      await controller.reportJob(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { statusId: JobStatus.NeedsApproval },
        })
      );
    });
  });

  describe('updateEtaStatus', () => {
    it('updates the etaStatus', async () => {
      prismaMock.prismaClientBypassMock.etaStatus.findFirst.mockResolvedValue({
        id: 1,
        status: 'ON_WAY',
      } as unknown as EtaStatus);
      const mockedJob = {
        id: '123',
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      prisma.job.update.mockResolvedValue(mockedJob);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { etaStatusId: 1 };
      req.params = { jobId: '1' };

      await controller.updateEtaStatus(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { etaStatusId: 1 } })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at undefined is on the way',
          title: 'Job On The Way',
          to: '123',
        },
      ]);
    });
  });

  describe('updateJobStatus', () => {
    it('updates the status to in-progress', async () => {
      const mockedJob = {
        id: '123',
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      prisma.job.update.mockResolvedValue(mockedJob);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { statusId: JobStatus.InProgress };
      req.params = { jobId: '1' };

      await controller.updateJobStatus(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { statusId: JobStatus.InProgress },
        })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at undefined has started',
          title: 'Job Started',
          to: '123',
        },
      ]);
    });

    it('updates the status to complete', async () => {
      const mockedJob = {
        id: '123',
        project: {
          location: {
            address: {
              line1: 'line 1',
            },
          },
        },
        primaryContact: {
          email: {
            address: 'test@test.com',
          },
        },
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      prisma.job.update.mockResolvedValue(mockedJob);
      prisma.photos.findMany.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const controller = new JobController();
      req.body = { statusId: JobStatus.Complete };
      req.params = { jobId: '1' };

      await controller.updateJobStatus(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { statusId: JobStatus.Complete },
        })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at line 1 has been completed',
          title: 'Job Completed',
          to: '123',
        },
      ]);
    });
  });

  describe('updateJob', () => {
    it('updates the job to in-progress', async () => {
      const mockedJob = {
        id: '123',
        statusId: JobStatus.InProgress,
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      const existingJob = { ...mockedJob, statusId: JobStatus.Scheduled };
      prisma.job.update.mockResolvedValue(mockedJob);
      prisma.job.findFirst.mockResolvedValue(existingJob);
      prisma.crewAssignment.findFirst.mockResolvedValue(null);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { statusId: JobStatus.InProgress };
      req.params = { jobId: '1' };

      await controller.updateJob(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: { connect: { id: JobStatus.InProgress } } },
        })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at  has started',
          title: 'Job Started',
          to: '123',
        },
      ]);
    });

    it('updates the job to re-scheduled', async () => {
      const scheduledDate = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const mockedJob = {
        id: '123',
        scheduledDate,
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      const existingJob = { ...mockedJob, scheduledDate: tomorrow };
      prisma.job.update.mockResolvedValue(mockedJob);
      prisma.job.findFirst.mockResolvedValue(existingJob);
      prisma.crewAssignment.findFirst.mockResolvedValue(null);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();

      req.body = { scheduledDate };
      req.params = { jobId: '1' };

      await controller.updateJob(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { scheduledDate },
        })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: expect.any(String),
          title: 'Job Re-scheduled',
          to: '123',
        },
      ]);
    });

    it('updates the job to complete', async () => {
      const mockedJob = {
        id: '123',
        statusId: JobStatus.Complete,
        project: {
          location: {
            address: {
              line1: 'line 1',
            },
          },
        },
        primaryContact: {
          email: {
            address: 'test@test.com',
          },
        },
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      const existingJob = { ...mockedJob, statusId: JobStatus.Scheduled };
      prisma.job.update.mockResolvedValue(mockedJob);
      prisma.job.findFirst.mockResolvedValue(existingJob);
      prisma.crewAssignment.findFirst.mockResolvedValue(null);
      prisma.photos.findMany.mockResolvedValue([]);
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = { statusId: JobStatus.Complete };
      req.params = { jobId: '1' };

      await controller.updateJob(req, res as Response, next);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: { connect: { id: JobStatus.Complete } } },
        })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at line 1 has been completed',
          title: 'Job Completed',
          to: '123',
        },
      ]);
    });
  });

  describe('adminCreateJob', () => {
    it('creates a job', async () => {
      const jobBody = {
        jobScope: 'scope',
        primaryContactId: 1,
        secondaryContactId: 2,
        projectId: 1,
        address: {},
      };
      const mockedJob = {
        id: '123',
        statusId: JobStatus.Scheduled,
        userId: 1,
        scheduledDate: new Date(),
        User: {
          userOrganizations: [
            {
              isDeleted: false,
              isPushNotificationAllowed: true,
            },
          ],
          userDevices: [{ pushNotificationToken: '123' }],
        },
      } as unknown as Job;

      prisma.job.create.mockResolvedValue(mockedJob);
      const customer = {
        id: '1',
        locationId: 1,
        location: { id: '1' },
      } as unknown as Customer;
      const project = { id: '1' } as unknown as Project;
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.customer.create.mockResolvedValue(customer);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = jobBody;
      mockGeocoder.mockResolvedValue([]);

      await controller.adminCreateJob(req, res as Response, next);

      expect(prisma.job.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jobScope: 'scope',
          }),
        })
      );
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at undefined has been assigned',
          title: 'Job Assigned',
          to: '123',
        },
      ]);
    });
  });

  describe('createJob', () => {
    it('creates a job', async () => {
      const jobBody = {
        jobScope: 'scope',
      };
      const mockedJob = {
        id: '123',
        statusId: JobStatus.InProgress,
        userId: 1,
        customer: {
          email: 'test@test.com',
          customerUser: [
            {
              User: [
                {
                  userOrganizations: [
                    {
                      isDeleted: false,
                      isPushNotificationAllowed: true,
                    },
                  ],
                  userDevices: [{ pushNotificationToken: '123' }],
                },
              ],
            },
          ],
        } as unknown as CustomerWithUsersAndDevices,
      } as unknown as Job;
      prisma.job.create.mockResolvedValue(mockedJob);

      const project = { id: '1' } as unknown as Project;
      prisma.project.findUnique.mockResolvedValue(project);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new JobController();
      req.body = jobBody;

      await controller.createJob(req, res as Response, next);

      expect(prisma.job.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jobScope: 'scope',
          }),
        })
      );
    });
  });

  describe('createCustomFields', () => {
    it('adds custom fields to DB', async () => {
      prismaMock.setPrismaClientMock(prisma);

      req.body = [
        {
          customFieldId: 1,
          value: 'abc',
        },
        {
          customFieldId: 2,
          value: '123',
        },
      ];

      const controller = new JobController();
      await controller.createCustomFields(req, res as Response, next);

      expect(
        prisma.organizationJobCustomField.createMany
      ).toHaveBeenCalledTimes(1);
    });
  });
});
