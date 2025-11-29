import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ToursList from './pages/Tours/ToursList';
import TourCreate from './pages/Tours/TourCreate';
import TourEdit from './pages/Tours/TourEdit';
import UsersList from './pages/Users/UsersList';
import UserCreate from './pages/Users/UserCreate';
import UserEdit from './pages/Users/UserEdit';
import CustomersList from './pages/Customers/CustomersList';
import CustomerCreate from './pages/Customers/CustomerCreate';
import CustomerEdit from './pages/Customers/CustomerEdit';
import BookingsList from './pages/Bookings/BookingsList';
import BookingCreate from './pages/Bookings/BookingCreate';
import BookingDetail from './pages/Bookings/BookingDetail';
import ImageGallery from './pages/Images/ImageGallery';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

// Create optimized QueryClient with best practices
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tours" element={<ToursList />} />
            <Route path="tours/new" element={<TourCreate />} />
            <Route path="tours/edit/:id" element={<TourEdit />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/new" element={<CustomerCreate />} />
            <Route path="customers/edit/:id" element={<CustomerEdit />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="bookings/new" element={<BookingCreate />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/new" element={<UserCreate />} />
            <Route path="users/edit/:id" element={<UserEdit />} />
            <Route path="images" element={<ImageGallery />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
