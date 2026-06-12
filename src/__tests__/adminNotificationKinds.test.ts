import { describe, expect, it } from 'vitest';
import {
  filterAdminOperationalNotifications,
  isAdminOperationalNotification,
} from '@/lib/adminNotificationKinds';
import type { AdminRecentNotificationRow } from '@/schemas/adminNotifications.schema';

describe('adminNotificationKinds', () => {
  it('allows operational admin kinds', () => {
    expect(
      isAdminOperationalNotification({
        kind: 'event_review_required',
        href: '/events/1',
      }),
    ).toBe(true);
    expect(
      isAdminOperationalNotification({
        kind: 'tourism_ad_submitted',
        href: '/tourism-ads/12',
      }),
    ).toBe(true);
  });

  it('blocks chat and engagement kinds', () => {
    expect(isAdminOperationalNotification({ kind: 'message_received' })).toBe(false);
    expect(isAdminOperationalNotification({ kind: 'engagement_status_changed' })).toBe(false);
  });

  it('allows rows with admin href when kind is missing', () => {
    expect(isAdminOperationalNotification({ href: '/approvals/talent/5' })).toBe(true);
  });

  it('filters notification lists', () => {
    const rows: AdminRecentNotificationRow[] = [
      {
        id: '1',
        title: 'Event',
        kind: 'event_review_required',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Chat',
        kind: 'message_received',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    expect(filterAdminOperationalNotifications(rows)).toHaveLength(1);
    expect(filterAdminOperationalNotifications(rows)[0]?.id).toBe('1');
  });
});
