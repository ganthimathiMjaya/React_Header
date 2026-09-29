-- DropForeignKey
ALTER TABLE "Photos" DROP CONSTRAINT "Photos_jobId_fkey";

-- AlterTable
ALTER TABLE "Photos" ALTER COLUMN "jobId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
