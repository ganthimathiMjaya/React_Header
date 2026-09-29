/*
Multi-tenancy: Implementing RLS (row level security) for all tables we consider to be unique per tenant.

The FORCE setting is needed since table owners by default by pass RLS. The same postgres user is used for both, running migrations and running application queries, hence the need to force.

The by-pass policy is used to bypass RLS, if needed, for example when running cron jobs that affect ALL tenants.
*/


-- Enable Row Level Security
ALTER TABLE "Crew" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrewUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrewAssignment" ENABLE ROW LEVEL SECURITY;


-- Force Row Level Security for table owners
ALTER TABLE "Crew" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CrewUser" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CrewAssignment" FORCE ROW LEVEL SECURITY;


-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "Crew" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "CrewUser" USING ("orgId" = current_setting('app.current_org_id', TRUE));
CREATE POLICY tenant_isolation_policy ON "CrewAssignment" USING ("orgId" = current_setting('app.current_org_id', TRUE));


-- Create policies to bypass RLS (optional)
CREATE POLICY bypass_rls_policy ON "Crew" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "CrewUser" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "CrewAssignment" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');