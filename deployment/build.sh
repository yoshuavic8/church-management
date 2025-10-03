#!/bin/bash
echo "🔨 Building Church Management Application..."

# Build Backend
echo "📦 Building backend..."
cd /var/www/church-management/backend
npm ci --only=production
npm run build

# Build Frontend
echo "📦 Building frontend..."
cd /var/www/church-management/frontend
npm ci --only=production
npm run build

echo "✅ Build completed!"
