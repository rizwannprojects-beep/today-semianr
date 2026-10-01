import { useState, useEffect } from 'react';
import {
  Megaphone,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Users,
  CheckCircle2,
  X,
  Send,
  Archive,
  Clock,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import notificationService from '../../services/notificationService.js';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [status, setStatus] = useState('PUBLISHED');
  const [scheduledAt, setScheduledAt] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [estimatedRecipients, setEstimatedRecipients] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAnnouncements();
      if (res?.data?.announcements) {
        setAnnouncements(res.data.announcements);
      } else if (res?.data?.data?.announcements) {
        setAnnouncements(res.data.data.announcements);
      } else if (Array.isArray(res?.data)) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleEstimateAudience = async () => {
    try {
      setEstimating(true);
      const res = await notificationService.previewAudience(targetAudience);
      const count =
        res?.data?.data?.estimatedRecipientCount ??
        res?.data?.estimatedRecipientCount ??
        res?.data?.count ??
        0;
      setEstimatedRecipients(count);
    } catch (err) {
      console.warn('Audience estimation error:', err);
    } finally {
      setEstimating(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Title and message are required.' });
      return;
    }

    try {
      setSubmitting(true);
      await notificationService.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        priority,
        targetAudience,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined
      });
      setFeedback({ type: 'success', text: `Campus notice created with status: ${status}.` });
      setTitle('');
      setMessage('');
      setScheduledAt('');
      setExpiryDate('');
      setEstimatedRecipients(null);
      setShowCreate(false);
      fetchAnnouncements();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to publish announcement.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishNow = async (id) => {
    try {
      await notificationService.publishAnnouncement(id);
      setFeedback({ type: 'success', text: 'Announcement published immediately.' });
      fetchAnnouncements();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to publish announcement.' });
    }
  };

  const handleCancelAnnouncement = async (id) => {
    try {
      await notificationService.cancelAnnouncement(id);
      setFeedback({ type: 'success', text: 'Announcement archived.' });
      fetchAnnouncements();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to archive announcement.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await notificationService.deleteAnnouncement(id);
      setFeedback({ type: 'success', text: 'Announcement removed.' });
      fetchAnnouncements();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'PUBLISHED':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30">
            PUBLISHED
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E3F2FD] text-[#1976D2] border border-[#1976D2]/30">
            SCHEDULED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#F57C00] border border-[#FF9800]/30">
            DRAFT
          </span>
        );
      case 'ARCHIVED':
      case 'EXPIRED':
      default:
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
            {st || 'ARCHIVED'}
          </span>
        );
    }
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
            <Megaphone className="w-6 h-6 text-[#FF9800]" />
            Campus Broadcasts & Announcements
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Post institutional announcements, scheduling changes, and recovery station notices to students.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#00695C] text-white hover:bg-[#00897B] transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          {showCreate ? 'Close Form' : 'New Broadcast'}
        </button>
      </div>

      {feedback.text && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-semibold border ${
            feedback.type === 'error'
              ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30'
              : 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Creation Modal / Form */}
      {showCreate && (
        <Card className="p-6 border-[#00695C]/30 bg-white space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
            <h2 className="text-sm font-bold text-[#16324F] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#00695C]" />
              Create Campus Broadcast
            </h2>
            <button
              onClick={() => setShowCreate(false)}
              className="text-[#718096] hover:text-[#16324F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#16324F] font-bold mb-1">Notice Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End of Semester Lost Property Collection Window"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="block text-[#16324F] font-bold mb-1">Message Content *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of the announcement, campus location, identification instructions..."
                rows={4}
                className="w-full p-3 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs resize-none"
                maxLength={5000}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#16324F] font-bold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH (In-App Alert)</option>
                  <option value="URGENT">URGENT (In-App & Email)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#16324F] font-bold mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => {
                    setTargetAudience(e.target.value);
                    setEstimatedRecipients(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs"
                >
                  <option value="ALL">Entire Campus Community</option>
                  <option value="STUDENTS">All Students</option>
                  <option value="STAFF">Campus Staff & Security</option>
                  <option value="Computer Science">Computer Science Dept</option>
                  <option value="Electronics">Electronics Dept</option>
                  <option value="1">First Year Students</option>
                  <option value="2">Second Year Students</option>
                  <option value="3">Third Year Students</option>
                  <option value="4">Fourth Year Students</option>
                </select>
              </div>

              <div>
                <label className="block text-[#16324F] font-bold mb-1">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs"
                >
                  <option value="PUBLISHED">Publish Immediately</option>
                  <option value="SCHEDULED">Schedule for Later</option>
                  <option value="DRAFT">Save as Draft</option>
                </select>
              </div>
            </div>

            {/* Audience preview safety banner */}
            <div className="p-3 rounded-xl bg-[#F1FAF9] border border-[#E0F2F1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#16324F]">
                <Users className="w-4 h-4 text-[#00695C]" />
                <span className="font-medium">
                  {estimatedRecipients !== null ? (
                    <strong className="text-[#00695C] font-bold">
                      Estimated recipients: {estimatedRecipients.toLocaleString()} students
                    </strong>
                  ) : (
                    'Preview recipient size before broadcasting'
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleEstimateAudience}
                disabled={estimating}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F0F7F6] text-[#00695C] border border-[#D9E2E8] text-[11px] font-bold self-start sm:self-auto cursor-pointer shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                {estimating ? 'Calculating...' : 'Estimate Audience'}
              </button>
            </div>

            {status === 'SCHEDULED' && (
              <div>
                <label className="block text-[#16324F] font-bold mb-1">Scheduled Release Date</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[#16324F] font-bold mb-1">Optional Expiry Date</label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-xs"
              />
              <p className="text-[10px] text-[#718096] mt-0.5 font-medium">
                Expired announcements automatically stop appearing to students.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9E2E8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Processing...' : status === 'PUBLISHED' ? 'Publish Broadcast' : 'Save Notice'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#526579] space-y-2">
          <div className="w-6 h-6 border-2 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium">Loading campus announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <Card className="text-center py-16 space-y-3 shadow-xs border-dashed border-[#D9E2E8]">
          <Megaphone className="w-12 h-12 text-[#718096] mx-auto" />
          <h2 className="text-base font-bold text-[#16324F]">No announcements published</h2>
          <p className="text-xs text-[#526579] max-w-sm mx-auto font-medium">
            Click "New Broadcast" to dispatch institutional bulletins to campus students and staff.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <Card
              key={item._id || item.id}
              className="p-5 shadow-xs border-[#D9E2E8] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm text-[#16324F]">{item.title}</h2>
                    {getStatusBadge(item.status)}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/20">
                      Audience: {item.targetAudience}
                    </span>
                  </div>
                  <p className="text-xs text-[#526579] leading-relaxed whitespace-pre-line font-medium">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                  {item.status === 'DRAFT' || item.status === 'SCHEDULED' ? (
                    <button
                      onClick={() => handlePublishNow(item._id || item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/40 text-[#2E7D32] hover:bg-[#C8E6C9] text-xs font-bold cursor-pointer"
                      title="Publish now"
                    >
                      <Send className="w-3 h-3" />
                      Publish
                    </button>
                  ) : null}

                  {item.status === 'PUBLISHED' ? (
                    <button
                      onClick={() => handleCancelAnnouncement(item._id || item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFF3E0] border border-[#FF9800]/40 text-[#F57C00] hover:bg-[#FFE0B2] text-xs font-bold cursor-pointer"
                      title="Archive notice"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  ) : null}

                  <button
                    onClick={() => handleDelete(item._id || item.id)}
                    className="p-1.5 text-[#718096] hover:text-[#D32F2F] rounded-lg hover:bg-[#FFEBEE] cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#718096] pt-2 border-t border-[#D9E2E8] flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </span>
                {item.scheduledAt && (
                  <span className="flex items-center gap-1 text-[#1976D2] font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Scheduled: {new Date(item.scheduledAt).toLocaleString()}
                  </span>
                )}
                {item.expiryDate && (
                  <span className="flex items-center gap-1 text-[#FF9800] font-semibold">
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
