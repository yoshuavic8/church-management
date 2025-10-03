'use client';

import React, { useState, useEffect } from 'react';
import QRCodeScanner from './QRCodeScanner';
import { NoHTTPSQRScanner } from './NoHTTPSQRScanner';

interface SmartQRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export const SmartQRScanner: React.FC<SmartQRScannerProps> = ({
  onScan,
  onError,
  width = 300,
  height = 300,
  className = ''
}) => {
  const [cameraSupport, setCameraSupport] = useState<{
    hasHTTPS: boolean;
    hasCamera: boolean;
    isLocalhost: boolean;
    canUseCamera: boolean;
  } | null>(null);

  const [scannerMode, setScannerMode] = useState<'auto' | 'camera' | 'no-https'>('auto');
  const [showModeSelector, setShowModeSelector] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        setCameraSupport({
          hasHTTPS: false,
          hasCamera: false,
          isLocalhost: false,
          canUseCamera: false
        });
        return;
      }

      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.endsWith('.local');

      let hasCamera = false;

      // Check for MediaDevices API
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          // Try to get camera devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          hasCamera = devices.some(device => device.kind === 'videoinput');
        } catch (error) {
          console.log('Could not enumerate devices:', error);
          hasCamera = false;
        }
      }

      const canUseCamera = hasCamera && (isHTTPS || isLocalhost);

      setCameraSupport({
        hasHTTPS: isHTTPS,
        hasCamera,
        isLocalhost,
        canUseCamera
      });

      // Auto-select appropriate scanner mode
      if (canUseCamera) {
        setScannerMode('camera');
      } else {
        setScannerMode('no-https');
      }
    };

    checkSupport();
  }, []);

  if (!cameraSupport) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Memeriksa dukungan kamera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status and Mode Selector */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Scanner Status</h3>
          <button
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showModeSelector ? 'Sembunyikan' : 'Ganti Mode'}
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className={`flex items-center ${cameraSupport.hasHTTPS ? 'text-green-600' : 'text-orange-600'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${cameraSupport.hasHTTPS ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            {cameraSupport.hasHTTPS ? 'HTTPS ✓' : 'HTTP Only'}
          </div>
          
          <div className={`flex items-center ${cameraSupport.hasCamera ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${cameraSupport.hasCamera ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {cameraSupport.hasCamera ? 'Kamera ✓' : 'No Camera'}
          </div>

          <div className={`flex items-center ${cameraSupport.canUseCamera ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${cameraSupport.canUseCamera ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {cameraSupport.canUseCamera ? 'Live Scan ✓' : 'Photo Only'}
          </div>
        </div>

        {showModeSelector && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Pilih mode scanner:</p>
            <div className="flex space-x-2">
              {cameraSupport.canUseCamera && (
                <button
                  onClick={() => setScannerMode('camera')}
                  className={`px-3 py-2 text-xs rounded-md transition-colors ${
                    scannerMode === 'camera'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📷 Live Camera
                </button>
              )}
              <button
                onClick={() => setScannerMode('no-https')}
                className={`px-3 py-2 text-xs rounded-md transition-colors ${
                  scannerMode === 'no-https'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📁 Photo Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scanner Component */}
      {scannerMode === 'camera' && cameraSupport.canUseCamera ? (
        <div className="space-y-2">
          <QRCodeScanner
            onScan={onScan}
            onError={onError}
            width={width}
            height={height}
            fps={15}
            qrbox={Math.min(width, height) - 50}
          />
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Kamera live tersedia. Arahkan ke QR code untuk scan otomatis.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <NoHTTPSQRScanner
            onScan={onScan}
            onError={onError}
          />
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {!cameraSupport.hasHTTPS 
                ? 'Kamera live tidak tersedia tanpa HTTPS. Gunakan foto upload atau input manual.'
                : 'Mode photo upload untuk hasil terbaik tanpa live camera.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Troubleshooting Help */}
      <details className="bg-gray-50 rounded-lg">
        <summary className="p-3 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
          🔧 Troubleshooting & Tips
        </summary>
        <div className="p-3 pt-0 space-y-3 text-xs text-gray-600">
          <div>
            <strong>Jika kamera live tidak bekerja:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1 ml-2">
              <li>Pastikan menggunakan HTTPS (website dimulai dengan https://)</li>
              <li>Berikan izin akses kamera saat diminta browser</li>
              <li>Refresh halaman dan coba lagi</li>
              <li>Gunakan mode Photo Upload sebagai alternatif</li>
            </ul>
          </div>
          
          <div>
            <strong>Tips photo upload:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1 ml-2">
              <li>Pastikan pencahayaan cukup terang</li>
              <li>QR code terlihat jelas dan tidak blur</li>
              <li>Foto dari jarak yang tidak terlalu jauh/dekat</li>
              <li>Hindari pantulan cahaya pada QR code</li>
            </ul>
          </div>

          <div>
            <strong>Untuk pengalaman terbaik:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1 ml-2">
              <li>Install aplikasi sebagai PWA (Add to Home Screen)</li>
              <li>Gunakan browser Chrome atau Safari terbaru</li>
              <li>Aktifkan JavaScript di browser</li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
};

export default SmartQRScanner;
