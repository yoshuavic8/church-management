'use client';

import React, { useState } from 'react';
import ForceCameraAccess from '../components/ForceCameraAccess';
import NoHTTPSQRScanner from '../components/NoHTTPSQRScanner';
import WebRTCCameraAccess from '../components/WebRTCCameraAccess';
import PWACameraAccess from '../components/PWACameraAccess';

export default function TestForceCameraPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'force' | 'enhanced' | 'webrtc' | 'pwa'>('enhanced');

  const handleScan = (scannedResult: string) => {
    console.log('Scanned:', scannedResult);
    setResult(scannedResult);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    console.error('Scan error:', errorMessage);
    setError(errorMessage);
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Test Force Camera Access
          </h1>
          <p className="text-gray-600">
            Test berbagai metode akses kamera tanpa HTTPS
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Mode Test:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setMode('enhanced')}
              className={`p-4 text-left border rounded-lg transition-colors ${
                mode === 'enhanced'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">🎯 Enhanced Scanner</div>
              <div className="text-sm text-gray-600 mt-1">
                Scanner dengan 3 mode: foto, paksa kamera, manual
              </div>
            </button>

            <button
              onClick={() => setMode('force')}
              className={`p-4 text-left border rounded-lg transition-colors ${
                mode === 'force'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">🚀 Force Camera Only</div>
              <div className="text-sm text-gray-600 mt-1">
                Hanya mode paksa akses kamera (eksperimental)
              </div>
            </button>

            <button
              onClick={() => setMode('webrtc')}
              className={`p-4 text-left border rounded-lg transition-colors ${
                mode === 'webrtc'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">🌐 WebRTC Camera</div>
              <div className="text-sm text-gray-600 mt-1">
                Advanced WebRTC dengan device selection
              </div>
            </button>

            <button
              onClick={() => setMode('pwa')}
              className={`p-4 text-left border rounded-lg transition-colors ${
                mode === 'pwa'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">📱 PWA Camera</div>
              <div className="text-sm text-gray-600 mt-1">
                Khusus untuk aplikasi PWA
              </div>
            </button>
          </div>
        </div>

        {/* Results Display */}
        {(result || error) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Hasil Test:</h2>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">✅ QR Code Berhasil Discan!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p className="font-mono bg-green-100 p-2 rounded">{result}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">❌ Error atau Info:</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p className="whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanner Component */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {mode === 'enhanced' && '🎯 Enhanced QR Scanner'}
            {mode === 'force' && '🚀 Force Camera Access'}
            {mode === 'webrtc' && '🌐 WebRTC Camera Access'}
            {mode === 'pwa' && '📱 PWA Camera Access'}
          </h2>

          {mode === 'enhanced' && (
            <NoHTTPSQRScanner
              onScan={handleScan}
              onError={handleError}
            />
          )}

          {mode === 'force' && (
            <ForceCameraAccess
              onScan={handleScan}
              onError={handleError}
            />
          )}

          {mode === 'webrtc' && (
            <WebRTCCameraAccess
              onScan={handleScan}
              onError={handleError}
            />
          )}

          {mode === 'pwa' && (
            <PWACameraAccess
              onScan={handleScan}
              onError={handleError}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Cara Test:</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. Test Enhanced Scanner:</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Pilih mode "📷 Upload Foto" dan test dengan foto QR code</li>
                <li>Pilih mode "🚀 Paksa Kamera" untuk test akses kamera</li>
                <li>Pilih mode "✏️ Input Manual" untuk test input UUID</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. Test Force Camera Only:</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Klik "PAKSA AKSES KAMERA" untuk mencoba 4 metode berbeda</li>
                <li>Perhatikan pesan error/success di bagian hasil</li>
                <li>Izinkan akses kamera jika browser meminta</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. Test WebRTC Camera:</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Klik "COBA WEBRTC ACCESS" untuk metode advanced</li>
                <li>Menggunakan device enumeration dan selection</li>
                <li>Lebih powerful dari getUserMedia biasa</li>
                <li>Support berbagai constraint dan fallback</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">4. Test dengan QR Code:</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Gunakan QR code generator online untuk membuat test QR</li>
                <li>Format yang diharapkan: "MEETING_ID:uuid-format"</li>
                <li>Contoh: "MEETING_ID:123e4567-e89b-12d3-a456-426614174000"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Browser Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🌐 Browser Info:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}
            </div>
            <div>
              <strong>Host:</strong> {typeof window !== 'undefined' ? window.location.host : 'N/A'}
            </div>
            <div>
              <strong>User Agent:</strong> {typeof window !== 'undefined' && typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}
            </div>
            <div>
              <strong>MediaDevices:</strong> {typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices ? '✅ Supported' : '❌ Not Supported'}
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <a
            href="/member/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
