import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  UserCheck,
  Mic2,
  Users,
  CalendarDays,
  ShoppingBag,
  Banknote,
  Gavel,
  ScanLine,
  Tags,
  Sparkles,
  Percent,
  PieChart,
  Wallet,
  Landmark,
  Bell,
  Cog,
  LineChart,
  ScrollText,
  Shield,
  Star,
  LifeBuoy,
  UserCircle,
  Building2,
  Flag,
  Store,
  Palmtree,
} from 'lucide-react';

/** Route + icon only; labels come from `nav` i18n via `useNavGroups`. */
export type NavItem = {
  to: string;
  icon: LucideIcon;
};

export const NAV_OVERVIEW: NavItem[] = [{ to: '/', icon: LayoutDashboard }];

export const NAV_APPROVALS: NavItem[] = [
  { to: '/approvals/roles', icon: UserCheck },
  { to: '/approvals/talent', icon: Mic2 },
  { to: '/approvals/vendors', icon: Store },
  { to: '/approvals/organizers', icon: Building2 },
];

export const NAV_OPERATIONS: NavItem[] = [
  { to: '/tourism-ads', icon: Palmtree },
  { to: '/users', icon: Users },
  { to: '/orders', icon: ShoppingBag },
  { to: '/refunds', icon: Banknote },
  { to: '/auctions', icon: Gavel },
  { to: '/scanners', icon: ScanLine },
  { to: '/events', icon: CalendarDays },
  { to: '/categories', icon: Tags },
  { to: '/events/featured', icon: Sparkles },
];

export const NAV_SETTINGS: NavItem[] = [
  { to: '/profile', icon: UserCircle },
  { to: '/settings/fees', icon: Percent },
  { to: '/settings/refund-breakdowns', icon: PieChart },
  { to: '/settings/payouts', icon: Wallet },
  { to: '/settings/finance-compliance', icon: Landmark },
  { to: '/settings/notifications', icon: Bell },
  { to: '/settings/system', icon: Cog },
];

export const NAV_INSIGHTS: NavItem[] = [
  { to: '/analytics', icon: LineChart },
  { to: '/activity', icon: ScrollText },
];

export const NAV_TRUST: NavItem[] = [
  { to: '/moderation/listings', icon: Shield },
  { to: '/moderation/ratings', icon: Star },
];

export const NAV_SUPPORT: NavItem[] = [
  { to: '/support', icon: LifeBuoy },
  { to: '/complaints', icon: Flag },
];
