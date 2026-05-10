# Admin endpoints — implementation plan (from updated Postman collection)

This plan maps the **updated** [`collection.json`](../collection.json) to the current admin app ([`src/services/adminApi.ts`](../src/services/adminApi.ts)) and supporting code. Execute in **Agent mode** (Plan mode cannot edit `.ts` files).

## Summary of collection changes vs previous gaps doc

- **GETs now exist** for dashboard, analytics (financial), role applications, profiles (talents/vendors/organizers), events, event-categories, users, support-cases, ratings, moderation-queue, notification-settings, featured-events config, finance fee-configurations, and more.
- **Admin password** `POST /api/v1/admin/auth/password/forgot` and `reset` are in the collection.
- **Event categories** have `GET` / `POST` / `PATCH` / `DELETE` under `/api/v1/admin/event-categories` with example POST body: `slug`, `name_en`, `name_ar`, `icon_key`, `color_token`, `is_active`, `display_order`.

## Phase A — Shared helpers (new files)

1. [`src/lib/apiJson.ts`](../src/lib/apiJson.ts) (new)  
   - `unwrapApiJson`, `asArray`, `asObject`, `pickStr`, `pickNum`, `pickBool` for Laravel-style envelopes and snake_case / camelCase tolerance.

2. [`src/schemas/api/adminMappers.ts`](../src/schemas/api/adminMappers.ts) (new)  
   - One exported mapper per RTK read target, each using `safeParse` into existing Zod schemas where possible, with field aliases (`total_users` / `totalUsers`, etc.).
   - **Talent:** `GET /api/v1/admin/profiles/talents` → `TalentProfile[]`; fill missing UI-only fields with safe defaults (URLs, genres array, etc.) so `talentProfileSchema` passes.
   - **Categories:** map API row → `EventCategory` (`name` ← `name_en` or `name`, `iconKey` ← `icon_key`, `active` ← `is_active`, `id` stringified).
   - **Support / moderation / ratings:** map list + detail rows to existing `supportThreadSchema`, `listingModerationRowSchema`, `ratingRowSchema` (permissive).
   - **Financial:** `GET /api/v1/admin/analytics/financial` with query params (try `range`, `period`, `window` — document whichever the backend confirms) → `FinancialAnalytics`; on parse failure return structured RTK error.

## Phase B — `LIVE_GET` and read wiring

Edit [`src/services/adminApi.ts`](../src/services/adminApi.ts):

| `LiveReadName` | `LIVE_GET` path (prefix `/api/v1/admin`) | Notes |
|----------------|--------------------------------------------|--------|
| `getDashboardSummary` | `/api/v1/admin/dashboard/summary` | Map via `dashboardSummarySchema` |
| `getPendingActions` | `/api/v1/admin/dashboard/pending-actions` | `pendingActionsResponseSchema` |
| `getRoleApplications` | `/api/v1/admin/role-applications` | Array → `roleApplicationSchema[]` |
| `getRoleApplication` | `/api/v1/admin/role-applications/:id` | Replace `:id` at runtime |
| `getTalentProfiles` | `/api/v1/admin/profiles/talents` | Not `role-applications` |
| `getTalentProfile` | *(no GET by id)* | `queryFn`: `GET profiles/talents`, then `find(row => String(row.id) === id)`; if missing, 404 |
| `getUsers` | `/api/v1/admin/users` | Map to `AdminUserRow[]` |
| `getUser` | `/api/v1/admin/users/:id` | Map to `AdminUserDetail` |
| `getEvents` | `/api/v1/admin/events` | Map to `AdminEventRow[]` |
| `getEvent` | `/api/v1/admin/events/:id` | Map to `AdminEventRow` |
| `getCategories` | `/api/v1/admin/event-categories` | Map to `EventCategory[]` |
| `getFeaturedConfig` | `/api/v1/admin/featured-events/config` | `featuredEventsConfigSchema` |
| `getFeeConfiguration` | `/api/v1/admin/finance/fee-configurations` | `feeConfigurationSchema` |
| `getNotificationSettings` | `/api/v1/admin/notification-settings` | `notificationSettingsSchema` |
| `getFinancialAnalytics` | `/api/v1/admin/analytics/financial` | Append `params` (`range=7d` etc.) via RTK `params` |
| `getPlatformCounters` | *keep `null`* | No dedicated route in collection |
| `getLeaderboards` | *keep `null`* | No dedicated route in collection |
| `getListingModeration` | `/api/v1/admin/moderation-queue` | |
| `getRatingsModeration` | `/api/v1/admin/ratings` | |
| `getSupportThreads` | `/api/v1/admin/support-cases` | |
| `getSupportThread` | `/api/v1/admin/support-cases/:id` | |

Refactor `tryLiveRead` to accept optional `params` and optional `map(raw: unknown): T` so list/detail endpoints share one code path.

## Phase C — Category mutations (API)

When `sessionHasApiCredentials()` in [`adminApi.ts`](../src/services/adminApi.ts):

- **Create:** `POST /api/v1/admin/event-categories` with body aligned to collection (`slug`, `name_en`, `name_ar`, `icon_key`, `color_token`, `is_active`, `display_order`). Derive `slug` from name (slugify + optional suffix). Set `name_ar` to `name_en` until i18n UI exists.
- **Update:** `PATCH /api/v1/admin/event-categories/:id` with same shape (merge from existing row for `slug` if PATCH requires it).
- **Toggle active:** `PATCH` with `{ is_active, icon_key, color_token, ... }` as needed or partial patch supported by API.
- After success, only update `runtimeState` when `shouldUseMockReads()` (keep current hybrid behavior).

## Phase D — Forgot password UI

[`src/pages/auth/ForgotPasswordPage.tsx`](../src/pages/auth/ForgotPasswordPage.tsx): `POST` to `/api/v1/admin/auth/password/forgot` with `{ email }`, using `getApiBaseUrl()`; handle errors and success copy (no “demo” wording).

[`ResetPasswordPage`](../src/pages/auth/ResetPasswordPage.tsx): wire to `POST /api/v1/admin/auth/password/reset` with collection body shape (`token`, `password`).

## Phase E — Talent approve/reject

Collection does **not** show a talent-specific approve URL beyond `role-applications/:id/approve`. **Keep** current mutation URLs unless backend adds `profiles/talents/:id/...`. Document in gaps if product wants profile-based IDs only.

## Phase F — Docs

1. Replace [`docs/myticket_admin_api_collection_gaps.md`](myticket_admin_api_collection_gaps.md) with a short list of **remaining** unknowns only (see companion file after refresh).
2. Optional: add `GET` examples to Postman once backend returns 200 bodies.

## Verification

- Set `VITE_ADMIN_READS_SOURCE=api`, sign in with real token, click through dashboard, approvals, events, users, support, moderation, ratings, analytics.
- `npm run build` / `npm test` / `npm run lint`.

## Note on production host

A probe of `GET .../dashboard/summary` on `myticket-api.kat-jr.com` returned **404 route not found** while the Postman file lists the route — deployment may lag the spec. Client wiring is still correct per collection; treat runtime 404 as backend rollout / prefix issues until resolved.
