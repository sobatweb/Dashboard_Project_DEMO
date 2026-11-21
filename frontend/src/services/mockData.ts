import type { 
  StokItem, 
  MutasiStokItem, 
  AccountCode, 
  LedgerItem, 
  HPPItem, 
  QuotationItem, 
  InvoiceItem, 
  MonthlyBudgetItem, 
  AdminUser 
} from '../types';

// ==========================================
// 1. DATA 5 ADMIN USER (2 OWNER + 3 STAFF)
// ==========================================
export const initialAdmins: AdminUser[] = [
  {
    id: 'ADM-1',
    name: 'Admin A',
    email: 'admin.a@asakaroseri.com',
    role: 'Owner',
    roleTitle: 'Pemilik / Direktur Utama',
    status: 'Aktif',
    phone: '0812-0000-0001',
    avatar: 'A',
    allowedTabs: ['overview', 'stok', 'ledger', 'labarugi', 'hpp', 'quotation', 'invoice', 'anggaran', 'admins', 'settings']
  },
  {
    id: 'ADM-2',
    name: 'Admin B',
    email: 'admin.b@asakaroseri.com',
    role: 'Owner',
    roleTitle: 'Pemilik / Komisaris Utama',
    status: 'Aktif',
    phone: '0812-0000-0002',
    avatar: 'B',
    allowedTabs: ['overview', 'stok', 'ledger', 'labarugi', 'hpp', 'quotation', 'invoice', 'anggaran', 'admins', 'settings']
  },
  {
    id: 'ADM-3',
    name: 'Admin C',
    email: 'admin.c@asakaroseri.com',
    role: 'Staff Inventory',
    roleTitle: 'Staff Gudang & Material',
    status: 'Aktif',
    phone: '0812-0000-0003',
    avatar: 'C',
    allowedTabs: ['stok']
  },
  {
    id: 'ADM-4',
    name: 'Admin D',
    email: 'admin.d@asakaroseri.com',
    role: 'Staff HPP',
    roleTitle: 'Staff Estimator & HPP Produksi',
    status: 'Aktif',
    phone: '0812-0000-0004',
    avatar: 'D',
    allowedTabs: ['hpp']
  },
  {
    id: 'ADM-5',
    name: 'Admin E',
    email: 'admin.e@asakaroseri.com',
    role: 'Staff Invoice',
    roleTitle: 'Staff Penagihan & SPH',
    status: 'Aktif',
    phone: '0812-0000-0005',
    avatar: 'E',
    allowedTabs: ['quotation', 'invoice']
  }
];

// ==========================================
// ==========================================
// 2. MASTER KODE AKUN BUKU BESAR (FORMAT REAL CURRENCY)
// ==========================================
export const initialAccountCodes: AccountCode[] = [
  { kode: '1100-00-010', nama: 'Kas Kecil', kategori: 'Kas', saldo_awal: 1500000, keterangan: 'Kas kecil operasional harian workshop' },
  { kode: '1100-00-020', nama: 'Kas', kategori: 'Kas', saldo_awal: 10000000, keterangan: 'Kas tunai kantor PT Asa Karoseri' },
  { kode: '1200-00-010', nama: 'Bank', kategori: 'Bank', saldo_awal: 50000000, keterangan: 'Rekening Giro BCA PT Asa Karoseri' },
  { kode: '1300-00-010', nama: 'Piutang Giro', kategori: 'Piutang', saldo_awal: 0, keterangan: 'Piutang giro & cek mundur customer' },
  { kode: '4100-00-010', nama: 'Pendapatan Karoseri', kategori: 'Pendapatan', saldo_awal: 0, keterangan: 'Hasil penjualan unit karoseri & modifikasi' },
  { kode: '5100-00-010', nama: 'Bahan Baku Plat & Rangka', kategori: 'Beban Pokok', saldo_awal: 0, keterangan: 'Pembelian plat SS, plat bordes, dan hollow' },
  { kode: '5200-00-010', nama: 'Upah Tukang & Welder', kategori: 'Beban Pokok', saldo_awal: 0, keterangan: 'Upah langsung perakitan karoseri' },
  { kode: '6100-00-010', nama: 'Listrik, Air & Utilitas', kategori: 'Beban Operasional', saldo_awal: 0, keterangan: 'Biaya utilitas workshop pabrik' },
  { kode: '6200-00-010', nama: 'Legalitas & Uji SRUT', kategori: 'Beban Operasional', saldo_awal: 0, keterangan: 'Sertifikat Registrasi Uji Tipe Dishub' }
];

