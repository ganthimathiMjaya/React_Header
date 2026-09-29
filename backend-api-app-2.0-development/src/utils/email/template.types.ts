export interface TemplateGeneratorInput {
  title?: string;
  subject?: string;
  address?: string;
  city?: string;
  scheduledDate?: Date;
  timeSlot?: string;
  job?: any;
  jobs?: any[];
  notes?: string;
  appNotes?: string;
  techReference?: string;
  jobRollingOverCount?: number;
  invoice?: any;
  companyLogoKey?: string | null;
  logoString?: string | null;
  logoFileExtension?: string | null;
  customerName?: string;
  jobSubType?: string;
  jobScope?: string;
  crewName?: string;
  userName?: string;
}

export interface RescheduleTemplate {
  subject: string;
  job: {
    address: string;
    city: string;
  };
  schedule: string;
  timeWindow: string;
}

export interface CancelTemplate {
  subject: string;
  job: {
    address: string;
    city: string;
    customerName: string;
    scheduledDate: string;
    jobSubType: string;
    jobScope: string;
    crewName: string;
    userName: string;
  };
}

export interface ReportTemplate {
  subject: string;
  notes: string;
  job: {
    address: string;
    city: string;
    techReference: string;
    customerName: string;
    scheduledDate: string;
    jobSubType: string;
    jobScope: string;
    crewName: string;
    userName: string;
  };
}

export interface PushTemplate {
  subject: string;
  appNotes: string;
  job: {
    address: string;
    city: string;
    customerName: string;
    scheduledDate: string;
    jobSubType: string;
    jobScope: string;
    crewName: string;
    userName: string;
  };
}

export interface JobScopeModifiedTemplate {
  subject: string;
  job: {
    techReference: string;
    jobScope: string;
  };
}

export interface JobsRollingOverTemplate {
  subject: string;
  jobRollingOverCount: number;
  jobs: {
    techReference: string;
  }[];
}

export interface JobsForTomorrowTemplate {
  subject: string;
  job: {
    address: string;
    city: string;
    techReference: string;
    customerName: string;
    scheduledDate: string;
    jobSubType: string;
    jobScope: string;
    crewName: string;
  };
}

export interface SendInvoiceTemplate {
  invoice: {
    customer: string;
    dueDate: string;
    invoiceNo: string;
    subtotal: string;
    taxAmount: string;
    total: string;
    billingEmail: string;
    billingName: string;
    billingAddressLine1: string;
    billingAddressLine2: string;
    billingAddressLine3: string;
    billingCity: string;
    billingState: string;
    billingZipcode: string;
    terms: number;
    projectName: string;
    projectLine1: string;
    projectLine2: string;
    projectLine3: string;
    projectCity: string;
    projectState: string;
    projectZipcode: string;
    imageUrl: string;
    invoiceDetails: {
      service: string;
      serviceDate: string;
      description: string;
      quantity: number;
      cost: string;
      amount: string;
    }[];
  };
}
