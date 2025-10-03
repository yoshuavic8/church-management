#!/bin/bash
echo "🚀 Starting Church Management Application..."

# Start with PM2
pm2 start /var/www/church-management/deployment/ecosystem.config.js --env production

echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:3001"
