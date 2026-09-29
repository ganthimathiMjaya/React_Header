-- CreateTable
CREATE TABLE "TradePartnerAssignment" (
    "id" SERIAL NOT NULL,
    "tradePartnerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jobTypeId" INTEGER NOT NULL,

    CONSTRAINT "TradePartnerAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradePartnerAssignment" ADD CONSTRAINT "TradePartnerAssignment_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerAssignment" ADD CONSTRAINT "TradePartnerAssignment_tradePartnerId_fkey" FOREIGN KEY ("tradePartnerId") REFERENCES "TradePartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradePartnerAssignment" ADD CONSTRAINT "TradePartnerAssignment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
