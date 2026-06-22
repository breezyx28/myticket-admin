import {
  MOCK_ADMIN_ACTIONS,
  MOCK_ADMIN_HEALTH,
  MOCK_ADMIN_RECENT_NOTIFICATIONS,
  MOCK_ADMIN_VERSION,
  MOCK_AUCTIONS,
  MOCK_AUDIT_LOGS,
  MOCK_CATEGORIES,
  MOCK_COMPLAINTS,
  MOCK_DASHBOARD_COUNTERS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_EVENTS,
  MOCK_FEE_CONFIG,
  MOCK_FINANCIAL_ANALYTICS,
  MOCK_LEADERBOARDS,
  MOCK_LISTING_MODERATION,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_ORDERS,
  MOCK_ORGANIZER_PROFILE_DIRECTORY,
  MOCK_PENDING_ACTIONS,
  MOCK_PAYOUTS,
  MOCK_RATINGS,
  MOCK_REFUND_BREAKDOWNS_VIEW,
  MOCK_REFUNDS,
  MOCK_ROLE_APPLICATIONS,
  MOCK_SCAN_LOGS,
  MOCK_SCANNERS,
  MOCK_SUPPORT_THREADS,
  MOCK_TALENT_CATEGORIES,
  MOCK_TALENT_PROFILES,
  MOCK_TOURISM_ADS,
  MOCK_USERS,
  MOCK_VENDOR_PROFILE_DIRECTORY,
  MOCK_VENDOR_SERVICE_CATEGORIES,
  MOCK_FEATURED_CONFIG,
} from '@/mock/fixtures';
import { ADMIN_API } from '@/test/fixtures/apiBase';
import { TEST_ACCESS_TOKEN } from '@/test/fixtures/adminSession';
import { http, HttpResponse } from 'msw';

/** Wrap list payloads the way Laravel often returns them. */
function data<T>(payload: T) {
  return HttpResponse.json({ data: payload });
}

