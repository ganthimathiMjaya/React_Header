/*
  Warnings:

  - You are about to drop the `OrganizationCustomerCustomField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationProjectCustomField` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrganizationCustomerCustomField" DROP CONSTRAINT "OrganizationCustomerCustomField_customerId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationCustomerCustomField" DROP CONSTRAINT "OrganizationCustomerCustomField_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationCustomerCustomField" DROP CONSTRAINT "OrganizationCustomerCustomField_organizationCustomFieldId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationProjectCustomField" DROP CONSTRAINT "OrganizationProjectCustomField_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationProjectCustomField" DROP CONSTRAINT "OrganizationProjectCustomField_organizationCustomFieldId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationProjectCustomField" DROP CONSTRAINT "OrganizationProjectCustomField_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_locationId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "customerId" TEXT NOT NULL,
ALTER COLUMN "locationId" DROP NOT NULL;

-- DropTable
DROP TABLE "OrganizationCustomerCustomField";

-- DropTable
DROP TABLE "OrganizationProjectCustomField";

-- CreateTable
CREATE TABLE "ProjectLocation" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `ProjectLocation` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `locationId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLocation" DROP CONSTRAINT "ProjectLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectLocation" DROP CONSTRAINT "ProjectLocation_orgId_fkey";

-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "cost" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "locationId" SET NOT NULL;

-- DropTable
DROP TABLE "ProjectLocation";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
