import { z } from 'zod';
import { platformUserRoleSchema } from './shared';

export const adminUserRowSchema = z.object({
  id: z.string().min(1),
  displayName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  role: platformUserRoleSchema,
  suspended: z.boolean(),
  isActive: z.boolean().optional(),
  joinedAt: z.string(),
});

export type AdminUserRow = z.infer<typeof adminUserRowSchema>;

export const adminUserListSchema = z.array(adminUserRowSchema);

export const adminUsersListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(50).optional(),
  role: platformUserRoleSchema.or(z.literal('all')).optional(),
  suspended: z.enum(['all', 'yes', 'no']).optional(),
  search: z.string().optional(),
});

export type AdminUsersListParams = z.infer<typeof adminUsersListParamsSchema>;

export const adminUsersListResultSchema = z.object({
  items: adminUserListSchema,
  currentPage: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type AdminUsersListResult = z.infer<typeof adminUsersListResultSchema>;

export const adminUserDetailSchema = adminUserRowSchema.extend({
  ticketsPurchased: z.number().int().nonnegative(),
  bookingsCount: z.number().int().nonnegative(),
  ratingGivenCount: z.number().int().nonnegative(),
  emailVerifiedAt: z.string().nullable().optional(),
  phoneVerifiedAt: z.string().nullable().optional(),
  suspensionReason: z.string().nullable().optional(),
  suspensionIsPermanent: z.boolean().optional(),
  suspendedAt: z.string().nullable().optional(),
  suspendedBy: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  lastLoginIp: z.string().nullable().optional(),
});

export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

export const suspendUserSchema = z.object({
  reason: z.string().trim().min(3, 'validation.suspensionReasonMin'),
  permanent: z.boolean(),
});

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
