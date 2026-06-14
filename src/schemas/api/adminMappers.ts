import { placeholderAssetUrl } from "@/config/env";
import {
  adminProfileImageUploadSchema,
  type AdminProfileImageUploadResult,
} from "@/schemas/adminSelf.schema";
import {
  ApiJsonError,
  asObject,
  pickBool,
  pickNum,
  pickStr,
  unwrapApiJson,
} from "@/lib/apiJson";
import {
  adminAuctionListSchema,
  adminAuctionRowSchema,
  adminAuctionStatusSchema,
  adminAuctionDetailSchema,
  adminAuctionEventSummarySchema,
  adminAuctionLedgerRowSchema,
  adminAuctionPartySummarySchema,
  adminAuctionTicketSummarySchema,
  type AdminAuctionDetail,
  type AdminAuctionRow,
  type AdminAuctionStatus,
} from "@/schemas/auction.schema";
import {
  adminScanLogListSchema,
  adminScanLogRowSchema,
  adminScanLogOutcomeSchema,
  adminScannerListSchema,
  adminScannerRowSchema,
  adminScannerStatusSchema,
  type AdminScanLogOutcome,
  type AdminScanLogRow,
  type AdminScannerRow,
  type AdminScannerStatus,
} from "@/schemas/scanner.schema";
import {
  dashboardCountersSchema,
  dashboardSummaryNestedSchema,
  pendingActionSchema,
  pendingActionsResponseSchema,
  type DashboardCounters,
  type DashboardSummaryNested,
  type PendingAction,
} from "@/schemas/dashboard.schema";
import {
  roleApplicationSchema,
  roleApplicationsListSchema,
  type RoleApplication,
} from "@/schemas/roleApplication.schema";
import {
  adminProfileDirectoryListSchema,
  adminProfileDirectoryRowSchema,
  type AdminProfileDirectoryRow,
} from "@/schemas/adminProfileDirectory.schema";
import {
  talentProfileSchema,
  talentProfilesListSchema,
  type TalentProfile,
} from "@/schemas/talentApproval.schema";
import {
  adminEventListSchema,
  adminEventRowSchema,
  eventCategoryListSchema,
  eventCategorySchema,
  featuredEventsConfigSchema,
  adminEventDetailSchema,
  type AdminEventDetail,
  type AdminEventRow,
  type EventCategory,
  type FeaturedEventsConfig,
} from "@/schemas/event.schema";
import {
  financialAnalyticsSchema,
  leaderboardEventGmvRowSchema,
  leaderboardOrganizerGmvRowSchema,
  leaderboardsSchema,
  platformCountersSchema,
  revenueBreakdownRowSchema,
  revenuePointSchema,
  type FinancialAnalytics,
  type PlatformCounters,
  type Leaderboards,
} from "@/schemas/analytics.schema";
import {
  listingModerationListSchema,
  listingModerationRowSchema,
  ratingListSchema,
  ratingRowSchema,
  type ListingModerationRow,
  type RatingRow,
} from "@/schemas/moderation.schema";
import {
  adminOrderDetailSchema,
  adminOrderItemRowSchema,
  adminOrderListSchema,
  adminOrderRowSchema,
  adminOrderStatusSchema,
  adminOrderTicketRowSchema,
  type AdminOrderDetail,
  type AdminOrderRow,
  type AdminOrderStatus,
} from "@/schemas/order.schema";
import {
  adminPayoutListSchema,
  adminPayoutRowSchema,
  payoutStatusSchema,
  type AdminPayoutRow,
  type PayoutStatus,
} from "@/schemas/payout.schema";
import {
  refundBreakdownRowSchema,
  refundBreakdownsViewSchema,
  type RefundBreakdownRow,
  type RefundBreakdownsView,
} from "@/schemas/refundBreakdown.schema";
import {
  adminRefundListSchema,
  adminRefundPaymentTransactionSchema,
  adminRefundRowSchema,
  adminRefundStatusSchema,
  type AdminRefundRow,
  type AdminRefundStatus,
} from "@/schemas/refund.schema";
import {
  feeConfigurationSchema,
  notificationSettingsSchema,
  type FeeConfiguration,
  type NotificationSettings,
} from "@/schemas/settings.schema";
import {
  supportMessageSchema,
  supportThreadDetailSchema,
  supportThreadListSchema,
  supportThreadSchema,
  type SupportThread,
  type SupportThreadDetail,
} from "@/schemas/support.schema";
import {
  badgeCategoriesListResultSchema,
  badgeCategoryListSchema,
  badgeCategorySchema,
  eventCategoriesListResultSchema,
  type BadgeCategory,
  type BadgeCategoriesListResult,
  type EventCategoriesListResult,
} from "@/schemas/categoryTaxonomy.schema";
import {
  adminUserDetailSchema,
  adminUserListSchema,
  adminUserRowSchema,
  adminUsersListResultSchema,
  type AdminUserDetail,
  type AdminUserRow,
} from "@/schemas/user.schema";
import { platformUserRoleSchema } from "@/schemas/shared";
import {
  adminKycDocumentSchema,
  adminKycDocStatusSchema,
  adminOrganizerKycDetailSchema,
  type AdminKycDocStatus,
  type AdminKycDocument,
  type AdminOrganizerKycDetail,
} from "@/schemas/financeCompliance.schema";
import {
  adminActionListSchema,
  adminActionRowSchema,
  adminAuditLogDetailSchema,
  adminAuditLogListSchema,
  adminAuditLogRowSchema,
  type AdminActionRow,
  type AdminAuditLogDetail,
  type AdminAuditLogRow,
} from "@/schemas/adminActivity.schema";
import {
  adminDeliveryLogListSchema,
  adminDeliveryLogRowSchema,
  adminNotificationDeliveryStatusSchema,
  adminRecentNotificationListSchema,
  adminRecentNotificationRowSchema,
  type AdminDeliveryLogRow,
  type AdminNotificationDeliveryStatus,
  type AdminRecentNotificationRow,
} from "@/schemas/adminNotifications.schema";
import {
  adminHealthViewSchema,
  adminVersionViewSchema,
  type AdminHealthView,
  type AdminVersionView,
} from "@/schemas/adminSystem.schema";
import {
  adminComplaintListSchema,
  adminComplaintRowSchema,
  adminComplaintStatusSchema,
  type AdminComplaintRow,
  type AdminComplaintStatus,
} from "@/schemas/complaint.schema";
import {
  tourismAdSchema,
  tourismAdsListResultSchema,
  tourismAdsListSchema,
  type TourismAd,
  type TourismAdsListResult,
  type WeekdayKey,
  WEEKDAY_KEYS,
} from "@/schemas/tourismAd.schema";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function flattenPendingActionBuckets(container: Record<string, unknown>): unknown[] {
  const buckets = [
    container.events_pending_approval,
    container.role_applications_submitted,
    container.support_cases_open,
    container.support_cases_open_pipeline,
    container.listing_moderation_queue,
    container.listing_moderation_queued_or_in_review,
    container.tourism_ads_pending_review,
  ].filter(Array.isArray);
  return buckets.flat();
}

function extractPendingActionsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const fromRoot = flattenPendingActionBuckets(inner);
    if (fromRoot.length > 0) return fromRoot;
    const data = inner.data;
    if (isRecord(data)) {
      const fromData = flattenPendingActionBuckets(data);
      if (fromData.length > 0) return fromData;
    }
    const nested = inner.items ?? inner.pending_actions ?? inner.pendingActions;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected pending actions array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

