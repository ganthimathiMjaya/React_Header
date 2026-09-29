interface InvoiceInterface {
  id: string;
  statusId: number | null;
  statusName?: string | null;
  invoiceNo: string | null;
  terms: number | null;
  invoiceDate: Date | null;
  dueDate: Date | null;
  customerId?: string | null;
  customerName?: string | null;
  projectId: string | null;
  projectName: string | null;
  accountingSoftware: string | null;
  messageOnInvoice?: string | null;
  lineItemsCount: number;
  taxRate: number | null;
  total: number | null;
  subTotal: number | null;
  tax: number | null;
  billingEmail?: string | null;
  invoicingNotes: string | null;
  customerNotes?: string | null;
  projectInvoicingNotes?: string | null;
  invoiceNotes?: string;
  billingAddress: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
  projectAddress: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
  invoiceDetails: InvoiceDetailDto[];
  canSyncToQuickBooks: boolean;
  syncToQb?: boolean | null;
  qbId?: string | null;
  qbSyncToken?: string | null;
  scrappySyncToken?: string | null;
  qbLastSynced?: Date | null;
  qbSyncFailed?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class InvoiceDto {
  id: string;
  statusId: number | null;
  statusName?: string | null;
  invoiceNo: string | null;
  terms: number | null;
  invoiceDate: Date | null;
  dueDate: Date | null;
  customerId?: string | null;
  customerName?: string | null;
  projectId: string | null;
  projectName: string | null;
  accountingSoftware: string | null;
  lineItemsCount: number;
  taxRate: number | null;
  subTotal: number | null;
  tax: number | null;
  total: number | null;
  billingEmail?: string | null;
  invoicingNotes: string | null;
  customerNotes?: string | null;
  projectInvoicingNotes?: string | null;
  messageOnInvoice?: string | null;
  invoiceNotes?: string;
  billingAddress: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
  projectAddress: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
  invoiceDetails: InvoiceDetailDto[];
  canSyncToQuickBooks: boolean;
  syncToQb?: boolean | null;
  qbId?: string | null;
  qbSyncToken?: string | null;
  scrappySyncToken?: string | null;
  qbLastSynced?: Date | null;
  qbSyncFailed?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  constructor(config: InvoiceInterface) {
    this.id = config.id;
    this.statusId = config.statusId;
    this.statusName = config.statusName;
    this.invoiceNo = config.invoiceNo;
    this.terms = config.terms;
    this.invoiceDate = config.invoiceDate;
    this.dueDate = config.dueDate;
    this.customerId = config.customerId;
    this.customerName = config.customerName;
    this.projectId = config.projectId;
    this.projectName = config.projectName;
    this.accountingSoftware = config.accountingSoftware;
    this.lineItemsCount = config.lineItemsCount;
    this.taxRate = config.taxRate;
    this.tax = config.tax;
    this.messageOnInvoice = config.messageOnInvoice;
    this.subTotal = config.subTotal;
    this.total = config.total;
    this.billingEmail = config.billingEmail;
    this.invoicingNotes = config.invoicingNotes;
    this.customerNotes = config.customerNotes;
    this.projectInvoicingNotes = config.projectInvoicingNotes;
    this.invoiceNotes = config.invoiceNotes;
    this.billingAddress = config.billingAddress;
    this.projectAddress = config.projectAddress;
    this.invoiceDetails = config.invoiceDetails;
    this.canSyncToQuickBooks = config.canSyncToQuickBooks;
    this.syncToQb = config.syncToQb;
    this.qbId = config.qbId;
    this.qbSyncToken = config.qbSyncToken;
    this.scrappySyncToken = config.scrappySyncToken;
    this.qbLastSynced = config.qbLastSynced;
    this.qbSyncFailed = config.qbSyncFailed;
    this.createdAt = config.createdAt;
    this.updatedAt = config.updatedAt;
  }
}

interface InvoiceDetailInterface {
  id: string;
  orgId: string;
  qbRef: string;
  qbClass: string;
  invoiceId: string;
  invoiceLineNo?: number | null;
  lineItemType: string;
  jobId?: string | null;
  jobTypeId?: number | null;
  jobSubTypeId?: number | null;
  service?: string | null;
  jobSubTypeName?: string | null;
  serviceDate?: Date | null;
  description?: string | null;
  quantity: number;
  cost?: number | null;
  amount?: number | null;
  isTaxable?: boolean | null;
  taxRate?: number | null;
  crewFirstName?: string | null;
  crewLastName?: string | null;
  isDeleted?: boolean | null;
}

export class InvoiceDetailDto {
  id: string;
  orgId: string;
  qbRef: string;
  qbClass: string;
  invoiceId: string;
  invoiceLineNo?: number | null;
  lineItemType: string;
  jobId?: string | null;
  jobTypeId?: number | null;
  jobSubTypeId?: number | null;
  service?: string | null;
  jobSubTypeName?: string | null;
  serviceDate?: Date | null;
  description?: string | null;
  quantity: number;
  cost?: number | null;
  amount?: number | null;
  isTaxable?: boolean | null;
  taxRate?: number | null;
  crewFirstName?: string | null;
  crewLastName?: string | null;
  isDeleted?: boolean | null;

  constructor(config: InvoiceDetailInterface) {
    this.id = config.id;
    this.orgId = config.orgId;
    this.qbRef = config.qbRef;
    this.qbClass = config.qbClass;
    this.invoiceId = config.invoiceId;
    this.invoiceLineNo = config.invoiceLineNo;
    this.lineItemType = config.lineItemType;
    this.jobId = config.jobId;
    this.jobTypeId = config.jobTypeId;
    this.jobSubTypeId = config.jobSubTypeId;
    this.service = config.service;
    this.jobSubTypeName = config.jobSubTypeName;
    this.serviceDate = config.serviceDate;
    this.description = config.description;
    this.quantity = config.quantity;
    this.cost = config.cost;
    this.amount = config.amount;
    this.isTaxable = config.isTaxable;
    this.taxRate = config.taxRate;
    this.crewFirstName = config.crewFirstName;
    this.crewLastName = config.crewLastName;
    this.isDeleted = config.isDeleted;
  }
}
