import { Request, Response, NextFunction } from 'express';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';
import Role from '../../utils/enums/roles';
import { CustomerService } from '../../services/customer/customer.service';

const service = new CustomerService();

export default class CustomerController {
  public async getAllCustomers(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findMany({
      include: {
        location: {
          include: {
            address: true,
          },
        },
        createdBy: {
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
    });
  }

  public async getCustomer(
    orgId: string,
    id: string,
    skipJobs?: string | undefined,
    takeJobs?: string | undefined
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    const skip = skipJobs ? Number(skipJobs) : 0;
    const take = takeJobs ? Number(takeJobs) : 0;
    const customer = prisma.customer.findUnique({
      where: { id: id },
      include: {
        jobs: {
          ...(skip !== 0 && { skip: skip }),
          ...(take !== 0 && { take: take }),
          select: {
            id: true,
            timeSlot: true,
            booking: {
              include: {
                bookedBy: {
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
            windowStart: true,
            windowEnd: true,
            project: {
              include: {
                location: {
                  include: {
                    address: true,
                  },
                },
              },
            },
            appNotes: true,
            primaryContact: { include: { email: true, phone: true } },
            secondaryContact: { include: { email: true, phone: true } },
            windowCount: true,
            poNum: true,
            denoteEpo: true,
            jobScope: true,
            areasToService: true,
            jobType: true,
            totalSqFt: true,
            jobTypeId: true,
            jobSubType: true,
            jobSubTypeId: true,
            status: true,
            scheduledDate: true,
            dumpsterDropoffSize: true,
            updatedAt: true,
            createdAt: true,
            techReference: true,
            // @ts-ignore
            invoiceContactEmailAddress: true,
            etaStatus: true,
            etaStatusId: true,
            photos: true,
          },
        },
      },
    });
    return customer;
  }

  public async createCustomer(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    let userId = req.body.userId;
    let auth0Id = false;
    let user;

    if (req.body.userId.includes('auth0|')) {
      user = await prisma.user.findFirst({
        where: { auth_id: userId },
        include: {
          contact: {
            include: {
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(400);
      }

      userId = user.id;

      auth0Id = true;
    }

    const customer = await prisma.customer.create({
      data: {
        name: req.body.name,
        createdBy: {
          connect: {
            id: userId,
          },
        },
        ...(req.body.notes && { notes: req.body.notes }),
        customerUser: {
          create: {
            userId: userId,
          },
        },
        ...(req.body.location && {
          location: {
            create: {
              name: req.body.name,
              address: {
                create: {
                  line1: req.body.location.address.line1 || '',
                  line2: req.body.location.address.line2 || '',
                  city: req.body.location.address.city || '',
                  state: req.body.location.address.state || '',
                  county: req.body.location.address.county || '',
                  zipcode: req.body.location.address.zipcode || '',
                  active: true,
                },
              },
              community: req.body.location.community || '',
            },
          },
        }),
        billingAddressLine1: req.body.billingAddressLine1,
        billingAddressLine2: req.body.billingAddressLine2,
        billingCity: req.body.billingCity,
        billingState: req.body.billingState,
        billingZipcode: req.body.billingZipcode,
        billingEmail: req.body.billingEmail,
        billingPhone: req.body.billingPhone,
        terms: req.body.terms,
        customerBillingNotes: req.body.customerBillingNotes,
        sameAsCompanyAddress: req.body.sameAsCompanyAddress,
      },
      include: {
        customerUser: true,
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (customer) {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          roleId: Role.CUSTOMER,
        },
      });
      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          customerUser: {
            connect: { id: customer.customerUser[0].id },
          },
        },
      });

      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          customerUser: {
            connect: { id: customer.customerUser[0].id },
          },
        },
      });

      res.status(201);
      return customer;
    }

    return;
  }

  public async adminCreateCustomer(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    let userId = req.body.userId;
    let auth0Id = false;
    let user;

    user = await prisma.user.findFirst({
      where: { id: req.body.userId },
      include: {
        contact: {
          include: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400);
    }

    let terms = 30;
    if (
      req.body.terms !== undefined &&
      req.body.terms !== null &&
      req.body.terms !== ''
    ) {
      try {
        terms = parseInt(req.body.terms);
      } catch {
        return res.status(400).json('Terms provided is not a number.');
      }
    }

    userId = user.id;

    const customer = await prisma.customer.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        active: true,
        customerBillingNotes: req.body.customerBillingNotes,
        terms: terms,
        createdBy: {
          connect: {
            id: userId,
          },
        },
        ...(req.body.notes && { notes: req.body.notes }),
        ...(req.body.location && {
          location: {
            create: {
              name: req.body.name,
              address: {
                create: {
                  line1: req.body.location.address.line1 || '',
                  line2: req.body.location.address.line2 || '',
                  city: req.body.location.address.city || '',
                  state: req.body.location.address.state || '',
                  county: req.body.location.address.county || '',
                  zipcode: req.body.location.address.zipcode || '',
                  active: true,
                },
              },
              community: req.body.location.community || '',
            },
          },
        }),
        billingAddressLine1: req.body.billingAddressLine1,
        billingAddressLine2: req.body.billingAddressLine2,
        billingCity: req.body.billingCity,
        billingState: req.body.billingState,
        billingZipcode: req.body.billingZipcode,
        billingEmail: req.body.billingEmail,
        billingPhone: req.body.billingPhone,
        sameAsCompanyAddress: req.body.sameAsCompanyAddress,
      },
      include: {
        customerUser: true,
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (customer) {
      res.status(201);
      return customer;
    }

    return;
  }

  public async getNewScrappySyncToken(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const currentCustomer = await prisma.customer.findFirst({
      where: { id },
    });
    let scrappySyncToken = undefined;
    if (currentCustomer?.scrappySyncToken) {
      scrappySyncToken = (
        Number(currentCustomer.scrappySyncToken) + 1
      ).toString();
    }
    return scrappySyncToken;
  }

  public async updateCustomer(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);

    let terms = 30;
    if (
      req.body.terms !== undefined &&
      req.body.terms !== null &&
      req.body.terms !== ''
    ) {
      try {
        terms = parseInt(req.body.terms);
      } catch {
        return res.status(400).json('Terms provided is not a number.');
      }
    }
    //Increment sync token
    const scrappySyncToken = await this.getNewScrappySyncToken(
      res.locals.orgId,
      req.params.id
    );
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        scrappySyncToken,
        location: {
          update: {
            name: req.body.name,
            address: {
              update: {
                line1: req.body.location.address.line1,
                line2: req.body.location.address.line2,
                city: req.body.location.address.city,
                state: req.body.location.address.state,
                county: req.body.location.address.county,
                zipcode: req.body.location.address.zipcode,
              },
            },
            community: req.body.location.community,
          },
        },
        notes: req.body.notes,
        bulkComplete: req.body.flags.bulkComplete,
        active: req.body.flags.active,
        customerBillingNotes: req.body.customerBillingNotes,
        terms: terms,
        billingAddressLine1: req.body.billingAddressLine1,
        billingAddressLine2: req.body.billingAddressLine2,
        billingCity: req.body.billingCity,
        billingState: req.body.billingState,
        billingZipcode: req.body.billingZipcode,
        billingEmail: req.body.billingEmail,
        billingPhone: req.body.billingPhone,
        sameAsCompanyAddress: req.body.sameAsCompanyAddress,
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (customer) {
      res.status(200);
      return customer;
    }

    return;
  }

  public async getCrewAssignment(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const assignment = await prisma.crewAssignment.findFirst({
      where: {
        AND: [
          { customerId: req.params.customerId },
          { jobTypeId: Number(req.params.jobTypeId) },
        ],
      },
    });

    if (assignment) {
      res.status(200);
      return assignment;
    } else {
      res.status(204);
    }
  }

  public async removeAutoAssignment(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const assignment = await prisma.crewAssignment.findFirst({
      where: {
        AND: [
          { customerId: req.params.customerId },
          { jobTypeId: Number(req.params.jobTypeId) },
        ],
      },
    });
  }

  public async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getMetrics(
        res.locals.orgId,
        req.params.customerId
      );
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next({
        error,
        errorPath: 'Error in CustomerController.getMetrics',
      });
    }
  }
}
