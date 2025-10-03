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
