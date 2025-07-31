'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Publication {
  id?: string
  name: string
  address: string
  phone: string
  email: string
  website: string
}

export default function PublicationProfile() {
  const [formData, setFormData] = useState<Publication>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPublication()
  }, [])

  const fetchPublication = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        router.push('/auth/login')
        return
      }

      const data = await response.json()
      
      if (data.publication) {
        setFormData(data.publication)
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error fetching publication:', error)
      setError('Failed to load publication data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaveLoading(true)

    try {
      const response = await fetch('/api/publication', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isEditing ? 'Publication updated successfully!' : 'Publication created successfully!')
        setIsEditing(true)
        if (data.publication) {
          setFormData(data.publication)
        }
      } else {
        setError(data.error || 'Failed to save publication')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
              <span className="text-gray-700">Publication Profile</span>
            </div>
            <Link href="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Publication Profile' : 'Create Publication Profile'}
              </h1>
              <p className="text-gray-600 mt-2">
                Set up your publication information to enable automated notice conversion.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input-field w-full"
                    placeholder="Enter publication name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input-field w-full"
                    placeholder="contact@publication.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="input-field w-full"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    className="input-field w-full"
                    placeholder="https://publication.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="input-field w-full"
                  placeholder="123 Main St, City, State 12345"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard" className="btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>

            {isEditing && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">File Uploads</h3>
                <p className="text-gray-600 mb-4">
                  Upload your InDesign specification sheet and pricing sheet to enable automated conversion.
                </p>
                <Link href="/dashboard/files" className="btn-primary">
                  Manage Files
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}