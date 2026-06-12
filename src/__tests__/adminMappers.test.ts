import { describe, expect, it } from "vitest";
import {
  mapAdminEventDetailFromApi,
  mapAdminEventRowFromApi,
  mapAdminEventsFromApi,
  mapAdminUserDetailFromApi,
  mapAdminUsersFromApi,
  mapAdminUsersListFromApi,
  mapDashboardCountersFromApi,
  mapDashboardSummaryFromApi,
  mapEventCategoriesFromApi,
  mapFeaturedConfigFromApi,
  mapFeeConfigurationFromApi,
  mapFinancialAnalyticsFromApi,
  mapAdminOrderDetailFromApi,
  mapAdminOrdersFromApi,
  mapAdminAuctionDetailFromApi,
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
  mapAdminRefundRowFromApi,
  mapAdminRefundsFromApi,
  mapRefundBreakdownsFromApi,
  mapListingModerationFromApi,
  mapNotificationSettingsFromApi,
  mapRatingsFromApi,
  mapSupportThreadDetailFromApi,
  mapSupportThreadsFromApi,
  mapPendingActionsFromApi,
  mapPlatformCountersFromApi,
  mapRoleApplicationFromApi,
  mapRoleApplicationsFromApi,
  mapTalentProfileDetailFromApi,
  mapTalentProfileFromApi,
  mapTalentProfilesFromApi,
  mapLeaderboardsFromApi,
  mapAdminProfileDirectoryFromApi,
  mapAdminProfileDirectoryRowFromApi,
  slugifyCategoryBaseName,
  suggestUniqueCategorySlug,
  mapTourismAdFromApi,
  mapTourismAdsFromApi,
  mapTourismAdsListFromApi,
} from "@/schemas/api/adminMappers";

