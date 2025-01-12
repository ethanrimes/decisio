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

    const body = await request.json()
    const { content, role, topicId } = body

    const message = await prisma.message.create({
      data: {
        content,
        role,
        topicId,
      }
    })

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
