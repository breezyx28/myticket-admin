# Admin dashboard API — frontend handoff

This document aligns the **admin dashboard** client (`adminApi.ts`, schemas, mocks) with the **actual Laravel API** mounted at `/api/v1/admin`. It supersedes misleading “missing endpoint” rows that were inferred from an outdated Postman `collection.json` (see [admin_api_gaps.md](admin_api_gaps.md)).

**Canonical contract:** [routes/api_admin.php](routes/api_admin.php). Regenerate Postman / OpenAPI / Scribe from the codebase so `collection.json` stays in sync.

**Auth stack:** Sanctum personal access tokens. Admin routes (except public `health`, `version`, and unauthenticated `auth/login` + password reset) expect a token whose ability includes **`app:admin_dashboard`** (`app.scope:admin_dashboard` middleware). The logged-in user must have role allowed for that app (typically `admin` for dashboard operations).

---

## 1. Base URL

| Base | Example |
|------|---------|
| `https://{host}/api/v1/admin` | `GET /api/v1/admin/health` |

All paths below are relative to `/api/v1/admin`.

---

## 2. Authentication

### 2.1 Login

**`POST /auth/login`**

Body: same as main app — `email` + `password` (see `LoginRequest`).

**Success response (200)** — top-level fields (**not** wrapped in `data`):

