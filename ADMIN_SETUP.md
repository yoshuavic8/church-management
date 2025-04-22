# Panduan Membuat Admin Baru

Dokumen ini menjelaskan cara membuat admin baru untuk aplikasi Church Management.

## Cara Membuat Admin Baru

Ada dua cara untuk membuat admin baru:

### Metode 1: Menggunakan Halaman Admin Register (Direkomendasikan)

1. **Akses Halaman Admin Register**
   - Buka URL `/auth/admin/register` di browser Anda
   - Halaman ini tidak terhubung dari menu manapun untuk alasan keamanan

2. **Isi Formulir Pendaftaran**
   - Masukkan nama depan dan nama belakang
   - Masukkan alamat email
   - Buat password (minimal 8 karakter)
   - Masukkan kunci rahasia (secret key)
     - Kunci rahasia default adalah `church-management-admin-secret`
     - Untuk keamanan yang lebih baik, ubah kunci rahasia di file `.env.local`

3. **Verifikasi Admin Baru**
   - Setelah berhasil mendaftar, Anda akan diarahkan ke halaman login admin
   - Login dengan email dan password yang baru dibuat
   - Verifikasi bahwa Anda memiliki akses ke semua fitur admin

### Metode 2: Melalui Dashboard Supabase

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
- Pastikan password yang digunakan cukup kuat (minimal 8 karakter)
- Secara berkala periksa daftar admin di tabel members untuk memastikan keamanan
- Jangan membagikan kredensial Supabase dengan orang yang tidak berwenang
- Untuk keamanan yang lebih baik, ubah kunci rahasia (ADMIN_REGISTER_SECRET_KEY) di file `.env.local`
- Halaman admin register tidak terhubung dari menu manapun untuk mencegah akses yang tidak sah

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
