import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export default class GlobalSearchRepository {
  public async getAllGlobalSearchRecords(orgId: string, searchTerm: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const likeSearchTerm = '%' + searchTerm + '%';

    // using raw SQL query since prisma does not support UNIONs
    return await prisma.$queryRaw`
    SELECT 
      x."recordId"
      , x."uniqueIdentifier"
      , x."mainMenuItem"
      , x."secondaryMenuItem"
      , x."recordType" 
    FROM (
      SELECT 
        j."id" AS "recordId",
        j."techReference" AS "uniqueIdentifier", 
        jt."description" AS "mainMenuItem",
        c."name" AS "secondaryMenuItem",
        'JOB' AS "recordType",
        1 AS rank,
        c."name" AS ordering
      FROM public."Job" j
        JOIN public."Customer" c ON c.id = j."customerId" AND c.active = true
        JOIN public."Location" l ON l.id = j."locationId" AND l.active = true
        JOIN public."Address" a ON a.id = l."addressId" AND a.active = true
        JOIN public."JobType" jt ON jt.id = j."jobTypeId" AND jt."isDeleted" = false
        JOIN public."Project" p ON p.id = j."projectId" AND p."isDeleted" = false
      WHERE 
        LOWER(c."name") LIKE LOWER(${likeSearchTerm}) OR LOWER(a."line1") LIKE LOWER(${likeSearchTerm}) OR
        LOWER(j."jobScope") LIKE LOWER(${likeSearchTerm}) OR LOWER(p."name") LIKE LOWER(${likeSearchTerm})
      UNION
      SELECT 
        CAST(u."id" AS TEXT) AS "recordId",
        u."firstName" || ' ' || u."lastName" AS "uniqueIdentifier",
        u."firstName" || ' ' || u."lastName" AS "mainMenuItem",
        '' AS "secondaryMenuItem",
        'USER' AS "recordType",
        2 AS rank,
        u."firstName" || u."lastName" AS ordering
      FROM public."User" u
        JOIN public."Contact" c ON c."ownerId" = u.id
        JOIN public."Email" e ON e."contactId" = c.id
        JOIN public."Phone" p ON p."contactId" = c.id
      WHERE 
        u.active = true AND 
        (
          LOWER(u."firstName") LIKE LOWER(${likeSearchTerm}) OR LOWER(u."lastName") LIKE LOWER(${likeSearchTerm}) OR
          LOWER(e."address") LIKE LOWER(${likeSearchTerm}) OR p."number" LIKE LOWER(${likeSearchTerm})
        )
      UNION
      SELECT 
        p."id" AS "recordId",
        p."name" AS "uniqueIdentifier",
        p."name" AS "mainMenuItem",
        c."name" AS "secondaryMenuItem",
        'PROJECT' AS "recordType",
        3 AS rank,
        p."name" AS ordering
      FROM public."Project" p
        JOIN public."Customer" c ON c.id = p."customerId" AND c.active = true
        JOIN public."Location" l ON p."locationId" = l.id AND l.active = true
        JOIN public."Address" a ON a.id = l."addressId" AND a.active = true
      WHERE 
        p."isDeleted" = false AND 
        (
          LOWER(p."name") LIKE LOWER(${likeSearchTerm}) OR LOWER(a."line1") LIKE LOWER(${likeSearchTerm})
        )
      UNION
      SELECT 
        i."id" AS "recordId",
        i."invoiceNo" AS "uniqueIdentifier",
        i."invoiceNo" AS "mainMenuItem",
        c."name" AS "secondaryMenuItem",
        'INVOICE' AS "recordType",
        4 AS rank,
        i."invoiceNo" AS ordering
      FROM public."Invoice" i
        JOIN public."Customer" c ON c.id = i."customerId" AND c.active = true
      WHERE 
        i."isDeleted" = false AND 
        (
          LOWER(c."name") LIKE LOWER(${likeSearchTerm}) OR LOWER(i."projectName") LIKE LOWER(${likeSearchTerm}) OR
          LOWER(i."billingEmail") LIKE LOWER(${likeSearchTerm})
        )
    ) x ORDER BY x.rank, x.ordering`;
  }
}
