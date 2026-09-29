-- CreateTable
CREATE TABLE "PushNotificationTicket" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "pushNotificationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushNotificationTicket_pkey" PRIMARY KEY ("id")
);
