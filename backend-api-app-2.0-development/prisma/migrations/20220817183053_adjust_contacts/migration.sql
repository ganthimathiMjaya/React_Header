-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_typeId_fkey";

-- DropForeignKey
ALTER TABLE "Phone" DROP CONSTRAINT "Phone_typeId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "multiFamily" BOOLEAN;

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "active" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Email" ALTER COLUMN "typeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Phone" ALTER COLUMN "typeId" DROP NOT NULL,
ALTER COLUMN "default" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
