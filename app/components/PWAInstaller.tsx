'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
      
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Show install button if prompt is available
  if (showInstallButton && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Install Church Management App</h3>
            <p className="text-xs opacity-90 mt-1">
              Install for better camera access and offline features
            </p>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setShowInstallButton(false)}
              className="px-3 py-1 text-xs bg-blue-500 rounded hover:bg-blue-400"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 text-xs bg-white text-blue-600 rounded font-medium hover:bg-gray-100"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show manual install instructions for iOS
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-blue-900 text-sm mb-2">
          📱 Install App for Better Camera Access
        </h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p>For better camera access on iOS:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Tap the Share button (⬆️) in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to install the app</li>
            <li>Open the app from your home screen</li>
          </ol>
        </div>
      </div>
    );
  }

  return null;
};
