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
  channel: z.string().optional(),
  read: z.boolean().optional(),
  createdAt: z.string(),
});

export type AdminRecentNotificationRow = z.infer<typeof adminRecentNotificationRowSchema>;

export const adminRecentNotificationListSchema = z.array(adminRecentNotificationRowSchema);

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
