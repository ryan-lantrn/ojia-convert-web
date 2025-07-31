'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Notice {
  id: string
  title: string
  content: string
  originalFilePath: string
  convertedFilePath?: string
  scheduledDate: string
  status: 'PENDING' | 'PROCESSING' | 'CONVERTED' | 'SCHEDULED' | 'PUBLISHED' | 'ERROR'
  createdAt: string
  publication: {
    name: string
  }
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch notices')
      }

      const data = await response.json()
      setNotices(data.notices)
    } catch (error) {
      console.error('Error fetching notices:', error)
      setError('Failed to load notices')
    } finally {
      setLoading(false)
    }
  }

  const retryConversion = async (noticeId: string) => {
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noticeId }),
      })

      if (response.ok) {
        fetchNotices() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || 'Conversion failed')
      }
    } catch (error) {
      setError('Network error during conversion')
    }
  }

  const getStatusBadge = (status: Notice['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      CONVERTED: 'bg-green-100 text-green-800',
      SCHEDULED: 'bg-purple-100 text-purple-800',
      PUBLISHED: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                Lantrn Web Convert
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Public Notices</span>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/upload" className="btn-primary">
                Upload Notice
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {notices.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">No notices uploaded yet</h3>
              <p className="text-gray-600 mb-6">
                Upload your first public notice to get started with automated conversion.
              </p>
              <Link href="/dashboard/upload" className="btn-primary">
                Upload Notice
              </Link>
            </div>
          ) : (
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Public Notices</h1>
                <span className="text-sm text-gray-600">
                  {notices.length} notice{notices.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Scheduled Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((notice) => (
                      <tr key={notice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{notice.title}</p>
                            <p className="text-sm text-gray-600">{notice.publication.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(notice.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {format(new Date(notice.scheduledDate), 'MMM d, yyyy')}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {notice.status === 'ERROR' && (
                              <button
                                onClick={() => retryConversion(notice.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Retry
                              </button>
                            )}
                            {notice.convertedFilePath && (
                              <a
                                href={`/uploads/${notice.convertedFilePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Download
                              </a>
                            )}
                            <a
                              href={`/uploads/${notice.originalFilePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Original
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}