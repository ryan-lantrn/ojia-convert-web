import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { title, originalFilePath, scheduledDate } = await request.json()

    if (!title || !originalFilePath || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the user's publication
    const publication = await prisma.publication.findUnique({
      where: { userId: user.userId }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found. Please create a publication profile first.' },
        { status: 404 }
      )
    }

    // Create the notice
    const notice = await prisma.publicNotice.create({
      data: {
        title,
        content: '', // Will be extracted during conversion
        originalFilePath,
        scheduledDate: new Date(scheduledDate),
        status: 'PENDING',
        userId: user.userId,
        publicationId: publication.id,
      },
    })

    return NextResponse.json(
      { message: 'Notice created successfully', notice },
      { status: 201 }
    )
  } catch (error) {
    console.error('Notice creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const notices = await prisma.publicNotice.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        publication: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ notices })
  } catch (error) {
    console.error('Notice fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}