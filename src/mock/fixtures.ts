import {
  dashboardCountersSchema,
  dashboardSummaryNestedSchema,
  pendingActionsResponseSchema,
} from '@/schemas/dashboard.schema';
import type { FinancialAnalytics, Leaderboards, PlatformCounters } from '@/schemas/analytics.schema';
import {
  financialAnalyticsSchema,
  leaderboardsSchema,
  platformCountersSchema,
} from '@/schemas/analytics.schema';
import { adminEventListSchema, eventCategoryListSchema, featuredEventsConfigSchema } from '@/schemas/event.schema';
import { feeConfigurationSchema, notificationSettingsSchema } from '@/schemas/settings.schema';
import { listingModerationListSchema, ratingListSchema } from '@/schemas/moderation.schema';
import { roleApplicationsListSchema } from '@/schemas/roleApplication.schema';
import {
  supportThreadDetailSchema,
  supportThreadListSchema,
  type SupportThreadDetail,
} from '@/schemas/support.schema';
import { adminProfileDirectoryListSchema } from '@/schemas/adminProfileDirectory.schema';
import { talentProfilesListSchema } from '@/schemas/talentApproval.schema';
import {
  adminOrderDetailSchema,
  adminOrderListSchema,
  type AdminOrderDetail,
} from '@/schemas/order.schema';
import { adminAuctionListSchema } from '@/schemas/auction.schema';
import { adminComplaintListSchema } from '@/schemas/complaint.schema';
import { defaultOpeningHours, tourismAdsListSchema } from '@/schemas/tourismAd.schema';
import { adminScanLogListSchema, adminScannerListSchema } from '@/schemas/scanner.schema';
import { adminPayoutListSchema } from '@/schemas/payout.schema';
import { refundBreakdownsViewSchema } from '@/schemas/refundBreakdown.schema';
import { adminRefundListSchema } from '@/schemas/refund.schema';
import { adminUserDetailSchema, adminUserListSchema, type AdminUserDetail } from '@/schemas/user.schema';
import {
  adminOrganizerKycDetailSchema,
  type AdminOrganizerKycDetail,
} from '@/schemas/financeCompliance.schema';
import {
  adminActionListSchema,
  adminAuditLogDetailSchema,
  adminAuditLogListSchema,
  type AdminAuditLogDetail,
} from '@/schemas/adminActivity.schema';
import {
  adminDeliveryLogListSchema,
  adminRecentNotificationListSchema,
} from '@/schemas/adminNotifications.schema';
import { adminHealthViewSchema, adminVersionViewSchema } from '@/schemas/adminSystem.schema';

export const MOCK_DASHBOARD_COUNTERS = dashboardCountersSchema.parse({
  usersTotal: 128_400,
  usersSuspended: 42,
  eventsPendingApproval: 12,
  eventsPublished: 3_200,
  supportCasesOpenPipeline: 28,
  listingModerationQueuedOrInReview: 18,
  roleApplicationsSubmitted: 15,
  payoutsHeld: 6,
  tourismAdsPendingReview: 2,
});

export const MOCK_DASHBOARD_SUMMARY = dashboardSummaryNestedSchema.parse({
  users: { total: 128_400, suspended: 42 },
  events: { pendingApproval: 12, published: 3_200 },
  supportCases: { openPipeline: 28 },
  listingModeration: { queuedOrInReview: 18 },
  roleApplications: { submitted: 15 },
  payouts: { held: 6 },
  tourismAds: { pendingReview: 2 },
});

export const MOCK_PENDING_ACTIONS = pendingActionsResponseSchema.parse([
  {
    id: 'pa-1',
    kind: 'role_application',
    title: '12 role applications',
    subtitle: 'Talent, vendor, and organizer requests awaiting review',
    href: '/approvals/roles',
    priority: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80&auto=format&fit=crop',
    dueLabel: 'SLA · respond within 24h',
  },
  {
    id: 'pa-2',
    kind: 'talent_profile',
    title: '5 talent profiles',
    subtitle: 'Verification media and certificates need approval',
    href: '/approvals/talent',
    priority: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80&auto=format&fit=crop',
    dueLabel: 'Due · today EOD',
  },
  {
    id: 'pa-3',
    kind: 'support',
    title: '28 open support threads',
    subtitle: 'Users waiting for a response from the platform team',
    href: '/support',
    priority: 'normal',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80&auto=format&fit=crop',
    dueLabel: 'Oldest ticket · 6h wait',
  },
]);

export const MOCK_ROLE_APPLICATIONS = roleApplicationsListSchema.parse([
  {
    id: 'ra-1',
    applicantName: 'Hala Al-Qahtani',
    email: 'hala+talent@example.com',
    type: 'talent',
    status: 'pending',
    submittedAt: '2026-04-12T10:00:00Z',
    documentsSummary: 'ID + portfolio PDF',
  },
  {
    id: 'ra-2',
    applicantName: 'Desert Sound LLC',
    email: 'vendor@example.com',
    type: 'vendor',
    status: 'pending',
    submittedAt: '2026-04-11T14:20:00Z',
    documentsSummary: 'CR + tax certificate',
  },
  {
    id: 'ra-3',
    applicantName: 'Riyadh Nights',
    email: 'org@example.com',
    type: 'organizer',
    status: 'pending',
    submittedAt: '2026-04-10T09:15:00Z',
    documentsSummary: 'Organizer agreement signed',
  },
]);

