import { Readable } from 'stream';
import OrganizationSettingsRepository from '../../repositories/organizationSettings/organizationSettings.repository';
import { OrganizationCustomField, OrganizationTaxRate } from '@prisma/client';
import { s3Client } from '../../shared/s3Client';
import { QBIntegrationRepository } from '../../repositories/qb/qb.repository';

const repository = new OrganizationSettingsRepository();
const qbRepository = new QBIntegrationRepository();

export interface CompanyLogo {
  image: Buffer;
  key: string;
}

export default class OrganizationSettingsService {
  public async upsertCustomFields(orgId: string, customFields: any[]) {
    const updatedCustomFields: OrganizationCustomField[] = [];
    const organizationCustomFieldCategoryId = (
      await repository.findFirstCustomFieldCategoryOrThrow('JOB')
    ).id;

    let organizationSettingId = 0;
    try {
      organizationSettingId = (
        await repository.getFirstOrganizationSettingOrThrow(orgId)
      ).id;
    } catch {
      await repository.createOrgSettingWithOrgId(orgId);
    }

    const promises = customFields.map(async (customField: any) => {
      const upsertCustomField: OrganizationCustomField =
        await repository.upsertCustomField(orgId, {
          id: customField.id,
          organizationSettingId,
          organizationCustomFieldCategoryId,
          name: customField.name,
          isInvoiceable: customField.isInvoiceable,
          showCrew: customField.showCrew,
          showCustomer: customField.showCustomer,
          isActive: customField.isActive,
          isDeleted: customField.isDeleted,
          orgId,
          createdAt: customField.createdAt || new Date(),
          updatedAt: customField.updatedAt || new Date(),
        });
      updatedCustomFields.push(upsertCustomField);
    });
    await Promise.all(promises);
    const currentCustomFields = await repository.getCustomFields(orgId);
    return currentCustomFields;
  }

  public async getCustomFields(orgId: string) {
    return repository.getCustomFields(orgId);
  }

  public async createTaxRates(orgId: string, taxRates: any[]) {
    const organizationSettingId: number = (
      await repository.getFirstOrganizationSettingOrThrow(orgId)
    ).id;

    await repository.createManyTaxRates(
      orgId,
      taxRates.map((taxRate: any) => ({
        organizationSettingId,
        name: taxRate.name,
        taxRatePercent: taxRate.taxRatePercent,
      }))
    );
    const currentTaxRates = await repository.getTaxRates(orgId);
    return currentTaxRates;
  }

  public async getTaxRates(orgId: string) {
    return repository.getTaxRates(orgId);
  }

  public async getTimeZone(orgId: string) {
    return repository.getTimeZone(orgId);
  }

  public async updateTimeZone(orgId: string, orgSettingId: number, timezone: string) {
    return await repository.updateTimeZone(orgId, orgSettingId, timezone)
  }

  public async deleteTaxRates(orgId: string, rateIds: number[]) {
    return repository.deleteTaxRates(orgId, rateIds);
  }

  public async getJobSubTypeByRates(orgId: string, rateIds: number[]) {
    return repository.getJobSubTypeByRates(orgId, rateIds);
  }

  public async getPaymentInstructions(orgId: string) {
    return await repository.getPaymentInstructions(orgId);
  }

  public async addPaymentInstructions(
    orgId: string,
    paymentInstructions: string
  ) {
    return await repository.addPaymentInstructions(orgId, paymentInstructions);
  }

  public async updatePaymentInstructions(
    orgId: string,
    orgSettingId: number,
    paymentInstructions: string
  ) {
    return await repository.updatePaymentInstructions(
      orgId,
      orgSettingId,
      paymentInstructions
    );
  }

  public async uploadCompanyLogo(orgId: string, s3Key: string) {
    await repository.uploadCompanyLogo(orgId, s3Key);
  }

  public async getCompanyLogo(orgId: string): Promise<CompanyLogo | null> {
    const s3Key = await repository.getCompanyLogoKey(orgId);
    if (
      s3Key !== undefined &&
      s3Key !== null &&
      s3Key.companyLogoS3Key !== undefined &&
      s3Key.companyLogoS3Key !== null
    ) {
      let response = await s3Client.getObject({
        Bucket: process.env.AWS_BUCKET,
        Key: `${s3Key.companyLogoS3Key}`,
      });

      const stream = response.Body as Readable;

      let buffer = new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('end', () => {
          resolve(Buffer.concat(chunks));
        });
        stream.once('error', reject);
      });

      return {
        image: await buffer,
        key: s3Key.companyLogoS3Key,
      };
    }
    return null;
  }

  public async deleteCompanyLogo(orgId: string) {
    await repository.deleteCompanyLogo(orgId);
  }

  public async getInvoiceMessage(orgId: string) {
    return await repository.getInvoiceMessage(orgId);
  }

  public async addInvoiceMessage(orgId: string, invoiceMessage: string) {
    return await repository.addInvoiceMessage(orgId, invoiceMessage);
  }

  public async updateInvoiceMessage(
    orgId: string,
    orgSettingId: number,
    invoiceMessage: string
  ) {
    return await repository.updateInvoiceMessage(
      orgId,
      orgSettingId,
      invoiceMessage
    );
  }

  public async getOrganizationSettings(orgId: string) {
    return await repository.getOrganizationSettings(orgId);
  }

  public async getCompanyInfo(orgId: string) {
    return await repository.getCompanyInfo(orgId);
  }

  public async addCompanyInfo(
    orgId: string,
    companyInfo: {
      companyName: string;
      phoneNumber: string;
      address: string;
      invoiceEmail: string;
    }
  ) {
    return await repository.addCompanyInfo(orgId, companyInfo);
  }

  public async updateCompanyInfo(
    orgId: string,
    orgSettingId: number,
    companyInfo: {
      companyName: string;
      phoneNumber: string;
      address: string;
      invoiceEmail: string;
    }
  ) {
    return await repository.updateCompanyInfo(orgId, orgSettingId, companyInfo);
  }

  public async getQuickBooksEnabled(orgId: string) {
    const setting = await repository.getQuickBooksEnabled(orgId);
    const tokens = await qbRepository.getTokens(orgId);
    let tokensExpired = null;
    if (tokens) {
      tokensExpired = tokens.tokensExpired;
    }
    return {
      ...setting,
      quickbooksApiTokensExist: tokens ? true : false,
      tokensExpired,
    };
  }

  public async getOrganizationsQuickBooksEnabled() {
    const organizations = await repository.getAllOrganizations();
    return organizations.filter(
      (org: any) => org.OrganizationSetting?.quickbooksEnabled
    );
  }
}
