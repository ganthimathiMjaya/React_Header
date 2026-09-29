export class UpdateJobNotesDto {
  jobScope: string;
  crewNotes: string;
  jobNotes: string;
  invoiceNotes: string;
  customerInvoicingNotes: string;

  constructor(
    jobScope: string,
    crewNotes: string,
    jobNotes: string,
    invoiceNotes: string,
    customerInvoicingNotes: string
  ) {
    this.jobScope = jobScope;
    this.crewNotes = crewNotes;
    this.jobNotes = jobNotes;
    this.invoiceNotes = invoiceNotes;
    this.customerInvoicingNotes = customerInvoicingNotes;
  }
}
