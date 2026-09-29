-- DropForeignKey
ALTER TABLE "Dumpster" DROP CONSTRAINT "Dumpster_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "Dumpster" DROP CONSTRAINT "Dumpster_statusId_fkey";

-- AlterTable
ALTER TABLE "Dumpster" ALTER COLUMN "number" DROP NOT NULL,
ALTER COLUMN "sizeId" DROP NOT NULL,
ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Dumpster" ADD CONSTRAINT "Dumpster_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dumpster" ADD CONSTRAINT "Dumpster_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
