import type { FeaturedEventsConfig } from '@/schemas/event.schema';
import type { FeeConfiguration, NotificationSettings } from '@/schemas/settings.schema';
import type { SupportThread, SupportThreadDetail } from '@/schemas/support.schema';
import type { RoleApplication } from '@/schemas/roleApplication.schema';
import type { AdminProfileDirectoryRow } from '@/schemas/adminProfileDirectory.schema';
import type { TalentProfile } from '@/schemas/talentApproval.schema';
import type { AdminOrderDetail, AdminOrderRow } from '@/schemas/order.schema';
import type { AdminAuctionRow } from '@/schemas/auction.schema';
import type { AdminActionRow, AdminAuditLogDetail, AdminAuditLogRow } from '@/schemas/adminActivity.schema';
import type { AdminDeliveryLogRow, AdminRecentNotificationRow } from '@/schemas/adminNotifications.schema';
import type { AdminComplaintRow } from '@/schemas/complaint.schema';
import type { TourismAd } from '@/schemas/tourismAd.schema';
import type { AdminScanLogRow, AdminScannerRow } from '@/schemas/scanner.schema';
import type { AdminOrganizerKycDetail } from '@/schemas/financeCompliance.schema';
import type { AdminPayoutRow } from '@/schemas/payout.schema';
import type { RefundBreakdownsView } from '@/schemas/refundBreakdown.schema';
import type { AdminRefundRow } from '@/schemas/refund.schema';
import type { AdminUserDetail, AdminUserRow } from '@/schemas/user.schema';
import type { AdminEventRow } from '@/schemas/event.schema';
import type { EventCategory } from '@/schemas/event.schema';
import type { ListingModerationRow, RatingRow } from '@/schemas/moderation.schema';
import {
  MOCK_CATEGORIES,
  MOCK_EVENTS,
  MOCK_FEATURED_CONFIG,
  MOCK_FEE_CONFIG,
  MOCK_LISTING_MODERATION,
  MOCK_RATINGS,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_ROLE_APPLICATIONS,
  MOCK_SUPPORT_DETAILS,
  MOCK_SUPPORT_THREADS,
  MOCK_TALENT_PROFILES,
  MOCK_VENDOR_PROFILE_DIRECTORY,
  MOCK_ORGANIZER_PROFILE_DIRECTORY,
  MOCK_ORDER_DETAILS,
  MOCK_ORDERS,
  MOCK_AUCTIONS,
  MOCK_PAYOUTS,
  MOCK_REFUND_BREAKDOWNS_VIEW,
  MOCK_ADMIN_DELIVERY_LOG,
  MOCK_ADMIN_RECENT_NOTIFICATIONS,
  MOCK_ADMIN_ACTIONS,
  MOCK_AUDIT_LOG_DETAILS,
  MOCK_AUDIT_LOGS,
  MOCK_COMPLAINTS,
  MOCK_SCAN_LOGS,
  MOCK_SCANNERS,
  MOCK_ORGANIZER_KYC_BY_ORG,
  MOCK_TOURISM_ADS,
  MOCK_REFUNDS,
  MOCK_USER_DETAILS,
  MOCK_USERS,
} from './fixtures';

function clone<T>(v: T): T {
  return structuredClone(v);
}

export const roleApplicationsState: RoleApplication[] = clone(MOCK_ROLE_APPLICATIONS);
export const talentProfilesState: TalentProfile[] = clone(MOCK_TALENT_PROFILES);
export const vendorProfilesDirectoryState: AdminProfileDirectoryRow[] = clone(
  MOCK_VENDOR_PROFILE_DIRECTORY
);
export const organizerProfilesDirectoryState: AdminProfileDirectoryRow[] = clone(
  MOCK_ORGANIZER_PROFILE_DIRECTORY
);
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
export const ratingsModerationState: RatingRow[] = clone(MOCK_RATINGS);
export const ordersState: AdminOrderRow[] = clone(MOCK_ORDERS);
export const orderDetailsState: Record<string, AdminOrderDetail> = clone(MOCK_ORDER_DETAILS);
export const refundsState: AdminRefundRow[] = clone(MOCK_REFUNDS);
export const refundBreakdownsState: RefundBreakdownsView = clone(MOCK_REFUND_BREAKDOWNS_VIEW);
export const payoutsState: AdminPayoutRow[] = clone(MOCK_PAYOUTS);
export const auctionsState: AdminAuctionRow[] = clone(MOCK_AUCTIONS);
export const scannersState: AdminScannerRow[] = clone(MOCK_SCANNERS);
export const scanLogsState: AdminScanLogRow[] = clone(MOCK_SCAN_LOGS);
export const complaintsState: AdminComplaintRow[] = clone(MOCK_COMPLAINTS);
export const adminActionsState: AdminActionRow[] = clone(MOCK_ADMIN_ACTIONS);
export const recentNotificationsState: AdminRecentNotificationRow[] = clone(MOCK_ADMIN_RECENT_NOTIFICATIONS);
export const deliveryLogsState: AdminDeliveryLogRow[] = clone(MOCK_ADMIN_DELIVERY_LOG);
export const auditLogsState: AdminAuditLogRow[] = clone(MOCK_AUDIT_LOGS);
export const auditLogDetailsState: Record<string, AdminAuditLogDetail> = clone(MOCK_AUDIT_LOG_DETAILS);
export const organizerKycByOrganizerId: Record<string, AdminOrganizerKycDetail> = clone(
  MOCK_ORGANIZER_KYC_BY_ORG
);
export const tourismAdsState: TourismAd[] = clone(MOCK_TOURISM_ADS);
