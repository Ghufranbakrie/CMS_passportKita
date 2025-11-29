import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateBooking } from '@/hooks/useBookings';
import { useTours } from '@/hooks/useTours';
import { useCustomers } from '@/hooks/useCustomers';
import type { CreateBookingInput } from '@/api/booking.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const bookingSchema = z.object({
  tourId: z.string().min(1, 'Tour is required'),
  customerId: z.string().min(1, 'Customer is required'),
  numberOfSeats: z.number().int().positive('Number of seats must be positive').min(1, 'At least 1 seat is required'),
  notes: z.string().optional(),
}).refine((data) => {
  // Additional validation will be done in onSubmit
  return true;
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateBooking();
  const { data: toursData } = useTours({ limit: 100 });
  const { data: customersData } = useCustomers({ limit: 100 });
  
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [numberOfSeats, setNumberOfSeats] = useState(1);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
    defaultValues: {
      tourId: '',
      customerId: '',
      numberOfSeats: 1,
      notes: '',
    },
  });

  const selectedTour = toursData?.tours.find(t => t.id === selectedTourId);
  const totalAmount = selectedTour ? selectedTour.price * numberOfSeats : 0;

  const onSubmit = (data: BookingFormData) => {
    // Validate tour is selected
    if (!data.tourId || data.tourId === '') {
      form.setError('tourId', { message: 'Please select a tour' });
      return;
    }

    // Validate customer is selected
    if (!data.customerId || data.customerId === '') {
      form.setError('customerId', { message: 'Please select a customer' });
      return;
    }

    // Validate tour exists and get price
    const tour = toursData?.tours.find(t => t.id === data.tourId);
    if (!tour) {
      form.setError('tourId', { message: 'Selected tour not found' });
      return;
    }

    // Calculate total amount
    const calculatedTotalAmount = tour.price * data.numberOfSeats;
    
    if (calculatedTotalAmount <= 0) {
      form.setError('numberOfSeats', { message: 'Total amount must be greater than 0' });
      return;
    }

    const bookingData: CreateBookingInput = {
      tourId: data.tourId,
      customerId: data.customerId,
      numberOfSeats: data.numberOfSeats,
      totalAmount: calculatedTotalAmount,
      notes: data.notes || undefined,
    };
    
    createMutation.mutate(bookingData, {
      onSuccess: () => {
        navigate('/bookings');
      },
      onError: (error: any) => {
        console.error('Error creating booking:', error);
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Failed to create booking';
        form.setError('root', { message: errorMessage });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bookings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Booking</h1>
          <p className="text-muted-foreground mt-2">Create a new tour booking</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tour *</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          setSelectedTourId(value);
                        }}
                      >
                        <option value="">Select a tour</option>
                        {toursData?.tours.map((tour) => (
                          <option key={tour.id} value={tour.id}>
                            {tour.title} - Rp {tour.price.toLocaleString('id-ID')}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="">Select a customer</option>
                        {customersData?.customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Seats *</FormLabel>
                    <FormControl>
                      <NumberInput
                        value={field.value}
                        onChange={(value) => {
                          const numValue = value || 1;
                          field.onChange(numValue);
                          setNumberOfSeats(numValue);
                        }}
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedTour && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tour Price:</span>
                      <span className="font-medium">Rp {selectedTour.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Seats:</span>
                      <span className="font-medium">{numberOfSeats}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total Amount:</span>
                      <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about this booking..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Internal notes (not visible to customer)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/bookings')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
          {form.formState.errors.root && (
            <div className="text-sm text-destructive mt-2">
              {form.formState.errors.root.message}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

