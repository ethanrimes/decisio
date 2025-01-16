import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { id } = await request.json()

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

    // Delete the tile content
    await prisma.tileContent.delete({
      where: { id }
    })

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to delete tile content:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to delete tile content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
