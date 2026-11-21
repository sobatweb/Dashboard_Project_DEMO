/**
 * Utility functions untuk format tanggal, rupiah, dan konversi teks
 */

// Memastikan hanya menampilkan YYYY-MM-DD tanpa jam / zona waktu ISO (T17:00:00.000Z)
export const formatDateClean = (rawDate: string | undefined | null): string => {
  if (!rawDate) return '-';
  // Jika string mengandung huruf 'T', potong hanya ambil bagian tanggalnya saja
  const dateOnly = String(rawDate).split('T')[0].trim();
  return dateOnly || '-';
};

// Mendapatkan tanggal hari ini dalam format YYYY-MM-DD (untuk min constraint kalender)
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format nominal rupiah
export const formatRupiah = (val: number | string | undefined | null): string => {
  const num = Number(val || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
};

// Konversi angka ke kalimat terbilang Rupiah
export const angkaKeTerbilang = (nilai: number): string => {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  const konversi = (n: number): string => {
    if (n < 12) return bilangan[n];
    if (n < 20) return konversi(n - 10) + ' Belas';
    if (n < 100) return konversi(Math.floor(n / 10)) + ' Puluh ' + konversi(n % 10);
    if (n < 200) return 'Seratus ' + konversi(n - 100);
    if (n < 1000) return konversi(Math.floor(n / 100)) + ' Ratus ' + konversi(n % 100);
    if (n < 2000) return 'Seribu ' + konversi(n - 1000);
    if (n < 1000000) return konversi(Math.floor(n / 1000)) + ' Ribu ' + konversi(n % 1000);
    if (n < 1000000000) return konversi(Math.floor(n / 1000000)) + ' Juta ' + konversi(n % 1000000);
    if (n < 1000000000000) return konversi(Math.floor(n / 1000000000)) + ' Miliar ' + konversi(n % 1000000000);
    return '';
  };

  const bulat = Math.floor(nilai);
  if (bulat <= 0) return 'Nol Rupiah';
  const hasil = konversi(bulat).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
};
