import {
  getPrismaClientForTenant,
  prismaClientBypass,
} from '../../utils/prisma/multiTenancyPrisma.client';
import { OrganizationCustomField } from '@prisma/client';

export default class OrganizationSettingsRepository {
  public async findFirstCustomFieldCategoryOrThrow(code: string) {
    return prismaClientBypass.organizationCustomFieldCategory.findFirstOrThrow({
      where: { code, isDeleted: false },
    });
  }

  public async upsertCustomField(orgId: string, data: OrganizationCustomField) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationCustomField.upsert({
      where: { id: data.id || -1 }, //Upsert requires a unique field, using -1 to avoid an error if data.id is null in the ui because it's a new record.
      create: {
        ...data,
      },
      update: {
        ...data,
      },
    });
  }

  public async getCustomFields(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationCustomField.findMany({
      where: {
        AND: [{ orgId }, { isActive: true }, { isDeleted: false }],
      },
      orderBy: { id: 'asc' },
    });
  }

  public async getTimeZone(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationSetting.findFirst({
      where: {
        orgId: orgId,
      },
      select: {
        id: true,
        timezone: true
      },
    })
  }

  public async updateTimeZone(
    orgId: string,
    id: number,
    timezone: string
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.update({
      data: {
        timezone: timezone,
      },
      where: {
        id: id,
      },
    });
  }

  public async createManyTaxRates(orgId: string, rates: any[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationTaxRate.createMany({ data: rates });
  }

  public async deleteTaxRates(orgId: string, rateIds: number[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationTaxRate.deleteMany({
      where: {
        id: {
          in: rateIds,
        },
      },
    });
  }

  public async getJobSubTypeByRates(orgId: string, rateIds: number[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.jobSubType.findMany({
      where: {
        taxRateId: {
          in: rateIds,
        },
      },
      include: {
        taxRate: true,
      },
    });
  }

  public async getTaxRates(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationTaxRate.findMany({
      where: { orgId },
      orderBy: { id: 'asc' },
    });
  }

  public async getPaymentInstructions(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.organizationSetting.findFirstOrThrow({
      where: {
        isDeleted: {
          equals: false,
        },
        orgId: {
          equals: orgId,
        },
      },
      select: {
        id: true,
        paymentInstructions: true,
      },
    });
  }

  public async addPaymentInstructions(
    orgId: string,
    paymentInstructions: string
  ) {
    const prisma = getPrismaClientForTenant(orgId);

    // there should only ever be one organiation setting record per orgId that is active at a time
    const doesOrgSettingExistForOrgId =
      await this.doesOrganizationSettingRecordExist(orgId);

    // if an organization setting record has never been created by the licensee admin, create one
    if (doesOrgSettingExistForOrgId === 0) {
      return await prisma.organizationSetting.create({
        data: {
          paymentInstructions: paymentInstructions,
          orgId: orgId,
        },
      });
    } else {
      // otherwise update the existing record
      const orgSetting = await this.getFirstOrganizationSettingOrThrow(orgId);

      if (orgSetting !== null) {
        return await this.updatePaymentInstructions(
          orgId,
          orgSetting.id,
          paymentInstructions
        );
      }
    }
  }

  public async updatePaymentInstructions(
    orgId: string,
    id: number,
    paymentInstructions: string
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.update({
      data: {
        paymentInstructions: paymentInstructions,
      },
      where: {
        id: id,
      },
    });
  }

  public async uploadCompanyLogo(orgId: string, s3Key: string) {
    const prisma = getPrismaClientForTenant(orgId);
    // there should only ever be one organization setting record per orgId that is active at a time
    const doesOrgSettingExistForOrgId =
      await this.doesOrganizationSettingRecordExist(orgId);

    // if an organization setting record has never been created by the licensee admin, create one
    if (doesOrgSettingExistForOrgId === 0) {
      return prisma.organizationSetting.create({
        data: {
          companyLogoS3Key: s3Key,
          orgId: orgId,
        },
      });
    } else {
      // otherwise update the existing record
      const orgSetting = await this.getFirstOrganizationSettingOrThrow(orgId);

      if (orgSetting !== null) {
        await this.updateCompanyLogo(orgId, orgSetting.id, s3Key);
      }
    }
  }

  public async updateCompanyLogo(orgId: string, id: number, s3Key: string) {
    const prisma = getPrismaClientForTenant(orgId);
    await prisma.organizationSetting.update({
      data: {
        companyLogoS3Key: s3Key,
      },
      where: {
        id: id,
      },
    });
  }

  public async getCompanyLogoKey(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.findFirstOrThrow({
      where: {
        orgId: {
          equals: orgId,
        },
        isDeleted: {
          equals: false,
        },
      },
      select: {
        companyLogoS3Key: true,
      },
    });
  }

  public async deleteCompanyLogo(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const orgSetting = await this.getFirstOrganizationSettingOrThrow(orgId);

    await prisma.organizationSetting.update({
      data: {
        companyLogoS3Key: null,
      },
      where: {
        id: orgSetting.id,
      },
    });
  }

  public async getFirstOrganizationSettingOrThrow(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.findFirstOrThrow({
      where: {
        orgId: {
          equals: orgId,
        },
        isDeleted: {
          equals: false,
        },
      },
    });
  }

  public async doesOrganizationSettingRecordExist(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.count({
      where: {
        orgId: {
          equals: orgId,
        },
        isDeleted: {
          equals: false,
        },
      },
    });
  }

  public async getInvoiceMessage(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.organizationSetting.findFirstOrThrow({
      where: {
        isDeleted: {
          equals: false,
        },
        orgId: {
          equals: orgId,
        },
      },
      select: {
        id: true,
        invoiceMessage: true,
      },
    });
  }

  public async addInvoiceMessage(orgId: string, invoiceMessage: string) {
    const prisma = getPrismaClientForTenant(orgId);

    // there should only ever be one organization setting record per orgId that is active at a time
    const doesOrgSettingExistForOrgId =
      await this.doesOrganizationSettingRecordExist(orgId);

    // if an organization setting record has never been created by the licensee admin, create one
    if (doesOrgSettingExistForOrgId === 0) {
      return await prisma.organizationSetting.create({
        data: {
          invoiceMessage: invoiceMessage,
          orgId: orgId,
        },
      });
    } else {
      // otherwise update the existing record
      const orgSetting = await this.getFirstOrganizationSettingOrThrow(orgId);

      if (orgSetting !== null) {
        return await this.updateInvoiceMessage(
          orgId,
          orgSetting.id,
          invoiceMessage
        );
      }
    }
  }

  public async updateInvoiceMessage(
    orgId: string,
    id: number,
    invoiceMessage: string
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.update({
      data: {
        invoiceMessage: invoiceMessage,
      },
      where: {
        id: id,
      },
    });
  }

  public async getOrganizationSettings(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.findFirstOrThrow({
      include: {
        OrganizationCustomField: true,
        organizationTaxRate: true,
      },
    });
  }

  public async getCompanyInfo(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.organizationSetting.findFirstOrThrow({
      where: {
        isDeleted: {
          equals: false,
        },
        orgId: {
          equals: orgId,
        },
      },
      select: {
        id: true,
        companyName: true,
        address: true,
        phoneNumber: true,
        invoiceEmail: true,
        companyLogoS3Key: true,
      },
    });
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
    const prisma = getPrismaClientForTenant(orgId);
    // there should only ever be one organization setting record per orgId that is active at a time
    const doesOrgSettingExistForOrgId =
      await this.doesOrganizationSettingRecordExist(orgId);

    // if an organization setting record has never been created by the licensee admin, create one
    if (doesOrgSettingExistForOrgId === 0) {
      return await prisma.organizationSetting.create({
        data: {
          address: companyInfo.address,
          companyName: companyInfo.companyName,
          phoneNumber: companyInfo.phoneNumber,
          invoiceEmail: companyInfo.invoiceEmail,
          orgId: orgId,
        },
      });
    } else {
      // otherwise update the existing record
      const orgSetting = await this.getFirstOrganizationSettingOrThrow(orgId);

      if (orgSetting !== null) {
        return await this.updateCompanyInfo(orgId, orgSetting.id, companyInfo);
      }
    }
  }

  public async updateCompanyInfo(
    orgId: string,
    id: number,
    companyInfo: {
      companyName: string;
      phoneNumber: string;
      address: string;
      invoiceEmail: string;
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.update({
      data: {
        address: companyInfo.address,
        companyName: companyInfo.companyName,
        phoneNumber: companyInfo.phoneNumber,
        invoiceEmail: companyInfo.invoiceEmail,
        orgId: orgId,
      },
      where: {
        id: id,
      },
    });
  }

  public async createOrgSettingWithOrgId(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.create({
      data: {
        orgId: orgId,
      },
    });
  }

  public async getQuickBooksEnabled(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.organizationSetting.findFirstOrThrow({
      where: {
        orgId,
      },
      select: {
        quickbooksEnabled: true,
      },
    });
  }
  public async getAllOrganizations() {
    return prismaClientBypass.organization.findMany({
      where: { isDeleted: false },
      include: {
        OrganizationSetting: true,
      },
    });
  }
}
