import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get topicId from URL params
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    if (!topicId) {
      return new NextResponse(JSON.stringify({ error: 'Topic ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch tiles for the specific topic
    const tiles = await prisma.tile.findMany({
      where: {
        topicId: topicId,
        topic: {
          userId: user.id // Ensure user can only access their own tiles
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return new NextResponse(JSON.stringify(tiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to fetch tiles:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to fetch tiles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}