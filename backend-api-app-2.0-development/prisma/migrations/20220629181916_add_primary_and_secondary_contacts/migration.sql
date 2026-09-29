-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "primaryContactId" TEXT,
ADD COLUMN     "secondaryContactId" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_secondaryContactId_fkey" FOREIGN KEY ("secondaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
