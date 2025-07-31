import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { convertNoticeToInDesign, extractTextFromFile } from '@/lib/claude'
import { writeFile } from 'fs/promises'
import path from 'path'
import { UPLOAD_DIR } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { noticeId } = await request.json()

    if (!noticeId) {
      return NextResponse.json(
        { error: 'Notice ID is required' },
        { status: 400 }
      )
    }

    // Get the notice and publication info
    const notice = await prisma.publicNotice.findFirst({
      where: {
        id: noticeId,
        userId: user.userId,
      },
      include: {
        publication: true,
      },
    })

    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      )
    }

    if (!notice.publication.specSheetPath) {
      return NextResponse.json(
        { error: 'InDesign specification sheet not found. Please upload it first.' },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.publicNotice.update({
      where: { id: noticeId },
      data: { status: 'PROCESSING' },
    })

    try {
      // Extract text content from the uploaded file
      const textContent = await extractTextFromFile(notice.originalFilePath)

      // Convert using Claude API
      const conversionResult = await convertNoticeToInDesign(
        notice.originalFilePath,
        notice.publication.specSheetPath,
        notice.publication.pricingSheetPath || undefined
      )

      if (!conversionResult.success) {
        await prisma.publicNotice.update({
          where: { id: noticeId },
          data: { 
            status: 'ERROR',
            content: textContent,
          },
        })

        return NextResponse.json(
          { error: conversionResult.error || 'Conversion failed' },
          { status: 500 }
        )
      }

      // Save the converted file
      const convertedFileName = `converted_${Date.now()}_${notice.id}.idml`
      const convertedFilePath = path.join('converted', convertedFileName)
      const fullConvertedPath = path.join(UPLOAD_DIR, convertedFilePath)

      // Ensure converted directory exists
      const { mkdir } = await import('fs/promises')
      const convertedDir = path.dirname(fullConvertedPath)
      try {
        await mkdir(convertedDir, { recursive: true })
      } catch (err) {
        // Directory might already exist
      }

      // Write the InDesign markup to file
      await writeFile(fullConvertedPath, conversionResult.indesignMarkup || '')

      // Update the notice with converted content
      await prisma.publicNotice.update({
        where: { id: noticeId },
        data: {
          status: 'CONVERTED',
          content: conversionResult.content || textContent,
          convertedFilePath,
        },
      })

      return NextResponse.json({
        message: 'Notice converted successfully',
        convertedFilePath,
        content: conversionResult.content,
      })
    } catch (conversionError) {
      console.error('Conversion process error:', conversionError)
      
      // Update status to error
      await prisma.publicNotice.update({
        where: { id: noticeId },
        data: { status: 'ERROR' },
      })

      return NextResponse.json(
        { error: 'Conversion process failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Convert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}