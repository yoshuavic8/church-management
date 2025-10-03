'use client';

import { useState } from 'react';
import Header from '../components/Header';
import NoHTTPSQRScanner from '../components/NoHTTPSQRScanner';

export default function TestScannerPage() {
  const [scanResult, setScanResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleScan = (result: string) => {
    setScanResult(result);
    setErrorMessage('');
    console.log('QR Scan Result:', result);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    console.error('QR Scan Error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Test QR Scanner" />
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test QR Code Scanner</h1>
          <p className="text-gray-600">
            Test halaman untuk menguji fungsi scan QR code dengan berbagai metode.
          </p>
        </div>

        {/* Scanner Component */}
        <div className="mb-6">
          <NoHTTPSQRScanner
            onScan={handleScan}
            onError={handleError}
            className="w-full"
          />
        </div>

        {/* Results Display */}
        <div className="space-y-4">
          {scanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">✅ Scan Result:</h3>
              <p className="text-green-700 font-mono break-all">{scanResult}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">❌ Error:</h3>
              <p className="text-red-700 whitespace-pre-line">{errorMessage}</p>
            </div>
          )}

          {!scanResult && !errorMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">📱 Ready to Scan</h3>
              <p className="text-blue-700">
                Use one of the scanning methods above to test QR code detection.
              </p>
            </div>
          )}
        </div>

        {/* Clear Button */}
        {(scanResult || errorMessage) && (
          <div className="mt-6">
            <button
              onClick={() => {
                setScanResult('');
                setErrorMessage('');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
