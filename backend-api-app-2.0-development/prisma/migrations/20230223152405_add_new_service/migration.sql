-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_jobId_fkey";

-- DropIndex
DROP INDEX "Feedback_jobId_key";

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "jobId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;
