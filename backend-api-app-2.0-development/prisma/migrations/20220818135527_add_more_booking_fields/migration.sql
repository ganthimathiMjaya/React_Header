-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceFrequency" TEXT,
ADD COLUMN     "timeSlot" TEXT;

-- AlterTable
ALTER TABLE "Photos" ADD COLUMN     "bookingId" TEXT;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
