-- CreateEnum
CREATE TYPE "PhotoSource" AS ENUM ('CLIENT', 'TRADEPARTNER');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('BOOKING', 'BEFORE_JOB', 'AFTER_JOB');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('COMMERCIAL', 'BILLING', 'MAIN', 'ONSITE');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('MOBILE', 'WEB');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('COMMERCIAL', 'PRODUCTION', 'CUSTOM', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "auth_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "collectAt" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT E'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdBy" UUID,
    "techReference" TEXT NOT NULL DEFAULT E'',
    "customerId" TEXT NOT NULL DEFAULT E'',
    "invoiceNotes" TEXT,
    "jobScopeMode" BOOLEAN,
    "priority" INTEGER,
    "locationId" TEXT NOT NULL DEFAULT E'',
    "dumpsterId" INTEGER,
    "timeSlot" TEXT NOT NULL DEFAULT E'',
    "jobScope" TEXT NOT NULL DEFAULT E'',
    "windowStart" TIMESTAMP(3),
    "windowEnd" TIMESTAMP(3),
    "jobDuration" TEXT,
    "tonnage" DOUBLE PRECISION,
    "loads" INTEGER,
    "disposalSiteId" INTEGER,
    "appNotes" TEXT,
    "tradePartnerId" TEXT,
    "size" INTEGER,
    "jobTypeId" INTEGER,
    "tradePartnerNotes" TEXT NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "poNum" TEXT NOT NULL,
    "notificationOn" BOOLEAN NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobType" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,

    CONSTRAINT "JobType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "addressLine3" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "contactType" "ContactType" NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradePartner" (
    "id" TEXT NOT NULL,
    "billingContactId" TEXT,
    "mainContactId" TEXT,
    "contactId" TEXT,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "privateWork" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "TradePartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradePartnerRegion" (
    "id" TEXT NOT NULL,
    "created_by" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "priority" INTEGER NOT NULL,
    "tradePartnerId" TEXT,

    CONSTRAINT "TradePartnerRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "bookingSource" "BookingSource" NOT NULL,
    "contactId" TEXT,
    "customerId" TEXT,
    "internalNotes" TEXT NOT NULL,
    "locationId" TEXT,
    "projectType" "ProjectType" NOT NULL,
    "status" "JobStatus" NOT NULL,
    "scheduledDate" DATE NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "billingContactId" TEXT,
    "commercialContactId" TEXT,
    "corporateContactId" TEXT,
    "mainContactId" TEXT,
    "bulkComplete" BOOLEAN NOT NULL,
    "category" "ProjectType" NOT NULL,
    "companyName" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "customerNotes" TEXT NOT NULL,
    "customerWONotes" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "holdIfOverdue" BOOLEAN NOT NULL,
    "lastInvoiceDate" TIMESTAMP(3) NOT NULL,
    "onHold" BOOLEAN NOT NULL,
    "paymentInstruction" TEXT NOT NULL,
    "paymentTerm" TEXT NOT NULL,
    "printInvoicing" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "terminateAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "addressLine3" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "contactId" TEXT,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dumpster" (
    "id" SERIAL NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Dumpster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisposalSite" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "addressLine3" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DisposalSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photos" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" "PhotoType" NOT NULL,
    "source" "PhotoSource" NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_auth_id_idx" ON "User"("auth_id");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_tradePartnerId_fkey" FOREIGN KEY ("tradePartnerId") REFERENCES "TradePartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_dumpsterId_fkey" FOREIGN KEY ("dumpsterId") REFERENCES "Dumpster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_disposalSiteId_fkey" FOREIGN KEY ("disposalSiteId") REFERENCES "DisposalSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_billingContactId_fkey" FOREIGN KEY ("billingContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_mainContactId_fkey" FOREIGN KEY ("mainContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerRegion" ADD CONSTRAINT "TradePartnerRegion_tradePartnerId_fkey" FOREIGN KEY ("tradePartnerId") REFERENCES "TradePartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_billingContactId_fkey" FOREIGN KEY ("billingContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_commercialContactId_fkey" FOREIGN KEY ("commercialContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_corporateContactId_fkey" FOREIGN KEY ("corporateContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_mainContactId_fkey" FOREIGN KEY ("mainContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
