/**
 * Utility functions untuk validasi form
 * Digunakan untuk konsistensi validasi di berbagai form
 */

import { z } from "zod";

/**
 * Validasi tanggal tidak boleh lebih kecil dari hari ini
 */
export function validateDateNotPast(date: string): boolean {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
}

/**
 * Validasi tanggal selesai harus setelah tanggal mulai
 */
export function validateEndDateAfterStart(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}

/**
 * Validasi discount tidak boleh lebih besar dari original price
 */
export function validateDiscountNotGreaterThanOriginal(
  originalPrice: number | undefined,
  discount: number | undefined
): boolean {
  if (!originalPrice || !discount) return true;
  return discount <= originalPrice;
}

/**
 * Validasi seats taken tidak boleh lebih besar dari total seats
 */
export function validateSeatsTakenNotGreaterThanTotal(
  totalSeats: number | undefined,
  seatsTaken: number | undefined
): boolean {
  if (!totalSeats || !seatsTaken) return true;
  return seatsTaken <= totalSeats;
}

/**
 * Validasi array tidak kosong setelah filter
 */
export function validateArrayNotEmpty<T>(
  array: T[] | undefined,
  filterFn?: (item: T) => boolean
): boolean {
  if (!array || array.length === 0) return false;
  if (filterFn) {
    return array.filter(filterFn).length > 0;
  }
  return true;
}

/**
 * Validasi URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validasi slug format (lowercase, alphanumeric, hyphens only)
 */
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

