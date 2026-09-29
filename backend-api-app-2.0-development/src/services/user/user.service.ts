import {
  getPrismaClientForTenant,
  ExtendedPrismaClient,
} from '../../utils/prisma/multiTenancyPrisma.client';
import { Prisma, User } from '@prisma/client';
import Role from '../../utils/enums/roles';
import UserRepository from '../../repositories/user/user.repository';
import OrganizationController from '../../controllers/organization/organization.controller';
import { Auth0Service } from '../auth0/auth0.service';
import {
  sendUserWelcomeEmail,
  sendAdminUserWelcomeEmail,
} from '../../utils/email/send.confirmation';
import { generateRandomUUID } from '../../utils/password/password.util';
import TextController from '../../controllers/text/text.controller';

const repository = new UserRepository();
const auth0Service = new Auth0Service();
const textController = new TextController();
const orgService = new OrganizationController();

const DOWNLOAD_APP_ANDROID = `https://play.google.com/store/apps/details?id=${
  process.env.ANDROID_APP_NAME || 'com.scrapit'
}`;

const DOWNLOAD_APP_APPLE = `https://apps.apple.com/us/app/${
  process.env.APPLE_APP_NAME || 'scrap-it-clients'
}/${process.env.APPLE_APP_ID || 'id1637160049'}`;

const WEB_APP_URL =
  process.env.FRONT_END_URL || 'https://dialexa-qa-frontend.onrender.com';

export type AdminWithEmail = Prisma.AdminGetPayload<{
  include: {
    User: {
      include: {
        contact: {
          include: {
            email: true;
          };
        };
      };
    };
  };
}>;

export class UserService {
  public async getAllUsers(orgId: string) {
    return repository.getAllUsers(orgId);
  }

  public async createUser(orgId: string, body: any) {
    const user = await repository.createUser(orgId, body);
    return user;
    //Send call to generate email to scrap-it admin
    // let recipientList: string[] = await getInternalContactList();
    // let templateData = {
    //   subject: `New user created: ${req.body.email}`,
    //   user: {
    //     userName: String(req.body.email),
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     createdAt: String(user.createdAt),
    //   },
    // };
    // sendUserEmail(recipientList, templateData);
  }

  public async sendPasswordResetNotice(
    user: any,
    ticketUrl: string,
    email: string,
    orgId: string
  ) {
    if (!user.contact?.email?.isFake) {
      await this.sendPasswordResetEmail(ticketUrl, user, email);
    } else {
      const orgName = user.userOrganizations[0].tenantOrganization?.name;
      const number = `+1${user.contact.phone?.number}`;
      const text = `Welcome to ${orgName}!. Your new username is: ${user.username}, please reset your password using the following link: ${ticketUrl} \nAfter resetting your password, please download the application and login using your assigned username and new password. For Android users: ${DOWNLOAD_APP_ANDROID} \n
      For Apple users: ${DOWNLOAD_APP_APPLE} `;
      textController.sendText(orgId, text, number);
    }
  }

  public async sendPasswordResetEmail(
    passwordResetLink: string,
    user: any,
    email: string
  ) {
    const recipientList: string[] = [email];
    const orgName = user.userOrganizations[0].tenantOrganization?.name;
    const templateData = {
      subject: `Welcome to ${orgName}!, please reset your password`,
      user: {
        userName: user.username || '',
        firstName: user.firstName,
        lastName: user.lastName,
        company: orgName,
        androidLink: DOWNLOAD_APP_ANDROID,
        appleLink: DOWNLOAD_APP_APPLE,
        webPortal: WEB_APP_URL,
        passwordResetLink,
      },
    };
    if (user.roleId === Role.ADMIN) {
      await sendAdminUserWelcomeEmail(recipientList, templateData);
    } else {
      await sendUserWelcomeEmail(recipientList, templateData);
    }
  }

  public async getMe(id: string, orgId: string, roleId: number) {
    const existingOrg = await repository.getOrg(orgId);
    const isExistingUser = (await repository.getUserCount(orgId, id)) > 0;

    if (!existingOrg) {
      await orgService.initOrg(orgId);
    }

    if (!isExistingUser && id) {
      const auth0User = await auth0Service.getUser(id);
      const newUser = await this.createUser(orgId, {
        auth_id: id,
        roleId,
        email: auth0User.email,
        username: auth0User.username,
      });
      const roleName: string = Role[roleId];
      const body = { userId: newUser.id };
      //Can only create admins since crewId and customerId are not available here.
      if (roleName === 'ADMIN') {
        await this.createUserOnRole(orgId, roleName, body);
      }
      return newUser;
    } else {
      const user: any = await repository.findFirstOrThrow(orgId, id);
      if (user.roleId != roleId) {
        user.roleId = roleId;
        await repository.updateUserRole(orgId, id, roleId);
      }

      if (user?.userOrganizations?.length == 0) {
        await orgService.initUserOrg(user.id, orgId);
      }
      if (user?.roleId === Role.ADMIN && !user.admins?.length) {
        //Create admin record for current org.
        await repository.createAdmin(orgId, user.id);
      }
      return user;
    }
  }

