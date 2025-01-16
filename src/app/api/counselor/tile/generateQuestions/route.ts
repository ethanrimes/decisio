import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTileQuestions } from '@/lib/openai/queries/generateTileQuestions'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    console.log('GenerateQuestions: Starting request');
    
    const user = await getCurrentUser()
    console.log('GenerateQuestions: User authentication:', !!user);

    if (!user) {
      console.log('GenerateQuestions: Unauthorized - no user');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const tileId = searchParams.get('tileId')

    console.log('GenerateQuestions: Request parameters:', {
      topicId,
      tileId
    });

    if (!topicId || !tileId) {
      console.log('GenerateQuestions: Missing parameters');
      return new NextResponse(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch the necessary data
    console.log('GenerateQuestions: Fetching tile and topic data');
    
    const tile = await prisma.tile.findUnique({
      where: { id: tileId },
      include: { contents: true }
    })

    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    console.log('GenerateQuestions: Database fetch results:', {
      tileFound: !!tile,
      topicFound: !!topic,
      contentsCount: tile?.contents?.length || 0
    });

    if (!tile || !topic) {
      console.log('GenerateQuestions: Tile or Topic not found');
      return new NextResponse(JSON.stringify({ error: 'Tile or Topic not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // If understanding is already 4, return empty results
    if (tile.understanding === 4) {
      console.log('GenerateQuestions: Tile already at max understanding');
      return new NextResponse(JSON.stringify({
        understanding: 4,
        question: "",
        sampleAnswers: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate questions and understanding level
    console.log('GenerateQuestions: Calling OpenAI with parameters:', {
      topicName: topic.fullName,
      sectionName: tile.sectionName,
      contentsPreview: tile.contents.map(c => ({
        id: c.id,
        contentPreview: c.content.substring(0, 50) + '...'
      }))
    });

    const result = await generateTileQuestions(
      topic,
      tile.sectionName,
      tile.contents
    )

    console.log('GenerateQuestions: OpenAI response:', {
      understanding: result.understanding,
      questionGenerated: !!result.question,
      answerOptionsCount: result.sampleAnswers?.length || 0,
      question: result.question,
      sampleAnswers: result.sampleAnswers
    });

    // Update the tile's understanding level in the database
    console.log('GenerateQuestions: Updating tile in database');
    
    await prisma.tile.update({
      where: { id: tileId },
      data: { 
        understanding: result.understanding,
        question: result.question,
        answerOptions: result.sampleAnswers
      }
    })

    console.log('GenerateQuestions: Tile updated successfully');

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('GenerateQuestions: Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });

    return new NextResponse(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
