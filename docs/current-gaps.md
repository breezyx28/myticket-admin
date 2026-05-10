# Current gaps — MyTicket Admin API vs app

**Purpose:** Single place for the **present** gap list between [`collection.json`](../collection.json), the running API, and this admin app.  
**Related:** [`myticket_admin_api_collection_gaps.md`](myticket_admin_api_collection_gaps.md), [`myticket_admin_endpoints_implementation_plan.md`](myticket_admin_endpoints_implementation_plan.md), [`phased_admin_api_readiness.md`](phased_admin_api_readiness.md).  
**Code:** [`src/services/adminApi.ts`](../src/services/adminApi.ts) (`LIVE_GET`, RTK Query), [`src/schemas/api/adminMappers.ts`](../src/schemas/api/adminMappers.ts) (live read mappers), [`src/lib/adminPasswordReset.ts`](../src/lib/adminPasswordReset.ts) (public auth POSTs).

**Read mode:** With `VITE_ADMIN_READS_SOURCE=api`, each wired read uses `tryLiveRead` → `baseQueryWithReauth` when `LIVE_GET[name]` is non-null **and** a bearer token exists; otherwise it falls back to in-memory mock data (`warnReadFallback` once per endpoint name when path is null or token missing).

---

## A. Live reads — `LIVE_GET` vs Postman `GET /api/v1/admin/…`

| RTK query | Collection path (suffix under `api/v1/admin/`) | `LIVE_GET` |
|-----------|--------------------------------------------------|------------|
| `getDashboardSummary` | `dashboard/summary` | wired (nested summary mapper) |
| `getDashboardCounters` | `dashboard/counters` | wired (KPI tiles) |
| `getPendingActions` | `dashboard/pending-actions` | wired |
| `getRoleApplications` | `role-applications` | wired |
| `getRoleApplication` | `role-applications/{id}` | wired |
| `getTalentProfiles` | `profiles/talents` | wired |
| `getTalentProfile` | `profiles/talents/{id}` | wired — `GET` by id + `mapTalentProfileDetailFromApi` |
| `getVendorProfiles` | `profiles/vendors` | wired |
| `getOrganizerProfiles` | `profiles/organizers` | wired |
| `getUsers` | `users` | wired |
| `getUser` | `users/{id}` | wired |
| `getEvents` | `events` | wired |
| `getEvent` | `events/{id}` | wired |
| `getCategories` | `event-categories` | wired |
| `getFeaturedConfig` | `featured-events/config` | wired |
| `getFeeConfiguration` | `finance/fee-configurations` | wired |
| `getNotificationSettings` | `notification-settings` | wired |
| `getNotificationsRecent` | `notifications/recent` | wired |
| `getNotificationsDeliveryLog` | `notifications/delivery-log` | wired |
| `getFinancialAnalytics` | `analytics/financial` | wired (`?range=7d\|24h\|1d\|30d\|90d` per **ADMIN_API_FRONTEND_HANDOFF**) |
| `getPlatformCounters` | *(no matching `GET` in export)* | **`null`** — mock-only (distinct from dashboard counters) |
| `getLeaderboards` | `analytics/leaderboards` | wired (GMV events/organizers) |
| `getListingModeration` | `moderation-queue` | wired |
| `getRatingsModeration` | `ratings` | wired |
| `getSupportThreads` | `support-cases` | wired |
| `getSupportThread` | `support-cases/{id}` | wired |
| `getOrders` | `orders` | wired |
| `getOrder` | `orders/{id}` | wired |
| `getRefunds` | `refunds` | wired |
| `getRefundBreakdowns` | `finance/refund-breakdowns` | wired |
| `getPayouts` | `finance/payouts` | wired |
| `getAuctions` | `auctions` | wired |
| `getAuction` | `auctions/{id}` | wired — custom `queryFn` (same pattern as `getEvent`) |
| `getScanners` | `scanners` | wired |
| `getScanLogs` | `scan-logs` | wired |
| `getComplaints` | `complaints` | wired |
| `getAdminActions` | `admin-actions` | wired |
| `getAuditLogs` | `audit-logs` | wired |
| `getAdminHealth` | `health` | wired |
| `getAdminVersion` | `version` | wired |
| `getAuditLog` | `audit-logs/{id}` | wired — **custom** `queryFn` (not in `LIVE_GET`) |
| `getOrganizerKyc` | `finance/organizers/{id}/kyc` | wired — **custom** `queryFn` (same token rules as `tryLiveRead`; not listed in `LIVE_GET`) |

