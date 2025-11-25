import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateTour } from "@/hooks/useTours";
import type { CreateTourInput } from "@/api/tour.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/tours/ImageUpload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  X,
  Info,
  DollarSign,
  MapPin,
  Star,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import {
  formatNumber,
  generateSlug,
  getTodayDateString,
  calculateDiscountPercentage,
  calculateFinalPrice,
  addArrayField as addArrayFieldUtil,
  removeArrayField as removeArrayFieldUtil,
  addHighlight as addHighlightUtil,
  removeHighlight as removeHighlightUtil,
  addItinerary as addItineraryUtil,
  removeItinerary as removeItineraryUtil,
  addActivity as addActivityUtil,
  removeActivity as removeActivityUtil,
} from "@/utils";

// Highlight schema - can be string or object with title & description
const highlightSchema = z.union([
  z.string().min(1, "Highlight tidak boleh kosong"),
  z.object({
    title: z.string().min(1, "Judul highlight wajib diisi"),
    description: z.string().optional(),
  }),
]);

// Itinerary schema
const itinerarySchema = z.object({
  day: z.number().int().positive("Nomor hari harus lebih besar dari 0"),
  title: z.string().min(1, "Judul hari wajib diisi"),
  activities: z.array(z.string()).min(1, "Minimal satu aktivitas wajib diisi"),
});

const tourSchema = z
  .object({
    title: z
      .string()
      .min(1, "Judul wajib diisi")
      .min(3, "Judul minimal 3 karakter")
      .max(200, "Judul maksimal 200 karakter"),
    slug: z
      .string()
      .min(1, "Slug wajib diisi")
      .min(3, "Slug minimal 3 karakter")
      .max(100, "Slug maksimal 100 karakter")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung"
      ),
    image: z
      .string()
      .min(1, "URL gambar wajib diisi")
      .url("Format URL gambar tidak valid"),
    badge: z
      .union([
        z.enum(["HOT DEAL", "ALMOST FULL", "NEW", "LAST CALL"]),
        z.literal(""),
        z.undefined(),
      ])
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    badgeColor: z
      .union([z.string(), z.literal(""), z.undefined()])
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    startDate: z
      .string()
      .min(1, "Tanggal mulai wajib diisi")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)")
      .refine(
        (date) => {
          const selectedDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        },
        {
          message: "Tanggal mulai tidak boleh lebih kecil dari hari ini",
        }
      ),
    endDate: z
      .string()
      .min(1, "Tanggal selesai wajib diisi")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
    duration: z.string().min(1, "Durasi wajib diisi"),
    price: z.number().int().positive("Harga harus lebih besar dari 0"),
    originalPrice: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = typeof val === "string" ? Number(val) : val;
        if (isNaN(num) || num === 0) return undefined;
        if (!Number.isInteger(num) || num <= 0) {
          throw new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              path: ["originalPrice"],
              message: "Harga asli harus lebih besar dari 0",
            },
          ]);
        }
        return num;
      })
      .optional(),
    discount: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = typeof val === "string" ? Number(val) : val;
        if (isNaN(num) || num === 0) return undefined;
        if (!Number.isInteger(num) || num < 0) {
          throw new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              path: ["discount"],
              message: "Diskon tidak boleh negatif",
            },
          ]);
        }
        return num;
      })
      .optional(),
    seatsTaken: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = typeof val === "string" ? Number(val) : val;
        if (isNaN(num) || num === 0) return undefined;
        if (!Number.isInteger(num) || num < 0) {
          throw new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              path: ["seatsTaken"],
              message: "Kursi terisi tidak boleh negatif",
            },
          ]);
        }
        return num;
      })
      .optional(),
    totalSeats: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = typeof val === "string" ? Number(val) : val;
        if (isNaN(num) || num === 0) return undefined;
        if (!Number.isInteger(num) || num <= 0) {
          throw new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              path: ["totalSeats"],
              message: "Total kursi harus lebih besar dari 0",
            },
          ]);
        }
        return num;
      })
      .optional(),
    destinations: z
      .array(z.string())
      .min(1, "Minimal satu destinasi wajib diisi"),
    facilities: z
      .array(z.string())
      .min(1, "Minimal satu fasilitas wajib diisi"),
    highlights: z
      .array(highlightSchema)
      .min(1, "Minimal satu highlight wajib diisi"),
    itinerary: z.array(itinerarySchema).optional(),
    included: z
      .array(z.string())
      .min(1, "Minimal satu item yang termasuk wajib diisi"),
    excluded: z.array(z.string()).optional(),
    category: z.enum(["FEATURED", "UPCOMING", "REGULAR", "CUSTOM"]).optional(),
  })
  .refine(
    (data) => {
      // Validasi bahwa endDate setelah startDate
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "Tanggal selesai harus setelah atau sama dengan tanggal mulai",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // Validasi bahwa discount tidak lebih besar dari originalPrice
      if (data.originalPrice && data.discount) {
        return data.discount <= data.originalPrice;
      }
      return true;
    },
    {
      message: "Diskon tidak boleh lebih besar dari harga asli",
      path: ["discount"],
    }
  )
  .refine(
    (data) => {
      // Validasi bahwa seatsTaken tidak lebih besar dari totalSeats
      if (data.totalSeats && data.seatsTaken) {
        return data.seatsTaken <= data.totalSeats;
      }
      return true;
    },
    {
      message: "Kursi terisi tidak boleh lebih besar dari total kursi",
      path: ["seatsTaken"],
    }
  );

