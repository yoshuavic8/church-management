#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📱 Setting up Capacitor for native mobile app...\n');

// Check if Capacitor CLI is installed
function checkCapacitorCLI() {
  try {
    execSync('npx @capacitor/cli --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install Capacitor
function installCapacitor() {
  console.log('📦 Installing Capacitor...');
  
  try {
    execSync('npm install @capacitor/core @capacitor/cli', { stdio: 'inherit' });
    execSync('npm install @capacitor/android @capacitor/ios', { stdio: 'inherit' });
    console.log('✅ Capacitor installed successfully');
  } catch (error) {
    console.error('❌ Error installing Capacitor:', error.message);
    process.exit(1);
  }
}

// Initialize Capacitor
function initCapacitor() {
  console.log('🔧 Initializing Capacitor...');
  
  try {
    execSync('npx cap init "Church Management" "com.church.management" --web-dir=out', { 
      stdio: 'inherit' 
    });
    console.log('✅ Capacitor initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Capacitor:', error.message);
    process.exit(1);
  }
}

// Create Capacitor config
function createCapacitorConfig() {
  const configPath = path.join(__dirname, '..', 'capacitor.config.ts');
  
  const configContent = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.church.management',
  appName: 'Church Management',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    }
  }
};

export default config;
`;

  fs.writeFileSync(configPath, configContent);
  console.log('📄 Created capacitor.config.ts');
}

// Update package.json scripts
function updatePackageJsonForCapacitor() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.scripts = packageJson.scripts || {};
    
    // Add Capacitor scripts
    packageJson.scripts['build:mobile'] = 'next build && next export';
    packageJson.scripts['cap:sync'] = 'npm run build:mobile && npx cap sync';
    packageJson.scripts['cap:android'] = 'npm run cap:sync && npx cap open android';
    packageJson.scripts['cap:ios'] = 'npm run cap:sync && npx cap open ios';
    packageJson.scripts['cap:run:android'] = 'npm run cap:sync && npx cap run android';
    packageJson.scripts['cap:run:ios'] = 'npm run cap:sync && npx cap run ios';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('📝 Updated package.json with Capacitor scripts');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

// Update next.config.js for static export
function updateNextConfig() {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  
  try {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Add trailingSlash and images unoptimized for static export
    if (!nextConfig.includes('trailingSlash')) {
      nextConfig = nextConfig.replace(
        'const nextConfig = {',
        `const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },`
      );
    }
    
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('📝 Updated next.config.js for mobile build');
  } catch (error) {
    console.error('❌ Error updating next.config.js:', error.message);
  }
}

// Create native camera component
function createNativeCameraComponent() {
  const componentPath = path.join(__dirname, '..', 'app', 'components', 'NativeCameraScanner.tsx');
  
  const componentContent = `'use client';

import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface NativeCameraScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const NativeCameraScanner: React.FC<NativeCameraScannerProps> = ({
  onScan,
  onError
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const startNativeCamera = async () => {
    if (!Capacitor.isNativePlatform()) {
      onError?.('Native camera only available in mobile app');
      return;
    }

    try {
      setIsScanning(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Scan QR Code',
        promptLabelPhoto: 'Take Photo',
        promptLabelPicture: 'Select from Gallery'
      });

      // Here you would integrate with a QR code reading library
      // For now, we'll simulate QR code detection
      if (image.dataUrl) {
        // TODO: Integrate with QR code reader library like jsQR
        // const qrResult = await detectQRCode(image.dataUrl);
        // onScan(qrResult);
        
        // Temporary: show image data
        console.log('Image captured:', image.dataUrl);
        onError?.('QR code detection not yet implemented for native camera');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      onError?.(error.message || 'Failed to access camera');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={startNativeCamera}
        disabled={isScanning}
        className={\`px-6 py-3 rounded-lg font-medium \${
          isScanning
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }\`}
      >
        {isScanning ? 'Opening Camera...' : '📷 Use Native Camera'}
      </button>
      
      {!Capacitor.isNativePlatform() && (
        <p className="text-xs text-gray-500 mt-2">
          Native camera only available in mobile app
        </p>
      )}
    </div>
  );
};
`;

  fs.writeFileSync(componentPath, componentContent);
  console.log('📱 Created NativeCameraScanner component');
}

// Main function
function main() {
  if (!checkCapacitorCLI()) {
    installCapacitor();
  }
  
  initCapacitor();
  createCapacitorConfig();
  updatePackageJsonForCapacitor();
  updateNextConfig();
  createNativeCameraComponent();
  
  console.log('\n🎉 Capacitor setup complete!\n');
  console.log('📋 Next steps:');
  console.log('1. Build for mobile: npm run build:mobile');
  console.log('2. Add platforms: npx cap add android && npx cap add ios');
  console.log('3. Sync and open: npm run cap:android or npm run cap:ios');
  console.log('4. Install Android Studio (for Android) or Xcode (for iOS)');
  console.log('5. Build and run on device/emulator\n');
  
  console.log('💡 Benefits:');
  console.log('- Native camera access without HTTPS');
  console.log('- App store distribution');
  console.log('- Better performance');
  console.log('- Offline capabilities');
}

main();
