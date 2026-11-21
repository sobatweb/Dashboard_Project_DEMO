import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationToast } from './components/NotificationToast';
import { PrintableDocument } from './components/PrintableDocument';
import { ROLE_PERMISSIONS } from './types';

import { OverviewPage } from './pages/OverviewPage';
import { StokPage } from './pages/StokPage';
import { GeneralLedgerPage } from './pages/GeneralLedgerPage';
import { LabaRugiPage } from './pages/LabaRugiPage';
import { HPPProduksiPage } from './pages/HPPProduksiPage';
import { QuotationPage } from './pages/QuotationPage';
import { InvoicePage } from './pages/InvoicePage';
import { AnggaranPage } from './pages/AnggaranPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';

const DashboardContent: React.FC = () => {
  const { activeTab, currentAdmin } = useApp();

  // Strict Role Guard: Pastikan staff tidak bisa melihat tab di luar wewenangnya
  const allowed = ROLE_PERMISSIONS[currentAdmin.role] || ['stok'];
  const safeTab = allowed.includes(activeTab) ? activeTab : allowed[0];

  const renderActivePage = () => {
    switch (safeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'stok':
        return <StokPage />;
      case 'ledger':
        return <GeneralLedgerPage />;
      case 'labarugi':
        return <LabaRugiPage />;
      case 'hpp':
        return <HPPProduksiPage />;
      case 'quotation':
        return <QuotationPage />;
      case 'invoice':
        return <InvoicePage />;
      case 'anggaran':
        return <AnggaranPage />;
      case 'admins':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <StokPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4.5rem)]">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      <NotificationToast />
      <PrintableDocument />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
