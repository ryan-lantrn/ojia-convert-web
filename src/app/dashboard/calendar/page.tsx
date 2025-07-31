'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Calendar from 'react-calendar'
import { format, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import 'react-calendar/dist/Calendar.css'

interface Notice {
  id: string
  title: string
  scheduledDate: string
  status: string
}

export default function CalendarPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
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

  const getNoticesForDate = (date: Date) => {
    return notices.filter(notice => 
      isSameDay(new Date(notice.scheduledDate), date)
    )
  }

  const getNoticesForWeek = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }) // Sunday
    
    return notices.filter(notice => {
      const noticeDate = new Date(notice.scheduledDate)
      return noticeDate >= weekStart && noticeDate <= weekEnd
    })
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayNotices = getNoticesForDate(date)
      if (dayNotices.length > 0) {
        return (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
          </div>
        )
      }
    }
    return null
  }

  const generateWeeklySheet = async () => {
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const response = await fetch('/api/weekly-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Download the generated sheet
        window.open(`/uploads/${data.filePath}`, '_blank')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to generate weekly sheet')
      }
    } catch (error) {
      setError('Network error during sheet generation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const selectedDateNotices = getNoticesForDate(selectedDate)
  const weeklyNotices = getNoticesForWeek(selectedDate)

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
              <span className="text-gray-700">Schedule Calendar</span>
            </div>
            <Link href="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Publication Schedule</h2>
                <div className="calendar-container">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="w-full"
                  />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
                  <span>Days with scheduled notices</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Details */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                
                {selectedDateNotices.length === 0 ? (
                  <p className="text-gray-600 text-sm">No notices scheduled for this date.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateNotices.map((notice) => (
                      <div key={notice.id} className="border-l-4 border-primary-500 pl-3">
                        <p className="font-medium text-sm">{notice.title}</p>
                        <p className="text-xs text-gray-600 uppercase">{notice.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Summary */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">This Week</h3>
                  <span className="text-sm text-gray-600">
                    {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - {' '}
                    {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')}
                  </span>
                </div>
                
                <p className="text-2xl font-bold text-primary-600 mb-2">
                  {weeklyNotices.length}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  notice{weeklyNotices.length !== 1 ? 's' : ''} scheduled
                </p>

                {weeklyNotices.length > 0 && (
                  <button
                    onClick={generateWeeklySheet}
                    className="btn-primary w-full text-sm"
                  >
                    Generate Weekly Sheet
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/dashboard/upload" className="block btn-primary text-center text-sm">
                    Upload New Notice
                  </Link>
                  <Link href="/dashboard/notices" className="block btn-secondary text-center text-sm">
                    View All Notices
                  </Link>
                  <Link href="/dashboard/weekly-sheets" className="block btn-secondary text-center text-sm">
                    View Weekly Sheets
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Notices */}
          {notices.length > 0 && (
            <div className="mt-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Upcoming Notices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notices
                    .filter(notice => new Date(notice.scheduledDate) >= new Date())
                    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                    .slice(0, 6)
                    .map((notice) => (
                      <div key={notice.id} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-sm mb-1">{notice.title}</p>
                        <p className="text-xs text-gray-600 mb-2">
                          {format(new Date(notice.scheduledDate), 'MMM d, yyyy')}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notice.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                          notice.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          notice.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notice.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        .react-calendar__tile {
          position: relative;
          padding: 0.75em 0.5em;
        }
        
        .react-calendar__tile:hover {
          background-color: #f3f4f6;
        }
        
        .react-calendar__tile--active {
          background-color: #3b82f6 !important;
          color: white;
        }
      `}</style>
    </div>
  )
}