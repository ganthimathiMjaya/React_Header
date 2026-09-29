-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "nonDumpsterId" INTEGER;

-- CreateTable
CREATE TABLE "NonDumpsterJob" (
    "id" SERIAL NOT NULL,
    "crewNumber" TEXT,
    "totalHours" TEXT,
    "totalLoads" TEXT,
    "protectionMaterialCost" TEXT,
    "dumpsterOnSite" BOOLEAN,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "NonDumpsterJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_nonDumpsterId_fkey" FOREIGN KEY ("nonDumpsterId") REFERENCES "NonDumpsterJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
