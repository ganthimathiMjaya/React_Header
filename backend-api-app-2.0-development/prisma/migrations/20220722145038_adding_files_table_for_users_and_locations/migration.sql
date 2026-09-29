/*
  Warnings:

  - Added the required column `greenFlag` to the `DisposalSite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('SITE_MAP', 'DOCUMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "disposalSiteId" INTEGER;

-- AlterTable
ALTER TABLE "DisposalSite" ADD COLUMN     "contactId" TEXT[],
ADD COLUMN     "greenFlag" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Files" (
    "id" SERIAL NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" "FileType",
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_disposalSiteId_fkey" FOREIGN KEY ("disposalSiteId") REFERENCES "DisposalSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
