#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Setting up HTTPS for development...\n');

// Check if mkcert is installed
function checkMkcert() {
  try {
    execSync('mkcert -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install mkcert instructions
function showMkcertInstallation() {
  console.log('❌ mkcert is not installed. Please install it first:\n');
  
  const platform = process.platform;
  
  if (platform === 'darwin') {
    console.log('On macOS:');
    console.log('  brew install mkcert');
    console.log('  brew install nss # if you use Firefox');
  } else if (platform === 'linux') {
    console.log('On Linux:');
    console.log('  # Ubuntu/Debian');
    console.log('  sudo apt install libnss3-tools');
    console.log('  curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"');
    console.log('  chmod +x mkcert-v*-linux-amd64');
    console.log('  sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert');
  } else if (platform === 'win32') {
    console.log('On Windows:');
    console.log('  # Using Chocolatey');
    console.log('  choco install mkcert');
    console.log('  # Or using Scoop');
    console.log('  scoop bucket add extras');
    console.log('  scoop install mkcert');
  }
  
  console.log('\nAfter installation, run this script again.');
  process.exit(1);
}

// Create certificates
function createCertificates() {
  const certsDir = path.join(__dirname, '..', 'certs');
  
  // Create certs directory if it doesn't exist
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }
  
  console.log('📁 Creating certificates directory...');
  
  try {
    // Install the local CA
    console.log('🔐 Installing local Certificate Authority...');
    execSync('mkcert -install', { stdio: 'inherit' });
    
    // Create certificates for localhost and local IP
    console.log('📜 Creating certificates for localhost...');
    execSync(`mkcert -key-file ${certsDir}/localhost-key.pem -cert-file ${certsDir}/localhost.pem localhost 127.0.0.1 ::1`, { 
      stdio: 'inherit',
      cwd: certsDir 
    });
    
    console.log('✅ Certificates created successfully!\n');
    
    return {
      key: path.join(certsDir, 'localhost-key.pem'),
      cert: path.join(certsDir, 'localhost.pem')
    };
    
  } catch (error) {
    console.error('❌ Error creating certificates:', error.message);
    process.exit(1);
  }
}

// Update package.json scripts
function updatePackageJson(certPaths) {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add HTTPS development script
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['dev:https'] = `next dev --experimental-https --experimental-https-key ${certPaths.key} --experimental-https-cert ${certPaths.cert}`;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log('📝 Updated package.json with HTTPS script');
    
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

// Create environment file for HTTPS
function createHttpsEnv() {
  const envPath = path.join(__dirname, '..', '.env.https');
  
  const envContent = `# HTTPS Development Environment
NEXT_PUBLIC_API_URL=https://localhost:3001/api
API_URL=https://localhost:3001
FRONTEND_URL=https://localhost:3000

# Backend HTTPS (if needed)
HTTPS_KEY_PATH=./certs/localhost-key.pem
HTTPS_CERT_PATH=./certs/localhost.pem
`;

  fs.writeFileSync(envPath, envContent);
  console.log('📄 Created .env.https file');
}

// Main function
function main() {
  if (!checkMkcert()) {
    showMkcertInstallation();
    return;
  }
  
  const certPaths = createCertificates();
  updatePackageJson(certPaths);
  createHttpsEnv();
  
  console.log('🎉 HTTPS setup complete!\n');
  console.log('📋 Next steps:');
  console.log('1. Copy .env.https to .env.local for HTTPS development');
  console.log('2. Run: npm run dev:https');
  console.log('3. Access your app at: https://localhost:3000');
  console.log('4. Make sure your backend also runs on HTTPS (port 3001)\n');
  
  console.log('💡 For mobile testing:');
  console.log('1. Find your local IP: ipconfig getifaddr en0 (macOS) or ipconfig (Windows)');
  console.log('2. Create certificate for your IP: mkcert -key-file certs/ip-key.pem -cert-file certs/ip.pem YOUR_IP');
  console.log('3. Access from mobile: https://YOUR_IP:3000');
}

main();
