#!/bin/bash
echo "🔄 Restarting Church Management Application..."

pm2 restart church-frontend church-backend

echo "✅ Application restarted!"
