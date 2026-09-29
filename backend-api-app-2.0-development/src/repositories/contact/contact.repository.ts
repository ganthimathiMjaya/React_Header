import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class ContactRepository {
  async getContactsForCustomer(orgId: string, customerId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return prisma.contact.findMany({
      where: {
        customerId,
        active: true,
      },
      include: {
        email: true,
        phone: true,
      },
    });
  }

  async create(
    orgId: string,
    customerId: string,
    body: any,
    email: any,
    phone: any
  ) {
    const prisma = getPrismaClientForTenant(orgId);

    return prisma.contact.create({
      data: {
        ...body,
        customerId,
        email: {
          create: email,
        },
        phone: {
          create: phone,
        },
      },
      include: {
        email: true,
        phone: true,
      },
    });
  }

  async update(
    orgId: string,
    customerId: string,
    contactId: string,
    body: any,
    email: any,
    phone: any
  ) {
    const prisma = getPrismaClientForTenant(orgId);

    await prisma.email.update({
      where: {
        contactId,
      },
      data: email,
    });

    await prisma.phone.update({
      where: {
        contactId,
      },
      data: phone,
    });

    return prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        ...body,
      },
      include: {
        email: true,
        phone: true,
      },
    });
  }

  async delete(orgId: string, customerId: string, contactId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        active: false,
      },
    });
  }
}