function intNonNeg(n: number | undefined, fallback = 0): number {
  if (n === undefined || !Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
}

export function mapDashboardCountersFromApi(raw: unknown): DashboardCounters {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const candidate = {
    usersTotal: intNonNeg(pickNum(o, "usersTotal", "users_total")),
    usersSuspended: intNonNeg(pickNum(o, "usersSuspended", "users_suspended")),
    eventsPendingApproval: intNonNeg(
      pickNum(o, "eventsPendingApproval", "events_pending_approval"),
    ),
    eventsPublished: intNonNeg(
      pickNum(o, "eventsPublished", "events_published"),
    ),
    supportCasesOpenPipeline: intNonNeg(
      pickNum(o, "supportCasesOpenPipeline", "support_cases_open_pipeline"),
    ),
    listingModerationQueuedOrInReview: intNonNeg(
      pickNum(
        o,
        "listingModerationQueuedOrInReview",
        "listing_moderation_queued_or_in_review",
      ),
    ),
    roleApplicationsSubmitted: intNonNeg(
      pickNum(o, "roleApplicationsSubmitted", "role_applications_submitted"),
    ),
    payoutsHeld: intNonNeg(pickNum(o, "payoutsHeld", "payouts_held")),
    tourismAdsPendingReview: intNonNeg(
      pickNum(o, "tourismAdsPendingReview", "tourism_ads_pending_review"),
    ),
  };
  return dashboardCountersSchema.parse(candidate);
}

export function dashboardCountersFromSummary(
  summary: DashboardSummaryNested,
): DashboardCounters {
  return dashboardCountersSchema.parse({
    usersTotal: summary.users.total,
    usersSuspended: summary.users.suspended,
    eventsPendingApproval: summary.events.pendingApproval,
    eventsPublished: summary.events.published,
    supportCasesOpenPipeline: summary.supportCases.openPipeline,
    listingModerationQueuedOrInReview: summary.listingModeration.queuedOrInReview,
    roleApplicationsSubmitted: summary.roleApplications.submitted,
    payoutsHeld: summary.payouts.held,
    tourismAdsPendingReview: summary.tourismAds?.pendingReview ?? 0,
  });
}

/** Maps `GET /dashboard/counters` (flat KPIs) into analytics platform counters UI shape. */
export function mapPlatformCountersFromApi(raw: unknown): PlatformCounters {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const usersByRoleRaw = isRecord(o.users_by_role)
    ? asObject(o.users_by_role)
    : isRecord(o.usersByRole)
      ? asObject(o.usersByRole)
      : null;
  const eventsByStatusRaw = isRecord(o.events_by_status)
    ? asObject(o.events_by_status)
    : isRecord(o.eventsByStatus)
      ? asObject(o.eventsByStatus)
      : null;

  if (usersByRoleRaw && eventsByStatusRaw) {
    return platformCountersSchema.parse({
      usersByRole: {
        guest: intNonNeg(pickNum(usersByRoleRaw, "guest")),
        talent: intNonNeg(pickNum(usersByRoleRaw, "talent")),
        vendor: intNonNeg(pickNum(usersByRoleRaw, "vendor")),
        organizer: intNonNeg(pickNum(usersByRoleRaw, "organizer")),
      },
      eventsByStatus: {
        active: intNonNeg(pickNum(eventsByStatusRaw, "active")),
        ended: intNonNeg(pickNum(eventsByStatusRaw, "ended")),
        cancelled: intNonNeg(pickNum(eventsByStatusRaw, "cancelled", "canceled")),
        archived: intNonNeg(pickNum(eventsByStatusRaw, "archived")),
      },
      ticketsSold: intNonNeg(pickNum(o, "ticketsSold", "tickets_sold")),
      bookings: intNonNeg(pickNum(o, "bookings")),
      ratings: intNonNeg(pickNum(o, "ratings")),
    });
  }

  const flat = mapDashboardCountersFromApi(raw);
  return platformCountersSchema.parse({
    usersByRole: {
      guest: flat.usersTotal,
      talent: 0,
      vendor: 0,
      organizer: 0,
    },
    eventsByStatus: {
      active: flat.eventsPublished,
      ended: 0,
      cancelled: 0,
      archived: 0,
    },
    ticketsSold: intNonNeg(pickNum(o, "ticketsSold", "tickets_sold")),
    bookings: intNonNeg(pickNum(o, "bookings")),
    ratings: intNonNeg(pickNum(o, "ratings")),
  });
}

function pickNestedNum(
  container: Record<string, unknown>,
  camel: string,
  snake: string,
): number {
  return intNonNeg(pickNum(container, camel, snake));
}

export function mapDashboardSummaryFromApi(
  raw: unknown,
): DashboardSummaryNested {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const users = isRecord(o.users) ? asObject(o.users) : {};
  const events = isRecord(o.events) ? asObject(o.events) : {};
  const supportCases = isRecord(o.support_cases)
    ? asObject(o.support_cases)
    : isRecord(o.supportCases)
      ? asObject(o.supportCases)
      : {};
  const listingMod = isRecord(o.listing_moderation)
    ? asObject(o.listing_moderation)
    : isRecord(o.listingModeration)
      ? asObject(o.listingModeration)
      : {};
  const roleApps = isRecord(o.role_applications)
    ? asObject(o.role_applications)
    : isRecord(o.roleApplications)
      ? asObject(o.roleApplications)
      : {};
  const payouts = isRecord(o.payouts) ? asObject(o.payouts) : {};
  const tourismAds = isRecord(o.tourism_ads)
    ? asObject(o.tourism_ads)
    : isRecord(o.tourismAds)
      ? asObject(o.tourismAds)
      : {};
  const candidate = {
    users: {
      total: pickNestedNum(users, "total", "total"),
      suspended: pickNestedNum(users, "suspended", "suspended"),
    },
    events: {
      pendingApproval: pickNestedNum(
        events,
        "pendingApproval",
        "pending_approval",
      ),
      published: pickNestedNum(events, "published", "published"),
    },
    supportCases: {
      openPipeline: pickNestedNum(
        supportCases,
        "openPipeline",
        "open_pipeline",
      ),
    },
    listingModeration: {
      queuedOrInReview: pickNestedNum(
        listingMod,
        "queuedOrInReview",
        "queued_or_in_review",
      ),
    },
    roleApplications: {
      submitted: pickNestedNum(roleApps, "submitted", "submitted"),
    },
    payouts: {
      held: pickNestedNum(payouts, "held", "held"),
    },
    tourismAds: {
      pendingReview: pickNestedNum(
        tourismAds,
        "pendingReview",
        "pending_review",
      ),
    },
  };
  return dashboardSummaryNestedSchema.parse(candidate);
}

function mapPendingActionRow(row: unknown): PendingAction {
  const o = asObject(row);

  // If already has kind, use it (for mock or old API)
  const existingKind = pickStr(o, "kind");
  if (
    existingKind &&
    [
      "role_application",
      "event",
      "support",
      "moderation",
      "tourism_ad",
    ].includes(existingKind)
  ) {
    const priorityRaw = pickStr(o, "priority");
    const priority = priorityRaw === "high" ? "high" : "normal";
    const existingIdNum = pickNum(o, "id");
    const candidate = {
      id:
        pickStr(o, "id") ??
        (existingIdNum !== undefined ? String(Math.trunc(existingIdNum)) : ""),
      kind: existingKind as
        | "role_application"
        | "event"
        | "support"
        | "moderation"
        | "tourism_ad",
      title: pickStr(o, "title") ?? "",
      subtitle: pickStr(o, "subtitle", "sub_title") ?? "",
      href: pickStr(o, "href") ?? "#",
      priority,
      imageUrl:
        pickStr(o, "imageUrl", "image_url") ??
        placeholderAssetUrl("placeholder-image"),
      dueLabel: pickStr(o, "dueLabel", "due_label") ?? "",
    };
    return pendingActionSchema.parse(candidate);
  }

  // Detect type based on fields (for grouped buckets)
  let kind:
    | "role_application"
    | "event"
    | "support"
    | "moderation"
    | "tourism_ad" = "role_application";
  let title = "";
  let subtitle = "";
  let href = "#";
  let priority: "high" | "normal" = "normal";
  let dueLabel = "";

  const idNum = pickNum(o, "id");
  const id =
    pickStr(o, "id") ?? (idNum !== undefined ? String(Math.trunc(idNum)) : "");

  if (o.title && o.code && o.submitted_at) {
    // Event
    kind = "event";
    title = pickStr(o, "title") ?? "";
    subtitle = pickStr(o, "code") ?? "";
    href = `/events/${id}`;
    priority = "high";
    dueLabel = pickStr(o, "submitted_at") ?? "";
  } else if (o.applicant && o.submitted_at) {
    // Role application
    kind = "role_application";
    const applicant = isRecord(o.applicant) ? asObject(o.applicant) : {};
    title =
      pickStr(applicant, "full_name", "name") ??
      pickStr(o, "applicant_name") ??
      "";
    subtitle = pickStr(applicant, "email") ?? pickStr(o, "email") ?? "";
    href = `/approvals/roles/${id}`;
    dueLabel = pickStr(o, "submitted_at") ?? "";
  } else if (o.subject && o.created_at) {
    // Support case
    kind = "support";
    title = pickStr(o, "subject") ?? "";
    subtitle = pickStr(o, "code") ?? "";
    href = `/support/${id}`;
    priority = pickStr(o, "priority") === "high" ? "high" : "normal";
    dueLabel = pickStr(o, "created_at") ?? "";
  } else if (o.listing_kind && o.flag_reason) {
    // Moderation
    kind = "moderation";
    title = pickStr(o, "listing_kind") ?? "";
    subtitle = pickStr(o, "flag_reason") ?? "";
    href = `/moderation/listings`;
    priority = "high";
    dueLabel = pickStr(o, "created_at") ?? "";
  } else if (o.location_name && (o.submitted_at || o.status === "pending_review")) {
    kind = "tourism_ad";
    title = pickStr(o, "location_name") ?? "Tourism ad";
    const user = isRecord(o.user) ? asObject(o.user) : {};
    subtitle =
      pickStr(user, "full_name", "email") ??
      pickStr(o, "source") ??
      "Guest submission";
    href = normalizeNotificationHref(pickStr(o, "href")) ?? `/tourism-ads/${id}`;
    priority = "high";
    dueLabel = pickStr(o, "submitted_at", "created_at") ?? "";
  }

  const candidate = {
    id,
    kind,
    title,
    subtitle,
    href,
    priority,
    imageUrl: placeholderAssetUrl("placeholder-image"),
    dueLabel,
  };
  return pendingActionSchema.parse(candidate);
}

export function mapPendingActionsFromApi(raw: unknown): PendingAction[] {
  const rows = extractPendingActionsPayload(raw);
  const mapped = rows.map(mapPendingActionRow);
  return pendingActionsResponseSchema.parse(mapped);
}

function extractRoleApplicationsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (Array.isArray(inner.data)) return inner.data;
    // Handle nested pagination: { data: { current_page, data: [...], ... } }
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested =
      inner.items ??
      inner.role_applications ??
      inner.roleApplications ??
      inner.applications;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected role applications array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

export function mapRoleApplicationFromApi(raw: unknown): RoleApplication {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const user = isRecord(o.user) ? asObject(o.user) : undefined;
  const applicant = isRecord(o.applicant) ? asObject(o.applicant) : undefined;
  const rejectReason = pickStr(
    o,
    "rejectReason",
    "reject_reason",
    "rejection_reason",
  );
  const idNum = pickNum(o, "id");
  const idStr =
    pickStr(o, "id") ?? (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  const roleType =
    pickStr(o, "type", "role_type", "requested_role", "role") ?? "talent";
  const candidate = {
    id: idStr,
    applicantName:
      pickStr(
        o,
        "applicantName",
        "applicant_name",
        "name",
        "full_name",
        "display_name",
        "stage_name",
      ) ??
      (user ? pickStr(user, "full_name", "name", "display_name") : undefined) ??
      (applicant ? pickStr(applicant, "full_name", "name", "display_name") : undefined) ??
      "",
    email:
      pickStr(o, "email", "applicant_email", "contact_email") ??
      (user ? pickStr(user, "email", "email_address") : undefined) ??
      (applicant ? pickStr(applicant, "email", "email_address") : undefined) ??
      "",
    type: roleType,
    status: pickStr(o, "status", "review_status") ?? "pending",
    submittedAt: pickStr(o, "submittedAt", "submitted_at", "created_at") ?? "",
    documentsSummary:
      pickStr(o, "documentsSummary", "documents_summary", "documents") ?? "",
    ...(rejectReason ? { rejectReason } : {}),
  };
  return roleApplicationSchema.parse(candidate);
}

export function mapRoleApplicationsFromApi(raw: unknown): RoleApplication[] {
  const rows = extractRoleApplicationsPayload(raw);
  const mapped = rows.map(mapRoleApplicationFromApi);
  return roleApplicationsListSchema.parse(mapped);
}

function extractTalentProfilesPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (Array.isArray(inner.data)) return inner.data;
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested =
      inner.items ??
      inner.talents ??
      inner.talent_profiles ??
      inner.talentProfiles ??
      inner.profiles ??
      inner.data;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected talent profiles array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

function parseGenres(o: Record<string, unknown>): string[] {
  const g = o.genres ?? o.genre ?? o.music_genres;
  if (Array.isArray(g))
    return g.filter((x): x is string => typeof x === "string" && x.length > 0);
  if (typeof g === "string" && g.trim()) {
    return g
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseTalentCategoryLabels(o: Record<string, unknown>): string[] {
  const fromGenres = parseGenres(o);
  if (fromGenres.length) return fromGenres;
  const cats = o.categories;
  if (!Array.isArray(cats)) return [];
  return cats
    .map((cat) => {
      if (typeof cat === "string" && cat.trim()) return cat.trim();
      if (!isRecord(cat)) return "";
      return (
        pickStr(
          cat,
          "name_en",
          "nameEn",
          "name_ar",
          "nameAr",
          "name",
          "label",
          "title",
          "slug",
        ) ?? ""
      );
    })
    .filter(Boolean);
}

function parseTalentGallery(o: Record<string, unknown>) {
  const gallery = o.gallery;
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((item, idx) => {
      const g = asObject(unwrapApiJson(item));
      const idNum = pickNum(g, "id");
      const idStr =
        pickStr(g, "id") ??
        (idNum !== undefined ? String(Math.trunc(idNum)) : String(idx));
      const imageUrl = pickStr(g, "image_url", "imageUrl", "url") ?? "";
      if (!imageUrl) return null;
      const caption = pickStr(g, "caption") ?? undefined;
      const position = intNonNeg(
        pickNum(g, "position", "sort_order", "sortOrder") ?? idx,
      );
      return { id: idStr, imageUrl, caption, position };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.position - b.position);
}

function formatTalentLocation(
  city: string,
  country: string,
  regionId?: number,
  cityId?: number,
): { city: string; country: string } {
  let nextCity = city.trim();
  let nextCountry = country.trim();
  if (!nextCity && cityId !== undefined) nextCity = `City #${cityId}`;
  if (!nextCountry && regionId !== undefined) nextCountry = `Region #${regionId}`;
  return { city: nextCity, country: nextCountry };
}

/** Unwrap admin talent directory rows: `{ approval_status, role_application_id, profile }`. */
function normalizeTalentDirectoryRow(raw: unknown): Record<string, unknown> {
  const o = asObject(unwrapApiJson(raw));
  const profile = isRecord(o.profile) ? asObject(o.profile) : null;
  if (!profile) return o;

  const merged: Record<string, unknown> = { ...profile };
  const profileId = pickNum(profile, "id");
  if (profileId !== undefined) merged.id = Math.trunc(profileId);

  const roleApplicationId =
    pickNum(o, "role_application_id", "roleApplicationId") ??
    pickNum(profile, "application_id", "applicationId");
  if (roleApplicationId !== undefined) {
    merged.application_id = Math.trunc(roleApplicationId);
    merged.role_application_id = Math.trunc(roleApplicationId);
  }

  const approvalStatus = pickStr(o, "approval_status", "approvalStatus");
  if (approvalStatus) merged.approval_status = approvalStatus;

  const govStatus = pickStr(
    o,
    "government_id_status",
    "governmentIdStatus",
    "government_id_verification_status",
  );
  if (govStatus) merged.government_id_status = govStatus;

  const govVerification =
    o.government_id_verification ?? o.governmentIdVerification;
  if (govVerification !== undefined) {
    merged.government_id_verification = govVerification;
  }

  const isActive = pickBool(o, "is_active", "isActive");
  if (isActive !== undefined) merged.is_active = isActive;

  return merged;
}

function parseGovernmentIdVerification(o: Record<string, unknown>) {
  const raw = o.government_id_verification ?? o.governmentIdVerification;
  if (!isRecord(raw)) return undefined;
  const g = asObject(raw);
  const idNum = pickNum(g, "id");
  const idStr =
    pickStr(g, "id") ?? (idNum !== undefined ? String(Math.trunc(idNum)) : undefined);
  const statusRaw = pickStr(g, "status", "government_id_status");
  const status =
    statusRaw === "verified" || statusRaw === "rejected" || statusRaw === "pending"
      ? statusRaw
      : undefined;
  const rejectionReason = pickStr(
    g,
    "rejection_reason",
    "rejectionReason",
    "reject_reason",
  );
  const candidate = {
    ...(idStr ? { id: idStr } : {}),
    ...(pickStr(g, "document_type", "documentType")
      ? { documentType: pickStr(g, "document_type", "documentType") }
      : {}),
    ...(pickStr(g, "document_number", "documentNumber")
      ? { documentNumber: pickStr(g, "document_number", "documentNumber") }
      : {}),
    ...(pickStr(g, "front_image_url", "frontImageUrl")
      ? { frontImageUrl: pickStr(g, "front_image_url", "frontImageUrl") }
      : {}),
    ...(pickStr(g, "back_image_url", "backImageUrl")
      ? { backImageUrl: pickStr(g, "back_image_url", "backImageUrl") }
      : {}),
    ...(pickStr(g, "selfie_url", "selfieUrl")
      ? { selfieUrl: pickStr(g, "selfie_url", "selfieUrl") }
      : {}),
    ...(status ? { status } : {}),
    ...(rejectionReason ? { rejectionReason } : {}),
    ...(pickStr(g, "issue_date", "issueDate")
      ? { issueDate: pickStr(g, "issue_date", "issueDate") }
      : {}),
    ...(pickStr(g, "expiry_date", "expiryDate")
      ? { expiryDate: pickStr(g, "expiry_date", "expiryDate") }
      : {}),
    ...(pickStr(g, "submitted_at", "submittedAt", "created_at")
      ? {
          submittedAt: pickStr(g, "submitted_at", "submittedAt", "created_at"),
        }
      : {}),
  };
  return Object.keys(candidate).length ? candidate : undefined;
}

/** Talent detail `GET /profiles/talents/{id}` — unwraps `data` and merges nested `user` for list-matching `TalentProfile`. */
export function mapTalentProfileDetailFromApi(raw: unknown): TalentProfile {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const user = isRecord(o.user) ? asObject(o.user) : undefined;
  const application = isRecord(o.application) ? asObject(o.application) : undefined;
  const idStr = o.id !== undefined && o.id !== null ? String(o.id) : "";
  const merged: Record<string, unknown> = { ...o, id: idStr };
  if (user) {
    const email =
      pickStr(merged, "email") ??
      pickStr(user, "email", "email_address") ??
      (idStr ? `talent-${idStr}@example.com` : "talent-unknown@example.com");
    merged.email = email;
    const phone =
      pickStr(merged, "phone", "phone_number", "mobile") ??
      pickStr(user, "phone", "phone_number", "mobile");
    if (phone) merged.phone = phone;
    const legal =
      pickStr(merged, "legalName", "legal_name", "full_name", "name") ??
      pickStr(user, "full_name", "name", "legal_name");
    if (legal) merged.legalName = legal;
    const emailVerifiedAt = pickStr(
      user,
      "email_verified_at",
      "emailVerifiedAt",
    );
    if (emailVerifiedAt) merged.email_verified_at = emailVerifiedAt;
    const phoneVerifiedAt = pickStr(
      user,
      "phone_verified_at",
      "phoneVerifiedAt",
    );
    if (phoneVerifiedAt) merged.phone_verified_at = phoneVerifiedAt;
  }
  if (application) {
    const contactEmail = pickStr(
      application,
      "contact_email",
      "contactEmail",
    );
    const contactPhone = pickStr(
      application,
      "contact_phone",
      "contactPhone",
    );
    if (contactEmail) merged.contact_email = contactEmail;
    if (contactPhone) merged.contact_phone = contactPhone;
  }
  return mapTalentProfileFromApi(merged);
}

export function mapTalentProfileFromApi(raw: unknown): TalentProfile {
  const inner = unwrapApiJson(raw);
  const o = normalizeTalentDirectoryRow(inner);
  const application = isRecord(o.application) ? asObject(o.application) : {};
  const rejectReason =
    pickStr(o, "rejectReason", "reject_reason", "rejection_reason") ??
    pickStr(application, "rejectReason", "reject_reason", "rejection_reason");
  const gov =
    pickStr(
      o,
      "governmentIdStatus",
      "government_id_status",
      "id_verification_status",
    ) ??
    pickStr(
      application,
      "governmentIdStatus",
      "government_id_status",
      "id_verification_status",
    );
  const st =
    pickStr(o, "status", "review_status", "approval_status") ??
    pickStr(application, "status", "review_status", "approval_status") ??
    "pending"; // Default to pending if no status
  const status =
    st === "approved" || st === "rejected" || st === "pending" ? st : "pending";
  const ratingRaw =
    pickNum(
      o,
      "averageRating",
      "average_rating",
      "rating_average",
      "rating",
    ) ?? 0;
  const averageRating = Math.min(5, Math.max(0, ratingRaw));
  const ratingCountNum = pickNum(
    o,
    "ratingCount",
    "rating_count",
    "reviews_count",
  );
  const idNum = pickNum(o, "id");
  const idStr =
    pickStr(o, "id") ?? (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  const slug = pickStr(o, "slug", "profile_slug");
  const userId = pickNum(o, "user_id", "userId");
  const applicationId =
    pickNum(o, "application_id", "applicationId") ??
    pickNum(o, "role_application_id", "roleApplicationId");
  const emailFromRow = pickStr(o, "email", "user_email");
  const email =
    emailFromRow ??
    (userId !== undefined
      ? `talent-user-${Math.trunc(userId)}@example.com`
      : idStr
        ? `talent-profile-${idStr}@example.com`
        : "talent-unknown@example.com");
  const regionId =
    pickNum(o, "region_id", "regionId", "saudi_region_id") ??
    pickNum(application, "region_id", "regionId", "saudi_region_id");
  const cityId =
    pickNum(o, "city_id", "cityId") ??
    pickNum(application, "city_id", "cityId");
  const location = formatTalentLocation(
    pickStr(o, "city") ?? pickStr(application, "city") ?? "",
    pickStr(o, "country") ?? pickStr(application, "country") ?? "",
    regionId,
    cityId,
  );
  const contactEmail = pickStr(
    o,
    "contact_email",
    "contactEmail",
  ) ?? pickStr(application, "contact_email", "contactEmail");
  const contactPhone = pickStr(
    o,
    "contact_phone",
    "contactPhone",
  ) ?? pickStr(application, "contact_phone", "contactPhone");
  const governmentIdVerification = parseGovernmentIdVerification(o);
  const candidate = {
    id: idStr,
    ...(slug ? { slug } : {}),
    ...(userId !== undefined ? { userId: String(Math.trunc(userId)) } : {}),
    ...(applicationId !== undefined
      ? { applicationId: String(Math.trunc(applicationId)) }
      : {}),
    stageName:
      pickStr(o, "stageName", "stage_name", "artist_name", "display_name") ??
      pickStr(application, "stageName", "stage_name") ??
      "",
    legalName:
      pickStr(o, "legalName", "legal_name", "full_name", "name") ??
      pickStr(application, "legalName", "legal_name", "full_name", "name") ??
      pickStr(o, "stageName", "stage_name") ?? // Fallback to stage name
      "",
    email,
    phone:
      pickStr(o, "phone", "phone_number", "mobile") ??
      pickStr(application, "contact_phone", "contactPhone") ??
      "",
    ...(contactEmail ? { contactEmail } : {}),
    ...(contactPhone ? { contactPhone } : {}),
    country: location.country,
    city: location.city,
    ...(regionId !== undefined ? { regionId: Math.trunc(regionId) } : {}),
    ...(cityId !== undefined ? { cityId: Math.trunc(cityId) } : {}),
    genres: parseTalentCategoryLabels(o),
    yearsExperience: intNonNeg(
      pickNum(o, "yearsExperience", "years_experience", "experience_years") ??
        pickNum(
          application,
          "yearsExperience",
          "years_experience",
          "experience_years",
        ) ??
        0, // Default to 0 if not provided
    ),
    bio:
      pickStr(o, "bio", "biography", "description") ??
      pickStr(application, "bio", "biography", "description") ??
      "",
    websiteUrl:
      pickStr(o, "websiteUrl", "website_url", "website") ??
      pickStr(application, "websiteUrl", "website_url", "website") ??
      "",
    instagramHandle:
      pickStr(o, "instagramHandle", "instagram_handle", "instagram") ??
      pickStr(application, "instagramHandle", "instagram_handle", "instagram") ??
      "",
    status,
    mediaQualityNote:
      pickStr(o, "mediaQualityNote", "media_quality_note", "media_note") ??
      pickStr(
        application,
        "mediaQualityNote",
        "media_quality_note",
        "media_note",
      ) ??
      "",
    certificatesSummary:
      pickStr(
        o,
        "certificatesSummary",
        "certificates_summary",
        "certificates",
        "certs_summary",
      ) ??
      pickStr(
        application,
        "certificatesSummary",
        "certificates_summary",
        "certificates",
        "certs_summary",
      ) ??
      pickStr(application, "certificate_name") ??
      "",
    submittedAt:
      pickStr(o, "submittedAt", "submitted_at", "created_at", "updated_at") ??
      pickStr(
        application,
        "submittedAt",
        "submitted_at",
        "created_at",
        "updated_at",
      ) ??
      "",
    introVideoUrl:
      pickStr(o, "introVideoUrl", "intro_video_url", "video_url") ??
      pickStr(application, "introVideoUrl", "intro_video_url", "video_url") ??
      "",
    headshotUrl:
      pickStr(
        o,
        "headshotUrl",
        "headshot_url",
        "avatar_url",
        "photo_url",
        "profile_image_url",
      ) ??
      pickStr(
        application,
        "headshotUrl",
        "headshot_url",
        "avatar_url",
        "photo_url",
        "profile_image_url",
      ) ??
      "",
    portfolioPdfUrl:
      pickStr(o, "portfolioPdfUrl", "portfolio_pdf_url", "portfolio_url") ??
      pickStr(
        application,
        "portfolioPdfUrl",
        "portfolio_pdf_url",
        "portfolio_url",
      ) ??
      "",
    governmentIdStatus:
      gov === "verified" || gov === "rejected" || gov === "pending"
        ? gov
        : "pending",
    ...(governmentIdVerification ? { governmentIdVerification } : {}),
    bankVerified:
      pickBool(o, "bankVerified", "bank_verified") ??
      pickBool(application, "bankVerified", "bank_verified") ??
      false,
    completedBookings: intNonNeg(
      pickNum(o, "completedBookings", "completed_bookings", "bookings_count") ??
        0,
    ),
    averageRating,
    ...(ratingCountNum !== undefined
      ? { ratingCount: intNonNeg(ratingCountNum) }
      : {}),
    ...(pickBool(o, "travel_ready", "travelReady") !== undefined
      ? {
          travelReady: pickBool(o, "travel_ready", "travelReady") ?? false,
        }
      : pickBool(application, "travel_ready", "travelReady") !== undefined
        ? {
            travelReady:
              pickBool(application, "travel_ready", "travelReady") ?? false,
          }
        : {}),
    ...(pickBool(o, "location_public", "locationPublic") !== undefined
      ? {
          locationPublic:
            pickBool(o, "location_public", "locationPublic") ?? false,
        }
      : pickBool(application, "location_public", "locationPublic") !==
          undefined
        ? {
            locationPublic:
              pickBool(application, "location_public", "locationPublic") ??
              false,
          }
        : {}),
    ...(pickStr(o, "availability_status", "availabilityStatus") ??
    pickStr(application, "availability_status", "availabilityStatus")
      ? {
          availabilityStatus:
            pickStr(o, "availability_status", "availabilityStatus") ??
            pickStr(application, "availability_status", "availabilityStatus") ??
            "",
        }
      : {}),
    ...(pickBool(
      o,
      "accepted_quality_disclaimer",
      "acceptedQualityDisclaimer",
    ) !== undefined
      ? {
          acceptedQualityDisclaimer:
            pickBool(
              o,
              "accepted_quality_disclaimer",
              "acceptedQualityDisclaimer",
            ) ?? false,
        }
      : pickBool(
            application,
            "accepted_quality_disclaimer",
            "acceptedQualityDisclaimer",
          ) !== undefined
        ? {
            acceptedQualityDisclaimer:
              pickBool(
                application,
                "accepted_quality_disclaimer",
                "acceptedQualityDisclaimer",
              ) ?? false,
          }
        : {}),
    ...(pickStr(o, "email_verified_at", "emailVerifiedAt")
      ? {
          emailVerified: true,
        }
      : {}),
    ...(pickStr(o, "phone_verified_at", "phoneVerifiedAt")
      ? {
          phoneVerified: true,
        }
      : {}),
    ...(pickBool(o, "is_active", "isActive") !== undefined
      ? { isActive: pickBool(o, "is_active", "isActive") ?? false }
      : {}),
    gallery: parseTalentGallery(o),
    ...(rejectReason ? { rejectReason } : {}),
  };
  return talentProfileSchema.parse(candidate);
}

export function mapTalentProfilesFromApi(raw: unknown): TalentProfile[] {
  const rows = extractTalentProfilesPayload(raw);
  const mapped = rows.map((row) => mapTalentProfileFromApi(normalizeTalentDirectoryRow(row)));
  return talentProfilesListSchema.parse(mapped);
}

function extractProfileDirectoryPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (Array.isArray(inner.data)) return inner.data;
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested =
      inner.items ??
      inner.vendors ??
      inner.organizers ??
      inner.vendor_profiles ??
      inner.organizer_profiles ??
      inner.profiles ??
      inner.data ??
      inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected profile directory array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

export function mapAdminProfileDirectoryRowFromApi(
  raw: unknown,
): AdminProfileDirectoryRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idNum = pickNum(o, "id", "vendor_id", "organizer_id", "uuid");
  const idStr =
    pickStr(o, "id", "vendor_id", "organizer_id", "uuid") ??
    (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  let displayName =
    pickStr(
      o,
      "displayName",
      "display_name",
      "name",
      "business_name",
      "businessName",
      "title",
      "organization_name",
      "organizationName",
      "legal_name",
      "legalName",
    )?.trim() ?? "";
  if (!displayName) {
    const slug = pickStr(o, "slug");
    displayName = slug ? slug.replace(/-/g, " ") : idStr;
  }
  if (!displayName) displayName = "Unnamed";
  const userIdNum = pickNum(o, "user_id", "userId");
  const linkedUserId =
    userIdNum !== undefined ? String(Math.trunc(userIdNum)) : undefined;
  const email = pickStr(o, "email", "contact_email", "contactEmail");
  const status = pickStr(
    o,
    "status",
    "review_status",
    "account_status",
    "accountStatus",
    "availability_status", // For profiles that have availability
  );
  const slugVal = pickStr(o, "slug");
  const city = pickStr(o, "city");
  const country = pickStr(o, "country", "country_code");
  const updatedAt = pickStr(o, "updatedAt", "updated_at", "modified_at");
  const bio = pickStr(o, "bio", "description", "about");
  const profileImageUrl = pickStr(
    o,
    "profile_image_url",
    "profileImageUrl",
    "avatar_url",
    "headshot_url",
    "logo_url",
  );
  const ratingRaw = pickNum(
    o,
    "rating_average",
    "ratingAverage",
    "average_rating",
    "averageRating",
  );
  const ratingAverage =
    ratingRaw !== undefined
      ? Math.min(5, Math.max(0, ratingRaw))
      : undefined;
  const completedBookingsNum = pickNum(
    o,
    "completed_bookings",
    "completedBookings",
    "bookings_count",
  );
  const completedBookings =
    completedBookingsNum !== undefined
      ? Math.max(0, Math.trunc(completedBookingsNum))
      : undefined;
  const availabilityStatus = pickStr(
    o,
    "availability_status",
    "availabilityStatus",
  );
  const coverageArea = pickStr(o, "coverage_area", "coverageArea", "service_area");
  const instagramHandle = pickStr(
    o,
    "instagram_handle",
    "instagramHandle",
    "instagram",
  );
  const websiteUrl = pickStr(o, "website_url", "websiteUrl", "website");
  const candidate = {
    id: idStr || slugVal || displayName,
    displayName,
    ...(email ? { email } : {}),
    ...(linkedUserId ? { linkedUserId } : {}),
    ...(slugVal ? { slug: slugVal } : {}),
    ...(city ? { city } : {}),
    ...(country ? { country } : {}),
    ...(status ? { status } : {}),
    ...(updatedAt ? { updatedAt } : {}),
    ...(bio ? { bio } : {}),
    ...(profileImageUrl ? { profileImageUrl } : {}),
    ...(ratingAverage !== undefined ? { ratingAverage } : {}),
    ...(completedBookings !== undefined ? { completedBookings } : {}),
    ...(availabilityStatus ? { availabilityStatus } : {}),
    ...(coverageArea ? { coverageArea } : {}),
    ...(instagramHandle ? { instagramHandle } : {}),
    ...(websiteUrl ? { websiteUrl } : {}),
  };
  return adminProfileDirectoryRowSchema.parse(candidate);
}

/** Maps vendor or organizer admin profile list payloads into directory rows. */
export function mapAdminProfileDirectoryFromApi(
  raw: unknown,
): AdminProfileDirectoryRow[] {
  const rows = extractProfileDirectoryPayload(raw);
  const mapped = rows.map(mapAdminProfileDirectoryRowFromApi);
  return adminProfileDirectoryListSchema.parse(mapped);
}

function extractUsersPayload(raw: unknown): unknown[] {
  if (isRecord(raw) && isLaravelPaginator(raw)) return raw.data as unknown[];

  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (isLaravelPaginator(inner)) return inner.data as unknown[];
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      if (isLaravelPaginator(dataObj)) return dataObj.data as unknown[];
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested =
      inner.items ??
      inner.users ??
      inner.data ??
      inner.results ??
      inner.members;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected users array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function extractUsersPaginatorMeta(raw: unknown) {
  const readMeta = (block: Record<string, unknown>) => ({
    currentPage: intNonNeg(pickNum(block, "current_page", "currentPage"), 1),
    perPage: intNonNeg(pickNum(block, "per_page", "perPage"), 30),
    total: intNonNeg(pickNum(block, "total"), 0),
  });

  if (isRecord(raw) && isLaravelPaginator(raw)) return readMeta(raw);

  if (isRecord(raw)) {
    const wrapped = raw.data;
    if (isRecord(wrapped) && isLaravelPaginator(wrapped)) return readMeta(wrapped);
  }

  const inner = unwrapApiJson(raw);
  if (isRecord(inner) && isLaravelPaginator(inner)) return readMeta(inner);
  if (isRecord(inner)) {
    const nested = inner.data;
    if (isRecord(nested) && isLaravelPaginator(nested)) return readMeta(nested);
  }

  return { currentPage: 1, perPage: 30, total: 0 };
}

function normalizePlatformRole(raw: string | undefined): AdminUserRow["role"] {
  const r = (raw ?? "guest").toLowerCase();
  const parsed = platformUserRoleSchema.safeParse(r);
  if (parsed.success) return parsed.data;
  return "guest";
}

function pickUserId(o: Record<string, unknown>): string {
  const idStr = pickStr(o, "id", "user_id", "uuid");
  const idNum = pickNum(o, "id", "user_id");
  return idStr ?? (idNum !== undefined ? String(idNum) : "");
}

function pickUserDisplayName(o: Record<string, unknown>): string {
  return (
    pickStr(o, "displayName", "display_name", "name", "full_name", "username") ??
    pickStr(o, "email")?.split("@")[0] ??
    ""
  );
}

export function mapAdminUserRowFromApi(raw: unknown): AdminUserRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const candidate = {
    id: pickUserId(o),
    displayName: pickUserDisplayName(o),
    email: pickStr(o, "email") ?? "",
    ...(pickStr(o, "phone") ? { phone: pickStr(o, "phone") } : {}),
    role: normalizePlatformRole(pickStr(o, "role", "user_role", "type")),
    suspended: pickBool(o, "suspended", "is_suspended", "banned") ?? false,
    ...(pickBool(o, "is_active", "isActive") !== undefined
      ? { isActive: pickBool(o, "is_active", "isActive") }
      : {}),
    joinedAt:
      pickStr(o, "joinedAt", "joined_at", "created_at", "registered_at") ?? "",
  };
  return adminUserRowSchema.parse(candidate);
}

export function mapAdminUsersListFromApi(raw: unknown) {
  const rows = extractUsersPayload(raw);
  const meta = extractUsersPaginatorMeta(raw);
  const items = rows.map(mapAdminUserRowFromApi);
  return adminUsersListResultSchema.parse({
    items: adminUserListSchema.parse(items),
    currentPage: meta.currentPage || 1,
    perPage: meta.perPage || 30,
    total: meta.total || items.length,
  });
}

export function mapAdminUsersFromApi(raw: unknown): AdminUserRow[] {
  return mapAdminUsersListFromApi(raw).items;
}

export function mapAdminUserDetailFromApi(raw: unknown): AdminUserDetail {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const base = mapAdminUserRowFromApi(inner);
  const candidate = {
    ...base,
    ticketsPurchased: intNonNeg(
      pickNum(o, "ticketsPurchased", "tickets_purchased", "tickets_count"),
    ),
    bookingsCount: intNonNeg(
      pickNum(o, "bookingsCount", "bookings_count", "bookings"),
    ),
    ratingGivenCount: intNonNeg(
      pickNum(o, "ratingGivenCount", "rating_given_count", "ratings_given"),
    ),
    emailVerifiedAt:
      pickStr(o, "email_verified_at", "emailVerifiedAt") ?? null,
    phoneVerifiedAt:
      pickStr(o, "phone_verified_at", "phoneVerifiedAt") ?? null,
    suspensionReason:
      pickStr(o, "suspension_reason", "suspensionReason") ?? null,
    ...(pickBool(o, "suspension_is_permanent", "suspensionIsPermanent") !==
    undefined
      ? {
          suspensionIsPermanent: pickBool(
            o,
            "suspension_is_permanent",
            "suspensionIsPermanent",
          ),
        }
      : {}),
    suspendedAt: pickStr(o, "suspended_at", "suspendedAt") ?? null,
    suspendedBy:
      pickStr(o, "suspended_by", "suspendedBy") ??
      (pickNum(o, "suspended_by", "suspendedBy") !== undefined
        ? String(pickNum(o, "suspended_by", "suspendedBy"))
        : null),
    lastLoginAt: pickStr(o, "last_login_at", "lastLoginAt") ?? null,
    lastLoginIp: pickStr(o, "last_login_ip", "lastLoginIp") ?? null,
  };
  return adminUserDetailSchema.parse(candidate);
}

function extractEventsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    // Handle nested pagination
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested = inner.items ?? inner.events ?? inner.data ?? inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected events array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeEventStatus(
  raw: string | undefined,
): AdminEventRow["status"] {
  const s = (raw ?? "active").toLowerCase();
  if (s === "active" || s === "ended" || s === "cancelled" || s === "archived")
    return s;
  // Map API statuses to admin statuses
  if (s === "published" || s === "pending_approval") return "active";
  if (s === "draft") return "active"; // drafts appear as active in admin
  if (s === "cancelled_at" || s === "cancelled") return "cancelled";
  return "active";
}

export function mapAdminEventRowFromApi(raw: unknown): AdminEventRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const category =
    pickStr(o, "category", "category_name", "category_label") ??
    (isRecord(o.category)
      ? pickStr(asObject(o.category), "name", "title")
      : undefined) ??
    "";
  const ratingRaw =
    pickNum(o, "avgRating", "avg_rating", "average_rating", "rating_average") ??
    0;
  const avgRating = Math.min(5, Math.max(0, ratingRaw));
  const successRaw =
    pickNum(o, "successRatePercent", "success_rate_percent", "success_rate") ??
    0;
  const successRatePercent = Math.min(100, Math.max(0, successRaw));
  const cover =
    pickStr(
      o,
      "coverImageUrl",
      "cover_image_url",
      "cover_url",
      "image_url",
      "thumbnail_url",
    ) ?? placeholderAssetUrl("placeholder-cover");
  const idNum = pickNum(o, "id", "event_id");
  const idStr =
    pickStr(o, "id", "event_id", "uuid") ??
    (idNum !== undefined ? String(idNum) : "");
  const featured =
    pickBool(o, "featured", "is_featured", "isFeatured", "on_homepage") ??
    false;
  const candidate = {
    id: idStr,
    title: pickStr(o, "title", "name") ?? "",
    organizerName:
      pickStr(
        o,
        "organizerName",
        "organizer_name",
        "organizer",
        "organizer_title",
        "display_name",
      ) ?? "Organization",
    status: normalizeEventStatus(pickStr(o, "status", "lifecycle", "state")),
    startsAt:
      pickStr(o, "startsAt", "starts_at", "start_at", "start_time") ?? "",
    endsAt: pickStr(o, "endsAt", "ends_at", "end_at", "end_time") ?? "",
    ticketsSold: intNonNeg(
      pickNum(o, "ticketsSold", "tickets_sold", "sold_count"),
    ),
    capacity: Math.max(
      1,
      intNonNeg(pickNum(o, "capacity", "max_capacity", "ticket_capacity")) || 1,
    ),
    revenueSar: pickNum(o, "revenueSar", "revenue_sar", "revenue_gross") ?? 0,
    avgRating,
    successRatePercent,
    category,
    venueName: pickStr(o, "venueName", "venue_name", "venue") ?? "",
    city: pickStr(o, "city", "venue_city") ?? "",
    coverImageUrl: cover,
    featured,
  };
  return adminEventRowSchema.parse(candidate);
}

function parseMoneyAmount(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, raw);
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return 0;
}

function mapEventOrganizerFromApi(raw: unknown) {
  if (!isRecord(raw)) return undefined;
  const o = asObject(raw);
  const idNum = pickNum(o, "id");
  const id = pickStr(o, "id") ?? (idNum !== undefined ? String(idNum) : "");
  if (!id) return undefined;
  return {
    id,
    ...(pickStr(o, "code") ? { code: pickStr(o, "code") } : {}),
    displayName:
      pickStr(o, "display_name", "displayName", "name", "company_name") ?? "Organizer",
    ...(pickStr(o, "contact_email", "contactEmail", "email")
      ? { contactEmail: pickStr(o, "contact_email", "contactEmail", "email") }
      : {}),
    ...(pickStr(o, "contact_phone", "contactPhone", "phone")
      ? { contactPhone: pickStr(o, "contact_phone", "contactPhone", "phone") }
      : {}),
    ...(pickStr(o, "logo_url", "logoUrl") ? { logoUrl: pickStr(o, "logo_url", "logoUrl") } : {}),
    ...(pickStr(o, "slug") ? { slug: pickStr(o, "slug") } : {}),
  };
}

function mapEventCategorySummaryFromApi(raw: unknown) {
  if (!isRecord(raw)) return undefined;
  const o = asObject(raw);
  const idNum = pickNum(o, "id");
  const id = pickStr(o, "id") ?? (idNum !== undefined ? String(idNum) : "");
  if (!id) return undefined;
  return {
    id,
    slug: pickStr(o, "slug") ?? "",
    nameEn: pickStr(o, "name_en", "nameEn", "name") ?? "",
    nameAr: pickStr(o, "name_ar", "nameAr") ?? "",
    ...(pickStr(o, "icon_key", "iconKey") ? { iconKey: pickStr(o, "icon_key", "iconKey") } : {}),
  };
}

export function mapAdminEventDetailFromApi(raw: unknown): AdminEventDetail {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const row = mapAdminEventRowFromApi(inner);
  const apiStatus = pickStr(o, "status", "lifecycle", "state") ?? row.status;
  const capacityRaw = pickNum(o, "capacity", "max_capacity", "ticket_capacity");
  const organizerNested = o.organizer;
  const categoryNested = o.category;
  const organizerFromNested = mapEventOrganizerFromApi(organizerNested);
  const categoryFromNested = mapEventCategorySummaryFromApi(categoryNested);

  const candidate = {
    ...row,
    code: pickStr(o, "code") ?? "",
    apiStatus,
    capacity: capacityRaw !== undefined ? intNonNeg(capacityRaw) : null,
    organizerName:
      organizerFromNested?.displayName ??
      pickStr(o, "organizer_name", "organizerName") ??
      row.organizerName,
    category:
      categoryFromNested?.nameEn ??
      pickStr(o, "category", "category_name") ??
      row.category,
    revenueSar:
      parseMoneyAmount(
        pickNum(o, "revenueSar", "revenue_sar") ?? o.revenue_gross ?? row.revenueSar,
      ),
    avgRating: Math.min(
      5,
      Math.max(
        0,
        pickNum(o, "avgRating", "avg_rating", "rating_average") ?? row.avgRating,
      ),
    ),
    description: pickStr(o, "description", "body") ?? undefined,
    excerpt: pickStr(o, "excerpt") ?? undefined,
    timezone: pickStr(o, "timezone") ?? undefined,
    layoutType: pickStr(o, "layout_type", "layoutType") ?? undefined,
    entryMode: pickStr(o, "entry_mode", "entryMode") ?? undefined,
    rejectionReason: pickStr(o, "rejection_reason", "rejectionReason") ?? undefined,
    submittedAt: pickStr(o, "submitted_at", "submittedAt") ?? undefined,
    publishedAt: pickStr(o, "published_at", "publishedAt") ?? undefined,
    cancelledAt: pickStr(o, "cancelled_at", "cancelledAt") ?? undefined,
    createdAt: pickStr(o, "created_at", "createdAt") ?? undefined,
    updatedAt: pickStr(o, "updated_at", "updatedAt") ?? undefined,
    venueName: pickStr(o, "venue_name", "venueName", "venue") ?? row.venueName,
    venueAddress: pickStr(o, "venue_address", "venueAddress") ?? undefined,
    city: pickStr(o, "city", "venue_city") ?? row.city,
    videoUrl: pickStr(o, "video_url", "videoUrl") ?? undefined,
    priceMin: pickNum(o, "price_min", "priceMin") ?? null,
    priceMax: pickNum(o, "price_max", "priceMax") ?? null,
    ticketsLeft: pickNum(o, "tickets_left", "ticketsLeft") ?? null,
    ratingCount: intNonNeg(pickNum(o, "rating_count", "ratingCount")),
    attendingCount: intNonNeg(pickNum(o, "attending_count", "attendingCount")),
    waitlistCount: intNonNeg(pickNum(o, "waitlist_count", "waitlistCount")),
    showTalents: pickBool(o, "show_talents", "showTalents"),
    showVendors: pickBool(o, "show_vendors", "showVendors"),
    isMultiDay: pickBool(o, "is_multi_day", "isMultiDay"),
    isFeatured: pickBool(o, "is_featured", "isFeatured") ?? row.featured,
    featured: pickBool(o, "is_featured", "isFeatured", "featured") ?? row.featured,
    ...(organizerFromNested ? { organizer: organizerFromNested } : {}),
    ...(categoryFromNested ? { categoryDetail: categoryFromNested } : {}),
  };
  return adminEventDetailSchema.parse(candidate);
}

export function mapAdminEventsFromApi(raw: unknown): AdminEventRow[] {
  const rows = extractEventsPayload(raw);
  const mapped = rows.map(mapAdminEventRowFromApi);
  return adminEventListSchema.parse(mapped);
}

/** Stable slug for `POST /event-categories` when deriving from English name. */
export function slugifyCategoryBaseName(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || `cat-${Date.now()}`;
}

/** Picks a slug that is not in `existingSlugs` (case-insensitive). */
export function suggestUniqueCategorySlug(
  nameEn: string,
  existingSlugs: Iterable<string>,
): string {
  const taken = new Set(
    Array.from(existingSlugs, (s) => s.trim().toLowerCase()).filter(Boolean),
  );
  let base = slugifyCategoryBaseName(nameEn);
  if (!base) base = "category";
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

function extractEventCategoriesPayload(raw: unknown): unknown[] {
  if (isRecord(raw) && isLaravelPaginator(raw)) return raw.data as unknown[];

  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (isLaravelPaginator(inner)) return inner.data as unknown[];
    const nested =
      inner.items ?? inner.categories ?? inner.event_categories ?? inner.data;
    if (Array.isArray(nested)) return nested;
  }
  if (isRecord(raw) && isRecord(raw.data)) {
    const block = asObject(raw.data);
    if (isLaravelPaginator(block)) return block.data as unknown[];
  }
  throw new ApiJsonError(
    "Expected event categories array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

function extractCategoryPaginatorMeta(raw: unknown, defaultPerPage = 50) {
  const readMeta = (block: Record<string, unknown>) => ({
    currentPage: intNonNeg(pickNum(block, "current_page", "currentPage"), 1),
    perPage: intNonNeg(pickNum(block, "per_page", "perPage"), defaultPerPage),
    total: intNonNeg(pickNum(block, "total"), 0),
  });

  if (isRecord(raw) && isLaravelPaginator(raw)) return readMeta(raw);
  if (isRecord(raw)) {
    const wrapped = raw.data;
    if (isRecord(wrapped) && isLaravelPaginator(wrapped)) return readMeta(wrapped);
  }
  const inner = unwrapApiJson(raw);
  if (isRecord(inner) && isLaravelPaginator(inner)) return readMeta(inner);
  return { currentPage: 1, perPage: defaultPerPage, total: 0 };
}

export function mapEventCategoryFromApi(raw: unknown): EventCategory {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idNum = pickNum(o, "id");
  const idStr =
    pickStr(o, "id", "uuid") ??
    (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  const slugVal = pickStr(o, "slug") ?? "";
  const nameEn =
    pickStr(o, "name_en", "nameEn", "name", "title", "label")?.trim() ?? "";
  const nameAr = pickStr(o, "name_ar", "nameAr")?.trim() ?? "";
  const displayOrderRaw = pickNum(o, "displayOrder", "display_order");
  const createdAt = pickStr(o, "createdAt", "created_at");
  const updatedAt = pickStr(o, "updatedAt", "updated_at");
  const iconRaw = pickStr(o, "iconKey", "icon_key");
  const colorRaw = pickStr(o, "colorToken", "color_token");
  const candidate = {
    id: idStr,
    slug: slugVal || slugifyCategoryBaseName(nameEn || idStr || "category"),
    nameEn: nameEn || nameAr || slugVal || idStr || "Unnamed",
    nameAr: nameAr || nameEn || slugVal || "",
    iconKey: iconRaw ?? "",
    colorToken: colorRaw ?? "",
    active: pickBool(o, "active", "is_active") ?? false,
    ...(displayOrderRaw !== undefined
      ? { displayOrder: Math.min(65535, intNonNeg(displayOrderRaw)) }
      : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
  return eventCategorySchema.parse(candidate);
}

export function mapEventCategoriesListFromApi(raw: unknown): EventCategoriesListResult {
  const rows = extractEventCategoriesPayload(raw);
  const meta = extractCategoryPaginatorMeta(raw, 50);
  const items = rows.map(mapEventCategoryFromApi);
  return eventCategoriesListResultSchema.parse({
    items: eventCategoryListSchema.parse(items),
    currentPage: meta.currentPage || 1,
    perPage: meta.perPage || 50,
    total: meta.total || items.length,
  });
}

export function mapEventCategoriesFromApi(raw: unknown): EventCategory[] {
  return mapEventCategoriesListFromApi(raw).items;
}

function extractBadgeCategoriesPayload(raw: unknown): unknown[] {
  if (isRecord(raw) && isLaravelPaginator(raw)) return raw.data as unknown[];

  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (isLaravelPaginator(inner)) return inner.data as unknown[];
    const nested =
      inner.items ??
      inner.categories ??
      inner.talent_categories ??
      inner.vendor_service_categories ??
      inner.data;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected badge categories array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

export function mapBadgeCategoryFromApi(raw: unknown): BadgeCategory {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idNum = pickNum(o, "id");
  const idStr =
    pickStr(o, "id", "uuid") ??
    (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  const slugVal = pickStr(o, "slug") ?? "";
  const nameEn =
    pickStr(o, "name_en", "nameEn", "name", "title", "label")?.trim() ?? "";
  const nameAr = pickStr(o, "name_ar", "nameAr")?.trim() ?? "";
  const displayOrderRaw = pickNum(o, "displayOrder", "display_order");
  const createdByRaw =
    pickStr(o, "created_by_user_id", "createdByUserId") ??
    (pickNum(o, "created_by_user_id", "createdByUserId") !== undefined
      ? String(pickNum(o, "created_by_user_id", "createdByUserId"))
      : null);
  const candidate = {
    id: idStr,
    slug: slugVal || slugifyCategoryBaseName(nameEn || idStr || "category"),
    nameEn: nameEn || nameAr || slugVal || idStr || "Unnamed",
    nameAr: nameAr || nameEn || slugVal || "",
    active: pickBool(o, "active", "is_active") ?? false,
    ...(displayOrderRaw !== undefined
      ? { displayOrder: Math.min(65535, intNonNeg(displayOrderRaw)) }
      : {}),
    ...(pickBool(o, "is_custom", "isCustom") !== undefined
      ? { isCustom: pickBool(o, "is_custom", "isCustom") }
      : {}),
    ...(createdByRaw !== undefined ? { createdByUserId: createdByRaw } : {}),
  };
  return badgeCategorySchema.parse(candidate);
}

export function mapTalentCategoriesListFromApi(
  raw: unknown,
): BadgeCategoriesListResult {
  const rows = extractBadgeCategoriesPayload(raw);
  const meta = extractCategoryPaginatorMeta(raw, 50);
  const items = rows.map(mapBadgeCategoryFromApi);
  return badgeCategoriesListResultSchema.parse({
    items: badgeCategoryListSchema.parse(items),
    currentPage: meta.currentPage || 1,
    perPage: meta.perPage || 50,
    total: meta.total || items.length,
  });
}

export function mapVendorServiceCategoriesListFromApi(
  raw: unknown,
): BadgeCategoriesListResult {
  return mapTalentCategoriesListFromApi(raw);
}

export function mapTalentCategoriesFromApi(raw: unknown): BadgeCategory[] {
  return mapTalentCategoriesListFromApi(raw).items;
}

export function mapVendorServiceCategoriesFromApi(raw: unknown): BadgeCategory[] {
  return mapVendorServiceCategoriesListFromApi(raw).items;
}

function normalizeFeeType(
  raw: string | undefined,
): FeeConfiguration["feeType"] {
  const v = (raw ?? "percent").toLowerCase();
  if (v === "percent" || v === "flat" || v === "combined") return v;
  return "percent";
}

function normalizeFeePayer(raw: string | undefined): FeeConfiguration["payer"] {
  const v = (raw ?? "buyer").toLowerCase();
  if (v === "buyer" || v === "organizer") return v;
  return "buyer";
}

export function mapFeeConfigurationFromApi(raw: unknown): FeeConfiguration {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const percentRaw = pickNum(o, "percent", "fee_percent") ?? 0;
  const percent = Math.min(100, Math.max(0, percentRaw));
  const auctionRaw =
    pickNum(o, "auctionCommissionPercent", "auction_commission_percent") ?? 0;
  const auctionCommissionPercent = Math.min(100, Math.max(0, auctionRaw));
  const thirdRaw =
    pickNum(o, "thirdPartySharePercent", "third_party_share_percent") ?? 0;
  const thirdPartySharePercent = Math.min(100, Math.max(0, thirdRaw));
  const candidate = {
    feeType: normalizeFeeType(pickStr(o, "feeType", "fee_type")),
    percent,
    flatSar: pickNum(o, "flatSar", "flat_sar", "flat_fee") ?? 0,
    payer: normalizeFeePayer(pickStr(o, "payer", "fee_payer")),
    auctionCommissionPercent,
    thirdPartySharePercent,
  };
  return feeConfigurationSchema.parse(candidate);
}

export function mapFeaturedConfigFromApi(raw: unknown): FeaturedEventsConfig {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const modeRaw = pickStr(o, "mode", "feature_mode");
  const mode =
    modeRaw === "manual_override" || modeRaw === "algorithm"
      ? modeRaw
      : "algorithm";
  const idsRaw = o.manualEventIds ?? o.manual_event_ids ?? o.event_ids;
  const manualEventIds = Array.isArray(idsRaw)
    ? idsRaw
        .map((x) =>
          typeof x === "string"
            ? x
            : typeof x === "number" && Number.isFinite(x)
              ? String(Math.trunc(x))
              : "",
        )
        .filter((x) => x.length > 0)
    : [];
  const refreshMinutes =
    pickNum(o, "refresh_minutes", "refreshMinutes", "refresh_interval_minutes") ?? 60;
  return featuredEventsConfigSchema.parse({ mode, manualEventIds, refreshMinutes });
}

function parseReminderOffsets(o: Record<string, unknown>): number[] {
  const raw =
    o.reminderOffsetsHours ?? o.reminder_offsets_hours ?? o.reminder_hours;
  if (!Array.isArray(raw)) return [24, 3];
  const nums = raw
    .map((x) =>
      typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN,
    )
    .filter((n) => Number.isFinite(n) && n > 0);
  return nums.length ? nums : [24, 3];
}

export function mapNotificationSettingsFromApi(
  raw: unknown,
): NotificationSettings {
  const envelope = unwrapApiJson(raw);
  const src =
    isRecord(envelope) && isRecord(envelope.active)
      ? asObject(envelope.active)
      : asObject(envelope);
  const chRaw = src.channels;
  const ch = isRecord(chRaw) ? asObject(chRaw) : {};
  const candidate = {
    channels: {
      email: pickBool(ch, "email") ?? pickBool(src, "email_enabled") ?? true,
      inApp:
        pickBool(ch, "inApp", "in_app") ??
        pickBool(src, "in_app_enabled") ??
        true,
      push: pickBool(ch, "push") ?? pickBool(src, "push_enabled") ?? false,
      sms: pickBool(ch, "sms") ?? pickBool(src, "sms_enabled") ?? false,
    },
    reminderOffsetsHours: parseReminderOffsets(src),
  };
  return notificationSettingsSchema.parse(candidate);
}

function normalizeSupportThreadStatus(
  raw: string | undefined,
): SupportThread["status"] {
  const v = (raw ?? "open").toLowerCase().replace(/-/g, "_");
  if (v === "in_progress" || v === "inprogress") return "in_progress";
  if (v === "resolved" || v === "closed") return "resolved";
  if (
    v === "waiting_user" ||
    v === "waiting_admin" ||
    v === "pending" ||
    v === "new"
  )
    return "in_progress";
  return "open";
}

function normalizeSupportMessageAuthor(
  raw: string | undefined,
): "user" | "admin" {
  const a = (raw ?? "user").toLowerCase();
  if (
    a === "admin" ||
    a === "staff" ||
    a === "agent" ||
    a === "moderator" ||
    a === "support"
  )
    return "admin";
  return "user";
}

function extractSupportThreadsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    // Laravel LengthAwarePaginator: { data: Row[], current_page, ... }
    if (Array.isArray(inner.data)) return inner.data;
    // Nested envelope: { data: { data: Row[] } }
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested =
      inner.items ??
      inner.cases ??
      inner.threads ??
      inner.support_cases ??
      inner.data;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected support threads array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

function pickSupportCaseId(o: Record<string, unknown>): string {
  const n = pickNum(o, "id");
  if (n !== undefined) return String(Math.trunc(n));
  return pickStr(o, "id", "case_id", "uuid") ?? "";
}

function readNestedRecord(
  o: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const v = o[key];
  if (isRecord(v) && !Array.isArray(v)) return v;
  return null;
}

function pickSupportRequesterDisplayName(o: Record<string, unknown>): string | undefined {
  const u = readNestedRecord(o, "user");
  if (!u) return undefined;
  const name =
    pickStr(u, "full_name", "fullName", "display_name", "displayName", "name") ?? "";
  const t = name.trim();
  return t.length > 0 ? t : undefined;
}

function normalizeSupportPriority(
  raw: string | undefined,
): SupportThread["priority"] {
  if (!raw) return undefined;
  const p = raw.toLowerCase();
  if (p === "low" || p === "normal" || p === "high" || p === "urgent") return p;
  return undefined;
}

function pickSupportRequesterLabel(o: Record<string, unknown>): string {
  const u = readNestedRecord(o, "user");
  const fromNested = u
    ? pickStr(u, "email", "user_email", "userEmail")
    : undefined;
  const email =
    fromNested ??
    pickStr(
      o,
      "userEmail",
      "user_email",
      "email",
      "requester_email",
      "contact_email",
    );
  if (email) return email;
  const uid =
    pickNum(o, "user_id", "userId") ??
    (u ? pickNum(u, "id") : undefined);
  if (uid !== undefined) return `User #${Math.trunc(uid)}`;
  return "Unknown requester";
}

export function mapSupportThreadFromApi(raw: unknown): SupportThread {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const code = pickStr(o, "code", "case_code", "reference");
  const displayName = pickSupportRequesterDisplayName(o);
  const priority = normalizeSupportPriority(
    pickStr(o, "priority", "case_priority"),
  );
  const candidate = {
    id: pickSupportCaseId(o),
    ...(code ? { code } : {}),
    ...(displayName ? { requesterDisplayName: displayName } : {}),
    ...(priority ? { priority } : {}),
    userEmail: pickSupportRequesterLabel(o),
    subject: pickStr(o, "subject", "title", "topic") ?? "",
    status: normalizeSupportThreadStatus(
      pickStr(o, "status", "case_status", "state"),
    ),
    updatedAt:
      pickStr(
        o,
        "updatedAt",
        "updated_at",
        "last_message_at",
        "last_user_message_at",
        "last_admin_message_at",
      ) ?? "",
    preview:
      pickStr(
        o,
        "preview",
        "summary",
        "last_message_preview",
        "snippet",
        "initial_message",
        "initialMessage",
      ) ?? "",
  };
  return supportThreadSchema.parse(candidate);
}

export function mapSupportThreadsFromApi(raw: unknown): SupportThread[] {
  const rows = extractSupportThreadsPayload(raw);
  return supportThreadListSchema.parse(rows.map(mapSupportThreadFromApi));
}

function extractMessagesPayload(o: Record<string, unknown>): unknown[] {
  const nested = o.messages ?? o.items ?? o.conversation ?? o.timeline;
  if (Array.isArray(nested)) return nested;
  return [];
}

export function mapSupportMessageFromApi(raw: unknown) {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const authorRaw = pickStr(
    o,
    "author",
    "sender_type",
    "role",
    "from",
    "sender_role",
  );
  const idNum = pickNum(o, "id", "message_id");
  const idStr =
    pickStr(o, "id", "message_id", "uuid") ??
    (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  const candidate = {
    id: idStr,
    author: normalizeSupportMessageAuthor(authorRaw),
    body: pickStr(o, "body", "message", "content", "text") ?? "",
    sentAt: pickStr(o, "sentAt", "sent_at", "created_at") ?? "",
  };
  return supportMessageSchema.parse(candidate);
}

export function mapSupportThreadDetailFromApi(
  raw: unknown,
): SupportThreadDetail {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const base = mapSupportThreadFromApi(inner);
  let msgRows = extractMessagesPayload(o);
  let messages = msgRows.length ? msgRows.map(mapSupportMessageFromApi) : [];
  if (!messages.length) {
    const initial = pickStr(o, "initial_message", "initialMessage");
    if (initial) {
      const sentAt =
        pickStr(
          o,
          "created_at",
          "createdAt",
          "last_user_message_at",
          "updated_at",
        ) ?? base.updatedAt;
      messages = [
        supportMessageSchema.parse({
          id: `${base.id}-initial`,
          author: "user",
          body: initial,
          sentAt,
        }),
      ];
    }
  }
  const resolutionNote = pickStr(o, "resolution_note", "resolutionNote");
  return supportThreadDetailSchema.parse({
    ...base,
    messages,
    ...(resolutionNote ? { resolutionNote } : {}),
  });
}

function extractListingModerationPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (Array.isArray(inner.data)) return inner.data;
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested = inner.items ?? inner.queue ?? inner.entries ?? inner.data;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected moderation queue array or wrapped list",
    "expected_array",
    {
      cause: raw,
    },
  );
}

function normalizeListingKind(
  raw: string | undefined,
): ListingModerationRow["kind"] {
  const k = (raw ?? "talent").toLowerCase();
  if (k === "vendor") return "vendor";
  return "talent";
}

function normalizeListingStatus(
  raw: string | undefined,
): ListingModerationRow["status"] {
  const s = (raw ?? "queued").toLowerCase();
  if (
    s === "claimed" ||
    s === "in_review" ||
    s === "assigned" ||
    s === "locked"
  )
    return "claimed";
  if (s === "rejected" || s === "denied" || s === "dismissed")
    return "rejected";
  if (s === "escalated" || s === "escalation") return "escalated";
  if (
    s === "actioned" ||
    s === "resolved" ||
    s === "approved" ||
    s === "completed"
  )
    return "actioned";
  return "queued";
}

function pickListingModerationId(o: Record<string, unknown>): string {
  const n = pickNum(o, "id");
  if (n !== undefined) return String(Math.trunc(n));
  return pickStr(o, "id", "queue_id", "uuid") ?? "";
}

function pickListingOwnerLabel(o: Record<string, unknown>): string {
  const email = pickStr(
    o,
    "ownerEmail",
    "owner_email",
    "email",
    "submitter_email",
    "owner_user_email",
  );
  if (email) return email;
  const uid = pickNum(o, "owner_user_id", "ownerUserId");
  if (uid !== undefined) return `Owner #${Math.trunc(uid)}`;
  return "Unknown owner";
}

function pickListingTitle(o: Record<string, unknown>, idStr: string): string {
  const fromTitle = pickStr(o, "title", "label", "name");
  if (fromTitle) return fromTitle;
  const desc = pickStr(o, "description", "summary", "details");
  if (desc) return desc.length > 160 ? `${desc.slice(0, 157)}…` : desc;
  const flag = pickStr(o, "flag_reason", "flagReason", "report_reason", "reason");
  if (flag) return flag;
  return `Case #${idStr}`;
}

export function mapListingModerationRowFromApi(
  raw: unknown,
): ListingModerationRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickListingModerationId(o);
  const flagReason =
    pickStr(
      o,
      "flagReason",
      "flag_reason",
      "report_reason",
      "reason",
      "category",
    ) ?? "";
  const description = pickStr(o, "description", "summary", "details");
  const candidate = {
    id: idStr,
    kind: normalizeListingKind(
      pickStr(o, "listing_kind", "kind", "type", "entity_type"),
    ),
    title: pickListingTitle(o, idStr),
    ownerEmail: pickListingOwnerLabel(o),
    ...(description ? { description } : {}),
    flagReason: flagReason || description?.slice(0, 120) || "—",
    status: normalizeListingStatus(pickStr(o, "status", "review_status")),
  };
  return listingModerationRowSchema.parse(candidate);
}

export function mapListingModerationFromApi(
  raw: unknown,
): ListingModerationRow[] {
  const rows = extractListingModerationPayload(raw);
  return listingModerationListSchema.parse(
    rows.map(mapListingModerationRowFromApi),
  );
}

function extractRatingsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (Array.isArray(inner.data)) return inner.data;
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested = inner.items ?? inner.ratings ?? inner.reviews ?? inner.data;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected ratings array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeRatingModerationState(
  raw: string | undefined,
  o: Record<string, unknown>,
): RatingRow["moderationState"] {
  const delAt = o["deleted_at"];
  if (delAt != null && String(delAt).trim() !== "") return "deleted";
  if (o["is_visible"] === false) return "hidden";
  if (o["is_visible"] === true) return "visible";
  const s = (raw ?? "").toLowerCase();
  if (s === "hidden" || s === "hid" || s === "moderated_hidden")
    return "hidden";
  if (s === "deleted" || s === "removed" || s === "destroyed") return "deleted";
  if (pickBool(o, "deleted", "is_deleted")) return "deleted";
  if (pickBool(o, "hidden", "is_hidden")) return "hidden";
  return "visible";
}

function formatRatingTargetLabel(o: Record<string, unknown>): string {
  const existing = pickStr(
    o,
    "targetLabel",
    "target_label",
    "target",
    "event_title",
    "title",
  );
  if (existing) return existing;
  const tt = (pickStr(o, "target_type", "targetType") ?? "item").toLowerCase();
  const tid = pickNum(o, "target_id", "targetId");
  const tidStr =
    tid !== undefined
      ? String(Math.trunc(tid))
      : (pickStr(o, "target_id", "targetId") ?? "?");
  const prettyRaw = tt.replace(/_/g, " ");
  const pretty =
    prettyRaw.length > 0
      ? prettyRaw.charAt(0).toUpperCase() + prettyRaw.slice(1)
      : "Item";
  return `${pretty} #${tidStr}`;
}

function pickRatingAuthorLabel(o: Record<string, unknown>): string {
  const email = pickStr(
    o,
    "authorEmail",
    "author_email",
    "email",
    "reviewer_email",
    "user_email",
  );
  if (email) return email;
  const uid = pickNum(o, "user_id", "userId");
  if (uid !== undefined) return `User #${Math.trunc(uid)}`;
  return "Unknown reviewer";
}

export function mapRatingRowFromApi(raw: unknown): RatingRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const starsRaw = pickNum(o, "stars", "rating", "score") ?? 1;
  const stars = Math.min(5, Math.max(1, Math.trunc(starsRaw)));
  const idNum = pickNum(o, "id", "rating_id");
  const idStr =
    pickStr(o, "id", "rating_id", "uuid") ??
    (idNum !== undefined ? String(idNum) : "");
  const moderationState = normalizeRatingModerationState(
    pickStr(o, "moderation_state", "moderationState", "visibility", "state"),
    o,
  );
  const candidate = {
    id: idStr,
    targetLabel: formatRatingTargetLabel(o),
    authorEmail: pickRatingAuthorLabel(o),
    stars,
    comment: pickStr(o, "comment", "body", "review", "text") ?? "",
    submittedAt:
      pickStr(o, "submittedAt", "submitted_at", "created_at", "updated_at") ??
      "",
    moderationState,
  };
  return ratingRowSchema.parse(candidate);
}

export function mapRatingsFromApi(raw: unknown): RatingRow[] {
  const rows = extractRatingsPayload(raw);
  return ratingListSchema.parse(rows.map(mapRatingRowFromApi));
}

function extractRevenueByDay(o: Record<string, unknown>): unknown[] {
  const raw =
    o.revenueByDay ??
    o.revenue_by_day ??
    o.daily_revenue ??
    o.series ??
    o.timeseries ??
    o.chart;
  if (Array.isArray(raw)) return raw;
  return [];
}

function mapRevenuePointFromApi(raw: unknown) {
  const inner = unwrapApiJson(raw);
  const p = asObject(inner);
  return revenuePointSchema.parse({
    date: pickStr(p, "date", "day", "bucket") ?? "",
    revenueSar: pickNum(p, "revenueSar", "revenue_sar", "amount", "value") ?? 0,
  });
}

function extractBreakdownRows(o: Record<string, unknown>): unknown[] {
  const raw =
    o.revenueBreakdownByCategory ??
    o.revenue_breakdown_by_category ??
    o.breakdown_by_category ??
    o.breakdown ??
    o.categories;
  if (Array.isArray(raw)) return raw;
  return [];
}

function mapBreakdownRowFromApi(raw: unknown) {
  const inner = unwrapApiJson(raw);
  const r = asObject(inner);
  return revenueBreakdownRowSchema.parse({
    categoryKey: pickStr(r, "categoryKey", "category_key", "key", "slug") ?? "",
    label: pickStr(r, "label", "name", "title") ?? "",
    revenueSar: pickNum(r, "revenueSar", "revenue_sar", "amount", "value") ?? 0,
  });
}

export function mapFinancialAnalyticsFromApi(raw: unknown): FinancialAnalytics {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const dayRows = extractRevenueByDay(o);
  const revenueByDay = dayRows.length
    ? dayRows.map(mapRevenuePointFromApi)
    : [];
  const bdRows = extractBreakdownRows(o);
  const revenueBreakdownByCategory = bdRows.length
    ? bdRows.map(mapBreakdownRowFromApi)
    : [];
  const ordersPaidTotal = pickNum(
    o,
    "ordersPaidTotalAmount",
    "orders_paid_total_amount",
  );
  const refundsProcessed = pickNum(
    o,
    "refundsProcessedTotalAmount",
    "refunds_processed_total_amount",
  );
  const totalRevenueSar =
    pickNum(o, "totalRevenueSar", "total_revenue_sar", "total_revenue") ??
    ordersPaidTotal ??
    0;
  const refundsSar =
    pickNum(o, "refundsSar", "refunds_sar", "refunds") ?? refundsProcessed ?? 0;
  const range = pickStr(o, "range");
  const since = pickStr(o, "since");
  const ordersPaidCount = pickNum(o, "ordersPaidCount", "orders_paid_count");
  const candidate = {
    totalRevenueSar,
    platformFeesSar:
      pickNum(o, "platformFeesSar", "platform_fees_sar", "platform_fees") ?? 0,
    refundsSar,
    payoutsPendingSar:
      pickNum(
        o,
        "payoutsPendingSar",
        "payouts_pending_sar",
        "pending_payouts",
      ) ?? 0,
    revenueByDay,
    revenueBreakdownByCategory,
    ...(range ? { range } : {}),
    ...(since ? { since } : {}),
    ...(ordersPaidCount !== undefined
      ? { ordersPaidCount: intNonNeg(ordersPaidCount) }
      : {}),
    ...(ordersPaidTotal !== undefined
      ? { ordersPaidTotalAmount: ordersPaidTotal }
      : {}),
    ...(refundsProcessed !== undefined
      ? { refundsProcessedTotalAmount: refundsProcessed }
      : {}),
  };
  return financialAnalyticsSchema.parse(candidate);
}

function idToStr(v: unknown): string {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "string" && v.length) return v;
  return "";
}

export function mapLeaderboardsFromApi(raw: unknown): Leaderboards {
  let inner = unwrapApiJson(raw);
  if (isRecord(inner) && !Array.isArray(inner.events) && isRecord(inner.data)) {
    inner = asObject(inner.data);
  }
  const o = asObject(inner);
  const eventsRaw = o.events;
  const organizersRaw = o.organizers;
  const events = Array.isArray(eventsRaw) ? eventsRaw : [];
  const organizers = Array.isArray(organizersRaw) ? organizersRaw : [];
  const mappedEvents = events.map((row) => {
    const r = asObject(row);
    const rev = r.revenue_gross ?? r.revenueGross ?? "0";
    const candidate = {
      id: idToStr(r.id),
      code: pickStr(r, "code") ?? "",
      title: pickStr(r, "title", "name") ?? "",
      revenueGross:
        typeof rev === "number" && Number.isFinite(rev)
          ? String(rev)
          : String(rev ?? "0"),
      status: pickStr(r, "status") ?? "",
      organizerId: idToStr(r.organizer_id ?? r.organizerId),
    };
    return leaderboardEventGmvRowSchema.parse(candidate);
  });
  const mappedOrgs = organizers.map((row) => {
    const r = asObject(row);
    const gross = pickNum(r, "totalRevenueGross", "total_revenue_gross") ?? 0;
    const candidate = {
      organizerId: idToStr(r.organizer_id ?? r.organizerId),
      totalRevenueGross: gross,
      displayName: pickStr(r, "display_name", "displayName", "name") ?? "",
      slug: pickStr(r, "slug") ?? "",
      code: pickStr(r, "code") ?? "",
    };
    return leaderboardOrganizerGmvRowSchema.parse(candidate);
  });
  const generatedAt = pickStr(o, "generated_at", "generatedAt");
  return leaderboardsSchema.parse({
    events: mappedEvents,
    organizers: mappedOrgs,
    ...(generatedAt ? { generatedAt } : {}),
  });
}

function extractOrdersPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (
      Array.isArray(inner.data) &&
      (typeof inner.total === "number" ||
        typeof inner.current_page === "number" ||
        typeof inner.last_page === "number")
    ) {
      return inner.data;
    }
    const nested = inner.items ?? inner.orders ?? inner.data ?? inner.results;
    if (Array.isArray(nested)) return nested;
  }
  if (isRecord(raw) && isRecord(raw.data)) {
    const block = asObject(raw.data);
    if (
      Array.isArray(block.data) &&
      (typeof block.total === "number" ||
        typeof block.current_page === "number" ||
        typeof block.last_page === "number")
    ) {
      return block.data;
    }
  }
  throw new ApiJsonError(
    "Expected orders array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeOrderStatus(raw: string | undefined): AdminOrderStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminOrderStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (
    s === "confirmed" ||
    s === "succeeded" ||
    s === "capture" ||
    s === "paid_out" ||
    s === "approved"
  )
    return "paid";
  if (
    s === "awaiting_payment" ||
    s === "unpaid" ||
    s === "draft" ||
    s === "authorization" ||
    s === "authorizing"
  )
    return "pending";
  if (s === "void" || s === "voided") return "cancelled";
  if (s === "declined" || s === "rejected") return "failed";
  return "unknown";
}

export function mapAdminOrderRowFromApi(raw: unknown): AdminOrderRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const buyerEmailSnap = pickStr(
    o,
    "buyer_email_snapshot",
    "buyerEmailSnapshot",
  );
  const buyerPhoneSnap = pickStr(
    o,
    "buyer_phone_snapshot",
    "buyerPhoneSnapshot",
  );
  const userRec = isRecord(o.user) ? asObject(o.user) : undefined;
  const fromUser =
    userRec &&
    (pickStr(
      userRec,
      "full_name",
      "fullName",
      "name",
      "display_name",
      "displayName",
    ) ??
      pickStr(userRec, "email", "email_address"));
  const buyerLabel =
    pickStr(
      o,
      "buyerLabel",
      "buyer_label",
      "customer_email",
      "user_email",
      "email",
      "buyer_email",
    ) ??
    pickStr(
      o,
      "buyerName",
      "buyer_name",
      "customer_name",
      "user_name",
      "name",
    ) ??
    fromUser ??
    buyerEmailSnap ??
    buyerPhoneSnap ??
    (() => {
      const uid = pickNum(o, "user_id", "userId");
      return uid !== undefined ? `User #${uid}` : "";
    })();
  const eventIdNum = pickNum(o, "event_id", "eventId");
  const eventTitle =
    pickStr(o, "eventTitle", "event_title", "event_name", "eventName") ??
    (isRecord(o.event)
      ? pickStr(asObject(o.event), "title", "name", "label")
      : undefined) ??
    (eventIdNum !== undefined ? `Event #${eventIdNum}` : "");
  const idStr = pickStr(o, "id", "order_id", "uuid");
  const idNum = pickNum(o, "id", "order_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const reference = pickStr(o, "reference", "order_reference", "ref_code");
  const cancelledAt = pickStr(o, "cancelled_at", "cancelledAt");
  const statusRaw = pickStr(
    o,
    "status",
    "order_status",
    "state",
    "payment_status",
    "paymentStatus",
  );
  const status =
    cancelledAt && cancelledAt.length > 0
      ? ("cancelled" as const)
      : normalizeOrderStatus(statusRaw);
  const candidate = {
    id,
    ...(reference ? { reference } : {}),
    ...(idNum !== undefined && idNum > 0 ? { numericId: Math.trunc(idNum) } : {}),
    status,
    buyerLabel,
    eventTitle,
    totalSar:
      pickNum(
        o,
        "totalSar",
        "total_sar",
        "total",
        "amount",
        "grand_total",
        "total_amount",
      ) ?? 0,
    ticketCount: intNonNeg(
      pickNum(o, "ticketCount", "ticket_count", "tickets_count", "quantity"),
    ),
    createdAt:
      pickStr(
        o,
        "createdAt",
        "created_at",
        "placed_at",
        "ordered_at",
        "created",
      ) ?? new Date().toISOString(),
  };
  return adminOrderRowSchema.parse(candidate);
}

export function mapAdminOrdersFromApi(raw: unknown): AdminOrderRow[] {
  const rows = extractOrdersPayload(raw);
  const mapped = rows.map(mapAdminOrderRowFromApi);
  return adminOrderListSchema.parse(mapped);
}

export function mapAdminOrderDetailFromApi(raw: unknown): AdminOrderDetail {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const base = mapAdminOrderRowFromApi(inner);
  const nullableStr = (key: string) => {
    const v = o[key];
    return typeof v === "string" && v.length > 0 ? v : null;
  };
  const userRec = isRecord(o.user) ? asObject(o.user) : undefined;
  const buyerEmail =
    pickStr(o, "buyerEmail", "buyer_email", "customer_email", "user_email", "buyer_email_snapshot") ??
    (userRec ? pickStr(userRec, "email", "email_address") : undefined);
  const buyerPhone =
    pickStr(o, "buyerPhone", "buyer_phone", "buyer_phone_snapshot") ??
    (userRec ? pickStr(userRec, "phone", "phone_number", "mobile") : undefined);
  const ticketsRaw = o.tickets;
  const tickets =
    Array.isArray(ticketsRaw) && ticketsRaw.length > 0
      ? ticketsRaw.map((row) => {
          const r = asObject(row);
          const tid = pickStr(r, "id") ?? (pickNum(r, "id") !== undefined ? String(pickNum(r, "id")) : "");
          return adminOrderTicketRowSchema.parse({
            id: tid,
            code: pickStr(r, "code") ?? "",
            status: pickStr(r, "status") ?? "",
            pricePaidSar: pickNum(r, "pricePaidSar", "price_paid", "price") ?? 0,
            eventTitleCache: pickStr(r, "event_title_cache", "eventTitleCache"),
          });
        })
      : undefined;
  const itemsRaw = o.items;
  const items =
    Array.isArray(itemsRaw) && itemsRaw.length > 0
      ? itemsRaw.map((row) => {
          const r = asObject(row);
          const iid = pickStr(r, "id") ?? (pickNum(r, "id") !== undefined ? String(pickNum(r, "id")) : "");
          const ttid = pickNum(r, "ticket_type_id", "ticketTypeId");
          return adminOrderItemRowSchema.parse({
            id: iid,
            quantity: intNonNeg(pickNum(r, "quantity")),
            unitPriceSar: pickNum(r, "unitPriceSar", "unit_price", "unitPrice") ?? 0,
            subtotalSar: pickNum(r, "subtotalSar", "subtotal") ?? 0,
            ...(ttid !== undefined ? { ticketTypeId: String(Math.trunc(ttid)) } : {}),
          });
        })
      : undefined;
  const candidate = {
    ...base,
    buyerEmail,
    buyerPhone,
    eventId: pickStr(o, "eventId", "event_id", "event_uuid") ??
      (pickNum(o, "event_id") !== undefined ? String(pickNum(o, "event_id")) : undefined),
    paymentReference: pickStr(o, "paymentReference", "payment_reference", "reference", "transaction_id"),
    paymentMethod: pickStr(o, "paymentMethod", "payment_method"),
    paymentCardLast4: nullableStr("payment_card_last4") ?? nullableStr("paymentCardLast4"),
    subtotalSar: pickNum(o, "subtotalSar", "subtotal_sar", "subtotal"),
    feesSar: pickNum(o, "feesSar", "fees_sar", "fees"),
    discountSar: pickNum(o, "discountSar", "discount_sar", "discount"),
    paidAt: nullableStr("paid_at") ?? nullableStr("paidAt"),
    notes: pickStr(o, "notes", "admin_notes", "internal_note"),
    currency: pickStr(o, "currency"),
    ...(tickets ? { tickets } : {}),
    ...(items ? { items } : {}),
  };
  return adminOrderDetailSchema.parse(candidate);
}

function extractRefundsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested = inner.items ?? inner.refunds ?? inner.data ?? inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected refunds array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeRefundStatus(raw: string | undefined): AdminRefundStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminRefundStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (s === "success" || s === "succeeded" || s === "done" || s === "processed")
    return "completed";
  if (s === "denied" || s === "declined") return "rejected";
  return "unknown";
}

function mapRefundPaymentTransactionFromApi(raw: unknown) {
  if (!isRecord(raw)) return undefined;
  const p = asObject(raw);
  const pid =
    pickStr(p, "id", "transaction_id") ??
    (pickNum(p, "id") !== undefined ? String(pickNum(p, "id")) : "");
  if (!pid) return undefined;
  return {
    id: pid,
    gateway: pickStr(p, "gateway"),
    gatewayTransaction: pickStr(
      p,
      "gateway_transaction",
      "gatewayTransaction",
    ),
    amount: pickNum(p, "amount", "amount_sar", "total") ?? 0,
    currency: pickStr(p, "currency"),
    status: pickStr(p, "status", "transaction_status"),
    occurredAt: pickStr(p, "occurred_at", "occurredAt", "created_at"),
  };
}

export function mapAdminRefundRowFromApi(raw: unknown): AdminRefundRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const ord = isRecord(o.order) ? asObject(o.order) : null;

  const idStr = pickStr(o, "id", "refund_id", "uuid");
  const idNum = pickNum(o, "id", "refund_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");

  const orderIdStr = pickStr(o, "orderId", "order_id", "order_uuid");
  const orderIdNum = pickNum(o, "orderId", "order_id");
  let orderId =
    orderIdStr ?? (orderIdNum !== undefined ? String(orderIdNum) : undefined);
  if (!orderId && ord) {
    const oid =
      pickStr(ord, "id", "uuid") ??
      (pickNum(ord, "id") !== undefined ? String(pickNum(ord, "id")) : undefined);
    orderId = oid;
  }

  const orderReference = ord
    ? pickStr(ord, "reference", "reference_code", "order_reference")
    : undefined;

  const eventFromOrder =
    ord && isRecord(ord.event)
      ? pickStr(asObject(ord.event), "title", "name", "event_title")
      : undefined;

  let requestedByLabel =
    pickStr(
      o,
      "requestedByLabel",
      "requested_by",
      "user_email",
      "customer_email",
      "email",
      "buyer_email",
    ) ??
    pickStr(o, "userName", "user_name", "customer_name", "name") ??
    "";
  if (!requestedByLabel.trim() && ord && isRecord(ord.user)) {
    const u = asObject(ord.user);
    requestedByLabel =
      pickStr(u, "full_name", "fullName", "name", "email", "user_email") ?? "";
  }
  if (!requestedByLabel.trim()) {
    const ib = pickNum(o, "initiated_by", "initiatedBy");
    if (ib !== undefined) requestedByLabel = `User #${Math.trunc(ib)}`;
  }

  const eventTitle =
    pickStr(
      o,
      "eventTitle",
      "event_title",
      "event_name",
      "eventName",
      "event_title_cache",
    ) ??
    eventFromOrder ??
    (isRecord(o.event) ? pickStr(asObject(o.event), "title", "name") : undefined) ??
    "";

  const descriptionExtra = pickStr(o, "description", "detail", "admin_note");
  const reason =
    pickStr(
      o,
      "reason",
      "refund_reason",
      "rejection_reason",
      "notes",
      "refund_reason_code",
    ) ??
    descriptionExtra ??
    "";
  const description =
    descriptionExtra && descriptionExtra !== reason ? descriptionExtra : undefined;

  const paymentRaw = o.payment_transaction ?? o.paymentTransaction;
  const paymentTransaction = mapRefundPaymentTransactionFromApi(paymentRaw);

  const currency = pickStr(o, "currency");
  const processedAt =
    pickStr(o, "processedAt", "processed_at", "completed_at") ?? undefined;

  const candidate = {
    id,
    status: normalizeRefundStatus(
      pickStr(o, "status", "refund_status", "state"),
    ),
    amountSar:
      pickNum(
        o,
        "amountSar",
        "amount_sar",
        "amount",
        "total",
        "refund_amount",
      ) ?? 0,
    ...(orderId ? { orderId } : {}),
    reason,
    requestedByLabel,
    ...(eventTitle ? { eventTitle } : {}),
    createdAt:
      pickStr(
        o,
        "createdAt",
        "created_at",
        "requested_at",
        "submitted_at",
        "updated_at",
      ) ?? new Date().toISOString(),
    ...(currency ? { currency } : {}),
    ...(processedAt ? { processedAt } : {}),
    ...(orderReference ? { orderReference } : {}),
    ...(description ? { description } : {}),
    ...(paymentTransaction
      ? { paymentTransaction: adminRefundPaymentTransactionSchema.parse(paymentTransaction) }
      : {}),
  };
  return adminRefundRowSchema.parse(candidate);
}

export function mapAdminRefundsFromApi(raw: unknown): AdminRefundRow[] {
  const rows = extractRefundsPayload(raw);
  const mapped = rows.map(mapAdminRefundRowFromApi);
  return adminRefundListSchema.parse(mapped);
}

function extractRefundBreakdownRows(raw: unknown): {
  rows: unknown[];
  totalFromRoot: number | undefined;
} {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return { rows: inner, totalFromRoot: undefined };
  if (isRecord(inner)) {
    const o = inner;
    // Handle Laravel pagination: top-level has current_page, data: [...]
    const dataArr = o.data;
    if (Array.isArray(dataArr)) {
      return { rows: dataArr, totalFromRoot: undefined };
    }
    const totalFromRoot = pickNum(
      o,
      "totalRefundedSar",
      "total_refunded_sar",
      "total_refunds_sar",
      "total_refunded",
      "total_refund_amount",
      "grand_total",
    );
    const nested =
      o.rows ??
      o.items ??
      o.breakdown ??
      o.refund_breakdowns ??
      o.refundBreakdowns ??
      o.categories;
    if (Array.isArray(nested)) return { rows: nested, totalFromRoot };
  }
  throw new ApiJsonError(
    "Expected refund breakdown rows or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

export function mapRefundBreakdownRowFromApi(
  raw: unknown,
  index: number,
): RefundBreakdownRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const label =
    pickStr(
      o,
      "label",
      "name",
      "title",
      "category",
      "reason",
      "bucket",
      "segment",
      "description",
    ) ?? `Bucket ${index + 1}`;
  const keyStr = pickStr(o, "key", "slug", "code", "category_key", "id");
  const keyNum = pickNum(o, "id");
  const key =
    keyStr ?? (keyNum !== undefined ? String(keyNum) : `row-${index}`);
  const candidate = {
    key,
    label,
    amountSar:
      pickNum(
        o,
        "amountSar",
        "amount_sar",
        "amount",
        "total",
        "value",
        "refunded_sar",
        "refund_total",
      ) ?? 0,
    refundCount: intNonNeg(
      pickNum(
        o,
        "refundCount",
        "refund_count",
        "count",
        "refunds",
        "quantity",
        "n",
      ),
    ),
  };
  return refundBreakdownRowSchema.parse(candidate);
}

export function mapRefundBreakdownsFromApi(raw: unknown): RefundBreakdownsView {
  const { rows, totalFromRoot } = extractRefundBreakdownRows(raw);
  const mapped = rows.map((r, i) => mapRefundBreakdownRowFromApi(r, i));
  const sumRows = mapped.reduce((acc, r) => acc + r.amountSar, 0);
  const totalRefundedSar =
    totalFromRoot !== undefined && Number.isFinite(totalFromRoot)
      ? totalFromRoot
      : sumRows;
  return refundBreakdownsViewSchema.parse({ rows: mapped, totalRefundedSar });
}

function extractPayoutsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested = inner.items ?? inner.payouts ?? inner.data ?? inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected payouts array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizePayoutStatus(raw: string | undefined): PayoutStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = payoutStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (
    s === "success" ||
    s === "completed" ||
    s === "settled" ||
    s === "transferred"
  )
    return "paid";
  if (s === "declined" || s === "denied") return "rejected";
  if (s === "in_process" || s === "in-progress") return "processing";
  if (s === "awaiting_approval" || s === "submitted") return "pending";
  return "unknown";
}

export function mapAdminPayoutRowFromApi(raw: unknown): AdminPayoutRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "payout_id", "uuid");
  const idNum = pickNum(o, "id", "payout_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const organizerName =
    pickStr(
      o,
      "organizerName",
      "organizer_name",
      "payee_name",
      "vendor_name",
      "recipient_name",
      "organizer",
      "name",
    ) ??
    (isRecord(o.organizer)
      ? pickStr(asObject(o.organizer), "name", "title", "legal_name")
      : undefined) ??
    "";
  const eventTitle =
    pickStr(o, "eventTitle", "event_title", "event_name", "eventName") ??
    (isRecord(o.event)
      ? pickStr(asObject(o.event), "title", "name")
      : undefined) ??
    "";
  const reference = pickStr(
    o,
    "reference",
    "reference_code",
    "external_id",
    "batch_id",
  );
  const candidate = {
    id,
    status: normalizePayoutStatus(
      pickStr(o, "status", "payout_status", "state"),
    ),
    organizerName,
    amountSar:
      pickNum(
        o,
        "amountSar",
        "amount_sar",
        "amount",
        "total",
        "gross_amount",
        "net_amount",
        "value",
      ) ?? 0,
    createdAt:
      pickStr(
        o,
        "createdAt",
        "created_at",
        "requested_at",
        "submitted_at",
        "updated_at",
      ) ?? new Date().toISOString(),
    ...(eventTitle ? { eventTitle } : {}),
    ...(reference ? { reference } : {}),
  };
  return adminPayoutRowSchema.parse(candidate);
}

export function mapAdminPayoutsFromApi(raw: unknown): AdminPayoutRow[] {
  const rows = extractPayoutsPayload(raw);
  const mapped = rows.map(mapAdminPayoutRowFromApi);
  return adminPayoutListSchema.parse(mapped);
}

function extractAuctionsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested = inner.items ?? inner.auctions ?? inner.data ?? inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected auctions array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeAuctionStatus(raw: string | undefined): AdminAuctionStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminAuctionStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (s === "open" || s === "running" || s === "active" || s === "bidding")
    return "live";
  if (s === "closed" || s === "complete" || s === "completed") return "ended";
  if (s === "finalised") return "finalized";
  if (s === "canceled") return "cancelled";
  if (s === "stopped" || s === "halted") return "paused";
  if (s === "sold") return "sold";
  if (s === "expired") return "expired";
  if (s === "removed") return "removed";
  return "unknown";
}

export function mapAdminAuctionDetailFromApi(raw: unknown): AdminAuctionDetail {
  const base = mapAdminAuctionRowFromApi(raw);
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);

  let organizerName = base.organizerName;
  const sellerParty = mapAuctionPartySummaryFromApi(o.seller);
  if (sellerParty?.fullName && (!organizerName || organizerName.startsWith("Seller #"))) {
    organizerName = sellerParty.fullName;
  }

  const listingCode = pickStr(o, "code", "listing_code", "auction_code");
  const currency = pickStr(o, "currency");
  const startsAt = pickStr(o, "starts_at", "startsAt");
  const soldAt = pickStr(o, "sold_at", "soldAt");
  const cancelledAt = pickStr(o, "cancelled_at", "cancelledAt");
  const cancellationReason = pickStr(
    o,
    "cancellation_reason",
    "cancellationReason",
  );
  const ticketTypeCache = pickStr(o, "ticket_type_cache", "ticketType");
  const seatLabelCache = pickStr(o, "seat_label_cache", "seatLabel");

  const originalPriceSar = pickNum(o, "original_price", "originalPrice");
  const salePriceSar = pickNum(o, "sale_price", "salePrice");
  const commissionPct = pickNum(o, "commission_pct", "commissionPct");
  const commissionAmountSar = pickNum(o, "commission_amount", "commissionAmount");
  const sellerProceedsSar = pickNum(o, "seller_proceeds", "sellerProceeds");

  const eventSummary = mapAuctionEventSummaryFromApi(o.event);
  const ticketSummary = mapAuctionTicketSummaryFromApi(o.ticket);
  const buyerParty = mapAuctionPartySummaryFromApi(o.buyer);

  const txRaw = o.transactions;
  const ledgerTransactions =
    Array.isArray(txRaw) && txRaw.length > 0
      ? txRaw.map((row, i) => mapAuctionLedgerRowFromApi(row, i))
      : undefined;

  const candidate = {
    ...base,
    organizerName,
    ...(listingCode ? { listingCode } : {}),
    ...(currency ? { currency } : {}),
    ...(startsAt ? { startsAt } : {}),
    ...(soldAt ? { soldAt } : {}),
    ...(cancelledAt ? { cancelledAt } : {}),
    ...(cancellationReason ? { cancellationReason } : {}),
    ...(seatLabelCache ? { seatLabelCache } : {}),
    ...(ticketTypeCache ? { ticketTypeCache } : {}),
    ...(originalPriceSar !== undefined ? { originalPriceSar } : {}),
    ...(salePriceSar !== undefined ? { salePriceSar } : {}),
    ...(commissionPct !== undefined ? { commissionPct } : {}),
    ...(commissionAmountSar !== undefined ? { commissionAmountSar } : {}),
    ...(sellerProceedsSar !== undefined ? { sellerProceedsSar } : {}),
    ...(eventSummary ? { eventSummary } : {}),
    ...(ticketSummary ? { ticketSummary } : {}),
    ...(sellerParty ? { seller: sellerParty } : {}),
    ...(buyerParty ? { buyer: buyerParty } : {}),
    ...(ledgerTransactions ? { ledgerTransactions } : {}),
  };
  return adminAuctionDetailSchema.parse(candidate);
}

