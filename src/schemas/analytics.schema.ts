import { z } from 'zod';

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
  revenueByDay: z.array(revenuePointSchema),
  revenueBreakdownByCategory: z.array(revenueBreakdownRowSchema),
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

export const leaderboardRowSchema = z.object({
  id: z.string(),
  label: z.string(),
  metric: z.string(),
  value: z.number(),
});

export const leaderboardsSchema = z.object({
  topEvents: z.array(leaderboardRowSchema),
  topOrganizers: z.array(leaderboardRowSchema),
  topCategories: z.array(leaderboardRowSchema),
});

export type Leaderboards = z.infer<typeof leaderboardsSchema>;
