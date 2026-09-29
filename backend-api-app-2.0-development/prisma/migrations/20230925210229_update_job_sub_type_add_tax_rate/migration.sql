-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "taxRateId" INTEGER;

-- AddForeignKey
ALTER TABLE "JobSubType" ADD CONSTRAINT "JobSubType_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "OrganizationTaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
