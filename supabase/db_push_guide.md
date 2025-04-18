# Panduan Menerapkan Perubahan Database dengan Supabase CLI

Dokumen ini menjelaskan cara menerapkan perubahan database ke Supabase menggunakan Supabase CLI.

## Prasyarat

1. Pastikan Supabase CLI sudah terinstal:
   ```
   npm install -g supabase
   ```

2. Pastikan Anda sudah login ke Supabase:
   ```
   supabase login
   ```

## Langkah-langkah Menerapkan Perubahan

1. **Inisialisasi Supabase CLI** (jika belum dilakukan):
   ```
   supabase init
   ```

2. **Link Proyek Lokal dengan Proyek Supabase**:
   ```
   supabase link --project-ref ausqiboqioiwwqtqemzh
   ```
   Ganti `ausqiboqioiwwqtqemzh` dengan ID proyek Supabase Anda.

3. **Push Perubahan Database**:
   ```
   supabase db push
   ```
   Perintah ini akan menerapkan semua migrasi yang belum diterapkan ke database Supabase.

## Mengatasi Masalah

Jika Anda mengalami masalah saat menerapkan migrasi, coba langkah-langkah berikut:

1. **Reset Database** (gunakan dengan hati-hati, ini akan menghapus semua data):
   ```
   supabase db reset
   ```

2. **Terapkan Migrasi Secara Manual**:
   - Buka Supabase Dashboard
   - Buka SQL Editor
   - Salin dan tempel isi file `migrations/20250502000000_add_cell_group_relations.sql`
   - Jalankan query

## Verifikasi Perubahan

Setelah menerapkan perubahan, verifikasi bahwa tabel-tabel baru telah dibuat:

1. Buka Supabase Dashboard
2. Buka Table Editor
3. Pastikan tabel-tabel berikut ada:
   - `cell_group_members`
   - `cell_group_leaders`

## Langkah Selanjutnya

Setelah menerapkan perubahan database, restart aplikasi untuk memastikan perubahan diterapkan dengan benar:

```
npm run dev
```
