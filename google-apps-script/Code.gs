/**
 * GOOGLE APPS SCRIPT - BACKEND API UNTUK DASHBOARD BENGKEL & KAROSERI
 * PT RADINA ADI NILARAYA (Industry Karoseri)
 * 
 * 8 Sheets Terpadu:
 * 1. Stok_Barang (Material Plat, Besi, Interior & Alat Medis Ambulance)
 * 2. Mutasi_Stok (Riwayat Masuk & Pemakaian Material Produksi)
 * 3. General_Ledger (Buku Kas & Bank BCA 8820917881)
 * 4. HPP_Produksi (Kalkulasi HPP Karoseri Plat, Besi, Medis, Upah & Overhead)
 * 5. Quotations (Surat Penawaran Harga - SPH Karoseri)
 * 6. Invoices (Faktur Penagihan DP & Pelunasan)
 * 7. Anggaran_Realisasi (RAP vs Realisasi Pengendalian Biaya)
 * 8. Admins (2 User Owner + 3 User Staff)
 */

// Helper: Response JSON dengan header CORS
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET Request Handler
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Auto Inisialisasi jika diminta via ?action=init
    if (action === 'init') {
      const initResult = initSheets();
      return createJsonResponse({ status: 'success', message: 'Inisialisasi berhasil!', data: initResult });
    }

    if (action === 'ping') {
      return createJsonResponse({ status: 'success', message: 'Google Apps Script API PT RADINA ADI NILARAYA Aktif & Terhubung!', timestamp: new Date() });
    }

    if (action === 'getAll') {
      const result = {
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          stok: getSheetData(ss, 'Stok_Barang'),
          mutasiStok: getSheetData(ss, 'Mutasi_Stok'),
          generalLedger: getSheetData(ss, 'General_Ledger'),
          hppProduksi: getSheetData(ss, 'HPP_Produksi'),
          quotations: getSheetData(ss, 'Quotations'),
          invoices: getSheetData(ss, 'Invoices'),
          anggaranRealisasi: getSheetData(ss, 'Anggaran_Realisasi'),
          admins: getSheetData(ss, 'Admins')
        }
      };
      return createJsonResponse(result);
    }

    if (action === 'getStok') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'Stok_Barang') });
    if (action === 'getLedger') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'General_Ledger') });
    if (action === 'getHPP') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'HPP_Produksi') });
    if (action === 'getQuotations') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'Quotations') });
    if (action === 'getInvoices') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'Invoices') });
    if (action === 'getAnggaran') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'Anggaran_Realisasi') });
    if (action === 'getAdmins') return createJsonResponse({ status: 'success', data: getSheetData(ss, 'Admins') });

    // Fallback: Simpan via GET jika diperlukan (menghindari limitasi CORS pada POST di browser tertentu)
    if (action === 'saveViaGet' && e.parameter.payload) {
      const payload = JSON.parse(decodeURIComponent(e.parameter.payload));
      return handlePostPayload(ss, payload);
    }

    return createJsonResponse({ status: 'error', message: 'Aksi tidak dikenal: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// POST Request Handler
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    return handlePostPayload(ss, payload);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// Pusat Pemrosesan Simpan Data
function handlePostPayload(ss, payload) {
  const type = payload.type;
  const data = payload.data;

  if (!type || !data) {
    return createJsonResponse({ status: 'error', message: 'Tipe dan data harus diisi' });
  }

  let sheetName = '';
  let idColIndex = 0; // Kolom 0 adalah ID/Kode unik
  let keyField = '';

  switch (type) {
    case 'stok':
      sheetName = 'Stok_Barang';
      keyField = 'kode_barang';
      break;
    case 'mutasiStok':
      sheetName = 'Mutasi_Stok';
      keyField = 'id';
      // Otomatis update angka stok_masuk/terpakai/sisa_barang di sheet Stok_Barang
      updateStokFromMutasi(ss, data);
      break;
    case 'generalLedger':
      sheetName = 'General_Ledger';
      keyField = 'id_transaksi';
      break;
    case 'hppProduksi':
      sheetName = 'HPP_Produksi';
      keyField = 'id_proyek';
      break;
    case 'quotations':
      sheetName = 'Quotations';
      keyField = 'nomor_quote';
      break;
    case 'invoices':
      sheetName = 'Invoices';
      keyField = 'nomor_inv';
      break;
    case 'anggaranRealisasi':
      sheetName = 'Anggaran_Realisasi';
      keyField = 'kode_anggaran';
      break;
    case 'admins':
      sheetName = 'Admins';
      keyField = 'id';
      break;
    default:
      return createJsonResponse({ status: 'error', message: 'Tipe sheet tidak valid: ' + type });
  }

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return createJsonResponse({ status: 'error', message: 'Sheet tidak ditemukan: ' + sheetName });
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const keyValue = String(data[keyField] || '').trim();

  // Cari apakah baris sudah ada (update) atau baru (insert)
  let rowIndex = -1;
  const lastRow = sheet.getLastRow();
  if (lastRow > 1 && keyValue) {
    const idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim() === keyValue) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  // Siapkan data baris berdasarkan urutan header
  const rowData = headers.map(header => {
    let val = data[header];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return createJsonResponse({
    status: 'success',
    message: 'Data berhasil disimpan!',
    action: rowIndex > 0 ? 'update' : 'insert',
    key: keyValue
  });
}

// Otomatis sinkronisasi angka Stok Masuk, Terpakai, dan Sisa
function updateStokFromMutasi(ss, mutasi) {
  const stokSheet = ss.getSheetByName('Stok_Barang');
  if (!stokSheet) return;

  const kode = mutasi.kode_barang;
  const jumlah = Number(mutasi.jumlah) || 0;
  const jenis = (mutasi.jenis_mutasi || '').toLowerCase();

  const lastRow = stokSheet.getLastRow();
  if (lastRow < 2) return;

  const data = stokSheet.getRange(2, 1, lastRow - 1, 11).getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(kode).trim()) {
      let masuk = Number(data[i][5]) || 0;
      let terpakai = Number(data[i][6]) || 0;

      if (jenis === 'masuk') {
        masuk += jumlah;
      } else if (jenis === 'terpakai' || jenis === 'keluar') {
        terpakai += jumlah;
      }

      let sisa = masuk - terpakai;
      let statusStok = sisa <= 5 ? 'Kritis' : (sisa <= 15 ? 'Menipis' : 'Aman');

      const targetRow = i + 2;
      stokSheet.getRange(targetRow, 6).setValue(masuk);
      stokSheet.getRange(targetRow, 7).setValue(terpakai);
      stokSheet.getRange(targetRow, 8).setValue(sisa);
      stokSheet.getRange(targetRow, 11).setValue(statusStok);
      stokSheet.getRange(targetRow, 12).setValue(new Date().toISOString());
      break;
    }
  }
}

// Fungsi Helper Membaca Sheet menjadi Array of Objects
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const items = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0] && !row[1]) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      let cell = row[idx];
      if (typeof cell === 'string' && (cell.startsWith('{') || cell.startsWith('['))) {
        try { cell = JSON.parse(cell); } catch(e) {}
      }
      obj[header] = cell;
    });
    items.push(obj);
  }
  return items;
}

