'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

interface PWACameraAccessProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const PWACameraAccess: React.FC<PWACameraAccessProps> = ({
  onScan,
  onError,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [currentMethod, setCurrentMethod] = useState<string>('');
  const [isPWA, setIsPWA] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if running as PWA
  useEffect(() => {
    const checkPWA = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        setIsPWA(false);
        return;
      }
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isIOSPWA = (window.navigator as any).standalone === true;
      
      setIsPWA(isStandalone || isFullscreen || isMinimalUI || isIOSPWA);
    };
    
    checkPWA();
  }, []);

  // PWA-specific camera access methods
  const pwaCameraMethods = [
    {
      name: 'PWA Direct Camera Access',
      method: async () => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
          throw new Error('Browser environment required');
        }
        // Force permission request in PWA context
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { min: 320, ideal: 1280, max: 1920 },
            height: { min: 240, ideal: 720, max: 1080 }
          }
        });
        return stream;
      }
    },
    {
      name: 'PWA with Explicit Permissions',
      method: async () => {
        // Request permissions explicitly
        if ('permissions' in navigator) {
          try {
            const permission = await (navigator as any).permissions.query({ name: 'camera' });
            console.log('Camera permission:', permission.state);
          } catch (e) {
            console.log('Permissions API not available');
          }
        }
        
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
      }
    },
    {
      name: 'PWA iOS Safari Workaround',
      method: async () => {
        // iOS Safari PWA specific workaround
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { exact: 640 },
            height: { exact: 480 }
          }
        };
        
        // Add iOS-specific handling
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          (constraints.video as any).aspectRatio = 4/3;
        }
        
        return await navigator.mediaDevices.getUserMedia(constraints);
      }
    },
    {
      name: 'PWA Android Chrome Workaround',
      method: async () => {
        // Android Chrome PWA specific workaround
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isAndroid) {
          // Try with specific Android constraints
          return await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: 'environment' },
              width: { min: 320, max: 1280 },
              height: { min: 240, max: 720 },
              frameRate: { max: 30 }
            }
          });
        } else {
          return await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
        }
      }
    },
    {
      name: 'PWA Fallback Method',
      method: async () => {
        // Last resort for PWA
        return await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
    },
    {
      name: 'PWA Legacy getUserMedia',
      method: async () => {
        // Legacy method for older PWA implementations
        const getUserMedia = (navigator as any).getUserMedia || 
                           (navigator as any).webkitGetUserMedia || 
                           (navigator as any).mozGetUserMedia;
        
        if (!getUserMedia) {
          throw new Error('getUserMedia not supported');
        }
        
        return new Promise<MediaStream>((resolve, reject) => {
          getUserMedia.call(navigator, {
            video: { facingMode: 'environment' }
          }, resolve, reject);
        });
      }
    }
  ];

  const tryPWACameraAccess = async () => {
    setIsProcessing(true);
    setAttempts(0);
    setCurrentMethod('');
    
    if (!isPWA) {
      onError?.('⚠️ Aplikasi tidak berjalan dalam mode PWA. Install sebagai PWA untuk hasil terbaik.');
    }
    
    // Check basic support
    if (!navigator.mediaDevices && !(navigator as any).getUserMedia) {
      onError?.('❌ Browser tidak mendukung akses kamera');
      setIsProcessing(false);
      return;
    }
    
    for (let i = 0; i < pwaCameraMethods.length; i++) {
      const method = pwaCameraMethods[i];
      setAttempts(i + 1);
      setCurrentMethod(method.name);
      
      try {
        onError?.(`🔄 PWA Method ${i + 1}/${pwaCameraMethods.length}: ${method.name}...`);
        
        const mediaStream = await method.method();
        
        if (mediaStream && videoRef.current) {
          setStream(mediaStream);
          videoRef.current.srcObject = mediaStream;
          
          // Wait for video to load
          await new Promise<void>((resolve, reject) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().then(resolve).catch(reject);
              };
              videoRef.current.onerror = () => reject(new Error('Video load failed'));
            }
          });
          
          setIsScanning(true);
          startQRScanning();
          
          onError?.(`✅ PWA Camera berhasil dengan ${method.name}! Arahkan ke QR code.`);
          setIsProcessing(false);
          return;
        }
      } catch (error: any) {
        console.log(`PWA method ${i + 1} failed:`, error);
        onError?.(`❌ PWA Method ${i + 1} gagal: ${error.message}`);
        
        // Wait before trying next method
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    setIsProcessing(false);
    setCurrentMethod('');
    onError?.('❌ Semua metode PWA gagal. Coba:\n• Restart aplikasi PWA\n• Reinstall PWA\n• Gunakan upload foto');
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
            console.log('QR Code found from PWA camera:', qrCode.data);
            onScan(qrCode.data);
            stopCamera();
          }
        }
      }
    }, 100);
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped PWA track:', track.kind, track.label);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setCurrentMethod('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* PWA Status */}
      <div className={`p-3 rounded-lg border ${
        isPWA 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isPWA ? (
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              isPWA ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {isPWA ? '✅ Berjalan sebagai PWA' : '⚠️ Tidak berjalan sebagai PWA'}
            </p>
            <p className={`text-xs ${
              isPWA ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isPWA 
                ? 'Mode PWA aktif - akses kamera mungkin lebih baik'
                : 'Install sebagai PWA untuk akses kamera yang lebih baik'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Video Display */}
      {isScanning && (
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-500 shadow-lg"
            autoPlay 
            playsInline 
            muted
          />
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            📱 PWA CAMERA
          </div>
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {currentMethod}
          </div>
        </div>
      )}

      {/* PWA Camera Button */}
      {!isScanning && (
        <div className="text-center">
          <button
            onClick={tryPWACameraAccess}
            disabled={isProcessing}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                PWA Method {attempts}/{pwaCameraMethods.length}...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                📱 COBA PWA CAMERA ACCESS
              </>
            )}
          </button>
          
          <p className="mt-2 text-sm text-gray-600">
            Akan mencoba {pwaCameraMethods.length} metode khusus PWA
          </p>
        </div>
      )}

      {/* Stop Button */}
      {isScanning && (
        <div className="text-center">
          <button
            onClick={stopCamera}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l6 6m0-6l-6 6" />
            </svg>
            Stop PWA Camera
          </button>
        </div>
      )}

      {/* PWA Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📱 PWA Camera Access</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Khusus untuk aplikasi yang diinstall sebagai PWA</li>
          <li>Menggunakan metode optimized untuk PWA context</li>
          <li>Support iOS Safari dan Android Chrome PWA</li>
          <li>Fallback ke legacy methods jika diperlukan</li>
          {!isPWA && (
            <li className="text-yellow-700 font-medium">
              ⚠️ Install aplikasi sebagai PWA untuk hasil terbaik
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PWACameraAccess;
