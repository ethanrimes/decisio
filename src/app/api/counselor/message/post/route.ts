import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { parseUserInput } from '@/lib/openai/queries/parseUserInput'
import { createNewTile } from '@/app/api/counselor/tile/post/route'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { content, role, topicId } = body

    // Post the message to the database and fetch tiles in parallel
    const [message, tiles] = await Promise.all([
      prisma.message.create({
        data: {
          content,
          role,
          topicId,
        }
      }),
      prisma.tile.findMany({
        where: { topicId },
        include: { contents: true }
      })
    ])

    const { patchedTiles, newTiles } = await parseUserInput(content, topicId, tiles)

    // Update existing tiles with new content
    await Promise.all([
      prisma.tileContent.createMany({
        data: patchedTiles.flatMap(({ tile, newContent }) => 
          newContent.map(content => ({
            content: content.content,
            tileId: tile.id,
          }))
        ),
        skipDuplicates: true, // Skips rows that already exist
      }),
      ...newTiles.map(newTile => 
        createNewTile(newTile.sectionName, user.id, newTile.topicId, newTile.contents)
      )
    ]);

    return new NextResponse(JSON.stringify(message), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to create message:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to create message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
