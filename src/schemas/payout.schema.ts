import { z } from 'zod';

export const payoutStatusSchema = z.enum([
  'pending',
  'approved',
  'processing',
  'paid',
  'failed',
  'rejected',
  'unknown',
]);

export type PayoutStatus = z.infer<typeof payoutStatusSchema>;

export const adminPayoutRowSchema = z.object({
  id: z.string().min(1),
  status: payoutStatusSchema,
  organizerName: z.string(),
  amountSar: z.number(),
  createdAt: z.string(),
  eventTitle: z.string().optional(),
  reference: z.string().optional(),
});

export type AdminPayoutRow = z.infer<typeof adminPayoutRowSchema>;

export const adminPayoutListSchema = z.array(adminPayoutRowSchema);
