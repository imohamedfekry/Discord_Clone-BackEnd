/*
  Warnings:

  - You are about to drop the column `lastMessageAt` on the `Channel` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Channel_lastMessageAt_idx";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "lastMessageAt",
ADD COLUMN     "lastMessageId" BIGINT;

-- CreateIndex
CREATE INDEX "Channel_lastMessageId_idx" ON "Channel"("lastMessageId");
