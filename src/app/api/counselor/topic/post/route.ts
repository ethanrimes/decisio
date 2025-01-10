import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
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

    // Verify the user exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      console.error('User not found in database:', user.id)
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    console.log('Request payload:', body)
    console.log('Icon value (icon):', body.icon)

    const { fullName, shortName, icon } = body

    try {
      const topic = await prisma.topic.create({
        data: {
          fullName,
          shortName,
          icon,
          userId: dbUser.id, // Use the verified user ID
          sectionNames: [], // Initialize with empty array
        },
      })

      console.log('Created topic:', topic)
      return new NextResponse(JSON.stringify(topic), {
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
      error: 'Failed to create topic', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}