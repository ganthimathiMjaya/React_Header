import ContactTypes from '../../utils/enums/contact.types';
import PhoneEmailTypes from '../../utils/enums/phoneEmail.types';
import {
  prismaClientBypass,
  getPrismaClientForTenant,
  ExtendedPrismaClient,
} from '../../utils/prisma/multiTenancyPrisma.client';

export default class UserRepository {
  public async findFirst(orgId: string, id: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.user.findFirst({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  public async getAllUsers(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.user.findMany({
      where: { userOrganizations: { some: {} } },
      include: {
        role: true,
        customerUser: {
          include: {
            Customer: true,
          },
        },
        crewUser: {
          include: {
            Crew: {
              include: {
                type: true,
              },
            },
          },
        },
        contact: {
          include: {
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  public async getUser(orgId: string, id: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.user.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contact: {
          select: {
            id: true,
            email: {
              select: {
                address: true,
              },
            },
            phone: {
              select: {
                number: true,
              },
            },
          },
        },
        roleId: true,
        role: {
          select: {
            description: true,
          },
        },
        active: true,
      },
      where: {
        id: {
          equals: id,
        },
      },
    });
  }

  public async findFirstOrThrow(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.user.findFirstOrThrow({
      where: { auth_id: id },
      include: {
        role: true,
        admins: true,
        contact: { include: { email: true, phone: true } },
        crewUser: { include: { Crew: true } },
        customerUser: { include: { Customer: true } },
        Job: {
          include: {
            project: {
              include: {
                location: {
                  include: {
                    address: true,
                  },
                },
              },
            },
            customer: {
              include: {
                customerUser: {
                  include: {
                    User: {
                      include: {
                        contact: {
                          include: {
                            email: true,
                            phone: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            jobType: true,
            crew: true,
            primaryContact: {
              include: {
                email: true,
                phone: true,
              },
            },
            secondaryContact: {
              include: {
                email: true,
                phone: true,
              },
            },
            status: true,
            User: true,
            booking: true,
            photos: true,
          },
        },
        userOrganizations: { include: { tenantOrganization: true } },
      },
    });
  }

  public async getUserCount(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.user.count({
      where: { auth_id: id },
    });
  }

  public async updateUserRole(orgId: string, id: string, roleId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.user.update({
      where: { auth_id: id },
      data: {
        roleId,
      },
    });
  }

  public async deactivateUser(orgId: string, userId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    await prisma.user.update({
      data: {
        active: false,
      },
      where: {
        id: userId,
      },
    });
  }

  public async reactivateUser(orgId: string, userId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    await prisma.user.update({
      data: {
        active: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async getUserByAuthIdOrThrow(orgId: string, authId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.user.findUniqueOrThrow({
      where: { auth_id: authId },
    });
  }

  async createAdmin(orgId: string, userId: number) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.admin.create({
      data: {
        userId,
        admin_level: 1,
      },
    });
  }

  async createUser(orgId: string, body: any) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.user.create({
      data: {
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        username: body.username ?? '',
        active: body.active ?? true,
        auth_id: body.auth_id,
        role: {
          connect: {
            id: body.roleId,
          },
        },
        contact: {
          create: {
            firstName: body.firstName ?? '',
            lastName: body.lastName ?? '',
            email: {
              create: {
                address: body.email ?? '',
                default: true,
                typeId: PhoneEmailTypes.PRIMARY,
                isFake: body.isFakeEmail ?? false,
              },
            },
            phone: {
              create: {
                number: body.phoneNumber ?? '',
                default: true,
                typeId: PhoneEmailTypes.PRIMARY,
              },
            },
            contactType: {
              connect: {
                id: ContactTypes.PRIMARY,
              },
            },
            active: true,
          },
        },
        userOrganizations: {
          create: {
            isDeleted: false,
          },
        },
      },
      include: {
        userOrganizations: {
          include: {
            tenantOrganization: true,
          },
        },
        contact: {
          include: {
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  async createUserDevice(
    orgId: string,
    userId: number,
    pushNotificationToken: string
  ) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.userDevice.create({
      data: { userId, pushNotificationToken },
    });
  }

  async removeAllOtherDevicesBypass(pushNotificationToken: string) {
    return prismaClientBypass.userDevice.deleteMany({
      where: { pushNotificationToken },
    });
  }

  async getUserDevice(
    orgId: string,
    userId: number,
    pushNotificationToken: string
  ) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.userDevice.findFirst({
      where: {
        userId,
        pushNotificationToken,
      },
    });
  }

  async removeUserDevice(
    orgId: string,
    userId: number,
    pushNotificationToken: string
  ) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.userDevice.deleteMany({
      where: { pushNotificationToken, userId },
    });
  }

  async updateUserPushNotificationSettings(
    orgId: string,
    userId: number,
    isPushNotificationAllowed: boolean
  ) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.userOrganization.updateMany({
      where: { userId, orgId },
      data: {
        isPushNotificationAllowed,
      },
    });
  }

  async findUsersByUsername(orgId: string, username: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.user.findMany({
      where: { username },
      select: { id: true },
    });
  }

  async findUsersByEmail(orgId: string, email: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.user.findFirst({
      where: { contact: { is: { email: { is: { address: email } } } } },
      select: { id: true },
    });
  }

  async setCrewUser(orgId: string, userId: number, crewId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        crewUser: {
          create: {
            crewId,
            userId,
          },
        },
      },
    });
  }

  async setCustomerUser(orgId: string, userId: number, customerId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        customerUser: {
          create: {
            userId,
            customerId,
          },
        },
      },
    });
  }

  async setAdminUser(orgId: string, userId: number, admin_level = 1) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        admins: {
          create: {
            admin_level,
          },
        },
      },
    });
  }

  async findFirstOrgAdmin(orgId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.admin.findFirst({
      where: { orgId },
    });
  }

  async getOrg(orgId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.organization.findFirst({
      where: { id: orgId },
    });
  }

  async updateUserInfo(orgId: string, userId: number, body: any) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        active: body.active,
      },
    });
  }

  async updateCustomerUser(orgId: string, userId: number, customerId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        customerUser: {
          update: {
            customerId,
          },
        },
      },
    });
  }

  async updateCrewUser(orgId: string, userId: number, crewId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        crewUser: {
          update: {
            crewId,
          },
        },
      },
    });
  }
}
