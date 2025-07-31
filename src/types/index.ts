export interface Publication {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  specSheetPath?: string
  pricingSheetPath?: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface PublicNotice {
  id: string
  title: string
  content: string
  originalFilePath: string
  convertedFilePath?: string
  scheduledDate: Date
  status: NoticeStatus
  createdAt: Date
  updatedAt: Date
  userId: string
  publicationId: string
}

export interface WeeklySheet {
  id: string
  weekStart: Date
  weekEnd: Date
  generatedPath?: string
  createdAt: Date
  updatedAt: Date
  publicationId: string
  notices: PublicNotice[]
}

export enum NoticeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONVERTED = 'CONVERTED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ERROR = 'ERROR'
}

export interface InDesignSpec {
  pageSize: {
    width: number
    height: string
  }
  margins: number
  typography: {
    baseFont: string
    baseFontSize: number
    leading: number
  }
  textStyles: {
    [key: string]: {
      font: string
      size: number
      leading: number
      alignment: string
      spaceAfter?: number
      spaceBefore?: number
      allCaps?: boolean
      border?: string
    }
  }
}