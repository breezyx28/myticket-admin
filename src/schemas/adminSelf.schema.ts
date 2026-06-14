import { z } from 'zod';

/** Body for `PATCH /api/v1/admin/me` (current admin session). */
export const adminProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1).max(64),
  digestEmail: z.boolean(),
});

export type AdminProfileUpdate = z.infer<typeof adminProfileUpdateSchema>;

/** Response from `POST /api/v1/admin/me/profile-image`. */
export const adminProfileImageUploadSchema = z.object({
  userId: z.string().optional(),
  profileImageUrl: z.string().min(1),
  avatarUrl: z.string().min(1),
  contentType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  syncedProfiles: z.array(z.string()).optional(),
});

export type AdminProfileImageUploadResult = z.infer<typeof adminProfileImageUploadSchema>;

export const PROFILE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';
export const PROFILE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
