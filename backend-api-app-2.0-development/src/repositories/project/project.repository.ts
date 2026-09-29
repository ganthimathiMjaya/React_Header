import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';
import { Project } from '@prisma/client';

export class ProjectRepository {
  public async findUnique(
    orgId: string,
    projectId: string
  ): Promise<Project | null> {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  public async getAll(
    orgId: string,
    customerId: string,
    active: boolean
  ): Promise<Array<Project>> {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.project.findMany({
      where: {
        isDeleted: false,
        isActive: active,
        customerId,
      },
      include: {
        location: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  public async create(orgId: string, data: Project): Promise<Project> {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.project.create({
      data: {
        ...data,
      },
    });
  }

  public async update(
    orgId: string,
    _customerId: string,
    projectId: string,
    data: Project
  ): Promise<Project> {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.project.update({
      where: {
        id: projectId,
      },
      data,
    });
  }

  public async delete(orgId: string, projectId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    await prisma.project.update({
      data: {
        isDeleted: true,
      },
      where: {
        id: projectId,
      },
    });
  }
}
