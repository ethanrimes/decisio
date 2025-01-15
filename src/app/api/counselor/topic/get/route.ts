import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    console.log('Topic GET: Starting request');
    
    const user = await getCurrentUser()
    console.log('Topic GET: User fetched:', user ? 'User found' : 'No user');

    if (!user || !user.id) {
      console.log('Topic GET: Unauthorized - no user');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401 
      });
    }

    // Add debug logging for prisma query
    console.log('Topic GET: Attempting to fetch topics for user:', user.id);
    
    const topics = await prisma.topic.findMany({
      where: {
        userId: user.id
      },
      include: {
        tiles: {
          include: {
            contents: true
          }
        }
      }
    });

    console.log('Topic GET: Topics fetched:', {
      count: topics.length,
      topicIds: topics.map(t => t.id),
      tilesPerTopic: topics.map(t => ({
        topicId: t.id,
        tileCount: t.tiles.length,
        tileDetails: t.tiles.map(tile => ({
          id: tile.id,
          hasQuestion: tile.question !== null,
          answerOptionsCount: tile.answerOptions?.length || 0
        }))
      }))
    });

    if (!topics) {
      console.log('Topic GET: No topics found');
      return new NextResponse(JSON.stringify([]), { 
        status: 200 
      });
    }

    return new NextResponse(JSON.stringify(topics), { 
      status: 200 
    });

  } catch (error) {
    console.error('Topic GET: Error details:', {
      error,
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });

    // Ensure we're returning a valid object
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch topics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500 
      }
    );
  }
}
