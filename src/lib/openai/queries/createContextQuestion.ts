import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function getCreateContextQuestionResponse(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { topicId } = await request.json()

    // Create and save bot response
    const botResponse = await prisma.message.create({
      data: {
        content: "I'm analyzing your input and will provide guidance shortly...",
        role: 'a',
        topicId,
      }
    })

    return new NextResponse(JSON.stringify(botResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to create AI response:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to create AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
