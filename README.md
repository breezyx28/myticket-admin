# MyTicket Admin

Vite + React + TypeScript admin console. State: **Redux Toolkit** + **RTK Query** (`src/services/adminApi.ts`). Form validation uses **Zod** + `@hookform/resolvers/zod`.

## Environment

Copy `.env.example` to `.env` and adjust:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API origin without trailing slash (e.g. `https://myticket-api.kat-jr.com`). |
| `VITE_ADMIN_READS_SOURCE` | `mock` (default): reads use in-memory fixtures. `api`: use live GETs only where paths are set in `adminApi.ts` (`LIVE_GET`); otherwise falls back to mock with a console warning. |
| `VITE_ALLOW_DEMO_AUTH` | `true`: allow legacy demo sign-in without calling the API. `false`: sign-in uses `POST /api/v1/admin/auth/login`. |
| `VITE_ADMIN_LOGIN_PHONE` / `VITE_ADMIN_LOGIN_OTP` | Optional; included in login JSON if set (some APIs require non-empty `phone`). |

## Scripts

```bash
npm install
npm run dev      # http://localhost:5175
npm run build
npm run test
```

## API vs mock

- **Mutations** (approve, reject, suspend, fees, notifications, featured config, moderation approve, support messages/status, etc.) call the real admin API when a bearer token is present (after API login). Without a token, the previous in-memory behavior is used so local UX still works.
- **Reads** depend on `VITE_ADMIN_READS_SOURCE` and documented GET routes; see [docs/myticket_admin_api_collection_gaps.md](docs/myticket_admin_api_collection_gaps.md) and the phased wiring playbook [docs/phased_admin_api_readiness.md](docs/phased_admin_api_readiness.md).
