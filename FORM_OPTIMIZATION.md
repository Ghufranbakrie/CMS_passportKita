# Form Optimization - Tour Create/Edit

## Ringkasan Perubahan

Form Tour Create telah dioptimalkan dengan standar CMS profesional, termasuk:

### 1. Utility Functions (`src/utils/`)

#### `format.ts`

- `formatNumber()` - Format angka dengan titik setiap 3 angka (ribuan)
- `parseNumber()` - Parse string angka yang sudah diformat
- `formatCurrency()` - Format currency Rupiah
- `formatDateIndonesian()` - Format tanggal ke bahasa Indonesia
- `generateSlug()` - Generate slug dari title
- `getTodayDateString()` - Get tanggal hari ini dalam format YYYY-MM-DD
- `calculateDiscountPercentage()` - Hitung persentase diskon
- `calculateFinalPrice()` - Hitung harga akhir setelah diskon

#### `form-validation.ts`

- `validateDateNotPast()` - Validasi tanggal tidak boleh di masa lalu
- `validateEndDateAfterStart()` - Validasi tanggal selesai setelah tanggal mulai
- `validateDiscountNotGreaterThanOriginal()` - Validasi diskon tidak lebih besar dari harga asli
- `validateSeatsTakenNotGreaterThanTotal()` - Validasi kursi terisi tidak lebih besar dari total
- `validateArrayNotEmpty()` - Validasi array tidak kosong
- `validateUrl()` - Validasi format URL
- `validateSlug()` - Validasi format slug

#### `form-helpers.ts`

- `addArrayField()` - Tambah field baru ke array
- `removeArrayField()` - Hapus field dari array
- `addHighlight()` - Tambah highlight baru
- `removeHighlight()` - Hapus highlight
- `addItinerary()` - Tambah itinerary baru
- `removeItinerary()` - Hapus itinerary
- `addActivity()` - Tambah activity ke itinerary
- `removeActivity()` - Hapus activity dari itinerary

#### `index.ts`

- Central export untuk semua utility functions

### 2. Komponen Baru

#### `NumberInput` (`src/components/ui/number-input.tsx`)

- Input khusus untuk angka dengan format otomatis
- **Format real-time**: Menampilkan angka dengan titik setiap 3 angka (ribuan) langsung saat mengetik
- Contoh: Mengetik `29500000` → Otomatis menjadi `29.500.000`
- Mudah melihat berapa banyak angka 0 dengan format titik
- Support untuk format saat blur (opsional dengan `formatOnBlur={true}`)
- Handle empty value dengan benar
- Tidak memaksa value 0 saat kosong
- Cursor position tetap terjaga saat format

### 3. Perbaikan Form Create

#### Auto-generate Slug

- Slug otomatis dibuat dari title saat user mengetik
- User masih bisa mengubah slug secara manual
- Format otomatis: lowercase, replace spaces dengan hyphens

#### Format Harga dengan Titik

- Semua input harga menggunakan `NumberInput`
- Format otomatis dengan titik setiap 3 angka
- Mudah dibaca dan diinput
- Tidak memaksa value 0 saat kosong

#### Sinkronisasi Harga Asli dan Discount

- Harga asli otomatis di-set sama dengan harga jika belum diisi
- Validasi real-time: discount tidak boleh lebih besar dari harga asli
- Auto-adjust discount jika melebihi harga asli
- Menampilkan persentase diskon dan harga akhir
- Toast notification untuk feedback user

#### Sinkronisasi Kursi

- Validasi real-time: kursi terisi tidak boleh lebih besar dari total kursi
- Auto-adjust kursi terisi jika melebihi total
- Menampilkan kursi tersedia secara real-time
- Toast notification untuk feedback user

#### Validasi Real-time

- Validasi per tab dengan visual indicator
- Tombol "Selanjutnya" disabled jika tab tidak valid
- Tombol "Buat Tour" hanya muncul di tab terakhir
- Progress indicator dengan check icon untuk tab yang sudah valid
- Error message ditampilkan dalam warna merah

#### UX Improvements

- Form description di setiap field untuk guidance
- Real-time feedback untuk perhitungan (diskon, kursi tersedia)
- Toast notifications untuk validasi dan auto-adjust
- Visual progress indicator di tab navigation
- Responsive layout dengan grid system

### 4. Best Practices CMS

#### Code Organization

- Utility functions terpisah dan reusable
- Central export untuk kemudahan import
- Type-safe dengan TypeScript
- Consistent naming convention

#### User Experience

- Clear visual feedback
- Real-time validation
- Helpful error messages
- Auto-sync related fields
- Progress indication

#### Form Validation

- Client-side validation dengan Zod
- Real-time validation feedback
- Cross-field validation
- Custom validation messages dalam bahasa Indonesia

## Cara Penggunaan

### Import Utilities

```typescript
import {
  formatNumber,
  generateSlug,
  addArrayField,
  // ... other utilities
} from "@/utils";
```

### Menggunakan NumberInput

```typescript
<NumberInput
  placeholder="29.500.000"
  value={field.value}
  onChange={(value) => {
    field.onChange(value ?? undefined);
  }}
/>
```

### Menggunakan Form Helpers

```typescript
import { addArrayField, removeArrayField } from "@/utils";

// Tambah field
addArrayField(form, "destinations", "");

// Hapus field
removeArrayField(form, "destinations", index);
```

## Catatan Penting

1. **NumberInput**: Value bisa `undefined` saat kosong, bukan `0`
2. **Auto-sync**: Harga asli otomatis di-set dari harga jika belum diisi
3. **Validation**: Validasi real-time dengan debounce 300ms
4. **Format**: Format angka hanya untuk display, value tetap number
5. **Type Imports**: Gunakan `type` import untuk TypeScript types dari react-hook-form (FieldValues, UseFormReturn, FieldPath)

## File yang Diubah

- `src/pages/Tours/TourCreate.tsx` - Form create dengan optimasi
- `src/components/ui/number-input.tsx` - Komponen baru
- `src/utils/format.ts` - Utility functions untuk formatting
- `src/utils/form-validation.ts` - Utility functions untuk validasi
- `src/utils/form-helpers.ts` - Utility functions untuk form operations
- `src/utils/index.ts` - Central export

## File yang Bisa Dioptimalkan Selanjutnya

- `src/pages/Tours/TourEdit.tsx` - Bisa menggunakan utility functions yang sama
- `src/pages/Users/UserCreate.tsx` - Bisa menggunakan NumberInput dan utilities
- `src/pages/Users/UserEdit.tsx` - Bisa menggunakan NumberInput dan utilities
