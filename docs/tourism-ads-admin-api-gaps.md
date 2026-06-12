# Tourism ads — admin API gaps

This document tracks contracts the admin Tourism Ads module expects but that are not yet confirmed or deployed on the backend. The UI is wired to **admin-only** routes under `/api/v1/admin/tourism-ads/*` and degrades gracefully when optional pieces are missing.

## 1. Gallery upload (admin)

**Handoff today:** guest/main flow uses `POST /api/v1/main/uploads` with `context=tourism_ad_gallery`. The admin dashboard must **not** call main routes.

**Proposed admin endpoint:**

```
POST /api/v1/admin/uploads
Content-Type: multipart/form-data

context=tourism_ad_gallery
file=<binary>
```

**Expected response:** same shape as main upload (public URL in `data.url` or equivalent).

**Current admin UI:**

- Create/edit forms accept **gallery image URLs** (paste).
- File picker shows **“Upload file (pending API)”** and does not call main uploads.
- When the admin upload endpoint ships, wire the picker to `POST /api/v1/admin/uploads` and append returned URLs to `gallery_urls`.

## 2. Laravel Echo / Reverb environment

No websocket client existed in admin before Tourism Ads. Realtime v1 uses `laravel-echo` + `pusher-js` with Reverb.

**Required `VITE_*` variables (confirm with backend ops):**

| Variable | Purpose |
|----------|---------|
| `VITE_REVERB_APP_KEY` | Reverb app key |
| `VITE_REVERB_HOST` | WebSocket host |
| `VITE_REVERB_PORT` | WebSocket port (e.g. `443`) |
| `VITE_REVERB_SCHEME` | `https` or `http` |

**Channel:** `private-admin.tourism_ads` (Echo: `.private('admin.tourism_ads')`)

**Event:** `.tourism_ad.status_changed`

**Auth:** `POST {VITE_API_BASE_URL}/broadcasting/auth` with admin Bearer token. Confirm path and channel authorization rules with backend.

**When unset:** client logs once and skips subscription; all reads/mutations still work via REST.

## 3. Dashboard counters & pending actions

Handoff references tourism review queue counts on dashboard endpoints.

**Optional counter fields (mapped with default `0` if absent):**

- Flat: `tourism_ads_pending_review` on `GET /api/v1/admin/dashboard/counters`
- Nested: `tourism_ads.pending_review` on `GET /api/v1/admin/dashboard/summary`

**Pending actions:** optional `kind: "tourism_ad"` rows on `GET /api/v1/admin/dashboard/pending-actions` linking to `/tourism-ads?tab=review`.

Until backend deploys these fields, mock fixtures and UI show `0` / omit tiles without breaking parsing.

## Implemented admin routes (reference)

| Action | Method & path |
|--------|----------------|
| List | `GET /api/v1/admin/tourism-ads` |
| Detail | `GET /api/v1/admin/tourism-ads/{id}` |
| Create (publish) | `POST /api/v1/admin/tourism-ads` |
| Update | `PATCH /api/v1/admin/tourism-ads/{id}` |
| Approve | `POST /api/v1/admin/tourism-ads/{id}/approve` |
| Reject | `POST /api/v1/admin/tourism-ads/{id}/reject` |
| Archive | `POST /api/v1/admin/tourism-ads/{id}/archive` |
| Pin | `POST /api/v1/admin/tourism-ads/{id}/pin` |
| Unpin | `POST /api/v1/admin/tourism-ads/{id}/unpin` |
| Carousel order | `PATCH /api/v1/admin/tourism-ads/carousel-order` |
