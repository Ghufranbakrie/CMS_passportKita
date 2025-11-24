import api from '@/utils/api';

export interface UploadImageResponse {
  url: string;
  filename: string;
  size: number;
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
};

