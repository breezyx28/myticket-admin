# Admin API — frontend handoff (new & contract-critical endpoints)

**Base path:** `/api/v1/admin`  
**Content-Type:** `application/json` (unless noted)  
**Auth:** `Authorization: Bearer <sanctum_token>` on all routes below except **public auth** and **`/health`**, **`/version`**.

**Important:** Authenticated admin routes use middleware **`app.scope:admin_dashboard`**. The token must include Sanctum ability **`app:admin`** (issued via **`POST /api/v1/admin/auth/login`**). Tokens from other apps (main/organizer/scanner) receive **403 Forbidden**.

---

## 1. Public (no bearer)

| Method | Path | Body (JSON) | Success response |
|--------|------|-------------|------------------|
| GET | `/health` | — | `{ "app": "admin_dashboard", "status": "ok", "version": "v1", "time": "<ISO8601>" }` |
| GET | `/version` | — | `{ "app": "admin_dashboard", "api_version": "v1", "phase": "..." }` |
| POST | `/auth/login` | Per [`LoginRequest`](app/Http/Requests/Auth/LoginRequest.php): `email` **or** `phone`, `password` required; `otp` optional | `{ "token", "expires_at", "user": { "id", "email", "full_name", "role", ... } }` |
| POST | `/auth/password/forgot` | Per forgot-password rules (typically `email`) | `{ "message": "..." }` |
| POST | `/auth/password/reset` | Per reset-password rules (`token`, `password`, …) | `{ "message": "..." }` |

---

## 2. Authenticated auth

| Method | Path | Body | Success response |
|--------|------|------|------------------|
| POST | `/auth/logout` | — | Per [`AuthController`](app/Http/Controllers/Api/V1/Auth/AuthController.php) |
| POST | `/auth/refresh` | *(none — uses Bearer only)* | `{ "token": "<new_plain_text_token>" }` |

---

## 3. Dashboard & analytics

### GET `/dashboard/counters`

**Query:** none  

**200** — flat counters for tiles (same underlying counts as `/dashboard/summary`):

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

### GET `/dashboard/summary`

**Query:** none  

**200** — nested shape:

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

### GET `/dashboard/pending-actions`

**Query:** none  

**200** — `data` contains arrays of recent rows (events pending approval, role applications with `applicant`, support cases, listing moderation queue). See [`AdminDashboardController::pendingActions`](app/Http/Controllers/Api/V1/Admin/Dashboard/AdminDashboardController.php).

### GET `/analytics/financial`

**Query params:**

| Param | Values | Default |
|-------|--------|---------|
| `range` | `7d` (default window), `24h` / `1d` (1 day), `30d`, `90d` | `7d` |

**200:**

```json
{
  "data": {
    "range": "7d",
    "since": "<ISO8601 start of window>",
    "orders_paid_total_amount": 0,
    "refunds_processed_total_amount": 0,
    "orders_paid_count": 0
  }
}
```

### GET `/analytics/leaderboards`

**Query:** none  

**200** — GMV-style rankings (top 10 each):

```json
{
  "data": {
    "events": [
      {
        "id": 0,
        "code": "",
        "title": "",
        "revenue_gross": "0.00",
        "status": "",
        "organizer_id": 0
      }
    ],
    "organizers": [
      {
        "organizer_id": 0,
        "total_revenue_gross": 0,
        "display_name": "",
        "slug": "",
        "code": ""
      }
    ],
    "generated_at": "<ISO8601>"
  }
}
```

`events` rows are full `Event` model attributes for selected columns; numeric fields may be strings for decimals per Laravel casts.

---

## 4. Profiles & users

### GET `/profiles/talents/{id}`

**Path:** `id` = talent profile primary key (integer).  

**200:**

```json
{
  "data": {
    "id": 0,
    "user_id": 0,
    "...": "TalentProfile fields",
    "user": {},
    "application": {},
    "categories": [],
    "gallery": []
  }
}
```

### GET `/users/{id}`

**200:** `{ "data": <User with preferences, security> }` (`password_hash` hidden).

### POST `/users/{id}/suspend`

**JSON body (all optional):**