// ==========================================
// 3. TRANSAKSI GENERAL LEDGER (BUKU BESAR)
// ==========================================
export const initialLedger: LedgerItem[] = [
  // Akun: 1100-00-010 Kas Kecil
  {
    id_transaksi: 'TRX-2026-001',
    tanggal: '2026-11-01',
    kode_akun: '1100-00-010',
    nama_akun: 'Kas Kecil',
    kategori: 'Kas Kecil',
    deskripsi: 'Pengisian Kas Kecil dari Bank BCA',
    kas_masuk: 5000000,
    kas_keluar: 0,
    saldo: 6500000,
    bukti_nota: 'CR000001',
    pic_admin: 'Admin E'
  },
  {
    id_transaksi: 'TRX-2026-002',
    tanggal: '2026-11-03',
    kode_akun: '1100-00-010',
    nama_akun: 'Kas Kecil',
    kategori: 'Kas Kecil',
    deskripsi: 'Beli Perlengkapan Kawat Las & Amplas',
    kas_masuk: 0,
    kas_keluar: 1300000,
    saldo: 5200000,
    bukti_nota: 'CD000001',
    pic_admin: 'Admin C'
  },
  {
    id_transaksi: 'TRX-2026-003',
    tanggal: '2026-11-06',
    kode_akun: '1100-00-010',
    nama_akun: 'Kas Kecil',
    kategori: 'Kas Kecil',
    deskripsi: 'Konsumsi Lembur Teknisi Karoseri',
    kas_masuk: 0,
    kas_keluar: 850000,
    saldo: 4350000,
    bukti_nota: 'CD000002',
    pic_admin: 'Admin D'
  },

  // Akun: 1100-00-020 Kas
  {
    id_transaksi: 'TRX-2026-004',
    tanggal: '2026-11-02',
    kode_akun: '1100-00-020',
    nama_akun: 'Kas',
    kategori: 'Kas Tunai',
    deskripsi: 'Sales Down Payment Tunai - PT Maju Berkah',
    kas_masuk: 15000000,
    kas_keluar: 0,
    saldo: 25000000,
    bukti_nota: 'SA000001',
    pic_admin: 'Admin E'
  },
  {
    id_transaksi: 'TRX-2026-005',
    tanggal: '2026-11-05',
    kode_akun: '1100-00-020',
    nama_akun: 'Kas',
    kategori: 'Kas Tunai',
    deskripsi: 'Purchase Advance Bahan Cat Primer',
    kas_masuk: 0,
    kas_keluar: 4500000,
    saldo: 20500000,
    bukti_nota: 'PA000001',
    pic_admin: 'Admin C'
  },

  // Akun: 1200-00-010 Bank
  {
    id_transaksi: 'TRX-2026-006',
    tanggal: '2026-11-01',
    kode_akun: '1200-00-010',
    nama_akun: 'Bank',
    kategori: 'Bank BCA',
    deskripsi: 'Setoran Tunai Hasil Proyek Karoseri',
    kas_masuk: 25000000,
    kas_keluar: 0,
    saldo: 75000000,
    bukti_nota: 'CR000006',
    pic_admin: 'Admin A'
  },
  {
    id_transaksi: 'TRX-2026-007',
    tanggal: '2026-11-05',
    kode_akun: '1200-00-010',
    nama_akun: 'Bank',
    kategori: 'Bank BCA',
    deskripsi: 'Pelunasan DP 50% Invoice INV-ASA-2026-001 PT Medika',
    kas_masuk: 41625000,
    kas_keluar: 0,
    saldo: 116625000,
    bukti_nota: 'CR000007',
    pic_admin: 'Admin E'
  },
  {
    id_transaksi: 'TRX-2026-008',
    tanggal: '2026-11-08',
    kode_akun: '1200-00-010',
    nama_akun: 'Bank',
    kategori: 'Bank BCA',
    deskripsi: 'Transfer Pembelian Plat SS 304 PT Aneka Steel',
    kas_masuk: 0,
    kas_keluar: 22125000,
    saldo: 94500000,
    bukti_nota: 'CD000010',
    pic_admin: 'Admin C'
  },
  {
    id_transaksi: 'TRX-2026-009',
    tanggal: '2026-11-12',
    kode_akun: '1200-00-010',
    nama_akun: 'Bank',
    kategori: 'Bank BCA',
    deskripsi: 'Pembayaran Tagihan Listrik PLN Workshop',
    kas_masuk: 0,
    kas_keluar: 4750000,
    saldo: 89750000,
    bukti_nota: 'CD000011',
    pic_admin: 'Admin A'
  },
  {
    id_transaksi: 'TRX-2026-010',
    tanggal: '2026-11-15',
    kode_akun: '1200-00-010',
    nama_akun: 'Bank',
    kategori: 'Bank BCA',
    deskripsi: 'Transfer Upah Mingguan Welder & Teknisi',
    kas_masuk: 0,
    kas_keluar: 9600000,
    saldo: 80150000,
    bukti_nota: 'CD000012',
    pic_admin: 'Admin D'
  }
];

