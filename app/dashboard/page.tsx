'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { getSupabaseClient } from '../lib/supabase';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Define the stats type
type DashboardStats = {
  totalMembers: number;
  totalCellGroups: number;
  totalDistricts: number;
  totalMinistries: number;
  totalClasses: number;
  upcomingServices: number;
};

// Client-side component for dashboard stats
function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalCellGroups: 0,
    totalDistricts: 0,
    totalMinistries: 0,
    totalClasses: 0,
    upcomingServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {

        const supabase = getSupabaseClient();

        if (!user) {

          throw new Error('Authentication required. Please login.');
        }



        // Fetch actual counts from Supabase
        const { count: membersCount, error: membersError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        if (membersError) {

          throw membersError;
        }



        const { count: cellGroupsCount, error: cellGroupsError } = await supabase
          .from('cell_groups')
          .select('*', { count: 'exact', head: true });

        if (cellGroupsError) {

          throw cellGroupsError;
        }



        const { count: districtsCount, error: districtsError } = await supabase
          .from('districts')
          .select('*', { count: 'exact', head: true });

        if (districtsError) {

          throw districtsError;
        }



        // Ministries count
        let ministriesCount = 0;
        try {
          const { count, error } = await supabase
            .from('ministries')
            .select('*', { count: 'exact', head: true });

          if (error) throw error;
          ministriesCount = count || 0;
        } catch (err) {
          console.error('Error fetching ministries count:', err);
          // Continue with other stats even if this fails
        }

        // Error handling is done in the try-catch block above



        // For now, we'll keep using placeholder data for classes and services
        setStats({
          totalMembers: membersCount || 0,
          totalCellGroups: cellGroupsCount || 0,
          totalDistricts: districtsCount || 0,
          totalMinistries: ministriesCount || 0,
          totalClasses: 5, // Placeholder
          upcomingServices: 8, // Placeholder
        });


      } catch (error: any) {

        setError(error.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Link href="/members" className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-theme-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Total Members</h2>
            <div className="rounded-full bg-brand-50 p-2 dark:bg-brand-500 dark:bg-opacity-10">
              <svg className="h-6 w-6 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to manage members</p>
        </Link>

        <Link href="/cell-groups" className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-theme-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Cell Groups</h2>
            <div className="rounded-full bg-success-50 p-2 dark:bg-success-500 dark:bg-opacity-10">
              <svg className="h-6 w-6 text-success-500 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCellGroups}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to manage cell groups</p>
        </Link>

        <Link href="/districts" className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-theme-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Districts</h2>
            <div className="rounded-full bg-warning-50 p-2 dark:bg-warning-500 dark:bg-opacity-10">
              <svg className="h-6 w-6 text-warning-500 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDistricts}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to manage districts</p>
        </Link>

        <Link href="/ministries" className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-theme-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Ministries</h2>
            <div className="rounded-full bg-error-50 p-2 dark:bg-error-500 dark:bg-opacity-10">
              <svg className="h-6 w-6 text-error-500 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMinistries}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to manage ministries</p>
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Active Classes</h2>
            <div className="rounded-full bg-brand-50 p-2 dark:bg-brand-500 dark:bg-opacity-10">
              <svg className="h-6 w-6 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClasses}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Upcoming Services</h2>
            <div className="rounded-full bg-success-50 p-2 dark:bg-success-500 dark:bg-opacity-10">
              <svg className="h-6 w-6 text-success-500 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingServices}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white/90">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/members/add" className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Add New Member
            </Link>
            <Link href="/cell-groups/add" className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Add New Cell Group
            </Link>
            <Link href="/districts/add" className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Add New District
            </Link>
            <Link href="/ministries/add" className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Add New Ministry
            </Link>
            <Link href="/attendance/record" className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Record Attendance
            </Link>
            <Link href="/scan" className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              Quick Scan Attendance
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white/90">Upcoming Events</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-brand-50 text-brand-500 rounded-lg p-2 mr-4 text-center min-w-[60px] dark:bg-brand-500 dark:bg-opacity-10 dark:text-brand-400">
                <div className="text-sm font-bold">APR</div>
                <div className="text-xl font-bold">15</div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white/90">Bible Study Class</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">7:00 PM - Main Hall</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-brand-50 text-brand-500 rounded-lg p-2 mr-4 text-center min-w-[60px] dark:bg-brand-500 dark:bg-opacity-10 dark:text-brand-400">
                <div className="text-sm font-bold">APR</div>
                <div className="text-xl font-bold">18</div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white/90">Leadership Meeting</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">6:30 PM - Conference Room</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-brand-50 text-brand-500 rounded-lg p-2 mr-4 text-center min-w-[60px] dark:bg-brand-500 dark:bg-opacity-10 dark:text-brand-400">
                <div className="text-sm font-bold">APR</div>
                <div className="text-xl font-bold">20</div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white/90">Sunday Service</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">10:00 AM - Main Sanctuary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main dashboard page component
export default function Dashboard() {
  return (
    <ProtectedRoute adminOnly={true}>
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome to your church management dashboard</p>
        </div>
        <DashboardContent />
      </Layout>
    </ProtectedRoute>
  );
}
