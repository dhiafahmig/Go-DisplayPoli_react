# Display Poli - Frontend React

Frontend sistem informasi Display Poli Rumah Sakit Bumi Waras menggunakan React.js dan Tailwind CSS.

## Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan sistem Anda memiliki:

- Node.js versi 14.0.0 atau lebih tinggi
- npm versi 6.0.0 atau lebih tinggi
- Backend Go-DisplayPoli sudah berjalan di port 8080

## Fitur Utama

- 🏥 Manajemen Jadwal Dokter
  - Tambah, edit, dan hapus jadwal dokter
  - Filter jadwal berdasarkan hari
  - Tampilan jadwal yang informatif

- 🏢 Pengaturan Poli
  - Manajemen data poli
  - Informasi detail setiap poli
  - Integrasi dengan sistem antrian

## Cara Instalasi & Menjalankan

1. Clone repository:
   ```bash
   git clone [url-repository]
   cd Go-DisplayPoli_react
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan aplikasi:
   - Pastikan backend Go sudah berjalan di port 8080
   - Jalankan frontend:
     ```bash
     npm start
     ```
   - Aplikasi akan berjalan di http://localhost:3000

4. Build untuk production:
   ```bash
   npm run build
   ```
## Pengembangan

- Backend menggunakan Go: [Go-DisplayPoli](https://github.com/dhiafahmig/Go-DisplayPoli)
- Frontend menggunakan React dan Tailwind CSS
- WebSocket untuk update real-time antrian
- Integrasi dengan BPJS kesehatan

## Lisensi

[MIT](LICENSE) © Dhia Fahmi G

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

## Memodifikasi Tampilan

Tampilan aplikasi dapat dimodifikasi dengan mengedit file-file komponen di folder `src/components`. Styling menggunakan Tailwind CSS dan CSS kustom yang didefinisikan di `src/index.css`.

# Go-DisplayPoli dengan React Frontend

Aplikasi display dan manajemen antrian pasien poli rumah sakit dengan frontend React dan backend Go.

## Fitur

- Tampilan daftar poli dengan antrian pasien
- Panggilan pasien dengan notifikasi audio
- Update status kehadiran pasien (hadir/tidak hadir)
- WebSocket untuk pembaruan real-time
- Dukungan untuk API lama sebagai fallback jika diperlukan

## Integrasi

- Frontend React: Mengelola UI dan interaksi pengguna
- Backend Go: Mengakses database dan menyediakan API
- WebSocket: Komunikasi real-time untuk pembaruan antrian

## Keuntungan Pendekatan Ini

1. **Lebih Modular**: Frontend dan backend terpisah, memudahkan pengembangan masing-masing
2. **Responsif**: Antarmuka pengguna yang lebih cepat dan reaktif
3. **Kompatibilitas**: Mendukung penggunaan dengan backend lama tanpa perubahan signifikan
4. **Tampilan Modern**: UI yang lebih modern dan mudah digunakan dengan React dan Tailwind 