  public async getUserByAuthId(orgId: string, authId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.user.findUniqueOrThrow({
      where: { auth_id: authId },
      include: {
        contact: {
          include: {
            email: true,
            phone: true,
          },
        },
        userOrganizations: {
          include: {
            tenantOrganization: true,
          },
        },
      },
    });
  }

  public async getUserRole(orgId: string, authId: string): Promise<string> {
    const user = await this.getUserByAuthId(orgId, authId);
    return Role[user.roleId];
  }

  public isUserCrewMember(user: User | undefined): boolean {
    if (user) {
      return [Role.CREWMEMBER].includes(user.roleId);
    }
    return false;
  }

  public isCrew(user: User | undefined): boolean {
    if (user) {
      return [Role.CREWMEMBER, Role.CREWMANAGER].includes(user.roleId);
    }
    return false;
  }

  public isCustomer(user: User | undefined): boolean {
    if (user) {
      return [Role.CUSTOMER].includes(user.roleId);
    }
    return false;
  }

  public isUserCustomer(user: User | undefined): boolean {
    if (user) {
      return [Role.CUSTOMER].includes(user.roleId);
    }
    return false;
  }

  public isCrewRoleTypeId(roleId: number): boolean {
    if (roleId) {
      return [Role.CREWMEMBER, Role.CREWMANAGER].includes(roleId);
    }
    return false;
  }

  public autoGenerateEmail(
    orgId: string,
    firstName: string,
    lastName: string
  ): string {
    const orgName = 'scrappy.com';
    const last4 = orgId.slice(-4);
    const random = generateRandomUUID().slice(-4);
    return `auto-generated.${firstName.replace(/\s/g, '')}.${lastName.replace(
      /\s/g,
      ''
    )}.${last4}.${random}@${orgName}`.toLowerCase();
  }

  public async getAllAdmins(orgId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.admin.findMany({
      include: {
        User: true,
      },
    });
  }

  public async getAllAdminsWithEmails(orgId: string) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(orgId);
    return prisma.admin.findMany({
      include: {
        User: {
          include: {
            contact: {
              include: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  public async deactivateUser(orgId: string, id: number) {
    await repository.deactivateUser(orgId, id);
  }

  public async reactivateUser(orgId: string, id: number) {
    await repository.reactivateUser(orgId, id);
  }

  async addPushToken(orgId: string, authId: string, pushToken: string) {
    const user = await repository.getUserByAuthIdOrThrow(orgId, authId);
    //Check if record already exists
    const userDevice = await repository.getUserDevice(
      orgId,
      user.id,
      pushToken
    );
    if (!userDevice) {
      //Make sure no other user is pointing to same device (edge cases)
      await repository.removeAllOtherDevicesBypass(pushToken);
      return repository.createUserDevice(orgId, user.id, pushToken);
    }
    return userDevice;
  }

  async removePushToken(orgId: string, authId: string, pushToken: string) {
    const user = await repository.getUserByAuthIdOrThrow(orgId, authId);
    return repository.removeUserDevice(orgId, user.id, pushToken);
  }

  async allowNotifications(
    orgId: string,
    authId: string,
    isPushNotificationAllowed: boolean
  ) {
    const user = await repository.getUserByAuthIdOrThrow(orgId, authId);
    return repository.updateUserPushNotificationSettings(
      orgId,
      user.id,
      isPushNotificationAllowed
    );
  }

  async isUsernameUnique(orgId: string, username: string) {
    const users = await repository.findUsersByUsername(orgId, username);
    return users.length ? false : true;
  }

  async isEmailUnique(orgId: string, email: string) {
    const user = await repository.findUsersByEmail(orgId, email);
    return user ? false : true;
  }

  async createUserOnRole(orgId: string, roleName: string, body: any) {
    switch (roleName) {
      case 'CREWMEMBER':
      case 'CREWMANAGER':
        return await repository.setCrewUser(orgId, body.userId, body.crewId);
        break;
      case 'CUSTOMER':
        return await repository.setCustomerUser(
          orgId,
          body.userId,
          body.customerId
        );
        break;
      case 'ADMIN':
        return await repository.setAdminUser(orgId, body.userId);
        break;
    }
  }

  async updateUserInfo(orgId: string, userId: number, body: any) {
    const roleName = Role[body.roleId];
    if (!roleName) {
      throw new Error('Invalid RoleId');
    }
    await repository.updateUserInfo(orgId, userId, body);
    switch (roleName) {
      case 'CREWMEMBER':
      case 'CREWMANAGER':
        if (!body.crewId) throw new Error('Missing crewId');
        return await repository.updateCrewUser(orgId, userId, body.crewId);
        break;
      case 'CUSTOMER':
        if (!body.customerId) throw new Error('Missing customerId');
        return await repository.updateCustomerUser(
          orgId,
          userId,
          body.customerId
        );
        break;
      case 'ADMIN':
        break;
    }
  }
}
