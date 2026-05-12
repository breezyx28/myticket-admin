import { z } from 'zod';

/** Body for `PATCH /api/v1/admin/me` (current admin session). */
export const adminProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1).max(64),
  digestEmail: z.boolean(),
});

export type AdminProfileUpdate = z.infer<typeof adminProfileUpdateSchema>;
