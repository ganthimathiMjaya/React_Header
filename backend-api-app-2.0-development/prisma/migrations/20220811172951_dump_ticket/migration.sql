-- DropForeignKey
ALTER TABLE "DumpTicket" DROP CONSTRAINT "DumpTicket_photosId_fkey";

-- AlterTable
ALTER TABLE "DumpTicket" ADD COLUMN     "disposalSiteNotPresentName" TEXT;

-- AlterTable
ALTER TABLE "Photos" ADD COLUMN     "dumpTicketId" INTEGER;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_dumpTicketId_fkey" FOREIGN KEY ("dumpTicketId") REFERENCES "DumpTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