function mapAuctionPartySummaryFromApi(raw: unknown) {
  if (!isRecord(raw)) return undefined;
  const u = asObject(raw);
  const id =
    pickStr(u, "id") ??
    (pickNum(u, "id") !== undefined ? String(pickNum(u, "id")) : "");
  const fullName =
    pickStr(u, "full_name", "fullName", "name", "display_name", "displayName") ?? "";
  const email = pickStr(u, "email");
  const phone = pickStr(u, "phone");
  if (!id && !fullName && !email) return undefined;
  return adminAuctionPartySummarySchema.parse({
    id: id || "0",
    fullName: fullName || email || "—",
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  });
}

function mapAuctionEventSummaryFromApi(raw: unknown) {
  if (!isRecord(raw)) return undefined;
  const e = asObject(raw);
  const title = pickStr(e, "title", "name");
  const code = pickStr(e, "code", "event_code");
  if (!title && !code) return undefined;
  return adminAuctionEventSummarySchema.parse({
    ...(code ? { code } : {}),
    ...(title ? { title } : {}),
    venueName: pickStr(e, "venue_name", "venueName"),
    venueAddress: pickStr(e, "venue_address", "venueAddress"),
    startsAt: pickStr(e, "starts_at", "startsAt"),
    endsAt: pickStr(e, "ends_at", "endsAt"),
    timezone: pickStr(e, "timezone"),
    status: pickStr(e, "status", "event_status"),
    capacity: pickNum(e, "capacity"),
  });
}

