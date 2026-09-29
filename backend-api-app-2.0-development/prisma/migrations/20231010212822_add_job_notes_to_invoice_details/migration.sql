-- AlterTable
ALTER TABLE "InvoiceDetail" ADD COLUMN     "crewNotes" TEXT,
ADD COLUMN     "customerNotes" TEXT,
ADD COLUMN     "invoiceNotes" TEXT;

-- AlterTable
ALTER TABLE "InvoiceDetail" ADD COLUMN     "jobNotes" TEXT,
ADD COLUMN     "scope" TEXT;
