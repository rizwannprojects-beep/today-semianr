import { useState, useEffect } from 'react';
import {
  FileText,
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  X,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import adminService from '../../services/adminService.js';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getModerationReports({ status: statusFilter || undefined });
      if (res?.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching moderation reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenResolve = (rep) => {
    setResolvingReport(rep);
    setResolutionStatus('RESOLVED');
    setResolutionNotes('');
    setFeedback({ type: '', text: '' });
  };

  const handleConfirmResolve = async () => {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      setFeedback({ type: 'error', text: 'Resolution justification of at least 5 characters required.' });
      return;
    }

    try {
      setActionLoading(true);
      const id = resolvingReport._id || resolvingReport.id;
      await adminService.resolveModerationReport(id, resolutionStatus, resolutionNotes.trim());
      setFeedback({ type: 'success', text: `Report marked as ${resolutionStatus}.` });
      setResolvingReport(null);
      fetchReports();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update report.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-[#FF9800]" />
            Content Moderation & Flagged Reports
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Audit user complaints, flagged spam, inappropriate submissions, and fraudulent listings.
          </p>
        </div>
      </div>

      {feedback.text && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between font-semibold border ${
          feedback.type === 'error'
            ? 'bg-[#FFEBEE] border-[#D32F2F]/30 text-[#D32F2F]'
            : 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32]'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback({ type: '', text: '' })} className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-2 text-xs">
        {['', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].map((st) => (
          <button
            key={st || 'all'}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-[#00695C] text-white shadow-xs'
                : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
            }`}
          >
            {st ? st.replace('_', ' ') : 'All Flags'}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden shadow-xs border-[#D9E2E8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16324F] min-w-[700px]">
            <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
              <tr>
                <th className="py-3 px-4">Flag Reason & Target</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#526579] font-medium">
                    Loading moderation complaints...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((rep) => {
                  const id = rep._id || rep.id;
                  return (
                    <tr key={id} className="hover:bg-[#F0F7F6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#16324F]">{rep.reason}</div>
                        <div className="text-[11px] text-[#526579] truncate max-w-xs font-medium">
                          {rep.description || 'Target: ' + rep.targetType}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#16324F] font-medium">
                        {rep.reporter?.fullName || rep.reporter?.email || 'Campus User'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          rep.priority === 'HIGH'
                            ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30'
                            : 'bg-[#FFF3E0] text-[#F57C00] border-[#FF9800]/30'
                        }`}>
                          {rep.priority || 'NORMAL'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          rep.status === 'RESOLVED'
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                            : rep.status === 'DISMISSED'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-[#F3E5F5] text-[#7B1FA2] border-[#7B1FA2]/30'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#718096] font-mono text-[11px] font-medium">
                        {new Date(rep.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleOpenResolve(rep)}
                        >
                          Review Flag
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-[#526579] font-medium">
                    No active content moderation flags in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resolve Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#00695C] font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-[#00695C]" /> Moderation Determination
            </div>
            <p className="text-xs text-[#16324F] font-medium">
              Reason: <strong className="text-[#16324F] font-bold">"{resolvingReport.reason}"</strong>
            </p>
            {resolvingReport.description && (
              <p className="text-[11px] text-[#526579] italic bg-[#F7FAFC] p-2.5 rounded-xl border border-[#D9E2E8]">
                "{resolvingReport.description}"
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                Moderation Action:
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                <option value="RESOLVED">RESOLVED (Content moderated & action completed)</option>
                <option value="DISMISSED">DISMISSED (Invalid flag or false positive)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (Requires further investigation)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                Forensic Resolution Notes (Required, min 5 chars):
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="State verified findings and reason for resolution..."
                className="w-full p-3 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] h-24"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResolvingReport(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmResolve}
                disabled={actionLoading}
              >
                {actionLoading ? 'Recording...' : 'Save Decision'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
