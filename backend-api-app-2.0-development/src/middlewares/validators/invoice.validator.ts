import { Request, Response, NextFunction } from 'express';
import { body, param, check } from 'express-validator';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { JobInvoiceStatusService } from '../../services/invoice/jobInvoiceStatus.service';
import { InvoicingQueueStatus } from '../../utils/enums/job.status';

const invoiceService = new InvoiceService();
const jobInvoiceStatusService = new JobInvoiceStatusService();

export const validateJobIdBodyRules = () => {
  return [
    body('jobIds')
      .isArray({ min: 1 })
      .withMessage('Is not a valid array.')
      .exists()
      .withMessage('Does not exist.'),
    body('jobIds.*', 'each item must be a string')
      .isString()
      .withMessage('must be a valid string'),
  ];
};

export const validateUpdateNotes = () => {
  return [
    body('values').exists().withMessage('Does not exist.'),
    check('values.jobScope').exists().withMessage('Does not exist.'),
    check('values.crewNotes').exists().withMessage('Does not exist.'),
    check('values.jobNotes').exists().withMessage('Does not exist.'),
    check('values.invoiceNotes').exists().withMessage('Does not exist.'),
    check('values.customerInvoicingNotes')
      .exists()
      .withMessage('Does not exist.'),
    param('jobId').exists().withMessage('Does not exist.'),
  ];
};

export const validateInvoiceIdBodyRules = () => {
  return [
    body('invoiceIds')
      .isArray({ min: 1 })
      .withMessage('Is not a valid array.')
      .exists()
      .withMessage('Does not exist.'),
    body('invoiceIds.*', 'each item must be a string')
      .isString()
      .withMessage('must be a valid string'),
  ];
};

export const validateJobsCreateInvoiceRules = () => {
  return [
    body('createInvoice')
      .isArray({ min: 1 })
      .withMessage('must be a list with at list one item')
      .exists()
      .withMessage('Does not exist.'),
    body(
      'createInvoice.*.jobIds',
      'each invoice must contain a list of job ids'
    )
      .isArray({ min: 1 })
      .withMessage('must be a list with at list one item'),
    body(
      'createInvoice.*.jobIds.*',
      'each invoice must contain a list of job ids'
    )
      .isUUID()
      .withMessage('must be a valid UUID'),
  ];
};

export const validateInvoiceIdsExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invoices = req.body.invoiceIds;
    const invoiceIdSet = new Set(invoices);
    if (invoices.length !== invoiceIdSet.size) {
      res.status(400).json({
        errors: ['Cannot have duplicated ids.'],
      });
      return res;
    }
    const invoiceCount = await invoiceService.countInvoicesByIds(
      res.locals.orgId,
      invoices
    );
    if (invoices.length !== invoiceCount) {
      res.status(400).json({
        errors: ['Invalid ids. At least one does not exist.'],
      });
      return res;
    }
  } catch (error) {
    console.error('Error validating invoices', error);
    next(error);
  }
  next();
};

export const validateJobsCreateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invoices = req.body.createInvoice;
    // Cannot send duplicate jobIds in the same request
    const { uniqueJobIds, numberOfJobs } = getJobsCountAndUniqueIds(invoices);
    if (numberOfJobs !== uniqueJobIds.size) {
      res.status(400).json({
        errors: ['Cannot have duplicated jobIds.'],
      });
      return res;
    }
    const { jobs, jobsMap } = await getJobsMap(res.locals.orgId, uniqueJobIds);
    // Only jobs in the Complete status can be invoiced
    // Count of jobs completed from the DB MUST match request size.
    if (numberOfJobs !== jobs.length) {
      return res.status(400).json({
        errors: [
          'Validation failed. Make sure all the ids are valid, jobs completed, and NOT discarded jobs.',
        ],
      });
    }
    // Only combining jobs associated to the same project to an invoice
    const { sameProjectPerInvoice, sameTaxRatePerInvoice } =
      validateSameProjectAndTaxPerInvoice(invoices, jobsMap);

    if (sameProjectPerInvoice.includes(false)) {
      return res.status(400).json({
        errors: [
          'Validation failed. Combined jobs MUST belong to the same project for each invoice.',
        ],
      });
    }
    if (sameTaxRatePerInvoice.includes(false)) {
      return res.status(400).json({
        errors: [
          'Validation failed. Combined jobs MUST have the same TaxRate for each invoice.',
        ],
      });
    }
    const allJobsReady: boolean = allJobsReadyCheck(jobs);
    if (!allJobsReady) {
      return res.status(400).json({
        errors: ['Validation failed. All Jobs MUST be READY to be invoiced.'],
      });
    }
  } catch (error) {
    console.error('Error validating jobs for invoicing: ', error);
    next(error);
  }
  next();
};

