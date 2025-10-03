#!/bin/bash
echo "🛑 Stopping Church Management Application..."

pm2 stop church-frontend church-backend
pm2 delete church-frontend church-backend

echo "✅ Application stopped!"
