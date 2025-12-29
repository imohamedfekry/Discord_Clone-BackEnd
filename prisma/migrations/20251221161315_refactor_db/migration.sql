/*
  Warnings:

  - The values [Invisible] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConversationUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageReceipt` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ONLINE', 'INVISIBLE', 'IDLE', 'DND');
ALTER TABLE "Presence" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ConversationUser" DROP CONSTRAINT "ConversationUser_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConversationUser" DROP CONSTRAINT "ConversationUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_replyTo_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessageReceipt" DROP CONSTRAINT "MessageReceipt_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessageReceipt" DROP CONSTRAINT "MessageReceipt_userId_fkey";

-- DropTable
DROP TABLE "public"."Conversation";

-- DropTable
DROP TABLE "public"."ConversationUser";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."MessageReceipt";

-- DropEnum
DROP TYPE "public"."MessageType";
