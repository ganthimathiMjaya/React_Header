/*
  Warnings:

  - Made the column `tradePartnerId` on table `TradePartnerUser` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CustomerUser" DROP CONSTRAINT "CustomerUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerUser" DROP CONSTRAINT "TradePartnerUser_tradePartnerId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerUser" DROP CONSTRAINT "TradePartnerUser_userId_fkey";

-- DropIndex
DROP INDEX "CustomerUser_userId_key";

-- AlterTable
ALTER TABLE "TradePartnerUser" ALTER COLUMN "tradePartnerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerUserId" TEXT,
ADD COLUMN     "tradePartnerUserId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tradePartnerUserId_fkey" FOREIGN KEY ("tradePartnerUserId") REFERENCES "TradePartnerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerUser" ADD CONSTRAINT "TradePartnerUser_tradePartnerId_fkey" FOREIGN KEY ("tradePartnerId") REFERENCES "TradePartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
