-- AlterTable
ALTER TABLE "OrganizationCustomField" ADD COLUMN     "showCrew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showCustomer" BOOLEAN NOT NULL DEFAULT false;
