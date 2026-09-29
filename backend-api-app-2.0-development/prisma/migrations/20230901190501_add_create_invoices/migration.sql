
-- AlterTable
ALTER TABLE "InvoiceDetail" DROP COLUMN "amount",
ADD COLUMN     "amount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "terms",
ADD COLUMN     "terms" INTEGER;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "terms" INTEGER;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

