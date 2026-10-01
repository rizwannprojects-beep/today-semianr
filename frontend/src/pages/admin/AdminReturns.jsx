import { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  Search,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  Download
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import adminService from '../../services/adminService.js';

export const AdminReturns = () => {
  const location = useLocation();
  const isDisputeDefault = location.pathname.includes('/admin/disputes');
  const [activeTab, setActiveTab] = useState(isDisputeDefault ? 'disputes' : 'returns');
  const [returnsList, setReturnsList] = useState([]);
  const [disputesList, setDisputesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [retsRes, dispRes] = await Promise.all([
        adminService.getReturns(),
        adminService.getDisputes()
      ]);

      if (retsRes?.data?.returns) {
        setReturnsList(retsRes.data.returns);
      }
      if (dispRes?.data?.disputes) {
        setDisputesList(dispRes.data.disputes);
      }
    } catch (err) {
      console.error('Error fetching returns & disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenResolve = (dispute) => {
    setResolvingDispute(dispute);
    setResolutionStatus('RESOLVED');
    setResolutionNotes('');
    setFeedback({ type: '', text: '' });
  };

  const handleConfirmResolve = async () => {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      setFeedback({ type: 'error', text: 'Resolution notes of at least 5 characters must be provided.' });
      return;
    }

    try {
      setActionLoading(true);
      const id = resolvingDispute._id || resolvingDispute.id;
      await adminService.resolveDispute(id, resolutionStatus, resolutionNotes.trim());
      setFeedback({ type: 'success', text: `Dispute marked as ${resolutionStatus}.` });
      setResolvingDispute(null);
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to resolve dispute.' });
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
            <RotateCcw className="w-6 h-6 text-[#00695C]" />
            Item Handover & Dispute Arbitrage
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Monitor dual-code campus return handovers, track scheduled pickups, and arbitrate contested property claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(adminService.exportCsvUrl('returns'), '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-xs font-semibold text-[#16324F] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00695C]" />
            <span>Export Returns</span>
          </button>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'returns'
              ? 'bg-[#00695C] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          All Returns ({returnsList.length})
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'disputes'
              ? 'bg-[#D32F2F] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF9800]" />
          Contested Disputes ({disputesList.length})
        </button>
      </div>

      {/* Table Content */}
      <Card className="p-0 overflow-hidden shadow-xs border-[#D9E2E8]">
        {activeTab === 'returns' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#16324F] min-w-[700px]">
              <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
                <tr>
                  <th className="py-3 px-4">Item & Return ID</th>
                  <th className="py-3 px-4">Owner (Student)</th>
                  <th className="py-3 px-4">Finder / Custody</th>
                  <th className="py-3 px-4">Handover Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2E8]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#526579] font-medium">
                      Loading handovers list...
                    </td>
                  </tr>
                ) : returnsList.length > 0 ? (
                  returnsList.map((r) => {
                    const id = r._id || r.id;
                    const item = r.item || {};
                    const owner = r.owner || {};

                    return (
                      <tr key={id} className="hover:bg-[#F0F7F6] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#16324F]">
                            {item.title || item.itemName || 'Custody Item'}
                          </div>
                          <div className="text-[10px] font-mono text-[#00695C] font-bold">
                            ID: #{id.slice(-6).toUpperCase()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[#16324F] font-bold">
                            {owner.fullName || owner.name || 'Owner'}
                          </div>
                          <div className="text-[10px] text-[#718096]">
                            {owner.email || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#16324F] font-medium">
                          {r.finder?.fullName || r.finder?.name || 'Security Desk Staff'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-[#16324F] font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                            <span>{r.meetingLocation || 'Central Desk'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            r.status === 'RETURNED'
                              ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                              : r.status === 'DISPUTED'
                              ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30'
                              : 'bg-[#FFF3E0] text-[#F57C00] border-[#FF9800]/30'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/return/${id}`}
                            className="text-xs text-[#00695C] hover:text-[#00897B] font-bold inline-flex items-center gap-1"
                          >
                            <span>Inspect</span> <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-[#526579] font-medium">
                      No returns recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#16324F] min-w-[700px]">
              <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
                <tr>
                  <th className="py-3 px-4">Dispute & Item</th>
                  <th className="py-3 px-4">Reported Reason</th>
                  <th className="py-3 px-4">Claimant / Owner</th>
                  <th className="py-3 px-4">Dispute Status</th>
                  <th className="py-3 px-4 text-right">Arbitration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2E8]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#526579] font-medium">
                      Loading disputes...
                    </td>
                  </tr>
                ) : disputesList.length > 0 ? (
                  disputesList.map((d) => {
                    const id = d._id || d.id;
                    const item = d.item || {};
                    const dispInfo = d.dispute || {};

                    return (
                      <tr key={id} className="hover:bg-[#F0F7F6] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#16324F]">
                            {item.title || item.itemName || 'Contested Item'}
                          </div>
                          <div className="text-[10px] font-mono text-[#00695C] font-bold">
                            Return #{id.slice(-6).toUpperCase()}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-[#D32F2F] font-bold truncate">
                            {dispInfo.reason || d.notes || 'Contested ownership details'}
                          </div>
                          <div className="text-[10px] text-[#718096] font-medium">
                            Reported on {new Date(d.updatedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[#16324F] font-bold">
                            {d.owner?.fullName || d.owner?.name || 'Claimant'}
                          </div>
                          <div className="text-[10px] text-[#718096]">
                            {d.owner?.email || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/30">
                            {dispInfo.status || 'OPEN'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleOpenResolve(d)}
                          >
                            Arbitrate
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-[#526579] font-medium">
                      No contested handover disputes open at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Dispute Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#FF9800] font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-[#FF9800]" /> Administrative Dispute Arbitration
            </div>
            <p className="text-xs text-[#16324F] font-medium leading-relaxed">
              Arbitrating handover dispute for <strong className="text-[#16324F] font-bold">"{resolvingDispute.item?.title || 'Contested Item'}"</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                Resolution Determination:
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                <option value="RESOLVED">RESOLVED (Authorize Handover Completion)</option>
                <option value="REJECTED">REJECTED (Cancel Claim & Reopen Custody)</option>
                <option value="ESCALATED">ESCALATED (Forward to Campus Dean / Security Chief)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                Forensic Arbitration Notes (Required, min 5 chars):
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="State verified findings, physical inspection outcome, or rationale..."
                className="w-full p-3 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] h-24"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResolvingDispute(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={handleConfirmResolve}
                disabled={actionLoading}
              >
                {actionLoading ? 'Recording...' : 'Commit Determination'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
