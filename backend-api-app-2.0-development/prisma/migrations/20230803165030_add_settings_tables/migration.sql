-- CreateTable
CREATE TABLE "OrganizationSetting" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "paymentInstructions" TEXT,
    "companyLogoS3Url" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationCustomFieldCategory" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationCustomFieldCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationCustomField" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "organizationSettingId" INTEGER NOT NULL,
    "organizationCustomFieldCategoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationJobCustomField" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "organizationCustomFieldId" INTEGER NOT NULL,
    "jobId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationJobCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationCustomerCustomField" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "organizationCustomFieldId" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationCustomerCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationProjectCustomField" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "organizationCustomFieldId" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationProjectCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrganizationSetting" ADD CONSTRAINT "OrganizationSetting_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCustomField" ADD CONSTRAINT "OrganizationCustomField_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCustomField" ADD CONSTRAINT "OrganizationCustomField_organizationSettingId_fkey" FOREIGN KEY ("organizationSettingId") REFERENCES "OrganizationSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCustomField" ADD CONSTRAINT "OrganizationCustomField_organizationCustomFieldCategoryId_fkey" FOREIGN KEY ("organizationCustomFieldCategoryId") REFERENCES "OrganizationCustomFieldCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationJobCustomField" ADD CONSTRAINT "OrganizationJobCustomField_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationJobCustomField" ADD CONSTRAINT "OrganizationJobCustomField_organizationCustomFieldId_fkey" FOREIGN KEY ("organizationCustomFieldId") REFERENCES "OrganizationCustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationJobCustomField" ADD CONSTRAINT "OrganizationJobCustomField_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCustomerCustomField" ADD CONSTRAINT "OrganizationCustomerCustomField_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCustomerCustomField" ADD CONSTRAINT "OrganizationCustomerCustomField_organizationCustomFieldId_fkey" FOREIGN KEY ("organizationCustomFieldId") REFERENCES "OrganizationCustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCustomerCustomField" ADD CONSTRAINT "OrganizationCustomerCustomField_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProjectCustomField" ADD CONSTRAINT "OrganizationProjectCustomField_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProjectCustomField" ADD CONSTRAINT "OrganizationProjectCustomField_organizationCustomFieldId_fkey" FOREIGN KEY ("organizationCustomFieldId") REFERENCES "OrganizationCustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProjectCustomField" ADD CONSTRAINT "OrganizationProjectCustomField_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- Enable Row Level Security
ALTER TABLE "OrganizationSetting" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "OrganizationSetting" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "OrganizationSetting" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "OrganizationSetting" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');


-- Enable Row Level Security
ALTER TABLE "OrganizationCustomField" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "OrganizationCustomField" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "OrganizationCustomField" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "OrganizationCustomField" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');


-- Enable Row Level Security
ALTER TABLE "OrganizationJobCustomField" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "OrganizationJobCustomField" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "OrganizationJobCustomField" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "OrganizationJobCustomField" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');


-- Enable Row Level Security
ALTER TABLE "OrganizationCustomerCustomField" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "OrganizationCustomerCustomField" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "OrganizationCustomerCustomField" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "OrganizationCustomerCustomField" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');


-- Enable Row Level Security
ALTER TABLE "OrganizationProjectCustomField" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "OrganizationProjectCustomField" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "OrganizationProjectCustomField" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "OrganizationProjectCustomField" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');


-- Enable Row Level Security
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "Project" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "Project" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "Project" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');