import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class CrewRepository {
  async findFirstCrewAssignmentFilteredBy(
    orgId: string,
    where: { customerId: string; crewId: string; jobTypeId: number }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.crewAssignment.findFirst({
      where,
    });
  }

  async deleteCrewAssignment(orgId: string, id: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.crewAssignment.delete({
      where: { id },
    });
  }

  async createCrewAssignment(
    orgId: string,
    data: { customerId: string; crewId: string; jobTypeId: number }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.crewAssignment.create({
      data,
    });
  }
}