function mapAuctionTicketSummaryFromApi(raw: unknown) {
  if (!isRecord(raw)) return undefined;
  const t = asObject(raw);
  const code =
    pickStr(t, "code", "ticket_code") ??
    (pickNum(t, "id") !== undefined ? `T#${pickNum(t, "id")}` : "");
  if (!code) return undefined;
  const orderId =
    pickStr(t, "order_id", "orderId") ??
    (pickNum(t, "order_id") !== undefined ? String(pickNum(t, "order_id")) : undefined);
  return adminAuctionTicketSummarySchema.parse({
    code,
    status: pickStr(t, "status", "ticket_status"),
    orderReference: pickStr(t, "order_reference", "orderReference"),
    ...(orderId ? { orderId } : {}),
    pricePaidSar: pickNum(t, "price_paid", "pricePaid", "price"),
  });
}

function mapAuctionLedgerRowFromApi(raw: unknown, index: number) {
  const o = asObject(isRecord(raw) ? raw : {});
  const id =
    pickStr(o, "id") ??
    (pickNum(o, "id") !== undefined ? String(pickNum(o, "id")) : `tx-${index}`);
  return adminAuctionLedgerRowSchema.parse({
    id,
    transactionType:
      pickStr(o, "transaction_type", "transactionType", "type") ?? "—",
    amount: pickNum(o, "amount") ?? 0,
    currency: pickStr(o, "currency") ?? "SAR",
    occurredAt: pickStr(o, "occurred_at", "occurredAt", "created_at"),
  });
}