---

## B. Mutations wired in `adminApi.ts` (collection-aligned)

| RTK mutation | HTTP | Path pattern (`/api/v1/admin/…`) |
|--------------|------|-----------------------------------|
| `approveRoleApplication` | POST | `role-applications/{id}/approve` |
| `rejectRoleApplication` | POST | `role-applications/{id}/reject` (body `rejection_reason`) |
| `approveTalentProfile` | POST | `role-applications/{id}/approve` *(same route as collection; confirm id parity with talent rows — see §F)* |
| `rejectTalentProfile` | POST | `role-applications/{id}/reject` |
| `forceRefundOrder` | POST | `orders/{id}/force-refund` |
| `freezeAuction` / `cancelAuction` / `finalizeAuction` | POST | `auctions/{id}/freeze` \| `cancel` \| `finalize` |
| `suspendScanner` / `unsuspendScanner` | POST | `scanners/{id}/suspend` \| `unsuspend` |
| `createFeeAdjustment` | POST | `finance/fee-adjustments` (body `organizer_id`, `amount_sar`, `reason`, optional `reference`) |
| `approveOrganizerKycDocument` / `rejectOrganizerKycDocument` | POST | `finance/organizers/{id}/kyc/{docId}/approve` \| `reject` (reject: optional `rejection_reason`) |
| `triageComplaint` / `resolveComplaint` / `escalateComplaint` | POST | `complaints/{id}/triage` \| `resolve` (optional `resolution_note`) \| `escalate` |
| `executeAdminAction` | POST | `admin-actions` (JSON body — contract not in Postman export) |
| `approvePayout` / `rejectPayout` / `markPayoutProcessing` / `markPayoutPaid` / `markPayoutFailed` | POST | `finance/payouts/{id}/approve` \| `reject` (optional JSON `{ reason }` or `{}`) \| `mark-processing` \| `mark-paid` \| `mark-failed` |
| `suspendUser` | POST | `users/{id}/suspend` |
| `unsuspendUser` | POST | `users/{id}/unsuspend` |
| `impersonateUser` | POST | `users/{id}/impersonate` (response body backend-defined) |
| `cancelEvent` | POST | `events/{id}/reject` |
| `approveEvent` | POST | `events/{id}/approve` |
| `featureEvent` / `unfeatureEvent` | POST | `events/{id}/feature` \| `events/{id}/unfeature` |
| `upsertCategory` | PATCH / POST | `event-categories/{id}` \| `event-categories` |
| `toggleCategoryActive` | PATCH | `event-categories/{id}` (`{ is_active }`) |
| `deleteEventCategory` | DELETE | `event-categories/{id}` |
| `setFeaturedConfig` | POST | `featured-events/config` |
| `updateFeeConfiguration` | POST | `finance/fee-configurations` |
| `updateNotificationSettings` | PATCH | `notification-settings` (body `email_enabled`, `in_app_enabled`, `push_enabled`, `sms_enabled`, optional `reminder_offsets_hours`) |
| `sendTestNotification` | POST | `notifications/test` (JSON body — backend-defined) |
| `markListingModerationReviewed` | POST | `moderation-queue/{id}/approve` |
| `claimListingModeration` / `releaseListingModeration` | POST | `moderation-queue/{id}/claim` \| `…/release` |
| `rejectListingModeration` / `escalateListingModeration` | POST | `moderation-queue/{id}/reject` \| `…/escalate` |
| `hideRatingModeration` / `restoreRatingModeration` / `deleteRatingModeration` | POST | `ratings/{id}/hide` \| `…/restore` \| `…/delete` |
| `addSupportReply` | POST | `support-cases/{id}/messages` (`{ message }` or `{ body }`) |
| `updateSupportStatus` | POST | `support-cases/{id}/resolve` (body `resolution` and/or `resolution_note`) \| `…/assign` for `in_progress`; other statuses mock-only if no URL |
| `reopenSupportCase` | POST | `support-cases/{id}/reopen` (empty body) |

