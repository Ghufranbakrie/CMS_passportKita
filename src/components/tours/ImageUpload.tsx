/**
 * Image Upload Component untuk CMS
 * Memungkinkan upload gambar ke backend dan preview
 */

import React, { useState, useRef, useEffect } from "react";
import { useUploadImage } from "@/hooks/useUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label = "Gambar Tour",
  description,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadImage();

  // Update preview when value changes externally (only when value changes, not preview)
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
      setImageError(false); // Reset error when new value is set
    } else if (!value && preview) {
      setPreview(null);
      setImageError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Only depend on value, not preview to avoid infinite loop

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File tidak valid", {
        description: "Hanya file gambar yang diizinkan (JPEG, PNG, WebP, GIF)",
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar", {
        description: "Ukuran file maksimal 5MB",
        duration: 3000,
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const result = await uploadMutation.mutateAsync(file);
      onChange(result.url);
      toast.success("Gambar berhasil diupload", {
        description: "Gambar telah disimpan",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Upload failed:", error);
      setPreview(null);
      toast.error("Upload gagal", {
        description:
          error?.message || "Gagal mengupload gambar. Silakan coba lagi.",
        duration: 3000,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualUrlChange = (url: string) => {
    onChange(url);
    if (url) {
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      {preview ? (
        <div className="relative w-full border rounded-lg overflow-hidden group">
          <div className="relative aspect-video w-full bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                // Only show error if it's a URL (not a data URL from FileReader)
                if (preview && !preview.startsWith("data:")) {
                  setImageError(true);
                  // Don't clear preview immediately, show error state instead
                  console.warn("Failed to load image:", preview);
                }
              }}
              onLoad={() => {
                setImageError(false);
              }}
            />
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <p className="text-sm text-red-600 mb-2">
                    Gagal memuat gambar
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreview(null);
                      setImageError(false);
                      onChange("");
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            )}
            {!disabled && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop gambar di sini, atau klik untuk memilih
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            id="image-upload"
            disabled={disabled || uploadMutation.isPending}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={disabled || uploadMutation.isPending}
              className="cursor-pointer"
            >
              <span>
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Gambar
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}

      {/* Manual URL input as fallback */}
      <div className="space-y-1">
        <Input
          type="url"
          placeholder="atau masukkan URL gambar (contoh: https://example.com/image.jpg)"
          value={value || ""}
          onChange={(e) => handleManualUrlChange(e.target.value)}
          disabled={disabled}
        />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
