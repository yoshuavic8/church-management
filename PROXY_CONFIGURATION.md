# Konfigurasi Proxy Frontend - Backend

## 📋 Overview
Sistem ini menggunakan proxy configuration untuk menghubungkan Next.js Frontend (port 3000) dengan Node.js Backend API (port 3001).

## 🔧 File Konfigurasi

### 1. Next.js Proxy Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configs
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ]
  },
}
```

**Penjelasan:**
- Semua request dari frontend ke `/api/*` akan di-proxy ke backend
- Menggunakan environment variable `API_URL` untuk flexibility
- Default fallback ke `http://localhost:3001`

### 2. API Client Configuration (`app/lib/api-client.ts`)
```typescript
const getApiBaseUrl = () => {
  // Check if we're running on the server (Node.js) or client (browser)
  if (typeof window === "undefined") {
    // Server-side: use full URL to connect to API
    return process.env.API_URL || "http://localhost:3001";
  } else {
    // Client-side: use proxy path
    return "";
  }
};
```

**Penjelasan:**
- **Server-side rendering (SSR)**: Gunakan full URL untuk koneksi langsung
- **Client-side**: Gunakan path kosong agar menggunakan proxy dari next.config.js
- Otomatis mendeteksi environment (browser vs server)

### 3. Environment Variables (`.env.local`)
```bash
# Next.js API Proxy Configuration
API_URL=http://192.168.18.143:3001

# Public API URL untuk client-side reference
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🌐 Flow Request

### Development Environment (Saat ini)
```
Frontend (3000) -> Proxy -> Backend (3001)
```

1. **Client Browser Request:**
   ```
   GET /api/members
   ↓ (Next.js proxy)
   GET http://192.168.18.143:3001/api/members
   ```

2. **Server-side Request:**
   ```
   Direct connection: http://192.168.18.143:3001/api/members
   ```

## 🚀 Deployment dengan Appanel & Cloudflare Zero Trust

### Struktur Deployment yang Disarankan:

#### 1. Server Setup
```
Server Local (Appanel):
├── Frontend (Next.js) - Port 3000 atau domain/subdomain
├── Backend (Node.js) - Port 3001 (internal only)
└── Database (MySQL) - Port 3306 (internal only)
```

#### 2. Cloudflare Zero Trust Configuration
```
Internet -> Cloudflare Zero Trust -> Frontend (Next.js)
                                   └-> Backend (via proxy internal)
```

#### 3. Production Environment Variables

Buat file `.env.production`:
```bash
# Production API URL - gunakan localhost karena backend internal
API_URL=http://localhost:3001

# Public URLs untuk Cloudflare Zero Trust
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com

# Database Production Config
DATABASE_URL="mysql://user:password@localhost:3306/church_management"
```

#### 4. Appanel Configuration

**Frontend (Next.js):**
- Domain: `https://church-management.your-domain.com`
- Port: 3000
- SSL: Enable (Cloudflare akan handle)
- Proxy ke backend tetap menggunakan localhost:3001

**Backend (Node.js):**
- Port: 3001 (internal only, tidak perlu domain publik)
- Hanya accessible dari localhost/frontend

#### 5. Cloudflare Zero Trust Setup

1. **Application Configuration:**
   ```
   Application Name: Church Management
   Application Domain: church-management.your-domain.com
   Type: Self-hosted
   ```

2. **Policy Configuration:**
   ```
   Action: Allow
   Rules: 
   - Email domain: @your-church.com
   - IP range: Your office/allowed IPs
   ```

3. **Internal Network Access:**
   ```
   Frontend -> Backend: localhost:3001 (internal)
   External -> Frontend: via Cloudflare tunnel
   ```

## 📁 File Structure untuk Deploy
```
/var/www/church-management/
├── frontend/              # Next.js app
│   ├── .next/
│   ├── node_modules/
│   ├── .env.production
│   └── package.json
├── backend/               # Node.js API
│   ├── dist/
│   ├── node_modules/
│   ├── .env
│   └── package.json
└── scripts/
    ├── start-frontend.sh
    ├── start-backend.sh
    └── deploy.sh
```

## 🔐 Security Configuration

### 1. Backend CORS Settings
```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',           // Development
    'https://your-domain.com',         // Production via Cloudflare
  ],
  credentials: true
}));
```

### 2. Next.js Security Headers
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ],
      },
    ]
  },
}
```

## 🛠️ Deployment Scripts

### Start Backend Script (`scripts/start-backend.sh`)
```bash
#!/bin/bash
cd /var/www/church-management/backend
npm run build
npm start
```

### Start Frontend Script (`scripts/start-frontend.sh`)
```bash
#!/bin/bash
cd /var/www/church-management/frontend
npm run build
npm start
```

### PM2 Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: 'church-frontend',
      cwd: '/var/www/church-management/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'church-backend',
      cwd: '/var/www/church-management/backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

## 🔍 Testing Proxy

### Development Test:
```bash
# Test direct backend
curl http://192.168.18.143:3001/api/auth/health

# Test via proxy
curl http://localhost:3000/api/auth/health
```

### Production Test:
```bash
# Test via Cloudflare
curl https://your-domain.com/api/auth/health

# Test internal (from server)
curl http://localhost:3000/api/auth/health
curl http://localhost:3001/api/auth/health
```

## 📝 Summary

1. **Development**: Frontend proxy ke backend menggunakan local IP
2. **Production**: Frontend proxy ke backend localhost (internal)
3. **External Access**: Melalui Cloudflare Zero Trust untuk security
4. **Database**: Tetap internal, hanya accessible dari backend
5. **SSL**: Ditangani oleh Cloudflare, internal connection bisa HTTP

Konfigurasi ini memastikan:
- ✅ Security dengan Zero Trust
- ✅ Performance dengan internal routing
- ✅ Scalability untuk future growth
- ✅ Easy maintenance dan monitoring
