import express, { Request, Response, NextFunction } from 'express';
import ServicesManagementController from '../controllers/servicesManagement/servicesManagement.controller';
import { param } from 'express-validator';
import { validate } from '../middlewares/validate';
import { validateCreateNewServiceRules } from '../middlewares/validators/serviceManagement.validator';

const servicesManagement = express.Router();
const controller = new ServicesManagementController();

servicesManagement.get('/', async (_req: Request, res: Response) => {
  const response = await controller.getAllJobTypes(_req, res);
  return res.json(response);
});

servicesManagement.get(
  '/jobType/:jobTypeId',
  param('jobTypeId').isInt().exists(),
  async (_req: Request, res: Response) => {
    const response = await controller.getJobType(_req, res);
    return res.json(response);
  }
);

servicesManagement.get(
  '/jobSubType/:jobSubTypeId',
  param('jobSubTypeId').isInt().exists(),
  async (_req: Request, res: Response) => {
    const response = await controller.getJobSubType(_req, res);
    return res.json(response);
  }
);

servicesManagement.get('/jobSubTypes', async (_req: Request, res: Response) => {
  const response = await controller.getAllJobSubTypes(_req, res);
  return res.json(response);
});

servicesManagement.post(
  '/',
  validateCreateNewServiceRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.addJobSubType(req, res, next)
);

servicesManagement.put(
  '/',
  validateCreateNewServiceRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateJobSubType(req, res, next)
);

servicesManagement.delete(
  '/:jobTypeId',
  param('jobTypeId').isInt().exists(),
  async (_req: Request, res: Response) => {
    const response = await controller.deleteJobType(_req, res);
    return res.json(response);
  }
);

servicesManagement.delete(
  '/jobSubType/:jobSubTypeId',
  param('jobSubTypeId').isInt().exists(),
  async (_req: Request, res: Response) => {
    const response = await controller.deleteJobSubType(_req, res);
    return res.json(response);
  }
);

export default servicesManagement;
