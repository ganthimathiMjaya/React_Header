import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class InvoiceStatusRepository {
  async getStatusByCode(orgId: string, code: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoiceStatus.findFirstOrThrow({
      where: {
        code,
      },
    });
  }
}
