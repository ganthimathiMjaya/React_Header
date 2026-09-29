import { InvoicingQueueStatus } from '../../utils/enums/job.status';
import { QueueJobInvoicing } from '../../repositories/invoice/invoice.repository';

export class JobInvoiceStatusService {
  getQueueJobInvoiceStatus(
    job: QueueJobInvoicing,
    billingEmail: string | null
  ): InvoicingQueueStatus {
    const missingInfoStatus = InvoicingQueueStatus.MissingInfo;
    if (
      !billingEmail ||
      !job.scheduledDate ||
      !job.techReference ||
      !job.jobScope ||
      !job.customer?.name ||
      !job.jobType?.shortDescription ||
      !job.jobSubType?.name ||
      job.jobSubType?.cost === null ||
      job.jobSubType?.cost === undefined ||
      job.jobSubType?.isTaxable === null ||
      job.jobSubType?.isTaxable === undefined
    ) {
      return missingInfoStatus;
    }
    if (
      job.jobSubType.isTaxable &&
      (job.jobSubType.taxRateId === null ||
        job.jobSubType.taxRateId === undefined)
    ) {
      return missingInfoStatus;
    }

    return InvoicingQueueStatus.Ready;
  }
}
