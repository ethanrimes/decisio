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

    const { content, tileId } = await request.json()

    const tileContent = await prisma.tileContent.create({
      data: {
        content,
        tileId,
      }
    })

    return new NextResponse(JSON.stringify(tileContent), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create tile content' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
