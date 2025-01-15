/*
  Warnings:

  - Added the required column `question` to the `Tile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tile" ADD COLUMN     "answerOptions" TEXT[],
ADD COLUMN     "question" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DecisionOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fitReasons" TEXT[],
    "metrics" TEXT[],
    "implementationSteps" TEXT[],
    "timeline" TEXT[],
    "topicId" TEXT NOT NULL,

    CONSTRAINT "DecisionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DecisionOption_topicId_idx" ON "DecisionOption"("topicId");

-- AddForeignKey
ALTER TABLE "DecisionOption" ADD CONSTRAINT "DecisionOption_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
