import { body } from 'express-validator';

export const validateJobsCreateJobTypeRules = () => {
  return [
    body('jobType').exists().withMessage('JobType is required'),
    body('jobType.jobSubTypes.*.name', 'a name must be provided')
      .isString()
      .isLength({ min: 2 })
      .withMessage('Minimum length allowed is 2'),
    body('jobType.jobSubTypes.*.taxRateId', 'a tax rate must be provided')
      .if(body('jobType.jobSubTypes.*.isTaxable').equals('true'))
      .isNumeric(),
    body(
      'jobType.jobSubTypes.*.taxRateId',
      'tax rate cannot be provided if service is NOT taxable'
    )
      .if(body('jobType.jobSubTypes.*.isTaxable').equals('false'))
      .isEmpty(),
  ];
};

export const validateCreateNewServiceRules = () => {
  return [
    body('jobSubType').exists().withMessage('JobSubType is required'),
    body('jobSubType.name', 'a name must be provided')
      .isString()
      .isLength({ min: 2 })
      .withMessage('Minimum length allowed is 2'),
    body('jobSubType.description', 'a description must be provided')
      .isString()
      .isLength({ min: 2 })
      .withMessage('Minimum length allowed is 2'),
    body('jobSubType.jobType', 'length must be greater than or equal to 2')
      .if(body('jobSubType.jobType').isString())
      .isLength({ min: 2 }),
    body('jobSubType.jobType', 'Job Type Object does not have an id.')
      .if(body('jobSubType.jobType').isString())
      .isLength({ min: 2 }),
    body('jobSubType.taxRateId', 'a tax rate must be provided')
      .if(body('jobSubType.isTaxable').equals('true'))
      .isNumeric(),
    body('jobSubType.cost').exists().withMessage('Service rate is required.')
      .matches(/^-?\d{1,8}(\.\d{1,2})?$/).withMessage('Does not match service rate regex')
  ];
};
