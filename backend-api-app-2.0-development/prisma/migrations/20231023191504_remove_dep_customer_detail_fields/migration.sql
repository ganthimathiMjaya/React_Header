/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_categoryId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";

/*
  Warnings:

  - You are about to drop the column `holdIfOverdue` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `onHold` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerm` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `printInvoicing` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "holdIfOverdue",
DROP COLUMN "onHold",
DROP COLUMN "paymentTerm",
DROP COLUMN "printInvoicing";