export const MOCK_TALENT_PROFILES = talentProfilesListSchema.parse([
  {
    id: 'tp-1',
    applicationId: 'ra-1',
    stageName: 'Nour Khalil',
    legalName: 'Nour Khalil Al-Mutairi',
    email: 'nour+talent@example.com',
    phone: '+966 55 102 4491',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    genres: ['Indie', 'Arab pop', 'Synth'],
    yearsExperience: 6,
    bio: 'Independent vocalist and songwriter focused on intimate venue sets and festival stages across the Gulf.',
    websiteUrl: 'https://nourkhalil.example.com',
    instagramHandle: '@nourkhalil',
    status: 'pending',
    mediaQualityNote: '720p intro — needs 1080p minimum per policy',
    certificatesSummary: '2 music certificates uploaded',
    submittedAt: '2026-04-14T08:00:00Z',
    introVideoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    headshotUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop',
    portfolioPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    governmentIdStatus: 'pending',
    governmentIdVerification: {
      documentType: 'national_id',
      documentNumber: '1234567890',
      frontImageUrl:
        'https://images.unsplash.com/photo-1554224311-beee415c201f?w=600&q=80&auto=format&fit=crop',
      backImageUrl:
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80&auto=format&fit=crop',
      selfieUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop',
      status: 'pending',
    },
    bankVerified: false,
    completedBookings: 12,
    averageRating: 4.7,
  },
  {
    id: 'tp-2',
    stageName: 'DJ Maze',
    legalName: 'Mazen Al-Harbi',
    email: 'maze@example.com',
    phone: '+966 50 881 2203',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    genres: ['House', 'Techno', 'Downtempo'],
    yearsExperience: 9,
    bio: 'Club resident DJ and producer; comfortable with hybrid live-stream showcases.',
    websiteUrl: 'https://djmaze.example.com',
    instagramHandle: '@djmaze_sa',
    status: 'pending',
    mediaQualityNote: 'Lighting acceptable, audio clear',
    certificatesSummary: 'None',
    submittedAt: '2026-04-13T19:30:00Z',
    introVideoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop',
    portfolioPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    governmentIdStatus: 'verified',
    bankVerified: true,
    completedBookings: 34,
    averageRating: 4.9,
  },
  {
    id: 'tp-3',
    stageName: 'Layla & The Keys',
    legalName: 'Layla Haddad',
    email: 'layla.keys@example.com',
    phone: '+966 54 009 7712',
    country: 'United Arab Emirates',
    city: 'Dubai',
    genres: ['Jazz', 'Soul', 'R&B'],
    yearsExperience: 11,
    bio: 'Six-piece band leader; corporate and private bookings with full backline rider.',
    websiteUrl: 'https://laylaandthekeys.example.com',
    instagramHandle: '@laylathekeys',
    status: 'pending',
    mediaQualityNote: 'Multi-cam rehearsal clip; mix peaks slightly on snare',
    certificatesSummary: 'Music degree + 1 union letter',
    submittedAt: '2026-04-12T11:45:00Z',
    introVideoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    headshotUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop',
    portfolioPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    governmentIdStatus: 'rejected',
    bankVerified: false,
    completedBookings: 3,
    averageRating: 4.2,
  },
]);

export const MOCK_VENDOR_PROFILE_DIRECTORY = adminProfileDirectoryListSchema.parse([
  {
    id: 'vd-1',
    displayName: 'Desert Bites Catering',
    email: 'hello@desertbites.example.com',
    slug: 'desert-bites',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    status: 'pending',
    updatedAt: '2026-04-11T08:00:00Z',
  },
  {
    id: 'vd-2',
    displayName: 'Stage & Co AV',
    email: 'orders@stageco.example.com',
    slug: 'stage-co',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    status: 'active',
    updatedAt: '2026-03-01T12:00:00Z',
  },
]);

export const MOCK_ORGANIZER_PROFILE_DIRECTORY = adminProfileDirectoryListSchema.parse([
  {
    id: 'org-dir-1',
    displayName: 'Riyadh Nights',
    email: 'bookings@riyadhnights.example.com',
    slug: 'riyadh-nights',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    status: 'pending',
    updatedAt: '2026-04-10T09:15:00Z',
  },
  {
    id: 'org-dir-2',
    displayName: 'Coastal Weekenders',
    email: 'ops@coastalwk.example.com',
    slug: 'coastal-weekenders',
    city: 'Dammam',
    country: 'Saudi Arabia',
    status: 'verified',
    updatedAt: '2026-02-20T16:00:00Z',
  },
]);

