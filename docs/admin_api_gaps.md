# Admin Dashboard ↔ API — Gaps & Incompatibilities

> Generated from a full sweep of `src/services/adminApi.ts`, `src/schemas/`, `src/mock/fixtures.ts`, and `collection.json`.  
> **Send this document to the backend team** to align the API contract with what the admin dashboard requires.

---

## 1. Missing GET Endpoints (no route in Postman collection)

| Dashboard feature | Expected path | Status |
|---|---|---|
| Platform counters (analytics page — users by role, events by status, tickets sold, bookings, ratings) | `GET /api/v1/admin/analytics/platform-counters` | ❌ Not in collection |
| Dashboard pending-actions feed | `GET /api/v1/admin/dashboard/pending-actions` | ❌ Not in collection |
| Dashboard counters (flat KPI numbers) | `GET /api/v1/admin/dashboard/counters` | ❌ Not in collection |
| Dashboard summary (nested KPI object) | `GET /api/v1/admin/dashboard/summary` | ❌ Not in collection |
| Notification delivery log | `GET /api/v1/admin/notifications/delivery-log` | ❌ Not in collection |
| Recent notifications feed | `GET /api/v1/admin/notifications/recent` | ❌ Not in collection |
| Refund breakdowns view | `GET /api/v1/admin/finance/refund-breakdowns` | ❌ Not in collection |
| Organizer KYC documents | `GET /api/v1/admin/finance/organizers/:id/kyc` | ❌ Not in collection |
| Audit log detail | `GET /api/v1/admin/audit-logs/:id` | ❌ Not in collection |
| Admin health check | `GET /api/v1/admin/health` | ❌ Not in collection |
| Admin version | `GET /api/v1/admin/version` | ❌ Not in collection |

---

## 2. Missing POST / Mutation Endpoints (no route in Postman collection)

