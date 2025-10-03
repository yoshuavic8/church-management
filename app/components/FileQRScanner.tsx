'use client';

import { useState, useRef } from 'react';
import jsQR from 'jsqr';

interface FileQRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const FileQRScanner: React.FC<FileQRScannerProps> = ({
  onScan,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    setIsProcessing(true);
    setPreviewImage(null);

    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // Load image and process
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Scan for QR code
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

          if (qrCode) {
            onScan(qrCode.data);
            setPreviewImage(null);
          } else {
            onError?.('No QR code found in the image. Please try a clearer image.');
          }
        } catch (error) {
          console.error('QR processing error:', error);
          onError?.('Failed to process image');
        } finally {
          setIsProcessing(false);
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileSelect}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <div className="space-y-3">
          <div className="text-4xl">📷</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Upload QR Code Image
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Click to select or drag and drop an image with QR code
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

      {/* Alternative button */}
      <div className="text-center">
        <button
          onClick={triggerFileSelect}
          disabled={isProcessing}
          className={`px-6 py-2 rounded-lg font-medium ${
            isProcessing
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : '📁 Select QR Code Image'}
        </button>
      </div>

      {/* Image preview */}
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

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          📱 How to use on mobile:
        </h4>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Take a photo of the QR code displayed at the meeting</li>
          <li>Tap "Select QR Code Image" button above</li>
          <li>Choose the photo from your gallery</li>
          <li>Wait for automatic processing and check-in</li>
        </ol>
        
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          💡 <strong>Tip:</strong> Make sure the QR code is clear and well-lit in the photo for best results.
        </div>
      </div>
    </div>
  );
};
