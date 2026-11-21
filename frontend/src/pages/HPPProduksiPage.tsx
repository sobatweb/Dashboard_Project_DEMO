import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calculator, 
  Plus, 
  FileText, 
  Search,
  Trash2,
  CheckCircle2,
  Wrench,
  Package
} from 'lucide-react';
import type { HPPItem, HPPMaterialRow, HPPJasaRow, QuotationItem } from '../types';
import { formatDateClean, formatRupiah, getTodayDateString } from '../services/utils';
import { APP_CONFIG } from '../config';

export const HPPProduksiPage: React.FC = () => {
  const { hppList, addOrUpdateHPP, saveQuotation, setActiveTab, currentAdmin } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State Proyek HPP
  const [namaProyek, setNamaProyek] = useState('Karoseri Ambulance VIP Deluxe (Wuling Mitra EV)');
  const [klien, setKlien] = useState('PT Medika Nusantara Sejahtera');
  const [tipeUnit, setTipeUnit] = useState('Chassis Wuling Mitra EV');
  const [statusProduksi, setStatusProduksi] = useState<'Persiapan' | 'Dalam Pengerjaan' | 'Finishing' | 'Selesai'>('Dalam Pengerjaan');

  // Dynamic Material Rows (Bisa nambah & kurang sesuka hati)
  const [materialRows, setMaterialRows] = useState<HPPMaterialRow[]>([
    {
      id: 'm-1',
      kategori: 'Plat',
      nama_material: 'Plat Stainless Steel 304 (Anti Karat)',
      ukuran_spesifikasi: '1.2 x 2.4 m x 1.5 mm',
      jumlah: 4,
      satuan: 'Lembar',
      harga_satuan: 1850000,
      total: 7400000
    },
    {
      id: 'm-2',
      kategori: 'Plat',
      nama_material: 'Plat Bordes Aluminium Lantai',
      ukuran_spesifikasi: '1.2 x 2.4 m x 2.0 mm',
      jumlah: 2,
      satuan: 'Lembar',
      harga_satuan: 1250000,
      total: 2500000
    },
    {
      id: 'm-3',
      kategori: 'Besi',
      nama_material: 'Besi Hollow Galvanis 40x40 Rangka',
      ukuran_spesifikasi: '40 x 40 x 1.8 mm (6 Meter)',
      jumlah: 12,
      satuan: 'Batang',
      harga_satuan: 145000,
      total: 1740000
    },
    {
      id: 'm-4',
      kategori: 'Interior',
      nama_material: 'Polywood 15mm + Vinyl Medis Lantai',
      ukuran_spesifikasi: 'Hospital Grade Antibakteri',
      jumlah: 1,
      satuan: 'Lot',
      harga_satuan: 5800000,
      total: 5800000
    },
    {
      id: 'm-5',
      kategori: 'Komponen',
      nama_material: 'Strobo Lightbar LED + Roll-in Stretcher SS',
      ukuran_spesifikasi: 'Full Set Standar Kemenkes',
      jumlah: 1,
      satuan: 'Set',
      harga_satuan: 24500000,
      total: 24500000
    }
  ]);

  // Dynamic Jasa & Upah Pekerjaan Rows (Bisa nambah & kurang sesuka hati)
  const [jasaRows, setJasaRows] = useState<HPPJasaRow[]>([
    {
      id: 'j-1',
      nama_jasa: 'Jasa Fabrikasi Rangka & Las Body MIG',
      rincian_pekerjaan: 'Perakitan rangka hollow galvanis & sekat interior',
      biaya_jasa: 5500000
    },
    {
      id: 'j-2',
      nama_jasa: 'Jasa Pemasangan Interior & Kelistrikan',
      rincian_pekerjaan: 'Instalasi panel listrik medis, inverter & lampu LED',
      biaya_jasa: 3200000
    },
    {
      id: 'j-3',
      nama_jasa: 'Jasa Pengecatan Oven Polyurethane',
      rincian_pekerjaan: 'Epoxy primer, cat oven & striping stiker reflektif',
      biaya_jasa: 3800000
    }
  ]);

  // Biaya Tambahan
  const [biayaOverhead, setBiayaOverhead] = useState<number>(3500000);
  const [biayaSrut, setBiayaSrut] = useState<number>(3500000);
  const [marginPersen, setMarginPersen] = useState<number>(20);

  // Perhitungan Otomatis
  const totalBiayaMaterial = materialRows.reduce((acc, curr) => acc + (Number(curr.jumlah) * Number(curr.harga_satuan)), 0);
  const totalBiayaJasa = jasaRows.reduce((acc, curr) => acc + Number(curr.biaya_jasa), 0);
  const totalHPP = totalBiayaMaterial + totalBiayaJasa + Number(biayaOverhead) + Number(biayaSrut);
  const rekomendasiHargaJual = Math.round(totalHPP * (1 + Number(marginPersen) / 100));

  // Handler Tambah/Hapus Baris Material
  const addMaterialRow = () => {
    const newRow: HPPMaterialRow = {
      id: `mat-${Date.now()}`,
      kategori: 'Plat',
      nama_material: '',
      ukuran_spesifikasi: '',
      jumlah: 1,
      satuan: 'Lembar',
      harga_satuan: 0,
      total: 0
    };
    setMaterialRows([...materialRows, newRow]);
  };

  const removeMaterialRow = (id: string) => {
    setMaterialRows(materialRows.filter(r => r.id !== id));
  };

  const updateMaterialRow = (id: string, field: keyof HPPMaterialRow, val: any) => {
    setMaterialRows(materialRows.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: val };
        updated.total = Number(updated.jumlah) * Number(updated.harga_satuan);
        return updated;
      }
      return r;
    }));
  };

  // Handler Tambah/Hapus Baris Jasa
  const addJasaRow = () => {
    const newRow: HPPJasaRow = {
      id: `jas-${Date.now()}`,
      nama_jasa: '',
      rincian_pekerjaan: '',
      biaya_jasa: 0
    };
    setJasaRows([...jasaRows, newRow]);
  };

  const removeJasaRow = (id: string) => {
    setJasaRows(jasaRows.filter(r => r.id !== id));
  };

  const updateJasaRow = (id: string, field: keyof HPPJasaRow, val: any) => {
    setJasaRows(jasaRows.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  // Simpan HPP
  const handleSubmitHPP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProyek || !klien) return;

    const id_proyek = `HPP-ASA-${String(hppList.length + 1).padStart(3, '0')}`;
    const newHPP: HPPItem = {
      id_proyek,
      nama_proyek: namaProyek,
      klien,
      tipe_unit: tipeUnit,
      tanggal_mulai: getTodayDateString(),
      material_rows: materialRows,
      jasa_rows: jasaRows,
      biaya_material_total: totalBiayaMaterial,
      biaya_jasa_total: totalBiayaJasa,
      biaya_overhead: Number(biayaOverhead),
      biaya_srut_perizinan: Number(biayaSrut),
      total_hpp: totalHPP,
      target_jual: rekomendasiHargaJual,
      margin_persen: Number(marginPersen),
      status_produksi: statusProduksi,
      pic_admin: currentAdmin.name
    };

    await addOrUpdateHPP(newHPP);
    setIsModalOpen(false);
  };

  // Convert HPP ke Penawaran Harga (SPH)
  const handleConvertToQuotation = async (hpp: HPPItem) => {
    const quoteNumber = `0${Math.floor(20 + Math.random() * 20)}/SPH-ASA/XI/2026`;
    const subtotalVal = hpp.target_jual;
    const ppnVal = Math.round(subtotalVal * 0.11);
    const grandTotalVal = subtotalVal + ppnVal;

    const newQuote: QuotationItem = {
      nomor_quote: quoteNumber,
      tanggal: getTodayDateString(),
      jatuh_tempo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      perihal: `Surat Penawaran Harga ${hpp.nama_proyek}`,
      nama_klien: hpp.klien,
      perusahaan: `Pengadaan Unit ${hpp.tipe_unit || 'Karoseri'}`,
      alamat_klien: 'di Tempat',
      telepon_email: '-',
      items_json: [
        {
          no: 1,
          item: `Pabrikasi Karoseri: ${hpp.nama_proyek}`,
          deskripsi: `Pekerjaan modifikasi karoseri chassis ${hpp.tipe_unit}. Termasuk material utama, jasa fabrikasi, interior dan dokumen SRUT resmi.`,
          ukuran: hpp.tipe_unit,
          qty: 1,
          satuan: 'Unit',
          price: subtotalVal,
          total: subtotalVal
        }
      ],
      subtotal: subtotalVal,
      diskon: 0,
      ppn: ppnVal,
      total: grandTotalVal,
      catatan_syarat: 
        '1. Penawaran harga berlaku selama 14 hari kalender.\n' +
        '2. Pembayaran DP 50% saat PO disetujui, Pelunasan sebelum unit diserahterimakan.\n' +
        `3. Pembayaran via transfer ${APP_CONFIG.BANK_NAME} No. Rek: ${APP_CONFIG.BANK_ACCOUNT_NO} an ${APP_CONFIG.BANK_ACCOUNT_NAME}.\n` +
        '4. Sudah termasuk dokumen uji tipe SRUT resmi Kemenhub.',
      status: 'Terkirim',
      admin_pembuat: currentAdmin.name,
      penandatangan: APP_CONFIG.DIRECTOR_NAME,
      jabatan_penandatangan: APP_CONFIG.DIRECTOR_TITLE
    };

    await saveQuotation(newQuote);
    setActiveTab('quotation');
  };

  const filteredHPP = hppList.filter(h =>
    h.nama_proyek.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.klien.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.id_proyek.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-slate-800" />
            HPP Produksi Karoseri (Harga Pokok Penjualan)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Kalkulator biaya dinamis: Material Plat & Besi, Jasa Las & Finishing, Overhead, dan Dokumen SRUT • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Hitung HPP Unit Baru
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama proyek karoseri, klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total: {filteredHPP.length} Proyek Karoseri
        </span>
      </div>

      {/* Daftar Kartu HPP */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHPP.map((hpp) => (
          <div key={hpp.id_proyek} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {hpp.id_proyek}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Mulai: {formatDateClean(hpp.tanggal_mulai)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                    {hpp.status_produksi}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">{hpp.nama_proyek}</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Pemesan: <strong>{hpp.klien}</strong> • Chassis: <strong>{hpp.tipe_unit || 'Karoseri'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConvertToQuotation(hpp)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Jadikan SPH (Penawaran)
                </button>
              </div>
            </div>

            {/* Breakdown Biaya 4 Kolom */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Biaya Material</span>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {formatRupiah(hpp.biaya_material_total)}
                </p>
                <p className="text-[10px] text-slate-500">Plat, Besi, Interior</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Biaya Jasa / Upah</span>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {formatRupiah(hpp.biaya_jasa_total || hpp.biaya_tenaga_kerja || 0)}
                </p>
                <p className="text-[10px] text-slate-500">Tukang Las & Finishing</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Overhead & SRUT</span>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {formatRupiah((Number(hpp.biaya_overhead) || 0) + (Number(hpp.biaya_srut_perizinan) || 0))}
                </p>
                <p className="text-[10px] text-slate-500">Workshop & Perizinan</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-700 block uppercase">Target Jual (+{hpp.margin_persen}%)</span>
                <p className="text-base font-black text-blue-700 mt-0.5">
                  {formatRupiah(hpp.target_jual)}
                </p>
                <p className="text-[10px] text-slate-500">Total HPP: {formatRupiah(hpp.total_hpp)}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal: Hitung HPP Unit Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Kalkulator HPP Produksi Karoseri Dinamis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tambahkan atau kurangkan rincian material & jasa sesuai kebutuhan pengerjaan
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitHPP} className="space-y-5 text-xs sm:text-sm">
              
              {/* Info Dasar Proyek */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nama Proyek / Unit Karoseri *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembuatan Karoseri Box Pendingin Traga"
                    value={namaProyek}
                    onChange={(e) => setNamaProyek(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Klien / Pemesan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Trans Logistik"
                    value={klien}
                    onChange={(e) => setKlien(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Chassis Kendaraan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Isuzu Traga / Mitsubishi Canter / Wuling Mitra EV"
                    value={tipeUnit}
                    onChange={(e) => setTipeUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Produksi</label>
                  <select
                    value={statusProduksi}
                    onChange={(e) => setStatusProduksi(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Persiapan">Persiapan</option>
                    <option value="Dalam Pengerjaan">Dalam Pengerjaan</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* SECTION 1: RINCIAN MATERIAL (BISA TAMBAH & KURANG) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      1. Rincian Pemakaian Material (Plat, Besi, Interior & Komponen):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addMaterialRow}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Material
                  </button>
                </div>

                <div className="space-y-2">
                  {materialRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-12 gap-2 p-2.5 bg-white rounded-xl border border-slate-200 items-center">
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama Material</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Plat SS 304"
                          value={row.nama_material}
                          onChange={(e) => updateMaterialRow(row.id, 'nama_material', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ukuran / Spesifikasi</label>
                        <input
                          type="text"
                          placeholder="e.g. 1.2 x 2.4 m x 1.5 mm"
                          value={row.ukuran_spesifikasi}
                          onChange={(e) => updateMaterialRow(row.id, 'ukuran_spesifikasi', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jumlah</label>
                        <input
                          type="number"
                          min="1"
                          value={row.jumlah}
                          onChange={(e) => updateMaterialRow(row.id, 'jumlah', Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center font-bold"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Satuan</label>
                        <input
                          type="text"
                          value={row.satuan}
                          onChange={(e) => updateMaterialRow(row.id, 'satuan', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Harga Satuan (Rp)</label>
                        <input
                          type="number"
                          min="0"
                          value={row.harga_satuan}
                          onChange={(e) => updateMaterialRow(row.id, 'harga_satuan', Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs text-right font-semibold"
                        />
                      </div>

                      <div className="col-span-10 sm:col-span-1 text-right">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Subtotal</label>
                        <span className="font-bold text-slate-900 text-xs block truncate">
                          {formatRupiah(row.total)}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1 text-center">
                        <label className="block text-[10px] text-transparent mb-0.5">Aksi</label>
                        <button
                          type="button"
                          onClick={() => removeMaterialRow(row.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right text-xs font-bold text-slate-800 pt-1">
                  Total Biaya Material: <span className="text-blue-700 text-sm font-black">{formatRupiah(totalBiayaMaterial)}</span>
                </div>
              </div>

              {/* SECTION 2: RINCIAN JASA & UPAH (BISA TAMBAH & KURANG) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      2. Rincian Jasa & Upah Pekerjaan (Tukang Las, Cat Oven, Instalasi):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addJasaRow}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Jasa
                  </button>
                </div>

                <div className="space-y-2">
                  {jasaRows.map((jasa) => (
                    <div key={jasa.id} className="grid grid-cols-12 gap-2 p-2.5 bg-white rounded-xl border border-slate-200 items-center">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nama Jasa / Pekerjaan</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jasa Pengelasan Rangka"
                          value={jasa.nama_jasa}
                          onChange={(e) => updateJasaRow(jasa.id, 'nama_jasa', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Rincian / Lingkup Kerja</label>
                        <input
                          type="text"
                          placeholder="Keterangan pekerjaan teknisi"
                          value={jasa.rincian_pekerjaan}
                          onChange={(e) => updateJasaRow(jasa.id, 'rincian_pekerjaan', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>

                      <div className="col-span-10 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Biaya Jasa (Rp)</label>
                        <input
                          type="number"
                          min="0"
                          value={jasa.biaya_jasa}
                          onChange={(e) => updateJasaRow(jasa.id, 'biaya_jasa', Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs text-right font-bold text-emerald-800"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 text-center">
                        <label className="block text-[10px] text-transparent mb-0.5">Aksi</label>
                        <button
                          type="button"
                          onClick={() => removeJasaRow(jasa.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                          title="Hapus jasa ini"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right text-xs font-bold text-slate-800 pt-1">
                  Total Biaya Jasa: <span className="text-emerald-700 text-sm font-black">{formatRupiah(totalBiayaJasa)}</span>
                </div>
              </div>

              {/* SECTION 3: OVERHEAD, SRUT & MARGIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Overhead Workshop (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={biayaOverhead}
                    onChange={(e) => setBiayaOverhead(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengurusan Dokumen SRUT (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={biayaSrut}
                    onChange={(e) => setBiayaSrut(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Margin Laba (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={marginPersen}
                    onChange={(e) => setMarginPersen(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-blue-700 bg-white"
                  />
                </div>
              </div>

              {/* Total Calculation Display Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <p className="text-xs text-slate-400">Total HPP Produksi (Material + Jasa + Overhead + SRUT):</p>
                  <p className="text-lg font-black text-slate-100">{formatRupiah(totalHPP)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-400 font-semibold">Rekomendasi Harga Jual (+{marginPersen}%):</p>
                  <p className="text-xl font-black text-white">{formatRupiah(rekomendasiHargaJual)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan HPP Karoseri
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
