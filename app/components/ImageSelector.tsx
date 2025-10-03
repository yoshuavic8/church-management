'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import FileManagerModal from './FileManagerModal';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  showFileManager?: boolean;
  allowManualUrl?: boolean;
  required?: boolean;
  className?: string;
}

export default function ImageSelector({
  value,
  onChange,
  label = 'Image',
  placeholder = 'Enter image URL or select from gallery',
  showFileManager = true,
  allowManualUrl = true,
  required = false,
  className = ''
}: ImageSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleFileSelect = (fileUrl: string) => {
    onChange(fileUrl);
    setPreviewError(false);
  };

  const handleClearImage = () => {
    onChange('');
    setPreviewError(false);
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  const handleImageLoad = () => {
    setPreviewError(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <div className="w-48 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
            {!previewError ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Invalid image</span>
              </div>
            )}
          </div>
          
          {/* Clear button */}
          <button
            type="button"
            onClick={handleClearImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* URL Input */}
      {allowManualUrl && (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {showFileManager && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Browse Gallery
          </button>
        )}
        
        {!allowManualUrl && !value && (
          <div className="text-sm text-gray-500 py-2">
            Click "Browse Gallery" to select an image
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        {showFileManager && allowManualUrl 
          ? 'You can enter a URL directly or choose from uploaded files'
          : showFileManager 
          ? 'Select from uploaded files'
          : 'Enter a valid image URL'
        }
      </p>

      {/* File Manager Modal */}
      {showFileManager && (
        <FileManagerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={handleFileSelect}
          title="Select Image"
          fileTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
        />
      )}
    </div>
  );
}
