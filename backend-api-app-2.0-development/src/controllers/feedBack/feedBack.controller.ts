import { Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export default class feedBackController {
  public async recordJobFeedback(req: JWTRequest, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const { Feedback } = req.body;

    let user = null;
    if (req.auth && req.auth.sub && req.auth.sub.includes('auth0|')) {
      user = await prisma.user.findUnique({
        where: { auth_id: req.auth.sub },
      });
    }

    if (!user) {
      return res.status(500);
    }
    const getFeedback = await prisma.feedback.findFirst({
      where: { jobId: req.params.jobId },
    });

    if (getFeedback?.jobId !== req.params.jobId) {
      const createJob = await prisma.feedback.create({
        data: {
          text: req.body.text,
          jobId: req.params?.jobId,
          rating: Number(req.body.rating),
          createdBy: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      console.log(createJob.id);
      if (req.params.jobId) {
        const updated = await prisma.job.update({
          where: { id: req.params.jobId },
          data: {
            feedbackId: createJob?.id,
          },
        });
      }
    }

    // return res.status(200).json(createJob);
  }
}
