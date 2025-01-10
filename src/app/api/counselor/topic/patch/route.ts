import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { UpdateableTopicFields } from '@/types'

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    console.log('Current user:', user)
    
    if (!user || !user.id) {
      console.log('User authentication failed')
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    console.log('Received patch request body:', body)

    const { topicId, ...updateFields } = body

    if (!topicId) {
      return new NextResponse(JSON.stringify({ error: 'Topic ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Filter out undefined values and only include valid fields
    const validUpdateFields: UpdateableTopicFields = {}
    if ('fullName' in updateFields) validUpdateFields.fullName = updateFields.fullName
    if ('shortName' in updateFields) validUpdateFields.shortName = updateFields.shortName
    if ('icon' in updateFields) validUpdateFields.icon = updateFields.icon
    if ('sectionNames' in updateFields) validUpdateFields.sectionNames = updateFields.sectionNames
    if ('solved' in updateFields) validUpdateFields.solved = updateFields.solved

    console.log('Updating topic with fields:', validUpdateFields)

    try {
      const updatedTopic = await prisma.topic.update({
        where: {
          id: topicId,
          userId: user.id, // Ensure user owns this topic
        },
        data: validUpdateFields,
      })
      
      console.log('Updated topic:', updatedTopic)
      return new NextResponse(JSON.stringify(updatedTopic), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (prismaError) {
      console.error('Prisma error:', prismaError)
      return new NextResponse(JSON.stringify({ 
        error: 'Database error', 
        details: prismaError instanceof Error ? prismaError.message : 'Unknown database error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Route handler error:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to update topic', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}