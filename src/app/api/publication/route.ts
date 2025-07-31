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

    const { name, address, phone, email, website } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Publication name is required' },
        { status: 400 }
      )
    }

    const existingPublication = await prisma.publication.findUnique({
      where: { userId: user.userId }
    })

    if (existingPublication) {
      return NextResponse.json(
        { error: 'Publication already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const publication = await prisma.publication.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        userId: user.userId,
      },
    })

    return NextResponse.json(
      { message: 'Publication created successfully', publication },
      { status: 201 }
    )
  } catch (error) {
    console.error('Publication creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { name, address, phone, email, website } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Publication name is required' },
        { status: 400 }
      )
    }

    const publication = await prisma.publication.update({
      where: { userId: user.userId },
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
      },
    })

    return NextResponse.json(
      { message: 'Publication updated successfully', publication },
      { status: 200 }
    )
  } catch (error) {
    console.error('Publication update error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

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

    const publication = await prisma.publication.findUnique({
      where: { userId: user.userId }
    })

    return NextResponse.json({ publication })
  } catch (error) {
    console.error('Publication fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}