import express, { Request, Response, NextFunction } from 'express';
import JobController from '../controllers/job/job.controller';
import { param } from 'express-validator';
import {
  jobRescheduleValidationRules,
  jobCancellationValidationRules,
  validateJobReportRules,
  validateJobReschedule,
  validateJobCancel,
  validateJobPush,
  validateUpdateAddress,
  validateJobEtaStatusRules,
  validateJobStatusRules,
  validateAdminCreateJob,
  validateJobCreateRules,
  validateJobScopeRules,
  validateJobCustomFieldsBodyRules,
  validateUpdateJobCustomFields,
} from '../middlewares/validators/job.validator';
import { validate } from '../middlewares/validate';

const job = express.Router();
const controller = new JobController();

job.get('/', async (req: Request, res: Response, next: NextFunction) =>
  controller.getTodayAndTomorrowJobs(req, res, next)
);

job.get(
  '/last/:days',
  param('days')
    .isInt()
    .exists()
    .withMessage('Days does not exist or is not a valid integer.'),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getJobsByDayDiff(req, res, next, 0 - parseInt(req.params.days))
);

job.get(
  '/next/:days',
  param('days')
    .isInt()
    .exists()
    .withMessage('Days does not exist or is not a valid integer.'),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getJobsByDayDiff(req, res, next, parseInt(req.params.days))
);

job.get(
  '/needsApproval',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getJobsByStatus(req, res, next)
);

job.get('/count/bookingsToReview', async (_req: Request, res: Response) => {
  const bookingsToReview = await controller.getBookingsToReview(
    res.locals.orgId
  ); // controller.getNeedAttentionCount();
  return res.json(bookingsToReview);
});

job.get(
  '/count/status',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getStatusCount(req, res, next)
);

job.get('/count/address', async (_req: Request, res: Response) => {
  const response = await controller.getAddressCount(res.locals.orgId);
  // handle logic to filter out low jobs? get total #'s here, then run filters?
  const totalCount = response.length;
  const filteredByCount = response.filter(
    (add) => add._count.jobs / totalCount > 0.01
  );

  return res.json(filteredByCount);
});

job.post('/search', async (req: Request, res: Response, next: NextFunction) =>
  controller.getSearchJobs(req, res, next)
);

job.get('/images/:jobId', async (req: Request, res: Response) => {
  const response = await controller.getPhotos(req, res);
  return res.json(response);
});

job.post(
  '/',
  validateJobCreateRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createJob(req, res, next)
);

job.post('/bulk', async (req: Request, res: Response) => {
  const response = await controller.getJobInfo(req, res);
  return res.json(response);
});

job.get(
  '/:jobId',
  param('jobId').isUUID().exists(),
  validate,
  async (req, res, next) => controller.getJob(req, res, next)
);

job.patch(
  '/:jobId/address',
  validateUpdateAddress(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateJobAddress(req, res, next)
);

job.put('/:jobId', async (req: Request, res: Response, next: NextFunction) =>
  controller.updateJob(req, res, next)
);

job.post('/restart/:jobId', async (req: Request, res: Response, next: NextFunction) =>
    controller.restartJob(req, res, next)
);

job.post(
  '/push/:jobId',
  validateJobPush,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pushJob(req, res, next)
);

job.post(
  '/report/:jobId',
  validateJobReportRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.reportJob(req, res, next)
);

job.post(
  '/status/:jobId',
  validateJobStatusRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateJobStatus(req, res, next)
);

job.post(
  '/scope/:jobId',
  validateJobScopeRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateJobScope(req, res, next)
);

job.post(
  '/eta-status/:jobId',
  validateJobEtaStatusRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateEtaStatus(req, res, next)
);

// job.post(
//   '/:jobId/feedback',
//   async (req: Request, res: Response) => {
//     const response = await controller.recordJobFeedback(req, res);
//     return res.json(response);
//   }
// );

job.post(
  '/reschedule/:jobId',
  jobRescheduleValidationRules(),
  validate,
  validateJobReschedule,
  (req: Request, res: Response, next: NextFunction) =>
    controller.reschedule(req, res, next)
);

job.post(
  '/cancel/:jobId',
  jobCancellationValidationRules(),
  validate,
  validateJobCancel,
  (req: Request, res: Response, next: NextFunction) =>
    controller.cancel(req, res, next)
);

job.post(
  '/:jobId/customFields',
  validate,
  (req: Request, res: Response, next: NextFunction) =>
    controller.createCustomFields(req, res, next)
);

job.put(
  '/:jobId/customFields',
  validateJobCustomFieldsBodyRules(),
  validate,
  validateUpdateJobCustomFields,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateJobCustomFields(req, res, next)
);

job.post(
  '/admin/create',
  validateAdminCreateJob(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.adminCreateJob(req, res, next)
);

job.delete('/:jobId', async (req: Request, res: Response) => {
  let response = await controller.deleteJob(req, res);
  return res.json(response);
});

export default job;