/**
 * FUNGSI INISIALISASI OTOMATIS:
 * Jalankan fungsi ini 1x di Editor Apps Script untuk membuat semua 8 tab & data awal Karoseri PT Radina Adi Nilaraya!
 */
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. STOK BARANG KAROSERI
  setupSheet(ss, 'Stok_Barang', [
    'kode_barang', 'nama_barang', 'kategori', 'spesifikasi', 'satuan',
    'stok_masuk', 'terpakai', 'sisa_barang', 'harga_satuan', 'lokasi_gudang', 'status_stok', 'updated_at'
  ], [
    ['PLT-001', 'Plat Stainless Steel 304', 'Plat Karoseri', '1.2 x 2.4 m x 1.5 mm (Anti Karat)', 'Lembar', 25, 8, 17, 1850000, 'Gudang Plat A', 'Aman', new Date().toISOString()],
    ['PLT-002', 'Plat Bordes Aluminium', 'Plat Karoseri', '1.2 x 2.4 m x 3.0 mm (Lantai Pijakan)', 'Lembar', 20, 14, 6, 1250000, 'Gudang Plat B', 'Menipis', new Date().toISOString()],
    ['PLT-003', 'Plat Hitam SPHC Karoseri', 'Plat Karoseri', '1.2 x 2.4 m x 2.0 mm (Dinding/Lantai)', 'Lembar', 40, 15, 25, 650000, 'Gudang Plat A', 'Aman', new Date().toISOString()],
    ['BSI-001', 'Besi Hollow Galvanis 40x40', 'Besi Rangka', '40 x 40 x 1.8 mm (Panjang 6m)', 'Batang', 100, 35, 65, 145000, 'Rak Besi Rangka 1', 'Aman', new Date().toISOString()],
    ['BSI-002', 'Besi Hollow Galvanis 40x80', 'Besi Rangka', '40 x 80 x 2.0 mm (Panjang 6m)', 'Batang', 60, 42, 18, 275000, 'Rak Besi Rangka 2', 'Aman', new Date().toISOString()],
    ['INT-001', 'Polywood Karoseri 15mm', 'Interior & Lantai', 'Ketebalan 15mm dilapisi pelindung', 'Lembar', 30, 12, 18, 320000, 'Rak Kayu & Interior', 'Aman', new Date().toISOString()],
    ['INT-002', 'Vinyl Lantai Hospital Grade', 'Interior & Lantai', 'Anti Bakteri, Anti Slip & Tahan Kimia', 'm2', 80, 25, 55, 180000, 'Gudang Bahan Interior', 'Aman', new Date().toISOString()],
    ['MED-001', 'Rotary Lightbar Strobo LED', 'Alat Ambulance', 'LED Merah-Biru + Sirine Multisuara & Mic', 'Set', 10, 3, 7, 6500000, 'Gudang Alat Medis', 'Aman', new Date().toISOString()],
    ['MED-002', 'Roll-in Patient Stretcher SS', 'Alat Ambulance', 'Otomatis Masuk Ambulan + Matras & Sabuk', 'Unit', 8, 2, 6, 14500000, 'Gudang Alat Medis', 'Aman', new Date().toISOString()],
    ['MED-003', 'Tabung Oksigen Medis 1m3', 'Alat Ambulance', 'Tabung Baja + Regulator Flowmeter & Nasal', 'Set', 15, 4, 11, 1650000, 'Gudang Alat Medis', 'Aman', new Date().toISOString()]
  ]);

  // 2. MUTASI STOK
  setupSheet(ss, 'Mutasi_Stok', [
    'id', 'tanggal', 'kode_barang', 'nama_barang', 'jenis_mutasi', 'jumlah', 'keterangan', 'pj_admin'
  ], [
    ['MUT-001', '2026-11-01', 'PLT-001', 'Plat Stainless Steel 304', 'Masuk', 25, 'Pengadaan Plat SS Supplier PT Metal', 'Admin C'],
    ['MUT-002', '2026-11-05', 'PLT-001', 'Plat Stainless Steel 304', 'Terpakai', 4, 'Produksi Ambulance Wuling EV (Pak Gerry)', 'Admin D'],
    ['MUT-003', '2026-11-06', 'BSI-001', 'Besi Hollow Galvanis 40x40', 'Terpakai', 12, 'Rangka Plafon & Partisi Ambulance', 'Admin D'],
    ['MUT-004', '2026-11-10', 'MED-001', 'Rotary Lightbar Strobo LED', 'Terpakai', 1, 'Pemasangan Strobo Ambulance Wuling EV', 'Admin D']
  ]);

  // 3. GENERAL LEDGER (ACCURATE FORMAT - KAS & BANK BCA 8820917881)
  setupSheet(ss, 'General_Ledger', [
    'id_transaksi', 'tanggal', 'kategori', 'deskripsi', 'kas_masuk', 'kas_keluar', 'saldo', 'bukti_nota', 'pic_admin'
  ], [
    ['TRX-001', '2026-11-01', 'Modal Awal', 'Saldo Awal Bank BCA (1200-00-010)', 50000000, 0, 50000000, 'BCA-AWAL', 'Admin A'],
    ['TRX-002', '2026-11-02', 'Kas Kecil', 'Pengisian Kas Kecil Workshop (1100-00-010)', 0, 5000000, 45000000, 'TRANS-01', 'Admin C'],
    ['TRX-003', '2026-11-04', 'Pendapatan Usaha', 'DP 50% Karoseri Ambulance Wuling Mitra EV (Pak Gerry)', 38850000, 0, 83850000, 'INV-RAN-2026-001', 'Admin E'],
    ['TRX-004', '2026-11-07', 'Beli Material', 'Pembelian Plat SS 304 & Besi Hollow Rangka', 0, 18500000, 65350000, 'NOTA-SUP-01', 'Admin C'],
    ['TRX-005', '2026-11-10', 'Beli Material Medis', 'Pembelian Lightbar Strobo & Stretcher Ambulance', 0, 21000000, 44350000, 'NOTA-MED-04', 'Admin D'],
    ['TRX-006', '2026-11-15', 'Upah Tenaga Kerja', 'Upah Mingguan Welder & Teknisi Karoseri', 0, 8500000, 35850000, 'SLIP-UPAH-W2', 'Admin D']
  ]);

  // 4. HPP PRODUKSI KAROSERI
  setupSheet(ss, 'HPP_Produksi', [
    'id_proyek', 'nama_proyek', 'klien', 'tanggal_mulai', 'material_plat_detail', 'material_besi_detail',
    'biaya_material_total', 'biaya_tenaga_kerja', 'biaya_overhead', 'total_hpp', 'target_jual', 'margin_persen', 'status_produksi', 'pic_admin'
  ], [
    [
      'HPP-RAN-001',
      'Karoseri Ambulance Type Standar (Wuling Mitra EV)',
      'Pak Gerry',
      '2026-11-04',
      'Plat Stainless Steel 304 (4 lbr @ Rp 1.850.000) + Plat Bordes (2 lbr @ Rp 1.250.000) = Rp 9.900.000',
      'Besi Hollow 40x40 (12 btg @ Rp 145.000) + Hollow 40x80 (8 btg @ Rp 275.000) = Rp 3.940.000',
      32500000,
      8500000,
      4200000,
      45200000,
      70000000,
      54.8,
      'Dalam Pengerjaan',
      'Admin D'
    ]
  ]);

  // 5. QUOTATIONS (SURAT PENAWARAN HARGA - SPH)
  setupSheet(ss, 'Quotations', [
    'nomor_quote', 'tanggal', 'jatuh_tempo', 'nama_klien', 'perusahaan', 'telepon_email',
    'items_json', 'subtotal', 'diskon', 'ppn', 'total', 'catatan_syarat', 'status', 'admin_pembuat'
  ], [
    [
      '63/SPH-RAN/XI/2026',
      '2026-11-03',
      '2026-11-17',
      'Pak Gerry',
      'Pribadi / Instansi',
      '0812-9988-7766 / gerry@ambulan.id',
      JSON.stringify([
        { 
          item: 'Pekerjaan Pembuatan Karoseri Ambulance Type Standar (Unit Chassis Wuling Mitra EV)', 
          qty: 1, 
          unit: 'Unit', 
          price: 70000000, 
          total: 70000000 
        }
      ]),
      70000000,
      0,
      7700000,
      77700000,
      '1. Masa berlaku penawaran harga 14 hari kalender.\n' +
      '2. Pembayaran DP 50% saat PO / SPK ditandatangani, Pelunasan sebelum serah terima unit.\n' +
      '3. Pembayaran via transfer Bank BCA No. Rek: 8820917881 an PT RADINA ADI NILARAYA.\n' +
      '4. Waktu pengerjaan karoseri 14 - 21 hari kerja setelah chassis dan DP diterima di workshop.\n' +
      '5. Sudah termasuk penerbitan SRUT (Surat Rancang Bangun Uji Tipe) resmi Dishub/Kemenhub.',
      'Disetujui',
      'Admin E'
    ]
  ]);

  // 6. INVOICES
  setupSheet(ss, 'Invoices', [
    'nomor_inv', 'tanggal', 'jatuh_tempo', 'nomor_quote_ref', 'klien', 'alamat',
    'items_json', 'subtotal', 'pajak', 'total_tagihan', 'status_bayar', 'metode_bayar', 'catatan_rekening', 'admin_pembuat'
  ], [
    [
      'INV-RAN-2026-001',
      '2026-11-04',
      '2026-11-11',
      '63/SPH-RAN/XI/2026',
      'Pak Gerry',
      'Jl. Raya Bencongan, Kelapa Dua, Tangerang',
      JSON.stringify([
        { 
          item: 'Termin 1 (Uang Muka 50%) Karoseri Ambulance Type Standar (Wuling Mitra EV)', 
          qty: 1, 
          unit: 'Lot', 
          price: 38850000, 
          total: 38850000 
        }
      ]),
      38850000,
      0,
      38850000,
      'Lunas',
      'Transfer Bank BCA',
      'Bank BCA No. Rek: 8820917881 an PT RADINA ADI NILARAYA',
      'Admin E'
    ],
    [
      'INV-RAN-2026-002',
      '2026-11-18',
      '2026-11-25',
      '63/SPH-RAN/XI/2026',
      'Pak Gerry',
      'Jl. Raya Bencongan, Kelapa Dua, Tangerang',
      JSON.stringify([
        { 
          item: 'Termin 2 (Pelunasan 50%) Karoseri Ambulance Type Standar (Wuling Mitra EV)', 
          qty: 1, 
          unit: 'Lot', 
          price: 38850000, 
          total: 38850000 
        }
      ]),
      38850000,
      0,
      38850000,
      'Belum Bayar',
      'Transfer Bank BCA',
      'Bank BCA No. Rek: 8820917881 an PT RADINA ADI NILARAYA',
      'Admin E'
    ]
  ]);

  // 7. ANGGARAN VS REALISASI (RAP)
  setupSheet(ss, 'Anggaran_Realisasi', [
    'kode_anggaran', 'proyek_atau_pos', 'kategori_biaya', 'rencana_anggaran', 'realisasi_biaya',
    'selisih', 'persentase_terpakai', 'status_evaluasi', 'keterangan'
  ], [
    ['RAP-001', 'Ambulance Wuling Mitra EV (Pak Gerry)', 'Beban Pokok Penjualan (Material Karoseri)', 35000000, 32500000, 2500000, 92.9, 'Aman', 'Plat SS & rangka sesuai estimasi'],
    ['RAP-002', 'Ambulance Wuling Mitra EV (Pak Gerry)', 'Upah Tenaga Kerja Langsung (Pabrikasi)', 9000000, 8500000, 500000, 94.4, 'Aman', 'Teknisi karoseri & welder'],
    ['RAP-003', 'Ambulance Wuling Mitra EV (Pak Gerry)', 'Overhead Pabrikasi & Finishing Pengecatan', 4500000, 4200000, 300000, 93.3, 'Aman', 'Cat polyurethane & finishing oven'],
    ['RAP-004', 'Pengurusan Dokumen SRUT Karoseri', 'Beban Pengurusan Dokumen SRUT & Perizinan', 3500000, 3200000, 300000, 91.4, 'Aman', 'Uji tipe Kemenhub resmi']
  ]);

  // 8. 5 ADMIN (2 OWNER + 3 STAFF)
  setupSheet(ss, 'Admins', [
    'id', 'name', 'email', 'role', 'status', 'phone', 'avatar'
  ], [
    ['ADM-1', 'Admin A', 'admin.a@asakaroseri.com', 'Owner', 'Aktif', '0812-0000-0001', 'A'],
    ['ADM-2', 'Admin B', 'admin.b@asakaroseri.com', 'Owner', 'Aktif', '0812-0000-0002', 'B'],
    ['ADM-3', 'Admin C', 'admin.c@asakaroseri.com', 'Staff Inventory', 'Aktif', '0812-0000-0003', 'C'],
    ['ADM-4', 'Admin D', 'admin.d@asakaroseri.com', 'Staff HPP', 'Aktif', '0812-0000-0004', 'D'],
    ['ADM-5', 'Admin E', 'admin.e@asakaroseri.com', 'Staff Invoice', 'Aktif', '0812-0000-0005', 'E']
  ]);

  return {
    success: true,
    message: 'Semua 8 sheet dan data awal PT RADINA ADI NILARAYA berhasil dibuat!'
  };
}

// Helper Setup Sheet dengan Format Header
function setupSheet(ss, sheetName, headers, sampleRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  // Tulis Header
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format Header: Tebal, Background Biru Tua Gelap, Teks Putih
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Tulis Contoh Baris Data jika ada
  if (sampleRows && sampleRows.length > 0) {
    sheet.getRange(2, 1, sampleRows.length, sampleRows[0].length).setValues(sampleRows);
  }

  // Freeze Baris Header
  sheet.setFrozenRows(1);

  // Auto-resize kolom agar rapi dibaca
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}