export function mapAdminAuctionRowFromApi(raw: unknown): AdminAuctionRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "auction_id", "uuid");
  const idNum = pickNum(o, "id", "auction_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const title =
    pickStr(
      o,
      "title",
      "name",
      "lot_title",
      "auction_title",
      "label",
      "event_title_cache",
      "eventTitle",
      "event_title",
    ) ??
    pickStr(o, "code", "auction_code", "listing_code") ??
    "";
  const sellerId = pickNum(o, "seller_user_id", "sellerUserId");
  const organizerName =
    pickStr(
      o,
      "organizerName",
      "organizer_name",
      "seller_label",
      "sellerLabel",
      "seller_name",
      "vendor_name",
      "organizer",
    ) ??
    (isRecord(o.seller)
      ? pickStr(asObject(o.seller), "full_name", "fullName", "name", "email")
      : undefined) ??
    (isRecord(o.organizer)
      ? pickStr(asObject(o.organizer), "name", "title")
      : undefined) ??
    (sellerId !== undefined ? `Seller #${sellerId}` : "");
  const highBidSar =
    pickNum(
      o,
      "highBidSar",
      "high_bid_sar",
      "currentBidSar",
      "current_bid_sar",
      "highest_bid",
      "highest_bid_sar",
      "top_bid",
      "current_bid",
      "bid_amount",
      "sale_price",
      "salePrice",
      "price",
      "original_price",
      "originalPrice",
    ) ?? 0;
  const candidate = {
    id,
    title,
    status: normalizeAuctionStatus(
      pickStr(o, "status", "auction_status", "state"),
    ),
    organizerName,
    highBidSar,
    endsAt:
      pickStr(
        o,
        "endsAt",
        "ends_at",
        "end_time",
        "closes_at",
        "auction_end",
        "close_at",
      ) ?? new Date().toISOString(),
  };
  return adminAuctionRowSchema.parse(candidate);
}

