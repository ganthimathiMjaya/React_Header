-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "customTaxRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "isTaxable" BOOLEAN;

-- AlterTable
ALTER TABLE "OrganizationSetting" ADD COLUMN     "taxRate" DOUBLE PRECISION;