| Action | Expected path | Status |
|---|---|---|
| Approve role application | `POST /api/v1/admin/role-applications/:id/approve` | ❌ Not in collection |
| Reject role application | `POST /api/v1/admin/role-applications/:id/reject` | ❌ Not in collection |
| Approve talent profile | `POST /api/v1/admin/role-applications/:id/approve` | ❌ Not in collection (reuses role-applications path — confirm if correct) |
| Reject talent profile | `POST /api/v1/admin/role-applications/:id/reject` | ❌ Not in collection |
| Approve event | `POST /api/v1/admin/events/:id/approve` | ❌ Not in collection |
| Cancel / reject event | `POST /api/v1/admin/events/:id/reject` | ❌ Not in collection |
| Feature event | `POST /api/v1/admin/events/:id/feature` | ❌ Not in collection |
| Unfeature event | `POST /api/v1/admin/events/:id/unfeature` | ❌ Not in collection |
| Set featured events config | `POST /api/v1/admin/featured-events/config` | ❌ Not in collection |
| Create / update event category | `POST /api/v1/admin/event-categories` | ❌ Not in collection |
| Update event category | `PATCH /api/v1/admin/event-categories/:id` | ❌ Not in collection |
| Delete event category | `DELETE /api/v1/admin/event-categories/:id` | ❌ Not in collection |
| Toggle category active | `PATCH /api/v1/admin/event-categories/:id` (body: `is_active`) | ❌ Not in collection |
| Update fee configuration | `POST /api/v1/admin/finance/fee-configurations` | ❌ Not in collection |
| Create fee adjustment | `POST /api/v1/admin/finance/fee-adjustments` | ❌ Not in collection |
| Approve organizer KYC document | `POST /api/v1/admin/finance/organizers/:id/kyc/:docId/approve` | ❌ Not in collection |
| Reject organizer KYC document | `POST /api/v1/admin/finance/organizers/:id/kyc/:docId/reject` | ❌ Not in collection |
| Approve payout | `POST /api/v1/admin/finance/payouts/:id/approve` | ❌ Not in collection |
| Reject payout | `POST /api/v1/admin/finance/payouts/:id/reject` | ❌ Not in collection |
| Mark payout processing | `POST /api/v1/admin/finance/payouts/:id/mark-processing` | ❌ Not in collection |
| Mark payout paid | `POST /api/v1/admin/finance/payouts/:id/mark-paid` | ❌ Not in collection |
| Mark payout failed | `POST /api/v1/admin/finance/payouts/:id/mark-failed` | ❌ Not in collection |
| Force refund order | `POST /api/v1/admin/orders/:id/force-refund` | ❌ Not in collection |
| Freeze auction | `POST /api/v1/admin/auctions/:id/freeze` | ❌ Not in collection |
| Cancel auction | `POST /api/v1/admin/auctions/:id/cancel` | ❌ Not in collection |
| Finalize auction | `POST /api/v1/admin/auctions/:id/finalize` | ❌ Not in collection |
| Suspend scanner | `POST /api/v1/admin/scanners/:id/suspend` | ❌ Not in collection |
| Unsuspend scanner | `POST /api/v1/admin/scanners/:id/unsuspend` | ❌ Not in collection |
| Triage complaint | `POST /api/v1/admin/complaints/:id/triage` | ❌ Not in collection |
| Resolve complaint | `POST /api/v1/admin/complaints/:id/resolve` | ❌ Not in collection |
| Escalate complaint | `POST /api/v1/admin/complaints/:id/escalate` | ❌ Not in collection |
| Suspend user | `POST /api/v1/admin/users/:id/suspend` | ❌ Not in collection |
| Unsuspend user | `POST /api/v1/admin/users/:id/unsuspend` | ❌ Not in collection |
| Impersonate user | `POST /api/v1/admin/users/:id/impersonate` | ❌ Not in collection |
| Approve moderation queue item | `POST /api/v1/admin/moderation-queue/:id/approve` | ❌ Not in collection |
| Claim moderation queue item | `POST /api/v1/admin/moderation-queue/:id/claim` | ❌ Not in collection |
| Release moderation queue item | `POST /api/v1/admin/moderation-queue/:id/release` | ❌ Not in collection |
| Reject moderation queue item | `POST /api/v1/admin/moderation-queue/:id/reject` | ❌ Not in collection |
| Escalate moderation queue item | `POST /api/v1/admin/moderation-queue/:id/escalate` | ❌ Not in collection |
| Hide rating | `POST /api/v1/admin/ratings/:id/hide` | ❌ Not in collection |
| Restore rating | `POST /api/v1/admin/ratings/:id/restore` | ❌ Not in collection |
| Delete rating | `POST /api/v1/admin/ratings/:id/delete` | ❌ Not in collection |
| Add support reply | `POST /api/v1/admin/support-cases/:id/messages` | ❌ Not in collection |
| Resolve support case | `POST /api/v1/admin/support-cases/:id/resolve` | ❌ Not in collection |
| Assign support case (in_progress) | `POST /api/v1/admin/support-cases/:id/assign` | ❌ Not in collection |
| Reopen support case | `POST /api/v1/admin/support-cases/:id/reopen` | ❌ Not in collection |
| Update notification settings | `PATCH /api/v1/admin/notification-settings` | ❌ Not in collection |
| Send test notification | `POST /api/v1/admin/notifications/test` | ❌ Not in collection |
| Execute admin action | `POST /api/v1/admin/admin-actions` | ❌ Not in collection |
| Admin login | `POST /api/v1/admin/auth/login` | ❌ Not in collection (only `POST /api/v1/main/auth/login` exists) |
| Admin token refresh | `POST /api/v1/admin/auth/refresh` | ❌ Not in collection |
| Admin logout | `POST /api/v1/admin/auth/logout` | ❌ Not in collection |

---

## 3. Response Shape Incompatibilities

### 3.1 Login — `/api/v1/admin/auth/login`
The collection only documents `POST /api/v1/main/auth/login` (user-facing). The admin dashboard calls `POST /api/v1/admin/auth/login`.

**Admin dashboard expects one of these response shapes:**
```json
{ "access_token": "...", "refresh_token": "..." }
{ "token": "..." }
{ "data": { "access_token": "...", "refresh_token": "..." } }
{ "data": { "token": "..." } }
```
Also expects an optional `user` / `admin` / `profile` object inside `data` with `email`, `name`, `role`.

