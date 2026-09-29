-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "primaryContactId" TEXT,
ADD COLUMN     "secondaryContactId" TEXT;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_secondaryContactId_fkey" FOREIGN KEY ("secondaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