const usersParsed = adminUserListSchema.parse([
  {
    id: 'u-1',
    displayName: 'Sara Guest',
    email: 'sara@example.com',
    role: 'guest',
    suspended: false,
    joinedAt: '2025-01-10T12:00:00Z',
  },
  {
    id: 'u-2',
    displayName: 'Marco Silva',
    email: 'marco+organizer@example.com',
    role: 'organizer',
    suspended: false,
    joinedAt: '2024-11-02T12:00:00Z',
  },
  {
    id: 'u-3',
    displayName: 'Spam Bot',
    email: 'spam@example.com',
    role: 'guest',
    suspended: true,
    joinedAt: '2026-03-01T12:00:00Z',
  },
]);

export const MOCK_USERS = usersParsed;

function userDetail(row: (typeof usersParsed)[number]): AdminUserDetail {
  return adminUserDetailSchema.parse({
    ...row,
    ticketsPurchased: row.role === 'organizer' ? 0 : 14,
    bookingsCount: row.role === 'talent' ? 28 : row.role === 'vendor' ? 16 : 2,
    ratingGivenCount: 9,
  });
}

export const MOCK_USER_DETAILS: Record<string, AdminUserDetail> = Object.fromEntries(
  usersParsed.map((u) => [u.id, userDetail(u)])
);

export const MOCK_EVENTS = adminEventListSchema.parse([
  {
    id: 'ev-1',
    title: 'Indie Night Riyadh',
    organizerName: 'Riyadh Nights',
    status: 'active',
    featured: true,
    startsAt: '2026-05-01T19:00:00Z',
    endsAt: '2026-05-01T23:30:00Z',
    ticketsSold: 1240,
    capacity: 1400,
    revenueSar: 428_000,
    avgRating: 4.6,
    successRatePercent: 97,
    category: 'Music',
    venueName: 'Boulevard Arena',
    city: 'Riyadh',
    coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=960&q=80&auto=format&fit=crop',
  },
  {
    id: 'ev-2',
    title: 'Desert Jazz Sessions',
    organizerName: 'Desert Sound LLC',
    status: 'ended',
    featured: false,
    startsAt: '2026-02-14T20:00:00Z',
    endsAt: '2026-02-14T23:00:00Z',
    ticketsSold: 890,
    capacity: 900,
    revenueSar: 312_000,
    avgRating: 4.8,
    successRatePercent: 99,
    category: 'Music',
    venueName: 'AlUla amphitheater',
    city: 'AlUla',
    coverImageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=960&q=80&auto=format&fit=crop',
  },
  {
    id: 'ev-3',
    title: 'Riyadh Comedy Fest — Night 2',
    organizerName: 'Laugh Lines Co.',
    status: 'cancelled',
    startsAt: '2026-04-20T18:30:00Z',
    endsAt: '2026-04-20T21:00:00Z',
    ticketsSold: 0,
    capacity: 800,
    revenueSar: 0,
    avgRating: 4.1,
    successRatePercent: 0,
    category: 'Comedy',
    venueName: 'King Fahad Cultural Centre',
    city: 'Riyadh',
    coverImageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=960&q=80&auto=format&fit=crop',
    featured: false,
  },
  {
    id: 'ev-4',
    title: 'Tech Summit MENA',
    organizerName: 'Gulf Events Group',
    status: 'archived',
    featured: false,
    startsAt: '2026-06-10T09:00:00Z',
    endsAt: '2026-06-11T17:00:00Z',
    ticketsSold: 2100,
    capacity: 2500,
    revenueSar: 1_020_000,
    avgRating: 4.4,
    successRatePercent: 93,
    category: 'Conference',
    venueName: 'Riyadh Front',
    city: 'Riyadh',
    coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=960&q=80&auto=format&fit=crop',
  },
]);

export const MOCK_CATEGORIES = eventCategoryListSchema.parse([
  {
    id: '1',
    slug: 'music',
    nameEn: 'Music',
    nameAr: 'موسيقى',
    iconKey: 'MusicNotesIcon',
    colorToken: 'coral',
    active: true,
    displayOrder: 0,
  },
  {
    id: '2',
    slug: 'sports',
    nameEn: 'Sports',
    nameAr: 'رياضة',
    iconKey: 'TrophyIcon',
    colorToken: 'lime',
    active: true,
    displayOrder: 1,
  },
  {
    id: '3',
    slug: 'comedy',
    nameEn: 'Comedy',
    nameAr: 'كوميديا',
    iconKey: 'MaskHappyIcon',
    colorToken: 'lemon',
    active: false,
    displayOrder: 2,
  },
]);

export const MOCK_FEATURED_CONFIG = featuredEventsConfigSchema.parse({
  mode: 'algorithm',
  manualEventIds: ['ev-1'],
  refreshMinutes: 60,
});

