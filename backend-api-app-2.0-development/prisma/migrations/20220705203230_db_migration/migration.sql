/*
  Warnings:

  - You are about to drop the column `contactType` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `Location` table. All the data in the column will be lost.
  - Made the column `internalNotes` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `statusId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `contactTypeId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `CustomerUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default` to the `Phone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Phone` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_statusId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_contactId_fkey";

-- DropIndex
DROP INDEX "Booking_statusId_key";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "internalNotes" SET NOT NULL,
ALTER COLUMN "statusId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "contactType",
ADD COLUMN     "contactTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CustomerUser" ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "typeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "contactId";

-- AlterTable
ALTER TABLE "Phone" ADD COLUMN     "default" BOOLEAN NOT NULL,
ADD COLUMN     "number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TradePartnerUser" ADD COLUMN     "tradePartnerId" TEXT;

-- DropEnum
DROP TYPE "ContactType";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "ProjectType";

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerUser" ADD CONSTRAINT "TradePartnerUser_tradePartnerId_fkey" FOREIGN KEY ("tradePartnerId") REFERENCES "TradePartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
