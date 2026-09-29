import { body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import OrganizationSettingsService from '../../services/organizationSettings/organizationSettings.service';
import allTimezones
 from '../../data/timezones';
const organizationSettingsService = new OrganizationSettingsService();

export const validateCustomFieldRules = () => {
  return [
    body()
      .isArray({ max: 5 })
      .withMessage('Must be an array with no more than 5 custom fields'),
    body('*.name', 'a name must be provided')
      .isString()
      .isLength({ min: 4 })
      .withMessage('Minimum length allowed is 4'),
    body('*.isDeleted', 'isDeleted boolean is required').isBoolean(),
    body('*.isActive', 'isActive boolean is required').isBoolean(),
    body('*.isInvoiceable', 'isInvoiceable boolean is required').isBoolean(),
    body('*.showCrew', 'showCrew boolean is required').isBoolean(),
    body('*.showCustomer', 'showCustomer boolean is required').isBoolean(),
  ];
};

export const validateTaxRatesRules = () => {
  return [
    body()
      .isArray({ max: 5 })
      .withMessage('Must be an array with no more than 5 tax rates'),
    body('*.name', 'a name must be provided')
      .isString()
      .isLength({ min: 3 })
      .withMessage('Minimum length allowed is 3'),
    body('*.taxRatePercent', 'a taxRatePercent must be provided')
      .isNumeric()
      .withMessage('Must be a number'),
  ];
};

export const validateTaxRatesDeleteRules = () => {
  return [
    body()
      .isArray({ min: 1 })
      .withMessage('Must be an array with at least one id'),
    body('*', 'id must be a number').isInt().withMessage('id must be a number'),
  ];
};

export const validateTaxRatesDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taxRates = req.body;
    const errors: string[] = [];
    const subServices = await organizationSettingsService.getJobSubTypeByRates(
      res.locals.orgId,
      taxRates
    );
    if (subServices.length) {
      taxRates.forEach((taxRateId: number) => {
        const subServiceFiltered = subServices.filter(
          (item) => item.taxRateId === taxRateId
        );

        if (subServiceFiltered.length) {
          const taxRateName = subServiceFiltered[0].taxRate?.name;
          const subServiceNames = subServiceFiltered
            .map((item) => item.name)
            .join(', ');
          errors.push(`Tax rate ${taxRateName} is used in ${subServiceNames}`);
        }
      });

      return res.status(400).json({
        errors: [
          'Tax rates associated with services cannot be deleted.',
          ...errors,
        ],
      });
    }
  } catch (error) {
    console.error('Error validating tax rates for deletion: ', error);
    next(error);
  }
  next();
};

export const validateCompanyInfoRules = () => {
  return [
    body('companyName')
      .isString()
      .optional()
      .withMessage('companyName must be a string'),
    body('address')
      .isString()
      .optional()
      .withMessage('address must be a string'),
    body('phoneNumber')
      .isString()
      .optional()
      .withMessage('phoneNumber must be a string'),
    body('invoiceEmail')
      .isString()
      .optional()
      .withMessage('invoiceEmail must be a string'),
  ];
};

export const timezoneValidator = (
  req: Request,
  res: Response,
  next: NextFunction) => {
    try {
      const timezone = String(req.body.timezone)
      if(allTimezones.hasOwnProperty(timezone)) {
        next()
      } else {
        res.status(400).send(`Timezone: "${timezone}" validation failed on timezoneValidator`)
      }
    } catch(err){
      console.log(err);
      next(err)
    }
};
