
/*
--------------------------------------------------
-- IMPORTANT:
this SQL statement was manually added in order to allow the backfilling of UserOrganization records based
on existing User records.
*/
SELECT set_config('app.bypass_rls', 'on', TRUE);
--------------------------------------------------
/*
The purpose of this migration is to add the new table UserOrganization to enable explicit support for users to belong to multiple tenants for each user
*/
--------------------------------------------------

-- Create UserOrganization table
CREATE TABLE "UserOrganization" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3), 

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserOrganization_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserOrganization_userId_orgId_unique" UNIQUE ("userId", "orgId")
);

-- Add multi-tenant policies to UserOrganization
ALTER TABLE "UserOrganization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserOrganization" FORCE ROW LEVEL SECURITY;
CREATE POLICY bypass_rls_policy ON "UserOrganization" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY tenant_isolation_policy ON "UserOrganization" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- INSERT UserOrganization records based on existing Users
INSERT INTO "UserOrganization" (
    "userId",
    "orgId",
    "updatedAt"
)
SELECT "id",
    "orgId",
    CURRENT_TIMESTAMP
FROM "User";

-- DROP multi-tenant policies from User table
DROP POLICY bypass_rls_policy ON "User";
DROP POLICY tenant_isolation_policy ON "User";
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- DROP orgId column from User table
ALTER TABLE "User"
DROP COLUMN "orgId";