export function mapAdminAuctionsFromApi(raw: unknown): AdminAuctionRow[] {
  const rows = extractAuctionsPayload(raw);
  const mapped = rows.map(mapAdminAuctionRowFromApi);
  return adminAuctionListSchema.parse(mapped);
}

function extractScannersPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested = inner.items ?? inner.scanners ?? inner.data ?? inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected scanners array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeScannerStatus(raw: string | undefined): AdminScannerStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminScannerStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (s === "enabled" || s === "ok" || s === "online") return "active";
  if (s === "disabled" || s === "banned" || s === "blocked") return "suspended";
  if (s === "inactive" || s === "away") return "offline";
  return "unknown";
}

function mapScannerOrganizerFieldsFromApi(raw: unknown) {
  if (!isRecord(raw)) return {};
  const org = asObject(raw);
  const orgIdNum = pickNum(org, "id");
  const organizerProfileId =
    pickStr(org, "id") ??
    (orgIdNum !== undefined ? String(Math.trunc(orgIdNum)) : undefined);
  const organizerName =
    pickStr(org, "display_name", "displayName", "name", "title") ?? undefined;
  const organizerCompanyName =
    pickStr(org, "company_name", "companyName") ?? undefined;
  const organizerCode = pickStr(org, "code") ?? undefined;
  const organizerSlug = pickStr(org, "slug") ?? undefined;
  return {
    ...(organizerProfileId ? { organizerProfileId } : {}),
    ...(organizerName ? { organizerName } : {}),
    ...(organizerCompanyName ? { organizerCompanyName } : {}),
    ...(organizerCode ? { organizerCode } : {}),
    ...(organizerSlug ? { organizerSlug } : {}),
  };
}

function resolveScannerStatus(o: Record<string, unknown>): AdminScannerStatus {
  const statusRaw = pickStr(o, "status", "scanner_status", "state");
  if (statusRaw) return normalizeScannerStatus(statusRaw);
  const isActive = pickBool(o, "is_active", "isActive");
  if (isActive === false) return "suspended";
  if (isActive === true) return "active";
  return "unknown";
}

export function mapAdminScannerRowFromApi(raw: unknown): AdminScannerRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "scanner_id", "uuid");
  const idNum = pickNum(o, "id", "scanner_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const code = pickStr(o, "code", "scanner_code");
  const displayName =
    pickStr(
      o,
      "displayName",
      "display_name",
      "name",
      "label",
      "scanner_name",
      "title",
    ) ?? "";
  const email = pickStr(o, "email");
  const nestedOrganizer = mapScannerOrganizerFieldsFromApi(o.organizer);
  const flatOrganizerName =
    pickStr(o, "organizerName", "organizer_name", "vendor_name") ?? undefined;
  const organizerName = nestedOrganizer.organizerName ?? flatOrganizerName;
  const deviceLabel = pickStr(
    o,
    "deviceLabel",
    "device_label",
    "device_name",
    "device",
    "terminal",
  );
  const lastSeenAt =
    pickStr(
      o,
      "lastSeenAt",
      "last_seen_at",
      "last_login_at",
      "lastLoginAt",
      "last_active_at",
    ) ?? undefined;
  const candidate = {
    id,
    displayName,
    status: resolveScannerStatus(o),
    ...(code ? { code } : {}),
    ...(email ? { email } : {}),
    ...(organizerName ? { organizerName } : {}),
    ...nestedOrganizer,
    ...(deviceLabel ? { deviceLabel } : {}),
    ...(lastSeenAt ? { lastSeenAt } : {}),
  };
  return adminScannerRowSchema.parse(candidate);
}

