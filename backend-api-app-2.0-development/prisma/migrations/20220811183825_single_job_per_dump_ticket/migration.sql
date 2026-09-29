/*
  Warnings:

  - A unique constraint covering the columns `[jobId]` on the table `DumpTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DumpTicket_jobId_key" ON "DumpTicket"("jobId");
