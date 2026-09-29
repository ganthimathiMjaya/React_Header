/*
  Warnings:

  - You are about to drop the column `multiFamily` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "multiFamily";

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "multiFamily" BOOLEAN;
