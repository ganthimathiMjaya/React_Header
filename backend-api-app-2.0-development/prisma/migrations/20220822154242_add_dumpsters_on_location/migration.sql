-- AlterTable
ALTER TABLE "Dumpster" ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "Dumpster" ADD CONSTRAINT "Dumpster_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
