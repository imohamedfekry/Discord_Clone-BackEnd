/*
  Warnings:

  - The values [OFFLINE] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ONLINE', 'Invisible', 'IDLE', 'DND');
ALTER TABLE "public"."Presence" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Presence" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Presence" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
