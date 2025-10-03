'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  width?: number;
  height?: number;
  fps?: number;
  qrbox?: number;
  disableFlip?: boolean;
  className?: string;
}

const QRCodeScanner = ({
  onScan,
  onError,
  width = 300,
  height = 300,
  fps = 10,
  qrbox = 250,
  disableFlip = false,
  className = '',
}: QRCodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Initialize scanner
    scannerRef.current = new Html5Qrcode(scannerDivId);

    // For mobile browsers, we'll check cameras when user tries to start scanning
    // This is because mobile browsers don't expose cameras until permission is granted
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor).toLowerCase()
    );

    if (!isMobile) {
      // Only check cameras immediately on desktop
      checkAvailableCameras();
    } else {
      // On mobile, assume camera is available and check when starting
      setHasCamera(true);
    }

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop()
          .catch(err => {
            console.error('Error stopping scanner:', err);
          });
      }
    };
  }, []);

  const checkAvailableCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const formattedDevices = devices.map(device => ({
          id: device.id,
          label: device.label || `Camera ${device.id}`
        }));
        setCameras(formattedDevices);
        setSelectedDeviceId(formattedDevices[0].id);
        setHasCamera(true);
        return true;
      } else {
        setHasCamera(false);
        return false;
      }
    } catch (err: any) {
      console.error('Error checking cameras:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true);
      }
      return false;
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) return;

    setIsInitializing(true);
    setPermissionDenied(false);
    setHasCamera(true);

    // Detect if mobile device for optimized config
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor).toLowerCase()
    );

    // For mobile, check cameras when starting (after permission is likely to be granted)
    if (isMobile && (!selectedDeviceId || cameras.length === 0)) {
      const camerasAvailable = await checkAvailableCameras();
      if (!camerasAvailable) {
        setHasCamera(false);
        setIsInitializing(false);
        return;
      }
    }

    // If still no camera selected, try to use default camera ID for mobile
    let cameraId = selectedDeviceId;
    if (!cameraId && isMobile) {
      // For mobile, try using environment camera constraint instead of specific device ID
      cameraId = { facingMode: "environment" } as any;
    }

    if (!cameraId) return;

    const config = {
      fps: isMobile ? Math.min(fps, 15) : fps, // Limit FPS on mobile for better performance
      qrbox: { width: qrbox, height: qrbox },
      aspectRatio: 1,
      disableFlip,
      // Mobile-specific optimizations
      ...(isMobile && {
        videoConstraints: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
    };

    scannerRef.current.start(
      cameraId,
      config,
      (decodedText) => {
        onScan(decodedText);
        // Don't stop scanner here to allow continuous scanning
      },
      (errorMessage) => {
        if (onError) {
          onError(errorMessage);
        }
      }
    )
    .then(() => {
      setIsScanning(true);
      setIsInitializing(false);
    })
    .catch((err) => {
      console.error('Camera start error:', err);

      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setPermissionDenied(true);
      } else if (err.name === 'NotFoundError' || err.message?.includes('No camera found')) {
        setHasCamera(false);
      } else {
        // For mobile, try alternative approach
        if (isMobile && typeof navigator !== 'undefined' && navigator.mediaDevices) {
          // Try requesting permission first
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
              // Permission granted, try again after delay
              setTimeout(() => startScanner(), 1000);
            })
            .catch(() => {
              setPermissionDenied(true);
              setIsInitializing(false);
            });
        } else {
          setHasCamera(false);
          setIsInitializing(false);
          if (onError) {
            onError(`Failed to start camera: ${err.message}`);
          }
        }
      }
      setIsInitializing(false);
    });
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch(err => {

        });
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedDeviceId(deviceId);

    // If already scanning, stop and restart with new device
    if (isScanning && scannerRef.current) {
      scannerRef.current.stop()
        .then(() => {
          setSelectedDeviceId(deviceId);
          setTimeout(() => startScanner(), 300); // Small delay to ensure clean restart
        })
        .catch(err => {
          console.error('Error changing device:', err);
        })
    }
  };

  if (permissionDenied) {
    return (
      <div className={`qr-scanner-container ${className} p-4 bg-red-50 rounded-lg text-center`}>
        <p className="text-red-600 mb-2">📷 Camera access denied</p>
        <p className="text-sm text-gray-600 mb-3">Please allow camera access in your browser to scan QR codes.</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>On Mobile:</strong></p>
          <p>• Tap the camera icon in your browser's address bar</p>
          <p>• Select "Allow" when prompted for camera permission</p>
          <p>• Refresh the page and try again</p>
        </div>
      </div>
    );
  }

  if (!hasCamera && !isInitializing) {
    return (
      <div className={`qr-scanner-container ${className} p-4 bg-yellow-50 rounded-lg text-center`}>
        <p className="text-yellow-600 mb-2">📱 Camera not available</p>
        <p className="text-sm text-gray-600 mb-3">Unable to access camera on this device.</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Troubleshooting:</strong></p>
          <p>• Make sure you're using a device with a camera</p>
          <p>• Check if another app is using the camera</p>
          <p>• Try refreshing the page</p>
          <p>• Ensure you're using HTTPS (required for camera access)</p>
        </div>
        <button
          onClick={() => {
            setHasCamera(true);
            setPermissionDenied(false);
          }}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`qr-scanner-container ${className}`}>
      <div
        id={scannerDivId}
        style={{ width, height }}
        className="mx-auto overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50"
      ></div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center items-center">
        {cameras.length > 1 && (
          <select
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={isScanning}
          >
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        )}

        {!isScanning ? (
          <button
            onClick={startScanner}
            disabled={isInitializing}
            className={`px-4 py-2 text-white rounded-md text-sm flex items-center justify-center ${
              isInitializing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isInitializing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Initializing Camera...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Camera
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
