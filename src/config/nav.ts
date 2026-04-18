import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  UserCheck,
  Mic2,
  Users,
  CalendarDays,
  Tags,
  Sparkles,
  Ban,
  Percent,
  Bell,
  LineChart,
  Shield,
  Star,
  LifeBuoy,
  UserCircle,
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
];

export const NAV_OPERATIONS: NavItem[] = [
  { to: '/users', label: 'Users', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/events/categories', label: 'Categories', icon: Tags },
  { to: '/events/featured', label: 'Featured', icon: Sparkles },
  { to: '/events/cancellations', label: 'Cancellations', icon: Ban },
];

export const NAV_SETTINGS: NavItem[] = [
  { to: '/profile', label: 'My profile', icon: UserCircle },
  { to: '/settings/fees', label: 'Fees', icon: Percent },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
];

export const NAV_INSIGHTS: NavItem[] = [{ to: '/analytics', label: 'Analytics', icon: LineChart }];

export const NAV_TRUST: NavItem[] = [
  { to: '/moderation/listings', label: 'Listings', icon: Shield },
  { to: '/moderation/ratings', label: 'Ratings', icon: Star },
];

export const NAV_SUPPORT: NavItem[] = [{ to: '/support', label: 'Support', icon: LifeBuoy }];

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: NAV_OVERVIEW },
  { title: 'Approvals', items: NAV_APPROVALS },
  { title: 'Operations', items: NAV_OPERATIONS },
  { title: 'Platform', items: NAV_SETTINGS },
  { title: 'Insights', items: NAV_INSIGHTS },
  { title: 'Trust & safety', items: NAV_TRUST },
  { title: 'Support', items: NAV_SUPPORT },
];
