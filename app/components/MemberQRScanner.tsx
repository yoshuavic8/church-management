'use client';

import React, { useState } from 'react';
import SmartQRScanner from './SmartQRScanner';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

interface CheckinResult {
  success: boolean;
  message: string;
  already_checked_in: boolean;
  meeting_topic?: string;
}

export const MemberQRScanner: React.FC = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (decodedText: string) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Extract meeting ID from QR code
      let meetingId: string;

      // Check if it's a Meeting ID format (for localhost/development)
      if (decodedText.startsWith('MEETING_ID:')) {
        meetingId = decodedText.replace('MEETING_ID:', '');
      } else {
        // Try to extract from URL format (for production)
        const urlMatch = decodedText.match(/\/attendance\/([a-f0-9-]+)\/live-checkin/);
        if (!urlMatch) {
          throw new Error('Invalid QR code format. Please scan a valid attendance QR code.');
        }
        meetingId = urlMatch[1];
      }

      // Validate meeting ID format (UUID)
      if (!/^[a-f0-9-]{36}$/.test(meetingId)) {
        throw new Error('Invalid meeting ID format');
      }
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Perform live check-in
      const response = await apiClient.liveCheckin(meetingId, user.id);
      
      if (response.success) {
        setResult({
          success: true,
          message: (response.data?.message || 'Successfully checked in!') as string,
          already_checked_in: (response.data?.already_checked_in || false) as boolean,
          meeting_topic: response.data?.meeting?.topic,
        });
        
        // Success - no need to stop scanning as EnhancedQRScanner handles it
      } else {
        throw new Error(response.error?.message || 'Check-in failed');
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      setError(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error('QR Scan error:', error);
    setError('Failed to scan QR code. Please try again.');
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📱 Smart Attendance Check-in
        </h3>
        <p className="text-sm text-gray-600">
          Sistem pintar dengan multiple cara check-in: Live Camera, Photo Upload, atau Manual Entry
        </p>
      </div>

      {/* Success/Error Messages */}
      {result && (
        <div className={`mb-4 p-4 rounded-md ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.success ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              {result.meeting_topic && (
                <p className="text-xs text-gray-600 mt-1">
                  Meeting: {result.meeting_topic}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Smart QR Scanner */}
      {!result && (
        <SmartQRScanner
          onScan={handleScan}
          onError={handleScanError}
          width={300}
          height={300}
        />
      )}

      {/* Reset Button */}
      {result && (
        <div className="text-center mt-4">
          <button
            onClick={resetScanner}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Check In Another Person
          </button>
        </div>
      )}
    </div>
  );
};
