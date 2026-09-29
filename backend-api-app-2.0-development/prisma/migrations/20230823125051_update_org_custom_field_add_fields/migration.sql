-- AlterTable
ALTER TABLE "OrganizationCustomField" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInvoiceable" BOOLEAN NOT NULL DEFAULT false;
