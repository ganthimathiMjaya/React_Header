/*
  Warnings:

  - You are about to drop the column `multiFamily` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "multiFamily";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "multiFamily" BOOLEAN;
