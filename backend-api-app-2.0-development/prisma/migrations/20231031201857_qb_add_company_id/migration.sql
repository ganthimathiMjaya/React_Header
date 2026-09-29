/*
  Warnings:

  - Added the required column `companyId` to the `QBIntegrationTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QBIntegrationTokens" ADD COLUMN     "companyId" TEXT NOT NULL;
