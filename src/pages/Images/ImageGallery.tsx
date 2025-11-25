import { useState } from 'react';
import { useImages, useUploadImage, useDeleteImage } from '@/hooks/useUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UploadCloud, Trash2, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';
// Simple date formatter (avoiding date-fns dependency)
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return 'Baru saja';
};

export default function ImageGallery() {
  const { data: images, isLoading, error } = useImages();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteImage();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Upload Gagal', {
        description: 'Hanya file gambar (JPEG, PNG, WebP, GIF) yang diizinkan.',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Upload Gagal', {
        description: 'Ukuran file gambar tidak boleh lebih dari 5MB.',
      });
      return;
    }

    try {
      await uploadMutation.mutateAsync(file);
      toast.success('Upload Berhasil', {
        description: 'Gambar berhasil diunggah.',
      });
      setIsUploadDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error('Upload Gagal', {
        description: error.message || 'Terjadi kesalahan saat mengunggah gambar.',
      });
    }
  };

  const handleDelete = async (filename: string, url: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(filename);
      toast.success('Gambar Dihapus', {
        description: 'Gambar berhasil dihapus.',
      });
      if (selectedImage === url) {
        setSelectedImage(null);
      }
    } catch (error: any) {
      toast.error('Gagal Menghapus', {
        description: error.message || 'Terjadi kesalahan saat menghapus gambar.',
      });
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL Disalin', {
      description: 'URL gambar telah disalin ke clipboard.',
    });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Memuat gambar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Gagal memuat gambar: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Galeri Gambar</h1>
          <p className="text-muted-foreground mt-2">
            Kelola semua gambar yang telah diunggah ({images?.length || 0} gambar)
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload Gambar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Gambar Baru</DialogTitle>
              <DialogDescription>
                Upload gambar baru ke galeri. Format yang didukung: JPEG, PNG, WebP, GIF (maks 5MB)
              </DialogDescription>
            </DialogHeader>
            <div
              onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors ${
                uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                disabled={uploadMutation.isPending}
                className="hidden"
              />
              {uploadMutation.isPending ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UploadCloud className="h-5 w-5 animate-bounce" />
                  <span>Mengunggah...</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk memilih file gambar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (JPEG, PNG, WebP, GIF, maks 5MB)
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Images Grid */}
      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card
              key={image.filename}
              className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(image.url)}
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(image.url);
                      }}
                    >
                      {copiedUrl === image.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.filename, image.url);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground truncate" title={image.filename}>
                  {image.filename}
                </p>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{formatDate(new Date(image.uploadedAt))}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Belum ada gambar</p>
          <p className="text-sm text-muted-foreground mb-4">
            Upload gambar pertama Anda untuk memulai
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload Gambar
          </Button>
        </div>
      )}

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview Gambar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={selectedImage}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => handleCopyUrl(selectedImage)}
                >
                  {copiedUrl === selectedImage ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Salin URL
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

