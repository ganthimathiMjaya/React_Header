import getSpecificDaysAgo from '../../utils/dates/dates';
import { prismaClientBypass } from '../../utils/prisma/multiTenancyPrisma.client';

export default class ScheduledNotificationRepository {
  prisma = prismaClientBypass;

  async getNewLicensees() {
    console.log(
      'Retrieving list of licensees that have never received an monthly insights email...'
    );
    const newLicensees = await this.prisma.user.findMany({
      select: {
        id: true,
        userOrganizations: {
          select: {
            orgId: true,
          },
        },
        contact: {
          select: {
            email: {
              select: {
                address: true,
              },
            },
          },
        },
      },
      where: {
        role: {
          description: {
            equals: 'ADMIN',
          },
        },
        active: {
          equals: true,
        },
        insightsJobDetails: {
          none: {},
        },
        createdAt: {
          lte: getSpecificDaysAgo(29),
        },
      },
    });
    console.log(
      `Retrieved a total of ${newLicensees.length} licensees that have never received a monthly insights email.`
    );
    return newLicensees;
  }

  async getExistingLicensees() {
    console.log(
      'Retrieving list of licensees that have not received an email in the past 30 days...'
    );
    const existingLicensees = await this.prisma.insightsJobDetail.findMany({
      select: {
        user: {
          select: {
            id: true,
            contact: {
              select: {
                email: {
                  select: {
                    address: true,
                  },
                },
              },
            },
            userOrganizations: {
              select: {
                orgId: true,
              },
            },
          },
        },
      },
      where: {
        user: {
          role: {
            description: {
              equals: 'ADMIN',
            },
          },
          active: {
            equals: true,
          },
        },
        createdAt: {
          gte: getSpecificDaysAgo(30),
          lt: getSpecificDaysAgo(29),
        },
        isDeleted: {
          equals: false,
        },
      },
    });
    console.log(
      `Retrieved a total of ${existingLicensees.length} licensees that have not received a rolling 30 day email.`
    );
    return existingLicensees;
  }

  async getFailedInsights() {
    console.log(
      'Retrieving monthly insights emails that failed within the last 5 days...'
    );
    let failedInsights = await this.prisma.insightsJobDetail.findMany({
      select: {
        adminUserId: true,
        user: {
          select: {
            contact: {
              select: {
                email: {
                  select: {
                    address: true,
                  },
                },
              },
            },
          },
        },
        orgId: true,
        id: true,
        insightsJobHeaderId: true,
      },
      where: {
        failureDate: {
          gte: getSpecificDaysAgo(5),
          lt: getSpecificDaysAgo(0),
        },
        isDeleted: {
          equals: false,
        },
      },
    });
    console.log(
      `Retrieved a total of ${failedInsights.length} monthly insights emails that failed within the last 5 days.`
    );
    return failedInsights;
  }

  async updateJobDetailStatusById(id: number, statusCode: string) {
    const status = await this.getInsightsJobStatus(statusCode);

    await this.prisma.insightsJobDetail.update({
      data: {
        insightsJobStatusId: status?.id,
        updatedAt: new Date(),
      },
      where: {
        id: id,
      },
    });

    console.log(
      `Updated Job Detail record with ID of ${id} to status with code of ${statusCode}.`
    );
  }

  async updateJobHeaderStatusById(id: number, statusCode: string) {
    const status = await this.getInsightsJobStatus(statusCode);

    await this.prisma.insightsJobHeader.update({
      data: {
        insightsJobStatusId: status?.id,
        updatedAt: new Date(),
      },
      where: {
        id: id,
      },
    });

    console.log(
      `Updated Job Header record with ID of ${id} to status with code of ${statusCode}.`
    );
  }

  async setFailedInsightsJobDetails(detailId: number) {
    await this.updateJobDetailStatusById(detailId, 'FAIL');

    await this.prisma.insightsJobDetail.update({
      data: {
        failureDate: new Date(),
        updatedAt: new Date(),
      },
      where: {
        id: detailId,
      },
    });

    console.log(
      `Updated Job Detail record with ID of ${detailId} to status with code of FAIL.`
    );
  }

  async getInsightsJobStatus(statusCode: string) {
    const status = await this.prisma.insightsJobStatus.findFirst({
      where: {
        code: {
          equals: statusCode,
        },
        isDeleted: {
          equals: false,
        },
      },
    });

    return status;
  }

  async determineIfInsightsJobDetailAlreadyProcessed(userId: number) {
    return await this.prisma.insightsJobDetail.count({
      where: {
        adminUserId: {
          equals: userId,
        },
        createdAt: {
          gte: getSpecificDaysAgo(0),
        },
        isDeleted: {
          equals: false,
        },
      },
    });
  }

  async determineIfInsightsJobHeaderAlreadyProcessed() {
    return await this.prisma.insightsJobHeader.count({
      where: {
        createdAt: {
          gte: getSpecificDaysAgo(0),
        },
        isDeleted: {
          equals: false,
        },
      },
    });
  }
}
