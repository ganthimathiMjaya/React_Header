/*
  Warnings:

  - You are about to drop the column `dumpTicketId` on the `Job` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PhotoType" ADD VALUE 'DUMP_TICKET';

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "dumpTicketId";
