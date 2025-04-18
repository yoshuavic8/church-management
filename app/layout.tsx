import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { AuthProvider } from './contexts/AuthContext'

// Suppress hydration warnings
const BodyContent = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Church Management System',
  description: 'A comprehensive church management system for member management, cell groups, districts, classes, pastoral services, attendance tracking, and administrative document generation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <BodyContent>{children}</BodyContent>
        </AuthProvider>
      </body>
    </html>
  )
}
