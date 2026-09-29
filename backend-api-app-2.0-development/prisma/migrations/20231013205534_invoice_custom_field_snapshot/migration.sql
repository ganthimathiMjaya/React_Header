-- CreateTable
CREATE TABLE "InvoiceDetailCustomField" (
    "id" TEXT NOT NULL,
    "invoiceDetailId" TEXT NOT NULL,
    "organizationCustomFieldCategoryId" INTEGER NOT NULL,
    "organizationCustomFieldCategoryCode" TEXT NOT NULL,
    "organizationCustomFieldCategoryDesc" TEXT NOT NULL,
    "organizationCustomFieldId" INTEGER NOT NULL,
    "organizationCustomFieldName" TEXT NOT NULL,
    "organizationJobCustomFieldId" INTEGER NOT NULL,
    "organizationJobCustomFieldValue" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InvoiceDetailCustomField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceDetailCustomField" ADD CONSTRAINT "InvoiceDetailCustomField_invoiceDetailId_fkey" FOREIGN KEY ("invoiceDetailId") REFERENCES "InvoiceDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
