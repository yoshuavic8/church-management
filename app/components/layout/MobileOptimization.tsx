'use client';

import { useEffect } from 'react';

const MobileOptimization = () => {
  useEffect(() => {
    // Prevent zooming on iOS devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Add meta viewport tag for better mobile experience
    const updateViewportMeta = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        (viewportMeta as HTMLMetaElement).name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover'
      );
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Update viewport meta tag
    updateViewportMeta();

    // Add CSS variables for safe areas (for devices with notches)
    const addSafeAreaVariables = () => {
      const style = document.createElement('style');
      style.innerHTML = `
        :root {
          --sat: env(safe-area-inset-top);
          --sar: env(safe-area-inset-right);
          --sab: env(safe-area-inset-bottom);
          --sal: env(safe-area-inset-left);
        }
        
        body {
          padding-top: var(--sat, 0);
          padding-right: var(--sar, 0);
          padding-bottom: var(--sab, 0);
          padding-left: var(--sal, 0);
        }
      `;
      document.head.appendChild(style);
    };

    addSafeAreaVariables();

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null;
};

export default MobileOptimization;
