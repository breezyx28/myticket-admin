/**
 * Admin data layer: RTK Query with hybrid reads (mock vs API) and authenticated mutations
 * against `VITE_API_BASE_URL` + `/api/v1/admin/*` routes from the Postman collection.
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import { ZodError } from 'zod';
import { getAccessToken } from '@/lib/authSession';
import {
  MOCK_DASHBOARD_COUNTERS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_FINANCIAL_ANALYTICS,
  MOCK_LEADERBOARDS,
  MOCK_PENDING_ACTIONS,
  MOCK_PLATFORM_COUNTERS,
  MOCK_ADMIN_HEALTH,
  MOCK_ADMIN_VERSION,
} from '@/mock/fixtures';
import {
  categoriesState,
  eventsState,
  featuredConfigState,
  feeConfigState,
  listingModerationState,
  ratingsModerationState,
  deliveryLogsState,
  notificationSettingsState,
  recentNotificationsState,
  orderDetailsState,
  ordersState,
  payoutsState,
  auctionsState,
  refundBreakdownsState,
  refundsState,
  roleApplicationsState,
  adminActionsState,
  auditLogDetailsState,
  auditLogsState,
  complaintsState,
  scanLogsState,
  scannersState,
  organizerKycByOrganizerId,
  supportDetailsState,
  supportThreadsState,
  talentProfilesState,
  organizerProfilesDirectoryState,
  vendorProfilesDirectoryState,
  userDetailsState,
  usersState,
} from '@/mock/runtimeState';
import { financialAnalyticsSchema, type FinancialAnalytics } from '@/schemas/analytics.schema';
import type {
  AdminEventDetail,
  CancelEventInput,
  FeaturedEventsConfig,
  EventCategoryUpsertForm,
  RejectEventInput,
} from '@/schemas/event.schema';
import { featuredEventsConfigSchema, rejectEventSchema } from '@/schemas/event.schema';
import { adminAuctionDetailSchema, type AdminAuctionDetail } from '@/schemas/auction.schema';
import { adminProfileUpdateSchema, type AdminProfileUpdate } from '@/schemas/adminSelf.schema';
import type { FeeConfiguration, NotificationSettings } from '@/schemas/settings.schema';
import {
  feeConfigurationSchema,
  notificationSettingsSchema,
} from '@/schemas/settings.schema';
import { supportReplySchema, supportThreadDetailSchema } from '@/schemas/support.schema';
import type { UpdateSupportStatusInput } from '@/schemas/support.schema';
import type { RejectRoleApplicationInput } from '@/schemas/roleApplication.schema';
import { roleApplicationSchema } from '@/schemas/roleApplication.schema';
import type { RejectTalentProfileInput } from '@/schemas/talentApproval.schema';
import { talentProfileSchema } from '@/schemas/talentApproval.schema';
import { adminOrderDetailSchema, forceRefundOrderSchema } from '@/schemas/order.schema';
import { adminRefundRowSchema } from '@/schemas/refund.schema';
import { adminUserDetailSchema, suspendUserSchema, type SuspendUserInput } from '@/schemas/user.schema';
import { rejectPayoutSchema } from '@/schemas/payout.schema';
import { resolveComplaintSchema } from '@/schemas/complaint.schema';
import { cancelEventSchema } from '@/schemas/event.schema';
import type { RevenueChartRange } from '@/types/analytics';
import { baseQueryWithReauth, sessionHasApiCredentials } from '@/services/adminFetchBaseQuery';
import { shouldUseMockReads, warnReadFallback } from '@/services/adminReadMode';
import {
  mapAdminEventDetailFromApi,
  mapAdminEventsFromApi,
  mapAdminUserDetailFromApi,
  mapAdminUsersFromApi,
  dashboardCountersFromSummary,
  mapDashboardCountersFromApi,
  mapDashboardSummaryFromApi,
  mapPlatformCountersFromApi,
  mapEventCategoriesFromApi,
  mapFeaturedConfigFromApi,
  mapFeeConfigurationFromApi,
  mapFinancialAnalyticsFromApi,
  mapLeaderboardsFromApi,
  mapAdminOrderDetailFromApi,
  mapAdminOrdersFromApi,
  mapAdminRefundRowFromApi,
  mapAdminRefundsFromApi,
  mapAdminAuctionsFromApi,
  mapAdminPayoutsFromApi,
  mapAdminActionsFromApi,
  mapAdminAuditLogDetailFromApi,
  mapAdminAuditLogsFromApi,
  mapAdminComplaintsFromApi,
  mapAdminOrganizerKycFromApi,
  mapAdminScanLogsFromApi,
  mapAdminScannersFromApi,
  mapRefundBreakdownsFromApi,
  mapListingModerationFromApi,
  mapAdminDeliveryLogsFromApi,
  mapAdminHealthFromApi,
  mapAdminRecentNotificationsFromApi,
  mapAdminVersionFromApi,
  mapNotificationSettingsFromApi,
  mapAdminProfileDirectoryFromApi,
  mapPendingActionsFromApi,
  mapRatingsFromApi,
  mapRoleApplicationFromApi,
  mapRoleApplicationsFromApi,
  mapSupportThreadDetailFromApi,
  mapSupportThreadsFromApi,
  mapTalentProfileDetailFromApi,
  mapTalentProfilesFromApi,
  mapAdminAuctionDetailFromApi,
} from '@/schemas/api/adminMappers';
import {
  adminOrganizerKycDetailSchema,
  createFeeAdjustmentSchema,
  type AdminKycDocStatus,
  type AdminOrganizerKycDetail,
  type CreateFeeAdjustmentInput,
  type RejectOrganizerKycDocumentInput,
} from '@/schemas/financeCompliance.schema';
import { adminAuditLogDetailSchema, type AdminAuditLogDetail } from '@/schemas/adminActivity.schema';
import {
  adminHealthViewSchema,
  adminVersionViewSchema,
  type AdminHealthView,
  type AdminVersionView,
} from '@/schemas/adminSystem.schema';
import { delay } from './delay';

function toFetchError(err: unknown): { status: number; data: unknown } {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const o = err as { status: number; data?: unknown };
    return { status: o.status, data: o.data };
  }
  return { status: 500, data: err };
}

function unauthenticatedReadError(): { error: { status: number; data: { message: string } } } {
  return { error: { status: 401, data: { message: 'Not authenticated' } } };
}

function mapLiveReadFailure(e: unknown): { error: { status: number; data: unknown } } {
  if (e instanceof ZodError) {
    return { error: { status: 422, data: { message: 'Invalid API response', issues: e.flatten() } } };
  }
  const message = e instanceof Error ? e.message : 'Map failed';
  return { error: { status: 422, data: { message, cause: e } } };
}

type LiveReadName =
  | 'getDashboardSummary'
  | 'getDashboardCounters'
  | 'getPendingActions'
  | 'getRoleApplications'
  | 'getRoleApplication'
  | 'getTalentProfiles'
  | 'getTalentProfile'
  | 'getVendorProfiles'
  | 'getOrganizerProfiles'
  | 'getUsers'
  | 'getUser'
  | 'getEvents'
  | 'getEvent'
  | 'getCategories'
  | 'getFeaturedConfig'
  | 'getFeeConfiguration'
  | 'getNotificationSettings'
  | 'getNotificationsRecent'
  | 'getNotificationsDeliveryLog'
  | 'getFinancialAnalytics'
  | 'getPlatformCounters'
  | 'getLeaderboards'
  | 'getListingModeration'
  | 'getRatingsModeration'
  | 'getSupportThreads'
  | 'getSupportThread'
  | 'getOrders'
  | 'getOrder'
  | 'getRefunds'
  | 'getRefund'
  | 'getRefundBreakdowns'
  | 'getPayouts'
  | 'getAuctions'
  | 'getAuction'
  | 'getOrganizerKyc'
  | 'getScanners'
  | 'getScanLogs'
  | 'getComplaints'
  | 'getAdminActions'
  | 'getAuditLogs'
  | 'getAdminHealth'
  | 'getAdminVersion';

/** Wire confirmed GET paths here; `null` keeps mock + one-time console warning in API read mode. */
const LIVE_GET: Record<LiveReadName, string | null> = {
  getDashboardSummary: '/api/v1/admin/dashboard/summary',
  getDashboardCounters: '/api/v1/admin/dashboard/counters',
  getPendingActions: '/api/v1/admin/dashboard/pending-actions',
  getRoleApplications: '/api/v1/admin/role-applications',
  getRoleApplication: '/api/v1/admin/role-applications/:id',
  getTalentProfiles: '/api/v1/admin/profiles/talents',
  getTalentProfile: '/api/v1/admin/profiles/talents/:id',
  getVendorProfiles: '/api/v1/admin/profiles/vendors',
  getOrganizerProfiles: '/api/v1/admin/profiles/organizers',
  getUsers: '/api/v1/admin/users',
  getUser: '/api/v1/admin/users/:id',
  getEvents: '/api/v1/admin/events',
  getEvent: '/api/v1/admin/events/:id',
  getCategories: '/api/v1/admin/event-categories',
  getFeaturedConfig: '/api/v1/admin/featured-events/config',
  getFeeConfiguration: '/api/v1/admin/finance/fee-configurations',
  getNotificationSettings: '/api/v1/admin/notification-settings',
  getNotificationsRecent: '/api/v1/admin/notifications/recent',
  getNotificationsDeliveryLog: '/api/v1/admin/notifications/delivery-log',
  getFinancialAnalytics: '/api/v1/admin/analytics/financial',
  getPlatformCounters: '/api/v1/admin/dashboard/counters',
  getLeaderboards: '/api/v1/admin/analytics/leaderboards',
  getListingModeration: '/api/v1/admin/moderation-queue',
  getRatingsModeration: '/api/v1/admin/ratings',
  getSupportThreads: '/api/v1/admin/support-cases',
  getSupportThread: '/api/v1/admin/support-cases/:id',
  getOrders: '/api/v1/admin/orders',
  getOrder: '/api/v1/admin/orders/:id',
  getRefunds: '/api/v1/admin/refunds',
  getRefund: '/api/v1/admin/refunds/:id',
  getRefundBreakdowns: '/api/v1/admin/finance/refund-breakdowns',
  getPayouts: '/api/v1/admin/finance/payouts',
  getAuctions: '/api/v1/admin/auctions',
  getAuction: '/api/v1/admin/auctions/:id',
  getOrganizerKyc: '/api/v1/admin/finance/organizers/:id/kyc',
  getScanners: '/api/v1/admin/scanners',
  getScanLogs: '/api/v1/admin/scan-logs',
  getComplaints: '/api/v1/admin/complaints',
  getAdminActions: '/api/v1/admin/admin-actions',
  getAuditLogs: '/api/v1/admin/audit-logs',
  getAdminHealth: '/api/v1/admin/health',
  getAdminVersion: '/api/v1/admin/version',
};