// ==========================================
// 4. DATA STOK BARANG KAROSERI
// ==========================================
export const initialStok: StokItem[] = [
  {
    kode_barang: 'PLT-001',
    nama_barang: 'Plat Stainless Steel 304',
    kategori: 'Plat Karoseri',
    spesifikasi: '1.2 x 2.4 m tebal 1.5 mm (Food & Medical Grade)',
    satuan: 'Lembar',
    stok_masuk: 30,
    terpakai: 12,
    sisa_barang: 18,
    harga_satuan: 1850000,
    lokasi_gudang: 'Rak Plat A-1',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'PLT-002',
    nama_barang: 'Plat Bordes Aluminium',
    kategori: 'Plat Karoseri',
    spesifikasi: '1.2 x 2.4 m tebal 2.0 mm (Lantai Pijakan Anti Selip)',
    satuan: 'Lembar',
    stok_masuk: 20,
    terpakai: 16,
    sisa_barang: 4,
    harga_satuan: 1250000,
    lokasi_gudang: 'Rak Plat A-2',
    status_stok: 'Menipis',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'BSI-001',
    nama_barang: 'Besi Hollow Galvanis 40x40',
    kategori: 'Besi Rangka',
    spesifikasi: '40 x 40 x 1.8 mm (Panjang 6 Meter)',
    satuan: 'Batang',
    stok_masuk: 120,
    terpakai: 45,
    sisa_barang: 75,
    harga_satuan: 145000,
    lokasi_gudang: 'Rak Besi B-1',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'BSI-002',
    nama_barang: 'Besi Hollow Galvanis 40x80',
    kategori: 'Besi Rangka',
    spesifikasi: '40 x 80 x 2.0 mm (Panjang 6 Meter)',
    satuan: 'Batang',
    stok_masuk: 80,
    terpakai: 32,
    sisa_barang: 48,
    harga_satuan: 275000,
    lokasi_gudang: 'Rak Besi B-2',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'INT-001',
    nama_barang: 'Polywood Karoseri 15mm',
    kategori: 'Interior & Lantai',
    spesifikasi: 'Tebal 15mm Grade Karoseri Tahan Air',
    satuan: 'Lembar',
    stok_masuk: 40,
    terpakai: 18,
    sisa_barang: 22,
    harga_satuan: 320000,
    lokasi_gudang: 'Rak Kayu C-1',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'INT-002',
    nama_barang: 'Vinyl Lantai Medis Antibakteri',
    kategori: 'Interior & Lantai',
    spesifikasi: 'Tebal 2.0mm Hospital Grade Anti Bakteri',
    satuan: 'm2',
    stok_masuk: 100,
    terpakai: 35,
    sisa_barang: 65,
    harga_satuan: 185000,
    lokasi_gudang: 'Gudang Interior C-2',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'MED-001',
    nama_barang: 'Rotary Strobo Lightbar LED',
    kategori: 'Perlengkapan Khusus',
    spesifikasi: 'Warna Merah-Biru + Sirine Multisuara & Mic',
    satuan: 'Set',
    stok_masuk: 12,
    terpakai: 4,
    sisa_barang: 8,
    harga_satuan: 6500000,
    lokasi_gudang: 'Ruang Alat D-1',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  },
  {
    kode_barang: 'MED-002',
    nama_barang: 'Ambulance Roll-in Stretcher SS',
    kategori: 'Perlengkapan Khusus',
    spesifikasi: 'Aluminium SS Otomatis Masuk Ambulan + Matras',
    satuan: 'Unit',
    stok_masuk: 8,
    terpakai: 3,
    sisa_barang: 5,
    harga_satuan: 14500000,
    lokasi_gudang: 'Ruang Alat D-2',
    status_stok: 'Aman',
    updated_at: '2026-11-20'
  }
];

