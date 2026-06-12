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

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_OVERVIEW: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
];

export const NAV_APPROVALS: NavItem[] = [
  { to: '/approvals/roles', label: 'Role applications', icon: UserCheck },
  { to: '/approvals/talent', label: 'Talent profiles', icon: Mic2 },
  { to: '/approvals/vendors', label: 'Vendor profiles', icon: Store },
  { to: '/approvals/organizers', label: 'Organizer profiles', icon: Building2 },
];

export const NAV_OPERATIONS: NavItem[] = [
  { to: '/tourism-ads', label: 'Tourism ads', icon: Palmtree },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/refunds', label: 'Refunds', icon: Banknote },
  { to: '/auctions', label: 'Auctions', icon: Gavel },
  { to: '/scanners', label: 'Scanners', icon: ScanLine },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/events/categories', label: 'Categories', icon: Tags },
  { to: '/events/featured', label: 'Featured', icon: Sparkles },
];

export const NAV_SETTINGS: NavItem[] = [
  { to: '/profile', label: 'My profile', icon: UserCircle },
  { to: '/settings/fees', label: 'Fees', icon: Percent },
  { to: '/settings/refund-breakdowns', label: 'Refund breakdowns', icon: PieChart },
  { to: '/settings/payouts', label: 'Payouts', icon: Wallet },
  { to: '/settings/finance-compliance', label: 'Finance compliance', icon: Landmark },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/system', label: 'System status', icon: Cog },
];

export const NAV_INSIGHTS: NavItem[] = [
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/activity', label: 'Activity & audit', icon: ScrollText },
];

export const NAV_TRUST: NavItem[] = [
  { to: '/moderation/listings', label: 'Listings', icon: Shield },
  { to: '/moderation/ratings', label: 'Ratings', icon: Star },
];

export const NAV_SUPPORT: NavItem[] = [
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/complaints', label: 'Complaints', icon: Flag },
];

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: NAV_OVERVIEW },
  { title: 'Approvals', items: NAV_APPROVALS },
  { title: 'Operations', items: NAV_OPERATIONS },
  { title: 'Platform', items: NAV_SETTINGS },
  { title: 'Insights', items: NAV_INSIGHTS },
  { title: 'Trust & safety', items: NAV_TRUST },
  { title: 'Support', items: NAV_SUPPORT },
];
