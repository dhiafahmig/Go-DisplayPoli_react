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

# Go-DisplayPoli dengan React Frontend

Aplikasi display dan manajemen antrian pasien poli rumah sakit dengan frontend React dan backend Go.

## Panduan Integrasi Backend Go dengan Frontend React

### Endpoints yang Digunakan oleh Frontend

Frontend React membutuhkan beberapa endpoint API berikut:

1. `GET /api/antrian/poli/:kd_ruang_poli` - Mendapatkan daftar antrian pada poli tertentu
2. `POST /api/antrian/panggil` - Memanggil pasien
3. `POST /api/antrian/log` - Mengupdate status pasien (hadir/tidak)
4. `POST /api/antrian/log/reset/:no_rawat` - Mereset status pasien

Berikut adalah implementasi yang dibutuhkan pada file `app/handlers/panggilpoli_handler.go`:

```go
// HandleAntrianPoliAPI menangani permintaan API untuk mendapatkan daftar antrian pada poli tertentu
func (h *PanggilPoliHandler) HandleAntrianPoliAPI(c *gin.Context) {
    kdRuangPoli := c.Param("kd_ruang_poli")

    // Mendapatkan data dari database
    pasienList := h.getPasienList(kdRuangPoli)

    // Mendapatkan informasi poli
    var poliInfo map[string]interface{}
    h.DB.Table("bw_ruangpoli").
        Select("kd_ruang_poli, nama_ruang_poli").
        Where("kd_ruang_poli = ?", kdRuangPoli).
        First(&poliInfo)

    // Mengembalikan response dalam format JSON
    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data": gin.H{
            "poli_info": poliInfo,
            "antrian":   pasienList,
        },
        "message": "Data antrian berhasil diambil",
    })
}

// PanggilPasienAPI adalah API khusus untuk memanggil pasien di antrian
func (h *PanggilPoliHandler) PanggilPasienAPI(c *gin.Context) {
    var input struct {
        NmPasien    string `json:"nm_pasien" binding:"required"`
        KdRuangPoli string `json:"kd_ruang_poli" binding:"required"`
        NmPoli      string `json:"nm_poli" binding:"required"`
        NoReg       string `json:"no_reg" binding:"required"`
        KdDisplay   string `json:"kd_display" binding:"required"`
        NoRawat     string `json:"no_rawat" binding:"omitempty"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "status":  "error",
            "message": "Format data tidak valid: " + err.Error(),
        })
        return
    }

    // Buat pesan untuk dikirim ke websocket
    msg := PanggilPoliMessage{
        NmPasien:    input.NmPasien,
        KdRuangPoli: input.KdRuangPoli,
        NmPoli:      input.NmPoli,
        NoReg:       input.NoReg,
        KdDisplay:   input.KdDisplay,
    }

    // Kirim ke broadcaster jika tersedia
    if h.Broadcaster != nil {
        log.Printf("Mengirim pesan panggil ke broadcaster: %+v", msg)
        h.Broadcaster <- msg
    } else {
        log.Printf("Broadcaster tidak tersedia, tidak bisa mengirim pesan: %+v", msg)
    }

    // Mengembalikan response dalam format JSON
    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data": gin.H{
            "message": msg,
        },
        "message": "Pasien berhasil dipanggil",
    })
}

// HandleLogAPI menangani API untuk mengupdate status log antrian pasien
func (h *PanggilPoliHandler) HandleLogAPI(c *gin.Context) {
    var input struct {
        KdDokter    string `json:"kd_dokter"`
        NoRawat     string `json:"no_rawat" binding:"required"`
        KdRuangPoli string `json:"kd_ruang_poli" binding:"required"`
        Type        string `json:"type" binding:"required"` // 'ada' atau 'tidak'
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "status":  "error",
            "message": "Format data tidak valid: " + err.Error(),
        })
        return
    }

    status := "1" // default: tidak ada
    if input.Type == "ada" {
        status = "0"
    }

    // Update or insert log
    result := h.DB.Exec(`
        INSERT INTO bw_log_antrian_poli (no_rawat, kd_ruang_poli, status)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE kd_ruang_poli = ?, status = ?
    `, input.NoRawat, input.KdRuangPoli, status, input.KdRuangPoli, status)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "status":  "error",
            "message": "Gagal mengupdate status: " + result.Error.Error(),
        })
        return
    }

    // Mengembalikan response dalam format JSON
    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data": gin.H{
            "no_rawat":      input.NoRawat,
            "kd_ruang_poli": input.KdRuangPoli,
            "status":        status,
        },
        "message": "Status pasien berhasil diperbarui",
    })
}

// ResetLogAPI menangani API untuk menghapus log antrian pasien
func (h *PanggilPoliHandler) ResetLogAPI(c *gin.Context) {
    noRawat := c.Param("no_rawat")

    result := h.DB.Table("bw_log_antrian_poli").Where("no_rawat = ?", noRawat).Delete(nil)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "status":  "error",
            "message": "Gagal mereset status: " + result.Error.Error(),
        })
        return
    }

    // Mengembalikan response dalam format JSON
    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data": gin.H{
            "no_rawat": noRawat,
        },
        "message": "Reset log berhasil",
    })
}
```

### Menambahkan Endpoint di main.go

Kemudian, tambahkan endpoint baru di `main.go` untuk mengintegrasikan dengan frontend React:

```go
// API untuk antrian pasien
r.GET("/api/antrian/poli/:kd_ruang_poli", panggilPoliHandler.HandleAntrianPoliAPI)
r.POST("/api/antrian/panggil", panggilPoliHandler.PanggilPasienAPI)
r.POST("/api/antrian/log", panggilPoliHandler.HandleLogAPI)
r.POST("/api/antrian/log/reset/:no_rawat", panggilPoliHandler.ResetLogAPI)
```

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