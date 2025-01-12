import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  console.log('Starting POST request for tile creation')
  try {
    // Get the current user
    console.log('Attempting to get current user')
    const user = await getCurrentUser()
    console.log('Current user:', { id: user?.id, email: user?.email })
    
    if (!user || !user.id) {
      console.log('Authentication failed - no user or user ID')
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get request body
    console.log('Parsing request body')
    const body = await request.json()
    const { content, topicId, sectionName } = body
    console.log('Request body:', { content, topicId, sectionName })

    // Validate content is an array of strings
    console.log('Validating content array')
    if (!Array.isArray(content) || !content.every(item => typeof item === 'string')) {
      console.log('Content validation failed:', { 
        isArray: Array.isArray(content), 
        content 
      })
      return new NextResponse(JSON.stringify({ error: 'Content must be an array of strings' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create the tile
    console.log('Attempting to create tile in database')
    const tile = await prisma.tile.create({
      data: {
        content,
        sectionName,
        userId: user.id,
        topicId,
      }
    })
    console.log('Tile created successfully:', tile)

    return new NextResponse(JSON.stringify(tile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Failed to create tile:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to create tile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}