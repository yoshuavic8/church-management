'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemberLayout from '../../components/layout/MemberLayout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Class = {
  id: string;
  name: string;
  description: string;
  category: string;
  max_students?: number;
  status: string;
  has_levels: boolean;
  created_at: string;
  _count?: {
    levels: number;
    enrollments: number;
    sessions: number;
  };
  // Additional fields that might be used
  instructor?: string;
  schedule?: string;
  max_capacity?: number;
  current_enrolled?: number;
  is_enrollment_open?: boolean;
  start_date?: string;
  end_date?: string;
};

type ClassEnrollment = {
  id: string;
  class_id: string;
  enrollment_date: string;
  status: string;
  class: Class;
};

function MemberClassesContent() {
  const { user } = useAuth();
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchClassesData = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Build query params for available classes
        const params: any = { 
          page: currentPage, 
          limit: itemsPerPage,
          status: 'active' // Only active classes for members
        };

        if (searchQuery) params.search = searchQuery;
        // Note: statusFilter is removed because members should only see active classes

        // Fetch available classes - only active classes for members
        const classesResponse = await apiClient.getClasses(params);
        setAvailableClasses(classesResponse.data || []);
        setTotalPages(classesResponse.pagination?.totalPages || 1);

        // Fetch my enrollments
        try {
          const enrollmentsResponse = await apiClient.getMemberClassEnrollments(user.id);
          setMyEnrollments(enrollmentsResponse.data || []);
        } catch (enrollmentError) {
          console.warn('Could not fetch enrollments:', enrollmentError);
          setMyEnrollments([]);
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch classes data');
        setLoading(false);
      }
    };

    if (user) {
      fetchClassesData();
    }
  }, [user, currentPage, searchQuery]); // Removed statusFilter from dependency

  const isEnrolledInClass = (classId: string) => {
    return myEnrollments.some(enrollment => 
      enrollment.class_id === classId && 
      ['enrolled', 'active'].includes(enrollment.status)
    );
  };

  const getEnrollmentStatus = (classId: string) => {
    const enrollment = myEnrollments.find(enrollment => enrollment.class_id === classId);
    return enrollment?.status || null;
  };

  const handleEnrollment = async (classId: string) => {
    try {
      console.log('Attempting to enroll in class:', classId);
      const response = await apiClient.enrollInClass(classId);
      console.log('Enrollment response:', response);
      
      if (response.success) {
        alert('Berhasil mendaftar kelas!');
        // Refresh data
        window.location.reload();
      } else {
        throw new Error(response.error?.message || 'Gagal mendaftar kelas');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Gagal mendaftar kelas. Silakan coba lagi.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
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
      case 'active':
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

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnrollmentStatusText = (status: string) => {
    switch (status) {
      case 'enrolled':
      case 'active':
        return 'Terdaftar';
      case 'completed':
        return 'Selesai';
      case 'dropped':
        return 'Keluar';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading classes data</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Kelas & Program</h1>
            <p className="text-gray-600">Jelajahi dan daftar ke berbagai kelas dan program yang tersedia</p>
          </div>
          <Link
            href="/member/dashboard"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {/* My Enrollments */}
      {myEnrollments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Kelas Saya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="font-medium text-gray-900 mb-2">{enrollment.class.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{enrollment.class.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {enrollment.class.instructor}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {enrollment.class.schedule}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEnrollmentStatusColor(enrollment.status)}`}>
                    {getEnrollmentStatusText(enrollment.status)}
                  </span>
                  <Link
                    href={`/member/classes/${enrollment.class_id}`}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Cari Kelas
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari berdasarkan nama kelas atau deskripsi..."
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status filter hidden for members - they only see active classes 
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status Kelas
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          */}
        </div>
      </div>

      {/* Available Classes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Kelas Tersedia</h2>
        </div>
        
        {availableClasses.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((classItem) => {
                const enrolled = isEnrolledInClass(classItem.id);
                const enrollmentStatus = getEnrollmentStatus(classItem.id);
                
                return (
                  <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex-1">{classItem.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classItem.status)}`}>
                        {getStatusText(classItem.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{classItem.description}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {classItem.instructor}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {classItem.schedule}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {classItem._count?.enrollments || 0}/{classItem.max_students || 'Unlimited'} peserta
                        </span>
                        {classItem.status === 'active' ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Pendaftaran Buka
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Pendaftaran Tutup
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ 
                          width: classItem.max_students 
                            ? `${Math.min((classItem._count?.enrollments || 0) / classItem.max_students * 100, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      {enrolled ? (
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getEnrollmentStatusColor(enrollmentStatus!)}`}>
                            ✓ {getEnrollmentStatusText(enrollmentStatus!)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Sudah terdaftar
                          </span>
                        </div>
                      ) : (
                        <div>
                          {classItem.status === 'active' ? (
                            <button
                              onClick={() => handleEnrollment(classItem.id)}
                              className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                              Daftar Sekarang
                            </button>
                          ) : (
                            <span className="text-gray-500 text-sm px-3 py-1 bg-gray-100 rounded">
                              Pendaftaran Tutup
                            </span>
                          )}
                        </div>
                      )}
                      
                      <Link
                        href={`/member/classes/${classItem.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Lihat Detail →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada kelas tersedia</h3>
            <p className="mt-2 text-sm text-gray-500">
              Saat ini belum ada kelas yang tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberClassesPage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <MemberClassesContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
