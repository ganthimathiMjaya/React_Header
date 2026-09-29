/*
  Warnings:

  - A unique constraint covering the columns `[qbId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "qbId" TEXT,
ADD COLUMN     "qbLastSynced" TIMESTAMPTZ(3),
ADD COLUMN     "qbSyncFailed" BOOLEAN,
ADD COLUMN     "qbSyncToken" TEXT,
ADD COLUMN     "scrappySyncToken" TEXT,
ADD COLUMN     "syncToQb" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_qbId_key" ON "Invoice"("qbId");
