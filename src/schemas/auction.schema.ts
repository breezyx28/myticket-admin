import { z } from 'zod';

export const adminAuctionStatusSchema = z.enum([
  'draft',
  'scheduled',
  'live',
  'paused',
  'frozen',
  'ended',
  'cancelled',
  'finalized',
  'sold',
  'expired',
  'removed',
  'unknown',
]);

export type AdminAuctionStatus = z.infer<typeof adminAuctionStatusSchema>;

export const adminAuctionRowSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  status: adminAuctionStatusSchema,
  organizerName: z.string(),
  highBidSar: z.number(),
  endsAt: z.string(),
});

export type AdminAuctionRow = z.infer<typeof adminAuctionRowSchema>;

export const adminAuctionListSchema = z.array(adminAuctionRowSchema);
