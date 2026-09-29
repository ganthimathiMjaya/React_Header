import express, { Request, Response, NextFunction } from 'express';
import InvoiceController from '../controllers/invoice/invoice.controller';
import { param, body } from 'express-validator';
import { validate } from '../middlewares/validate';
import {
  validateJobsCreateInvoiceRules,
  validateJobsCreateInvoice,
  validateInvoiceIdBodyRules,
  validateJobIdBodyRules,
  validateInvoiceIdsExists,
  validateUpdateNotes,
  validateDiscardInvoicesRules,
} from '../middlewares/validators/invoice.validator';

const invoice = express.Router();
const controller = new InvoiceController();

invoice.get('/', async (req: Request, res: Response, next: NextFunction) =>
  controller.getInvoices(req, res, next)
);


invoice.post(
  '/pdf',
  validateInvoiceIdBodyRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getInvoicesPdf(req, res, next)
);

invoice.get('/queue', async (req: Request, res: Response, next: NextFunction) =>
  controller.getQueueJobs(req, res, next)
);

invoice.get(
  '/queue/count',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getQueueJobsCount(req, res, next)
);

invoice.get(
  '/revenue/ytd',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getYtdRevenue(req, res, next)
);

invoice.post(
  '/blank',
  body('customerId').exists().withMessage('customerId is required'),
  body('invoiceNo').exists().withMessage('invoiceNo is required'),
  body('invoiceDate').exists().withMessage('invoiceDate is required'),
  body('statusId').exists().withMessage('statusId is required'),
  body('terms').exists().isNumeric().withMessage('terms is required'),
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createBlankInvoice(req, res, next)
);

invoice.get(
  '/discarded',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getDiscardedJobs(req, res, next)
);

invoice.post(
  '/job/discard',
  validateJobIdBodyRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.discardJobs(req, res, next)
);

invoice.post(
  '/queue',
  validateInvoiceIdBodyRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.queueInvoices(req, res, next)
);

invoice.post(
  '/discard',
  validateInvoiceIdBodyRules(),
  validateDiscardInvoicesRules,
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.discardInvoices(req, res, next)
);

invoice.post(
  '/combine',
  body('invoiceIds')
    .isArray()
    .withMessage('Is not a valid array.')
    .exists()
    .withMessage('Does not exist.'),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.combineInvoices(req, res, next)
);

invoice.post(
  '/markSent',
  validateInvoiceIdBodyRules(),
  validate,
  validateInvoiceIdsExists,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.markInvoicesSent(req, res, next)
);

invoice.post(
  '/markPaid',
  validateInvoiceIdBodyRules(),
  validate,
  validateInvoiceIdsExists,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.markInvoicesPaid(req, res, next)
);

invoice.post(
  '/markCreated',
  validateInvoiceIdBodyRules(),
  validate,
  validateInvoiceIdsExists,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.markInvoicesCreated(req, res, next)
);

invoice.post(
  '/',
  validateJobsCreateInvoiceRules(),
  validate,
  validateJobsCreateInvoice,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createInvoice(req, res, next)
);

invoice.post(
  '/send',
  validateInvoiceIdBodyRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.sendInvoices(req, res, next)
);

invoice.get(
  '/:invoiceId', 
  param('invoiceId').isString().exists(),
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getInvoice(req, res, next)
);

invoice.put(
  '/:invoiceId',
  param('invoiceId').isString().exists(),
  body('customerId').exists().withMessage('customerId is required'),
  body('invoiceNo').exists().withMessage('invoiceNo is required'),
  body('invoiceDate').exists().withMessage('invoiceDate is required'),
  body('statusId').exists().withMessage('statusId is required'),
  body('terms').exists().isNumeric().withMessage('terms is required'),

  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateInvoice(req, res, next)
);

invoice.post(
  '/:invoiceId/detail',
  param('invoiceId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createLineItem(req, res, next)
);

invoice.post(
  '/:invoiceId/details',
  param('invoiceId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createLineItems(req, res, next)
);

invoice.put(
  '/:invoiceId/detail/:lineItemId',
  param('invoiceId').isString().exists(),
  param('lineItemId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateLineItem(req, res, next)
);

invoice.put(
  '/:invoiceId/details',
  param('invoiceId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateLineItems(req, res, next)
);

invoice.delete(
  '/:invoiceId/detail/:lineItemId',
  param('invoiceId').isString().exists(),
  param('lineItemId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.deleteLineItem(req, res, next)
);

invoice.post(
  '/:invoiceId/detail/:lineItemId/fields',
  param('invoiceId').isString().exists(),
  param('lineItemId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createLineItemCustomFields(req, res, next)
);

invoice.put(
  '/:invoiceId/detail/:lineItemId/fields',
  param('invoiceId').isString().exists(),
  param('lineItemId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateLineItemCustomFields(req, res, next)
);

invoice.delete(
  '/:invoiceId/detail/:lineItemId/fields',
  param('invoiceId').isString().exists(),
  param('lineItemId').isString().exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.deleteLineItemCustomFields(req, res, next)
);

invoice.post(
  '/job/discarded/queue',
  validateJobIdBodyRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.queueDiscardedJobs(req, res, next)
);

invoice.patch(
  '/job/:jobId/notes',
  validateUpdateNotes(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.updateJobNotes(req, res, next)
);

export default invoice;
