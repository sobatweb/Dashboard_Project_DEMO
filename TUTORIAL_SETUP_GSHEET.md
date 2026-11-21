# 📘 PANDUAN LENGKAP SETUP GOOGLE SHEET & APPS SCRIPT
### SISTEM INFORMASI & DASHBOARD OPERASIONAL PT RADINA ADI NILARAYA (Industry Karoseri)
*(Stok Material Karoseri, General Ledger Kas/Bank BCA, HPP Produksi, SPH, Invoice, RAP Anggaran, Laba/Rugi Accurate, 5 Admin)*

Panduan ini disusun dengan instruksi yang sangat jelas, ramah untuk semua kalangan (termasuk operator senior), agar dashboard terhubung ke Google Sheets gratis sebagai database online tanpa biaya langganan bulanan.

---

## 👥 Struktur 5 Pengguna & Hak Akses
1. **Suhadi** - Direktur Utama *(Owner - Akses Penuh ke Semua Menu & Laba/Rugi)*
2. **Hj. Radina** - Komisaris Utama *(Owner - Akses Penuh ke Semua Menu & Laba/Rugi)*
3. **Ahmad Fauzi** - Staff Gudang *(Staff Inventory - Khusus Stok Barang & Mutasi Material)*
4. **Budi Santoso** - Staff Produksi Karoseri *(Staff HPP - Khusus Kalkulasi HPP Produksi & Stok)*
5. **Maya Kartika** - Staff Administrasi Keuangan *(Staff Invoice - Khusus Surat Penawaran SPH & Cetak Invoice)*

---

## 🚀 Langkah 1: Buat Google Spreadsheet Baru
1. Buka browser Anda dan kunjungi: **[sheets.new](https://sheets.new)**
2. Beri nama spreadsheet di pojok kiri atas: **`Database PT Radina Adi Nilaraya`**.
3. *(Catatan: Anda **TIDAK PERLU** membuat sheet/tab secara manual. Skrip otomatis kita yang akan membuatnya untuk Anda).*

---

## 💻 Langkah 2: Buka Apps Script Editor
1. Pada menu navigasi bagian atas Google Sheets, klik **Ekstensi (Extensions)**.
2. Klik **Apps Script**.
3. Tab baru browser akan terbuka menampilkan editor kode Google dengan file bawaan `Code.gs`.

---

## 📝 Langkah 3: Salin Kode Apps Script
1. Hapus seluruh baris teks bawaan yang ada di kotak `Code.gs`.
2. Buka file **`google-apps-script/Code.gs`** di proyek ini (atau klik tombol *"SALIN SELURUH KODE SKRIP"* di menu Pengaturan API dashboard).
3. Tempel (Paste) seluruh kode tersebut ke editor `Code.gs`.
4. Klik tombol **Simpan (Ikon Disket)** atau tekan `Ctrl + S`.

---

## ⚡ Langkah 4: Jalankan Pembuatan 8 Sheet Otomatis (initSheets)
Skrip telah dilengkapi dengan generator otomatis 8 sheet berformat profesional:
1. Di bagian atas layar editor Apps Script, di sebelah tombol **Debug**, cari dropdown fungsi.
2. Ubah dropdown dari `doGet` menjadi **`initSheets`**.
3. Klik tombol **Jalankan (Run)**.
4. **Memberi Izin Akun Google (Hanya dilakukan 1x di awal):**
   - Muncul jendela *"Perlu Otorisasi"* (Authorization required) &rarr; Klik **Tinjau Izin (Review permissions)**.
   - Pilih akun Google Anda.
   - Jika Google menampilkan tulisan *"Google belum memverifikasi aplikasi ini"* &rarr; Klik **Lanjutan (Advanced)** di pojok kiri bawah.
   - Klik **Buka Untitled project (tidak aman)** / *Go to Untitled project (unsafe)*.
   - Klik tombol biru **Izinkan (Allow)**.
5. Tunggu 3–5 detik hingga log menampilkan tulisan *"Eksekusi selesai"*.
6. Buka kembali Google Spreadsheet Anda, **8 sheet/tab** otomatis terbuat lengkap dengan warna header rapi dan data awal:
   - 📦 `Stok_Barang` (Plat SS 304, Plat Bordes, Hollow Galvanis, Polywood, Vinyl Hospital Grade, Strobo LED, Stretcher Medis, Oksigen)
   - 🔄 `Mutasi_Stok` (Riwayat pengeluaran dan pemasukan barang)
   - 💵 `General_Ledger` (Buku Kas Kecil 1100-00-010, Kas Tunai 1100-00-020, Bank BCA 1200-00-010 an PT Radina Adi Nilaraya)
   - ⚙️ `HPP_Produksi` (Kalkulasi HPP Karoseri Plat, Besi, Komponen Medis, Tukang Las & Finishing)
   - 📑 `Quotations` (SPH No. 63/SPH-RAN/XI/2026 Kepada Pak Gerry - Ambulance Wuling Mitra EV)
   - 🧾 `Invoices` (Faktur Termin DP 50% & Pelunasan Bank BCA 8820917881)
   - 📊 `Anggaran_Realisasi` (RAP Biaya Bahan Baku, Upah Las, Overhead Karoseri & Dokumen SRUT Dishub)
   - 👥 `Admins` (2 Owner & 3 Staff Karoseri)

---

## 🌐 Langkah 5: Terapkan (Deploy) Sebagai Web App
1. Di sudut kanan atas editor Apps Script, klik tombol biru **Deploy (Terapkan)** &gt; pilih **New deployment (Penerapan baru)**.
2. Klik ikon gerigi ⚙️ di samping *"Select type"* &gt; pilih **Web app (Aplikasi Web)**.
3. Atur pengaturannya sebagai berikut:
   - **Description**: `API Karoseri Radina v1`
   - **Execute as (Jalankan sebagai)**: **Me (email Anda)**
   - **Who has access (Siapa yang memiliki akses)**: **Anyone (Siapa saja)** *(Sangat penting dipilih "Anyone" agar browser dashboard bisa mengirim dan membaca data)*.
4. Klik tombol **Deploy**.
5. Salin tautan **Web App URL** yang muncul (formatnya: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Langkah 6: Hubungkan ke Dashboard Web
1. Buka Dashboard Web Anda.
2. Klik menu **Pengaturan API** di sidebar sebelah kiri.
3. Tempelkan Web App URL yang tadi Anda salin ke dalam kotak isian URL.
4. Klik tombol **SIMPAN & TES KONEKSI**.
5. Status koneksi di navbar atas akan berubah menjadi hijau **"Terhubung ke Google Sheet"**. Semua input data langsung tersimpan otomatis ke Google Sheets Anda secara aman dan realtime!

---

### 📞 Rekening & Legalitas Resmi Perusahaan:
- **Nama Perusahaan:** PT RADINA ADI NILARAYA
- **Bidang:** Industry Karoseri
- **Alamat Kantor:** Palmer Avenue No. 16 Jl Palem Merah Raya, Bencongan Kelapa Dua Tangerang
- **Situs:** www.karoseriradina.com | **Email:** radinaadinilaraya21@gmail.com
- **Rekening Pembayaran:** Bank BCA No. Rekening `8820917881` a/n **PT Radina Adi Nilaraya**
- **Direktur Utama:** SUHADI