export const MOCK_FEE_CONFIG = feeConfigurationSchema.parse({
  feeType: 'combined',
  percent: 8.5,
  flatSar: 2,
  payer: 'buyer',
  auctionCommissionPercent: 12,
  thirdPartySharePercent: 4,
});

export const MOCK_NOTIFICATION_SETTINGS = notificationSettingsSchema.parse({
  channels: { email: true, inApp: true, push: false, sms: false },
  reminderOffsetsHours: [24, 3],
});

const FINANCIAL_SERIES_START = Date.UTC(2026, 0, 20);
const revenueByDayFull = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(FINANCIAL_SERIES_START + i * 86400000);
  const revenueSar = 280_000 + Math.round(190_000 * (0.45 + 0.55 * Math.sin(i / 4.8)));
  return { date: d.toISOString().slice(0, 10), revenueSar };
});

const rawFinancial: FinancialAnalytics = {
  totalRevenueSar: 44_200_000,
  platformFeesSar: 3_900_000,
  refundsSar: 210_000,
  payoutsPendingSar: 1_050_000,
  revenueByDay: revenueByDayFull,
  revenueBreakdownByCategory: [
    { categoryKey: 'music', label: 'Music', revenueSar: 18_200_000 },
    { categoryKey: 'sports', label: 'Sports', revenueSar: 11_400_000 },
    { categoryKey: 'comedy', label: 'Comedy', revenueSar: 5_600_000 },
    { categoryKey: 'arts', label: 'Arts & culture', revenueSar: 5_100_000 },
    { categoryKey: 'other', label: 'Other', revenueSar: 3_900_000 },
  ],
};
export const MOCK_FINANCIAL_ANALYTICS = financialAnalyticsSchema.parse(rawFinancial);

const rawCounters: PlatformCounters = {
  usersByRole: { guest: 110_000, talent: 4_200, vendor: 1_800, organizer: 640 },
  eventsByStatus: { active: 420, ended: 2_610, cancelled: 88, archived: 303 },
  ticketsSold: 910_200,
  bookings: 42_000,
  ratings: 128_400,
};
export const MOCK_PLATFORM_COUNTERS = platformCountersSchema.parse(rawCounters);

const rawLeaderboards: Leaderboards = {
  events: [
    {
      id: '1',
      code: 'ev-indie',
      title: 'Indie Night Riyadh',
      revenueGross: '428000.00',
      status: 'published',
      organizerId: '10',
    },
    {
      id: '2',
      code: 'ev-jazz',
      title: 'Desert Jazz Sessions',
      revenueGross: '312000.00',
      status: 'ended',
      organizerId: '11',
    },
  ],
  organizers: [
    { organizerId: '10', totalRevenueGross: 12_400_000, displayName: 'Riyadh Nights', slug: 'riyadh-nights', code: 'org-10' },
    { organizerId: '11', totalRevenueGross: 6_200_000, displayName: 'Desert Sound LLC', slug: 'desert-sound', code: 'org-11' },
  ],
  generatedAt: '2026-05-01T12:00:00Z',
};
export const MOCK_LEADERBOARDS = leaderboardsSchema.parse(rawLeaderboards);

export const MOCK_LISTING_MODERATION = listingModerationListSchema.parse([
  {
    id: 'lm-1',
    kind: 'talent',
    title: 'Profile: DJ Maze',
    ownerEmail: 'maze@example.com',
    flagReason: 'Reported misleading portfolio',
    status: 'queued',
  },
  {
    id: 'lm-2',
    kind: 'vendor',
    title: 'Vendor: Desert Sound LLC',
    ownerEmail: 'vendor@example.com',
    flagReason: 'Duplicate venue photos',
    status: 'queued',
  },
]);

export const MOCK_RATINGS = ratingListSchema.parse([
  {
    id: 'rt-1',
    targetLabel: 'Indie Night Riyadh',
    authorEmail: 'fan@example.com',
    stars: 5,
    comment: 'Incredible atmosphere.',
    submittedAt: '2026-04-15T21:00:00Z',
    moderationState: 'visible',
  },
  {
    id: 'rt-2',
    targetLabel: 'Desert Jazz Sessions',
    authorEmail: 'critic@example.com',
    stars: 2,
    comment: 'Sound was uneven in the back rows.',
    submittedAt: '2026-03-01T12:00:00Z',
    moderationState: 'hidden',
  },
]);

export const MOCK_SUPPORT_THREADS = supportThreadListSchema.parse([
  {
    id: 'st-1',
    userEmail: 'buyer@example.com',
    subject: 'Refund not showing',
    status: 'open',
    updatedAt: '2026-04-17T11:00:00Z',
    preview: 'I cancelled my ticket but wallet still shows…',
  },
  {
    id: 'st-2',
    userEmail: 'org@example.com',
    subject: 'Payout delay',
    status: 'in_progress',
    updatedAt: '2026-04-16T09:30:00Z',
    preview: 'Event ended last week, payout still pending.',
  },
]);

