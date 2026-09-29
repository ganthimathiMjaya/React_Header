/*
  Warnings:

  - You are about to drop the column `customTaxRate` on the `JobSubType` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `OrganizationSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobSubType" DROP COLUMN "customTaxRate";

-- AlterTable
ALTER TABLE "OrganizationSetting" DROP COLUMN "taxRate";