```json
{
  "token": "<sanctum-plain-text-token>",
  "refresh_token": null,
  "expires_at": "2026-05-12T12:00:00+00:00",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

**Frontend actions:**

- Read **`token`** (not `access_token`). If the client expects `access_token`, normalize in one adapter layer.
- `refresh_token` is currently always **`null`**; do not assume refresh-token rotation unless the backend adds it later.
- After login, assert **`user.role === "admin"`** (or your allowed roles) before enabling admin UI.

**2FA challenge (200):** if the user has 2FA enabled and `otp` is omitted, the API may return `{ "challenge_token": "ch_...", "two_factor_required": true }` instead of a token — handle like the main app.

### 2.2 Refresh

**`POST /auth/refresh`** (requires `Authorization: Bearer <token>` with admin scope)

**Response:**

```json
{
  "token": "<new-plain-text-token>"
}
```

No `data` wrapper. Replace the stored access token with this value.

### 2.3 Logout

**`POST /auth/logout`**

**Response:**

```json
{
  "message": "Logged out."
}
```

### 2.4 Other auth routes (admin prefix)

| Method | Path | Notes |
|--------|------|------|
| POST | `/auth/oauth/{provider}/callback` | Same `AuthController` with `admin_dashboard` app |
| POST | `/auth/password/forgot` | Shared |
| POST | `/auth/password/reset` | Shared |

---

## 3. “Missing GET” from gaps doc — corrected

| What the gaps doc expected | What to call instead |
|----------------------------|----------------------|
| `GET /analytics/platform-counters` | **`GET /dashboard/counters`** — same KPI idea (flat keys inside `data`). There is **no** separate `/analytics/platform-counters` route today. |
| `GET /dashboard/pending-actions` | Exists: **`GET /dashboard/pending-actions`** |
| `GET /dashboard/counters` | Exists: **`GET /dashboard/counters`** |
| `GET /dashboard/summary` | Exists: **`GET /dashboard/summary`** |
| `GET /notifications/recent` | Exists |
| `GET /notifications/delivery-log` | Exists |
| `GET /finance/refund-breakdowns` | Exists — see §5.4 (shape is paginated rows, not a single aggregate). |
| `GET /finance/organizers/{id}/kyc` | Exists — returns **JSON array** of documents; see §5.5. |
| `GET /audit-logs/{id}` | Exists |
| `GET /health` | Exists — small JSON status payload |
| `GET /version` | Exists — API version metadata |

---

## 4. “Missing mutations” from gaps doc — corrected

These are registered in [routes/api_admin.php](routes/api_admin.php). Path prefix `/api/v1/admin` omitted in the table.

| Area | Method | Path |
|------|--------|------|
| Role applications | GET, POST | `/role-applications`, `/role-applications/{id}/approve`, `/reject`, `/request-changes` |
| Profiles | GET, POST | `/profiles/talents`, `/profiles/talents/{id}`, `/profiles/vendors`, `/profiles/organizers`, `/profiles/{type}/{id}/suspend`, `/unsuspend`, `/verify-government-id` (`type` = `talents` \| `vendors` \| `organizers`) |
| Events | GET, POST | `/events`, `/events/{id}`, `/events/{id}/approve`, `/reject`, `/feature`, `/unfeature` |
| Event categories | GET, POST, PATCH, DELETE | `/event-categories`, `/event-categories/{id}` |
| Dashboard | GET | `/dashboard/summary`, `/dashboard/pending-actions`, `/dashboard/counters` |
| Analytics | GET | `/analytics/financial?range=…`, `/analytics/leaderboards` |
| Orders / refunds | GET, POST | `/orders`, `/orders/{id}`, `/orders/{id}/force-refund`, `/refunds` |
| Auctions | GET, POST | `/auctions`, `/auctions/{id}`, `/freeze`, `/cancel`, `/finalize` |
| Scanners | GET, POST | `/scanners`, `/scanners/{id}/suspend`, `/unsuspend`, `/scan-logs` |
| Finance | GET, POST | `/finance/fee-configurations`, `POST /fee-configurations`, `/payouts`, payout state transitions, `/refund-breakdowns`, `POST /fee-adjustments`, `/organizers/{id}/kyc`, KYC approve/reject |
| Ratings | GET, POST | `/ratings`, `/ratings/{id}/hide`, `/restore`, `/delete` |
| Notifications | GET, POST | `/notifications/recent`, `/delivery-log`, `POST /test` |
| Support | GET, POST | `/support-cases`, `/support-cases/{id}`, messages, assign, resolve, reopen, escalate |
| Complaints | GET, POST | `/complaints`, `/complaints/{id}/triage`, `/resolve`, `/escalate` |
| Moderation queue | GET, POST | `/moderation-queue`, `/{id}/claim`, `/release`, `/approve`, `/reject`, `/escalate` |
| Admin actions | GET, POST | `/admin-actions`, `POST /` |
| Notification settings | GET, POST, PATCH | `/notification-settings` (POST and PATCH both hit update handler) |
| Featured events | GET, POST | `/featured-events/config` (GET + POST), `/featured-events/{eventId}/pin`, `/unpin` |
| Audit logs | GET | `/audit-logs`, `/audit-logs/{id}` |
| Users | GET, POST | `/users`, `/users/{id}`, `/suspend`, `/unsuspend`, `/impersonate` |

**Featured events nuance:** configuration is **`GET /featured-events/config`** and **`POST /featured-events/config`** (not a differently named “set” path).

---

## 5. Response shapes and frontend mapping

### 5.1 Dashboard summary — `GET /dashboard/summary`

**Envelope:**

```json
{
  "data": {
    "users": { "total": 0, "suspended": 0 },
    "events": { "pending_approval": 0, "published": 0 },
    "support_cases": { "open_pipeline": 0 },
    "listing_moderation": { "queued_or_in_review": 0 },
    "role_applications": { "submitted": 0 },
    "payouts": { "held": 0 }
  }
}
```

There is **no** flat variant on this route. For flat KPI tiles use **`GET /dashboard/counters`** (below).

### 5.2 Dashboard counters — `GET /dashboard/counters`

```json
{
  "data": {
    "users_total": 0,
    "users_suspended": 0,
    "events_pending_approval": 0,
    "events_published": 0,
    "support_cases_open_pipeline": 0,
    "listing_moderation_queued_or_in_review": 0,
    "role_applications_submitted": 0,
    "payouts_held": 0
  }
}
```

### 5.3 Pending actions — `GET /dashboard/pending-actions`

**Actual shape:** grouped lists (max 10 each), not a unified `items[]` with `kind` / `href`.

```json
{
  "data": {
    "events_pending_approval": [
      { "id": 1, "code": "EVT-…", "title": "…", "status": "pending_approval", "submitted_at": "…" }
    ],
    "role_applications_submitted": [
      { "id": 1, "user_id": 1, "status": "submitted", "submitted_at": "…", "applicant": { "id": 1, "email": "…", "full_name": "…" } }
    ],
    "support_cases_open": [
      { "id": 1, "code": "…", "subject": "…", "status": "open", "priority": "normal", "created_at": "…" }
    ],
    "listing_moderation_queue": [
      { "id": 1, "listing_kind": "…", "status": "queued", "flag_reason": "…", "created_at": "…" }
    ]
  }
}
```

**Frontend solution:** Build your UI cards locally: for each bucket, map rows to `{ kind, title, subtitle, href, priority, … }`. Deep links can follow your admin routes (e.g. `/admin/events/{id}`, `/admin/role-applications/{id}`).

### 5.4 Financial analytics — `GET /analytics/financial`

Query: **`range`** — supported values drive day window in [AdminDashboardController::financialAnalytics](app/Http/Controllers/Api/V1/Admin/Dashboard/AdminDashboardController.php): `24h`, `1d` → 1 day; `30d` → 30; `90d` → 90; **default** → **7d**.

**Actual `data` fields today:**

```json
{
  "data": {
    "range": "7d",
    "since": "2026-05-04T00:00:00+00:00",
    "orders_paid_total_amount": 0,
    "refunds_processed_total_amount": 0,
    "orders_paid_count": 0
  }
}
```

**Not implemented on this endpoint:** `revenue_by_day[]`, `revenue_breakdown_by_category[]`, `total_revenue_sar` as separate aliases. **Frontend solution:** Chart from the three numeric fields above, or request a future backend extension for time series / category breakdown.

### 5.5 Leaderboards — `GET /analytics/leaderboards`

```json
{
  "data": {
    "events": [
      {
        "id": 1,
        "code": "EVT-…",
        "title": "…",
        "revenue_gross": "1234.56",
        "status": "published",
        "organizer_id": 1
      }
    ],
    "organizers": [
      {
        "organizer_id": 1,
        "total_revenue_gross": 1234.56,
        "display_name": "…",
        "slug": "…",
        "code": "…"
      }
    ],
    "generated_at": "2026-05-11T12:00:00+00:00"
  }
}
```

**Frontend:** IDs are JSON numbers; if TypeScript schemas use `string`, coerce in the mapper.

### 5.6 Refund breakdowns — `GET /finance/refund-breakdowns`

Returns **Laravel pagination** of **`refund_breakdowns`** table rows (not `{ total_refunded_sar, rows: [] }`).

Each row (see migration `2026_05_06_010908_create_refund_breakdowns_table.php`):

| Field | Type | Notes |
|-------|------|------|
| `id` | int | |
| `payout_id` | int | FK |
| `reason` | string enum | `event_cancelled`, `event_significant_change`, `seat_conflict`, `duplicate_purchase`, `fraud`, `support_escalation`, `other` |
| `amount` | decimal string | |
| `refund_count` | int | |
| `created_at` | datetime | |

**Pagination:** standard Laravel shape at **top level** (`current_page`, `data`, `first_page_url`, `last_page_url`, `per_page`, `total`, …). Use `?page=` to navigate.

**Frontend solution:** Either adapt the finance “breakdown” UI to this list + totals computed client-side, or negotiate a dedicated aggregate endpoint later.

### 5.7 Organizer KYC — `GET /finance/organizers/{id}/kyc`

Returns a **JSON array** of `OrganizerKycDocument` models **with no `{ data: … }` wrapper**.

Document fields (migration `organizer_kyc_documents`):

| Field | Notes |
|-------|------|
| `id`, `organizer_profile_id` | |
| `document_type` | `commercial_registration`, `vat_certificate`, `national_address`, `owner_id`, `tax_card`, `other` |
| `document_label` | optional |
| `document_url` | file URL |
| `issued_on`, `expires_on` | dates |
| `status` | `pending`, `verified`, `rejected` |
| `reviewed_at`, `reviewed_by`, `rejection_reason` | |
| `created_at`, `updated_at` | |

**Frontend solution:** Wrap in `{ organizer_id, documents }` on the client; fetch organizer display name via **`GET /profiles/organizers`** or your organizer cache if needed.

**Mutations:** `POST /finance/organizers/{id}/kyc/{docId}/approve` and `…/reject` (reject: send `reason` as needed — see controller).

### 5.8 Event categories — `GET|POST /event-categories`, `PATCH|DELETE /event-categories/{id}`

Index is **paginated** (50 per page). Store/update accept optional:

- `icon_key` (string, max 80)
- `color_token` (string, max 40)

So those UI fields **can** be persisted when provided.

### 5.9 Talent profiles — `GET /profiles/talents`, `GET /profiles/talents/{id}`

**List:** paginated `TalentProfile` rows (top-level paginator).

**Detail:** `GET /profiles/talents/{id}` returns:

```json
{
  "data": { "...talent_profile columns...", "user": { }, "application": { }, "categories": [ ], "gallery": [ ] }
}
```

**Column reality check** (vs gaps doc):

| UI / gaps field | Where it lives |
|-----------------|----------------|
| `stage_name` | `TalentProfile.stage_name` |
| `legal_name` | **`talentApplication.legal_name`** on detail (`application` relation), not on list row |
| `full_name` (legal display) | Often **`user.full_name`** on detail |
| `genres` | Derive from **`categories`** → join to talent category names/slugs (relation `TalentProfileCategory`) |
| `years_experience`, `headshot_url`, `portfolio_pdf_url`, `media_quality_note`, `government_id_status`, `bank_verified` | On **`TalentApplication`** (`application` on detail), not on `TalentProfile` table |
| `intro_video_url`, `profile_image_url` | On **`TalentProfile`** |
| `certificates_summary` | Backend has **`certificate_name`** on application — map or extend API later if you need a longer summary |

### 5.10 Support cases — list and detail

**List:** `GET /support-cases` — paginated `SupportCase` at top level. Each case has `user_id`; include **`user.email`** in UI by eager-loading on the client only if the API adds `with('user')` on index — **today list endpoint does not eager-load `user`**. Prefer **`GET /support-cases/{id}`** for mailbox UI (detail loads `user`).

**Detail:** `GET /support-cases/{id}` → `{ "data": { …case, "messages": [ … ] } }`.

**Messages:** model uses:

| Field | Meaning |
|-------|--------|
| `id` | |
| `sender_role` | **`user` \| `agent` \| `admin` \| `system`** (enum in DB) |
| `sender_user_id` | nullable |
| `body` | |
| `created_at` | |

**Frontend mapping to `{ author: "user" \| "admin" }`:**

- Map `sender_role === "user"` → `author: "user"`.
- Map `sender_role` in `admin`, `agent`, `system"` → `author: "admin"` (or split agent/system if your UI needs it).

