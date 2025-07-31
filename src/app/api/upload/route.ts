import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { saveUploadedFile, validateFileType } from '@/lib/upload'
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['spec', 'pricing', 'notice'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid file type specified' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!validateFileType(file, type as 'spec' | 'pricing' | 'notice')) {
      return NextResponse.json(
        { error: `Invalid file format for ${type}` },
        { status: 400 }
      )
    }

    // Save the file
    const filePath = await saveUploadedFile(file, type)

    // Update publication record if it's a spec or pricing sheet
    if (type === 'spec' || type === 'pricing') {
      const updateData = type === 'spec' 
        ? { specSheetPath: filePath }
        : { pricingSheetPath: filePath }

      await prisma.publication.update({
        where: { userId: user.userId },
        data: updateData
      })
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      filePath,
      type
    })
  } catch (error) {
    console.error('Upload error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('File size exceeds')) {
        return NextResponse.json(
          { error: error.message },
          { status: 413 }
        )
      }
      
      if (error.message.includes('P2025')) {
        return NextResponse.json(
          { error: 'Publication not found. Please create a publication profile first.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}