export function mapAdminScannersFromApi(raw: unknown): AdminScannerRow[] {
  const rows = extractScannersPayload(raw);
  const mapped = rows.map(mapAdminScannerRowFromApi);
  return adminScannerListSchema.parse(mapped);
}

function extractScanLogsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested =
      inner.items ??
      inner.logs ??
      inner.scan_logs ??
      inner.scanLogs ??
      inner.data ??
      inner.results;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected scan logs array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeScanLogOutcome(raw: string | undefined): AdminScanLogOutcome {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminScanLogOutcomeSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (s === "ok" || s === "success" || s === "accepted" || s === "valid_ticket")
    return "valid";
  if (s === "duplicate" || s === "double" || s === "already_used")
    return "duplicate";
  if (s === "invalid" || s === "rejected" || s === "denied") return "invalid";
  if (s === "failed" || s === "error" || s === "exception") return "error";
  return "unknown";
}

function resolveAdminDetailPath(
  detailHref?: string,
  apiHref?: string,
  opts?: { orderId?: string; ticketId?: string },
): string | undefined {
  if (detailHref) {
    try {
      if (detailHref.startsWith("http://") || detailHref.startsWith("https://")) {
        const u = new URL(detailHref);
        return `${u.pathname}${u.search}`;
      }
      if (detailHref.startsWith("/")) return detailHref;
    } catch {
      // fall through to api_href
    }
  }
  if (apiHref?.startsWith("/")) {
    const eventMatch = apiHref.match(/\/api\/v\d+\/admin\/events\/(\d+)/);
    if (eventMatch) return `/events/${eventMatch[1]}`;
    const orderMatch = apiHref.match(/\/api\/v\d+\/admin\/orders\/(\d+)/);
    if (orderMatch) {
      const base = `/orders/${orderMatch[1]}`;
      const ticketId = opts?.ticketId;
      return ticketId ? `${base}?ticket=${encodeURIComponent(ticketId)}` : base;
    }
  }
  if (opts?.orderId && opts.ticketId) {
    return `/orders/${opts.orderId}?ticket=${encodeURIComponent(opts.ticketId)}`;
  }
  return undefined;
}

function mapScanLogScannerFieldsFromApi(
  o: Record<string, unknown>,
): Pick<
  AdminScanLogRow,
  | "scannerLabel"
  | "scannerId"
  | "scannerCode"
  | "scannerName"
  | "scannerEmail"
  | "organizerProfileId"
  | "organizerName"
  | "organizerCode"
> {
  const scannerObj = isRecord(o.scanner) ? asObject(o.scanner) : null;
  const scannerIdRaw = scannerObj
    ? (pickStr(scannerObj, "id", "scanner_id") ??
      (pickNum(scannerObj, "id", "scanner_id") !== undefined
        ? String(pickNum(scannerObj, "id", "scanner_id"))
        : undefined))
    : undefined;
  const scannerCode = scannerObj ? pickStr(scannerObj, "code") : undefined;
  const scannerName = scannerObj
    ? pickStr(scannerObj, "name", "display_name", "displayName")
    : undefined;
  const scannerEmail = scannerObj ? pickStr(scannerObj, "email") : undefined;
  const scannerLabel =
    pickStr(o, "scannerLabel", "scanner_label", "scanner_name", "device_name") ??
    (scannerName && scannerCode
      ? `${scannerName} (${scannerCode})`
      : (scannerName ?? scannerCode));

  const organizerObj =
    scannerObj && isRecord(scannerObj.organizer)
      ? asObject(scannerObj.organizer)
      : null;
  const organizerProfileIdRaw = scannerObj
    ? (pickStr(scannerObj, "organizer_profile_id", "organizerProfileId") ??
      (organizerObj
        ? (pickStr(organizerObj, "id") ??
          (pickNum(organizerObj, "id") !== undefined
            ? String(pickNum(organizerObj, "id"))
            : undefined))
        : undefined))
    : undefined;

  return {
    ...(scannerLabel ? { scannerLabel } : {}),
    ...(scannerIdRaw ? { scannerId: scannerIdRaw } : {}),
    ...(scannerCode ? { scannerCode } : {}),
    ...(scannerName ? { scannerName } : {}),
    ...(scannerEmail ? { scannerEmail } : {}),
    ...(organizerProfileIdRaw ? { organizerProfileId: organizerProfileIdRaw } : {}),
    ...(organizerObj
      ? {
          ...(pickStr(organizerObj, "display_name", "displayName", "name")
            ? {
                organizerName: pickStr(
                  organizerObj,
                  "display_name",
                  "displayName",
                  "name",
                ),
              }
            : {}),
          ...(pickStr(organizerObj, "code")
            ? { organizerCode: pickStr(organizerObj, "code") }
            : {}),
        }
      : {}),
  };
}

function mapScanLogEventFieldsFromApi(
  o: Record<string, unknown>,
): Pick<
  AdminScanLogRow,
  "eventId" | "eventCode" | "eventTitle" | "eventStatus" | "eventDetailPath"
> {
  const eventObj = isRecord(o.event) ? asObject(o.event) : null;
  const eventIdRaw = eventObj
    ? (pickStr(eventObj, "id", "event_id") ??
      (pickNum(eventObj, "id", "event_id") !== undefined
        ? String(pickNum(eventObj, "id", "event_id"))
        : undefined))
    : undefined;
  const eventTitle =
    pickStr(o, "eventTitle", "event_title", "event_name") ??
    (eventObj ? pickStr(eventObj, "title", "name") : undefined);
  const eventCode = eventObj ? pickStr(eventObj, "code") : undefined;
  const eventStatus = eventObj ? pickStr(eventObj, "status") : undefined;
  const eventDetailPath = eventObj
    ? resolveAdminDetailPath(
        pickStr(eventObj, "detail_href", "detailHref"),
        pickStr(eventObj, "api_href", "apiHref"),
      )
    : eventIdRaw
      ? `/events/${eventIdRaw}`
      : undefined;

  return {
    ...(eventIdRaw ? { eventId: eventIdRaw } : {}),
    ...(eventCode ? { eventCode } : {}),
    ...(eventTitle ? { eventTitle } : {}),
    ...(eventStatus ? { eventStatus } : {}),
    ...(eventDetailPath ? { eventDetailPath } : {}),
  };
}

function mapScanLogTicketFieldsFromApi(
  o: Record<string, unknown>,
): Pick<
  AdminScanLogRow,
  | "ticketRef"
  | "ticketId"
  | "ticketCode"
  | "ticketStatus"
  | "ticketOrderId"
  | "ticketSeatLabel"
  | "ticketTypeName"
  | "ticketDetailPath"
> {
  const ticketObj = isRecord(o.ticket) ? asObject(o.ticket) : null;
  const ticketIdRaw = ticketObj
    ? (pickStr(ticketObj, "id", "ticket_id") ??
      (pickNum(ticketObj, "id", "ticket_id") !== undefined
        ? String(pickNum(ticketObj, "id", "ticket_id"))
        : undefined))
    : undefined;
  const ticketOrderIdRaw = ticketObj
    ? (pickStr(ticketObj, "order_id", "orderId") ??
      (pickNum(ticketObj, "order_id", "orderId") !== undefined
        ? String(pickNum(ticketObj, "order_id", "orderId"))
        : undefined))
    : undefined;
  const ticketCode = ticketObj ? pickStr(ticketObj, "code") : undefined;
  const ticketRef =
    pickStr(
      o,
      "ticketRef",
      "ticket_ref",
      "ticket_code",
      "reference",
    ) ?? ticketCode;
  const ticketDetailPath = ticketObj
    ? resolveAdminDetailPath(
        pickStr(ticketObj, "detail_href", "detailHref"),
        pickStr(ticketObj, "api_href", "apiHref"),
        { orderId: ticketOrderIdRaw, ticketId: ticketIdRaw },
      )
    : undefined;

  return {
    ...(ticketRef ? { ticketRef } : {}),
    ...(ticketIdRaw ? { ticketId: ticketIdRaw } : {}),
    ...(ticketCode ? { ticketCode } : {}),
    ...(ticketObj && pickStr(ticketObj, "status")
      ? { ticketStatus: pickStr(ticketObj, "status") }
      : {}),
    ...(ticketOrderIdRaw ? { ticketOrderId: ticketOrderIdRaw } : {}),
    ...(ticketObj && pickStr(ticketObj, "seat_label", "seatLabel")
      ? { ticketSeatLabel: pickStr(ticketObj, "seat_label", "seatLabel") }
      : {}),
    ...(ticketObj && pickStr(ticketObj, "type_name", "typeName")
      ? { ticketTypeName: pickStr(ticketObj, "type_name", "typeName") }
      : {}),
    ...(ticketDetailPath ? { ticketDetailPath } : {}),
  };
}

export function mapAdminScanLogRowFromApi(raw: unknown): AdminScanLogRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "log_id", "uuid");
  const idNum = pickNum(o, "id", "log_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const scannedAt =
    pickStr(
      o,
      "scannedAt",
      "scanned_at",
      "created_at",
      "timestamp",
      "occurred_at",
    ) ?? new Date().toISOString();
  const resultRaw = pickStr(o, "result", "outcome", "status", "scan_status");
  const candidate = {
    id,
    scannedAt,
    outcome: normalizeScanLogOutcome(resultRaw),
    ...(resultRaw ? { result: resultRaw } : {}),
    ...mapScanLogScannerFieldsFromApi(o),
    ...mapScanLogEventFieldsFromApi(o),
    ...mapScanLogTicketFieldsFromApi(o),
  };
  return adminScanLogRowSchema.parse(candidate);
}

export function mapAdminScanLogsFromApi(raw: unknown): AdminScanLogRow[] {
  const rows = extractScanLogsPayload(raw);
  const mapped = rows.map(mapAdminScanLogRowFromApi);
  return adminScanLogListSchema.parse(mapped);
}

function normalizeKycDocStatus(raw: string | undefined): AdminKycDocStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminKycDocStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (
    s === "verified" ||
    s === "accepted" ||
    s === "complete" ||
    s === "completed"
  )
    return "approved";
  if (s === "declined" || s === "denied") return "rejected";
  if (
    s === "submitted" ||
    s === "pending_review" ||
    s === "under_review" ||
    s === "in_review" ||
    s === "uploaded"
  )
    return "pending";
  return "unknown";
}

function extractKycDocumentsFromDetail(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const direct =
      inner.documents ??
      inner.kyc_documents ??
      inner.kycDocuments ??
      inner.items ??
      inner.files;
    if (Array.isArray(direct)) return direct;
    if (isRecord(inner.data)) {
      const d = inner.data as Record<string, unknown>;
      const nested = d.documents ?? d.kyc_documents ?? d.items;
      if (Array.isArray(nested)) return nested;
    }
  }
  return [];
}

export function mapAdminKycDocumentFromApi(raw: unknown): AdminKycDocument {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(
    o,
    "id",
    "document_id",
    "uuid",
    "kyc_document_id",
    "file_id",
  );
  const idNum = pickNum(o, "id", "document_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const label = pickStr(
    o,
    "label",
    "title",
    "name",
    "document_name",
    "file_name",
    "document_label",
  );
  const docType = pickStr(
    o,
    "docType",
    "doc_type",
    "type",
    "kind",
    "category",
    "document_type",
  );
  const uploadedAt = pickStr(
    o,
    "uploadedAt",
    "uploaded_at",
    "created_at",
    "submitted_at",
  );
  const fileUrl = pickStr(
    o,
    "fileUrl",
    "file_url",
    "url",
    "download_url",
    "path",
    "document_url",
  );
  const candidate = {
    id,
    status: normalizeKycDocStatus(
      pickStr(o, "status", "state", "review_status", "verification_status"),
    ),
    ...(label ? { label } : {}),
    ...(docType ? { docType } : {}),
    ...(uploadedAt ? { uploadedAt } : {}),
    ...(fileUrl ? { fileUrl } : {}),
  };
  return adminKycDocumentSchema.parse(candidate);
}

/** Maps `GET …/finance/organizers/{id}/kyc` payloads; `organizerId` is the path id when the body omits it. */
export function mapAdminOrganizerKycFromApi(
  raw: unknown,
  organizerId: string,
): AdminOrganizerKycDetail {
  const docsRaw = extractKycDocumentsFromDetail(raw);
  const documents = docsRaw.map(mapAdminKycDocumentFromApi);
  return adminOrganizerKycDetailSchema.parse({
    organizerId,
    documents,
  });
}

function extractComplaintsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    // Handle nested pagination
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      const nested = dataObj.data;
      if (Array.isArray(nested)) return nested;
    }
    const nested =
      inner.items ??
      inner.complaints ??
      inner.data ??
      inner.results ??
      inner.rows ??
      inner.records;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected complaints array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeComplaintStatus(
  raw: string | undefined,
): AdminComplaintStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminComplaintStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (s === "new" || s === "submitted" || s === "pending") return "open";
  if (s === "in_review" || s === "reviewing" || s === "assigned")
    return "triaged";
  if (s === "closed" || s === "complete" || s === "done") return "resolved";
  if (s === "escalation" || s === "high_priority") return "escalated";
  return "unknown";
}

export function mapAdminComplaintRowFromApi(raw: unknown): AdminComplaintRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "complaint_id", "uuid", "reference");
  const idNum = pickNum(o, "id", "complaint_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const title =
    pickStr(o, "title", "subject", "summary", "description", "body") ||
    (typeof o.message === "string" && o.message.trim() !== ""
      ? o.message.trim().slice(0, 120)
      : "") ||
    "Complaint";
  const createdAt =
    pickStr(o, "createdAt", "created_at", "submitted_at", "opened_at") ??
    new Date().toISOString();
  const updatedAt = pickStr(o, "updatedAt", "updated_at", "modified_at");
  const category = pickStr(o, "category", "category_key", "type", "kind");
  const reporterLabel =
    pickStr(
      o,
      "reporterLabel",
      "reporter_label",
      "reporter_email",
      "user_email",
      "submitted_by",
    ) ??
    (isRecord(o.reporter)
      ? pickStr(asObject(o.reporter), "email", "name", "label")
      : undefined);
  const targetLabel =
    pickStr(o, "targetLabel", "target_label", "against", "target_name") ??
    (isRecord(o.target)
      ? pickStr(asObject(o.target), "name", "title", "label")
      : undefined);
  const candidate = {
    id,
    title: title.length > 200 ? `${title.slice(0, 197)}…` : title,
    status: normalizeComplaintStatus(
      pickStr(o, "status", "state", "complaint_status", "workflow_status"),
    ),
    createdAt,
    ...(category ? { category } : {}),
    ...(reporterLabel ? { reporterLabel } : {}),
    ...(targetLabel ? { targetLabel } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
  return adminComplaintRowSchema.parse(candidate);
}

export function mapAdminComplaintsFromApi(raw: unknown): AdminComplaintRow[] {
  const rows = extractComplaintsPayload(raw);
  const mapped = rows.map(mapAdminComplaintRowFromApi);
  return adminComplaintListSchema.parse(mapped);
}

function extractAdminActionsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested =
      inner.actions ??
      inner.items ??
      inner.admin_actions ??
      inner.data ??
      inner.results ??
      inner.rows;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected admin-actions array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

export function mapAdminActionRowFromApi(raw: unknown): AdminActionRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "uuid", "action_id");
  const idNum = pickNum(o, "id", "action_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const actionKey =
    pickStr(
      o,
      "actionKey",
      "action_key",
      "key",
      "slug",
      "name",
      "code",
      "command",
    ) ?? (id ? id : "action");
  const label =
    pickStr(o, "label", "title", "display_name", "human_name") ??
    actionKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const description = pickStr(
    o,
    "description",
    "help_text",
    "details",
    "summary",
  );
  const category = pickStr(o, "category", "group", "section", "domain");
  const candidate = {
    id: id || actionKey,
    actionKey,
    label,
    ...(description ? { description } : {}),
    ...(category ? { category } : {}),
  };
  return adminActionRowSchema.parse(candidate);
}

export function mapAdminActionsFromApi(raw: unknown): AdminActionRow[] {
  const rows = extractAdminActionsPayload(raw);
  const mapped = rows.map(mapAdminActionRowFromApi);
  return adminActionListSchema.parse(mapped);
}

function extractAuditLogsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested =
      inner.logs ??
      inner.items ??
      inner.audit_logs ??
      inner.auditLogs ??
      inner.entries ??
      inner.data ??
      inner.results ??
      inner.rows;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected audit-logs array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

export function mapAdminAuditLogRowFromApi(raw: unknown): AdminAuditLogRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "log_id", "uuid", "audit_id");
  const idNum = pickNum(o, "id", "log_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const summary =
    pickStr(
      o,
      "summary",
      "message",
      "description",
      "action",
      "title",
      "event",
    ) ||
    (typeof o.payload === "string" ? o.payload.slice(0, 160) : "") ||
    "Audit entry";
  const createdAt =
    pickStr(
      o,
      "createdAt",
      "created_at",
      "timestamp",
      "occurred_at",
      "logged_at",
    ) ?? new Date().toISOString();
  const actorLabel =
    pickStr(
      o,
      "actorLabel",
      "actor_label",
      "actor",
      "admin_email",
      "user_email",
      "performed_by",
    ) ??
    (isRecord(o.actor)
      ? pickStr(asObject(o.actor), "email", "name", "label")
      : undefined) ??
    (isRecord(o.user) ? pickStr(asObject(o.user), "email", "name") : undefined);
  const resourceType = pickStr(
    o,
    "resourceType",
    "resource_type",
    "subject_type",
    "entity_type",
    "model",
    "target_type",
  );
  const resourceId = pickStr(
    o,
    "resourceId",
    "resource_id",
    "subject_id",
    "entity_id",
    "target_id",
    "object_id",
  );
  const candidate = {
    id,
    summary: summary.length > 240 ? `${summary.slice(0, 237)}…` : summary,
    createdAt,
    ...(actorLabel ? { actorLabel } : {}),
    ...(resourceType ? { resourceType } : {}),
    ...(resourceId ? { resourceId } : {}),
  };
  return adminAuditLogRowSchema.parse(candidate);
}

export function mapAdminAuditLogsFromApi(raw: unknown): AdminAuditLogRow[] {
  const rows = extractAuditLogsPayload(raw);
  const mapped = rows.map(mapAdminAuditLogRowFromApi);
  return adminAuditLogListSchema.parse(mapped);
}

export function mapAdminAuditLogDetailFromApi(
  raw: unknown,
): AdminAuditLogDetail {
  const base = mapAdminAuditLogRowFromApi(raw);
  const inner = unwrapApiJson(raw);
  const o = isRecord(inner) ? inner : {};
  const ip = pickStr(o, "ip", "ip_address", "client_ip", "remote_ip");
  const userAgent = pickStr(o, "userAgent", "user_agent", "ua", "browser");
  const changes =
    (isRecord(o.changes) ? o.changes : undefined) ??
    (isRecord(o.diff) ? o.diff : undefined) ??
    (isRecord(o.metadata) && !Array.isArray(o.metadata)
      ? o.metadata
      : undefined);
  return adminAuditLogDetailSchema.parse({
    ...base,
    ...(ip ? { ip } : {}),
    ...(userAgent ? { userAgent } : {}),
    ...(changes && Object.keys(changes).length > 0 ? { changes } : {}),
  });
}

