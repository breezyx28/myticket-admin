/**
 * Admin data layer. Uses RTK Query with `fakeBaseQuery` so all endpoints stay mock-driven.
 * Swap `baseQuery` to `fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL })` when the backend is ready.
 */
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FeaturedEventsConfig, UpsertCategoryInput } from '@/schemas/event.schema';
import { adminEventRowSchema, featuredEventsConfigSchema } from '@/schemas/event.schema';
import type { FeeConfiguration, NotificationSettings } from '@/schemas/settings.schema';
import {
  feeConfigurationSchema,
  notificationSettingsSchema,
} from '@/schemas/settings.schema';
import type { UpdateSupportStatusInput } from '@/schemas/support.schema';
import { supportReplySchema } from '@/schemas/support.schema';
import type { RejectRoleApplicationInput } from '@/schemas/roleApplication.schema';
import { roleApplicationSchema } from '@/schemas/roleApplication.schema';
import type { RejectTalentProfileInput } from '@/schemas/talentApproval.schema';
import { talentProfileSchema } from '@/schemas/talentApproval.schema';
import type { SuspendUserInput } from '@/schemas/user.schema';
import type { CancelEventInput } from '@/schemas/event.schema';
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_FINANCIAL_ANALYTICS,
  MOCK_LEADERBOARDS,
  MOCK_PENDING_ACTIONS,
  MOCK_PLATFORM_COUNTERS,
  MOCK_RATINGS,
} from '@/mock/fixtures';
import {
  categoriesState,
  eventsState,
  featuredConfigState,
  feeConfigState,
  listingModerationState,
  notificationSettingsState,
  roleApplicationsState,
  supportDetailsState,
  supportThreadsState,
  talentProfilesState,
  userDetailsState,
  usersState,
} from '@/mock/runtimeState';
import { financialAnalyticsSchema, type FinancialAnalytics } from '@/schemas/analytics.schema';
import type { RevenueChartRange } from '@/types/analytics';
import { delay } from './delay';

