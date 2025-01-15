/*
  Warnings:

  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `DecisionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DecisionOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_userId_fkey";

-- AlterTable
ALTER TABLE "DecisionOption" ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Option";

-- CreateIndex
CREATE INDEX "DecisionOption_userId_idx" ON "DecisionOption"("userId");

-- AddForeignKey
ALTER TABLE "DecisionOption" ADD CONSTRAINT "DecisionOption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
