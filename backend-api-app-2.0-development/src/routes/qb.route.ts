import express, { Request, Response, NextFunction } from 'express';
import QBIntegrationController from '../controllers/qb/qb.controller';
import {
  validatePushInvoices,
  validateQuickBooksEnabled,
  validateSameRealmId,
} from '../middlewares/validators/qb.validator';
import {
  validateInvoiceIdsExists,
  validateInvoiceIdBodyRules,
} from '../middlewares/validators/invoice.validator';

const quickbooks = express.Router();
const controller = new QBIntegrationController();

quickbooks.post(
  '/setTokens',
  validateQuickBooksEnabled,
  validateSameRealmId,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.setTokens(req, res, next)
);

quickbooks.get(
  '/preferences',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getPreferences(req, res, next)
);

quickbooks.get(
  '/accounts',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getAccounts(req, res, next)
);

quickbooks.post(
  '/pullCustomers',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pullCustomers(req, res, next)
);

quickbooks.post(
  '/pushCustomers',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pushCustomers(req, res, next)
);

quickbooks.post(
  '/pushJobSubTypes',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pushJobSubTypes(req, res, next)
);

quickbooks.post(
  '/pullJobSubTypes',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pullJobSubTypes(req, res, next)
);

quickbooks.post(
  '/pushInvoicesQueue',
  validateInvoiceIdBodyRules(),
  validateInvoiceIdsExists,
  validateQuickBooksEnabled,
  validatePushInvoices,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pushInvoicesQueue(req, res, next)
);

quickbooks.post(
  '/pushInvoices',
  validateQuickBooksEnabled,
  validatePushInvoices,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.pushInvoices(req, res, next)
);

quickbooks.post(
  '/sync',
  validateQuickBooksEnabled,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.syncQuickBooks(req, res, next)
);

export default quickbooks;
