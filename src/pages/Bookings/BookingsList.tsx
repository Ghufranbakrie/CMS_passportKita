import { useNavigate } from 'react-router-dom';
import { useBookings, useDeleteBooking, type Booking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Trash2, Calendar, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/pagination';
import * as React from 'react';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type PaymentStatus = 'UNPAID' | 'PENDING_VERIFY' | 'PAID' | 'PARTIAL' | 'REFUNDED';

const getStatusBadgeColor = (status: BookingStatus) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'COMPLETED':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getPaymentStatusBadgeColor = (status: PaymentStatus) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'PENDING_VERIFY':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'PARTIAL':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'UNPAID':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'REFUNDED':
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export default function BookingsList() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useBookings({ 
    limit: 10,
    page,
    paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
  });

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setPage(1);
  }, [paymentStatusFilter]);
  const deleteMutation = useDeleteBooking();

  const handleDelete = (booking: Booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteMutation.mutate(bookingToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setBookingToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading bookings. Please try again.</div>
      </div>
    );
  }

  const bookings = data?.bookings || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage tour bookings and payments
          </p>
        </div>
        <Button onClick={() => navigate('/bookings/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Bookings {data?.pagination?.total ? `(${data.pagination.total})` : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | 'ALL')}
              >
                <option value="ALL">All Payments</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PENDING_VERIFY">Pending Verify</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No bookings found.</p>
              <Button onClick={() => navigate('/bookings/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Booking
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.customer?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{booking.tour?.title || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadgeColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      Rp {booking.totalAmount.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{booking.numberOfSeats}</TableCell>
                    <TableCell>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(booking)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

