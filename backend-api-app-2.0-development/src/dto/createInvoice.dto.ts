interface CreateInvoiceInterface {
  jobIds: string[];
}

export class CreateInvoiceDto {
  jobIds: string[];

  constructor(config: CreateInvoiceInterface) {
    this.jobIds = config.jobIds;
  }
}
