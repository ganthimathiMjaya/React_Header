import {
  PrismaClient,
  Contact,
  Email,
  Phone
} from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, res, next } from '../../utils/tests/express.mock';
import ContactController from './contact.controller';
import * as faker from '@faker-js/faker';

describe('Contact Controller', () => {
  const prisma = mockDeep<PrismaClient>();

  describe('getContacts', () => {
    it('returns contacts for customerId', async () => {

      prismaMock.setPrismaClientMock(prisma);

      const controller = new ContactController();
      const customerId = faker.faker.datatype.uuid();
      req.params = { customerId };
      await controller.getContacts(req, res, next);

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
	expect.objectContaining({
	  where: {
	    active: true,
	    customerId,
	  },
	  include: {
	    email: true,
	    phone: true,
	  }
	})
      );
    });
  });

  describe('createContact', () => {
    it('creates a contact and related objects', async () => {

      prismaMock.setPrismaClientMock(prisma);

      const mockNewContact = {
	active: true,
	firstName: faker.faker.random.word(),
	lastName: faker.faker.random.word(),
	email: faker.faker.internet.email(),
	phone: faker.faker.phone.number(),
	contactTypeId: 1
      } as unknown as Contact;

      const controller = new ContactController();
      const customerId = faker.faker.datatype.uuid();
      req.params = { customerId };
      req.body = mockNewContact;
      await controller.createContact(req, res, next); 

      expect(prisma.contact.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateContact', () => {
    it('updates a contact and related objects', async () => {

      prismaMock.setPrismaClientMock(prisma);

      const mockUpdateContact = {
	active: true,
	firstName: faker.faker.random.word(),
	lastName: faker.faker.random.word(),
	email: faker.faker.internet.email(),
	phone: faker.faker.phone.number(),
	contactTypeId: 1
      } as unknown as Contact;

      const controller = new ContactController();
      const contactId = faker.faker.datatype.uuid();
      const customerId = faker.faker.datatype.uuid();
      req.params = { customerId, contactId };
      req.body = mockUpdateContact;
      await controller.updateContact(req, res, next);

      expect(prisma.contact.update).toHaveBeenCalledTimes(1);
      expect(prisma.email.update).toHaveBeenCalledTimes(1);
      expect(prisma.phone.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteContact', () => {
    it('soft deletes a contact', async () => {
      
      prismaMock.setPrismaClientMock(prisma);

      const controller = new ContactController();
      const customerId = faker.faker.datatype.uuid();
      const contactId = faker.faker.datatype.uuid();
      req.params = { customerId, contactId };
      await controller.deleteContact(req, res, next);

      expect(prisma.contact.update).toHaveBeenCalledWith(
	expect.objectContaining({
	  where: {
	    id: contactId,
	  },
	  data: {
	    active: false 
	  }
	})
      );
    });
  });
});
