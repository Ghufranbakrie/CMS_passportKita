import api from '@/utils/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export interface GetCustomersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const customerApi = {
  getAll: async (filters?: GetCustomersQuery): Promise<CustomersResponse> => {
    const response = await api.get('/customers', { params: filters });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch customers');
    }
    return {
      customers: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch customer');
    }
    return response.data.data;
  },

  create: async (input: CreateCustomerInput): Promise<Customer> => {
    const response = await api.post('/customers', input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create customer');
    }
    return response.data.data;
  },

  update: async (id: string, input: UpdateCustomerInput): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update customer');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/customers/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete customer');
    }
  },
};

