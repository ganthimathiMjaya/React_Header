-- CreateTable
CREATE TABLE "DumpsterSize" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DumpsterSize_pkey" PRIMARY KEY ("id")
);
