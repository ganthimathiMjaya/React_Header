const AdmZip = require('adm-zip');
import { InvoiceRepository } from '../../repositories/invoice/invoice.repository';
import { generatePdf, getLogoDataUrl } from '../../utils/pdf/puppeteer.util';
import { InvoicePdfTemplateService } from './invoicePdfTemplate.service';
import { scrapItLogoBase64 } from '../../data/scrapitLogo';

const invoiceRepository = new InvoiceRepository();
const invoicePdfTemplateService = new InvoicePdfTemplateService();

export class InvoicePdfService {
  async getInvoicePdf(orgId: string, invoiceIds: string[]) {
    const invoices = await invoiceRepository.getByIds(orgId, invoiceIds);
    if (!invoices.length) {
      throw new Error('No invoices found');
    }
    const footerTemplate = invoicePdfTemplateService.getFooterTemplate(
      `data:image/png;base64,${scrapItLogoBase64}`
    );
    const headerTemplate = invoicePdfTemplateService.getHeaderTemplate();
    const html = await invoicePdfTemplateService.getInvoicePdfTemplate(
      orgId,
      invoices
    );
    return await generatePdf(html, footerTemplate, headerTemplate);
  }

  async getInvoicesPdf(orgId: string, invoiceIds: string[]) {
    const invoices = await invoiceRepository.getByIds(orgId, invoiceIds);
    if (!invoices.length) {
      throw new Error('No invoices found');
    }
    const imLogoDataUrl = await getLogoDataUrl();
    const footerTemplate =
      invoicePdfTemplateService.getFooterTemplate(imLogoDataUrl);
    const headerTemplate = invoicePdfTemplateService.getHeaderTemplate();
    const zipTool = new AdmZip();
    //if more than one, return a zip.
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      const html = await invoicePdfTemplateService.getInvoicePdfTemplate(
        orgId,
        [invoice]
      );
      const pdf = await generatePdf(html, footerTemplate, headerTemplate);
      const fileName = `invoice-${invoice.invoiceNo}.pdf`;
      zipTool.addFile(fileName, pdf, fileName);
    }
    return zipTool.toBuffer();
  }
}
