/*
  Warnings:

  - You are about to drop the column `photosId` on the `DumpTicket` table. All the data in the column will be lost.
  - You are about to drop the column `dumpTicketId` on the `Photos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Photos" DROP CONSTRAINT "Photos_dumpTicketId_fkey";

-- AlterTable
ALTER TABLE "DumpTicket" DROP COLUMN "photosId";

-- AlterTable
ALTER TABLE "Photos" DROP COLUMN "dumpTicketId";
