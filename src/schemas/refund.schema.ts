import { z } from 'zod';

export const adminRefundStatusSchema = z.enum([
  'pending',
  'approved',
  'processing',
  'completed',
  'rejected',
  'failed',
  'unknown',
]);

export type AdminRefundStatus = z.infer<typeof adminRefundStatusSchema>;

export const adminRefundRowSchema = z.object({
  id: z.string().min(1),
  status: adminRefundStatusSchema,
  amountSar: z.number(),
  orderId: z.string().optional(),
  reason: z.string(),
  requestedByLabel: z.string(),
  eventTitle: z.string().optional(),
  createdAt: z.string(),
});

export type AdminRefundRow = z.infer<typeof adminRefundRowSchema>;

export const adminRefundListSchema = z.array(adminRefundRowSchema);
