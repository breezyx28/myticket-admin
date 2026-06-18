import {
  NAV_APPROVALS,
  NAV_INSIGHTS,
  NAV_OPERATIONS,
  NAV_OVERVIEW,
  NAV_SETTINGS,
  NAV_SUPPORT,
  NAV_TRUST,
  type NavItem,
} from '@/config/nav';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type NavGroup = {
  title: string;
  items: Array<NavItem & { label: string }>;
};

const NAV_ITEM_KEYS: Record<string, string> = {
  '/': 'overview',
  '/approvals/roles': 'roleApplications',
  '/approvals/talent': 'talentProfiles',
  '/approvals/vendors': 'vendorProfiles',
  '/approvals/organizers': 'organizerProfiles',
  '/tourism-ads': 'tourismAds',
  '/users': 'users',
  '/orders': 'orders',
  '/refunds': 'refunds',
  '/auctions': 'auctions',
  '/scanners': 'scanners',
  '/events': 'events',
  '/categories': 'categories',
  '/events/featured': 'featured',
  '/profile': 'myProfile',
  '/settings/fees': 'fees',
  '/settings/refund-breakdowns': 'refundBreakdowns',
  '/settings/payouts': 'payouts',
  '/settings/finance-compliance': 'financeCompliance',
  '/settings/notifications': 'notifications',
  '/settings/system': 'systemStatus',
  '/analytics': 'analytics',
  '/activity': 'activityAudit',
  '/moderation/listings': 'listings',
  '/moderation/ratings': 'ratings',
  '/support': 'support',
  '/complaints': 'complaints',
};

function translateItems(items: NavItem[], t: (key: string) => string): Array<NavItem & { label: string }> {
  return items.map((item) => ({
    ...item,
    label: t(`items.${NAV_ITEM_KEYS[item.to] ?? 'overview'}`),
  }));
}

export function useNavGroups(): NavGroup[] {
  const { t } = useTranslation('nav');

  return useMemo(
    () => [
      { title: t('groups.overview'), items: translateItems(NAV_OVERVIEW, t) },
      { title: t('groups.approvals'), items: translateItems(NAV_APPROVALS, t) },
      { title: t('groups.operations'), items: translateItems(NAV_OPERATIONS, t) },
      { title: t('groups.platform'), items: translateItems(NAV_SETTINGS, t) },
      { title: t('groups.insights'), items: translateItems(NAV_INSIGHTS, t) },
      { title: t('groups.trust'), items: translateItems(NAV_TRUST, t) },
      { title: t('groups.support'), items: translateItems(NAV_SUPPORT, t) },
    ],
    [t],
  );
}
