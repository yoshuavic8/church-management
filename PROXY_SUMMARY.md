# 🔗 Ringkasan Sistem Proxy Frontend-Backend

## 📍 **File Konfigurasi Utama**

### 1. **next.config.js** - Proxy Configuration
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',              // Request dari frontend
      destination: 'http://192.168.18.143:3001/api/:path*', // Diteruskan ke backend
    },
  ]
}
```

### 2. **app/lib/api-client.ts** - Smart URL Detection  
```typescript
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    // Server-side: gunakan full URL
    return process.env.API_URL || "http://localhost:3001";
  } else {
    // Client-side: gunakan proxy (path kosong)
    return "";
  }
};
```

### 3. **.env.local** - Environment Variables
```bash
# Untuk proxy rewrites (development)
API_URL=http://192.168.18.143:3001

# Untuk production
API_URL=http://localhost:3001
```

## 🔄 **Cara Kerja Proxy**

### Development (Sekarang):
```
Browser → localhost:3000/api/members 
       → next.config.js proxy 
       → http://192.168.18.143:3001/api/members
       → Response kembali ke browser
```

### Production (Deployment):
```
Internet → Cloudflare Zero Trust → Server:3000 
       → next.config.js proxy → localhost:3001
       → MySQL localhost:3306 → Response chain
```

## 🚀 **Deployment dengan Appanel + Cloudflare**

### Struktur Server:
```
/var/www/church-management/
├── frontend/     # Next.js (port 3000, public)
├── backend/      # Node.js (port 3001, internal only)
└── deployment/   # Configuration files
```

### Keamanan:
- **Layer 1**: Cloudflare Zero Trust (authentication)
- **Layer 2**: Server firewall (hanya port 80/443 terbuka)  
- **Layer 3**: Application security (CORS, JWT)

## 📋 **File yang Sudah Dibuat**

✅ **PROXY_CONFIGURATION.md** - Dokumentasi lengkap
✅ **PROXY_ARCHITECTURE.md** - Diagram dan arsitektur
✅ **deployment/setup.sh** - Script setup otomatis
✅ **.env.production** - Environment production
✅ **deployment/ecosystem.config.js** - PM2 configuration
✅ **deployment/nginx.conf** - Nginx configuration
✅ **deployment/CLOUDFLARE_SETUP.md** - Panduan Cloudflare
✅ **deployment/INSTALLATION.md** - Panduan instalasi lengkap

## 🔧 **Konfigurasi Key Points**

1. **Development**: Frontend proxy ke backend via local IP
2. **Production**: Frontend proxy ke backend via localhost (internal)
3. **External Access**: Melalui Cloudflare Zero Trust
4. **Database**: Selalu internal, tidak exposed keluar
5. **SSL**: Ditangani Cloudflare, internal bisa HTTP

## 🛡️ **Keuntungan Arsitektur Ini**

✅ **Single Domain** - Tidak ada CORS issues
✅ **Secure** - Backend tidak exposed ke internet
✅ **Fast** - Internal routing untuk backend calls
✅ **Scalable** - Mudah untuk horizontal scaling
✅ **Maintainable** - Konfigurasi terpusat dan terorganisir

## 🎯 **untuk Deployment:**

1. **Upload project** ke server Appanel
2. **Install dependencies** (Node.js, MySQL, Nginx)
3. **Run deployment script**: `./deployment/setup.sh`
4. **Configure Cloudflare** sesuai panduan
5. **Start applications**: `pm2 start ecosystem.config.js`

Sistem ini memastikan komunikasi yang aman dan efisien antara frontend dan backend, baik untuk development maupun production! 🚀