**Post message:** `POST /support-cases/{id}/messages` with JSON **`{ "body": "..." }`** or **`{ "message": "..." }`** (either key accepted).

**Resolve:** `POST /support-cases/{id}/resolve` with **`resolution`** or **`resolution_note`** (at least one required).

**Assign:** `POST /support-cases/{id}/assign` with **`{ "admin_id": <user id> }`**.

**Complaints:** `POST /complaints/{id}/triage` requires **`{ "action": "accept" | "dismiss" }`**. Resolve requires **`{ "resolution": "…" }`**.

### 5.11 Notification settings — `GET|POST|PATCH /notification-settings`

**GET** returns:

```json
{
  "active": { …NotificationSettingsHistory row or null },
  "history": [ …up to 20 rows… ]
}
```

**Not** the same as `{ email_enabled, … }` only — the **current** settings are under **`active`**.

**POST / PATCH** body (validated):

```json
{
  "email_enabled": true,
  "in_app_enabled": true,
  "push_enabled": false,
  "sms_enabled": false,
  "reminder_offsets_hours": [24, 3],
  "notes": "optional string"
}
```

**Response:** `{ "data": <new NotificationSettingsHistory row> }` with **201** on create.

**Frontend:** After save, re-`GET` and map `active` to your form state.

### 5.12 Notifications test — `POST /notifications/test`

