import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTour, useUpdateTour } from '@/hooks/useTours';
import type { UpdateTourInput } from '@/api/tour.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Plus, X, Info, DollarSign, MapPin, Star, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { ImageUpload } from '@/components/tours/ImageUpload';

// Highlight schema - can be string or object with title & description
const highlightSchema = z.union([
  z.string(),
  z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  }),
]);

// Itinerary schema
const itinerarySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(z.string()).min(1),
});

const tourSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  image: z.string().url('Invalid image URL').optional(),
  badge: z
    .enum(['HOT DEAL', 'ALMOST FULL', 'NEW', 'LAST CALL'])
    .optional()
    .or(z.literal("")),
  badgeColor: z.string().optional().or(z.literal("")),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  duration: z.string().min(1, 'Duration is required').optional(),
  price: z.number().int().positive('Price must be positive').optional(),
  originalPrice: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  discount: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().int().nonnegative().optional()
  ),
  seatsTaken: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().int().nonnegative().optional()
  ),
  totalSeats: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  destinations: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),
  highlights: z.array(highlightSchema).optional(),
  itinerary: z.array(itinerarySchema).optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  category: z.enum(['FEATURED', 'UPCOMING', 'REGULAR', 'CUSTOM']).optional(),
});

type TourFormData = z.infer<typeof tourSchema>;

