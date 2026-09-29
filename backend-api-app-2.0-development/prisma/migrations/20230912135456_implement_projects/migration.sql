/*
  Warnings:

  - You are about to drop the column `locationId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_locationId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "locationId",
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "projectAccountingSoftware" TEXT,
ADD COLUMN     "projectBillingNotes" TEXT,
ADD COLUMN     "projectCity" TEXT,
ADD COLUMN     "projectCommunityName" TEXT,
ADD COLUMN     "projectLine1" TEXT,
ADD COLUMN     "projectLine2" TEXT,
ADD COLUMN     "projectLine3" TEXT,
ADD COLUMN     "projectName" TEXT,
ADD COLUMN     "projectState" TEXT,
ADD COLUMN     "projectZipcode" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "notes",
ADD COLUMN     "accountingSoftware" TEXT,
ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "billingNotes" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