type TourFormData = z.infer<typeof tourSchema>;

const TABS = [
  { id: "basic", label: "Info Dasar", icon: Info },
  { id: "pricing", label: "Harga", icon: DollarSign },
  { id: "destinations", label: "Lokasi", icon: MapPin },
  { id: "highlights", label: "Highlight", icon: Star },
  { id: "itinerary", label: "Itinerary", icon: Calendar },
  { id: "included", label: "Termasuk", icon: CheckCircle2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TourCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateTour();
  const [activeTab, setActiveTab] = useState<TabId>("basic");

  const form = useForm<TourFormData>({
    resolver: zodResolver(tourSchema) as any, // Type assertion untuk handle complex Zod schema
    mode: "onChange", // Validasi real-time saat field berubah
    reValidateMode: "onChange", // Re-validate saat field berubah
    defaultValues: {
      title: "",
      slug: "",
      image: "",
      badge: undefined,
      badgeColor: undefined,
      startDate: "",
      endDate: "",
      duration: "",
      price: 0,
      originalPrice: undefined,
      discount: undefined,
      seatsTaken: undefined,
      totalSeats: undefined,
      destinations: [""],
      facilities: [""],
      highlights: [{ title: "", description: "" }],
      itinerary: [],
      included: [""],
      excluded: [],
      category: "REGULAR",
    },
  });

  const onSubmit = (data: TourFormData) => {
    // Filter and transform highlights
    const filteredHighlights = data.highlights
      .filter((h) => {
        if (typeof h === "string") return h.trim() !== "";
        return h.title?.trim() !== "" || h.description?.trim() !== "";
      })
      .map((h) => {
        if (typeof h === "string") return h;
        return {
          title: h.title || "",
          description: h.description || undefined,
        };
      });

    // Filter itinerary
    const filteredItinerary = data.itinerary?.filter(
      (item) => item.title.trim() !== "" && item.activities.length > 0
    );

    const tourData: CreateTourInput = {
      ...data,
      badge: data.badge,
      badgeColor: data.badgeColor,
      destinations: data.destinations.filter((d) => d.trim() !== ""),
      facilities: data.facilities.filter((f) => f.trim() !== ""),
      highlights: filteredHighlights,
      itinerary: filteredItinerary,
      included: data.included.filter((i) => i.trim() !== ""),
      excluded: data.excluded?.filter((e) => e.trim() !== "") || [],
    };
    createMutation.mutate(tourData, {
      onSuccess: () => {
        toast.success("Tour berhasil dibuat!", {
          description: `Tour "${tourData.title}" telah berhasil dibuat.`,
          duration: 3000,
        });
        // Reset form untuk membuat tour baru
        form.reset();
        setActiveTab("basic");
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.message ||
          "Terjadi kesalahan saat membuat tour.";
        const errorDetails = error?.response?.data?.error?.details;

        // Jika ada error detail dari validasi, tampilkan di form
        if (errorDetails && Array.isArray(errorDetails)) {
          errorDetails.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              const fieldName = detail.path[0] as keyof TourFormData;
              form.setError(fieldName, {
                type: "server",
                message: detail.message || errorMessage,
              });
            }
          });
        }

        toast.error("Gagal membuat tour", {
          description: errorMessage,
          duration: 4000,
        });
      },
    });
  };

  // Wrapper functions untuk menggunakan utility functions
  const addArrayField = (
    fieldName: "destinations" | "facilities" | "included" | "excluded"
  ) => {
    addArrayFieldUtil(form, fieldName, "");
  };

  const removeArrayField = (
    fieldName: "destinations" | "facilities" | "included" | "excluded",
    index: number
  ) => {
    removeArrayFieldUtil(form, fieldName, index);
  };

  const addHighlight = () => {
    addHighlightUtil(form, "highlights");
  };

  const removeHighlight = (index: number) => {
    removeHighlightUtil(form, "highlights", index);
  };

  const addItinerary = () => {
    addItineraryUtil(form, "itinerary");
  };

  const removeItinerary = (index: number) => {
    removeItineraryUtil(form, "itinerary", index);
  };

  const addActivity = (itineraryIndex: number) => {
    addActivityUtil(form, "itinerary", itineraryIndex);
  };

  const removeActivity = (itineraryIndex: number, activityIndex: number) => {
    removeActivityUtil(form, "itinerary", itineraryIndex, activityIndex);
  };

  // Validasi per tab
  const validateTab = async (tabId: TabId): Promise<boolean> => {
    const fieldsToValidate: Record<TabId, (keyof TourFormData)[]> = {
      basic: [
        "title",
        "slug",
        "image",
        "startDate",
        "endDate",
        "duration",
        "category",
      ],
      pricing: ["price"],
      destinations: ["destinations", "facilities"],
      highlights: ["highlights"],
      itinerary: [],
      included: ["included"],
    };

    const fields = fieldsToValidate[tabId];
    if (fields.length === 0) return true;

    const result = await form.trigger(fields as any);
    return result;
  };

  // Watch form values untuk reactive validation - watch semua field untuk memastikan reactive
  const watchedValues = form.watch();
  const formErrors = form.formState.errors;
  const formState = form.formState;

  // Cek apakah tab sudah valid - menggunakan watched values untuk reactive updates
  const isTabValid = useMemo(() => {
    const values = watchedValues;
    const errors = formErrors;

    const validations: Record<TabId, () => boolean> = {
      basic: () => {
        return !!(
          values.title &&
          String(values.title).trim() !== "" &&
          values.slug &&
          String(values.slug).trim() !== "" &&
          values.image &&
          String(values.image).trim() !== "" &&
          values.startDate &&
          String(values.startDate).trim() !== "" &&
          values.endDate &&
          String(values.endDate).trim() !== "" &&
          values.duration &&
          String(values.duration).trim() !== "" &&
          values.category &&
          !errors.title &&
          !errors.slug &&
          !errors.image &&
          !errors.startDate &&
          !errors.endDate &&
          !errors.duration &&
          !errors.category
        );
      },
      pricing: () => {
        const price = Number(values.price) || 0;
        const originalPrice = values.originalPrice
          ? Number(values.originalPrice)
          : undefined;
        const discount = values.discount ? Number(values.discount) : undefined;

        // Validasi price harus > 0
        if (price <= 0 || errors.price) {
          return false;
        }

        // Validasi discount tidak boleh lebih besar dari originalPrice
        if (discount && originalPrice && discount > originalPrice) {
          return false;
        }

        // Validasi discount tidak boleh lebih besar dari price jika originalPrice tidak ada
        if (discount && !originalPrice && discount > price) {
          return false;
        }

        return !errors.discount && !errors.originalPrice;
      },
      destinations: () => {
        const destinations = Array.isArray(values.destinations)
          ? values.destinations.filter((d: string) => d?.trim() !== "")
          : [];
        const facilities = Array.isArray(values.facilities)
          ? values.facilities.filter((f: string) => f?.trim() !== "")
          : [];
        return (
          destinations.length > 0 &&
          facilities.length > 0 &&
          !errors.destinations &&
          !errors.facilities
        );
      },
      highlights: () => {
        const highlights = Array.isArray(values.highlights)
          ? values.highlights.filter((h: any) => {
              if (typeof h === "string") return h.trim() !== "";
              return h?.title?.trim() !== "" || h?.description?.trim() !== "";
            })
          : [];
        return highlights.length > 0 && !errors.highlights;
      },
      itinerary: () => {
        // Itinerary is optional, so always valid
        return true;
      },
      included: () => {
        const included = Array.isArray(values.included)
          ? values.included.filter((i: string) => i?.trim() !== "")
          : [];
        return included.length > 0 && !errors.included;
      },
    };

    return validations[activeTab]?.() ?? true;
  }, [watchedValues, formErrors, activeTab, formState]);

  // Navigasi tab
  const currentTabIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  const handleNext = async () => {
    // Trigger validation untuk semua field di tab saat ini
    const isValid = await validateTab(activeTab);

    // Tunggu sebentar untuk memastikan formState ter-update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Cek ulang isTabValid setelah validasi
    const currentTabValid = isTabValid;

    if (!isValid || !currentTabValid) {
      toast.error("Form belum lengkap", {
        description:
          "Silakan lengkapi semua field yang wajib diisi sebelum melanjutkan.",
        duration: 3000,
      });
      return;
    }

    if (!isLastTab) {
      const nextTab = TABS[currentTabIndex + 1];
      setActiveTab(nextTab.id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstTab) {
      const prevTab = TABS[currentTabIndex - 1];
      setActiveTab(prevTab.id);
    }
  };

  // Trigger validasi saat field berubah untuk update isTabValid
  useEffect(() => {
    // Trigger validasi untuk field di tab aktif saat field berubah
    const fieldsToValidate: Record<TabId, (keyof TourFormData)[]> = {
      basic: [
        "title",
        "slug",
        "image",
        "startDate",
        "endDate",
        "duration",
        "category",
      ],
      pricing: ["price", "originalPrice", "discount"],
      destinations: ["destinations", "facilities"],
      highlights: ["highlights"],
      itinerary: [],
      included: ["included"],
    };

    const fields = fieldsToValidate[activeTab];
    if (fields.length > 0) {
      // Trigger validasi tanpa menunggu hasil (untuk update formState.errors)
      // Gunakan debounce untuk menghindari terlalu banyak validasi
      const timeoutId = setTimeout(() => {
        form.trigger(fields as any).catch(() => {
          // Ignore errors, hanya untuk trigger validasi
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, activeTab, form]);

  // Progress indicator
  const completedTabs = useMemo(() => {
    const values = watchedValues;
    const errors = formErrors;
    const completed: TabId[] = [];

    // Basic
    if (
      values.title &&
      values.slug &&
      values.image &&
      values.startDate &&
      values.endDate &&
      values.duration &&
      !errors.title &&
      !errors.slug &&
      !errors.image
    ) {
      completed.push("basic");
    }

    // Pricing
    if (values.price && values.price > 0 && !errors.price) {
      completed.push("pricing");
    }

    // Destinations
    const destinations =
      values.destinations?.filter((d) => d.trim() !== "") || [];
    const facilities = values.facilities?.filter((f) => f.trim() !== "") || [];
    if (destinations.length > 0 && facilities.length > 0) {
      completed.push("destinations");
    }

    // Highlights
    const highlights =
      values.highlights?.filter((h) => {
        if (typeof h === "string") return h.trim() !== "";
        return h.title?.trim() !== "" || h.description?.trim() !== "";
      }) || [];
    if (highlights.length > 0) {
      completed.push("highlights");
    }

    // Itinerary (optional, always considered completed if no errors)
    if (!errors.itinerary) {
      completed.push("itinerary");
    }

    // Included
    const included = values.included?.filter((i) => i.trim() !== "") || [];
    if (included.length > 0 && !errors.included) {
      completed.push("included");
    }

    return completed;
  }, [watchedValues, formErrors]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tours")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buat Tour Baru</h1>
          <p className="text-muted-foreground mt-2">
            Tambahkan paket tour baru
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabId)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isCompleted = completedTabs.includes(tab.id);
                const isActive = activeTab === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`flex items-center gap-2 relative ${
                      isCompleted && !isActive ? "text-green-600" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-600 bg-white rounded-full" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Masukkan detail dasar paket tour Anda
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Tour *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Winter Wonderland Japan Tour"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate slug dari title
                              const title = e.target.value;
                              if (title && !form.getValues("slug")) {
                                const autoSlug = generateSlug(title);
                                form.setValue("slug", autoSlug, {
                                  shouldValidate: false,
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Masukkan judul paket tour yang menarik dan deskriptif.
                          Slug akan otomatis dibuat dari judul.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="winter-japan-tour"
                            {...field}
                            onChange={(e) => {
                              // Auto-format slug (lowercase, replace spaces with hyphens)
                              const value = e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, "");
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Identifier untuk URL (huruf kecil, angka, dan tanda
                          hubung saja). Akan otomatis dibuat dari judul, atau
                          bisa diubah manual.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            label="Gambar Tour *"
                            description="Upload gambar dari komputer atau masukkan URL gambar. Format: JPEG, PNG, WebP, GIF. Maksimal 5MB."
                          />
                        </FormControl>
                        <FormDescription>
                          <span className="font-semibold text-foreground">
                            Ukuran yang direkomendasikan:
                          </span>
                          <br />• <strong>Tour Card:</strong> 1200 x 800 px
                          (rasio 3:2) atau 1600 x 900 px (rasio 16:9)
                          <br />• <strong>Tour Detail Hero:</strong> 1920 x 1080
                          px (rasio 16:9) atau lebih besar
                          <br />• <strong>Format:</strong> JPEG, PNG, atau WebP
                          (maks 5MB)
                          <br />• <strong>Tips:</strong> Gunakan gambar
                          landscape dengan kualitas tinggi untuk hasil terbaik
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
                          <FormLabel>Tanggal Mulai *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              min={getTodayDateString()}
                            />
                          </FormControl>
                          <FormDescription>
                            Tanggal mulai tour (tidak boleh lebih kecil dari
                            hari ini)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Selesai *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              min={
                                form.watch("startDate") || getTodayDateString()
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Tanggal selesai tour (harus setelah atau sama dengan
                            tanggal mulai)
                          </FormDescription>
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
                          <FormLabel>Durasi *</FormLabel>
                          <FormControl>
                            <Input placeholder="8D7N" {...field} />
                          </FormControl>
                          <FormDescription>
                            Durasi tour, contoh: 8D7N (8 Hari 7 Malam)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              <option value="REGULAR">REGULAR</option>
                              <option value="FEATURED">FEATURED</option>
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="CUSTOM">CUSTOM</option>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Pilih kategori tour (FEATURED, UPCOMING, REGULAR,
                            atau CUSTOM)
                          </FormDescription>
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
                  <CardTitle>Harga & Pengaturan</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Konfigurasi harga, diskon, dan pengaturan tour
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga (Rupiah) *</FormLabel>
                          <FormControl>
                            <NumberInput
                              placeholder="29.500.000"
                              value={field.value}
                              onChange={(value) => {
                                const numValue = value ?? 0;
                                field.onChange(numValue);
                                // Jika harga asli belum diisi atau kosong, set harga asli = harga
                                const originalPrice =
                                  form.getValues("originalPrice");
                                if (
                                  (!originalPrice || originalPrice === 0) &&
                                  numValue > 0
                                ) {
                                  form.setValue("originalPrice", numValue, {
                                    shouldValidate: false,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Harga paket tour dalam Rupiah. Format otomatis
                            dengan titik setiap 3 angka.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga Asli (Opsional)</FormLabel>
                          <FormControl>
                            <NumberInput
                              placeholder="34.000.000"
                              value={field.value}
                              onChange={(value) => {
                                // Pastikan value tidak NaN
                                const numValue =
                                  value !== undefined && !isNaN(value)
                                    ? value
                                    : undefined;
                                field.onChange(numValue);

                                const price = form.getValues("price");
                                const discount = form.getValues("discount");

                                // Jika originalPrice dihapus (undefined), set ke price
                                if (
                                  numValue === undefined ||
                                  numValue === 0 ||
                                  isNaN(numValue as any)
                                ) {
                                  if (price > 0 && !isNaN(price)) {
                                    form.setValue("originalPrice", price, {
                                      shouldValidate: false,
                                    });
                                  } else {
                                    form.setValue("originalPrice", undefined, {
                                      shouldValidate: false,
                                    });
                                  }
                                  return;
                                }

                                // Validasi: jika discount lebih besar dari originalPrice, reset discount
                                if (
                                  discount &&
                                  !isNaN(discount) &&
                                  discount > numValue
                                ) {
                                  form.setValue("discount", numValue, {
                                    shouldValidate: true,
                                  });
                                  toast.warning("Diskon disesuaikan", {
                                    description: `Diskon tidak boleh lebih besar dari harga asli (Rp ${formatNumber(
                                      numValue
                                    )}). Diskon telah disesuaikan.`,
                                    duration: 3000,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Harga asli sebelum diskon. Jika tidak diisi, akan
                            sama dengan harga. Harus lebih besar dari diskon.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => {
                      const originalPrice = form.watch("originalPrice");
                      const price = form.watch("price");
                      const discountValue = field.value || 0;
                      const finalPrice = originalPrice
                        ? calculateFinalPrice(originalPrice, discountValue)
                        : price - discountValue;
                      const discountPercent = originalPrice
                        ? calculateDiscountPercentage(
                            originalPrice,
                            discountValue
                          )
                        : price > 0
                        ? calculateDiscountPercentage(price, discountValue)
                        : 0;

                      return (
                        <FormItem>
                          <FormLabel>Diskon (Opsional)</FormLabel>
                          <FormControl>
                            <NumberInput
                              placeholder="4.500.000"
                              value={field.value}
                              onChange={(value) => {
                                // Pastikan value tidak NaN
                                const numValue =
                                  value !== undefined && !isNaN(value)
                                    ? value
                                    : undefined;
                                field.onChange(numValue);

                                // Validasi: jika discount lebih besar dari originalPrice, set ke originalPrice
                                const originalPrice =
                                  form.getValues("originalPrice");
                                const price = form.getValues("price");
                                const maxDiscount =
                                  originalPrice && !isNaN(originalPrice)
                                    ? originalPrice
                                    : price && !isNaN(price)
                                    ? price
                                    : undefined;

                                if (
                                  maxDiscount &&
                                  numValue &&
                                  !isNaN(numValue) &&
                                  numValue > maxDiscount
                                ) {
                                  form.setValue("discount", maxDiscount, {
                                    shouldValidate: true,
                                  });
                                  toast.error("Diskon terlalu besar", {
                                    description: `Diskon tidak boleh lebih besar dari harga asli (Rp ${formatNumber(
                                      maxDiscount
                                    )}).`,
                                    duration: 3000,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Besar diskon dalam Rupiah. Tidak boleh lebih besar
                            dari harga asli.
                            {discountValue > 0 && (
                              <span className="block mt-1 text-xs">
                                Diskon: {discountPercent}% | Harga akhir: Rp{" "}
                                {formatNumber(Math.max(0, finalPrice))}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalSeats"
                      render={({ field }) => {
                        const seatsTaken = form.watch("seatsTaken");
                        const totalSeats = field.value || 0;
                        const availableSeats = totalSeats - (seatsTaken || 0);

                        return (
                          <FormItem>
                            <FormLabel>Total Kursi (Opsional)</FormLabel>
                            <FormControl>
                              <NumberInput
                                placeholder="20"
                                value={field.value}
                                onChange={(value) => {
                                  const numValue = value ?? undefined;
                                  field.onChange(numValue);
                                  // Validasi: jika totalSeats lebih kecil dari seatsTaken, reset seatsTaken
                                  if (
                                    numValue &&
                                    seatsTaken &&
                                    seatsTaken > numValue
                                  ) {
                                    form.setValue("seatsTaken", numValue, {
                                      shouldValidate: true,
                                    });
                                    toast.warning("Kursi terisi disesuaikan", {
                                      description:
                                        "Total kursi tidak boleh lebih kecil dari kursi terisi. Kursi terisi telah disesuaikan.",
                                      duration: 3000,
                                    });
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Total kursi yang tersedia untuk tour ini.
                              {seatsTaken && totalSeats > 0 && (
                                <span className="block mt-1 text-xs">
                                  Terisi: {seatsTaken} | Tersedia:{" "}
                                  {Math.max(0, availableSeats)} kursi
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="seatsTaken"
                      render={({ field }) => {
                        const totalSeats = form.watch("totalSeats");
                        const seatsTaken = field.value || 0;
                        const availableSeats = totalSeats
                          ? totalSeats - seatsTaken
                          : undefined;

                        return (
                          <FormItem>
                            <FormLabel>Kursi Terisi (Opsional)</FormLabel>
                            <FormControl>
                              <NumberInput
                                placeholder="12"
                                value={field.value}
                                onChange={(value) => {
                                  const numValue = value ?? undefined;
                                  field.onChange(numValue);
                                  // Validasi: jika seatsTaken lebih besar dari totalSeats, set ke totalSeats
                                  if (
                                    totalSeats &&
                                    numValue &&
                                    numValue > totalSeats
                                  ) {
                                    form.setValue("seatsTaken", totalSeats, {
                                      shouldValidate: true,
                                    });
                                    toast.error("Kursi terisi terlalu banyak", {
                                      description: `Kursi terisi tidak boleh lebih besar dari total kursi (${totalSeats}).`,
                                      duration: 3000,
                                    });
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Jumlah kursi yang sudah terisi. Tidak boleh lebih
                              besar dari total kursi.
                              {totalSeats && (
                                <span className="block mt-1 text-xs">
                                  Tersedia:{" "}
                                  {availableSeats !== undefined
                                    ? availableSeats
                                    : "?"}{" "}
                                  kursi
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
                            <Select {...field} value={field.value || ""}>
                              <option value="">Tidak Ada</option>
                              <option value="HOT DEAL">HOT DEAL</option>
                              <option value="ALMOST FULL">ALMOST FULL</option>
                              <option value="NEW">NEW</option>
                              <option value="LAST CALL">LAST CALL</option>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Pilih badge untuk menandai tour (HOT DEAL, ALMOST
                            FULL, NEW, atau LAST CALL)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="badgeColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warna Badge</FormLabel>
                          <FormControl>
                            <Input placeholder="bg-red-500" {...field} />
                          </FormControl>
                          <FormDescription>
                            Warna badge dalam format Tailwind CSS (contoh:
                            bg-red-500, bg-blue-600)
                          </FormDescription>
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
                  <CardTitle>Destinasi</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tambahkan semua destinasi untuk tour ini
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {form.watch("destinations").map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        {...form.register(`destinations.${index}`)}
                        placeholder="Tokyo"
                      />
                      {form.watch("destinations").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeArrayField("destinations", index)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mb-2">
                    Minimal satu destinasi wajib diisi
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("destinations")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Destinasi
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fasilitas</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Daftar semua fasilitas yang termasuk dalam tour ini
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {form.watch("facilities").map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        {...form.register(`facilities.${index}`)}
                        placeholder="Hotel Bintang 4"
                      />
                      {form.watch("facilities").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField("facilities", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mb-2">
                    Minimal satu fasilitas wajib diisi
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("facilities")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Fasilitas
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Highlights */}
            <TabsContent value="highlights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Highlight</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tambahkan highlight dengan judul dan deskripsi untuk
                    menampilkan fitur tour
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.watch("highlights").map((highlight, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label>Highlight {index + 1}</Label>
                        {form.watch("highlights").length > 1 && (
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
                            <FormLabel>Judul *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Winter Illumination Festival"
                                {...field}
                                value={
                                  typeof highlight === "object"
                                    ? field.value || ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const current = form.getValues("highlights");
                                  const updated = [...current];
                                  updated[index] = {
                                    title: e.target.value,
                                    description:
                                      typeof highlight === "object"
                                        ? highlight.description
                                        : "",
                                  };
                                  form.setValue("highlights", updated as any);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Judul highlight yang menarik untuk menampilkan
                              fitur unggulan tour
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`highlights.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deskripsi (Opsional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Festival lampu musim dingin paling iconic se-Asia ✨🏮"
                                {...field}
                                value={
                                  typeof highlight === "object"
                                    ? field.value || ""
                                    : ""
                                }
                                onChange={(e) => {
                                  const current = form.getValues("highlights");
                                  const updated = [...current];
                                  updated[index] = {
                                    title:
                                      typeof highlight === "object"
                                        ? highlight.title || ""
                                        : "",
                                    description: e.target.value,
                                  };
                                  form.setValue("highlights", updated as any);
                                }}
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Deskripsi detail tentang highlight ini (opsional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mb-2">
                    Minimal satu highlight wajib diisi
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHighlight}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Highlight
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
                    Buat itinerary harian dengan aktivitas untuk tour Anda
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.watch("itinerary")?.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
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
                            <FormLabel>Nomor Hari</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  const current =
                                    form.getValues("itinerary") || [];
                                  const updated = [...current];
                                  updated[index] = {
                                    ...updated[index],
                                    day: parseInt(e.target.value) || 1,
                                  };
                                  form.setValue("itinerary", updated as any);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Nomor hari dalam itinerary (1, 2, 3, dst.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`itinerary.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Judul Hari *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Arrival Tokyo - Hotel Check In"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Judul untuk hari ini, contoh: "Arrival Tokyo -
                              Hotel Check In"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label>Aktivitas *</Label>
                        <div className="text-xs text-muted-foreground">
                          Minimal satu aktivitas wajib diisi untuk setiap hari
                        </div>
                        {item.activities.map((_activity, activityIndex) => (
                          <div key={activityIndex} className="flex gap-2">
                            <Input
                              {...form.register(
                                `itinerary.${index}.activities.${activityIndex}`
                              )}
                              placeholder="Penjemputan di Narita/Haneda Airport"
                            />
                            {item.activities.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeActivity(index, activityIndex)
                                }
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
                          Tambah Aktivitas
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
                    Tambah Hari
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 6: Included & Excluded */}
            <TabsContent value="included" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Termasuk</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Daftar semua item yang termasuk dalam paket tour
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {form.watch("included").map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        {...form.register(`included.${index}`)}
                        placeholder="Tiket pesawat PP Jakarta - Jepang"
                      />
                      {form.watch("included").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField("included", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mb-2">
                    Minimal satu item wajib diisi
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("included")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tidak Termasuk</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Daftar item yang TIDAK termasuk dalam paket tour
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(form.watch("excluded") || []).map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        {...form.register(`excluded.${index}`)}
                        placeholder="Biaya visa Jepang"
                      />
                      {(form.watch("excluded") || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayField("excluded", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mb-2">
                    Opsional - daftar item yang tidak termasuk dalam paket
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("excluded")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons - Navigation and Submit */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tours")}
            >
              Batal
            </Button>

            <div className="flex gap-2 ml-auto">
              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
              )}

              {!isLastTab ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isTabValid}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !isTabValid}
                >
                  {createMutation.isPending ? "Membuat..." : "Buat Tour"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
