import { InvoicingQueueStatus } from '../utils/enums/job.status';

interface QueueJobInterface {
  jobId: string;
  invoicingStatus: InvoicingQueueStatus;
  jobStatusId: number;
  jobTechReference: string;
  billingEmail?: string | null;
  jobNotes?: string | null;
  crewNotes?: string | null;
  customerNotes?: string | null;
  projectInvoicingNotes?: string | null;
  projectName?: string | null;
  accountingSoftware?: string | null;
  invoiceNotes?: string | null;
  dateOfService?: Date;
  customerName?: string;
  jobTypeName?: string;
  jobSubTypeName?: string;
  jobTypeId?: number;
  jobSubTypeId?: number | null;
  jobScope?: string;
  crewFullName?: string;
  crewFirstName?: string;
  crewLastName?: string;
  quantity: number;
  rate?: number | null;
  isTaxable?: boolean | null;
  taxRate?: number | null;
  total?: number;
  customFields?: any[];
}

export class QueueJobDto {
  jobId: string;
  invoicingStatus: InvoicingQueueStatus;
  jobStatusId: number;
  jobTechReference: string;
  billingEmail?: string | null;
  jobNotes?: string | null;
  crewNotes?: string | null;
  customerNotes?: string | null;
  projectInvoicingNotes?: string | null;
  projectName?: string | null;
  accountingSoftware?: string | null;
  invoiceNotes?: string | null;
  dateOfService?: Date;
  customerName?: string;
  jobTypeName?: string;
  jobSubTypeName?: string;
  jobTypeId?: number;
  jobSubTypeId?: number | null;
  jobScope?: string;
  crewFullName?: string;
  crewFirstName?: string;
  crewLastName?: string;
  quantity: number;
  rate?: number | null;
  isTaxable?: boolean | null;
  taxRate?: number | null;
  total?: number;
  customFields?: any[];

  constructor(config: QueueJobInterface) {
    this.jobId = config.jobId;
    this.invoicingStatus = config.invoicingStatus;
    this.jobStatusId = config.jobStatusId;
    this.jobTechReference = config.jobTechReference;
    this.billingEmail = config.billingEmail;
    this.jobNotes = config.jobNotes;
    this.projectInvoicingNotes = config.projectInvoicingNotes;
    this.projectName = config.projectName;
    this.accountingSoftware = config.accountingSoftware;
    this.invoiceNotes = config.invoiceNotes;
    this.crewNotes = config.crewNotes;
    this.customerNotes = config.customerNotes;
    this.dateOfService = config.dateOfService;
    this.customerName = config.customerName;
    this.jobTypeName = config.jobTypeName;
    this.jobSubTypeName = config.jobSubTypeName;
    this.jobTypeId = config.jobTypeId;
    this.jobSubTypeId = config.jobSubTypeId;
    this.jobScope = config.jobScope;
    this.crewFullName = config.crewFullName;
    this.crewFirstName = config.crewFirstName;
    this.crewLastName = config.crewLastName;
    this.quantity = config.quantity;
    this.rate = config.rate;
    this.isTaxable = config.isTaxable;
    this.taxRate = config.taxRate;
    this.total = config.total;
    this.customFields = config.customFields;
  }
}
