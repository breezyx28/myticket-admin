# Admin dashboard — category taxonomies API

**Date:** 2026-06-14  
**Audience:** Admin SPA (`https://myticket-admin.kat-jr.com`)  
**API base:** `https://myticket-api.kat-jr.com/api/v1/admin`  
**Auth:** `Authorization: Bearer <token>` · Sanctum ability `app:admin` · middleware `app.scope:admin_dashboard`

This document covers **every category taxonomy** the platform uses and the **admin CRUD endpoints** for managing curated lists. It also explains what is **not** a standalone admin taxonomy (organizer categories, pivot tables).

**Related public docs**

- Event category icons (Phosphor): [`frontend-handoff-event-categories-phosphor-icons.md`](frontend-handoff-event-categories-phosphor-icons.md)
- Talent / vendor badges (main + admin): [`frontend-handoff-talent-categories-updates.md`](frontend-handoff-talent-categories-updates.md)
- Vendor categories: [`frontend-handoff-vendor-categories-and-profile-updates.md`](frontend-handoff-vendor-categories-and-profile-updates.md)

---

## Taxonomy map

| Taxonomy | Admin CRUD? | Table | Used by |
|----------|-------------|-------|---------|
| **Event categories** | Yes | `event_categories` | Events (primary `category_id`), public discover filters, organizer profile tags (`organizer_categories` pivot) |
| **Talent categories** | Yes | `talent_categories` | Talent applications & profiles (badges) |
| **Vendor service categories** | Yes | `vendor_service_categories` | Vendor applications & profiles (badges) |
| **Organizer categories** | **No** (pivot only) | `organizer_categories` | Links `organizer_profiles` ↔ `event_categories` — managed via organizer profile, not admin taxonomy CRUD |
| **Event ↔ category (M:N)** | **No** | `event_categories_assignment` | Secondary event tagging (schema exists; primary filter uses `events.category_id`) |
| **Talent application categories** | **No** (pivot) | `talent_application_categories` | Set via main API when talent applies |
| **Talent profile categories** | **No** (pivot) | `talent_profile_categories` | Set via talent profile API |
| **Vendor application categories** | **No** (pivot) | `vendor_application_categories` | Set via main API when vendor applies |
| **Vendor profile categories** | **No** (pivot) | `vendor_profile_categories` | Set via vendor profile API |

**Custom badges:** Talent and vendor users can create categories on the **main** API (`POST /api/v1/main/talent-categories`, `POST /api/v1/main/vendor-service-categories`). Admin-created rows have `created_by_user_id: null` and `is_custom: false`. User-created rows have `is_custom: true`.

---

## Authentication & errors

All admin category routes require:

```http
Authorization: Bearer <admin_token>
```

| HTTP | Meaning |
|------|---------|
| **401** | Missing/invalid token |
| **403** | Wrong app scope |
| **404** | Category `{id}` not found |
| **422** | Validation failure or business rule (e.g. delete while in use) |

