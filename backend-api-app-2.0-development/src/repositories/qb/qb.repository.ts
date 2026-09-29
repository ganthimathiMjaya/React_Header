import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class QBIntegrationRepository {
  public async storeTokens(
    orgId: string,
    realmId: string,
    refreshToken: string,
    accessToken?: string
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.qBIntegrationTokens.create({
      data: {
        orgId: orgId,
        companyId: realmId,
        refreshToken: refreshToken,
        accessToken: accessToken,
        tokensExpired: false,
      },
    });
  }

  public async updateTokens(
    orgId: string,
    realmId: string,
    refreshToken: string,
    accessToken?: string
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.qBIntegrationTokens.update({
      where: {
        orgId,
      },
      data: {
        companyId: realmId,
        refreshToken: refreshToken,
        accessToken: accessToken,
        tokensExpired: false,
      },
    });
  }

  public async clearTokens(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.qBIntegrationTokens.deleteMany({
      where: {
        orgId,
      },
    });
  }

  public async getTokens(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.qBIntegrationTokens.findFirst({
      where: {
        orgId,
      },
    });
  }

  public async setTokensExpired(orgId: string, value: boolean) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.qBIntegrationTokens.update({
      where: {
        orgId,
      },
      data: {
        tokensExpired: value,
      },
    });
  }
}
