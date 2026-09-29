import moment from 'moment';
import {
  getPrismaClientForTenant,
  ExtendedPrismaClient,
} from '../../utils/prisma/multiTenancyPrisma.client';
import { UserService } from '../user/user.service';
import ReceiverType from '../../utils/enums/receiver.types';
import NotificationType from '../../utils/enums/notification.types';
import { getAdminRecipients } from '../../utils/email/email.util';

const userService = new UserService();

export interface CreateNotificationInput {
  type: NotificationType;
  title?: string;
  description?: string;
  jobId?: string;
  jobTechReference?: string;
  receiverType: ReceiverType;
  triggeredBy?: string;
}

export default class NotificationService {
  public async getNotificationsForUser(orgId: string, authId: string) {
    const user = await userService.getUserByAuthId(orgId, authId);
    const dateMinusThirty = moment(new Date()).subtract(30, 'day');

    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.notificationUser.findMany({
      where: {
        createdAt: { gte: dateMinusThirty.toISOString() },
        isCleared: false,
        userId: user.id,
      },
      include: {
        notification: true,
      },
    });
  }

  public async createNotification(
    orgId: string,
    userAuthId: string,
    input: CreateNotificationInput
  ) {
    let triggeredBy = null;
    let description = input.description;
    if (input.triggeredBy) {
      triggeredBy = input.triggeredBy;
    } else if (input.type === NotificationType.JOB_PUSHED) {
      const user = await userService.getUserByAuthId(orgId, userAuthId);
      triggeredBy = `${user.firstName} ${user.lastName}`;
      description = `${triggeredBy} has requested to push job ${input.jobTechReference}`;
    }

    const admins = await userService.getAllAdmins(orgId);
    const newNotificationUser = admins.map((admin) => {
      return { userId: admin.userId };
    });

    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.notification.create({
      data: {
        type: input.type.toString(),
        title: input.title,
        description,
        jobId: input.jobId,
        jobTechReference: input.jobTechReference,
        receiverType: input.receiverType.toString(),
        triggeredBy,
        notificationUser: {
          createMany: {
            data: newNotificationUser,
          },
        },
      },
    });
  }

  public async getAllAdminEmails(orgId: string) {
    const admins = await userService.getAllAdminsWithEmails(orgId);
    return getAdminRecipients(admins);
  }

  public async markNotificationsRead(orgId: string, notificationIds: string[]) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.notificationUser.updateMany({
      where: { id: { in: notificationIds } },
      data: {
        isRead: true,
      },
    });
  }

  public async markNotificationsCleared(
    orgId: string,
    notificationIds: string[]
  ) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.notificationUser.updateMany({
      where: { id: { in: notificationIds } },
      data: {
        isCleared: true,
      },
    });
  }
}
