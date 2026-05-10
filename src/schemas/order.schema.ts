import { z } from 'zod';

export const adminOrderStatusSchema = z.enum([
  'paid',
  'pending',
  'refunded',
  'cancelled',
  'failed',
  'processing',
  'completed',
  'unknown',
]);

export type AdminOrderStatus = z.infer<typeof adminOrderStatusSchema>;

export const adminOrderRowSchema = z.object({
  id: z.string().min(1),
  status: adminOrderStatusSchema,
  buyerLabel: z.string(),
  eventTitle: z.string(),
  totalSar: z.number(),
  ticketCount: z.number().int().min(0),
  createdAt: z.string(),
});

export type AdminOrderRow = z.infer<typeof adminOrderRowSchema>;

export const adminOrderListSchema = z.array(adminOrderRowSchema);

export const adminOrderDetailSchema = adminOrderRowSchema.extend({
  buyerEmail: z.string().optional(),
  eventId: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

export type AdminOrderDetail = z.infer<typeof adminOrderDetailSchema>;
