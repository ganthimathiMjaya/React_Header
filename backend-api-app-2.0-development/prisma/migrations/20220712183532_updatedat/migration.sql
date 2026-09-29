-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "lastUpdatedById" INTEGER DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
