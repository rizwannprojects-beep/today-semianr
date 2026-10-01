import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Route Guards
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AdminRoute from '../components/AdminRoute.jsx';

// Pages - Public
import Home from '../pages/Home.jsx';
import BrowseLost from '../pages/BrowseLost.jsx';
import BrowseFound from '../pages/BrowseFound.jsx';
import ItemDetails from '../pages/ItemDetails.jsx';
import Guidelines from '../pages/Guidelines.jsx';
import Contact from '../pages/Contact.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import NotFound from '../pages/NotFound.jsx';

// Pages - Authenticated Student
import Dashboard from '../pages/Dashboard.jsx';
import ReportLost from '../pages/ReportLost.jsx';
import ReportFound from '../pages/ReportFound.jsx';
import MyReports from '../pages/MyReports.jsx';
import MyClaims from '../pages/MyClaims.jsx';
import MyReturns from '../pages/MyReturns.jsx';
import ReturnHandover from '../pages/ReturnHandover.jsx';
import Matches from '../pages/Matches.jsx';
import Notifications from '../pages/Notifications.jsx';
import NotificationPreferences from '../pages/NotificationPreferences.jsx';
import Profile from '../pages/Profile.jsx';

// Pages - Authenticated Administrator (Phase 7 Control Center)
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminItems from '../pages/admin/AdminItems.jsx';
import AdminClaims from '../pages/admin/AdminClaims.jsx';
import AdminMatches from '../pages/admin/AdminMatches.jsx';
import AdminReturns from '../pages/admin/AdminReturns.jsx';
import AdminReports from '../pages/admin/AdminReports.jsx';
import AdminAnnouncements from '../pages/admin/AdminAnnouncements.jsx';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs.jsx';
import AdminNotifications from '../pages/admin/AdminNotifications.jsx';
import AdminAnalytics from '../pages/admin/AdminAnalytics.jsx';
import AdminAnalyticsReport from '../pages/admin/AdminAnalyticsReport.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseLost />} />
        <Route path="/browse-lost" element={<BrowseLost />} />
        <Route path="/browse/lost" element={<BrowseLost />} />
        <Route path="/browse-found" element={<BrowseFound />} />
        <Route path="/browse/found" element={<BrowseFound />} />
        <Route path="/item/:type/:id" element={<ItemDetails />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/how-it-works" element={<Guidelines />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Authenticated Student Pages guarded by ProtectedRoute */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-lost" element={<ReportLost />} />
        <Route path="/report-found" element={<ReportFound />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/my-returns" element={<MyReturns />} />
        <Route path="/return/:returnId" element={<ReturnHandover />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings/notifications" element={<NotificationPreferences />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Authenticated Administrator Pages guarded by AdminRoute (Phase 7) */}
      <Route
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUsers />} />
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/lost-items" element={<AdminItems />} />
        <Route path="/admin/found-items" element={<AdminItems />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/admin/claims/:id" element={<AdminClaims />} />
        <Route path="/admin/matches" element={<AdminMatches />} />
        <Route path="/admin/returns" element={<AdminReturns />} />
        <Route path="/admin/disputes" element={<AdminReturns />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/security-events" element={<AdminAuditLogs />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/analytics/report" element={<AdminAnalyticsReport />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
