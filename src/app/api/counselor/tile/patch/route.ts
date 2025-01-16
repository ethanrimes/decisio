import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: Request) {
  try {
    console.log('PATCH route started')
    const user = await getCurrentUser()
    console.log('Current user:', user)

    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const rawBody = await request.text()
    console.log('Raw request body:', rawBody)

    const body = JSON.parse(rawBody)
    console.log('Parsed body:', body)

    const { id, content } = body
    console.log('Extracted id:', id, 'content:', content)

    const updatedTile = await prisma.tile.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        content,
      }
    })

    return new NextResponse(JSON.stringify(updatedTile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to update tile:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to update tile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
