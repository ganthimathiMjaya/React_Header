import { Request, Response, NextFunction } from 'express';
import QBIntegrationService from '../../services/qb/qb.service';
import QBPullCustomersService from '../../services/qb/qbPullCustomers.service';
import QBPushCustomersService from '../../services/qb/qbPushCustomers.service';
import QBPushServicesService from '../../services/qb/qbPushServices.service';
import QBPullServicesService from '../../services/qb/qbPullServices.service';
import QBPushInvoicesService from '../../services/qb/qbPushInvoices.service';

const qbIntegrationService = new QBIntegrationService();
const qbPullCustomersService = new QBPullCustomersService();
const qbPushCustomersService = new QBPushCustomersService();
const qbPullServicesService = new QBPullServicesService();
const qbPushServicesService = new QBPushServicesService();
const qbPushInvoicesService = new QBPushInvoicesService();

export default class QBIntegrationController {
  public async setTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await qbIntegrationService.setTokens(
        res.locals.orgId,
        req.body.code,
        req.body.realmId,
        req.body.url
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: `Error setting tokens`,
        internalMessage: `Error: ${error}`,
        errorPath: 'Error in QBIntegrationController.setTokens',
      });
    }
  }

  public async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await qbIntegrationService.getAccounts(res.locals.orgId);
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: `Error fetching QB accounts`,
        internalMessage: `Error: ${error}`,
        errorPath: 'Error in QBIntegrationController.getAccounts',
      });
    }
  }

  public async clearTokens(_req: Request, res: Response, next: NextFunction) {
    try {
      const response = await qbIntegrationService.clearTokens(res.locals.orgId);
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: 'Error clearing tokens',
        internalMessage: `Error: ${error}`,
        errorPath: 'Error in QBIntegrationController.clearTokens',
      });
    }
  }

  public async getPreferences(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await qbIntegrationService.getPreferences(
        res.locals.orgId
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in QBIntegrationController.getPreferences',
      });
    }
  }

  public async pullCustomers(_req: Request, res: Response, next: NextFunction) {
    try {
      const response = await qbPullCustomersService.pullCustomers(
        res.locals.orgId
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: 'Error processing pullCustomers',
        internalMessage: `Error processing pushCustomers for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.pullCustomers',
      });
    }
  }

  public async pushCustomers(_req: Request, res: Response, next: NextFunction) {
    try {
      const response = await qbPushCustomersService.pushCustomers(
        res.locals.orgId
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: 'Error processing pushCustomers',
        internalMessage: `Error processing pushCustomers for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.pushCustomers',
      });
    }
  }

  public async pushJobSubTypes(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await qbPushServicesService.pushJobSubTypes(
        res.locals.orgId
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: 'Error processing pushJobSubTypes',
        internalMessage: `Error processing pushJobSubTypes for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.pushJobSubTypes',
      });
    }
  }

  public async pullJobSubTypes(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await qbPullServicesService.pullJobSubTypes(
        res.locals.orgId
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: 'Error processing pullJobSubTypes',
        internalMessage: `Error processing pullJobSubTypes for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.pullJobSubTypes',
      });
    }
  }

  public async pushInvoicesQueue(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await qbPushInvoicesService.pushInvoicesQueue(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(200).json(response);
    } catch (error) {
      next({
        error,
        message: 'Error processing pushInvoicesQueue',
        internalMessage: `Error processing pushInvoicesQueue for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.pushInvoicesQueue',
      });
    }
  }

  public async pushInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await qbPushInvoicesService.pushInvoices(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(200).json(response);
    } catch (error) {
      console.log('error', error);
      next({
        error,
        message: 'Error processing pushInvoices',
        internalMessage: `Error processing pushInvoices for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.pushInvoices',
      });
    }
  }

  public async syncQuickBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = res.locals.orgId;
      await qbPullServicesService.pullJobSubTypes(orgId);
      await qbPushServicesService.pushJobSubTypes(orgId);

      await qbPullCustomersService.pullCustomers(orgId);
      await qbPushCustomersService.pushCustomers(orgId);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.log('error', error);
      next({
        error,
        message: 'Error processing syncQuickBooks',
        internalMessage: `Error processing syncQuickBooks for orgId: : ${res.locals.orgId}, error: ${error}`,
        errorPath: 'Error in QBIntegrationController.syncQuickBooks',
      });
    }
  }
}
