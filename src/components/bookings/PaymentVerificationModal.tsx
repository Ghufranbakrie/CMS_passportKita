import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVerifyPayment } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Booking } from '@/api/booking.api';

const verificationSchema = z.object({
  paidAmount: z.number().int().nonnegative('Paid amount must be non-negative'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.paidAmount > 0, {
  message: 'Paid amount must be greater than 0',
  path: ['paidAmount'],
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface PaymentVerificationModalProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PaymentVerificationModal({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: PaymentVerificationModalProps) {
  const verifyMutation = useVerifyPayment();
  const [nominalChecked, setNominalChecked] = useState(false);
  const [rekeningChecked, setRekeningChecked] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      paidAmount: booking.paidAmount || booking.totalAmount,
      paymentMethod: booking.paymentMethod || '',
      notes: '',
    },
  });

  const onSubmit = (data: VerificationFormData) => {
    if (!nominalChecked || !rekeningChecked) {
      toast.error('Please confirm both checks before verifying payment');
      return;
    }

    verifyMutation.mutate(
      {
        bookingId: booking.id,
        input: {
          paidAmount: data.paidAmount,
          paymentMethod: data.paymentMethod || undefined,
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Payment verified successfully! Email confirmation sent to customer.');
          form.reset();
          setNominalChecked(false);
          setRekeningChecked(false);
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error?.message || 'Failed to verify payment');
        },
      }
    );
  };

  const canVerify = nominalChecked && rekeningChecked && form.formState.isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Verify payment for booking: {booking.tour?.title || 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Proof */}
          {booking.paymentProof && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Proof</label>
              <div className="border rounded-lg p-4 bg-muted">
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

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <p className="font-semibold">Rp {booking.totalAmount.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Already Paid:</span>
              <p className="font-semibold">Rp {booking.paidAmount.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Remaining:</span>
              <p className="font-semibold text-orange-600">
                Rp {(booking.totalAmount - booking.paidAmount).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Customer:</span>
              <p className="font-semibold">{booking.customer?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Verification Checklist</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nominal"
                  checked={nominalChecked}
                  onCheckedChange={(checked) => setNominalChecked(checked === true)}
                />
                <label
                  htmlFor="nominal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nominal sesuai dengan total pembayaran
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rekening"
                  checked={rekeningChecked}
                  onCheckedChange={(checked) => setRekeningChecked(checked === true)}
                />
                <label
                  htmlFor="rekening"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Rekening tujuan benar
                </label>
              </div>
            </div>
          </div>

          {/* Verification Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid Amount *</FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        value={field.value}
                        onValueChange={(value) => field.onChange(Number(value))}
                        min={0}
                        max={booking.totalAmount}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bank Transfer, BCA, Mandiri" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canVerify || verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? 'Verifying...' : 'Confirm Payment'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