// ==========================================
// 5. RIWAYAT MUTASI STOK
// ==========================================
export const initialMutasi: MutasiStokItem[] = [
  {
    id: 'MUT-001',
    tanggal: '2026-11-01',
    kode_barang: 'PLT-001',
    nama_barang: 'Plat Stainless Steel 304',
    jenis_mutasi: 'Masuk',
    jumlah: 30,
    keterangan: 'Penerimaan stok dari supplier PT Steel Utama',
    pj_admin: 'Admin C'
  },
  {
    id: 'MUT-002',
    tanggal: '2026-11-06',
    kode_barang: 'PLT-001',
    nama_barang: 'Plat Stainless Steel 304',
    jenis_mutasi: 'Terpakai',
    jumlah: 6,
    keterangan: 'Fabrikasi Ambulance VIP (PT Medika Nusantara)',
    pj_admin: 'Admin D'
  },
  {
    id: 'MUT-003',
    tanggal: '2026-11-07',
    kode_barang: 'BSI-001',
    nama_barang: 'Besi Hollow Galvanis 40x40',
    jenis_mutasi: 'Terpakai',
    jumlah: 15,
    keterangan: 'Rangka dinding dan partisi plafon ambulance',
    pj_admin: 'Admin D'
  }
];

// ==========================================
// 6. DATA HPP PRODUKSI KAROSERI
// ==========================================
export const initialHPP: HPPItem[] = [
  {
    id_proyek: 'HPP-ASA-001',
    nama_proyek: 'Karoseri Ambulance VIP Deluxe',
    klien: 'PT Medika Nusantara Sejahtera',
    tipe_unit: 'Wuling Mitra EV (Chassis)',
    tanggal_mulai: '2026-11-04',
    material_rows: [
      {
        id: 'MAT-1',
        kategori: 'Plat',
        nama_material: 'Plat Stainless Steel 304 Bumper & Dinding',
        ukuran_spesifikasi: '1.2 x 2.4 m x 1.5 mm',
        jumlah: 4,
        satuan: 'Lembar',
        harga_satuan: 1850000,
        total: 7400000
      },
      {
        id: 'MAT-2',
        kategori: 'Plat',
        nama_material: 'Plat Bordes Aluminium Lantai',
        ukuran_spesifikasi: '1.2 x 2.4 m x 2.0 mm',
        jumlah: 2,
        satuan: 'Lembar',
        harga_satuan: 1250000,
        total: 2500000
      },
      {
        id: 'MAT-3',
        kategori: 'Besi',
        nama_material: 'Besi Hollow Galvanis 40x40 Rangka',
        ukuran_spesifikasi: '40 x 40 x 1.8 mm (6 Meter)',
        jumlah: 12,
        satuan: 'Batang',
        harga_satuan: 145000,
        total: 1740000
      },
      {
        id: 'MAT-4',
        kategori: 'Besi',
        nama_material: 'Besi Hollow Galvanis 40x80 Dudukan Utama',
        ukuran_spesifikasi: '40 x 80 x 2.0 mm (6 Meter)',
        jumlah: 6,
        satuan: 'Batang',
        harga_satuan: 275000,
        total: 1650000
      },
      {
        id: 'MAT-5',
        kategori: 'Interior',
        nama_material: 'Polywood 15mm & Vinyl Antibakteri',
        ukuran_spesifikasi: 'Lantai & Sekat Lemari Medis',
        jumlah: 1,
        satuan: 'Lot',
        harga_satuan: 5800000,
        total: 5800000
      },
      {
        id: 'MAT-6',
        kategori: 'Komponen',
        nama_material: 'Paket Medis (Strobo, Sirine, Stretcher, Oksigen)',
        ukuran_spesifikasi: 'Full Set Standar Kemenkes',
        jumlah: 1,
        satuan: 'Set',
        harga_satuan: 24500000,
        total: 24500000
      }
    ],
    jasa_rows: [
      {
        id: 'JAS-1',
        nama_jasa: 'Jasa Fabrikasi Rangka & Pengelasan Body',
        rincian_pekerjaan: 'Welding MIG rangka galvanis dan plat SS',
        biaya_jasa: 5500000
      },
      {
        id: 'JAS-2',
        nama_jasa: 'Jasa Pemasangan Interior & Kelistrikan Medis',
        rincian_pekerjaan: 'Instalasi kabel tahan panas, inverter 1000W & lampu LED',
        biaya_jasa: 3200000
      },
      {
        id: 'JAS-3',
        nama_jasa: 'Jasa Pengecatan Cat Oven Polyurethane',
        rincian_pekerjaan: 'Epoxy primer, cat dasar putih & striping stiker ambulance',
        biaya_jasa: 3800000
      }
    ],
    biaya_material_total: 43590000,
    biaya_jasa_total: 12500000,
    biaya_overhead: 3500000,
    biaya_srut_perizinan: 3500000,
    total_hpp: 63090000,
    target_jual: 75000000,
    margin_persen: 18.9,
    status_produksi: 'Dalam Pengerjaan',
    pic_admin: 'Admin D'
  }
];