**Response:** `{ "message": "Synthetic notification health check written." }` — does not send email to a user; it writes a **`system_health_checks`** row for ops visibility.

### 5.13 Impersonation — `POST /users/{id}/impersonate`

**Response:**

```json
{
  "token": "<token>",
  "expires_in_minutes": 30
}
```

Use this token only in a controlled support flow; it is not the same as admin refresh.

---

## 6. Pagination

Most admin **list** endpoints use **`paginate()`** and accept the standard **`page`** query parameter. Default **`per_page`** varies (15 is Laravel default unless overridden in code — this API sets explicit sizes on many controllers, e.g. 20, 30, 50).

**Response shapes:**

1. **Top-level paginator** (most lists): the JSON root is the paginator object (`data` key here means **the current page’s rows**, not a generic envelope):

```json
{
  "current_page": 1,
  "data": [ …rows… ],
  "first_page_url": "…",
  "from": 1,
  "last_page": 5,
  "last_page_url": "…",
  "links": [ ],
  "next_page_url": "…",
  "path": "…",
  "per_page": 20,
  "prev_page_url": null,
  "to": 20,
  "total": 100
}
```

2. **Wrapped paginator:** **`GET /role-applications`** returns:

```json
{
  "data": {
    "current_page": 1,
    "data": [ … ],
    "…": "…same pagination meta…"
  }
}
```

