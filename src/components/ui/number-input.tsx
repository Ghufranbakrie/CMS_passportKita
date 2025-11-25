/**
 * Number Input Component dengan format otomatis
 * Menampilkan angka dengan separator titik setiap 3 angka
 * Memudahkan input harga dan angka besar
 */

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatNumber, parseNumber } from "@/utils/format";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  value?: number | string | undefined | null;
  onChange?: (value: number | undefined) => void;
  formatOnBlur?: boolean; // Jika true, format hanya saat blur (default: false = format real-time)
  allowNegative?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      onChange,
      formatOnBlur = false,
      allowNegative = false,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Initialize display value
    React.useEffect(() => {
      if (value === undefined || value === null || value === "") {
        setDisplayValue("");
      } else {
        const numValue =
          typeof value === "string" ? parseNumber(value) : Number(value);
        if (isNaN(numValue)) {
          setDisplayValue("");
        } else if (numValue === 0) {
          // Jika 0 dan ada placeholder, tampilkan empty
          if (props.placeholder) {
            setDisplayValue("");
          } else {
            setDisplayValue("0");
          }
        } else {
          // Format dengan titik setiap 3 angka (real-time)
          if (formatOnBlur && isFocused) {
            // Saat focus dan formatOnBlur=true, tampilkan plain number
            setDisplayValue(numValue.toString());
          } else {
            // Format dengan titik
            setDisplayValue(formatNumber(numValue));
          }
        }
      }
    }, [value, formatOnBlur, isFocused, props.placeholder]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Simpan cursor position
      const cursorPosition = e.target.selectionStart || 0;

      // Hapus semua karakter non-digit (termasuk titik) kecuali minus jika diizinkan
      if (allowNegative) {
        inputValue = inputValue.replace(/[^\d-]/g, "");
        // Pastikan minus hanya di awal
        if (inputValue.includes("-") && inputValue.indexOf("-") !== 0) {
          inputValue = inputValue.replace(/-/g, "");
        }
      } else {
        // Hapus semua non-digit (termasuk titik yang sudah ada)
        inputValue = inputValue.replace(/\D/g, "");
      }

      // Jika kosong, set ke empty string dan trigger onChange dengan undefined
      if (inputValue === "" || inputValue === "-") {
        setDisplayValue("");
        onChange?.(undefined);
        return;
      }

      // Parse angka
      const numValue = parseNumber(inputValue);

      // Pastikan tidak ada NaN
      if (isNaN(numValue)) {
        setDisplayValue("");
        onChange?.(undefined);
        return;
      }

      if (numValue === 0) {
        // Jika hasil parse adalah 0, tampilkan empty jika ada placeholder
        if (props.placeholder) {
          setDisplayValue("");
          onChange?.(undefined);
        } else {
          setDisplayValue("0");
          onChange?.(0);
        }
        return;
      }

      // Format dengan titik setiap 3 angka (real-time saat mengetik)
      // Default: format langsung saat mengetik (formatOnBlur = false)
      if (formatOnBlur && isFocused) {
        // Jika formatOnBlur=true dan sedang focus, tampilkan plain number
        setDisplayValue(inputValue);
      } else {
        // Format langsung dengan titik (default behavior)
        const formatted = formatNumber(numValue);
        setDisplayValue(formatted);

        // Restore cursor position setelah format
        // Hitung posisi cursor baru berdasarkan jumlah titik yang ditambahkan
        setTimeout(() => {
          if (inputRef.current) {
            const newCursorPos = calculateNewCursorPosition(
              inputValue,
              formatted,
              cursorPosition
            );
            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }

      // Pastikan hanya mengirim number yang valid, bukan NaN
      onChange?.(isNaN(numValue) ? undefined : numValue);
    };

    // Helper untuk menghitung posisi cursor setelah format
    const calculateNewCursorPosition = (
      oldValue: string,
      newValue: string,
      oldCursorPos: number
    ): number => {
      // Hitung jumlah digit sebelum cursor di oldValue (tanpa titik)
      const digitsBeforeCursor = oldValue
        .substring(0, oldCursorPos)
        .replace(/\D/g, "").length;

      // Hitung posisi cursor baru di newValue berdasarkan jumlah digit
      let newCursorPos = 0;
      let digitCount = 0;

      for (let i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue[i])) {
          digitCount++;
          if (digitCount >= digitsBeforeCursor) {
            newCursorPos = i + 1;
            break;
          }
        }
        newCursorPos = i + 1;
      }

      // Pastikan tidak melebihi panjang string
      return Math.min(newCursorPos, newValue.length);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Saat focus dan formatOnBlur=true, tampilkan plain number tanpa format
      if (
        formatOnBlur &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== 0
      ) {
        const numValue = typeof value === "string" ? parseNumber(value) : value;
        if (!isNaN(numValue) && numValue > 0) {
          setDisplayValue(numValue.toString());
        }
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Saat blur, format ulang dengan titik
      if (displayValue !== "" && displayValue !== "-") {
        const numValue = parseNumber(displayValue);
        if (!isNaN(numValue) && numValue > 0) {
          setDisplayValue(formatNumber(numValue));
        } else if (numValue === 0 && !props.placeholder) {
          setDisplayValue("0");
        }
      }
      onBlur?.(e);
    };

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