// ==========================================
// 7. SURAT PENAWARAN HARGA (SPH)
// ==========================================
export const initialQuotations: QuotationItem[] = [
  {
    nomor_quote: '018/SPH-ASA/XI/2026',
    tanggal: '2026-11-04',
    jatuh_tempo: '2026-11-18',
    perihal: 'Surat Penawaran Harga Pembuatan Karoseri Ambulance VIP Deluxe',
    nama_klien: 'dr. Ardiansyah',
    perusahaan: 'PT Medika Nusantara Sejahtera',
    alamat_klien: 'Kawasan Niaga Surya Mas Blok B-12, Tangerang',
    telepon_email: '0812-9876-0000 / procurement@medikanusantara.id',
    items_json: [
      {
        no: 1,
        item: 'Pekerjaan Pembuatan Karoseri Ambulance VIP Deluxe (Chassis Wuling Mitra EV)',
        deskripsi: 'Modifikasi lengkap interior, kelistrikan medis, lantai antibakteri, rotary lightbar strobo, stretcher roll-in, dan surat rancang bangun SRUT',
        ukuran: 'Unit EV Standar',
        qty: 1,
        satuan: 'Unit',
        price: 75000000,
        total: 75000000
      }
    ],
    subtotal: 75000000,
    diskon: 0,
    ppn: 8250000, // PPN 11%
    total: 83250000,
    terbilang: 'Delapan Puluh Tiga Juta Dua Ratus Lima Puluh Ribu Rupiah',
    catatan_syarat: 
      '1. Masa berlaku penawaran harga 14 (empat belas) hari kalender sejak tanggal penawaran.\n' +
      '2. Pembayaran DP 50% saat PO / Surat Perintah Kerja disetujui, Pelunasan 50% sebelum serah terima unit.\n' +
      '3. Pembayaran via transfer Bank BCA No. Rek: 7890-123-456 an PT ASA KAROSERI.\n' +
      '4. Waktu pengerjaan karoseri 14 - 21 hari kerja setelah chassis dan DP diterima di workshop PT Asa Karoseri.\n' +
      '5. Sudah termasuk sertifikat SRUT resmi dari Kementerian Perhubungan RI.',
    status: 'Disetujui',
    admin_pembuat: 'Admin E',
    penandatangan: 'Admin A',
    jabatan_penandatangan: 'Direktur Utama'
  }
];

