-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "maxDuration" INTEGER,
ADD COLUMN     "maxTonnage" DOUBLE PRECISION,
ADD COLUMN     "taxable" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceDetail" (
    "id" TEXT NOT NULL,
    "invoiceLineNo" INTEGER NOT NULL,
    "qbRef" TEXT NOT NULL DEFAULT E'',
    "qbClass" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "amount" TEXT NOT NULL DEFAULT E'',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "InvoiceDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_jobId_key" ON "Invoice"("jobId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
