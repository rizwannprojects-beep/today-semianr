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
  RefreshCw,
  Bell,
  Search,
  PackageCheck,
  AlertTriangle
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import itemService from '../services/itemService.js';
import { notificationService } from '../services/notificationService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const Dashboard = () => {
  const { user } = useAuth();

  // Preset presentation statistics according to Section 8
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
      lostLocation: 'College Library',
      location: 'College Library',
      date: 'September 28, 2026',
      badgeColor: 'red'
    },
    {
      _id: 'found-item-2',
      itemName: 'Blue Water Bottle',
      category: 'Personal Items',
      status: 'found',
      lostLocation: 'Block A',
      location: 'Block A',
      date: 'September 26, 2026',
      badgeColor: 'teal'
    },
    {
      _id: 'lost-item-3',
      itemName: 'Student ID Card',
      category: 'Documents',
      status: 'returned',
      lostLocation: 'Computer Lab',
      location: 'Computer Lab',
      date: 'September 25, 2026',
      badgeColor: 'green'
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
  const [recentClaims, setRecentClaims] = useState([
    {
      _id: 'claim-demo-1',
      itemName: 'Black HP Laptop',
      status: 'approved',
      verificationStatus: 'approved',
      createdAt: '2026-09-28T17:00:00.000Z'
    }
  ]);
  const [activeReturns, setActiveReturns] = useState([
    {
      _id: 'return-demo-1',
      itemName: 'Black HP Laptop',
      status: 'READY_FOR_RETURN',
      scheduledDate: '2026-09-29T14:00:00.000Z',
      location: 'Campus Security / Lost & Found Desk',
      verificationCode: '7842'
    }
  ]);
  const [recentNotifications, setRecentNotifications] = useState(defaultNotifications);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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
        setRecentItems(allUserItems.slice(0, 8));
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
          setRecentClaims(cData.slice(0, 3));
        }
      }

      if (myReturnsRes.status === 'fulfilled' && myReturnsRes.value?.data) {
        const rData = myReturnsRes.value.data.data || myReturnsRes.value.data;
        if (Array.isArray(rData) && rData.length > 0) {
          setReturnsCount(rData.length);
          setActiveReturns(rData.slice(0, 3));
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
              Welcome back, {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Arjun'}!
            </h1>
            <p className="text-sm text-[#526579] font-medium">
              Here&apos;s an overview of your campus recovery activity.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#526579]">
              <span className="font-semibold text-[#16324F]">Register No: {user?.registerNumber || 'BCA2024001'}</span>
              <span>•</span>
              <span>{user?.course || 'BCA Honours'} ({user?.department || 'BCA'})</span>
              <span>•</span>
              <span className="text-[#00695C] font-semibold">Semester {user?.semester || 5}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/report-lost">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                Report Lost Item
              </Button>
            </Link>
            <Link to="/report-found">
              <Button variant="accent" size="sm" icon={ShieldCheck}>
                Report Found Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="mt-6 pt-5 border-t border-[#D9E2E8] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#526579] mr-2">Quick Actions:</span>
          <Link
            to="/report-lost"
            className="px-3 py-1.5 rounded-lg bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#D84315] text-xs font-bold border border-[#FFE0B2] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-3 py-1.5 rounded-lg bg-[#E0F2F1] hover:bg-[#B2DFDB] text-[#00695C] text-xs font-bold border border-[#B2DFDB] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Report Found
          </Link>
          <Link
            to="/browse-found"
            className="px-3 py-1.5 rounded-lg bg-[#E3F2FD] hover:bg-[#BBDEFB] text-[#1565C0] text-xs font-bold border border-[#BBDEFB] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            Search Found Items
          </Link>
          <Link
            to="/my-claims"
            className="px-3 py-1.5 rounded-lg bg-[#FFF8E1] hover:bg-[#FFE082] text-[#B78103] text-xs font-bold border border-[#FFE082] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            View Claims
          </Link>
          <Link
            to="/notifications"
            className="px-3 py-1.5 rounded-lg bg-[#F0F7F6] hover:bg-[#E0F2F1] text-[#00695C] text-xs font-bold border border-[#D9E2E8] transition-colors flex items-center gap-1.5 ml-auto shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-[#FF9800]" />
            Notifications {unreadNotifCount > 0 && <span className="bg-[#FF9800] text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">{unreadNotifCount}</span>}
          </Link>
        </div>
      </div>

      {/* Statistics Counter Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/my-reports" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] flex items-center justify-center text-[#D32F2F] shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] truncate">
                Lost Items
              </p>
              <p className="text-3xl font-black text-[#16324F] mt-0.5">{lostCount}</p>
            </div>
          </div>
        </Link>

        <Link to="/my-reports" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] truncate">
                Found Items
              </p>
              <p className="text-3xl font-black text-[#16324F] mt-0.5">{foundCount}</p>
            </div>
          </div>
        </Link>

        <Link to="/my-claims" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-[#FF9800] shrink-0 group-hover:scale-105 transition-transform">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] group-hover:text-[#00695C] truncate">
                Active Claims
              </p>
              <p className="text-3xl font-black text-[#FF9800] mt-0.5">{claimsCount}</p>
            </div>
          </div>
        </Link>

        <Link to="/my-returns" className="block group">
          <div className="bg-white border border-[#D9E2E8] group-hover:border-[#00897B] rounded-xl p-5 shadow-xs flex items-center gap-4 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] shrink-0 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526579] group-hover:text-[#00695C] truncate">
                Returned
              </p>
              <p className="text-3xl font-black text-[#2E7D32] mt-0.5">{returnsCount}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid: Recent Items & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Items (Section 8) */}
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
              className="text-xs text-[#00695C] hover:text-[#004D40] font-bold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {recentItems.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] hover:border-[#00897B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#16324F]">
                      {item.itemName}
                    </span>
                    <span className="text-[11px] font-semibold text-[#526579] bg-white px-2 py-0.5 rounded border border-[#D9E2E8]">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#526579]">
                    <span className="flex items-center gap-1 text-[#00695C] font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {item.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {item.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={item.status} />
                  <Link to={item.status === 'lost' ? '/my-reports' : '/browse-found'}>
                    <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Notifications (Section 8) */}
        <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-xs space-y-4">
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
              className="text-xs text-[#00695C] hover:text-[#004D40] font-bold"
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
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#16324F] flex items-center gap-1.5">
                    {notif.type === 'match' && <Sparkles className="w-3.5 h-3.5 text-[#FF9800]" />}
                    {notif.type === 'claim' && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />}
                    {notif.type === 'announcement' && <AlertTriangle className="w-3.5 h-3.5 text-[#00695C]" />}
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-[#526579] font-medium">{notif.time}</span>
                </div>
                <p className="text-xs text-[#526579] leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link to="/notifications" className="w-full block">
              <Button variant="ghost" size="sm" className="w-full text-xs text-[#00695C] font-bold border border-dashed border-[#D9E2E8] hover:bg-[#F0F7F6]">
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