const supportDetailParsed: SupportThreadDetail[] = [
  supportThreadDetailSchema.parse({
    id: 'st-1',
    userEmail: 'buyer@example.com',
    subject: 'Refund not showing',
    status: 'open',
    updatedAt: '2026-04-17T11:00:00Z',
    preview: 'I cancelled my ticket but wallet still shows…',
    messages: [
      {
        id: 'm1',
        author: 'user',
        body: 'I cancelled my ticket but wallet still shows the old balance.',
        sentAt: '2026-04-17T11:00:00Z',
      },
    ],
  }),
  supportThreadDetailSchema.parse({
    id: 'st-2',
    userEmail: 'org@example.com',
    subject: 'Payout delay',
    status: 'in_progress',
    updatedAt: '2026-04-16T09:30:00Z',
    preview: 'Event ended last week, payout still pending.',
    messages: [
      {
        id: 'm2',
        author: 'user',
        body: 'Event ended last week, payout still pending.',
        sentAt: '2026-04-16T09:30:00Z',
      },
      {
        id: 'm3',
        author: 'admin',
        body: 'Thanks — finance is reviewing the batch today.',
        sentAt: '2026-04-16T10:05:00Z',
      },
    ],
  }),
];

export const MOCK_SUPPORT_DETAILS: Record<string, SupportThreadDetail> = Object.fromEntries(
  supportDetailParsed.map((t) => [t.id, t])
);

const ordersParsed = adminOrderListSchema.parse([
  {
    id: 'ord-1',
    status: 'paid',
    buyerLabel: 'sara@example.com',
    eventTitle: 'Indie Night Riyadh',
    totalSar: 420,
    ticketCount: 2,
    createdAt: '2026-04-18T14:22:00Z',
  },
  {
    id: 'ord-2',
    status: 'pending',
    buyerLabel: 'marco+organizer@example.com',
    eventTitle: 'Desert Jazz Sessions',
    totalSar: 180,
    ticketCount: 1,
    createdAt: '2026-04-19T09:05:00Z',
  },
  {
    id: 'ord-3',
    status: 'refunded',
    buyerLabel: 'spam@example.com',
    eventTitle: 'Indie Night Riyadh',
    totalSar: 210,
    ticketCount: 1,
    createdAt: '2026-04-10T16:40:00Z',
  },
]);

export const MOCK_ORDERS = ordersParsed;

function orderDetail(row: (typeof ordersParsed)[number]): AdminOrderDetail {
  return adminOrderDetailSchema.parse({
    ...row,
    buyerEmail: row.buyerLabel.includes('@') ? row.buyerLabel : undefined,
    eventId: row.eventTitle.includes('Riyadh') ? 'ev-1' : 'ev-2',
    paymentReference: row.status === 'paid' ? 'PAY-CHK-88421' : undefined,
    notes: row.status === 'refunded' ? 'Chargeback — user disputed with bank.' : undefined,
  });
}

export const MOCK_ORDER_DETAILS: Record<string, AdminOrderDetail> = Object.fromEntries(
  ordersParsed.map((o) => [o.id, orderDetail(o)])
);

export const MOCK_REFUNDS = adminRefundListSchema.parse([
  {
    id: 'rf-1',
    status: 'completed',
    amountSar: 210,
    orderId: 'ord-3',
    reason: 'Customer no longer attending; policy window honored.',
    requestedByLabel: 'spam@example.com',
    eventTitle: 'Indie Night Riyadh',
    createdAt: '2026-04-11T08:00:00Z',
  },
  {
    id: 'rf-2',
    status: 'pending',
    amountSar: 420,
    orderId: 'ord-1',
    reason: 'Duplicate charge — user paid twice by mistake.',
    requestedByLabel: 'sara@example.com',
    eventTitle: 'Indie Night Riyadh',
    createdAt: '2026-04-20T11:30:00Z',
  },
  {
    id: 'rf-3',
    status: 'rejected',
    amountSar: 99,
    orderId: undefined,
    reason: 'Outside refund window per event terms.',
    requestedByLabel: 'guest@example.com',
    createdAt: '2026-04-15T16:00:00Z',
  },
]);

export const MOCK_REFUND_BREAKDOWNS_VIEW = refundBreakdownsViewSchema.parse({
  totalRefundedSar: 729,
  rows: [
    { key: 'policy', label: 'Within policy window', amountSar: 420, refundCount: 18 },
    { key: 'duplicate', label: 'Duplicate payment', amountSar: 210, refundCount: 4 },
    { key: 'chargeback', label: 'Chargeback / dispute', amountSar: 99, refundCount: 2 },
  ],
});

