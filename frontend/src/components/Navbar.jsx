import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  PlusCircle,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Bell,
  LayoutDashboard
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from './Button.jsx';
import notificationService from '../services/notificationService.js';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        const count = res?.data?.data?.unreadCount ?? res?.data?.unreadCount ?? 0;
        setUnreadCount(count);
      } catch (_) {}
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 ${
      isActive
        ? 'text-[#00695C] bg-[#E0F2F1] font-bold shadow-2xs'
        : 'text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6]'
    }`;

  const displayName = user?.fullName || user?.name || 'Arjun';
  const firstName = displayName.split(' ')[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D9E2E8] bg-white shadow-2xs">
      <div className="app-container">
        <div className="flex items-center justify-between h-[76px]">
          {/* SECTION 1 - LEFT: Logo + Brand Name */}
          <div className="flex items-center shrink-0 mr-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                <Compass className="w-5 h-5 text-[#00695C]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-[#16324F] text-base leading-tight tracking-tight group-hover:text-[#00695C] transition-colors whitespace-nowrap">
                  Campus <span className="text-[#00695C]">Lost &amp; Found</span>
                </span>
                <span className="text-[10px] text-[#526579] font-bold tracking-wider uppercase whitespace-nowrap mt-0.5">
                  Official Item Recovery
                </span>
              </div>
            </Link>
          </div>

          {/* SECTION 2 - CENTER: Main Navigation */}
          <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/browse-lost" className={navLinkClass}>
              Browse Lost
            </NavLink>
            <NavLink to="/browse-found" className={navLinkClass}>
              Browse Found
            </NavLink>
            <NavLink to="/guidelines" className={navLinkClass}>
              How It Works
            </NavLink>
            <NavLink to="/campus-map" className={navLinkClass}>
              Campus Map
            </NavLink>
            <NavLink to="/honor-wall" className={navLinkClass}>
              Honor Wall
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact Desk
            </NavLink>
          </nav>

          {/* SECTION 3 - RIGHT: Action Area */}
          <div className="hidden xl:flex items-center gap-2.5 shrink-0 ml-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-[#00695C] bg-[#E0F2F1] hover:bg-[#b2dfdb] transition-colors shadow-2xs whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                <Link
                  to="/report-lost"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFF3E0] border border-[#FFE0B2] text-[#D84315] hover:bg-[#FFE0B2] transition-colors shadow-2xs whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Report Lost
                </Link>

                <Link
                  to="/report-found"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] hover:bg-[#B2DFDB] transition-colors shadow-2xs whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Report Found
                </Link>

                <Link
                  to="/notifications"
                  className="p-2 text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] rounded-lg transition-colors relative shrink-0"
                  title="Notifications"
                  aria-label={`Notifications, ${unreadCount} unread`}
                >
                  <Bell className="w-4 h-4 text-[#526579]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#FF9800] text-white font-bold text-[10px] rounded-full flex items-center justify-center leading-none shadow-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#FFF3E0] border border-[#FFE0B2] text-[#D84315] hover:bg-[#FFE0B2] transition-colors shadow-2xs whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}

                <div className="h-5 w-[1px] bg-[#D9E2E8]" />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#D9E2E8] bg-white hover:border-[#00897B] hover:bg-[#F0F7F6] transition-all shadow-2xs whitespace-nowrap"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] text-xs font-bold shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs text-[#16324F] leading-tight">
                    {firstName}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#526579] hover:text-[#D32F2F] hover:bg-[#FFEBEE] rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/browse-found"
                  className="p-2 text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] rounded-lg transition-colors"
                  title="Search Items"
                >
                  <Search className="w-4 h-4" />
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="accent" size="sm">
                    Join Campus
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile / Tablet Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="p-2 text-[#526579] hover:text-[#00695C] rounded-lg relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-[#526579]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-[#FF9800] text-white font-bold text-[9px] rounded-full flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#16324F] hover:bg-[#F0F7F6] border border-[#D9E2E8]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#D9E2E8] bg-white px-4 pt-3 pb-5 space-y-2 shadow-md">
          <div className="space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              Home
            </NavLink>
            <NavLink
              to="/browse-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              Browse Lost Items
            </NavLink>
            <NavLink
              to="/browse-found"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              Browse Found Items
            </NavLink>
            <NavLink
              to="/guidelines"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              How It Works
            </NavLink>
            <NavLink
              to="/campus-map"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              Campus Map &amp; Heatmap
            </NavLink>
            <NavLink
              to="/honor-wall"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              Honor Wall &amp; Karma
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
            >
              Contact Desk
            </NavLink>
          </div>

          <div className="pt-3 border-t border-[#D9E2E8]">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-[#F7FAFC] rounded-lg border border-[#D9E2E8]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#E0F2F1] text-[#00695C] font-bold flex items-center justify-center text-xs">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#16324F]">{displayName}</p>
                      <p className="text-[10px] text-[#526579]">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-[#00695C] hover:underline"
                  >
                    Profile
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#00695C] bg-[#E0F2F1] border border-[#B2DFDB]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#16324F] bg-[#F7FAFC] border border-[#D9E2E8]"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#FF9800]" />
                    Alerts ({unreadCount})
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/report-lost"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#D84315] bg-[#FFF3E0] border border-[#FFE0B2]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Report Lost
                  </Link>
                  <Link
                    to="/report-found"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#00695C] bg-[#E0F2F1] border border-[#B2DFDB]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Report Found
                  </Link>
                </div>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-3 py-2 rounded-lg text-xs font-bold text-[#D84315] bg-[#FFF3E0] border border-[#FFE0B2]"
                  >
                    Admin Control Console
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#D32F2F] hover:bg-[#FFEBEE] border border-[#FFCDD2] transition-colors cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="accent" size="sm" className="w-full">
                    Join Campus
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
