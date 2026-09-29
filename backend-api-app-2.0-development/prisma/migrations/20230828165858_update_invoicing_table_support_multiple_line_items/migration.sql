/*
  Warnings:

  - You are about to drop the column `jobId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `InvoiceDetail` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_jobId_fkey";

-- DropIndex
DROP INDEX "Invoice_jobId_key";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "jobId",
ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "dueDate" TIMESTAMPTZ(3),
ADD COLUMN     "invoiceDate" TIMESTAMPTZ(3),
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "messageOnInvoice" TEXT,
ADD COLUMN     "statusId" INTEGER,
ADD COLUMN     "terms" TEXT,
ALTER COLUMN "invoiceNo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceDetail" ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "isTaxable" BOOLEAN DEFAULT true,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "jobTypeId" INTEGER,
ADD COLUMN     "lineItemType" TEXT NOT NULL DEFAULT 'JOB',
ADD COLUMN     "service" TEXT,
ADD COLUMN     "serviceDate" TIMESTAMPTZ(3),
ADD COLUMN     "taxRate" DOUBLE PRECISION,
ALTER COLUMN "invoiceLineNo" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "quantity" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isDiscarded" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "InvoiceStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
