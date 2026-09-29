import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

const getNewScrappySyncTokenJobSubType = async (orgId: string, id: number) => {
  const prisma = getPrismaClientForTenant(orgId);
  const currentJobSubType = await prisma.jobSubType.findFirst({
    where: { id },
  });
  let scrappySyncToken = undefined;
  if (currentJobSubType?.scrappySyncToken) {
    scrappySyncToken = (
      Number(currentJobSubType.scrappySyncToken) + 1
    ).toString();
  }
  return scrappySyncToken;
};
export default class ServicesManagementRepository {
  public async getAllJobTypes(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.jobType.findMany({
      select: {
        id: true,
        shortDescription: true,
        // description: true,
        // isOnBookingPortal: true,
        possibleSubTypes: {
          where: {
            isDeleted: false,
          },
        },
      },
      where: {
        isDeleted: {
          equals: false,
        },
        orgId: {
          equals: orgId,
        },
      },
    });
  }

  public async getJobType(orgId: string, jobTypeId: number) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.jobType.findFirst({
      select: {
        id: true,
        shortDescription: true,
        // description: true,
        // isOnBookingPortal: true,
        possibleSubTypes: true,
      },
      where: {
        isDeleted: {
          equals: false,
        },
        possibleSubTypes: {
          every: {
            isDeleted: {
              equals: false,
            },
          },
        },
        orgId: {
          equals: orgId,
        },
        id: {
          equals: jobTypeId,
        },
      },
    });
  }

  public async getJobSubType(orgId: string, jobSubTypeId: number) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.jobSubType.findFirst({
      where: {
        isDeleted: {
          equals: false,
        },
        id: {
          equals: jobSubTypeId,
        },
      },
    });
  }

  public async getAllJobSubTypes(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.jobSubType.findMany({
      where: {
        isDeleted: {
          equals: false,
        },
      },
      include: {
        jobType: true,
        taxRate: {
          select: {
            name: true,
            taxRatePercent: true,
          },
        },
      },
    });
  }

  public async addJobSubType(
    orgId: string,
    jobSubType: {
      name: string;
      description: string;
      isOnBookingPortal: boolean;
      jobTypeId?: number;
      jobType?: string;
      cost?: number;
      taxRateId?: number;
      isTaxable?: boolean;
      qbIncomeAccountRef?: string;
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);

    return prisma.jobSubType.create({
      data: {
        orgId: orgId,
        name: jobSubType.name,
        description: jobSubType.description,
        isOnBookingPortal: jobSubType.isOnBookingPortal,
        jobTypeId: jobSubType.jobTypeId,
        cost: jobSubType.cost,
        taxRateId: jobSubType.taxRateId,
        isTaxable: jobSubType.isTaxable,
        qbIncomeAccountRef: jobSubType.qbIncomeAccountRef,
      },
    });
  }

  public async addJobType(orgId: string, shortDescription: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobType.create({
      data: {
        orgId,
        shortDescription,
      },
    });
  }

  public async updateJobType(
    orgId: string,
    jobType: {
      id: number;
      description: string;
      shortDescription: string;
      isOnBookingPortal: boolean;
      jobSubTypes: {
        id: number;
        name: string;
        description: string;
        cost?: number;
        additionalNotes?: string;
        qbIncomeAccountRef?: string;
        taxRateId?: number;
        isTaxable?: boolean;
        isDeleted?: boolean;
      }[];
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.$transaction(async function (tx) {
      jobType.jobSubTypes.forEach(async function (item) {
        if (item.id === undefined || item.id === null || item.id === 0) {
          await tx.jobSubType.create({
            data: {
              jobTypeId: jobType.id,
              name: item.name,
              description: item.description,
              cost: item.cost,
              // additionalNotes: item.additionalNotes,
              taxRateId: item.taxRateId,
              isTaxable: item.isTaxable,
              qbIncomeAccountRef: item.qbIncomeAccountRef,
            },
          });
        } else {
          //Increment sync token
          const scrappySyncToken = await getNewScrappySyncTokenJobSubType(
            orgId,
            item.id
          );
          await tx.jobSubType.update({
            where: {
              id: item.id,
            },
            data: {
              name: item.name,
              scrappySyncToken,
              description: item.description,
              cost: item.cost,
              // additionalNotes: item.additionalNotes,
              taxRateId: item.taxRateId,
              isTaxable: item.isTaxable,
              isDeleted: item.isDeleted,
            },
          });
        }
      });

      await tx.jobType.update({
        data: {
          // description: jobType.description,
          shortDescription: jobType.shortDescription,
          // isOnBookingPortal: jobType.isOnBookingPortal,
        },
        where: {
          id: jobType.id,
        },
      });
    });
  }

  // Latest updateJobSubType
  public async updateJobSubType(
    orgId: string,
    jobSubType: {
      id: number;
      description: string;
      name: string;
      isOnBookingPortal: boolean;
      jobTypeId: number | null;
      isTaxable: boolean;
      qbIncomeAccountRef: string | null;
      cost: number;
      taxRateId: number | null;

      jobType: {
        id: number;
        isDeleted: boolean;
        orgId: string;
        shortDescription: string;
      } | string | null;
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.$transaction(async function (tx) {
      // Handle JobType (categories)
      if(typeof jobSubType.jobType === 'string' && jobSubType.jobTypeId === null) {
        let jobType = await tx.jobType.create({
          data: {
            shortDescription: jobSubType.jobType,
            orgId: orgId
          },
        });

      await tx.jobSubType.update({
          data: {
            jobTypeId: jobType.id,
          },
          where: {
            id: jobSubType.id,
          }
        })

      } else {
          await tx.jobSubType.update({
            data: {
              jobTypeId: jobSubType.jobTypeId,
            },
            where: {
              id: jobSubType.id,
            }
          })
      }
      //Increment sync token
      const scrappySyncToken = await getNewScrappySyncTokenJobSubType(
        orgId,
        jobSubType.id
      );
      // Update the rest of jobSubType
      await tx.jobSubType.update({
        where: {
          id: jobSubType.id
        },
        data: {
          description: jobSubType.description,
          name: jobSubType.name,
          isOnBookingPortal: jobSubType.isOnBookingPortal,
          isTaxable: jobSubType.isTaxable,
          qbIncomeAccountRef: jobSubType.qbIncomeAccountRef,
          cost: jobSubType.cost,
          taxRateId: jobSubType.taxRateId,
          scrappySyncToken: scrappySyncToken
        }
      })

    })
  }

  public async findAllJobSubTypeQbIdNull(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.findMany({
      where: {
        qbId: null,
        qbIncomeAccountRef: {
          not: null,
        },
      },
    });
  }

  public async findAllJobSubTypeQbIdNotNull(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.findMany({
      where: {
        qbId: {
          not: null,
        },
      },
    });
  }

  // DEPRECATE. Leaving this in for now so quickbook functions don't break. 
  public async updateOldJobSubType(
    orgId: string,
    jobSubTypeId: number,
    data: any
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.update({
      where: {
        id: jobSubTypeId,
      },
      data: data,
    });
  }

  public async deleteJobType(orgId: string, jobTypeId: number) {
    const prisma = getPrismaClientForTenant(orgId);

    const jobSubTypes = await prisma.jobSubType.findMany({
      where: {
        jobTypeId: {
          equals: jobTypeId,
        },
      },
    });

    await prisma.$transaction(async (tx) => {
      jobSubTypes.forEach(async function (item) {
        //Increment sync token
        const scrappySyncToken = await getNewScrappySyncTokenJobSubType(
          orgId,
          item.id
        );
        await tx.jobSubType.update({
          data: {
            isDeleted: true,
            scrappySyncToken,
          },
          where: {
            id: item.id,
          },
        });
      });

      await tx.jobType.update({
        data: {
          isDeleted: true,
        },
        where: {
          id: jobTypeId,
        },
      });
    });
  }

  public async deleteJobSubType(orgId: string, jobSubTypeId: number) {
    const prisma = getPrismaClientForTenant(orgId);

    //Increment sync token
    const scrappySyncToken = await getNewScrappySyncTokenJobSubType(
      orgId,
      jobSubTypeId
    );
    await prisma.jobSubType.update({
      data: {
        isDeleted: true,
        scrappySyncToken,
      },
      where: {
        id: jobSubTypeId,
      },
    });
  }

  async findAllQbIdMatches(orgId: string, qbIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.findMany({
      select: {
        qbId: true,
      },
      where: {
        qbId: {
          in: qbIds,
        },
      },
    });
  }

  async findAllServiceNames(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        qbId: null,
      },
    });
  }

  async createJobSubType(orgId: string, data: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.create({
      data,
    });
  }

  async getJobTypeByName(orgId: string, name: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobType.findFirst({
      where: {
        shortDescription: name,
      },
    });
  }

  async createJobType(orgId: string, data: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobType.create({
      data,
    });
  }

  async getRandomTaxRate(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationTaxRate.findFirst();
  }
}
