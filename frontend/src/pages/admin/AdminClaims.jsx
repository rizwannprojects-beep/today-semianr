import { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Search,
  ArrowLeft,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Eye,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  X,
  Send,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import adminService from '../../services/adminService.js';

export const AdminClaims = () => {
  const { id: urlClaimId } = useParams();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalItems: 0, totalPages: 1 });

  // Selected claim for side-by-side review
  const [reviewClaim, setReviewClaim] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Action dialogs
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'request_info'
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  const fetchClaims = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: search.trim() || undefined
      };
      const res = await adminService.getClaims(params);
      if (res?.data?.claims) {
        setClaims(res.data.claims);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const openClaimReview = async (claimId) => {
    try {
      setReviewLoading(true);
      const res = await adminService.getClaimById(claimId);
      if (res?.data?.claim) {
        setReviewClaim(res.data.claim);
      }
    } catch (err) {
      console.error('Error loading claim details:', err);
      setFeedbackMessage({ type: 'error', text: 'Unable to load claim review details.' });
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims(1);
  }, [statusFilter, search]);

  useEffect(() => {
    if (urlClaimId) {
      openClaimReview(urlClaimId);
    }
  }, [urlClaimId]);

  const handleExecuteAction = async () => {
    if (actionType === 'reject' && (!actionReason || actionReason.trim().length < 5)) {
      setFeedbackMessage({ type: 'error', text: 'A rejection reason of at least 5 characters is required.' });
      return;
    }

    if (actionType === 'request_info' && (!actionReason || actionReason.trim().length < 5)) {
      setFeedbackMessage({ type: 'error', text: 'Please specify the exact additional proof requested from the claimant.' });
      return;
    }

    try {
      setActionLoading(true);
      const claimId = reviewClaim._id || reviewClaim.id;

      if (actionType === 'approve') {
        await adminService.approveClaim(claimId, actionReason.trim());
        setFeedbackMessage({ type: 'success', text: 'Ownership claim approved and return code issued to student.' });
      } else if (actionType === 'reject') {
        await adminService.rejectClaim(claimId, actionReason.trim());
        setFeedbackMessage({ type: 'success', text: 'Ownership claim rejected and student notified.' });
      } else if (actionType === 'request_info') {
        await adminService.requestClaimInformation(claimId, actionReason.trim());
        setFeedbackMessage({ type: 'success', text: 'Requested additional information from student.' });
      }

      setActionType(null);
      setActionReason('');
      setReviewClaim(null);
      fetchClaims(pagination.page);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Action failed.' });
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
            <BookmarkCheck className="w-6 h-6 text-[#00695C]" />
            Claims Verification & Review Desk
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Evaluate ownership proof side-by-side, cross-examine found property details, and authorize secure handover codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(adminService.exportCsvUrl('claims'), '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-xs font-semibold text-[#16324F] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00695C]" />
            <span>Export Claims</span>
          </button>
        </div>
      </div>

      {feedbackMessage.text && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between font-semibold border ${
          feedbackMessage.type === 'error'
            ? 'bg-[#FFEBEE] border-[#D32F2F]/30 text-[#D32F2F]'
            : 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32]'
        }`}>
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage({ type: '', text: '' })} className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#D9E2E8] pb-2 text-xs overflow-x-auto">
        {[
          { label: 'All Submissions', value: '' },
          { label: 'Pending Review', value: 'pending' },
          { label: 'Under Review', value: 'underReview' },
          { label: 'More Information', value: 'MORE_INFO_REQUESTED' },
          { label: 'Verified / Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Completed', value: 'completed' }
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-[#00695C] text-white shadow-xs'
                : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims List Table */}
      <Card className="p-0 overflow-hidden shadow-xs border-[#D9E2E8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16324F] min-w-[750px]">
            <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
              <tr>
                <th className="py-3 px-4">Claim ID & Date</th>
                <th className="py-3 px-4">Item Under Claim</th>
                <th className="py-3 px-4">Claimant Student</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#526579] font-medium">
                    Loading claims roster...
                  </td>
                </tr>
              ) : claims.length > 0 ? (
                claims.map((c) => {
                  const id = c._id || c.id;
                  const item = c.item || {};
                  const claimant = c.claimant || {};

                  return (
                    <tr key={id} className="hover:bg-[#F0F7F6] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[#00695C] font-bold">
                          #{id.slice(-6).toUpperCase()}
                        </span>
                        <div className="text-[10px] text-[#718096] font-medium">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#16324F] truncate max-w-[200px]">
                          {item.title || item.itemName || 'Custody Item'}
                        </div>
                        <div className="text-[10px] text-[#526579] font-medium">
                          {item.category} • {item.location}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#16324F] font-bold">
                          {claimant.fullName || claimant.name || 'Student'}
                        </div>
                        <div className="text-[10px] text-[#718096] font-mono">
                          {claimant.registerNumber || claimant.email || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {c.matchScore ? (
                          <span className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] ${
                            c.matchScore >= 80 ? 'text-[#2E7D32]' : 'text-[#FF9800]'
                          }`}>
                            <Sparkles className="w-3 h-3" /> {c.matchScore}%
                          </span>
                        ) : (
                          <span className="text-[#718096] text-[10px] italic">Direct Claim</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          c.status === 'approved'
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                            : c.status === 'rejected'
                            ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30'
                            : c.status === 'MORE_INFO_REQUESTED'
                            ? 'bg-[#F3E5F5] text-[#7B1FA2] border-[#7B1FA2]/30'
                            : 'bg-[#FFF3E0] text-[#F57C00] border-[#FF9800]/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openClaimReview(id)}
                          className="px-3.5 py-1.5 bg-[#00695C] hover:bg-[#00897B] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-[#526579] font-medium">
                    No ownership claims matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Side-by-Side Complete Claim Review Modal */}
      {reviewClaim && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#00695C] font-bold uppercase tracking-wider">
                  Verification Dossier #{reviewClaim._id?.slice(-8).toUpperCase()}
                </span>
                <h2 className="text-xl font-extrabold text-[#16324F] flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-[#00695C]" />
                  Ownership Proof Evaluation
                </h2>
              </div>
              <button onClick={() => setReviewClaim(null)} className="text-[#718096] hover:text-[#16324F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Comparative Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Left Column: Custody Item Details */}
              <div className="p-5 bg-[#F7FAFC] border border-[#D9E2E8] rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#FF9800] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Property in Custody
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-[#D9E2E8] text-[#16324F]">
                    Status: {reviewClaim.item?.status || 'FOUND'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#16324F]">
                    {reviewClaim.item?.title || reviewClaim.item?.itemName}
                  </h4>
                  <p className="text-[#526579] mt-1 leading-relaxed font-medium">
                    {reviewClaim.item?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white rounded-xl border border-[#D9E2E8]">
                    <span className="text-[#718096] block font-medium">Category</span>
                    <span className="text-[#16324F] font-bold">{reviewClaim.item?.category}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#D9E2E8]">
                    <span className="text-[#718096] block font-medium">Storage Desk</span>
                    <span className="text-[#00695C] font-bold">{reviewClaim.item?.storageLocation || 'Security Desk'}</span>
                  </div>
                </div>

                {reviewClaim.item?.identifyingMarks && (
                  <div className="p-3 bg-[#FFF3E0] rounded-xl border border-[#FF9800]/30 text-[11px]">
                    <span className="text-[#F57C00] font-bold block">Confidential Distinctive Marks:</span>
                    <span className="text-[#16324F] font-mono font-bold">{reviewClaim.item?.identifyingMarks}</span>
                  </div>
                )}

                {reviewClaim.item?.images && reviewClaim.item?.images.length > 0 && (
                  <div>
                    <span className="text-[#718096] block text-[10px] font-bold uppercase mb-1">Custody Item Photos:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {reviewClaim.item?.images.map((img, idx) => (
                        <img key={idx} src={img} alt="custody" className="w-full h-20 object-cover rounded-xl border border-[#D9E2E8]" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Claimant's Proof & Submission */}
              <div className="p-5 bg-[#F7FAFC] border border-[#D9E2E8] rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#2E7D32] flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5" /> Claimant's Evidence
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-[#D9E2E8] text-[#16324F]">
                    Claim Status: {reviewClaim.status}
                  </span>
                </div>

                <div>
                  <span className="text-[#718096] block text-[10px] font-bold uppercase">Claimant Identity</span>
                  <div className="font-bold text-[#16324F] text-sm">
                    {reviewClaim.claimant?.fullName || reviewClaim.claimant?.name}
                  </div>
                  <div className="text-[11px] text-[#526579] font-medium">
                    Reg: <strong className="font-mono text-[#00695C]">{reviewClaim.claimant?.registerNumber || '—'}</strong> • Dept: {reviewClaim.claimant?.department || 'Student'}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D9E2E8]">
                  <span className="text-[#00695C] block text-[10px] font-bold uppercase">Stated Reason for Claim:</span>
                  <p className="text-[#16324F] mt-0.5 font-medium">{reviewClaim.reason}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D9E2E8]">
                  <span className="text-[#F57C00] block text-[10px] font-bold uppercase">Claimant's Proof of Ownership:</span>
                  <p className="text-[#16324F] mt-0.5 font-medium">{reviewClaim.ownershipProof || 'No additional proof text provided'}</p>
                </div>

                {reviewClaim.matchScore && (
                  <div className="p-3 bg-[#F1FAF9] rounded-xl border border-[#E0F2F1] flex items-center justify-between">
                    <div>
                      <span className="text-[#00695C] block text-[10px] font-bold uppercase">Algorithmic Match Score</span>
                      <span className="text-[#526579] text-[10px] font-medium">Computed by campus semantic matcher</span>
                    </div>
                    <div className="text-lg font-bold text-[#00695C] font-mono">
                      {reviewClaim.matchScore}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Decision Form */}
            {actionType ? (
              <div className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#D9E2E8] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#16324F] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    {actionType === 'approve' && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
                    {actionType === 'reject' && <XCircle className="w-4 h-4 text-[#D32F2F]" />}
                    {actionType === 'request_info' && <HelpCircle className="w-4 h-4 text-[#1976D2]" />}
                    Confirm Action: {actionType.replace('_', ' ').toUpperCase()}
                  </h4>
                  <button onClick={() => setActionType(null)} className="text-[#718096] hover:text-[#16324F] text-xs font-semibold cursor-pointer">
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                    {actionType === 'approve'
                      ? 'Administrative verification notes (Optional):'
                      : actionType === 'reject'
                      ? 'Rejection reason explaining ownership discrepancy (Required, min 5 chars):'
                      : 'Specific additional proof required from claimant (Required, min 5 chars):'}
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Provide clear notes for audit records..."
                    className="w-full p-3 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] h-20"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActionType(null)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant={actionType === 'approve' ? 'primary' : actionType === 'reject' ? 'danger' : 'accent'}
                    size="sm"
                    onClick={handleExecuteAction}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Executing...' : 'Confirm & Authorize'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#D9E2E8] flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewClaim(null)}
                >
                  Close Dossier
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActionType('request_info');
                      setActionReason('');
                    }}
                    className="text-[#1976D2] border-[#1976D2]/30 hover:bg-[#E3F2FD]"
                  >
                    Request More Info
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setActionType('reject');
                      setActionReason('');
                    }}
                  >
                    Reject Claim
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActionType('approve');
                      setActionReason('Proof verified at security reception desk.');
                    }}
                  >
                    Approve & Issue Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
