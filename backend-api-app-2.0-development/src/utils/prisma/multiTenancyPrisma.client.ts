import { Prisma, PrismaClient } from '@prisma/client';
/*
This function allows to bypass RowLevelSecurity, if table has the policy configured.
*/
const bypassRls = () => {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
        async $queryRaw({ args, query, operation }) {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    })
  );
};

/*
This function is used to enable multi-tenancy through the use of Postgres RLS (RowLevelSecurity). The set_config setting is scoped for each transaction, delegating the responsibility to Postgres to ONLY return data associated with the OrgId being passed.
In a nutshell, Postgres will apply extra RLS checks/filters to only return data associated with the org_id set.
*/
const forTenant = (orgId: string) => {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
        async $queryRaw({ args, query, operation }) {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    })
  );
};

//Using a separate client for bypassing to prevent both extensions being applied simultaneously
const prismaByPass = new PrismaClient();
const prisma = new PrismaClient();

export type ExtendedPrismaClient = ReturnType<typeof getPrismaClientForTenant>;

export const getPrismaClientForTenant = (orgId: string) => {
  return prisma.$extends(forTenant(orgId));
};

export const prismaClientBypass = prismaByPass.$extends(bypassRls());
