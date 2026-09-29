-- AlterTable
ALTER TABLE "UserOrganization" ADD COLUMN     "isPushNotificationAllowed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "pushNotificationToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- Enable Row Level Security
ALTER TABLE "UserDevice" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "UserDevice" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "UserDevice" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "UserDevice" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
