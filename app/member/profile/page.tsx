'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemberLayout from '../../components/layout/MemberLayout';
import { apiClient } from '../../lib/api-client';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type MemberProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  join_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  status: string;
  cell_group?: {
    id: string;
    name: string;
    district?: {
      id: string;
      name: string;
    };
  };
  district?: {
    id: string;
    name: string;
  };
};

type AttendanceStats = {
  totalMeetings: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
};

function MemberProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalMeetings: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch member profile
        const profileResponse = await apiClient.getMember(user.id);
        if (profileResponse.success && profileResponse.data) {
          setProfile(profileResponse.data);
        }

        // Fetch attendance stats
        try {
          const attendanceResponse = await apiClient.getMemberAttendance(user.id, { 
            limit: 200,
            timeFilter: 'all' // Get all attendance data
          });
          
          console.log('Member attendance response in profile:', attendanceResponse);
          
          if (attendanceResponse.success && attendanceResponse.data) {
            // Handle different response structures
            let attendanceData: any[] = [];
            const responseData = attendanceResponse.data as any;
            
            if (Array.isArray(responseData)) {
              attendanceData = responseData;
            } else if (responseData && Array.isArray(responseData.data)) {
              attendanceData = responseData.data;
            } else if (responseData && Array.isArray(responseData.records)) {
              attendanceData = responseData.records;
            }

            console.log('Processed attendance data in profile:', attendanceData);
            console.log('Attendance data length:', attendanceData.length);

            const totalMeetings = attendanceData.length;
            const presentCount = attendanceData.filter((a: any) => a.status === 'present').length;
            const lateCount = attendanceData.filter((a: any) => a.status === 'late').length;
            const absentCount = attendanceData.filter((a: any) => a.status === 'absent').length;
            const attendanceRate = totalMeetings > 0 ? ((presentCount + lateCount) / totalMeetings) * 100 : 0;

            console.log('Calculated stats:', {
              totalMeetings,
              presentCount,
              lateCount,
              absentCount,
              attendanceRate
            });

            setAttendanceStats({
              totalMeetings,
              presentCount,
              lateCount,
              absentCount,
              attendanceRate
            });
          }
        } catch (attendanceError) {
          console.error('Error fetching attendance stats:', attendanceError);
          // Set default stats on error
          setAttendanceStats({
            totalMeetings: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            attendanceRate: 0
          });
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    return value;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and view your activity
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link
            href="/member/profile/edit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Edit Profile
          </Link>
          <Link
            href="/member/profile/change-password"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Change Password
          </Link>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
            <p className="opacity-90">{profile.email}</p>
            <div className="flex items-center mt-2 space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                Status: {profile.status === 'active' ? 'Active' : profile.status}
              </div>
              {profile.join_date && (
                <div>
                  Member since: {formatDate(profile.join_date)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</div>
            <div className="text-sm text-gray-600">Total Present</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(attendanceStats.attendanceRate)}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{attendanceStats.lateCount}</div>
            <div className="text-sm text-gray-600">Late Count</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{attendanceStats.totalMeetings}</div>
            <div className="text-sm text-gray-600">Total Meetings</div>
          </div>
        </div>
      </div>

      {/* Profile Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{formatValue(profile.first_name)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{formatValue(profile.last_name)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm text-gray-900">{formatValue(profile.email)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{formatValue(profile.phone)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(profile.date_of_birth)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{formatValue(profile.gender)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Marital Status</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{formatValue(profile.marital_status)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Occupation</label>
              <p className="mt-1 text-sm text-gray-900">{formatValue(profile.occupation)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Address</label>
              <p className="mt-1 text-sm text-gray-900">{formatValue(profile.address)}</p>
            </div>
          </div>
        </div>

        {/* Church Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Church Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Member Status</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{formatValue(profile.status)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Join Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(profile.join_date)}</p>
            </div>
            {profile.cell_group && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Cell Group</label>
                <p className="mt-1 text-sm text-gray-900">{profile.cell_group.name}</p>
                {profile.cell_group.district && (
                  <p className="text-xs text-gray-600">District: {profile.cell_group.district.name}</p>
                )}
              </div>
            )}
            {profile.district && !profile.cell_group && (
              <div>
                <label className="block text-sm font-medium text-gray-500">District</label>
                <p className="mt-1 text-sm text-gray-900">{profile.district.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Contact Name</label>
              <p className="mt-1 text-sm text-gray-900">{formatValue(profile.emergency_contact_name)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Contact Phone</label>
              <p className="mt-1 text-sm text-gray-900">{formatValue(profile.emergency_contact_phone)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {profile.notes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{profile.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function MemberProfilePage() {
  return (
    <ProtectedRoute>
      <MemberLayout>
        <MemberProfileContent />
      </MemberLayout>
    </ProtectedRoute>
  );
}
