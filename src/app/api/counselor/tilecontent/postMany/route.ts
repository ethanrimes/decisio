import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { contents, tileId } = await request.json()

    const tileContents = await prisma.tileContent.createMany({
      data: contents.map((content: string) => ({
        content,
        tileId,
      })),
      skipDuplicates: true, // Skips rows that already exist
    })

    return new NextResponse(JSON.stringify(tileContents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create tile contents' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
