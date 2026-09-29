/*
  Warnings:

  - You are about to drop the column `paymentInstruction` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `billingAddressLine1` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCity` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingEmail` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingPhone` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingState` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingZipcode` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "paymentInstruction",
ADD COLUMN     "billingAddressLine1" TEXT NOT NULL,
ADD COLUMN     "billingAddressLine2" TEXT,
ADD COLUMN     "billingCity" TEXT NOT NULL,
ADD COLUMN     "billingEmail" TEXT NOT NULL,
ADD COLUMN     "billingPhone" TEXT NOT NULL,
ADD COLUMN     "billingState" TEXT NOT NULL,
ADD COLUMN     "billingZipcode" TEXT NOT NULL,
ADD COLUMN     "customerBillingNotes" TEXT;
