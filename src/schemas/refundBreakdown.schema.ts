import { z } from 'zod';

/** Normalized row for admin refund breakdown charts / tables. */
export const refundBreakdownRowSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  amountSar: z.number(),
  refundCount: z.number().int().min(0),
});

export type RefundBreakdownRow = z.infer<typeof refundBreakdownRowSchema>;

export const refundBreakdownsViewSchema = z.object({
  rows: z.array(refundBreakdownRowSchema),
  totalRefundedSar: z.number(),
});

export type RefundBreakdownsView = z.infer<typeof refundBreakdownsViewSchema>;
