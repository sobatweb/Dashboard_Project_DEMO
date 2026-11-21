import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PieChart, 
  Plus, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Edit2
} from 'lucide-react';
import type { MonthlyBudgetItem } from '../types';
import { formatRupiah } from '../services/utils';
import { APP_CONFIG } from '../config';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const AnggaranPage: React.FC = () => {
  const { monthlyBudgetList, addOrUpdateMonthlyBudget } = useApp();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Form State
  const [formData, setFormData] = useState<MonthlyBudgetItem>({
    id: '',
    tahun: 2026,
    bulan: 11,
    nama_bulan: 'November',
    kategori: 'Bahan Baku & Material Karoseri',
    rencana_anggaran: 50000000,
    realisasi_biaya: 0,
    selisih: 50000000,
    persentase_terpakai: 0,
    status_evaluasi: 'Aman',
    keterangan: ''
  });

  // Filter list by selected year
  const yearBudgets = monthlyBudgetList.filter(b => Number(b.tahun) === selectedYear);

  // Stats calculation for the year
  const totalYearBudget = yearBudgets.reduce((acc, curr) => acc + Number(curr.rencana_anggaran), 0);
  const totalYearActual = yearBudgets.reduce((acc, curr) => acc + Number(curr.realisasi_biaya), 0);
  const totalYearSelisih = totalYearBudget - totalYearActual;
  const averageAbsorption = totalYearBudget > 0 ? (totalYearActual / totalYearBudget) * 100 : 0;

  // Filter by search & status
  const filteredBudgets = yearBudgets.filter(item => {
    const matchesSearch = item.nama_bulan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.keterangan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || item.status_evaluasi === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (item: MonthlyBudgetItem) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setFormData({
      id: `BGT-${selectedYear}-${Date.now().toString().slice(-4)}`,
      tahun: selectedYear,
      bulan: 1,
      nama_bulan: 'Januari',
      kategori: 'Bahan Baku & Material Karoseri',
      rencana_anggaran: 50000000,
      realisasi_biaya: 0,
      selisih: 50000000,
      persentase_terpakai: 0,
      status_evaluasi: 'Aman',
      keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rencana_anggaran <= 0) return;

    const rencana = Number(formData.rencana_anggaran);
    const realisasi = Number(formData.realisasi_biaya);
    const selisih = rencana - realisasi;
    const persentase = rencana > 0 ? Math.round((realisasi / rencana) * 100) : 0;
    
    let status_evaluasi: 'Aman' | 'Sesuai' | 'Overbudget' = 'Aman';
    if (persentase > 100) status_evaluasi = 'Overbudget';
    else if (persentase >= 95) status_evaluasi = 'Sesuai';

    const itemToSave: MonthlyBudgetItem = {
      ...formData,
      id: formData.id || `BGT-${formData.tahun}-${String(formData.bulan).padStart(2, '0')}`,
      nama_bulan: NAMA_BULAN[formData.bulan - 1] || 'Januari',
      rencana_anggaran: rencana,
      realisasi_biaya: realisasi,
      selisih,
      persentase_terpakai: persentase,
      status_evaluasi
    };

    await addOrUpdateMonthlyBudget(itemToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-6 h-6 text-slate-800" />
            Rencana Anggaran vs Realisasi Bulanan (Budget vs Actual)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Monitoring anggaran belanja tiap bulan per tahun operasional • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Selector Tahun */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent pr-2 focus:outline-none cursor-pointer"
            >
              <option value={2025}>Tahun 2025</option>
              <option value={2026}>Tahun 2026</option>
              <option value={2027}>Tahun 2027</option>
            </select>
          </div>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Atur Anggaran Bulan
          </button>
        </div>
      </div>

      {/* 4 Kartu Ringkasan Tahunan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Anggaran Tahun {selectedYear}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatRupiah(totalYearBudget)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Alokasi pagu tahunan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Realisasi Belanja
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatRupiah(totalYearActual)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Biaya aktual yang telah keluar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Sisa Anggaran (Deviasi)
          </span>
          <h3 className={`text-xl sm:text-2xl font-black mt-2 ${totalYearSelisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {totalYearSelisih >= 0 ? `+ ${formatRupiah(totalYearSelisih)}` : formatRupiah(totalYearSelisih)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {totalYearSelisih >= 0 ? 'Surplus / Hemat Anggaran' : 'Peringatan: Overbudget'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Rata-rata Penyerapan
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {averageAbsorption.toFixed(1)}%
          </h3>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${averageAbsorption > 100 ? 'bg-rose-600' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(averageAbsorption, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari bulan atau kategori anggaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['Semua', 'Aman', 'Sesuai', 'Overbudget'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                filterStatus === status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Anggaran Bulanan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-32">Bulan & Tahun</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700">Kategori Alokasi Biaya</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Target Anggaran</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Realisasi Aktual</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Sisa / Selisih</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-36">Penyerapan (%)</th>
                <th className="py-3.5 px-3 font-bold text-center border-r border-slate-700 w-28">Status</th>
                <th className="py-3.5 px-4 font-bold">Keterangan</th>
                <th className="py-3.5 px-3 font-bold text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-semibold">
                    Belum ada anggaran bulanan untuk tahun {selectedYear}. Klik "Atur Anggaran Bulan" untuk membuat.
                  </td>
                </tr>
              ) : (
                filteredBudgets.map((item) => {
                  const isOver = item.status_evaluasi === 'Overbudget';
                  const pct = item.persentase_terpakai;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                        {item.nama_bulan} {item.tahun}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 border-r border-slate-100">
                        {item.kategori}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                        {formatRupiah(item.rencana_anggaran)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 border-r border-slate-100 whitespace-nowrap">
                        {formatRupiah(item.realisasi_biaya)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold border-r border-slate-100 whitespace-nowrap ${
                        item.selisih >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {item.selisih >= 0 ? `+ ${formatRupiah(item.selisih)}` : formatRupiah(item.selisih)}
                      </td>
                      <td className="py-3.5 px-4 border-r border-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden w-16">
                            <div 
                              className={`h-full rounded-full ${isOver ? 'bg-rose-600' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${isOver ? 'text-rose-700' : 'text-slate-800'}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isOver
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : item.status_evaluasi === 'Sesuai'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}>
                          {isOver ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {item.status_evaluasi}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {item.keterangan || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit alokasi anggaran bulan ini"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Atur Anggaran Bulan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Alokasi Anggaran Bulanan ({formData.nama_bulan} {formData.tahun})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Anggaran *</label>
                  <select
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Bulan *</label>
                  <select
                    value={formData.bulan}
                    onChange={(e) => {
                      const bNum = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        bulan: bNum,
                        nama_bulan: NAMA_BULAN[bNum - 1] || 'Januari'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    {NAMA_BULAN.map((bName, idx) => (
                      <option key={idx + 1} value={idx + 1}>{bName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Alokasi Biaya *</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                >
                  <option value="Bahan Baku & Material Karoseri">Bahan Baku & Material (Plat, Besi, Interior)</option>
                  <option value="Upah Tenaga Kerja & Welder">Upah Tenaga Kerja & Welder Karoseri</option>
                  <option value="Operasional & Listrik Workshop">Operasional Workshop & Listrik PLN</option>
                  <option value="Pengurusan Dokumen SRUT & Legalitas">Pengurusan Dokumen SRUT & Uji Tipe Dishub</option>
                  <option value="Overhead & Perawatan Mesin">Overhead & Perawatan Alat Las</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rencana Anggaran (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.rencana_anggaran}
                    onChange={(e) => setFormData({ ...formData, rencana_anggaran: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Realisasi Biaya Saat Ini (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.realisasi_biaya}
                    onChange={(e) => setFormData({ ...formData, realisasi_biaya: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Evaluasi</label>
                <textarea
                  rows={3}
                  placeholder="Catatan efisiensi atau kebutuhan khusus bulan ini..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Anggaran Bulan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