// ==========================================
// 8. FAKTUR PENAGIHAN (INVOICE DENGAN PPN 11%)
// ==========================================
export const initialInvoices: InvoiceItem[] = [
  {
    nomor_inv: 'INV-ASA-2026-001',
    tanggal: '2026-11-05',
    jatuh_tempo: '2026-11-12',
    nomor_quote_ref: '018/SPH-ASA/XI/2026',
    klien: 'PT Medika Nusantara Sejahtera (dr. Ardiansyah)',
    alamat: 'Kawasan Niaga Surya Mas Blok B-12, Tangerang',
    items_json: [
      {
        no: 1,
        item: 'Termin 1 (Uang Muka 50%) Pembuatan Karoseri Ambulance VIP Deluxe',
        deskripsi: 'Sesuai Surat Penawaran Harga No. 018/SPH-ASA/XI/2026 (Chassis Wuling Mitra EV)',
        qty: 1,
        satuan: 'Lot',
        price: 37500000,
        total: 37500000
      }
    ],
    subtotal: 37500000,
    pajak: 4125000, // PPN 11% dari Rp 37.500.000
    total_tagihan: 41625000, // Subtotal + PPN
    terbilang: 'Empat Puluh Satu Juta Enam Ratus Dua Puluh Lima Ribu Rupiah',
    status_bayar: 'Lunas',
    metode_bayar: 'Transfer Bank BCA',
    catatan_rekening: 'Bank BCA No. Rek: 7890-123-456 a/n PT ASA KAROSERI',
    admin_pembuat: 'Admin E'
  },
  {
    nomor_inv: 'INV-ASA-2026-002',
    tanggal: '2026-11-20',
    jatuh_tempo: '2026-11-27',
    nomor_quote_ref: '018/SPH-ASA/XI/2026',
    klien: 'PT Medika Nusantara Sejahtera (dr. Ardiansyah)',
    alamat: 'Kawasan Niaga Surya Mas Blok B-12, Tangerang',
    items_json: [
      {
        no: 1,
        item: 'Termin 2 (Pelunasan 50%) Pembuatan Karoseri Ambulance VIP Deluxe',
        deskripsi: 'Pelunasan pekerjaan fisik karoseri dan kelengkapan dokumen SRUT resmi Kemenhub',
        qty: 1,
        satuan: 'Lot',
        price: 37500000,
        total: 37500000
      }
    ],
    subtotal: 37500000,
    pajak: 4125000, // PPN 11%
    total_tagihan: 41625000,
    terbilang: 'Empat Puluh Satu Juta Enam Ratus Dua Puluh Lima Ribu Rupiah',
    status_bayar: 'Belum Bayar',
    metode_bayar: 'Transfer Bank BCA',
    catatan_rekening: 'Bank BCA No. Rek: 7890-123-456 a/n PT ASA KAROSERI',
    admin_pembuat: 'Admin E'
  }
];

