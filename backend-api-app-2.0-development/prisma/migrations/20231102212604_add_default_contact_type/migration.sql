-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contactTypeId_fkey";

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "active" SET DEFAULT true,
ALTER COLUMN "contactTypeId" DROP NOT NULL,
ALTER COLUMN "contactTypeId" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