export const MOCK_AUCTIONS = adminAuctionListSchema.parse([
  {
    id: 'auc-1',
    title: 'VIP meet & greet — Nour Khalil',
    status: 'live',
    organizerName: 'Riyadh Nights',
    highBidSar: 4_200,
    endsAt: '2026-05-15T20:00:00Z',
  },
  {
    id: 'auc-2',
    title: 'Signed drum head — Desert Sound LLC',
    status: 'scheduled',
    organizerName: 'Desert Sound LLC',
    highBidSar: 0,
    endsAt: '2026-05-22T18:00:00Z',
  },
  {
    id: 'auc-3',
    title: 'Backstage pass bundle',
    status: 'ended',
    organizerName: 'Riyadh Nights',
    highBidSar: 8_900,
    endsAt: '2026-04-01T21:00:00Z',
  },
  {
    id: 'auc-4',
    title: 'Test lot (cancelled)',
    status: 'cancelled',
    organizerName: 'Test Organizer Ltd',
    highBidSar: 100,
    endsAt: '2026-03-10T12:00:00Z',
  },
]);

export const MOCK_SCANNERS = adminScannerListSchema.parse([
  {
    id: 'scn-1',
    displayName: 'Gate A — iPad #1',
    status: 'active',
    organizerName: 'Riyadh Nights',
    deviceLabel: 'iPad Pro 11"',
    lastSeenAt: '2026-05-09T18:42:00Z',
  },
  {
    id: 'scn-2',
    displayName: 'VIP lane handheld',
    status: 'suspended',
    organizerName: 'Riyadh Nights',
    deviceLabel: 'Zebra TC52',
    lastSeenAt: '2026-05-08T09:10:00Z',
  },
  {
    id: 'scn-3',
    displayName: 'Desert Jazz — secondary',
    status: 'offline',
    organizerName: 'Desert Sound LLC',
    lastSeenAt: '2026-04-20T22:00:00Z',
  },
]);

export const MOCK_SCAN_LOGS = adminScanLogListSchema.parse([
  {
    id: 'slg-1',
    scannedAt: '2026-05-09T19:01:12Z',
    outcome: 'valid',
    ticketRef: 'TKT-88421-A',
    scannerLabel: 'Gate A — iPad #1',
    eventTitle: 'Indie Night Riyadh',
  },
  {
    id: 'slg-2',
    scannedAt: '2026-05-09T19:02:44Z',
    outcome: 'duplicate',
    ticketRef: 'TKT-88421-A',
    scannerLabel: 'Gate A — iPad #1',
    eventTitle: 'Indie Night Riyadh',
  },
  {
    id: 'slg-3',
    scannedAt: '2026-05-09T19:05:01Z',
    outcome: 'invalid',
    ticketRef: 'TKT-00000-X',
    scannerLabel: 'VIP lane handheld',
    eventTitle: 'Indie Night Riyadh',
  },
]);

export const MOCK_COMPLAINTS = adminComplaintListSchema.parse([
  {
    id: 'cmp-1',
    title: 'Misleading seat map for balcony section',
    status: 'open',
    category: 'event_accuracy',
    reporterLabel: 'sara@example.com',
    targetLabel: 'Indie Night Riyadh',
    createdAt: '2026-05-08T11:20:00Z',
  },
  {
    id: 'cmp-2',
    title: 'Refund not received after approved cancellation',
    status: 'triaged',
    category: 'payments',
    reporterLabel: 'guest@example.com',
    targetLabel: 'Order ord-2',
    createdAt: '2026-05-07T09:00:00Z',
    updatedAt: '2026-05-07T15:30:00Z',
  },
  {
    id: 'cmp-3',
    title: 'Harassment in event comments thread',
    status: 'escalated',
    category: 'conduct',
    reporterLabel: 'moderator@example.com',
    targetLabel: 'User usr-12',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-02T10:00:00Z',
  },
]);

export const MOCK_ADMIN_HEALTH = adminHealthViewSchema.parse({
  status: 'ok',
  message: 'All subsystems responding (mock).',
  checkedAt: '2026-05-09T22:00:00Z',
  extras: { database: 'up', redis: 'up', queue: 'up' },
});

export const MOCK_ADMIN_VERSION = adminVersionViewSchema.parse({
  version: '1.4.0-mock',
  commit: 'abc1234',
  buildDate: '2026-05-01T08:00:00Z',
  environment: 'development',
});

export const MOCK_ADMIN_RECENT_NOTIFICATIONS = adminRecentNotificationListSchema.parse([
  {
    id: 'nr-1',
    title: 'Event requires review',
    body: 'Organizer updated an event listing.',
    kind: 'event_review_required',
    channel: 'in_app',
    href: '/events/evt-12',
    read: false,
    createdAt: '2026-05-09T20:01:00Z',
  },
  {
    id: 'nr-2',
    title: 'New tourism ad submission',
    body: 'Red Sea Coral Bay awaiting review.',
    kind: 'tourism_ad_submitted',
    channel: 'in_app',
    href: '/tourism-ads/ta-1',
    read: false,
    createdAt: '2026-05-09T19:10:00Z',
  },
  {
    id: 'nr-3',
    title: 'New chat message',
    body: 'Should not appear in admin bell menu.',
    kind: 'message_received',
    channel: 'in_app',
    read: false,
    createdAt: '2026-05-09T18:40:00Z',
  },
]);