---

## C. Auth outside RTK (`adminPasswordReset.ts`)

| Flow | Method | Path |
|------|--------|------|
| Forgot password | POST | `/api/v1/admin/auth/password/forgot` (`{ email }`) |
| Reset password | POST | `/api/v1/admin/auth/password/reset` (`{ token, password }`) |

Uses `getApiBaseUrl()` (no bearer). Wired from [`ForgotPasswordPage.tsx`](../src/pages/auth/ForgotPasswordPage.tsx) and [`ResetPasswordPage.tsx`](../src/pages/auth/ResetPasswordPage.tsx).

---

## D. Gaps in the collection or contract (spec / backend)

1. **Platform counters (analytics page)** — `getPlatformCounters` remains **`null`** / mock-only; dashboard KPIs use **`getDashboardCounters`** instead (different semantics). Analytics UI notes this where relevant.
2. **Collection vs handoff** — Route contracts are aligned with **`docs/ADMIN_API_FRONTEND_HANDOFF.md`** when they differ from an older Postman export.
3. **Talent approve/reject ids** — Mutations may still target collection paths; confirm list row ids match backend expectations.
4. **Success (200) examples** — Many Postman items only store 401/error bodies; mappers stay defensive until real envelopes are documented.
5. **Deploy vs Postman** — Host may 404 until API version matches the export.
6. **Payout / refund / order / breakdown payloads** — Mappers accept several snake_case / envelope shapes; tighten Zod once real JSON is fixed.

---

## E. Product backlog — collection routes **not** fully covered (no dedicated screen and/or no RTK)

**Covered today (primary UI routes):** dashboard (counters + nested summary where used), role & talent approvals, **vendor + organizer profile directories** (`/approvals/vendors`, `/approvals/organizers`), users (**suspend, unsuspend, impersonate** on user detail), events (list, detail, **approve / feature / unfeature** on detail, categories + upsert/toggle/**delete**, featured desk, cancellation/reject), orders (list, detail, force refund), refunds list, refund breakdowns (read), payouts (list + payout lifecycle), **auctions (list, per-id detail, freeze / cancel / finalize)**, **scanners (list + suspend / unsuspend) and scan logs (read)**, **finance compliance (fee adjustments POST, organizer KYC GET + doc approve/reject)** on `/settings/finance-compliance`, **complaints (list + triage / resolve / escalate)** on `/complaints`, **admin-actions (GET catalog + POST with JSON body)** and **audit logs (list + per-id detail)** on `/activity`, analytics (financial + **live leaderboards** + mock-only **platform** counters), **listings moderation (queue + claim / release / approve / reject / escalate)** on `/moderation/listings`, **ratings (list + hide / restore / delete)** on `/moderation/ratings`, support inbox/thread (read + reply + resolve/assign + **reopen**), fees, **notifications (settings + recent + delivery log + test POST)** on `/settings/notifications`, **health + version** reads on `/settings/system`, profile, forgot/reset password.

**Still missing or only partially in app vs collection:** none of the former short-list items above (moderation extras, rating mutations, user unsuspend/impersonate, event approve/feature/unfeature, category DELETE) — those are now wired in RTK and surfaced in UI. Remaining uncertainty lives under **§D** (contract / deploy / mock-only analytics tiles) and **§F** (behavioural notes).

---

## F. Behavioural clarifications

- **Event cancel** — App uses `POST …/events/{id}/reject` for cancellation; confirm if a dedicated cancel route is required.
- **Support reopen** — Wired as `POST …/support-cases/{id}/reopen` (empty body); domain rules may return **422** if the case is not resolved/closed.
- **Payout reject** — Optional JSON `{ reason }` supported; `{}` remains valid.

---

## G. Postman hygiene (optional)

- Environment `baseUrl` aligned with `VITE_API_BASE_URL`.
- Bearer auth on protected admin requests in the collection.
