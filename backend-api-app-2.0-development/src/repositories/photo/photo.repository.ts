import { PhotoSource, PhotoType } from '@prisma/client';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class PhotoRepository {
  async getPhotosFilteredBy(
    orgId: string,
    where: { jobId: string; source: PhotoSource; type: PhotoType }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.photos.findMany({
      where,
      select: {
        url: true,
        type: true,
      },
    });
  }
}
