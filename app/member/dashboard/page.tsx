'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemberLayout from '../../components/layout/MemberLayout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
// import CompactMemberQRScanner from '../../components/CompactMemberQRScanner'; // Commented out - use new QR flow instead
import MemberQRDisplay from '../../components/MemberQRDisplay';
import { resolveImageUrl, handleImageError } from '../../utils/image-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Define types
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

type MemberAttendance = {
  id: string;
  event_date: string;
  event_type: string;
  status: string;
  meeting?: {
    meeting_date: string;
    event_category: string;
    topic: string;
    location: string;
  };
};

type CellGroup = {
  id: string;
  name: string;
  leader_name: string;
  meeting_day: string;
  meeting_time: string;
  location: string;
  district_name: string;
  member_count: number;
};

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
};

type AttendanceStats = {
  totalMeetings: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
};

// Client-side component for member dashboard
function MemberDashboardContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<MemberAttendance[]>([]);
  const [memberCellGroup, setMemberCellGroup] = useState<CellGroup | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalMeetings: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  // Removed selectedMeetingId state - QR code will always be available

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);

        if (!user) {
          throw new Error('Authentication required. Please login.');
        }

        // Fetch member's cell group info
        try {
          const memberResponse = await apiClient.getMember(user.id);
          console.log('Member data:', memberResponse.data); // Debug log
          
          let cellGroupData = null;
          
          // Check for direct cell group relationship (old structure)
          if (memberResponse.data?.cell_group_id) {
            const cellGroupResponse = await apiClient.getCellGroup(memberResponse.data.cell_group_id);
            cellGroupData = cellGroupResponse.data;
          }
          // Check for cell group memberships (new structure)
          else if (memberResponse.data?.cell_group_memberships && 
                   memberResponse.data.cell_group_memberships.length > 0) {
            // Find active membership
            const activeMembership = memberResponse.data.cell_group_memberships.find(
              (membership: any) => membership.status === 'active'
            );
            
            if (activeMembership?.cell_group) {
              // Use the cell group data directly from the membership
              cellGroupData = {
                id: activeMembership.cell_group.id,
                name: activeMembership.cell_group.name,
                district_name: activeMembership.cell_group.district?.name || '',
                // For additional details, we might need to fetch the full cell group
                leader_name: '',
                meeting_day: '',
                meeting_time: '',
                location: '',
                member_count: 0
              };
              
              // Fetch full cell group details for additional information
              try {
                const fullCellGroupResponse = await apiClient.getCellGroup(activeMembership.cell_group.id);
                if (fullCellGroupResponse.data) {
                  cellGroupData = {
                    ...cellGroupData,
                    leader_name: fullCellGroupResponse.data.leader ? 
                      `${fullCellGroupResponse.data.leader.first_name} ${fullCellGroupResponse.data.leader.last_name}` : 
                      fullCellGroupResponse.data.leader_name || '',
                    meeting_day: fullCellGroupResponse.data.meeting_day || '',
                    meeting_time: fullCellGroupResponse.data.meeting_time || '',
                    location: fullCellGroupResponse.data.meeting_location || '',
                    member_count: fullCellGroupResponse.data.member_count || 0
                  };
                }
              } catch (fetchError) {
                console.warn('Could not fetch full cell group details:', fetchError);
              }
            }
          }
          // Check for direct cell group object (included in the response)
          else if (memberResponse.data?.cell_group) {
            cellGroupData = {
              id: memberResponse.data.cell_group.id,
              name: memberResponse.data.cell_group.name,
              district_name: memberResponse.data.cell_group.district?.name || '',
              leader_name: '',
              meeting_day: '',
              meeting_time: '',
              location: '',
              member_count: 0
            };
            
            // Fetch full cell group details
            try {
              const fullCellGroupResponse = await apiClient.getCellGroup(memberResponse.data.cell_group.id);
              if (fullCellGroupResponse.data) {
                cellGroupData = {
                  ...cellGroupData,
                  leader_name: fullCellGroupResponse.data.leader ? 
                    `${fullCellGroupResponse.data.leader.first_name} ${fullCellGroupResponse.data.leader.last_name}` : 
                    fullCellGroupResponse.data.leader_name || '',
                  meeting_day: fullCellGroupResponse.data.meeting_day || '',
                  meeting_time: fullCellGroupResponse.data.meeting_time || '',
                  location: fullCellGroupResponse.data.meeting_location || '',
                  member_count: fullCellGroupResponse.data.member_count || 0
                };
              }
            } catch (fetchError) {
              console.warn('Could not fetch full cell group details:', fetchError);
            }
          }
          
          setMemberCellGroup(cellGroupData);
        } catch (cellGroupError) {
          console.warn('Could not fetch cell group:', cellGroupError);
          setMemberCellGroup(null);
        }

        // Fetch member's attendance history and stats
        try {
          if (user.id) {
            const attendanceResponse = await apiClient.getMemberAttendance(user.id, { 
              page: 1, 
              limit: 100,
              timeFilter: 'all' // Get all attendance data regardless of time
            });
            
            // Debug: log the response to see what we're getting
            console.log('Member attendance response:', attendanceResponse);
            
            // Handle different response structures safely
            let attendanceData: any[] = [];
            const responseData = attendanceResponse.data as any;
            
            if (Array.isArray(responseData)) {
              attendanceData = responseData;
            } else if (responseData && Array.isArray(responseData.records)) {
              attendanceData = responseData.records;
            } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
              attendanceData = responseData.data;
            }
            
            console.log('Processed attendance data:', attendanceData);
            
            // Take only recent 10 records for dashboard display
            setRecentAttendance(attendanceData.slice(0, 10));

            // Calculate attendance statistics from all data
            const totalMeetings = attendanceData.length;
            const presentCount = attendanceData.filter((a: any) => a.status === 'present').length;
            const lateCount = attendanceData.filter((a: any) => a.status === 'late').length;
            const absentCount = attendanceData.filter((a: any) => a.status === 'absent').length;
            const attendanceRate = totalMeetings > 0 ? ((presentCount + lateCount) / totalMeetings) * 100 : 0;

            setAttendanceStats({
              totalMeetings,
              presentCount,
              lateCount,
              absentCount,
              attendanceRate
            });
          }
        } catch (attendanceError) {
          console.warn('Could not fetch attendance:', attendanceError);
          setRecentAttendance([]);
        }

        // Fetch available classes for enrollment (only active classes)
        try {
          const classesResponse = await apiClient.getClasses({ page: 1, limit: 6, status: 'active' });
          setAvailableClasses(classesResponse.data || []);
        } catch (classError) {
          console.warn('Could not fetch classes:', classError);
          setAvailableClasses([]);
        }

        // Fetch published projects
        try {
          const projectsResponse = await apiClient.getPublishedProjects({ page: 1, limit: 4 });
          setProjects(projectsResponse.data || []);
        } catch (projectError) {
          console.warn('Could not fetch projects:', projectError);
          setProjects([]);
        }

        // Fetch recent articles
        try {
          const articlesResponse = await apiClient.getArticles({ 
            status: 'published',
            limit: 3 
          });
          console.log('Articles response:', articlesResponse); // Debug log
          setRecentArticles(articlesResponse.data || []);
        } catch (articleError) {
          console.warn('Could not fetch articles:', articleError);
          setRecentArticles([]);
        }

        // No longer checking for active meetings - QR code will always be available

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch member data');
        setLoading(false);
      }
    };

    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const handleToggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
            href="/auth/member/login"
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold">
          Selamat datang, {user?.first_name}!
        </h1>
        <p className="mt-2 opacity-90">
          Selamat datang di portal member. Mari tetap terhubung dengan komunitas gereja kita.
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Status: Aktif
          </div>
        </div>
      </div>

      {/* Quick Actions for Members */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Self Check-in */}
        <Link
          href="/self-checkin"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Self Check-in</h3>
              <p className="text-sm text-gray-600">Absen mandiri</p>
            </div>
          </div>
        </Link>

        {/* My Attendance */}
        <Link
          href="/member/attendance"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">My Attendance</h3>
              <p className="text-sm text-gray-600">Lihat riwayat kehadiran</p>
            </div>
          </div>
        </Link>

        {/* My Classes */}
        <Link
          href="/member/classes"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
              <p className="text-sm text-gray-600">Kelas yang saya ikuti</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Profile Summary & Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </h3>
            <Link
              href="/member/profile"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Details →
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-lg">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            {memberCellGroup && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Cell Group:</p>
                <p className="font-medium text-gray-900">{memberCellGroup.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {attendanceStats.presentCount}
              </div>
              <div className="text-sm text-gray-600">Total Hadir</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(attendanceStats.attendanceRate)}%
              </div>
              <div className="text-sm text-gray-600">Tingkat Kehadiran</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Check-in Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📱 Attendance Check-in
          </h3>
          <p className="text-sm text-gray-600">
            Pilih metode check-in kehadiran
          </p>
        </div>

        {/* Check-in Options */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Member QR Code Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-center mb-4">
              <div className="text-blue-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 4v4m0 0h4m-4 0H8" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">QR Code Member</h4>
              <p className="text-sm text-gray-600 mb-3">
                Tampilkan QR code Anda untuk di-scan administrator
              </p>
              
              <button
                onClick={handleToggleQRCode}
                className={`inline-block px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showQRCode 
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>
            
            {/* QR Code Display */}
            {showQRCode && user && (
              <div className="mt-4 border-t pt-4">
                <MemberQRDisplay 
                  showMeetingInfo={false}
                />
              </div>
            )}
          </div>

          {/* Information about QR code method */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
            <div className="text-green-600 mb-3">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-green-800 mb-2">QR Code Presensi</h4>
            <p className="text-sm text-green-700 mb-3">
              QR code Anda selalu tersedia dan dapat digunakan untuk presensi kapan saja. Administrator akan memindai QR code untuk mencatat kehadiran Anda.
            </p>
          </div>
        </div>

        {/* Traditional QR Scanner (Legacy) - COMMENTED OUT */}
        {/* 
        <div id="qr-scanner-section" className="border-t border-gray-200 pt-6">
          <div className="text-center mb-4">
            <h4 className="font-medium text-gray-900 mb-1">Traditional QR Scanner</h4>
            <p className="text-sm text-gray-600">
              Scan QR code events untuk check-in (memerlukan akses kamera)
            </p>
          </div>
          <CompactMemberQRScanner />
        </div>
        */}
      </div>

      {/* Cell Group Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Informasi Cell Group
          </h2>
          {memberCellGroup ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">{memberCellGroup.name}</h3>
                <p className="text-sm text-gray-600">Distrik: {memberCellGroup.district_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Pemimpin:</span>
                  <p className="font-medium">
                    {memberCellGroup.leader_name || 'Belum ditemukan'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Anggota:</span>
                  <p className="font-medium">{memberCellGroup.member_count} orang</p>
                </div>
                <div>
                  <span className="text-gray-500">Hari Pertemuan:</span>
                  <p className="font-medium">{memberCellGroup.meeting_day}</p>
                </div>
                <div>
                  <span className="text-gray-500">Waktu:</span>
                  <p className="font-medium">{memberCellGroup.meeting_time}</p>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Lokasi:</span>
                <p className="font-medium">{memberCellGroup.location}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Anda belum bergabung dengan Cell Group</p>
              <Link href="/member/cell-group" className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Lihat informasi Cell Group →
              </Link>
            </div>
          )}
        </div>

        {/* Attendance Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistik Kehadiran
          </h2>
          <div className="space-y-4">
            {/* Attendance Rate Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${attendanceStats.attendanceRate * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900">
                    {Math.round(attendanceStats.attendanceRate)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{attendanceStats.presentCount}</div>
                <div className="text-gray-500">Hadir</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-yellow-600">{attendanceStats.lateCount}</div>
                <div className="text-gray-500">Terlambat</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{attendanceStats.absentCount}</div>
                <div className="text-gray-500">Tidak Hadir</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{attendanceStats.totalMeetings}</div>
                <div className="text-gray-500">Total Pertemuan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Riwayat Kehadiran Terkini
        </h2>
        {recentAttendance.length > 0 ? (
          <div className="space-y-3">
            {recentAttendance.slice(0, 5).map((attendance) => (
              <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    attendance.status === 'present' ? 'bg-green-400' :
                    attendance.status === 'late' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(attendance.meeting?.event_category === 'cell_group' || attendance.event_type === 'cell_group') ? 'Cell Group' :
                       (attendance.meeting?.event_category === 'sunday_service' || attendance.event_type === 'sunday_service') ? 'Ibadah Minggu' :
                       (attendance.meeting?.event_category === 'prayer_meeting' || attendance.event_type === 'prayer_meeting') ? 'Doa Bersama' :
                       attendance.meeting?.event_category || attendance.event_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(attendance.meeting?.meeting_date || attendance.event_date).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                  attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {attendance.status === 'present' ? 'Hadir' :
                   attendance.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                </span>
              </div>
            ))}
            <Link 
              href="/member/attendance" 
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Lihat Semua Riwayat Kehadiran →
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Belum ada riwayat kehadiran</p>
            <p className="text-xs text-gray-400">Mulai dengan melakukan check-in di pertemuan</p>
          </div>
        )}
      </div>

      {/* Available Classes for Enrollment */}
      {availableClasses.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Kelas Tersedia untuk Pendaftaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableClasses.slice(0, 6).map((classItem) => (
              <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{classItem.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{classItem.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {classItem.category}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status: {classItem.status}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {classItem._count?.enrollments || 0}/{classItem.max_students || 'Unlimited'} peserta
                    </span>
                    {classItem.status === 'active' ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Buka
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Tutup
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ 
                        width: classItem.max_students 
                          ? `${Math.min((classItem._count?.enrollments || 0) / classItem.max_students * 100, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                  {classItem.status === 'active' ? (
                    <Link
                      href={`/member/classes/${classItem.id}`}
                      className="w-full text-center bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors inline-block"
                    >
                      Lihat Detail & Daftar
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full text-center bg-gray-300 text-gray-500 px-3 py-2 rounded text-sm font-medium cursor-not-allowed"
                    >
                      Pendaftaran Tutup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/member/classes" 
            className="mt-4 inline-block text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            Lihat Semua Kelas →
          </Link>
        </div>
      )}

      {/* Active Projects Progress */}
      {projects.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Progress Project Gereja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 4).map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress Donasi</span>
                    <span className="font-medium">{Math.round(project.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full"
                      style={{ width: `${Math.min(project.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terkumpul:</span>
                    <span className="font-medium text-gray-900">
                      Rp {project.current_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium text-gray-900">
                      Rp {project.target_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donatur:</span>
                    <span className="font-medium text-orange-600">{project.donations_count} orang</span>
                  </div>
                  {project.event_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Tanggal:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(project.event_date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'active' ? 'Aktif' :
                       project.status === 'completed' ? 'Selesai' : project.status}
                    </span>
                    <Link
                      href={`/member/projects/${project.id}`}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/member/projects" 
            className="mt-4 inline-block text-orange-600 hover:text-orange-800 text-sm font-medium"
          >
            Lihat Semua Project →
          </Link>
        </div>
      )}

      {/* Church Information & Articles */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m-1 10H9m12 0a2 2 0 01-2 2H7m0 0a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V7a2 2 0 012-2" />
          </svg>
          Berita & Informasi Gereja
        </h2>
        
        {recentArticles.length > 0 ? (
          <div className="space-y-4">
            {recentArticles.map((article: any) => (
              <Link
                key={article.id}
                href={`/member/news/${article.id}`}
                className="block hover:bg-gray-50 rounded-lg p-3 border border-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {article.image_url && (
                    <img
                      src={resolveImageUrl(article.image_url) || ''}
                      alt={article.title}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      onError={(e) => handleImageError(e)}
                      onLoad={() => {
                        console.log('Image loaded successfully:', article.image_url);
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                        {article.category}
                      </span>
                      <span>
                        {new Date(article.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m-1 10H9m12 0a2 2 0 01-2 2H7m0 0a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V7a2 2 0 012-2" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada artikel</h3>
            <p className="mt-2 text-sm text-gray-500">
              Artikel dan berita terbaru akan muncul di sini.
            </p>
          </div>
        )}
        
        <Link 
          href="/member/news" 
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Lihat Semua Berita →
        </Link>
      </div>
    </div>
  );
}

export default function MemberDashboardPage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <MemberDashboardContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
