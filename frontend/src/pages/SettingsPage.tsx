import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Check, 
  Database, 
  RefreshCw,
  CreditCard,
  UserCheck,
  Smartphone
} from 'lucide-react';
import { APP_CONFIG } from '../config';

export const SettingsPage: React.FC = () => {
  const { 
    scriptUrl, 
    updateScriptUrl, 
    isConnected, 
    isLoading, 
    refreshFromGAS 
  } = useApp();

  const [inputUrl, setInputUrl] = useState(scriptUrl);

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateScriptUrl(inputUrl);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-800" />
            Profil Perusahaan & Pengaturan Sistem
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Informasi legalitas, rekening bank, profil operasional & integrasi data • {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
          isConnected
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : scriptUrl
            ? 'bg-amber-50 text-amber-900 border-amber-300'
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-slate-400'}`} />
          {isConnected ? 'Database Terhubung (Online)' : scriptUrl ? 'Mengecek...' : 'Mode Lokal (Offline)'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Kolom Kiri: Profil Resmi Perusahaan */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
              <img src="/logos.png" alt={APP_CONFIG.COMPANY_NAME} className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 bg-white shadow-xs" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Identitas & Legalitas {APP_CONFIG.COMPANY_NAME}</h3>
                <p className="text-xs text-slate-500 font-medium">Logo dan profil resmi operasional perusahaan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Nama Perusahaan</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900">
                  {APP_CONFIG.COMPANY_NAME}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Bidang Usaha</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800">
                  {APP_CONFIG.COMPANY_TAGLINE}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Alamat Pabrik & Workshop</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                  {APP_CONFIG.COMPANY_ADDRESS}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Telepon & WhatsApp</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                  {APP_CONFIG.COMPANY_PHONE}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Email Resmi</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                  {APP_CONFIG.COMPANY_EMAIL}
                </div>
              </div>
            </div>
          </div>

          {/* Rekening Bank & Penandatangan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Rekening Pembayaran & Otorisasi</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Rekening Utama:</span>
                <p className="text-base font-black text-slate-900">{APP_CONFIG.BANK_NAME}</p>
                <p className="font-mono text-sm font-bold text-blue-700">{APP_CONFIG.BANK_ACCOUNT_NO}</p>
                <p className="text-xs text-slate-600">a/n {APP_CONFIG.BANK_ACCOUNT_NAME}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Rekening Cadangan:</span>
                <p className="text-base font-black text-slate-900">{APP_CONFIG.BANK_NAME_ALT}</p>
                <p className="font-mono text-sm font-bold text-slate-700">{APP_CONFIG.BANK_ACCOUNT_NO_ALT}</p>
                <p className="text-xs text-slate-600">a/n {APP_CONFIG.BANK_ACCOUNT_NAME_ALT}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Penandatangan SPH & Invoice:</span>
                  <p className="text-sm font-black text-slate-900 mt-1">{APP_CONFIG.DIRECTOR_NAME}</p>
                  <p className="text-xs text-slate-600">{APP_CONFIG.DIRECTOR_TITLE} • PT. Asa Karoseri</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Database & PWA Info */}
        <div className="space-y-5">
          {/* Box Database URL Opsional */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Integrasi Google Apps Script
              </h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Anda dapat meng-hardcode URL Apps Script langsung di <code>src/config.ts</code> atau memasukkan tautan di bawah ini:
            </p>

            <form onSubmit={handleSaveUrl} className="space-y-3">
              <div>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan URL
                </button>

                {scriptUrl && (
                  <button
                    type="button"
                    onClick={refreshFromGAS}
                    disabled={isLoading}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                    title="Tarik data dari Google Sheets"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* PWA Mobile App Support Info */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-sm">Aplikasi PWA Siap Install</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Website ini sudah mendukung standar <strong>PWA (Progressive Web App)</strong>. Anda dapat meng-install aplikasi ini langsung di layar HP (Android / iOS) atau Desktop tanpa perlu download dari App Store.
            </p>
            <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-white">Cara Install di HP:</p>
              <p>Buka Chrome / Safari &gt; Klik menu Titik Tiga (atau ikon Bagikan) &gt; Pilih <strong>"Tambahkan ke Layar Utama" (Install App)</strong>.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
