# MyTicket — Admin Dashboard Flow

> **Type:** Admin Dashboard (Standalone)
> **URL:** `admin.myticket.com`
> **Users:** Admin only
> **Shared Flows:** See `myticket_shared_flow.md` for authentication, notifications, payment, localization
> **Master Reference:** `myticket_platform_flow.md`
> **Engineering Reference:** `myticket_admin_dashboard_tech.md` (architecture, schemas, API surface)
> **Last Updated:** April 30, 2026

---

## 1. Overview

The Admin Dashboard is a standalone web application for platform administrators. It provides full control over platform moderation, approvals, configuration, analytics, and support management. Only users with the **Admin** role can access this dashboard.

The current implementation is a Vite + React 19 SPA with a mock-driven data layer (RTK Query + `fakeBaseQuery`). All product flows below are wired against in-memory fixtures that are clone-seeded into a mutable runtime store; mutations persist within the session only. See the engineering reference doc for the swap plan to a real backend.

---

## 2. Authentication

The Admin Dashboard has its own login page. **Registration is not available** — Admin accounts are created through internal platform setup.

### Login Page

- Email/password login only (no Google Social Login for admin security).
- Only users with the **Admin** role can log in. Non-admin credentials are rejected with an access denied message.
- The route guard is implemented in `src/components/auth/RequireAdmin.tsx`: unauthenticated users go to `/login`, signed-in non-admin users go to `/access-denied`.
- The session is held in `sessionStorage` under the key `myticket_admin_session_v1` and cleared on sign-out.
- **Demo credentials (mock build):** `admin@myticket.demo` / `password` (any email containing `+admin` is also accepted as a fallback). Real provisioning replaces this when the backend is wired.
- See `myticket_shared_flow.md` Section 3.6 for login flow details.

### Forgot Password / Reset Password

- Available on the login page.
- See `myticket_shared_flow.md` Section 3.7 for the full password reset flow.

---

## 3. Dashboard Home

`src/pages/dashboard/DashboardHomePage.tsx` is the at-a-glance command center for the platform's current state. It is composed of four ordered bands:

### 3.1 Platform KPI tiles

Four headline tiles read from `getDashboardSummary` (`adminApi`):

| Tile | Source field | Display |
|---|---|---|
| Total users | `summary.totalUsers` | Count |
| Live + scheduled events | `summary.totalEvents` | Count |
| Tickets sold (lifetime) | `summary.totalTicketsSold` | Count |
| Gross revenue | `summary.totalRevenueSar` | Compact SAR (`K` / `M` suffix) |

### 3.2 Operational health

Three operational cards (API availability, Webhooks delivery, Risk queue backlog) sit beside the KPI tiles to give a one-glance pulse. They are placeholder visuals today — the labels match what the real Datadog / CloudWatch cards will surface — and the Risk queue card deep-links to `/moderation/listings`.

### 3.3 Spotlight events

A grid of `AdminEventCard` components rendered directly from the first three rows of `getEvents`. Each card shows the event cover image, title, organizer, status badge, capacity fill %, success rate %, average rating, and revenue (compact SAR). Cards link to `/events/:id`. A "Browse full catalog →" link sends the operator to the full events list.

### 3.4 Pending actions

A dedicated `getPendingActions` endpoint returns a `PendingAction[]` queue. Each item is rendered as a richer card with:

- Cover/portrait imagery (`imageUrl`).
- Kind: `role_application | talent_profile | support` mapped to a dedicated icon and tone.
- Priority: `high | normal` (high uses the coral accent).
- Title + subtitle for context.
- SLA hint (`dueLabel`, e.g. "Due in 4h", "Overdue 2d").
- A primary CTA that deep-links to the relevant approval/queue page.

---

## 4. Role Application Management

### Approval Queue

The Admin reviews and processes role applications submitted by users on the Main Website:

| Action | Description |
|---|---|
| **View applications** | List of pending role applications (Talent, Vendor, Organizer) with submitted documents |
| **Review details** | View the applicant's profile, supporting documents, verification media |
| **Approve** | Grant the role permanently. User is notified via email + in-app. The role cannot be changed after approval. |
| **Reject** | Reject with a reason. User is notified via email + in-app and may revise and resubmit. |

