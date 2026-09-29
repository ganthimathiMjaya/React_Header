import { Request, Response, NextFunction } from 'express';
import OrganizationSettingsService from '../../services/organizationSettings/organizationSettings.service';
const service = new OrganizationSettingsService();

export default class OrganizationSettingsController {
  public async upsertCustomFields(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customFields = req.body || [];
      const updatedCustomFields = await service.upsertCustomFields(
        res.locals.orgId,
        customFields
      );
      return res.json(updatedCustomFields);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.upsertCustomFields',
      });
    }
  }

  public async getCustomFields(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customFields = await service.getCustomFields(res.locals.orgId);
      return res.json(customFields);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.getCustomFields',
      });
    }
  }

  public async createTaxRates(req: Request, res: Response, next: NextFunction) {
    try {
      const taxRates = req.body || [];
      const createdTaxRates = await service.createTaxRates(
        res.locals.orgId,
        taxRates
      );
      return res.json(createdTaxRates);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.createTaxRates',
      });
    }
  }

  public async deleteTaxRates(req: Request, res: Response, next: NextFunction) {
    try {
      const taxRates = req.body || [];
      await service.deleteTaxRates(res.locals.orgId, taxRates);
      const updatedRates = await service.getTaxRates(res.locals.orgId);
      return res.status(201).json(updatedRates);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.deleteTaxRates',
      });
    }
  }

  public async getTaxRates(req: Request, res: Response, next: NextFunction) {
    try {
      const taxRates = await service.getTaxRates(res.locals.orgId);
      return res.json(taxRates);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.getTaxRates',
      });
    }
  }

  public async getPaymentInstructions(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      return await service.getPaymentInstructions(orgId);
    } catch (error) {
      console.log(
        `Could not retrieve payment instructions for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async addPaymentInstructions(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      if (req.body.paymentInstructions === undefined) {
        res
          .status(400)
          .json('Bad request due to missing payment instructions.');
        return;
      }

      return await service.addPaymentInstructions(
        orgId,
        req.body.paymentInstructions
      );
    } catch (error) {
      console.log(
        `Could not create payment instructions for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async updatePaymentInstructions(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const orgSettingId = parseInt(req.params?.orgSettingId);
      if (
        req.params === undefined ||
        req.params?.orgSettingId === undefined ||
        isNaN(orgSettingId)
      ) {
        res
          .status(400)
          .json('Bad request: orgSettingId is not provided or is invalid.');
        return;
      }

      if (req.body.paymentInstructions === undefined) {
        res
          .status(400)
          .json('Bad request due to missing payment instructions.');
        return;
      }

      return await service.updatePaymentInstructions(
        orgId,
        orgSettingId,
        req.body.paymentInstructions
      );
    } catch (error) {
      console.log(
        `Could not update payment instructions for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async uploadCompanyLogo(req: any, res: Response) {
    const orgId = res.locals.orgId;
    try {
      if (req.file === undefined || req.file === null) {
        res.status(400).json('Bad request due to invalid or missing file.');
      } else {
        await service.uploadCompanyLogo(orgId, req.file.key);
        res.status(202).send({
          url: req.file.location,
        });
      }
    } catch (error) {
      console.log(
        `Could not upload company logo due to the following error: ${error}`
      );

      res.status(500).json(error);
    }

    return;
  }

  public async getCompanyLogo(req: any, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const logo = await service.getCompanyLogo(orgId);

      if (
        logo !== undefined &&
        logo !== null &&
        logo.key !== undefined &&
        logo.key !== null &&
        logo.key !== '' &&
        logo.image !== undefined &&
        logo.image !== null
      ) {
        const fileExtension = logo.key.substring(
          logo.key.lastIndexOf('.') + 1,
          logo.key.length
        );

        res.setHeader('content-type', `image/${fileExtension}`);
        res.write(logo.image, 'binary');
        res.end(null, 'binary');
      } else {
        res
          .status(500)
          .json(
            'Could not retrieve company logo due to invalid or missing S3 key, image, or organization setting record.'
          );
        return res;
      }
    } catch (error) {
      console.log(
        `Could not retrieve company logo by org ID due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
    return res;
  }

  public async deleteCompanyLogo(req: any, res: Response) {
    const orgId = res.locals.orgId;
    try {
      await service.deleteCompanyLogo(orgId);
      res.status(200);
    } catch (error) {
      console.log(
        `Could not delete company logo by org ID due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getInvoiceMessage(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      return await service.getInvoiceMessage(orgId);
    } catch (error) {
      console.log(
        `Could not retrieve invoice message for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async addInvoiceMessage(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      return await service.addInvoiceMessage(orgId, req.body.invoiceMessage);
    } catch (error) {
      console.log(
        `Could not add invoice message for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async updateInvoiceMessage(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const orgSettingId = parseInt(req.params?.orgSettingId);
      if (
        req.params === undefined ||
        req.params?.orgSettingId === undefined ||
        isNaN(orgSettingId)
      ) {
        res
          .status(400)
          .json('Bad request: orgSettingId is not provided or is invalid.');
        return;
      }

      return await service.updateInvoiceMessage(
        orgId,
        orgSettingId,
        req.body.invoiceMessage
      );
    } catch (error) {
      console.log(
        `Could not update invoice message for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getCompanyInfo(req: Request, res: Response, next: NextFunction) {
    const orgId = res.locals.orgId;
    try {
      return res.json(await service.getCompanyInfo(orgId));
    } catch (error) {
      console.log(
        `Could not retrieve company info for orgID ${orgId} due to the following error: ${error}`
      );
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.getCompanyInfo',
      });
    }
  }

  public async addCompanyInfo(req: Request, res: Response, next: NextFunction) {
    const orgId = res.locals.orgId;
    try {
      return res.json(await service.addCompanyInfo(orgId, req.body));
    } catch (error) {
      console.log(
        `Could not add company info for orgID ${orgId} due to the following error: ${error}`
      );
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.addCompanyInfo',
      });
    }
  }

  public async updateCompanyInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const orgId = res.locals.orgId;
    try {
      const orgSettingId = parseInt(req.params?.orgSettingId);
      if (
        req.params === undefined ||
        req.params?.orgSettingId === undefined ||
        isNaN(orgSettingId)
      ) {
        res
          .status(400)
          .json('Bad request: orgSettingId is not provided or is invalid.');
        return;
      }

      return res.json(
        await service.updateCompanyInfo(orgId, orgSettingId, req.body)
      );
    } catch (error) {
      console.log(
        `Could not update company info for orgID ${orgId} due to the following error: ${error}`
      );
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in OrganizationSettingsController.updateCompanyInfo',
      });
    }
  }

  public async getOrganizationSettings(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      return await service.getOrganizationSettings(orgId);
    } catch (error) {
      console.log(
        `Could not retrieve organization settings for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getQuickBooksEnabled(_req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const response = await service.getQuickBooksEnabled(orgId);
      res.json(response);
    } catch (error) {
      console.log(
        `Could not retrieve getQuickBooksEnabled for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getOrgTimezone(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const response = await service.getTimeZone(orgId);
      res.json(response);
    } catch (error) {
      console.log(
        `Could not retrieve TimeZone for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async updateTimeZone(req: Request, res: Response, next: NextFunction) {
    const orgId = res.locals.orgId;
    try {
      const orgSettingId = req.body.id;
      if (
        req.body?.timezone === undefined ||
        isNaN(orgSettingId)
      ) {
        res
          .status(400)
          .json('Bad request in updateTimeZone: orgSettingId is not provided or is invalid.');
        return;
      }
      const response = await service.updateTimeZone(
        orgId,
        orgSettingId,
        req.body.timezone
      );
      res.json(response)
    } catch (error) {
      console.log(
        `Could not update timezone message for orgID ${orgId} due to the following error: ${error}`
      );
      res.status(500).json(error);
    }
  }  
}
