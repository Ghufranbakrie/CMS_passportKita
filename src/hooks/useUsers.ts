import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type User, type CreateUserInput, type UpdateUserInput, type GetUsersQuery } from '@/api/user.api';

export function useUsers(filters?: GetUsersQuery) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userApi.getAll(filters),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => userApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      userApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export type { User, CreateUserInput, UpdateUserInput, GetUsersQuery };

