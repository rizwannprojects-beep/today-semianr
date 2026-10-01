import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  ArrowLeft,
  ShieldAlert,
  BookmarkCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({
    pendingClaims: 0,
    activeDisputes: 0,
    securityEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAdminNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAdminNotifications({ page, limit: 15 });
      if (res?.data?.data) {
        setNotifications(res.data.data.notifications || []);
        if (res.data.data.summary) {
          setSummary(res.data.data.summary);
        }
        if (res.data.data.pagination) {
          setTotalPages(res.data.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.warn('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdminNotifications();
  }, [fetchAdminNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'claims') return n.type?.includes('claim');
    if (filter === 'disputes') return n.type?.includes('dispute');
    if (filter === 'security') return n.type?.includes('security');
    return true;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/30">
            URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#F57C00] border border-[#FF9800]/30">
            HIGH
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/30">
            NORMAL
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    if (type?.includes('claim')) return <BookmarkCheck className="w-4 h-4 text-[#2E7D32]" />;
    if (type?.includes('dispute')) return <AlertTriangle className="w-4 h-4 text-[#FF9800]" />;
    if (type?.includes('security')) return <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />;
    return <Bell className="w-4 h-4 text-[#00695C]" />;
  };

  const getBorderColorClass = (item) => {
    const t = (item.type || '').toLowerCase();
    const p = (item.priority || '').toUpperCase();
    if (p === 'URGENT' || t.includes('security') || t.includes('dispute')) {
      return 'border-l-4 border-l-[#D32F2F]';
    }
    if (t.includes('claim')) {
      return 'border-l-4 border-l-[#2E7D32]';
    }
    return 'border-l-4 border-l-[#00695C]';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00695C]" />
            Administrative Notification Center
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Operational dashboard alerting staff to pending claim reviews, unresolved disputes, and security events.
          </p>
        </div>

        <button
          onClick={fetchAdminNotifications}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] hover:bg-[#F0F7F6] transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00695C] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/claims">
          <Card className="p-5 hover:shadow-md transition-shadow shadow-xs border-[#D9E2E8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#526579] uppercase tracking-wider">Claims Requiring Action</span>
              <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                <BookmarkCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#00695C] mt-2">{summary.pendingClaims}</p>
            <p className="text-[11px] text-[#00695C] font-semibold mt-1">Click to view claim queue &rarr;</p>
          </Card>
        </Link>

        <Link to="/admin/disputes">
          <Card className="p-5 hover:shadow-md transition-shadow shadow-xs border-[#D9E2E8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#526579] uppercase tracking-wider">Active Return Disputes</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] flex items-center justify-center text-[#FF9800]">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#F57C00] mt-2">{summary.activeDisputes}</p>
            <p className="text-[11px] text-[#F57C00] font-semibold mt-1">Click to resolve disputes &rarr;</p>
          </Card>
        </Link>

        <Link to="/admin/security-events">
          <Card className="p-5 hover:shadow-md transition-shadow shadow-xs border-[#D9E2E8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#526579] uppercase tracking-wider">Recent Security Flags</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFEBEE] flex items-center justify-center text-[#D32F2F]">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#D32F2F] mt-2">{summary.securityEvents}</p>
            <p className="text-[11px] text-[#D32F2F] font-semibold mt-1">Click to review audit logs &rarr;</p>
          </Card>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-[#718096] shrink-0 ml-1 mr-1" />
        {[
          { id: 'all', label: 'All Operations' },
          { id: 'claims', label: 'Claims' },
          { id: 'disputes', label: 'Disputes' },
          { id: 'security', label: 'Security' }
        ].map((f) => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#00695C] text-white shadow-xs'
                  : 'bg-white text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6] border border-[#D9E2E8]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Event Stream */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#526579] space-y-2">
          <div className="w-6 h-6 border-2 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium">Scanning administrative event logs...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-16 space-y-3 shadow-xs border-dashed border-[#D9E2E8]">
          <CheckCircle2 className="w-12 h-12 text-[#2E7D32]/50 mx-auto" />
          <p className="text-base font-bold text-[#16324F]">All clear</p>
          <p className="text-xs text-[#526579] max-w-sm mx-auto font-medium">
            No unresolved administrative alerts found for the selected category.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item._id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#D9E2E8] bg-white shadow-xs ${getBorderColorClass(item)}`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-xs sm:text-sm text-[#16324F]">{item.title}</h2>
                    {getPriorityBadge(item.priority)}
                  </div>
                  <p className="text-xs text-[#526579] font-medium leading-relaxed">{item.message}</p>
                  <p className="text-[11px] text-[#718096] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-[#718096]" />
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              {item.actionUrl && (
                <Link
                  to={item.actionUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E0F2F1] text-[#00695C] hover:bg-[#00695C] hover:text-white transition-colors self-end sm:self-auto shrink-0 shadow-xs"
                >
                  Investigate
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#D9E2E8] pt-4 text-xs text-[#526579] font-medium">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E2E8] bg-white text-[#16324F] hover:bg-[#F0F7F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E2E8] bg-white text-[#16324F] hover:bg-[#F0F7F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
