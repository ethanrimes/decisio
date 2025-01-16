import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    const options = await prisma.decisionOption.findMany({
      where: { 
        topicId,
        status: {
          not: 'rejected'
        }
      }
    })

    return NextResponse.json(options || [])
  } catch (error) {
    console.error('Error fetching decision options:', error)
    return NextResponse.json([])
  }
}
