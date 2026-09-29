import {
  prismaClientBypass,
  getPrismaClientForTenant,
} from '../utils/prisma/multiTenancyPrisma.client';
import { ExpoPushMessage } from 'expo-server-sdk';
import { Prisma, Organization, UserDevice } from '@prisma/client';
import { groupBy, mapKeys } from 'lodash';
import { UserService } from '../services/user/user.service';
import JobStatus from '../utils/enums/job.status';
import NotificationService, {
  CreateNotificationInput,
} from '../services/notification/notification.service';
import {
  getPushMessagesForUsers,
  CustomerWithUsersAndDevices,
} from '../services/pushNotification/userPushNotification.service';
import { PushNotificationService } from '../services/pushNotification/pushNotification.service';
import {
  sendJobRolledOverAdminEmail,
  sendJobsForTomorrowEmail,
} from '../utils/email/send.confirmation';
import {
  generateJoshRollingOverTemplate,
  generateJobsForTomorrowTemplate,
} from '../utils/email/templateGenerator.util';
import { getDateTomorrow } from '../utils/dates/dates';
import NotificationType from '../utils/enums/notification.types';
import ReceiverType from '../utils/enums/receiver.types';
import { getAdminRecipients } from '../utils/email/email.util';

const userService = new UserService();
const notificationService = new NotificationService();

export type JobWithUsersAndDevices = Prisma.JobGetPayload<{
  include: {
    User: {
      include: {
        userOrganizations: true;
        userDevices: true;
      };
    };
    project: {
      include: {
        location: { include: { address: true } };
      };
    };
  };
}>;

export const rolledOverJobs = async () => {
  const organizations = await prismaClientBypass.organization.findMany({
    where: { isDeleted: false },
  });
  const promises = organizations.map(async (organization: Organization) => {
    const orgId = organization.id;
    const currentTime = new Date();
    const rolledOverJobs = await prismaClientBypass.job.findMany({
      where: {
        statusId: JobStatus.Scheduled,
        scheduledDate: currentTime,
        orgId,
      },
    });
    const references: string[] = [];
    const jobs = rolledOverJobs.map((job) => {
      references.push(job.techReference);
      return { techReference: job.techReference };
    });
    const body = `Total Number of Jobs to be rolled-over: ${
      rolledOverJobs.length
    }. \n Job tech-references: ${references.join()}`;

    if (rolledOverJobs.length) {
      const input: CreateNotificationInput = {
        type: NotificationType.JOB_ROLLOVER,
        description: body,
        receiverType: ReceiverType.ADMIN,
        title: 'Jobs rolled over',
      };

      await notificationService.createNotification(orgId, '', input);

      const admins = await userService.getAllAdminsWithEmails(orgId);
      const recipients = getAdminRecipients(admins);

      if (recipients.length) {
        await sendJobRolledOverAdminEmail(
          recipients,
          generateJoshRollingOverTemplate({
            subject: 'Jobs rolling over',
            jobRollingOverCount: rolledOverJobs.length,
            jobs,
          })
        );
      } else {
        console.warn(
          `Unable to find admin email associated with orgId: ${orgId}`
        );
      }
    }
  });
  await Promise.all(promises);
};

export const scheduledForTomorrowJobs = async () => {
  const organizations = await prismaClientBypass.organization.findMany({
    where: { isDeleted: false },
  });
  const promises = organizations.map(async (organization: Organization) => {
    const orgId = organization.id;
    const prisma = getPrismaClientForTenant(orgId);
    const jobsForTomorrow = await prisma.job.findMany({
      where: {
        scheduledDate: getDateTomorrow(), //since job is ran at 9PM UTC, tomorrow is still the same day in CST and UTC.
        orgId,
      },
      include: {
        customer: {
          include: {
            customerUser: {
              include: {
                User: {
                  include: {
                    userOrganizations: true,
                    userDevices: true,
                  },
                },
              },
            },
          },
        },
        jobSubType: {
          select: {
            name: true,
          },
        },
        project: {
          include: {
            location: { include: { address: true } },
          },
        },
      },
    });

    const jobPromises = jobsForTomorrow.map(async (job) => {
      const customer: CustomerWithUsersAndDevices = job.customer;
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUsers(
        customer,
        'Reminder: Job Scheduled',
        `Job at ${job.project?.location?.address?.line1} is scheduled for tomorrow`
      );
      const pushService = new PushNotificationService();
      await pushService.sendPushNotifications(pushNotifications);

      if (job.customer?.email) {
        await sendJobsForTomorrowEmail(
          [job.customer.email],
          generateJobsForTomorrowTemplate({
            subject: `Reminder: Job ${job.techReference} Scheduled for Tomorrow`,
            address: job.project?.location?.address?.line1,
            city: job.project?.location?.address?.city,
            techReference: job.techReference,
            customerName: customer.name,
            scheduledDate: job.scheduledDate,
            jobSubType: job.jobSubType?.name,
            jobScope: job.jobScope,
          })
        );
      } else {
        console.warn(
          `No email associated with customer: ${job.customer?.name}`
        );
      }
    });
    await Promise.all(jobPromises);
  });
  await Promise.all(promises);
};

export const jobsAssignedEndOfDay = async () => {
  const organizations = await prismaClientBypass.organization.findMany({
    where: { isDeleted: false },
  });
  const promises = organizations.map(async (organization: Organization) => {
    const orgId = organization.id;
    const prisma = getPrismaClientForTenant(orgId);
    const jobsStillAssigned: JobWithUsersAndDevices[] =
      await prisma.job.findMany({
        where: {
          scheduledDate: new Date(),
          statusId: JobStatus.Scheduled,
          orgId,
        },
        include: {
          User: {
            include: {
              userOrganizations: true,
              userDevices: true,
            },
          },
          project: {
            include: {
              location: { include: { address: true } },
            },
          },
        },
      });

    const jobsPerCrewMember = groupBy(
      jobsStillAssigned,
      (job) => job.userId
    ) as unknown as { [key: string]: JobWithUsersAndDevices[] };

    const pushNotifications: ExpoPushMessage[] = [];
    mapKeys(jobsPerCrewMember, (jobs: JobWithUsersAndDevices[], _userId) => {
      //each key represents a crewMember, and value all jobs in assigned status. UserOrganization and devices should be the exact same in this case since it's the same user.
      const userOrganization = jobs[0].User?.userOrganizations[0];
      const devices: UserDevice[] = jobs[0].User?.userDevices ?? [];

      if (userOrganization?.isPushNotificationAllowed) {
        let title = '';
        let body = '';
        if (jobs.length > 1) {
          title = 'Jobs Are Still Assigned';
          jobs.map((job) => {
            body += `Job at ${job.project?.location?.address?.line1} scheduled for today is still in assigned status. \n`;
          });
        } else {
          title = 'Job Is Still Assigned';
          body = `Job at ${jobs[0].project?.location?.address?.line1} scheduled for today is still in assigned status`;
        }
        devices.map((device: UserDevice) => {
          pushNotifications.push({
            to: device.pushNotificationToken,
            title,
            body,
          });
        });
      }
    });
    const pushService = new PushNotificationService();
    await pushService.sendPushNotifications(pushNotifications);
  });
  await Promise.all(promises);
};
