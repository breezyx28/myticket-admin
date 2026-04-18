import { dashboardSummarySchema, pendingActionsResponseSchema } from '@/schemas/dashboard.schema';
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
import { talentProfilesListSchema } from '@/schemas/talentApproval.schema';
import { adminUserDetailSchema, adminUserListSchema, type AdminUserDetail } from '@/schemas/user.schema';

export const MOCK_DASHBOARD_SUMMARY = dashboardSummarySchema.parse({
  totalUsers: 128_400,
  totalEvents: 3_421,
  totalTicketsSold: 910_200,
  totalRevenueSar: 44_200_000,
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
  },
  {
    id: 'ev-4',
    title: 'Tech Summit MENA',
    organizerName: 'Gulf Events Group',
    status: 'active',
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
  { id: 'cat-music', name: 'Music', iconKey: 'Music2', colorToken: 'coral', active: true },
  { id: 'cat-sports', name: 'Sports', iconKey: 'Trophy', colorToken: 'lime', active: true },
  { id: 'cat-comedy', name: 'Comedy', iconKey: 'Laugh', colorToken: 'lemon', active: false },
]);

export const MOCK_FEATURED_CONFIG = featuredEventsConfigSchema.parse({
  mode: 'algorithm',
  manualEventIds: ['ev-1'],
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
  channels: { email: true, inApp: true, push: false },
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
  topEvents: [
    { id: 'ev-1', label: 'Indie Night Riyadh', metric: 'Tickets', value: 1240 },
    { id: 'ev-2', label: 'Desert Jazz Sessions', metric: 'Tickets', value: 890 },
  ],
  topOrganizers: [
    { id: 'org-1', label: 'Riyadh Nights', metric: 'Revenue SAR', value: 12_400_000 },
    { id: 'org-2', label: 'Desert Sound LLC', metric: 'Revenue SAR', value: 6_200_000 },
  ],
  topCategories: [
    { id: 'cat-music', label: 'Music', metric: 'Share %', value: 38 },
    { id: 'cat-sports', label: 'Sports', metric: 'Share %', value: 22 },
  ],
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
