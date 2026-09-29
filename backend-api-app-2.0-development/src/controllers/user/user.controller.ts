import { Request, Response, NextFunction } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import ContactTypes from '../../utils/enums/contact.types';
import PhoneEmailTypes from '../../utils/enums/phoneEmail.types';
import { generateRandomPassword } from '../../utils/password/password.util';
import {
  sendUserEmail,
  sendUserDeleteEmail,
} from '../../utils/email/send.confirmation';
import {
  ExtendedPrismaClient,
  getPrismaClientForTenant,
} from '../../utils/prisma/multiTenancyPrisma.client';
import { UserService } from '../../services/user/user.service';
import { Auth0Service, connection } from '../../services/auth0/auth0.service';
import Role from '../../utils/enums/roles';
import { getAdminRecipients } from '../../utils/email/email.util';

const service = new UserService();
const auth0Service = new Auth0Service();

export default class UserController {
  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await service.getAllUsers(res.locals.orgId);
      return res.status(200).json(users);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in UserController.getAllUsers',
      });
    }
  }

  public async getUser(id: number, orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.user.findUnique({
      where: { id: id },
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

  public async getMe(req: JWTRequest, res: Response, next: NextFunction) {
    try {
      if (req.auth && req.auth.sub) {
        const id = req.auth.sub;
        const orgId = res.locals?.orgId;
        const roleId = res.locals?.roleId;
        const me = await service.getMe(id, orgId, roleId);
        return res.status(201).json(me);
      } else {
        return res.status(500);
      }
    } catch (error: any) {
      //Swallow exception to account for issue in the UI.
      console.error(`Error in UserController.getMe: ${error}`);
      if (error.code !== 'P2002') {
        console.log('Error', error);
        return res.status(500).json(error);
      }
    }
  }

  public async updateLastLogin(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    return prisma.user.update({
      where: {
        // @ts-ignore
        auth_id: req.params.auth_id,
      },
      data: {
        // @ts-ignore
        lastLogin: new Date().toDateString(),
      },
    });
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      //TODO: validate if user already exists for a different organization. Auth0 returns status code 409 conflict if so.
      // In that case, a new userOrgRecord is required and assign a new role only for this org.
      const orgId = res.locals?.orgId;
      const roleName = Role[req.body?.roleId];
      if (!roleName) {
        return res.status(400).json({ error: 'invalid roleId' });
      }
      //Get auth0 role
      const auth0Role = await auth0Service.getRoleByName(roleName);
      if (!auth0Role || !auth0Role.id) {
        return res
          .status(400)
          .json({ error: `RoleName does not exist in auth0: ${roleName}` });
      }
      let email = req.body.email;
      let username = req.body.username;
      let password = req.body.password;
      if (!email) {
        email = await service.autoGenerateEmail(
          res.locals.orgId,
          req.body.firstName,
          req.body.lastName
        );
        req.body.isFakeEmail = true;
        req.body.email = email;
      } else {
        req.body.email = req.body.email.toLowerCase();
        req.body.isFakeEmail = false;
      }
      if (!username) {
        //Default username to phoneNumber, if not provided.
        username = req.body.phoneNumber;
        req.body.username = username;
      }
      if (!password) {
        //Auto-generate random password
        password = generateRandomPassword();
        req.body.password = password;
      }
      const auth0User = await auth0Service.createUser(
        orgId,
        {
          email,
          given_name: req.body.firstName,
          family_name: req.body.lastName,
          connection,
          password,
          verify_email: false,
          username,
        },
        auth0Role.id
      );
      //Set Auth0 authId
      req.body.auth_id = auth0User.user_id;

      //Get password reset link
      const passwordResetLink = await auth0Service.getPasswordResetLink(
        orgId,
        email
      );

      const user = await service.createUser(orgId, req.body);
      req.body.userId = user.id;
      const userOnRole = await service.createUserOnRole(
        orgId,
        roleName,
        req.body
      );

      await service.sendPasswordResetNotice(
        user,
        passwordResetLink?.ticket || '',
        email,
        orgId
      );

      return res.status(201).json(user);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in UserController.createUser',
      });
    }
  }

  public async userPasswordReset(
    req: JWTRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const orgId = res.locals.orgId;
      const user = await service.getUserByAuthId(orgId, req.body.authId || '');
      const email = user.contact?.email?.address || '';

      //Get password reset link
      const passwordResetLink = await auth0Service.getPasswordResetLink(
        orgId,
        email
      );
      await service.sendPasswordResetNotice(
        user,
        passwordResetLink?.ticket || '',
        email,
        orgId
      );
      return res.status(201).json({ status: 'sent' });
    } catch (error: any) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in UserController.userPasswordReset',
      });
    }
  }

  public async updateUser(req: Request, res: Response) {
    //TODO: check if role was changed, update it on Auth0. Consider other fields such as password (may be better to have a separate endpoint).
    //check if ANY auth0 value was changed. password, role, username (consider cases where username if phone number and now it's changed), firstName, lastName. Email should not be editable.
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    let user = {};

    if (req.body.customerId) {
      //Undefined roleId means that user is being assigned customer
      if (req.body.roleId !== 2 && req.body.roleId !== undefined) {
        res.status(500);
        return { body: 'Error with customer role type' };
      }
      await prisma.user.update({
        where: { id: Number(req.params.userId) },
        data: { roleId: 2 },
      });

      user = await prisma.user.update({
        where: { id: Number(req.params.userId) },
        data: {
          customerUser: {
            create: {
              userId: Number(req.params.userId),
              customerId: req.body.customerId,
            },
          },
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          contact: {
            update: {
              email: {
                update: {
                  address: req.body.email,
                },
              },
              phone: {
                update: {
                  number: req.body.number,
                },
              },
            },
          },
        },
        include: {
          contact: {
            include: {
              email: true,
              phone: true,
            },
          },
          customerUser: true,
        },
      });
    }

    if (req.body.crewId) {
      //Undefined roleId means that user is being assigned crew
      if (req.body.roleId !== 3 && req.body.roleId !== undefined) {
        res.status(500);
        return { body: 'Error with crew role type' };
      }
      await prisma.user.update({
        where: { id: Number(req.params.userId) },
        data: { roleId: 3 },
      });

      user = await prisma.user.update({
        where: { id: Number(req.params.userId) },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          contact: {
            update: {
              email: {
                update: {
                  address: req.body.email,
                },
              },
              phone: {
                update: {
                  number: req.body.number,
                },
              },
            },
          },
          crewUser: {
            create: {
              crewId: req.body.crewId,
              userId: Number(req.params.userId),
            },
          },
        },
        include: {
          contact: {
            include: {
              email: true,
              phone: true,
            },
          },
          crewUser: true,
        },
      });
    }

    if (!req.body.customerId && !req.body.crewId) {
      const userdata = await prisma.user.findUnique({
        where: { id: Number(req.params.userId) },
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
      if (userdata?.contact !== null) {
        user = await prisma.user.update({
          where: { id: Number(req.params.userId) },
          data: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            roleId: req.body.roleId,
            contact: {
              update: {
                email: {
                  update: {
                    address: req.body.email,
                  },
                },
                phone: {
                  update: {
                    number: req.body.number,
                  },
                },
              },
            },
          },
          include: {
            contact: {
              include: {
                email: true,
                phone: true,
              },
            },
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: Number(req.params.userId) },
          data: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            roleId: req.body.roleId,
            contact: {
              create: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: {
                  create: {
                    address: req.body.email || '',
                    default: true,
                    typeId: PhoneEmailTypes.PRIMARY,
                  },
                },
                phone: {
                  create: {
                    number: req.body.number || '',
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
          },
          include: {
            contact: {
              include: {
                email: true,
                phone: true,
              },
            },
          },
        });
      }
    }

    res.status(200);
    return user;
  }

  public async updateUserInfo(req: Request, res: Response, next: NextFunction) {
    //TODO: check if role was changed, update it on Auth0. Consider other fields such as password (may be better to have a separate endpoint).
    //check if ANY auth0 value was changed. password, role, username (consider cases where username if phone number and now it's changed), firstName, lastName. Email should not be editable.
    const userId = +req.params.userId;
    try {
      await service.updateUserInfo(res.locals.orgId, userId, req.body);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in UserController.updateUserInfo',
      });
    }
  }

  public async linkSignup(req: JWTRequest, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    if (req.auth && req.auth.sub && req.auth.sub.includes('auth0|')) {
      const user = await prisma.user.update({
        where: { auth_id: req.auth.sub },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        },
        include: { contact: { include: { email: true } } },
      });

      res.status(201);
      return user;
    }
  }

  public async getCrewUsers(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const users = prisma.crewUser.findMany({
      where: { crewId: req.params.crewId },
      include: { User: true },
    });

    if (users) {
      return users;
    }
  }

  public async updateUserRole(req: Request, res: Response) {
    //TODO: check if role was changed, update it on Auth0. Consider other fields such as password (may be better to have a separate endpoint).
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const updatedUser = prisma.user.update({
      where: { id: Number(req.params.userId) },
      data: {
        roleId: Number(req.body.roleId),
      },
    });

    if (updatedUser) {
      res.status(200);
      return updatedUser;
    }
  }

  public async updateUserCompany(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    switch (req.body.role) {
      case 'CREWMEMBER':
        const crewMemberUser = await prisma.crewUser.findFirst({
          where: { userId: Number(req.params.userId) },
        });

        if (crewMemberUser) {
          const crewUserId = await prisma.crewUser.update({
            where: { id: crewMemberUser.id },
            data: {
              crewId: req.body.companyId,
            },
          });

          await prisma.user.update({
            where: { id: Number(req.params.userId) },
            data: {
              crewUserId: crewUserId.id,
            },
          });
        } else {
          const newCrewUser = await prisma.crewUser.create({
            data: {
              userId: Number(req.params.userId),
              crewId: req.body.companyId,
            },
          });

          await prisma.user.update({
            where: { id: Number(req.params.userId) },
            data: {
              crewUserId: newCrewUser.id,
            },
          });
        }

        break;

      case 'CREWMANAGER':
        const crewAdminUser = await prisma.crewUser.findFirst({
          where: { userId: Number(req.params.userId) },
        });

        if (crewAdminUser) {
          const crewUserId = await prisma.crewUser.update({
            where: { id: crewAdminUser.id },
            data: {
              crewId: req.body.companyId,
            },
          });

          await prisma.user.update({
            where: { id: Number(req.params.userId) },
            data: {
              crewUserId: crewUserId.id,
            },
          });
        } else {
          const newCrewUser = await prisma.crewUser.create({
            data: {
              userId: Number(req.params.userId),
              crewId: req.body.companyId,
            },
          });

          await prisma.user.update({
            where: { id: Number(req.params.userId) },
            data: {
              crewUserId: newCrewUser.id,
            },
          });
        }

        break;

      case 'CUSTOMER':
        const foundCU = await prisma.customerUser.findFirst({
          where: { userId: Number(req.params.userId) },
        });

        if (foundCU) {
          await prisma.customerUser.update({
            where: { id: foundCU.id },
            data: {
              customerId: req.body.companyId,
              userId: Number(req.params.userId),
            },
          });

          await prisma.user.update({
            where: { id: Number(req.params.userId) },
            data: {
              customerUserId: foundCU.id,
            },
          });
        } else {
          const newCustomerUser = await prisma.customerUser.create({
            data: {
              userId: Number(req.params.userId),
              customerId: req.body.companyId,
            },
          });

          await prisma.user.update({
            where: { id: Number(req.params.userId) },
            data: {
              customerUserId: newCustomerUser.id,
            },
          });
        }

        break;

      default:
        break;
    }

    return res.status(200);
  }

  public async userDelete(req: Request, res: Response) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(
      res.locals.orgId
    );
    let text = `Account Deletion Request`;
    const response = await prisma.user.findFirst({
      where: { auth_id: req.body.auth_id },
      include: {
        role: true,
        contact: { include: { email: true } },
        crewUser: { include: { Crew: true } },
        customerUser: { include: { Customer: true } },
      },
    });

    const adminsWithEmails = await service.getAllAdminsWithEmails(
      res.locals.orgId
    );
    const adminEmails = getAdminRecipients(adminsWithEmails);

    const companyName = response?.customerUser?.Customer;
    let templateData = {
      subject: text,
      customer: {
        userName: response?.contact?.email?.address!,
        firstName: response?.firstName!,
        lastName: response?.lastName!,
        company: companyName?.name!,
        userId: req.body.auth_id,
      },
    };

    sendUserDeleteEmail(adminEmails, templateData);
  }

  public async deactivateUser(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    await service.deactivateUser(res.locals.orgId, userId);
  }

  public async reactivateUser(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    await service.reactivateUser(res.locals.orgId, userId);
  }

  async addPushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userDevice = await service.addPushToken(
        res.locals.orgId,
        res.locals.userAuthId,
        req.body.pushToken
      );
      res.json(userDevice);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in UserController.addPushToken',
      });
    }
  }

  async removePushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await service.removePushToken(
        res.locals.orgId,
        res.locals.userAuthId,
        req.body.pushToken
      );
      res.json(results);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in UserController.removePushToken',
      });
    }
  }

  async allowNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await service.allowNotifications(
        res.locals.orgId,
        res.locals.userAuthId,
        req.body.allowNotifications
      );
      res.json(results);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in UserController.allowNotifications',
      });
    }
  }
}
