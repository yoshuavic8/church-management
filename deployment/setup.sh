#!/bin/bash

# Church Management Deployment Script for Appanel
# This script sets up the application for production deployment

echo "🏗️  Church Management Deployment Setup"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="church-management"
FRONTEND_PORT=3000
BACKEND_PORT=3001
DOMAIN="church-management.your-domain.com"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "   Project: $PROJECT_NAME"
echo "   Frontend Port: $FRONTEND_PORT"
echo "   Backend Port: $BACKEND_PORT"
echo "   Domain: $DOMAIN"
echo ""

# Function to create production environment file
create_prod_env() {
    echo -e "${YELLOW}⚙️  Creating production environment files...${NC}"
    
    # Frontend environment
    cat > .env.production << EOL
# Production Environment Configuration
NODE_ENV=production

# API Configuration - use localhost for internal communication
API_URL=http://localhost:${BACKEND_PORT}

# Public URLs
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_FRONTEND_URL=https://${DOMAIN}

# Database Configuration (will be set by backend)
# DATABASE_URL will be configured in backend .env

# Security
NEXTAUTH_SECRET=your-super-secure-secret-key-here
NEXTAUTH_URL=https://${DOMAIN}
EOL

    echo -e "${GREEN}✅ Frontend .env.production created${NC}"
}

