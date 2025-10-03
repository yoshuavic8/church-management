'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCodeScanner from './QRCodeScanner';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

interface AdminMemberScannerProps {
  meetingId: string;
  onScanSuccess?: (member: any) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  member?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  already_checked_in?: boolean;
}

interface MeetingInfo {
  id: string;
  topic: string;
  meeting_date: string;
  location: string;
  event_category: string;
  live_checkin_active: boolean;
  live_checkin_expires_at?: string;
  is_active?: boolean;
  is_expired?: boolean;
}

export const AdminMemberScanner: React.FC<AdminMemberScannerProps> = ({
  meetingId,
  onScanSuccess,
  onScanError,
  className = ''
}) => {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedMembers, setScannedMembers] = useState<any[]>([]);
  const [adminVerified, setAdminVerified] = useState(false);
  
  // Use ref to store user data to prevent loss during camera permission
  const userRef = useRef(user);
  const adminStatusRef = useRef(false);

  useEffect(() => {
    if (user) {
      userRef.current = user;
      const isAdmin = user.role === 'admin' || (user.role_level && user.role_level >= 4);
      adminStatusRef.current = Boolean(isAdmin);
      setAdminVerified(Boolean(isAdmin));
    }
    loadMeetingInfo();
  }, [meetingId, user]);

  const loadMeetingInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 AdminMemberScanner: Loading meeting info for ID:', meetingId);
      
      const response = await apiClient.getLiveAttendanceStatus(meetingId);
      
      console.log('📋 AdminMemberScanner: Meeting info response:', response);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch meeting info');
      }

      setMeeting(response.data);
      console.log('✅ AdminMemberScanner: Meeting loaded:', response.data.topic, 'Active:', response.data.is_active);
    } catch (error: any) {
      console.error('❌ AdminMemberScanner: Failed to load meeting:', error);
      setError(error.message || 'Failed to load meeting information');
    } finally {
      setLoading(false);
    }
  };  const handleScan = async (decodedText: string) => {
    if (loading) return;

    try {
      setLoading(true);
      setScanResult(null);

      // Parse member QR code format: MEMBER_CHECKIN:member_id:meeting_id
      let memberId: string;
      
      if (decodedText.startsWith('MEMBER_CHECKIN:')) {
        const parts = decodedText.split(':');
        if (parts.length >= 2) {
          memberId = parts[1];
          // Optional: validate meeting_id from QR matches current meeting
          const qrMeetingId = parts[2];
          if (qrMeetingId !== 'GENERAL' && qrMeetingId !== meetingId) {
            throw new Error('QR code is for a different meeting');
          }
        } else {
          throw new Error('Invalid member QR code format');
        }
      } else {
        throw new Error('Invalid QR code. Please scan a member check-in QR code.');
      }

      if (!/^[a-f0-9-]{36}$/.test(memberId)) {
        throw new Error('Invalid member ID format');
      }

      // Call the existing liveCheckin API
      console.log('🚀 AdminMemberScanner: Calling liveCheckin API - meetingId:', meetingId, 'memberId:', memberId);
      
      const response = await apiClient.liveCheckin(meetingId, memberId);
      
      console.log('📡 AdminMemberScanner: liveCheckin response:', response);
      
      if (response.success) {
        const result: ScanResult = {
          success: true,
          message: response.data?.message || 'Member checked in successfully!',
          member: response.data?.member,
          already_checked_in: response.data?.already_checked_in || false
        };

        setScanResult(result);
        
        // Add to scanned members list (avoid duplicates)
        if (response.data?.member) {
          setScannedMembers(prev => {
            const exists = prev.find(m => m.id === response.data.member.id);
            if (!exists) {
              return [response.data.member, ...prev];
            }
            return prev;
          });
        }

        // Call success callback
        if (onScanSuccess) {
          onScanSuccess(response.data);
        }

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setScanResult(null);
        }, 3000);

      } else {
        throw new Error(response.error?.message || 'Check-in failed');
      }
    } catch (error: any) {
      console.error('Admin scan error:', error);
      const errorMessage = error.message || 'Failed to check in member';
      setScanResult({
        success: false,
        message: errorMessage
      });

      if (onScanError) {
        onScanError(errorMessage);
      }

      // Auto-clear error message after 5 seconds
      setTimeout(() => {
        setScanResult(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error('QR Scanner error:', error);
    setScanResult({
      success: false,
      message: 'Failed to scan QR code. Please try again.'
    });

    setTimeout(() => {
      setScanResult(null);
    }, 3000);
  };

  // Use ref values to prevent auth issues during camera permission
  const currentUser = userRef.current || user;
  const isAdmin = adminStatusRef.current || adminVerified;

  // Show loading while waiting for user data
  if (!currentUser || !adminVerified) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg text-center ${className}`}>
        <div className="text-red-600 mb-2">
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-700 font-medium">Access Denied</p>
        <p className="text-red-600 text-sm">Administrator privileges required</p>
      </div>
    );
  }

  if (loading && !meeting) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading meeting info...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg text-center ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadMeetingInfo}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (meeting && (!meeting.live_checkin_active || meeting.is_active === false)) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center ${className}`}>
        <div className="text-yellow-600 mb-2">
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-yellow-700 font-medium">Live Check-in Not Active</p>
        <p className="text-yellow-600 text-sm mt-1">
          {meeting.is_expired ? 'Live attendance has expired' : 'Please enable live attendance for this meeting first'}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Meeting Info Header */}
      {meeting && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{meeting.topic}</h3>
              <div className="text-sm text-gray-600 mt-1">
                📅 {new Date(meeting.meeting_date).toLocaleDateString('id-ID')} • 
                📍 {meeting.location}
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                meeting.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {meeting.is_active ? '🟢 ACTIVE' : '🔴 INACTIVE'}
              </div>
              {meeting.live_checkin_expires_at && (
                <div className="text-xs text-gray-500 mt-1">
                  Expires: {new Date(meeting.live_checkin_expires_at).toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Scan Result Messages */}
        {scanResult && (
          <div className={`mb-4 p-3 rounded-md ${
            scanResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                scanResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {scanResult.success ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  scanResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {scanResult.message}
                </p>
                {scanResult.member && (
                  <p className="text-xs text-gray-600 mt-1">
                    {scanResult.member.first_name} {scanResult.member.last_name}
                    {scanResult.already_checked_in && ' (Already checked in)'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scanner Instructions */}
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            📱 Scan Member QR Codes
          </h4>
          <p className="text-sm text-gray-600">
            Point the camera at a member's check-in QR code
          </p>
        </div>

        {/* QR Scanner */}
        <div className="mb-6">
          <QRCodeScanner
            onScan={handleScan}
            onError={handleScanError}
            width={400}
            height={300}
            qrbox={250}
            className="mx-auto"
          />
        </div>

        {/* Recently Scanned Members */}
        {scannedMembers.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 mb-3">
              Recently Checked In ({scannedMembers.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {scannedMembers.slice(0, 5).map((member, index) => (
                <div key={member.id} className="flex items-center p-2 bg-green-50 rounded-md">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {index === 0 ? 'Just now' : `${index + 1} scans ago`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMemberScanner;
