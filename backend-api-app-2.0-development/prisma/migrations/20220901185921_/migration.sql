/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Dumpster` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "resources" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "invoiceReady" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TradePartner" ADD COLUMN     "resources" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Dumpster_number_key" ON "Dumpster"("number");
