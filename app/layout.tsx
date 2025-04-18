import './globals.css'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { ReactNode } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import MobileOptimization from './components/layout/MobileOptimization'

// Suppress hydration warnings
const BodyContent = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

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
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} font-outfit`} suppressHydrationWarning={true}>
        <AuthProvider>
          <MobileOptimization />
          <BodyContent>{children}</BodyContent>
        </AuthProvider>
      </body>
    </html>
  )
}
