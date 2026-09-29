import { Request, Response } from 'express';
import moment from 'moment';
import _ from 'lodash';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export default class LocationController {
  public async getRecentLocations(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const locations = await prisma.location.findMany({
      include: {
        address: true,
        jobs: {
          include: {
            customer: true,
          },
        },
      },
    });

    const filteredByJobs = locations.filter((location) => {
      if (location.jobs.length > 0) {
        let filteredByCustomer;

        const recentJobs = location.jobs.filter(
          (job) => moment().diff(job.scheduledDate, 'days') < 32
        );

        if (req.query.customerId) {
          filteredByCustomer = recentJobs.filter((job) => {
            return job.customerId === req.query.customerId;
          });

          return filteredByCustomer.length > 0;
        }

        return recentJobs.length > 0;
      }

      return false;
    });

    return _.uniqBy(filteredByJobs, 'address.line1');
  }
}
