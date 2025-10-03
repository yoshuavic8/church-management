#!/bin/bash

# Quick sync script for development
# Usage: ./quick-sync.sh

REMOTE="gbihal1@192.168.0.111:/www/wwwroot/gbihal1.server.my/churchManagement"

echo "🔄 Quick sync to server..."

# Build locally first
npm run build

# Sync only essential files
rsync -avz --delete \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.DS_Store' \
    --exclude='*.backup*' \
    --exclude='package-lock.json' \
    --progress \
    ./ "$REMOTE"

echo "✅ Quick sync complete!"
echo "Remember to run 'npm install' and 'npm run build' on the server if needed."