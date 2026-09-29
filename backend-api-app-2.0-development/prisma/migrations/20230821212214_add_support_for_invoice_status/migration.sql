-- CreateTable
CREATE TABLE "InvoiceStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InvoiceStatus_pkey" PRIMARY KEY ("id")
);
