/*
  Warnings:

  - You are about to drop the `HyphenTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "scheduledDate" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "scheduledDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "dumpsterPickupId" SET DEFAULT '999',
ALTER COLUMN "dumpsterPickupSize" SET DEFAULT '30 Yds';

-- DropTable
DROP TABLE "HyphenTest";

-- CreateTable
CREATE TABLE "HyphenPurchaseOrder" (
    "id" TEXT NOT NULL,
    "stringifiedOrder" TEXT NOT NULL,

    CONSTRAINT "HyphenPurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HyphenPurchaseOrder_id_key" ON "HyphenPurchaseOrder"("id");
