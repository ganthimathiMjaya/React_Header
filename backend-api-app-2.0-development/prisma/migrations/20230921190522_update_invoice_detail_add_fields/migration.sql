-- AlterTable
ALTER TABLE "InvoiceDetail" ADD COLUMN     "crewFirstName" TEXT,
ADD COLUMN     "crewLastName" TEXT,
ADD COLUMN     "jobSubTypeId" INTEGER,
ADD COLUMN     "jobSubTypeName" TEXT;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_jobSubTypeId_fkey" FOREIGN KEY ("jobSubTypeId") REFERENCES "JobSubType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
