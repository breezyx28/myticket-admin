import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminShell } from '@/layouts/AdminShell';
import { AccessDeniedPage } from '@/pages/auth/AccessDeniedPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage';
import { RoleApplicationDetailPage } from '@/pages/approvals/RoleApplicationDetailPage';
import { RoleApplicationsPage } from '@/pages/approvals/RoleApplicationsPage';
import { TalentApprovalDetailPage } from '@/pages/approvals/TalentApprovalDetailPage';
import { TalentApprovalsPage } from '@/pages/approvals/TalentApprovalsPage';
import { UserDetailPage } from '@/pages/users/UserDetailPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { EventCancellationPage } from '@/pages/events/EventCancellationPage';
import { EventCategoriesPage } from '@/pages/events/EventCategoriesPage';
import { EventDetailPage } from '@/pages/events/EventDetailPage';
import { EventsListPage } from '@/pages/events/EventsListPage';
import { FeaturedEventsPage } from '@/pages/events/FeaturedEventsPage';
import { AdminProfilePage } from '@/pages/profile/AdminProfilePage';
import { FeesPage } from '@/pages/settings/FeesPage';
import { NotificationsPage } from '@/pages/settings/NotificationsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { ListingsPage } from '@/pages/moderation/ListingsPage';
import { RatingsPage } from '@/pages/moderation/RatingsPage';
import { SupportInboxPage } from '@/pages/support/SupportInboxPage';
import { SupportThreadPage } from '@/pages/support/SupportThreadPage';
import { Navigate, Route, Routes } from 'react-router-dom';

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
            <Route path="approvals/roles/:id" element={<RoleApplicationDetailPage />} />
            <Route path="approvals/talent" element={<TalentApprovalsPage />} />
            <Route path="approvals/talent/:id" element={<TalentApprovalDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="events" element={<EventsListPage />} />
            <Route path="events/categories" element={<EventCategoriesPage />} />
            <Route path="events/featured" element={<FeaturedEventsPage />} />
            <Route path="events/cancellations" element={<EventCancellationPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="settings/fees" element={<FeesPage />} />
            <Route path="settings/notifications" element={<NotificationsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="moderation/listings" element={<ListingsPage />} />
            <Route path="moderation/ratings" element={<RatingsPage />} />
            <Route path="support" element={<SupportInboxPage />} />
            <Route path="support/:id" element={<SupportThreadPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
