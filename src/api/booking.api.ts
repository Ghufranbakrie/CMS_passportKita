import api from '@/utils/api';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PENDING_VERIFY' | 'PAID' | 'PARTIAL' | 'REFUNDED';

export interface Booking {
  id: string;
  tourId: string;
  customerId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  numberOfSeats: number;
  paymentProof?: string;
  paymentMethod?: string;
  paymentDate?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tour?: {
    id: string;
    title: string;
    slug: string;
    image: string;
    startDate: string;
    endDate: string;
    price: number;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreateBookingInput {
  tourId: string;
  customerId: string;
  numberOfSeats?: number;
  totalAmount?: number;
  notes?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  numberOfSeats?: number;
  notes?: string;
}

export interface GetBookingsQuery {
  tourId?: string;
  customerId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VerifyPaymentInput {
  paidAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
}

export interface UploadPaymentProofInput {
  bookingId: string;
  paymentProof: string;
  paidAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
}

export const bookingApi = {
  getAll: async (filters?: GetBookingsQuery): Promise<BookingsResponse> => {
    const response = await api.get('/bookings', { params: filters });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings');
    }
    return {
      bookings: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch booking');
    }
    return response.data.data;
  },

  create: async (input: CreateBookingInput): Promise<Booking> => {
    const response = await api.post('/bookings', input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create booking');
    }
    return response.data.data;
  },

  update: async (id: string, input: UpdateBookingInput): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}`, input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update booking');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete(`/bookings/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete booking');
    }
  },

  getByTourId: async (tourId: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings/tour/${tourId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings');
    }
    return response.data.data;
  },

  getByCustomerId: async (customerId: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings/customer/${customerId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch bookings');
    }
    return response.data.data;
  },
};

export const paymentApi = {
  verify: async (bookingId: string, input: VerifyPaymentInput) => {
    const response = await api.post(`/payments/verify/${bookingId}`, input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to verify payment');
    }
    return response.data.data;
  },

  uploadProof: async (input: UploadPaymentProofInput) => {
    const response = await api.post('/payments/upload-proof', input);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to upload payment proof');
    }
    return response.data.data;
  },

  getByBookingId: async (bookingId: string) => {
    const response = await api.get(`/payments/${bookingId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch payment');
    }
    return response.data.data;
  },
};

