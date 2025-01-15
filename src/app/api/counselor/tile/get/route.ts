import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      console.log('Tile GET: Unauthorized - no user');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      console.log('Tile GET: No topicId provided');
      return new NextResponse(JSON.stringify({ error: 'Topic ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch tiles with safe handling of null/empty values
    const tiles = await prisma.tile.findMany({
        where: {
          topicId: topicId,
          topic: {
            userId: user.id
          }
        },
        include: {
          contents: true // Simple include without destructuring
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

    // If no tiles found, return empty array
    if (!tiles || tiles.length === 0) {
      return new NextResponse(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Safely sanitize the data without destructuring
    const sanitizedTiles = tiles.map(tile => ({
      id: tile.id,
      sectionName: tile.sectionName,
      question: tile.question || null,
      answerOptions: Array.isArray(tile.answerOptions) ? tile.answerOptions : [],
      understanding: tile.understanding || 0,
      createdAt: tile.createdAt,
      modifiedAt: tile.modifiedAt,
      userId: tile.userId,
      topicId: tile.topicId,
      contents: Array.isArray(tile.contents) ? tile.contents : [] // Ensure contents is always an array
    }));


    return new NextResponse(JSON.stringify(sanitizedTiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Tile GET: Error details:', {
      name: error?.name,
      message: error?.message
    });

    return new NextResponse(JSON.stringify({
      error: 'Failed to fetch tiles',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}