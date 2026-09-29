import { Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { PhotoSource, PhotoType } from '@prisma/client';
import {
  ExtendedPrismaClient,
  getPrismaClientForTenant,
  prismaClientBypass,
} from '../../utils/prisma/multiTenancyPrisma.client';
import JobStatus from '../../utils/enums/job.status';

export default class DisposalSiteController {
  public async getWasteTypes() {
    return prismaClientBypass.wasteType.findMany();
  }

  public async getAllDisposalSites(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    return prisma.disposalSite.findMany({
      include: {
        location: {
          include: {
            address: true,
          },
        },
        // @ts-ignore
        contact: {
          include: { phone: true, email: true },
        },
      },
    });
  }

  public async getDisposalSite(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    return prisma.disposalSite.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
        // @ts-ignore
        contact: {
          include: { phone: true, email: true },
        },
      },
    });
  }

  public async createDisposalSite(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    return prisma.disposalSite.create({
      data: {
        location: {
          create: {
            name: req.body.name,
            address: {
              create: {
                line1: req.body.location.address.line1,
                line2: req.body.location.address.line2,
                city: req.body.location.address.city,
                state: req.body.location.address.state,
                county: req.body.location.address.county,
                zipcode: req.body.location.address.zipcode,
                active: true,
              },
            },
            community: '',
            notes: req.body.location.notes,
          },
        },
        greenFlag: req.body.greenFlag,
        ...(req.body.contact && {
          contact: {
            create: {
              active: true,
              firstName: req.body.contact.firstName,
              lastName: req.body.contact.lastName,
              contactType: {
                connect: {
                  id: 1,
                },
              },
              phone: {
                create: {
                  number: req.body.contact.phone || '',
                  typeId: 1,
                  default: true,
                },
              },
              email: {
                create: {
                  address: req.body.contact.email || '',
                  typeId: 1,
                  default: true,
                },
              },
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
        // @ts-ignore
        contact: {
          include: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  public async updateDisposalSite(req: Request, res: Response) {
    const prisma: ExtendedPrismaClient = getPrismaClientForTenant(
      res.locals.orgId
    );
    const updatedDisposalSite = await prisma.disposalSite.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(req.body.location && {
          location: {
            update: {
              name: req.body.name,
              ...(req.body.location.address && {
                address: {
                  update: {
                    line1: req.body.location.address.line1,
                    line2: req.body.location.address.line2,
                    city: req.body.location.address.city,
                    state: req.body.location.address.state,
                    county: req.body.location.address.county,
                    zipcode: req.body.location.address.zipcode,
                    active: req.body.location.address.active,
                  },
                },
              }),
              community: req.body.location.community,
              notes: req.body.location.notes,
            },
          },
        }),
        greenFlag: req.body.greenFlag,
        ...(req.body.contact && {
          contact: {
            connectOrCreate: {
              where: { id: req.body.contact.id },
              active: true,
              firstName: req.body.contact.firstName,
              lastName: req.body.contact.lastName,
              contactType: {
                connect: {
                  id: 1,
                },
              },
              phone: {
                create: {
                  number: req.body.contact.phone || '',
                  typeId: 1,
                  default: true,
                },
              },
              email: {
                create: {
                  address: req.body.contact.email || '',
                  typeId: 1,
                  default: true,
                },
              },
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
        // @ts-ignore
        contact: {
          include: {
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).send(updatedDisposalSite);
  }

  public async updateDisposalSiteContact(req: JWTRequest, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    let updatedDisposalSite;
    if (req.body.action === 'remove') {
      updatedDisposalSite = await prisma.disposalSite.update({
        where: { id: Number(req.params.id) },
        data: {
          ...(req.body.contact && {
            contact: {
              disconnect: {
                id: req.body.contact.id,
              },
            },
          }),
        },
        include: {
          // @ts-ignore
          contact: {
            include: {
              email: true,
              phone: true,
            },
          },
        },
      });
      res.status(201).send(updatedDisposalSite);
      return;
    }

    if (req.body.contact.id === '') {
      updatedDisposalSite = await prisma.disposalSite.update({
        where: { id: Number(req.params.id) },
        data: {
          ...(req.body.contact && {
            contact: {
              create: {
                active: true,
                firstName: req.body.contact.firstName,
                lastName: req.body.contact.lastName,
                contactType: {
                  connect: {
                    id: 1,
                  },
                },
                phone: {
                  create: {
                    number: req.body.contact.phone || '',
                    typeId: 1,
                    default: true,
                  },
                },
                email: {
                  create: {
                    address: req.body.contact.email || '',
                    typeId: 1,
                    default: true,
                  },
                },
              },
            },
          }),
        },
        include: {
          // @ts-ignore
          contact: {
            include: {
              email: true,
              phone: true,
            },
          },
        },
      });

      res.status(201).send(updatedDisposalSite);
      return;
    }

    updatedDisposalSite = await prisma.disposalSite.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(req.body.contact && {
          contact: {
            update: {
              where: { id: req.body.contact.id },
              data: {
                active: true,
                firstName: req.body.contact.firstName,
                lastName: req.body.contact.lastName,
                contactType: {
                  connect: {
                    id: 1,
                  },
                },
                phone: {
                  update: {
                    number: req.body.contact.phone || '',
                    typeId: 1,
                    default: true,
                  },
                },
                email: {
                  update: {
                    address: req.body.contact.email || '',
                    typeId: 1,
                    default: true,
                  },
                },
              },
            },
          },
        }),
      },
      include: {
        // @ts-ignore
        contact: {
          include: {
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).send(updatedDisposalSite);
    return;
  }

  public async uploadFile(req: any, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    // @ts-ignore
    const locationFile = await prisma.files.create({
      data: {
        url: req.file.location,
        type: req.body.type,
        Location: {
          connect: {
            id: req.params.id,
          },
        },
        description: req.body.description || '',
      },
    });
    res.status(202).send({
      url: req.file.location,
    });
    return;
  }

  public async updateDumpTicket(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const updated = await prisma.dumpTicket.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(req.body.weight && {
          weight: Number(req.body.weight),
        }),
        ...(req.body.disposalSite && {
          disposalSite: {
            connect: { id: req.body.disposalSite },
          },
        }),
        ...((req.body.customerId || req.body.dumpsterSize) && {
          job: {
            update: {
              customerId: req.body.customerId,
              dumpsterPickupSize: req.body.dumpsterSize,
            },
          },
        }),
        ...(req.body.wasteType && {
          wasteType: {
            connect: { id: req.body.wasteType },
          },
        }),
      },
    });

    return updated;
  }
}
