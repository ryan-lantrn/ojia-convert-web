'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
}

interface Publication {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  specSheetPath?: string
  pricingSheetPath?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [publication, setPublication] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        router.push('/auth/login')
        return
      }

      const data = await response.json()
      setUser(data.user)
      setPublication(data.publication)
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
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
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                Lantrn Web Convert
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Publication Profile Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Publication Profile</h3>
                {publication ? (
                  <span className="text-green-600 text-sm">✓ Complete</span>
                ) : (
                  <span className="text-red-600 text-sm">⚠ Incomplete</span>
                )}
              </div>
              
              {publication ? (
                <div className="space-y-2">
                  <p className="font-medium">{publication.name}</p>
                  {publication.email && <p className="text-sm text-gray-600">{publication.email}</p>}
                  {publication.phone && <p className="text-sm text-gray-600">{publication.phone}</p>}
                  <div className="mt-4">
                    <Link href="/dashboard/publication" className="btn-primary text-sm">
                      Edit Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">Create your publication profile to get started.</p>
                  <Link href="/dashboard/publication" className="btn-primary">
                    Create Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Public Notices Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Public Notices</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">0</span>
              </div>
              <p className="text-gray-600 mb-4">Upload and manage public notices for conversion.</p>
              <Link href="/dashboard/notices" className="btn-primary">
                Manage Notices
              </Link>
            </div>

            {/* Weekly Sheets Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Weekly Sheets</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">0</span>
              </div>
              <p className="text-gray-600 mb-4">View and download weekly compilation sheets.</p>
              <Link href="/dashboard/weekly-sheets" className="btn-primary">
                View Sheets
              </Link>
            </div>

            {/* Upload Files Card */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/upload" className="block btn-secondary text-center">
                  Upload Notice
                </Link>
                <Link href="/dashboard/calendar" className="block btn-secondary text-center">
                  Schedule Calendar
                </Link>
              </div>
            </div>

            {/* File Management Card */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">File Management</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">InDesign Specs:</span>
                  {publication?.specSheetPath ? (
                    <span className="text-green-600 text-sm">✓ Uploaded</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pricing Sheet:</span>
                  {publication?.pricingSheetPath ? (
                    <span className="text-green-600 text-sm">✓ Uploaded</span>
                  ) : (
                    <span className="text-red-600 text-sm">Missing</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="text-gray-600 text-sm">
                <p>No recent activity</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}