import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';
import { User } from '@prisma/client';
import { UserService } from '../../services/user/user.service';
import { JobService } from '../../services/job/job.service';
import JobStatus from '../../utils/enums/job.status';

const userService = new UserService();
const jobService = new JobService();

export const validateJobPush = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const isCrew = userService.isCrew(req.user as User);
    if (isCrew) {
      const job = await prisma.job.findFirstOrThrow({
        where: { id: req.params?.jobId },
      });
      const validStatusForPush = [JobStatus.Scheduled, JobStatus.InProgress];
      if (!validStatusForPush.includes(job.statusId)) {
        return res.status(400).json({
          errors: [
            `Job is in incorrect status for pushing. Current status: ${job.statusId}`,
          ],
        });
      }
    } else {
      return res.status(403).json({
        errors: ['Only crew-members allowed'],
      });
    }
  } catch (error) {
    next(error);
  }
  next();
};

export const validateUpdateJobCustomFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customFieldIds = req.body.customFields.map((item: any) =>
      parseInt(item.id)
    );
    const user = req.user as User;
    const isValid = await jobService.validateUserCanUpdateCustomFields(
      res.locals.orgId,
      customFieldIds,
      user.roleId
    );
    if (!isValid) {
      return res.status(403).json({
        errors: ['Unauthorized: cannot update given custom fields'],
      });
    }
  } catch (error) {
    next(error);
  }
  next();
};

export const jobRescheduleValidationRules = () => {
  return [
    body('scheduledDate').isString().exists(),
    body('timeSlot').isString().exists(),
    param('jobId').isUUID().exists(),
  ];
};

export const validateJobReschedule = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isCustomer = userService.isUserCustomer(req.user as User);
  if (!isCustomer) {
    return res.status(403).json({
      errors: ['Only customers allowed'],
    });
  }
  next();
};

export const jobCancellationValidationRules = () => {
  return [param('jobId').isUUID().exists()];
};

export const validateJobCancel = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isCustomer = userService.isUserCustomer(req.user as User);
  if (!isCustomer) {
    return res.status(403).json({
      errors: ['Only customers allowed'],
    });
  }
  next();
};

export const validateJobCustomFieldsBodyRules = () => {
  return [
    param('jobId').isUUID().exists(),
    body('customFields')
      .isArray()
      .withMessage('Is not a valid array.')
      .exists()
      .withMessage('Does not exist.'),
    body('customFields.*.id', 'each item must contain an id')
      .exists()
      .withMessage('must be provided'),
  ];
};

export const validateJobReportRules = () => {
  return [
    param('jobId').isUUID().exists(),
    body('notes').isString().exists(),
    body('attachmentUrl').isString().optional(),
  ];
};

export const validateJobEtaStatusRules = () => {
  return [
    body('etaStatusId')
      .isNumeric()
      .withMessage('Is not a valid number.')
      .exists()
      .withMessage('Does not exist.'),
  ];
};

export const validateJobStatusRules = () => {
  return [
    body('statusId')
      .isNumeric()
      .withMessage('Is not a valid number.')
      .exists()
      .withMessage('Does not exist.'),
  ];
};

export const validateJobScopeRules = () => {
  return [
    body('jobScope')
      .isLength({ min: 1 })
      .withMessage('Missing job scope description.')
      .isString()
      .withMessage('Is not a valid string.')
      .exists()
      .withMessage('Does not exist.'),
  ];
};

export const validateAdminCreateJob = () => {
  return [
    body('jobSubTypeId').isNumeric().exists().isInt({ min: 1 }),
    body('customerId').exists().isUUID(),
    body('scheduledDate').exists(),
    body('jobScope').exists().isString(),
    body('cost').exists().isNumeric(),
  ];
};

export const validateUpdateAddress = () => {
  return [
    param('jobId').isUUID().withMessage('Is not a valid UUID'),
    body('addressLine1')
      .isString()
      .withMessage('Is not a valid string.')
      .exists()
      .withMessage('Does not exist.'),
    body('addressLine2')
      .isString()
      .withMessage('Is not a valid string.')
      .optional(),
    body('city')
      .isString()
      .withMessage('Is not a valid string.')
      .exists()
      .withMessage('Does not exist.'),
    body('state')
      .isString()
      .withMessage('Is not a valid string.')
      .exists()
      .withMessage('Does not exist.'),
    body('zipcode')
      .isString()
      .withMessage('Is not a valid string.')
      .exists()
      .withMessage('Does not exist.'),
    body('county').isString().withMessage('Is not a valid string.').optional(),
    body('locationDetails')
      .isString()
      .withMessage('Is not a valid string.')
      .optional(),
  ];
};

export const validateJobCreateRules = () => {
  return [
    body('address').isString().optional(),
    body('address2').optional().isString(),
    body('city').isString().optional(),
    body('state').isString().optional(),
    body('county').isString().optional(),
    body('zipCode').isString().optional(),
    body('crewId').isUUID().exists(),
    body('customerId').isUUID().exists(),
    body('locationId').isUUID().optional(),
    body('scheduledDate').isString().exists(),
    body('jobTypeId').isNumeric().exists(),
    body('dumpsterId').optional().isNumeric(),
    body('disposalSiteId').optional().isNumeric(),
    body('jobSubTypeId').isNumeric().optional(),
    body('dumpsterDropoffID').optional().isString(),
    body('dumpsterPickupId').optional().isString(),
    body('dumpsterDropoffSize').optional().isString(),
    body('dumpsterPickupSize').optional().isString(),
    body('wasteType').optional().isString(),
  ];
};
