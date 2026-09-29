import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import {
  getPrismaClientForTenant,
  prismaClientBypass,
} from '../../utils/prisma/multiTenancyPrisma.client';
import JobStatus from '../../utils/enums/job.status';
import { generateGeoLocation } from '../../utils/geocoder/geocoder.client';
import { DateTime } from 'luxon';
import getSpecificDaysAgo from '../../utils/dates/dates';
import { JobService } from '../../services/job/job.service';
import { JobCreateService } from '../../services/job/jobCreate.service';

const jobService = new JobService();
const jobCreateService = new JobCreateService();
export default class JobController {
  public async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobService.getAllJobs(res.locals.orgId);
      return res.status(200).json(jobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getAllJobs',
      });
    }
  }

  public async getStatusCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await jobService.getStatusCount(res.locals.orgId);
      return res.status(200).json(count);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getStatusCount',
      });
    }
  }

  public async getBookingsToReview(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(0, 0, 0, 0); // set 'tomorrow' to midnight CDT/5 or 6AM UST of following day
    const today = new Date();
    const tzOffset = DateTime.fromObject(
      {},
      { zone: 'America/Chicago' }
    ).offset;
    if (today.getUTCHours() < tzOffset / -60) {
      // still day before local
      today.setDate(today.getUTCDate() - 1);
    }
    today.setHours(0, 0, 0, 0);

    return await prisma.job.aggregate({
      where: {
        statusId: {
          equals: JobStatus.Unassigned,
        },
        scheduledDate: {
          gte: today,
          lte: endDate,
        },
        bookingId: {
          not: null,
        },
      },
      _count: true,
    });
  }

  public async getNeedAttentionCount(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // set 'tomorrow' to midnight CDT/5 or 6AM UST of following day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.job.aggregate({
      where: {
        OR: [
          {
            statusId: {
              equals: JobStatus.Unassigned,
            },
          },
          {
            statusId: {
              equals: JobStatus.NeedsApproval,
            },
          },
        ],
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _count: {
        statusId: true,
      },
    });
  }

  public async getAddressCount(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    // what does gmaps need to accurately place a pin? extract from address below
    return prisma.location.findMany({
      select: {
        address: {
          select: {
            city: true,
            line1: true,
            line2: true,
            line3: true,
            state: true,
            zipcode: true,
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });
  }

  public async getTodayAndTomorrowJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobService.getTodayAndTomorrow(res.locals.orgId);
      return res.status(200).json(jobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getTodayAndTomorrowJobs',
      });
    }
  }

  // Get jobs by a specified day diff; days accepts negative integer for previous days
  public async getJobsByDayDiff(
    req: Request,
    res: Response,
    next: NextFunction,
    days: number
  ) {
    try {
      const jobs = await jobService.getJobsByDayDiff(res.locals.orgId, days);
      return res.status(200).json(jobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getJobsByDayDiff',
      });
    }
  }

  public async getJobsByStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let statusId: number;
      if (req.params.statusId) {
        statusId = Number(req.params.statusId);
      } else {
        statusId = JobStatus.NeedsApproval;
      }
      const jobs = await jobService.getJobsByStatus(res.locals.orgId, statusId);
      return res.status(200).json(jobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getJobsByStatus',
      });
    }
  }

  public async getSearchJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.body.searchText;
      const jobs = await jobService.getSearchJobs(res.locals.orgId, query);
      return res.status(200).json(jobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getSearchJobs',
      });
    }
  }

  public async getPhotos(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    return await prisma.photos.findMany({
      where: { jobId: req.params.jobId },
    });
  }

  public async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobCreateService.create(res.locals.orgId, req.body);
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.createJob',
      });
    }
  }

  public async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.getJob(res.locals.orgId, req.params.jobId);
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.getJob',
      });
    }
  }

  public async updateJobStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const job = await jobService.updateStatus(
        res.locals.orgId,
        req.params.jobId,
        req.body.statusId
      );
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.updateJobStatus',
      });
    }
  }

  public async updateJobScope(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.updateJobScope(
        res.locals.orgId,
        req.params.jobId,
        req.body.jobScope,
        res.locals.userAuthId
      );
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.updateJobScope',
      });
    }
  }

  public async updateEtaStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const job = await jobService.updateEtaStatus(
        res.locals.orgId,
        req.params.jobId,
        req.body.etaStatusId
      );
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.updateEtaStatus',
      });
    }
  }

  public async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.dumpTicket) {
        if (!req.body.dumpTicket.photosId) {
          res.status(500);
          return {
            message: 'Must include Dump Ticket photo',
          };
        }
      }
      const updatedJob = await jobService.update(
        res.locals.orgId,
        req.params.jobId,
        req.body,
        res.locals.userAuthId
      );
      return res.status(200).json(updatedJob);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.updateJob',
      });
    }
  }

  public async updateJobCustomFields(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const updatedJob = await jobService.updateJobCustomFields(
        res.locals.orgId,
        req.params.jobId,
        req.body.customFields
      );
      return res.status(200).json(updatedJob);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.updateJobCustomFields',
      });
    }
  }

  public async getJobInfo(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    //Check for the following values and return the IDs
    let data: any = {};

    //Schedule Date
    if (req?.body?.scheduledDate) {
      data['scheduledDate'] = req?.body?.scheduledDate;
    } else {
      res.status(301);
      return {
        message: 'scheduledDate should not be empty..',
      };
    }

    //JobScope
    if (req?.body?.jobScope) {
      data['jobScope'] = req?.body?.jobScope;
    } else {
      res.status(301);
      return {
        message: 'JobScope should not be empty..',
      };
    }

    //customer
    let customer = await prisma.customer.findFirst({
      where: {
        name: {
          equals: req.body.customer,
        },
      },
    });

    if (customer) {
      data['customer'] = customer;
    } else {
      res.status(301);
      return {
        message: 'Customer does not exist',
      };
    }

    //crew
    let crew = await prisma.crew.findFirst({
      where: {
        name: {
          equals: req.body.crew,
        },
      },
    });

    if (crew) {
      data['crew'] = crew;
    }

    //jobTypeName
    let jobType = await prisma.jobType.findFirst({
      where: {
        shortDescription: {
          equals: req.body.jobTypeName,
        },
      },
    });

    if (jobType) {
      data['jobTypeName'] = jobType;
    } else {
      res.status(301);
      return {
        message: 'jobTypeName does not exist',
      };
    }

    //jobSubTypeName
    let jobSubType = await prisma.jobSubType.findFirst({
      where: {
        name: {
          equals: req.body.jobSubTypeName,
        },
      },
    });

    if (jobSubType) {
      data['jobSubTypeName'] = jobSubType;
    } else {
      res.status(301);
      return {
        message: 'jobSubTypeName does not exist',
      };
    }

    //Project
    let project = await prisma.project.findFirst({
      where: {
        name: {
          equals: req.body.projectName,
        },
      },
    });

    if (project) {
      data['project'] = project;
    } else {
      res.status(301);
      return {
        message: 'Project does not exist',
      };
    }

    if (req.body.jobStatus) {
      data['jobStatus'] = req.body.jobStatus;
    } else {
      res.status(301);
      return {
        message: 'jobStatus should not empty',
      };
    }

    //location (address line 1, address line 2, city, state, zipcode)
    if (req.body.address) {
      let location: any;

      const address: any = await prisma.address.findFirst({
        where: {
          line1: {
            equals: req.body.address.line1,
          },
          line2: { equals: req.body.address.line2 },
          city: { equals: req.body.city },
          state: { equals: req.body.state },
          zipcode: { equals: req.body.zipcode },
        },
      });

      if (address) {
        location = await prisma.location.findFirst({
          where: {
            addressId: address.id,
          },
          include: {
            address: true,
          },
        });
      } else {
        //console.log('This is a new address');
        // res.status(301);
        // return {
        //   message: 'This address does not exist',
        // };
      }
      data['location'] = location;
    }

    // //disposal site
    // if (req.body.disposalSite) {
    //   let disposalSite: any;
    //   const disposalSiteLocation: any = await prisma.location.findFirst({
    //     where: {
    //       name: {
    //         equals: req.body.disposalSite,
    //       },
    //     },
    //     select: {
    //       id: true,
    //     },
    //   });

    //   if (disposalSiteLocation) {
    //     disposalSite = await prisma.disposalSite.findFirst({
    //       where: {
    //         locationId: disposalSiteLocation.id,
    //       },
    //       include: {
    //         location: true,
    //       },
    //     });
    //   } else {
    //     res.status(301);
    //     return {
    //       message: 'This disposal site does not exist',
    //     };
    //   }
    //   data['disposalSite'] = disposalSite;
    // }

    //primary contact
    if (req.body.primaryContact) {
      const [firstName, lastName] = req.body.primaryContact.name.split(' ');
      const contact: any = await prisma.contact.findFirst({
        where: {
          firstName: {
            equals: firstName,
          },
          lastName: {
            equals: lastName,
          },
        },
        include: {
          phone: true,
          email: true,
        },
      });

      data['primaryContact'] = contact;
    }

    //secondary contact
    if (req.body.secondaryContact) {
      const [firstName, lastName] = req.body.secondaryContact.name.split(' ');
      const contact: any = await prisma.contact.findFirst({
        where: {
          firstName: {
            equals: firstName,
          },
          lastName: {
            equals: lastName,
          },
        },
        include: {
          phone: true,
          email: true,
        },
      });

      data['secondaryContact'] = contact;
    }

    res.status(200);
    return data;
  }

  public async restartJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.restartJob(
        res.locals.orgId,
        req.params?.jobId,
        JobStatus.Scheduled,
      );
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in JobController.reportJob',
        message: `Error: ${error}`,
      });
    }
  }

  public async pushJob(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const userName = user.firstName + ' ' + user.lastName;
      const pushedJob = await jobService.pushJob(
        res.locals.orgId,
        req.params?.jobId,
        JobStatus.NeedsApproval,
        req.body.appNotes,
        res.locals.userAuthId,
        userName
      );
      return res.status(200).json(pushedJob);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in JobController.pushJob',
      });
    }
  }

  public async reportJob(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const job = await jobService.reportJob(
        res.locals.orgId,
        req.params?.jobId,
        JobStatus.NeedsApproval,
        req.body.notes,
        res.locals.userAuthId,
        req.body.attachmentUrl,
        user
      );
      return res.status(200).json(job);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in JobController.reportJob',
        message: `Error: ${error}`,
      });
    }
  }

  // public async recordJobFeedback(req: any, res: any) {
  //   const { Feedback } = req.body;

  //   let user = null;
  //   if (req.auth && req.auth.sub && req.auth.sub.includes('auth0|')) {
  //     user = await prisma.user.findUnique({
  //       where: { auth_id: req.auth.sub },
  //     });
  //   }

  //   if (!user) {
  //     return res.status(500);
  //   }
  //   // const feedback = await prisma.feedback.create({
  //   //   data: {
  //   //     text: req.body.text,
  //   //     rating: Number(req.body.rating),
  //   //     createdBy: {
  //   //       connect: {
  //   //         id: user.id,
  //   //       },
  //   //     },
  //   //   },
  //   // });

  //   // const getFeedback = await prisma.job.update({
  //   //   where: { id: req.params?.jobId },
  //   //   data: {
  //   //     Feedback: {
  //   //       create: {
  //   //         text: req.body.text,
  //   //         rating: Number(req.body.rating),
  //   //         createdBy: {
  //   //           connect: {
  //   //             id: user.id,
  //   //           },
  //   //         },
  //   //       },
  //   //     },
  //   //   },
  //   // });

  //   // return res.status(200).json(getFeedback);
  // }

  public async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobService.reschedule(
        res.locals.orgId,
        req.params.jobId,
        req.body.scheduledDate,
        req.body.timeSlot,
        res.locals.userAuthId
      );
      res.status(200).json(job);
    } catch (error) {
      next({
        error,
        errorPath: 'JobController.reschedule',
        message: `Error rescheduling job. Error: ${error}`,
      });
    }
  }

  public async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const userName = user.firstName + ' ' + user.lastName;
      const job = await jobService.cancel(
        res.locals.orgId,
        req.params?.jobId,
        res.locals.userAuthId,
        userName
      );
      res.status(200).json(job);
    } catch (error) {
      next({
        error,
        errorPath: 'JobController.cancel',
        message: `Error cancelling job. Error: ${error}`,
      });
    }
  }

  public async adminCreateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await jobCreateService.adminCreate(
        res.locals.orgId,
        req.body
      );
      if (job instanceof ReferenceError) {
        throw job
      }
      return res.status(201).json(job);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in JobController.adminCreateJob',
      });
    }
  }

  public async deleteJob(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const dumpTicket = await prisma.dumpTicket.findMany({
      where: { jobId: req.params.jobId },
    });
    if (dumpTicket.length != 0) {
      await prisma.dumpTicket.delete({
        where: { id: dumpTicket[0]?.id },
      });
    }
    await prisma.organizationJobCustomField.deleteMany({
      where: { jobId: req.params.jobId },
    });
    await prisma.job.delete({
      where: { id: req.params.jobId },
    });
  }

  public async getJobsAddedPastThirtyDays(orgId: string) {
    return prismaClientBypass.job.count({
      where: {
        createdAt: {
          gte: getSpecificDaysAgo(30),
          lt: getSpecificDaysAgo(0),
        },
        orgId: {
          equals: orgId,
        },
      },
    });
  }

  public async getJobsCompletedPastDays(orgId: string, days: number) {
    return prismaClientBypass.job.count({
      where: {
        completedAt: {
          gte: getSpecificDaysAgo(days),
          lt: getSpecificDaysAgo(0),
        },
        orgId: {
          equals: orgId,
        },
      },
    });
  }

  public async updateJobAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const prisma = getPrismaClientForTenant(res.locals.orgId);
      const jobWithLocationAndAddress = await prisma.job.findFirstOrThrow({
        where: {
          id: req.params.jobId,
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
        },
      });

      if (jobWithLocationAndAddress.project == null) {
        throw new Error('Project associated to job is null.');
      }

      const address = jobWithLocationAndAddress.project.location.address;
      await prisma.address.update({
        where: {
          id: address.id,
        },
        data: {
          line1: req.body.addressLine1,
          line2: req.body.addressLine2,
          city: req.body.city,
          state: req.body.state,
          zipcode: req.body.zipcode,
          county: req.body.county,
        },
      });

      const location = jobWithLocationAndAddress.project.location;
      const geocode = await generateGeoLocation(location.address);
      const updatedLocation = await prisma.location.update({
        where: {
          id: location.id,
        },
        data: {
          ...(geocode.length > 0 && {
            latitude: geocode[0].lat,
            longitude: geocode[0].lng,
          }),
          notes: req.body.locationDetails,
        },
      });
      return res.json(updatedLocation);
    } catch (error) {
      next({
        error,
        message: `Unable to update address due to the following error(s): ${error}`,
        errorPath: 'Error in JobController.updateJobAddress',
      });
    }
  }

  public async createCustomFields(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const job = await jobService.createCustomFields(
        res.locals.orgId,
        req.params.jobId,
        req.body
      );
      res.status(200).json(job);
    } catch (error) {
      next({
        error,
        errorPath: 'JobController.createCustomFields',
        message: `Error rescheduling job. Error: ${error}`,
      });
    }
  }
}
