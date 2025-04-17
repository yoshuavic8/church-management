import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center">Church Management System</h1>

        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Welcome</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-3">Anggota Gereja</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">Login untuk anggota gereja</p>
              <Link href="/auth/member/login" className="btn-primary w-full block text-center">
                Login Anggota
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-3">Admin & Pengurus</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">Login untuk admin dan pengurus</p>
              <Link href="/auth/admin/login" className="btn-primary w-full block text-center">
                Login Admin
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/auth/register" className="btn-secondary w-full block text-center">
              Daftar Akun Baru
            </Link>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link href="/self-checkin" className="flex items-center justify-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Self Check-in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
