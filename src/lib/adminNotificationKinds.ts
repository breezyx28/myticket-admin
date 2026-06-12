import type { AdminRecentNotificationRow } from '@/schemas/adminNotifications.schema';

const ADMIN_KIND_PREFIXES = [
  'event_',
  'role_application',
  'support',
  'moderation',
  'complaint',
  'tourism_ad',
  'government_id',
  'payout',
  'listing',
  'talent',
  'vendor',
  'organizer',
  'kyc',
  'auction',
  'refund',
  'order_review',
  'scanner',
] as const;

const BLOCKED_KIND_PREFIXES = ['message', 'engagement', 'conversation', 'chat'] as const;

const ADMIN_HREF_PREFIXES = [
  '/events/',
  '/approvals/',
  '/tourism-ads/',
  '/support/',
  '/moderation/',
  '/complaints/',
  '/orders/',
  '/refunds/',
  '/auctions/',
  '/users/',
  '/settings/payouts',
  '/activity',
] as const;

function kindMatchesAllowlist(kind: string): boolean {
  const k = kind.toLowerCase();
  if (BLOCKED_KIND_PREFIXES.some((p) => k.startsWith(p))) return false;
  return ADMIN_KIND_PREFIXES.some((p) => k.startsWith(p) || k === p.replace(/_$/, ''));
}

function hrefLooksAdmin(href: string | undefined): boolean {
  if (!href) return false;
  const path = href.startsWith('/') ? href : `/${href}`;
  return ADMIN_HREF_PREFIXES.some((p) => path.startsWith(p));
}

export function isAdminOperationalNotification(
  row: Pick<AdminRecentNotificationRow, 'kind' | 'href' | 'channel'>,
): boolean {
  if (row.kind?.trim()) {
    return kindMatchesAllowlist(row.kind.trim());
  }
  if (row.href && hrefLooksAdmin(row.href)) {
    return true;
  }
  const ch = row.channel?.toLowerCase() ?? '';
  if (ch && kindMatchesAllowlist(ch)) {
    return true;
  }
  return false;
}

export function filterAdminOperationalNotifications<T extends AdminRecentNotificationRow>(
  rows: T[],
): T[] {
  return rows.filter(isAdminOperationalNotification);
}
