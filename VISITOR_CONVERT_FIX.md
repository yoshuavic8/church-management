# Fix: Convert Visitor to Member - Invalid Token Issue

## 🐛 **Masalah yang Ditemukan**

Ketika mencoba menggunakan fitur "Convert Visitor to Member" di cell group attendance, terjadi error **"invalid token"** meskipun project seharusnya sudah menggunakan token management dengan interceptor.

## 🔍 **Root Cause Analysis**

1. **Token Key Inconsistency**: 
   - Function `handleConvertVisitor` mencari token dengan key `'token'` di localStorage
   - Padahal ApiClient dan AuthContext menggunakan `'access_token'`
   - Code: `localStorage.getItem('token')` ❌ vs `localStorage.getItem('access_token')` ✅

2. **Missing API Interceptor Usage**:
   - Function menggunakan raw `fetch()` API call
   - Tidak memanfaatkan `ApiClient` yang sudah ada dengan automatic token refresh
   - Kehilangan benefit dari token management yang sudah diimplementasi

3. **Admin Privilege Requirement**:
   - Backend endpoint `/attendance/visitors/:id/convert-to-member` requires admin access
   - Route protected dengan `authenticateToken` + `requireAdmin`
   - User harus memiliki role admin atau role_level >= 4

## 🛠️ **Solusi yang Diterapkan**

### 1. Menambahkan Method di ApiClient
```typescript
// Di /app/lib/api-client.ts
async convertVisitorToMember(
  visitorId: string,
  data: ConvertVisitorData
): Promise<ApiResponse<{ message: string; member: any }>> {
  return this.request(`/attendance/visitors/${visitorId}/convert-to-member`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

### 2. Memperbaiki handleConvertVisitor Function
```typescript
// Di /app/attendance/[id]/page.tsx
const handleConvertVisitor = async (data: ConvertVisitorData) => {
  // Check admin privileges
  if (user.role !== 'admin' && (user.role_level || 0) < 4) {
    throw new Error('Admin privileges required to convert visitor to member.');
  }

  // Use ApiClient dengan automatic token management
  const response = await apiClient.convertVisitorToMember(selectedVisitor.id, data);
  
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to convert visitor');
  }
  
  // Update UI state...
};
```

### 3. Benefits dari Perubahan
- ✅ **Automatic Token Management**: Menggunakan ApiClient dengan auto refresh
- ✅ **Consistent Token Handling**: Menggunakan `access_token` yang benar
- ✅ **Better Error Handling**: Proper error messages dan privilege checking
- ✅ **Maintainable Code**: Centralized API management

## 🧪 **Testing**

Untuk memverifikasi fix:
1. Login sebagai user dengan admin privileges
2. Buka attendance meeting yang memiliki visitors
3. Coba convert visitor to member
4. Check console logs untuk debugging info

## 📋 **Checklist**

- [x] Fix token key inconsistency
- [x] Use ApiClient instead of raw fetch
- [x] Add admin privilege checking
- [x] Add proper error handling
- [x] Add logging for debugging
- [x] Update type safety with non-null assertion

## ⚠️ **Notes**

- User harus login sebagai admin untuk menggunakan fitur ini
- Token akan otomatis di-refresh jika expired berkat ApiClient
- Console logs ditambahkan untuk memudahkan debugging future issues