describe("mapDashboardCountersFromApi", () => {
  it("maps flat snake_case data envelope", () => {
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

describe("mapDashboardSummaryFromApi", () => {
  it("maps nested snake_case inside data envelope", () => {
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

describe("mapPendingActionsFromApi", () => {
  it("maps array with snake_case rows", () => {
    const out = mapPendingActionsFromApi([
      {
        id: "1",
        kind: "support",
        title: "T",
        subtitle: "S",
        href: "/support",
        priority: "high",
        image_url: "/img.png",
        due_label: "Soon",
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "1",
      kind: "support",
      imageUrl: "/img.png",
      dueLabel: "Soon",
    });
  });

  it("unwraps items list", () => {
    const out = mapPendingActionsFromApi({
      data: {
        items: [
          {
            id: "x",
            kind: "role_application",
            title: "Roles",
            subtitle: "Sub",
            href: "/r",
            priority: "normal",
            imageUrl: "https://example.com/i.jpg",
            dueLabel: "Later",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("role_application");
  });

  it("flattens grouped pending-action buckets", () => {
    const out = mapPendingActionsFromApi({
      data: {
        events_pending_approval: [
          {
            id: "7",
            code: "EVT-1",
            title: "Gala",
            status: "pending_approval",
            submitted_at: "2026-05-01T00:00:00Z",
          },
        ],
        support_cases_open: [
          {
            id: "3",
            code: "SUP-1",
            subject: "Refund",
            status: "open",
            priority: "high",
            created_at: "2026-05-02T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ kind: "event", href: "/events/7", title: "Gala" });
    expect(out[1]).toMatchObject({ kind: "support", href: "/support/3", title: "Refund" });
  });
});

describe("mapPlatformCountersFromApi", () => {
  it("maps flat dashboard counters into platform counter shape", () => {
    const out = mapPlatformCountersFromApi({
      data: {
        users_total: 100,
        events_published: 12,
        tickets_sold: 50,
      },
    });
    expect(out.usersByRole.guest).toBe(100);
    expect(out.eventsByStatus.active).toBe(12);
    expect(out.ticketsSold).toBe(50);
  });
});

describe("mapRoleApplicationsFromApi / mapRoleApplicationFromApi", () => {
  it("unwraps data.role_applications with snake_case", () => {
    const out = mapRoleApplicationsFromApi({
      data: {
        role_applications: [
          {
            id: "ra-1",
            applicant_name: "Test User",
            email: "test@example.com",
            type: "talent",
            status: "pending",
            submitted_at: "2026-01-01T00:00:00Z",
            documents_summary: "ID copy",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "ra-1",
      applicantName: "Test User",
      email: "test@example.com",
      type: "talent",
      status: "pending",
      submittedAt: "2026-01-01T00:00:00Z",
      documentsSummary: "ID copy",
    });
  });

  it("stringifies numeric role application ids from Laravel list rows", () => {
    const out = mapRoleApplicationsFromApi({
      data: {
        current_page: 1,
        data: [
          {
            id: 1,
            applicant_name: "KAT",
            email: "beeestore.center@gmail.com",
            role: "talent",
            status: "pending",
            created_at: "2026-06-10T09:41:25.000000Z",
            documents_summary: "Certificate uploaded",
          },
        ],
      },
    });
    expect(out[0].id).toBe("1");
    expect(out[0].type).toBe("talent");
  });

  it("maps single detail row with rejection_reason", () => {
    const one = mapRoleApplicationFromApi({
      data: {
        id: "x",
        applicant_name: "A",
        email: "a@example.com",
        type: "vendor",
        status: "rejected",
        submitted_at: "2026-02-02T00:00:00Z",
        documents_summary: "Docs",
        rejection_reason: "Incomplete",
      },
    });
    expect(one.rejectReason).toBe("Incomplete");
    expect(one.status).toBe("rejected");
  });
});

describe("mapTalentProfilesFromApi / mapTalentProfileFromApi", () => {
  it("mapTalentProfilesFromApi maps Laravel paginator + profiles/talents marketplace row", () => {
    const out = mapTalentProfilesFromApi({
      current_page: 1,
      data: [
        {
          id: 1,
          user_id: 4,
          application_id: null,
          slug: "demo-star-talent",
          stage_name: "Demo Star Talent",
          bio: "Seeded performer.",
          region_id: 1,
          city_id: 1,
          profile_image_url: null,
          intro_video_url: null,
          instagram_handle: "demotalent",
          website_url: null,
          travel_ready: 1,
          location_public: 1,
          availability_status: "available",
          rating_average: "4.85",
          rating_count: 12,
          completed_bookings: 3,
          is_active: 1,
          created_at: "2026-05-10T22:37:03.000000Z",
          updated_at: "2026-05-10T22:37:03.000000Z",
        },
      ],
      total: 1,
    });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("1");
    expect(out[0].slug).toBe("demo-star-talent");
    expect(out[0].stageName).toBe("Demo Star Talent");
    expect(out[0].legalName).toBe("Demo Star Talent");
    expect(out[0].email).toBe("talent-user-4@example.com");
    expect(out[0].averageRating).toBe(4.85);
    expect(out[0].completedBookings).toBe(3);
  });

  it("maps wrapped talents list with snake_case", () => {
    const out = mapTalentProfilesFromApi({
      data: {
        talents: [
          {
            id: "t1",
            stage_name: "Artist",
            legal_name: "Legal Name",
            email: "a@example.com",
            phone: "+1",
            country: "SA",
            city: "Riyadh",
            genres: "Pop, Rock",
            years_experience: 3,
            bio: "Bio",
            website_url: "https://a.com",
            instagram_handle: "@a",
            status: "pending",
            media_quality_note: "ok",
            certificates_summary: "none",
            submitted_at: "2026-01-01T00:00:00Z",
            intro_video_url: "https://v.example.com/x.mp4",
            headshot_url: "https://img.example.com/h.jpg",
            portfolio_pdf_url: "https://doc.example.com/p.pdf",
            government_id_status: "pending",
            bank_verified: false,
            completed_bookings: 0,
            average_rating: 4.2,
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].stageName).toBe("Artist");
    expect(out[0].genres).toEqual(["Pop", "Rock"]);
    expect(out[0].averageRating).toBe(4.2);
  });

  it("mapTalentProfileDetailFromApi merges nested user and stringifies id", () => {
    const one = mapTalentProfileDetailFromApi({
      data: {
        id: 42,
        stage_name: "Star",
        legal_name: "Legal",
        phone: "+966",
        country: "SA",
        city: "Jeddah",
        genres: ["Jazz"],
        years_experience: 2,
        bio: "b",
        website_url: "https://w.com",
        instagram_handle: "@x",
        status: "pending",
        media_quality_note: "",
        certificates_summary: "",
        submitted_at: "2026-01-01T00:00:00Z",
        intro_video_url: "https://v.com",
        headshot_url: "https://h.com",
        portfolio_pdf_url: "https://p.com",
        government_id_status: "pending",
        bank_verified: false,
        completed_bookings: 0,
        average_rating: 3,
        user: { email: "fan@example.com", full_name: "Fan User" },
      },
    });
    expect(one.id).toBe("42");
    expect(one.email).toBe("fan@example.com");
    expect(one.legalName).toBe("Legal");
  });

  it("mapTalentProfilesFromApi unwraps directory rows with profile + role_application_id", () => {
    const out = mapTalentProfilesFromApi({
      data: [
        {
          id: 99,
          approval_status: "pending",
          role_application_id: 7,
          government_id_status: "pending",
          profile: {
            id: 3,
            stage_name: "KAT",
            bio: "Bio",
            application_id: 7,
          },
        },
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("3");
    expect(out[0].applicationId).toBe("7");
    expect(out[0].status).toBe("pending");
    expect(out[0].governmentIdStatus).toBe("pending");
  });

  it("mapTalentProfileDetailFromApi maps government_id_verification images", () => {
    const one = mapTalentProfileDetailFromApi({
      data: {
        id: 3,
        stage_name: "KAT",
        government_id_status: "pending",
        government_id_verification: {
          id: 10,
          document_type: "national_id",
          document_number: "ABC123",
          front_image_url: "https://cdn.example/front.jpg",
          back_image_url: "https://cdn.example/back.jpg",
          selfie_url: "https://cdn.example/selfie.jpg",
          status: "pending",
        },
        application: { government_id_status: "pending" },
      },
    });
    expect(one.governmentIdVerification?.documentType).toBe("national_id");
    expect(one.governmentIdVerification?.frontImageUrl).toContain("front.jpg");
    expect(one.governmentIdVerification?.selfieUrl).toContain("selfie.jpg");
  });

  it("mapTalentProfileDetailFromApi maps gallery, application fields, and region/city ids", () => {
    const one = mapTalentProfileDetailFromApi({
      data: {
        id: 3,
        user_id: 25,
        application_id: 1,
        slug: "kat-25",
        stage_name: "KAT",
        bio: "Performer bio",
        region_id: 5,
        city_id: 36,
        profile_image_url:
          "https://myticket-api.kat-jr.com/storage/marketplace/talent-media/head.png",
        intro_video_url: null,
        instagram_handle: null,
        website_url: null,
        travel_ready: 1,
        location_public: 1,
        availability_status: "available",
        rating_average: "0.00",
        rating_count: 0,
        completed_bookings: 0,
        is_active: 1,
        created_at: "2026-06-10T12:12:06.000000Z",
        user: {
          id: 25,
          email: "beeestore.center@gmail.com",
          phone: "+9665971455621",
          full_name: "Talent User",
        },
        application: {
          id: 1,
          contact_email: "beeestore.center@gmail.com",
          contact_phone: "05897468879",
          certificate_name: "Test Certificate",
          government_id_status: "pending",
          bank_verified: 0,
          accepted_quality_disclaimer: 1,
          created_at: "2026-06-10T09:41:25.000000Z",
        },
        categories: [],
        gallery: [
          {
            id: 2,
            image_url:
              "https://myticket-api.kat-jr.com/storage/marketplace/talent-media/gallery.png",
            caption: null,
            position: 0,
          },
        ],
      },
    });
    expect(one.id).toBe("3");
    expect(one.slug).toBe("kat-25");
    expect(one.userId).toBe("25");
    expect(one.applicationId).toBe("1");
    expect(one.email).toBe("beeestore.center@gmail.com");
    expect(one.contactPhone).toBe("05897468879");
    expect(one.city).toBe("City #36");
    expect(one.country).toBe("Region #5");
    expect(one.certificatesSummary).toBe("Test Certificate");
    expect(one.acceptedQualityDisclaimer).toBe(true);
    expect(one.travelReady).toBe(true);
    expect(one.availabilityStatus).toBe("available");
    expect(one.gallery).toHaveLength(1);
    expect(one.gallery[0].imageUrl).toContain("gallery.png");
    expect(one.introVideoUrl).toBe("");
    expect(one.portfolioPdfUrl).toBe("");
  });

  it("mapTalentProfileFromApi clamps rating and defaults invalid status", () => {
    const one = mapTalentProfileFromApi({
      id: "x",
      stage_name: "S",
      legal_name: "L",
      email: "e@example.com",
      phone: "p",
      country: "c",
      city: "ci",
      genres: [],
      years_experience: 1,
      bio: "b",
      website_url: "",
      instagram: "",
      status: "unknown",
      submitted_at: "2026-01-02T00:00:00Z",
      intro_video_url: "https://v.com",
      headshot_url: "https://h.com",
      portfolio_pdf_url: "https://p.com",
      government_id_status: "verified",
      bank_verified: true,
      completed_bookings: 2,
      average_rating: 99,
    });
    expect(one.status).toBe("pending");
    expect(one.averageRating).toBe(5);
  });
});

describe("mapAdminUsersFromApi / mapAdminUserDetailFromApi", () => {
  it("maps users list with snake_case", () => {
    const out = mapAdminUsersFromApi({
      data: {
        users: [
          {
            id: "u-1",
            display_name: "Test",
            email: "t@example.com",
            role: "organizer",
            is_suspended: false,
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "u-1",
      displayName: "Test",
      role: "organizer",
      suspended: false,
      joinedAt: "2025-01-01T00:00:00Z",
    });
  });

  it("maps Laravel paginator with numeric ids and full_name fallback", () => {
    const out = mapAdminUsersListFromApi({
      current_page: 1,
      per_page: 30,
      total: 2,
      data: [
        {
          id: 27,
          email: "mazeed.trading.contracting@gmail.com",
          full_name: "Talent User",
          display_name: null,
          role: "guest",
          is_suspended: false,
          created_at: "2026-06-10T08:33:48.000000Z",
        },
        {
          id: 2,
          email: "organizer@myticket.test",
          full_name: "Demo Organizer",
          display_name: "Organizer",
          role: "organizer",
          is_suspended: true,
          created_at: "2026-05-10T22:03:33.000000Z",
        },
      ],
    });
    expect(out.currentPage).toBe(1);
    expect(out.perPage).toBe(30);
    expect(out.total).toBe(2);
    expect(out.items[0]).toMatchObject({
      id: "27",
      displayName: "Talent User",
      role: "guest",
      suspended: false,
    });
    expect(out.items[1]).toMatchObject({
      id: "2",
      displayName: "Organizer",
      suspended: true,
    });
  });

  it("mapAdminUserDetailFromApi fills detail counters", () => {
    const d = mapAdminUserDetailFromApi({
      id: "u-2",
      display_name: "D",
      email: "d@example.com",
      role: "guest",
      suspended: true,
      joined_at: "2024-06-01T00:00:00Z",
      tickets_purchased: 5,
      bookings_count: 2,
      rating_given_count: 1,
    });
    expect(d.ticketsPurchased).toBe(5);
    expect(d.bookingsCount).toBe(2);
    expect(d.ratingGivenCount).toBe(1);
  });
});

describe("mapAdminEventsFromApi / mapAdminEventRowFromApi", () => {
  it("maps events list with snake_case", () => {
    const out = mapAdminEventsFromApi({
      data: {
        events: [
          {
            id: "ev-1",
            title: "Show",
            organizer_name: "Org",
            status: "active",
            starts_at: "2026-01-01T18:00:00Z",
            ends_at: "2026-01-01T22:00:00Z",
            tickets_sold: 10,
            capacity: 100,
            revenue_sar: 5000,
            avg_rating: 4.5,
            success_rate_percent: 88,
            category: "Music",
            venue_name: "Hall",
            city: "Riyadh",
            cover_image_url: "https://img.example.com/c.jpg",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].organizerName).toBe("Org");
    expect(out[0].ticketsSold).toBe(10);
  });

  it("mapAdminEventDetailFromApi maps nested organizer and API status", () => {
    const out = mapAdminEventDetailFromApi({
      data: {
        id: 18,
        code: "EVT-00000016",
        title: "test",
        description: "test",
        status: "pending_approval",
        cover_image_url: "https://example.com/c.png",
        starts_at: "2026-05-27T11:43:00.000000Z",
        ends_at: "2026-05-31T14:48:00.000000Z",
        timezone: "Asia/Riyadh",
        city: "Madinah",
        tickets_sold: 0,
        capacity: null,
        revenue_gross: "0.00",
        rating_average: null,
        rating_count: 0,
        is_featured: false,
        organizer: {
          id: 1,
          display_name: "Demo Events Co.",
          contact_email: "organizer@example.com",
        },
        category: {
          id: 7,
          slug: "workshops",
          name_en: "Workshops",
          name_ar: "ورش عمل",
        },
      },
    });
    expect(out.apiStatus).toBe("pending_approval");
    expect(out.code).toBe("EVT-00000016");
    expect(out.organizer?.displayName).toBe("Demo Events Co.");
    expect(out.categoryDetail?.nameEn).toBe("Workshops");
    expect(out.capacity).toBeNull();
  });

  it("mapAdminEventRowFromApi clamps rating and success rate", () => {
    const row = mapAdminEventRowFromApi({
      id: "e",
      title: "T",
      organizer_name: "O",
      status: "unknown",
      starts_at: "2026-01-02T00:00:00Z",
      ends_at: "2026-01-02T01:00:00Z",
      tickets_sold: 0,
      capacity: 50,
      revenue_sar: 0,
      avg_rating: 9,
      success_rate_percent: 150,
      category: "X",
      venue_name: "V",
      city: "C",
      cover_image_url: "https://x.com/i.png",
    });
    expect(row.status).toBe("active");
    expect(row.avgRating).toBe(5);
    expect(row.successRatePercent).toBe(100);
  });
});

describe("Phase 6 catalog / settings mappers", () => {
  it("slugifyCategoryBaseName", () => {
    expect(slugifyCategoryBaseName("Hello World!")).toBe("hello-world");
  });

  it("suggestUniqueCategorySlug avoids collisions", () => {
    expect(suggestUniqueCategorySlug("Music", ["music", "sports"])).toBe("music-2");
    expect(suggestUniqueCategorySlug("Music", ["other"])).toBe("music");
  });

  it("mapEventCategoriesFromApi", () => {
    const out = mapEventCategoriesFromApi({
      data: {
        categories: [
          {
            id: "1",
            name_en: "Music",
            name_ar: "موسيقى",
            icon_key: "Music2",
            color_token: "coral",
            is_active: true,
            slug: "music",
            display_order: 0,
          },
        ],
      },
    });
    expect(out[0].nameEn).toBe("Music");
    expect(out[0].nameAr).toBe("موسيقى");
    expect(out[0].slug).toBe("music");
  });

  it("mapEventCategoriesFromApi reads Laravel paginator inside data envelope", () => {
    const out = mapEventCategoriesFromApi({
      data: {
        current_page: 1,
        total: 1,
        per_page: 15,
        data: [
          {
            id: "2",
            name_en: "Theatre",
            name_ar: "مسرح",
            is_active: true,
            slug: "theatre",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0].nameEn).toBe("Theatre");
    expect(out[0].nameAr).toBe("مسرح");
  });

  it("mapFeaturedConfigFromApi", () => {
    const c = mapFeaturedConfigFromApi({
      mode: "manual_override",
      manual_event_ids: ["a", "b"],
    });
    expect(c.mode).toBe("manual_override");
    expect(c.manualEventIds).toEqual(["a", "b"]);
    expect(c.refreshMinutes).toBe(60);
  });

  it("mapFeaturedConfigFromApi coerces numeric manual_event_ids to strings", () => {
    const c = mapFeaturedConfigFromApi({
      mode: "manual_override",
      manual_event_ids: [1, 7, "ev-9"],
      refresh_minutes: 30,
    });
    expect(c.manualEventIds).toEqual(["1", "7", "ev-9"]);
    expect(c.refreshMinutes).toBe(30);
  });

  it("mapFeeConfigurationFromApi", () => {
    const f = mapFeeConfigurationFromApi({
      fee_type: "combined",
      percent: 10,
      flat_sar: 1,
      payer: "organizer",
      auction_commission_percent: 5,
      third_party_share_percent: 2,
    });
    expect(f.feeType).toBe("combined");
    expect(f.payer).toBe("organizer");
  });

  it("mapNotificationSettingsFromApi maps in_app", () => {
    const n = mapNotificationSettingsFromApi({
      channels: { email: false, in_app: true, push: true },
      reminder_offsets_hours: [12, 6],
    });
    expect(n.channels.inApp).toBe(true);
    expect(n.channels.sms).toBe(false);
    expect(n.reminderOffsetsHours).toEqual([12, 6]);
  });

  it("mapNotificationSettingsFromApi reads handoff active + sms_enabled", () => {
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

describe("Phase 7 support / moderation / ratings", () => {
  it("mapSupportThreadsFromApi", () => {
    const list = mapSupportThreadsFromApi({
      data: {
        cases: [
          {
            id: "c1",
            user_email: "u@example.com",
            subject: "Help",
            status: "open",
            updated_at: "2026-01-01T00:00:00Z",
            preview: "Hi",
          },
        ],
      },
    });
    expect(list[0].userEmail).toBe("u@example.com");
  });

  it("mapSupportThreadsFromApi maps Laravel paginator + support-cases row shape", () => {
    const list = mapSupportThreadsFromApi({
      current_page: 1,
      data: [
        {
          id: 2,
          code: "SC-DEMO-0002",
          user_id: 6,
          related_order_id: null,
          subject: "Demo: request phone number change",
          initial_message: "I need to update the phone on my account for SMS tickets.",
          status: "waiting_user",
          updated_at: "2026-05-12T14:16:56.000000Z",
        },
        {
          id: 1,
          code: "SC-DEMO-0001",
          user_id: 6,
          related_event_id: 1,
          subject: "Demo: cannot download ticket PDF",
          initial_message: "I completed payment but the ticket PDF link returns an error.",
          status: "in_progress",
          updated_at: "2026-05-12T14:16:56.000000Z",
        },
      ],
      total: 2,
    });
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("2");
    expect(list[0].code).toBe("SC-DEMO-0002");
    expect(list[0].userEmail).toBe("User #6");
    expect(list[0].preview).toContain("SMS tickets");
    expect(list[0].status).toBe("in_progress");
    expect(list[1].status).toBe("in_progress");
  });

  it("mapSupportThreadDetailFromApi maps messages", () => {
    const d = mapSupportThreadDetailFromApi({
      id: "c1",
      user_email: "u@example.com",
      subject: "S",
      status: "in_progress",
      updated_at: "2026-01-02T00:00:00Z",
      preview: "P",
      messages: [
        {
          id: "m1",
          sender_type: "admin",
          body: "Hello",
          created_at: "2026-01-02T01:00:00Z",
        },
      ],
    });
    expect(d.messages[0].author).toBe("admin");
  });

  it("mapSupportThreadDetailFromApi uses initial_message when messages empty", () => {
    const d = mapSupportThreadDetailFromApi({
      id: 99,
      user_id: 3,
      subject: "Lost ticket",
      status: "open",
      updated_at: "2026-05-12T10:00:00.000000Z",
      initial_message: "I cannot find my QR code.",
    });
    expect(d.messages).toHaveLength(1);
    expect(d.messages[0].body).toBe("I cannot find my QR code.");
    expect(d.messages[0].author).toBe("user");
    expect(d.id).toBe("99");
  });

  it("mapSupportThreadsFromApi maps nested user (full_name, email)", () => {
    const list = mapSupportThreadsFromApi({
      current_page: 1,
      data: [
        {
          id: 2,
          subject: "Demo",
          status: "open",
          priority: "normal",
          updated_at: "2026-05-12T14:16:56.000000Z",
          initial_message: "Hi",
          user: {
            id: 6,
            email: "buyer@myticket.test",
            full_name: "Demo Buyer",
            display_name: "Buyer",
          },
        },
      ],
      total: 1,
    });
    expect(list[0].requesterDisplayName).toBe("Demo Buyer");
    expect(list[0].userEmail).toBe("buyer@myticket.test");
    expect(list[0].priority).toBe("normal");
  });

  it("mapSupportThreadDetailFromApi maps data envelope, user, resolution_note, numeric message ids", () => {
    const d = mapSupportThreadDetailFromApi({
      data: {
        id: 2,
        code: "SC-DEMO-0002",
        subject: "Phone change",
        status: "resolved",
        priority: "low",
        resolution_note: "Resolved.",
        updated_at: "2026-05-12T14:42:46.000000Z",
        initial_message: "ignored when messages present",
        user: {
          id: 6,
          email: "buyer@myticket.test",
          full_name: "Demo Buyer",
        },
        messages: [
          {
            id: 4,
            sender_role: "user",
            body: "Please advise",
            created_at: "2026-05-11T14:16:56.000000Z",
          },
          {
            id: 6,
            sender_role: "admin",
            body: "Done",
            created_at: "2026-05-12T14:28:59.000000Z",
          },
        ],
      },
    });
    expect(d.id).toBe("2");
    expect(d.requesterDisplayName).toBe("Demo Buyer");
    expect(d.userEmail).toBe("buyer@myticket.test");
    expect(d.priority).toBe("low");
    expect(d.resolutionNote).toBe("Resolved.");
    expect(d.messages[0].id).toBe("4");
    expect(d.messages[0].author).toBe("user");
    expect(d.messages[1].id).toBe("6");
    expect(d.messages[1].author).toBe("admin");
  });

  it("mapListingModerationFromApi maps Laravel moderation-queue rows", () => {
    const rows = mapListingModerationFromApi({
      current_page: 1,
      data: [
        {
          id: 2,
          listing_kind: "vendor",
          talent_profile_id: null,
          vendor_profile_id: 1,
          owner_user_id: 5,
          reporter_user_id: 6,
          flag_reason: "demo_seed_misleading_services",
          description: "Seeded moderation item: reported service description mismatch.",
          status: "in_review",
          created_at: "2026-05-12T14:16:56.000000Z",
        },
      ],
      total: 1,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("2");
    expect(rows[0].kind).toBe("vendor");
    expect(rows[0].status).toBe("claimed");
    expect(rows[0].ownerEmail).toBe("Owner #5");
    expect(rows[0].flagReason).toBe("demo_seed_misleading_services");
    expect(rows[0].description).toContain("Seeded moderation");
  });

  it("mapListingModerationFromApi", () => {
    const rows = mapListingModerationFromApi({
      data: {
        items: [
          {
            id: "q1",
            type: "vendor",
            title: "T",
            owner_email: "o@example.com",
            report_reason: "spam",
            status: "queued",
          },
        ],
      },
    });
    expect(rows[0].kind).toBe("vendor");
  });

  it("mapRatingsFromApi maps Laravel paginator + target_type and is_visible", () => {
    const r = mapRatingsFromApi({
      current_page: 1,
      data: [
        {
          id: 4,
          user_id: 6,
          target_type: "vendor",
          target_id: 1,
          stars: 5,
          comment: "Excellent.",
          is_visible: true,
          created_at: "2026-05-12T14:16:56.000000Z",
        },
        {
          id: 2,
          user_id: 6,
          target_type: "organizer",
          target_id: 1,
          stars: 2,
          comment: "Hidden demo.",
          is_visible: false,
          created_at: "2026-05-12T14:16:56.000000Z",
        },
      ],
      total: 2,
    });
    expect(r).toHaveLength(2);
    expect(r[0].id).toBe("4");
    expect(r[0].targetLabel).toBe("Vendor #1");
    expect(r[0].authorEmail).toBe("User #6");
    expect(r[0].moderationState).toBe("visible");
    expect(r[1].moderationState).toBe("hidden");
  });

  it("mapRatingsFromApi clamps stars", () => {
    const r = mapRatingsFromApi([
      {
        id: "r1",
        target_label: "Event",
        reviewer_email: "a@example.com",
        score: 10,
        text: "ok",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
    expect(r[0].stars).toBe(5);
    expect(r[0].moderationState).toBe("visible");
  });

  it("mapRatingsFromApi maps moderation_state hidden", () => {
    const r = mapRatingsFromApi([
      {
        id: 3,
        moderation_state: "hidden",
        target_label: "E",
        reviewer_email: "b@example.com",
        score: 3,
        text: "x",
        created_at: "2026-01-02T00:00:00Z",
      },
    ]);
    expect(r[0].id).toBe("3");
    expect(r[0].moderationState).toBe("hidden");
  });
});

describe("mapAdminOrdersFromApi", () => {
  it("maps Laravel paginator + payment_status + reference", () => {
    const out = mapAdminOrdersFromApi({
      current_page: 1,
      data: [
        {
          id: 3,
          reference: "ORD-Y4YWSTRB1KNP",
          user_id: 19,
          event_id: 1,
          quantity: 1,
          total: "105.00",
          currency: "SAR",
          payment_status: "approved",
          paid_at: "2026-05-11T16:56:10.000000Z",
          cancelled_at: null,
          created_at: "2026-05-11T16:56:09.000000Z",
        },
        {
          id: 2,
          reference: "ORD-HFLL3WSIJVDH",
          user_id: 19,
          event_id: 1,
          quantity: 1,
          total: "105.00",
          payment_status: "pending",
          created_at: "2026-05-11T16:48:24.000000Z",
        },
      ],
      total: 2,
      per_page: 20,
    });
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({
      id: "3",
      reference: "ORD-Y4YWSTRB1KNP",
      numericId: 3,
      status: "paid",
      buyerLabel: "User #19",
      eventTitle: "Event #1",
      totalSar: 105,
      ticketCount: 1,
    });
    expect(out[1].status).toBe("pending");
  });

  it("prefers nested user.full_name and event.title when present", () => {
    const out = mapAdminOrdersFromApi({
      current_page: 1,
      data: [
        {
          id: 3,
          reference: "ORD-X",
          user_id: 19,
          event_id: 1,
          quantity: 1,
          total: "105.00",
          payment_status: "approved",
          created_at: "2026-05-11T16:56:09.000000Z",
          user: { id: 19, full_name: "Mohamed Ahmed" },
          event: { id: 1, title: "Demo Concert in Riyadh" },
        },
      ],
      total: 1,
    });
    expect(out[0].buyerLabel).toBe("Mohamed Ahmed");
    expect(out[0].eventTitle).toBe("Demo Concert in Riyadh");
  });

  it("maps wrapped orders list with snake_case", () => {
    const out = mapAdminOrdersFromApi({
      data: {
        items: [
          {
            id: 99,
            order_status: "paid",
            customer_email: "a@b.com",
            event_title: "Gig",
            total_amount: 150.5,
            ticket_count: 3,
            created_at: "2026-05-01T12:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "99",
      status: "paid",
      buyerLabel: "a@b.com",
      eventTitle: "Gig",
      totalSar: 150.5,
      ticketCount: 3,
    });
  });
});

describe("mapAdminOrderDetailFromApi", () => {
  it("maps relations, items, tickets, and currency", () => {
    const d = mapAdminOrderDetailFromApi({
      data: {
        id: 3,
        reference: "ORD-Y4YWSTRB1KNP",
        user_id: 19,
        event_id: 1,
        quantity: 1,
        subtotal: "100.00",
        fees: "5.00",
        discount: "0.00",
        total: "105.00",
        currency: "SAR",
        payment_method: "visa",
        payment_status: "approved",
        paid_at: "2026-05-11T16:56:10.000000Z",
        created_at: "2026-05-11T16:56:09.000000Z",
        user: { id: 19, full_name: "Mohamed Ahmed", email: "m@test.com" },
        event: { id: 1, title: "Demo Concert in Riyadh" },
        items: [
          {
            id: 3,
            order_id: 3,
            ticket_type_id: 1,
            quantity: 1,
            unit_price: "100.00",
            subtotal: "100.00",
          },
        ],
        tickets: [
          {
            id: 1,
            code: "TIC-ULQF2UDOBW6EX9",
            price_paid: "100.00",
            status: "active",
            event_title_cache: "Demo Concert in Riyadh",
          },
        ],
      },
    });
    expect(d.buyerLabel).toBe("Mohamed Ahmed");
    expect(d.buyerEmail).toBe("m@test.com");
    expect(d.eventTitle).toBe("Demo Concert in Riyadh");
    expect(d.currency).toBe("SAR");
    expect(d.items).toHaveLength(1);
    expect(d.items![0].unitPriceSar).toBe(100);
    expect(d.tickets).toHaveLength(1);
    expect(d.tickets![0].code).toBe("TIC-ULQF2UDOBW6EX9");
    expect(d.tickets![0].pricePaidSar).toBe(100);
  });
});

describe("mapAdminRefundsFromApi", () => {
  it("maps data.refunds with snake_case", () => {
    const out = mapAdminRefundsFromApi({
      data: {
        refunds: [
          {
            id: "r1",
            refund_status: "pending",
            refund_amount: 88,
            order_id: 12,
            refund_reason: "Changed plans",
            user_email: "x@y.com",
            event_title: "Show",
            created_at: "2026-05-02T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "r1",
      status: "pending",
      amountSar: 88,
      orderId: "12",
      reason: "Changed plans",
      requestedByLabel: "x@y.com",
      eventTitle: "Show",
    });
  });
});

describe("mapAdminRefundRowFromApi", () => {
  it("maps nested refund detail with order, user, event, payment_transaction, and processed status", () => {
    const row = mapAdminRefundRowFromApi({
      data: {
        id: 1,
        order_id: 3,
        payment_transaction_id: 4,
        initiated_by: 1,
        reason: "support_escalation",
        description: null,
        amount: "100.00",
        currency: "SAR",
        status: "processed",
        processed_at: "2026-05-12T11:24:10.000000Z",
        created_at: "2026-05-12T11:24:10.000000Z",
        updated_at: "2026-05-12T11:24:10.000000Z",
        payment_transaction: {
          id: 4,
          gateway: "local",
          gateway_transaction: "CP-GMEP52R5CDALK3OE",
          transaction_type: "capture",
          amount: "105.00",
          currency: "SAR",
          status: "success",
          occurred_at: "2026-05-11T16:56:10.000000Z",
        },
        order: {
          id: 3,
          reference: "ORD-Y4YWSTRB1KNP",
          user_id: 19,
          event_id: 1,
          user: {
            id: 19,
            full_name: "Mohamed Ahmed",
          },
          event: {
            id: 1,
            title: "Demo Concert in Riyadh",
          },
        },
      },
    });
    expect(row).toMatchObject({
      id: "1",
      orderId: "3",
      orderReference: "ORD-Y4YWSTRB1KNP",
      status: "completed",
      amountSar: 100,
      currency: "SAR",
      reason: "support_escalation",
      requestedByLabel: "Mohamed Ahmed",
      eventTitle: "Demo Concert in Riyadh",
      processedAt: "2026-05-12T11:24:10.000000Z",
      paymentTransaction: {
        id: "4",
        gateway: "local",
        gatewayTransaction: "CP-GMEP52R5CDALK3OE",
        amount: 105,
        currency: "SAR",
        status: "success",
        occurredAt: "2026-05-11T16:56:10.000000Z",
      },
    });
    expect(row.description).toBeUndefined();
  });
});

describe("mapRefundBreakdownsFromApi", () => {
  it("maps wrapped breakdown + total", () => {
    const out = mapRefundBreakdownsFromApi({
      data: {
        total_refunded_sar: 500,
        breakdown: [
          { category: "A", refund_count: 2, refunded_sar: 300 },
          { name: "B", n: 1, amount: 200 },
        ],
      },
    });
    expect(out.totalRefundedSar).toBe(500);
    expect(out.rows).toHaveLength(2);
    expect(out.rows[0].label).toBe("A");
    expect(out.rows[0].amountSar).toBe(300);
    expect(out.rows[0].refundCount).toBe(2);
    expect(out.rows[1].amountSar).toBe(200);
  });
});

describe("mapAdminPayoutsFromApi", () => {
  it("maps payouts array with snake_case", () => {
    const out = mapAdminPayoutsFromApi({
      data: {
        payouts: [
          {
            id: 7,
            payout_status: "pending",
            organizer_name: "Org A",
            gross_amount: 1000,
            event_title: "Concert",
            created_at: "2026-06-01T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "7",
      status: "pending",
      organizerName: "Org A",
      amountSar: 1000,
      eventTitle: "Concert",
    });
  });
});

describe("mapAdminAuctionsFromApi", () => {
  it("maps auctions list", () => {
    const out = mapAdminAuctionsFromApi({
      data: {
        auctions: [
          {
            id: "a1",
            title: "Lot 1",
            auction_status: "live",
            organizer_name: "Org",
            highest_bid_sar: 50,
            ends_at: "2026-07-01T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "a1",
      title: "Lot 1",
      status: "live",
      organizerName: "Org",
      highBidSar: 50,
    });
  });

  it("maps Laravel paginated admin auctions with snake_case caches and string amounts", () => {
    const out = mapAdminAuctionsFromApi({
      current_page: 1,
      data: [
        {
          id: 1,
          code: "AUC-TMXTDZFJTC8T",
          event_id: 1,
          ticket_id: 1,
          seller_user_id: 19,
          seller_label: null,
          sold_to_user_id: 19,
          price: "100.00",
          original_price: "100.00",
          sale_price: "100.00",
          commission_pct: "8.00",
          commission_amount: "8.00",
          seller_proceeds: "92.00",
          currency: "SAR",
          status: "sold",
          starts_at: "2026-05-12T01:16:10.000000Z",
          ends_at: "2026-05-14T01:16:10.000000Z",
          sold_at: "2026-05-12T01:59:40.000000Z",
          cancelled_at: null,
          cancellation_reason: null,
          seat_label_cache: null,
          event_title_cache: "Demo Concert in Riyadh",
          city_cache: null,
          venue_cache: null,
          layout_type_cache: null,
          ticket_type_cache: null,
          created_at: "2026-05-12T01:16:10.000000Z",
          updated_at: "2026-05-12T01:59:40.000000Z",
        },
      ],
      per_page: 20,
      total: 1,
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "1",
      title: "Demo Concert in Riyadh",
      status: "sold",
      organizerName: "Seller #19",
      highBidSar: 100,
      endsAt: "2026-05-14T01:16:10.000000Z",
    });
  });
});

describe("mapAdminAuctionDetailFromApi", () => {
  it("maps nested listing detail with event, ticket, parties, and ledger", () => {
    const d = mapAdminAuctionDetailFromApi({
      data: {
        id: 1,
        code: "AUC-TMXTDZFJTC8T",
        event_id: 1,
        ticket_id: 1,
        seller_user_id: 19,
        seller_label: null,
        sold_to_user_id: 19,
        price: "100.00",
        original_price: "100.00",
        sale_price: "100.00",
        commission_pct: "8.00",
        commission_amount: "8.00",
        seller_proceeds: "92.00",
        currency: "SAR",
        status: "sold",
        starts_at: "2026-05-12T01:16:10.000000Z",
        ends_at: "2026-05-14T01:16:10.000000Z",
        sold_at: "2026-05-12T01:59:40.000000Z",
        cancelled_at: null,
        cancellation_reason: null,
        seat_label_cache: null,
        event_title_cache: "Demo Concert in Riyadh",
        city_cache: null,
        venue_cache: null,
        layout_type_cache: null,
        ticket_type_cache: null,
        created_at: "2026-05-12T01:16:10.000000Z",
        updated_at: "2026-05-12T01:59:40.000000Z",
        event: {
          id: 1,
          code: "EVT-DEMO-0001",
          title: "Demo Concert in Riyadh",
          venue_name: "Demo Venue",
          venue_address: "King Fahd Rd, Riyadh",
          starts_at: "2026-05-24T22:37:03.000000Z",
          ends_at: "2026-05-25T01:37:03.000000Z",
          timezone: "Asia/Riyadh",
          status: "published",
          capacity: 500,
        },
        ticket: {
          id: 1,
          code: "TIC-ULQF2UDOBW6EX9",
          order_id: 3,
          order_reference: "ORD-Y4YWSTRB1KNP",
          price_paid: "100.00",
          status: "refunded",
        },
        seller: {
          id: 19,
          email: "mohamedx.28@gmail.com",
          phone: "+9665981265485",
          full_name: "Mohamed Ahmed",
        },
        buyer: {
          id: 19,
          email: "mohamedx.28@gmail.com",
          full_name: "Mohamed Ahmed",
        },
        transactions: [
          {
            id: 1,
            transaction_type: "commission",
            amount: "8.00",
            currency: "SAR",
            occurred_at: "2026-05-12T01:59:40.000000Z",
          },
          {
            id: 2,
            transaction_type: "seller_payout",
            amount: "92.00",
            currency: "SAR",
            occurred_at: "2026-05-12T01:59:40.000000Z",
          },
        ],
      },
    });
    expect(d.id).toBe("1");
    expect(d.listingCode).toBe("AUC-TMXTDZFJTC8T");
    expect(d.organizerName).toBe("Mohamed Ahmed");
    expect(d.eventSummary?.title).toBe("Demo Concert in Riyadh");
    expect(d.eventSummary?.venueName).toBe("Demo Venue");
    expect(d.ticketSummary?.orderId).toBe("3");
    expect(d.ticketSummary?.orderReference).toBe("ORD-Y4YWSTRB1KNP");
    expect(d.seller?.email).toBe("mohamedx.28@gmail.com");
    expect(d.ledgerTransactions).toHaveLength(2);
    expect(d.ledgerTransactions?.[0].transactionType).toBe("commission");
    expect(d.ledgerTransactions?.[0].amount).toBe(8);
    expect(d.commissionAmountSar).toBe(8);
    expect(d.sellerProceedsSar).toBe(92);
  });
});

describe("mapAdminScannersFromApi", () => {
  it("maps wrapped scanners with snake_case", () => {
    const out = mapAdminScannersFromApi({
      data: {
        scanners: [
          {
            id: "s1",
            display_name: "Gate 1",
            scanner_status: "enabled",
            organizer_name: "Org",
            device_label: "T1",
            last_seen_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "s1",
      displayName: "Gate 1",
      status: "active",
      organizerName: "Org",
      deviceLabel: "T1",
      lastSeenAt: "2026-01-01T00:00:00Z",
    });
  });

  it("maps nested organizer and is_active from live API shape", () => {
    const out = mapAdminScannersFromApi({
      data: [
        {
          id: 5,
          code: "SCN-XXXXXXXXXX",
          organizer_profile_id: 1,
          user_id: 42,
          name: "Gate A — Ahmed",
          email: "ahmed.gate@example.com",
          is_active: true,
          last_login_at: null,
          created_at: "2026-05-20T12:00:00+00:00",
          updated_at: "2026-05-20T12:00:00+00:00",
          organizer: {
            id: 1,
            code: "ORG-XXXX",
            slug: "desert-events-co",
            display_name: "Desert Events Co",
            company_name: "Desert Events LLC",
            is_company: true,
            is_active: true,
            user_id: 10,
          },
        },
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "5",
      code: "SCN-XXXXXXXXXX",
      displayName: "Gate A — Ahmed",
      email: "ahmed.gate@example.com",
      status: "active",
      organizerProfileId: "1",
      organizerName: "Desert Events Co",
      organizerCompanyName: "Desert Events LLC",
      organizerCode: "ORG-XXXX",
      organizerSlug: "desert-events-co",
    });
  });

  it("maps is_active false to suspended status", () => {
    const out = mapAdminScannersFromApi({
      data: [{ id: 2, name: "Gate B", is_active: false }],
    });
    expect(out[0]?.status).toBe("suspended");
  });
});

describe("mapAdminHealthFromApi", () => {
  it("maps status and collects unknown keys into extras", () => {
    const out = mapAdminHealthFromApi({
      data: {
        overall: "degraded",
        detail: "Queue slow",
        checked_at: "2026-01-01T00:00:00Z",
        redis_latency_ms: 42,
      },
    });
    expect(out.status).toBe("degraded");
    expect(out.message).toBe("Queue slow");
    expect(out.checkedAt).toBe("2026-01-01T00:00:00Z");
    expect(out.extras?.redis_latency_ms).toBe(42);
  });
});

describe("mapAdminVersionFromApi", () => {
  it("maps version fields and extras", () => {
    const out = mapAdminVersionFromApi({
      data: {
        app_version: "2.0.1",
        git_sha: "deadbeef",
        build_time: "2026-02-02",
        env: "staging",
        php_version: "8.3",
      },
    });
    expect(out.version).toBe("2.0.1");
    expect(out.commit).toBe("deadbeef");
    expect(out.buildDate).toBe("2026-02-02");
    expect(out.environment).toBe("staging");
    expect(out.extras?.php_version).toBe("8.3");
  });
});

describe("mapAdminRecentNotificationsFromApi", () => {
  it("maps notifications wrapper", () => {
    const out = mapAdminRecentNotificationsFromApi({
      data: {
        notifications: [
          {
            id: 9,
            subject: "Hello",
            body: "World",
            via: "email",
            is_read: false,
            created_at: "2026-03-03T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "9",
      title: "Hello",
      body: "World",
      channel: "email",
      read: false,
      createdAt: "2026-03-03T00:00:00Z",
    });
  });

  it("maps Laravel paginator with row-level data payload", () => {
    const out = mapAdminRecentNotificationsFromApi({
      current_page: 1,
      data: [
        {
          id: 46,
          kind: "event_review_required",
          title: "Organizer event requires review",
          body: "Event updated: test",
          href: "/events/18",
          data: { event_id: 18, event_code: "EVT-00000016" },
          is_read: false,
          read_at: null,
          created_at: "2026-05-17T12:58:27.000000Z",
        },
      ],
      total: 46,
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "46",
      title: "Organizer event requires review",
      body: "Event updated: test",
      kind: "event_review_required",
      href: "/events/18",
      read: false,
      createdAt: "2026-05-17T12:58:27.000000Z",
    });
  });

  it("maps kind separately from delivery channel", () => {
    const out = mapAdminRecentNotificationsFromApi({
      data: [
        {
          id: 1,
          kind: "tourism_ad_submitted",
          title: "New tourism ad",
          channel: "in_app",
          href: "/tourism-ads/12",
          is_read: false,
          created_at: "2026-06-14T10:00:00Z",
        },
      ],
    });
    expect(out[0]?.kind).toBe("tourism_ad_submitted");
    expect(out[0]?.channel).toBe("in_app");
  });
});

describe("mapAdminUploadFromApi", () => {
  it("unwraps upload response url", async () => {
    const { mapAdminUploadFromApi } = await import("@/schemas/api/adminMappers");
    const out = mapAdminUploadFromApi({
      data: {
        url: "https://myticket-api.kat-jr.com/storage/tourism/ads/gallery/abc.jpg",
        content_type: "image/jpeg",
        size_bytes: 245000,
      },
    });
    expect(out.url).toContain("abc.jpg");
    expect(out.contentType).toBe("image/jpeg");
    expect(out.sizeBytes).toBe(245000);
  });
});

describe("mapAdminDeliveryLogsFromApi", () => {
  it("maps delivery_log rows", () => {
    const out = mapAdminDeliveryLogsFromApi({
      data: {
        delivery_log: [
          {
            id: "d1",
            transport: "email",
            outcome: "delivered",
            to_email: "u@x.co",
            template_id: "welcome",
            delivered_at: "2026-04-04T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "d1",
      channel: "email",
      status: "sent",
      recipient: "u@x.co",
      templateKey: "welcome",
      sentAt: "2026-04-04T00:00:00Z",
    });
  });
});

describe("mapAdminActionsFromApi", () => {
  it("maps admin_actions wrapper", () => {
    const out = mapAdminActionsFromApi({
      data: {
        admin_actions: [
          { id: 1, action_key: "ping", display_name: "Ping", group: "diag" },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "1",
      actionKey: "ping",
      label: "Ping",
      category: "diag",
    });
  });
});

describe("mapAdminAuditLogsFromApi", () => {
  it("maps audit_logs rows", () => {
    const out = mapAdminAuditLogsFromApi({
      data: {
        audit_logs: [
          {
            id: "a99",
            message: "Role approved",
            created_at: "2026-01-02T00:00:00Z",
            admin_email: "root@example.com",
            subject_type: "role_application",
            subject_id: "ra-1",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "a99",
      summary: "Role approved",
      createdAt: "2026-01-02T00:00:00Z",
      actorLabel: "root@example.com",
      resourceType: "role_application",
      resourceId: "ra-1",
    });
  });
});

describe("mapAdminAuditLogDetailFromApi", () => {
  it("merges IP and changes", () => {
    const out = mapAdminAuditLogDetailFromApi({
      id: "z",
      action: "Update",
      created_at: "2026-02-02T00:00:00Z",
      ip_address: "10.0.0.1",
      diff: { x: 1 },
    });
    expect(out.ip).toBe("10.0.0.1");
    expect(out.changes).toEqual({ x: 1 });
  });
});

describe("mapAdminComplaintsFromApi", () => {
  it("maps complaints list with snake_case", () => {
    const out = mapAdminComplaintsFromApi({
      data: {
        complaints: [
          {
            id: 5,
            subject: "Bad refund",
            complaint_status: "new",
            category_key: "payments",
            reporter_email: "a@b.co",
            target_name: "Event X",
            created_at: "2026-01-05T00:00:00Z",
            updated_at: "2026-01-06T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "5",
      title: "Bad refund",
      status: "open",
      category: "payments",
      reporterLabel: "a@b.co",
      targetLabel: "Event X",
      createdAt: "2026-01-05T00:00:00Z",
      updatedAt: "2026-01-06T00:00:00Z",
    });
  });
});

describe("mapAdminOrganizerKycFromApi", () => {
  it("maps organizer envelope and kyc_documents rows", () => {
    const out = mapAdminOrganizerKycFromApi(
      [
        {
          id: 12,
          document_label: "CR.pdf",
          document_type: "commercial_registration",
          status: "pending",
          created_at: "2026-03-01T00:00:00Z",
          document_url: "https://example.com/cr.pdf",
        },
      ],
      "org-x",
    );
    expect(out.organizerId).toBe("org-x");
    expect(out.organizerName).toBeUndefined();
    expect(out.documents).toHaveLength(1);
    expect(out.documents[0]).toMatchObject({
      id: "12",
      label: "CR.pdf",
      docType: "commercial_registration",
      status: "pending",
      uploadedAt: "2026-03-01T00:00:00Z",
      fileUrl: "https://example.com/cr.pdf",
    });
  });
});

describe("mapAdminScanLogsFromApi", () => {
  it("maps scan_logs wrapper and normalizes outcome", () => {
    const out = mapAdminScanLogsFromApi({
      data: {
        scan_logs: [
          {
            id: 99,
            scanned_at: "2026-02-02T12:00:00Z",
            outcome: "ok",
            ticket_ref: "X-1",
            scanner_label: "S1",
            event_title: "Show",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "99",
      scannedAt: "2026-02-02T12:00:00Z",
      outcome: "valid",
      result: "ok",
      ticketRef: "X-1",
      scannerLabel: "S1",
      eventTitle: "Show",
    });
  });

  it("maps nested scanner, event, and ticket with admin detail paths", () => {
    const out = mapAdminScanLogsFromApi([
      {
        id: 1,
        result: "ok",
        scanned_at: "2026-06-14T12:00:00+00:00",
        scanner: {
          id: 5,
          code: "SCN-GATE",
          name: "Gate A",
          email: "gate@example.com",
          is_active: true,
          organizer_profile_id: 1,
          organizer: {
            id: 1,
            code: "ORG-DESERT",
            slug: "desert-events",
            display_name: "Desert Events Co",
          },
        },
        event: {
          id: 18,
          code: "EVT-SUMMER",
          title: "Summer Festival",
          status: "published",
          detail_href: "https://myticket-admin.kat-jr.com/events/18",
          api_href: "/api/v1/admin/events/18",
        },
        ticket: {
          id: 99,
          code: "TIC-123",
          status: "used",
          order_id: 42,
          seat_label: "A-12",
          type_name: "VIP",
          detail_href: "https://myticket-admin.kat-jr.com/orders/42?ticket=99",
          api_href: "/api/v1/admin/orders/42",
        },
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "1",
      scannedAt: "2026-06-14T12:00:00+00:00",
      outcome: "valid",
      result: "ok",
      scannerId: "5",
      scannerCode: "SCN-GATE",
      scannerName: "Gate A",
      scannerEmail: "gate@example.com",
      organizerProfileId: "1",
      organizerName: "Desert Events Co",
      organizerCode: "ORG-DESERT",
      eventId: "18",
      eventCode: "EVT-SUMMER",
      eventTitle: "Summer Festival",
      eventStatus: "published",
      eventDetailPath: "/events/18",
      ticketId: "99",
      ticketCode: "TIC-123",
      ticketRef: "TIC-123",
      ticketStatus: "used",
      ticketOrderId: "42",
      ticketSeatLabel: "A-12",
      ticketTypeName: "VIP",
      ticketDetailPath: "/orders/42?ticket=99",
    });
  });
});

describe("mapAdminProfileDirectoryFromApi", () => {
  it("maps Laravel paginator with data[] and snake_case vendor row", () => {
    const out = mapAdminProfileDirectoryFromApi({
      current_page: 1,
      data: [
        {
          id: 1,
          user_id: 5,
          slug: "demo-premium-vendor",
          business_name: "Demo Premium Vendor",
          bio: "Seeded catering and AV vendor.",
          coverage_area: "Riyadh & Eastern Province",
          profile_image_url: null,
          website_url: null,
          instagram_handle: "demovendor",
          availability_status: "available",
          rating_average: "4.60",
          rating_count: 8,
          completed_bookings: 5,
          is_active: 1,
          updated_at: "2026-05-10T22:37:03.000000Z",
        },
      ],
      total: 1,
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "1",
      displayName: "Demo Premium Vendor",
      slug: "demo-premium-vendor",
      linkedUserId: "5",
      status: "available",
      bio: "Seeded catering and AV vendor.",
      coverageArea: "Riyadh & Eastern Province",
      instagramHandle: "demovendor",
      ratingAverage: 4.6,
      completedBookings: 5,
      updatedAt: "2026-05-10T22:37:03.000000Z",
    });
  });

  it("maps wrapped vendors array with snake_case fields", () => {
    const out = mapAdminProfileDirectoryFromApi({
      data: {
        vendors: [
          {
            id: 1,
            business_name: "Acme Booths",
            contact_email: "hi@acme.example",
            slug: "acme-booths",
            city: "Riyadh",
            country: "SA",
            review_status: "pending",
            updated_at: "2026-01-02T00:00:00Z",
          },
        ],
      },
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "1",
      displayName: "Acme Booths",
      email: "hi@acme.example",
      slug: "acme-booths",
      city: "Riyadh",
      country: "SA",
      status: "pending",
      updatedAt: "2026-01-02T00:00:00Z",
    });
  });
});

describe("mapAdminProfileDirectoryRowFromApi", () => {
  it("falls back to slug-based display name when name missing", () => {
    const row = mapAdminProfileDirectoryRowFromApi({
      slug: "cool-events",
      id: "",
    });
    expect(row.displayName).toBe("cool events");
    expect(row.id).toBe("cool-events");
  });
});

describe("mapFinancialAnalyticsFromApi", () => {
  it("maps snake_case financial payload", () => {
    const f = mapFinancialAnalyticsFromApi({
      data: {
        total_revenue_sar: 100,
        platform_fees_sar: 10,
        refunds_sar: 2,
        payouts_pending_sar: 5,
        revenue_by_day: [{ date: "2026-01-01", revenue_sar: 50 }],
        revenue_breakdown_by_category: [
          { category_key: "music", label: "Music", revenue_sar: 40 },
        ],
      },
    });
    expect(f.totalRevenueSar).toBe(100);
    expect(f.revenueByDay).toHaveLength(1);
    expect(f.revenueBreakdownByCategory?.[0]?.categoryKey).toBe("music");
  });

  it("maps handoff financial summary fields and empty series", () => {
    const f = mapFinancialAnalyticsFromApi({
      data: {
        range: "24h",
        since: "2026-05-08T00:00:00Z",
        orders_paid_total_amount: 500,
        refunds_processed_total_amount: 20,
        orders_paid_count: 3,
      },
    });
    expect(f.range).toBe("24h");
    expect(f.since).toBe("2026-05-08T00:00:00Z");
    expect(f.ordersPaidTotalAmount).toBe(500);
    expect(f.refundsProcessedTotalAmount).toBe(20);
    expect(f.ordersPaidCount).toBe(3);
    expect(f.revenueByDay).toEqual([]);
    expect(f.revenueBreakdownByCategory).toEqual([]);
  });
});

describe("mapLeaderboardsFromApi", () => {
  it("maps GMV events and organizers", () => {
    const lb = mapLeaderboardsFromApi({
      data: {
        events: [
          {
            id: 1,
            code: "E1",
            title: "Gig",
            revenue_gross: "120.50",
            status: "published",
            organizer_id: 9,
          },
        ],
        organizers: [
          {
            organizer_id: 9,
            total_revenue_gross: 120.5,
            display_name: "Org",
            slug: "org",
            code: "O9",
          },
        ],
        generated_at: "2026-05-09T12:00:00Z",
      },
    });
    expect(lb.events[0].title).toBe("Gig");
    expect(lb.events[0].revenueGross).toBe("120.50");
    expect(lb.organizers[0].displayName).toBe("Org");
    expect(lb.generatedAt).toBe("2026-05-09T12:00:00Z");
  });

  it("unwraps nested data.data leaderboards envelope", () => {
    const lb = mapLeaderboardsFromApi({
      data: {
        data: {
          events: [
            {
              id: 7,
              code: "EVT-7",
              title: "Winter Market",
              revenue_gross: "0.00",
              status: "published",
              organizer_id: 1,
            },
          ],
          organizers: [],
          generated_at: "2026-05-12T12:18:16+00:00",
        },
      },
    });
    expect(lb.events).toHaveLength(1);
    expect(lb.events[0].id).toBe("7");
    expect(lb.events[0].code).toBe("EVT-7");
    expect(lb.organizers).toHaveLength(0);
    expect(lb.generatedAt).toBe("2026-05-12T12:18:16+00:00");
  });
});

describe("mapTourismAdsListFromApi / mapTourismAdFromApi", () => {
  it("unwraps nested paginator data.data and maps snake_case fields", () => {
    const result = mapTourismAdsListFromApi({
      data: {
        current_page: 2,
        per_page: 10,
        total: 25,
        data: [
          {
            id: 12,
            user_id: 42,
            source: "guest",
            status: "pending_review",
            location_name: "Red Sea Coral Bay",
            latitude: "22.5960000",
            longitude: "39.1180000",
            description: "Guided snorkeling along the reef with certified marine guides.",
            opening_hours: {
              mon: { closed: false, opens: "09:00", closes: "18:00" },
              tue: { closed: false, opens: "09:00", closes: "18:00" },
              wed: { closed: false, opens: "09:00", closes: "18:00" },
              thu: { closed: false, opens: "09:00", closes: "18:00" },
              fri: { closed: false, opens: "14:00", closes: "22:00" },
              sat: { closed: false, opens: "09:00", closes: "22:00" },
              sun: { closed: true },
            },
            services: ["snorkeling", "boat trips"],
            contact: { phone: "+966500000001", email: "reef@example.com" },
            media_links: [{ platform: "instagram", url: "https://instagram.com/reef" }],
            gallery_urls: ["https://cdn.example/reef.jpg"],
            cover_image_url: "https://cdn.example/reef.jpg",
            is_pinned: false,
            submitted_at: "2026-06-14T09:00:00+00:00",
            created_at: "2026-06-14T08:30:00+00:00",
            updated_at: "2026-06-14T09:00:00+00:00",
            user: { id: 42, full_name: "Layla Al-Harbi", email: "layla@example.com" },
          },
        ],
      },
    });
    expect(result.currentPage).toBe(2);
    expect(result.perPage).toBe(10);
    expect(result.total).toBe(25);
    expect(result.items).toHaveLength(1);
    const ad = result.items[0];
    expect(ad.id).toBe("12");
    expect(ad.userId).toBe("42");
    expect(ad.status).toBe("pending_review");
    expect(ad.locationName).toBe("Red Sea Coral Bay");
    expect(ad.openingHours.mon.opens).toBe("09:00");
    expect(ad.openingHours.sun.closed).toBe(true);
    expect(ad.user?.fullName).toBe("Layla Al-Harbi");
    expect(ad.galleryUrls[0]).toBe("https://cdn.example/reef.jpg");
  });

  it("mapTourismAdFromApi maps published carousel fields", () => {
    const ad = mapTourismAdFromApi({
      id: 8,
      source: "admin",
      status: "published",
      location_name: "Riyadh Pavilion",
      latitude: 24.7136,
      longitude: 46.6753,
      description: "Season pavilion with dining and family activities for visitors.",
      opening_hours: {
        mon: { closed: false, opens: "10:00", closes: "22:00" },
        tue: { closed: false, opens: "10:00", closes: "22:00" },
        wed: { closed: false, opens: "10:00", closes: "22:00" },
        thu: { closed: false, opens: "10:00", closes: "22:00" },
        fri: { closed: false, opens: "14:00", closes: "23:00" },
        sat: { closed: false, opens: "10:00", closes: "23:00" },
        sun: { closed: false, opens: "10:00", closes: "22:00" },
      },
      services: ["dining"],
      contact: { email: "pavilion@example.com" },
      media_links: [],
      gallery_urls: ["https://cdn.example/pavilion.jpg"],
      is_pinned: true,
      carousel_position: 0,
      published_at: "2026-06-01T10:00:00+00:00",
      created_at: "2026-06-01T10:00:00+00:00",
      updated_at: "2026-06-01T10:00:00+00:00",
    });
    expect(ad.isPinned).toBe(true);
    expect(ad.carouselPosition).toBe(0);
    expect(ad.latitude).toBe("24.7136");
  });

  it("mapTourismAdsFromApi accepts a plain array", () => {
    const items = mapTourismAdsFromApi([
      {
        id: "ta-1",
        source: "guest",
        status: "draft",
        location_name: "Test Spot",
        latitude: "0",
        longitude: "0",
        description: "Draft listing for mapper coverage with enough characters here.",
        opening_hours: {
          mon: { closed: true },
          tue: { closed: true },
          wed: { closed: true },
          thu: { closed: true },
          fri: { closed: true },
          sat: { closed: true },
          sun: { closed: true },
        },
        services: ["tours"],
        contact: { phone: "+966500000000" },
        media_links: [],
        gallery_urls: ["https://cdn.example/1.jpg"],
        is_pinned: false,
        created_at: "2026-06-01T00:00:00Z",
        updated_at: "2026-06-01T00:00:00Z",
      },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe("draft");
  });
});
