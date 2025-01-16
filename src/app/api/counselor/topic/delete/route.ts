import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('id')

    console.log('DELETE route: Starting deletion process for topicId:', topicId)

    if (!topicId) {
      console.log('DELETE route: No topicId provided')
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    // First check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        tiles: {
          include: {
            contents: true
          }
        }
      }
    })

    console.log('DELETE route: Found topic:', {
      topicId,
      exists: !!topic,
      tilesCount: topic?.tiles.length,
      contentCount: topic?.tiles.reduce((acc, tile) => acc + tile.contents.length, 0)
    })

    if (!topic) {
      console.log('DELETE route: Topic not found')
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Delete all TopicContent records
    const deleteContents = await prisma.tileContent.deleteMany({
        where: {
          tile: {
            topicId: topicId
          }
        }
      })
    console.log('DELETE route: Deleted TileContents:', deleteContents)

    // Delete all tiles
    const deleteTiles = await prisma.tile.deleteMany({
      where: {
        topicId: topicId
      }
    })
    console.log('DELETE route: Deleted Tiles:', deleteTiles)

    // Delete the topic
    const deleteTopic = await prisma.topic.delete({
      where: {
        id: topicId
      }
    })
    console.log('DELETE route: Deleted Topic:', deleteTopic)

    return NextResponse.json({ 
      success: true,
      deletedCounts: {
        contents: deleteContents.count,
        tiles: deleteTiles.count,
        topic: deleteTopic ? 1 : 0
      }
    })
  } catch (error) {
    console.error('DELETE route: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Failed to delete topic',
      details: error.message 
    }, { status: 500 })
  }
}
