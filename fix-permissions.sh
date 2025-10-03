#!/bin/bash

# Fix Next.js permissions on server
# Target: gbihal1@192.168.0.111:/www/wwwroot/gbihal1.server.my/churchManagement

REMOTE_USER="gbihal1"
REMOTE_HOST="192.168.0.111"
REMOTE_PATH="/www/wwwroot/gbihal1.server.my/churchManagement"

echo "🔧 Fixing Next.js permissions on server..."

# Connect to server and fix permissions
ssh "$REMOTE_USER@$REMOTE_HOST" "
    echo '📂 Navigating to project directory...'
    cd '$REMOTE_PATH'
    
    echo '🔧 Fixing node_modules permissions...'
    # Fix all executable permissions in node_modules/.bin/
    chmod +x node_modules/.bin/* 2>/dev/null
    
    # Specifically fix next binary
    chmod +x node_modules/.bin/next 2>/dev/null
    
    # Fix other common binaries
    chmod +x node_modules/.bin/eslint 2>/dev/null
    chmod +x node_modules/.bin/postcss 2>/dev/null
    chmod +x node_modules/.bin/tailwindcss 2>/dev/null
    
    echo '📁 Setting correct ownership...'
    # Change ownership to current user
    chown -R \$(whoami):\$(whoami) node_modules/.bin/ 2>/dev/null || echo 'ℹ️  Some ownership changes may require sudo'
    
    echo '🔍 Checking next binary permissions...'
    ls -la node_modules/.bin/next
    
    echo '✅ Permission fixes applied!'
"

echo "🔄 Stopping current PM2 process..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    pm2 stop churchmanagement 2>/dev/null || echo 'ℹ️  No process to stop'
    pm2 delete churchmanagement 2>/dev/null || echo 'ℹ️  No process to delete'
"

echo "🚀 Starting frontend with correct permissions..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    cd '$REMOTE_PATH'
    
    echo '🔄 Starting with PM2...'
    pm2 start npm --name 'churchmanagement' -- start
    
    echo '💾 Saving PM2 configuration...'
    pm2 save
    
    echo '📊 PM2 process status:'
    pm2 list
"

echo "✅ Permission fix and restart complete!"
echo ""
echo "🔍 Check the logs with:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo "   pm2 logs churchmanagement"