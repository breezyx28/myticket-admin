import { z } from "zod";

export const revenuePointSchema = z.object({
  date: z.string(),
  revenueSar: z.number().nonnegative(),
});

export const revenueBreakdownRowSchema = z.object({
  categoryKey: z.string(),
  label: z.string(),
  revenueSar: z.number().nonnegative(),
});

export const financialAnalyticsSchema = z.object({
  totalRevenueSar: z.number().nonnegative(),
  platformFeesSar: z.number().nonnegative(),
  refundsSar: z.number().nonnegative(),
  payoutsPendingSar: z.number().nonnegative(),
  revenueByDay: z.array(revenuePointSchema).optional(),
  revenueBreakdownByCategory: z.array(revenueBreakdownRowSchema).optional(),
  /** Handoff `GET /analytics/financial` — optional when API omits charts. */
  range: z.string().optional(),
  since: z.string().optional(),
  ordersPaidCount: z.number().int().nonnegative().optional(),
  ordersPaidTotalAmount: z.number().nonnegative().optional(),
  refundsProcessedTotalAmount: z.number().nonnegative().optional(),
});

export type FinancialAnalytics = z.infer<typeof financialAnalyticsSchema>;

export const platformCountersSchema = z.object({
  usersByRole: z.object({
    guest: z.number().int().nonnegative(),
    talent: z.number().int().nonnegative(),
    vendor: z.number().int().nonnegative(),
    organizer: z.number().int().nonnegative(),
  }),
  eventsByStatus: z.object({
    active: z.number().int().nonnegative(),
    ended: z.number().int().nonnegative(),
    cancelled: z.number().int().nonnegative(),
    archived: z.number().int().nonnegative(),
  }),
  ticketsSold: z.number().int().nonnegative(),
  bookings: z.number().int().nonnegative(),
  ratings: z.number().int().nonnegative(),
});

export type PlatformCounters = z.infer<typeof platformCountersSchema>;

/** Legacy row shape for mock-only leaderboards (unused when live API returns GMV tables). */
export const leaderboardRowSchema = z.object({
  id: z.string(),
  label: z.string(),
  metric: z.string(),
  value: z.number(),
});

/** `GET /analytics/leaderboards` (handoff) — GMV rankings. */
export const leaderboardEventGmvRowSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  revenueGross: z.string(),
  status: z.string(),
  organizerId: z.string(),
});

export const leaderboardOrganizerGmvRowSchema = z.object({
  organizerId: z.string(),
  totalRevenueGross: z.number(),
  displayName: z.string(),
  slug: z.string(),
  code: z.string(),
});

export const leaderboardsSchema = z.object({
  events: z.array(leaderboardEventGmvRowSchema),
  organizers: z.array(leaderboardOrganizerGmvRowSchema),
  generatedAt: z.string().optional(),
});

export type Leaderboards = z.infer<typeof leaderboardsSchema>;
