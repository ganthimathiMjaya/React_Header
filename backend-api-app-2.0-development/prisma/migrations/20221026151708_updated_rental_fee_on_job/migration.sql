/*
  Warnings:

  - You are about to drop the column `rentalFeeOverride` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "rentalFeeOverride",
ADD COLUMN     "rentalFees" DOUBLE PRECISION;
