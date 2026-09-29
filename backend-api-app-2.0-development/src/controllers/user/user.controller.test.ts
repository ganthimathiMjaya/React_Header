import { mockSendGrid } from '../../utils/sendgrid/sendgrid.mock';
import { Organization, PrismaClient, User, UserDevice } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, res, next } from '../../utils/tests/express.mock';
import { mockAuth0Service } from '../../services/auth0/aut0.service.mock';

import UserController from './user.controller';

describe('UserController', () => {
  const prisma = mockDeep<PrismaClient>();
  describe('addPushToken', () => {
    it('adds push token', async () => {
      const mockedUser = { id: 123, auth_id: '123' } as User;
      const mockedUserDevice = { id: '123', userId: 123 } as UserDevice;
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockedUser);
      prisma.userDevice.create.mockResolvedValue(mockedUserDevice);
      prismaMock.prismaClientBypassMock.userDevice.deleteMany.mockResolvedValue(
        { count: 0 }
      );
      prismaMock.setPrismaClientMock(prisma);

      const controller = new UserController();

      req.body = { pushToken: '1234' };
      await controller.addPushToken(req, res as Response, next);

      expect(
        prismaMock.prismaClientBypassMock.userDevice.deleteMany
      ).toHaveBeenCalled();
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalled();
      expect(prisma.userDevice.create).toHaveBeenCalledWith({
        data: {
          pushNotificationToken: '1234',
          userId: 123,
        },
      });
    });
  });

  describe('removePushToken', () => {
    it('removes push token', async () => {
      const mockedUser = {
        id: 123,
        auth_id: '123',
      } as User;

      prisma.user.findUniqueOrThrow.mockResolvedValue(mockedUser);
      prisma.userDevice.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.setPrismaClientMock(prisma);

      const controller = new UserController();

      req.body = { pushToken: '1234' };
      await controller.removePushToken(req, res as Response, next);

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalled();
      expect(prisma.userDevice.deleteMany).toHaveBeenCalledWith({
        where: {
          pushNotificationToken: '1234',
          userId: 123,
        },
      });
    });
  });

  describe('allowNotifications', () => {
    it('allows notifications', async () => {
      const mockedUser = {
        id: 123,
        auth_id: '123',
      } as User;
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockedUser);
      prisma.userOrganization.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.setPrismaClientMock(prisma);

      const controller = new UserController();

      req.body = { allowNotifications: true };
      await controller.allowNotifications(req, res as Response, next);

      expect(prisma.userOrganization.updateMany).toHaveBeenCalledWith({
        data: {
          isPushNotificationAllowed: true,
        },
        where: {
          userId: 123,
          orgId: '123',
        },
      });
    });
  });

  describe('createUser', () => {
    it('creates new user', async () => {
      const userBody = {
        id: 1,
        firstName: 'Fred',
        lastName: 'Flintstone',
        roleId: 1,
        email: 'test@test.com',
      };

      const user = {
        id: 1,
        firstName: 'Fred',
        lastName: 'Flintstone',
        roleId: 1,
        userOrganizations: [
          {
            tenantOrganization: {
              name: 'name',
            },
          },
        ],
      } as unknown as User;

      req.body = userBody;

      prisma.user.create.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);
      prisma.organization.findFirst.mockResolvedValue({
        id: 'id',
      } as unknown as Organization);
      prismaMock.setPrismaClientMock(prisma);

      mockAuth0Service.createUser.mockResolvedValue({ auth_id: '123' });
      mockAuth0Service.getRoles.mockResolvedValue([]);
      mockAuth0Service.getOrgName.mockResolvedValue('name');
      mockAuth0Service.getRoleByName.mockResolvedValue({ id: '123' });
      mockAuth0Service.getUser.mockResolvedValue({});
      mockAuth0Service.getPasswordResetLink.mockResolvedValue({ link: '' });
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const controller = new UserController();

      await controller.createUser(req, res, next);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('userPasswordReset', () => {
    it('calls auth0service', async () => {
      const user = {
        id: 1,
        firstName: 'Fred',
        lastName: 'Flintstone',
        roleId: 1,
        contact: {
          email: {
            address: 'test@test.com',
            isFake: false,
          },
        },
      } as unknown as User;

      prisma.user.findUniqueOrThrow.mockResolvedValue(user);
      prismaMock.setPrismaClientMock(prisma);

      mockAuth0Service.getPasswordResetLink.mockResolvedValue({ link: '' });
      mockSendGrid.sendMultiple.mockResolvedValue([]);

      const controller = new UserController();

      await controller.userPasswordReset(req, res, next);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalled();
      expect(mockAuth0Service.getPasswordResetLink).toHaveBeenCalled();
      expect(mockSendGrid.sendMultiple).toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('returns users', async () => {
      const user = {
        id: 1,
        firstName: 'Fred',
        lastName: 'Flintstone',
        roleId: 1,
      } as User;

      prisma.user.findMany.mockResolvedValue([user]);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new UserController();

      await controller.getAllUsers(req, res, next);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('returns user', async () => {
      const user = {
        id: 1,
        firstName: 'Fred',
        lastName: 'Flintstone',
        roleId: 1,
        userOrganizations: [{ id: '1' }],
      } as unknown as User;

      req.auth = { sub: '123' };

      prisma.organization.findFirst.mockResolvedValue({
        id: 'id',
      } as unknown as Organization);
      prisma.user.findFirstOrThrow.mockResolvedValue(user);
      prisma.user.count.mockResolvedValue(1);
      prismaMock.setPrismaClientMock(prisma);

      const controller = new UserController();

      await controller.getMe(req, res, next);
      expect(prisma.user.findFirstOrThrow).toHaveBeenCalled();
    });
  });
});

// test('should get a user', async () => {
//   const user = {
//     id: 2,
//     name: 'Wilma Flintstone',
//     email: 'wilma@flintstones.io',
//   };

//   prismaMock.user.findUnique.mockResolvedValue(user);

//   const controller = new UserController();

//   await expect(controller.getUser(2)).resolves.toEqual(user);
// });

// test('should update a user', async () => {
//   const user = {
//     id: 3,
//     name: 'Pebbles (Peb) Flintstone',
//     email: 'pebbles@flintstones.io',
//   };

//   prismaMock.user.update.mockResolvedValue(user);

//   const controller = new UserController();

//   await expect(
//     controller.updateUser(3, 'Pebbles (Peb) Flintstone', 'pebbles@flinstone.io')
//   ).resolves.toEqual(user);
// });

// test('should delete a user', async () => {
//   const user = {
//     id: 3,
//     name: 'Pebbles Flintstone',
//     email: 'pebbles@flintstones.io',
//   };

//   prismaMock.user.delete.mockResolvedValue(user);

//   const controller = new UserController();

//   await expect(controller.deleteUser(3)).resolves.toEqual(user);
// });
