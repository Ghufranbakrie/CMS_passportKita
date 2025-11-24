import api from '@/utils/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface GetUsersQuery {
  search?: string;
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userApi = {
  getAll: async (filters?: GetUsersQuery): Promise<UsersResponse> => {
    const response = await api.get('/users', { params: filters });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch users');
    }
    return {
      users: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user');
    }
    return response.data.data;
  },

  create: async (input: CreateUserInput): Promise<User> => {
    const response = await api.post('/users', input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create user');
    }
    return response.data.data;
  },

  update: async (id: string, input: UpdateUserInput): Promise<User> => {
    const response = await api.put(`/users/${id}`, input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update user');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  },
};

