export type UserRole = 'Owner' | 'Staff Inventory' | 'Staff HPP' | 'Staff Invoice';

export type ActiveTab = 
  | 'overview' 
  | 'stok' 
  | 'ledger' 
  | 'labarugi'
  | 'hpp' 
  | 'quotation' 
  | 'invoice' 
  | 'anggaran' 
  | 'admins' 
  | 'settings';

export const ROLE_PERMISSIONS: Record<UserRole, ActiveTab[]> = {
  'Owner': ['overview', 'stok', 'ledger', 'labarugi', 'hpp', 'quotation', 'invoice', 'anggaran', 'admins', 'settings'],
  'Staff Inventory': ['stok'],
  'Staff HPP': ['hpp'],
  'Staff Invoice': ['quotation', 'invoice'],
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  status: 'Aktif' | 'Nonaktif';
  phone: string;
  avatar: string;
  allowedTabs: ActiveTab[];
}

// Master Kode Akun Buku Besar (General Ledger)
export interface AccountCode {
  kode: string; // e.g. "1100-010"
  nama: string; // e.g. "Kas Kecil Workshop"
  kategori: 'Kas' | 'Bank' | 'Piutang' | 'Hutang' | 'Modal' | 'Pendapatan' | 'Beban Pokok' | 'Beban Operasional';
  saldo_awal: number;
  keterangan?: string;
}

// Transaksi Buku Besar
export interface LedgerItem {
  id_transaksi: string;
  tanggal: string; // Format YYYY-MM-DD
  kode_akun: string; // e.g. "1100-010"
  nama_akun: string; // e.g. "Kas Kecil Workshop"
  kategori: string;
  deskripsi: string;
  kas_masuk: number;
  kas_keluar: number;
  saldo: number;
  bukti_nota: string;
  pic_admin: string;
}

// Stok Barang Karoseri
export interface StokItem {
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  spesifikasi: string;
  satuan: string;
  stok_masuk: number;
  terpakai: number;
  sisa_barang: number;
  harga_satuan: number;
  lokasi_gudang: string;
  status_stok: 'Aman' | 'Menipis' | 'Kritis';
  updated_at: string;
}

// Mutasi Stok
export interface MutasiStokItem {
  id: string;
  tanggal: string;
  kode_barang: string;
  nama_barang: string;
  jenis_mutasi: 'Masuk' | 'Terpakai' | 'Keluar';
  jumlah: number;
  keterangan: string;
  pj_admin: string;
}

// Detail Material untuk HPP
export interface HPPMaterialRow {
  id: string;
  kategori: string; // Plat / Besi / Interior / Komponen
  nama_material: string;
  ukuran_spesifikasi: string; // Ukuran detail (e.g. 1.2x2.4m tebal 2mm, 40x40 pjg 6m)
  jumlah: number;
  satuan: string; // Lembar, Batang, Unit, Set, m2
  harga_satuan: number;
  total: number;
}

// Detail Jasa & Upah Pekerjaan untuk HPP
export interface HPPJasaRow {
  id: string;
  nama_jasa: string; // e.g. Jasa Pengelasan & Rangka Utama
  rincian_pekerjaan: string;
  biaya_jasa: number;
}

// Proyek HPP Produksi Karoseri
export interface HPPItem {
  id_proyek: string;
  nama_proyek: string;
  klien: string;
  tipe_unit: string;
  tanggal_mulai: string;
  material_rows: HPPMaterialRow[];
  jasa_rows: HPPJasaRow[];
  biaya_material_total: number;
  biaya_jasa_total: number;
  biaya_overhead: number;
  biaya_srut_perizinan: number;
  total_hpp: number;
  target_jual: number;
  margin_persen: number;
  status_produksi: 'Persiapan' | 'Dalam Pengerjaan' | 'Finishing' | 'Selesai';
  pic_admin: string;
  // Fallback properties for compatibility
  material_plat_detail?: string;
  material_besi_detail?: string;
  material_interior_detail?: string;
  biaya_tenaga_kerja?: number;
}

// Detail Baris SPH / Invoice
export interface QuotationItemDetail {
  no?: number;
  item?: string;
  deskripsi?: string;
  ukuran?: string;
  satuan?: string;
  unit?: string;
  harga_satuan?: number;
  price?: number;
  jumlah?: number;
  qty?: number;
  total?: number;
}

// Surat Penawaran Harga (SPH)
export interface QuotationItem {
  nomor_quote: string;
  tanggal: string;
  jatuh_tempo?: string;
  perihal?: string;
  nama_klien: string;
  perusahaan: string;
  alamat_klien?: string;
  telepon_email: string;
  items_json: QuotationItemDetail[];
  subtotal: number;
  diskon?: number;
  ppn: number;
  total: number;
  terbilang?: string;
  catatan_syarat?: string;
  keterangan?: string[];
  lampiran_spesifikasi?: string[];
  status: 'Draft' | 'Terkirim' | 'Disetujui' | 'Ditolak';
  admin_pembuat?: string;
  penandatangan?: string;
  jabatan_penandatangan?: string;
}

// Faktur Penagihan (Invoice)
export interface InvoiceItem {
  nomor_inv: string;
  tanggal: string;
  jatuh_tempo: string;
  nomor_quote_ref: string;
  klien: string;
  alamat: string;
  items_json: QuotationItemDetail[];
  subtotal: number;
  pajak: number; // PPN 11%
  total_tagihan: number; // Subtotal + Pajak
  terbilang?: string;
  status_bayar: 'Belum Bayar' | 'DP Diterima' | 'Lunas';
  metode_bayar: string;
  catatan_rekening: string;
  admin_pembuat: string;
}

// Anggaran Bulanan per Tahun (Monthly Budget vs Actual)
export interface MonthlyBudgetItem {
  id: string;
  tahun: number; // e.g. 2026
  bulan: number; // 1 - 12
  nama_bulan: string; // "Januari", "Februari", ...
  kategori: string; // "Bahan Baku & Material Karoseri", "Upah Tenaga Kerja & Welder", dll.
  rencana_anggaran: number;
  realisasi_biaya: number;
  selisih: number;
  persentase_terpakai: number;
  status_evaluasi: 'Aman' | 'Sesuai' | 'Overbudget';
  keterangan: string;
}

// Backward-compatibility alias
export type AnggaranItem = MonthlyBudgetItem;
