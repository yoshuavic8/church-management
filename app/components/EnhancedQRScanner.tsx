'use client';

import { useState, useRef } from 'react';
import QRCodeScanner from './QRCodeScanner';
import jsQR from 'jsqr';

interface EnhancedQRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const EnhancedQRScanner: React.FC<EnhancedQRScannerProps> = ({
  onScan,
  onError
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'file' | 'manual'>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if PWA is installed
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };

  // File-based QR scanning
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
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
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

          if (qrCode) {
            onScan(qrCode.data);
            setPreviewImage(null);
            setIsProcessing(false);
          } else {
            onError?.('No QR code found in the image. Please try a clearer image.');
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('QR processing error:', error);
          onError?.('Failed to process image');
          setIsProcessing(false);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };

      img.onerror = () => {
        onError?.('Failed to load image');
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
      };

      img.src = imageUrl;
    } catch (error) {
      console.error('File processing error:', error);
      onError?.('Failed to process file');
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleManualSubmit = () => {
    if (!manualId.trim()) {
      onError?.('Please enter a meeting ID');
      return;
    }

    if (!/^[a-f0-9-]{36}$/.test(manualId.trim())) {
      onError?.('Invalid meeting ID format');
      return;
    }

    onScan(`MEETING_ID:${manualId.trim()}`);
    setManualId('');
  };

  return (
    <div className="space-y-4">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* PWA Install Prompt */}
      {!isPWA() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 text-sm mb-2">
            📱 Install App for Better Camera Access
          </h3>
          <p className="text-xs text-blue-800 mb-3">
            Installing this app will give you better camera access and work without internet.
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>On iPhone/iPad:</strong></p>
            <p>• Tap Share button (⬆️) → "Add to Home Screen"</p>
            <p><strong>On Android:</strong></p>
            <p>• Tap menu (⋮) → "Install app" or "Add to Home screen"</p>
          </div>
        </div>
      )}

      {/* Scan Mode Selector */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setScanMode('camera')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            scanMode === 'camera'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📷 Camera
        </button>
        <button
          onClick={() => setScanMode('file')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            scanMode === 'file'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📁 Photo
        </button>
        <button
          onClick={() => setScanMode('manual')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            scanMode === 'manual'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⌨️ Manual
        </button>
      </div>

      {/* Camera Scanner */}
      {scanMode === 'camera' && (
        <div>
          <QRCodeScanner
            onScan={onScan}
            onError={onError}
            width={300}
            height={300}
            fps={15}
            qrbox={200}
          />
          <p className="text-xs text-gray-500 text-center mt-2">
            {isPWA() 
              ? "📱 Camera access should work better in the installed app"
              : "⚠️ Camera may not work on HTTP. Try installing the app or use Photo mode."
            }
          </p>
        </div>
      )}

      {/* File Upload Scanner */}
      {scanMode === 'file' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="space-y-3">
              <div className="text-4xl">📷</div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Upload QR Code Photo
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Take a photo of the QR code and upload it here
                </p>
              </div>
              
              {isProcessing && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">Processing image...</span>
                </div>
              )}
            </div>
          </div>

          {previewImage && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Processing this image:</p>
              <img
                src={previewImage}
                alt="QR Code Preview"
                className="max-w-xs max-h-48 mx-auto rounded border"
              />
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              📱 How to use:
            </h4>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Take a clear photo of the QR code at the meeting</li>
              <li>Tap the upload area above</li>
              <li>Select the photo from your gallery</li>
              <li>Wait for automatic check-in</li>
            </ol>
          </div>
        </div>
      )}

      {/* Manual Input */}
      {scanMode === 'manual' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Manual Check-in</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Meeting ID (ask admin for this ID)
                </label>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleManualSubmit}
                disabled={!manualId.trim()}
                className={`w-full py-2 px-4 rounded text-sm font-medium ${
                  !manualId.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Check In with Meeting ID
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              💡 When to use manual input:
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>Camera doesn't work on your device</li>
              <li>QR code is not clear or damaged</li>
              <li>You're having trouble with photo upload</li>
              <li>Admin provides Meeting ID directly</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
