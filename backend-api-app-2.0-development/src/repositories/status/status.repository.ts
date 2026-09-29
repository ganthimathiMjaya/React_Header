import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class StatusRepository {
  async getStatusByContent(orgId: string, content: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.status.findFirstOrThrow({
      where: {
        content,
      },
    });
  }
}
