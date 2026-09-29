import { InvoiceRepository } from '../../repositories/invoice/invoice.repository';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoicePdf.service';
import { sendInvoiceEmail } from '../../utils/email/send.confirmation';
import { generateInvoiceTemplate } from '../../utils/email/templateGenerator.util';
import OrganizationSettingsRepository from '../../repositories/organizationSettings/organizationSettings.repository';

const invoiceService = new InvoiceService();
const invoicePdfService = new InvoicePdfService();
const invoiceRepository = new InvoiceRepository();
const orgSettingsRepository = new OrganizationSettingsRepository();

export class SendInvoiceService {
  async sendInvoices(orgId: string, invoiceIds: string[]) {
    const invoices = await invoiceRepository.getByIds(orgId, invoiceIds);
    const companyLogoKey = await orgSettingsRepository.getCompanyLogoKey(orgId);

    const promises = invoices.map(async (invoice) => {
      const pdf = await invoicePdfService.getInvoicePdf(orgId, [invoice.id]);
      const attachment = {
        content: (await pdf).toString('base64'),
        filename: `Invoice-${invoice.invoiceNo}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      };
      if (invoice.billingEmail) {
        await sendInvoiceEmail(
          [invoice.billingEmail],
          generateInvoiceTemplate({
            invoice,
            companyLogoKey: `https://${process.env.AWS_BUCKET}.s3.us-west-2.amazonaws.com/${companyLogoKey?.companyLogoS3Key}`,
          }),
          [attachment]
        );
      }
    });
    await Promise.all(promises);
    await invoiceService.markInvoicesSent(orgId, invoiceIds);
  }
}
