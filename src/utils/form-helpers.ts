/**
 * Utility functions untuk membantu operasi form
 * Digunakan di TourCreate dan TourEdit untuk konsistensi
 */

import type { UseFormReturn, FieldValues, FieldPath } from "react-hook-form";

/**
 * Tambah field baru ke array field
 */
export function addArrayField<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>,
  defaultValue: any = ""
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  form.setValue(fieldName, [...current, defaultValue] as any);
}

/**
 * Hapus field dari array field
 */
export function removeArrayField<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>,
  index: number
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  form.setValue(fieldName, current.filter((_, i) => i !== index) as any);
}

/**
 * Tambah highlight baru
 */
export function addHighlight<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  form.setValue(fieldName, [...current, { title: "", description: "" }] as any);
}

/**
 * Hapus highlight
 */
export function removeHighlight<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>,
  index: number
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  form.setValue(fieldName, current.filter((_, i) => i !== index) as any);
}

/**
 * Tambah itinerary baru
 */
export function addItinerary<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  const nextDay =
    current.length > 0
      ? Math.max(...current.map((i: any) => i.day || 0)) + 1
      : 1;
  form.setValue(fieldName, [
    ...current,
    { day: nextDay, title: "", activities: [""] },
  ] as any);
}

/**
 * Hapus itinerary
 */
export function removeItinerary<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>,
  index: number
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  form.setValue(fieldName, current.filter((_, i) => i !== index) as any);
}

/**
 * Tambah activity ke itinerary
 */
export function addActivity<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>,
  itineraryIndex: number
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  const itinerary = current[itineraryIndex];
  if (itinerary) {
    const updated = [...current];
    updated[itineraryIndex] = {
      ...itinerary,
      activities: [...(itinerary.activities || []), ""],
    };
    form.setValue(fieldName, updated as any);
  }
}

/**
 * Hapus activity dari itinerary
 */
export function removeActivity<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: FieldPath<T>,
  itineraryIndex: number,
  activityIndex: number
) {
  const current = (form.getValues(fieldName) as any[]) || [];
  const itinerary = current[itineraryIndex];
  if (itinerary && itinerary.activities && itinerary.activities.length > 1) {
    const updated = [...current];
    updated[itineraryIndex] = {
      ...itinerary,
      activities: itinerary.activities.filter((_, i) => i !== activityIndex),
    };
    form.setValue(fieldName, updated as any);
  }
}
