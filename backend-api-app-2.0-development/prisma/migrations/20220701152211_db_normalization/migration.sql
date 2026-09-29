/*
  Warnings:

  - You are about to drop the column `contactId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `projectType` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine1` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine3` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `county` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `zipcode` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `billingContactId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `commercialContactId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `corporateContactId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `customerNotes` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `customerWONotes` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `mainContactId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `terminateAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine1` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine3` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `county` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `zipcode` on the `DisposalSite` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Dumpster` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Dumpster` table. All the data in the column will be lost.
  - You are about to drop the column `collectAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobScopeMode` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `notificationOn` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine1` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine3` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `county` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `zipcode` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `billingContactId` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `mainContactId` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `privateWork` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TradePartner` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TradePartnerRegion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[statusId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customerId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `firstName` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `DisposalSite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Dumpster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeId` to the `Dumpster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `Dumpster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `primaryContactId` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `addressId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `active` to the `TradePartner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `TradePartner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `TradePartner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `TradePartner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `TradePartner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_billingContactId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_commercialContactId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_corporateContactId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_mainContactId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_primaryContactId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_billingContactId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_contactId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_mainContactId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartner" DROP CONSTRAINT "TradePartner_userId_fkey";

-- DropForeignKey
ALTER TABLE "TradePartnerRegion" DROP CONSTRAINT "TradePartnerRegion_tradePartnerId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "contactId",
DROP COLUMN "projectType",
DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "bookedById" INTEGER,
ADD COLUMN     "statusId" INTEGER,
ALTER COLUMN "customerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "addressLine3",
DROP COLUMN "city",
DROP COLUMN "county",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "zipcode",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "billingContactId",
DROP COLUMN "category",
DROP COLUMN "commercialContactId",
DROP COLUMN "companyName",
DROP COLUMN "corporateContactId",
DROP COLUMN "customerNotes",
DROP COLUMN "customerWONotes",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "mainContactId",
DROP COLUMN "terminateAt",
DROP COLUMN "userId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "terminatedAt" TIMESTAMP(3),
ADD COLUMN     "workOrderNotes" TEXT;

-- AlterTable
ALTER TABLE "DisposalSite" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "addressLine3",
DROP COLUMN "city",
DROP COLUMN "county",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "name",
DROP COLUMN "state",
DROP COLUMN "zipcode",
ADD COLUMN     "locationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dumpster" DROP COLUMN "size",
DROP COLUMN "status",
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "sizeId" INTEGER NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "collectAt",
DROP COLUMN "contactId",
DROP COLUMN "jobScopeMode",
DROP COLUMN "notificationOn",
DROP COLUMN "size",
DROP COLUMN "status",
ADD COLUMN     "jobScopeMod" BOOLEAN,
ADD COLUMN     "statusId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "primaryContactId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "addressLine3",
DROP COLUMN "city",
DROP COLUMN "county",
DROP COLUMN "zipcode",
ADD COLUMN     "addressId" TEXT NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TradePartner" DROP COLUMN "billingContactId",
DROP COLUMN "contactId",
DROP COLUMN "mainContactId",
DROP COLUMN "privateWork",
DROP COLUMN "status",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "active" BOOLEAN NOT NULL,
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "healthAndSafetyExpiry" TIMESTAMP(3),
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TradePartnerRegion";

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "line3" TEXT,
    "city" TEXT NOT NULL,
    "county" TEXT,
    "state" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "inspectedById" INTEGER NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "admin_level" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradePartnerUser" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradePartnerUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerUser" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Type" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_jobId_key" ON "Inspection"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_inspectedById_key" ON "Inspection"("inspectedById");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TradePartnerUser_userId_key" ON "TradePartnerUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerUser_userId_key" ON "CustomerUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_statusId_key" ON "Booking"("statusId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartner" ADD CONSTRAINT "TradePartner_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dumpster" ADD CONSTRAINT "Dumpster_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dumpster" ADD CONSTRAINT "Dumpster_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisposalSite" ADD CONSTRAINT "DisposalSite_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerUser" ADD CONSTRAINT "TradePartnerUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