type LiveReadOptions<T> = {
  params?: Record<string, string | number | boolean | undefined>;
  map?: (raw: unknown) => T;
};

async function tryLiveRead<T>(
  api: BaseQueryApi,
  extraOptions: object,
  name: LiveReadName,
  delayMs: number,
  mockData: T,
  opts?: LiveReadOptions<T>
): Promise<{ data: T } | { error: { status: number; data: unknown } }> {
  const livePath = LIVE_GET[name];
  if (shouldUseMockReads()) {
    await delay(delayMs);
    return { data: mockData };
  }
  if (!livePath) {
    warnReadFallback(name);
    return { data: mockData };
  }
  const fetchArgs: FetchArgs = { url: livePath, method: 'GET' };
  if (opts?.params) fetchArgs.params = opts.params;
  const res = await baseQueryWithReauth(fetchArgs, api, extraOptions);
  if (res.error) return { error: toFetchError(res.error) };
  if (opts?.map) {
    try {
      return { data: opts.map(res.data) };
    } catch (e) {
      return mapLiveReadFailure(e);
    }
  }
  return { data: res.data as T };
}

function financialAnalyticsForRange(range: RevenueChartRange): FinancialAnalytics {
  const n = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const fullSeries = MOCK_FINANCIAL_ANALYTICS.revenueByDay ?? [];
  const slice = fullSeries.slice(-Math.min(n, fullSeries.length));
  return financialAnalyticsSchema.parse({
    ...MOCK_FINANCIAL_ANALYTICS,
    revenueByDay: slice,
  });
}

