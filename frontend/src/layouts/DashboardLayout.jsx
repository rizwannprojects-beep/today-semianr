import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  FileText,
  BookmarkCheck,
  PackageCheck,
  Sparkles,
  Bell,
  User,
  ShieldAlert,
  Users,
  Package,
  RotateCcw,
  AlertOctagon,
  Megaphone,
  Activity,
  Layers,
  BarChart3,
  Printer,
  MapPin,
  Award
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import useAuth from '../hooks/useAuth.js';
import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService.js';

export const DashboardLayout = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        const count = res?.data?.data?.unreadCount ?? res?.data?.unreadCount ?? 0;
        setUnreadCount(count);
      } catch (_) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 whitespace-nowrap ${
      isActive
        ? 'bg-[#E0F2F1] text-[#00695C] font-bold border-l-4 border-[#00695C] shadow-2xs'
        : 'text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] font-medium'
    }`;

  const adminNavItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 whitespace-nowrap ${
      isActive
        ? 'bg-[#E0F2F1] text-[#00695C] font-bold border-l-4 border-[#00695C] shadow-2xs'
        : 'text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] font-medium'
    }`;

  const displayName = user?.fullName || user?.name || 'Campus Student';
  const roleDisplay = user?.role === 'admin' ? 'Administrator' : user?.role === 'superadmin' ? 'Superadmin' : user?.department || 'Student';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC] text-[#16324F]">
      <Navbar />

      <div className="flex-1 app-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Student / Admin Mini Profile Card */}
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] font-bold text-lg shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#16324F] text-sm truncate">
                    {displayName}
                  </h3>
                  <p className="text-xs text-[#526579] truncate mt-0.5">{user?.email}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${
                    isAdmin
                      ? 'bg-[#FFF3E0] text-[#D84315] border-[#FFE0B2]'
                      : 'bg-[#E0F2F1] text-[#00695C] border-[#B2DFDB]'
                  }`}>
                    {roleDisplay}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Control Center Navigation (Strictly for admins) */}
            {isAdmin && (
              <div className="bg-white border border-[#D9E2E8] rounded-xl p-3.5 space-y-3 shadow-xs">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00695C] flex items-center gap-1.5 border-b border-[#D9E2E8]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF9800]" /> Admin Control Center
                </div>

                {/* Dashboard */}
                <div>
                  <NavLink to="/admin" end className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-4 h-4 text-[#00695C]" />
                    </div>
                    <span>Control Console</span>
                  </NavLink>
                </div>

                {/* Management Section */}
                <div className="space-y-0.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                    Management
                  </div>
                  <NavLink to="/admin/users" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-[#1976D2]" />
                    </div>
                    <span>Users Directory</span>
                  </NavLink>
                  <NavLink to="/admin/lost-items" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[#D32F2F]" />
                    </div>
                    <span>Lost Property</span>
                  </NavLink>
                  <NavLink to="/admin/found-items" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <PackageCheck className="w-4 h-4 text-[#2E7D32]" />
                    </div>
                    <span>Found Custody</span>
                  </NavLink>
                  <NavLink to="/admin/claims" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <BookmarkCheck className="w-4 h-4 text-[#2E7D32]" />
                    </div>
                    <span>Claims Review Desk</span>
                  </NavLink>
                  <NavLink to="/admin/matches" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#FF9800]" />
                    </div>
                    <span>Smart Matches</span>
                  </NavLink>
                  <NavLink to="/admin/returns" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-4 h-4 text-[#00897B]" />
                    </div>
                    <span>Returns &amp; Disputes</span>
                  </NavLink>
                </div>

                {/* Moderation Section */}
                <div className="space-y-0.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                    Moderation
                  </div>
                  <NavLink to="/admin/reports" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <AlertOctagon className="w-4 h-4 text-[#FF9800]" />
                    </div>
                    <span>Content Flags / Reports</span>
                  </NavLink>
                </div>

                {/* Communication Section */}
                <div className="space-y-0.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                    Communication
                  </div>
                  <NavLink to="/admin/announcements" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4 text-[#FF9800]" />
                    </div>
                    <span>Broadcast Notices</span>
                  </NavLink>
                  <NavLink to="/admin/notifications" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-[#D32F2F]" />
                    </div>
                    <span>System Alerts</span>
                  </NavLink>
                </div>

                {/* Security & Audit Section */}
                <div className="space-y-0.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                    Security &amp; Logs
                  </div>
                  <NavLink to="/admin/audit-logs" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-[#1976D2]" />
                    </div>
                    <span>Audit Ledger</span>
                  </NavLink>
                </div>

                {/* Intelligence & Analytics Section */}
                <div className="space-y-0.5">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                    Intelligence
                  </div>
                  <NavLink to="/admin/analytics" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4 text-[#00695C]" />
                    </div>
                    <span>Analytics Console</span>
                  </NavLink>
                  <NavLink to="/admin/analytics/report" className={adminNavItemClass}>
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Printer className="w-4 h-4 text-[#00897B]" />
                    </div>
                    <span>Printable Report</span>
                  </NavLink>
                </div>
              </div>
            )}

            {/* Student Services Menu */}
            <nav className="bg-white border border-[#D9E2E8] rounded-xl p-3.5 space-y-1 shadow-xs">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#526579] flex items-center gap-1.5 border-b border-[#D9E2E8] mb-1.5">
                Student Services
              </div>
              <NavLink to="/dashboard" end className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-4 h-4 text-[#00695C]" />
                </div>
                <span>Dashboard Overview</span>
              </NavLink>
              <NavLink to="/report-lost" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-4 h-4 text-[#D32F2F]" />
                </div>
                <span>Report Lost Item</span>
              </NavLink>
              <NavLink to="/report-found" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <span>Report Found Item</span>
              </NavLink>
              <NavLink to="/my-reports" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#00695C]" />
                </div>
                <span>My Reports</span>
              </NavLink>
              <NavLink to="/my-claims" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-4 h-4 text-[#FF9800]" />
                </div>
                <span>My Claims</span>
              </NavLink>
              <NavLink to="/my-returns" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <span>My Returns</span>
              </NavLink>
              <NavLink to="/matches" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#FF9800]" />
                </div>
                <span>Possible Matches</span>
              </NavLink>
              <NavLink to="/notifications" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-[#00897B]" />
                </div>
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF9800] text-white">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
              <NavLink to="/campus-map" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#00695C]" />
                </div>
                <span>Campus Map &amp; Heatmap</span>
              </NavLink>
              <NavLink to="/honor-wall" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-[#FF9800]" />
                </div>
                <span>Honor Wall &amp; Karma</span>
              </NavLink>
              <NavLink to="/profile" className={navItemClass}>
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#526579]" />
                </div>
                <span>Identity Profile</span>
              </NavLink>
            </nav>
          </aside>

          {/* Main Workspace */}
          <main className="lg:col-span-3 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
