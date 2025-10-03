'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import AdminMemberScanner from '../../components/AdminMemberScanner';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';

interface LiveMeeting {
  id: string;
  topic: string;
  meeting_date: string;
  location: string;
  event_category: string;
  live_checkin_active: boolean;
  is_realtime: boolean;
}

function AdminScannerContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meeting');

  const [liveMeetings, setLiveMeetings] = useState<LiveMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(meetingId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [scanStats, setScanStats] = useState({
    totalScanned: 0,
    successfulScans: 0,
    errors: 0
  });

  useEffect(() => {
    // Wait for auth to finish loading before doing any redirects
    if (authLoading) return;

    // Store user data in session storage to prevent loss during camera permission
    if (user) {
      sessionStorage.setItem('scanner_user', JSON.stringify({
        id: user.id,
        role: user.role,
        role_level: user.role_level,
        first_name: user.first_name,
        last_name: user.last_name
      }));
    }

    if (!user) {
      // Check if we have user data in session storage
      const storedUser = sessionStorage.getItem('scanner_user');
      if (!storedUser) {
        router.push('/auth/login');
        return;
      }
    }

    // Check admin permissions
    const currentUser = user || JSON.parse(sessionStorage.getItem('scanner_user') || '{}');
    const isAdmin = currentUser?.role === 'admin' || (currentUser?.role_level && currentUser.role_level >= 4);
    if (!isAdmin) {
      router.push('/member/dashboard');
      return;
    }

    setAuthChecked(true);
    fetchLiveMeetings();
  }, [user, authLoading, router]);

  const fetchLiveMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all meetings (admin can see all)
      const response = await apiClient.getAttendanceMeetings({
        page: 1,
        limit: 50,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch meetings');
      }

      // Filter for live meetings or meetings that can be activated
      const allMeetings = response.data || [];
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));

      const recentMeetings = allMeetings.filter((meeting: any) => {
        const meetingDate = new Date(meeting.meeting_date);
        return meetingDate >= threeDaysAgo; // Show meetings from last 3 days
      });

      setLiveMeetings(recentMeetings);

      // If meetingId from URL is provided and valid, use it
      if (meetingId) {
        const meetingExists = recentMeetings.find((m: any) => m.id === meetingId);
        if (meetingExists) {
          setSelectedMeeting(meetingId);
        }
      }

    } catch (error: any) {
      setError(error.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (memberData: any) => {
    setScanStats(prev => ({
      ...prev,
      totalScanned: prev.totalScanned + 1,
      successfulScans: prev.successfulScans + 1
    }));
  };

  const handleScanError = (error: string) => {
    setScanStats(prev => ({
      ...prev,
      totalScanned: prev.totalScanned + 1,
      errors: prev.errors + 1
    }));
  };

  const toggleLiveAttendance = async (meetingId: string, active: boolean) => {
    try {
      const response = await apiClient.toggleLiveAttendance(meetingId, {
        active,
        expires_at: active ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() : undefined // 4 hours from now
      });

      if (response.success) {
        // Refresh meetings to get updated status
        fetchLiveMeetings();
      }
    } catch (error: any) {
      console.error('Failed to toggle live attendance:', error);
    }
  };

  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('scanner_user') || '{}') : {});
  
  if (!currentUser?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check admin permissions
  const isAdmin = currentUser?.role === 'admin' || (currentUser?.role_level && currentUser.role_level >= 4);
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Access Denied</p>
          <p className="text-gray-600 text-sm">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Admin Member Scanner" 
        backTo="/attendance"
        backLabel="Attendance"
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        {selectedMeeting && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Scanned</p>
                  <p className="text-2xl font-semibold text-gray-900">{scanStats.totalScanned}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Successful</p>
                  <p className="text-2xl font-semibold text-green-600">{scanStats.successfulScans}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-semibold text-red-600">{scanStats.errors}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Selection */}
        {!selectedMeeting && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select a Meeting to Scan Attendance
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading meetings...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={fetchLiveMeetings}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Try Again
                </button>
              </div>
            ) : liveMeetings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No Recent Meetings</p>
                <p className="text-gray-500 text-sm mt-1">
                  No meetings found from the last 3 days
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveMeetings.map((meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{meeting.topic}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          📅 {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          📍 {meeting.location} • 🏷️ {meeting.event_category.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="flex items-center mt-2">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            meeting.live_checkin_active ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            meeting.live_checkin_active ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {meeting.live_checkin_active ? 'Live Check-in Active' : 'Live Check-in Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 space-y-2">
                        {!meeting.live_checkin_active && (
                          <button
                            onClick={() => toggleLiveAttendance(meeting.id, true)}
                            className="block w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Enable Live Check-in
                          </button>
                        )}
                        {meeting.live_checkin_active && (
                          <button
                            onClick={() => toggleLiveAttendance(meeting.id, false)}
                            className="block w-full px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 mb-2"
                          >
                            Disable Live Check-in
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMeeting(meeting.id)}
                          className="block w-full px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        >
                          Start Scanning
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scanner */}
        {selectedMeeting && (
          <div>
            <AdminMemberScanner
              meetingId={selectedMeeting}
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              className="w-full"
            />

            {/* Change Meeting Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setSelectedMeeting(null);
                  setScanStats({ totalScanned: 0, successfulScans: 0, errors: 0 });
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                ← Choose Different Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminScannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header title="Loading Scanner..." />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scanner...</p>
          </div>
        </div>
      </div>
    }>
      <AdminScannerContent />
    </Suspense>
  );
}
