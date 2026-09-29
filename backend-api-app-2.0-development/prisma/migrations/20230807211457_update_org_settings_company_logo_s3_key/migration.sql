/*
  Warnings:

  - You are about to drop the column `companyLogoS3Url` on the `OrganizationSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrganizationSetting" DROP COLUMN "companyLogoS3Url",
ADD COLUMN     "companyLogoS3Key" TEXT;