// ==========================================
// 9. ANGGARAN BULANAN PER TAHUN (2026)
// ==========================================
const namaBulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const initialMonthlyBudgets: MonthlyBudgetItem[] = [
  {
    id: 'BGT-2026-01',
    tahun: 2026,
    bulan: 1,
    nama_bulan: 'Januari',
    kategori: 'Bahan Baku & Material Karoseri',
    rencana_anggaran: 85000000,
    realisasi_biaya: 81200000,
    selisih: 3800000,
    persentase_terpakai: 95.5,
    status_evaluasi: 'Aman',
    keterangan: 'Pengadaan plat SS 304 dan hollow batch awal tahun'
  },
  {
    id: 'BGT-2026-02',
    tahun: 2026,
    bulan: 2,
    nama_bulan: 'Februari',
    kategori: 'Upah Tenaga Kerja & Welder',
    rencana_anggaran: 42000000,
    realisasi_biaya: 41500000,
    selisih: 500000,
    persentase_terpakai: 98.8,
    status_evaluasi: 'Sesuai',
    keterangan: 'Upah bulanan teknisi karoseri & lembur proyek'
  },
  {
    id: 'BGT-2026-03',
    tahun: 2026,
    bulan: 3,
    nama_bulan: 'Maret',
    kategori: 'Operasional & Listrik Workshop',
    rencana_anggaran: 18000000,
    realisasi_biaya: 17200000,
    selisih: 800000,
    persentase_terpakai: 95.5,
    status_evaluasi: 'Aman',
    keterangan: 'Listrik PLN daya 33.000 VA & gas argon'
  },
  {
    id: 'BGT-2026-11',
    tahun: 2026,
    bulan: 11,
    nama_bulan: 'November',
    kategori: 'Bahan Baku & Material Karoseri',
    rencana_anggaran: 95000000,
    realisasi_biaya: 88500000,
    selisih: 6500000,
    persentase_terpakai: 93.2,
    status_evaluasi: 'Aman',
    keterangan: 'Material ambulance & box aluminium berjalan lancar'
  },
  {
    id: 'BGT-2026-11-2',
    tahun: 2026,
    bulan: 11,
    nama_bulan: 'November',
    kategori: 'Upah Tenaga Kerja & Welder',
    rencana_anggaran: 45000000,
    realisasi_biaya: 43200000,
    selisih: 1800000,
    persentase_terpakai: 96.0,
    status_evaluasi: 'Aman',
    keterangan: 'Upah mingguan tim perakitan dan finishing cat'
  },
  {
    id: 'BGT-2026-11-3',
    tahun: 2026,
    bulan: 11,
    nama_bulan: 'November',
    kategori: 'Pengurusan Dokumen SRUT & Legalitas',
    rencana_anggaran: 15000000,
    realisasi_biaya: 14000000,
    selisih: 1000000,
    persentase_terpakai: 93.3,
    status_evaluasi: 'Aman',
    keterangan: 'Penerbitan SRUT resmi Kemenhub untuk unit ambulans'
  },
  {
    id: 'BGT-2026-12',
    tahun: 2026,
    bulan: 12,
    nama_bulan: 'Desember',
    kategori: 'Bahan Baku & Material Karoseri',
    rencana_anggaran: 110000000,
    realisasi_biaya: 25000000,
    selisih: 85000000,
    persentase_terpakai: 22.7,
    status_evaluasi: 'Aman',
    keterangan: 'Alokasi proyek akhir tahun'
  }
];

// Helper membuat template bulan kosong
export const generateEmptyYearBudgets = (tahun: number): MonthlyBudgetItem[] => {
  return namaBulanList.map((bulan, idx) => ({
    id: `BGT-${tahun}-${String(idx + 1).padStart(2, '0')}`,
    tahun,
    bulan: idx + 1,
    nama_bulan: bulan,
    kategori: 'Bahan Baku & Material Karoseri',
    rencana_anggaran: 50000000,
    realisasi_biaya: 0,
    selisih: 50000000,
    persentase_terpakai: 0,
    status_evaluasi: 'Aman',
    keterangan: `Target anggaran bulan ${bulan} ${tahun}`
  }));
};
