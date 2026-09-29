-- This data migration is intended to fix local environments, since the app has not been deployed yet to prod, there's no production impact.

-- Rename statuses according to new conventions.
-- Insert statuses here to fix local envs. Drop table in seed just in case.

-- Current state:
-- enum JobStatus {
--   Unassigned = 1,
--   Scheduled = 2,
--   'In Progress' = 3,
--   Complete = 4,
--   // 'Ticket Sent' = 5, //DEPRECATED
--   // Reported = 6, //DEPRECATED
--   // Incomplete = 7, //DEPRECATED
--   // Late = 8, //DEPRECATED
--   'Needs Approval' = 9,
--   Cancelled = 10,
--   // Available = 11, //DEPRECATED
--   // Unavailable = 12, //DEPRECATED
--   // 'Details Sent' = 13, //DEPRECATED
--   Invoiced = 14,
-- }

-- Rename status
UPDATE "Status" SET "content" = 'Unassigned' WHERE "content" = 'Pending';
UPDATE "Status" SET "content" = 'Scheduled' WHERE "content" = 'Assigned';

-- Update existing jobs, set to scheduled if currently in late or incomplete
UPDATE "Job" SET "statusId" = 2 WHERE "statusId" IN (7, 8);

-- Although there aren't any flows associated with these statuses, updating just in case of existing jobs, set to complete if currently in ticket sent or details sent, those statuses/flows are no longer needed for scrappy.
UPDATE "Job" SET "statusId" = 3 WHERE "statusId" IN (6, 11, 12);

-- Update existing jobs, set to complete if currently in ticket sent or details sent, those statuses/flows are no longer needed for scrappy.
UPDATE "Job" SET "statusId" = 4 WHERE "statusId" IN (5, 13);


-- Remove statuses no longer needed for scrappy
DELETE FROM "Status" WHERE "content" = 'Ticket Sent';  -- id = 5
DELETE FROM "Status" WHERE "content" = 'Reported';     -- id = 6
DELETE FROM "Status" WHERE "content" = 'Incomplete';   -- id = 7
DELETE FROM "Status" WHERE "content" = 'Late';         -- id = 8
DELETE FROM "Status" WHERE "content" = 'Available';    -- id = 11
DELETE FROM "Status" WHERE "content" = 'Unavailable';  -- id = 12
DELETE FROM "Status" WHERE "content" = 'Details Sent'; -- id = 13

-- Insert new Invoiced status
INSERT INTO "Status" (id, content) VALUES (14, 'Invoiced');


