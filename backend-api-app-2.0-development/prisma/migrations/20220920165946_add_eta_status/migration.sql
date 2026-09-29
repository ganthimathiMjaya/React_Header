-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "etaStatusId" INTEGER;

-- CreateTable
CREATE TABLE "EtaStatus" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "EtaStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_etaStatusId_fkey" FOREIGN KEY ("etaStatusId") REFERENCES "EtaStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
