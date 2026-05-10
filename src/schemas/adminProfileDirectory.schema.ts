import { z } from 'zod';

/** Shared row shape for `GET …/admin/profiles/vendors` and `…/organizers` list payloads. */
export const adminProfileDirectoryRowSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().optional(),
  slug: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AdminProfileDirectoryRow = z.infer<typeof adminProfileDirectoryRowSchema>;

export const adminProfileDirectoryListSchema = z.array(adminProfileDirectoryRowSchema);
