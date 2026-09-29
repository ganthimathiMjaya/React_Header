/*
  Warnings:

  - You are about to drop the column `jobSubTypeName` on the `InvoiceDetail` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `InvoiceDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InvoiceDetail" DROP COLUMN "jobSubTypeName",
DROP COLUMN "service";
