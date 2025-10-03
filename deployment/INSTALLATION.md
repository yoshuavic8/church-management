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