### Validation error (`422`)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "slug": ["The slug has already been taken."],
    "name_en": ["The name en field is required."]
  }
}
```

### Business rule error (`422`, plain message)

```json
{
  "message": "Category is assigned to one or more events; reassign events before deleting."
}
```

```json
{
  "message": "Category is assigned to one or more talent profiles or applications."
}
```

```json
{
  "message": "Category is assigned to one or more vendor profiles or applications."
}
```

### Delete success (`200`)

```json
{
  "message": "Deleted"
}
```

---

## Pagination (all list endpoints)

List endpoints return a **Laravel paginator** (no outer `{ "data": … }` wrapper on the paginator itself):

```json
{
  "current_page": 1,
  "data": [ ],
  "first_page_url": "https://myticket-api.kat-jr.com/api/v1/admin/event-categories?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "https://myticket-api.kat-jr.com/api/v1/admin/event-categories?page=1",
  "links": [ ],
  "next_page_url": null,
  "path": "https://myticket-api.kat-jr.com/api/v1/admin/event-categories",
  "per_page": 50,
  "prev_page_url": null,
  "to": 10,
  "total": 10
}
```

Default page size: **50**. Use `?page=2` for pagination.

Ordering: `display_order ASC`, then `name_en ASC`.

---

# 1. Event categories

Curated taxonomy for **events** and public discovery. Supports **icon** and **color** fields for the main website (Phosphor icons).

| Method | Path |
|--------|------|
| GET | `/event-categories` |
| POST | `/event-categories` |
| PATCH | `/event-categories/{id}` |
| DELETE | `/event-categories/{id}` |

There is **no** `GET /event-categories/{id}` — use list or PATCH response.

---

### `GET /event-categories`

**Query:** `page` (optional)

**Success `200`** — each item in `data[]`:

```json
{
  "id": 1,
  "slug": "concerts",
  "name_en": "Concerts",
  "name_ar": "حفلات",
  "icon_key": "MusicNotes",
  "color_token": "primary",
  "is_active": true,
  "display_order": 1,
  "created_at": "2026-05-06T00:00:00.000000Z",
  "updated_at": "2026-05-06T00:00:00.000000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | Unique, max 80, URL-safe |
| `name_en` | string | Unique English label, max 120 |
| `name_ar` | string | Arabic label, max 120 |
| `icon_key` | string \| null | Phosphor React export name, e.g. `MusicNotes` |
| `color_token` | string \| null | Theme token, e.g. `primary`, `accent` |
| `is_active` | boolean | Inactive categories hidden on public main API |
| `display_order` | integer | 0–65535, lower = earlier in UI |

---

### `POST /event-categories`

**Request body**

```json
{
  "slug": "workshops",
  "name_en": "Workshops",
  "name_ar": "ورش عمل",
  "icon_key": "Hammer",
  "color_token": "accent",
  "is_active": true,
  "display_order": 10
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `slug` | yes | string, max 80, unique |
| `name_en` | yes | string, max 120, unique |
| `name_ar` | yes | string, max 120 |
| `icon_key` | no | string, max 80, nullable |
| `color_token` | no | string, max 40, nullable |
| `is_active` | no | boolean (default `true`) |
| `display_order` | no | integer 0–65535 (default `0`) |

**Success `201`**

```json
{
  "data": {
    "id": 12,
    "slug": "workshops",
    "name_en": "Workshops",
    "name_ar": "ورش عمل",
    "icon_key": "Hammer",
    "color_token": "accent",
    "is_active": true,
    "display_order": 10,
    "created_at": "2026-06-14T12:00:00.000000Z",
    "updated_at": "2026-06-14T12:00:00.000000Z"
  }
}
```

---

### `PATCH /event-categories/{id}`

Partial update — all fields optional (`sometimes` rules).

**Example**

```json
{
  "name_en": "Workshops & Training",
  "icon_key": "MicrophoneStage",
  "is_active": false,
  "display_order": 5
}
```

**Success `200`**

```json
{
  "data": { }
}
```

Same shape as create response (`data` = updated row).

---

### `DELETE /event-categories/{id}`

**Success `200`**

```json
{
  "message": "Deleted"
}
```

**Fails `422`** if any event has `events.category_id` pointing at this category. Reassign those events first.

---

### Public read (for admin UI preview)

Main website (no auth):

```http
GET https://myticket-api.kat-jr.com/api/v1/main/events/categories
```

Returns active categories with `events_count` — see [`frontend-handoff-event-categories-phosphor-icons.md`](frontend-handoff-event-categories-phosphor-icons.md).

---

# 2. Talent categories

Badge taxonomy for **talent** applications and live profiles.

| Method | Path |
|--------|------|
| GET | `/talent-categories` |
| POST | `/talent-categories` |
| PATCH | `/talent-categories/{id}` |
| DELETE | `/talent-categories/{id}` |

---

### Shared category object (`categoryPayload`)

Used in list `data[]`, create `data`, and update `data`:

```json
{
  "id": 1,
  "slug": "singer",
  "name_en": "Singer",
  "name_ar": "مغني",
  "is_active": true,
  "display_order": 1,
  "is_custom": false,
  "created_by_user_id": null
}
```

| Field | Type | Notes |
|-------|------|-------|
| `is_custom` | boolean | `true` when created by a talent user on main API |
| `created_by_user_id` | int \| null | Owner of custom badge; `null` for admin/seeded |

Admin `POST` always sets `created_by_user_id: null` (curated/system badge).

---

### `GET /talent-categories`

**Success `200`** — paginator; each `data[]` item uses **category object** above (no `created_at` in payload).

---

### `POST /talent-categories`

**Request body**

```json
{
  "slug": "standup-comedian",
  "name_en": "Standup Comedian",
  "name_ar": "كوميدي ستاند أب",
  "is_active": true,
  "display_order": 20
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `slug` | yes | string, max 80, unique |
| `name_en` | yes | string, max 120, unique |
| `name_ar` | yes | string, max 120 |
| `is_active` | no | boolean (default `true`) |
| `display_order` | no | integer 0–65535 (default `0`) |

**Success `201`**

```json
{
  "data": {
    "id": 16,
    "slug": "standup-comedian",
    "name_en": "Standup Comedian",
    "name_ar": "كوميدي ستاند أب",
    "is_active": true,
    "display_order": 20,
    "is_custom": false,
    "created_by_user_id": null
  }
}
```

---

### `PATCH /talent-categories/{id}`

**Example**

```json
{
  "name_en": "Stand-up Comedian",
  "display_order": 15,
  "is_active": true
}
```

**Success `200`**: `{ "data": { …category object } }`

---

### `DELETE /talent-categories/{id}`

**Fails `422`** if assigned to any row in `talent_profile_categories` or `talent_application_categories`.

---

### Admin talent directory (filter by category)

Not a category CRUD endpoint, but useful for admin UI:

```http
GET /api/v1/admin/profiles/talents?category_slug=singer
GET /api/v1/admin/profiles/talents?talent_category_id=1
GET /api/v1/admin/profiles/talents?category_id=1
```

Each talent row includes enriched `categories[]` with the same badge shape.

---

# 3. Vendor service categories

Badge taxonomy for **vendor** applications and live profiles (catering, AV, security, etc.).

| Method | Path |
|--------|------|
| GET | `/vendor-service-categories` |
| POST | `/vendor-service-categories` |
| PATCH | `/vendor-service-categories/{id}` |
| DELETE | `/vendor-service-categories/{id}` |

Request/response rules mirror **talent categories** (same fields, same `categoryPayload` shape with `is_custom` / `created_by_user_id`).

---

### `POST /vendor-service-categories` — example

```json
{
  "slug": "catering",
  "name_en": "Catering",
  "name_ar": "تموين",
  "is_active": true,
  "display_order": 1
}
```

**Success `201`**

```json
{
  "data": {
    "id": 3,
    "slug": "catering",
    "name_en": "Catering",
    "name_ar": "تموين",
    "is_active": true,
    "display_order": 1,
    "is_custom": false,
    "created_by_user_id": null
  }
}
```

---

### `DELETE /vendor-service-categories/{id}`

**Fails `422`** if assigned to any row in `vendor_profile_categories` or `vendor_application_categories`.

---

# 4. Organizer categories (no admin taxonomy)

There is **no** `/api/v1/admin/organizer-categories` CRUD.

`organizer_categories` is a **pivot table**:

| Column | Description |
|--------|-------------|
| `organizer_profile_id` | FK → `organizer_profiles` |
| `event_category_id` | FK → `event_categories` |

Organizers are tagged with **event categories** they typically run (e.g. concerts, sports). Admin manages the labels via **event categories** CRUD above; organizer profiles link to them through organizer onboarding/profile APIs on the **organizer** prefix, not admin.

---

# 5. Field comparison (admin create)

| Field | Event | Talent | Vendor |
|-------|-------|--------|--------|
| `slug` | required | required | required |
| `name_en` | required | required | required |
| `name_ar` | required | required | required |
| `icon_key` | optional | — | — |
| `color_token` | optional | — | — |
| `is_active` | optional | optional | optional |
| `display_order` | optional | optional | optional |

---

# 6. Admin UI checklist

### Event categories screen

- [ ] List: `GET /event-categories` with pagination
- [ ] Create/edit form with slug, EN/AR names, Phosphor `icon_key`, `color_token`, active toggle, sort order
- [ ] Preview icons using [`frontend-handoff-event-categories-phosphor-icons.md`](frontend-handoff-event-categories-phosphor-icons.md)
- [ ] Delete: handle 422 when events still reference category
- [ ] Optional: link to public `GET /api/v1/main/events/categories` preview

### Talent categories screen

- [ ] List: `GET /talent-categories`
- [ ] Show `is_custom` badge for user-created rows (`created_by_user_id !== null`)
- [ ] Delete: handle 422 when profiles/applications use category
- [ ] Filter talent directory: `GET /profiles/talents?category_slug=…`

### Vendor service categories screen

- [ ] Same as talent, using `/vendor-service-categories` paths
- [ ] Filter vendor directory: `GET /profiles/vendors?category_slug=…` or `?service_category_id=…`

### Shared patterns

- [ ] Use `PATCH` for toggle active (`{ "is_active": false }`)
- [ ] Use `display_order` for drag-and-drop reorder (save via PATCH per row or batch PATCH calls)
- [ ] Do not duplicate slug or `name_en` — API enforces uniqueness

---

# 7. Endpoint quick reference

| Taxonomy | GET list | POST create | PATCH update | DELETE |
|----------|----------|-------------|--------------|--------|
| Event | `/event-categories` | `/event-categories` | `/event-categories/{id}` | `/event-categories/{id}` |
| Talent | `/talent-categories` | `/talent-categories` | `/talent-categories/{id}` | `/talent-categories/{id}` |
| Vendor | `/vendor-service-categories` | `/vendor-service-categories` | `/vendor-service-categories/{id}` | `/vendor-service-categories/{id}` |

**Full URLs:** `https://myticket-api.kat-jr.com/api/v1/admin` + path

**Login:** `POST /api/v1/admin/auth/login`

---

# 8. Tests (backend)

| Area | Test file |
|------|-----------|
| Admin event categories smoke | `tests/Feature/Admin/AdminEndpointsSmokeTest.php` |
| Talent categories | `tests/Feature/Marketplace/TalentCategoryTest.php` |
| Vendor categories | `tests/Feature/Marketplace/VendorDashboardGapsTest.php` |
