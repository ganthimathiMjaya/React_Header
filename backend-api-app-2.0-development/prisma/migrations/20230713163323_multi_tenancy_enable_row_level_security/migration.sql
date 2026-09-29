/*
Multi-tenancy: Implementing RLS (row level security) for all tables we consider to be unique per tenant.

The FORCE setting is needed since table owners by default by pass RLS. The same postgres user is used for both, running migrations and running application queries, hence the need to force.

The by-pass policy is used to bypass RLS, if needed, for example when running cron jobs that affect ALL tenants.
*/


-- Enable Row Level Security
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DisposalSite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dumpster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DumpTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HyphenPurchaseOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inspection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceDetail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobSubType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NonDumpsterJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradePartner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradePartnerUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradePartnerAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;


-- Force Row Level Security for table owners
ALTER TABLE "Organization" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Address" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Admin" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Booking" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Contact" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Customer" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CustomerUser" FORCE ROW LEVEL SECURITY;
ALTER TABLE "DisposalSite" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Dumpster" FORCE ROW LEVEL SECURITY;
ALTER TABLE "DumpTicket" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Files" FORCE ROW LEVEL SECURITY;
ALTER TABLE "HyphenPurchaseOrder" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Inspection" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" FORCE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceDetail" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Job" FORCE ROW LEVEL SECURITY;
ALTER TABLE "JobType" FORCE ROW LEVEL SECURITY;
ALTER TABLE "JobSubType" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Location" FORCE ROW LEVEL SECURITY;
ALTER TABLE "NonDumpsterJob" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Photos" FORCE ROW LEVEL SECURITY;
ALTER TABLE "TradePartner" FORCE ROW LEVEL SECURITY;
ALTER TABLE "TradePartnerUser" FORCE ROW LEVEL SECURITY;
ALTER TABLE "TradePartnerAssignment" FORCE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;


-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "Organization" USING ("id" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Address" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Admin" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Booking" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Contact" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Customer" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "CustomerUser" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "DisposalSite" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Dumpster" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "DumpTicket" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Feedback" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Files" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "HyphenPurchaseOrder" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Inspection" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Invoice" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "InvoiceDetail" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Job" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "JobType" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "JobSubType" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Location" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "NonDumpsterJob" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "Photos" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "TradePartner" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "TradePartnerUser" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "TradePartnerAssignment" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "User" USING ("orgId" = current_setting('app.current_org_id', TRUE));


-- Create policies to bypass RLS (optional)
CREATE POLICY bypass_rls_policy ON "Organization" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Address" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Admin" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Booking" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Contact" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Customer" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "CustomerUser" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "DisposalSite" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Dumpster" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "DumpTicket" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Feedback" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Files" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "HyphenPurchaseOrder" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Inspection" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Invoice" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "InvoiceDetail" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Job" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "JobType" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "JobSubType" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Location" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "NonDumpsterJob" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "Photos" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "TradePartner" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "TradePartnerUser" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "TradePartnerAssignment" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "User" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
