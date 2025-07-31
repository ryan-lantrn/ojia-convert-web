'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface Publication {
  id: string
  name: string
  specSheetPath?: string
  pricingSheetPath?: string
}

export default function UploadNotice() {
  const [publication, setPublication] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    scheduledDate: new Date(),
    file: null as File | null
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPublication()
  }, [])

  const fetchPublication = async () => {
    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        router.push('/auth/login')
        return
      }

      const data = await response.json()
      
      if (!data.publication) {
        router.push('/dashboard/publication')
        return
      }

      setPublication(data.publication)

      if (!data.publication.specSheetPath || !data.publication.pricingSheetPath) {
        setError('Please upload your InDesign specification sheet and pricing sheet before uploading notices.')
      }
    } catch (error) {
      console.error('Error fetching publication:', error)
      setError('Failed to load publication data')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFormData(prev => ({ ...prev, file: acceptedFiles[0] }))
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf']
    },
    maxFiles: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file) {
      setError('Please select a file to upload')
      return
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for the notice')
      return
    }

    if (!publication?.specSheetPath || !publication?.pricingSheetPath) {
      setError('Please upload specification and pricing sheets first')
      return
    }

    setError('')
    setSuccess('')
    setUploading(true)

    try {
      // First upload the file
      const uploadFormData = new FormData()
      uploadFormData.append('file', formData.file)
      uploadFormData.append('type', 'notice')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload failed')
      }

      // Then create the notice record
      const noticeResponse = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          originalFilePath: uploadData.filePath,
          scheduledDate: formData.scheduledDate.toISOString(),
        }),
      })

      const noticeData = await noticeResponse.json()

      if (!noticeResponse.ok) {
        throw new Error(noticeData.error || 'Failed to create notice')
      }

      setUploading(false)
      setConverting(true)

      // Start the conversion process
      const convertResponse = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noticeId: noticeData.notice.id,
        }),
      })

      const convertData = await convertResponse.json()

      if (convertResponse.ok) {
        setSuccess('Notice uploaded and conversion started! You can view the progress in your dashboard.')
        setFormData({
          title: '',
          scheduledDate: new Date(),
          file: null
        })
      } else {
        setSuccess('Notice uploaded successfully, but conversion failed. You can retry from the notices page.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      setConverting(false)
    }
  }

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, scheduledDate: date }))
    setShowCalendar(false)
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
              <span className="text-gray-700">Upload Notice</span>
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
              <h1 className="text-2xl font-bold text-gray-900">Upload Public Notice</h1>
              <p className="text-gray-600 mt-2">
                Upload a public notice for automatic conversion to InDesign format based on your specifications.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
                {!publication?.specSheetPath || !publication?.pricingSheetPath ? (
                  <div className="mt-2">
                    <Link href="/dashboard/files" className="text-red-700 underline">
                      Upload missing files here
                    </Link>
                  </div>
                ) : null}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
                {success}
                <div className="mt-2">
                  <Link href="/dashboard/notices" className="text-green-700 underline">
                    View all notices
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Enter a descriptive title for this notice"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Publication Date *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="input-field w-full text-left flex justify-between items-center"
                  >
                    <span>{formData.scheduledDate.toLocaleDateString()}</span>
                    <span className="text-gray-400">📅</span>
                  </button>
                  
                  {showCalendar && (
                    <div className="absolute top-full left-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <Calendar
                        onChange={handleDateChange}
                        value={formData.scheduledDate}
                        minDate={new Date()}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice File *
                </label>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {uploading ? (
                    <div className="text-gray-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p>Uploading notice...</p>
                    </div>
                  ) : converting ? (
                    <div className="text-gray-600">
                      <div className="animate-pulse">
                        <div className="text-4xl mb-4">🤖</div>
                        <p>Converting notice to InDesign format...</p>
                        <p className="text-sm mt-2">This may take a moment</p>
                      </div>
                    </div>
                  ) : formData.file ? (
                    <div className="text-green-600">
                      <div className="text-4xl mb-4">✓</div>
                      <p className="font-medium">{formData.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-lg mb-2">
                        {isDragActive
                          ? 'Drop your notice file here'
                          : 'Drop notice file here or click to browse'}
                      </p>
                      <p className="text-sm">
                        Supported formats: PDF, DOCX, DOC, TXT, RTF
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard" className="btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={uploading || converting || !formData.file || !formData.title.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : converting ? 'Converting...' : 'Upload & Convert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}