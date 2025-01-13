import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    console.log('Tile GET: Starting request');
    
    // Get the current user
    const user = await getCurrentUser();
    console.log('Tile GET: Current user:', { id: user?.id });
    
    if (!user || !user.id) {
      console.log('Tile GET: Unauthorized - no user');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get topicId from URL params
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    console.log('Tile GET: Requested topicId:', topicId);

    if (!topicId) {
      console.log('Tile GET: No topicId provided');
      return new NextResponse(JSON.stringify({ error: 'Topic ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if topicId exists in the database
    const topicExists = await prisma.topic.findUnique({
      where: { id: topicId }
    });
    console.log('Tile GET: Topic exists:', topicExists ? 'Yes' : 'No');

    // Fetch tiles
    console.log('Tile GET: Fetching tiles from database');
    const tiles = await prisma.tile.findMany({
        where: {
          topicId: topicId,
          topic: {
            userId: user.id
          }
        },
        include: {
          contents: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              modifiedAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }) || [];  // Ensure we always return an array
    console.log('Tile GET: Found tiles:', tiles);

    if (!tiles) {
      console.log('Tile GET: No tiles found');
      return new NextResponse(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new NextResponse(JSON.stringify(tiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Tile GET: Failed to fetch tiles:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to fetch tiles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}