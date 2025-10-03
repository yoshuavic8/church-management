'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

interface CompactNoHTTPSQRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const CompactNoHTTPSQRScanner: React.FC<CompactNoHTTPSQRScannerProps> = ({
  onScan,
  onError,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<'photo' | 'manual'>('photo');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Pilih file gambar (JPG, PNG, dll)');
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

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (qrCode) {
            onScan(qrCode.data);
            setPreviewImage(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else {
            // Try with inverted colors
            const invertedImageData = ctx.createImageData(imageData);
            for (let i = 0; i < imageData.data.length; i += 4) {
              invertedImageData.data[i] = 255 - imageData.data[i];
              invertedImageData.data[i + 1] = 255 - imageData.data[i + 1]; 
              invertedImageData.data[i + 2] = 255 - imageData.data[i + 2];
              invertedImageData.data[i + 3] = imageData.data[i + 3];
            }

            const invertedQrCode = jsQR(invertedImageData.data, invertedImageData.width, invertedImageData.height);
            
            if (invertedQrCode) {
              onScan(invertedQrCode.data);
              setPreviewImage(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            } else {
              onError?.('QR code tidak ditemukan. Coba foto yang lebih jelas dengan pencahayaan baik.');
            }
          }
        } catch (error) {
          onError?.('Gagal memproses gambar. Coba foto lain.');
        } finally {
          setIsProcessing(false);
          URL.revokeObjectURL(imageUrl);
        }
      };

      img.onerror = () => {
        onError?.('Gagal memuat gambar. Coba file lain.');
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
      };

      img.src = imageUrl;
    } catch (error) {
      onError?.('Gagal memproses file. Coba lagi.');
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
      onError?.('Masukkan Meeting ID');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(manualId.trim())) {
      onError?.('Format Meeting ID tidak valid');
      return;
    }

    onScan(`MEETING_ID:${manualId.trim()}`);
    setManualId('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-md flex">
          <button
            onClick={() => setMode('photo')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'photo'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            📷 Foto
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'manual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            ⌨️ Manual
          </button>
        </div>
      </div>

      {/* Photo Upload Mode */}
      {mode === 'photo' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
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
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="space-y-2">
              <div className="text-3xl">📷</div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Ambil Foto QR Code
                </p>
                <div className="inline-flex items-center justify-center px-4 py-2 mt-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    'Pilih/Ambil Foto'
                  )}
                </div>
              </div>
            </div>
          </div>

          {previewImage && (
            <div className="text-center">
              <img
                src={previewImage}
                alt="QR Code Preview"
                className="max-w-24 max-h-24 mx-auto rounded border"
              />
            </div>
          )}
        </div>
      )}

      {/* Manual Input Mode */}
      {mode === 'manual' && (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="space-y-2">
              <label className="block text-xs text-gray-600">
                Meeting ID (tanya ke petugas)
              </label>
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="123e4567-e89b-12d3-a456..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualId.trim()}
                className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                  !manualId.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Check In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactNoHTTPSQRScanner;
