import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Boxes, 
  Plus, 
  MinusCircle, 
  Search, 
  History, 
  PackagePlus,
  Layers
} from 'lucide-react';
import type { StokItem } from '../types';
import { formatDateClean, formatRupiah, getTodayDateString } from '../services/utils';
import { APP_CONFIG } from '../config';

export const StokPage: React.FC = () => {
  const { stokList, mutasiList, addOrUpdateStok, recordMutasi, currentAdmin } = useApp();

  const [activeTab, setActiveTab] = useState<'daftar' | 'mutasi'>('daftar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState(false);

  // Form State: Add/Edit Item
  const [formData, setFormData] = useState<Partial<StokItem>>({
    kode_barang: '',
    nama_barang: '',
    kategori: 'Plat',
    spesifikasi: '',
    satuan: 'Lembar',
    stok_masuk: 0,
    terpakai: 0,
    harga_satuan: 0,
    lokasi_gudang: 'Gudang Karoseri A'
  });

  // Form State: Record Usage / In
  const [mutasiForm, setMutasiForm] = useState({
    kode_barang: '',
    jenis_mutasi: 'Terpakai' as 'Masuk' | 'Terpakai' | 'Keluar',
    jumlah: 1,
    keterangan: '',
    pj_admin: currentAdmin.name
  });

  const filteredStok = stokList.filter(item => {
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.spesifikasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedKategori === 'Semua' || item.kategori === selectedKategori;
    return matchesSearch && matchesCat;
  });

  const categories = ['Semua', 'Plat', 'Besi', 'Interior', 'Alat Medis', 'Elektrikal'];

  const handleSubmitNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode_barang || !formData.nama_barang) return;

    await addOrUpdateStok({
      kode_barang: formData.kode_barang.toUpperCase(),
      nama_barang: formData.nama_barang,
      kategori: formData.kategori || 'Plat',
      spesifikasi: formData.spesifikasi || '',
      satuan: formData.satuan || 'Lembar',
      stok_masuk: Number(formData.stok_masuk) || 0,
      terpakai: Number(formData.terpakai) || 0,
      sisa_barang: (Number(formData.stok_masuk) || 0) - (Number(formData.terpakai) || 0),
      harga_satuan: Number(formData.harga_satuan) || 0,
      lokasi_gudang: formData.lokasi_gudang || 'Gudang Karoseri',
      status_stok: 'Aman',
      updated_at: new Date().toISOString().split('T')[0]
    });

    setIsAddModalOpen(false);
    setFormData({
      kode_barang: '',
      nama_barang: '',
      kategori: 'Plat',
      spesifikasi: '',
      satuan: 'Lembar',
      stok_masuk: 0,
      terpakai: 0,
      harga_satuan: 0,
      lokasi_gudang: 'Gudang Karoseri A'
    });
  };

  const handleOpenMutasiModal = (item?: StokItem, defaultType: 'Masuk' | 'Terpakai' = 'Terpakai') => {
    const targetItem = item || stokList[0];
    setMutasiForm({
      kode_barang: targetItem ? targetItem.kode_barang : '',
      jenis_mutasi: defaultType,
      jumlah: 1,
      keterangan: '',
      pj_admin: currentAdmin.name
    });
    setIsMutasiModalOpen(true);
  };

  const handleSubmitMutasi = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = stokList.find(s => s.kode_barang === mutasiForm.kode_barang);
    if (!item) return;

    await recordMutasi({
      tanggal: getTodayDateString(),
      kode_barang: mutasiForm.kode_barang,
      nama_barang: item.nama_barang,
      jenis_mutasi: mutasiForm.jenis_mutasi,
      jumlah: Number(mutasiForm.jumlah),
      keterangan: mutasiForm.keterangan || (mutasiForm.jenis_mutasi === 'Masuk' ? 'Restock bahan' : 'Pemakaian pengerjaan karoseri'),
      pj_admin: currentAdmin.name
    });

    setIsMutasiModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-300">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-700" />
            Stok Material Karoseri (Masuk, Terpakai & Sisa)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Pengelolaan bahan baku karoseri (Plat SS, Besi Hollow, Plat Bordes & Perlengkapan) • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenMutasiModal(undefined, 'Terpakai')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black shadow-sm transition cursor-pointer"
          >
            <MinusCircle className="w-4 h-4 text-amber-400" />
            CATAT PEMAKAIAN BAHAN
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            TAMBAH MATERIAL BARU
          </button>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="flex border-b-2 border-slate-300 gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition cursor-pointer ${
            activeTab === 'daftar'
              ? 'border-blue-700 text-blue-800 font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Daftar Stok & Sisa Material Gudang ({stokList.length})
        </button>
        <button
          onClick={() => setActiveTab('mutasi')}
          className={`pb-3 flex items-center gap-2 border-b-4 transition cursor-pointer ${
            activeTab === 'mutasi'
              ? 'border-blue-700 text-blue-800 font-black'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Riwayat Mutasi Masuk / Keluar ({mutasiList.length})
        </button>
      </div>

      {activeTab === 'daftar' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode, nama material, ukuran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedKategori(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border-2 ${
                    selectedKategori === cat
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stok Table */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-900 font-bold">
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Material</th>
                    <th className="py-3 px-4">Kategori & Spesifikasi</th>
                    <th className="py-3 px-3 text-center">Masuk</th>
                    <th className="py-3 px-3 text-center">Terpakai</th>
                    <th className="py-3 px-3 text-center">Sisa Stok</th>
                    <th className="py-3 px-4 text-right">Harga Satuan</th>
                    <th className="py-3 px-4 text-right">Total Nilai</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStok.map((item) => {
                    const totalNilai = Number(item.sisa_barang) * Number(item.harga_satuan);
                    return (
                      <tr key={item.kode_barang} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-black text-slate-800">
                          {item.kode_barang}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          {item.nama_barang}
                          <span className="block text-xs font-normal text-slate-500">{item.lokasi_gudang}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-300 mb-0.5">
                            {item.kategori}
                          </span>
                          <p className="text-xs text-slate-600 font-medium">{item.spesifikasi}</p>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                          {item.stok_masuk} {item.satuan}
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-amber-700">
                          {item.terpakai} {item.satuan}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="text-base font-black text-slate-950">
                            {item.sisa_barang}
                          </span>{' '}
                          <span className="text-xs text-slate-600 font-bold">{item.satuan}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                          {formatRupiah(item.harga_satuan)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-950">
                          {formatRupiah(totalNilai)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${
                            item.status_stok === 'Aman'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : item.status_stok === 'Menipis'
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-red-50 border-red-300 text-red-800'
                          }`}>
                            {item.status_stok}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenMutasiModal(item, 'Terpakai')}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black border border-amber-300 transition cursor-pointer"
                              title="Catat Terpakai di Bengkel"
                            >
                              - PAKAI
                            </button>
                            <button
                              onClick={() => handleOpenMutasiModal(item, 'Masuk')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-black border border-emerald-300 transition cursor-pointer"
                              title="Catat Stok Masuk Baru"
                            >
                              + MASUK
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Riwayat Mutasi */}
      {activeTab === 'mutasi' && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
          <div className="p-4 border-b-2 border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Buku Catatan Keluar / Masuk Material Gudang</span>
            <span>Tersinkron ke Google Sheet: Mutasi_Stok</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-3 px-4">ID Mutasi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Barang / Kode</th>
                  <th className="py-3 px-3 text-center">Jenis</th>
                  <th className="py-3 px-3 text-center">Jumlah</th>
                  <th className="py-3 px-4">Keperluan Karoseri</th>
                  <th className="py-3 px-4">Petugas Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {mutasiList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.id}</td>
                    <td className="py-3 px-4 text-slate-900 font-mono text-xs">{formatDateClean(m.tanggal)}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{m.nama_barang}</p>
                      <p className="text-[11px] font-mono text-slate-500">{m.kode_barang}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${
                        m.jenis_mutasi === 'Masuk' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        {m.jenis_mutasi}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-900 text-sm">
                      {m.jumlah}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{m.keterangan}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{m.pj_admin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Material */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in border-2 border-slate-400">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-700" />
              Tambah Material Karoseri Baru
            </h3>

            <form onSubmit={handleSubmitNewItem} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Kode Barang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PLT-SS03 / MED-05"
                    value={formData.kode_barang}
                    onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                  >
                    <option value="Plat">Plat (Stainless Steel / Bordes)</option>
                    <option value="Besi">Besi (Hollow Rangka / Siku)</option>
                    <option value="Interior">Interior (Polywood / Vinyl Medis)</option>
                    <option value="Alat Medis">Alat Medis (Stretcher / Tabung O2)</option>
                    <option value="Elektrikal">Elektrikal (Lampu Strobo / Sirine)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Plat Stainless Steel 304 Tebal 1.2mm"
                  value={formData.nama_barang}
                  onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Spesifikasi Detail (Ukuran, Dimensi)</label>
                <input
                  type="text"
                  placeholder="Contoh: 1.2 x 2.4 m x 1.2 mm Hairline"
                  value={formData.spesifikasi}
                  onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Satuan</label>
                  <select
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                  >
                    <option value="Lembar">Lembar</option>
                    <option value="Batang">Batang</option>
                    <option value="Unit">Unit</option>
                    <option value="Set">Set</option>
                    <option value="Meter">Meter</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Stok Masuk</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stok_masuk}
                    onChange={(e) => setFormData({ ...formData, stok_masuk: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300 text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Terpakai</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.terpakai}
                    onChange={(e) => setFormData({ ...formData, terpakai: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Harga Beli Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.harga_satuan}
                    onChange={(e) => setFormData({ ...formData, harga_satuan: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300 font-black text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Lokasi Rak Gudang</label>
                  <input
                    type="text"
                    value={formData.lokasi_gudang}
                    onChange={(e) => setFormData({ ...formData, lokasi_gudang: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black shadow-md cursor-pointer"
                >
                  SIMPAN MATERIAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Pemakaian */}
      {isMutasiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in border-2 border-slate-400">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-700" />
              Catat Pemakaian / Mutasi Bahan
            </h3>

            <form onSubmit={handleSubmitMutasi} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Pilih Material Karoseri *</label>
                <select
                  value={mutasiForm.kode_barang}
                  onChange={(e) => setMutasiForm({ ...mutasiForm, kode_barang: e.target.value })}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-300 font-bold"
                >
                  {stokList.map(s => (
                    <option key={s.kode_barang} value={s.kode_barang}>
                      [{s.kode_barang}] {s.nama_barang} (Sisa: {s.sisa_barang} {s.satuan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Jenis Mutasi *</label>
                  <select
                    value={mutasiForm.jenis_mutasi}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, jenis_mutasi: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                  >
                    <option value="Terpakai">Terpakai di Bengkel</option>
                    <option value="Masuk">Masuk (Beli / Restock)</option>
                    <option value="Keluar">Keluar (Reject / Rusak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Jumlah *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mutasiForm.jumlah}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, jumlah: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300 text-center font-black text-sm text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Keperluan Proyek Karoseri</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pemasangan Karoseri Ambulance Wuling EV Pak Gerry"
                  value={mutasiForm.keterangan}
                  onChange={(e) => setMutasiForm({ ...mutasiForm, keterangan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMutasiModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-black shadow-md cursor-pointer"
                >
                  SIMPAN MUTASI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
