-- DropIndex
DROP INDEX "JobSubType_name_key";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "dumpsterDropOffId" INTEGER;

-- AlterTable
ALTER TABLE "JobSubType" ALTER COLUMN "name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_dumpsterDropOffId_fkey" FOREIGN KEY ("dumpsterDropOffId") REFERENCES "Dumpster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
