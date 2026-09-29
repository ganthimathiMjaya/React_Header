const sendJobRolledOverAdminEmail = jest.fn();
const sendJobsForTomorrowEmail = jest.fn();
const sendPushNotifications = jest.fn();
import { mockDeep, mockReset } from 'jest-mock-extended';
import {
  Email,
  Contact,
  User,
  Job,
  Organization,
  PrismaClient,
  Notification,
} from '@prisma/client';
import {
  rolledOverJobs,
  scheduledForTomorrowJobs,
  jobsAssignedEndOfDay,
  JobWithUsersAndDevices,
} from '../notifications.cronjob';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { AdminWithEmail } from '../../services/user/user.service';
import { CustomerWithUsersAndDevices } from '../../services/pushNotification/userPushNotification.service';

jest.mock('../../utils/email/send.confirmation', () => ({
  __esModule: true,
  ...(jest.requireActual('../../utils/email/send.confirmation') as any),
  sendJobRolledOverAdminEmail,
  sendJobsForTomorrowEmail,
}));

jest.mock('../../services/pushNotification/pushNotification.service', () => ({
  __esModule: true,
  ...(jest.requireActual(
    '../../services/pushNotification/pushNotification.service'
  ) as any),
  sendPushNotifications,
  PushNotificationService: jest.fn(() => ({ sendPushNotifications })),
  default: jest.fn(() => ({ sendPushNotifications })),
}));

describe('Notification CronJob', () => {
  beforeEach(() => {
    mockReset(sendPushNotifications);
  });

  const prisma = mockDeep<PrismaClient>();
  const email = {
    address: 'test@test.com',
  } as unknown as Email;
  const contact = { email } as unknown as Contact;
  const user = { contact } as unknown as User;
  const admins: AdminWithEmail[] = [
    { User: user },
  ] as unknown as AdminWithEmail[];

  describe('rolledOverJobs', () => {
    it('calls sendJobRolledOverAdminEmail', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [{ id: 'id' } as unknown as Organization]
      );
      prismaMock.prismaClientBypassMock.job.count.mockResolvedValue(2);
      prismaMock.prismaClientBypassMock.job.findMany.mockResolvedValue([
        { id: '1', techReference: '1' } as Job,
        { id: '2', techReference: '2' } as Job,
      ]);
      prisma.admin.findMany.mockResolvedValue(admins);
      prisma.notification.create.mockResolvedValue({} as Notification);

      prismaMock.setPrismaClientMock(prisma);

      await rolledOverJobs();

      expect(sendJobRolledOverAdminEmail).toHaveBeenCalledWith(
        ['test@test.com'],
        {
          jobRollingOverCount: 2,
          jobs: [{ techReference: '1' }, { techReference: '2' }],
          subject: 'Jobs rolling over',
        }
      );
    });
  });

  describe('scheduledForTomorrowJobs', () => {
    it('calls sendJobsForTomorrowEmail', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [{ id: 'id' } as unknown as Organization]
      );
      prisma.job.findMany.mockResolvedValue([
        {
          id: '1',
          techReference: '1',
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
        } as unknown as Job,
      ]);
      prismaMock.setPrismaClientMock(prisma);

      await scheduledForTomorrowJobs();

      expect(sendJobsForTomorrowEmail).toHaveBeenCalledWith(['test@test.com'], {
        job: { address: '', city: '', techReference: '1' },
        subject: 'Reminder: Job 1 Scheduled for Tomorrow',
      });
      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at undefined is scheduled for tomorrow',
          title: 'Reminder: Job Scheduled',
          to: '123',
        },
      ]);
    });
  });

  describe('jobsAssignedEndOfDay', () => {
    it('sends push notifications', async () => {
      prismaMock.prismaClientBypassMock.organization.findMany.mockResolvedValue(
        [{ id: 'id' } as unknown as Organization]
      );
      prisma.job.findMany.mockResolvedValue([
        {
          id: '1',
          techReference: '1',
          userId: 1,
          User: {
            id: 1,
            userOrganizations: [
              {
                isDeleted: false,
                isPushNotificationAllowed: true,
              },
            ],
            userDevices: [{ pushNotificationToken: '123' }],
          },
          project: {
            location: {
              address: {
                line1: 'my address',
              },
            },
          },
        } as unknown as JobWithUsersAndDevices,
      ]);
      prismaMock.setPrismaClientMock(prisma);

      await jobsAssignedEndOfDay();

      expect(sendPushNotifications).toHaveBeenCalledWith([
        {
          body: 'Job at my address scheduled for today is still in assigned status',
          title: 'Job Is Still Assigned',
          to: '123',
        },
      ]);
    });
  });
});
