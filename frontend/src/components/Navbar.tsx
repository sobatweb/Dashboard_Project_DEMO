import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  RefreshCw, 
  Database, 
  Users, 
  Check, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { APP_CONFIG } from '../config';

export const Navbar: React.FC = () => {
  const { 
    currentAdmin, 
    setCurrentAdmin, 
    admins, 
    isConnected, 
    isLoading, 
    refreshFromGAS, 
    setActiveTab,
    scriptUrl,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="no-print bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Sisi Kiri: Hamburger Menu Mobile + Brand PT. Asa Karoseri */}
        <div className="flex items-center gap-3">
          {/* Tombol Hamburger Mobile */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo PT. Asa Karoseri */}
          <div className="flex items-center gap-3">
            <img src="/logos.png" alt="PT. Asa Karoseri" className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
                  {APP_CONFIG.COMPANY_NAME}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                  Karoseri
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-md">
                {APP_CONFIG.COMPANY_TAGLINE}
              </p>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Status Koneksi & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Status Badge Google Sheets */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : scriptUrl
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Status Database Google Sheets"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline text-xs">
              {isConnected ? 'Online' : scriptUrl ? 'Menghubungkan...' : 'Mode Lokal'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </button>

          {/* Tombol Refresh Sync */}
          {scriptUrl && (
            <button
              onClick={refreshFromGAS}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
              title="Sinkronkan data dengan Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          {/* User Switcher Dropdown (2 Owner & 3 Staff) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center text-white shrink-0 ${
                currentAdmin.role === 'Owner' ? 'bg-slate-900' : 'bg-blue-700'
              }`}>
                {currentAdmin.avatar}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="truncate max-w-[120px]">{currentAdmin.name}</span>
                  {currentAdmin.role === 'Owner' ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-bold">
                      OWNER
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                      STAFF
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                  {currentAdmin.roleTitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-76 sm:w-84 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-blue-600" />
                    Pilih Pengguna Aktif (5 Akun)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">2 Owner (Akses Penuh) & 3 Staff Khusus</p>
                </div>

                <div className="py-1 divide-y divide-slate-100">
                  {admins.map((adm) => {
                    const isSelected = currentAdmin.id === adm.id;
                    const isOwner = adm.role === 'Owner';
                    return (
                      <button
                        key={adm.id}
                        onClick={() => setCurrentAdmin(adm)}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                          isSelected ? 'bg-blue-50/60 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center text-white shrink-0 ${
                            isOwner ? 'bg-slate-900' : 'bg-blue-700'
                          }`}>
                            {adm.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {adm.name}
                              {isOwner && (
                                <span className="text-[9px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded">
                                  Owner
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500">{adm.roleTitle}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />}
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-[11px] text-slate-500 italic">
                    * Menu otomatis menyesuaikan wewenang akun yang dipilih.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
