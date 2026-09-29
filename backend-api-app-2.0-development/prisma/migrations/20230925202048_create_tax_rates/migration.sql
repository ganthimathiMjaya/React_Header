-- CreateTable
CREATE TABLE "OrganizationTaxRate" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "organizationSettingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "taxRatePercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "OrganizationTaxRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrganizationTaxRate" ADD CONSTRAINT "OrganizationTaxRate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTaxRate" ADD CONSTRAINT "OrganizationTaxRate_organizationSettingId_fkey" FOREIGN KEY ("organizationSettingId") REFERENCES "OrganizationSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
