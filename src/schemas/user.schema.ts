import { z } from 'zod';
import { platformUserRoleSchema } from './shared';

export const adminUserRowSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  role: platformUserRoleSchema,
  suspended: z.boolean(),
  joinedAt: z.string(),
});

export type AdminUserRow = z.infer<typeof adminUserRowSchema>;

export const adminUserListSchema = z.array(adminUserRowSchema);

export const adminUserDetailSchema = adminUserRowSchema.extend({
  ticketsPurchased: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
  ratingGivenCount: z.number().int().nonnegative(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  emailVerifiedAt: z.string().nullable().optional(),
  phoneVerifiedAt: z.string().nullable().optional(),
  suspensionReason: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
});

export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

export const suspendUserSchema = z.object({
  reason: z.string().trim().min(3, 'Document why this account is suspended'),
  permanent: z.boolean(),
});

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
