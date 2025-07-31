import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateWeeklySheet } from '@/lib/weekly-sheet'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { weekStart } = await request.json()

    if (!weekStart) {
      return NextResponse.json(
        { error: 'Week start date is required' },
        { status: 400 }
      )
    }

    const weekStartDate = new Date(weekStart)
    const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 })

    // Get user's publication
    const publication = await prisma.publication.findUnique({
      where: { userId: user.userId }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    // Get notices for the week
    const notices = await prisma.publicNotice.findMany({
      where: {
        userId: user.userId,
        scheduledDate: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    // Generate the weekly sheet
    const filePath = await generateWeeklySheet(
      notices.map(notice => ({
        ...notice,
        scheduledDate: new Date(notice.scheduledDate),
      })),
      publication,
      weekStartDate
    )

    // Create or update weekly sheet record
    const existingSheet = await prisma.weeklySheet.findFirst({
      where: {
        publicationId: publication.id,
        weekStart: weekStartDate,
      },
    })

    let weeklySheet
    if (existingSheet) {
      weeklySheet = await prisma.weeklySheet.update({
        where: { id: existingSheet.id },
        data: {
          generatedPath: filePath,
          weekEnd: weekEndDate,
        },
      })

      // Delete existing notice associations
      await prisma.weeklySheetNotice.deleteMany({
        where: { weeklySheetId: existingSheet.id },
      })
    } else {
      weeklySheet = await prisma.weeklySheet.create({
        data: {
          weekStart: weekStartDate,
          weekEnd: weekEndDate,
          generatedPath: filePath,
          publicationId: publication.id,
        },
      })
    }

    // Create notice associations
    if (notices.length > 0) {
      await prisma.weeklySheetNotice.createMany({
        data: notices.map(notice => ({
          weeklySheetId: weeklySheet.id,
          noticeId: notice.id,
        })),
      })
    }

    return NextResponse.json({
      message: 'Weekly sheet generated successfully',
      filePath,
      weeklySheet,
      noticeCount: notices.length,
    })
  } catch (error) {
    console.error('Weekly sheet generation error:', error)
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

    // Get user's publication
    const publication = await prisma.publication.findUnique({
      where: { userId: user.userId }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    // Get all weekly sheets for this publication
    const weeklySheets = await prisma.weeklySheet.findMany({
      where: { publicationId: publication.id },
      include: {
        notices: {
          include: {
            notice: {
              select: {
                id: true,
                title: true,
                scheduledDate: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { weekStart: 'desc' },
    })

    return NextResponse.json({ weeklySheets })
  } catch (error) {
    console.error('Weekly sheets fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}