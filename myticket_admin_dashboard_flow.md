# MyTicket — Admin Dashboard Flow

> **Type:** Admin Dashboard (Standalone)  
> **URL:** `admin.myticket.com`  
> **Users:** Admin only  
> **Shared Flows:** See `myticket_shared_flow.md` for authentication, notifications, payment, localization  
> **Master Reference:** `myticket_platform_flow.md`  
> **Last Updated:** April 2026

---

## 1. Overview

The Admin Dashboard is a standalone web application for platform administrators. It provides full control over platform moderation, approvals, configuration, analytics, and support management. Only users with the **Admin** role can access this dashboard.

---

## 2. Authentication

The Admin Dashboard has its own login page. **Registration is not available** — Admin accounts are created through internal platform setup.

### Login Page

- Email/password login only (no Google Social Login for admin security).
- Only users with the **Admin** role can log in. Non-admin credentials are rejected with an access denied message.
- See `myticket_shared_flow.md` Section 3.6 for login flow details.

### Forgot Password / Reset Password

- Available on the login page.
- See `myticket_shared_flow.md` Section 3.7 for the full password reset flow.

---

## 3. Dashboard Home

The Admin Dashboard home screen provides an at-a-glance summary of the platform's current state:

- Key metrics: total users, total events, total tickets sold, total revenue.
- Pending actions: role applications awaiting review, talent profiles awaiting approval, unresolved support requests.
- Quick navigation to all major sections.

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

Talent profiles receive an additional review step:

- Admin reviews **verification media** (video, images), certificates, and overall profile quality.
- A **disclaimer about upload quality requirements** is enforced: minimum resolution, clear content, professional presentation.
- Admin approves or rejects the Talent profile independently of the role application.

---

## 5. User Management

| Action | Description |
|---|---|
| **View all users** | List of all registered users, filterable by role (Guest, Talent, Vendor, Organizer) |
| **View user details** | Full profile, activity history, tickets, bookings, ratings |
| **Suspend account** | Temporarily or permanently suspend a user's account |
| **View role history** | See the user's current role (roles are final — no changes permitted after approval) |

---

## 6. Event Management

### Event Categories

The Admin manages event categories used across the platform:

| Action | Description |
|---|---|
| **Create category** | Define name, icon, and optional color |
| **Edit category** | Update name, icon, or color |
| **Deactivate category** | Remove category from active use (existing events retain the category) |

- Categories are **predefined by the Admin** — Organizers cannot create custom categories.
- Categories are used in search filters and on the home page for discovery.

### Featured Events

- Featured events use an **algorithmic mode by default** — automatically featuring events based on popularity (most sold, most viewed, etc.).
- The Admin can **override the algorithm** at any time by manually selecting specific events to feature.
- If the Admin does not set any manual overrides, the algorithm remains the default.

### Event Cancellation

The Admin can cancel events from the dashboard:

1. Admin selects an event and confirms cancellation.
2. The refund method is determined by the **cancellation agreement** between the platform and the Organizer (this agreement must be established in advance). *(Details TBD — pending finalization with project owner.)*
3. All tickets for the event are marked CANCELLED.
4. Each affected user receives email + in-app notification with cancellation details and refund information.
5. Tickets listed in auction are also cancelled and refunded per the agreement terms.

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

The Admin has a **professional, comprehensive analytics dashboard** providing full visibility into every aspect of the platform.

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

- Admin can review and moderate **Talent profiles** and **Vendor profiles** listed in the Marketplace.
- Admin can suspend or remove profiles that violate platform guidelines.

### Ratings Oversight

- Admin can view all ratings submitted platform-wide.
- Admin can monitor rating patterns for abuse or suspicious activity.

---

## 10. Support Management — Admin Side

### Support Dashboard

All support conversations from users on the Main Website appear in a centralized **support dashboard**:

- **Chat sessions:** Real-time chat threads initiated by users. Admin can join, respond, and resolve.
- **Text messages:** Asynchronous support messages submitted by users. Admin can review, respond, and mark resolved.
- **Status tracking:** Each support request has a status (Open, In Progress, Resolved).
- **Notification:** Users receive a notification when their support request is reviewed or resolved.
