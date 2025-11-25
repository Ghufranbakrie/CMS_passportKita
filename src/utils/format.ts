/**
 * Utility functions untuk formatting data
 * Digunakan di berbagai komponen untuk konsistensi
 */

/**
 * Format number dengan separator titik setiap 3 angka (ribuan)
 * Contoh: 1000000 -> "1.000.000"
 */
export function formatNumber(
  value: number | string | undefined | null
): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;

  if (isNaN(numValue)) {
    return "";
  }

  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse formatted number string menjadi number
 * Contoh: "1.000.000" -> 1000000
 * Returns 0 jika invalid, bukan NaN
 */
export function parseNumber(value: string): number {
  if (!value || value.trim() === "") {
    return 0;
  }

  // Hapus semua titik (separator ribuan)
  const cleaned = value.replace(/\./g, "");
  const parsed = parseFloat(cleaned);

  // Pastikan tidak return NaN
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
}

/**
 * Format currency Rupiah dengan separator titik
 * Contoh: 1000000 -> "Rp 1.000.000"
 */
export function formatCurrency(
  value: number | string | undefined | null
): string {
  const formatted = formatNumber(value);
  return formatted ? `Rp ${formatted}` : "";
}

/**
 * Format date ke format Indonesia
 * Contoh: "2024-01-15" -> "15 Januari 2024"
 */
export function formatDateIndonesian(date: string | Date): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Generate slug dari title
 * Contoh: "Winter Wonderland Tour" -> "winter-wonderland-tour"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Hapus karakter khusus
    .replace(/\s+/g, "-") // Ganti spasi dengan dash
    .replace(/-+/g, "-") // Hapus multiple dash
    .replace(/^-|-$/g, ""); // Hapus dash di awal/akhir
}

/**
 * Get today date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split("T")[0];
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discount: number
): number {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round((discount / originalPrice) * 100);
}

/**
 * Calculate final price after discount
 */
export function calculateFinalPrice(
  originalPrice: number,
  discount: number
): number {
  return Math.max(0, originalPrice - discount);
}
