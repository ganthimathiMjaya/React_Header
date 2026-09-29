-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidDate" TIMESTAMP(3);
