import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi, paymentApi, type Booking, type CreateBookingInput, type UpdateBookingInput, type GetBookingsQuery, type VerifyPaymentInput } from '@/api/booking.api';

// Query Keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters?: GetBookingsQuery) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  byTour: (tourId: string) => [...bookingKeys.all, 'tour', tourId] as const,
  byCustomer: (customerId: string) => [...bookingKeys.all, 'customer', customerId] as const,
};

// Get All Bookings Query
export const useBookings = (filters?: GetBookingsQuery) => {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get Booking By ID Query
export const useBooking = (id: string | undefined) => {
  return useQuery({
    queryKey: bookingKeys.detail(id!),
    queryFn: () => bookingApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Get Bookings By Tour ID Query
export const useBookingsByTour = (tourId: string | undefined) => {
  return useQuery({
    queryKey: bookingKeys.byTour(tourId!),
    queryFn: () => bookingApi.getByTourId(tourId!),
    enabled: !!tourId,
    staleTime: 1000 * 60 * 5,
  });
};

// Get Bookings By Customer ID Query
export const useBookingsByCustomer = (customerId: string | undefined) => {
  return useQuery({
    queryKey: bookingKeys.byCustomer(customerId!),
    queryFn: () => bookingApi.getByCustomerId(customerId!),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5,
  });
};

// Create Booking Mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Update Booking Mutation
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookingInput }) =>
      bookingApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(bookingKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Delete Booking Mutation
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
};

// Verify Payment Mutation
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: VerifyPaymentInput }) =>
      paymentApi.verify(bookingId, input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(bookingKeys.detail(variables.bookingId), data);
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

