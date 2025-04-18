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
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  useEffect(() => {
    // Initialize scanner
    scannerRef.current = new Html5Qrcode(scannerDivId);

    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const formattedDevices = devices.map(device => ({
            id: device.id,
            label: device.label || `Camera ${device.id}`
          }));
          setCameras(formattedDevices);
          setSelectedDeviceId(formattedDevices[0].id); // Select first camera by default
          setHasCamera(true);
        } else {
          setHasCamera(false);
        }
      })
      .catch((err) => {
        
        setHasCamera(false);
        if (err.name === 'NotAllowedError') {
          setPermissionDenied(true);
        }
      });

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop()
          .catch(err => 
      }
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current || !selectedDeviceId) return;

    const config = {
      fps,
      qrbox: { width: qrbox, height: qrbox },
      aspectRatio: 1,
      disableFlip,
    };

    scannerRef.current.start(
      selectedDeviceId,
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
    })
    .catch((err) => {
      
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true);
      }
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
        .catch(err => 
    }
  };

  if (permissionDenied) {
    return (
      <div className={`qr-scanner-container ${className} p-4 bg-red-50 rounded-lg text-center`}>
        <p className="text-red-600 mb-2">Camera access denied</p>
        <p className="text-sm text-gray-600">Please allow camera access in your browser settings to scan QR codes.</p>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className={`qr-scanner-container ${className} p-4 bg-yellow-50 rounded-lg text-center`}>
        <p className="text-yellow-600 mb-2">No camera detected</p>
        <p className="text-sm text-gray-600">Please connect a camera to scan QR codes.</p>
      </div>
    );
  }

  return (
    <div className={`qr-scanner-container ${className}`}>
      <div id={scannerDivId} style={{ width, height }} className="mx-auto overflow-hidden rounded-lg"></div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
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
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Start Camera
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
