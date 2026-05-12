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

/** Nested capture/charge row from refund detail APIs. */
export const adminRefundPaymentTransactionSchema = z.object({
  id: z.string().min(1),
  gateway: z.string().optional(),
  gatewayTransaction: z.string().optional(),
  amount: z.number(),
  currency: z.string().optional(),
  status: z.string().optional(),
  occurredAt: z.string().optional(),
});

export type AdminRefundPaymentTransaction = z.infer<typeof adminRefundPaymentTransactionSchema>;

export const adminRefundRowSchema = z.object({
  id: z.string().min(1),
  status: adminRefundStatusSchema,
  amountSar: z.number(),
  orderId: z.string().optional(),
  reason: z.string(),
  requestedByLabel: z.string(),
  eventTitle: z.string().optional(),
  createdAt: z.string(),
  currency: z.string().optional(),
  processedAt: z.string().optional(),
  orderReference: z.string().optional(),
  description: z.string().optional(),
  paymentTransaction: adminRefundPaymentTransactionSchema.optional(),
});

export type AdminRefundRow = z.infer<typeof adminRefundRowSchema>;

export const adminRefundListSchema = z.array(adminRefundRowSchema);
