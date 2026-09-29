-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "description" TEXT;

-- RenameIndex
ALTER INDEX "UserOrganization_userId_orgId_unique" RENAME TO "UserOrganization_userId_orgId_key";

-- AlterTable
ALTER TABLE "JobSubType" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "JobType" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "JobSubType" ALTER COLUMN "name" SET NOT NULL;
