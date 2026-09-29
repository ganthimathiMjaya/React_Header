import { InvoiceDetail, OrganizationSetting } from '@prisma/client';
import OrganizationSettingsService, {
  CompanyLogo,
} from '../organizationSettings/organizationSettings.service';
import { formatCurrency } from '../../utils/number';

const orgService = new OrganizationSettingsService();

interface TemplateInput {
  invoice: any;
  logo: CompanyLogo | null;
  fileExtension: string;
  paymentInstructions: string;
  subtotal: number;
  taxes: number;
  total: number;
  customerAddress: any;
  orgSetting: OrganizationSetting;
}

export class InvoicePdfTemplateService {
  async getInvoicePdfTemplate(orgId: string, invoices: any[]) {
    //TODO: Add custom fields.
    const logo: CompanyLogo | null = await orgService.getCompanyLogo(orgId);
    let fileExtension = '';
    if (logo?.key) {
      fileExtension = logo.key.substring(
        logo.key.lastIndexOf('.') + 1,
        logo.key.length
      );
    }
    return invoices.reduce((acc, invoice) => {
      const customerAddress = invoice.customer?.location?.address;
      const orgSettings = invoice.tenantOrganization?.OrganizationSetting;
      const orgSetting = orgSettings?.length ? orgSettings[0] : undefined;
      const paymentInstructions = orgSetting?.paymentInstructions || '';

      const subtotal = invoice.invoiceDetail?.reduce(
        (acc: number, detail: InvoiceDetail) => acc + (detail.amount ?? 0),
        0
      );
      const subtotalTaxable = invoice.invoiceDetail?.reduce(
        (acc: number, detail: InvoiceDetail) =>
          acc + (detail.isTaxable ? detail.amount || 0 : 0),
        0
      );
      const taxes = invoice.taxRate
        ? subtotalTaxable * (invoice.taxRate / 100)
        : 0;
      const total = subtotal + taxes;

      const invoiceHtml = `
     <html>
      <head>
        <title>Invoice</title>
        <link rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Mulish">
        <style>
          body {
            padding: 0px 60px 60px 60px;
            font-family: 'Mulish', 'Helvetica', 'Arial', sans-serif;
            font-size: 16px;
            line-height: 24px;
          }

          body > h4 {
            font-size: 32px;
            text-transform: uppercase;
            margin: 0px;
            font-style: normal;
            font-weight: 400;
            line-height: 40px;
          }

          body > header {
            display: flex;
            flex-direction: column;
          }

          .header-row {
            display: flex;
            flex-direction: row;
            margin-top: 10px;
            justify-content: space-between;
          }

          .address-block address {
            font-style: normal;
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            letter-spacing: 0.4px;
          }

          .customer-address {
            text-align: left;
          }
          .project-address {
            text-align: center;
          }
          .invoice-details {
            text-align: right;
          }

          .address-block > h5,
          .address-block > .org-address > h5,
          .address-block > .org-phone > h5 {
            font-size: 14px;
            margin: 0px 0px 8px 0px;
            text-transform: capitalize;
            color: #000;
            font-style: normal;
            font-weight: 500;
            line-height: 20px;
            letter-spacing: 0.1px;
          }

          .org-details {
            display: flex;
            flex-direction: row;
            max-width: 200px;
            justify-content: flex-start;
          }
          .org-phone {
            max-width: 200px;
            min-width: 150px;
          }
          .org-address {
            max-width: 200px;
            min-width: 150px;
          }

          .table-items {
            width: 100%;
            margin-top: 30px;
          }

          .table-items table {
            width: 650px;
            table-layout: fixed;
            border-collapse: collapse;
          }

          .table-totals {
            width: 200px;
            margin-top: 30px;
            margin-left: auto;
            margin-right: 0;
          }

          .table-totals table {
            width: 200px;
            table-layout: fixed;
            border-collapse: collapse;
          }

          .table-items table tr th {
            color: #000;
            font-size: 12px;
            font-style: normal;
            font-weight: 500;
            line-height: 20px;
            letter-spacing: 0.1px;
            border-bottom: 1px solid #717971;
            text-align: center;
          }
          .table-items table tr td {
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
            letter-spacing: 0.4px;
            color: #000000;
          }
          .table-totals table tr td {
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
            letter-spacing: 0.4px;
            color: #000000;
            border-bottom: 1px solid #dde5da;
          }

          .table-totals table tr td {
            color: #414941;
          }

          .payment-details {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-top: 30px;
            break-inside: avoid;
            page-break-after: always;
          }
          .payment-details-card {
            width: 45%;
            height: 200px;
            display: flex;
            flex-direction: column;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;
            letter-spacing: 0.4px;
          }
          .message {
            background-color: #f0f1ec;
            height: 20px;
            padding: 5px;
          }
          .message-value {
            background-color: #fcfdf7;
            height: 100px;
            padding: 5px;
          }
        </style>
      </head>
      <body>
          ${this.getInvoiceBodyTemplate({
            invoice,
            logo,
            fileExtension,
            paymentInstructions,
            subtotal,
            taxes,
            total,
            customerAddress,
            orgSetting,
          })}
      </body>
    </html>
    `;
      return acc + invoiceHtml;
    }, '');
  }

