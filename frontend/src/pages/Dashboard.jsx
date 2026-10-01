import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  BookmarkCheck,
  Sparkles,
  PlusCircle,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Bell,
  Search,
  PackageCheck,
  AlertTriangle,
  Laptop,
  CupSoda,
  CreditCard,
  Package
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import itemService from '../services/itemService.js';
import { notificationService } from '../services/notificationService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const Dashboard = () => {
  const { user } = useAuth();

  // Preset presentation statistics according to Section 11
  const [lostCount, setLostCount] = useState(2);
  const [foundCount, setFoundCount] = useState(1);
  const [matchesCount, setMatchesCount] = useState(1);
  const [claimsCount, setClaimsCount] = useState(1);
  const [returnsCount, setReturnsCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(4);

  // Presentation items specified in Section 11
  const defaultRecentItems = [
    {
      _id: 'lost-item-1',
      itemName: 'Black HP Laptop',
      category: 'Electronics',
      status: 'lost',
      location: 'College Library',
      date: 'September 28, 2026',
      icon: Laptop
    },
    {
      _id: 'found-item-2',
      itemName: 'Blue Water Bottle',
      category: 'Personal Items',
      status: 'found',
      location: 'Block A',
      date: 'September 26, 2026',
      icon: CupSoda
    },
    {
      _id: 'lost-item-3',
      itemName: 'Student ID Card',
      category: 'Documents',
      status: 'returned',
      location: 'Computer Lab',
      date: 'September 25, 2026',
      icon: CreditCard
    }
  ];

  const defaultNotifications = [
    {
      id: 'notif-1',
      title: 'Possible match found for Black HP Laptop',
      message: 'Your lost Black HP Laptop may match a found item at College Library.',
      time: '10 mins ago',
      type: 'match'
    },
    {
      id: 'notif-2',
      title: 'Claim submitted successfully',
      message: 'Your claim for Black HP Laptop has been submitted to administration.',
      time: '30 mins ago',
      type: 'claim'
    },
    {
      id: 'notif-3',
      title: 'Verification required',
      message: 'Additional ownership information is required at the Security Desk.',
      time: '2 hours ago',
      type: 'claim'
    },
    {
      id: 'notif-4',
      title: 'Found item reported near College Library',
      message: 'Found item reported near College Library reading area.',
      time: 'Yesterday',
      type: 'announcement'
    }
  ];

  const [recentItems, setRecentItems] = useState(defaultRecentItems);
  const [recentNotifications, setRecentNotifications] = useState(defaultNotifications);

  const fetchDashboardData = async () => {
    try {
      const [myLostRes, myFoundRes, myMatchesRes, myClaimsRes, myReturnsRes, unreadRes] = await Promise.allSettled([
        itemService.getMyLostItems(),
        itemService.getMyFoundItems(),
        itemService.getMatches(),
        itemService.getMyClaims(),
        itemService.getReturns(),
        notificationService.getUnreadCount()
      ]);

      const allUserItems = [];
      if (myLostRes.status === 'fulfilled' && myLostRes.value?.data) {
        const lData = myLostRes.value.data.data || myLostRes.value.data;
        if (Array.isArray(lData) && lData.length > 0) {
          setLostCount(lData.length);
          allUserItems.push(...lData);
        }
      }

      if (myFoundRes.status === 'fulfilled' && myFoundRes.value?.data) {
        const fData = myFoundRes.value.data.data || myFoundRes.value.data;
        if (Array.isArray(fData) && fData.length > 0) {
          setFoundCount(fData.length);
          allUserItems.push(...fData);
        }
      }

      if (allUserItems.length > 0) {
        setRecentItems(allUserItems.slice(0, 5));
      }

      if (myMatchesRes.status === 'fulfilled' && myMatchesRes.value?.data) {
        const mData = myMatchesRes.value.data.data || myMatchesRes.value.data;
        if (Array.isArray(mData) && mData.length > 0) {
          setMatchesCount(mData.length);
        }
      }

      if (myClaimsRes.status === 'fulfilled' && myClaimsRes.value?.data) {
        const cData = myClaimsRes.value.data.data || myClaimsRes.value.data;
        if (Array.isArray(cData) && cData.length > 0) {
          setClaimsCount(cData.length);
        }
      }

      if (myReturnsRes.status === 'fulfilled' && myReturnsRes.value?.data) {
        const rData = myReturnsRes.value.data.data || myReturnsRes.value.data;
        if (Array.isArray(rData) && rData.length > 0) {
          setReturnsCount(rData.length);
        }
      }

      if (unreadRes.status === 'fulfilled' && unreadRes.value?.data) {
        const uCount = unreadRes.value.data.data?.unreadCount ?? unreadRes.value.data.unreadCount;
        if (typeof uCount === 'number') {
          setUnreadNotifCount(uCount);
        }
      }
    } catch (err) {
      console.warn('Dashboard api sync notice:', err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const displayName = user?.fullName || user?.name || 'Arjun Nair';
  const firstName = displayName.split(' ')[0];
  const regNumber = user?.registerNumber || user?.rollNumber || 'CS-2024-089';
  const course = user?.course || 'BCA';
  const dept = user?.department || 'Computer Applications';
  const year = user?.year || 3;
  const sem = user?.semester || 5;

  return (
    <div className="space-y-6">
      {/* 1. DASHBOARD HEADER CARD (Section 8) */}
      <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        {/* Top Row: Welcome Info on Left + Primary Actions on Right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
              Welcome back, <span className="text-[#00695C]">{firstName}!</span>
            </h1>
            <p className="text-sm text-[#526579] font-medium">
              Campus item recovery console and real-time activity ledger.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/report-lost">
              <Button variant="primary" size="md" icon={PlusCircle}>
                Report Lost Item
              </Button>
            </Link>
            <Link to="/report-found">
              <Button variant="accent" size="md" icon={ShieldCheck}>
                Report Found Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Sub-bar: Student Registration Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D9E2E8] text-xs">
          <span className="font-semibold text-[#526579]">Student ID:</span>
          <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-[#F0F7F6] text-[#00695C] border border-[#B2DFDB]">
            {regNumber}
          </span>
          <span className="text-[#D9E2E8] hidden sm:inline">•</span>
          <span className="px-2.5 py-0.5 rounded-md font-semibold bg-[#F7FAFC] text-[#16324F] border border-[#D9E2E8]">
            {course} ({dept})
          </span>
          <span className="text-[#D9E2E8] hidden sm:inline">•</span>
          <span className="px-2.5 py-0.5 rounded-md font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            Year {year} • Semester {sem}
          </span>
        </div>

        {/* Bottom Row: Quick Action Buttons (Section 9) */}
        <div className="pt-2 border-t border-[#D9E2E8] flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#526579] mr-1">
            Quick Actions:
          </span>

          <Link
            to="/report-lost"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#D84315] text-xs font-bold border border-[#FFE0B2] transition-colors whitespace-nowrap shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            Report Lost
          </Link>

          <Link
            to="/report-found"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E0F2F1] hover:bg-[#B2DFDB] text-[#00695C] text-xs font-bold border border-[#B2DFDB] transition-colors whitespace-nowrap shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Report Found
          </Link>

          <Link
            to="/browse-found"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E3F2FD] hover:bg-[#BBDEFB] text-[#1565C0] text-xs font-bold border border-[#BBDEFB] transition-colors whitespace-nowrap shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            Search Found Items
          </Link>

          <Link
            to="/my-claims"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#FFF8E1] hover:bg-[#FFE082] text-[#B78103] text-xs font-bold border border-[#FFE082] transition-colors whitespace-nowrap shadow-2xs"
          >
            <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
            View Claims
          </Link>

          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F7FAFC] hover:bg-[#E0F2F1] text-[#16324F] text-xs font-bold border border-[#D9E2E8] transition-colors whitespace-nowrap shadow-2xs sm:ml-auto"
          >
            <Bell className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
            Notifications
            {unreadNotifCount > 0 && (
              <span className="ml-1 bg-[#FF9800] text-white font-bold px-1.5 py-0.2 rounded-full text-[10px] leading-tight">
                {unreadNotifCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 2. STATISTICS COUNTERS (Section 6 & 10) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lost Items */}
        <Link to="/my-reports" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all h-24">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] flex items-center justify-center text-[#D32F2F] shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] truncate">
                Lost Items
              </p>
              <p className="text-3xl font-black text-[#16324F] leading-tight mt-0.5">
                {lostCount}
              </p>
            </div>
          </div>
        </Link>

        {/* Card 2: Found Items */}
        <Link to="/my-reports" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all h-24">
            <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] truncate">
                Found Items
              </p>
              <p className="text-3xl font-black text-[#16324F] leading-tight mt-0.5">
                {foundCount}
              </p>
            </div>
          </div>
        </Link>

        {/* Card 3: Active Claims */}
        <Link to="/my-claims" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all h-24">
            <div className="w-12 h-12 rounded-xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-[#FF9800] shrink-0 group-hover:scale-105 transition-transform">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] truncate">
                Active Claims
              </p>
              <p className="text-3xl font-black text-[#FF9800] leading-tight mt-0.5">
                {claimsCount}
              </p>
            </div>
          </div>
        </Link>

        {/* Card 4: Returned Items */}
        <Link to="/my-returns" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all h-24">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] shrink-0 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] truncate">
                Returned
              </p>
              <p className="text-3xl font-black text-[#2E7D32] leading-tight mt-0.5">
                {returnsCount}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. CONTENT GRID: RECENT ITEMS + RECENT NOTIFICATIONS (Section 6, 11, 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Items */}
        <div className="lg:col-span-2 bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00695C]" />
                Recent Items
              </h2>
              <p className="text-xs text-[#526579] mt-0.5">
                Tracked belongings across campus holding points and recovery channels.
              </p>
            </div>
            <Link
              to="/my-reports"
              className="text-xs text-[#00695C] hover:text-[#004D40] font-bold flex items-center gap-1 whitespace-nowrap"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {recentItems.map((item) => {
              const ItemIcon = item.icon || Package;
              return (
                <div
                  key={item._id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] hover:border-[#00897B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] shrink-0">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#16324F] truncate max-w-[220px] sm:max-w-[280px]">
                          {item.itemName}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#526579] bg-white px-2 py-0.5 rounded border border-[#D9E2E8] whitespace-nowrap">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#526579] truncate">
                        <span className="flex items-center gap-1 text-[#00695C] font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D9E2E8]/60">
                    <StatusBadge status={item.status} />
                    <Link to={item.status === 'lost' ? '/my-reports' : '/browse-found'}>
                      <Button variant="outline" size="xs">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Recent Notifications (Section 12) */}
        <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FF9800]" />
                  Recent Notifications
                </h2>
                <p className="text-xs text-[#526579] mt-0.5">
                  Real-time claim updates and campus notices.
                </p>
              </div>
              <Link
                to="/notifications"
                className="text-xs text-[#00695C] hover:text-[#004D40] font-bold whitespace-nowrap"
              >
                All
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] hover:border-[#00695C]/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-[#16324F] flex items-center gap-1.5">
                      {notif.type === 'match' && <Sparkles className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />}
                      {notif.type === 'claim' && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />}
                      {notif.type === 'announcement' && <AlertTriangle className="w-3.5 h-3.5 text-[#00695C] shrink-0" />}
                      <span className="leading-snug">{notif.title}</span>
                    </span>
                    <span className="text-[10px] text-[#526579] font-medium whitespace-nowrap shrink-0 mt-0.5">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#526579] leading-relaxed break-words">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#D9E2E8]">
            <Link to="/notifications" className="w-full block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[#00695C] font-bold border border-dashed border-[#D9E2E8] hover:bg-[#F0F7F6]"
              >
                Go to Notification Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
