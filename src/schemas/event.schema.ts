import { z } from 'zod';

export const eventLifecycleSchema = z.enum(['active', 'ended', 'cancelled', 'archived']);

export const adminEventRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  organizerName: z.string(),
  status: eventLifecycleSchema,
  startsAt: z.string(),
  endsAt: z.string(),
  ticketsSold: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  revenueSar: z.number().nonnegative(),
  avgRating: z.number().min(0).max(5),
  successRatePercent: z.number().min(0).max(100),
  category: z.string(),
  venueName: z.string(),
  city: z.string(),
  /** API may return relative paths; avoid strict `.url()` for live reads. */
  coverImageUrl: z.string().min(1),
  /** Homepage / manual featuring (admin `POST …/feature` | `…/unfeature`). */
  featured: z.boolean().default(false),
});

export type AdminEventRow = z.infer<typeof adminEventRowSchema>;

export const adminEventListSchema = z.array(adminEventRowSchema);

export const eventCategorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nameEn: z.string(),
  nameAr: z.string(),
  iconKey: z.string().optional().default(''),
  colorToken: z.string().optional().default(''),
  active: z.boolean(),
  displayOrder: z.number().int().min(0).max(65535).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type EventCategory = z.infer<typeof eventCategorySchema>;

export const eventCategoryListSchema = z.array(eventCategorySchema);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Admin create / full-row edit form — maps to POST / PATCH event-categories. */
export const eventCategoryUpsertFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(80)
    .regex(slugPattern, 'Use lowercase letters, numbers, and single hyphens only'),
  nameEn: z.string().trim().min(1, 'English name is required').max(120),
  nameAr: z.string().trim().min(1, 'Arabic name is required').max(120),
  iconKey: z.string().max(80).optional(),
  colorToken: z.string().max(40).optional(),
  displayOrder: z.number().int().min(0).max(65535).optional(),
});

export type EventCategoryUpsertForm = z.infer<typeof eventCategoryUpsertFormSchema>;

export const featuredEventsConfigSchema = z.object({
  mode: z.enum(['algorithm', 'manual_override']),
  manualEventIds: z.array(z.string()),
  /** How often the storefront hero refreshes (API `refresh_minutes`, required on save). */
  refreshMinutes: z.coerce.number().int().min(1).max(10080).default(60),
});

export type FeaturedEventsConfig = z.infer<typeof featuredEventsConfigSchema>;

export const cancelEventSchema = z.object({
  eventId: z.string(),
  confirmTitle: z.string().min(1),
  acknowledgement: z
    .boolean()
    .refine((v) => v === true, { message: 'You must acknowledge cancellation impact' }),
});

export type CancelEventInput = z.infer<typeof cancelEventSchema>;
