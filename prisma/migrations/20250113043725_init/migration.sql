/*
  Warnings:

  - You are about to drop the column `content` on the `Tile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tile" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "TileContent" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "tileId" TEXT NOT NULL,

    CONSTRAINT "TileContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TileContent_tileId_idx" ON "TileContent"("tileId");

-- AddForeignKey
ALTER TABLE "TileContent" ADD CONSTRAINT "TileContent_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "Tile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
