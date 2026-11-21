import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X } from 'lucide-react';
import type { InvoiceItem, QuotationItem, QuotationItemDetail } from '../types';
import { formatDateClean, formatRupiah, angkaKeTerbilang } from '../services/utils';
import { APP_CONFIG } from '../config';

export const PrintableDocument: React.FC = () => {
  const { printableDoc, setPrintableDoc } = useApp();

  if (!printableDoc) return null;

  const isInvoice = printableDoc.type === 'invoice';
  const data = printableDoc.data;

  // Handle parsing items if stored as JSON string
  let items: QuotationItemDetail[] = [];
  try {
    if (typeof data.items_json === 'string') {
      items = JSON.parse(data.items_json);
    } else if (Array.isArray(data.items_json)) {
      items = data.items_json;
    }
  } catch (e) {
    items = [];
  }

  const handlePrint = () => {
    window.print();
  };

  const invoiceData = isInvoice ? (data as InvoiceItem) : null;
  const quoteData = !isInvoice ? (data as QuotationItem) : null;

  const subtotal = isInvoice 
    ? (Number(invoiceData?.subtotal) || items.reduce((acc, it) => acc + Number(it.jumlah || it.total || (Number(it.qty || 1) * Number(it.price || it.harga_satuan || 0))), 0))
    : Number(quoteData?.subtotal || 0);

  const ppn = isInvoice
    ? (Number(invoiceData?.pajak) || Math.round(subtotal * 0.11))
    : Number(quoteData?.ppn || 0);

  const grandTotal = isInvoice
    ? (Number(invoiceData?.total_tagihan) || (subtotal + ppn))
    : Number(quoteData?.total || 0);

  const terbilangText = isInvoice
    ? (invoiceData?.terbilang || angkaKeTerbilang(grandTotal))
    : (quoteData?.terbilang || angkaKeTerbilang(grandTotal));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      
      {/* Floating Action Bar (Hidden in Print) */}
      <div className="no-print fixed top-4 right-4 sm:top-5 sm:right-6 flex items-center gap-3 z-50">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xl transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          CETAK / SIMPAN PDF (A4)
        </button>
        <button
          onClick={() => setPrintableDoc(null)}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-xl transition cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 Format matching PT. Asa Karoseri) */}
      <div className="print-only bg-white text-slate-900 w-full max-w-4xl p-6 sm:p-12 rounded-2xl shadow-xl my-auto print:m-0 print:p-0 print:shadow-none font-sans">
        
        {/* Kop Surat Resmi PT. ASA KAROSERI */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start gap-4">
            {/* Logo Brand ASA */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 text-white font-black text-xl sm:text-2xl flex items-center justify-center border border-slate-800 shrink-0">
              ASA
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {APP_CONFIG.COMPANY_NAME}
              </h1>
              <p className="text-xs sm:text-sm font-semibold italic text-slate-700 mb-1">
                {APP_CONFIG.COMPANY_TAGLINE}
              </p>
              <div className="text-[11px] sm:text-xs text-slate-600 space-y-0.5 leading-snug">
                <p>
                  <strong>Pabrik & Kantor :</strong> {APP_CONFIG.COMPANY_ADDRESS}
                </p>
                <p>
                  <strong>Website :</strong> {APP_CONFIG.COMPANY_WEBSITE} &nbsp;|&nbsp; <strong>Email :</strong> {APP_CONFIG.COMPANY_EMAIL} &nbsp;|&nbsp; <strong>Telp :</strong> {APP_CONFIG.COMPANY_PHONE}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider underline text-slate-900">
            {isInvoice ? 'INVOICE / FAKTUR PENAGIHAN' : 'SURAT PENAWARAN HARGA'}
          </h2>
        </div>

        {/* Metadata Surat */}
        <div className="text-xs text-slate-800 mb-5 space-y-1">
          <div className="grid grid-cols-12 gap-2">
            <span className="col-span-3 sm:col-span-2 font-bold">Nomor Dokumen</span>
            <span className="col-span-9 sm:col-span-10 font-bold">: {isInvoice ? invoiceData?.nomor_inv : quoteData?.nomor_quote}</span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <span className="col-span-3 sm:col-span-2 font-bold">Tanggal</span>
            <span className="col-span-9 sm:col-span-10">: {formatDateClean(isInvoice ? invoiceData?.tanggal : quoteData?.tanggal)}</span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <span className="col-span-3 sm:col-span-2 font-bold">Jatuh Tempo</span>
            <span className="col-span-9 sm:col-span-10 font-bold">: {formatDateClean(isInvoice ? invoiceData?.jatuh_tempo : quoteData?.jatuh_tempo)}</span>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <span className="col-span-3 sm:col-span-2 font-bold">Perihal</span>
            <span className="col-span-9 sm:col-span-10 font-bold text-slate-950">
              : {isInvoice ? `Penagihan Biaya Karoseri - Ref ${invoiceData?.nomor_quote_ref}` : quoteData?.perihal || 'Penawaran Harga Pekerjaan Karoseri'}
            </span>
          </div>
        </div>

        {/* Kepada Yth */}
        <div className="text-xs text-slate-800 mb-5 space-y-0.5">
          <p className="font-bold">Kepada Yth,</p>
          <p className="font-black text-sm text-slate-900">{isInvoice ? invoiceData?.klien : quoteData?.nama_klien}</p>
          <p className="text-slate-700 font-medium">{isInvoice ? invoiceData?.alamat : quoteData?.alamat_klien || 'di Tempat'}</p>
        </div>

        {/* Paragraf Pembuka */}
        <div className="text-xs text-slate-800 leading-relaxed mb-4">
          <p className="mb-1 font-bold">Dengan Hormat,</p>
          <p>
            {isInvoice 
              ? `Sehubungan dengan pelaksanaan pekerjaan karoseri unit kendaraan yang telah disepakati, bersama ini kami sampaikan faktur penagihan pembayaran dengan rincian sebagai berikut:`
              : `Menindaklanjuti permintaan penawaran harga terkait pekerjaan karoseri kendaraan khusus, bersama ini kami sampaikan rincian spesifikasi dan penawaran sebagai berikut:`
            }
          </p>
        </div>

        {/* Tabel Rincian Harga Sesuai Standar Resmi */}
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-xs border border-slate-900 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center">
                <th className="py-2 px-3 border-r border-slate-900 w-10">NO</th>
                <th className="py-2 px-3 border-r border-slate-900 w-14">SAT</th>
                <th className="py-2 px-3 border-r border-slate-900 text-left">DESKRIPSI PEKERJAAN / MATERIAL</th>
                <th className="py-2 px-3 border-r border-slate-900 text-right w-32">HARGA SATUAN</th>
                <th className="py-2 px-3 text-right w-36">JUMLAH (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const qtyVal = Number(it.qty || it.jumlah || 1);
                const priceVal = Number(it.price || it.harga_satuan || 0);
                const totalVal = Number(it.total || (qtyVal * priceVal));
                return (
                  <tr key={idx} className="border-b border-slate-900">
                    <td className="py-2.5 px-3 border-r border-slate-900 text-center font-bold">{it.no || idx + 1}</td>
                    <td className="py-2.5 px-3 border-r border-slate-900 text-center font-bold">{it.satuan || it.unit || 'Unit'}</td>
                    <td className="py-2.5 px-3 border-r border-slate-900">
                      <p className="font-bold text-slate-900">{it.item || it.deskripsi}</p>
                      {it.ukuran && <p className="text-[11px] text-slate-600">Ukuran / Spek: {it.ukuran}</p>}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-900 text-right font-medium">
                      {formatRupiah(priceVal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {formatRupiah(totalVal)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Baris Subtotal */}
              <tr className="border-b border-slate-900 bg-slate-50 font-bold">
                <td colSpan={3} className="border-r border-slate-900"></td>
                <td className="py-2 px-3 border-r border-slate-900 text-right">Subtotal</td>
                <td className="py-2 px-3 text-right font-bold">
                  {formatRupiah(subtotal)}
                </td>
              </tr>

              {/* Baris PPN 11% */}
              <tr className="border-b border-slate-900 bg-slate-50 font-bold">
                <td colSpan={3} className="border-r border-slate-900"></td>
                <td className="py-2 px-3 border-r border-slate-900 text-right">PPN (11%)</td>
                <td className="py-2 px-3 text-right font-bold text-slate-900">
                  {formatRupiah(ppn)}
                </td>
              </tr>

              {/* Baris Grand Total */}
              <tr className="bg-slate-200 text-slate-950 font-black">
                <td colSpan={3} className="border-r border-slate-900"></td>
                <td className="py-2.5 px-3 border-r border-slate-900 text-right uppercase tracking-wider text-xs">
                  TOTAL TAGIHAN
                </td>
                <td className="py-2.5 px-3 text-right text-sm">
                  {formatRupiah(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terbilang */}
        <div className="text-xs text-slate-900 font-bold mb-4 p-2.5 bg-slate-50 border border-slate-300 rounded-sm">
          <strong>Terbilang : </strong>
          <span className="italic font-bold text-slate-800">
            {terbilangText}
          </span>
        </div>

        {/* Ketentuan Pembayaran */}
        <div className="text-xs text-slate-800 mb-6 space-y-1">
          <p className="font-bold">Ketentuan & Syarat Pembayaran :</p>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px] leading-relaxed pl-1 font-medium">
            <li>Harga di atas telah termasuk PPN 11% sesuai peraturan perpajakan yang berlaku.</li>
            <li>Sudah termasuk dokumen legalitas SRUT (Sertifikat Registrasi Uji Tipe) resmi Dishub/Kemenhub RI.</li>
            <li>Pembayaran ditransfer langsung ke rekening resmi perusahaan:</li>
            <li className="list-none pl-4 font-bold text-slate-950">
              👉 {APP_CONFIG.BANK_NAME} No. Rek: <span className="underline">{APP_CONFIG.BANK_ACCOUNT_NO}</span> a/n {APP_CONFIG.BANK_ACCOUNT_NAME}
            </li>
          </ol>
        </div>

        {/* Paragraf Penutup */}
        <div className="text-xs text-slate-800 mb-8">
          <p>Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik kami ucapkan terima kasih.</p>
        </div>

        {/* Tanda Tangan Resmi Direktur Utama */}
        <div className="text-xs text-slate-900">
          <p className="font-bold">Hormat Kami,</p>
          <p className="font-black text-slate-900 text-sm">{APP_CONFIG.COMPANY_NAME}</p>
          
          {/* Stamp Area */}
          <div className="my-3 flex items-center">
            <div className="w-28 h-14 border border-dashed border-slate-400 rounded-lg flex items-center justify-center text-[10px] text-slate-600 font-bold bg-slate-50">
              [ CAP PT. ASA ]
            </div>
          </div>

          <p className="font-black text-sm uppercase underline text-slate-950 mt-3">
            {APP_CONFIG.DIRECTOR_NAME}
          </p>
          <p className="font-bold text-slate-600">
            {APP_CONFIG.DIRECTOR_TITLE}
          </p>
        </div>

      </div>

    </div>
  );
};
