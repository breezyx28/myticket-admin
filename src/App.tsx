import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminShell } from "@/layouts/AdminShell";
import { AccessDeniedPage } from "@/pages/auth/AccessDeniedPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { DashboardHomePage } from "@/pages/dashboard/DashboardHomePage";
import { RoleApplicationDetailPage } from "@/pages/approvals/RoleApplicationDetailPage";
import { RoleApplicationsPage } from "@/pages/approvals/RoleApplicationsPage";
import { TalentApprovalDetailPage } from "@/pages/approvals/TalentApprovalDetailPage";
import { OrganizerProfileDetailPage } from "@/pages/approvals/OrganizerProfileDetailPage";
import { VendorProfileDetailPage } from "@/pages/approvals/VendorProfileDetailPage";
import {
  OrganizerProfilesPage,
  VendorProfilesPage,
} from "@/pages/approvals/ProfileDirectoriesPage";
import { TalentApprovalsPage } from "@/pages/approvals/TalentApprovalsPage";
import { UserDetailPage } from "@/pages/users/UserDetailPage";
import { OrderDetailPage } from "@/pages/orders/OrderDetailPage";
import { OrdersListPage } from "@/pages/orders/OrdersListPage";
import { RefundDetailPage } from "@/pages/refunds/RefundDetailPage";
import { RefundsListPage } from "@/pages/refunds/RefundsListPage";
import { UsersPage } from "@/pages/users/UsersPage";
import {
  CategoriesHubPage,
  CategoriesLegacyRedirect,
} from '@/pages/categories/CategoriesHubPage';
import { EventDetailPage } from '@/pages/events/EventDetailPage';
import { EventsListPage } from "@/pages/events/EventsListPage";
import { FeaturedEventsPage } from "@/pages/events/FeaturedEventsPage";
import { AdminProfilePage } from "@/pages/profile/AdminProfilePage";
import { FeesPage } from "@/pages/settings/FeesPage";
import { NotificationsPage } from "@/pages/settings/NotificationsPage";
import { SystemStatusPage } from "@/pages/settings/SystemStatusPage";
import { PayoutsPage } from "@/pages/settings/PayoutsPage";
import { FinanceCompliancePage } from "@/pages/settings/FinanceCompliancePage";
import { RefundBreakdownsPage } from "@/pages/settings/RefundBreakdownsPage";
import { AuctionDetailPage } from "@/pages/auctions/AuctionDetailPage";
import { AuctionsListPage } from "@/pages/auctions/AuctionsListPage";
import { ScannersPage } from "@/pages/scanners/ScannersPage";
import { ActivityAuditPage } from "@/pages/activity/ActivityAuditPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { ListingsPage } from "@/pages/moderation/ListingsPage";
import { RatingsPage } from "@/pages/moderation/RatingsPage";
import { ComplaintsPage } from "@/pages/complaints/ComplaintsPage";
import { TourismAdCreatePage } from "@/pages/tourism-ads/TourismAdCreatePage";
import { TourismAdDetailPage } from "@/pages/tourism-ads/TourismAdDetailPage";
import { TourismAdEditPage } from "@/pages/tourism-ads/TourismAdEditPage";
import { TourismAdsPage } from "@/pages/tourism-ads/TourismAdsPage";
import { SupportInboxPage } from "@/pages/support/SupportInboxPage";
import { SupportThreadPage } from "@/pages/support/SupportThreadPage";
import { Navigate, Route, Routes } from "react-router-dom";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route element={<RequireAdmin />}>
          <Route element={<AdminShell />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="approvals/roles" element={<RoleApplicationsPage />} />
            <Route
              path="approvals/roles/:id"
              element={<RoleApplicationDetailPage />}
            />
            <Route path="approvals/talent" element={<TalentApprovalsPage />} />
            <Route
              path="approvals/talent/:id"
              element={<TalentApprovalDetailPage />}
            />
            <Route path="approvals/vendors" element={<VendorProfilesPage />} />
            <Route
              path="approvals/vendors/:id"
              element={<VendorProfileDetailPage />}
            />
            <Route
              path="approvals/organizers"
              element={<OrganizerProfilesPage />}
            />
            <Route
              path="approvals/organizers/:id"
              element={<OrganizerProfileDetailPage />}
            />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="refunds" element={<RefundsListPage />} />
            <Route path="refunds/:id" element={<RefundDetailPage />} />
            <Route path="auctions" element={<AuctionsListPage />} />
            <Route path="auctions/:id" element={<AuctionDetailPage />} />
            <Route path="scanners" element={<ScannersPage />} />
            <Route path="events" element={<EventsListPage />} />
            <Route path="categories" element={<CategoriesHubPage />} />
            <Route path="events/categories" element={<CategoriesLegacyRedirect />} />
            <Route path="events/featured" element={<FeaturedEventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="settings/fees" element={<FeesPage />} />
            <Route
              path="settings/refund-breakdowns"
              element={<RefundBreakdownsPage />}
            />
            <Route path="settings/payouts" element={<PayoutsPage />} />
            <Route
              path="settings/finance-compliance"
              element={<FinanceCompliancePage />}
            />
            <Route
              path="settings/notifications"
              element={<NotificationsPage />}
            />
            <Route path="settings/system" element={<SystemStatusPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="activity" element={<ActivityAuditPage />} />
            <Route path="moderation/listings" element={<ListingsPage />} />
            <Route path="moderation/ratings" element={<RatingsPage />} />
            <Route path="support" element={<SupportInboxPage />} />
            <Route path="support/:id" element={<SupportThreadPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="tourism-ads" element={<TourismAdsPage />} />
            <Route path="tourism-ads/new" element={<TourismAdCreatePage />} />
            <Route path="tourism-ads/:id/edit" element={<TourismAdEditPage />} />
            <Route path="tourism-ads/:id" element={<TourismAdDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
