/*
  Warnings:

  - A unique constraint covering the columns `[content,tileId]` on the table `TileContent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TileContent_content_tileId_key" ON "TileContent"("content", "tileId");
