/*
--------------------------------------------------
-- IMPORTANT:
this SQL statement was manually added in order to allow running migrations with
pre-existing data the first time. This orgId (org_GNM0OVabFKJyFDHh) was a manually, random, generated value.
When running this in prod, running manual updates may be required.
--------------------------------------------------
*/
SELECT set_config('app.current_org_id', 'org_GNM0OVabFKJyFDHh', TRUE);
--------------------------------------------------
/*
The purpose of this migration is to add the new table Organization to control ALL
tenants. Then the id is added as a FK to all tables we considered should contain unique data per tenant. Shared data, such as lookup tables (enums), are not included.

As a reminder, this is part of the multi-tenancy implementation, ONE db and ONE schema leveraging the use of RLS (RowLevelSecurity) implemented with Prisma Client extensions.
*/

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Insert DEFAULT orgId
INSERT INTO "Organization" (id, name) VALUES ('org_GNM0OVabFKJyFDHh', 'scrap-it');


-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "CustomerUser" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "DisposalSite" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "DumpTicket" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Dumpster" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "HyphenPurchaseOrder" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "InvoiceDetail" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "JobType" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "NonDumpsterJob" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "Photos" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "TradePartner" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "TradePartnerAssignment" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "TradePartnerUser" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text);


-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonDumpsterJob" ADD CONSTRAINT "NonDumpsterJob_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DumpTicket" ADD CONSTRAINT "DumpTicket_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobType" ADD CONSTRAINT "JobType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSubType" ADD CONSTRAINT "JobSubType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dumpster" ADD CONSTRAINT "Dumpster_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisposalSite" ADD CONSTRAINT "DisposalSite_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerUser" ADD CONSTRAINT "TradePartnerUser_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HyphenPurchaseOrder" ADD CONSTRAINT "HyphenPurchaseOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerAssignment" ADD CONSTRAINT "TradePartnerAssignment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
