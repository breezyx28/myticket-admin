import { describe, expect, it } from 'vitest';
import {
  mapAdminEventRowFromApi,
  mapAdminEventsFromApi,
  mapAdminUserDetailFromApi,
  mapAdminUsersFromApi,
  mapDashboardCountersFromApi,
  mapDashboardSummaryFromApi,
  mapEventCategoriesFromApi,
  mapFeaturedConfigFromApi,
  mapFeeConfigurationFromApi,
  mapFinancialAnalyticsFromApi,
  mapAdminOrdersFromApi,
  mapAdminAuctionsFromApi,
  mapAdminHealthFromApi,
  mapAdminVersionFromApi,
  mapAdminDeliveryLogsFromApi,
  mapAdminRecentNotificationsFromApi,
  mapAdminActionsFromApi,
  mapAdminAuditLogDetailFromApi,
  mapAdminAuditLogsFromApi,
  mapAdminComplaintsFromApi,
  mapAdminOrganizerKycFromApi,
  mapAdminScannersFromApi,
  mapAdminScanLogsFromApi,
  mapAdminPayoutsFromApi,
  mapAdminRefundsFromApi,
  mapRefundBreakdownsFromApi,
  mapListingModerationFromApi,
  mapNotificationSettingsFromApi,
  mapRatingsFromApi,
  mapSupportThreadDetailFromApi,
  mapSupportThreadsFromApi,
  mapPendingActionsFromApi,
  mapRoleApplicationFromApi,
  mapRoleApplicationsFromApi,
  mapTalentProfileDetailFromApi,
  mapTalentProfileFromApi,
  mapTalentProfilesFromApi,
  mapLeaderboardsFromApi,
  mapAdminProfileDirectoryFromApi,
  mapAdminProfileDirectoryRowFromApi,
  slugifyCategoryBaseName,
} from '@/schemas/api/adminMappers';

describe('mapDashboardCountersFromApi', () => {
  it('maps flat snake_case data envelope', () => {
    const out = mapDashboardCountersFromApi({
      data: {
        users_total: 10,
        users_suspended: 1,
        events_pending_approval: 2,
        events_published: 3,
        support_cases_open_pipeline: 4,
        listing_moderation_queued_or_in_review: 5,
        role_applications_submitted: 6,
        payouts_held: 7,
      },
    });
    expect(out.usersTotal).toBe(10);
    expect(out.payoutsHeld).toBe(7);
  });
});

describe('mapDashboardSummaryFromApi', () => {
  it('maps nested snake_case inside data envelope', () => {
    const out = mapDashboardSummaryFromApi({
      data: {
        users: { total: 100, suspended: 2 },
        events: { pending_approval: 3, published: 4 },
        support_cases: { open_pipeline: 5 },
        listing_moderation: { queued_or_in_review: 6 },
        role_applications: { submitted: 7 },
        payouts: { held: 8 },
      },
    });
    expect(out.users.total).toBe(100);
    expect(out.payouts.held).toBe(8);
  });
});

