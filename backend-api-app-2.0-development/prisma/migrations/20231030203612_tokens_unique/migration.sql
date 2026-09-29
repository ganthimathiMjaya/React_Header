/*
  Warnings:

  - A unique constraint covering the columns `[orgId]` on the table `QBIntegrationTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QBIntegrationTokens_orgId_key" ON "QBIntegrationTokens"("orgId");
