/*
  Warnings:

  - Made the column `scheduledDate` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "scheduledDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "notes" TEXT;
