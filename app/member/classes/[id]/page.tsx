'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MemberLayout from '../../../components/layout/MemberLayout';
import { apiClient } from '../../../lib/api-client';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

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
  start_date?: string;
  end_date?: string;
  location?: string;
  requirements?: string;
  materials?: string;
};

type ClassEnrollment = {
  id: string;
  class_id: string;
  member_id: string;
  enrollment_date: string;
  status: string;
};

function ClassDetailContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [enrollment, setEnrollment] = useState<ClassEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);

        if (!classId) {
          throw new Error('Class ID is required');
        }

        // Fetch class details
        const classResponse = await apiClient.getClass(classId);
        setClassData(classResponse.data);

        // Check if user is enrolled
        if (user) {
          try {
            const enrollmentsResponse = await apiClient.getMemberClassEnrollments(user.id);
            const userEnrollment = enrollmentsResponse.data?.find(
              (e: ClassEnrollment) => e.class_id === classId
            );
            setEnrollment(userEnrollment || null);
          } catch (enrollmentError) {
            console.warn('Could not fetch enrollment status:', enrollmentError);
            setEnrollment(null);
          }
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch class details');
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId, user]);

  const handleEnrollment = async () => {
    if (!classData || !user) return;

    try {
      setEnrolling(true);
      const response = await apiClient.enrollInClass(classId);
      
      if (response.success) {
        // Refresh data
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to enroll in class');
    } finally {
      setEnrolling(false);
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
          <p className="mt-4 text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading class details</p>
            <p className="text-sm">{error || 'Class not found'}</p>
          </div>
          <Link 
            href="/member/classes"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  const canEnroll = !enrollment && 
                    classData.status === 'active' &&
                    (!classData.max_students || (classData._count?.enrollments || 0) < classData.max_students);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(classData.status)}`}>
                {getStatusText(classData.status)}
              </span>
            </div>
            <p className="text-gray-600 mt-1">Detail informasi kelas dan program</p>
          </div>
          <Link
            href="/member/classes"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Kelas
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kelas</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Deskripsi</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{classData.description}</p>
              </div>

              {classData.requirements && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Persyaratan</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{classData.requirements}</p>
                </div>
              )}

              {classData.materials && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Materi Pembelajaran</h3>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{classData.materials}</p>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Status */}
          {enrollment && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Pendaftaran Anda</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status:</p>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getEnrollmentStatusColor(enrollment.status)}`}>
                      {getEnrollmentStatusText(enrollment.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Daftar:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(enrollment.enrollment_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Class Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Kelas</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Pengajar</p>
                  <p className="font-medium text-gray-900">{classData.instructor}</p>
                </div>
              </div>

              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Jadwal</p>
                  <p className="font-medium text-gray-900">{classData.schedule}</p>
                </div>
              </div>

              {classData.location && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="font-medium text-gray-900">{classData.location}</p>
                  </div>
                </div>
              )}

              {classData.start_date && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Mulai</p>
                    <p className="font-medium text-gray-900">
                      {new Date(classData.start_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              {classData.end_date && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Selesai</p>
                    <p className="font-medium text-gray-900">
                      {new Date(classData.end_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pendaftaran</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Kapasitas</span>
                  <span className="font-medium">{classData._count?.enrollments || 0}/{classData.max_students || 'Unlimited'}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ 
                      width: classData.max_students 
                        ? `${Math.min((classData._count?.enrollments || 0) / classData.max_students * 100, 100)}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status Pendaftaran</span>
                {classData.status === 'active' ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Buka
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Tutup
                  </span>
                )}
              </div>

              {/* Enrollment Action */}
              <div className="pt-4 border-t border-gray-200">
                {enrollment ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <svg className="mx-auto h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-green-800">Anda sudah terdaftar di kelas ini</p>
                    </div>
                  </div>
                ) : canEnroll ? (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {enrolling ? 'Mendaftar...' : 'Daftar Sekarang'}
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        {classData.status !== 'active' 
                          ? 'Pendaftaran sudah ditutup' 
                          : (classData.max_students && (classData._count?.enrollments || 0) >= classData.max_students)
                          ? 'Kelas sudah penuh' 
                          : 'Pendaftaran tidak tersedia'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassDetailPage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <ClassDetailContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
