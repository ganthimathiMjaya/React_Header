-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobSubTypeId" INTEGER;

-- CreateTable
CREATE TABLE "JobSubType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "jobTypeId" INTEGER NOT NULL,

    CONSTRAINT "JobSubType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobSubType_name_key" ON "JobSubType"("name");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobSubTypeId_fkey" FOREIGN KEY ("jobSubTypeId") REFERENCES "JobSubType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSubType" ADD CONSTRAINT "JobSubType_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
