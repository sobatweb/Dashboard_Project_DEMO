import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ReceiptText, 
  Printer, 
  Plus, 
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { InvoiceItem } from '../types';
import { formatDateClean, formatRupiah, getTodayDateString, angkaKeTerbilang } from '../services/utils';
import { APP_CONFIG } from '../config';

export const InvoicePage: React.FC = () => {
  const { 
    invoiceList, 
    saveInvoice, 
    updateInvoiceStatus, 
    addLedgerEntry, 
    setPrintableDoc, 
    currentAdmin 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Form State Default Karoseri PT. Asa Karoseri
  const [klien, setKlien] = useState('');
  const [alamat, setAlamat] = useState('');
  const [nomorQuoteRef, setNomorQuoteRef] = useState('');
  const [jatuhTempo, setJatuhTempo] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deskripsiItem, setDeskripsiItem] = useState(
    'Termin 1 (Uang Muka 50%) - Pekerjaan Pembuatan Karoseri Kendaraan Khusus'
  );
  const [nominalSubtotal, setNominalSubtotal] = useState<number>(37500000);
  const [usePpn, setUsePpn] = useState<boolean>(true);
  const [metodeBayar, setMetodeBayar] = useState('Transfer Bank BCA');
  const [catatanRekening, setCatatanRekening] = useState(
    `${APP_CONFIG.BANK_NAME} No. Rek: ${APP_CONFIG.BANK_ACCOUNT_NO} an ${APP_CONFIG.BANK_ACCOUNT_NAME}`
  );

  // Perhitungan PPN & Grand Total
  const nilaiPpn = usePpn ? Math.round(nominalSubtotal * 0.11) : 0;
  const grandTotalTagihan = nominalSubtotal + nilaiPpn;

  // Stats
  const totalInvoiced = invoiceList.reduce((acc, curr) => acc + Number(curr.total_tagihan), 0);
  const totalLunas = invoiceList
    .filter(i => i.status_bayar === 'Lunas')
    .reduce((acc, curr) => acc + Number(curr.total_tagihan), 0);
  const totalPiutang = invoiceList
    .filter(i => i.status_bayar === 'Belum Bayar')
    .reduce((acc, curr) => acc + Number(curr.total_tagihan), 0);

  const filteredInvoices = invoiceList.filter(inv => {
    const matchesSearch = inv.nomor_inv.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.klien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.nomor_quote_ref.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Semua' || inv.status_bayar === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmitNewInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!klien || nominalSubtotal <= 0) return;

    const nomor_inv = `INV-ASA-2026-${String(invoiceList.length + 1).padStart(3, '0')}`;
    const newInv: InvoiceItem = {
      nomor_inv,
      tanggal: getTodayDateString(),
      jatuh_tempo: jatuhTempo,
      nomor_quote_ref: nomorQuoteRef || '-',
      klien,
      alamat: alamat || 'Alamat Kantor / Domisili Klien',
      items_json: [
        {
          no: 1,
          item: deskripsiItem,
          qty: 1,
          satuan: 'Lot',
          price: Number(nominalSubtotal),
          total: Number(nominalSubtotal)
        }
      ],
      subtotal: Number(nominalSubtotal),
      pajak: nilaiPpn, // PPN 11% dimasukkan
      total_tagihan: grandTotalTagihan, // Subtotal + PPN
      terbilang: angkaKeTerbilang(grandTotalTagihan),
      status_bayar: 'Belum Bayar',
      metode_bayar: metodeBayar,
      catatan_rekening: catatanRekening,
      admin_pembuat: currentAdmin.name
    };

    await saveInvoice(newInv);
    setIsModalOpen(false);

    // Langsung buka pratinjau cetak
    setPrintableDoc({ type: 'invoice', data: newInv });
  };

  const handleMarkAsPaid = async (inv: InvoiceItem) => {
    await updateInvoiceStatus(inv.nomor_inv, 'Lunas');

    // Catat otomatis ke buku kas General Ledger Bank BCA (1200-010)!
    await addLedgerEntry({
      tanggal: getTodayDateString(),
      kode_akun: '1200-010',
      nama_akun: `${APP_CONFIG.BANK_NAME} (${APP_CONFIG.BANK_ACCOUNT_NO})`,
      kategori: 'Pendapatan Karoseri',
      deskripsi: `Pelunasan Faktur ${inv.nomor_inv} dari ${inv.klien}`,
      kas_masuk: inv.total_tagihan,
      kas_keluar: 0,
      bukti_nota: inv.nomor_inv,
      pic_admin: currentAdmin.name
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-slate-800" />
            Cetak Invoice & Faktur Penagihan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Terbitkan invoice resmi (termasuk kalkulasi PPN 11%), cetak PDF siap kirim ke klien, dan sinkron ke Buku Kas • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <button
          onClick={() => {
            setKlien('');
            setAlamat('');
            setNomorQuoteRef('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Faktur Baru
        </button>
      </div>

      {/* 3 Kartu Ringkasan Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Faktur Diterbitkan
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatRupiah(totalInvoiced)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">{invoiceList.length} Dokumen Faktur</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Tagihan Sudah Lunas
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
            {formatRupiah(totalLunas)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Uang Masuk ke Buku Kas Bank</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
            Sisa Piutang (Belum Bayar)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-2">
            {formatRupiah(totalPiutang)}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {invoiceList.filter(i => i.status_bayar === 'Belum Bayar').length} Tagihan Menunggu Pembayaran
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor invoice, nama klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['Semua', 'Belum Bayar', 'Lunas'].map((status) => (
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

      {/* Tabel Invoice */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-36">No. Invoice</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-28">Tanggal</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-32">Ref SPH</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700">Klien & Alamat</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-32">Subtotal</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-28">PPN (11%)</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Total Tagihan</th>
                <th className="py-3.5 px-3 font-bold text-center border-r border-slate-700 w-28">Status</th>
                <th className="py-3.5 px-4 font-bold text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-semibold">
                    Belum ada faktur yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.nomor_inv} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 border-r border-slate-100 whitespace-nowrap">
                      {inv.nomor_inv}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-100 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{formatDateClean(inv.tanggal)}</p>
                      <p className="text-[11px] text-slate-500">Tempo: {formatDateClean(inv.jatuh_tempo)}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                      {inv.nomor_quote_ref}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-100">
                      <p className="font-bold text-slate-900">{inv.klien}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{inv.alamat}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                      {formatRupiah(inv.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-blue-800 border-r border-slate-100 whitespace-nowrap">
                      {formatRupiah(inv.pajak)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 border-r border-slate-100 whitespace-nowrap">
                      {formatRupiah(inv.total_tagihan)}
                    </td>
                    <td className="py-3.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                      {inv.status_bayar === 'Lunas' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                          <Clock className="w-3.5 h-3.5" />
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintableDoc({ type: 'invoice', data: inv })}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          title="Cetak Faktur PDF A4"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          Cetak PDF
                        </button>

                        {inv.status_bayar !== 'Lunas' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="Tandai Sudah Lunas & Catat ke Buku Kas"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Lunas
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Terbitkan Faktur Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-blue-600" />
                  Terbitkan Faktur Invoice Penagihan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {APP_CONFIG.COMPANY_NAME} • Rekening {APP_CONFIG.BANK_NAME} {APP_CONFIG.BANK_ACCOUNT_NO}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewInvoice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Klien / Perusahaan Ditagih *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Medika Nusantara Sejahtera"
                  value={klien}
                  onChange={(e) => setKlien(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Pengiriman / Domisili
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kawasan Niaga Surya Mas Blok B-12, Tangerang"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Referensi No. SPH (Penawaran)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 018/SPH-ASA/XI/2026"
                    value={nomorQuoteRef}
                    onChange={(e) => setNomorQuoteRef(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jatuh Tempo Pembayaran *
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayDateString()}
                    value={jatuhTempo}
                    onChange={(e) => setJatuhTempo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Hanya bisa tanggal hari ini atau seterusnya</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi / Rincian Penagihan *
                </label>
                <input
                  type="text"
                  required
                  value={deskripsiItem}
                  onChange={(e) => setDeskripsiItem(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              {/* Subtotal, Checkbox PPN 11%, dan Grand Total */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nominal Pokok / Subtotal (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nominalSubtotal}
                    onChange={(e) => setNominalSubtotal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-slate-900 bg-white"
                  />
                </div>

                {/* Checkbox PPN 11% */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold text-xs">
                    <input
                      type="checkbox"
                      checked={usePpn}
                      onChange={(e) => setUsePpn(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Kenakan PPN (11%)
                  </label>
                  <span className="font-bold text-blue-800 text-xs">
                    {formatRupiah(nilaiPpn)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-xs uppercase">Total Tagihan (Grand Total):</span>
                  <span className="text-base font-black text-slate-900">
                    {formatRupiah(grandTotalTagihan)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={metodeBayar}
                  onChange={(e) => setMetodeBayar(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Tunai / Cash">Tunai / Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detail Rekening Pembayaran
                </label>
                <input
                  type="text"
                  value={catatanRekening}
                  onChange={(e) => setCatatanRekening(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              {/* Tombol Aksi */}
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  Terbitkan & Pratinjau Cetak
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
