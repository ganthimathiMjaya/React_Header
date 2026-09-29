/*
  Warnings:

  - You are about to drop the column `billingLine3` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "billingLine3",
ADD COLUMN     "billingPhone" TEXT;
