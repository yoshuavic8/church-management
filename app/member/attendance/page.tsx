'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemberLayout from '../../components/layout/MemberLayout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type MemberAttendance = {
  id: string;
  event_date: string;
  event_type: string;
  status: string;
  topic?: string;
  location?: string;
  meeting?: {
    meeting_date: string;
    event_category: string;
    topic: string;
    location: string;
  };
};

type AttendanceStats = {
  totalMeetings: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
};

function MemberAttendanceContent() {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<MemberAttendance[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalMeetings: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const itemsPerPage = 15;

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Build query params
        const params: any = { 
          page: currentPage, 
          limit: itemsPerPage,
          timeFilter: 'all' // Get all attendance data regardless of time
        };

        if (filterType) params.event_category = filterType;
        if (filterStatus) params.status = filterStatus;

        // Fetch attendance history
        const response = await apiClient.getMemberAttendance(user.id, params);
        
        // Debug: log the response
        console.log('Member attendance page response:', response);
        
        // Handle different response structures safely
        let attendanceData: any[] = [];
        const responseData = response.data as any;
        
        if (Array.isArray(responseData)) {
          attendanceData = responseData;
        } else if (responseData && Array.isArray(responseData.records)) {
          attendanceData = responseData.records;
        }
        
        console.log('Member attendance page processed data:', attendanceData);

        setAttendanceHistory(attendanceData);
        setTotalPages(response.pagination?.totalPages || 1);

        // Calculate statistics from all data (not just current page)
        const allDataResponse = await apiClient.getMemberAttendance(user.id, { 
          page: 1, 
          limit: 1000,
          timeFilter: 'all' // Get all attendance data for statistics
        });
        const allResponseData = allDataResponse.data as any;
        
        let allData: any[] = [];
        if (Array.isArray(allResponseData)) {
          allData = allResponseData;
        } else if (allResponseData && Array.isArray(allResponseData.records)) {
          allData = allResponseData.records;
        }
        
        const totalMeetings = allData.length;
        const presentCount = allData.filter((a: any) => a.status === 'present').length;
        const lateCount = allData.filter((a: any) => a.status === 'late').length;
        const absentCount = allData.filter((a: any) => a.status === 'absent').length;
        const attendanceRate = totalMeetings > 0 ? ((presentCount + lateCount) / totalMeetings) * 100 : 0;

        setAttendanceStats({
          totalMeetings,
          presentCount,
          lateCount,
          absentCount,
          attendanceRate
        });

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch attendance data');
        setLoading(false);
      }
    };

    if (user) {
      fetchAttendanceData();
    }
  }, [user, currentPage, filterType, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return status;
    }
  };

  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case 'cell_group':
        return 'Cell Group';
      case 'sunday_service':
        return 'Ibadah Minggu';
      case 'prayer_meeting':
        return 'Doa Bersama';
      case 'youth_service':
        return 'Ibadah Pemuda';
      case 'special_service':
        return 'Ibadah Khusus';
      default:
        return eventType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading attendance data</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Kehadiran</h1>
            <p className="text-gray-600">Lihat catatan kehadiran Anda dalam berbagai acara gereja</p>
          </div>
          <Link
            href="/member/dashboard"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pertemuan</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceStats.totalMeetings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hadir</p>
              <p className="text-2xl font-semibold text-green-600">{attendanceStats.presentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terlambat</p>
              <p className="text-2xl font-semibold text-yellow-600">{attendanceStats.lateCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <div className="w-6 h-6 relative">
                <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${attendanceStats.attendanceRate}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-indigo-600">
                    {Math.round(attendanceStats.attendanceRate)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
              <p className="text-2xl font-semibold text-indigo-600">
                {Math.round(attendanceStats.attendanceRate)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
              Jenis Acara
            </label>
            <select
              id="eventType"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Jenis Acara</option>
              <option value="cell_group">Cell Group</option>
              <option value="sunday_service">Ibadah Minggu</option>
              <option value="prayer_meeting">Doa Bersama</option>
              <option value="youth_service">Ibadah Pemuda</option>
              <option value="special_service">Ibadah Khusus</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status Kehadiran
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Semua Status</option>
              <option value="present">Hadir</option>
              <option value="late">Terlambat</option>
              <option value="absent">Tidak Hadir</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('');
                setFilterStatus('');
                setCurrentPage(1);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Kehadiran</h2>
        </div>
        
        {attendanceHistory.length > 0 ? (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Acara
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceHistory.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(attendance.meeting?.meeting_date || attendance.event_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEventTypeText(attendance.meeting?.event_category || attendance.event_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                          {getStatusText(attendance.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {attendance.meeting?.topic || attendance.topic || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {attendance.meeting?.location || attendance.location || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
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
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada riwayat kehadiran</h3>
            <p className="mt-2 text-sm text-gray-500">
              Mulai dengan melakukan check-in di pertemuan untuk melihat riwayat kehadiran Anda.
            </p>
            <Link
              href="/self-checkin"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Self Check-in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberAttendancePage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <MemberAttendanceContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