describe('mapPendingActionsFromApi', () => {
  it('maps array with snake_case rows', () => {
    const out = mapPendingActionsFromApi([
      {
        id: '1',
        kind: 'support',
        title: 'T',
        subtitle: 'S',
        href: '/support',
        priority: 'high',
        image_url: '/img.png',
        due_label: 'Soon',
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '1',
      kind: 'support',
      imageUrl: '/img.png',
      dueLabel: 'Soon',
    });
  });

  it('unwraps items list', () => {
    const out = mapPendingActionsFromApi({
      data: {
        items: [
          {
            id: 'x',
            kind: 'role_application',
            title: 'Roles',
            subtitle: 'Sub',
            href: '/r',
            priority: 'normal',
            imageUrl: 'https://example.com/i.jpg',
            dueLabel: 'Later',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe('role_application');
  });
});

describe('mapRoleApplicationsFromApi / mapRoleApplicationFromApi', () => {
  it('unwraps data.role_applications with snake_case', () => {
    const out = mapRoleApplicationsFromApi({
      data: {
        role_applications: [
          {
            id: 'ra-1',
            applicant_name: 'Test User',
            email: 'test@example.com',
            type: 'talent',
            status: 'pending',
            submitted_at: '2026-01-01T00:00:00Z',
            documents_summary: 'ID copy',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 'ra-1',
      applicantName: 'Test User',
      email: 'test@example.com',
      type: 'talent',
      status: 'pending',
      submittedAt: '2026-01-01T00:00:00Z',
      documentsSummary: 'ID copy',
    });
  });

  it('maps single detail row with rejection_reason', () => {
    const one = mapRoleApplicationFromApi({
      data: {
        id: 'x',
        applicant_name: 'A',
        email: 'a@example.com',
        type: 'vendor',
        status: 'rejected',
        submitted_at: '2026-02-02T00:00:00Z',
        documents_summary: 'Docs',
        rejection_reason: 'Incomplete',
      },
    });
    expect(one.rejectReason).toBe('Incomplete');
    expect(one.status).toBe('rejected');
  });
});

describe('mapTalentProfilesFromApi / mapTalentProfileFromApi', () => {
  it('maps wrapped talents list with snake_case', () => {
    const out = mapTalentProfilesFromApi({
      data: {
        talents: [
          {
            id: 't1',
            stage_name: 'Artist',
            legal_name: 'Legal Name',
            email: 'a@example.com',
            phone: '+1',
            country: 'SA',
            city: 'Riyadh',
            genres: 'Pop, Rock',
            years_experience: 3,
            bio: 'Bio',
            website_url: 'https://a.com',
            instagram_handle: '@a',
            status: 'pending',
            media_quality_note: 'ok',
            certificates_summary: 'none',
            submitted_at: '2026-01-01T00:00:00Z',
            intro_video_url: 'https://v.example.com/x.mp4',
            headshot_url: 'https://img.example.com/h.jpg',
            portfolio_pdf_url: 'https://doc.example.com/p.pdf',
            government_id_status: 'pending',
            bank_verified: false,
            completed_bookings: 0,
            average_rating: 4.2,
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].stageName).toBe('Artist');
    expect(out[0].genres).toEqual(['Pop', 'Rock']);
    expect(out[0].averageRating).toBe(4.2);
  });

  it('mapTalentProfileDetailFromApi merges nested user and stringifies id', () => {
    const one = mapTalentProfileDetailFromApi({
      data: {
        id: 42,
        stage_name: 'Star',
        legal_name: 'Legal',
        phone: '+966',
        country: 'SA',
        city: 'Jeddah',
        genres: ['Jazz'],
        years_experience: 2,
        bio: 'b',
        website_url: 'https://w.com',
        instagram_handle: '@x',
        status: 'pending',
        media_quality_note: '',
        certificates_summary: '',
        submitted_at: '2026-01-01T00:00:00Z',
        intro_video_url: 'https://v.com',
        headshot_url: 'https://h.com',
        portfolio_pdf_url: 'https://p.com',
        government_id_status: 'pending',
        bank_verified: false,
        completed_bookings: 0,
        average_rating: 3,
        user: { email: 'fan@example.com', full_name: 'Fan User' },
      },
    });
    expect(one.id).toBe('42');
    expect(one.email).toBe('fan@example.com');
    expect(one.legalName).toBe('Legal');
  });

  it('mapTalentProfileFromApi clamps rating and defaults invalid status', () => {
    const one = mapTalentProfileFromApi({
      id: 'x',
      stage_name: 'S',
      legal_name: 'L',
      email: 'e@example.com',
      phone: 'p',
      country: 'c',
      city: 'ci',
      genres: [],
      years_experience: 1,
      bio: 'b',
      website_url: '',
      instagram: '',
      status: 'unknown',
      submitted_at: '2026-01-02T00:00:00Z',
      intro_video_url: 'https://v.com',
      headshot_url: 'https://h.com',
      portfolio_pdf_url: 'https://p.com',
      government_id_status: 'verified',
      bank_verified: true,
      completed_bookings: 2,
      average_rating: 99,
    });
    expect(one.status).toBe('pending');
    expect(one.averageRating).toBe(5);
  });
});

describe('mapAdminUsersFromApi / mapAdminUserDetailFromApi', () => {
  it('maps users list with snake_case', () => {
    const out = mapAdminUsersFromApi({
      data: {
        users: [
          {
            id: 'u-1',
            display_name: 'Test',
            email: 't@example.com',
            role: 'organizer',
            is_suspended: false,
            created_at: '2025-01-01T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 'u-1',
      displayName: 'Test',
      role: 'organizer',
      suspended: false,
      joinedAt: '2025-01-01T00:00:00Z',
    });
  });

  it('mapAdminUserDetailFromApi fills detail counters', () => {
    const d = mapAdminUserDetailFromApi({
      id: 'u-2',
      display_name: 'D',
      email: 'd@example.com',
      role: 'guest',
      suspended: true,
      joined_at: '2024-06-01T00:00:00Z',
      tickets_purchased: 5,
      bookings_count: 2,
      rating_given_count: 1,
    });
    expect(d.ticketsPurchased).toBe(5);
    expect(d.bookingsCount).toBe(2);
    expect(d.ratingGivenCount).toBe(1);
  });
});

describe('mapAdminEventsFromApi / mapAdminEventRowFromApi', () => {
  it('maps events list with snake_case', () => {
    const out = mapAdminEventsFromApi({
      data: {
        events: [
          {
            id: 'ev-1',
            title: 'Show',
            organizer_name: 'Org',
            status: 'active',
            starts_at: '2026-01-01T18:00:00Z',
            ends_at: '2026-01-01T22:00:00Z',
            tickets_sold: 10,
            capacity: 100,
            revenue_sar: 5000,
            avg_rating: 4.5,
            success_rate_percent: 88,
            category: 'Music',
            venue_name: 'Hall',
            city: 'Riyadh',
            cover_image_url: 'https://img.example.com/c.jpg',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].organizerName).toBe('Org');
    expect(out[0].ticketsSold).toBe(10);
  });

  it('mapAdminEventRowFromApi clamps rating and success rate', () => {
    const row = mapAdminEventRowFromApi({
      id: 'e',
      title: 'T',
      organizer_name: 'O',
      status: 'unknown',
      starts_at: '2026-01-02T00:00:00Z',
      ends_at: '2026-01-02T01:00:00Z',
      tickets_sold: 0,
      capacity: 50,
      revenue_sar: 0,
      avg_rating: 9,
      success_rate_percent: 150,
      category: 'X',
      venue_name: 'V',
      city: 'C',
      cover_image_url: 'https://x.com/i.png',
    });
    expect(row.status).toBe('active');
    expect(row.avgRating).toBe(5);
    expect(row.successRatePercent).toBe(100);
  });
});

describe('Phase 6 catalog / settings mappers', () => {
  it('slugifyCategoryBaseName', () => {
    expect(slugifyCategoryBaseName('Hello World!')).toBe('hello-world');
  });

  it('mapEventCategoriesFromApi', () => {
    const out = mapEventCategoriesFromApi({
      data: {
        categories: [
          {
            id: '1',
            name_en: 'Music',
            icon_key: 'Music2',
            color_token: 'coral',
            is_active: true,
            slug: 'music',
            display_order: 0,
          },
        ],
      },
    });
    expect(out[0].name).toBe('Music');
    expect(out[0].slug).toBe('music');
  });

  it('mapEventCategoriesFromApi reads Laravel paginator inside data envelope', () => {
    const out = mapEventCategoriesFromApi({
      data: {
        current_page: 1,
        total: 1,
        per_page: 15,
        data: [{ id: '2', name_en: 'Theatre', is_active: true, slug: 'theatre' }],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('Theatre');
  });

  it('mapFeaturedConfigFromApi', () => {
    const c = mapFeaturedConfigFromApi({ mode: 'manual_override', manual_event_ids: ['a', 'b'] });
    expect(c.mode).toBe('manual_override');
    expect(c.manualEventIds).toEqual(['a', 'b']);
  });

  it('mapFeeConfigurationFromApi', () => {
    const f = mapFeeConfigurationFromApi({
      fee_type: 'combined',
      percent: 10,
      flat_sar: 1,
      payer: 'organizer',
      auction_commission_percent: 5,
      third_party_share_percent: 2,
    });
    expect(f.feeType).toBe('combined');
    expect(f.payer).toBe('organizer');
  });

  it('mapNotificationSettingsFromApi maps in_app', () => {
    const n = mapNotificationSettingsFromApi({
      channels: { email: false, in_app: true, push: true },
      reminder_offsets_hours: [12, 6],
    });
    expect(n.channels.inApp).toBe(true);
    expect(n.channels.sms).toBe(false);
    expect(n.reminderOffsetsHours).toEqual([12, 6]);
  });

  it('mapNotificationSettingsFromApi reads handoff active + sms_enabled', () => {
    const n = mapNotificationSettingsFromApi({
      active: {
        email_enabled: true,
        in_app_enabled: false,
        push_enabled: true,
        sms_enabled: true,
        reminder_offsets_hours: [48, 12],
      },
      history: [],
    });
    expect(n.channels.email).toBe(true);
    expect(n.channels.inApp).toBe(false);
    expect(n.channels.push).toBe(true);
    expect(n.channels.sms).toBe(true);
    expect(n.reminderOffsetsHours).toEqual([48, 12]);
  });
});

describe('Phase 7 support / moderation / ratings', () => {
  it('mapSupportThreadsFromApi', () => {
    const list = mapSupportThreadsFromApi({
      data: {
        cases: [
          {
            id: 'c1',
            user_email: 'u@example.com',
            subject: 'Help',
            status: 'open',
            updated_at: '2026-01-01T00:00:00Z',
            preview: 'Hi',
          },
        ],
      },
    });
    expect(list[0].userEmail).toBe('u@example.com');
  });

  it('mapSupportThreadDetailFromApi maps messages', () => {
    const d = mapSupportThreadDetailFromApi({
      id: 'c1',
      user_email: 'u@example.com',
      subject: 'S',
      status: 'in_progress',
      updated_at: '2026-01-02T00:00:00Z',
      preview: 'P',
      messages: [{ id: 'm1', sender_type: 'admin', body: 'Hello', created_at: '2026-01-02T01:00:00Z' }],
    });
    expect(d.messages[0].author).toBe('admin');
  });

  it('mapListingModerationFromApi', () => {
    const rows = mapListingModerationFromApi({
      data: {
        items: [
          {
            id: 'q1',
            type: 'vendor',
            title: 'T',
            owner_email: 'o@example.com',
            report_reason: 'spam',
            status: 'queued',
          },
        ],
      },
    });
    expect(rows[0].kind).toBe('vendor');
  });

  it('mapRatingsFromApi clamps stars', () => {
    const r = mapRatingsFromApi([
      {
        id: 'r1',
        target_label: 'Event',
        reviewer_email: 'a@example.com',
        score: 10,
        text: 'ok',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]);
    expect(r[0].stars).toBe(5);
    expect(r[0].moderationState).toBe('visible');
  });

  it('mapRatingsFromApi maps moderation_state hidden', () => {
    const r = mapRatingsFromApi([{ id: 3, moderation_state: 'hidden', target_label: 'E', reviewer_email: 'b@example.com', score: 3, text: 'x', created_at: '2026-01-02T00:00:00Z' }]);
    expect(r[0].id).toBe('3');
    expect(r[0].moderationState).toBe('hidden');
  });
});

describe('mapAdminOrdersFromApi', () => {
  it('maps wrapped orders list with snake_case', () => {
    const out = mapAdminOrdersFromApi({
      data: {
        items: [
          {
            id: 99,
            order_status: 'paid',
            customer_email: 'a@b.com',
            event_title: 'Gig',
            total_amount: 150.5,
            ticket_count: 3,
            created_at: '2026-05-01T12:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '99',
      status: 'paid',
      buyerLabel: 'a@b.com',
      eventTitle: 'Gig',
      totalSar: 150.5,
      ticketCount: 3,
    });
  });
});

describe('mapAdminRefundsFromApi', () => {
  it('maps data.refunds with snake_case', () => {
    const out = mapAdminRefundsFromApi({
      data: {
        refunds: [
          {
            id: 'r1',
            refund_status: 'pending',
            refund_amount: 88,
            order_id: 12,
            refund_reason: 'Changed plans',
            user_email: 'x@y.com',
            event_title: 'Show',
            created_at: '2026-05-02T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 'r1',
      status: 'pending',
      amountSar: 88,
      orderId: '12',
      reason: 'Changed plans',
      requestedByLabel: 'x@y.com',
      eventTitle: 'Show',
    });
  });
});

describe('mapRefundBreakdownsFromApi', () => {
  it('maps wrapped breakdown + total', () => {
    const out = mapRefundBreakdownsFromApi({
      data: {
        total_refunded_sar: 500,
        breakdown: [
          { category: 'A', refund_count: 2, refunded_sar: 300 },
          { name: 'B', n: 1, amount: 200 },
        ],
      },
    });
    expect(out.totalRefundedSar).toBe(500);
    expect(out.rows).toHaveLength(2);
    expect(out.rows[0].label).toBe('A');
    expect(out.rows[0].amountSar).toBe(300);
    expect(out.rows[0].refundCount).toBe(2);
    expect(out.rows[1].amountSar).toBe(200);
  });
});

describe('mapAdminPayoutsFromApi', () => {
  it('maps payouts array with snake_case', () => {
    const out = mapAdminPayoutsFromApi({
      data: {
        payouts: [
          {
            id: 7,
            payout_status: 'pending',
            organizer_name: 'Org A',
            gross_amount: 1000,
            event_title: 'Concert',
            created_at: '2026-06-01T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '7',
      status: 'pending',
      organizerName: 'Org A',
      amountSar: 1000,
      eventTitle: 'Concert',
    });
  });
});

describe('mapAdminAuctionsFromApi', () => {
  it('maps auctions list', () => {
    const out = mapAdminAuctionsFromApi({
      data: {
        auctions: [
          {
            id: 'a1',
            title: 'Lot 1',
            auction_status: 'live',
            organizer_name: 'Org',
            highest_bid_sar: 50,
            ends_at: '2026-07-01T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 'a1',
      title: 'Lot 1',
      status: 'live',
      organizerName: 'Org',
      highBidSar: 50,
    });
  });
});

describe('mapAdminScannersFromApi', () => {
  it('maps wrapped scanners with snake_case', () => {
    const out = mapAdminScannersFromApi({
      data: {
        scanners: [
          {
            id: 's1',
            display_name: 'Gate 1',
            scanner_status: 'enabled',
            organizer_name: 'Org',
            device_label: 'T1',
            last_seen_at: '2026-01-01T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 's1',
      displayName: 'Gate 1',
      status: 'active',
      organizerName: 'Org',
      deviceLabel: 'T1',
      lastSeenAt: '2026-01-01T00:00:00Z',
    });
  });
});

describe('mapAdminHealthFromApi', () => {
  it('maps status and collects unknown keys into extras', () => {
    const out = mapAdminHealthFromApi({
      data: {
        overall: 'degraded',
        detail: 'Queue slow',
        checked_at: '2026-01-01T00:00:00Z',
        redis_latency_ms: 42,
      },
    });
    expect(out.status).toBe('degraded');
    expect(out.message).toBe('Queue slow');
    expect(out.checkedAt).toBe('2026-01-01T00:00:00Z');
    expect(out.extras?.redis_latency_ms).toBe(42);
  });
});

describe('mapAdminVersionFromApi', () => {
  it('maps version fields and extras', () => {
    const out = mapAdminVersionFromApi({
      data: {
        app_version: '2.0.1',
        git_sha: 'deadbeef',
        build_time: '2026-02-02',
        env: 'staging',
        php_version: '8.3',
      },
    });
    expect(out.version).toBe('2.0.1');
    expect(out.commit).toBe('deadbeef');
    expect(out.buildDate).toBe('2026-02-02');
    expect(out.environment).toBe('staging');
    expect(out.extras?.php_version).toBe('8.3');
  });
});

describe('mapAdminRecentNotificationsFromApi', () => {
  it('maps notifications wrapper', () => {
    const out = mapAdminRecentNotificationsFromApi({
      data: {
        notifications: [
          {
            id: 9,
            subject: 'Hello',
            body: 'World',
            via: 'email',
            is_read: false,
            created_at: '2026-03-03T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '9',
      title: 'Hello',
      body: 'World',
      channel: 'email',
      read: false,
      createdAt: '2026-03-03T00:00:00Z',
    });
  });
});

describe('mapAdminDeliveryLogsFromApi', () => {
  it('maps delivery_log rows', () => {
    const out = mapAdminDeliveryLogsFromApi({
      data: {
        delivery_log: [
          {
            id: 'd1',
            transport: 'email',
            outcome: 'delivered',
            to_email: 'u@x.co',
            template_id: 'welcome',
            delivered_at: '2026-04-04T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 'd1',
      channel: 'email',
      status: 'sent',
      recipient: 'u@x.co',
      templateKey: 'welcome',
      sentAt: '2026-04-04T00:00:00Z',
    });
  });
});

describe('mapAdminActionsFromApi', () => {
  it('maps admin_actions wrapper', () => {
    const out = mapAdminActionsFromApi({
      data: {
        admin_actions: [
          { id: 1, action_key: 'ping', display_name: 'Ping', group: 'diag' },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '1',
      actionKey: 'ping',
      label: 'Ping',
      category: 'diag',
    });
  });
});

describe('mapAdminAuditLogsFromApi', () => {
  it('maps audit_logs rows', () => {
    const out = mapAdminAuditLogsFromApi({
      data: {
        audit_logs: [
          {
            id: 'a99',
            message: 'Role approved',
            created_at: '2026-01-02T00:00:00Z',
            admin_email: 'root@example.com',
            subject_type: 'role_application',
            subject_id: 'ra-1',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: 'a99',
      summary: 'Role approved',
      createdAt: '2026-01-02T00:00:00Z',
      actorLabel: 'root@example.com',
      resourceType: 'role_application',
      resourceId: 'ra-1',
    });
  });
});

describe('mapAdminAuditLogDetailFromApi', () => {
  it('merges IP and changes', () => {
    const out = mapAdminAuditLogDetailFromApi({
      id: 'z',
      action: 'Update',
      created_at: '2026-02-02T00:00:00Z',
      ip_address: '10.0.0.1',
      diff: { x: 1 },
    });
    expect(out.ip).toBe('10.0.0.1');
    expect(out.changes).toEqual({ x: 1 });
  });
});

describe('mapAdminComplaintsFromApi', () => {
  it('maps complaints list with snake_case', () => {
    const out = mapAdminComplaintsFromApi({
      data: {
        complaints: [
          {
            id: 5,
            subject: 'Bad refund',
            complaint_status: 'new',
            category_key: 'payments',
            reporter_email: 'a@b.co',
            target_name: 'Event X',
            created_at: '2026-01-05T00:00:00Z',
            updated_at: '2026-01-06T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '5',
      title: 'Bad refund',
      status: 'open',
      category: 'payments',
      reporterLabel: 'a@b.co',
      targetLabel: 'Event X',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-01-06T00:00:00Z',
    });
  });
});

describe('mapAdminOrganizerKycFromApi', () => {
  it('maps organizer envelope and kyc_documents rows', () => {
    const out = mapAdminOrganizerKycFromApi(
      {
        data: {
          organizer_name: 'Acme Events',
          kyc_documents: [
            {
              id: 12,
              document_name: 'CR.pdf',
              doc_type: 'cr',
              verification_status: 'submitted',
              uploaded_at: '2026-03-01T00:00:00Z',
            },
          ],
        },
      },
      'org-x'
    );
    expect(out.organizerId).toBe('org-x');
    expect(out.organizerName).toBe('Acme Events');
    expect(out.documents).toHaveLength(1);
    expect(out.documents[0]).toMatchObject({
      id: '12',
      label: 'CR.pdf',
      docType: 'cr',
      status: 'pending',
      uploadedAt: '2026-03-01T00:00:00Z',
    });
  });
});

describe('mapAdminScanLogsFromApi', () => {
  it('maps scan_logs wrapper and normalizes outcome', () => {
    const out = mapAdminScanLogsFromApi({
      data: {
        scan_logs: [
          {
            id: 99,
            scanned_at: '2026-02-02T12:00:00Z',
            outcome: 'ok',
            ticket_ref: 'X-1',
            scanner_label: 'S1',
            event_title: 'Show',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '99',
      scannedAt: '2026-02-02T12:00:00Z',
      outcome: 'valid',
      ticketRef: 'X-1',
      scannerLabel: 'S1',
      eventTitle: 'Show',
    });
  });
});

describe('mapAdminProfileDirectoryFromApi', () => {
  it('maps wrapped vendors array with snake_case fields', () => {
    const out = mapAdminProfileDirectoryFromApi({
      data: {
        vendors: [
          {
            id: 1,
            business_name: 'Acme Booths',
            contact_email: 'hi@acme.example',
            slug: 'acme-booths',
            city: 'Riyadh',
            country: 'SA',
            review_status: 'pending',
            updated_at: '2026-01-02T00:00:00Z',
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: '1',
      displayName: 'Acme Booths',
      email: 'hi@acme.example',
      slug: 'acme-booths',
      city: 'Riyadh',
      country: 'SA',
      status: 'pending',
      updatedAt: '2026-01-02T00:00:00Z',
    });
  });
});

describe('mapAdminProfileDirectoryRowFromApi', () => {
  it('falls back to slug-based display name when name missing', () => {
    const row = mapAdminProfileDirectoryRowFromApi({ slug: 'cool-events', id: '' });
    expect(row.displayName).toBe('cool events');
    expect(row.id).toBe('cool-events');
  });
});

describe('mapFinancialAnalyticsFromApi', () => {
  it('maps snake_case financial payload', () => {
    const f = mapFinancialAnalyticsFromApi({
      data: {
        total_revenue_sar: 100,
        platform_fees_sar: 10,
        refunds_sar: 2,
        payouts_pending_sar: 5,
        revenue_by_day: [{ date: '2026-01-01', revenue_sar: 50 }],
        revenue_breakdown_by_category: [
          { category_key: 'music', label: 'Music', revenue_sar: 40 },
        ],
      },
    });
    expect(f.totalRevenueSar).toBe(100);
    expect(f.revenueByDay).toHaveLength(1);
    expect(f.revenueBreakdownByCategory[0].categoryKey).toBe('music');
  });

  it('maps handoff financial summary fields and empty series', () => {
    const f = mapFinancialAnalyticsFromApi({
      data: {
        range: '24h',
        since: '2026-05-08T00:00:00Z',
        orders_paid_total_amount: 500,
        refunds_processed_total_amount: 20,
        orders_paid_count: 3,
      },
    });
    expect(f.range).toBe('24h');
    expect(f.since).toBe('2026-05-08T00:00:00Z');
    expect(f.ordersPaidTotalAmount).toBe(500);
    expect(f.refundsProcessedTotalAmount).toBe(20);
    expect(f.ordersPaidCount).toBe(3);
    expect(f.revenueByDay).toEqual([]);
    expect(f.revenueBreakdownByCategory).toEqual([]);
  });
});

describe('mapLeaderboardsFromApi', () => {
  it('maps GMV events and organizers', () => {
    const lb = mapLeaderboardsFromApi({
      data: {
        events: [
          {
            id: 1,
            code: 'E1',
            title: 'Gig',
            revenue_gross: '120.50',
            status: 'published',
            organizer_id: 9,
          },
        ],
        organizers: [
          {
            organizer_id: 9,
            total_revenue_gross: 120.5,
            display_name: 'Org',
            slug: 'org',
            code: 'O9',
          },
        ],
        generated_at: '2026-05-09T12:00:00Z',
      },
    });
    expect(lb.events[0].title).toBe('Gig');
    expect(lb.events[0].revenueGross).toBe('120.50');
    expect(lb.organizers[0].displayName).toBe('Org');
    expect(lb.generatedAt).toBe('2026-05-09T12:00:00Z');
  });
});
