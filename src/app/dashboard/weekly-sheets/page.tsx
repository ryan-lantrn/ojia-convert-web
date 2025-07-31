'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface WeeklySheet {
  id: string
  weekStart: string
  weekEnd: string
  generatedPath?: string
  createdAt: string
  notices: {
    notice: {
      id: string
      title: string
      scheduledDate: string
      status: string
    }
  }[]
}

export default function WeeklySheetsPage() {
  const [weeklySheets, setWeeklySheets] = useState<WeeklySheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchWeeklySheets()
  }, [])

  const fetchWeeklySheets = async () => {
    try {
      const response = await fetch('/api/weekly-sheets')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch weekly sheets')
      }

      const data = await response.json()
      setWeeklySheets(data.weeklySheets)
    } catch (error) {
      console.error('Error fetching weekly sheets:', error)
      setError('Failed to load weekly sheets')
    } finally {
      setLoading(false)
    }
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
              <span className="text-gray-700">Weekly Sheets</span>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/calendar" className="btn-primary">
                Schedule Calendar
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

          {weeklySheets.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">No weekly sheets generated yet</h3>
              <p className="text-gray-600 mb-6">
                Weekly sheets are automatically generated when you have notices scheduled for a week.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/dashboard/upload" className="btn-primary">
                  Upload Notice
                </Link>
                <Link href="/dashboard/calendar" className="btn-secondary">
                  View Calendar
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Weekly Sheets</h1>
                <span className="text-sm text-gray-600">
                  {weeklySheets.length} sheet{weeklySheets.length !== 1 ? 's' : ''} generated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklySheets.map((sheet) => (
                  <div key={sheet.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {format(new Date(sheet.weekStart), 'MMM d')} - {format(new Date(sheet.weekEnd), 'MMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Generated {format(new Date(sheet.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {sheet.notices.length} notice{sheet.notices.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {sheet.notices.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Included Notices:</h4>
                        <div className="space-y-1">
                          {sheet.notices.slice(0, 3).map(({ notice }) => (
                            <div key={notice.id} className="text-sm text-gray-600 truncate">
                              • {notice.title}
                            </div>
                          ))}
                          {sheet.notices.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{sheet.notices.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {sheet.generatedPath && (
                        <a
                          href={`/uploads/${sheet.generatedPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary flex-1 text-center text-sm"
                        >
                          Download PDF
                        </a>
                      )}
                      <Link
                        href={`/dashboard/calendar?week=${sheet.weekStart}`}
                        className="btn-secondary flex-1 text-center text-sm"
                      >
                        View Week
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Summary */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {weeklySheets.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Sheets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {weeklySheets.reduce((total, sheet) => total + sheet.notices.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Notices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {weeklySheets.filter(sheet => 
                        new Date(sheet.weekStart) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length}
                    </div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}