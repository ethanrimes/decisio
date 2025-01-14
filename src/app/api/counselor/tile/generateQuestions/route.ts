import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTileQuestions } from '@/lib/openai/queries/generateTileQuestions'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const tileId = searchParams.get('tileId')

    if (!topicId || !tileId) {
      return new NextResponse(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch the necessary data
    const tile = await prisma.tile.findUnique({
      where: { id: tileId },
      include: { contents: true }
    })

    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!tile || !topic) {
      return new NextResponse(JSON.stringify({ error: 'Tile or Topic not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // If understanding is already 3, return empty results
    if (tile.understanding === 3) {
      return new NextResponse(JSON.stringify({
        understanding: 3,
        question: "",
        sampleAnswers: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate questions and understanding level
    const result = await generateTileQuestions(
      topic,
      tile.sectionName,
      tile.contents
    )

    // Update the tile's understanding level in the database
    await prisma.tile.update({
      where: { id: tileId },
      data: { understanding: result.understanding }
    })

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in generateQuestions:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
