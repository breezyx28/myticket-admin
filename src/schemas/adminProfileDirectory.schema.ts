import { z } from 'zod';
import { localizedGeoNameSchema } from './localizedGeo.schema';

/** Shared row shape for `GET …/admin/profiles/vendors` and `…/organizers` list payloads. */
export const adminProfileDirectoryRowSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().optional(),
  /** Backend user id when the list row includes `user_id` (no email on profile). */
  linkedUserId: z.string().optional(),
  slug: z.string().optional(),
  city: z.string().optional(),
  cityDetail: localizedGeoNameSchema.optional(),
  country: z.string().optional(),
  regionDetail: localizedGeoNameSchema.optional(),
  status: z.string().optional(),
  updatedAt: z.string().optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().optional(),
  ratingAverage: z.number().min(0).max(5).optional(),
  completedBookings: z.number().int().nonnegative().optional(),
  availabilityStatus: z.string().optional(),
  /** Vendor coverage / service area when API provides it. */
  coverageArea: z.string().optional(),
  instagramHandle: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export type AdminProfileDirectoryRow = z.infer<typeof adminProfileDirectoryRowSchema>;

export const adminProfileDirectoryListSchema = z.array(adminProfileDirectoryRowSchema);
