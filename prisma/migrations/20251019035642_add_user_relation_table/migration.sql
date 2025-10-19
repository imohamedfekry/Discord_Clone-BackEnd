-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('BLOCKED', 'IGNORED', 'MUTED');

-- CreateTable
CREATE TABLE "UserRelation" (
    "id" BIGINT NOT NULL,
    "sourceId" BIGINT NOT NULL,
    "targetId" BIGINT NOT NULL,
    "type" "RelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRelation_sourceId_idx" ON "UserRelation"("sourceId");

-- CreateIndex
CREATE INDEX "UserRelation_targetId_idx" ON "UserRelation"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRelation_sourceId_targetId_type_key" ON "UserRelation"("sourceId", "targetId", "type");

-- AddForeignKey
ALTER TABLE "UserRelation" ADD CONSTRAINT "UserRelation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRelation" ADD CONSTRAINT "UserRelation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
