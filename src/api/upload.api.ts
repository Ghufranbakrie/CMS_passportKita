import api from '@/utils/api';

export interface UploadImageResponse {
  url: string;
  filename: string;
  convertedToWebP?: boolean;
  format?: string;
  size: number;
}

export interface ImageInfo {
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to upload image');
    }

    return response.data.data;
  },

  deleteImage: async (filename: string): Promise<void> => {
    const response = await api.delete(`/upload/image/${filename}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete image');
    }
  },

  listImages: async (): Promise<ImageInfo[]> => {
    const response = await api.get('/upload/images');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to list images');
    }
    return response.data.data;
  },
};

