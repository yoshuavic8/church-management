'use client';

import React, { useState } from 'react';
import CompactSmartQRScanner from './CompactSmartQRScanner';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';

interface CheckinResult {
  success: boolean;
  message: string;
  already_checked_in: boolean;
  meeting_topic?: string;
}

export const CompactMemberQRScanner: React.FC = () => {
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

      if (decodedText.startsWith('MEETING_ID:')) {
        meetingId = decodedText.replace('MEETING_ID:', '');
      } else {
        const urlMatch = decodedText.match(/\/attendance\/([a-f0-9-]+)\/live-checkin/);
        if (!urlMatch) {
          throw new Error('QR code tidak valid. Scan QR code kehadiran yang benar.');
        }
        meetingId = urlMatch[1];
      }

      if (!/^[a-f0-9-]{36}$/.test(meetingId)) {
        throw new Error('Format Meeting ID tidak valid');
      }
      if (!user?.id) {
        throw new Error('User belum login');
      }

      const response = await apiClient.liveCheckin(meetingId, user.id);
      
      if (response.success) {
        setResult({
          success: true,
          message: (response.data?.message || 'Check-in berhasil!') as string,
          already_checked_in: (response.data?.already_checked_in || false) as boolean,
          meeting_topic: response.data?.meeting?.topic,
        });
      } else {
        throw new Error(response.error?.message || 'Check-in gagal');
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      setError(error.message || 'Gagal melakukan check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (error: string) => {
    console.error('QR Scan error:', error);
    setError('Gagal scan QR code. Silahkan coba lagi.');
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div>
      {/* Success/Error Messages */}
      {result && (
        <div className={`mb-4 p-3 rounded-md ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-2">
              <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 ml-2">{error}</p>
          </div>
        </div>
      )}

      {/* Compact Smart QR Scanner */}
      {!result && (
        <CompactSmartQRScanner
          onScan={handleScan}
          onError={handleScanError}
          width={280}
          height={280}
          className="compact-mode"
        />
      )}

      {/* Reset Button */}
      {result && (
        <div className="text-center mt-3">
          <button
            onClick={resetScanner}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Check In Lagi
          </button>
        </div>
      )}
    </div>
  );
};

export default CompactMemberQRScanner;