export const MOCK_ADMIN_DELIVERY_LOG = adminDeliveryLogListSchema.parse([
  {
    id: 'dl-1',
    channel: 'email',
    status: 'sent',
    recipient: 'sara@example.com',
    templateKey: 'order_confirmation',
    sentAt: '2026-05-09T19:55:12Z',
  },
  {
    id: 'dl-2',
    channel: 'sms',
    status: 'failed',
    recipient: '+966500000000',
    templateKey: 'event_reminder',
    sentAt: '2026-05-09T17:12:00Z',
    errorMessage: 'Carrier timeout',
  },
]);

export const MOCK_ADMIN_ACTIONS = adminActionListSchema.parse([
  {
    id: 'act-1',
    actionKey: 'rebuild_search_index',
    label: 'Rebuild search index',
    description: 'Queues a full re-index of public events and listings.',
    category: 'search',
  },
  {
    id: 'act-2',
    actionKey: 'purge_rate_limit_buckets',
    label: 'Purge API rate-limit buckets',
    category: 'infra',
  },
]);

export const MOCK_AUDIT_LOGS = adminAuditLogListSchema.parse([
  {
    id: 'aud-1',
    summary: 'Approved payout po-1',
    createdAt: '2026-05-09T14:22:00Z',
    actorLabel: 'admin@myticket.test',
    resourceType: 'payout',
    resourceId: 'po-1',
  },
  {
    id: 'aud-2',
    summary: 'Suspended user usr-5',
    createdAt: '2026-05-08T09:15:00Z',
    actorLabel: 'admin@myticket.test',
    resourceType: 'user',
    resourceId: 'usr-5',
  },
  {
    id: 'aud-3',
    summary: 'Updated fee configuration',
    createdAt: '2026-05-01T11:00:00Z',
    actorLabel: 'finance@myticket.test',
    resourceType: 'settings',
    resourceId: 'fee-config',
  },
]);

export const MOCK_AUDIT_LOG_DETAILS: Record<string, AdminAuditLogDetail> = {
  'aud-1': adminAuditLogDetailSchema.parse({
    id: 'aud-1',
    summary: 'Approved payout po-1',
    createdAt: '2026-05-09T14:22:00Z',
    actorLabel: 'admin@myticket.test',
    resourceType: 'payout',
    resourceId: 'po-1',
    ip: '203.0.113.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    changes: { payout_status: { from: 'pending', to: 'approved' } },
  }),
  'aud-2': adminAuditLogDetailSchema.parse({
    id: 'aud-2',
    summary: 'Suspended user usr-5',
    createdAt: '2026-05-08T09:15:00Z',
    actorLabel: 'admin@myticket.test',
    resourceType: 'user',
    resourceId: 'usr-5',
    ip: '198.51.100.2',
    changes: { suspended: { from: false, to: true } },
  }),
};

export const MOCK_PAYOUTS = adminPayoutListSchema.parse([
  {
    id: 'po-1',
    status: 'pending',
    organizerName: 'Riyadh Nights',
    amountSar: 48_200,
    eventTitle: 'Indie Night Riyadh',
    reference: 'EVT-2026-04-RIY-01',
    createdAt: '2026-04-21T10:00:00Z',
  },
  {
    id: 'po-2',
    status: 'approved',
    organizerName: 'Desert Sound LLC',
    amountSar: 12_400,
    eventTitle: 'Desert Jazz Sessions',
    createdAt: '2026-04-20T14:30:00Z',
  },
  {
    id: 'po-3',
    status: 'processing',
    organizerName: 'Riyadh Nights',
    amountSar: 8_900,
    createdAt: '2026-04-19T09:00:00Z',
  },
  {
    id: 'po-4',
    status: 'paid',
    organizerName: 'Coastal Events',
    amountSar: 3_100,
    createdAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'po-5',
    status: 'rejected',
    organizerName: 'Test Organizer Ltd',
    amountSar: 500,
    createdAt: '2026-03-28T16:00:00Z',
  },
]);

/** Sample organizer KYC bundles (keys match hints on Finance compliance page). */
export const MOCK_ORGANIZER_KYC_BY_ORG: Record<string, AdminOrganizerKycDetail> = {
  'org-riyadh-nights': adminOrganizerKycDetailSchema.parse({
    organizerId: 'org-riyadh-nights',
    organizerName: 'Riyadh Nights',
    documents: [
      {
        id: 'kyc-doc-1',
        label: 'Commercial registration',
        docType: 'cr',
        status: 'approved',
        uploadedAt: '2026-04-01T10:00:00Z',
      },
      {
        id: 'kyc-doc-2',
        label: 'Bank letter',
        docType: 'bank',
        status: 'pending',
        uploadedAt: '2026-04-10T14:00:00Z',
      },
    ],
  }),
  'org-desert-sound': adminOrganizerKycDetailSchema.parse({
    organizerId: 'org-desert-sound',
    organizerName: 'Desert Sound LLC',
    documents: [
      {
        id: 'kyc-doc-3',
        label: 'CR certificate',
        docType: 'cr',
        status: 'pending',
        uploadedAt: '2026-04-18T09:00:00Z',
      },
    ],
  }),
};

