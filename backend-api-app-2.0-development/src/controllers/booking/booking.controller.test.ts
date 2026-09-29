import sendConfirmationEmail from '../../utils/email/send.confirmation';
jest.mock('../../utils/email/send.confirmation');

import { s3Client } from '../../shared/s3Client';
jest.mock('../../shared/s3Client');

import {
  PrismaClient,
  Project,
  Booking,
  Location,
  Address,
  Photos,
} from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, res, next } from '../../utils/tests/express.mock';
import BookingController from './booking.controller';
import * as faker from '@faker-js/faker';
import { mockGeocoder } from '../../utils/geocoder/geocoder.mock';

describe('Booking Controller', () => {
  const prisma = mockDeep<PrismaClient>();
  const mockedS3Client = jest.mocked(s3Client, true);

  const mockProjects = [
    {
      id: faker.faker.datatype.uuid(),
      orgId: faker.faker.random.word(),
      customerId: faker.faker.datatype.uuid(),
      name: faker.faker.random.word(),
      isActive: true,
    },
    {
      id: faker.faker.datatype.uuid(),
      orgId: faker.faker.random.word(),
      customerId: faker.faker.datatype.uuid(),
      name: faker.faker.random.word(),
      isActive: false,
    },
  ] as Array<Project>;

  const mockAddress = {
    id: faker.faker.datatype.uuid(),
    name: faker.faker.random.word(),
    line1: faker.faker.random.word(),
    line2: faker.faker.random.word(),
    city: faker.faker.random.word(),
    state: faker.faker.random.word(),
    zipCode: faker.faker.random.word(),
  } as unknown as Address;

  const mockLocation = {
    id: faker.faker.datatype.uuid(),
    address: mockAddress,
  } as unknown as Location;

  const mockBooking = {
    id: faker.faker.datatype.uuid(),
    jobs: [
      {
        id: faker.faker.datatype.uuid(),
        scheduledDate: faker.faker.date.future(),
        location: mockLocation,
        customer: {
          name: faker.faker.random.word(),
        },
      },
    ],
  } as unknown as Booking;

  const mockBookingPhotos = [
    {
      id: faker.faker.datatype.uuid(),
      url: faker.faker.random.word(),
    },
    {
      id: faker.faker.datatype.uuid(),
      url: faker.faker.random.word(),
    },
  ] as unknown as Array<Photos>;

  describe('createCustomerBooking', () => {
    it('creates bookings', async () => {
      const body = {
        primaryContactId: faker.faker.datatype.uuid(),
        secondaryContactId: faker.faker.datatype.uuid(),
        projectId: faker.faker.datatype.uuid(),
        address: faker.faker.random.word(),
        address2: faker.faker.random.word(),
        city: faker.faker.random.word(),
        state: faker.faker.random.word(),
        zipCode: faker.faker.random.word(),
        county: faker.faker.random.word(),
        source: faker.faker.random.word(),
        jobs: [{}, {}],
      };

      process.env.SEND_EMAIL = '';
      prisma.project.findUnique.mockResolvedValue(mockProjects[0]);
      prisma.booking.create.mockResolvedValue(mockBooking);
      prisma.photos.findMany.mockResolvedValue(mockBookingPhotos);
      prisma.admin.findMany.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new BookingController();
      const customerId = faker.faker.datatype.uuid();
      req.body = body;
      await controller.createCustomerBooking(
        req,
        res as Response,
        { customerUser: { userId: faker.faker.datatype.uuid() } },
        { id: customerId }
      );

      expect(prisma.project.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.project.create).toHaveBeenCalledTimes(0);
    });

    it('creates project and bookings', async () => {
      const body = {
        primaryContactId: faker.faker.datatype.uuid(),
        secondaryContactId: faker.faker.datatype.uuid(),
        address: faker.faker.random.word(),
        address2: faker.faker.random.word(),
        city: faker.faker.random.word(),
        state: faker.faker.random.word(),
        zipCode: faker.faker.random.word(),
        county: faker.faker.random.word(),
        source: faker.faker.random.word(),
        jobs: [{}, {}],
      };

      process.env.SEND_EMAIL = '';
      prisma.project.create.mockResolvedValue(mockProjects[0]);
      prisma.booking.create.mockResolvedValue(mockBooking);
      prisma.photos.findMany.mockResolvedValue(mockBookingPhotos);
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.location.create.mockResolvedValue(mockLocation);
      prisma.organizationJobCustomField.createMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.setPrismaClientMock(prisma);

      const controller = new BookingController();
      const customerId = faker.faker.datatype.uuid();
      req.body = body;
      await controller.createCustomerBooking(
        req,
        res as Response,
        { customerUser: { userId: faker.faker.datatype.uuid() } },
        { id: customerId }
      );

      expect(prisma.project.findUnique).toHaveBeenCalledTimes(0);
      expect(prisma.project.create).toHaveBeenCalledTimes(1);
    });
  });
});
