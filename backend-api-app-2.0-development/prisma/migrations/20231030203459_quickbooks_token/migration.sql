-- CreateTable
CREATE TABLE "QBIntegrationTokens" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "QBIntegrationTokens_pkey" PRIMARY KEY ("id")
);
