/*
  Warnings:

  - You are about to drop the column `isTemporary` on the `Presence` table. All the data in the column will be lost.
  - You are about to drop the column `isTemporary` on the `UserStatusRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Presence" DROP COLUMN "isTemporary";

-- AlterTable
ALTER TABLE "UserStatusRecord" DROP COLUMN "isTemporary";