**Action needed:** Confirm the admin login endpoint path and document its response shape.

---

### 3.2 Dashboard — `/api/v1/admin/dashboard/summary` and `/counters`
Admin expects either a **flat counters object**:
```json
{
  "users_total": 0, "users_suspended": 0,
  "events_pending_approval": 0, "events_published": 0,
  "support_cases_open_pipeline": 0,
  "listing_moderation_queued_or_in_review": 0,
  "role_applications_submitted": 0,
  "payouts_held": 0
}
```
Or a **nested summary object**:
```json
{
  "users": { "total": 0, "suspended": 0 },
  "events": { "pending_approval": 0, "published": 0 },
  "support_cases": { "open_pipeline": 0 },
  "listing_moderation": { "queued_or_in_review": 0 },
  "role_applications": { "submitted": 0 },
  "payouts": { "held": 0 }
}
```
**Action needed:** Confirm which shape (or both) the API returns, and confirm the endpoint paths.

---

### 3.3 Pending Actions — `/api/v1/admin/dashboard/pending-actions`
Admin expects an array (or `{ items: [...] }` wrapper) of:
```json
{
  "id": "string",
  "kind": "role_application | talent_profile | support",
  "title": "string",
  "subtitle": "string",
  "href": "string",
  "priority": "high | normal",
  "image_url": "string",
  "due_label": "string"
}
```
**Action needed:** Confirm this endpoint exists and document its response shape.

---

### 3.4 Financial Analytics — `/api/v1/admin/analytics/financial`
Admin expects:
```json
{
  "total_revenue_sar": 0,
  "platform_fees_sar": 0,
  "refunds_sar": 0,
  "payouts_pending_sar": 0,
  "revenue_by_day": [{ "date": "YYYY-MM-DD", "revenue_sar": 0 }],
  "revenue_breakdown_by_category": [{ "category_key": "string", "label": "string", "revenue_sar": 0 }]
}
```
Also accepts `orders_paid_total_amount` and `refunds_processed_total_amount` as alternatives.  
Accepts optional `range` query param (`7d`, `30d`, `90d`).

**Action needed:** Confirm the response shape and whether `?range=` is supported.

---

### 3.5 Analytics Leaderboards — `/api/v1/admin/analytics/leaderboards`
Admin expects:
```json
{
  "events": [{ "id": "string", "code": "string", "title": "string", "revenue_gross": "string", "status": "string", "organizer_id": "string" }],
  "organizers": [{ "organizer_id": "string", "total_revenue_gross": 0, "display_name": "string", "slug": "string", "code": "string" }],
  "generated_at": "ISO8601"
}
```
**Action needed:** Confirm this endpoint exists and document its response shape.

---

### 3.6 Platform Counters — No confirmed endpoint
The analytics page shows user counts by role, event counts by status, total tickets sold, bookings, and ratings. There is **no confirmed API path** for this data.

**Action needed:** Either add `GET /api/v1/admin/analytics/platform-counters` returning:
```json
{
  "users_by_role": { "guest": 0, "talent": 0, "vendor": 0, "organizer": 0 },
  "events_by_status": { "active": 0, "ended": 0, "cancelled": 0, "archived": 0 },
  "tickets_sold": 0,
  "bookings": 0,
  "ratings": 0
}
```
Or fold these counters into the existing dashboard summary/counters endpoint.

---

### 3.7 Talent Profiles — `/api/v1/admin/profiles/talents`
Admin expects these fields per talent row. Several are not standard user fields and may not be present:

| Field | Notes |
|---|---|
| `stage_name` | May be in a nested profile object |
| `legal_name` | May be `full_name` on the user object |
| `genres` | Array of strings — confirm field name |
| `years_experience` | Confirm field name |
| `intro_video_url` | Confirm field name |
| `headshot_url` | Confirm field name |
| `portfolio_pdf_url` | Confirm field name |
| `government_id_status` | `pending \| verified \| rejected` |
| `bank_verified` | Boolean |
| `media_quality_note` | Admin-only note field — confirm it exists |
| `certificates_summary` | Admin-only summary — confirm it exists |

