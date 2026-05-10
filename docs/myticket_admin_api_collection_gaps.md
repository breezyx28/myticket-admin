# MyTicket Admin — API / collection gaps (current)

**Short snapshot:** [`current-gaps.md`](current-gaps.md) (authoritative wiring + backlog tables).

**Contracts:** When the Postman export and the running API disagree, prefer **`docs/ADMIN_API_FRONTEND_HANDOFF.md`** for request/response shapes the frontend implements.

Source of truth for routes: [`collection.json`](../collection.json) (plus handoff doc above). Client wiring: [`src/services/adminApi.ts`](../src/services/adminApi.ts), mappers [`src/schemas/api/adminMappers.ts`](../src/schemas/api/adminMappers.ts), password reset [`src/lib/adminPasswordReset.ts`](../src/lib/adminPasswordReset.ts).

## 1. Client vs collection — reads (`LIVE_GET`)

`adminApi.ts` wires **most** admin `GET`s via `LIVE_GET` + `tryLiveRead` + mappers. Exceptions:

| RTK query | Why not a live URL |
|-----------|---------------------|
| `getTalentProfile` | **Custom `queryFn`** — `GET …/profiles/talents/{id}` with path param (listed in `LIVE_GET` for the path template). |
| `getAuction` | **Custom `queryFn`** — `GET …/auctions/{id}` with path param. |
| `getAuditLog` | **Custom `queryFn`** — `GET …/audit-logs/{id}` with path param; not a `LIVE_GET` name. |
| `getOrganizerKyc` | **Custom `queryFn`** — `GET …/finance/organizers/{id}/kyc`; not a `LIVE_GET` name. |
| `getPlatformCounters` | **No `GET` in export** — mock-only; dashboard aggregate counters use `getDashboardCounters` instead. |

All other `LiveReadName` entries have a non-null `LIVE_GET` path (see [`current-gaps.md`](current-gaps.md) §A).

## 2. Still missing or underspecified in the collection

1. **Analytics — platform tiles** — `getPlatformCounters` stays mock-only; see `current-gaps.md` §D.
2. **`GET …/analytics/financial` — query contract** — Handoff documents `range` including `24h` / `1d`.
3. **Success response bodies** — Add 200 examples or OpenAPI for stricter mappers.
4. **Deployment vs collection** — 404 on host until versions align.
5. **Event “cancel” semantics** — App uses `POST …/events/{id}/reject`; confirm product intent.

## 3. Collection routes not fully reflected in the admin app

See [`current-gaps.md`](current-gaps.md) **§E** for the up-to-date backlog (audit logs, extra moderation/rating/user/event actions, etc.).

**Recently wired (no longer in this gap bucket):** admin **orders** (list, detail, force-refund), **refunds** list, **refund breakdowns** read, **payouts** list + payout lifecycle POSTs, **auctions** list + freeze/cancel/finalize, **scanners** list + suspend/unsuspend + **scan logs** read, **finance fee-adjustments** + **organizer KYC** read/approve/reject, **complaints** list + triage/resolve/escalate, **admin-actions** + **audit logs** (list, detail, POST actions), **notifications** recent + delivery-log + test POST (alongside settings), **admin health** + **version** GETs, **profiles/vendors** + **profiles/organizers** directory lists (approvals nav), **moderation-queue** claim/release/reject/escalate + approve, **ratings** hide/restore/delete, **users** unsuspend + impersonate, **events** approve/feature/unfeature, **event-categories** DELETE, **forgot/reset password** (non-RTK).

## 4. Auth

- **`POST …/admin/auth/password/forgot`** and **`…/password/reset`** — Implemented in [`src/lib/adminPasswordReset.ts`](../src/lib/adminPasswordReset.ts) and wired from forgot/reset pages when `VITE_API_BASE_URL` is set.

## 5. Optional Postman hygiene

- Align `baseUrl` / environments with deployment (`VITE_API_BASE_URL`).
- Mark admin requests as Bearer auth in Postman where the app sends `Authorization`.
