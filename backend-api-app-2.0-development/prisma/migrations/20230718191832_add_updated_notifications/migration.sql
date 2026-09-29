-- CreateTable
CREATE TABLE "InsightsJobStatus" (
    "id" SERIAL NOT NULL,
    "statusCode" TEXT NOT NULL,
    "statusDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "InsightsJobStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightsJobHeader" (
    "id" SERIAL NOT NULL,
    "insightsJobStatusId" INTEGER NOT NULL,
    "statusDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "InsightsJobHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightsJobDetail" (
    "id" SERIAL NOT NULL,
    "insightsJobHeaderId" INTEGER NOT NULL,
    "insightsJobStatusId" INTEGER NOT NULL,
    "adminUserId" INTEGER NOT NULL,
    "statusDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "InsightsJobDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsightsJobHeader" ADD CONSTRAINT "InsightsJobHeader_insightsJobStatusId_fkey" FOREIGN KEY ("insightsJobStatusId") REFERENCES "InsightsJobStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightsJobDetail" ADD CONSTRAINT "InsightsJobDetail_insightsJobHeaderId_fkey" FOREIGN KEY ("insightsJobHeaderId") REFERENCES "InsightsJobHeader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightsJobDetail" ADD CONSTRAINT "InsightsJobDetail_insightsJobStatusId_fkey" FOREIGN KEY ("insightsJobStatusId") REFERENCES "InsightsJobStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightsJobDetail" ADD CONSTRAINT "InsightsJobDetail_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `InsightsJobStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InsightsJobDetail" DROP CONSTRAINT "InsightsJobDetail_insightsJobStatusId_fkey";

-- DropForeignKey
ALTER TABLE "InsightsJobHeader" DROP CONSTRAINT "InsightsJobHeader_insightsJobStatusId_fkey";

-- AlterTable
ALTER TABLE "InsightsJobDetail" ADD COLUMN     "failureDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "InsightsJobStatus";

-- CreateTable
CREATE TABLE "InsightsJobHeaderStatus" (
    "id" SERIAL NOT NULL,
    "statusCode" TEXT NOT NULL,
    "statusDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "InsightsJobHeaderStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightsJobDetailStatus" (
    "id" SERIAL NOT NULL,
    "statusCode" TEXT NOT NULL,
    "statusDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "InsightsJobDetailStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsightsJobHeader" ADD CONSTRAINT "InsightsJobHeader_insightsJobStatusId_fkey" FOREIGN KEY ("insightsJobStatusId") REFERENCES "InsightsJobHeaderStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightsJobDetail" ADD CONSTRAINT "InsightsJobDetail_insightsJobStatusId_fkey" FOREIGN KEY ("insightsJobStatusId") REFERENCES "InsightsJobDetailStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `statusCode` on the `InsightsJobDetailStatus` table. All the data in the column will be lost.
  - You are about to drop the column `statusDesc` on the `InsightsJobDetailStatus` table. All the data in the column will be lost.
  - You are about to drop the column `statusCode` on the `InsightsJobHeaderStatus` table. All the data in the column will be lost.
  - You are about to drop the column `statusDesc` on the `InsightsJobHeaderStatus` table. All the data in the column will be lost.
  - Added the required column `code` to the `InsightsJobDetailStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `InsightsJobDetailStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `InsightsJobHeaderStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `InsightsJobHeaderStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InsightsJobDetailStatus" DROP COLUMN "statusCode",
DROP COLUMN "statusDesc",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "desc" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InsightsJobHeaderStatus" DROP COLUMN "statusCode",
DROP COLUMN "statusDesc",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "desc" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InsightsJobDetail" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "InsightsJobDetailStatus" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "InsightsJobHeader" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "InsightsJobHeaderStatus" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "InsightsJobDetail" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "failureDate" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "InsightsJobDetailStatus" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "InsightsJobHeader" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "InsightsJobHeaderStatus" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

/*
  Warnings:

  - You are about to drop the column `statusDesc` on the `InsightsJobDetail` table. All the data in the column will be lost.
  - You are about to drop the column `statusDesc` on the `InsightsJobHeader` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InsightsJobDetail" DROP COLUMN "statusDesc";

-- AlterTable
ALTER TABLE "InsightsJobHeader" DROP COLUMN "statusDesc";


/*
  Warnings:

  - You are about to drop the `InsightsJobDetailStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InsightsJobHeaderStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InsightsJobDetail" DROP CONSTRAINT "InsightsJobDetail_insightsJobStatusId_fkey";

-- DropForeignKey
ALTER TABLE "InsightsJobHeader" DROP CONSTRAINT "InsightsJobHeader_insightsJobStatusId_fkey";

-- DropTable
DROP TABLE "InsightsJobDetailStatus";

-- DropTable
DROP TABLE "InsightsJobHeaderStatus";

-- CreateTable
CREATE TABLE "InsightsJobStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InsightsJobStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InsightsJobHeader" ADD CONSTRAINT "InsightsJobHeader_insightsJobStatusId_fkey" FOREIGN KEY ("insightsJobStatusId") REFERENCES "InsightsJobStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightsJobDetail" ADD CONSTRAINT "InsightsJobDetail_insightsJobStatusId_fkey" FOREIGN KEY ("insightsJobStatusId") REFERENCES "InsightsJobStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AlterTable
ALTER TABLE "InsightsJobDetail" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "InsightsJobDetail" ADD CONSTRAINT "InsightsJobDetail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
