'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define the stats type
type DashboardStats = {
  totalMembers: number;
  totalDistricts: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  status: string;
  is_published: boolean;
  donations_count: number;
};

// Client-side component for dashboard stats
function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalDistricts: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Fetch members count
        const membersResponse = await apiClient.getMembers({ page: 1, limit: 1 });
        const totalMembers = membersResponse.pagination?.total || 0;

        // Fetch districts count
        const districtsResponse = await apiClient.getDistricts({ page: 1, limit: 1 });
        const totalDistricts = districtsResponse.pagination?.total || 0;

        // Fetch active projects
        const projectsResponse = await apiClient.getPublishedProjects({ page: 1, limit: 6 });
        const activeProjects = projectsResponse.data || [];

        setStats({
          totalMembers,
          totalDistricts,
        });
        setProjects(activeProjects);

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link 
            href="/auth/login"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your church management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Total Members</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalMembers}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-indigo-100 rounded-full p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Total Districts</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalDistricts}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/members"
            className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-sm font-medium text-indigo-900">View Members</span>
          </Link>

          <Link
            href="/cell-groups"
            className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="h-5 w-5 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-purple-900">Cell Groups</span>
          </Link>

          <Link
            href="/districts"
            className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-sm font-medium text-green-900">Manage Districts</span>
          </Link>

          <div className="flex items-center p-3 bg-gray-100 rounded-lg opacity-50">
            <svg className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Settings (Coming Soon)</span>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Active Projects</h2>
          {user?.role === 'admin' && (
            <Link
              href="/admin/projects"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              View All →
            </Link>
          )}
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                
                <h3 className="font-medium text-gray-900 mb-2 overflow-hidden text-ellipsis">
                  {project.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 overflow-hidden text-ellipsis">
                  {project.description.length > 100 
                    ? project.description.substring(0, 100) + '...' 
                    : project.description}
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round(project.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(project.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(project.current_amount)}
                    </span>
                    <span>
                      of {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(project.target_amount)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {project.donations_count} donations
                  </span>
                  {user?.role === 'admin' ? (
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Manage →
                    </Link>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no published projects.
            </p>
            {user?.role === 'admin' && (
              <div className="mt-6">
                <Link
                  href="/admin/projects/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Project
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/members"
            className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-sm font-medium text-indigo-900">View Members</span>
          </Link>

          <Link
            href="/cell-groups"
            className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="h-5 w-5 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-purple-900">Cell Groups</span>
          </Link>

          <Link
            href="/districts"
            className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-sm font-medium text-green-900">Manage Districts</span>
          </Link>

          {user?.role === 'admin' && (
            <Link
              href="/admin/projects"
              className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <svg className="h-5 w-5 text-orange-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium text-orange-900">Manage Projects</span>
            </Link>
          )}

          <div className="flex items-center p-3 bg-gray-100 rounded-lg opacity-50">
            <svg className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Reports (Coming Soon)</span>
          </div>

          <div className="flex items-center p-3 bg-gray-100 rounded-lg opacity-50">
            <svg className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Settings (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <DashboardContent />
      </Layout>
    </ProtectedRoute>
  );
}
