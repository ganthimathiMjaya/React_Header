import { Auth0Service } from '../../services/auth0/auth0.service';
import {
  getPrismaClientForTenant,
  prismaClientBypass,
} from '../../utils/prisma/multiTenancyPrisma.client';

const auth0Service = new Auth0Service();

export default class OrganizationController {
  public async initUserOrg(userId: number, orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);

    try {
      const orgExists =
        (await prisma.organization.count({
          where: {
            id: orgId,
          },
        })) > 0;
      if (!orgExists) {
        await this.initOrg(orgId);
      }

      return await prisma.userOrganization.create({
        data: {
          userId,
        },
        include: {
          tenantOrganization: true,
        },
      });
    } catch (error: any) {
      if (error.code !== 'P2002') {
        console.error(
          `Failed to create UserOrganization (userId: ${userId}, orgId: ${orgId}).`,
          error
        );
      }
    }
  }

  public async initOrg(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    try {
      const orgName = await auth0Service.getOrgName(orgId);
      //Create organization record
      await prisma.organization.create({
        data: {
          id: orgId,
          name: orgName || orgId,
        },
      });
      //Create 1:1 organizationSetting record
      const organizationSettingId = (
        await prisma.organizationSetting.create({
          data: {
            orgId,
          },
        })
      ).id;

      const organizationCustomFieldCategoryId = (
        await prismaClientBypass.organizationCustomFieldCategory.findFirstOrThrow(
          {
            where: { code: 'JOB', isDeleted: false },
          }
        )
      ).id;

      //Create 5 (inactive) JOB organizationCustomField records
      await prisma.organizationCustomField.createMany({
        data: [
          {
            organizationSettingId,
            organizationCustomFieldCategoryId,
            name: 'Default Name',
            isActive: false,
          },
          {
            organizationSettingId,
            organizationCustomFieldCategoryId,
            name: 'Default Name',
            isActive: false,
          },
          {
            organizationSettingId,
            organizationCustomFieldCategoryId,
            name: 'Default Name',
            isActive: false,
          },
          {
            organizationSettingId,
            organizationCustomFieldCategoryId,
            name: 'Default Name',
            isActive: false,
          },
          {
            organizationSettingId,
            organizationCustomFieldCategoryId,
            name: 'Default Name',
            isActive: false,
          },
        ],
      });
    } catch (error: any) {
      if (error.code !== 'P2002') {
        console.error(`Failed to create organization (id: ${orgId})`, error);
        return;
      }
    }
  }
}
