/*
  Warnings:

  - You are about to drop the column `additionalNotes` on the `JobSubType` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JobType` table. All the data in the column will be lost.
  - You are about to drop the column `isOnBookingPortal` on the `JobType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobSubType" DROP CONSTRAINT "JobSubType_jobTypeId_fkey";

-- AlterTable
ALTER TABLE "JobSubType" DROP COLUMN "additionalNotes",
ADD COLUMN     "isOnBookingPortal" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "jobTypeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JobType" DROP COLUMN "description",
DROP COLUMN "isOnBookingPortal";

-- AddForeignKey
ALTER TABLE "JobSubType" ADD CONSTRAINT "JobSubType_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
