import { z } from 'zod';

export const dashboardSummarySchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  totalEvents: z.number().int().nonnegative(),
  totalTicketsSold: z.number().int().nonnegative(),
  totalRevenueSar: z.number().nonnegative(),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export const pendingActionSchema = z.object({
  id: z.string(),
  kind: z.enum(['role_application', 'talent_profile', 'support']),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
  priority: z.enum(['high', 'normal']),
  imageUrl: z.string().url(),
  dueLabel: z.string(),
});

export type PendingAction = z.infer<typeof pendingActionSchema>;

export const pendingActionsResponseSchema = z.array(pendingActionSchema);
