import api from '@/utils/api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', input);
      if (!response.data.success) {
        const errorMessage = response.data.error?.message || response.data.message || 'Login failed';
        const error = new Error(errorMessage);
        (error as any).response = { data: response.data };
        throw error;
      }
      return response.data.data;
    } catch (error: any) {
      // Re-throw with proper structure for error handling
      if (error.response) {
        throw error;
      }
      // Network or other errors
      const newError = new Error(error.message || 'Login failed. Please check your connection.');
      (newError as any).response = error.response || { data: { error: { message: error.message } } };
      throw newError;
    }
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', input);
      if (!response.data.success) {
        const errorMessage = response.data.error?.message || response.data.message || 'Registration failed';
        const error = new Error(errorMessage);
        (error as any).response = { data: response.data };
        throw error;
      }
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        throw error;
      }
      const newError = new Error(error.message || 'Registration failed. Please check your connection.');
      (newError as any).response = error.response || { data: { error: { message: error.message } } };
      throw newError;
    }
  },
};