const MOCK_OPENING = defaultOpeningHours();

export const MOCK_TOURISM_ADS = tourismAdsListSchema.parse([
  {
    id: 'ta-1',
    userId: '42',
    createdByUserId: '42',
    source: 'guest',
    status: 'pending_review',
    locationName: 'Red Sea Coral Bay',
    latitude: '22.5960000',
    longitude: '39.1180000',
    description:
      'Guided snorkeling and reef walks along the southern Red Sea coast with certified marine guides and small groups.',
    openingHours: MOCK_OPENING,
    services: ['guided tours', 'snorkeling', 'boat trips'],
    contact: { phone: '+966500000001', email: 'reef.guide@example.com' },
    mediaLinks: [{ platform: 'instagram', url: 'https://instagram.com/reefbay' }],
    galleryUrls: [
      'https://picsum.photos/seed/tourism-red-sea/800/600',
      'https://picsum.photos/seed/tourism-red-sea-2/800/600',
    ],
    coverImageUrl: 'https://picsum.photos/seed/tourism-red-sea/800/600',
    isPinned: false,
    submittedAt: '2026-06-14T09:00:00+00:00',
    createdAt: '2026-06-14T08:30:00+00:00',
    updatedAt: '2026-06-14T09:00:00+00:00',
    user: { id: '42', fullName: 'Layla Al-Harbi', email: 'layla@example.com' },
    createdBy: { id: '42', fullName: 'Layla Al-Harbi', email: 'layla@example.com' },
  },
  {
    id: 'ta-2',
    userId: '55',
    createdByUserId: '55',
    source: 'guest',
    status: 'pending_review',
    locationName: 'AlUla Heritage Trail',
    latitude: '26.6140000',
    longitude: '37.9200000',
    description:
      'Sunset camel caravans and stargazing experiences across sandstone canyons with local historians and storytellers.',
    openingHours: MOCK_OPENING,
    services: ['camel tours', 'stargazing', 'heritage walks'],
    contact: { phone: '+966550112233', email: 'heritage@example.com' },
    mediaLinks: [],
    galleryUrls: ['https://picsum.photos/seed/tourism-alula/800/600'],
    coverImageUrl: 'https://picsum.photos/seed/tourism-alula/800/600',
    isPinned: false,
    submittedAt: '2026-06-13T16:20:00+00:00',
    createdAt: '2026-06-13T15:00:00+00:00',
    updatedAt: '2026-06-13T16:20:00+00:00',
    user: { id: '55', fullName: 'Omar Qahtani', email: 'omar@example.com' },
    createdBy: { id: '55', fullName: 'Omar Qahtani', email: 'omar@example.com' },
  },
  {
    id: 'ta-3',
    source: 'admin',
    status: 'published',
    locationName: 'Riyadh Season Pavilion',
    latitude: '24.7136000',
    longitude: '46.6753000',
    description:
      'Official tourism pavilion showcasing curated dining, light installations, and family activities during the winter season.',
    openingHours: MOCK_OPENING,
    services: ['family activities', 'dining', 'light shows'],
    contact: { phone: '+966112223344', email: 'pavilion@myticket.test' },
    mediaLinks: [{ platform: 'website', url: 'https://myticket.kat-jr.com' }],
    galleryUrls: ['https://picsum.photos/seed/tourism-riyadh/800/600'],
    coverImageUrl: 'https://picsum.photos/seed/tourism-riyadh/800/600',
    isPinned: true,
    carouselPosition: 0,
    publishedAt: '2026-06-01T10:00:00+00:00',
    createdAt: '2026-06-01T10:00:00+00:00',
    updatedAt: '2026-06-01T10:00:00+00:00',
  },
  {
    id: 'ta-4',
    source: 'admin',
    status: 'published',
    locationName: 'Jeddah Corniche Walk',
    latitude: '21.5433000',
    longitude: '39.1728000',
    description:
      'Waterfront promenade experiences with art installations, coffee carts, and evening performances along the Red Sea.',
    openingHours: MOCK_OPENING,
    services: ['walking tours', 'coffee tastings', 'live music'],
    contact: { email: 'corniche@myticket.test', phone: '+966533221100' },
    mediaLinks: [],
    galleryUrls: ['https://picsum.photos/seed/tourism-jeddah/800/600'],
    coverImageUrl: 'https://picsum.photos/seed/tourism-jeddah/800/600',
    isPinned: true,
    carouselPosition: 1,
    publishedAt: '2026-06-02T12:00:00+00:00',
    createdAt: '2026-06-02T12:00:00+00:00',
    updatedAt: '2026-06-02T12:00:00+00:00',
  },
]);
