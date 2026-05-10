import { z } from 'zod';

/** Catalog entries from `GET /api/v1/admin/admin-actions` (shape varies by backend). */
export const adminActionRowSchema = z.object({
  id: z.string().min(1),
  actionKey: z.string(),
  label: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type AdminActionRow = z.infer<typeof adminActionRowSchema>;

export const adminActionListSchema = z.array(adminActionRowSchema);

export const adminAuditLogRowSchema = z.object({
  id: z.string().min(1),
  summary: z.string(),
  createdAt: z.string(),
  actorLabel: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
});

export type AdminAuditLogRow = z.infer<typeof adminAuditLogRowSchema>;

export const adminAuditLogListSchema = z.array(adminAuditLogRowSchema);

export const adminAuditLogDetailSchema = adminAuditLogRowSchema.extend({
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
});

export type AdminAuditLogDetail = z.infer<typeof adminAuditLogDetailSchema>;
