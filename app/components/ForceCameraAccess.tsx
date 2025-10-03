'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

interface ForceCameraAccessProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ForceCameraAccess: React.FC<ForceCameraAccessProps> = ({
  onScan,
  onError,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Multiple camera access methods
  const accessMethods = [
    {
      name: 'Standard MediaDevices',
      method: async () => {
        return await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }
    },
    {
      name: 'Legacy getUserMedia',
      method: async () => {
        const getUserMedia = (navigator as any).getUserMedia || 
                           (navigator as any).webkitGetUserMedia || 
                           (navigator as any).mozGetUserMedia;
        
        if (!getUserMedia) throw new Error('getUserMedia not supported');
        
        return new Promise<MediaStream>((resolve, reject) => {
          getUserMedia.call(navigator, 
            { video: { facingMode: 'environment' } },
            resolve,
            reject
          );
        });
      }
    },
    {
      name: 'Basic Video Constraints',
      method: async () => {
        return await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
    },
    {
      name: 'No Constraints',
      method: async () => {
        return await navigator.mediaDevices.getUserMedia({
          video: {}
        });
      }
    }
  ];

  const tryAccessCamera = async () => {
    setIsProcessing(true);
    setAttempts(0);
    
    for (let i = 0; i < accessMethods.length; i++) {
      const method = accessMethods[i];
      setAttempts(i + 1);
      
      try {
        onError?.(`🔄 Mencoba metode ${i + 1}/${accessMethods.length}: ${method.name}...`);
        
        const stream = await method.method();
        
        if (stream && videoRef.current) {
          setCameraStream(stream);
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsScanning(true);
          startQRScanning();
          
          onError?.(`✅ Berhasil! Kamera aktif dengan ${method.name}. Arahkan ke QR code.`);
          setIsProcessing(false);
          return;
        }
      } catch (error: any) {
        console.log(`Method ${i + 1} failed:`, error);
        onError?.(`❌ Metode ${i + 1} gagal: ${error.message}`);
        
        // Wait a bit before trying next method
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsProcessing(false);
    onError?.('❌ Semua metode akses kamera gagal. Gunakan upload foto sebagai alternatif.');
  };

  const startQRScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          
          if (qrCode) {
            console.log('QR Code found from forced camera:', qrCode.data);
            onScan(qrCode.data);
            stopCamera();
          }
        }
      }
    }, 150); // Scan every 150ms
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video Display */}
      {isScanning && (
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full max-w-md mx-auto rounded-lg border-2 border-green-500"
            autoPlay 
            playsInline 
            muted
          />
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            🔴 LIVE
          </div>
        </div>
      )}

      {/* Force Camera Button */}
      {!isScanning && (
        <div className="text-center">
          <button
            onClick={tryAccessCamera}
            disabled={isProcessing}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Mencoba metode {attempts}/{accessMethods.length}...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                🚀 PAKSA AKSES KAMERA
              </>
            )}
          </button>
          
          <p className="mt-2 text-sm text-gray-600">
            Akan mencoba {accessMethods.length} metode berbeda untuk mengakses kamera
          </p>
        </div>
      )}

      {/* Stop Button */}
      {isScanning && (
        <div className="text-center">
          <button
            onClick={stopCamera}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l6 6m0-6l-6 6" />
            </svg>
            Stop Kamera
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-red-900 mb-2">⚠️ Mode Eksperimental</h4>
        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
          <li>Ini akan mencoba memaksa akses kamera tanpa HTTPS</li>
          <li>Browser mungkin meminta izin kamera beberapa kali</li>
          <li>Tidak semua browser/device mendukung metode ini</li>
          <li>Jika gagal, gunakan upload foto sebagai alternatif</li>
        </ul>
      </div>
    </div>
  );
};

export default ForceCameraAccess;