const getJobsCountAndUniqueIds = (invoices: { jobIds: string[] }[]) => {
  const uniqueJobIds: Set<string> = new Set();
  let numberOfJobs = 0;
  invoices.map((invoice: { jobIds: string[] }) => {
    const jobIds = invoice.jobIds;
    numberOfJobs += jobIds.length;
    jobIds.map((id) => uniqueJobIds.add(id));
  });
  return {
    numberOfJobs,
    uniqueJobIds,
  };
};

const getJobsMap = async (orgId: string, uniqueJobIds: Set<string>) => {
  const jobs = await invoiceService.getJobsForValidation(
    orgId,
    Array.from(uniqueJobIds)
  );
  const jobsMap = new Map();
  jobs.map((job) => {
    jobsMap.set(job.id, job);
  });
  return {
    jobs,
    jobsMap,
  };
};

const validateSameProjectAndTaxPerInvoice = (
  invoices: { jobIds: string[] }[],
  jobsMap: Map<string, any>
) => {
  const sameProjectPerInvoice: boolean[] = [];
  const sameTaxRatePerInvoice: boolean[] = [];
  invoices.forEach((invoice: { jobIds: string[] }) => {
    const jobIds = invoice.jobIds;
    //All jobs must belong to same project.
    const projectSet = new Set();
    const taxRateSet = new Set();
    jobIds.forEach((id) => {
      const job = jobsMap.get(id);
      projectSet.add(job.projectId);
      taxRateSet.add(job.jobSubType?.taxRateId);
    });
    if (projectSet.size === 1) {
      sameProjectPerInvoice.push(true);
    } else {
      sameProjectPerInvoice.push(false);
    }
    if (taxRateSet.size === 1) {
      sameTaxRatePerInvoice.push(true);
    } else {
      sameTaxRatePerInvoice.push(false);
    }
  });

  return {
    sameProjectPerInvoice,
    sameTaxRatePerInvoice,
  };
};

const allJobsReadyCheck = (jobs: any[]) => {
  const statusList: string[] = [];
  //Since all jobs belong to same customer/project, just grabbing first.
  const billingEmail = jobs[0].project?.billingEmail || jobs[0].customer?.email;
  jobs.forEach((job: any) => {
    const invoicingStatus = jobInvoiceStatusService.getQueueJobInvoiceStatus(
      job,
      billingEmail
    );
    statusList.push(invoicingStatus);
  });
  return statusList.includes(InvoicingQueueStatus.MissingInfo) ? false : true;
};

export const validateDiscardInvoicesRules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isAnyStatusPaid = await invoiceService.isAnyStatusPaid(
      res.locals.orgId,
      req.body.invoiceIds
    );

    if (isAnyStatusPaid == true) {
      return res.status(400).json({
        errors: [
          'Validation failed. Cannot discard invoice(s) in the paid status.',
        ],
      });
    }
  } catch (error) {
    console.error('Error validating jobs for invoicing: ', error);
    next(error);
  }
  next();
};
