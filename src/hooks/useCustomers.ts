import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi, type Customer, type CreateCustomerInput, type UpdateCustomerInput, type GetCustomersQuery } from '@/api/customer.api';

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: GetCustomersQuery) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Get All Customers Query
export const useCustomers = (filters?: GetCustomersQuery) => {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customerApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get Customer By ID Query
export const useCustomer = (id: string | undefined) => {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => customerApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// Create Customer Mutation
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customerApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};

// Update Customer Mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      customerApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(customerKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};

// Delete Customer Mutation
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};

