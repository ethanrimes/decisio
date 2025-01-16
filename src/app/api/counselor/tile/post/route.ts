import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function createNewTile(sectionName: string, userId: string, topicId: string, content: string[] = []) {
  const tile = await prisma.tile.create({
    data: {
      sectionName,
      userId,
      topicId,
    }
  })

  const contentPromises = content.map(async (contentItem) => {
    return await prisma.tileContent.create({
      data: {
        content: contentItem,
        tileId: tile.id,
      },
      skipDuplicates: true, // Skips rows that already exist
    })
  })

  const tileContents = await Promise.all(contentPromises)
  return { ...tile, contents: tileContents }
}

export async function POST(request: Request) {
  console.log('Starting POST request for tile creation')
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { content, topicId, sectionName } = await request.json()
    const result = await createNewTile(sectionName, user.id, topicId, content)

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to create tile:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to create tile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}