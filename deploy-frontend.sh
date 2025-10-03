#!/bin/bash

# Church Management Frontend Deployment Script
# Target: gbihal1@192.168.0.111:/www/wwwroot/gbihal1.server.my/churchManagement

set -e  # Exit on any error

# Configuration
LOCAL_DIR="/Users/yoshuavictor/Nextjs/churchManagement"
REMOTE_USER="gbihal1"
REMOTE_HOST="192.168.0.111"
REMOTE_PATH="/www/wwwroot/gbihal1.server.my/churchManagement"
REMOTE="$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

echo "🚀 Starting Church Management Frontend Deployment"
echo "📂 Local:  $LOCAL_DIR"
echo "🌐 Remote: $REMOTE"
echo "----------------------------------------"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

# Check if the remote server is reachable
echo "🔍 Checking server connectivity..."
if ! ssh -o ConnectTimeout=10 "$REMOTE_USER@$REMOTE_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Error: Cannot connect to server $REMOTE_HOST"
    echo "Please check:"
    echo "1. Server is running and accessible"
    echo "2. SSH key is configured"
    echo "3. Username and IP are correct"
    exit 1
fi

echo "✅ Server connection successful"

# Create backup on server
echo "📦 Creating backup on server..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ssh "$REMOTE_USER@$REMOTE_HOST" "
    if [ -d '$REMOTE_PATH' ]; then
        cp -r '$REMOTE_PATH' '$REMOTE_PATH.backup_$TIMESTAMP'
        echo '✅ Backup created: $REMOTE_PATH.backup_$TIMESTAMP'
    else
        echo '📁 Target directory does not exist, will be created'
    fi
"

# Build the project locally
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Create deployment exclusion list
cat > .rsync-exclude << 'EOF'
node_modules/
.next/cache/
.git/
.gitignore
*.log
.env.local
.env.development
.DS_Store
*.backup*
BUILD_*.md
SHARP_TO_JIMP_MIGRATION.md
error*.md
package-lock.json
EOF

echo "📁 Syncing files to server..."

# Sync files using rsync
rsync -avz --delete \
    --exclude-from=.rsync-exclude \
    --progress \
    --human-readable \
    --compress \
    "$LOCAL_DIR/" \
    "$REMOTE"

if [ $? -ne 0 ]; then
    echo "❌ Sync failed!"
    exit 1
fi

echo "✅ Files synced successfully"

# Install dependencies and build on server
echo "📦 Installing dependencies on server..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    cd '$REMOTE_PATH'
    echo '🧹 Cleaning old build...'
    rm -rf node_modules .next package-lock.json
    
    echo '📦 Installing dependencies...'
    npm install
    
    echo '🔨 Building on server...'
    npm run build
    
    echo '🔧 Setting permissions...'
    chown -R www-data:www-data .
    find . -type f -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;
    
    echo '✅ Server setup complete!'
"

# Check if PM2 is available and restart if needed
echo "🔄 Checking for PM2 process..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    if command -v pm2 >/dev/null 2>&1; then
        echo '🔄 Restarting PM2 processes...'
        pm2 restart churchmanagement 2>/dev/null || echo 'ℹ️  No PM2 process named churchmanagement found'
        pm2 restart all 2>/dev/null || echo 'ℹ️  No PM2 processes to restart'
    else
        echo 'ℹ️  PM2 not found, skipping process restart'
    fi
"

# Cleanup
rm -f .rsync-exclude

echo "----------------------------------------"
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check the application at your domain"
echo "2. Verify all features are working"
echo "3. Check server logs if needed"
echo ""
echo "🔧 Useful commands:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo "   cd $REMOTE_PATH && npm start"
echo "   pm2 logs churchmanagement"
echo ""
echo "✅ Frontend deployment complete!"