**Frontend:** Normalize both shapes in one helper: if `response.data` is an array, treat as raw list; if `response.data.current_page` exists, treat as nested pagination; if `response.current_page` exists, treat as top-level pagination.

---

## 7. Appendix — route quick index

Public (no auth):

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/version` |
| POST | `/auth/login` |
| POST | `/auth/oauth/{provider}/callback` |
| POST | `/auth/password/forgot` |
| POST | `/auth/password/reset` |

Authenticated (`auth:sanctum` + `app.scope:admin_dashboard`):

| Method | Path |
|--------|------|
| POST | `/auth/logout` |
| POST | `/auth/refresh` |
| GET | `/role-applications` |
| GET | `/role-applications/{id}` |
| POST | `/role-applications/{id}/approve` |
| POST | `/role-applications/{id}/reject` |
| POST | `/role-applications/{id}/request-changes` |
| GET | `/profiles/talents` |
| GET | `/profiles/talents/{id}` |
| GET | `/profiles/vendors` |
| GET | `/profiles/organizers` |
| POST | `/profiles/{type}/{id}/suspend` |
| POST | `/profiles/{type}/{id}/unsuspend` |
| POST | `/profiles/{type}/{id}/verify-government-id` |
| GET | `/events` |
| GET | `/events/{id}` |
| POST | `/events/{id}/approve` |
| POST | `/events/{id}/reject` |
| POST | `/events/{id}/feature` |
| POST | `/events/{id}/unfeature` |
| GET | `/event-categories` |
| POST | `/event-categories` |
| PATCH | `/event-categories/{id}` |
| DELETE | `/event-categories/{id}` |
| GET | `/dashboard/summary` |
| GET | `/dashboard/pending-actions` |
| GET | `/dashboard/counters` |
| GET | `/analytics/financial` |
| GET | `/analytics/leaderboards` |
| GET | `/orders` |
| GET | `/orders/{id}` |
| POST | `/orders/{id}/force-refund` |
| GET | `/refunds` |
| GET | `/auctions` |
| GET | `/auctions/{id}` |
| POST | `/auctions/{id}/freeze` |
| POST | `/auctions/{id}/cancel` |
| POST | `/auctions/{id}/finalize` |
| GET | `/scanners` |
| POST | `/scanners/{id}/suspend` |
| POST | `/scanners/{id}/unsuspend` |
| GET | `/scan-logs` |
| GET | `/finance/fee-configurations` |
| POST | `/finance/fee-configurations` |
| GET | `/finance/payouts` |
| POST | `/finance/payouts/{id}/approve` |
| POST | `/finance/payouts/{id}/reject` |
| POST | `/finance/payouts/{id}/mark-processing` |
| POST | `/finance/payouts/{id}/mark-paid` |
| POST | `/finance/payouts/{id}/mark-failed` |
| GET | `/finance/refund-breakdowns` |
| POST | `/finance/fee-adjustments` |
| GET | `/finance/organizers/{id}/kyc` |
| POST | `/finance/organizers/{id}/kyc/{docId}/approve` |
| POST | `/finance/organizers/{id}/kyc/{docId}/reject` |
| GET | `/ratings` |
| POST | `/ratings/{id}/hide` |
| POST | `/ratings/{id}/restore` |
| POST | `/ratings/{id}/delete` |
| GET | `/notifications/recent` |
| GET | `/notifications/delivery-log` |
| POST | `/notifications/test` |
| GET | `/support-cases` |
| GET | `/support-cases/{id}` |
| POST | `/support-cases/{id}/reopen` |
| POST | `/support-cases/{id}/assign` |
| POST | `/support-cases/{id}/messages` |
| POST | `/support-cases/{id}/resolve` |
| POST | `/support-cases/{id}/escalate` |
| GET | `/complaints` |
| POST | `/complaints/{id}/triage` |
| POST | `/complaints/{id}/resolve` |
| POST | `/complaints/{id}/escalate` |
| GET | `/moderation-queue` |
| POST | `/moderation-queue/{id}/claim` |
| POST | `/moderation-queue/{id}/release` |
| POST | `/moderation-queue/{id}/approve` |
| POST | `/moderation-queue/{id}/reject` |
| POST | `/moderation-queue/{id}/escalate` |
| GET | `/admin-actions` |
| POST | `/admin-actions` |
| GET | `/notification-settings` |
| POST | `/notification-settings` |
| PATCH | `/notification-settings` |
| GET | `/featured-events/config` |
| POST | `/featured-events/config` |
| POST | `/featured-events/{eventId}/pin` |
| POST | `/featured-events/{eventId}/unpin` |
| GET | `/audit-logs` |
| GET | `/audit-logs/{id}` |
| GET | `/users` |
| GET | `/users/{id}` |
| POST | `/users/{id}/suspend` |
| POST | `/users/{id}/unsuspend` |
| POST | `/users/{id}/impersonate` |

---

## 8. Summary for product / FE lead

| Topic | Situation |
|-------|-----------|
| “Missing” routes in gaps doc | **Most exist**; gaps were traced to stale **Postman collection**, not Laravel. |
| Platform-wide analytics slice | Use **`GET /dashboard/counters`** instead of a fictional `/analytics/platform-counters`. |
| Pending actions UX | API returns **four buckets**; FE builds unified feed if needed. |
| Financial charts | **No daily series** in API yet; only totals + count for configurable ranges. |
| Refund breakdowns | **Paginated ledger rows**, not one aggregate JSON. |
| KYC GET | **Raw array**; wrap on client. |
| Auth JSON | **`token`** at root; **`refresh_token`** null; refresh returns **`{ token }`**. |
| Pagination | **Two envelope styles**; normalize `role-applications` vs others. |

When the backend adds fields or aliases, update this file and regenerate exported API docs from [routes/api_admin.php](routes/api_admin.php).