function isLaravelPaginator(o: Record<string, unknown>): boolean {
  return Array.isArray(o.data) && ("current_page" in o || "per_page" in o || "total" in o);
}

function extractRecentNotificationsPayload(raw: unknown): unknown[] {
  if (isRecord(raw) && isLaravelPaginator(raw)) {
    return raw.data as unknown[];
  }
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (isLaravelPaginator(inner)) return inner.data as unknown[];
    const nested =
      inner.items ??
      inner.notifications ??
      inner.recent ??
      inner.data ??
      inner.results ??
      inner.rows;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected recent notifications array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

/** Rows include a `data` payload — do not unwrap via the generic `{ data }` envelope helper. */
function asNotificationRowObject(raw: unknown): Record<string, unknown> {
  if (isRecord(raw)) {
    if (
      "title" in raw ||
      "is_read" in raw ||
      "kind" in raw ||
      pickNum(raw, "id", "notification_id") !== undefined
    ) {
      return asObject(raw);
    }
  }
  return asObject(unwrapApiJson(raw));
}

function normalizeNotificationHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "#") return undefined;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return path.replace(/\/+/g, "/");
}

export function mapAdminRecentNotificationRowFromApi(
  raw: unknown,
): AdminRecentNotificationRow {
  const o = asNotificationRowObject(raw);
  const idStr = pickStr(o, "id", "uuid", "notification_id");
  const idNum = pickNum(o, "id", "notification_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const title =
    pickStr(o, "title", "subject", "heading", "summary") ||
    (typeof o.body === "string" && o.body.trim() !== ""
      ? o.body.trim().slice(0, 120)
      : "") ||
    "Notification";
  const body = pickStr(o, "body", "message", "content", "text");
  const kind = pickStr(o, "kind", "notification_kind", "type") ?? undefined;
  const deliveryChannel = pickStr(o, "channel", "via", "medium", "delivery_channel");
  const channel = deliveryChannel ?? (kind && !kind.includes("_") ? kind : undefined);
  const read =
    pickBool(o, "read", "is_read", "seen") ??
    (pickStr(o, "read_at", "seen_at") ? true : undefined);
  const createdAt =
    pickStr(o, "createdAt", "created_at", "sent_at", "timestamp") ??
    new Date().toISOString();
  const href = normalizeNotificationHref(pickStr(o, "href", "link", "url"));
  const candidate = {
    id,
    title: title.length > 200 ? `${title.slice(0, 197)}…` : title,
    createdAt,
    ...(body ? { body } : {}),
    ...(kind ? { kind } : {}),
    ...(channel ? { channel } : {}),
    ...(href ? { href } : {}),
    ...(read !== undefined ? { read } : {}),
  };
  return adminRecentNotificationRowSchema.parse(candidate);
}

export function mapAdminUploadFromApi(raw: unknown): {
  url: string;
  contentType?: string;
  sizeBytes?: number;
} {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const url = pickStr(o, "url") ?? "";
  const contentType = pickStr(o, "content_type", "contentType");
  const sizeNum = pickNum(o, "size_bytes", "sizeBytes");
  return {
    url,
    ...(contentType ? { contentType } : {}),
    ...(sizeNum !== undefined ? { sizeBytes: Math.trunc(sizeNum) } : {}),
  };
}

export function mapAdminProfileImageUploadFromApi(
  raw: unknown,
): AdminProfileImageUploadResult {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const profileImageUrl =
    pickStr(o, "profile_image_url", "profileImageUrl") ??
    pickStr(o, "avatar_url", "avatarUrl") ??
    "";
  const avatarUrl =
    pickStr(o, "avatar_url", "avatarUrl") ??
    pickStr(o, "profile_image_url", "profileImageUrl") ??
    profileImageUrl;
  const userIdRaw = pickNum(o, "user_id", "userId");
  const contentType = pickStr(o, "content_type", "contentType");
  const sizeNum = pickNum(o, "size_bytes", "sizeBytes");
  const syncedRaw = o.synced_profiles ?? o.syncedProfiles;
  const syncedProfiles = Array.isArray(syncedRaw)
    ? syncedRaw.filter((x): x is string => typeof x === "string")
    : undefined;
  return adminProfileImageUploadSchema.parse({
    ...(userIdRaw !== undefined ? { userId: String(Math.trunc(userIdRaw)) } : {}),
    profileImageUrl: profileImageUrl || avatarUrl,
    avatarUrl: avatarUrl || profileImageUrl,
    ...(contentType ? { contentType } : {}),
    ...(sizeNum !== undefined ? { sizeBytes: Math.trunc(sizeNum) } : {}),
    ...(syncedProfiles?.length ? { syncedProfiles } : {}),
  });
}

export function mapAdminRecentNotificationsFromApi(
  raw: unknown,
): AdminRecentNotificationRow[] {
  const rows = extractRecentNotificationsPayload(raw);
  const mapped = rows.map(mapAdminRecentNotificationRowFromApi);
  return adminRecentNotificationListSchema.parse(mapped);
}

function extractDeliveryLogsPayload(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    const nested =
      inner.items ??
      inner.logs ??
      inner.entries ??
      inner.deliveries ??
      inner.delivery_log ??
      inner.data ??
      inner.results ??
      inner.rows;
    if (Array.isArray(nested)) return nested;
  }
  throw new ApiJsonError(
    "Expected delivery log array or wrapped list",
    "expected_array",
    { cause: raw },
  );
}

function normalizeDeliveryStatus(
  raw: string | undefined,
): AdminNotificationDeliveryStatus {
  const s = (raw ?? "unknown").toLowerCase().replace(/\s+/g, "_");
  const parsed = adminNotificationDeliveryStatusSchema.safeParse(s);
  if (parsed.success) return parsed.data;
  if (s === "delivered" || s === "ok" || s === "success") return "sent";
  if (s === "error" || s === "undeliverable") return "failed";
  if (s === "queued" || s === "scheduled" || s === "processing")
    return "pending";
  return "unknown";
}

export function mapAdminDeliveryLogRowFromApi(
  raw: unknown,
): AdminDeliveryLogRow {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idStr = pickStr(o, "id", "uuid", "log_id", "delivery_id");
  const idNum = pickNum(o, "id", "log_id");
  const id = idStr ?? (idNum !== undefined ? String(idNum) : "");
  const channel = pickStr(o, "channel", "via", "medium", "transport");
  const status = normalizeDeliveryStatus(
    pickStr(o, "status", "state", "delivery_status", "outcome"),
  );
  const recipient = pickStr(
    o,
    "recipient",
    "to",
    "to_email",
    "phone",
    "destination",
  );
  const templateKey = pickStr(
    o,
    "templateKey",
    "template_key",
    "template",
    "template_id",
    "kind",
  );
  const sentAt = pickStr(o, "sentAt", "sent_at", "delivered_at", "created_at");
  const errorMessage = pickStr(
    o,
    "errorMessage",
    "error_message",
    "failure_reason",
    "error",
  );
  const candidate = {
    id,
    status,
    ...(channel ? { channel } : {}),
    ...(recipient ? { recipient } : {}),
    ...(templateKey ? { templateKey } : {}),
    ...(sentAt ? { sentAt } : {}),
    ...(errorMessage ? { errorMessage } : {}),
  };
  return adminDeliveryLogRowSchema.parse(candidate);
}

export function mapAdminDeliveryLogsFromApi(
  raw: unknown,
): AdminDeliveryLogRow[] {
  const rows = extractDeliveryLogsPayload(raw);
  const mapped = rows.map(mapAdminDeliveryLogRowFromApi);
  return adminDeliveryLogListSchema.parse(mapped);
}

const HEALTH_EXTRACT_KEYS = new Set([
  "status",
  "overall",
  "health",
  "state",
  "message",
  "detail",
  "error",
  "checked_at",
  "checkedAt",
  "timestamp",
  "time",
  "data",
]);

export function mapAdminHealthFromApi(raw: unknown): AdminHealthView {
  const inner = unwrapApiJson(raw);
  const o = isRecord(inner) ? inner : {};
  const statusStr =
    pickStr(o, "status", "overall", "health", "state") ??
    (pickBool(o, "ok") === true
      ? "ok"
      : pickBool(o, "ok") === false
        ? "error"
        : undefined);
  const status = statusStr && statusStr.length > 0 ? statusStr : "unknown";
  const message = pickStr(o, "message", "detail", "error", "description");
  const checkedAt = pickStr(o, "checked_at", "checkedAt", "timestamp", "time");
  const extras: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (!HEALTH_EXTRACT_KEYS.has(k)) extras[k] = v;
  }
  const candidate: AdminHealthView = {
    status,
    ...(message ? { message } : {}),
    ...(checkedAt ? { checkedAt } : {}),
    ...(Object.keys(extras).length > 0 ? { extras } : {}),
  };
  return adminHealthViewSchema.parse(candidate);
}

const VERSION_EXTRACT_KEYS = new Set([
  "version",
  "app_version",
  "tag",
  "semver",
  "commit",
  "git_commit",
  "git_sha",
  "revision",
  "sha",
  "build_date",
  "built_at",
  "buildDate",
  "build_time",
  "released_at",
  "environment",
  "env",
  "app_env",
  "data",
]);

export function mapAdminVersionFromApi(raw: unknown): AdminVersionView {
  const inner = unwrapApiJson(raw);
  const o = isRecord(inner) ? inner : {};
  const verNum = pickNum(o, "version");
  const version =
    pickStr(o, "version", "app_version", "tag", "semver", "name") ??
    (verNum !== undefined ? String(verNum) : undefined) ??
    "unknown";
  const commit = pickStr(
    o,
    "commit",
    "git_commit",
    "revision",
    "sha",
    "git_sha",
  );
  const buildDate = pickStr(
    o,
    "build_date",
    "built_at",
    "buildDate",
    "build_time",
    "released_at",
  );
  const environment = pickStr(o, "environment", "env", "app_env", "stage");
  const extras: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (!VERSION_EXTRACT_KEYS.has(k)) extras[k] = v;
  }
  const candidate: AdminVersionView = {
    version,
    ...(commit ? { commit } : {}),
    ...(buildDate ? { buildDate } : {}),
    ...(environment ? { environment } : {}),
    ...(Object.keys(extras).length > 0 ? { extras } : {}),
  };
  return adminVersionViewSchema.parse(candidate);
}

function parseOpeningHoursFromApi(raw: unknown) {
  const defaults = {
    mon: { closed: false, opens: "09:00", closes: "18:00" },
    tue: { closed: false, opens: "09:00", closes: "18:00" },
    wed: { closed: false, opens: "09:00", closes: "18:00" },
    thu: { closed: false, opens: "09:00", closes: "18:00" },
    fri: { closed: false, opens: "14:00", closes: "22:00" },
    sat: { closed: false, opens: "09:00", closes: "22:00" },
    sun: { closed: true },
  };
  if (!isRecord(raw)) return defaults;
  const o = asObject(raw);
  const out: Record<WeekdayKey, { closed: boolean; opens?: string; closes?: string }> =
    { ...defaults };
  for (const day of WEEKDAY_KEYS) {
    const block = o[day];
    if (!isRecord(block)) continue;
    const b = asObject(block);
    const closed = pickBool(b, "closed") ?? false;
    out[day] = {
      closed,
      ...(closed
        ? {}
        : {
            opens: pickStr(b, "opens", "open"),
            closes: pickStr(b, "closes", "close"),
          }),
    };
  }
  return out;
}

function mapTourismAdUserSummaryFromApi(raw: unknown) {
  if (!isRecord(raw)) return null;
  const o = asObject(raw);
  const idNum = pickNum(o, "id");
  const id =
    pickStr(o, "id") ?? (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  if (!id) return null;
  return {
    id,
    ...(pickStr(o, "full_name", "fullName", "name")
      ? { fullName: pickStr(o, "full_name", "fullName", "name") }
      : {}),
    ...(pickStr(o, "email") ? { email: pickStr(o, "email") } : {}),
  };
}

function parseTourismAdStatus(raw: string | undefined) {
  const s = (raw ?? "draft").toLowerCase();
  if (
    s === "draft" ||
    s === "pending_review" ||
    s === "published" ||
    s === "rejected" ||
    s === "withdrawn" ||
    s === "archived"
  ) {
    return s;
  }
  return "pending_review" as const;
}

function parseTourismAdSource(raw: string | undefined) {
  const s = (raw ?? "guest").toLowerCase();
  return s === "admin" ? "admin" : "guest";
}

export function mapTourismAdFromApi(raw: unknown): TourismAd {
  const inner = unwrapApiJson(raw);
  const o = asObject(inner);
  const idNum = pickNum(o, "id");
  const id =
    pickStr(o, "id") ?? (idNum !== undefined ? String(Math.trunc(idNum)) : "");
  const userIdNum = pickNum(o, "user_id", "userId");
  const createdByNum = pickNum(o, "created_by_user_id", "createdByUserId");
  const reviewedByNum = pickNum(o, "reviewed_by_user_id", "reviewedByUserId");
  const servicesRaw = o.services;
  const services = Array.isArray(servicesRaw)
    ? servicesRaw.filter((x): x is string => typeof x === "string" && x.length > 0)
    : [];
  const mediaRaw = o.media_links ?? o.mediaLinks;
  const mediaLinks = Array.isArray(mediaRaw)
    ? mediaRaw
        .map((item) => {
          if (!isRecord(item)) return null;
          const m = asObject(item);
          const platform = pickStr(m, "platform") ?? "";
          const url = pickStr(m, "url") ?? "";
          if (!platform || !url) return null;
          return { platform, url };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
    : [];
  const galleryRaw = o.gallery_urls ?? o.galleryUrls;
  const galleryUrls = Array.isArray(galleryRaw)
    ? galleryRaw.filter((x): x is string => typeof x === "string" && x.length > 0)
    : [];
  const contactRaw = isRecord(o.contact) ? asObject(o.contact) : {};
  const carouselPos = pickNum(o, "carousel_position", "carouselPosition");
  const user = mapTourismAdUserSummaryFromApi(o.user);
  const createdBy = mapTourismAdUserSummaryFromApi(o.created_by ?? o.createdBy);
  const reviewedBy = mapTourismAdUserSummaryFromApi(o.reviewed_by ?? o.reviewedBy);
  const candidate = {
    id,
    ...(userIdNum !== undefined ? { userId: String(Math.trunc(userIdNum)) } : {}),
    ...(createdByNum !== undefined
      ? { createdByUserId: String(Math.trunc(createdByNum)) }
      : {}),
    ...(reviewedByNum !== undefined
      ? { reviewedByUserId: String(Math.trunc(reviewedByNum)) }
      : {}),
    source: parseTourismAdSource(
      pickStr(o, "source"),
    ),
    status: parseTourismAdStatus(pickStr(o, "status")),
    locationName:
      pickStr(o, "locationName", "location_name") ?? "Untitled location",
    latitude: String(pickStr(o, "latitude") ?? pickNum(o, "latitude") ?? "0"),
    longitude: String(pickStr(o, "longitude") ?? pickNum(o, "longitude") ?? "0"),
    description: pickStr(o, "description") ?? "",
    openingHours: parseOpeningHoursFromApi(o.opening_hours ?? o.openingHours),
    services,
    contact: {
      ...(pickStr(contactRaw, "phone") ? { phone: pickStr(contactRaw, "phone") } : {}),
      ...(pickStr(contactRaw, "email") ? { email: pickStr(contactRaw, "email") } : {}),
      ...(pickStr(contactRaw, "website")
        ? { website: pickStr(contactRaw, "website") }
        : {}),
      ...(pickStr(contactRaw, "whatsapp")
        ? { whatsapp: pickStr(contactRaw, "whatsapp") }
        : {}),
    },
    mediaLinks,
    galleryUrls,
    ...(pickStr(o, "cover_image_url", "coverImageUrl")
      ? { coverImageUrl: pickStr(o, "cover_image_url", "coverImageUrl") }
      : galleryUrls[0]
        ? { coverImageUrl: galleryUrls[0] }
        : {}),
    visibilityStartsAt:
      pickStr(o, "visibility_starts_at", "visibilityStartsAt") ?? null,
    visibilityEndsAt:
      pickStr(o, "visibility_ends_at", "visibilityEndsAt") ?? null,
    rejectionReason:
      pickStr(o, "rejection_reason", "rejectionReason") ?? null,
    carouselPosition:
      carouselPos !== undefined ? Math.trunc(carouselPos) : null,
    isPinned: pickBool(o, "is_pinned", "isPinned") ?? false,
    submittedAt: pickStr(o, "submitted_at", "submittedAt") ?? null,
    reviewedAt: pickStr(o, "reviewed_at", "reviewedAt") ?? null,
    publishedAt: pickStr(o, "published_at", "publishedAt") ?? null,
    createdAt: pickStr(o, "created_at", "createdAt") ?? "",
    updatedAt: pickStr(o, "updated_at", "updatedAt") ?? "",
    ...(user ? { user } : {}),
    ...(createdBy ? { createdBy } : {}),
    ...(reviewedBy ? { reviewedBy } : {}),
  };
  return tourismAdSchema.parse(candidate);
}

function extractTourismAdsRows(raw: unknown): unknown[] {
  const inner = unwrapApiJson(raw);
  if (Array.isArray(inner)) return inner;
  if (isRecord(inner)) {
    if (Array.isArray(inner.data)) return inner.data;
    const dataObj = inner.data;
    if (isRecord(dataObj)) {
      if (Array.isArray(dataObj.data)) return dataObj.data;
    }
  }
  throw new ApiJsonError(
    "Expected tourism ads array or wrapped paginator",
    "expected_array",
    { cause: raw },
  );
}

function extractTourismAdsPaginatorMeta(raw: unknown) {
  const inner = unwrapApiJson(raw);
  if (!isRecord(inner)) {
    return { currentPage: 1, perPage: 20, total: 0 };
  }
  const block = isRecord(inner.data) ? asObject(inner.data) : inner;
  return {
    currentPage: intNonNeg(pickNum(block, "current_page", "currentPage"), 1),
    perPage: intNonNeg(pickNum(block, "per_page", "perPage"), 20),
    total: intNonNeg(pickNum(block, "total"), 0),
  };
}

export function mapTourismAdsListFromApi(raw: unknown): TourismAdsListResult {
  const rows = extractTourismAdsRows(raw);
  const meta = extractTourismAdsPaginatorMeta(raw);
  const items = rows.map(mapTourismAdFromApi);
  return tourismAdsListResultSchema.parse({
    items: tourismAdsListSchema.parse(items),
    currentPage: meta.currentPage || 1,
    perPage: meta.perPage || 20,
    total: meta.total || items.length,
  });
}

export function mapTourismAdsFromApi(raw: unknown): TourismAd[] {
  return mapTourismAdsListFromApi(raw).items;
}
