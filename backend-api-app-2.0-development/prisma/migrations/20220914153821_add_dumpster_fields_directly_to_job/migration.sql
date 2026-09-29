/*
  Warnings:

  - You are about to drop the column `locationId` on the `Dumpster` table. All the data in the column will be lost.
  - You are about to drop the `Size` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DumpTicket" DROP CONSTRAINT "DumpTicket_dumpsterId_fkey";

-- DropForeignKey
ALTER TABLE "Dumpster" DROP CONSTRAINT "Dumpster_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Dumpster" DROP CONSTRAINT "Dumpster_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "Dumpster" DROP CONSTRAINT "Dumpster_statusId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_dumpsterDropOffId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_dumpsterId_fkey";

-- AlterTable
ALTER TABLE "DumpTicket" ALTER COLUMN "dumpsterId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Dumpster" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "dumpsterDropoffId" TEXT,
ADD COLUMN     "dumpsterDropoffSize" TEXT,
ADD COLUMN     "dumpsterPickupId" TEXT,
ADD COLUMN     "dumpsterPickupSize" TEXT;

-- DropTable
DROP TABLE "Size";
