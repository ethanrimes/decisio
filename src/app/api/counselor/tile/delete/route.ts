import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tileId = searchParams.get('id')

    console.log('DELETE route: Starting deletion process for tileId:', tileId)

    if (!tileId) {
      console.log('DELETE route: No tileId provided')
      return NextResponse.json({ error: 'Tile ID is required' }, { status: 400 })
    }

    // First check if tile exists
    const tile = await prisma.tile.findUnique({
      where: { id: tileId },
      include: {
        contents: true
      }
    })

    console.log('DELETE route: Found tile:', {
      tileId,
      exists: !!tile,
      contentCount: tile?.contents.length
    })

    if (!tile) {
      console.log('DELETE route: Tile not found')
      return NextResponse.json({ error: 'Tile not found' }, { status: 404 })
    }

    // Delete all TopicContent records
    const deleteContents = await prisma.tileContent.deleteMany({
      where: {
        tileId: tileId
      }
    })
    console.log('DELETE route: Deleted TileContents:', deleteContents)

    // Delete the tile
    const deleteTile = await prisma.tile.delete({
      where: {
        id: tileId
      }
    })
    console.log('DELETE route: Deleted Tile:', deleteTile)

    return NextResponse.json({ 
      success: true,
      deletedCounts: {
        contents: deleteContents.count,
        tile: deleteTile ? 1 : 0
      }
    })
  } catch (error) {
    console.error('DELETE route: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Failed to delete tile',
      details: error.message 
    }, { status: 500 })
  }
}
