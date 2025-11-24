import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourApi, type Tour, type CreateTourInput, type UpdateTourInput, type GetToursQuery } from '@/api/tour.api';

// Query Keys
export const tourKeys = {
  all: ['tours'] as const,
  lists: () => [...tourKeys.all, 'list'] as const,
  list: (filters?: GetToursQuery) => [...tourKeys.lists(), filters] as const,
  details: () => [...tourKeys.all, 'detail'] as const,
  detail: (id: string) => [...tourKeys.details(), id] as const,
  bySlug: (slug: string) => [...tourKeys.details(), 'slug', slug] as const,
};

// Get All Tours Query
export const useTours = (filters?: GetToursQuery) => {
  return useQuery({
    queryKey: tourKeys.list(filters),
    queryFn: () => tourApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};

// Get Tour By ID Query
export const useTour = (id: string | undefined) => {
  return useQuery({
    queryKey: tourKeys.detail(id!),
    queryFn: () => tourApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Get Tour By Slug Query
export const useTourBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: tourKeys.bySlug(slug!),
    queryFn: () => tourApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

// Create Tour Mutation
export const useCreateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTourInput) => tourApi.create(input),
    onSuccess: () => {
      // Invalidate and refetch tours list
      queryClient.invalidateQueries({ queryKey: tourKeys.lists() });
    },
  });
};

// Update Tour Mutation
export const useUpdateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTourInput }) =>
      tourApi.update(id, input),
    onSuccess: (data, variables) => {
      // Update the specific tour in cache
      queryClient.setQueryData(tourKeys.detail(variables.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: tourKeys.lists() });
    },
  });
};

// Delete Tour Mutation
export const useDeleteTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tourApi.delete(id),
    onSuccess: () => {
      // Invalidate all tour queries
      queryClient.invalidateQueries({ queryKey: tourKeys.all });
    },
  });
};

