-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_createdById_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "recurringJobEnd" TIMESTAMP(3),
ADD COLUMN     "recurringJobStart" TIMESTAMP(3),
ALTER COLUMN "timeSlot" SET DEFAULT E'All Day',
ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
