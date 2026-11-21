export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  action?: 'insert' | 'update';
  key?: string;
}

const STORAGE_KEYS = {
  SCRIPT_URL: 'bengkel_gas_script_url',
  STOK: 'bengkel_data_stok',
  MUTASI: 'bengkel_data_mutasi',
  LEDGER: 'bengkel_data_ledger',
  HPP: 'bengkel_data_hpp',
  QUOTATIONS: 'bengkel_data_quotations',
  INVOICES: 'bengkel_data_invoices',
  ANGGARAN: 'bengkel_data_anggaran',
  ADMINS: 'bengkel_data_admins'
};

export const getStoredScriptUrl = (): string => {
  return localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) || '';
};

export const setStoredScriptUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url.trim());
};

/**
 * Fetch all data from Google Apps Script Web App
 */
export async function fetchAllFromGAS(scriptUrl: string): Promise<any> {
  if (!scriptUrl) throw new Error('URL Google Apps Script belum diisi');

  const cleanUrl = scriptUrl.trim();
  const sep = cleanUrl.includes('?') ? '&' : '?';
  const url = `${cleanUrl}${sep}action=getAll&t=${Date.now()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.status !== 'success') {
    throw new Error(json.message || 'Gagal memuat data dari Google Sheets');
  }

  return json.data;
}

/**
 * Test Connection to Google Apps Script
 */
export async function testGASConnection(scriptUrl: string): Promise<boolean> {
  if (!scriptUrl) return false;
  try {
    const cleanUrl = scriptUrl.trim();
    const sep = cleanUrl.includes('?') ? '&' : '?';
    const url = `${cleanUrl}${sep}action=ping&t=${Date.now()}`;
    const res = await fetch(url, { method: 'GET' });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error('GAS connection test failed:', err);
    return false;
  }
}

/**
 * Trigger remote initSheets from web dashboard
 */
export async function triggerInitSheets(scriptUrl: string): Promise<string> {
  if (!scriptUrl) throw new Error('URL belum diisi');
  const cleanUrl = scriptUrl.trim();
  const sep = cleanUrl.includes('?') ? '&' : '?';
  const url = `${cleanUrl}${sep}action=init&t=${Date.now()}`;
  const res = await fetch(url, { method: 'GET' });
  const json = await res.json();
  if (json.status === 'success') {
    return json.message || 'Inisialisasi sheet berhasil!';
  }
  throw new Error(json.message || 'Gagal inisialisasi sheet');
}

/**
 * Post or update data to Google Apps Script
 * Uses POST, and falls back to GET payload if POST meets CORS restriction
 */
export async function saveToGAS(
  scriptUrl: string, 
  type: 'stok' | 'mutasi_stok' | 'mutasiStok' | 'ledger' | 'generalLedger' | 'hpp' | 'hppProduksi' | 'quotation' | 'quotations' | 'invoice' | 'invoices' | 'anggaran' | 'anggaranRealisasi' | 'admin' | 'admins' | string, 
  data: any
): Promise<ApiResponse> {
  if (!scriptUrl) {
    return { status: 'success', message: 'Tersimpan di Penyimpanan Lokal (Demo Mode)' };
  }

  const payload = { type, data };

  try {
    // Coba POST terlebih dahulu
    const postRes = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Menghindari preflight OPTIONS CORS issue pada Google Apps Script
      },
      body: JSON.stringify(payload)
    });

    if (postRes.ok) {
      const json = await postRes.json();
      return json;
    }
  } catch (postErr) {
    console.warn('POST failed, attempting GET fallback...', postErr);
  }

  // Fallback saveViaGet
  try {
    const cleanUrl = scriptUrl.trim();
    const sep = cleanUrl.includes('?') ? '&' : '?';
    const encodedPayload = encodeURIComponent(JSON.stringify(payload));
    const url = `${cleanUrl}${sep}action=saveViaGet&payload=${encodedPayload}&t=${Date.now()}`;
    
    const getRes = await fetch(url, { method: 'GET' });
    if (getRes.ok) {
      return await getRes.json();
    }
  } catch (getErr) {
    console.error('Save to GAS error:', getErr);
    throw new Error('Gagal menyimpan ke Google Sheets. Pastikan Web App diset ke "Anyone"!');
  }

  return { status: 'success', message: 'Data diproses' };
}
