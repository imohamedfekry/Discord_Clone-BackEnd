/*
  Warnings:

  - The values [MUTED] on the enum `RelationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('DM');

-- AlterEnum
BEGIN;
CREATE TYPE "RelationType_new" AS ENUM ('BLOCKED', 'IGNORED');
ALTER TABLE "UserRelation" ALTER COLUMN "type" TYPE "RelationType_new" USING ("type"::text::"RelationType_new");
ALTER TYPE "RelationType" RENAME TO "RelationType_old";
ALTER TYPE "RelationType_new" RENAME TO "RelationType";
DROP TYPE "public"."RelationType_old";
COMMIT;

-- CreateTable
CREATE TABLE "Channel" (
    "id" BIGSERIAL NOT NULL,
    "type" "ChannelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3),

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelRecipient" (
    "channelId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadMessageId" BIGINT,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChannelRecipient_pkey" PRIMARY KEY ("channelId","userId")
);

-- CreateIndex
CREATE INDEX "Channel_type_idx" ON "Channel"("type");

-- CreateIndex
CREATE INDEX "Channel_lastMessageAt_idx" ON "Channel"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChannelRecipient_userId_idx" ON "ChannelRecipient"("userId");

-- AddForeignKey
ALTER TABLE "ChannelRecipient" ADD CONSTRAINT "ChannelRecipient_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelRecipient" ADD CONSTRAINT "ChannelRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
