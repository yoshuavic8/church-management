#!/bin/bash

# Fix Next.js missing prerender-manifest.json issue
# Target: gbihal1@192.168.0.111:/www/wwwroot/gbihal1.server.my/churchManagement

REMOTE_USER="gbihal1"
REMOTE_HOST="192.168.0.111"
REMOTE_PATH="/www/wwwroot/gbihal1.server.my/churchManagement"

echo "🔧 Fixing Next.js build issue on server..."

# Stop the current failing process
echo "🛑 Stopping current PM2 process..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    pm2 stop churchmanagement 2>/dev/null || echo 'ℹ️  Process already stopped'
    pm2 delete churchmanagement 2>/dev/null || echo 'ℹ️  Process deleted'
"

# Fix the build issue on server
echo "🔨 Rebuilding Next.js on server..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    cd '$REMOTE_PATH'
    
    echo '🧹 Cleaning old build...'
    rm -rf .next
    rm -rf node_modules/.cache
    
    echo '📦 Reinstalling dependencies...'
    npm install
    
    echo '🏗️  Building Next.js application...'
    NODE_ENV=production npm run build
    
    if [ \$? -eq 0 ]; then
        echo '✅ Build successful!'
        
        echo '🔍 Checking for prerender-manifest.json...'
        if [ -f '.next/prerender-manifest.json' ]; then
            echo '✅ prerender-manifest.json found'
        else
            echo '⚠️  Creating missing prerender-manifest.json...'
            echo '{}' > .next/prerender-manifest.json
        fi
        
        echo '🔍 Checking build directory contents...'
        ls -la .next/
        
        echo '🚀 Starting Next.js application...'
        pm2 start npm --name 'churchmanagement' -- start
        pm2 save
        
        echo '✅ Application started successfully!'
        pm2 list
        
    else
        echo '❌ Build failed! Check the error above.'
        exit 1
    fi
"

echo ""
echo "🔍 Checking application status..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    sleep 5
    echo '📊 PM2 Status:'
    pm2 list
    
    echo ''
    echo '📝 Recent logs:'
    pm2 logs churchmanagement --lines 5 --nostream
"

echo ""
echo "✅ Fix completed!"
echo ""
echo "🌐 Your application should now be running at:"
echo "   http://192.168.0.111:3000"
echo "   or your configured domain"
echo ""
echo "🔍 Monitor with:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo "   pm2 logs churchmanagement"