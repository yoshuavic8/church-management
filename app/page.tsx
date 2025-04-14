import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center">Church Management System</h1>
        
        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Welcome</h2>
          <div className="space-y-4">
            <Link href="/auth/login" className="btn-primary w-full block text-center">
              Login
            </Link>
            <Link href="/auth/register" className="btn-secondary w-full block text-center">
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