### Talent Profile Approval

Talent profiles receive an additional review step. The full schema lives in `src/schemas/talentApproval.schema.ts` (`talentProfileSchema`). The admin queue at `/approvals/talent` shows each candidate as a card with headshot, stage name, genres, location, and twin status badges (review status + government ID status). The dossier at `/approvals/talent/:id` exposes:

| Group | Fields |
|---|---|
| Identity | `id`, `stageName`, `legalName`, `bio`, `yearsExperience` |
| Contact | `email`, `phone`, `country`, `city`, `websiteUrl`, `instagramHandle` |
| Craft | `genres[]`, `mediaQualityNote`, `certificatesSummary` |
| Verification | `governmentIdStatus` (`pending | verified | rejected`), `bankVerified`, `headshotUrl`, `introVideoUrl`, `portfolioPdfUrl` |
| Performance | `completedBookings`, `averageRating` |
| Workflow | `status` (`pending | approved | rejected`), `submittedAt`, `rejectReason` |

The reviewer can:

- Watch the intro reel inline and download the portfolio PDF.
- Inspect government ID and bank verification badges before deciding.
- Approve the profile (`approveTalentProfile`) — emits a success toast.
- Reject with a reason (`rejectTalentProfile`, `RejectTalentProfileInput.reason`) — the reason is shown back on the candidate's record.

The same disclaimer about upload quality requirements (minimum resolution, clear content, professional presentation) is still enforced; the moderator note field captures any deviation. Talent profile approval is independent of the role application track.

---

## 5. User Management

The users list at `/users` is searchable and filterable in-page (no server round-trip in the mock build):

- **Search** by name, email, or user ID.
- **Filters:** role (`guest | talent | vendor | organizer`) and suspended state (`all | active | suspended`).

| Action | Description |
|---|---|
| **View all users** | List of all registered users, with search + role/suspension filters |
| **View user details** | Full profile, activity history, tickets, bookings, ratings (route `/users/:id`) |
| **Suspend account** | Temporarily or permanently suspend a user's account; reason is captured (`SuspendUserInput.reason`) and the action surfaces a success/failure toast |
| **View role history** | See the user's current role (roles are final — no changes permitted after approval) |

---

## 6. Event Management

### Events list & detail

Each event is presented as a rich `AdminEventCard` (see `src/components/events/AdminEventCard.tsx`). The `adminEventRowSchema` carries the full operational read model:

| Group | Fields |
|---|---|
| Identity | `id`, `title`, `organizerName`, `category`, `coverImageUrl` |
| Schedule | `startsAt`, `endsAt` |
| Venue | `venueName`, `city` |
| Capacity | `capacity`, `ticketsSold` (fill % is computed) |
| Performance | `revenueSar` (compact SAR), `avgRating` (0–5), `successRatePercent` (0–100) |
| Status | `status`: `active | ended | cancelled | archived` (rendered by `EventStatusBadge`) |

The list page (`/events`) supports both card grid and table views and offers:

- **Search** by title, organizer, venue, or city.
- **Filters:** status and category.
- Click-through to `/events/:id` for the executive readout (fill rate, average rating, revenue, check-in success), logistics (venue, dates, capacity), and a single-card preview.

### Event Categories

The Admin manages event categories at `/events/categories`. The page is split into clear concerns:

1. **Catalog** — searchable, sortable table of every category (name, icon, color, status, event count). Filters: active/inactive and free-text search.
2. **Add / Edit form** — collects name, icon key, and color token (`upsertCategorySchema`). Saving fires success/error toasts.

| Action | Description |
|---|---|
| **Create category** | Define name, icon, and color via `upsertCategory` (no `id`). Newly-created categories default to `active: true`. |
| **Edit category** | Update name, icon, or color via `upsertCategory` (with `id`). |
| **Activate / deactivate** | Toggle the active flag via `toggleCategoryActive` without deleting (existing events keep the category). |

- Categories are **predefined by the Admin** — Organizers cannot create custom categories.
- Categories are used in search filters and on the home page for discovery.

