/*
  Warnings:

  - You are about to drop the column `note` on the `UserRelation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserRelation" DROP COLUMN "note";

-- CreateTable
CREATE TABLE "UserNote" (
    "id" BIGSERIAL NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "targetId" BIGINT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserNote_targetId_idx" ON "UserNote"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNote_ownerId_targetId_key" ON "UserNote"("ownerId", "targetId");

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
