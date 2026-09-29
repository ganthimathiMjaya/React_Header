/*
  Warnings:

  - The values [TRADEPARTNER] on the enum `PhotoSource` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tradePartnerId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `tradePartnerNotes` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `tradePartnerPay` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `tradePartnerUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TradePartner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradePartnerAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradePartnerUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PhotoSource_new" AS ENUM ('CLIENT', 'CREW');
ALTER TABLE "Photos" ALTER COLUMN "source" TYPE "PhotoSource_new" USING ("source"::text::"PhotoSource_new");
ALTER TYPE "PhotoSource" RENAME TO "PhotoSource_old";
ALTER TYPE "PhotoSource_new" RENAME TO "PhotoSource";
DROP TYPE "PhotoSource_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_tradePartnerId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_locationId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_orgId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_typeId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerAssignment" DROP CONSTRAINT "TradePartnerAssignment_customerId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerAssignment" DROP CONSTRAINT "TradePartnerAssignment_jobTypeId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerAssignment" DROP CONSTRAINT "TradePartnerAssignment_orgId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerAssignment" DROP CONSTRAINT "TradePartnerAssignment_tradePartnerId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerUser" DROP CONSTRAINT "TradePartnerUser_orgId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerUser" DROP CONSTRAINT "TradePartnerUser_tradePartnerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tradePartnerUserId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "tradePartnerId",
DROP COLUMN "tradePartnerNotes",
DROP COLUMN "tradePartnerPay",
ADD COLUMN     "crewId" TEXT,
ADD COLUMN     "crewNotes" TEXT,
ADD COLUMN     "crewPay" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tradePartnerUserId",
ADD COLUMN     "crewUserId" TEXT;

-- DropTable
DROP TABLE "TradePartner";

-- DropTable
DROP TABLE "TradePartnerAssignment";

-- DropTable
DROP TABLE "TradePartnerUser";

-- CreateTable
CREATE TABLE "Crew" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "createdById" INTEGER NOT NULL,
    "resources" TEXT,
    "healthAndSafetyExpiry" TIMESTAMP(3),
    "locationId" TEXT,
    "typeId" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewUser" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "crewId" TEXT NOT NULL,

    CONSTRAINT "CrewUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewAssignment" (
    "id" SERIAL NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "crewId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobTypeId" INTEGER NOT NULL,

    CONSTRAINT "CrewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrewUser_userId_key" ON "CrewUser"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_crewUserId_fkey" FOREIGN KEY ("crewUserId") REFERENCES "CrewUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crew" ADD CONSTRAINT "Crew_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crew" ADD CONSTRAINT "Crew_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crew" ADD CONSTRAINT "Crew_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crew" ADD CONSTRAINT "Crew_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewUser" ADD CONSTRAINT "CrewUser_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewUser" ADD CONSTRAINT "CrewUser_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewAssignment" ADD CONSTRAINT "CrewAssignment_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewAssignment" ADD CONSTRAINT "CrewAssignment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewAssignment" ADD CONSTRAINT "CrewAssignment_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewAssignment" ADD CONSTRAINT "CrewAssignment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