| Field | Type | Rules |
|-------|------|--------|
| `reason` | string | nullable, max 500 |
| `permanent` | boolean | nullable |

**200:** `{ "data": <User after suspend> }` — persisted fields include `is_suspended`, `suspended_at`, `suspended_by`, `suspension_reason`, `suspension_is_permanent` when provided.

---

## 5. Events & categories

### GET `/events/{id}`

**200:** `{ "data": <Event with organizer, category, occurrences> }`

### GET `/event-categories`

**200:** Laravel paginator JSON for `EventCategory` rows.

### POST `/event-categories` / PATCH `/event-categories/{id}` / DELETE `/event-categories/{id}`

See [`AdminEventCategoriesController`](app/Http/Controllers/Api/V1/Admin/Events/AdminEventCategoriesController.php) for validation rules (`slug`, `name_en`, `name_ar`, …).

---

## 6. Auctions

### GET `/auctions/{id}`

**200:**

```json
{
  "data": {
    "id": 0,
    "status": "active|sold|cancelled|expired|removed",
    "...": "AuctionListing fields",
    "event": {},
    "ticket": {},
    "seller": {},
    "buyer": {},
    "transactions": []
  }
}
```

### POST `/auctions/{id}/finalize`

**Body:** none  

**200:** `{ "data": <AuctionListing after finalize> }` when listing **`status === "active"`**.

**422** when status is not `active`:

```json
{
  "message": "Finalize is only allowed when the auction listing status is active. Current status: <status>."
}
```

Use listing **`status`** from GET detail or list — DB has no `ended`; finalize only applies to **`active`**.

---

## 7. Finance — payout reject

### POST `/finance/payouts/{id}/reject`

**JSON body (optional):**

| Field | Type | Rules |
|-------|------|--------|
| `reason` | string | when key present: nullable, max 500 (`sometimes`) |

Empty `{}` is allowed; `reason` defaults to empty string for the payout transition.

**200:** JSON from [`PayoutService::transition`](app/Domains/Payouts/Services/PayoutService.php) (payout payload).

---

## 8. Support cases

### GET `/support-cases/{id}`

**200:**

```json
{
  "data": {
    "id": 0,
    "user": {},
    "assignedAdmin": {},
    "relatedOrder": {},
    "relatedEvent": {},
    "relatedTicket": {},
    "messages": []
  }
}
```

### POST `/support-cases/{id}/messages`

**JSON (one of):**

| Field | Required |
|-------|----------|
| `body` | text if `message` omitted |
| `message` | text if `body` omitted |

**422** if both missing or empty.

**201:** `{ "data": <SupportMessage> }`

### POST `/support-cases/{id}/resolve`

**JSON:** `resolution` **or** `resolution_note` (non-empty string).

### POST `/support-cases/{id}/reopen`

**Body:** none  

**200:** `{ "data": <SupportCase> }`  

**422** from domain if case is not `resolved` or `closed` — see [`SupportService::reopen`](app/Domains/Support/Services/SupportService.php).

---

## 9. Notification settings

### GET `/notification-settings`

**200:**

```json
{
  "active": { "...": "NotificationSettingsHistory row or null" },
  "history": []
}
```

### POST `/notification-settings` or PATCH `/notification-settings`

Same handler and validation:

**JSON body:**

| Field | Type |
|-------|------|
| `email_enabled` | required boolean |
| `in_app_enabled` | required boolean |
| `push_enabled` | required boolean |
| `sms_enabled` | required boolean |
| `reminder_offsets_hours` | optional array |
| `notes` | optional string, max 500 |

**201:** `{ "data": <NotificationSettingsHistory> }`

---

## 10. Errors & pagination

- **401** — missing/invalid token  
- **403** — token valid but not `app:admin` / wrong app scope  
- **404** — model not found  
- **422** — validation or domain rule (`message` string; Laravel format)

List endpoints returning `paginate()` use Laravel’s default pagination JSON (`data`, `current_page`, `last_page`, `per_page`, `total`, …).

---

## 11. Reference implementation

Route definitions: [`routes/api_admin.php`](routes/api_admin.php).  
Generated Postman collection (when regenerated): `public/docs/collection.json` via `php artisan scribe:generate`.
