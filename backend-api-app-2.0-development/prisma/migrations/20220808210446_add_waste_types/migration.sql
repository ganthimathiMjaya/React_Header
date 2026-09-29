-- AlterTable
ALTER TABLE "DumpTicket" ADD COLUMN     "wasteTypeId" INTEGER;

-- CreateTable
CREATE TABLE "WasteType" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "WasteType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DumpTicket" ADD CONSTRAINT "DumpTicket_wasteTypeId_fkey" FOREIGN KEY ("wasteTypeId") REFERENCES "WasteType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
