import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateDecisionOptions } from '@/lib/openai/queries/generateDecisionOption'

export async function POST(request: Request) {
  try {
    console.log('Starting POST request for decision option generation')
    
    const user = await getCurrentUser()
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', user.id)

    const { topicId } = await request.json()
    console.log('Received topicId:', topicId)

    // Get the topic with decision options and tiles
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        decisionOptions: true,
        tiles: {
          include: {
            contents: true
          }
        }
      }
    })

    if (!topic) {
      console.log('Topic not found for id:', topicId)
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    console.log('Found topic:', topic.fullName)

    // Get existing recommendations
    const existingOptions = topic.decisionOptions || []
    console.log('Existing options count:', existingOptions.length)

    // Collect all tile contents and flatten into string array
    const userInformation = topic.tiles
      .flatMap(tile => tile.contents)
      .map(content => content.content)
      .filter(content => content && content.trim() !== '')

    console.log('Collected user information count:', userInformation.length)
    console.log('User information:', userInformation)

    // Generate new option
    console.log('Generating new option...')
    const [newOption] = await generateDecisionOptions(
      topic.fullName,
      existingOptions,
      userInformation,
      topicId
    )

    if (!newOption) {
      console.log('Failed to generate option')
      return NextResponse.json({ error: 'Failed to generate option' }, { status: 500 })
    }
    // In the POST function, before saving to database:
    console.log('Generated new option:', newOption)
    
    // Validate arrays before saving
    const cleanedOption = {
        name: newOption.name || '',
        description: newOption.description || '',
        fitReasons: Array.isArray(newOption.fitReasons) ? newOption.fitReasons : [],
        metrics: Array.isArray(newOption.metrics) ? newOption.metrics : [],
        implementationSteps: Array.isArray(newOption.implementationSteps) ? newOption.implementationSteps : [],
        timeline: Array.isArray(newOption.timeline) ? newOption.timeline : [],
        status: 'pending',
        topicId: topicId,
        userId: user.id
    };

    console.log('Cleaned option for database:', cleanedOption);
    const savedOption = await prisma.decisionOption.create({
        data: cleanedOption
    });
    console.log('Option saved successfully:', savedOption.id)

    return NextResponse.json(savedOption)
  } catch (error) {
    console.error('Error in decision option generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate decision option' },
      { status: 500 }
    )
  }
}