# Function to create PM2 configuration
create_pm2_config() {
    echo -e "${YELLOW}⚙️  Creating PM2 ecosystem configuration...${NC}"
    
    cat > deployment/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [
    {
      name: 'church-frontend',
      cwd: '/var/www/church-management/frontend',
      script: 'node',
      args: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    },
    {
      name: 'church-backend',
      cwd: '/var/www/church-management/backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ],
  deploy: {
    production: {
      user: 'www-data',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/church-management.git',
      path: '/var/www/church-management',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/church-management/logs'
    }
  }
};
EOL

    echo -e "${GREEN}✅ PM2 ecosystem.config.js created${NC}"
}

# Function to create deployment scripts
create_deployment_scripts() {
    echo -e "${YELLOW}⚙️  Creating deployment helper scripts...${NC}"
    
    # Build script
    cat > deployment/build.sh << 'EOL'
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
EOL

    # Start script
    cat > deployment/start.sh << 'EOL'
#!/bin/bash
echo "🚀 Starting Church Management Application..."

# Start with PM2
pm2 start /var/www/church-management/deployment/ecosystem.config.js --env production

echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:3001"
EOL

    # Stop script
    cat > deployment/stop.sh << 'EOL'
#!/bin/bash
echo "🛑 Stopping Church Management Application..."

pm2 stop church-frontend church-backend
pm2 delete church-frontend church-backend

echo "✅ Application stopped!"
EOL

    # Restart script
    cat > deployment/restart.sh << 'EOL'
#!/bin/bash
echo "🔄 Restarting Church Management Application..."

pm2 restart church-frontend church-backend

echo "✅ Application restarted!"
EOL

    # Make scripts executable
    chmod +x deployment/*.sh
    
    echo -e "${GREEN}✅ Deployment scripts created${NC}"
}

# Function to create Nginx configuration
create_nginx_config() {
    echo -e "${YELLOW}⚙️  Creating Nginx configuration template...${NC}"
    
    cat > deployment/nginx.conf << EOL
# Nginx Configuration for Church Management
# Place this in /etc/nginx/sites-available/church-management

server {
    listen 80;
    server_name ${DOMAIN};
    
    # Redirect HTTP to HTTPS (Cloudflare will handle SSL)
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};
    
    # SSL will be handled by Cloudflare
    # These certificates are just for fallback
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:${FRONTEND_PORT};
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # API proxy (already handled by Next.js, but backup)
    location /api/ {
        proxy_pass http://localhost:${FRONTEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Logs
    access_log /var/log/nginx/church-management.access.log;
    error_log /var/log/nginx/church-management.error.log;
}
EOL

    echo -e "${GREEN}✅ Nginx configuration template created${NC}"
}

# Function to create Cloudflare Zero Trust guide
create_cloudflare_guide() {
    echo -e "${YELLOW}⚙️  Creating Cloudflare Zero Trust setup guide...${NC}"
    
    cat > deployment/CLOUDFLARE_SETUP.md << 'EOL'
# Cloudflare Zero Trust Setup Guide

## 📋 Prerequisites
- Cloudflare account with domain
- Zero Trust subscription (free tier available)
- Server with public IP or tunnel capability

## 🚀 Setup Steps

### 1. Create Cloudflare Tunnel
```bash
# Install cloudflared on server
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create church-management

# Configure tunnel
nano ~/.cloudflared/config.yml
```

### 2. Tunnel Configuration (`~/.cloudflared/config.yml`)
```yaml
tunnel: church-management
credentials-file: /home/user/.cloudflared/tunnel-id.json

ingress:
  - hostname: church-management.your-domain.com
    service: http://localhost:3000
  - service: http_status:404
```

### 3. DNS Configuration
1. Go to Cloudflare Dashboard → DNS
2. Add CNAME record:
   - Name: `church-management`
   - Content: `tunnel-id.cfargotunnel.com`
   - Proxy: Enabled (Orange cloud)

### 4. Zero Trust Application
1. Go to Zero Trust Dashboard → Access → Applications
2. Click "Add an application" → Self-hosted
3. Configure:
   - Application name: Church Management
   - Session Duration: 24 hours
   - Application domain: church-management.your-domain.com

### 5. Access Policies
Create policies for different user groups:

**Admin Policy:**
```
Name: Church Admin Access
Action: Allow
Rules:
  - Email: admin@your-church.com
  - Email domain: your-church.com (if using Google Workspace)
```

**Member Policy:**
```
Name: Church Member Access
Action: Allow
Rules:
  - Email domain: your-church.com
  - Or specific email list
```

### 6. Start Tunnel Service
```bash
# Test tunnel
cloudflared tunnel run church-management

# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 7. Security Settings
1. Go to Security → Settings
2. Configure:
   - Browser Isolation: Enable for sensitive areas
   - Malware Detection: Enable
   - Data Loss Prevention: Configure as needed

## 🔧 Maintenance Commands

```bash
# Check tunnel status
cloudflared tunnel info church-management

# View tunnel logs
sudo journalctl -u cloudflared -f

# Update tunnel configuration
cloudflared tunnel ingress validate

# Restart tunnel
sudo systemctl restart cloudflared
```

## 🛡️ Security Best Practices

1. **Enable 2FA** for all Cloudflare accounts
2. **Use email domain restriction** instead of individual emails when possible
3. **Set up audit logs** to monitor access
4. **Regular security reviews** of access policies
5. **Monitor tunnel health** and set up alerts

## 📊 Monitoring & Troubleshooting

### Common Issues:
- **502 Bad Gateway**: Check if Next.js is running on port 3000
- **403 Access Denied**: Review Zero Trust policies
- **Connection timeout**: Verify tunnel configuration

### Health Check URLs:
- Frontend: `https://church-management.your-domain.com`
- API: `https://church-management.your-domain.com/api/health`
EOL

    echo -e "${GREEN}✅ Cloudflare Zero Trust setup guide created${NC}"
}

# Function to create installation guide
create_installation_guide() {
    echo -e "${YELLOW}⚙️  Creating installation guide...${NC}"
    
    cat > deployment/INSTALLATION.md << 'EOL'
# Church Management - Production Installation Guide

## 📋 Server Requirements
- Ubuntu 20.04+ or CentOS 7+
- Node.js 18+ 
- MySQL 8.0+
- Nginx
- PM2 (Process Manager)
- SSL Certificate (via Cloudflare)

## 🚀 Installation Steps

### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Create Directory Structure
```bash
sudo mkdir -p /var/www/church-management/{frontend,backend,logs}
sudo chown -R $USER:$USER /var/www/church-management
```

### 3. Clone and Setup Backend
```bash
cd /var/www/church-management/backend
git clone https://github.com/your-username/church-management-api.git .

# Install dependencies
npm ci --only=production

# Setup environment
cp .env.example .env
nano .env
```

### 4. Clone and Setup Frontend
```bash
cd /var/www/church-management/frontend
git clone https://github.com/your-username/church-management.git .

# Install dependencies
npm ci --only=production

# Copy production environment
cp .env.production .env.local
```

### 5. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE church_management;
CREATE USER 'church_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON church_management.* TO 'church_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
cd /var/www/church-management/backend
npx prisma migrate deploy
npx prisma generate
```

### 6. Build Applications
```bash
# Build backend
cd /var/www/church-management/backend
npm run build

# Build frontend
cd /var/www/church-management/frontend
npm run build
```

### 7. Configure Nginx
```bash
# Copy configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/church-management

# Enable site
sudo ln -s /etc/nginx/sites-available/church-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Start Applications
```bash
# Copy PM2 configuration
cp deployment/ecosystem.config.js /var/www/church-management/

# Start with PM2
cd /var/www/church-management
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 9. Configure Cloudflare (Optional)
Follow the Cloudflare setup guide in `CLOUDFLARE_SETUP.md`

## 🔧 Configuration Files

### Backend `.env`
```bash
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="mysql://church_user:secure_password@localhost:3306/church_management"

# JWT Secrets
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://church-management.your-domain.com
```

### Frontend `.env.local`
```bash
NODE_ENV=production
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=https://church-management.your-domain.com/api
```

## 🛡️ Security Checklist

- [ ] Change all default passwords
- [ ] Configure firewall (ufw/iptables)
- [ ] Set up SSL certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Regular security updates
- [ ] Database backup automation

## 📊 Maintenance Commands

```bash
# View application logs
pm2 logs

# Restart applications
pm2 restart all

# View system status
pm2 status

# Update applications
cd /var/www/church-management/frontend && git pull && npm run build
cd /var/www/church-management/backend && git pull && npm run build
pm2 restart all
```

## 🆘 Troubleshooting

### Common Issues:
1. **Port 3000/3001 already in use**: Check with `lsof -i :3000`
2. **Database connection failed**: Verify MySQL credentials
3. **Nginx 502 error**: Check if applications are running
4. **Permission denied**: Check file ownership and permissions

### Log Locations:
- Nginx: `/var/log/nginx/`
- PM2: `/var/www/church-management/logs/`
- MySQL: `/var/log/mysql/`
EOL

    echo -e "${GREEN}✅ Installation guide created${NC}"
}

# Main execution
echo -e "${BLUE}Starting deployment setup...${NC}"

create_prod_env
create_pm2_config
create_deployment_scripts
create_nginx_config
create_cloudflare_guide
create_installation_guide

echo ""
echo -e "${GREEN}🎉 Deployment setup completed!${NC}"
echo ""
echo -e "${YELLOW}📁 Created files:${NC}"
echo "   📄 .env.production"
echo "   📁 deployment/"
echo "      ├── ecosystem.config.js"
echo "      ├── build.sh"
echo "      ├── start.sh"
echo "      ├── stop.sh"
echo "      ├── restart.sh"
echo "      ├── nginx.conf"
echo "      ├── CLOUDFLARE_SETUP.md"
echo "      └── INSTALLATION.md"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "   1. Review and customize .env.production"
echo "   2. Follow deployment/INSTALLATION.md for server setup"
echo "   3. Configure Cloudflare Zero Trust (optional)"
echo "   4. Test the deployment"
echo ""
echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
