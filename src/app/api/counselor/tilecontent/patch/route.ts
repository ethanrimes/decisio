import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { id, content } = await request.json()

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'TileContent ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify the tile content belongs to the user
    const tileContent = await prisma.tileContent.findUnique({
      where: { id },
      include: {
        tile: {
          include: {
            topic: true
          }
        }
      }
    })

    if (!tileContent || tileContent.tile.topic.userId !== user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update the tile content
    const updatedTileContent = await prisma.tileContent.update({
      where: { id },
      data: {
        content,
        modifiedAt: new Date()
      }
    })

    return new NextResponse(JSON.stringify(updatedTileContent), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to update tile content:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to update tile content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
