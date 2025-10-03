'use client';

import React, { useState, useEffect } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import { apiClient } from '../lib/api-client';

interface LiveAttendanceControlProps {
  meetingId: string;
  meetingTopic: string;
  onAttendanceUpdate?: (participant: any) => void;
}

interface LiveAttendanceStatus {
  id: string;
  topic: string;
  meeting_date: string;
  live_checkin_active: boolean;
  live_checkin_expires_at: string | null;
  qr_code_data: string | null;
  is_active: boolean;
  is_expired: boolean;
}

export const LiveAttendanceControl: React.FC<LiveAttendanceControlProps> = ({
  meetingId,
  meetingTopic,
  onAttendanceUpdate,
}) => {
  const [status, setStatus] = useState<LiveAttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    loadLiveStatus();
  }, [meetingId]);

  const loadLiveStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLiveAttendanceStatus(meetingId);
      if (response.success && response.data) {
        setStatus(response.data);
        
        // Set default expiry time to 2 hours from now if not set
        if (!response.data.live_checkin_expires_at) {
          const defaultExpiry = new Date();
          defaultExpiry.setHours(defaultExpiry.getHours() + 2);
          setExpiresAt(defaultExpiry.toISOString().slice(0, 16));
        } else {
          setExpiresAt(new Date(response.data.live_checkin_expires_at).toISOString().slice(0, 16));
        }
      }
    } catch (error: any) {
      console.error('Error loading live status:', error);
      setError('Failed to load live attendance status');
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveAttendance = async (active: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const data: any = { active };
      if (active && expiresAt) {
        data.expires_at = new Date(expiresAt).toISOString();
      }

      const response = await apiClient.toggleLiveAttendance(meetingId, data);
      if (response.success) {
        await loadLiveStatus(); // Reload status
      } else {
        setError(response.error?.message || 'Failed to toggle live attendance');
      }
    } catch (error: any) {
      console.error('Error toggling live attendance:', error);
      setError('Failed to toggle live attendance');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !status) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Live Attendance Control</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status?.is_active ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className={`text-sm font-medium ${
            status?.is_active ? 'text-green-600' : 'text-gray-500'
          }`}>
            {status?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Expiry Time Setting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expires At
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status?.is_active}
          />
          {status?.live_checkin_expires_at && (
            <p className="text-xs text-gray-500 mt-1">
              Current expiry: {formatDateTime(status.live_checkin_expires_at)}
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3">
          {!status?.is_active ? (
            <button
              onClick={() => toggleLiveAttendance(true)}
              disabled={loading || !expiresAt}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Activating...' : 'Start Live Attendance'}
            </button>
          ) : (
            <button
              onClick={() => toggleLiveAttendance(false)}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Stopping...' : 'Stop Live Attendance'}
            </button>
          )}
        </div>

        {/* Admin Scanner Link */}
        {status?.is_active && (
          <div className="border-t pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-400 mr-3 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-blue-800 font-medium mb-2">New: Admin Member Scanner</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Use the admin scanner to scan member QR codes directly. This solves camera SSL issues on mobile devices.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={`/admin/scanner?meeting=${meetingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                      Open Admin Scanner
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        {status?.is_active && status?.qr_code_data && (
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">QR Code for Members</h4>
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCodeGenerator
                  value={status.qr_code_data}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Display this QR code for members to scan
                </p>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                  {status.qr_code_data}
                </p>
                {status.qr_code_data?.startsWith('MEETING_ID:') && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 <strong>Development Mode:</strong> QR code contains meeting ID only.
                    Members can scan this from any device on the same network.
                  </div>
                )}
                {status.qr_code_data?.startsWith('http') && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                    🌐 <strong>Production Mode:</strong> QR code contains full URL.
                    Members can scan this from any device with internet access.
                  </div>
                )}
              </div>
              
              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
              >
                🖨️ Print QR Code
              </button>
            </div>
          </div>
        )}

        {/* Status Information */}
        {status && (
          <div className="border-t pt-4 text-sm text-gray-600">
            <p><strong>Meeting:</strong> {status.topic}</p>
            <p><strong>Date:</strong> {formatDateTime(status.meeting_date)}</p>
            {status.is_expired && (
              <p className="text-red-600 font-medium">⚠️ Live attendance has expired</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
