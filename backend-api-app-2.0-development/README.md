# Build Status

## Main

[![CircleCI](https://circleci.com/gh/scrap-it/backend-api-app/tree/main.svg?style=svg&circle-token=11214a1d5cb5c5e7c12717114b830bb1c0a2c483)](https://circleci.com/gh/scrap-it/backend-api-app/tree/main)

## Staging

[![CircleCI](https://circleci.com/gh/scrap-it/backend-api-app/tree/staging.svg?style=svg&circle-token=11214a1d5cb5c5e7c12717114b830bb1c0a2c483)](https://circleci.com/gh/scrap-it/backend-api-app/tree/staging)

# Recommended VS Code Extensions

There are recommended VS Code Extensions associated with this project.
To install them, open this project in VS Code and navigate to Extensions.

# Install Dependencies

- `yarn`

# Run

## Dev Mode

`yarn dev`

### Local Dev Database

1. Navigate to https://dbngin.com/ and download DBngin.
2. If you are using an M1 Mac,
   - using Finder navigate to Applications,
   - right click on DBngin,
   - select Get Info,
   - check the "Open using Rosetta" checkbox.
3. Open DBngin
4. Select `+`
5. Create a new PostgreSQL DB with Version: "13.3 - Intel | ARM" (provide a name (scrap-it), on Port 5432)
6. Select Create
7. Select Start

8. Create new postgres user:

In order to allow multi-tenancy with RLS to work correctly, a NON postgres superuser must be used in the application.
To create a new one run the following sql commands (update placeholders with desired values):

```
CREATE USER rlslocal WITH PASSWORD '1234';
ALTER USER rlslocal CREATEDB;
```

9. Add `DATABASE_URL="postgresql://rlslocal:1234@localhost:5432/scrap-it?schema=public"` to a `.env` file in the root of the repository.
10. Run `yarn install`
11. Run `yarn prisma:migrate` to run the migration files against the database.
12. Run `yarn db:seed` to seed the database, and get test data to work with

(If you get stuck with any database seeding, run `yarn db:reset` to re-run migrations and seeding)

NOTE (ignore if you are starting a new db from the scratch).
If you are applying multi-tenancy migrations on an existing database, please apply steps 8 and 9 to ensure a non postgres superuser is used, and apply the following commands for the newly created user:

```
-- grant permissions (adjust new user to access pre-existing database accordingly, if needed):
GRANT ALL PRIVILEGES ON DATABASE "scrap-it" TO rlslocal;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rlslocal;
```

## Production

`yarn build`
`node build/index.js`

# Prisma

This project uses [Prisma](www.prisma.io) as an ORM.

Tutorials and guidance can be found here: https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/using-prisma-migrate-typescript-postgres

## Prisma Studio

Prisma Studio can be used to add/remove data from your local DB. To execute, run `npx prisma studio`.

# Multi-tenancy

For more information about the multi-tenancy implementation, please visit:

- https://scrap-it.atlassian.net/wiki/spaces/DM/pages/9994270/Multi-tenancy+analysis
- https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/

## Migrations

### Creating new Tables

When creating new tables that would require RLS (row-level-security), do as follows:

1. Apply the schema changes, make sure you add the following field:

`orgId String @default(dbgenerated("(current_setting('app.current_org_id'::text))::uuid")) @db.Uuid`

This default value would allow for setting the orgId automatically if using the prisma tenant client, otherwise field must be manually set.

2. Use the following command to manually update migration files before being applied:
   `npx prisma migrate dev --create-only`.

Since RLS is disabled by default, new multi-tenancy tables need to manually apply the following sql instructions:

```
-- Enable Row Level Security
ALTER TABLE "<<TABLE_NAME_HERE>>" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "<<TABLE_NAME_HERE>>" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "<<TABLE_NAME_HERE>>" USING ("orgId" = current_setting('app.current_org_id', TRUE));

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "<<TABLE_NAME_HERE>>" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
```

## Users

ALL postgres superusers bypass RLS, for that reason it's important to make sure you're NOT using a superuser locally, or on higher envs, to connect to the database.

Creating a new postgres user is hihglighted above.

Useful user sql commands:

```
-- create user:
CREATE USER new_user WITH PASSWORD 'PASSWORD';
ALTER USER new_user CREATEDB;

-- grant permissions:
GRANT ALL PRIVILEGES ON DATABASE userdb TO new_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO new_user;

ALTER DATABASE "scrap-it" OWNER TO rlslocal;
REASSIGN OWNED BY "scrap-it" to rlslocal;

-- check user permissions:
SELECT * FROM information_schema.role_table_grants WHERE grantee = 'YOUR_USER';

-- ownership:
SELECT * FROM pg_tables WHERE tableowner = 'YOUR_USER';

```

## Node Version

This application is deployed to Render. According to the documentation, the default Node version is 14.17 unless otherwise specified. More details can be found in: https://render.com/docs/node-version

For local development, most developers are currently using Node version 16.20
