/*
  Warnings:

  - You are about to drop the column `sectionIndex` on the `Tile` table. All the data in the column will be lost.
  - The `content` column on the `Tile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `sectionNames` on the `Topic` table. All the data in the column will be lost.
  - Added the required column `sectionName` to the `Tile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tile" DROP COLUMN "sectionIndex",
ADD COLUMN     "sectionName" TEXT NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" TEXT[];

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "sectionNames";
