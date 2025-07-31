import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lantrn Web Convert</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/login" className="btn-primary">
                Login
              </Link>
              <Link href="/auth/register" className="btn-secondary">
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Streamline Your Publication Process
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload public notices and automatically convert them to InDesign-ready formats 
            based on your publication specifications. Schedule notices and generate weekly sheets effortlessly.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card">
              <div className="text-primary-600 text-3xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Publication Profiles</h3>
              <p className="text-gray-600">Create and manage your publication profile with custom InDesign specifications and pricing sheets.</p>
            </div>
            
            <div className="card">
              <div className="text-primary-600 text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Conversion</h3>
              <p className="text-gray-600">Automatically convert public notices to InDesign format using Claude AI based on your specifications.</p>
            </div>
            
            <div className="card">
              <div className="text-primary-600 text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Schedule & Track</h3>
              <p className="text-gray-600">Schedule notice publication dates and automatically generate weekly compilation sheets.</p>
            </div>
          </div>

          <div className="mt-12">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2024 Lantrn Web Convert. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}