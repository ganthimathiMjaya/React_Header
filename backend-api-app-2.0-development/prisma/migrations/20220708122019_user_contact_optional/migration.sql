/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId]` on the table `Phone` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_ownerId_fkey";

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "ownerId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_ownerId_key" ON "Contact"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_contactId_key" ON "Email"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_contactId_key" ON "Phone"("contactId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