  getInvoiceBodyTemplate({
    invoice,
    logo,
    fileExtension,
    paymentInstructions,
    subtotal,
    taxes,
    total,
    customerAddress,
    orgSetting,
  }: TemplateInput) {
    return `
        <h4>Invoice #${invoice.invoiceNo}</h4>
        <header>
          <div class="header-row">
            <div class="address-block org-details">
              <div class="org-address">
                <h5>${orgSetting?.companyName || '&nbsp;'}</h5>
                <address>
                  ${orgSetting?.address || '&nbsp;'}
                </address>
              </div>
              <div class="org-phone">
                <h5>&nbsp;</h5>
                <address style="margin-left: 10px;">
                  ${orgSetting?.phoneNumber || '&nbsp;'}<br />
                  ${orgSetting?.invoiceEmail || '&nbsp;'}<br />
                </address>
              </div>
            </div>
            <div>
              <address>
              ${this.getCompanyLogoTemplate(logo, fileExtension)}
              </address>
            </div>
          </div>
          <div class="header-row">
            <div class="address-block customer-address">
              <h5>Bill To:</h5>
              <address>
                ${invoice.customer?.name}<br />
                ${customerAddress?.line1}<br />
                ${customerAddress?.city}, ${customerAddress?.state} ${
      customerAddress?.zipcode
    }<br />
              </address>
            </div>
            <div class="address-block project-address">
              <h5>&nbsp;</h5>
              <address>
                ${invoice.projectName}<br />
                ${invoice.projectLine1}<br />
                ${invoice.projectCity}, ${invoice.projectState} ${
      invoice.projectZipcode
    }<br />
              </address>
            </div>
            <div class="address-block invoice-details">
              <h5>&nbsp;</h5>
              <address>
                Terms: ${invoice.terms} days<br />
                Invoicing Date: ${invoice.invoiceDate?.toLocaleDateString(
                  'en-US'
                )}<br />
                Due Date: ${invoice.dueDate?.toLocaleDateString('en-US')}<br />
              </address>
            </div>
          </div>
        </header>
        <div class="table-items">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; width: 100px;">Date of Service</th>
                <th style="text-align: left; width: 357px;">Description</th>
                <th style="text-align: center; width: 25px;">Qty</th>
                <th style="text-align: center; width: 84px;">Rate</th>
                <th style="text-align: right; width: 84px;">Amount</th>
              </tr>
            </thead>
            <tbody>
            ${invoice.invoiceDetail?.reduce(
              (acc: string, item: InvoiceDetail) => {
                const row: string = `
                <tr>
                  <td style="text-align: left">${item.serviceDate?.toLocaleDateString(
                    'en-US'
                  )}</td>
                  <td style="text-align: left">
                    ${item.description}
                  </td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: center">${formatCurrency(
                    item.cost
                  )}</td>
                  <td style="text-align: right">${formatCurrency(
                    item.amount
                  )} ${item.isTaxable ? ' T' : ''}</td>
                </tr>
                ${this.getCustomFields(item)}
                `;
                return acc + row;
              },
              ''
            )}
            </tbody>
          </table>
        </div>
        <div class="table-totals">
          <table>
            <tbody>
              <tr>
                <td style="text-align: left; width: 100px; border-bottom: none;">Subtotal</td>
                <td style="text-align: right; width: 100px; border-bottom: none;">${formatCurrency(
                  subtotal
                )}</td>
              </tr>
              <tr>
                <td style="text-align: left">Sales Tax (${
                  invoice.taxRate
                }%)</td>
                <td style="text-align: right">${formatCurrency(taxes)}</td>
              </tr>
              <tr>
                <td style="text-align: left">Total</td>
                <td style="text-align: right">${formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="payment-details">
          <div class="payment-details-card">
            <div class="message">Message</div>
            <div class="message-value">${invoice.messageOnInvoice}</div>
          </div>
          <div class="payment-details-card">
            <div class="message">Accepted Payment Instructions</div>
            <div class="message-value">${paymentInstructions}</div>
          </div>
        </div>
    `;
  }

  getCustomFields(invoiceDetail: any) {
    return invoiceDetail.customFields.length > 0
      ? `
        <tr>
          <td colspan="5" style="text-align: left;border-bottom: 1px solid #DDE5DA;">
            ${invoiceDetail.customFields
              .map((field: any) => {
                return (
                  `<span style="color:#717971">
                    ${field.organizationCustomFieldName}: &nbsp;&nbsp;
                  </span>` +
                  `${field.customFieldValue}` +
                  `&nbsp;&nbsp;&nbsp;`
                );
              })
              .join('')}
          </td>
        </tr>
      `
      : '';
  }

  getCompanyLogoTemplate(logo: any, fileExtension: any) {
    return logo?.image
      ? `<img style="height: 75px; width: 75px;" src="data:image/${fileExtension};base64,${
          logo?.image?.toString('base64') || ''
        }"/>`
      : '&nbsp;';
  }

  getFooterTemplate(imLogoDataUrl: string) {
    return `
      <div style="margin-top: 30px; width: 100%; text-align: center;">
        <div style="color: var(--scrap-it-source-primary, #006230);
          font-size: 9px;
          font-style: normal;
          font-weight: 600;
          line-height: 16px;
          letter-spacing: 0.5px;">Powered By</div>
        <img style="height: 50px; width: 82px;" src="${imLogoDataUrl}" alt="scrapItLogo" />
      </div>`;
  }

  getHeaderTemplate() {
    return `
    <div style="width: 100%; font-size: 10px;
        padding: 5px 5px 0; color: #bbb; position: relative;">
        <div style="position: absolute; left: 70px; top: 5px;"><span class="date"></span></div>
        <div style="position: absolute; right: 70px; top: 5px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>
    </div>`;
  }
}
