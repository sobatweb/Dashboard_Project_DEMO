import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Plus, 
  Printer, 
  Trash2, 
  ReceiptText,
  Search,
  CheckCircle2
} from 'lucide-react';
import type { QuotationItem, QuotationItemDetail, InvoiceItem } from '../types';
import { formatDateClean, formatRupiah, getTodayDateString, angkaKeTerbilang } from '../services/utils';
import { APP_CONFIG } from '../config';

export const QuotationPage: React.FC = () => {
  const { 
    quotationList, 
    saveQuotation, 
    saveInvoice, 
    setActiveTab, 
    setPrintableDoc, 
    currentAdmin 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State Default Karoseri PT. Asa Karoseri
  const [namaKlien, setNamaKlien] = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [teleponEmail, setTeleponEmail] = useState('');
  const [jatuhTempo, setJatuhTempo] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [catatanSyarat, setCatatanSyarat] = useState(
    '1. Penawaran harga berlaku selama 14 (empat belas) hari kalender sejak tanggal penawaran.\n' +
    '2. Pembayaran DP 50% saat PO / Surat Perintah Kerja disetujui, Pelunasan sebelum unit diserahterimakan.\n' +
    `3. Pembayaran via transfer ${APP_CONFIG.BANK_NAME} No. Rek: ${APP_CONFIG.BANK_ACCOUNT_NO} an ${APP_CONFIG.BANK_ACCOUNT_NAME}.\n` +
    '4. Waktu pengerjaan karoseri 14 - 21 hari kerja setelah chassis dan DP diterima di workshop.\n' +
    '5. Sudah termasuk penerbitan SRUT (Surat Rancang Bangun Uji Tipe) resmi Dishub/Kemenhub.'
  );

  const [items, setItems] = useState<QuotationItemDetail[]>([
    { 
      no: 1,
      item: 'Pembuatan Karoseri Ambulance VIP Deluxe (Chassis Wuling Mitra EV)', 
      ukuran: 'Unit EV Standar',
      qty: 1, 
      satuan: 'Unit', 
      price: 75000000, 
      total: 75000000 
    }
  ]);

  const [diskon, setDiskon] = useState<number>(0);
  const [usePpn, setUsePpn] = useState<boolean>(true);

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.qty || curr.jumlah || 1) * Number(curr.price || curr.harga_satuan || 0)), 0);
  const ppn = usePpn ? Math.round((subtotal - Number(diskon)) * 0.11) : 0;
  const grandTotal = subtotal - Number(diskon) + ppn;

  const addItemRow = () => {
    setItems([...items, { no: items.length + 1, item: '', ukuran: '', qty: 1, satuan: 'Unit', price: 0, total: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, field: keyof QuotationItemDetail, value: any) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: value };
    const q = Number(copy[idx].qty || copy[idx].jumlah || 1);
    const p = Number(copy[idx].price || copy[idx].harga_satuan || 0);
    copy[idx].total = q * p;
    setItems(copy);
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKlien || items.length === 0) return;

    const nomor_quote = `0${String(quotationList.length + 19).padStart(2, '0')}/SPH-ASA/XI/2026`;
    const newQuote: QuotationItem = {
      nomor_quote,
      tanggal: getTodayDateString(),
      jatuh_tempo: jatuhTempo,
      perihal: `Surat Penawaran Harga Pekerjaan Karoseri Unit`,
      nama_klien: namaKlien,
      perusahaan: perusahaan || 'Instansi / Perusahaan Klien',
      telepon_email: teleponEmail,
      items_json: items,
      subtotal,
      diskon: Number(diskon),
      ppn,
      total: grandTotal,
      terbilang: angkaKeTerbilang(grandTotal),
      catatan_syarat: catatanSyarat,
      status: 'Terkirim',
      admin_pembuat: currentAdmin.name,
      penandatangan: APP_CONFIG.DIRECTOR_NAME,
      jabatan_penandatangan: APP_CONFIG.DIRECTOR_TITLE
    };

    await saveQuotation(newQuote);
    setIsModalOpen(false);

    // Langsung buka pratinjau cetak
    setPrintableDoc({ type: 'quotation', data: newQuote });
  };

  // Convert Quotation to Invoice (Termin DP 50%)
  const handleConvertToInvoice = async (quote: QuotationItem, isDP: boolean = true) => {
    const invNumber = `INV-ASA-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const subtotalInv = isDP ? Math.round(quote.subtotal * 0.5) : quote.subtotal;
    const ppnInv = Math.round(subtotalInv * 0.11);
    const totalTagihanInv = subtotalInv + ppnInv;

    const newInv: InvoiceItem = {
      nomor_inv: invNumber,
      tanggal: getTodayDateString(),
      jatuh_tempo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nomor_quote_ref: quote.nomor_quote,
      klien: quote.nama_klien + (quote.perusahaan ? ` (${quote.perusahaan})` : ''),
      alamat: quote.telepon_email || 'Alamat Domisili Klien',
      items_json: [
        {
          no: 1,
          item: isDP ? `Termin 1 (Uang Muka 50%) - Penawaran ${quote.nomor_quote}` : `Pelunasan 100% - Penawaran ${quote.nomor_quote}`,
          qty: 1,
          satuan: 'Lot',
          price: subtotalInv,
          total: subtotalInv
        }
      ],
      subtotal: subtotalInv,
      pajak: ppnInv, // PPN 11% dimasukkan
      total_tagihan: totalTagihanInv,
      terbilang: angkaKeTerbilang(totalTagihanInv),
      status_bayar: 'Belum Bayar',
      metode_bayar: 'Transfer Bank BCA',
      catatan_rekening: `${APP_CONFIG.BANK_NAME} No. Rek: ${APP_CONFIG.BANK_ACCOUNT_NO} an ${APP_CONFIG.BANK_ACCOUNT_NAME}`,
      admin_pembuat: currentAdmin.name
    };

    await saveInvoice(newInv);
    setActiveTab('invoice');
  };

  const filteredQuotes = quotationList.filter(q =>
    q.nomor_quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.nama_klien.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.perusahaan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-800" />
            Surat Penawaran Harga (SPH Karoseri)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Pembuatan surat penawaran resmi untuk instansi & perusahaan, rincian material, PPN 11%, dan cetak A4 • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <button
          onClick={() => {
            setNamaKlien('');
            setPerusahaan('');
            setTeleponEmail('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Surat Penawaran Baru
        </button>
      </div>

      {/* Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor SPH, nama klien, instansi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-600 font-semibold">
          Total: <span className="text-slate-900 font-bold">{filteredQuotes.length} Dokumen SPH</span>
        </div>
      </div>

      {/* Tabel Surat Penawaran */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-36">No. SPH</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-28">Tanggal</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700">Kepada (Klien / Instansi)</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-32">Subtotal</th>
                <th className="py-3.5 px-4 font-bold text-right border-r border-slate-700 w-36">Total Penawaran</th>
                <th className="py-3.5 px-3 font-bold text-center border-r border-slate-700 w-28">Status</th>
                <th className="py-3.5 px-4 font-bold border-r border-slate-700 w-32">Dibuat Oleh</th>
                <th className="py-3.5 px-4 font-bold text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                    Belum ada surat penawaran yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.nomor_quote} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 border-r border-slate-100 whitespace-nowrap">
                      {q.nomor_quote}
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-100 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{formatDateClean(q.tanggal)}</p>
                      <p className="text-[11px] text-slate-500">Tempo: {formatDateClean(q.jatuh_tempo)}</p>
                    </td>
                    <td className="py-3.5 px-4 border-r border-slate-100">
                      <p className="font-bold text-slate-900">{q.nama_klien}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{q.perusahaan}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                      {formatRupiah(q.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 border-r border-slate-100 whitespace-nowrap">
                      {formatRupiah(q.total)}
                    </td>
                    <td className="py-3.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        q.status === 'Disetujui'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : q.status === 'Terkirim'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium border-r border-slate-100 whitespace-nowrap">
                      {q.admin_pembuat}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintableDoc({ type: 'quotation', data: q })}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          title="Cetak Surat Penawaran A4"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          Cetak PDF
                        </button>
                        <button
                          onClick={() => handleConvertToInvoice(q, true)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1 transition border border-blue-200 cursor-pointer"
                          title="Tarik ke Invoice DP 50%"
                        >
                          <ReceiptText className="w-3.5 h-3.5" />
                          Ke Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat SPH Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Form Surat Penawaran Harga (SPH)
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

            <form onSubmit={handleSubmitQuotation} className="space-y-4 text-xs sm:text-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ditujukan Kepada (Nama Klien / Kontak) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: dr. Ardiansyah / Dinas Kesehatan"
                    value={namaKlien}
                    onChange={(e) => setNamaKlien(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instansi / Perusahaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Medika Nusantara Sejahtera"
                    value={perusahaan}
                    onChange={(e) => setPerusahaan(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kontak WhatsApp / Email</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-9876-0000 / procurement@medika.id"
                    value={teleponEmail}
                    onChange={(e) => setTeleponEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Masa Berlaku Penawaran (Jatuh Tempo) *</label>
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

              {/* Rincian Item Pekerjaan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Rincian Pekerjaan & Material Karoseri:
                  </span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    + Tambah Baris
                  </button>
                </div>

                {items.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-2 bg-white rounded-lg border border-slate-200 items-center">
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Uraian Pekerjaan</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Pembuatan Karoseri Ambulance VIP"
                        value={row.item}
                        onChange={(e) => updateItemRow(idx, 'item', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ukuran / Spek</label>
                      <input
                        type="text"
                        placeholder="e.g. Unit EV"
                        value={row.ukuran || ''}
                        onChange={(e) => updateItemRow(idx, 'ukuran', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => updateItemRow(idx, 'qty', Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center font-bold"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Satuan</label>
                      <input
                        type="text"
                        value={row.satuan}
                        onChange={(e) => updateItemRow(idx, 'satuan', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-center"
                      />
                    </div>
                    <div className="col-span-10 sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Harga Satuan (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        value={row.price}
                        onChange={(e) => updateItemRow(idx, 'price', Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-right font-bold text-slate-900"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-center">
                      <label className="block text-[10px] text-transparent mb-0.5">Aksi</label>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Syarat & Kalkulasi Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Syarat & Ketentuan Penawaran</label>
                  <textarea
                    rows={5}
                    value={catatanSyarat}
                    onChange={(e) => setCatatanSyarat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-700 text-xs">
                    <span>Subtotal Pekerjaan:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span>Diskon Khusus (Rp):</span>
                    <input
                      type="number"
                      min="0"
                      value={diskon}
                      onChange={(e) => setDiskon(Number(e.target.value))}
                      className="w-32 p-1.5 rounded-lg border border-slate-300 text-right font-bold bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold">
                      <input
                        type="checkbox"
                        checked={usePpn}
                        onChange={(e) => setUsePpn(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      Kenakan PPN (11%)
                    </label>
                    <span className="font-bold text-slate-900">{formatRupiah(ppn)}</span>
                  </div>

                  <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-slate-900">
                    <span className="text-xs uppercase">Total Penawaran:</span>
                    <span className="text-base text-blue-900">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Aksi */}
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
                  Simpan & Pratinjau SPH
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
