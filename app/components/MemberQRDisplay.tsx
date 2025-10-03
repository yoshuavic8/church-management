'use client';

import React, { useState, useEffect } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';

interface MemberQRDisplayProps {
  meetingId?: string;
  className?: string;
  showMeetingInfo?: boolean;
}

interface MeetingInfo {
  id: string;
  topic: string;
  meeting_date: string;
  location: string;
  event_category: string;
  live_checkin_active: boolean;
}

export const MemberQRDisplay: React.FC<MemberQRDisplayProps> = ({
  meetingId,
  className = '',
  showMeetingInfo = true
}) => {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingInfo();
    }
  }, [meetingId]);

  const fetchMeetingInfo = async () => {
    if (!meetingId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getAttendanceMeeting(meetingId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch meeting info');
      }

      setMeeting(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to load meeting information');
    } finally {
      setLoading(false);
    }
  };

  const generateMemberQRValue = () => {
    if (!user?.id) return '';
    
    // Format: MEMBER_CHECKIN:member_id:meeting_id
    return `MEMBER_CHECKIN:${user.id}:${meetingId || 'GENERAL'}`;
  };

  if (!user) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center ${className}`}>
        <p className="text-yellow-600">Please login to display your QR code</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg text-center ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
        {meetingId && (
          <button
            onClick={fetchMeetingInfo}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Check if meeting is available and live checkin is active
  const isLiveCheckinActive = meeting?.live_checkin_active || !meetingId;

  if (meetingId && meeting && !isLiveCheckinActive) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center ${className}`}>
        <div className="text-yellow-600 mb-2">
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-yellow-700 font-medium">Live Check-in Not Active</p>
        <p className="text-yellow-600 text-sm mt-1">
          Live attendance is currently disabled for this meeting
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 text-center ${className}`}>
      {/* Meeting Info */}
      {showMeetingInfo && meeting && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1">{meeting.topic}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>📅 {new Date(meeting.meeting_date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p>📍 {meeting.location}</p>
            <p>🏷️ {meeting.event_category.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      )}

      {/* Member Info */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-1">
          {user.first_name} {user.last_name}
        </h4>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-4">
        <QRCodeGenerator
          value={generateMemberQRValue()}
          size={200}
          level="H"
          className="border border-gray-200 rounded-lg p-3 bg-white"
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-medium text-gray-700">
          📱 Show this QR code to the administrator for check-in
        </p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Keep your screen bright and steady</p>
          <p>• Make sure the QR code is clearly visible</p>
          <p>• Wait for confirmation from the administrator</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">Ready for Check-in</span>
        </div>
      </div>
    </div>
  );
};

export default MemberQRDisplay;
