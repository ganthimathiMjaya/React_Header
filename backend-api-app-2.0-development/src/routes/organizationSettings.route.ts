import express, { NextFunction, Request, Response } from 'express';
import OrganizationSettingsController from '../controllers/organizationSettings/organizationSettings.controller';
import { companyLogoUpload } from '../shared/s3Multer';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate';
import {
  validateCustomFieldRules,
  validateTaxRatesRules,
  validateTaxRatesDeleteRules,
  validateTaxRatesDelete,
  validateCompanyInfoRules,
  timezoneValidator,
} from '../middlewares/validators/organizationSettings.validator';

const organizationSettings = express.Router();
const controller = new OrganizationSettingsController();

organizationSettings.get(
  '/paymentInstructions',
  async (_req: Request, res: Response) => {
    const response = await controller.getPaymentInstructions(_req, res);
    return res.json(response);
  }
);

organizationSettings.post(
  '/paymentInstructions',
  async (_req: Request, res: Response) => {
    const response = await controller.addPaymentInstructions(_req, res);
    return res.json({
      id: response?.id,
      paymentInstructions: response?.paymentInstructions,
    });
  }
);

organizationSettings.put(
  '/paymentInstructions/:orgSettingId',
  async (_req: Request, res: Response) => {
    const response = await controller.updatePaymentInstructions(_req, res);
    return res.json({
      id: response?.id,
      paymentInstructions: response?.paymentInstructions,
    });
  }
);

organizationSettings.post(
  '/companyLogo',
  companyLogoUpload().single('image'),
  async (_req: any, res: Response) => {
    const response = await controller.uploadCompanyLogo(_req, res);
    return response;
  }
);

organizationSettings.get('/companyLogo', async (_req: any, res: Response) => {
  const response = await controller.getCompanyLogo(_req, res);
  return response;
});

organizationSettings.delete(
  '/companyLogo',
  async (_req: Request, res: Response) => {
    const response = await controller.deleteCompanyLogo(_req, res);
    return res.json(response);
  }
);

organizationSettings.get(
  '/invoiceMessage',
  async (_req: Request, res: Response) => {
    const response = await controller.getInvoiceMessage(_req, res);
    return res.json(response);
  }
);

organizationSettings.post(
  '/invoiceMessage',
  body('invoiceMessage')
    .isString()
    .withMessage('Is not a valid string.')
    .exists()
    .withMessage('Does not exist.'),
  validate,
  async (_req: Request, res: Response) => {
    const response = await controller.addInvoiceMessage(_req, res);
    return res.json({
      id: response?.id,
      invoiceMessage: response?.invoiceMessage,
    });
  }
);

organizationSettings.put(
  '/invoiceMessage/:orgSettingId',
  body('invoiceMessage')
    .isString()
    .withMessage('Is not a valid string.')
    .exists()
    .withMessage('Does not exist.'),
  validate,
  async (_req: Request, res: Response) => {
    const response = await controller.updateInvoiceMessage(_req, res);
    return res.json({
      id: response?.id,
      invoiceMessage: response?.invoiceMessage,
    });
  }
);

organizationSettings.post(
  '/customField',
  validateCustomFieldRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.upsertCustomFields(req, res, next)
);

organizationSettings.get(
  '/customField',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getCustomFields(req, res, next)
);

organizationSettings.get(
  '/taxRate',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getTaxRates(req, res, next)
);

organizationSettings.post(
  '/taxRates',
  validateTaxRatesRules(),
validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createTaxRates(req, res, next)
);

organizationSettings.delete(
  '/taxRate',
  validateTaxRatesDeleteRules(),
  validate,
  validateTaxRatesDelete,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.deleteTaxRates(req, res, next)
);

organizationSettings.get('/', async (req: Request, res: Response) => {
  const response = await controller.getOrganizationSettings(req, res);
  return res.json(response);
});

organizationSettings.get(
  '/companyInfo',
  async (_req: Request, res: Response, next: NextFunction) =>
    controller.getCompanyInfo(_req, res, next)
);

organizationSettings.post(
  '/companyInfo',
  validateCompanyInfoRules(),
  validate,
  async (_req: Request, res: Response, next: NextFunction) =>
    controller.addCompanyInfo(_req, res, next)
);

organizationSettings.put(
  '/companyInfo/:orgSettingId',
  validateCompanyInfoRules(),
  validate,
  async (_req: Request, res: Response, next: NextFunction) =>
    controller.updateCompanyInfo(_req, res, next)
);

organizationSettings.get(
  '/quickbooks',
  async (req: Request, res: Response, next: NextFunction) =>
    controller.getQuickBooksEnabled(req, res)
);

organizationSettings.get(
  '/timezone',
  async (req: Request, res: Response, next: NextFunction) => 
    controller.getOrgTimezone(req, res)
);

organizationSettings.post(
  '/timezone',
  timezoneValidator,
  async (req: Request, res: Response, next: NextFunction) => 
    controller.updateTimeZone(req, res, next)
)

export default organizationSettings;
