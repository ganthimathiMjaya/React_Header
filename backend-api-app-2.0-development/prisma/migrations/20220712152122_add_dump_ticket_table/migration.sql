-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "dumpTicketId" INTEGER[];

-- CreateTable
CREATE TABLE "DumpTicket" (
    "id" SERIAL NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "dumpsterId" INTEGER,
    "disposalSiteId" INTEGER,
    "photosId" INTEGER,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "DumpTicket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DumpTicket" ADD CONSTRAINT "DumpTicket_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DumpTicket" ADD CONSTRAINT "DumpTicket_dumpsterId_fkey" FOREIGN KEY ("dumpsterId") REFERENCES "Dumpster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DumpTicket" ADD CONSTRAINT "DumpTicket_disposalSiteId_fkey" FOREIGN KEY ("disposalSiteId") REFERENCES "DisposalSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DumpTicket" ADD CONSTRAINT "DumpTicket_photosId_fkey" FOREIGN KEY ("photosId") REFERENCES "Photos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
