/*
  Warnings:

  - You are about to drop the column `ownerId` on the `UserNote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceId,targetId]` on the table `UserNote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceId` to the `UserNote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."UserNote" DROP CONSTRAINT "UserNote_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."UserNote_ownerId_targetId_key";

-- AlterTable
ALTER TABLE "UserNote" DROP COLUMN "ownerId",
ADD COLUMN     "sourceId" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserNote_sourceId_targetId_key" ON "UserNote"("sourceId", "targetId");

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