**Action needed:** Document the full talent profile response shape for the admin endpoint.

---

### 3.8 Organizer KYC — `/api/v1/admin/finance/organizers/:id/kyc`
Admin expects:
```json
{
  "organizer_id": "string",
  "organizer_name": "string",
  "documents": [{
    "id": "string",
    "label": "string",
    "doc_type": "cr | bank | id | other",
    "status": "pending | approved | rejected | unknown",
    "uploaded_at": "ISO8601",
    "file_url": "string"
  }]
}
```
**Action needed:** Confirm this endpoint exists and document its response shape.

---

### 3.9 Support Cases — `/api/v1/admin/support-cases`
Admin expects `user_email` on each thread. If the API returns a nested `user` object, the mapper will attempt to extract it, but this should be confirmed.

Admin also expects `messages` array on the detail endpoint (`GET /api/v1/admin/support-cases/:id`):
```json
[{ "id": "string", "author": "user | admin", "body": "string", "sent_at": "ISO8601" }]
```
**Action needed:** Confirm `author` field values (`user` vs `admin`) and the messages array field name.

---

### 3.10 Event Categories — `/api/v1/admin/event-categories`
Admin expects `icon_key` and `color_token` fields per category. These are UI-specific fields that may not exist in the backend model.

**Action needed:** Confirm whether `icon_key` and `color_token` are stored and returned by the API, or if they are frontend-only.

---

### 3.11 Notification Settings — `/api/v1/admin/notification-settings`
Admin sends `PATCH` with:
```json
{
  "email_enabled": true,
  "in_app_enabled": true,
  "push_enabled": false,
  "sms_enabled": false,
  "reminder_offsets_hours": [24, 3]
}
```
And expects the same shape back on `GET`.

**Action needed:** Confirm the endpoint accepts `PATCH` (not `PUT`) and document the response shape.

---

### 3.12 Refund Breakdowns — `/api/v1/admin/finance/refund-breakdowns`
Admin expects:
```json
{
  "total_refunded_sar": 0,
  "rows": [{ "key": "string", "label": "string", "amount_sar": 0, "refund_count": 0 }]
}
```
**Action needed:** Confirm this endpoint exists and document its response shape.

---

## 4. Auth Flow Gaps

| Issue | Detail |
|---|---|
| Admin login path | Collection only has `POST /api/v1/main/auth/login`. Admin dashboard calls `POST /api/v1/admin/auth/login`. Confirm the admin-specific path. |
| Token refresh | Admin dashboard calls `POST /api/v1/admin/auth/refresh` with `Authorization: Bearer <token>`. Expects `{ "token": "..." }` or `{ "data": { "token": "..." } }`. Confirm this endpoint exists. |
| Logout | Admin dashboard calls `POST /api/v1/admin/auth/logout` with bearer token. Confirm this endpoint exists. |
| Role check | After login, the admin dashboard checks that the returned user has `role === "admin"`. Confirm the login response includes a `role` field (or nested `user.role`). |

---

## 5. Pagination

All list endpoints (`/users`, `/events`, `/orders`, `/refunds`, `/payouts`, `/auctions`, `/complaints`, `/support-cases`, `/role-applications`, `/moderation-queue`, `/ratings`, `/scanners`, `/scan-logs`, `/audit-logs`, `/admin-actions`) currently load all records in a single request.

The admin dashboard mappers handle both plain arrays and `{ data: [...], total, current_page, last_page }` Laravel-style pagination envelopes.

**Action needed:** Confirm whether these endpoints are paginated. If so, document the pagination query params (`page`, `per_page` / `limit`) and the response envelope shape. The frontend will need pagination UI added if server-side pagination is required.

---

## 6. Summary Table

| Category | Count |
|---|---|
| Missing GET endpoints | 11 |
| Missing POST/PATCH/DELETE mutation endpoints | 49 |
| Response shape clarifications needed | 12 |
| Auth flow gaps | 4 |
| Pagination clarification needed | 14 list endpoints |
