#!/bin/bash

echo "🔧 Deploying admin management fixes..."

# Deploy backend API changes
echo "📦 Deploying backend changes..."
rsync -avz --exclude node_modules --exclude .git /Users/yoshuavictor/nodejs/church-management-api/ gbihal1@192.168.0.111:/www/wwwroot/gbihal1.server.my/church-management-api/

# Deploy frontend changes
echo "📦 Deploying frontend changes..."
rsync -avz --exclude node_modules --exclude .git --exclude .next /Users/yoshuavictor/Nextjs/churchManagement/ gbihal1@192.168.0.111:/www/wwwroot/gbihal1.server.my/churchManagement/

# Restart services
ssh gbihal1@192.168.0.111 << 'EOF'
cd /www/wwwroot/gbihal1.server.my

# Restart backend API
echo "🔄 Restarting backend API..."
pm2 restart churchmanagementapi

# Build and restart frontend
echo "🔄 Rebuilding and restarting frontend..."
cd churchManagement
npm install
npm run build
pm2 restart churchmanagement

echo "✅ All services restarted successfully!"
EOF

echo "✅ Admin management fixes deployed!"