# Display Poli React App

Ini adalah aplikasi React untuk menampilkan antrian poli Rumah Sakit Bumi Waras. Aplikasi ini dibuat menggunakan React dan Tailwind CSS.

## Persyaratan

- Node.js 14.0.0 atau lebih baru
- npm atau yarn

## Cara Menginstall

1. Pastikan backend Go-DisplayPoli sudah berjalan di port 8080
2. Masuk ke direktori react-app
   ```
   cd Go-DisplayPoli/react-app
   ```
3. Install semua dependensi
   ```
   npm install
   ```
   atau jika menggunakan yarn:
   ```
   yarn install
   ```

## Cara Menjalankan (Development Mode)

1. Pastikan backend Go sudah berjalan:
   ```
   cd Go-DisplayPoli
   go run main.go
   ```

2. Jalankan aplikasi React dalam mode development (dalam terminal terpisah):
   ```
   cd Go-DisplayPoli/react-app
   npm start
   ```

3. Buka browser dan akses `http://localhost:3000/display/{kode_display}` di mana `{kode_display}` adalah kode display yang telah dikonfigurasi

## Mengatasi Masalah WebSocket

Jika terjadi masalah dengan WebSocket, coba langkah-langkah berikut:

1. Pastikan backend Go berjalan di port 8080
2. Periksa log console di browser untuk melihat pesan error spesifik
3. Pastikan tidak ada proxy atau firewall yang memblokir koneksi WebSocket
4. Untuk pengembangan lokal, gunakan Chrome karena beberapa browser memiliki batasan keamanan yang lebih ketat

Aplikasi sudah dirancang dengan fallback polling jika WebSocket gagal, sehingga data masih akan diperbarui secara berkala.

## Cara Build untuk Production

1. Build aplikasi React
   ```
   npm run build
   ```
   atau jika menggunakan yarn:
   ```
   yarn build
   ```
2. Folder `build` akan dibuat dengan file statis yang siap di-deploy

## Integrasi dengan Backend Go

Backend Go akan secara otomatis menyajikan aplikasi React jika Anda mengikuti langkah-langkah berikut:

1. Build aplikasi React seperti di atas
2. Pastikan folder `build` ada di dalam folder `react-app`
3. Backend Go akan menyajikan aplikasi React melalui endpoint yang tidak ada di backend (NoRoute)

## Integrasi WebSocket

Aplikasi ini menggunakan WebSocket untuk menerima pembaruan data antrian secara real-time. Pastikan backend Go berjalan dan WebSocket endpoint tersedia di `/ws/{kode_display}`.

Jika konfigurasi server tidak mengizinkan WebSocket, aplikasi akan otomatis beralih ke mode polling untuk tetap mendapatkan pembaruan data.

## Memodifikasi Tampilan

Tampilan aplikasi dapat dimodifikasi dengan mengedit file-file komponen di folder `src/components`. Styling menggunakan Tailwind CSS dan CSS kustom yang didefinisikan di `src/index.css`. 