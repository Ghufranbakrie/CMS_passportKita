import { useMutation } from '@tanstack/react-query';
import { uploadApi, type UploadImageResponse } from '@/api/upload.api';

// Upload Image Mutation
export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File): Promise<UploadImageResponse> => uploadApi.uploadImage(file),
  });
};

// Delete Image Mutation
export const useDeleteImage = () => {
  return useMutation({
    mutationFn: (filename: string) => uploadApi.deleteImage(filename),
  });
};

