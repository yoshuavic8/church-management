'use client';

import React, { useState, useEffect } from 'react';

interface PWAInstallPromptProps {
  onInstalled?: () => void;
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstalled,
  className = ''
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isChrome: false,
    isSafari: false,
    isFirefox: false
  });

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Detect device and browser
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    setDeviceInfo({ isIOS, isAndroid, isChrome, isSafari, isFirefox });

    // Check if already running as PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isIOSPWA = (window.navigator as any).standalone === true;
      
      const isPWAMode = isStandalone || isFullscreen || isMinimalUI || isIOSPWA;
      setIsPWA(isPWAMode);
      
      if (isPWAMode && onInstalled) {
        onInstalled();
      }
    };

    checkPWA();

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for PWA install completion
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsPWA(true);
      if (onInstalled) {
        onInstalled();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    } else {
      console.log('PWA install dismissed');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const getInstallInstructions = () => {
    if (deviceInfo.isIOS && deviceInfo.isSafari) {
      return {
        title: '📱 Install di iOS Safari',
        steps: [
          'Tap tombol Share (kotak dengan panah ke atas) di bottom bar',
          'Scroll ke bawah dan tap "Add to Home Screen"',
          'Tap "Add" di pojok kanan atas',
          'Aplikasi akan muncul di home screen Anda'
        ]
      };
    } else if (deviceInfo.isAndroid && deviceInfo.isChrome) {
      return {
        title: '🤖 Install di Android Chrome',
        steps: [
          'Tap menu (3 titik) di pojok kanan atas',
          'Pilih "Add to Home screen" atau "Install app"',
          'Tap "Add" atau "Install"',
          'Aplikasi akan muncul di home screen Anda'
        ]
      };
    } else if (deviceInfo.isChrome) {
      return {
        title: '💻 Install di Desktop Chrome',
        steps: [
          'Klik icon install (⊕) di address bar',
          'Atau klik menu (3 titik) → "Install Church Management"',
          'Klik "Install" di dialog yang muncul',
          'Aplikasi akan terbuka di window terpisah'
        ]
      };
    } else {
      return {
        title: '🌐 Install PWA',
        steps: [
          'Buka aplikasi di Chrome atau Safari',
          'Cari opsi "Add to Home Screen" atau "Install"',
          'Ikuti instruksi yang muncul',
          'Aplikasi akan tersedia di home screen'
        ]
      };
    }
  };

  if (isPWA) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">✅ Aplikasi PWA Aktif!</h3>
            <p className="text-sm text-green-700 mt-1">
              Anda sudah menggunakan aplikasi dalam mode PWA. Akses kamera mungkin lebih baik sekarang.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const instructions = getInstallInstructions();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Install Button (if available) */}
      {isInstallable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">📱 Install sebagai PWA</h3>
                <p className="text-sm text-blue-700">
                  Install aplikasi untuk akses kamera yang lebih baik
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Manual Install Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            📲 Cara Install Manual PWA
          </h3>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showInstructions ? 'Sembunyikan' : 'Lihat Cara'}
          </button>
        </div>

        {showInstructions && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-800">{instructions.title}</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>💡 Mengapa Install PWA?</strong><br/>
                • Akses kamera lebih baik tanpa HTTPS<br/>
                • Aplikasi berjalan seperti native app<br/>
                • Tidak perlu buka browser setiap kali<br/>
                • Performance lebih cepat
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Browser Compatibility */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">🌐 Browser Anda:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded ${deviceInfo.isIOS ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            📱 iOS: {deviceInfo.isIOS ? 'Ya' : 'Tidak'}
          </div>
          <div className={`p-2 rounded ${deviceInfo.isAndroid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            🤖 Android: {deviceInfo.isAndroid ? 'Ya' : 'Tidak'}
          </div>
          <div className={`p-2 rounded ${deviceInfo.isChrome ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            🟡 Chrome: {deviceInfo.isChrome ? 'Ya' : 'Tidak'}
          </div>
          <div className={`p-2 rounded ${deviceInfo.isSafari ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            🔵 Safari: {deviceInfo.isSafari ? 'Ya' : 'Tidak'}
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-2">
          {deviceInfo.isChrome || deviceInfo.isSafari 
            ? '✅ Browser Anda mendukung PWA dengan baik'
            : '⚠️ Gunakan Chrome atau Safari untuk PWA terbaik'
          }
        </p>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
