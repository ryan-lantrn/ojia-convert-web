'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

interface Publication {
  id: string
  name: string
  specSheetPath?: string
  pricingSheetPath?: string
}

export default function FileManagement() {
  const [publication, setPublication] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<{ spec: boolean; pricing: boolean }>({
    spec: false,
    pricing: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    } catch (error) {
      console.error('Error fetching publication:', error)
      setError('Failed to load publication data')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File, type: 'spec' | 'pricing') => {
    setError('')
    setSuccess('')
    setUploading(prev => ({ ...prev, [type]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`${type === 'spec' ? 'Specification' : 'Pricing'} sheet uploaded successfully!`)
        setPublication(prev => prev ? {
          ...prev,
          [type === 'spec' ? 'specSheetPath' : 'pricingSheetPath']: data.filePath
        } : null)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const onDropSpec = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0], 'spec')
    }
  }, [])

  const onDropPricing = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0], 'pricing')
    }
  }, [])

  const {
    getRootProps: getSpecRootProps,
    getInputProps: getSpecInputProps,
    isDragActive: isSpecDragActive
  } = useDropzone({
    onDrop: onDropSpec,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.adobe.indesign': ['.indd'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  })

  const {
    getRootProps: getPricingRootProps,
    getInputProps: getPricingInputProps,
    isDragActive: isPricingDragActive
  } = useDropzone({
    onDrop: onDropPricing,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  })

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
              <span className="text-gray-700">File Management</span>
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
              <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
              <p className="text-gray-600 mt-2">
                Upload your InDesign specification sheet and pricing sheet for automated notice conversion.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* InDesign Specification Sheet */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  InDesign Specification Sheet
                  {publication?.specSheetPath && (
                    <span className="ml-2 text-green-600 text-sm">✓ Uploaded</span>
                  )}
                </h3>

                <div
                  {...getSpecRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isSpecDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getSpecInputProps()} />
                  
                  {uploading.spec ? (
                    <div className="text-gray-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p>Uploading specification sheet...</p>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-lg mb-2">
                        {isSpecDragActive
                          ? 'Drop your spec sheet here'
                          : 'Drop spec sheet here or click to browse'}
                      </p>
                      <p className="text-sm">
                        Supported formats: PDF, INDD, DOCX, DOC
                      </p>
                      {publication?.specSheetPath && (
                        <p className="text-sm text-green-600 mt-2">
                          Current file uploaded
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">What to include in your spec sheet:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Page dimensions and margins</li>
                    <li>Font specifications and sizes</li>
                    <li>Text styles and formatting rules</li>
                    <li>Layout requirements</li>
                  </ul>
                </div>
              </div>

              {/* Pricing Sheet */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Pricing Sheet
                  {publication?.pricingSheetPath && (
                    <span className="ml-2 text-green-600 text-sm">✓ Uploaded</span>
                  )}
                </h3>

                <div
                  {...getPricingRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isPricingDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getPricingInputProps()} />
                  
                  {uploading.pricing ? (
                    <div className="text-gray-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p>Uploading pricing sheet...</p>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <div className="text-4xl mb-4">💰</div>
                      <p className="text-lg mb-2">
                        {isPricingDragActive
                          ? 'Drop your pricing sheet here'
                          : 'Drop pricing sheet here or click to browse'}
                      </p>
                      <p className="text-sm">
                        Supported formats: PDF, XLSX, XLS, CSV, DOCX, DOC
                      </p>
                      {publication?.pricingSheetPath && (
                        <p className="text-sm text-green-600 mt-2">
                          Current file uploaded
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">What to include in your pricing sheet:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cost per line or column inch</li>
                    <li>Minimum charges</li>
                    <li>Rush fees and deadlines</li>
                    <li>Special formatting costs</li>
                  </ul>
                </div>
              </div>
            </div>

            {publication?.specSheetPath && publication?.pricingSheetPath && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 text-2xl mr-3">✓</span>
                  <div>
                    <h4 className="text-green-800 font-semibold">Setup Complete!</h4>
                    <p className="text-green-600">
                      Both files have been uploaded. You can now start uploading public notices for conversion.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/upload" className="btn-primary">
                    Upload Your First Notice
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}