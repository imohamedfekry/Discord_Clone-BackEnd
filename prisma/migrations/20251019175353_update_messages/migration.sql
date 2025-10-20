/*
  Warnings:

  - Added the required column `globalName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IDLE', 'DND');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'REPLY', 'VOICE');

-- AlterTable
CREATE SEQUENCE message_id_seq;
ALTER TABLE "Message" ADD COLUMN     "mentionEveryone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mentionRoles" JSONB,
ADD COLUMN     "mentions" JSONB,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reactions" JSONB,
ADD COLUMN     "replyTo" BIGINT,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('message_id_seq');
ALTER SEQUENCE message_id_seq OWNED BY "Message"."id";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customStatus" TEXT,
ADD COLUMN     "globalName" TEXT NOT NULL,
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE';

-- AlterTable
ALTER TABLE "UserRelation" ADD COLUMN     "note" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
