import { z } from 'zod';

export const adminNotificationDeliveryStatusSchema = z.enum([
  'sent',
  'failed',
  'pending',
  'bounced',
  'unknown',
]);

export type AdminNotificationDeliveryStatus = z.infer<typeof adminNotificationDeliveryStatusSchema>;

export const adminRecentNotificationRowSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  body: z.string().optional(),
  kind: z.string().optional(),
  channel: z.string().optional(),
  href: z.string().optional(),
  read: z.boolean().optional(),
  readAt: z.string().optional(),
  archivedAt: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  eventCode: z.string().optional(),
  createdAt: z.string(),
});

export type AdminRecentNotificationRow = z.infer<typeof adminRecentNotificationRowSchema>;

export const adminRecentNotificationListSchema = z.array(adminRecentNotificationRowSchema);

export const adminRecentNotificationsListResultSchema = z.object({
  items: adminRecentNotificationListSchema,
  currentPage: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type AdminRecentNotificationsListResult = z.infer<
  typeof adminRecentNotificationsListResultSchema
>;

export const adminRecentNotificationsListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(50).optional(),
});

export type AdminRecentNotificationsListParams = z.infer<
  typeof adminRecentNotificationsListParamsSchema
>;

export const adminDeliveryLogRowSchema = z.object({
  id: z.string().min(1),
  channel: z.string().optional(),
  status: adminNotificationDeliveryStatusSchema,
  recipient: z.string().optional(),
  templateKey: z.string().optional(),
  sentAt: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type AdminDeliveryLogRow = z.infer<typeof adminDeliveryLogRowSchema>;

export const adminDeliveryLogListSchema = z.array(adminDeliveryLogRowSchema);
