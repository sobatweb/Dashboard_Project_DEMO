import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Boxes, 
  WalletCards, 
  Calculator, 
  FileText, 
  ReceiptText, 
  PieChart, 
  Users, 
  Settings,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';
import type { ActiveTab } from '../types';
import { ROLE_PERMISSIONS } from '../types';
import { APP_CONFIG } from '../config';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentAdmin, 
    stokList, 
    invoiceList,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen
  } = useApp();

  const lowStockCount = stokList.filter(s => s.status_stok === 'Menipis' || s.status_stok === 'Kritis').length;
  const unpaidCount = invoiceList.filter(i => i.status_bayar === 'Belum Bayar').length;

  const allMenuItems: { 
    id: ActiveTab; 
    label: string; 
    icon: React.ReactNode; 
    badge?: number; 
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Ringkasan Utama',
      icon: <LayoutDashboard className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'stok',
      label: 'Stok Material Karoseri',
      icon: <Boxes className="w-5 h-5 text-slate-600" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-600'
    },
    {
      id: 'ledger',
      label: 'Buku Besar & Kode Akun',
      icon: <WalletCards className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'labarugi',
      label: 'Laporan Laba / Rugi',
      icon: <TrendingUp className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'hpp',
      label: 'HPP Produksi Karoseri',
      icon: <Calculator className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'quotation',
      label: 'Surat Penawaran (SPH)',
      icon: <FileText className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'invoice',
      label: 'Cetak Faktur Invoice',
      icon: <ReceiptText className="w-5 h-5 text-slate-600" />,
      badge: unpaidCount > 0 ? unpaidCount : undefined,
      badgeColor: 'bg-amber-600'
    },
    {
      id: 'anggaran',
      label: 'Anggaran Bulanan (RAP)',
      icon: <PieChart className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'admins',
      label: 'Kelola 5 Admin Akun',
      icon: <Users className="w-5 h-5 text-slate-600" />
    },
    {
      id: 'settings',
      label: 'Profil & Pengaturan',
      icon: <Settings className="w-5 h-5 text-slate-600" />
    }
  ];

  // Filter menu strictly by current role permissions
  const allowed = ROLE_PERMISSIONS[currentAdmin.role] || ['stok'];
  const visibleMenuItems = allMenuItems.filter(item => allowed.includes(item.id));

  const renderContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-200">
      
      {/* Current User Role Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              {currentAdmin.role}
            </span>
          </div>
          {isMobileDrawerOpen && (
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {currentAdmin.role === 'Owner' 
            ? 'Akses Penuh: Seluruh Modul & Laporan' 
            : `Dibatasi Khusus: Modul ${currentAdmin.roleTitle}`}
        </p>
      </div>

      {/* Menu List */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileDrawerOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-blue-400' : ''}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white font-bold ${
                    item.badgeColor || 'bg-blue-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Low Stock Warning Card */}
      {currentAdmin.role === 'Owner' && lowStockCount > 0 && (
        <div className="p-3 m-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
          <p className="font-bold">⚠️ Perhatian Stok:</p>
          <p className="text-[11px] mt-0.5 font-medium">Ada {lowStockCount} material karoseri yang stoknya menipis.</p>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-500">
        <p className="font-bold text-slate-800">{APP_CONFIG.COMPANY_NAME}</p>
        <p className="text-[11px]">Sistem Manajemen Karoseri Modern</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print hidden md:flex w-68 shrink-0 min-h-[calc(100vh-4.5rem)] sticky top-18 self-start">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isMobileDrawerOpen && (
        <div className="no-print md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer Sheet */}
          <div className="relative w-76 max-w-xs h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
