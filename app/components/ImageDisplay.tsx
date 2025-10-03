'use client';

import React, { useState } from 'react';
import { getFileUrl } from '../utils/fileUtils';

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * ImageDisplay component that handles both uploaded files and external URLs
 * Automatically converts relative paths to full URLs for uploaded files
 */
export default function ImageDisplay({
  src,
  alt,
  className = '',
  fallback,
  onError,
  onLoad
}: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  // Get the proper URL for the image
  const imageUrl = getFileUrl(src);

  if (!src || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        {fallback || (
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">No image</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
    />
  );
}
