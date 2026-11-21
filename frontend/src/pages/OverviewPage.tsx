import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Boxes, 
  WalletCards, 
  Calculator, 
  ReceiptText, 
  AlertTriangle, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import { formatDateClean, formatRupiah } from '../services/utils';
import { APP_CONFIG } from '../config';
import { ROLE_PERMISSIONS } from '../types';

export const OverviewPage: React.FC = () => {
  const { 
    stokList, 
    ledgerList, 
    hppList, 
    invoiceList, 
    setActiveTab, 
    currentAdmin 
  } = useApp();

  const allowed = ROLE_PERMISSIONS[currentAdmin.role] || ['stok'];

  const totalSaldoKas = ledgerList.length > 0 ? ledgerList[ledgerList.length - 1].saldo : 0;
  
  const totalNilaiStok = stokList.reduce((acc, curr) => {
    return acc + (Number(curr.sisa_barang) * Number(curr.harga_satuan));
  }, 0);

  const activeProjects = hppList.filter(h => h.status_produksi !== 'Selesai').length;
  
  const totalPiutang = invoiceList
    .filter(i => i.status_bayar === 'Belum Bayar')
    .reduce((acc, curr) => acc + Number(curr.total_tagihan), 0);

  const lowStockItems = stokList.filter(s => s.status_stok === 'Menipis' || s.status_stok === 'Kritis');

  return (
    <div className="space-y-6">
      
      {/* Header Banner - Bersih & Soft (60-30-10) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold uppercase mb-2 border border-slate-200">
              {APP_CONFIG.COMPANY_NAME} • {APP_CONFIG.COMPANY_TAGLINE}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ringkasan Operasional & Keuangan
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              Selamat datang, <strong>{currentAdmin.name}</strong> ({currentAdmin.roleTitle}).
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allowed.includes('quotation') && (
              <button
                onClick={() => setActiveTab('quotation')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Buat SPH Baru
              </button>
            )}
            {allowed.includes('stok') && (
              <button
                onClick={() => setActiveTab('stok')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-slate-600" />
                Cek Stok Gudang
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saldo Kas / Bank */}
        <div 
          onClick={() => allowed.includes('ledger') && setActiveTab('ledger')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas & Bank</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <WalletCards className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(totalSaldoKas)}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">{APP_CONFIG.BANK_NAME} {APP_CONFIG.BANK_ACCOUNT_NO}</p>
          </div>
        </div>

        {/* Card 2: Nilai Stok */}
        <div 
          onClick={() => allowed.includes('stok') && setActiveTab('stok')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Bahan Karoseri</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(totalNilaiStok)}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">{stokList.length} Item Material Terdaftar</p>
          </div>
        </div>

        {/* Card 3: HPP Proyek Aktif */}
        <div 
          onClick={() => allowed.includes('hpp') && setActiveTab('hpp')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proyek Karoseri Aktif</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{activeProjects} Unit SPK</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Sedang Dikerjakan di Workshop</p>
          </div>
        </div>

        {/* Card 4: Tagihan Piutang */}
        <div 
          onClick={() => allowed.includes('invoice') && setActiveTab('invoice')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Belum Lunas</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight">{formatRupiah(totalPiutang)}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {invoiceList.filter(i => i.status_bayar === 'Belum Bayar').length} Tagihan Menunggu
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Stok Menipis + Kas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Stok Menipis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Peringatan Sisa Stok Menipis</h3>
            </div>
            {allowed.includes('stok') && (
              <button
                onClick={() => setActiveTab('stok')}
                className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Lihat Semua Stok →
              </button>
            )}
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <span>Semua stok material karoseri dalam batas aman.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.map((item) => (
                <div key={item.kode_barang} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.nama_barang}</span>
                    <p className="text-xs text-slate-500 font-medium">{item.spesifikasi}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-700 block">
                      Sisa: {item.sisa_barang} {item.satuan}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      (Masuk: {item.stok_masuk} | Pakai: {item.terpakai})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaksi Kas Terakhir */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <WalletCards className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm">Transaksi Kas & Bank Terbaru</h3>
            </div>
            {allowed.includes('ledger') && (
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Buka Buku Besar →
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {ledgerList.slice(-4).reverse().map((trx) => (
              <div key={trx.id_transaksi} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-bold text-slate-900">{trx.deskripsi}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {formatDateClean(trx.tanggal)} • {trx.nama_akun || trx.kode_akun} • PIC: {trx.pic_admin}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className={`font-bold ${trx.kas_masuk > 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {trx.kas_masuk > 0 ? `+ ${formatRupiah(trx.kas_masuk)}` : `- ${formatRupiah(trx.kas_keluar)}`}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Saldo: {formatRupiah(trx.saldo)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
