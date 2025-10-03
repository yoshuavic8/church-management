# Diagram Arsitektur Proxy System

## 📊 Development Architecture (Saat Ini)

```
┌─────────────────┐    Proxy Request     ┌─────────────────┐
│   Frontend      │ ────────────────────>│   Backend       │
│   Next.js       │  /api/* -> :3001/api │   Node.js       │
│   Port: 3000    │<──────────────────── │   Port: 3001    │
│                 │    JSON Response     │                 │
└─────────────────┘                      └─────────────────┘
        │                                        │
        │                                        │
        ▼                                        ▼
┌─────────────────┐                      ┌─────────────────┐
│   Browser       │                      │   MySQL DB      │
│   192.168.x.x   │                      │   Port: 3306    │
└─────────────────┘                      └─────────────────┘
```

## 🌐 Production Architecture (Deployment Plan)

```
┌─────────────────────────────────────────────────────────┐
│                 Cloudflare Zero Trust                   │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Public Internet                        ││
│  │  https://church-management.your-domain.com          ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────┬───────────────────────────────────┘
                      │ Secure Tunnel
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Server (Appanel)                       │
│  ┌─────────────────┐    Internal Proxy  ┌─────────────┐│
│  │   Frontend      │ ─────────────────> │   Backend   ││
│  │   Next.js       │  localhost:3001    │   Node.js   ││
│  │   Port: 3000    │ <───────────────── │   Port: 3001││
│  └─────────────────┘                    └─────────────┘│
│         │                                       │      │
│         │ Static Files                          │      │
│         ▼                                       ▼      │
│  ┌─────────────────┐                    ┌─────────────┐│
│  │   File System   │                    │   MySQL DB  ││
│  │   /var/www/     │                    │   Port: 3306││
│  └─────────────────┘                    └─────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Detail

### Development Flow:
```
1. Browser Request:
   GET https://192.168.18.143:3000/api/members
   
2. Next.js Proxy (next.config.js):
   source: '/api/:path*'
   destination: 'http://192.168.18.143:3001/api/:path*'
   
3. Backend Processing:
   Express.js handles GET /api/members
   
4. Database Query:
   Prisma → MySQL (localhost:3306)
   
5. Response Chain:
   MySQL → Backend → Proxy → Frontend → Browser
```

### Production Flow:
```
1. External Request:
   GET https://church-management.your-domain.com/api/members
   
2. Cloudflare Zero Trust:
   Authentication & Authorization Check
   
3. Tunnel to Server:
   Cloudflare → Server:3000 (Next.js)
   
4. Internal Proxy:
   Next.js → localhost:3001 (Backend)
   
5. Database Query:
   Backend → localhost:3306 (MySQL)
   
6. Response Chain:
   MySQL → Backend → Next.js → Cloudflare → User
```

## 🔧 Configuration Files Overview

```
churchManagement/
├── next.config.js          # 🔀 Proxy configuration
├── .env.local             # 🌐 Environment variables
├── app/lib/api-client.ts  # 🔌 API client logic
├── middleware.ts          # 🛡️ CORS & security
└── PROXY_CONFIGURATION.md # 📖 This documentation

church-management-api/
├── src/index.ts          # 🚀 Express server
├── src/config/          # ⚙️  Configuration files
└── .env                 # 🔐 Backend environment
```

## 🚦 Network Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Cloudflare Zero Trust                        │
│  - Authentication required                              │
│  - DDoS protection                                      │
│  - SSL/TLS termination                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│  Layer 2: Server Firewall (Appanel)                    │
│  - Only port 80/443 exposed                            │
│  - Internal ports (3001, 3306) blocked from outside    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│  Layer 3: Application Security                         │
│  - CORS configuration                                   │
│  - JWT authentication                                   │
│  - Rate limiting                                        │
└─────────────────────────────────────────────────────────┘
```

## 📈 Performance Optimization

### Current Setup Benefits:
- ✅ Single domain for frontend/backend
- ✅ No CORS issues in production
- ✅ Reduced latency (internal routing)
- ✅ Simplified SSL management

### Production Benefits:
- ✅ CDN caching for static assets
- ✅ Zero Trust security
- ✅ Automatic failover
- ✅ Geographic load balancing
