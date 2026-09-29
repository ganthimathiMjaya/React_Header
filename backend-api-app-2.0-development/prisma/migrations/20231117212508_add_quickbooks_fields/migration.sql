/*
  Warnings:

  - A unique constraint covering the columns `[qbId]` on the table `JobSubType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "qbId" TEXT,
ADD COLUMN     "qbIncomeAccountRef" TEXT,
ADD COLUMN     "qbSyncToken" TEXT,
ADD COLUMN     "scrappySyncToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "JobSubType_qbId_key" ON "JobSubType"("qbId");
