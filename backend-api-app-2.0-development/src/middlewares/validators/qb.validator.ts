import { Request, Response, NextFunction } from 'express';
import QBPushInvoicesService from '../../services/qb/qbPushInvoices.service';
import OrganizationSettingsService from '../../services/organizationSettings/organizationSettings.service';
import { QBIntegrationRepository } from '../../repositories/qb/qb.repository';

const qbService = new QBPushInvoicesService();
const orgSettingsService = new OrganizationSettingsService();
const qbIntegrationRepository = new QBIntegrationRepository();

export const validatePushInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invoiceIds = req.body.invoiceIds;
    if (invoiceIds) {
      const isValid = await qbService.allInvoiceCustomersSynched(
        res.locals.orgId,
        invoiceIds
      );
      if (!isValid) {
        res.status(400).json({
          errors: [
            'Invalid ids. All associated customers and services must be synched.',
          ],
        });
        return res;
      }
    }
  } catch (error) {
    console.error('Error validating invoices', error);
    next(error);
  }
  next();
};

export const validateQuickBooksEnabled = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await orgSettingsService.getQuickBooksEnabled(
      res.locals.orgId
    );
    if (!settings.quickbooksEnabled) {
      res.status(500).json({
        errors: ['QuickBooks integration is disabled for this organization'],
      });
      return res;
    }
  } catch (error) {
    console.error('Error validating quickbooks action', error);
    next(error);
  }
  next();
};

export const validateSameRealmId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokens = await qbIntegrationRepository.getTokens(res.locals.orgId);
    //Re-assigning QB Company could cause issues if data has already been synced. Scrappy already hold ids and references that would be different for other QB companies. This is most likely NOT intentional.
    if (tokens && req.body.realmId != tokens.companyId) {
      res.status(500).json({
        errors: [
          'Error: previous authorization was made for a different companyId. Assigning a new QB company is not allowed.',
        ],
      });
      return res;
    }
  } catch (error) {
    console.error('Error validating quickbooks authorization', error);
    next(error);
  }
  next();
};
