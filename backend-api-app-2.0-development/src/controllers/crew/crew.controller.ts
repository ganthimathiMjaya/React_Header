import { Request, Response } from 'express';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';
import Role from '../../utils/enums/roles';
import { sendCrewEmail } from '../../utils/email/send.confirmation';

export default class CrewController {
  public async getAllCrews(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.crew.findMany({
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  public async getCrew(
    orgId: string,
    id: string,
    skipJobs?: string | undefined,
    takeJobs?: string | undefined
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    const skip = skipJobs ? Number(skipJobs) : 0;
    const take = takeJobs ? Number(takeJobs) : 0;
    const crew = prisma.crew.findUnique({
      where: { id: id },
      include: {
        jobs: {
          ...(skip !== 0 && { skip: skip }),
          ...(take !== 0 && { take: take }),
          select: {
            id: true,
            priority: true,
            booking: {
              select: {
                scheduledDate: true,
              },
            },
            primaryContact: {
              select: {
                firstName: true,
                lastName: true,
                address: {
                  select: {
                    line1: true,
                    line2: true,
                    line3: true,
                    city: true,
                    state: true,
                    zipcode: true,
                  },
                },
              },
            },
            secondaryContact: {
              select: {
                firstName: true,
                lastName: true,
                address: {
                  select: {
                    line1: true,
                    line2: true,
                    line3: true,
                    city: true,
                    state: true,
                    zipcode: true,
                  },
                },
              },
            },
            windowStart: true,
            windowEnd: true,
            timeSlot: true,
            customer: {
              select: {
                name: true,
              },
            },
            locationId: true,
            location: {
              select: {
                name: true,
                community: true,
                address: {
                  select: {
                    line1: true,
                    line2: true,
                    line3: true,
                    city: true,
                    state: true,
                    zipcode: true,
                  },
                },
              },
            },
            project: {
              include: {
                location: {
                  select: {
                    name: true,
                    community: true,
                    address: {
                      select: {
                        line1: true,
                        line2: true,
                        line3: true,
                        city: true,
                        state: true,
                        zipcode: true,
                      },
                    },
                  },
                },
              },
            },
            disposalSite: { include: { location: true } },
            dumpTicket: {
              include: {
                disposalSite: true,
                wasteType: true,
              },
            },
            photos: true,
            jobScope: true,
            scheduledDate: true,
            status: true,
            jobType: true,
            jobSubType: true,
            updatedAt: true,
            createdAt: true,
            dumpsterDropoffSize: true,
            dumpsterPickupId: true,
            dumpsterPickupIdVerified: true,
            etaStatus: true,
            etaStatusId: true,
          },
          // where: {
          //   NOT: {
          //     statusId: {
          //       select: {
          //         content: "COMPLETE"
          //       }
          //     },
          //   },
          // },
        },
      },
    });
    return crew;
  }

  public async createCrew(req: Request, res: Response) {
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

    const crew = await prisma.crew.create({
      data: {
        name: req.body.name,
        active: true,
        createdBy: {
          connect: {
            id: userId,
          },
        },
        ...(req.body.type && {
          type: {
            connect: { id: req.body.type },
          },
        }),
        ...(req.body.notes && { notes: req.body.notes }),
        CrewUser: {
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
      },
      include: {
        CrewUser: true,
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (crew) {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          roleId: Role.CREWMANAGER,
        },
      });
      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          crewUser: {
            connect: { id: crew.CrewUser[0].id },
          },
        },
      });

      res.status(201);
      return crew;
    }

    return;
  }

  public async updateCrew(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    let location;
    if (req.body.location?.id) {
      location = await prisma.location.update({
        where: { id: req.body.location.id },
        data: {
          address: {
            update: {
              line1: req.body.location.address.line1,
              line2: req.body.location.address.line2,
              city: req.body.location.address.city,
              state: req.body.location.address.state,
              zipcode: req.body.location.address.zipcode,
            },
          },
        },
      });
    }

    const crew = await prisma.crew.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        typeId: req.body.type,
        locationId: location?.id,
        notes: req.body.notes,
        capacity: req.body.capacity,
        active: req.body.flags.active,
        email: req.body.email,
        phone: req.body.phone,
        healthAndSafetyExpiry: req.body.healthAndSafetyExpiry
          ? new Date(req.body.healthAndSafetyExpiry)
          : undefined,
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
        type: true,
      },
    });

    if (crew) {
      res.status(200);
      return crew;
    }

    return;
  }

  public async adminCreateCrew(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    let userId = req.body.userId;

    const crew = await prisma.crew.create({
      data: {
        name: req.body.name,
        active: true,
        healthAndSafetyExpiry: req.body.healthAndSafetyExpiry
          ? new Date(req.body.healthAndSafetyExpiry)
          : undefined,
        email: req.body.email,
        phone: req.body.phone,
        capacity: req.body.capacity,
        createdBy: {
          connect: {
            id: userId,
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
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (crew) {
      res.status(201);
      return crew;
    }

    return;
  }
}