export const readHandlers = [
  http.get(`${ADMIN_API}/dashboard/summary`, () => data(MOCK_DASHBOARD_SUMMARY)),
  http.get(`${ADMIN_API}/dashboard/counters`, () => data(MOCK_DASHBOARD_COUNTERS)),
  http.get(`${ADMIN_API}/dashboard/pending-actions`, () => data(MOCK_PENDING_ACTIONS)),
  http.get(`${ADMIN_API}/role-applications`, () => data(MOCK_ROLE_APPLICATIONS)),
  http.get(`${ADMIN_API}/role-applications/:id`, ({ params }) => {
    const row = MOCK_ROLE_APPLICATIONS.find((r) => r.id === params.id);
    return row ? data(row) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${ADMIN_API}/profiles/talents`, () => data(MOCK_TALENT_PROFILES)),
  http.get(`${ADMIN_API}/profiles/talents/:id`, ({ params }) => {
    const row = MOCK_TALENT_PROFILES.find((r) => r.id === params.id);
    return row ? data(row) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${ADMIN_API}/profiles/vendors`, () => data(MOCK_VENDOR_PROFILE_DIRECTORY)),
  http.get(`${ADMIN_API}/profiles/organizers`, () => data(MOCK_ORGANIZER_PROFILE_DIRECTORY)),
  http.get(`${ADMIN_API}/users`, () => data(MOCK_USERS)),
  http.get(`${ADMIN_API}/users/:id`, ({ params }) => {
    const row = MOCK_USERS.find((r) => r.id === params.id);
    return row ? data(row) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${ADMIN_API}/events`, () => data(MOCK_EVENTS)),
  http.get(`${ADMIN_API}/events/:id`, ({ params }) => {
    const row = MOCK_EVENTS.find((r) => r.id === params.id);
    return row ? data(row) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${ADMIN_API}/event-categories`, () => data(MOCK_CATEGORIES)),
  http.get(`${ADMIN_API}/talent-categories`, () => data(MOCK_TALENT_CATEGORIES)),
  http.get(`${ADMIN_API}/vendor-service-categories`, () => data(MOCK_VENDOR_SERVICE_CATEGORIES)),
  http.get(`${ADMIN_API}/featured-events/config`, () => data(MOCK_FEATURED_CONFIG)),
  http.get(`${ADMIN_API}/finance/fee-configurations`, () => data(MOCK_FEE_CONFIG)),
  http.get(`${ADMIN_API}/notification-settings`, () => data(MOCK_NOTIFICATION_SETTINGS)),
  http.get(`${ADMIN_API}/notifications/recent`, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const perPage = Math.max(1, Number(url.searchParams.get('per_page') ?? 30));
    const total = MOCK_ADMIN_RECENT_NOTIFICATIONS.length;
    const start = (page - 1) * perPage;
    const rows = MOCK_ADMIN_RECENT_NOTIFICATIONS.slice(start, start + perPage);
    return data({
      current_page: page,
      data: rows,
      per_page: perPage,
      total,
      last_page: Math.max(1, Math.ceil(total / perPage)),
    });
  }),
  http.get(`${ADMIN_API}/analytics/financial`, () => data(MOCK_FINANCIAL_ANALYTICS)),
  http.get(`${ADMIN_API}/analytics/leaderboards`, () => data(MOCK_LEADERBOARDS)),
  http.get(`${ADMIN_API}/moderation-queue`, () => data(MOCK_LISTING_MODERATION)),
  http.get(`${ADMIN_API}/ratings`, () => data(MOCK_RATINGS)),
  http.get(`${ADMIN_API}/support-cases`, () => data(MOCK_SUPPORT_THREADS)),
  http.get(`${ADMIN_API}/orders`, () => data(MOCK_ORDERS)),
  http.get(`${ADMIN_API}/refunds`, () => data(MOCK_REFUNDS)),
  http.get(`${ADMIN_API}/finance/refund-breakdowns`, () => data(MOCK_REFUND_BREAKDOWNS_VIEW)),
  http.get(`${ADMIN_API}/finance/payouts`, () => data(MOCK_PAYOUTS)),
  http.get(`${ADMIN_API}/auctions`, () => data(MOCK_AUCTIONS)),
  http.get(`${ADMIN_API}/scanners`, () => data(MOCK_SCANNERS)),
  http.get(`${ADMIN_API}/scan-logs`, () => data(MOCK_SCAN_LOGS)),
  http.get(`${ADMIN_API}/complaints`, () => data(MOCK_COMPLAINTS)),
  http.get(`${ADMIN_API}/tourism-ads`, () => data({ data: MOCK_TOURISM_ADS, meta: { current_page: 1, last_page: 1, total: MOCK_TOURISM_ADS.length } })),
  http.get(`${ADMIN_API}/tourism-ads/:id`, ({ params }) => {
    const row = MOCK_TOURISM_ADS.find((r) => r.id === params.id);
    return row ? data(row) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${ADMIN_API}/admin-actions`, () => data(MOCK_ADMIN_ACTIONS)),
  http.get(`${ADMIN_API}/audit-logs`, () => data(MOCK_AUDIT_LOGS)),
  http.get(`${ADMIN_API}/health`, () => HttpResponse.json(MOCK_ADMIN_HEALTH)),
  http.get(`${ADMIN_API}/version`, () => HttpResponse.json(MOCK_ADMIN_VERSION)),
];

export const authHandlers = [
  http.post(`${ADMIN_API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email && body.password && body.password.length >= 4) {
      return HttpResponse.json({
        token: TEST_ACCESS_TOKEN,
        refresh_token: 'test-refresh',
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        user: {
          id: 1,
          email: body.email,
          full_name: 'Test Admin',
          role: 'admin',
        },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post(`${ADMIN_API}/auth/logout`, () => HttpResponse.json({ ok: true })),
  http.post(`${ADMIN_API}/auth/refresh`, () =>
    HttpResponse.json({ token: TEST_ACCESS_TOKEN, expires_at: new Date().toISOString() }),
  ),
  http.post(`${ADMIN_API}/auth/password/forgot`, () => HttpResponse.json({ ok: true })),
  http.post(`${ADMIN_API}/auth/password/reset`, () => HttpResponse.json({ ok: true })),
];

export const mutationHandlers = [
  http.post(`${ADMIN_API}/role-applications/:id/approve`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/role-applications/:id/reject`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/profiles/talents/:id/approve`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/profiles/talents/:id/reject`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/users/:id/suspend`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/users/:id/unsuspend`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/events/:id/approve`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/events/:id/reject`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/tourism-ads/:id/approve`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/tourism-ads/:id/reject`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/tourism-ads`, () => data({ id: 'ta-new', status: 'pending_review' })),
  http.post(`${ADMIN_API}/admin-actions`, () => data({ id: 'act-new', action_kind: 'listing_moderate' })),
  http.post(`${ADMIN_API}/support-cases/:id/replies`, () => data({ ok: true })),
  http.patch(`${ADMIN_API}/support-cases/:id`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/moderation-queue/:id/claim`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/complaints/:id/triage`, () => data({ ok: true })),
  http.post(`${ADMIN_API}/complaints/:id/resolve`, () => data({ ok: true })),
  http.patch(`${ADMIN_API}/finance/fee-configurations`, () => data({ ok: true })),
  http.patch(`${ADMIN_API}/notification-settings`, () => data({ ok: true })),
];

export const handlers = [...readHandlers, ...authHandlers, ...mutationHandlers];
