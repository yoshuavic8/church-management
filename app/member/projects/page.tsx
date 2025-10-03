'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemberLayout from '../../components/layout/MemberLayout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  creator?: {
    first_name: string;
    last_name: string;
  };
};

function MemberProjectsContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        setLoading(true);

        // Build query params
        const params: any = { 
          page: currentPage, 
          limit: itemsPerPage 
        };

        if (searchQuery) params.search = searchQuery;

        // Fetch published projects
        const response = await apiClient.getPublishedProjects(params);
        setProjects(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjectsData();
  }, [currentPage, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysLeft = (eventDate: string) => {
    const now = new Date();
    const target = new Date(eventDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading projects</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link 
            href="/member/dashboard"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project & Program Gereja</h1>
            <p className="text-gray-600">Dukung berbagai project dan program gereja melalui donasi Anda</p>
          </div>
          <Link
            href="/member/dashboard"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Cari Project
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan nama project..."
            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Project Aktif</h2>
        </div>
        
        {projects.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const daysLeft = calculateDaysLeft(project.event_date);
                
                return (
                  <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Project Image */}
                    {project.image_url ? (
                      <div className="h-48 bg-gray-200">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <svg className="h-16 w-16 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{project.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress Donasi</span>
                          <span className="font-medium">{Math.round(project.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Terkumpul:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(project.current_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(project.target_amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Donatur:</span>
                          <span className="font-medium text-orange-600">{project.donations_count} orang</span>
                        </div>
                      </div>

                      {/* Time Left */}
                      <div className="mb-4">
                        <div className="flex items-center text-sm">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">
                            {daysLeft > 0 ? (
                              <>
                                <span className="font-medium text-orange-600">{daysLeft} hari</span> lagi
                              </>
                            ) : daysLeft === 0 ? (
                              <span className="font-medium text-red-600">Berakhir hari ini</span>
                            ) : (
                              <span className="font-medium text-red-600">Sudah berakhir</span>
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Target: {new Date(project.event_date).toLocaleDateString('id-ID')}
                        </div>
                      </div>

                      {/* Creator Info */}
                      {project.creator && (
                        <div className="mb-4 text-xs text-gray-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Dibuat oleh: {project.creator.first_name} {project.creator.last_name}
                        </div>
                      )}

                      {/* Action Button */}
                      <Link
                        href={`/member/projects/${project.id}`}
                        className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center block"
                      >
                        Lihat Detail & Donasi
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada project tersedia</h3>
            <p className="mt-2 text-sm text-gray-500">
              Saat ini belum ada project yang dapat didukung. Silakan cek kembali nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberProjectsPage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <MemberProjectsContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
