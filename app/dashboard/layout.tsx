import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Church Management</h1>
        </div>

        <nav className="space-y-1">
          <Link href="/dashboard" className="block py-2 px-4 rounded hover:bg-white/10">
            Dashboard
          </Link>
          <Link href="/members" className="block py-2 px-4 rounded hover:bg-white/10">
            Members
          </Link>
          <Link href="/cell-groups" className="block py-2 px-4 rounded hover:bg-white/10">
            Cell Groups
          </Link>
          <Link href="/districts" className="block py-2 px-4 rounded hover:bg-white/10">
            Districts
          </Link>
          <Link href="/classes" className="block py-2 px-4 rounded hover:bg-white/10">
            Classes
          </Link>
          <Link href="/pastoral" className="block py-2 px-4 rounded hover:bg-white/10">
            Pastoral Services
          </Link>
          <Link href="/attendance" className="block py-2 px-4 rounded hover:bg-white/10">
            Attendance
          </Link>
          <Link href="/admin" className="block py-2 px-4 rounded hover:bg-white/10">
            Administration
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full py-2 px-4 text-left rounded hover:bg-white/10"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
}
