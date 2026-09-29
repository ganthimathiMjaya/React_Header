import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class CustomerRepository {
  async findAll(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findMany();
  }

  async findFirst(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findFirst({
      where: { id },
    });
  }

  async findByQBId(orgId: string, qbId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findFirst({
      where: { qbId },
    });
  }

  async create(orgId: string, data: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.create({
      data,
    });
  }

  async update(orgId: string, customerId: string, data: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.update({
      where: {
        id: customerId,
      },
      data: data,
    });
  }

  async updateNotes(orgId: string, customerId: string, notes: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        notes: notes,
      },
    });
  }

  async findAllQbIdNull(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findMany({
      where: {
        qbId: null,
      },
    });
  }

  async findAllQbIdNotNull(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findMany({
      where: {
        qbId: {
          not: null,
        },
      },
    });
  }

  async findAllQbIdMatches(orgId: string, qbIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findMany({
      select: {
        qbId: true,
      },
      where: {
        qbId: {
          in: qbIds,
        },
      },
    });
  }

  async findAllCustomerNames(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        qbId: null,
      },
    });
  }

  async getMetrics(orgId: string, customerId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    // using raw SQL query since prisma does not support complex aggregation
    return await prisma.$queryRaw`SELECT COUNT(j."id"):: INT AS "totalJobs"
      , (SELECT COUNT(j2."id"):: INT FROM public."Job" j2 WHERE c."id" = j2."customerId" AND j2."statusId" = (SELECT s.id FROM public."Status" s WHERE s."content" = 'Complete')
      ) AS "totalCompleteJobs"
      , (SELECT COUNT(j3."id"):: INT FROM public."Job" j3 WHERE c."id" = j3."customerId" AND j3."bookingId" IS NOT NULL) AS "totalJobsBookedFromApp"
      , (SELECT COUNT(p."id"):: INT FROM public."Project" p WHERE c."id" = p."customerId" AND p."isActive" IS TRUE AND p."isDeleted" IS FALSE) AS "totalActiveProjects"
      , (SELECT COUNT(p."id"):: INT FROM public."Project" p WHERE c."id" = p."customerId" AND p."isDeleted" IS FALSE) AS "totalProjects"
      , (SELECT SUM(invd."cost" * invd."quantity") FROM public."Invoice" i JOIN public."InvoiceDetail" invd ON i."id" = invd."invoiceId" AND invd."isDeleted" IS FALSE WHERE c."id" = i."customerId" AND i."isDeleted" IS FALSE) AS "totalSubTotal"
      , (SELECT SUM((invd."cost" * invd."quantity" * (COALESCE(invd."taxRate", 0) / 100))) FROM public."Invoice" i JOIN public."InvoiceDetail" invd ON i."id" = invd."invoiceId" AND invd."isDeleted" IS FALSE WHERE c."id" = i."customerId") AS "totalTax"
      , (SELECT SUM((invd."cost" * invd."quantity") + (invd."cost" * invd."quantity" * (COALESCE(invd."taxRate", 0) / 100))) FROM public."Invoice" i JOIN public."InvoiceDetail" invd ON i."id" = invd."invoiceId" AND invd."isDeleted" IS FALSE WHERE c."id" = i."customerId") AS "totalRevenue"
    FROM public."Customer" c
      JOIN public."Job" j ON c."id" = j."customerId"
    WHERE c."active" IS TRUE
      AND c."id" = ${customerId}
    GROUP BY c."id";`;
  }
}
