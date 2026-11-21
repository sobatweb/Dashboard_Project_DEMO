import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  WalletCards, 
  Plus, 
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Tag,
  BookOpen,
  Printer,
  List,
  Layers
} from 'lucide-react';
import type { AccountCode } from '../types';
import { formatDateClean, formatRupiah, getTodayDateString } from '../services/utils';
import { APP_CONFIG } from '../config';

export const GeneralLedgerPage: React.FC = () => {
  const { ledgerList, addLedgerEntry, accountCodeList, addAccountCode, currentAdmin } = useApp();

  const [selectedAkun, setSelectedAkun] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'akun' | 'jurnal'>('akun');
  
  // Modals
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Form State Transaksi Baru
  const [trxData, setTrxData] = useState({
    tanggal: getTodayDateString(),
    kode_akun: accountCodeList[0]?.kode || '1100-00-010',
    jenis: 'masuk' as 'masuk' | 'keluar',
    kategori: 'Pendapatan Karoseri',
    deskripsi: '',
    nominal: 0,
    bukti_nota: '',
    pic_admin: currentAdmin.name
  });

  // Form State Buat Kode Akun Baru
  const [newAccount, setNewAccount] = useState<AccountCode>({
    kode: '',
    nama: '',
    kategori: 'Kas',
    saldo_awal: 0,
    keterangan: ''
  });

  // Filter list transaksi
  const filteredList = ledgerList.filter(item => {
    const matchesAkun = selectedAkun === 'Semua' || item.kode_akun === selectedAkun;
    const matchesSearch = item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.bukti_nota.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.kode_akun && item.kode_akun.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAkun && matchesSearch;
  });

  // Hitung total Debit dan Kredit
  const totalDebit = filteredList.reduce((acc, curr) => acc + (Number(curr.kas_masuk) || 0), 0);
  const totalCredit = filteredList.reduce((acc, curr) => acc + (Number(curr.kas_keluar) || 0), 0);
  const endingBalance = ledgerList.length > 0 ? ledgerList[ledgerList.length - 1].saldo : 0;

  // Handle Simpan Transaksi Baru
  const handleSubmitTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxData.deskripsi || trxData.nominal <= 0) return;

    const matchedAccount = accountCodeList.find(a => a.kode === trxData.kode_akun);
    const nama_akun = matchedAccount ? matchedAccount.nama : trxData.kode_akun;

    await addLedgerEntry({
      tanggal: trxData.tanggal,
      kode_akun: trxData.kode_akun,
      nama_akun,
      kategori: trxData.kategori,
      deskripsi: trxData.deskripsi,
      kas_masuk: trxData.jenis === 'masuk' ? Number(trxData.nominal) : 0,
      kas_keluar: trxData.jenis === 'keluar' ? Number(trxData.nominal) : 0,
      bukti_nota: trxData.bukti_nota || 'BKK-001',
      pic_admin: currentAdmin.name
    });

    setIsTrxModalOpen(false);
    setTrxData({
      tanggal: getTodayDateString(),
      kode_akun: accountCodeList[0]?.kode || '1100-00-010',
      jenis: 'masuk',
      kategori: 'Pendapatan Karoseri',
      deskripsi: '',
      nominal: 0,
      bukti_nota: '',
      pic_admin: currentAdmin.name
    });
  };

  // Handle Simpan Kode Akun Baru
  const handleSubmitNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.kode || !newAccount.nama) return;

    addAccountCode(newAccount);
    setIsAccountModalOpen(false);
    setNewAccount({
      kode: '',
      nama: '',
      kategori: 'Kas',
      saldo_awal: 0,
      keterangan: ''
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Accounts to display in grouped mode
  const displayedAccounts = accountCodeList.filter(acc => 
    selectedAkun === 'Semua' || acc.kode === selectedAkun
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-slate-800" />
            Buku Besar Kas & Bank (General Ledger)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Format Ledger Real Currency & Master Kode Akun • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Cetak */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Cetak Ledger
          </button>

          {/* Tombol Buat Kode Akun Baru */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Tag className="w-4 h-4 text-blue-600" />
            + Kode Akun Baru
          </button>

          {/* Tombol Catat Transaksi */}
          <button
            onClick={() => {
              setTrxData(prev => ({ ...prev, pic_admin: currentAdmin.name }));
              setIsTrxModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Catat Transaksi
          </button>
        </div>
      </div>

      {/* Daftar Kode Akun Tersedia (Pill Bar) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Master Kode Akun Aktif:
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Total {accountCodeList.length} Akun Terdaftar
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button 
            onClick={() => setSelectedAkun('Semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              selectedAkun === 'Semua'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            Semua Akun
          </button>
          {accountCodeList.map((acc) => (
            <button 
              key={acc.kode}
              onClick={() => setSelectedAkun(selectedAkun === acc.kode ? 'Semua' : acc.kode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-2 ${
                selectedAkun === acc.kode 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-mono font-bold text-blue-600">{acc.kode}</span>
              <span>{acc.nama}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Cards: Saldo, Total Masuk, Total Keluar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
            Total Kas Masuk (Debit)
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {formatRupiah(totalDebit)}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Penerimaan kas, DP & pelunasan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
            Total Kas Keluar (Credit)
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {formatRupiah(totalCredit)}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Beli material, upah tukang & utilitas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
            Saldo Kas Berjalan (Real Time)
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <WalletCards className="w-5 h-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-blue-900">
              {formatRupiah(endingBalance)}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Total saldo di kas & rekening bank</p>
        </div>
      </div>

      {/* Filter & View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi, bukti nota, uraian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('akun')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'akun' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Format Real Currency
            </button>
            <button
              onClick={() => setViewMode('jurnal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'jurnal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabel Jurnal
            </button>
          </div>

          <select
            value={selectedAkun}
            onChange={(e) => setSelectedAkun(e.target.value)}
            className="w-full sm:w-56 p-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="Semua">Semua Kode Akun</option>
            {accountCodeList.map((acc) => (
              <option key={acc.kode} value={acc.kode}>
                {acc.kode} - {acc.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: FORMAT REAL CURRENCY (Sesuai Foto / Standar Akuntansi) */}
      {viewMode === 'akun' && (
        <div className="space-y-6">
          {displayedAccounts.map((account) => {
            const accTransactions = ledgerList.filter(item => {
              const match = item.kode_akun === account.kode;
              const matchesSearch = item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.bukti_nota.toLowerCase().includes(searchTerm.toLowerCase());
              return match && matchesSearch;
            });

            const initialBalance = account.saldo_awal || 0;
            const accDebit = accTransactions.reduce((acc, curr) => acc + (Number(curr.kas_masuk) || 0), 0);
            const accCredit = accTransactions.reduce((acc, curr) => acc + (Number(curr.kas_keluar) || 0), 0);
            const mutation = accDebit - accCredit;
            const accEndingBalance = initialBalance + mutation;

            let runningBal = initialBalance;

            return (
              <div key={account.kode} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Account Header Strip (Sesuai Foto Ledger - Real Currency) */}
                <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-blue-700 text-sm sm:text-base">
                      {account.kode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {account.nama}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {account.kategori}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-600 text-xs sm:text-sm">
                    IDR
                  </span>
                </div>

                {/* Table Per Akun */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-white text-slate-600 border-b border-slate-200 text-xs">
                        <th className="py-2.5 px-4 font-semibold w-28">Date</th>
                        <th className="py-2.5 px-4 font-semibold w-16">Tp</th>
                        <th className="py-2.5 px-4 font-semibold w-28">Ref. No.</th>
                        <th className="py-2.5 px-4 font-semibold">Description</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-36">Debit</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-36">Credit</th>
                        <th className="py-2.5 px-4 font-semibold text-right w-36">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      {/* Saldo Awal Row */}
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="py-2.5 px-4 font-sans font-bold text-slate-700">
                          Saldo Awal:
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          {formatRupiah(initialBalance)}
                        </td>
                      </tr>

                      {accTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 px-4 text-center text-slate-400 font-sans italic">
                            Belum ada mutasi transaksi pada akun ini.
                          </td>
                        </tr>
                      ) : (
                        accTransactions.map((trx) => {
                          const debit = Number(trx.kas_masuk) || 0;
                          const credit = Number(trx.kas_keluar) || 0;
                          runningBal = runningBal + debit - credit;
                          const tp = debit > 0 ? 'CR' : 'CD';

                          return (
                            <tr key={trx.id_transaksi} className="hover:bg-slate-50/80 transition">
                              <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap">
                                {formatDateClean(trx.tanggal)}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-500">
                                {tp}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                                {trx.bukti_nota}
                              </td>
                              <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                                {trx.deskripsi}
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                                {debit > 0 ? formatRupiah(debit) : '-'}
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold text-rose-700 whitespace-nowrap">
                                {credit > 0 ? formatRupiah(credit) : '-'}
                              </td>
                              <td className="py-2.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                                {formatRupiah(runningBal)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Account Footer Summary (Sesuai Foto) */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-xs sm:text-sm font-semibold flex flex-col md:flex-row justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Beginning Balance : IDR</span>
                      <span className="font-mono font-bold text-slate-900">{formatRupiah(initialBalance)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Ending Balance : IDR</span>
                      <span className="font-mono font-bold text-blue-900">{formatRupiah(accEndingBalance)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 md:text-right">
                    <div className="flex md:justify-end items-center gap-4">
                      <span className="text-slate-500">Total :</span>
                      <span className="font-mono text-emerald-700 font-bold">Debit: {formatRupiah(accDebit)}</span>
                      <span className="font-mono text-rose-700 font-bold">Credit: {formatRupiah(accCredit)}</span>
                    </div>
                    <div className="flex md:justify-end items-center gap-2">
                      <span className="text-slate-500">Mutation : IDR</span>
                      <span className={`font-mono font-bold ${mutation >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatRupiah(mutation)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABEL JURNAL TRANSAKSI LENGKAP */}
      {viewMode === 'jurnal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-28">Tanggal</th>
                  <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-32">Kode Akun</th>
                  <th className="py-3.5 px-4 font-bold border-r border-slate-700">Nama Akun</th>
                  <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-32">No. Bukti</th>
                  <th className="py-3.5 px-4 font-bold border-r border-slate-700">Deskripsi / Uraian</th>
                  <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Debit (Masuk)</th>
                  <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Kredit (Keluar)</th>
                  <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Saldo</th>
                  <th className="py-3.5 px-4 font-bold w-28">Admin PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 font-semibold">
                      Belum ada transaksi pada akun yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id_transaksi} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                        {formatDateClean(item.tanggal)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 border-r border-slate-100 whitespace-nowrap">
                        {item.kode_akun || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium border-r border-slate-100 whitespace-nowrap">
                        {item.nama_akun || item.kategori}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {item.bukti_nota}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 border-r border-slate-100">
                        {item.deskripsi}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 border-r border-slate-100 whitespace-nowrap">
                        {Number(item.kas_masuk) > 0 ? formatRupiah(item.kas_masuk) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-700 border-r border-slate-100 whitespace-nowrap">
                        {Number(item.kas_keluar) > 0 ? formatRupiah(item.kas_keluar) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 border-r border-slate-100 whitespace-nowrap">
                        {formatRupiah(item.saldo)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {item.pic_admin}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Catat Transaksi Baru */}
      {isTrxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <WalletCards className="w-5 h-5 text-blue-600" />
                Catat Transaksi Buku Besar
              </h3>
              <button
                onClick={() => setIsTrxModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTrx} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    required
                    min={getTodayDateString()}
                    value={trxData.tanggal}
                    onChange={(e) => setTrxData({ ...trxData, tanggal: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">Tanggal berlaku per hari ini & seterusnya</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Mutasi *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTrxData({ ...trxData, jenis: 'masuk' })}
                      className={`py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
                        trxData.jenis === 'masuk'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      Debit (Masuk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrxData({ ...trxData, jenis: 'keluar' })}
                      className={`py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
                        trxData.jenis === 'keluar'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      Kredit (Keluar)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Kode Akun *</label>
                <select
                  value={trxData.kode_akun}
                  onChange={(e) => setTrxData({ ...trxData, kode_akun: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  {accountCodeList.map((acc) => (
                    <option key={acc.kode} value={acc.kode}>
                      {acc.kode} - {acc.nama} ({acc.kategori})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi / Uraian Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembayaran DP Karoseri Ambulance PT Medika"
                  value={trxData.deskripsi}
                  onChange={(e) => setTrxData({ ...trxData, deskripsi: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={trxData.nominal}
                    onChange={(e) => setTrxData({ ...trxData, nominal: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Bukti / Ref Nota</label>
                  <input
                    type="text"
                    placeholder="Contoh: BKK-018 / INV-001"
                    value={trxData.bukti_nota}
                    onChange={(e) => setTrxData({ ...trxData, bukti_nota: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTrxModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Buat Kode Akun Baru */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Tambah Master Kode Akun Baru
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewAccount} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kode Akun *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1100-00-030 atau 1200-00-020"
                  value={newAccount.kode}
                  onChange={(e) => setNewAccount({ ...newAccount, kode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">Format standar: 4 digit - 2 digit - 3 digit</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Akun *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kas Operasional Lapangan / Bank Mandiri"
                  value={newAccount.nama}
                  onChange={(e) => setNewAccount({ ...newAccount, nama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Akun</label>
                  <select
                    value={newAccount.kategori}
                    onChange={(e) => setNewAccount({ ...newAccount, kategori: e.target.value as AccountCode['kategori'] })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="Kas">Kas</option>
                    <option value="Bank">Bank</option>
                    <option value="Piutang">Piutang</option>
                    <option value="Persediaan">Persediaan</option>
                    <option value="Hutang">Hutang</option>
                    <option value="Modal">Modal</option>
                    <option value="Pendapatan">Pendapatan</option>
                    <option value="Biaya">Biaya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={newAccount.saldo_awal}
                    onChange={(e) => setNewAccount({ ...newAccount, saldo_awal: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  placeholder="Opsional: untuk rekening BCA / Kas Kecil Workshop"
                  value={newAccount.keterangan || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, keterangan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Kode Akun
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
