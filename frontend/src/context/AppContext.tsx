import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AdminUser,
  StokItem,
  MutasiStokItem,
  AccountCode,
  LedgerItem,
  HPPItem,
  QuotationItem,
  InvoiceItem,
  MonthlyBudgetItem,
  ActiveTab
} from '../types';
import { ROLE_PERMISSIONS } from '../types';
import {
  initialAdmins,
  initialAccountCodes,
  initialStok,
  initialMutasi,
  initialLedger,
  initialHPP,
  initialQuotations,
  initialInvoices,
  initialMonthlyBudgets
} from '../services/mockData';
import {
  getStoredScriptUrl,
  setStoredScriptUrl,
  fetchAllFromGAS,
  saveToGAS,
  testGASConnection
} from '../services/api';
import { APP_CONFIG } from '../config';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PrintableDocState {
  type: 'invoice' | 'quotation';
  data: InvoiceItem | QuotationItem;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentAdmin: AdminUser;
  setCurrentAdmin: (admin: AdminUser) => void;
  admins: AdminUser[];
  
  // Mobile drawer
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;

  // Master Kode Akun
  accountCodeList: AccountCode[];
  addAccountCode: (account: AccountCode) => void;

  // Modul Data
  stokList: StokItem[];
  mutasiList: MutasiStokItem[];
  ledgerList: LedgerItem[];
  hppList: HPPItem[];
  quotationList: QuotationItem[];
  invoiceList: InvoiceItem[];
  monthlyBudgetList: MonthlyBudgetItem[];

  // Script & API Connection
  scriptUrl: string;
  updateScriptUrl: (url: string) => Promise<boolean>;
  isConnected: boolean;
  isLoading: boolean;
  notification: NotificationState | null;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshFromGAS: () => Promise<void>;
  
  // CRUD Handlers
  addOrUpdateStok: (item: StokItem) => Promise<void>;
  recordMutasi: (mutasi: Omit<MutasiStokItem, 'id'>) => Promise<void>;
  addLedgerEntry: (entry: Omit<LedgerItem, 'id_transaksi' | 'saldo'>) => Promise<void>;
  addOrUpdateHPP: (hpp: HPPItem) => Promise<void>;
  saveQuotation: (quote: QuotationItem) => Promise<void>;
  saveInvoice: (inv: InvoiceItem) => Promise<void>;
  updateInvoiceStatus: (nomor_inv: string, status: 'Belum Bayar' | 'DP Diterima' | 'Lunas') => Promise<void>;
  addOrUpdateMonthlyBudget: (item: MonthlyBudgetItem) => Promise<void>;
  saveAdmin: (admin: AdminUser) => Promise<void>;

  // Print Modal
  printableDoc: PrintableDocState | null;
  setPrintableDoc: (doc: PrintableDocState | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('overview');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Default scriptUrl: dari config jika di-hardcode, atau dari stored localStorage
  const defaultScriptUrl = APP_CONFIG.APPS_SCRIPT_URL || getStoredScriptUrl();
  const [scriptUrl, setScriptUrlState] = useState<string>(defaultScriptUrl);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize Admins PT Asa Karoseri (v3)
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('asa_admins_v3');
    return saved ? JSON.parse(saved) : initialAdmins;
  });

  const [currentAdmin, setCurrentAdminState] = useState<AdminUser>(() => admins[0] || initialAdmins[0]);

  // Master Kode Akun
  const [accountCodeList, setAccountCodeList] = useState<AccountCode[]>(() => {
    const saved = localStorage.getItem('asa_accounts_v3');
    return saved ? JSON.parse(saved) : initialAccountCodes;
  });

  // Stok Barang
  const [stokList, setStokList] = useState<StokItem[]>(() => {
    const saved = localStorage.getItem('asa_stok_v3');
    return saved ? JSON.parse(saved) : initialStok;
  });

  // Mutasi Stok
  const [mutasiList, setMutasiList] = useState<MutasiStokItem[]>(() => {
    const saved = localStorage.getItem('asa_mutasi_v3');
    return saved ? JSON.parse(saved) : initialMutasi;
  });

  // Buku Besar (General Ledger)
  const [ledgerList, setLedgerList] = useState<LedgerItem[]>(() => {
    const saved = localStorage.getItem('asa_ledger_v3');
    return saved ? JSON.parse(saved) : initialLedger;
  });

  // HPP Produksi
  const [hppList, setHppList] = useState<HPPItem[]>(() => {
    const saved = localStorage.getItem('asa_hpp_v3');
    return saved ? JSON.parse(saved) : initialHPP;
  });

  // Quotations / SPH
  const [quotationList, setQuotationList] = useState<QuotationItem[]>(() => {
    const saved = localStorage.getItem('asa_quotations_v3');
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  // Invoices
  const [invoiceList, setInvoiceList] = useState<InvoiceItem[]>(() => {
    const saved = localStorage.getItem('asa_invoices_v3');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  // Anggaran Bulanan per Tahun
  const [monthlyBudgetList, setMonthlyBudgetList] = useState<MonthlyBudgetItem[]>(() => {
    const saved = localStorage.getItem('asa_budgets_v3');
    return saved ? JSON.parse(saved) : initialMonthlyBudgets;
  });

  const [printableDoc, setPrintableDoc] = useState<PrintableDocState | null>(null);

  // Tab switcher with strict role enforcement
  const setActiveTab = (tab: ActiveTab) => {
    const allowed = ROLE_PERMISSIONS[currentAdmin.role] || ['stok'];
    if (allowed.includes(tab)) {
      setActiveTabState(tab);
    } else {
      setActiveTabState(allowed[0]);
    }
    // Close mobile drawer on tab switch
    setIsMobileDrawerOpen(false);
  };

  const setCurrentAdmin = (admin: AdminUser) => {
    setCurrentAdminState(admin);
    const allowed = ROLE_PERMISSIONS[admin.role] || ['stok'];
    if (!allowed.includes(activeTab)) {
      setActiveTabState(allowed[0]);
    }
    notify(`Beralih ke pengguna: ${admin.name} (${admin.roleTitle})`, 'info');
  };

  // Sync state ke LocalStorage
  useEffect(() => { localStorage.setItem('asa_admins_v3', JSON.stringify(admins)); }, [admins]);
  useEffect(() => { localStorage.setItem('asa_accounts_v3', JSON.stringify(accountCodeList)); }, [accountCodeList]);
  useEffect(() => { localStorage.setItem('asa_stok_v3', JSON.stringify(stokList)); }, [stokList]);
  useEffect(() => { localStorage.setItem('asa_mutasi_v3', JSON.stringify(mutasiList)); }, [mutasiList]);
  useEffect(() => { localStorage.setItem('asa_ledger_v3', JSON.stringify(ledgerList)); }, [ledgerList]);
  useEffect(() => { localStorage.setItem('asa_hpp_v3', JSON.stringify(hppList)); }, [hppList]);
  useEffect(() => { localStorage.setItem('asa_quotations_v3', JSON.stringify(quotationList)); }, [quotationList]);
  useEffect(() => { localStorage.setItem('asa_invoices_v3', JSON.stringify(invoiceList)); }, [invoiceList]);
  useEffect(() => { localStorage.setItem('asa_budgets_v3', JSON.stringify(monthlyBudgetList)); }, [monthlyBudgetList]);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const updateScriptUrl = async (url: string): Promise<boolean> => {
    setStoredScriptUrl(url);
    setScriptUrlState(url);
    if (!url.trim()) {
      setIsConnected(false);
      notify('Beralih ke mode penyimpanan lokal offline', 'info');
      return true;
    }

    setIsLoading(true);
    const ok = await testGASConnection(url);
    setIsConnected(ok);
    setIsLoading(false);

    if (ok) {
      notify('Berhasil terhubung ke Google Apps Script PT. Asa Karoseri!', 'success');
      refreshFromGAS();
      return true;
    } else {
      notify('Gagal terhubung. Pastikan Web App diset ke "Anyone"!', 'error');
      return false;
    }
  };

  const refreshFromGAS = async () => {
    if (!scriptUrl) return;
    setIsLoading(true);
    try {
      const data = await fetchAllFromGAS(scriptUrl);
      if (data) {
        if (data.stok && data.stok.length) setStokList(data.stok);
        if (data.mutasiStok && data.mutasiStok.length) setMutasiList(data.mutasiStok);
        if (data.generalLedger && data.generalLedger.length) setLedgerList(data.generalLedger);
        if (data.hppProduksi && data.hppProduksi.length) setHppList(data.hppProduksi);
        if (data.quotations && data.quotations.length) setQuotationList(data.quotations);
        if (data.invoices && data.invoices.length) setInvoiceList(data.invoices);
        if (data.anggaranRealisasi && data.anggaranRealisasi.length) setMonthlyBudgetList(data.anggaranRealisasi);
        if (data.admins && data.admins.length) setAdmins(data.admins);
        setIsConnected(true);
        notify('Data tersinkronisasi realtime dengan Google Sheets!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      notify('Gagal memuat data dari Google Sheets. Menggunakan data lokal.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto connect if hardcoded
  useEffect(() => {
    if (scriptUrl) {
      testGASConnection(scriptUrl).then((ok) => {
        setIsConnected(ok);
        if (ok) refreshFromGAS();
      });
    }
  }, []);

  // CRUD Actions
  const addAccountCode = (account: AccountCode) => {
    const exists = accountCodeList.some(a => a.kode === account.kode);
    if (exists) {
      setAccountCodeList(accountCodeList.map(a => a.kode === account.kode ? account : a));
    } else {
      setAccountCodeList([...accountCodeList, account]);
    }
    notify(`Kode Akun ${account.kode} (${account.nama}) berhasil disimpan!`, 'success');
  };

  const addOrUpdateStok = async (item: StokItem) => {
    const exists = stokList.some((s) => s.kode_barang === item.kode_barang);
    const updated = exists
      ? stokList.map((s) => (s.kode_barang === item.kode_barang ? item : s))
      : [...stokList, item];
    setStokList(updated);
    notify(`Data stok material ${item.nama_barang} berhasil disimpan!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'stok', item);
    }
  };

  const recordMutasi = async (mutasiData: Omit<MutasiStokItem, 'id'>) => {
    const newId = `MUT-${String(mutasiList.length + 1).padStart(3, '0')}`;
    const newMutasi: MutasiStokItem = { id: newId, ...mutasiData };
    setMutasiList([newMutasi, ...mutasiList]);

    // Update stok
    const stokItem = stokList.find((s) => s.kode_barang === mutasiData.kode_barang);
    if (stokItem) {
      let masuk = Number(stokItem.stok_masuk);
      let terpakai = Number(stokItem.terpakai);
      if (mutasiData.jenis_mutasi === 'Masuk') {
        masuk += Number(mutasiData.jumlah);
      } else {
        terpakai += Number(mutasiData.jumlah);
      }
      const sisa = masuk - terpakai;
      const status_stok = sisa <= 5 ? 'Kritis' : sisa <= 15 ? 'Menipis' : 'Aman';

      const updatedStok: StokItem = {
        ...stokItem,
        stok_masuk: masuk,
        terpakai,
        sisa_barang: sisa,
        status_stok,
        updated_at: new Date().toISOString().split('T')[0]
      };
      await addOrUpdateStok(updatedStok);
    }

    notify(`Mutasi ${mutasiData.jenis_mutasi} ${mutasiData.nama_barang} berhasil dicatat!`, 'success');
    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'mutasiStok', newMutasi);
    }
  };

  const addLedgerEntry = async (entry: Omit<LedgerItem, 'id_transaksi' | 'saldo'>) => {
    const lastSaldo = ledgerList.length > 0 ? ledgerList[ledgerList.length - 1].saldo : 0;
    const newSaldo = lastSaldo + Number(entry.kas_masuk) - Number(entry.kas_keluar);
    const newTrxId = `TRX-${new Date().getFullYear()}-${String(ledgerList.length + 1).padStart(3, '0')}`;

    const newLedgerItem: LedgerItem = {
      id_transaksi: newTrxId,
      ...entry,
      saldo: newSaldo
    };

    setLedgerList([...ledgerList, newLedgerItem]);
    notify(`Transaksi buku besar ${entry.deskripsi} berhasil dicatat!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'generalLedger', newLedgerItem);
    }
  };

  const addOrUpdateHPP = async (hpp: HPPItem) => {
    const exists = hppList.some((h) => h.id_proyek === hpp.id_proyek);
    const updated = exists
      ? hppList.map((h) => (h.id_proyek === hpp.id_proyek ? hpp : h))
      : [...hppList, hpp];
    setHppList(updated);
    notify(`HPP Karoseri "${hpp.nama_proyek}" berhasil disimpan!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'hppProduksi', hpp);
    }
  };

  const saveQuotation = async (quote: QuotationItem) => {
    const exists = quotationList.some((q) => q.nomor_quote === quote.nomor_quote);
    const updated = exists
      ? quotationList.map((q) => (q.nomor_quote === quote.nomor_quote ? quote : q))
      : [quote, ...quotationList];
    setQuotationList(updated);
    notify(`Surat Penawaran Harga ${quote.nomor_quote} berhasil disimpan!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'quotations', quote);
    }
  };

  const saveInvoice = async (inv: InvoiceItem) => {
    const exists = invoiceList.some((i) => i.nomor_inv === inv.nomor_inv);
    const updated = exists
      ? invoiceList.map((i) => (i.nomor_inv === inv.nomor_inv ? inv : i))
      : [inv, ...invoiceList];
    setInvoiceList(updated);
    notify(`Invoice ${inv.nomor_inv} berhasil diterbitkan!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'invoices', inv);
    }
  };

  const updateInvoiceStatus = async (nomor_inv: string, status: 'Belum Bayar' | 'DP Diterima' | 'Lunas') => {
    const updated = invoiceList.map((inv) =>
      inv.nomor_inv === nomor_inv ? { ...inv, status_bayar: status } : inv
    );
    setInvoiceList(updated);
    notify(`Status Invoice ${nomor_inv} diubah menjadi: ${status}`, 'success');

    const targetInv = updated.find((i) => i.nomor_inv === nomor_inv);
    if (targetInv && scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'invoices', targetInv);
    }
  };

  const addOrUpdateMonthlyBudget = async (item: MonthlyBudgetItem) => {
    const exists = monthlyBudgetList.some((b) => b.id === item.id);
    const updated = exists
      ? monthlyBudgetList.map((b) => (b.id === item.id ? item : b))
      : [...monthlyBudgetList, item];
    setMonthlyBudgetList(updated);
    notify(`Anggaran bulan ${item.nama_bulan} ${item.tahun} berhasil diperbarui!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'anggaranRealisasi', item);
    }
  };

  const saveAdmin = async (admin: AdminUser) => {
    const exists = admins.some((a) => a.id === admin.id);
    const updated = exists
      ? admins.map((a) => (a.id === admin.id ? admin : a))
      : [...admins, admin];
    setAdmins(updated);
    notify(`Data admin ${admin.name} berhasil disimpan!`, 'success');

    if (scriptUrl && isConnected) {
      await saveToGAS(scriptUrl, 'admins', admin);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentAdmin,
        setCurrentAdmin,
        admins,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        accountCodeList,
        addAccountCode,
        stokList,
        mutasiList,
        ledgerList,
        hppList,
        quotationList,
        invoiceList,
        monthlyBudgetList,
        scriptUrl,
        updateScriptUrl,
        isConnected,
        isLoading,
        notification,
        notify,
        refreshFromGAS,
        addOrUpdateStok,
        recordMutasi,
        addLedgerEntry,
        addOrUpdateHPP,
        saveQuotation,
        saveInvoice,
        updateInvoiceStatus,
        addOrUpdateMonthlyBudget,
        saveAdmin,
        printableDoc,
        setPrintableDoc
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