function financialAnalyticsForRange(range: RevenueChartRange): FinancialAnalytics {
  const n = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const fullSeries = MOCK_FINANCIAL_ANALYTICS.revenueByDay;
  const slice = fullSeries.slice(-Math.min(n, fullSeries.length));
  return financialAnalyticsSchema.parse({
    ...MOCK_FINANCIAL_ANALYTICS,
    revenueByDay: slice,
  });
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Dashboard',
    'RoleApplications',
    'TalentProfiles',
    'Users',
    'Events',
    'Categories',
    'Featured',
    'Fees',
    'Notifications',
    'Analytics',
    'Moderation',
    'Ratings',
    'Support',
  ],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<typeof MOCK_DASHBOARD_SUMMARY, void>({
      providesTags: ['Dashboard'],
      async queryFn() {
        await delay(60);
        return { data: MOCK_DASHBOARD_SUMMARY };
      },
    }),
    getPendingActions: builder.query<typeof MOCK_PENDING_ACTIONS, void>({
      providesTags: ['Dashboard'],
      async queryFn() {
        await delay(50);
        return { data: MOCK_PENDING_ACTIONS };
      },
    }),
    getRoleApplications: builder.query<typeof roleApplicationsState, void>({
      providesTags: (r) =>
        r
          ? [...r.map((row) => ({ type: 'RoleApplications' as const, id: row.id })), 'RoleApplications']
          : ['RoleApplications'],
      async queryFn() {
        await delay(70);
        return { data: roleApplicationsState };
      },
    }),
    getRoleApplication: builder.query<NonNullable<(typeof roleApplicationsState)[number]>, string>({
      providesTags: (_r, _e, id) => [{ type: 'RoleApplications', id }],
      async queryFn(id) {
        await delay(40);
        const row = roleApplicationsState.find((r) => r.id === id);
        if (!row) return { error: { status: 404, data: 'Not found' } };
        const parsed = roleApplicationSchema.safeParse(row);
        if (!parsed.success) return { error: { status: 500, data: parsed.error.flatten() } };
        return { data: parsed.data };
      },
    }),
    approveRoleApplication: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => [
        'RoleApplications',
        { type: 'RoleApplications', id },
        'Dashboard',
      ],
      async queryFn(id) {
        await delay(120);
        const r = roleApplicationsState.find((x) => x.id === id);
        if (r) {
          r.status = 'approved';
          r.rejectReason = undefined;
        }
        return { data: { ok: true } };
      },
    }),
    rejectRoleApplication: builder.mutation<{ ok: true }, { id: string; body: RejectRoleApplicationInput }>({
      invalidatesTags: (_r, _e, arg) => [
        'RoleApplications',
        { type: 'RoleApplications', id: arg.id },
        'Dashboard',
      ],
      async queryFn({ id, body }) {
        await delay(120);
        const r = roleApplicationsState.find((x) => x.id === id);
        if (r) {
          r.status = 'rejected';
          r.rejectReason = body.reason;
        }
        void body.internalNote;
        return { data: { ok: true } };
      },
    }),
    getTalentProfiles: builder.query<typeof talentProfilesState, void>({
      providesTags: (r) =>
        r
          ? [...r.map((row) => ({ type: 'TalentProfiles' as const, id: row.id })), 'TalentProfiles']
          : ['TalentProfiles'],
      async queryFn() {
        await delay(65);
        return { data: talentProfilesState };
      },
    }),
    getTalentProfile: builder.query<NonNullable<(typeof talentProfilesState)[number]>, string>({
      providesTags: (_r, _e, id) => [{ type: 'TalentProfiles', id }],
      async queryFn(id) {
        await delay(40);
        const row = talentProfilesState.find((r) => r.id === id);
        if (!row) return { error: { status: 404, data: 'Not found' } };
        const parsed = talentProfileSchema.safeParse(row);
        if (!parsed.success) return { error: { status: 500, data: parsed.error.flatten() } };
        return { data: parsed.data };
      },
    }),
    approveTalentProfile: builder.mutation<{ ok: true }, string>({
      invalidatesTags: (_r, _e, id) => [
        'TalentProfiles',
        { type: 'TalentProfiles', id },
        'Dashboard',
      ],
      async queryFn(id) {
        await delay(120);
        const r = talentProfilesState.find((x) => x.id === id);
        if (r) {
          r.status = 'approved';
          r.rejectReason = undefined;
        }
        return { data: { ok: true } };
      },
    }),
    rejectTalentProfile: builder.mutation<{ ok: true }, { id: string; body: RejectTalentProfileInput }>({
      invalidatesTags: (_r, _e, arg) => [
        'TalentProfiles',
        { type: 'TalentProfiles', id: arg.id },
        'Dashboard',
      ],
      async queryFn({ id, body }) {
        await delay(120);
        const r = talentProfilesState.find((x) => x.id === id);
        if (r) {
          r.status = 'rejected';
          r.rejectReason = body.reason;
        }
        return { data: { ok: true } };
      },
    }),
    getUsers: builder.query<typeof usersState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Users' as const, id: row.id })), 'Users'] : ['Users'],
      async queryFn() {
        await delay(55);
        return { data: usersState };
      },
    }),
    getUser: builder.query<(typeof userDetailsState)[string], string>({
      providesTags: (_r, _e, id) => [{ type: 'Users', id }],
      async queryFn(id) {
        await delay(45);
        const row = userDetailsState[id];
        if (!row) return { error: { status: 404, data: 'Not found' } };
        return { data: row };
      },
    }),
    suspendUser: builder.mutation<{ ok: true }, { id: string; body: SuspendUserInput }>({
      invalidatesTags: (_r, _e, arg) => ['Users', { type: 'Users', id: arg.id }],
      async queryFn({ id, body }) {
        await delay(100);
        const r = usersState.find((x) => x.id === id);
        if (r) r.suspended = true;
        const d = userDetailsState[id];
        if (d) d.suspended = true;
        void body;
        return { data: { ok: true } };
      },
    }),
    getEvents: builder.query<typeof eventsState, void>({
      providesTags: (r) =>
        r ? [...r.map((row) => ({ type: 'Events' as const, id: row.id })), 'Events'] : ['Events'],
      async queryFn() {
        await delay(50);
        return { data: eventsState };
      },
    }),
    getEvent: builder.query<NonNullable<(typeof eventsState)[number]>, string>({
      providesTags: (_r, _e, id) => [{ type: 'Events', id }],
      async queryFn(id) {
        await delay(40);
        const row = eventsState.find((e) => e.id === id);
        if (!row) return { error: { status: 404, data: 'Not found' } };
        const parsed = adminEventRowSchema.safeParse(row);
        if (!parsed.success) return { error: { status: 500, data: parsed.error.flatten() } };
        return { data: parsed.data };
      },
    }),
    cancelEvent: builder.mutation<{ ok: true }, CancelEventInput>({
      invalidatesTags: (_r, _e, arg) => ['Events', { type: 'Events', id: arg.eventId }, 'Dashboard'],
      async queryFn(input) {
        await delay(150);
        const r = eventsState.find((e) => e.id === input.eventId);
        if (r) r.status = 'cancelled';
        void input.confirmTitle;
        void input.acknowledgement;
        return { data: { ok: true } };
      },
    }),
    getCategories: builder.query<typeof categoriesState, void>({
      providesTags: ['Categories'],
      async queryFn() {
        await delay(45);
        return { data: categoriesState };
      },
    }),
    upsertCategory: builder.mutation<{ ok: true }, { id?: string; body: UpsertCategoryInput }>({
      invalidatesTags: ['Categories'],
      async queryFn({ id, body }) {
        await delay(90);
        if (id) {
          const row = categoriesState.find((c) => c.id === id);
          if (row) {
            row.name = body.name;
            row.iconKey = body.iconKey;
            row.colorToken = body.colorToken;
          }
        } else {
          categoriesState.push({
            id: `cat-${Date.now()}`,
            name: body.name,
            iconKey: body.iconKey,
            colorToken: body.colorToken,
            active: true,
          });
        }
        return { data: { ok: true } };
      },
    }),
    getFeaturedConfig: builder.query<FeaturedEventsConfig, void>({
      providesTags: ['Featured'],
      async queryFn() {
        await delay(40);
        return { data: featuredEventsConfigSchema.parse(featuredConfigState) };
      },
    }),
    setFeaturedConfig: builder.mutation<{ ok: true }, FeaturedEventsConfig>({
      invalidatesTags: ['Featured'],
      async queryFn(config) {
        await delay(80);
        const parsed = featuredEventsConfigSchema.safeParse(config);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        featuredConfigState.mode = parsed.data.mode;
        featuredConfigState.manualEventIds = parsed.data.manualEventIds;
        return { data: { ok: true } };
      },
    }),
    getFeeConfiguration: builder.query<FeeConfiguration, void>({
      providesTags: ['Fees'],
      async queryFn() {
        await delay(40);
        return { data: feeConfigurationSchema.parse(feeConfigState) };
      },
    }),
    updateFeeConfiguration: builder.mutation<{ ok: true }, FeeConfiguration>({
      invalidatesTags: ['Fees'],
      async queryFn(next) {
        await delay(90);
        const parsed = feeConfigurationSchema.safeParse(next);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        Object.assign(feeConfigState, parsed.data);
        return { data: { ok: true } };
      },
    }),
    getNotificationSettings: builder.query<NotificationSettings, void>({
      providesTags: ['Notifications'],
      async queryFn() {
        await delay(40);
        return { data: notificationSettingsSchema.parse(notificationSettingsState) };
      },
    }),
    updateNotificationSettings: builder.mutation<{ ok: true }, NotificationSettings>({
      invalidatesTags: ['Notifications'],
      async queryFn(next) {
        await delay(90);
        const parsed = notificationSettingsSchema.safeParse(next);
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
        notificationSettingsState.channels = parsed.data.channels;
        notificationSettingsState.reminderOffsetsHours = parsed.data.reminderOffsetsHours;
        return { data: { ok: true } };
      },
    }),
    getFinancialAnalytics: builder.query<FinancialAnalytics, RevenueChartRange | void>({
      providesTags: ['Analytics'],
      async queryFn(rangeArg) {
        await delay(55);
        const range = rangeArg ?? '7d';
        return { data: financialAnalyticsForRange(range) };
      },
    }),
    getPlatformCounters: builder.query<typeof MOCK_PLATFORM_COUNTERS, void>({
      providesTags: ['Analytics'],
      async queryFn() {
        await delay(55);
        return { data: MOCK_PLATFORM_COUNTERS };
      },
    }),
    getLeaderboards: builder.query<typeof MOCK_LEADERBOARDS, void>({
      providesTags: ['Analytics'],
      async queryFn() {
        await delay(55);
        return { data: MOCK_LEADERBOARDS };
      },
    }),
    getListingModeration: builder.query<typeof listingModerationState, void>({
      providesTags: ['Moderation'],
      async queryFn() {
        await delay(50);
        return { data: listingModerationState };
      },
    }),
    markListingModerationReviewed: builder.mutation<{ ok: true }, string>({
      invalidatesTags: ['Moderation'],
      async queryFn(id) {
        await delay(80);
        const row = listingModerationState.find((r) => r.id === id);
        if (row) row.status = 'actioned';
        return { data: { ok: true } };
      },
    }),
    toggleCategoryActive: builder.mutation<{ ok: true }, { id: string; active: boolean }>({
      invalidatesTags: ['Categories'],
      async queryFn({ id, active }) {
        await delay(60);
        const row = categoriesState.find((c) => c.id === id);
        if (row) row.active = active;
        return { data: { ok: true } };
      },
    }),
    addSupportReply: builder.mutation<{ ok: true }, { threadId: string; body: string }>({
      invalidatesTags: (_r, _e, arg) => ['Support', { type: 'Support', id: arg.threadId }],
      async queryFn({ threadId, body }) {
        await delay(90);
        const parsed = supportReplySchema.safeParse({ body });
        if (!parsed.success) return { error: { status: 400, data: parsed.error.flatten() } };
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
        thread.preview = parsed.data.body.length > 90 ? `${parsed.data.body.slice(0, 87)}…` : parsed.data.body;
        const row = supportThreadsState.find((t) => t.id === threadId);
        if (row) {
          row.preview = thread.preview;
          row.updatedAt = sentAt;
          if (row.status === 'open') row.status = 'in_progress';
        }
        return { data: { ok: true } };
      },
    }),
    getRatingsModeration: builder.query<typeof MOCK_RATINGS, void>({
      providesTags: ['Ratings'],
      async queryFn() {
        await delay(50);
        return { data: MOCK_RATINGS };
      },
    }),
    getSupportThreads: builder.query<typeof supportThreadsState, void>({
      providesTags: (r) =>
        r ? [...r.map((t) => ({ type: 'Support' as const, id: t.id })), 'Support'] : ['Support'],
      async queryFn() {
        await delay(50);
        return { data: supportThreadsState };
      },
    }),
    getSupportThread: builder.query<(typeof supportDetailsState)[string], string>({
      providesTags: (_r, _e, id) => [{ type: 'Support', id }],
      async queryFn(id) {
        await delay(45);
        const row = supportDetailsState[id];
        if (!row) return { error: { status: 404, data: 'Not found' } };
        return { data: row };
      },
    }),
    updateSupportStatus: builder.mutation<{ ok: true }, { id: string; body: UpdateSupportStatusInput }>({
      invalidatesTags: (_r, _e, arg) => ['Support', { type: 'Support', id: arg.id }],
      async queryFn({ id, body }) {
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
      },
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetPendingActionsQuery,
  useGetRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useApproveRoleApplicationMutation,
  useRejectRoleApplicationMutation,
  useGetTalentProfilesQuery,
  useGetTalentProfileQuery,
  useApproveTalentProfileMutation,
  useRejectTalentProfileMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useSuspendUserMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useCancelEventMutation,
  useGetCategoriesQuery,
  useUpsertCategoryMutation,
  useGetFeaturedConfigQuery,
  useSetFeaturedConfigMutation,
  useGetFeeConfigurationQuery,
  useUpdateFeeConfigurationMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetFinancialAnalyticsQuery,
  useGetPlatformCountersQuery,
  useGetLeaderboardsQuery,
  useGetListingModerationQuery,
  useMarkListingModerationReviewedMutation,
  useToggleCategoryActiveMutation,
  useGetRatingsModerationQuery,
  useGetSupportThreadsQuery,
  useGetSupportThreadQuery,
  useUpdateSupportStatusMutation,
  useAddSupportReplyMutation,
} = adminApi;
