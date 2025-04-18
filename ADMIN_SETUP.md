# Panduan Membuat Admin Baru

Dokumen ini menjelaskan cara membuat admin baru untuk aplikasi Church Management melalui dashboard Supabase.

## Langkah-langkah Membuat Admin Baru

1. **Login ke Dashboard Supabase**
   - Buka [Supabase Dashboard](https://app.supabase.com)
   - Pilih project Church Management Anda

2. **Buat User Baru di Authentication**
   - Navigasi ke menu **Authentication** > **Users**
   - Klik tombol **Add User**
   - Isi email dan password untuk admin baru
   - Klik **Create User**

3. **Verifikasi User Terdaftar di Tabel Members**
   - Navigasi ke menu **Table Editor**
   - Pilih tabel **members**
   - Periksa apakah user baru sudah terdaftar dengan ID yang sama dengan user di Authentication
   - Jika belum terdaftar, lanjutkan ke langkah 4

4. **Tambahkan Record di Tabel Members (jika diperlukan)**
   - Jika user tidak otomatis terdaftar di tabel members, tambahkan secara manual
   - Klik tombol **Insert Row**
   - Isi kolom-kolom berikut:
     - **id**: Salin ID user dari tabel Authentication
     - **email**: Email admin
     - **first_name**: Nama depan admin
     - **last_name**: Nama belakang admin
     - **role**: "admin"
     - **role_level**: 4
     - **status**: "active"
   - Klik **Save**

5. **Verifikasi Admin Baru**
   - Logout dari aplikasi (jika sedang login)
   - Login dengan email dan password admin baru
   - Verifikasi bahwa admin memiliki akses ke semua fitur admin

## Catatan Keamanan

- Hanya berikan akses admin kepada orang yang terpercaya
- Pastikan password yang digunakan cukup kuat
- Secara berkala periksa daftar admin di tabel members untuk memastikan keamanan
- Jangan membagikan kredensial Supabase dengan orang yang tidak berwenang

## Troubleshooting

Jika admin baru tidak dapat login atau tidak memiliki akses admin yang seharusnya:

1. **Periksa Record di Tabel Members**
   - Pastikan kolom **role** diatur ke "admin"
   - Pastikan kolom **role_level** diatur ke 4
   - Pastikan kolom **status** diatur ke "active"

2. **Periksa ID User**
   - Pastikan ID di tabel members sama persis dengan ID di Authentication

3. **Reset Password Jika Diperlukan**
   - Di Supabase Dashboard, navigasi ke Authentication > Users
   - Temukan user yang bermasalah
   - Klik pada menu tiga titik (...) dan pilih "Send password recovery email"
