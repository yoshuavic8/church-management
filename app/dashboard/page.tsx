'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { getSupabaseClient } from '../lib/supabase';

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

        // Fetch actual counts from Supabase
        const { count: membersCount, error: membersError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        if (membersError) throw membersError;

        const { count: cellGroupsCount, error: cellGroupsError } = await supabase
          .from('cell_groups')
          .select('*', { count: 'exact', head: true });

        if (cellGroupsError) throw cellGroupsError;

        const { count: districtsCount, error: districtsError } = await supabase
          .from('districts')
          .select('*', { count: 'exact', head: true });

        if (districtsError) throw districtsError;

        const { count: ministriesCount, error: ministriesError } = await supabase
          .from('ministries')
          .select('*', { count: 'exact', head: true });

        if (ministriesError) throw ministriesError;

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
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <Link href="/members" className="card bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Members</h2>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalMembers}</p>
          <p className="text-sm text-gray-500 mt-2">Click to manage members</p>
        </Link>

        <Link href="/cell-groups" className="card bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-700">Cell Groups</h2>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalCellGroups}</p>
          <p className="text-sm text-gray-500 mt-2">Click to manage cell groups</p>
        </Link>

        <Link href="/districts" className="card bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-700">Districts</h2>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalDistricts}</p>
          <p className="text-sm text-gray-500 mt-2">Click to manage districts</p>
        </Link>

        <Link href="/ministries" className="card bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-700">Ministries</h2>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalMinistries}</p>
          <p className="text-sm text-gray-500 mt-2">Click to manage ministries</p>
        </Link>

        <div className="card bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700">Active Classes</h2>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalClasses}</p>
        </div>

        <div className="card bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700">Upcoming Services</h2>
          <p className="text-3xl font-bold text-primary mt-2">{stats.upcomingServices}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/members/add" className="btn-primary text-center">
              Add New Member
            </Link>
            <Link href="/cell-groups/add" className="btn-primary text-center">
              Add New Cell Group
            </Link>
            <Link href="/districts/add" className="btn-primary text-center">
              Add New District
            </Link>
            <Link href="/ministries/add" className="btn-primary text-center">
              Add New Ministry
            </Link>
            <Link href="/attendance/record" className="btn-primary text-center">
              Record Attendance
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/10 text-primary rounded p-2 mr-4 text-center min-w-[60px]">
                <div className="text-sm font-bold">APR</div>
                <div className="text-xl font-bold">15</div>
              </div>
              <div>
                <h3 className="font-medium">Bible Study Class</h3>
                <p className="text-sm text-gray-600">7:00 PM - Main Hall</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 text-primary rounded p-2 mr-4 text-center min-w-[60px]">
                <div className="text-sm font-bold">APR</div>
                <div className="text-xl font-bold">18</div>
              </div>
              <div>
                <h3 className="font-medium">Leadership Meeting</h3>
                <p className="text-sm text-gray-600">6:30 PM - Conference Room</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary/10 text-primary rounded p-2 mr-4 text-center min-w-[60px]">
                <div className="text-sm font-bold">APR</div>
                <div className="text-xl font-bold">20</div>
              </div>
              <div>
                <h3 className="font-medium">Sunday Service</h3>
                <p className="text-sm text-gray-600">10:00 AM - Main Sanctuary</p>
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
    <div>
      <Header
        title="Dashboard"
        showBackButton={false}
      />
      <DashboardContent />
    </div>
  );
}
