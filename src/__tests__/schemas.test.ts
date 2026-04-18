import { describe, expect, it } from 'vitest';
import { financialAnalyticsSchema } from '@/schemas/analytics.schema';
import { dashboardSummarySchema } from '@/schemas/dashboard.schema';

describe('Zod fixtures', () => {
  it('parses dashboard summary mock shape', () => {
    const parsed = dashboardSummarySchema.parse({
      totalUsers: 100,
      totalEvents: 10,
      totalTicketsSold: 1000,
      totalRevenueSar: 50_000,
    });
    expect(parsed.totalUsers).toBe(100);
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
