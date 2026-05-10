import { z } from 'zod';

/** Flat counters from `GET /dashboard/counters` (handoff). */
export const dashboardCountersSchema = z.object({
  usersTotal: z.number().int().nonnegative(),
  usersSuspended: z.number().int().nonnegative(),
  eventsPendingApproval: z.number().int().nonnegative(),
  eventsPublished: z.number().int().nonnegative(),
  supportCasesOpenPipeline: z.number().int().nonnegative(),
  listingModerationQueuedOrInReview: z.number().int().nonnegative(),
  roleApplicationsSubmitted: z.number().int().nonnegative(),
  payoutsHeld: z.number().int().nonnegative(),
});

export type DashboardCounters = z.infer<typeof dashboardCountersSchema>;

/** Nested summary from `GET /dashboard/summary` (handoff). */
export const dashboardSummaryNestedSchema = z.object({
  users: z.object({
    total: z.number().int().nonnegative(),
    suspended: z.number().int().nonnegative(),
  }),
  events: z.object({
    pendingApproval: z.number().int().nonnegative(),
    published: z.number().int().nonnegative(),
  }),
  supportCases: z.object({
    openPipeline: z.number().int().nonnegative(),
  }),
  listingModeration: z.object({
    queuedOrInReview: z.number().int().nonnegative(),
  }),
  roleApplications: z.object({
    submitted: z.number().int().nonnegative(),
  }),
  payouts: z.object({
    held: z.number().int().nonnegative(),
  }),
});

export type DashboardSummaryNested = z.infer<typeof dashboardSummaryNestedSchema>;

export const pendingActionSchema = z.object({
  id: z.string(),
  kind: z.enum(['role_application', 'talent_profile', 'support']),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
  priority: z.enum(['high', 'normal']),
  /** API may return relative paths or CDN URLs; avoid `.url()` so live reads do not fail on relative strings. */
  imageUrl: z.string().min(1),
  dueLabel: z.string(),
});

export type PendingAction = z.infer<typeof pendingActionSchema>;

export const pendingActionsResponseSchema = z.array(pendingActionSchema);
