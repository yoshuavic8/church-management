'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import MemberQRDisplay from '../../components/MemberQRDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';

interface LiveMeeting {
  id: string;
  topic: string;
  meeting_date: string;
  location: string;
  event_category: string;
  live_checkin_active: boolean;
  is_active?: boolean;
  live_checkin_expires_at?: string;
}

function MemberQRCheckInContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meeting');

  const [liveMeetings, setLiveMeetings] = useState<LiveMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(meetingId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchLiveMeetings();
  }, [user, router]);

  const fetchLiveMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Member QR: Fetching meetings...');

      // Fetch meetings with live attendance active
      const response = await apiClient.getAttendanceMeetings({
        page: 1,
        limit: 50, // Increase limit to get more meetings
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch meetings');
      }

      console.log('📋 Member QR: Total meetings fetched:', response.data?.length || 0);

      // Get current date for filtering recent meetings
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000));

      // Filter for recent meetings first
      const recentMeetings = (response.data || []).filter((meeting: any) => {
        const meetingDate = new Date(meeting.meeting_date);
        return meetingDate >= threeDaysAgo;
      });

      console.log('📅 Member QR: Recent meetings (last 3 days):', recentMeetings.length);

      // Check live attendance status for each recent meeting
      const liveMeetingsData = [];
      for (const meeting of recentMeetings) {
        try {
          const statusResponse = await apiClient.getLiveAttendanceStatus(meeting.id);
          if (statusResponse.success && statusResponse.data?.is_active) {
            console.log('✅ Member QR: Active meeting found:', meeting.topic, meeting.id);
            liveMeetingsData.push({
              ...meeting,
              live_checkin_active: statusResponse.data.live_checkin_active,
              is_active: statusResponse.data.is_active,
              live_checkin_expires_at: statusResponse.data.live_checkin_expires_at
            });
          } else {
            console.log('❌ Member QR: Inactive meeting:', meeting.topic, meeting.id);
          }
        } catch (statusError) {
          console.log('⚠️ Member QR: Error checking status for:', meeting.topic, statusError);
        }
      }

      console.log('🎯 Member QR: Final active meetings:', liveMeetingsData.length);
      setLiveMeetings(liveMeetingsData);

      // If meetingId from URL is provided and valid, use it
      if (meetingId) {
        const meetingExists = liveMeetingsData.find((m: any) => m.id === meetingId);
        if (meetingExists) {
          setSelectedMeeting(meetingId);
          console.log('🔗 Member QR: Using meeting from URL:', meetingExists.topic);
        }
      }

    } catch (error: any) {
      console.error('❌ Member QR: Error fetching meetings:', error);
      setError(error.message || 'Failed to load live meetings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Check-in QR Code" 
        backTo="/member/dashboard"
        backLabel="Dashboard"
      />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-400 mr-3 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-800 font-medium mb-1">How to Check In</h3>
              <div className="text-blue-700 text-sm space-y-1">
                <p>1. Select a meeting below or scan the event QR code first</p>
                <p>2. Show your personal QR code to the administrator</p>
                <p>3. Wait for confirmation that you've been checked in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Meetings Selection */}
        {!selectedMeeting && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select a Meeting for Check-in
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading live meetings...</p>
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
                <p className="text-gray-600 font-medium">No Live Meetings Available</p>
                <p className="text-gray-500 text-sm mt-1">
                  There are currently no meetings with live check-in enabled
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => setSelectedMeeting(meeting.id)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{meeting.topic}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🟢 LIVE
                          </span>
                        </div>
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
                        {meeting.live_checkin_expires_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(meeting.live_checkin_expires_at).toLocaleTimeString('id-ID')}
                          </div>
                        )}
                      </div>
                      <div className="text-green-600 ml-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QR Code Display */}
        {selectedMeeting && (
          <div>
            <MemberQRDisplay
              meetingId={selectedMeeting}
              showMeetingInfo={true}
              className="w-full"
            />

            {/* Change Meeting Button */}
            <div className="text-center mt-4">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                ← Choose Different Meeting
              </button>
            </div>
          </div>
        )}

        {/* General QR Code (if no specific meeting) */}
        {!selectedMeeting && !loading && liveMeetings.length === 0 && (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="text-yellow-400 mr-3 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-yellow-800 font-medium mb-1">General Check-in QR</h3>
                  <p className="text-yellow-700 text-sm">
                    You can still show this QR code to administrators for manual check-in
                  </p>
                </div>
              </div>
            </div>

            <MemberQRDisplay
              showMeetingInfo={false}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberQRCheckInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header title="Loading QR Check-in..." />
        <div className="max-w-md mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading check-in options...</p>
          </div>
        </div>
      </div>
    }>
      <MemberQRCheckInContent />
    </Suspense>
  );
}
