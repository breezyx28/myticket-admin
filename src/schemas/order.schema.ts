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
  /** Human order code from API (e.g. `ORD-…`). */
  reference: z.string().optional(),
  numericId: z.number().int().positive().optional(),
  status: adminOrderStatusSchema,
  buyerLabel: z.string(),
  eventTitle: z.string(),
  totalSar: z.number(),
  ticketCount: z.number().int().min(0),
  createdAt: z.string(),
});

export type AdminOrderRow = z.infer<typeof adminOrderRowSchema>;

export const adminOrderListSchema = z.array(adminOrderRowSchema);

export const forceRefundOrderSchema = z.object({
  orderId: z.string().min(1),
});

export type ForceRefundOrderInput = z.infer<typeof forceRefundOrderSchema>;

/** Line from API `tickets[]` on order detail. */
export const adminOrderTicketRowSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: z.string(),
  pricePaidSar: z.number().nonnegative(),
  eventTitleCache: z.string().optional(),
});

export type AdminOrderTicketRow = z.infer<typeof adminOrderTicketRowSchema>;

/** Line from API `items[]` on order detail. */
export const adminOrderItemRowSchema = z.object({
  id: z.string(),
  quantity: z.number().int().nonnegative(),
  unitPriceSar: z.number().nonnegative(),
  subtotalSar: z.number().nonnegative(),
  ticketTypeId: z.string().optional(),
});

export type AdminOrderItemRow = z.infer<typeof adminOrderItemRowSchema>;

export const adminOrderDetailSchema = adminOrderRowSchema.extend({
  buyerEmail: z.string().optional(),
  buyerPhone: z.string().optional(),
  eventId: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentCardLast4: z.string().nullable().optional(),
  subtotalSar: z.number().optional(),
  feesSar: z.number().optional(),
  discountSar: z.number().optional(),
  paidAt: z.string().nullable().optional(),
  notes: z.string().optional(),
  currency: z.string().optional(),
  tickets: z.array(adminOrderTicketRowSchema).optional(),
  items: z.array(adminOrderItemRowSchema).optional(),
});

export type AdminOrderDetail = z.infer<typeof adminOrderDetailSchema>;
