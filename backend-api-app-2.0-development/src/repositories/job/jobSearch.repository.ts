import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class JobSearchRepository {
  async getSearchJobs(orgId: string, query: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
      where: {
        OR: [
          {
            techReference: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            jobType: {
              shortDescription: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            jobSubType: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            project: {
              id: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            project: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          //Project Location
          {
            project: {
              location: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            project: {
              location: {
                address: {
                  line1: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            project: {
              location: {
                address: {
                  line2: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            project: {
              location: {
                address: {
                  city: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            project: {
              location: {
                address: {
                  county: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            project: {
              location: {
                address: {
                  zipcode: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          //todo: remove_location queries
          {
            location: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            location: {
              address: {
                line1: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            location: {
              address: {
                line2: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            location: {
              address: {
                city: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            location: {
              address: {
                county: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            location: {
              address: {
                zipcode: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            customer: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            crew: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            User: {
              firstName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            User: {
              lastName: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            jobScope: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            crewNotes: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            poNum: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            status: {
              content: {
                contains: this.generateQueryFriendlySearchTerm(query),
                mode: 'insensitive',
              },
            },
          },
        ],
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
        //todo: remove_location
        location: {
          include: {
            address: true,
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

  generateQueryFriendlySearchTerm(searchTerm: string) {
    // handles edge case with encoded URL
    return decodeURI(searchTerm);
  }
}
