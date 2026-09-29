-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "type" TEXT,
    "jobId" TEXT,
    "jobTechReference" TEXT,
    "receiverType" TEXT,
    "triggeredBy" TEXT,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationUser" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT current_setting('app.current_org_id'::text),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isCleared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "NotificationUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUser" ADD CONSTRAINT "NotificationUser_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUser" ADD CONSTRAINT "NotificationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUser" ADD CONSTRAINT "NotificationUser_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Multi-tenancy settings:
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Notification" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY bypass_rls_policy ON "Notification" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "NotificationUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationUser" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "NotificationUser" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY bypass_rls_policy ON "NotificationUser" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
