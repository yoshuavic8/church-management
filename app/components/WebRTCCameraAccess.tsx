'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

interface WebRTCCameraAccessProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

// Helper function to check if we're in browser environment
const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

export const WebRTCCameraAccess: React.FC<WebRTCCameraAccessProps> = ({
  onScan,
  onError,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [currentMethod, setCurrentMethod] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Advanced camera access methods using WebRTC techniques
  const webRTCMethods = [
    {
      name: 'WebRTC getUserMedia (Environment)',
      method: async () => {
        if (!isBrowser()) throw new Error('Browser environment required');
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          }
        });
      }
    },
    {
      name: 'WebRTC getUserMedia (Any Camera)',
      method: async () => {
        if (!isBrowser()) throw new Error('Browser environment required');
        return await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 320, ideal: 640, max: 1280 },
            height: { min: 240, ideal: 480, max: 720 },
            frameRate: { ideal: 15, max: 30 }
          }
        });
      }
    },
    {
      name: 'WebRTC with Device Selection',
      method: async () => {
        if (!isBrowser()) throw new Error('Browser environment required');
        // Get available devices first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error('No video devices found');
        }
        
        // Try to find back camera
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        const deviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;
        
        return await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }
    },
    {
      name: 'WebRTC Minimal Constraints',
      method: async () => {
        if (!isBrowser()) throw new Error('Browser environment required');
        return await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
    },
    {
      name: 'Legacy WebRTC (Polyfill)',
      method: async () => {
        if (!isBrowser()) throw new Error('Browser environment required');
        // Polyfill for older browsers
        const getUserMedia = (navigator as any).getUserMedia || 
                           (navigator as any).webkitGetUserMedia || 
                           (navigator as any).mozGetUserMedia ||
                           (navigator as any).msGetUserMedia;
        
        if (!getUserMedia) {
          throw new Error('getUserMedia not supported in this browser');
        }
        
        return new Promise<MediaStream>((resolve, reject) => {
          getUserMedia.call(navigator, {
            video: {
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          }, resolve, reject);
        });
      }
    }
  ];

  const tryWebRTCAccess = async () => {
    setIsProcessing(true);
    setAttempts(0);
    setCurrentMethod('');
    
    // Check if we're in browser environment first
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      onError?.('❌ Tidak dapat mengakses kamera di lingkungan server');
      setIsProcessing(false);
      return;
    }
    
    // Check if WebRTC is supported
    if (!navigator.mediaDevices && !(navigator as any).getUserMedia) {
      onError?.('❌ WebRTC tidak didukung di browser ini');
      setIsProcessing(false);
      return;
    }
    
    for (let i = 0; i < webRTCMethods.length; i++) {
      const method = webRTCMethods[i];
      setAttempts(i + 1);
      setCurrentMethod(method.name);
      
      try {
        onError?.(`🔄 Mencoba metode ${i + 1}/${webRTCMethods.length}: ${method.name}...`);
        
        const mediaStream = await method.method();
        
        if (mediaStream && videoRef.current) {
          setStream(mediaStream);
          videoRef.current.srcObject = mediaStream;
          
          // Wait for video to be ready
          await new Promise<void>((resolve, reject) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => resolve();
              videoRef.current.onerror = () => reject(new Error('Video load failed'));
              videoRef.current.play().catch(reject);
            }
          });
          
          setIsScanning(true);
          startQRScanning();
          
          onError?.(`✅ Berhasil! WebRTC aktif dengan ${method.name}. Arahkan ke QR code.`);
          setIsProcessing(false);
          return;
        }
      } catch (error: any) {
        console.log(`WebRTC method ${i + 1} failed:`, error);
        onError?.(`❌ Metode ${i + 1} gagal: ${error.message}`);
        
        // Wait before trying next method
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsProcessing(false);
    setCurrentMethod('');
    onError?.('❌ Semua metode WebRTC gagal. Browser mungkin memblokir akses kamera.');
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
            console.log('QR Code found from WebRTC:', qrCode.data);
            onScan(qrCode.data);
            stopCamera();
          }
        }
      }
    }, 100); // Faster scanning for real-time
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind, track.label);
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
      
      {/* Video Display */}
      {isScanning && (
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full max-w-md mx-auto rounded-lg border-2 border-green-500 shadow-lg"
            autoPlay 
            playsInline 
            muted
          />
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            🔴 WebRTC LIVE
          </div>
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {currentMethod}
          </div>
        </div>
      )}

      {/* WebRTC Access Button */}
      {!isScanning && (
        <div className="text-center">
          <button
            onClick={tryWebRTCAccess}
            disabled={isProcessing}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Mencoba metode {attempts}/{webRTCMethods.length}...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                🌐 COBA WEBRTC ACCESS
              </>
            )}
          </button>
          
          <p className="mt-2 text-sm text-gray-600">
            Akan mencoba {webRTCMethods.length} metode WebRTC berbeda
          </p>
        </div>
      )}

      {/* Stop Button */}
      {isScanning && (
        <div className="text-center">
          <button
            onClick={stopCamera}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l6 6m0-6l-6 6" />
            </svg>
            Stop WebRTC
          </button>
        </div>
      )}

      {/* WebRTC Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-2">🌐 WebRTC Mode</h4>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Menggunakan teknologi WebRTC untuk akses kamera</li>
          <li>Mencoba berbagai constraint dan device selection</li>
          <li>Lebih advanced dari getUserMedia biasa</li>
          <li>Bisa bypass beberapa browser restriction</li>
          <li>Support device enumeration dan selection</li>
        </ul>
      </div>
    </div>
  );
};

export default WebRTCCameraAccess;
