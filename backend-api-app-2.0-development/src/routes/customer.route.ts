import express, { Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import CustomerController from '../controllers/customer/customer.controller';
import ProjectController from '../controllers/project/project.controller';
import ContactController from '../controllers/contact/contact.controller';
import { validate } from '../middlewares/validate';

const customer = express.Router();
const controller = new CustomerController();
const projectController = new ProjectController();
const contactController = new ContactController();

customer.get('/', async (_req, res) => {
  const response = await controller.getAllCustomers(res.locals.orgId);
  return res.json(response);
});

customer.get(
  '/:customerId',
  param('customerId').isString().exists(),
  async (_req, res) => {
    const errors = validationResult(_req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const response = await controller.getCustomer(
      res.locals.orgId,
      _req.params?.customerId,
      _req.query?.skipJobs,
      _req.query?.takeJobs
    );
    return res.json(response);
  }
);

customer.get(
  '/:customerId/metrics',
  param('customerId')
    .isString()
    .exists()
    .withMessage('customerId was not provided or is not valid'),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getMetrics(req, res, next)
);

customer.post('/', async (req, res) => {
  const response = await controller.createCustomer(req, res);
  return res.json(response);
});

customer.post('/adminCreate', async (req, res) => {
  const response = await controller.adminCreateCustomer(req, res);
  return res.json(response);
});

customer.put('/:id', async (req, res) => {
  const response = await controller.updateCustomer(req, res);
  return res.json(response);
});

customer.get('/crewAssignment/:customerId/:jobTypeId', async (req, res) => {
  const assignment = await controller.getCrewAssignment(req, res);

  return res.json(assignment);
});

customer.get(
  '/:customerId/projects',
  param('customerId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    projectController.getAllProjects(req, res, next)
);

customer.post(
  '/:customerId/projects',
  param('customerId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    projectController.createProject(req, res, next)
);

customer.put(
  '/:customerId/projects/:projectId',
  param('customerId').isString().exists(),
  param('projectId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    projectController.updateProject(req, res, next)
);

customer.delete(
  '/:customerId/projects/:projectId',
  param('customerId').isString().exists(),
  param('projectId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    projectController.deleteProject(req, res, next)
);

customer.get(
  '/:customerId/contacts',
  param('customerId').isString().exists(),
  async (req: Request, res: Response, next: NextFunction) =>
    contactController.getContacts(req, res, next)
);

customer.post(
  '/:customerId/contacts',
  param('customerId').isString().exists(),
  async (req: Request, res: Response, next: NextFunction) =>
    contactController.createContact(req, res, next)
);

customer.put(
  '/:customerId/contacts/:contactId',
  param('customerId').isString().exists(),
  param('contactId').isString().exists(),
  async (req: Request, res: Response, next: NextFunction) =>
    contactController.updateContact(req, res, next)
);

customer.delete(
  '/:customerId/contacts/:contactId',
  param('customerId').isString().exists(),
  param('contactId').isString().exists(),
  async (req: Request, res: Response, next: NextFunction) =>
    contactController.deleteContact(req, res, next)
);

export default customer;
