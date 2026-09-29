import { PrismaClient, NotificationUser, User } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import NotificationController from './notification.controller';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import {
  req,
  res,
  next,
  getResponseObject,
} from '../../utils/tests/express.mock';

describe('NotificationController', () => {
  const prisma = mockDeep<PrismaClient>();

  it('returns notifications', async () => {
    const mockedUser = { id: 123 } as User;
    const notifications = [{ id: 'id' }] as NotificationUser[];
    prisma.user.findUniqueOrThrow.mockResolvedValue(mockedUser);
    prisma.notificationUser.findMany.mockResolvedValue(notifications);
    prismaMock.setPrismaClientMock(prisma);

    const controller = new NotificationController();
    await controller.getNotifications(req, res as Response, next);

    const expected = [{ id: 'id' }];

    expect(expected).toEqual(getResponseObject());
  });

  it('marks notifications read', async () => {
    const notificationIds = { ids: ['123'] };
    req.body = notificationIds;

    prisma.notificationUser.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.setPrismaClientMock(prisma);

    const controller = new NotificationController();
    await controller.markNotificationRead(req, res as Response, next);

    const expected = { count: 1 };

    expect(expected).toEqual(getResponseObject());
    expect(prisma.notificationUser.updateMany).toHaveBeenCalled();
  });

  it('marks notifications cleared', async () => {
    const notificationIds = { ids: ['123'] };
    req.body = notificationIds;

    prisma.notificationUser.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.setPrismaClientMock(prisma);

    const controller = new NotificationController();
    await controller.markNotificationCleared(req, res as Response, next);

    const expected = { count: 1 };

    expect(expected).toEqual(getResponseObject());
    expect(prisma.notificationUser.updateMany).toHaveBeenCalled();
  });
});
