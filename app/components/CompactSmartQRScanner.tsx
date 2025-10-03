'use client';

import React, { useState, useEffect } from 'react';
import QRCodeScanner from './QRCodeScanner';
import CompactNoHTTPSQRScanner from './CompactNoHTTPSQRScanner';

interface CompactSmartQRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export const CompactSmartQRScanner: React.FC<CompactSmartQRScannerProps> = ({
  onScan,
  onError,
  width = 280,
  height = 280,
  className = ''
}) => {
  const [cameraSupport, setCameraSupport] = useState<{
    hasHTTPS: boolean;
    hasCamera: boolean;
    isLocalhost: boolean;
    canUseCamera: boolean;
  } | null>(null);

  const [scannerMode, setScannerMode] = useState<'camera' | 'photo'>('photo');
  const [showModeToggle, setShowModeToggle] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.endsWith('.local');
      
      let hasCamera = false;
      
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          hasCamera = devices.some(device => device.kind === 'videoinput');
        } catch (error) {
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
      setScannerMode(canUseCamera ? 'camera' : 'photo');
      setShowModeToggle(canUseCamera); // Only show toggle if camera is available
    };

    checkSupport();
  }, []);

  if (!cameraSupport) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Memeriksa kamera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Mode Toggle (only if camera is available) */}
      {showModeToggle && (
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-md flex">
            <button
              onClick={() => setScannerMode('camera')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                scannerMode === 'camera'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              📷 Live Camera
            </button>
            <button
              onClick={() => setScannerMode('photo')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                scannerMode === 'photo'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              📁 Upload Foto
            </button>
          </div>
        </div>
      )}

      {/* Scanner Component */}
      {scannerMode === 'camera' && cameraSupport.canUseCamera ? (
        <div className="text-center">
          <QRCodeScanner
            onScan={onScan}
            onError={onError}
            width={width}
            height={height}
            fps={15}
            qrbox={Math.min(width, height) - 40}
          />
          <p className="text-xs text-gray-500 mt-2">
            Arahkan kamera ke QR code
          </p>
        </div>
      ) : (
        <div>
          <CompactNoHTTPSQRScanner
            onScan={onScan}
            onError={onError}
            className="compact"
          />
          {!cameraSupport.hasHTTPS && (
            <p className="text-xs text-gray-500 text-center mt-2">
              💡 Camera live tidak tersedia tanpa HTTPS
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactSmartQRScanner;
