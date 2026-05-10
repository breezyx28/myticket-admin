import { describe, expect, it } from 'vitest';
import { financialAnalyticsSchema } from '@/schemas/analytics.schema';
import { dashboardCountersSchema } from '@/schemas/dashboard.schema';

describe('Zod fixtures', () => {
  it('parses dashboard counters mock shape', () => {
    const parsed = dashboardCountersSchema.parse({
      usersTotal: 100,
      usersSuspended: 2,
      eventsPendingApproval: 3,
      eventsPublished: 40,
      supportCasesOpenPipeline: 5,
      listingModerationQueuedOrInReview: 6,
      roleApplicationsSubmitted: 7,
      payoutsHeld: 1,
    });
    expect(parsed.usersTotal).toBe(100);
  });

  it('parses financial analytics with breakdown', () => {
    const parsed = financialAnalyticsSchema.parse({
      totalRevenueSar: 1,
      platformFeesSar: 1,
      refundsSar: 0,
      payoutsPendingSar: 0,
      revenueByDay: [{ date: '2026-01-01', revenueSar: 100 }],
      revenueBreakdownByCategory: [{ categoryKey: 'x', label: 'X', revenueSar: 50 }],
    });
    expect(parsed.revenueBreakdownByCategory).toHaveLength(1);
  });
});
