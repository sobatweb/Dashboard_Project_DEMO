import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ShieldCheck, 
  Check, 
  UserCheck, 
  Phone, 
  Mail, 
  Edit2
} from 'lucide-react';
import type { AdminUser } from '../types';
import { APP_CONFIG } from '../config';

export const AdminPage: React.FC = () => {
  const { admins, currentAdmin, setCurrentAdmin, saveAdmin } = useApp();

  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    await saveAdmin(editingAdmin);
    setEditingAdmin(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-slate-800" />
          Kelola 5 Pengguna: 2 Owner & 3 Staff
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Pengaturan hak akses sistem {APP_CONFIG.COMPANY_NAME}: 2 Akun Owner (Akses Seluruh Menu) dan 3 Akun Staff Khusus (Inventory, HPP, Cetak Invoice).
        </p>
      </div>

      {/* 5 Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map((adm) => {
          const isActive = currentAdmin.id === adm.id;
          const isOwner = adm.role === 'Owner';
          return (
            <div
              key={adm.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition relative overflow-hidden ${
                isActive ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3" />
                  Pengguna Aktif Saat Ini
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl font-black text-base flex items-center justify-center text-white shrink-0 ${
                  isOwner ? 'bg-slate-900' : 'bg-blue-600'
                }`}>
                  {adm.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">{adm.id}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700">{adm.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{adm.name}</h3>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg mt-1 border ${
                    isOwner 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {adm.roleTitle}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-medium">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{adm.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{adm.phone}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingAdmin(adm)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Profil
                </button>

                {!isActive && (
                  <button
                    onClick={() => setCurrentAdmin(adm)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-300" />
                    Ganti ke Pengguna Ini
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabel Rincian Hak Akses (Matrix Hak Akses Sesuai Permintaan User) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Rincian Wewenang Akses 2 Owner & 3 Staff {APP_CONFIG.COMPANY_NAME}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-900 border-b border-slate-200 font-bold">
                <th className="py-3 px-3 border-r border-slate-200">Jabatan & Role</th>
                <th className="py-3 px-3 border-r border-slate-200">Nama Pengguna</th>
                <th className="py-3 px-3 border-r border-slate-200">Stok Karoseri</th>
                <th className="py-3 px-3 border-r border-slate-200">Buku Kas & Bank</th>
                <th className="py-3 px-3 border-r border-slate-200">HPP Karoseri</th>
                <th className="py-3 px-3 border-r border-slate-200">SPH & Invoice</th>
                <th className="py-3 px-3 border-r border-slate-200">Anggaran Bulanan</th>
                <th className="py-3 px-3">Laba / Rugi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="bg-blue-50/30">
                <td className="py-3 px-3 font-bold text-blue-900 border-r border-slate-200">1. Owner (Direktur Utama)</td>
                <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-200">{APP_CONFIG.DIRECTOR_NAME}</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">✓ Laporan Lengkap</td>
              </tr>
              <tr className="bg-blue-50/30">
                <td className="py-3 px-3 font-bold text-blue-900 border-r border-slate-200">2. Owner (Komisaris)</td>
                <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-200">{APP_CONFIG.COMMISSIONER_NAME}</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Semua Menu</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">✓ Laporan Lengkap</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200">3. Staff Inventory</td>
                <td className="py-3 px-3 font-medium text-slate-800 border-r border-slate-200">Ahmad Fauzi</td>
                <td className="py-3 px-3 text-emerald-700 font-bold border-r border-slate-200">✓ Kelola Stok & Mutasi</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400">✕ Terkunci</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200">4. Staff HPP</td>
                <td className="py-3 px-3 font-medium text-slate-800 border-r border-slate-200">Budi Santoso</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-blue-700 font-bold border-r border-slate-200">✓ Hitung Costing HPP</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400">✕ Terkunci</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-200">5. Staff Invoice</td>
                <td className="py-3 px-3 font-medium text-slate-800 border-r border-slate-200">Maya Kartika</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-blue-700 font-bold border-r border-slate-200">✓ Buat SPH & Cetak Invoice</td>
                <td className="py-3 px-3 text-slate-400 border-r border-slate-200">✕ Terkunci (No Access)</td>
                <td className="py-3 px-3 text-slate-400">✕ Terkunci</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Admin */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Edit Data Pengguna ({editingAdmin.id})
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingAdmin.name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keterangan Jabatan</label>
                <input
                  type="text"
                  required
                  value={editingAdmin.roleTitle}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, roleTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={editingAdmin.phone}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
