-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_locationId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "TradePartner" ALTER COLUMN "active" SET DEFAULT false,
ALTER COLUMN "capacity" SET DEFAULT 0,
ALTER COLUMN "locationId" DROP NOT NULL,
ALTER COLUMN "typeId" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
