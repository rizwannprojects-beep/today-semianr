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
  Bell
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
    `px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
      isActive
        ? 'text-[#00695C] bg-[#E0F2F1] font-bold shadow-2xs'
        : 'text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D9E2E8] bg-white shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] group-hover:scale-105 transition-transform shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#16324F] text-base leading-tight tracking-tight group-hover:text-[#00695C] transition-colors">
                  Campus <span className="text-[#00695C]">Lost &amp; Found</span>
                </span>
                <span className="text-[10px] text-[#526579] font-semibold tracking-wide uppercase">
                  Official Item Recovery
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
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
            <NavLink to="/contact" className={navLinkClass}>
              Contact Desk
            </NavLink>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 text-xs font-bold rounded-lg text-[#00695C] bg-[#E0F2F1] hover:bg-[#b2dfdb] transition-colors shadow-xs"
                >
                  Dashboard
                </Link>
                <Link
                  to="/report-lost"
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#FFF3E0] border border-[#FFE0B2] text-[#D84315] hover:bg-[#FFE0B2] transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Lost
                </Link>
                <Link
                  to="/report-found"
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] hover:bg-[#B2DFDB] transition-colors shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Found
                </Link>

                <Link
                  to="/notifications"
                  className="p-2 text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] rounded-lg transition-colors relative"
                  title="Notifications"
                  aria-label={`Notifications, ${unreadCount} unread`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#FF9800] text-white font-bold text-[10px] rounded-full flex items-center justify-center leading-none shadow-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="h-5 w-[1px] bg-[#D9E2E8]" />

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] hover:bg-[#B2DFDB] transition-colors shadow-xs"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#D9E2E8] bg-white hover:border-[#00897B] hover:bg-[#F0F7F6] transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] text-xs font-bold">
                    {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-[#16324F] leading-tight">
                      {(user?.fullName || user?.name || 'Arjun').split(' ')[0]}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#526579] hover:text-[#D32F2F] hover:bg-[#FFEBEE] rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/browse-lost"
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D9E2E8] bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          <NavLink
            to="/browse-lost"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
          >
            Browse Lost Items
          </NavLink>
          <NavLink
            to="/browse-found"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
          >
            Browse Found Items
          </NavLink>
          <NavLink
            to="/guidelines"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
          >
            Campus Guidelines
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
          >
            Contact Desk
          </NavLink>

          <div className="pt-2 border-t border-[#D9E2E8]">
            {isAuthenticated ? (
              <div className="space-y-1">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-bold text-[#00695C] bg-[#E0F2F1] border border-[#B2DFDB]"
                  >
                    Admin Console
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold text-[#00695C] hover:bg-[#F0F7F6]"
                >
                  Student Dashboard
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold text-[#16324F] hover:bg-[#F0F7F6]"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF9800]" /> Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF9800] text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/report-lost"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-bold text-[#D84315] hover:bg-[#FFF3E0]"
                >
                  Report Lost Item
                </Link>
                <Link
                  to="/report-found"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-bold text-[#00695C] hover:bg-[#E0F2F1]"
                >
                  Report Found Item
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-[#D32F2F] hover:bg-[#FFEBEE] cursor-pointer"
                >
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
                    Register
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
