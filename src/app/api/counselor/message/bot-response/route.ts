import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateBotResponse } from '@/lib/openai/queries/generateBotResponse'
import { Tile, Topic } from '@/types'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { topic, tiles } = await request.json() as { topic: Topic, tiles: Tile[] }

    if (!topic || !tiles) {
      return new NextResponse(JSON.stringify({ error: 'Invalid data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate the bot response
    const generatedQuestion = await generateBotResponse(tiles, topic);

    // Save the bot response to the database
    const savedResponse = await prisma.message.create({
      data: {
        content: generatedQuestion,
        role: 'a',
        topicId: topic.id,
      }
    });

    return new NextResponse(JSON.stringify(savedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to generate bot response:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to generate bot response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
