'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

interface NoHTTPSQRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const NoHTTPSQRScanner: React.FC<NoHTTPSQRScannerProps> = ({
  onScan,
  onError,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [hasSupport, setHasSupport] = useState({
    camera: false,
    fileInput: true,
    forceCamera: true
  });
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState('photo');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if compact mode
  const isCompactMode = className.includes('compact');

  useEffect(() => {
    // Check for camera support and HTTPS - only in browser
    const checkSupport = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        setHasSupport({
          camera: false,
          fileInput: true,
          forceCamera: false
        });
        return;
      }
      
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      setHasSupport({
        camera: hasMediaDevices && (isHTTPS || isLocalhost),
        fileInput: true,
        forceCamera: true
      });
    };

    checkSupport();
  }, []);

  // Force camera access function
  const forceAccessCamera = async () => {
    try {
      setIsProcessing(true);

      // Check browser environment first
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        throw new Error('Browser environment required for camera access');
      }

      // Try multiple approaches to get camera access
      let stream: MediaStream | null = null;

      // Method 1: Standard getUserMedia
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (e) {
        console.log('Standard getUserMedia failed, trying fallback...');
      }

      // Method 2: Legacy getUserMedia
      if (!stream && (navigator as any).getUserMedia) {
        try {
          stream = await new Promise<MediaStream>((resolve, reject) => {
            (navigator as any).getUserMedia(
              { video: { facingMode: 'environment' } },
              resolve,
              reject
            );
          });
        } catch (e) {
          console.log('Legacy getUserMedia failed...');
        }
      }

      // Method 3: Webkit getUserMedia
      if (!stream && (navigator as any).webkitGetUserMedia) {
        try {
          stream = await new Promise<MediaStream>((resolve, reject) => {
            (navigator as any).webkitGetUserMedia(
              { video: { facingMode: 'environment' } },
              resolve,
              reject
            );
          });
        } catch (e) {
          console.log('Webkit getUserMedia failed...');
        }
      }

      if (stream && videoRef.current) {
        setCameraStream(stream);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startQRScanning();

        onError?.('✅ Kamera berhasil diakses! Arahkan ke QR code.');
      } else {
        throw new Error('Tidak dapat mengakses kamera dengan metode apapun');
      }

    } catch (error: any) {
      console.error('Force camera access failed:', error);
      onError?.(`❌ Gagal mengakses kamera: ${error.message}. Gunakan upload foto sebagai alternatif.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start QR scanning from video
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
            inversionAttempts: "dontInvert",
          });

          if (qrCode) {
            console.log('QR Code found from camera:', qrCode.data);
            onScan(qrCode.data);
            stopCamera();
          }
        }
      }
    }, 100); // Scan every 100ms
  };

  // Stop camera and scanning
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    setIsProcessing(true);
    setPreviewImage(null);

    try {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Get image data for QR processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Try multiple QR detection strategies
          let qrCode = null;

          // Strategy 1: Normal detection
          qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (!qrCode) {
            // Strategy 2: With inversion attempts
            qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });
          }

          if (!qrCode) {
            // Strategy 3: Manual inversion
            const invertedImageData = ctx.createImageData(imageData);
            for (let i = 0; i < imageData.data.length; i += 4) {
              invertedImageData.data[i] = 255 - imageData.data[i];     // Red
              invertedImageData.data[i + 1] = 255 - imageData.data[i + 1]; // Green
              invertedImageData.data[i + 2] = 255 - imageData.data[i + 2]; // Blue
              invertedImageData.data[i + 3] = imageData.data[i + 3];       // Alpha
            }
            qrCode = jsQR(invertedImageData.data, invertedImageData.width, invertedImageData.height);
          }

          if (!qrCode) {
            // Strategy 4: Enhance contrast and try again
            const enhancedImageData = ctx.createImageData(imageData);
            for (let i = 0; i < imageData.data.length; i += 4) {
              // Convert to grayscale and enhance contrast
              const gray = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
              const enhanced = gray > 128 ? 255 : 0; // High contrast
              enhancedImageData.data[i] = enhanced;     // Red
              enhancedImageData.data[i + 1] = enhanced; // Green
              enhancedImageData.data[i + 2] = enhanced; // Blue
              enhancedImageData.data[i + 3] = imageData.data[i + 3]; // Alpha
            }
            qrCode = jsQR(enhancedImageData.data, enhancedImageData.width, enhancedImageData.height);
          }

          if (!qrCode) {
            // Strategy 5: Try with different scales
            const scales = [0.5, 1.5, 2.0];
            for (const scale of scales) {
              const scaledWidth = Math.floor(canvas.width * scale);
              const scaledHeight = Math.floor(canvas.height * scale);

              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = scaledWidth;
              tempCanvas.height = scaledHeight;
              const tempCtx = tempCanvas.getContext('2d');

              if (tempCtx) {
                tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                const scaledImageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);
                qrCode = jsQR(scaledImageData.data, scaledImageData.width, scaledImageData.height, {
                  inversionAttempts: "attemptBoth",
                });

                if (qrCode) break;
              }
            }
          }

          if (qrCode) {
            console.log('QR Code found:', qrCode.data);
            onScan(qrCode.data);
            setPreviewImage(null);
            // Clear the file input for next use
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else {
            onError?.('❌ Tidak dapat mendeteksi QR code. Coba:\n• Foto lebih jelas dengan pencahayaan baik\n• Pastikan QR code tidak terpotong\n• Gunakan kamera dengan resolusi lebih tinggi\n• Coba dari jarak yang berbeda');
          }
        } catch (error) {
          console.error('QR processing error:', error);
          onError?.('Failed to process image. Please try a different photo.');
        } finally {
          setIsProcessing(false);
          URL.revokeObjectURL(imageUrl);
        }
      };

      img.onerror = () => {
        onError?.('Failed to load image. Please try a different file.');
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
      };

      img.src = imageUrl;
    } catch (error) {
      console.error('File processing error:', error);
      onError?.('Failed to process file. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualId.trim()) {
      onError?.('Please enter a meeting ID');
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(manualId.trim())) {
      onError?.('Invalid meeting ID format. Please check the ID and try again.');
      return;
    }

    onScan(`MEETING_ID:${manualId.trim()}`);
    setManualId('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element for camera */}
      <video
        ref={videoRef}
        className={`w-full max-w-md mx-auto rounded-lg ${isScanning ? 'block' : 'hidden'}`}
        autoPlay
        playsInline
        muted
      />

      {/* Mode Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">🎯 Pilih Metode Scan QR Code:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setMode('photo')}
            className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
              mode === 'photo'
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            📷 Upload Foto
          </button>

          {hasSupport.forceCamera && (
            <button
              onClick={() => setMode('force-camera')}
              className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                mode === 'force-camera'
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🚀 Paksa Kamera
            </button>
          )}

          <button
            onClick={() => setMode('pwa-camera')}
            className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
              mode === 'pwa-camera'
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            📱 PWA Kamera
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
              mode === 'manual'
                ? 'bg-green-100 border-green-500 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✏️ Input Manual
          </button>
        </div>
      </div>

      {/* Force Camera Mode */}
      {mode === 'force-camera' && hasSupport.forceCamera && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">🚀 Mode Paksa Akses Kamera</h3>
            <p className="text-sm text-red-700">
              Mode eksperimental untuk mengakses kamera tanpa HTTPS. Browser mungkin meminta izin beberapa kali.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={forceAccessCamera}
              disabled={isProcessing || isScanning}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isProcessing || isScanning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Mengakses kamera...
                </>
              ) : isScanning ? (
                'Kamera sedang aktif'
              ) : (
                'Paksa Akses Kamera'
              )}
            </button>
            
            <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
              <strong>Peringatan:</strong> Mode ini dapat tidak berfungsi di semua browser. Coba beberapa kali jika tidak berhasil.
            </div>
          </div>
        </div>
      )}

      {/* PWA Camera Mode */}
      {mode === 'pwa-camera' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">📱 Mode PWA Kamera</h3>
              <p className="text-sm text-blue-700">
                Install aplikasi sebagai PWA untuk akses kamera yang lebih baik.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={forceAccessCamera}
                disabled={isProcessing || isScanning}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isProcessing || isScanning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Mengakses kamera...
                  </>
                ) : isScanning ? (
                  'Kamera sedang aktif'
                ) : (
                  'Akses Kamera PWA'
                )}
              </button>
              
              <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                <strong>Tips:</strong> Install aplikasi sebagai PWA dari menu browser untuk hasil terbaik.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      {isScanning && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">🎥 Kamera Aktif</h3>
                <p className="text-sm text-green-700">Arahkan kamera ke QR code untuk scan otomatis</p>
              </div>
            </div>
            <button
              onClick={stopCamera}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* HTTPS Warning */}
      {!hasSupport.camera && !hasSupport.forceCamera && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Camera tidak tersedia</h3>
              <p className="mt-1 text-sm text-amber-700">
                Kamera memerlukan HTTPS untuk berfungsi di browser mobile. Gunakan alternatif berikut:
              </p>
              <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
                <li>Ambil foto QR code dan upload</li>
                <li>Masukkan ID Meeting secara manual</li>
                <li>Install aplikasi sebagai PWA untuk akses kamera yang lebih baik</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Mode */}
      {mode === 'photo' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment" // Prefer back camera on mobile
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onClick={triggerFileInput}
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="space-y-4">
              <div className="text-6xl">📷</div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ambil Foto QR Code
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Cara termudah untuk scan QR code tanpa HTTPS
                </p>

                <div className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memproses gambar...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ambil/Pilih Foto
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Image */}
          {previewImage && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Sedang memproses foto ini:</p>
              <div className="inline-block border rounded-lg overflow-hidden">
                <img
                  src={previewImage}
                  alt="QR Code Preview"
                  className="max-w-xs max-h-48"
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cara menggunakan:
            </h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Ambil foto QR code di lokasi acara dengan pencahayaan yang baik</li>
              <li>Pastikan QR code terlihat jelas dan tidak terpotong</li>
              <li>Tap tombol "Ambil/Pilih Foto" di atas</li>
              <li>Pilih foto dari galeri atau ambil foto baru</li>
              <li>Tunggu aplikasi memproses dan check-in otomatis</li>
            </ol>
          </div>
        </div>
      )}

      {/* Manual Input Mode */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Input Manual Meeting ID
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Meeting ID (minta ke admin/petugas acara)
                </label>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="contoh: 123e4567-e89b-12d3-a456-426614174000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleManualSubmit}
                disabled={!manualId.trim() || isProcessing}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !manualId.trim() || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Check In dengan Meeting ID'}
              </button>
            </div>
          </div>

          {/* When to use manual */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Kapan menggunakan input manual:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>QR code rusak atau tidak bisa difoto dengan jelas</li>
              <li>Foto tidak bisa diproses dengan baik</li>
              <li>Petugas memberikan Meeting ID secara langsung</li>
              <li>Situasi darurat atau troubleshooting</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tips for better results */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Tips untuk hasil terbaik:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Pencahayaan:</strong> Pastikan area terang, hindari bayangan</li>
          <li><strong>Fokus:</strong> QR code harus terlihat jelas dan tajam</li>
          <li><strong>Jarak:</strong> Ambil foto dari jarak yang cukup dekat</li>
          <li><strong>Sudut:</strong> Foto dari sudut yang tegak lurus</li>
          <li><strong>Stabilitas:</strong> Tahan kamera dengan stabil saat memotret</li>
          <li><strong>Mode Paksa Kamera:</strong> Coba jika browser mendukung akses kamera</li>
        </ul>
      </div>
    </div>
  );
};

export default NoHTTPSQRScanner;
