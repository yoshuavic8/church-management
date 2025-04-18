'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile
          const { data, error } = await supabase
            .from('members')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setUserName(`${data.first_name} ${data.last_name}`);
          }
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/member/dashboard" className="text-xl font-bold text-primary">
                  Church App
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {loading ? 'Loading...' : `Welcome, ${userName}`}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/member/dashboard"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                isActive('/member/dashboard')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/member/profile"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                isActive('/member/profile')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Profile
            </Link>
            <Link
              href="/member/attendance"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                isActive('/member/attendance')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Attendance
            </Link>
            <Link
              href="/member/cell-group"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                isActive('/member/cell-group')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Cell Group
            </Link>
            <Link
              href="/member/news"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                isActive('/member/news')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              News & Updates
            </Link>
            <Link
              href="/self-checkin"
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                isActive('/self-checkin')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Self Check-in
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Church Management App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
