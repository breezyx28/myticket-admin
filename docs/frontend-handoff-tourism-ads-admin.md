# Tourism Ads — admin dashboard handoff

**Date:** 2026-06-14  
**Audience:** Admin SPA (`https://myticket-admin.kat-jr.com`)  
**API base:** `https://myticket-api.kat-jr.com/api/v1/admin`  
**Auth:** `Authorization: Bearer <token>` · Sanctum ability `app:admin` · session app `admin_dashboard`  
**Full domain reference:** [`frontend-handoff-tourism-ads.md`](frontend-handoff-tourism-ads.md)

All gaps from [`tourism-ads-admin-api-gaps.md`](tourism-ads-admin-api-gaps.md) are **resolved** on the backend.

---

## Quick wiring checklist

- [ ] Gallery picker → `POST /api/v1/admin/uploads` with `context=tourism_ad_gallery`
- [ ] Review queue tile → `GET /dashboard/counters` → `data.tourism_ads_pending_review`
- [ ] Dashboard summary → `GET /dashboard/summary` → `data.tourism_ads.pending_review`
- [ ] Pending feed rows → `GET /dashboard/pending-actions` → `data.tourism_ads_pending_review[]` (`kind`, `href`)
- [ ] Echo subscribe → `private-admin.tourism_ads` · listen `.tourism_ad.status_changed`
- [ ] Reverb env vars in admin `.env` (see § Realtime)

---

## 1. Gallery upload (admin)

**Do not** call main `/api/v1/main/uploads` from the admin app.

```
POST https://myticket-api.kat-jr.com/api/v1/admin/uploads
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

| Field | Value |
|-------|-------|
| `file` | Image or PDF, max 12 MB |
| `context` | `tourism_ad_gallery` |

**Success `201`**

```json
{
  "data": {
    "url": "https://myticket-api.kat-jr.com/storage/tourism/ads/gallery/abc.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 245000
  }
}
```

Append `data.url` to `gallery_urls` on create (`POST /tourism-ads`) or update (`PATCH /tourism-ads/{id}`).

---

## 2. Dashboard counters

### Flat tile counter — `GET /dashboard/counters`

```json
{
  "data": {
    "tourism_ads_pending_review": 3
  }
}
```

### Nested summary — `GET /dashboard/summary`

```json
{
  "data": {
    "tourism_ads": {
      "pending_review": 3
    }
  }
}
```

Use either field; both reflect the same count (`status = pending_review`).

---

## 3. Pending actions feed

### `GET /dashboard/pending-actions`

Tourism rows live in **`data.tourism_ads_pending_review`** (max 10, newest first).

```json
{
  "data": {
    "tourism_ads_pending_review": [
      {
        "kind": "tourism_ad",
        "id": 12,
        "user_id": 42,
        "location_name": "Red Sea Coral Bay",
        "status": "pending_review",
        "submitted_at": "2026-06-14T10:00:00+00:00",
        "title": "Red Sea Coral Bay",
        "subtitle": "Guest User",
        "href": "/tourism-ads/12",
        "user": {
          "id": 42,
          "email": "guest@example.com",
          "full_name": "Guest User"
        }
      }
    ]
  }
}
```

**UI mapping**

| Field | Use |
|-------|-----|
| `kind` | `"tourism_ad"` — filter / icon |
| `title` | Primary label (`location_name`) |
| `subtitle` | Submitter name or email |
| `href` | Deep link to ad detail (prefix with your admin router base) |
| Review queue tab | `/tourism-ads?status=pending_review` or `?tab=review` |

Other buckets (`events_pending_approval`, etc.) are unchanged — map each bucket locally per [`ADMIN_DASHBOARD_API_FRONTEND.md`](../ADMIN_DASHBOARD_API_FRONTEND.md).

---

## 4. Tourism ads CRUD & moderation

| Action | Method & path |
|--------|----------------|
| List | `GET /tourism-ads?status=&source=&page=&per_page=` |
| Detail | `GET /tourism-ads/{id}` |
| Create (publishes immediately) | `POST /tourism-ads` |
| Update | `PATCH /tourism-ads/{id}` |
| Approve guest submission | `POST /tourism-ads/{id}/approve` |
| Reject | `POST /tourism-ads/{id}/reject` body `{ "reason": "…" }` |
| Archive (unpublish) | `POST /tourism-ads/{id}/archive` |
| Pin carousel | `POST /tourism-ads/{id}/pin` optional `{ "position": 0 }` |
| Unpin | `POST /tourism-ads/{id}/unpin` |
| Reorder carousel | `PATCH /tourism-ads/carousel-order` body `{ "items": [{ "id": 1, "position": 0 }] }` |

**List response:** `{ "data": { "current_page", "data": […], "per_page", "total" } }` — paginator wrapped in `data`.

**Detail / mutation response:** `{ "data": { …ad } }` — see full field list in [`frontend-handoff-tourism-ads.md` § Detail shape](frontend-handoff-tourism-ads.md).

**Admin create** uses full publish validation (description min 50, opening hours all weekdays, gallery min 1, etc.) and sets `status: published` immediately — no separate approve step.

---

## 5. Realtime (Reverb + Echo)

Install in admin repo: `npm install laravel-echo pusher-js`

### Admin `.env` (Vite)

```env
VITE_API_URL=https://myticket-api.kat-jr.com
VITE_REVERB_APP_KEY=fysuwmddunkddyla1das
VITE_REVERB_HOST=myticket-api.kat-jr.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### Subscribe

```typescript
echo.private('admin.tourism_ads').listen(
  '.tourism_ad.status_changed',
  (envelope) => {
    // envelope.payload: { id, from_status, to_status, location_name, … }
    refreshReviewQueue(); // GET /tourism-ads?status=pending_review
    refreshCounters();    // GET /dashboard/counters
  },
);
```

### Broadcasting auth

```
POST https://myticket-api.kat-jr.com/broadcasting/auth
Authorization: Bearer <admin_token>

{ "socket_id": "…", "channel_name": "private-admin.tourism_ads" }
```

Channel rule: `role === 'admin'` only.

**When Reverb env is unset:** skip subscription; REST still works.

Full Echo setup: [`socket-and-chat/frontend-realtime-integration-guide.md`](socket-and-chat/frontend-realtime-integration-guide.md)

---

## 6. Event → REST reconcile

| Push event | Refresh |
|------------|---------|
| Guest submits (`to_status: pending_review`) | Counters + `GET /tourism-ads?status=pending_review` |
| Approve / reject | Same + ad detail if open |

---

## Deploy note

Run migrations if not already applied:

- `2026_06_14_000001_create_tourism_ads_table.php`
- `2026_06_14_000002_add_tourism_ad_kinds_to_notifications_kind_enum.php`

Then `php artisan config:cache`.
