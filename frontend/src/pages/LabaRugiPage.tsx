import React from 'react';
import { TrendingUp, Printer } from 'lucide-react';
import { APP_CONFIG } from '../config';

export const LabaRugiPage: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-800" />
            Laporan Laba / Rugi Komprehensif
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Format Laporan Keuangan Standar Karoseri • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Laporan Laba Rugi
        </button>
      </div>

      {/* Main Statement Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs max-w-4xl mx-auto">
        
        {/* Header Report */}
        <div className="text-center pb-6 mb-6 border-b border-slate-200">
          <img src="/logos.png" alt={APP_CONFIG.COMPANY_NAME} className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {APP_CONFIG.COMPANY_NAME}
          </h3>
          <h4 className="text-base sm:text-lg font-bold text-slate-700 mt-0.5">
            LAPORAN LABA / RUGI (STANDAR)
          </h4>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Periode: 01 Januari 2026 s/d 31 Desember 2026
          </p>
        </div>

        {/* Financial Lines */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-900 font-mono">
          
          {/* 1. Pendapatan */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-900 pb-2 border-b border-slate-300">
              <span className="font-sans uppercase tracking-wide">1. PENDAPATAN OPERASIONAL</span>
              <span>1 Jan - 31 Des 2026</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-slate-700">
              <span className="font-sans">Penjualan Karoseri & Ambulance</span>
              <span className="font-bold">4.086.800.165,00</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-slate-900 border-t border-slate-200">
              <span className="font-sans">JUMLAH PENDAPATAN</span>
              <span className="text-blue-700 font-black">Rp 4.086.800.165,00</span>
            </div>
          </div>

          {/* 2. HPP / COGS */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-slate-900 pb-2 border-b border-slate-300">
              <span className="font-sans uppercase tracking-wide">2. HARGA POKOK PENJUALAN (HPP / COGS)</span>
              <span></span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-slate-700">
              <span className="font-sans">Biaya Material Plat, Besi & Perlengkapan Medis (COGS)</span>
              <span className="font-bold">3.221.411.449,00</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-slate-900 border-t border-slate-200">
              <span className="font-sans">JUMLAH HARGA POKOK PENJUALAN</span>
              <span className="text-slate-900 font-black">Rp 3.221.411.449,00</span>
            </div>
          </div>

          {/* 3. Laba Kotor */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-sm font-bold text-slate-900">
            <span className="font-sans uppercase">LABA KOTOR (GROSS PROFIT)</span>
            <span className="text-base font-black text-blue-700">Rp 865.388.716,00</span>
          </div>

          {/* 4. Beban Operasi */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 pb-2 border-b border-slate-300 font-sans uppercase tracking-wide">
              3. BEBAN OPERASIONAL (EXPENSES)
            </div>
            
            <div className="pl-4 space-y-1.5 text-slate-700">
              <div className="flex justify-between py-0.5">
                <span className="font-sans">BPJS Ketenagakerjaan & Kesehatan</span>
                <span>20.182.677,00</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-sans">Biaya Pemasaran & Iklan</span>
                <span>22.221.693,00</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-sans">Biaya Penyusutan Kendaraan & Peralatan</span>
                <span>43.974.790,00</span>
              </div>
              <div className="flex justify-between py-0.5 font-bold text-slate-900">
                <span className="font-sans">Gaji, Lembur, THR & Upah Tukang Karoseri</span>
                <span>318.740.000,00</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-sans">Biaya Sewa Gedung Bengkel & Kantor</span>
                <span>50.000.000,00</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-sans">Biaya Perjalanan Dinas & Antar Dokumen</span>
                <span>129.467.500,00</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-sans">Biaya Pajak & Legalitas SRUT</span>
                <span>114.588.974,93</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-sans">Listrik, Bensin, Internet & Pemeliharaan Bengkel</span>
                <span>91.426.976,00</span>
              </div>
            </div>

            <div className="flex justify-between py-2 font-bold text-slate-900 border-t border-slate-200">
              <span className="font-sans">JUMLAH BEBAN OPERASIONAL</span>
              <span className="text-rose-700 font-black">Rp 790.602.610,93</span>
            </div>
          </div>

          {/* 5. Pendapatan Operasi */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-sm font-bold text-slate-900">
            <span className="font-sans uppercase">PENDAPATAN OPERASIONAL BERSIH</span>
            <span className="text-base font-black text-slate-900">Rp 74.786.105,07</span>
          </div>

          {/* 6. Pendapatan & Beban Lain */}
          <div className="space-y-1.5 pl-4 text-slate-700">
            <div className="flex justify-between py-0.5">
              <span className="font-sans">Pendapatan Bunga Giro & Simpanan</span>
              <span className="text-emerald-700 font-semibold">+ 430.781,49</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans">Beban Seragam & Administrasi Bank</span>
              <span className="text-rose-700 font-semibold">- 5.741.626,37</span>
            </div>
          </div>

          {/* 7. Laba Bersih */}
          <div className="p-5 bg-emerald-50/70 border border-emerald-300 rounded-xl flex justify-between items-center text-sm sm:text-base font-black text-emerald-950">
            <div>
              <span className="font-sans uppercase tracking-wide">LABA BERSIH TAHUN BERJALAN (NET INCOME)</span>
              <p className="text-xs text-emerald-800 font-semibold mt-0.5 font-sans">
                Laba bersih riil tercatat di kas, bank, dan modal usaha
              </p>
            </div>
            <span className="text-lg sm:text-xl text-emerald-800">
              Rp 69.475.260,19
            </span>
          </div>

        </div>

        {/* Footer info Accurate */}
        <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-xs text-slate-500 font-medium gap-2">
          <span>Laporan Standar Keuangan & Akuntansi Manufaktur</span>
          <span>{APP_CONFIG.COMPANY_NAME}</span>
        </div>

      </div>

    </div>
  );
};
