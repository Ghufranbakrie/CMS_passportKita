import api from '@/utils/api';

export interface Tour {
  id: string;
  title: string;
  slug: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  startDate: string;
  endDate: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  seatsTaken?: number;
  totalSeats?: number;
  category: 'FEATURED' | 'UPCOMING' | 'REGULAR' | 'CUSTOM';
  destinations: { id: string; destination: string }[];
  facilities: { id: string; facility: string }[];
  highlights: { id: string; title?: string; description?: string }[];
  itinerary: { id: string; day: number; title: string; activities: string[] }[];
  included: { id: string; item: string }[];
  excluded: { id: string; item: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourInput {
  title: string;
  slug: string;
  image: string;
  badge?: 'HOT DEAL' | 'ALMOST FULL' | 'NEW' | 'LAST CALL';
  badgeColor?: string;
  startDate: string;
  endDate: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  seatsTaken?: number;
  totalSeats?: number;
  destinations: string[];
  facilities: string[];
  highlights: (string | { title: string; description?: string })[];
  itinerary?: { day: number; title: string; activities: string[] }[];
  included: string[];
  excluded?: string[];
  category?: 'FEATURED' | 'UPCOMING' | 'REGULAR' | 'CUSTOM';
}

export interface UpdateTourInput extends Partial<CreateTourInput> {
  id?: string;
}

export interface GetToursQuery {
  category?: 'FEATURED' | 'UPCOMING' | 'REGULAR' | 'CUSTOM';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ToursResponse {
  tours: Tour[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const tourApi = {
  getAll: async (filters?: GetToursQuery): Promise<ToursResponse> => {
    const response = await api.get('/tours', { params: filters });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch tours');
    }
    return {
      tours: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<Tour> => {
    const response = await api.get(`/tours/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch tour');
    }
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Tour> => {
    const response = await api.get(`/tours/slug/${slug}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch tour');
    }
    return response.data.data;
  },

  create: async (input: CreateTourInput): Promise<Tour> => {
    const response = await api.post('/tours', input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create tour');
    }
    return response.data.data;
  },

  update: async (id: string, input: UpdateTourInput): Promise<Tour> => {
    const response = await api.put(`/tours/${id}`, input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update tour');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/tours/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete tour');
    }
  },
};

