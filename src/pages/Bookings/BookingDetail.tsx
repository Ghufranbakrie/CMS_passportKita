import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';
import { PaymentVerificationModal } from '@/components/bookings/PaymentVerificationModal';
import { useState } from 'react';

const getStatusBadgeColor = (status: string) => {
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

const getPaymentStatusBadgeColor = (status: string) => {
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

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading, error, refetch } = useBooking(id);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading booking...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Booking not found</div>
      </div>
    );
  }

  const canVerifyPayment = booking.paymentStatus === 'PENDING_VERIFY' || 
                           booking.paymentStatus === 'UNPAID' ||
                           (booking.paymentStatus === 'PARTIAL' && booking.paidAmount < booking.totalAmount);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Booking Details</h1>
          <p className="text-muted-foreground mt-2">View and manage booking information</p>
        </div>
        {canVerifyPayment && (
          <Button onClick={() => setVerificationModalOpen(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Verify Payment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Booking ID</span>
              <p className="font-medium">{booking.id}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadgeColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Number of Seats</span>
              <p className="font-medium">{booking.numberOfSeats}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Created At</span>
              <p className="font-medium">
                {new Date(booking.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
            {booking.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Notes</span>
                <p className="font-medium">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <p className="font-semibold text-lg">Rp {booking.totalAmount.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Paid Amount</span>
              <p className="font-semibold text-lg">Rp {booking.paidAmount.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Remaining</span>
              <p className="font-semibold text-lg text-orange-600">
                Rp {(booking.totalAmount - booking.paidAmount).toLocaleString('id-ID')}
              </p>
            </div>
            {booking.paymentMethod && (
              <div>
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <p className="font-medium">{booking.paymentMethod}</p>
              </div>
            )}
            {booking.paymentDate && (
              <div>
                <span className="text-sm text-muted-foreground">Payment Date</span>
                <p className="font-medium">
                  {new Date(booking.paymentDate).toLocaleString('id-ID')}
                </p>
              </div>
            )}
            {booking.confirmedAt && (
              <div>
                <span className="text-sm text-muted-foreground">Confirmed At</span>
                <p className="font-medium">
                  {new Date(booking.confirmedAt).toLocaleString('id-ID')}
                </p>
              </div>
            )}
            {booking.paymentProof && (
              <div>
                <span className="text-sm text-muted-foreground">Payment Proof</span>
                <div className="mt-2 border rounded-lg p-2 bg-muted">
                  <img
                    src={booking.paymentProof}
                    alt="Payment proof"
                    className="max-w-full h-auto rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tour Information */}
        {booking.tour && (
          <Card>
            <CardHeader>
              <CardTitle>Tour Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Tour Title</span>
                <p className="font-medium">{booking.tour.title}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Start Date</span>
                <p className="font-medium">
                  {new Date(booking.tour.startDate).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">End Date</span>
                <p className="font-medium">
                  {new Date(booking.tour.endDate).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Price per Person</span>
                <p className="font-medium">Rp {booking.tour.price.toLocaleString('id-ID')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Information */}
        {booking.customer && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{booking.customer.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{booking.customer.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Phone</span>
                <p className="font-medium">{booking.customer.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <PaymentVerificationModal
        booking={booking}
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