### Featured Events

The featured-events configuration (`featuredEventsConfigSchema`) supports two modes:

| Mode | Behavior |
|---|---|
| `algorithm` *(default)* | Automatically feature events based on popularity (most sold, most viewed, etc.). |
| `manual_override` | The Admin pins a specific shortlist of event IDs (`manualEventIds[]`). |

The `/events/featured` page surfaces:

- **Merchandising health** stats (active features, click-through, share-of-voice, manual overrides count).
- **Mode selector** cards (algorithm vs manual override).
- **Pinned shortlist** of `AdminEventCard`s with search + status/category filters to find new candidates.
- A clear empty state when no manual overrides exist; the algorithm remains the default.

### Event Cancellation

The cancellation page (`/events/cancellations`) is built around safety:

1. Admin sees a selectable grid of `AdminEventCard`s (only `active` events are eligible). Search and status/category filters help narrow the list.
2. Selecting a card reveals the **confirmation form** (`cancelEventInputSchema`):
   - The admin must **type the event title exactly** to enable the destructive action.
   - The admin must **acknowledge** the platform/organizer agreement checkbox.
   - An optional internal note is captured.
3. On submit (`cancelEvent`):
   - The event status flips to `cancelled` and `Events`, individual `Events:id`, and `Dashboard` tags are invalidated.
   - All tickets for the event are marked CANCELLED.
   - Each affected user receives email + in-app notification with cancellation details and refund information.
   - Tickets listed in auction are also cancelled and refunded per the agreement terms.
4. The refund method is still determined by the **cancellation agreement** between the platform and the Organizer (this agreement must be established in advance). *(Details TBD — pending finalization with project owner.)*

---

## 7. Platform Configuration

### Fee Configuration

Platform fees are **fully configurable by the Admin**:

- **Fee type:** percentage-based, flat fee, or a combination of both.
- **Fee payer:** whether the fee is charged to the buyer (added on top of ticket price) or deducted from the organizer's revenue.
- **Third-party profit sharing:** configure profit-sharing splits for cases where a third party is involved.
- **Auction commission:** configure the percentage taken by the platform on auction sales.
- **Per-stakeholder agreements:** set different fee arrangements per organizer or globally.
- **Fee amount:** adjustable at any time.

See `myticket_shared_flow.md` Section 6 for the full fee rules.

### Notification Configuration

- Configure **notification channels** for event reminders: email, in-app, push notification, or any combination.
- Configure reminder timing intervals (e.g., 24 hours before, 1 hour before).

---

## 8. Analytics Dashboard

The Admin has a **professional, comprehensive analytics dashboard** providing full visibility into every aspect of the platform. The page (`/analytics`) ships with a **range selector** (`7d | 30d | 90d`) that drives the revenue trend chart; the four headline totals stay platform-wide and are not range-bound. Currency is rendered with the compact SAR formatter throughout (axis ticks + tooltip).

### Financial Analytics

| Metric | Description |
|---|---|
| **Total platform revenue** | All-time and period-based revenue (daily/weekly/monthly/yearly) |
| **Revenue breakdown** | By event, by organizer, by ticket type, by category |
| **Platform fees collected** | Total fees earned by the platform |
| **Refunds processed** | Total refunds issued (cancellations, event edits, conflicts) |
| **Organizer payouts** | Total paid out, pending, and overdue payouts |
| **Revenue trends** | Charts showing revenue over time |

### Platform Counters (Totals)

| Counter | Description |
|---|---|
| **Total users** | All registered users, broken down by role (Guest, Talent, Vendor, Organizer) |
| **Total events** | All events ever created (by status: active, ended, cancelled, archived) |
| **Total tickets sold** | Platform-wide ticket sales count |
| **Total bookings** | Platform-wide booking count |
| **Total vendors** | Registered and approved vendors |
| **Total talents** | Registered and approved talents |
| **Total organizers** | Registered and approved organizers |
| **Total ratings** | Ratings submitted platform-wide |

### Top / Leaderboard Metrics

