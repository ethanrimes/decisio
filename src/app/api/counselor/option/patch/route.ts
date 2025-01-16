import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updatedOption = await prisma.decisionOption.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(updatedOption)
  } catch (error) {
    console.error('Error updating decision option:', error)
    return NextResponse.json(
      { error: 'Failed to update decision option' },
      { status: 500 }
    )
  }
}
