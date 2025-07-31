import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB

export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function saveUploadedFile(
  file: File,
  subfolder: string = ''
): Promise<string> {
  await ensureUploadDir()

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  const extension = path.extname(file.name)
  const filename = `${uuidv4()}${extension}`
  const uploadPath = subfolder 
    ? path.join(UPLOAD_DIR, subfolder)
    : UPLOAD_DIR

  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true })
  }

  const filePath = path.join(uploadPath, filename)
  await writeFile(filePath, buffer)

  return subfolder 
    ? path.join(subfolder, filename)
    : filename
}

export function getFileUrl(filePath: string): string {
  return `/uploads/${filePath}`
}

export const ALLOWED_FILE_TYPES = {
  spec: ['.pdf', '.indd', '.idml', '.docx', '.doc'],
  pricing: ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.doc'],
  notice: ['.pdf', '.docx', '.doc', '.txt', '.rtf']
}

export function validateFileType(file: File, type: keyof typeof ALLOWED_FILE_TYPES): boolean {
  const extension = path.extname(file.name).toLowerCase()
  return ALLOWED_FILE_TYPES[type].includes(extension)
}