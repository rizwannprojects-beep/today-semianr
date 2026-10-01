import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  ShieldAlert,
  Sparkles,
  BookmarkCheck,
  PackageCheck,
  Megaphone,
  Trash2,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'claims', label: 'Claims' },
    { id: 'matches', label: 'Matches' },
    { id: 'returns', label: 'Returns' },
    { id: 'announcements', label: 'Notices' },
    { id: 'security', label: 'Security' }
  ];

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({
        page: currentPage,
        limit: 15,
        filter: activeFilter
      });
      if (res?.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
        if (res.data.data.pagination) {
          setTotalPages(res.data.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (activeFilter === 'unread') {
        fetchNotifications();
      }
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const handleMarkUnread = async (id) => {
    try {
      await notificationService.markUnread(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((c) => c + 1);
    } catch (err) {
      console.warn('Failed to mark unread:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setActionFeedback({ type: 'success', message: 'All notifications marked as read.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
      if (activeFilter === 'unread') {
        fetchNotifications();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: 'Could not mark all as read.' });
    }
  };

  const handleDelete = async (id, isSecurity) => {
    if (isSecurity) {
      setActionFeedback({
        type: 'error',
        message: 'Security and account alerts are retained for campus security and cannot be deleted.'
      });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 4000);
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setActionFeedback({ type: 'success', message: 'Notification dismissed.' });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not dismiss notification.'
      });
      setTimeout(() => setActionFeedback({ type: '', message: '' }), 3000);
    }
  };

  const getTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('match')) return <Sparkles className="w-4 h-4 text-[#FF9800]" />;
    if (t.includes('claim')) return <BookmarkCheck className="w-4 h-4 text-[#2E7D32]" />;
    if (t.includes('return') || t.includes('handover')) return <PackageCheck className="w-4 h-4 text-[#00695C]" />;
    if (t.includes('security') || t.includes('account')) return <ShieldAlert className="w-4 h-4 text-[#D32F2F]" />;
    if (t.includes('announcement') || t.includes('message')) return <Megaphone className="w-4 h-4 text-[#1976D2]" />;
    return <Bell className="w-4 h-4 text-[#526579]" />;
  };

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
      case 'LOW':
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F7FAFC] text-[#718096] border border-[#D9E2E8]">
            LOW
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/30">
            NORMAL
          </span>
        );
    }
  };

  const getBorderColorClass = (item) => {
    const t = (item.type || '').toLowerCase();
    const p = (item.priority || '').toUpperCase();
    if (p === 'URGENT' || t.includes('security') || t.includes('account')) {
      return 'border-l-4 border-l-[#D32F2F]';
    }
    if (t.includes('match') || p === 'HIGH') {
      return 'border-l-4 border-l-[#FF9800]';
    }
    if (t.includes('claim') || t.includes('return') || t.includes('handover')) {
      return 'border-l-4 border-l-[#2E7D32]';
    }
    return 'border-l-4 border-l-[#1976D2]';
  };

  const resolveActionLink = (item) => {
    if (item.actionUrl) return item.actionUrl;
    if (item.relatedClaim) return `/my-claims`;
    if (item.relatedReturn) return `/my-returns`;
    if (item.relatedMatch) return `/matches`;
    if (item.relatedItem) {
      const itId = item.relatedItem?._id || item.relatedItem;
      return `/items/${itId}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E2E8] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00695C]" />
            Notification Center
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Real-time updates regarding your claims, matches, scheduled returns, and campus safety notices.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E0F2F1] border border-[#00695C]/30 text-[#00695C] hover:bg-[#00695C] hover:text-white transition-colors cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}

          <Link
            to="/settings/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] hover:bg-[#F0F7F6] hover:border-[#00695C] transition-colors"
            title="Notification Preferences"
          >
            <Settings className="w-3.5 h-3.5 text-[#FF9800]" />
            Preferences
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {actionFeedback.message && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
            actionFeedback.type === 'error'
              ? 'bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/30'
              : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        <Filter className="w-3.5 h-3.5 text-[#718096] shrink-0 ml-1 mr-1" />
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveFilter(f.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#00695C] text-white shadow-xs'
                  : 'bg-white text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6] border border-[#D9E2E8]'
              }`}
            >
              {f.label}
              {f.id === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#FF9800] text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#526579] space-y-2">
          <div className="w-6 h-6 border-2 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium">Loading notification center...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-16 space-y-3 border-dashed border-[#D9E2E8]">
          <Bell className="w-12 h-12 text-[#718096] mx-auto" />
          <h2 className="text-base font-bold text-[#16324F]">No notifications found</h2>
          <p className="text-xs text-[#526579] max-w-sm mx-auto leading-relaxed">
            {activeFilter === 'unread'
              ? 'You have read all your alerts! You will be notified when any new match, return, or claim event occurs.'
              : 'There are no notifications matching your current filter selection.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3" role="feed">
          {notifications.map((item) => {
            const isUnread = !item.isRead;
            const isSecurity =
              item.type === 'security_alert' || item.type === 'account_status_changed';
            const actionLink = resolveActionLink(item);

            return (
              <div
                key={item._id}
                className={`relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-[#D9E2E8] shadow-xs transition-all duration-150 ${
                  getBorderColorClass(item)
                } ${
                  isUnread
                    ? 'bg-[#F1FAF9]'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Category Icon */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                      isUnread
                        ? 'bg-white border-[#D9E2E8]'
                        : 'bg-[#F7FAFC] border-[#D9E2E8]'
                    }`}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Body Text */}
                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isUnread && (
                        <span
                          className="w-2 h-2 rounded-full bg-[#FF9800] shrink-0"
                          title="Unread"
                        />
                      )}
                      <h2 className="font-bold text-xs sm:text-sm text-[#16324F]">
                        {item.title}
                      </h2>
                      {getPriorityBadge(item.priority)}
                    </div>

                    <p className="text-xs text-[#526579] leading-relaxed break-words font-medium">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#718096] flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-[#718096]" />
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>

                      {actionLink && (
                        <Link
                          to={actionLink}
                          className="inline-flex items-center gap-1 text-[#00695C] hover:text-[#00897B] font-bold hover:underline"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 border-[#D9E2E8] pt-2 sm:pt-0">
                  {isUnread ? (
                    <button
                      onClick={() => handleMarkRead(item._id)}
                      className="text-xs text-[#00695C] hover:text-[#00897B] font-bold px-2.5 py-1 rounded-lg hover:bg-[#E0F2F1] transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkUnread(item._id)}
                      className="text-xs text-[#718096] hover:text-[#16324F] font-medium px-2 py-1 rounded-lg hover:bg-[#F0F7F6] transition-colors cursor-pointer"
                      title="Mark as unread"
                    >
                      Mark unread
                    </button>
                  )}

                  {!isSecurity ? (
                    <button
                      onClick={() => handleDelete(item._id, false)}
                      className="p-1.5 text-[#718096] hover:text-[#D32F2F] rounded-lg hover:bg-[#FFEBEE] transition-colors cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span
                      title="Security alerts are retained for account safety"
                      className="p-1.5 text-[#718096] cursor-not-allowed"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#D9E2E8] pt-4 text-xs text-[#526579] font-medium">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E2E8] bg-white text-[#16324F] hover:bg-[#F0F7F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E2E8] bg-white text-[#16324F] hover:bg-[#F0F7F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
