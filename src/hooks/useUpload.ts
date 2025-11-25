import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadApi, type UploadImageResponse, type ImageInfo } from '@/api/upload.api';

// Upload Image Mutation
export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File): Promise<UploadImageResponse> => uploadApi.uploadImage(file),
  });
};

// Delete Image Mutation
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename: string) => uploadApi.deleteImage(filename),
    onSuccess: () => {
      // Invalidate and refetch images list
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

// List Images Query
export const useImages = () => {
  return useQuery({
    queryKey: ['images'],
    queryFn: () => uploadApi.listImages(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

