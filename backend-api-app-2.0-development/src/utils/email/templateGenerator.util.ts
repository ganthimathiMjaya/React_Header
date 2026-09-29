import {
  TemplateGeneratorInput,
  RescheduleTemplate,
  CancelTemplate,
  ReportTemplate,
  PushTemplate,
  JobsRollingOverTemplate,
  JobsForTomorrowTemplate,
  JobScopeModifiedTemplate,
  SendInvoiceTemplate,
} from './template.types';
import { formatCurrency } from '../number';

export const generateRescheduleTemplate = ({
  subject,
  address,
  city,
  scheduledDate,
  timeSlot,
}: TemplateGeneratorInput): RescheduleTemplate => {
  return {
    subject: subject || '',
    job: {
      address: address || '',
      city: city || '',
    },
    schedule: scheduledDate ? scheduledDate.toDateString() : '',
    timeWindow: timeSlot || '',
  };
};

export const generateCancelTemplate = ({
  subject,
  address,
  city,
  customerName,
  scheduledDate,
  jobSubType,
  jobScope,
  crewName,
  userName,
}: TemplateGeneratorInput): CancelTemplate => {
  return {
    subject: subject || '',
    job: {
      address: address || '',
      city: city || '',
      customerName: customerName || '',
      scheduledDate: scheduledDate
        ? new Date(scheduledDate).toDateString()
        : '',
      jobSubType: jobSubType || '',
      jobScope: jobScope || '',
      crewName: crewName || '',
      userName: userName || '',
    },
  };
};

export const generateReportTemplate = ({
  subject,
  address,
  city,
  notes,
  techReference,
  customerName,
  scheduledDate,
  jobSubType,
  jobScope,
  crewName,
  userName,
}: TemplateGeneratorInput): ReportTemplate => {
  return {
    subject: subject || '',
    notes: notes || '',
    job: {
      address: address || '',
      city: city || '',
      techReference: techReference || '',
      customerName: customerName || '',
      scheduledDate: scheduledDate
        ? new Date(scheduledDate).toDateString()
        : '',
      jobSubType: jobSubType || '',
      jobScope: jobScope || '',
      crewName: crewName || '',
      userName: userName || '',
    },
  };
};

export const generatePushTemplate = ({
  subject,
  address,
  city,
  appNotes,
  customerName,
  scheduledDate,
  jobSubType,
  jobScope,
  crewName,
  userName,
}: TemplateGeneratorInput): PushTemplate => {
  return {
    subject: subject || '',
    appNotes: appNotes || '',
    job: {
      address: address || '',
      city: city || '',
      customerName: customerName || '',
      scheduledDate: scheduledDate
        ? new Date(scheduledDate).toDateString()
        : '',
      jobSubType: jobSubType || '',
      jobScope: jobScope || '',
      crewName: crewName || '',
      userName: userName || '',
    },
  };
};

export const generateJobScopeChangedTemplate = ({
  subject,
  job,
}: TemplateGeneratorInput): JobScopeModifiedTemplate => {
  return {
    subject: subject || '',
    job: {
      jobScope: job?.jobScope || '',
      techReference: job?.techReference || '',
    },
  };
};

export const generateJoshRollingOverTemplate = ({
  subject,
  jobRollingOverCount,
  jobs,
}: TemplateGeneratorInput): JobsRollingOverTemplate => {
  return {
    subject: subject || '',
    jobRollingOverCount: jobRollingOverCount || 0,
    jobs: jobs || [],
  };
};

export const generateJobsForTomorrowTemplate = ({
  subject,
  address,
  city,
  techReference,
  customerName,
  scheduledDate,
  jobSubType,
  jobScope,
  crewName,
}: TemplateGeneratorInput): JobsForTomorrowTemplate => {
  return {
    subject: subject || '',
    job: {
      address: address || '',
      city: city || '',
      techReference: techReference || '',
      customerName: customerName || '',
      scheduledDate: scheduledDate
        ? new Date(scheduledDate).toDateString()
        : '',
      jobSubType: jobSubType || '',
      jobScope: jobScope || '',
      crewName: crewName || '',
    },
  };
};

export const generateInvoiceTemplate = ({
  invoice,
  companyLogoKey,
}: TemplateGeneratorInput): SendInvoiceTemplate => {
  let subtotal = 0;
  const details = invoice.invoiceDetail?.map((detail: any) => {
    subtotal += detail.amount;
    return {
      service: detail.jobSubType.name || '',
      serviceDate: detail.serviceDate?.toLocaleDateString('en-US'),
      description: detail.description || '',
      quantity: detail.quantity,
      cost: formatCurrency(detail.cost),
      amount: `${formatCurrency(detail.amount)}${detail.isTaxable ? ' T' : ''}`,
    };
  });
  const orgSettings = invoice.tenantOrganization?.OrganizationSetting;
  const orgSetting = orgSettings?.length ? orgSettings[0] : undefined;
  const taxRate = invoice.taxRate;
  const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + taxAmount;
  return {
    invoice: {
      customer: invoice.customer.name || '',
      dueDate: invoice.dueDate?.toLocaleDateString('en-US') || '',
      invoiceNo: invoice.invoiceNo || '',
      subtotal: formatCurrency(subtotal),
      taxAmount: formatCurrency(taxAmount),
      total: formatCurrency(total),
      billingEmail: invoice.billingEmail || '',
      billingName: orgSetting?.companyName || '',
      billingAddressLine1: invoice.billingLine1 || '',
      billingAddressLine2: invoice.billingLine2 || '',
      billingAddressLine3: invoice.billingLine3 || '',
      billingCity: invoice.billingCity || '',
      billingState: invoice.billingState || '',
      billingZipcode: invoice.billingZipcode || '',
      terms: invoice.terms || 30,
      projectName: invoice.projectName || '',
      projectLine1: invoice.projectLine1 || '',
      projectLine2: invoice.projectLine2 || '',
      projectLine3: invoice.projectLine3 || '',
      projectCity: invoice.projectCity || '',
      projectState: invoice.projectState || '',
      projectZipcode: invoice.projectZipcode || '',
      imageUrl: companyLogoKey || '',
      invoiceDetails: details,
    },
  };
};
