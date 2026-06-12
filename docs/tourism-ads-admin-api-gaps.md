# Tourism ads — admin API gaps

**Status (2026-06-14):** Backend gaps are **resolved**. Use [`frontend-handoff-tourism-ads-admin.md`](frontend-handoff-tourism-ads-admin.md) as the live contract.

This file is kept for historical context only.

## Previously open items (now shipped)

### 1. Gallery upload — resolved

`POST /api/v1/admin/uploads` with `context=tourism_ad_gallery` — wired in admin create form gallery picker.

### 2. Laravel Echo / Reverb — resolved

Set in local `.env` (copy from `.env.example`; do not commit secrets):

```env
VITE_REVERB_APP_KEY=fysuwmddunkddyla1das
VITE_REVERB_HOST=myticket-api.kat-jr.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

Admin realtime: `user.{id}` (notifications), `admin.verifications`, `admin.tourism_ads`. See [`docs/socket-chat/frontend-realtime-integration-guide.md`](socket-chat/frontend-realtime-integration-guide.md).

### 3. Dashboard counters — resolved

- `tourism_ads_pending_review` on `GET /dashboard/counters`
- `tourism_ads.pending_review` on `GET /dashboard/summary`
- `tourism_ads_pending_review[]` on `GET /dashboard/pending-actions`

Mappers default to `0` when fields are absent so older API builds do not break the UI.
