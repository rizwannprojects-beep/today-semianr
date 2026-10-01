import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  QrCode,
  FileText,
  UploadCloud,
  ChevronRight,
  X
} from 'lucide-react';
import itemService from '../services/itemService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedClaimForUpdate, setSelectedClaimForUpdate] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await itemService.getMyClaims();
      if (res?.data?.data) {
        setClaims(res.data.data);
      } else if (Array.isArray(res?.data)) {
        setClaims(res.data);
      }
    } catch (err) {
      console.warn('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleCancelClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to cancel this ownership claim?')) {
      return;
    }

    try {
      setCancellingId(claimId);
      await itemService.cancelClaim(claimId);
      setClaims((prev) =>
        prev.map((c) =>
          (c._id === claimId || c.id === claimId) ? { ...c, status: 'cancelled', verificationStatus: 'cancelled' } : c
        )
      );
      setFeedbackMessage('Claim cancelled successfully.');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error('Error cancelling claim:', err);
      alert(err.response?.data?.message || 'Could not cancel claim');
    } finally {
      setCancellingId(null);
    }
  };

  const handleUpdateClaim = async (e) => {
    e.preventDefault();
    if (!additionalNotes.trim()) return;

    try {
      setUpdateSubmitting(true);
      await itemService.updateClaim(selectedClaimForUpdate._id || selectedClaimForUpdate.id, {
        additionalDetails: additionalNotes.trim()
      });
      setSelectedClaimForUpdate(null);
      setAdditionalNotes('');
      setFeedbackMessage('Additional details provided to the coordinator.');
      fetchClaims();
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error('Error updating claim details:', err);
      alert(err.response?.data?.message || 'Failed to update claim');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F] tracking-tight flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-[#FF9800]" />
            My Property Claims
          </h1>
          <p className="text-xs sm:text-sm text-[#526579] font-medium mt-1">
            Track verification progress, provide ownership evidence, and access collection codes for approved items.
          </p>
        </div>

        <Link to="/browse-found">
          <Button variant="outline" size="sm">
            Browse Turned-in Items
          </Button>
        </Link>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-lg bg-[#E0F2F1] border border-[#00897B]/30 text-[#00695C] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00695C] shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-xl border border-[#D9E2E8] space-y-3 shadow-xs">
              <div className="h-5 bg-[#F0F7F6] rounded w-1/4"></div>
              <div className="h-14 bg-[#F0F7F6] rounded"></div>
            </div>
          ))}
        </div>
      ) : claims.length === 0 ? (
        <Card className="text-center py-16 space-y-4 border-dashed border-[#D9E2E8] bg-white shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] border border-[#FF9800]/30 flex items-center justify-center mx-auto text-[#D84315]">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#16324F]">No ownership claims filed</p>
            <p className="text-xs text-[#526579] font-medium max-w-sm mx-auto leading-relaxed">
              If you identify your lost property in the turned-in found items catalog, click "Claim This Item" to initiate identity verification.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/browse-found">
              <Button variant="accent" size="sm">
                Browse Found Catalog
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {claims.map((claim) => {
            const item = claim.item || claim.foundItem || {};
            const status = (claim.status || claim.verificationStatus || 'pending').toLowerCase();
            const isApproved = status === 'approved';
            const isRejected = status === 'rejected';
            const isUnderReview = status === 'underreview' || status === 'under_review';
            const isPending = status === 'pending';
            const isCancelled = status === 'cancelled';

            return (
              <Card
                key={claim._id || claim.id}
                className={`space-y-4 transition-all duration-200 bg-white shadow-xs ${
                  isApproved
                    ? 'border-[#2E7D32]/50 bg-[#F1FAF9]'
                    : isRejected
                    ? 'border-[#D32F2F]/30'
                    : isUnderReview
                    ? 'border-[#FF9800]/50 bg-[#FFFDF9]'
                    : 'border-[#D9E2E8]'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D9E2E8] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#16324F]">
                        {item.itemName || item.title || 'Campus Found Item'}
                      </h3>
                      <span className="text-[10px] text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded font-bold border border-[#00897B]/30">
                        {item.category || 'General Property'}
                      </span>
                    </div>
                    <p className="text-xs text-[#526579] font-medium mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#718096]" />
                      <span>Filed on {new Date(claim.createdAt).toLocaleDateString()}</span>
                      <span className="text-[#D9E2E8]">•</span>
                      <span className="font-mono text-[#00695C] font-semibold">Claim #{String(claim._id || claim.id).slice(-6).toUpperCase()}</span>
                    </p>
                  </div>

                  <StatusBadge status={status} />
                </div>

                {/* Submitted Proof Section */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#526579] uppercase tracking-wider">
                    Your Ownership Verification Statement
                  </span>
                  <p className="text-xs text-[#16324F] font-medium bg-[#F7FAFC] p-3.5 rounded-xl border border-[#D9E2E8] leading-relaxed">
                    {claim.ownershipProof || claim.proofDetails || 'Detailed proof submitted'}
                  </p>
                  {claim.additionalDetails && (
                    <p className="text-xs text-[#526579] italic bg-[#F7FAFC] p-2.5 rounded-lg border border-[#D9E2E8]">
                      Additional Info: {claim.additionalDetails}
                    </p>
                  )}
                </div>

                {/* Storage & Custody Desk info */}
                {item.storageLocation && (
                  <div className="text-xs text-[#526579] font-medium flex items-center gap-2 bg-[#F1FAF9] p-2.5 rounded-lg border border-[#E0F2F1]">
                    <Building2 className="w-4 h-4 text-[#FF9800] shrink-0" />
                    <span>Current Holding Facility: <strong className="text-[#00695C] font-bold">{item.storageLocation}</strong></span>
                  </div>
                )}

                {/* Status-specific State Blocks */}

                {/* Approved State */}
                {isApproved && (
                  <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/40 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-[#2E7D32] text-sm">
                          Ownership Verified &amp; Approved
                        </h4>
                        <p className="text-xs text-[#16324F] font-medium mt-0.5 leading-relaxed">
                          Your proof matches records on file. Please report to the{' '}
                          <strong className="text-[#00695C]">{item.storageLocation || 'Central Security Desk'}</strong> to complete item collection handover.
                        </p>
                      </div>
                    </div>

                    {/* Return Code Box */}
                    <div className="bg-white p-3 rounded-lg border border-[#2E7D32]/30 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <QrCode className="w-5 h-5 text-[#00695C]" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#00695C] tracking-wider">
                            Pickup Verification Code
                          </span>
                          <p className="text-lg font-mono font-extrabold text-[#16324F] tracking-widest">
                            {claim.returnVerificationCode || `CL-${String(claim._id || claim.id).slice(-6).toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-1 rounded-md font-bold">
                        Present with Student ID Card
                      </span>
                    </div>
                  </div>
                )}

                {/* Under Review / More Info Requested State */}
                {isUnderReview && (
                  <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#F9A825]/50 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#FF9800] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#D84315] text-sm">
                          Coordinator Requested Additional Verification
                        </h4>
                        <p className="text-xs text-[#526579] font-medium leading-relaxed">
                          {claim.verificationNotes || 'The verification coordinator needs more distinguishing details before approving this claim.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => setSelectedClaimForUpdate(claim)}
                      >
                        Provide Required Information
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rejected State */}
                {isRejected && (
                  <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#D32F2F]/30 flex items-start gap-3 text-xs text-[#D32F2F]">
                    <XCircle className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#D32F2F] text-sm">
                        Verification Unsuccessful
                      </h4>
                      <p className="text-[#526579] font-medium mt-0.5 leading-relaxed">
                        Reason: {claim.rejectionReason || 'The identifying details provided did not conclusively match the cataloged property characteristics.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pending State */}
                {isPending && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#D9E2E8]">
                    <div className="flex items-center gap-2 text-xs text-[#D84315] font-semibold">
                      <Clock className="w-4 h-4 text-[#FF9800] shrink-0" />
                      <span>Pending queue review by campus property administrators.</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelClaim(claim._id || claim.id)}
                      disabled={cancellingId === (claim._id || claim.id)}
                      className="text-[#D32F2F] hover:bg-[#FFEBEE]"
                    >
                      {cancellingId === (claim._id || claim.id) ? 'Cancelling...' : 'Cancel Claim'}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Additional Details Modal */}
      {selectedClaimForUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl w-full max-w-lg overflow-hidden shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <h3 className="font-bold text-[#16324F] text-base">Provide Additional Verification Details</h3>
              <button
                onClick={() => setSelectedClaimForUpdate(null)}
                className="text-[#718096] hover:text-[#16324F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClaim} className="space-y-4">
              <p className="text-xs text-[#526579] font-medium leading-relaxed">
                Please provide any additional identifying details, serial numbers, receipts, or purchase date info to assist campus security in verifying your claim.
              </p>

              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Example: The phone has a scratch near the lower speaker grill, or my student ID receipt was inside the cover..."
                rows={4}
                required
                className="w-full bg-white border border-[#D9E2E8] rounded-xl p-3 text-xs text-[#16324F] placeholder:text-[#718096] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClaimForUpdate(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={updateSubmitting || !additionalNotes.trim()}
                >
                  {updateSubmitting ? 'Submitting...' : 'Submit Information'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClaims;
