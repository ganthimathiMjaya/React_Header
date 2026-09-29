-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_primaryContactId_fkey";

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "primaryContactId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
