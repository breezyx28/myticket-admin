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

/** Seller / buyer — admin-facing subset. */
export const adminAuctionPartySummarySchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type AdminAuctionPartySummary = z.infer<typeof adminAuctionPartySummarySchema>;

/** Linked event — support / moderation context. */
export const adminAuctionEventSummarySchema = z.object({
  code: z.string().optional(),
  title: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  timezone: z.string().optional(),
  status: z.string().optional(),
  capacity: z.number().optional(),
});

export type AdminAuctionEventSummary = z.infer<typeof adminAuctionEventSummarySchema>;

/** Ticket sold via listing — linkage to order. */
export const adminAuctionTicketSummarySchema = z.object({
  code: z.string(),
  status: z.string().optional(),
  orderReference: z.string().optional(),
  /** Order id for `/orders/:id`. */
  orderId: z.string().optional(),
  pricePaidSar: z.number().optional(),
});

export type AdminAuctionTicketSummary = z.infer<typeof adminAuctionTicketSummarySchema>;

/** Commission / payout lines from API `transactions`. */
export const adminAuctionLedgerRowSchema = z.object({
  id: z.string(),
  transactionType: z.string(),
  amount: z.number(),
  currency: z.string(),
  occurredAt: z.string().optional(),
});

export type AdminAuctionLedgerRow = z.infer<typeof adminAuctionLedgerRowSchema>;

/** List row plus optional nested payloads from `GET …/auctions/:id`. */
export const adminAuctionDetailSchema = adminAuctionRowSchema.extend({
  listingCode: z.string().optional(),
  currency: z.string().optional(),
  startsAt: z.string().optional(),
  soldAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  cancellationReason: z.string().optional(),
  originalPriceSar: z.number().optional(),
  salePriceSar: z.number().optional(),
  commissionPct: z.number().optional(),
  commissionAmountSar: z.number().optional(),
  sellerProceedsSar: z.number().optional(),
  seatLabelCache: z.string().optional(),
  ticketTypeCache: z.string().optional(),
  eventSummary: adminAuctionEventSummarySchema.optional(),
  ticketSummary: adminAuctionTicketSummarySchema.optional(),
  seller: adminAuctionPartySummarySchema.optional(),
  buyer: adminAuctionPartySummarySchema.optional(),
  ledgerTransactions: z.array(adminAuctionLedgerRowSchema).optional(),
});

export type AdminAuctionDetail = z.infer<typeof adminAuctionDetailSchema>;