function syncRoleApplicationRow(id: string, patch: Partial<(typeof roleApplicationsState)[number]>) {
  const r = roleApplicationsState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncTalentRow(id: string, patch: Partial<(typeof talentProfilesState)[number]>) {
  const r = talentProfilesState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncOrderRow(id: string, patch: Partial<(typeof ordersState)[number]>) {
  const r = ordersState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
  const d = orderDetailsState[id];
  if (d) Object.assign(d, patch);
}

function syncPayoutRow(id: string, patch: Partial<(typeof payoutsState)[number]>) {
  const r = payoutsState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncAuctionRow(id: string, patch: Partial<(typeof auctionsState)[number]>) {
  const r = auctionsState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncScannerRow(id: string, patch: Partial<(typeof scannersState)[number]>) {
  const r = scannersState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncOrganizerKycDocStatus(organizerId: string, docId: string, status: AdminKycDocStatus) {
  const bundle = organizerKycByOrganizerId[organizerId];
  if (!bundle) return;
  const doc = bundle.documents.find((x) => x.id === docId);
  if (doc) doc.status = status;
}

function syncComplaintRow(id: string, patch: Partial<(typeof complaintsState)[number]>) {
  const r = complaintsState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncListingModerationRow(id: string, patch: Partial<(typeof listingModerationState)[number]>) {
  const r = listingModerationState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncRatingModerationRow(id: string, patch: Partial<(typeof ratingsModerationState)[number]>) {
  const r = ratingsModerationState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

function syncEventRow(id: string, patch: Partial<(typeof eventsState)[number]>) {
  const r = eventsState.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard',
    'RoleApplications',
    'TalentProfiles',
    'VendorProfiles',
    'OrganizerProfiles',
    'Users',
    'Events',
    'Categories',
    'Featured',
    'Fees',
    'Notifications',
    'NotificationFeed',
    'NotificationDelivery',
    'Analytics',
    'Moderation',
    'Ratings',
    'Support',
    'Orders',
    'Refunds',
    'RefundBreakdowns',
    'Payouts',
    'Auctions',
    'Scanners',
    'ScanLogs',
    'Complaints',
    'AdminActions',
    'AuditLogs',
    'AdminHealth',
    'AdminVersion',
    'OrganizerKyc',
  ],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<typeof MOCK_DASHBOARD_SUMMARY, void>({
      providesTags: ['Dashboard'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getDashboardSummary', 60, MOCK_DASHBOARD_SUMMARY, {
          map: mapDashboardSummaryFromApi,
        });
      },
    }),
    getDashboardCounters: builder.query<typeof MOCK_DASHBOARD_COUNTERS, void>({
      providesTags: ['Dashboard'],
      async queryFn(_arg, api, extraOptions) {
        const counters = await tryLiveRead(api, extraOptions, 'getDashboardCounters', 0, MOCK_DASHBOARD_COUNTERS, {
          map: mapDashboardCountersFromApi,
        });
        if ('data' in counters) return counters;
        if (counters.error.status === 404 || counters.error.status === 405) {
          return tryLiveRead(api, extraOptions, 'getDashboardSummary', 0, MOCK_DASHBOARD_COUNTERS, {
            map: (raw) => dashboardCountersFromSummary(mapDashboardSummaryFromApi(raw)),
          });
        }
        return counters;
      },
    }),
    getPendingActions: builder.query<typeof MOCK_PENDING_ACTIONS, void>({
      providesTags: ['Dashboard'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getPendingActions', 50, MOCK_PENDING_ACTIONS, {
          map: mapPendingActionsFromApi,
        });
      },
    }),
    getRoleApplications: builder.query<typeof roleApplicationsState, void>({
      providesTags: (r) =>
        r
          ? [...r.map((row) => ({ type: 'RoleApplications' as const, id: row.id })), 'RoleApplications']
          : ['RoleApplications'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getRoleApplications', 70, roleApplicationsState, {
          map: mapRoleApplicationsFromApi,
        });
      },
    }),
    getRoleApplication: builder.query<NonNullable<(typeof roleApplicationsState)[number]>, string>({
      providesTags: (_r, _e, id) => [{ type: 'RoleApplications', id }],
      async queryFn(id, api, extraOptions) {
        await delay(40);
        const localRow = roleApplicationsState.find((r) => r.id === id);
        const localParsed = localRow ? roleApplicationSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: (typeof roleApplicationsState)[number] } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const rolePath = LIVE_GET.getRoleApplication;
        if (!rolePath) {
          warnReadFallback('getRoleApplication');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: rolePath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapRoleApplicationFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    approveRoleApplication: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => [
        'RoleApplications',
        { type: 'RoleApplications', id },
        'Dashboard',
      ],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncRoleApplicationRow(id, { status: 'approved', rejectReason: undefined });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/role-applications/${encodeURIComponent(id)}/approve`,
            method: 'POST',
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncRoleApplicationRow(id, { status: 'approved', rejectReason: undefined });
        return { data: { ok: true } };
      },
    }),
    rejectRoleApplication: builder.mutation<{ ok: true }, { id: string; body: RejectRoleApplicationInput }>({
      invalidatesTags: (_r, _e, arg) => [
        'RoleApplications',
        { type: 'RoleApplications', id: arg.id },
        'Dashboard',
      ],
      async queryFn({ id, body }, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncRoleApplicationRow(id, { status: 'rejected', rejectReason: body.reason });
          void body.internalNote;
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/role-applications/${encodeURIComponent(id)}/reject`,
            method: 'POST',
            body: { rejection_reason: body.reason },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncRoleApplicationRow(id, { status: 'rejected', rejectReason: body.reason });
        void body.internalNote;
        return { data: { ok: true } };
      },
    }),
    getTalentProfiles: builder.query<typeof talentProfilesState, void>({
      providesTags: (r) =>
        r
          ? [...r.map((row) => ({ type: 'TalentProfiles' as const, id: row.id })), 'TalentProfiles']
          : ['TalentProfiles'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getTalentProfiles', 65, talentProfilesState, {
          map: mapTalentProfilesFromApi,
        });
      },
    }),
    getTalentProfile: builder.query<NonNullable<(typeof talentProfilesState)[number]>, string>({
      providesTags: (_r, _e, id) => [{ type: 'TalentProfiles', id }],
      async queryFn(id, api, extraOptions) {
        await delay(40);
        const localRow = talentProfilesState.find((r) => r.id === id);
        const localParsed = localRow ? talentProfileSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: (typeof talentProfilesState)[number] } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const detailPath = LIVE_GET.getTalentProfile;
        if (!detailPath) {
          warnReadFallback('getTalentProfile');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: detailPath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapTalentProfileDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    getVendorProfiles: builder.query<typeof vendorProfilesDirectoryState, void>({
      providesTags: (r) =>
        r
          ? [...r.map((row) => ({ type: 'VendorProfiles' as const, id: row.id })), 'VendorProfiles']
          : ['VendorProfiles'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getVendorProfiles', 62, vendorProfilesDirectoryState, {
          map: mapAdminProfileDirectoryFromApi,
        });
      },
    }),
    getOrganizerProfiles: builder.query<typeof organizerProfilesDirectoryState, void>({
      providesTags: (r) =>
        r
          ? [
              ...r.map((row) => ({ type: 'OrganizerProfiles' as const, id: row.id })),
              'OrganizerProfiles',
            ]
          : ['OrganizerProfiles'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(
          api,
          extraOptions,
          'getOrganizerProfiles',
          62,
          organizerProfilesDirectoryState,
          {
            map: mapAdminProfileDirectoryFromApi,
          }
        );
      },
    }),
    approveTalentProfile: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => [
        'TalentProfiles',
        { type: 'TalentProfiles', id },
        'Dashboard',
      ],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncTalentRow(id, { status: 'approved', rejectReason: undefined });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/role-applications/${encodeURIComponent(id)}/approve`,
            method: 'POST',
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncTalentRow(id, { status: 'approved', rejectReason: undefined });
        return { data: { ok: true } };
      },
    }),
    rejectTalentProfile: builder.mutation<{ ok: true }, { id: string; body: RejectTalentProfileInput }>({
      invalidatesTags: (_r, _e, arg) => [
        'TalentProfiles',
        { type: 'TalentProfiles', id: arg.id },
        'Dashboard',
      ],
      async queryFn({ id, body }, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncTalentRow(id, { status: 'rejected', rejectReason: body.reason });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/role-applications/${encodeURIComponent(id)}/reject`,
            method: 'POST',
            body: { rejection_reason: body.reason },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncTalentRow(id, { status: 'rejected', rejectReason: body.reason });
        return { data: { ok: true } };
      },
    }),
    getOrders: builder.query<typeof ordersState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Orders' as const, id: row.id })), 'Orders'] : ['Orders'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getOrders', 55, ordersState, {
          map: mapAdminOrdersFromApi,
        });
      },
    }),
    getOrder: builder.query<(typeof orderDetailsState)[string], string>({
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
      async queryFn(id, api, extraOptions) {
        await delay(45);
        const localRow = orderDetailsState[id];
        const localParsed = localRow ? adminOrderDetailSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: (typeof orderDetailsState)[string] } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const orderPath = LIVE_GET.getOrder;
        if (!orderPath) {
          warnReadFallback('getOrder');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        // Use numericId from cached list row if available (API expects numeric id)
        const listRow = ordersState.find((r) => r.id === id);
        const apiId = listRow?.numericId ? String(listRow.numericId) : id;

        const res = await baseQueryWithReauth(
          { url: orderPath.replace(':id', encodeURIComponent(apiId)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminOrderDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    forceRefundOrder: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Orders', { type: 'Orders', id }, 'Refunds', 'RefundBreakdowns'],
      async queryFn(id, api, extraOptions) {
        const parsed = forceRefundOrderSchema.safeParse({ orderId: id });
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncOrderRow(id, { status: 'refunded' });
          return { data: { ok: true } };
        }
        // Prefer numeric primary key for URL (detail/list pass `numericId ?? id`).
        const listRow = ordersState.find((r) => r.id === id);
        const apiId =
          /^\d+$/.test(id) ? id : listRow?.numericId ? String(listRow.numericId) : id;
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/orders/${encodeURIComponent(apiId)}/force-refund`,
            method: 'POST',
            body: {},
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncOrderRow(id, { status: 'refunded' });
        return { data: { ok: true } };
      },
    }),
    getRefunds: builder.query<typeof refundsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Refunds' as const, id: row.id })), 'Refunds'] : ['Refunds'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getRefunds', 55, refundsState, {
          map: mapAdminRefundsFromApi,
        });
      },
    }),
    getRefund: builder.query<NonNullable<(typeof refundsState)[number]>, string>({
      providesTags: (_r, _e, id) => [{ type: 'Refunds', id }],
      async queryFn(id, api, extraOptions) {
        await delay(40);
        const localRow = refundsState.find((r) => r.id === id);
        const localParsed = localRow ? adminRefundRowSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: (typeof refundsState)[number] } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const refundPath = LIVE_GET.getRefund;
        if (!refundPath) {
          warnReadFallback('getRefund');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: refundPath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminRefundRowFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    getRefundBreakdowns: builder.query<typeof refundBreakdownsState, void>({
      providesTags: ['RefundBreakdowns'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getRefundBreakdowns', 55, refundBreakdownsState, {
          map: mapRefundBreakdownsFromApi,
        });
      },
    }),
    getPayouts: builder.query<typeof payoutsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Payouts' as const, id: row.id })), 'Payouts'] : ['Payouts'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getPayouts', 55, payoutsState, {
          map: mapAdminPayoutsFromApi,
        });
      },
    }),
    approvePayout: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Payouts', { type: 'Payouts', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncPayoutRow(id, { status: 'approved' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/finance/payouts/${encodeURIComponent(id)}/approve`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncPayoutRow(id, { status: 'approved' });
        return { data: { ok: true } };
      },
    }),
    rejectPayout: builder.mutation<{ ok: true }, { id: string; reason?: string }>({
      invalidatesTags: (_r, _e, arg) => ['Payouts', { type: 'Payouts', id: arg.id }],
      async queryFn({ id, reason }, api, extraOptions) {
        const parsed = rejectPayoutSchema.safeParse({ reason });
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncPayoutRow(id, { status: 'rejected' });
          return { data: { ok: true } };
        }
        const trimmed = (parsed.data.reason ?? '').trim();
        const body = trimmed.length > 0 ? { reason: trimmed } : {};
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/finance/payouts/${encodeURIComponent(id)}/reject`,
            method: 'POST',
            body,
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncPayoutRow(id, { status: 'rejected' });
        return { data: { ok: true } };
      },
    }),
    markPayoutProcessing: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Payouts', { type: 'Payouts', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncPayoutRow(id, { status: 'processing' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/finance/payouts/${encodeURIComponent(id)}/mark-processing`,
            method: 'POST',
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncPayoutRow(id, { status: 'processing' });
        return { data: { ok: true } };
      },
    }),
    markPayoutPaid: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Payouts', { type: 'Payouts', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncPayoutRow(id, { status: 'paid' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/finance/payouts/${encodeURIComponent(id)}/mark-paid`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncPayoutRow(id, { status: 'paid' });
        return { data: { ok: true } };
      },
    }),
    markPayoutFailed: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Payouts', { type: 'Payouts', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncPayoutRow(id, { status: 'failed' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/finance/payouts/${encodeURIComponent(id)}/mark-failed`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncPayoutRow(id, { status: 'failed' });
        return { data: { ok: true } };
      },
    }),
    getAuctions: builder.query<typeof auctionsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Auctions' as const, id: row.id })), 'Auctions'] : ['Auctions'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getAuctions', 55, auctionsState, {
          map: mapAdminAuctionsFromApi,
        });
      },
    }),
    getAuction: builder.query<AdminAuctionDetail, string>({
      providesTags: (_r, _e, id) => [{ type: 'Auctions', id }],
      async queryFn(id, api, extraOptions) {
        await delay(40);
        const localRow = auctionsState.find((a) => a.id === id);
        const localParsed = localRow ? adminAuctionDetailSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: AdminAuctionDetail } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const auctionPath = LIVE_GET.getAuction;
        if (!auctionPath) {
          warnReadFallback('getAuction');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: auctionPath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminAuctionDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    freezeAuction: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Auctions', { type: 'Auctions', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncAuctionRow(id, { status: 'frozen' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/auctions/${encodeURIComponent(id)}/freeze`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncAuctionRow(id, { status: 'frozen' });
        return { data: { ok: true } };
      },
    }),
    cancelAuction: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Auctions', { type: 'Auctions', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncAuctionRow(id, { status: 'cancelled' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/auctions/${encodeURIComponent(id)}/cancel`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncAuctionRow(id, { status: 'cancelled' });
        return { data: { ok: true } };
      },
    }),
    finalizeAuction: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Auctions', { type: 'Auctions', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncAuctionRow(id, { status: 'finalized' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/auctions/${encodeURIComponent(id)}/finalize`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncAuctionRow(id, { status: 'finalized' });
        return { data: { ok: true } };
      },
    }),
    getScanners: builder.query<typeof scannersState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Scanners' as const, id: row.id })), 'Scanners'] : ['Scanners'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getScanners', 55, scannersState, {
          map: mapAdminScannersFromApi,
        });
      },
    }),
    getScanLogs: builder.query<typeof scanLogsState, void>({
      providesTags: ['ScanLogs'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getScanLogs', 55, scanLogsState, {
          map: mapAdminScanLogsFromApi,
        });
      },
    }),
    getComplaints: builder.query<typeof complaintsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Complaints' as const, id: row.id })), 'Complaints'] : ['Complaints'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getComplaints', 55, complaintsState, {
          map: mapAdminComplaintsFromApi,
        });
      },
    }),
    triageComplaint: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Complaints', { type: 'Complaints', id }],
      async queryFn(id, api, extraOptions) {
        if (!id || typeof id !== 'string') return { error: { status: 400, data: { message: 'Invalid complaint id' } } };
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncComplaintRow(id, { status: 'triaged', updatedAt: new Date().toISOString() });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/complaints/${encodeURIComponent(id)}/triage`,
            method: 'POST',
            body: { action: 'triage' },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncComplaintRow(id, { status: 'triaged', updatedAt: new Date().toISOString() });
        return { data: { ok: true } };
      },
    }),
    resolveComplaint: builder.mutation<{ ok: true }, { id: string; resolutionNote: string }>({
      invalidatesTags: (_r, _e, arg) => ['Complaints', { type: 'Complaints', id: arg.id }],
      async queryFn({ id, resolutionNote }, api, extraOptions) {
        const parsed = resolveComplaintSchema.safeParse({ resolutionNote });
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncComplaintRow(id, { status: 'resolved', updatedAt: new Date().toISOString() });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/complaints/${encodeURIComponent(id)}/resolve`,
            method: 'POST',
            body: { resolution_note: parsed.data.resolutionNote },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncComplaintRow(id, { status: 'resolved', updatedAt: new Date().toISOString() });
        return { data: { ok: true } };
      },
    }),
    escalateComplaint: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Complaints', { type: 'Complaints', id }],
      async queryFn(id, api, extraOptions) {
        if (!id || typeof id !== 'string') return { error: { status: 400, data: { message: 'Invalid complaint id' } } };
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncComplaintRow(id, { status: 'escalated', updatedAt: new Date().toISOString() });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/complaints/${encodeURIComponent(id)}/escalate`,
            method: 'POST',
            body: { action: 'escalate' },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncComplaintRow(id, { status: 'escalated', updatedAt: new Date().toISOString() });
        return { data: { ok: true } };
      },
    }),
    getAdminActions: builder.query<typeof adminActionsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'AdminActions' as const, id: row.id })), 'AdminActions'] : ['AdminActions'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getAdminActions', 55, adminActionsState, {
          map: mapAdminActionsFromApi,
        });
      },
    }),
    getAuditLogs: builder.query<typeof auditLogsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'AuditLogs' as const, id: row.id })), 'AuditLogs'] : ['AuditLogs'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getAuditLogs', 55, auditLogsState, {
          map: mapAdminAuditLogsFromApi,
        });
      },
    }),
    getAdminHealth: builder.query<AdminHealthView, void>({
      providesTags: ['AdminHealth'],
      async queryFn(_arg, api, extraOptions) {
        const mock = adminHealthViewSchema.parse(structuredClone(MOCK_ADMIN_HEALTH));
        return tryLiveRead(api, extraOptions, 'getAdminHealth', 40, mock, {
          map: mapAdminHealthFromApi,
        });
      },
    }),
    getAdminVersion: builder.query<AdminVersionView, void>({
      providesTags: ['AdminVersion'],
      async queryFn(_arg, api, extraOptions) {
        const mock = adminVersionViewSchema.parse(structuredClone(MOCK_ADMIN_VERSION));
        return tryLiveRead(api, extraOptions, 'getAdminVersion', 40, mock, {
          map: mapAdminVersionFromApi,
        });
      },
    }),
    getAuditLog: builder.query<AdminAuditLogDetail, string>({
      providesTags: (_r, _e, id) => [{ type: 'AuditLogs', id }],
      async queryFn(id, api, extraOptions) {
        await delay(40);
        const resolveFromMock = (): { data: AdminAuditLogDetail } | { error: { status: number; data: unknown } } => {
          const cached = auditLogDetailsState[id];
          if (cached) {
            const p = adminAuditLogDetailSchema.safeParse(structuredClone(cached));
            if (p.success) return { data: p.data };
          }
          const row = auditLogsState.find((r) => r.id === id);
          if (row) return { data: adminAuditLogDetailSchema.parse({ ...row }) };
          return { error: { status: 404, data: 'Not found' } };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const path = '/api/v1/admin/audit-logs/:id';
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: path.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminAuditLogDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    executeAdminAction: builder.mutation<{ ok: true; data?: unknown }, Record<string, unknown>>({
      invalidatesTags: ['AdminActions', 'AuditLogs'],
      async queryFn(body, api, extraOptions) {
        if (body === null || typeof body !== 'object' || Array.isArray(body)) {
          return { error: { status: 400, data: { message: 'Body must be a JSON object' } } };
        }
        if (!sessionHasApiCredentials()) {
          await delay(100);
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: '/api/v1/admin/admin-actions', method: 'POST', body },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        return { data: { ok: true, data: res.data } };
      },
    }),
    suspendScanner: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Scanners', { type: 'Scanners', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncScannerRow(id, { status: 'suspended' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/scanners/${encodeURIComponent(id)}/suspend`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncScannerRow(id, { status: 'suspended' });
        return { data: { ok: true } };
      },
    }),
    unsuspendScanner: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Scanners', { type: 'Scanners', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncScannerRow(id, { status: 'active' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/scanners/${encodeURIComponent(id)}/unsuspend`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncScannerRow(id, { status: 'active' });
        return { data: { ok: true } };
      },
    }),
    getOrganizerKyc: builder.query<AdminOrganizerKycDetail, string>({
      providesTags: (_r, _e, id) => [{ type: 'OrganizerKyc' as const, id }],
      async queryFn(organizerId, api, extraOptions) {
        await delay(45);
        const resolveFromMock = (): { data: AdminOrganizerKycDetail } | { error: { status: number; data: unknown } } => {
          const local = organizerKycByOrganizerId[organizerId];
          if (local) {
            const parsed = adminOrganizerKycDetailSchema.safeParse(structuredClone(local));
            if (parsed.success) return { data: parsed.data };
          }
          return { data: adminOrganizerKycDetailSchema.parse({ organizerId, documents: [] }) };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const kycPath = LIVE_GET.getOrganizerKyc;
        if (!kycPath) {
          warnReadFallback('getOrganizerKyc');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: kycPath.replace(':id', encodeURIComponent(organizerId)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminOrganizerKycFromApi(res.data, organizerId) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    createFeeAdjustment: builder.mutation<{ ok: true }, CreateFeeAdjustmentInput>({
      async queryFn(rawInput, api, extraOptions) {
        let input: CreateFeeAdjustmentInput;
        try {
          input = createFeeAdjustmentSchema.parse(rawInput);
        } catch (e) {
          return mapLiveReadFailure(e);
        }
        if (!sessionHasApiCredentials()) {
          await delay(100);
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: '/api/v1/admin/finance/fee-adjustments',
            method: 'POST',
            body: {
              organizer_id: input.organizerId,
              amount_sar: input.amountSar,
              reason: input.reason,
              ...(input.reference ? { reference: input.reference } : {}),
            },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        return { data: { ok: true } };
      },
    }),
    approveOrganizerKycDocument: builder.mutation<{ ok: true }, { organizerId: string; docId: string }>({
      invalidatesTags: (_r, _e, arg) => [{ type: 'OrganizerKyc', id: arg.organizerId }],
      async queryFn({ organizerId, docId }, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncOrganizerKycDocStatus(organizerId, docId, 'approved');
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/finance/organizers/${encodeURIComponent(organizerId)}/kyc/${encodeURIComponent(docId)}/approve`,
            method: 'POST',
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncOrganizerKycDocStatus(organizerId, docId, 'approved');
        return { data: { ok: true } };
      },
    }),
    rejectOrganizerKycDocument: builder.mutation<{ ok: true }, RejectOrganizerKycDocumentInput>({
      invalidatesTags: (_r, _e, arg) => [{ type: 'OrganizerKyc', id: arg.organizerId }],
      async queryFn(arg, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(90);
          syncOrganizerKycDocStatus(arg.organizerId, arg.docId, 'rejected');
          return { data: { ok: true } };
        }
        const body = arg.reason ? { rejection_reason: arg.reason } : {};
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/finance/organizers/${encodeURIComponent(arg.organizerId)}/kyc/${encodeURIComponent(arg.docId)}/reject`,
            method: 'POST',
            body,
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncOrganizerKycDocStatus(arg.organizerId, arg.docId, 'rejected');
        return { data: { ok: true } };
      },
    }),
    getUsers: builder.query<typeof usersState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Users' as const, id: row.id })), 'Users'] : ['Users'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getUsers', 55, usersState, {
          map: mapAdminUsersFromApi,
        });
      },
    }),
    getUser: builder.query<(typeof userDetailsState)[string], string>({
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
      async queryFn(id, api, extraOptions) {
        await delay(45);
        const localRow = userDetailsState[id];
        const localParsed = localRow ? adminUserDetailSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: (typeof userDetailsState)[string] } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const userPath = LIVE_GET.getUser;
        if (!userPath) {
          warnReadFallback('getUser');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: userPath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminUserDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    suspendUser: builder.mutation<{ ok: true }, { id: string; body: SuspendUserInput }>({
      invalidatesTags: (_r, _e, arg) => ['Users', { type: 'Users', id: arg.id }],
      async queryFn({ id, body }, api, extraOptions) {
        const parsed = suspendUserSchema.safeParse(body);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(100);
          const r = usersState.find((x) => x.id === id);
          if (r) r.suspended = true;
          const d = userDetailsState[id];
          if (d) d.suspended = true;
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/users/${encodeURIComponent(id)}/suspend`,
            method: 'POST',
            body: { reason: parsed.data.reason, permanent: parsed.data.permanent },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const r = usersState.find((x) => x.id === id);
          if (r) r.suspended = true;
          const d = userDetailsState[id];
          if (d) d.suspended = true;
        }
        return { data: { ok: true } };
      },
    }),
    unsuspendUser: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Users', { type: 'Users', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          const r = usersState.find((x) => x.id === id);
          if (r) r.suspended = false;
          const d = userDetailsState[id];
          if (d) d.suspended = false;
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/users/${encodeURIComponent(id)}/unsuspend`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const r = usersState.find((x) => x.id === id);
          if (r) r.suspended = false;
          const d = userDetailsState[id];
          if (d) d.suspended = false;
        }
        return { data: { ok: true } };
      },
    }),
    impersonateUser: builder.mutation<{ ok: true; data?: unknown }, string>({
      invalidatesTags: ['Users'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(120);
          return { data: { ok: true, data: { mock: true, userId: id } } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/users/${encodeURIComponent(id)}/impersonate`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        return { data: { ok: true, data: res.data } };
      },
    }),
    getEvents: builder.query<typeof eventsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Events' as const, id: row.id })), 'Events'] : ['Events'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getEvents', 50, eventsState, {
          map: mapAdminEventsFromApi,
        });
      },
    }),
    getEvent: builder.query<AdminEventDetail, string>({
      providesTags: (_r, _e, id) => [{ type: 'Events', id }],
      async queryFn(id, api, extraOptions) {
        const localRow = eventsState.find((e) => e.id === id);

        const resolveFromMock = (): { data: AdminEventDetail } | { error: { status: number; data: unknown } } => {
          if (!localRow) return { error: { status: 404, data: 'Not found' } };
          try {
            return {
              data: mapAdminEventDetailFromApi({
                ...localRow,
                code: `MOCK-${localRow.id}`,
                status: localRow.status === 'cancelled' ? 'cancelled' : 'published',
                capacity: localRow.capacity,
              }),
            };
          } catch (e) {
            return mapLiveReadFailure(e);
          }
        };

        if (shouldUseMockReads()) {
          await delay(40);
          return resolveFromMock();
        }

        const eventPath = LIVE_GET.getEvent;
        if (!eventPath) {
          warnReadFallback('getEvent');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: eventPath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapAdminEventDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    cancelEvent: builder.mutation<{ ok: true }, CancelEventInput>({
      invalidatesTags: (_r, _e, arg) => ['Events', { type: 'Events', id: arg.eventId }, 'Dashboard'],
      async queryFn(rawInput, api, extraOptions) {
        const parsed = cancelEventSchema.safeParse(rawInput);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        const input = parsed.data;
        if (!sessionHasApiCredentials()) {
          await delay(150);
          const r = eventsState.find((e) => e.id === input.eventId);
          if (r) r.status = 'cancelled';
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/events/${encodeURIComponent(input.eventId)}/reject`,
            method: 'POST',
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const r = eventsState.find((e) => e.id === input.eventId);
          if (r) r.status = 'cancelled';
        }
        return { data: { ok: true } };
      },
    }),
    approveEvent: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Events', { type: 'Events', id }, 'Dashboard', 'NotificationFeed'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncEventRow(id, { status: 'active' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/events/${encodeURIComponent(id)}/approve`, method: 'POST', body: {} },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncEventRow(id, { status: 'active' });
        return { data: { ok: true } };
      },
    }),
    rejectEvent: builder.mutation<{ ok: true }, { id: string; body: RejectEventInput }>({
      invalidatesTags: (_r, _e, arg) => ['Events', { type: 'Events', id: arg.id }, 'Dashboard', 'NotificationFeed'],
      async queryFn({ id, body }, api, extraOptions) {
        const parsed = rejectEventSchema.safeParse(body);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(120);
          syncEventRow(id, { status: 'cancelled' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/events/${encodeURIComponent(id)}/reject`,
            method: 'POST',
            body: { reason: parsed.data.reason },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncEventRow(id, { status: 'cancelled' });
        return { data: { ok: true } };
      },
    }),
    featureEvent: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Events', { type: 'Events', id }, 'Featured'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncEventRow(id, { featured: true });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/events/${encodeURIComponent(id)}/feature`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncEventRow(id, { featured: true });
        return { data: { ok: true } };
      },
    }),
    unfeatureEvent: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Events', { type: 'Events', id }, 'Featured'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          syncEventRow(id, { featured: false });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/events/${encodeURIComponent(id)}/unfeature`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncEventRow(id, { featured: false });
        return { data: { ok: true } };
      },
    }),
    getCategories: builder.query<typeof categoriesState, void>({
      providesTags: ['Categories'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getCategories', 45, categoriesState, {
          params: { per_page: 500 },
          map: mapEventCategoriesFromApi,
        });
      },
    }),
    upsertCategory: builder.mutation<{ ok: true }, { id?: string; body: EventCategoryUpsertForm }>({
      invalidatesTags: ['Categories'],
      async queryFn({ id, body }, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(90);
          const iconKey = body.iconKey?.trim() ?? '';
          const colorToken = body.colorToken?.trim() ?? '';
          if (id) {
            const row = categoriesState.find((c) => c.id === id);
            if (row) {
              row.slug = body.slug.trim();
              row.nameEn = body.nameEn.trim();
              row.nameAr = body.nameAr.trim();
              row.iconKey = iconKey;
              row.colorToken = colorToken;
              if (body.displayOrder !== undefined) row.displayOrder = body.displayOrder;
            }
          } else {
            categoriesState.push({
              id: `cat-${Date.now()}`,
              slug: body.slug.trim(),
              nameEn: body.nameEn.trim(),
              nameAr: body.nameAr.trim(),
              iconKey,
              colorToken,
              active: true,
              displayOrder: body.displayOrder ?? categoriesState.length,
            });
          }
          return { data: { ok: true } };
        }

        const iconKey = body.iconKey?.trim();
        const colorToken = body.colorToken?.trim();
        const baseFields = {
          slug: body.slug.trim(),
          name_en: body.nameEn.trim(),
          name_ar: body.nameAr.trim(),
          icon_key: iconKey ? iconKey : null,
          color_token: colorToken ? colorToken : null,
        };

        const res = id
          ? await baseQueryWithReauth(
              {
                url: `/api/v1/admin/event-categories/${encodeURIComponent(id)}`,
                method: 'PATCH',
                body: {
                  ...baseFields,
                  ...(body.displayOrder !== undefined
                    ? { display_order: body.displayOrder }
                    : {}),
                },
              },
              api,
              extraOptions
            )
          : await baseQueryWithReauth(
              {
                url: '/api/v1/admin/event-categories',
                method: 'POST',
                body: {
                  ...baseFields,
                  is_active: true,
                  display_order: body.displayOrder ?? 0,
                },
              },
              api,
              extraOptions
            );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const icon = body.iconKey?.trim() ?? '';
          const color = body.colorToken?.trim() ?? '';
          if (id) {
            const row = categoriesState.find((c) => c.id === id);
            if (row) {
              row.slug = body.slug.trim();
              row.nameEn = body.nameEn.trim();
              row.nameAr = body.nameAr.trim();
              row.iconKey = icon;
              row.colorToken = color;
              if (body.displayOrder !== undefined) row.displayOrder = body.displayOrder;
            }
          } else {
            categoriesState.push({
              id: `cat-${Date.now()}`,
              slug: body.slug.trim(),
              nameEn: body.nameEn.trim(),
              nameAr: body.nameAr.trim(),
              iconKey: icon,
              colorToken: color,
              active: true,
              displayOrder: body.displayOrder ?? categoriesState.length,
            });
          }
        }
        return { data: { ok: true } };
      },
    }),
    getFeaturedConfig: builder.query<FeaturedEventsConfig, void>({
      providesTags: ['Featured'],
      async queryFn(_arg, api, extraOptions) {
        const mock = featuredEventsConfigSchema.parse(featuredConfigState);
        return tryLiveRead(api, extraOptions, 'getFeaturedConfig', 40, mock, {
          map: mapFeaturedConfigFromApi,
        });
      },
    }),
    setFeaturedConfig: builder.mutation<{ ok: true }, FeaturedEventsConfig>({
      invalidatesTags: ['Featured'],
      async queryFn(config, api, extraOptions) {
        const parsed = featuredEventsConfigSchema.safeParse(config);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(80);
          featuredConfigState.mode = parsed.data.mode;
          featuredConfigState.manualEventIds = parsed.data.manualEventIds;
          featuredConfigState.refreshMinutes = parsed.data.refreshMinutes;
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: '/api/v1/admin/featured-events/config',
            method: 'POST',
            body: {
              mode: parsed.data.mode,
              manual_event_ids: parsed.data.manualEventIds,
              refresh_minutes: parsed.data.refreshMinutes,
            },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          featuredConfigState.mode = parsed.data.mode;
          featuredConfigState.manualEventIds = parsed.data.manualEventIds;
          featuredConfigState.refreshMinutes = parsed.data.refreshMinutes;
        }
        return { data: { ok: true } };
      },
    }),
    updateAdminProfile: builder.mutation<{ ok: true }, AdminProfileUpdate>({
      async queryFn(body, api, extraOptions) {
        const parsed = adminProfileUpdateSchema.safeParse(body);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(80);
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: '/api/v1/admin/me',
            method: 'PATCH',
            body: {
              name: parsed.data.name,
              timezone: parsed.data.timezone,
              digest_email: parsed.data.digestEmail,
            },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        return { data: { ok: true } };
      },
    }),
    getFeeConfiguration: builder.query<FeeConfiguration, void>({
      providesTags: ['Fees'],
      async queryFn(_arg, api, extraOptions) {
        const mock = feeConfigurationSchema.parse(feeConfigState);
        return tryLiveRead(api, extraOptions, 'getFeeConfiguration', 40, mock, {
          map: mapFeeConfigurationFromApi,
        });
      },
    }),
    updateFeeConfiguration: builder.mutation<{ ok: true }, FeeConfiguration>({
      invalidatesTags: ['Fees'],
      async queryFn(next, api, extraOptions) {
        const parsed = feeConfigurationSchema.safeParse(next);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(90);
          Object.assign(feeConfigState, parsed.data);
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: '/api/v1/admin/finance/fee-configurations',
            method: 'POST',
            body: parsed.data,
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) Object.assign(feeConfigState, parsed.data);
        return { data: { ok: true } };
      },
    }),
    getNotificationSettings: builder.query<NotificationSettings, void>({
      providesTags: ['Notifications'],
      async queryFn(_arg, api, extraOptions) {
        const mock = notificationSettingsSchema.parse(notificationSettingsState);
        return tryLiveRead(api, extraOptions, 'getNotificationSettings', 40, mock, {
          map: mapNotificationSettingsFromApi,
        });
      },
    }),
    updateNotificationSettings: builder.mutation<{ ok: true }, NotificationSettings>({
      invalidatesTags: ['Notifications'],
      async queryFn(next, api, extraOptions) {
        const parsed = notificationSettingsSchema.safeParse(next);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(90);
          notificationSettingsState.channels = parsed.data.channels;
          notificationSettingsState.reminderOffsetsHours = parsed.data.reminderOffsetsHours;
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: '/api/v1/admin/notification-settings',
            method: 'PATCH',
            body: {
              email_enabled: parsed.data.channels.email,
              in_app_enabled: parsed.data.channels.inApp,
              push_enabled: parsed.data.channels.push,
              sms_enabled: parsed.data.channels.sms,
              reminder_offsets_hours: parsed.data.reminderOffsetsHours,
            },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          notificationSettingsState.channels = parsed.data.channels;
          notificationSettingsState.reminderOffsetsHours = parsed.data.reminderOffsetsHours;
        }
        return { data: { ok: true } };
      },
    }),
    getNotificationsRecent: builder.query<typeof recentNotificationsState, void>({
      providesTags: ['NotificationFeed'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getNotificationsRecent', 45, recentNotificationsState, {
          map: mapAdminRecentNotificationsFromApi,
        });
      },
    }),
    getNotificationsDeliveryLog: builder.query<typeof deliveryLogsState, void>({
      providesTags: ['NotificationDelivery'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getNotificationsDeliveryLog', 45, deliveryLogsState, {
          map: mapAdminDeliveryLogsFromApi,
        });
      },
    }),
    sendTestNotification: builder.mutation<{ ok: true; data?: unknown }, Record<string, unknown> | void>({
      invalidatesTags: ['NotificationFeed', 'NotificationDelivery'],
      async queryFn(arg, api, extraOptions) {
        const body =
          arg !== undefined && arg !== null && typeof arg === 'object' && !Array.isArray(arg) ? arg : {};
        if (!sessionHasApiCredentials()) {
          await delay(80);
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: '/api/v1/admin/notifications/test', method: 'POST', body },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        return { data: { ok: true, data: res.data } };
      },
    }),
    getFinancialAnalytics: builder.query<FinancialAnalytics, RevenueChartRange | void>({
      providesTags: ['Analytics'],
      async queryFn(rangeArg, api, extraOptions) {
        const range = rangeArg ?? '7d';
        const mock = financialAnalyticsForRange(range);
        return tryLiveRead(api, extraOptions, 'getFinancialAnalytics', 55, mock, {
          params: { range },
          map: mapFinancialAnalyticsFromApi,
        });
      },
    }),
    getPlatformCounters: builder.query<typeof MOCK_PLATFORM_COUNTERS, void>({
      providesTags: ['Analytics'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getPlatformCounters', 0, MOCK_PLATFORM_COUNTERS, {
          map: mapPlatformCountersFromApi,
        });
      },
    }),
    getLeaderboards: builder.query<typeof MOCK_LEADERBOARDS, void>({
      providesTags: ['Analytics'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getLeaderboards', 55, MOCK_LEADERBOARDS, {
          map: mapLeaderboardsFromApi,
        });
      },
    }),
    getListingModeration: builder.query<typeof listingModerationState, void>({
      providesTags: ['Moderation'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getListingModeration', 50, listingModerationState, {
          map: mapListingModerationFromApi,
        });
      },
    }),
    markListingModerationReviewed: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Moderation'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(80);
          syncListingModerationRow(id, { status: 'actioned' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/moderation-queue/${encodeURIComponent(id)}/approve`,
            method: 'POST',
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncListingModerationRow(id, { status: 'actioned' });
        return { data: { ok: true } };
      },
    }),
    claimListingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Moderation'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(80);
          syncListingModerationRow(id, { status: 'claimed' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/moderation-queue/${encodeURIComponent(id)}/claim`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncListingModerationRow(id, { status: 'claimed' });
        return { data: { ok: true } };
      },
    }),
    releaseListingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Moderation'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(80);
          syncListingModerationRow(id, { status: 'queued' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/moderation-queue/${encodeURIComponent(id)}/release`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncListingModerationRow(id, { status: 'queued' });
        return { data: { ok: true } };
      },
    }),
    rejectListingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Moderation'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(80);
          syncListingModerationRow(id, { status: 'rejected' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/moderation-queue/${encodeURIComponent(id)}/reject`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncListingModerationRow(id, { status: 'rejected' });
        return { data: { ok: true } };
      },
    }),
    escalateListingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Moderation'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(80);
          syncListingModerationRow(id, { status: 'escalated' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/moderation-queue/${encodeURIComponent(id)}/escalate`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncListingModerationRow(id, { status: 'escalated' });
        return { data: { ok: true } };
      },
    }),
    toggleCategoryActive: builder.mutation<{ ok: true }, { id: string; active: boolean }>({
      invalidatesTags: ['Categories'],
      async queryFn({ id, active }, api, extraOptions) {
        await delay(60);
        if (!sessionHasApiCredentials()) {
          const row = categoriesState.find((c) => c.id === id);
          if (row) row.active = active;
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/event-categories/${encodeURIComponent(id)}`,
            method: 'PATCH',
            body: { is_active: active },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const r = categoriesState.find((c) => c.id === id);
          if (r) r.active = active;
        }
        return { data: { ok: true } };
      },
    }),
    deleteEventCategory: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Categories'],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(80);
          const idx = categoriesState.findIndex((c) => c.id === id);
          if (idx >= 0) categoriesState.splice(idx, 1);
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/event-categories/${encodeURIComponent(id)}`, method: 'DELETE' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const idx = categoriesState.findIndex((c) => c.id === id);
          if (idx >= 0) categoriesState.splice(idx, 1);
        }
        return { data: { ok: true } };
      },
    }),
    addSupportReply: builder.mutation<{ ok: true }, { threadId: string; body: string }>({
      invalidatesTags: (_r, _e, arg) => ['Support', { type: 'Support', id: arg.threadId }],
      async queryFn({ threadId, body }, api, extraOptions) {
        const parsed = supportReplySchema.safeParse({ body });
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        if (!sessionHasApiCredentials()) {
          await delay(90);
          const thread = supportDetailsState[threadId];
          if (!thread) return { error: { status: 404, data: 'Not found' } };
          const sentAt = new Date().toISOString();
          const msg = {
            id: `m-${Date.now()}`,
            author: 'admin' as const,
            body: parsed.data.body,
            sentAt,
          };
          thread.messages.push(msg);
          thread.updatedAt = sentAt;
          thread.preview =
            parsed.data.body.length > 90 ? `${parsed.data.body.slice(0, 87)}…` : parsed.data.body;
          const row = supportThreadsState.find((t) => t.id === threadId);
          if (row) {
            row.preview = thread.preview;
            row.updatedAt = sentAt;
            if (row.status === 'open') row.status = 'in_progress';
          }
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          {
            url: `/api/v1/admin/support-cases/${encodeURIComponent(threadId)}/messages`,
            method: 'POST',
            body: { message: parsed.data.body },
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const thread = supportDetailsState[threadId];
          if (thread) {
            const sentAt = new Date().toISOString();
            const msg = {
              id: `m-${Date.now()}`,
              author: 'admin' as const,
              body: parsed.data.body,
              sentAt,
            };
            thread.messages.push(msg);
            thread.updatedAt = sentAt;
            thread.preview =
              parsed.data.body.length > 90 ? `${parsed.data.body.slice(0, 87)}…` : parsed.data.body;
            const row = supportThreadsState.find((t) => t.id === threadId);
            if (row) {
              row.preview = thread.preview;
              row.updatedAt = sentAt;
              if (row.status === 'open') row.status = 'in_progress';
            }
          }
        }
        return { data: { ok: true } };
      },
    }),
    getRatingsModeration: builder.query<typeof ratingsModerationState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Ratings' as const, id: row.id })), 'Ratings'] : ['Ratings'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getRatingsModeration', 50, ratingsModerationState, {
          map: mapRatingsFromApi,
        });
      },
    }),
    hideRatingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Ratings', { type: 'Ratings', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(70);
          syncRatingModerationRow(id, { moderationState: 'hidden' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/ratings/${encodeURIComponent(id)}/hide`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncRatingModerationRow(id, { moderationState: 'hidden' });
        return { data: { ok: true } };
      },
    }),
    restoreRatingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Ratings', { type: 'Ratings', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(70);
          syncRatingModerationRow(id, { moderationState: 'visible' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/ratings/${encodeURIComponent(id)}/restore`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncRatingModerationRow(id, { moderationState: 'visible' });
        return { data: { ok: true } };
      },
    }),
    deleteRatingModeration: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Ratings', { type: 'Ratings', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(70);
          syncRatingModerationRow(id, { moderationState: 'deleted' });
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/ratings/${encodeURIComponent(id)}/delete`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) syncRatingModerationRow(id, { moderationState: 'deleted' });
        return { data: { ok: true } };
      },
    }),
    getSupportThreads: builder.query<typeof supportThreadsState, void>({
      providesTags: (r) =>
        r ? [...r.map((t) => ({ type: 'Support' as const, id: t.id })), 'Support'] : ['Support'],
      async queryFn(_arg, api, extraOptions) {
        return tryLiveRead(api, extraOptions, 'getSupportThreads', 50, supportThreadsState, {
          map: mapSupportThreadsFromApi,
        });
      },
    }),
    getSupportThread: builder.query<(typeof supportDetailsState)[string], string>({
      providesTags: (_r, _e, id) => [{ type: 'Support', id }],
      async queryFn(id, api, extraOptions) {
        await delay(45);
        const localRow = supportDetailsState[id];
        const localParsed = localRow ? supportThreadDetailSchema.safeParse(localRow) : null;

        const resolveFromMock = (): { data: (typeof supportDetailsState)[string] } | { error: { status: number; data: unknown } } => {
          if (!localParsed?.success) return { error: { status: 404, data: 'Not found' } };
          return { data: localParsed.data };
        };

        if (shouldUseMockReads()) return resolveFromMock();

        const threadPath = LIVE_GET.getSupportThread;
        if (!threadPath) {
          warnReadFallback('getSupportThread');
          return resolveFromMock();
        }
        if (!getAccessToken()) return unauthenticatedReadError();

        const res = await baseQueryWithReauth(
          { url: threadPath.replace(':id', encodeURIComponent(id)), method: 'GET' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        try {
          return { data: mapSupportThreadDetailFromApi(res.data) };
        } catch (e) {
          return mapLiveReadFailure(e);
        }
      },
    }),
    updateSupportStatus: builder.mutation<{ ok: true }, { id: string; body: UpdateSupportStatusInput }>({
      invalidatesTags: (_r, _e, arg) => ['Support', { type: 'Support', id: arg.id }],
      async queryFn({ id, body }, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          const t = supportThreadsState.find((x) => x.id === id);
          if (t) {
            t.status = body.status;
            t.updatedAt = new Date().toISOString();
          }
          const d = supportDetailsState[id];
          if (d) {
            d.status = body.status;
            d.updatedAt = t?.updatedAt ?? new Date().toISOString();
          }
          void body.resolutionNote;
          return { data: { ok: true } };
        }
        let url = '';
        if (body.status === 'resolved') {
          url = `/api/v1/admin/support-cases/${encodeURIComponent(id)}/resolve`;
        } else if (body.status === 'in_progress') {
          url = `/api/v1/admin/support-cases/${encodeURIComponent(id)}/assign`;
        } else {
          if (shouldUseMockReads()) {
            const t = supportThreadsState.find((x) => x.id === id);
            if (t) {
              t.status = body.status;
              t.updatedAt = new Date().toISOString();
            }
            const d = supportDetailsState[id];
            if (d) {
              d.status = body.status;
              d.updatedAt = new Date().toISOString();
            }
          }
          void body.resolutionNote;
          return { data: { ok: true } };
        }
        const resolutionNote = (body.resolutionNote ?? '').trim();
        const resolveBody =
          body.status === 'resolved'
            ? resolutionNote
              ? { resolution: resolutionNote, resolution_note: resolutionNote }
              : { resolution: 'Resolved.' }
            : {};
        const res = await baseQueryWithReauth(
          {
            url,
            method: 'POST',
            body: resolveBody,
          },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const t = supportThreadsState.find((x) => x.id === id);
          if (t) {
            t.status = body.status;
            t.updatedAt = new Date().toISOString();
          }
          const d = supportDetailsState[id];
          if (d) {
            d.status = body.status;
            d.updatedAt = t?.updatedAt ?? new Date().toISOString();
          }
        }
        void body.resolutionNote;
        return { data: { ok: true } };
      },
    }),
    reopenSupportCase: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => ['Support', { type: 'Support', id }],
      async queryFn(id, api, extraOptions) {
        if (!sessionHasApiCredentials()) {
          await delay(100);
          const t = supportThreadsState.find((x) => x.id === id);
          if (t) {
            t.status = 'open';
            t.updatedAt = new Date().toISOString();
          }
          const d = supportDetailsState[id];
          if (d) {
            d.status = 'open';
            d.updatedAt = new Date().toISOString();
          }
          return { data: { ok: true } };
        }
        const res = await baseQueryWithReauth(
          { url: `/api/v1/admin/support-cases/${encodeURIComponent(id)}/reopen`, method: 'POST' },
          api,
          extraOptions
        );
        if (res.error) return { error: toFetchError(res.error) };
        if (shouldUseMockReads()) {
          const t = supportThreadsState.find((x) => x.id === id);
          if (t) {
            t.status = 'open';
            t.updatedAt = new Date().toISOString();
          }
          const d = supportDetailsState[id];
          if (d) {
            d.status = 'open';
            d.updatedAt = new Date().toISOString();
          }
        }
        return { data: { ok: true } };
      },
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetDashboardCountersQuery,
  useGetPendingActionsQuery,
  useGetRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useApproveRoleApplicationMutation,
  useRejectRoleApplicationMutation,
  useGetTalentProfilesQuery,
  useGetTalentProfileQuery,
  useGetVendorProfilesQuery,
  useGetOrganizerProfilesQuery,
  useApproveTalentProfileMutation,
  useRejectTalentProfileMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useForceRefundOrderMutation,
  useGetRefundsQuery,
  useGetRefundQuery,
  useGetRefundBreakdownsQuery,
  useGetPayoutsQuery,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
  useMarkPayoutProcessingMutation,
  useMarkPayoutPaidMutation,
  useMarkPayoutFailedMutation,
  useGetAuctionsQuery,
  useGetAuctionQuery,
  useFreezeAuctionMutation,
  useCancelAuctionMutation,
  useFinalizeAuctionMutation,
  useGetScannersQuery,
  useGetScanLogsQuery,
  useGetComplaintsQuery,
  useTriageComplaintMutation,
  useResolveComplaintMutation,
  useEscalateComplaintMutation,
  useGetAdminActionsQuery,
  useGetAuditLogsQuery,
  useGetAdminHealthQuery,
  useGetAdminVersionQuery,
  useGetAuditLogQuery,
  useExecuteAdminActionMutation,
  useSuspendScannerMutation,
  useUnsuspendScannerMutation,
  useGetOrganizerKycQuery,
  useCreateFeeAdjustmentMutation,
  useApproveOrganizerKycDocumentMutation,
  useRejectOrganizerKycDocumentMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useImpersonateUserMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useCancelEventMutation,
  useApproveEventMutation,
  useRejectEventMutation,
  useFeatureEventMutation,
  useUnfeatureEventMutation,
  useGetCategoriesQuery,
  useUpsertCategoryMutation,
  useDeleteEventCategoryMutation,
  useGetFeaturedConfigQuery,
  useSetFeaturedConfigMutation,
  useUpdateAdminProfileMutation,
  useGetFeeConfigurationQuery,
  useUpdateFeeConfigurationMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetNotificationsRecentQuery,
  useGetNotificationsDeliveryLogQuery,
  useSendTestNotificationMutation,
  useGetFinancialAnalyticsQuery,
  useGetPlatformCountersQuery,
  useGetLeaderboardsQuery,
  useGetListingModerationQuery,
  useMarkListingModerationReviewedMutation,
  useClaimListingModerationMutation,
  useReleaseListingModerationMutation,
  useRejectListingModerationMutation,
  useEscalateListingModerationMutation,
  useToggleCategoryActiveMutation,
  useGetRatingsModerationQuery,
  useHideRatingModerationMutation,
  useRestoreRatingModerationMutation,
  useDeleteRatingModerationMutation,
  useGetSupportThreadsQuery,
  useGetSupportThreadQuery,
  useUpdateSupportStatusMutation,
  useReopenSupportCaseMutation,
  useAddSupportReplyMutation,
} = adminApi;
