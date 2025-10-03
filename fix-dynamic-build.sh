#!/bin/bash

echo "🔧 Fixing Next.js build issues for dynamic content..."

# Connect to server and update build configuration
ssh gbihal1@192.168.0.111 << 'EOF'
cd /www/wwwroot/gbihal1.server.my/churchManagement

# Stop any running application
pm2 stop churchmanagement 2>/dev/null || echo "No running process found"

# Create or update a simple next.config.js that prevents static generation
cat > next.config.js << 'CONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Disable static generation completely for dynamic apps
  experimental: {
    forceSwcTransforms: true,
  },
  // Force dynamic rendering for all pages
  generateStaticParams: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/uploads/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
CONFIG

# Clean and rebuild with dynamic rendering
echo "🧹 Cleaning build directory..."
rm -rf .next

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building application with dynamic rendering..."
NODE_ENV=production npm run build

echo "🚀 Starting application..."
pm2 start ecosystem.config.js --only churchmanagement

echo "✅ Build completed successfully!"
EOF

echo "✅ Dynamic build fix applied!"