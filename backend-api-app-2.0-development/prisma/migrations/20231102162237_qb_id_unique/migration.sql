/*
  Warnings:

  - A unique constraint covering the columns `[qbId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_qbId_key" ON "Customer"("qbId");
