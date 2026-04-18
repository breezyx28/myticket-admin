import type { FeaturedEventsConfig } from '@/schemas/event.schema';
import type { FeeConfiguration, NotificationSettings } from '@/schemas/settings.schema';
import type { SupportThread, SupportThreadDetail } from '@/schemas/support.schema';
import type { RoleApplication } from '@/schemas/roleApplication.schema';
import type { TalentProfile } from '@/schemas/talentApproval.schema';
import type { AdminUserDetail, AdminUserRow } from '@/schemas/user.schema';
import type { AdminEventRow } from '@/schemas/event.schema';
import type { EventCategory } from '@/schemas/event.schema';
import type { ListingModerationRow } from '@/schemas/moderation.schema';
import {
  MOCK_CATEGORIES,
  MOCK_EVENTS,
  MOCK_FEATURED_CONFIG,
  MOCK_FEE_CONFIG,
  MOCK_LISTING_MODERATION,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_ROLE_APPLICATIONS,
  MOCK_SUPPORT_DETAILS,
  MOCK_SUPPORT_THREADS,
  MOCK_TALENT_PROFILES,
  MOCK_USER_DETAILS,
  MOCK_USERS,
} from './fixtures';

function clone<T>(v: T): T {
  return structuredClone(v);
}

export const roleApplicationsState: RoleApplication[] = clone(MOCK_ROLE_APPLICATIONS);
export const talentProfilesState: TalentProfile[] = clone(MOCK_TALENT_PROFILES);
export const usersState: AdminUserRow[] = clone(MOCK_USERS);
export const userDetailsState: Record<string, AdminUserDetail> = clone(MOCK_USER_DETAILS);
export const eventsState: AdminEventRow[] = clone(MOCK_EVENTS);
export const categoriesState: EventCategory[] = clone(MOCK_CATEGORIES);
export const featuredConfigState: FeaturedEventsConfig = clone(MOCK_FEATURED_CONFIG);
export const feeConfigState: FeeConfiguration = clone(MOCK_FEE_CONFIG);
export const notificationSettingsState: NotificationSettings = clone(MOCK_NOTIFICATION_SETTINGS);
export const supportThreadsState: SupportThread[] = clone(MOCK_SUPPORT_THREADS);
export const supportDetailsState: Record<string, SupportThreadDetail> = clone(MOCK_SUPPORT_DETAILS);
export const listingModerationState: ListingModerationRow[] = clone(MOCK_LISTING_MODERATION);
