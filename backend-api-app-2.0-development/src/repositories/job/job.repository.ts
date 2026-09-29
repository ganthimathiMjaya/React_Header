import ContactTypes from '../../utils/enums/contact.types';
import PhoneEmailTypes from '../../utils/enums/phoneEmail.types';
import randomString from '../../utils/randomString';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class JobRepository {
  async findFirst(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findFirst({
      where: {
        id,
      },
      include: {
        User: {
          include: {
            userOrganizations: true,
            userDevices: true,
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });
  }

  async getJob(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findFirst({
      where: { id },
      include: {
        primaryContact: { include: { phone: true } },
        crew: {
          include: {
            CrewUser: {
              include: {
                User: { include: { contact: { include: { phone: true } } } },
              },
            },
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
        User: true,
        photos: true,
        jobType: true,
        disposalSite: {
          include: {
            location: true,
          },
        },
        status: true,
        lastUpdatedBy: true,
        dumpTicket: {
          include: {
            disposalSite: {
              include: { location: { include: { address: true } } },
            },
            wasteType: true,
          },
        },
        booking: true,
        jobSubType: true,
        etaStatus: true,
        Feedback: true,
        OrganizationJobCustomField: {
          include: {
            organizationCustomField: true,
          },
        },
      },
    });
  }

  async getTodayAndTomorrowJobs(orgId: string, today: Date, tomorrow: Date) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
      where: {
        scheduledDate: {
          gte: today, // look for jobs today
          lte: tomorrow, // and tomorrow
        },
      },
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
        jobSubType: true,
        etaStatus: true,
        crew: true,
        nonDumpster: true,
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
        booking: {
          include: {
            photos: true,
          },
        },
        photos: true,
        Feedback: true,
        OrganizationJobCustomField: {
          include: {
            organizationCustomField: true,
          },
        },
      },
    });
  }

  async getStatusCount(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.status.findMany({
      select: {
        id: true,
        _count: {
          select: {
            jobStatus: true,
          },
        },
      },
    });
  }

  async getAllJobs(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
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
        jobSubType: true,
        etaStatus: true,
        crew: true,
        nonDumpster: true,
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
        booking: {
          include: {
            photos: true,
          },
        },
        photos: true,
        Feedback: true,
      },
    });
  }

  async getJobsByDayDiff(
    orgId: string,
    dateRange: { startDate: Date; endDate: Date }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
      where: {
        scheduledDate: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
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
        jobSubType: true,
        etaStatus: true,
        crew: true,
        nonDumpster: true,
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
        booking: {
          include: {
            photos: true,
          },
        },
        photos: true,
        Feedback: true,
      },
    });
  }

  async getJobsByStatus(orgId: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
      where: {
        statusId,
      },
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
        jobSubType: true,
        etaStatus: true,
        crew: true,
        nonDumpster: true,
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
        booking: {
          include: {
            photos: true,
          },
        },
        photos: true,
        Feedback: true,
        Notification: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async updateEtaStatus(orgId: string, id: string, etaStatusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        etaStatusId,
      },
      include: {
        customer: {
          include: {
            customerUser: {
              include: {
                User: {
                  include: {
                    userOrganizations: true,
                    userDevices: true,
                  },
                },
              },
            },
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });
  }

  async restartJob(orgId: string, id: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        statusId,
      },
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
          select: {
            name: true,
          },
        },
        jobSubType: {
          select: {
            name: true,
          },
        },
        crew: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async pushJob(orgId: string, id: string, statusId: number, appNotes: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: { appNotes, statusId },
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
          select: {
            name: true,
          },
        },
        jobSubType: {
          select: {
            name: true,
          },
        },
        crew: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async reportJob(orgId: string, id: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        statusId,
      },
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
          select: {
            name: true,
          },
        },
        jobSubType: {
          select: {
            name: true,
          },
        },
        crew: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async reschedule(
    orgId: string,
    id: string,
    data: { scheduledDate?: Date; timeSlot?: string; statusId?: number }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data,
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
        customer: true,
      },
    });
  }

  async findFirstOrThrow(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findFirstOrThrow({
      where: { id },
    });
  }

  async cancel(orgId: string, id: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        statusId,
      },
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
        customer: true,
        jobSubType: {
          select: {
            name: true,
          },
        },
        crew: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateStatus(orgId: string, id: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        statusId,
        completedAt: new Date(),
      },
      include: {
        customer: {
          include: {
            customerUser: {
              include: {
                User: {
                  include: {
                    userOrganizations: true,
                    userDevices: true,
                  },
                },
              },
            },
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
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
      },
    });
  }

  async updateJobScope(orgId: string, id: string, jobScope: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        jobScope,
      },
      include: {
        customer: {
          include: {
            customerUser: {
              include: {
                User: {
                  include: {
                    userOrganizations: true,
                    userDevices: true,
                  },
                },
              },
            },
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
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
      },
    });
  }

  async update(
    orgId: string,
    id: string,
    body: any,
    thisJob: any,
    geocoding: any[]
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    const hasCurrentCrew = thisJob?.crewId;
    const hasCurrentUser = thisJob?.userId;

    return prisma.job.update({
      where: { id },
      data: {
        ...(body.statusId && {
          status: {
            connect: {
              id: body.statusId,
            },
          },
        }),
        ...(body.completedAt && {
          completedAt: new Date(body.completedAt),
        }),
        ...(body.techReference && {
          techReference: body.techReference,
        }),
        invoiceNotes: body.invoiceNotes,
        internalNotes: body.internalNotes,
        ...(body.dumpsterDropoffId && {
          dumpsterDropoffId: body.dumpsterDropoffId,
        }),
        ...(body.dumpsterDropoffSize && {
          dumpsterDropoffSize: body.dumpsterDropoffSize,
        }),
        ...(body.dumpsterPickupId && {
          dumpsterPickupId: body.dumpsterPickupId,
          dumpsterPickupIdVerified: true,
        }),
        ...(body.dumpsterPickupIdVerified && {
          dumpsterPickupIdVerified: body.dumpsterPickupIdVerified,
        }),
        ...(body.dumpsterPickupSize && {
          dumpsterPickupSize: body.dumpsterPickupSize,
        }),
        ...(body.notes && {
          notes: body.notes,
        }),
        ...(body.areasToService && {
          areasToService: body.areasToService,
        }),
        ...(body.rentalFees && {
          rentalFees: parseFloat(body.rentalFees),
        }),
        paid: body.paid,
        invoiceReady: body.invoiceReady,
        ...(body.paid && { paidDate: new Date() }),
        ...(body.createdById && {
          createdBy: {
            connect: {
              id: body.createdById,
            },
          },
        }),
        // ...(body.userId && body.userId !== 'unassigned'
        //   ? {
        //       User: {
        //         connect: {
        //           id: body.userId,
        //         },
        //       },
        //     }
        //   : {
        //       User: {
        //         disconnect: true,
        //       },
        //     }),
        ...(body.customerId && {
          customer: {
            connect: {
              id: body.customerId,
            },
          },
        }),
        ...(hasCurrentUser &&
          body.userId && {
            ...(String(body.userId).toLowerCase() === 'unassigned'
              ? {
                  User: {
                    disconnect: true,
                  },
                }
              : {
                  User: {
                    connect: {
                      id: body.userId,
                    },
                  },
                }),
          }),
        ...(!hasCurrentUser &&
          body.userId &&
          String(body.userId).toLowerCase() !== 'unassigned' && {
            User: {
              connect: {
                id: body.userId,
              },
            },
          }),
        priority: body.priority,
        timeSlot: body.timeSlot,
        jobScope: body.jobScope,
        windowStart: body.windowStart,
        windowEnd: body.windowEnd,
        jobDuration: body.jobDuration,
        tonnage: body.tonnage,
        loads: body.loads,
        ...(body.disposalSiteId && {
          disposalSite: {
            connect: { id: body.disposalSiteId },
          },
        }),
        ...(body.jobTypeId && {
          jobType: {
            connect: { id: body.jobTypeId },
          },
        }),
        ...(body.jobSubTypeId && {
          jobSubType: {
            connect: { id: body.jobSubTypeId },
          },
        }),
        crewNotes: body.crewNotes,
        appNotes: body.appNotes,
        ...(hasCurrentCrew &&
          body.crewId && {
            ...(String(body.crewId).toLowerCase() === 'unassigned'
              ? {
                  crew: {
                    disconnect: true,
                  },
                }
              : {
                  crew: {
                    connect: {
                      id: body.crewId,
                    },
                  },
                }),
          }),
        ...(!hasCurrentCrew &&
          body.crewId &&
          String(body.crewId).toLowerCase() !== 'unassigned' && {
            crew: {
              connect: {
                id: body.crewId,
              },
            },
          }),
        ...(body.scheduledDate && {
          scheduledDate: new Date(body.scheduledDate),
        }),
        ...(body.poNum && { poNum: body.poNum }),
        ...(body.updatedById && {
          lastUpdatedBy: {
            connect: {
              id: body.updatedById,
            },
          },
        }),
        ...((body.multiFamily === true || body.multiFamily === false) && {
          location: {
            update: {
              multiFamily: body.multiFamily,
            },
          },
        }),
        ...(body.location && {
          location: {
            update: {
              address: {
                update: {
                  line1: body.location.address.line1,
                  line2: body.location.address.line2,
                  city: body.location.address.city,
                  state: body.location.address.state,
                  county: body.location.address.county,
                  zipcode: body.location.address.zipcode,
                },
              },
              ...(body.location.notes && {
                notes: body.location.notes,
              }),
              community: body.location.community,
              ...(geocoding.length > 0 && {
                latitude: geocoding[0].lat,
                longitude: geocoding[0].lng,
              }),
            },
          },
        }),
        ...(body.address && {
          location: {
            update: {
              address: {
                update: {
                  line1: body.address.line1,
                  line2: body.address.line2,
                  city: body.address.city,
                  state: body.address.state,
                  county: body.address.county,
                  zipcode: body.address.zipcode,
                },
              },
            },
          },
        }),
        ...(body.recurringJobEnd && {
          recurringJobEnd: new Date(body.recurringJobEnd),
        }),
        ...(body.recurringJobStart && {
          recurringJobStart: new Date(body.recurringJobStart),
        }),
        clientPay: body.clientPay,
        crewPay: body.crewPay,
        jobScopeMod: body.jobScopeMod,
        ...(body.dumpTicket && {
          dumpTicket: {
            create: {
              dumpster: {
                connect: {
                  id: body.dumpTicket?.dumpsterId,
                },
              },
              disposalSite: {
                connect: {
                  id: body.dumpTicket?.disposalSiteId,
                },
              },
              weight: body.dumpTicket?.weight,
              photos: {
                connect: {
                  id: body.dumpTicket?.photosId,
                },
              },
            },
          },
        }),
        tpNotifiedAt: body.notifyCrew ? new Date() : undefined,
        cmNotifedAt: body.cmUpdatedAt,
        ...(body.onsiteContactFirstName && {
          primaryContact: {
            create: {
              firstName: body.onsiteContactFirstName,
              lastName: body.onsiteContactLastName,
              email: { create: { address: body.onsiteContactEmail } },
              phone: { create: { number: body.onsiteContactPhone } },
              contactTypeId: ContactTypes.SECONDARY,
            },
          },
        }),
        ...(body.jobManagerFirstName && {
          secondaryContact: {
            create: {
              firstName: body.jobManagerFirstName,
              lastName: body.jobManagerLastName,
              email: { create: { address: body.jobManagerEmail } },
              phone: { create: { number: body.jobManagerPhone } },
              contactTypeId: ContactTypes.PRIMARY,
            },
          },
        }),
      },
      include: {
        status: true,
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
        lastUpdatedBy: true,
        jobType: true,
        jobSubType: true,
        createdBy: true,
        User: {
          include: {
            userOrganizations: true,
            userDevices: true,
          },
        },
        crew: {
          include: {
            CrewUser: {
              include: {
                User: { include: { contact: { include: { phone: true } } } },
              },
            },
          },
        },
        primaryContact: {
          include: {
            phone: true,
            email: true,
          },
        },
        dumpTicket: {
          include: {
            disposalSite: true,
          },
        },
        secondaryContact: {
          include: {
            phone: true,
            email: true,
          },
        },
        customer: {
          include: {
            customerUser: {
              include: {
                User: {
                  include: {
                    userOrganizations: true,
                    userDevices: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async adminCreate(
    orgId: string,
    body: any,
    otherFields: {
      bookingProject: any;
      primaryContactId: string;
      secondaryContactId: string;
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    const newDate = new Date(body.scheduledDate);
    return prisma.job.create({
      data: {
        ...(body?.crew && {
          crewId: body?.crew,
        }),
        ...(body.dumpsterDropoffSize && {
          dumpsterDropoffSize: body.dumpsterDropoffSize,
        }),
        ...(body.dumpsterPickupId && {
          dumpsterPickupId: body.dumpsterPickupId,
        }),
        customerId: body.customerId,
        timeSlot: body?.timeSlot,
        poNum: body?.poNum,
        wasteType: body?.wasteType?.toString(),
        projectId: otherFields.bookingProject?.id,
        //TODO: Remove once location foreign key is removed from schema - Danielle
        locationId: otherFields.bookingProject?.locationId,
        createdById: body.createdBy,
        lastUpdatedById: body.createdBy,
        techReference: `C-${randomString(8)}`,
        scheduledDate: newDate, // new Date(body.scheduledDate.toLocaleString()),
        cost: body.cost,
        jobScope: body.jobScope,
        appNotes: body.appNotes,
        crewNotes: body.crewNotes,
        internalNotes: body.internalNotes,
        areasToService: body.areasToService,
        notes: body.notes,
        primaryContactId: otherFields.primaryContactId,
        secondaryContactId: otherFields.secondaryContactId,
        priority: body.highPriority ? 1 : undefined,
        ...(body.recurringJobStart && {
          recurringJobStart: new Date(body.recurringJobStart),
        }),
        ...(body.recurringJobEnd && {
          recurringJobEnd: new Date(body.recurringJobEnd),
        }),
        ...(body.jobTypeId && {
          jobTypeId: body.jobTypeId,
        }),
        ...(body.jobSubTypeId && {
          jobSubTypeId: body.jobSubTypeId,
        }),
        statusId: body.status,
        ...(body.userId && body.userId !== 'unassigned'
          ? {
              userId: body.userId,
            }
          : {
              userId: null,
            }),
      },
      include: {
        User: {
          include: {
            userOrganizations: true,
            userDevices: true,
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });
  }

  async create(orgId: string, body: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.create({
      data: {
        primaryContact: {
          connectOrCreate: {
            where: { id: body.primaryContactId || '' },
            create: {
              firstName: body.primaryContactFirstName,
              lastName: body.primaryContactLastName,
              email: {
                create: {
                  address: body.primaryContactEmail,
                  default: true,
                  typeId: PhoneEmailTypes.PRIMARY,
                },
              },
              phone: {
                create: {
                  number: body.primaryContactPhone,
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

        // If Secondary Contact Information is Provided
        ...((body.secondaryContactId ||
          (body.secondaryContactFirstName &&
            body.secondaryContactLastName &&
            body.secondaryContactPhone &&
            body.secondaryContactEmail)) && {
          secondaryContact: {
            connectOrCreate: {
              where: { id: body.secondaryContactId || '' },
              create: {
                firstName: body.secondaryContactFirstName,
                lastName: body.secondaryContactLastName,
                email: {
                  create: {
                    address: body.secondaryContactEmail,
                    default: true,
                    typeId: PhoneEmailTypes.SECONDARY,
                  },
                },
                phone: {
                  create: {
                    number: body.secondaryContactPhone,
                    default: true,
                    typeId: PhoneEmailTypes.SECONDARY,
                  },
                },
                contactType: {
                  connect: {
                    id: ContactTypes.SECONDARY,
                  },
                },
                active: true,
              },
            },
          },
        }),
        techReference: `C-${randomString(8)}`,
        scheduledDate: new Date(body.scheduledDate),
        jobScope: body.jobScope,
        appNotes: body.note,
        invoiceNotes: body.invoiceNotes,
        timeSlot: body.timeSlot,
        crewNotes: body.crewNotes,
        poNum: body.poNum,
        crewPay: body.crewPay,
        clientPay: body.clientPay,
        ...(body.recurringJobStart && {
          recurringJobStart: new Date(body.recurringJobStart),
        }),
        ...(body.recurringJobEnd && {
          recurringJobEnd: new Date(body.recurringJobEnd),
        }),
        ...(body.dumpsterDropoffSize && {
          dumpsterDropoffSize: body.dumpsterDropoffSize,
        }),
        ...(body.dumpsterDropoffId && {
          dumpsterDropoffId: body.dumpsterDropoffId,
        }),
        ...(body.dumpsterPickupId && {
          dumpsterPickupId: body.dumpsterPickupId,
          dumpsterPickupIdVerified: true,
        }),
        ...(body.dumpsterPickupSize && {
          dumpsterPickupSize: body.dumpsterPickupSize,
        }),
        ...(body.jobSubTypeId && {
          jobSubType: {
            connect: { id: body.jobSubTypeId },
          },
        }),
        wasteType: body?.wasteType,
        ...(body.jobTypeId && {
          jobType: {
            connect: { id: body.jobTypeId },
          },
        }),
        ...(body.disposalSiteId && {
          disposalSite: {
            connect: { id: body.disposalSiteId },
          },
        }),
        ...(body.bookingId && {
          booking: {
            connect: { id: body.bookingId },
          },
        }),
        ...(body.crewId && {
          crew: {
            connect: { id: body.crewId },
          },
        }),
        lastUpdatedBy: {
          connect: {
            id: body.updatedById,
          },
        },

        ...(body.createdBy && {
          createdBy: {
            connect: {
              id: body.createdBy,
            },
          },
        }),
        customer: {
          connect: { id: body.customerId },
        },
        status: {
          connect: { id: body.statusId },
        },
        project: {
          connect: { id: body.projectId },
        },
        //TODO: remove once the location foreign key is removed from the schema - Danielle
        location: {
          connect: { id: body.locationId },
        },
      },
      include: {
        User: {
          include: {
            userOrganizations: true,
            userDevices: true,
          },
        },
        customer: true,
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
        jobType: true,
        jobSubType: true,
        primaryContact: { include: { phone: true, email: true } },
        secondaryContact: { include: { phone: true, email: true } },
        createdBy: { include: { contact: { select: { email: true } } } },
      },
    });
  }

  async updateRentalFess(orgId: string, id: string, rentalFees: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id },
      data: {
        rentalFees,
      },
    });
  }

  async getCompleteJobWithCustomerById(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const completeStatus = await prisma.status.findFirstOrThrow({
      where: {
        content: 'Complete',
      },
    });

    return await prisma.job.findFirst({
      where: {
        id,
        statusId: completeStatus?.id,
        isDiscarded: false,
      },
      include: {
        jobSubType: {
          include: {
            taxRate: true,
          },
        },
        customer: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
            customerUser: {
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
            },
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });
  }

  async getCompleteJobsWithCustomerById(orgId: string, ids: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    const completeStatus = await prisma.status.findFirstOrThrow({
      where: {
        content: 'Complete',
      },
    });

    return await prisma.job.findMany({
      where: {
        id: { in: ids },
        statusId: completeStatus?.id,
        isDiscarded: false,
      },
      include: {
        User: true,
        jobType: true,
        OrganizationJobCustomField: {
          include: {
            organizationCustomField: {
              include: {
                organizationCustomFieldCategory: true,
              },
            },
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
        jobSubType: {
          include: {
            taxRate: true,
          },
        },
        customer: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
            customerUser: {
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
            },
          },
        },
        project: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });
  }

  async discardJob(orgId: string, jobId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.update({
      where: { id: jobId },
      data: {
        isDiscarded: true,
      },
    });
  }

  async getCustomerIdFromJob(orgId: string, jobId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.job.findUniqueOrThrow({
      where: { id: jobId },
      select: {
        customerId: true,
      },
    });
  }

  async createCustomFields(orgId: string, data: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationJobCustomField.createMany({
      data: data,
    });
  }

  async updateStatusesForJobs(
    orgId: string,
    jobIds: string[],
    statusId: number
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.updateMany({
      where: {
        id: { in: jobIds },
      },
      data: {
        statusId,
      },
    });
  }

  async updateJobCustomFields(orgId: string, customFields: any[]) {
    const prisma = getPrismaClientForTenant(orgId);
    const result = await Promise.all(
      customFields.map(async (customField: any) => {
        await prisma.organizationJobCustomField.update({
          where: {
            id: customField.id,
          },
          data: {
            value: customField.value,
          },
        });
      })
    );
    return { result };
  }

  async getJobCustomFields(orgId: string, customFieldIds: number[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationJobCustomField.findMany({
      where: {
        id: {
          in: customFieldIds,
        },
        isDeleted: false,
      },
      include: {
        organizationCustomField: true,
      },
    });
  }
}
