/*
  Warnings:

  - You are about to drop the column `customEmoji` on the `UserStatusRecord` table. All the data in the column will be lost.
  - You are about to drop the column `customText` on the `UserStatusRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserStatusRecord" DROP COLUMN "customEmoji",
DROP COLUMN "customText",
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "text" TEXT;
