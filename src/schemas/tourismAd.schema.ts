import { z } from 'zod';

export const tourismAdStatusSchema = z.enum([
  'draft',
  'pending_review',
  'published',
  'rejected',
  'withdrawn',
  'archived',
]);

export type TourismAdStatus = z.infer<typeof tourismAdStatusSchema>;

export const tourismAdSourceSchema = z.enum(['guest', 'admin']);

export type TourismAdSource = z.infer<typeof tourismAdSourceSchema>;

export const weekdayKeySchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

export type WeekdayKey = z.infer<typeof weekdayKeySchema>;

export const WEEKDAY_KEYS: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const openingHoursDaySchema = z.object({
  closed: z.boolean(),
  opens: z.string().optional(),
  closes: z.string().optional(),
});

export const openingHoursSchema = z.object({
  mon: openingHoursDaySchema,
  tue: openingHoursDaySchema,
  wed: openingHoursDaySchema,
  thu: openingHoursDaySchema,
  fri: openingHoursDaySchema,
  sat: openingHoursDaySchema,
  sun: openingHoursDaySchema,
});

export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const tourismAdContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
});

export type TourismAdContact = z.infer<typeof tourismAdContactSchema>;

export const tourismAdMediaLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

export type TourismAdMediaLink = z.infer<typeof tourismAdMediaLinkSchema>;

export const tourismAdUserSummarySchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  email: z.string().optional(),
});

export type TourismAdUserSummary = z.infer<typeof tourismAdUserSummarySchema>;

export const tourismAdSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  createdByUserId: z.string().optional(),
  reviewedByUserId: z.string().optional(),
  source: tourismAdSourceSchema,
  status: tourismAdStatusSchema,
  locationName: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  description: z.string(),
  openingHours: openingHoursSchema,
  services: z.array(z.string()),
  contact: tourismAdContactSchema,
  mediaLinks: z.array(tourismAdMediaLinkSchema),
  galleryUrls: z.array(z.string()),
  coverImageUrl: z.string().optional(),
  visibilityStartsAt: z.string().nullable().optional(),
  visibilityEndsAt: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  carouselPosition: z.number().int().nullable().optional(),
  isPinned: z.boolean(),
  submittedAt: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: tourismAdUserSummarySchema.nullable().optional(),
  createdBy: tourismAdUserSummarySchema.nullable().optional(),
  reviewedBy: tourismAdUserSummarySchema.nullable().optional(),
});

export type TourismAd = z.infer<typeof tourismAdSchema>;

export const tourismAdsListSchema = z.array(tourismAdSchema);

export const tourismAdsListResultSchema = z.object({
  items: tourismAdsListSchema,
  currentPage: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type TourismAdsListResult = z.infer<typeof tourismAdsListResultSchema>;

export const tourismAdsListParamsSchema = z.object({
  status: tourismAdStatusSchema.optional(),
  source: tourismAdSourceSchema.optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(50).optional(),
});

export type TourismAdsListParams = z.infer<typeof tourismAdsListParamsSchema>;

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const openingHoursDayFormSchema = z
  .object({
    closed: z.boolean(),
    opens: z.string().optional(),
    closes: z.string().optional(),
  })
  .superRefine((day, ctx) => {
    if (!day.closed) {
      if (!day.opens?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Opens time required', path: ['opens'] });
      } else if (!timePattern.test(day.opens)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Use HH:MM format', path: ['opens'] });
      }
      if (!day.closes?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Closes time required', path: ['closes'] });
      } else if (!timePattern.test(day.closes)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Use HH:MM format', path: ['closes'] });
      }
    }
  });

const openingHoursFormSchema = z.object({
  mon: openingHoursDayFormSchema,
  tue: openingHoursDayFormSchema,
  wed: openingHoursDayFormSchema,
  thu: openingHoursDayFormSchema,
  fri: openingHoursDayFormSchema,
  sat: openingHoursDayFormSchema,
  sun: openingHoursDayFormSchema,
});

export const createTourismAdSchema = z
  .object({
    locationName: z.string().trim().min(1, 'Location name is required'),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    description: z.string().trim().min(50, 'Description must be at least 50 characters'),
    openingHours: openingHoursFormSchema,
    services: z.array(z.string().trim().min(1)).min(1, 'Add at least one service').max(20),
    contact: tourismAdContactSchema.superRefine((c, ctx) => {
      if (!c.phone?.trim() && !c.email?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone or email is required',
          path: ['phone'],
        });
      }
    }),
    mediaLinks: z.array(tourismAdMediaLinkSchema).max(10),
    galleryUrls: z.array(z.string().url()).min(1, 'Add at least one gallery image').max(20),
    visibilityStartsAt: z.string().nullable().optional(),
    visibilityEndsAt: z.string().nullable().optional(),
  });

export type CreateTourismAdInput = z.infer<typeof createTourismAdSchema>;

export const updateTourismAdSchema = createTourismAdSchema.partial();

export type UpdateTourismAdInput = z.infer<typeof updateTourismAdSchema>;

export const rejectTourismAdSchema = z.object({
  reason: z.string().trim().min(3, 'Provide a rejection reason').max(1000),
});

export type RejectTourismAdInput = z.infer<typeof rejectTourismAdSchema>;

export const pinTourismAdSchema = z.object({
  position: z.number().int().nonnegative().optional(),
});

export type PinTourismAdInput = z.infer<typeof pinTourismAdSchema>;

export const carouselOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        position: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export type CarouselOrderInput = z.infer<typeof carouselOrderSchema>;

export function defaultOpeningHours(): OpeningHours {
  return {
    mon: { closed: false, opens: '09:00', closes: '18:00' },
    tue: { closed: false, opens: '09:00', closes: '18:00' },
    wed: { closed: false, opens: '09:00', closes: '18:00' },
    thu: { closed: false, opens: '09:00', closes: '18:00' },
    fri: { closed: false, opens: '14:00', closes: '22:00' },
    sat: { closed: false, opens: '09:00', closes: '22:00' },
    sun: { closed: true },
  };
}

export function toApiTourismAdBody(input: CreateTourismAdInput | UpdateTourismAdInput) {
  const body: Record<string, unknown> = {};
  if (input.locationName !== undefined) body.location_name = input.locationName;
  if (input.latitude !== undefined) body.latitude = input.latitude;
  if (input.longitude !== undefined) body.longitude = input.longitude;
  if (input.description !== undefined) body.description = input.description;
  if (input.openingHours !== undefined) body.opening_hours = input.openingHours;
  if (input.services !== undefined) body.services = input.services;
  if (input.contact !== undefined) body.contact = input.contact;
  if (input.mediaLinks !== undefined) body.media_links = input.mediaLinks;
  if (input.galleryUrls !== undefined) body.gallery_urls = input.galleryUrls;
  if (input.visibilityStartsAt !== undefined) {
    body.visibility_starts_at = input.visibilityStartsAt?.trim() ? input.visibilityStartsAt : null;
  }
  if (input.visibilityEndsAt !== undefined) {
    body.visibility_ends_at = input.visibilityEndsAt?.trim() ? input.visibilityEndsAt : null;
  }
  return body;
}