export default function TourEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading } = useTour(id);
  const updateMutation = useUpdateTour();
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    values: tour ? {
      title: tour.title,
      slug: tour.slug,
      image: tour.image,
      badge: tour.badge as any,
      badgeColor: tour.badgeColor,
      startDate: tour.startDate.split('T')[0],
      endDate: tour.endDate.split('T')[0],
      duration: tour.duration,
      price: tour.price,
      originalPrice: tour.originalPrice,
      discount: tour.discount,
      seatsTaken: tour.seatsTaken,
      totalSeats: tour.totalSeats,
      destinations: tour.destinations.map((d) => d.destination),
      facilities: tour.facilities.map((f) => f.facility),
      highlights: tour.highlights.map((h) => ({
        title: h.title || '',
        description: h.description || '',
      })),
      itinerary: tour.itinerary.map((item) => ({
        day: item.day,
        title: item.title,
        activities: item.activities,
      })),
      included: tour.included.map((i) => i.item),
      excluded: tour.excluded.map((e) => e.item),
      category: tour.category,
    } : undefined,
  });

  const onSubmit = (data: TourFormData) => {
    if (!id) return;
    
    // Filter and transform highlights
    const filteredHighlights = data.highlights
      ?.filter((h) => {
        if (typeof h === 'string') return h.trim() !== '';
        return h.title?.trim() !== '' || h.description?.trim() !== '';
      })
      .map((h) => {
        if (typeof h === 'string') return h;
        return {
          title: h.title || '',
          description: h.description || undefined,
        };
      });

    // Filter itinerary
    const filteredItinerary = data.itinerary?.filter((item) => 
      item.title.trim() !== '' && item.activities.length > 0
    );
    
    const tourData: UpdateTourInput = {
      ...data,
      destinations: data.destinations?.filter((d) => d.trim() !== ''),
      facilities: data.facilities?.filter((f) => f.trim() !== ''),
      highlights: filteredHighlights,
      itinerary: filteredItinerary,
      included: data.included?.filter((i) => i.trim() !== ''),
      excluded: data.excluded?.filter((e) => e.trim() !== '') || [],
    };
    
    updateMutation.mutate(
      { id, input: tourData },
      {
        onSuccess: () => {
          toast.success("Tour berhasil diperbarui!", {
            description: `Tour "${tourData.title || tour?.title}" telah berhasil diperbarui.`,
            duration: 3000,
          });
          // Tetap di halaman yang sama, tidak redirect
        },
        onError: (error: any) => {
          toast.error("Gagal memperbarui tour", {
            description: error?.response?.data?.error?.message || error?.message || "Terjadi kesalahan saat memperbarui tour.",
            duration: 4000,
          });
        },
      }
    );
  };

  const addArrayField = (fieldName: 'destinations' | 'facilities' | 'included' | 'excluded') => {
    const current = form.getValues(fieldName) || [];
    form.setValue(fieldName, [...current, ''] as any);
  };

  const removeArrayField = (fieldName: 'destinations' | 'facilities' | 'included' | 'excluded', index: number) => {
    const current = form.getValues(fieldName) || [];
    form.setValue(fieldName, current.filter((_, i) => i !== index) as any);
  };

  const addHighlight = () => {
    const current = form.getValues('highlights') || [];
    form.setValue('highlights', [...current, { title: '', description: '' }] as any);
  };

  const removeHighlight = (index: number) => {
    const current = form.getValues('highlights') || [];
    form.setValue('highlights', current.filter((_, i) => i !== index) as any);
  };

  const addItinerary = () => {
    const current = form.getValues('itinerary') || [];
    const nextDay = current.length > 0 ? Math.max(...current.map((i) => i.day)) + 1 : 1;
    form.setValue('itinerary', [...current, { day: nextDay, title: '', activities: [''] }] as any);
  };

  const removeItinerary = (index: number) => {
    const current = form.getValues('itinerary') || [];
    form.setValue('itinerary', current.filter((_, i) => i !== index) as any);
  };

  const addActivity = (itineraryIndex: number) => {
    const current = form.getValues('itinerary') || [];
    const itinerary = current[itineraryIndex];
    if (itinerary) {
      const updated = [...current];
      updated[itineraryIndex] = {
        ...itinerary,
        activities: [...itinerary.activities, ''],
      };
      form.setValue('itinerary', updated as any);
    }
  };

  const removeActivity = (itineraryIndex: number, activityIndex: number) => {
    const current = form.getValues('itinerary') || [];
    const itinerary = current[itineraryIndex];
    if (itinerary && itinerary.activities.length > 1) {
      const updated = [...current];
      updated[itineraryIndex] = {
        ...itinerary,
        activities: itinerary.activities.filter((_, i) => i !== activityIndex),
      };
      form.setValue('itinerary', updated as any);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tour...</div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Tour not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tours')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Tour</h1>
          <p className="text-muted-foreground mt-2">Update tour information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="destinations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Locations</span>
              </TabsTrigger>
              <TabsTrigger value="highlights" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Highlights</span>
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Itinerary</span>
              </TabsTrigger>
              <TabsTrigger value="included" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Included</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update the basic details of your tour package
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gambar Tour *</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload gambar utama untuk tour ini atau masukkan URL gambar.
                          <br />
                          <span className="font-semibold text-foreground">Ukuran yang direkomendasikan:</span>
                          <br />
                          • <strong>Tour Card:</strong> 1200 x 800 px (rasio 3:2) atau 1600 x 900 px (rasio 16:9)
                          <br />
                          • <strong>Tour Detail Hero:</strong> 1920 x 1080 px (rasio 16:9) atau lebih besar
                          <br />
                          • <strong>Format:</strong> JPEG, PNG, atau WebP (maks 5MB)
                          <br />
                          • <strong>Tips:</strong> Gunakan gambar landscape dengan kualitas tinggi untuk hasil terbaik
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              <option value="REGULAR">REGULAR</option>
                              <option value="FEATURED">FEATURED</option>
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="CUSTOM">CUSTOM</option>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Pricing & Settings */}
            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update pricing, discounts, and tour settings
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Rupiah)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="seatsTaken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seats Taken (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalSeats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Seats (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge</FormLabel>
                          <FormControl>
                            <Select {...field} value={field.value || ''}>
                              <option value="">None</option>
                              <option value="HOT DEAL">HOT DEAL</option>
                              <option value="ALMOST FULL">ALMOST FULL</option>
                              <option value="NEW">NEW</option>
                              <option value="LAST CALL">LAST CALL</option>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="badgeColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Color</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Destinations & Facilities */}
            <TabsContent value="destinations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Destinations</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage destinations for this tour
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(form.watch('destinations') || []).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input {...form.register(`destinations.${index}`)} />
                      {(form.watch('destinations') || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField('destinations', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('destinations')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Destination
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage facilities for this tour
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(form.watch('facilities') || []).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input {...form.register(`facilities.${index}`)} />
                      {(form.watch('facilities') || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField('facilities', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('facilities')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Facility
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Highlights */}
            <TabsContent value="highlights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Highlights</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage highlights with title and description
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(form.watch('highlights') || []).map((highlight, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Highlight {index + 1}</Label>
                        {(form.watch('highlights') || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHighlight(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name={`highlights.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Winter Illumination Festival"
                                {...field}
                                value={typeof highlight === 'object' ? field.value || '' : ''}
                                onChange={(e) => {
                                  const current = form.getValues('highlights') || [];
                                  const updated = [...current];
                                  updated[index] = {
                                    title: e.target.value,
                                    description: typeof highlight === 'object' ? highlight.description : '',
                                  };
                                  form.setValue('highlights', updated as any);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`highlights.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Festival lampu musim dingin paling iconic se-Asia ✨🏮"
                                {...field}
                                value={typeof highlight === 'object' ? field.value || '' : ''}
                                onChange={(e) => {
                                  const current = form.getValues('highlights') || [];
                                  const updated = [...current];
                                  updated[index] = {
                                    title: typeof highlight === 'object' ? highlight.title || '' : '',
                                    description: e.target.value,
                                  };
                                  form.setValue('highlights', updated as any);
                                }}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHighlight}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Highlight
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Itinerary */}
            <TabsContent value="itinerary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Itinerary</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage day-by-day itinerary with activities
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(form.watch('itinerary') || []).map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Day {item.day}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItinerary(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`itinerary.${index}.day`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day Number</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  const current = form.getValues('itinerary') || [];
                                  const updated = [...current];
                                  updated[index] = {
                                    ...updated[index],
                                    day: parseInt(e.target.value) || 1,
                                  };
                                  form.setValue('itinerary', updated as any);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`itinerary.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Arrival Tokyo - Hotel Check In"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label>Activities</Label>
                        {item.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="flex gap-2">
                            <Input
                              {...form.register(`itinerary.${index}.activities.${activityIndex}`)}
                              placeholder="Penjemputan di Narita/Haneda Airport"
                            />
                            {item.activities.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeActivity(index, activityIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addActivity(index)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItinerary}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Day
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 6: Included & Excluded */}
            <TabsContent value="included" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Included</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Items included in the tour package
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(form.watch('included') || []).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input {...form.register(`included.${index}`)} />
                      {(form.watch('included') || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField('included', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('included')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Excluded</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Items NOT included in the tour package
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(form.watch('excluded') || []).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input {...form.register(`excluded.${index}`)} />
                      {(form.watch('excluded') || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField('excluded', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField('excluded')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons - Always visible */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tours')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="ml-auto">
              {updateMutation.isPending ? 'Updating...' : 'Update Tour'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
