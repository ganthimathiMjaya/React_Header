/*
  Warnings:

  - You are about to drop the column `organizationJobCustomFieldValue` on the `InvoiceDetailCustomField` table. All the data in the column will be lost.
  - Added the required column `customFieldValue` to the `InvoiceDetailCustomField` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvoiceDetailCustomField" DROP COLUMN "organizationJobCustomFieldValue",
ADD COLUMN     "customFieldValue" TEXT NOT NULL,
ALTER COLUMN "organizationCustomFieldCategoryId" DROP NOT NULL,
ALTER COLUMN "organizationCustomFieldId" DROP NOT NULL,
ALTER COLUMN "organizationJobCustomFieldId" DROP NOT NULL;