| Metric | Description |
|---|---|
| **Top events** | Events with the most ticket sales, revenue, or attendance |
| **Top organizers** | Organizers with the most events, revenue, or ticket sales |
| **Top categories** | Most popular event categories by sales or event count |
| **Top-selling ticket types** | Which ticket types (VIP, Standard, etc.) sell the most |
| **Top-rated events** | Events with the highest average star rating |
| **Top talents** | Talents with the most bookings or highest ratings |
| **Top vendors** | Vendors with the most bookings or highest ratings |

---

## 9. Moderation

### Listing Moderation

The listings queue at `/moderation/listings` is searchable and filterable:

- **Search** by title, owner email, or flag reason.
- **Filters:** kind (`talent | vendor`) and status (`queued | actioned`).

| Action | Description |
|---|---|
| **Mark reviewed** | Flip a queued listing to `actioned` after inspection (`markListingModerationReviewed`). |
| **Cross-link** | Owner email links to the user's record so the admin can suspend or follow up if the violation is severe. |

### Ratings Oversight

The ratings queue at `/moderation/ratings` exposes every rating submitted platform-wide:

- **Search** by reviewer, target, or comment text.
- **Filter:** minimum stars (`1+ | 2+ | 3+ | 4+ | 5`).
- Rating patterns can be monitored for abuse or suspicious activity; individual ratings can be flagged for moderation.

---

## 10. Support Management — Admin Side

### Support Dashboard

All support conversations from users on the Main Website appear in a centralized **support dashboard** at `/support`:

- **Threads list** with search (by subject, requester name, or requester email) and status filter (`open | in_progress | resolved`).
- **Chat sessions:** Real-time chat threads initiated by users. Admin can join, respond, and resolve.
- **Text messages:** Asynchronous support messages submitted by users. Admin can review, respond, and mark resolved.
- **Status tracking:** Each support request has a status (`open → in_progress → resolved`).
- **Notification:** Users receive a notification when their support request is reviewed or resolved.

### Thread detail

`/support/:id` opens the dossier:

- Full message history with `author` of `user | admin` rendered as distinct bubbles.
- **Admin reply** form (`SupportReplyInput`) appends a new admin message to the thread.
- **Status transitions** via `updateSupportStatus` (`UpdateSupportStatusInput.status`); both reply and status changes emit toasts and invalidate the support cache so the list updates immediately.

---

## 11. Admin Profile

`/profile` (`src/pages/profile/AdminProfilePage.tsx`) is the admin's personal settings space. It exposes:

| Field | Description |
|---|---|
| **Display name** | The name shown in the top bar and in audit trails |
| **Timezone** | Used by the dashboard to render dates/times consistently |
| **Daily digest** | Toggle to opt-in/out of a daily email summary |

Saves are mock-only in the current build (no `updateAdminProfile` endpoint yet) but emit a success toast and reset the dirty flag for parity with future API behavior.

---

## 12. Cross-cutting UX

These conventions apply across every page and are enforced via shared primitives:

- **Global toasts** — every mutation surfaces a `notifySuccess` / `notifyError` via `sonner`. Wired in `src/main.tsx` and `src/lib/notify.ts`.
- **Sticky table headers** — long lists use the `.admin-table-scroll` utility so the header pins while the body scrolls.
- **Shared event card** — `AdminEventCard` is the single source of truth for visualising events (cover image, status badge, fill %, success %, average rating, compact SAR revenue).
- **Compact SAR formatting** — all monetary values use `formatSarCompact` (`900 SAR`, `1K SAR`, `1.2K SAR`, `428K SAR`, `1M SAR`, `12.4M SAR`); chart axes use the `formatSarAxis` variant.
- **List filters bar** — `ListFiltersBar` ships a unified search + filter slot used on users, role applications, talents, events, categories, featured, cancellation, listings, ratings, and support pages.
- **Section header** — `AdminSection` provides consistent eyebrow / title / description for every section.
- **Status colour language** — `mint` for healthy, `coral` for destructive/at-risk, `lemon` for attention, `ink` shades for neutral states.
- **Auth feedback** — invalid credentials, suspended accounts, and access denied each map to dedicated screens with clear copy.
