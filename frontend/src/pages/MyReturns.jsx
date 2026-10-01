import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  RotateCcw,
  X,
  Building,
  UserCheck
} from 'lucide-react';
import itemService from '../services/itemService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Scheduling Modal State
  const [schedulingReturn, setSchedulingReturn] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Administration & Security Desk');
  const [scheduleMethod, setScheduleMethod] = useState('Campus Office Pickup');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Dispute Modal State
  const [disputingReturn, setDisputingReturn] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await itemService.getReturns();
      if (res?.data?.data) {
        setReturns(res.data.data);
      } else if (Array.isArray(res?.data)) {
        setReturns(res.data);
      }
    } catch (err) {
      console.warn('Could not load returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleConfirmReceived = async (returnId) => {
    if (!window.confirm('Confirm that you have physically received this item in good order?')) {
      return;
    }
    try {
      await itemService.confirmReceived(returnId, 'Confirmed receipt by student owner');
      setFeedback({ type: 'success', message: 'Item receipt confirmed! Thank you.' });
      fetchReturns();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to confirm receipt' });
    }
  };

  const handleOpenSchedule = (ret) => {
    setSchedulingReturn(ret);
    setScheduleLocation(ret.meetingLocation || 'Administration & Security Desk');
    setScheduleMethod(ret.returnMethod || 'Campus Office Pickup');
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setScheduleDate(tmrw.toISOString().split('T')[0]);
    setScheduleTime('14:00');
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleDate) return;
    try {
      setSubmittingSchedule(true);
      await itemService.scheduleReturn(schedulingReturn._id || schedulingReturn.id, {
        date: scheduleDate,
        time: scheduleTime,
        location: scheduleLocation,
        returnMethod: scheduleMethod
      });
      setFeedback({ type: 'success', message: 'Return appointment scheduled successfully!' });
      setSchedulingReturn(null);
      fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not schedule return');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      setSubmittingDispute(true);
      await itemService.disputeReturn(disputingReturn._id || disputingReturn.id, {
        reason: disputeReason,
        description: disputeDescription
      });
      setFeedback({ type: 'success', message: 'Dispute submitted. Administration will review immediately.' });
      setDisputingReturn(null);
      setDisputeReason('');
      setDisputeDescription('');
      fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  // Helper to render visual return progress bar
  const renderProgressBar = (status) => {
    const s = (status || '').toUpperCase();
    const steps = [
      { key: 'APPROVED', label: 'Claim Approved' },
      { key: 'SCHEDULED', label: 'Scheduled' },
      { key: 'VERIFICATION', label: 'Identity Verification' },
      { key: 'HANDOVER', label: 'Handover' },
      { key: 'RETURNED', label: 'Returned' }
    ];

    let currentStepIdx = 0;
    if (s === 'READY_FOR_RETURN') currentStepIdx = 0;
    else if (s === 'SCHEDULED' || s === 'OWNER_ARRIVED') currentStepIdx = 1;
    else if (s === 'IDENTITY_VERIFICATION') currentStepIdx = 2;
    else if (s === 'HANDOVER_PENDING') currentStepIdx = 3;
    else if (s === 'RETURNED') currentStepIdx = 4;
    else if (s === 'DISPUTED') currentStepIdx = 3;

    return (
      <div className="w-full my-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[#526579] mb-2">
          {steps.map((st, idx) => (
            <div
              key={st.key}
              className={`flex items-center gap-1.5 ${
                idx <= currentStepIdx ? 'text-[#00695C] font-bold' : 'text-[#718096]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  idx < currentStepIdx
                    ? 'bg-[#00695C] text-white shadow-sm'
                    : idx === currentStepIdx
                    ? 'bg-[#FF9800] text-white ring-4 ring-[#FF9800]/20 shadow-sm'
                    : 'bg-[#E2E8F0] text-[#718096]'
                }`}
              >
                {idx < currentStepIdx ? '✓' : idx + 1}
              </div>
              <span className="hidden sm:inline">{st.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#00695C] h-full transition-all duration-500 rounded-full"
            style={{ width: `${(currentStepIdx / 4) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9E2E8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PackageCheck className="w-7 h-7 text-[#00695C]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
              Item Returns & Handovers
            </h1>
          </div>
          <p className="text-[#526579] text-sm">
            Manage authorized physical item handovers, verification codes, and official digital receipts.
          </p>
        </div>
        <Link to="/my-claims">
          <Button variant="outline" size="sm">
            View My Claims
          </Button>
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between font-medium ${
            feedback.type === 'success'
              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30'
              : 'bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{feedback.message}</p>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[#718096] hover:text-[#16324F] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-[#E0F2F1] rounded w-1/4 mb-4" />
              <div className="h-4 bg-[#F7FAFC] rounded w-3/4 mb-2" />
              <div className="h-4 bg-[#F7FAFC] rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-[#D9E2E8]">
          <PackageCheck className="w-12 h-12 text-[#718096] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#16324F] mb-1">No Active Item Returns</h3>
          <p className="text-sm text-[#526579] max-w-md mx-auto mb-6 leading-relaxed">
            When an ownership claim on a found item is verified and approved, the authorized return handover workflow will automatically appear here.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/my-claims">
              <Button variant="outline" size="sm">
                Check Filed Claims
              </Button>
            </Link>
            <Link to="/matches">
              <Button variant="primary" size="sm">
                View Matches
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {returns.map((ret) => {
            const isOwner = ret.isOwner;
            const isReturned = ret.status === 'RETURNED';
            const isDisputed = ret.status === 'DISPUTED';

            return (
              <Card key={ret._id || ret.id} className="p-6 overflow-hidden space-y-4">
                {/* Top Bar: Item summary + Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#D9E2E8]">
                  <div className="flex items-start gap-4">
                    {ret.item?.images?.[0] ? (
                      <img
                        src={ret.item.images[0]}
                        alt="Item thumbnail"
                        className="w-16 h-16 rounded-xl object-cover border border-[#D9E2E8] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#E0F2F1] border border-[#00695C]/20 flex items-center justify-center text-[#00695C] font-bold text-xl flex-shrink-0">
                        {ret.item?.itemName?.[0] || 'IT'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/20">
                          {isOwner ? 'Your Claimed Item' : 'Found Item You Reported'}
                        </span>
                        <span className="text-xs font-semibold text-[#718096]">
                          ID: {(ret._id || ret.id).slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[#16324F] leading-snug">
                        {ret.item?.itemName || ret.item?.title || 'Reported Item'}
                      </h2>
                      <p className="text-xs text-[#526579] font-medium">
                        Category: {ret.item?.category} • Found at: {ret.item?.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <StatusBadge status={ret.status} />
                  </div>
                </div>

                {/* Visual Progress Bar */}
                {renderProgressBar(ret.status)}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] text-sm">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] mb-2.5">
                      Handover Logistics
                    </h3>
                    <div className="space-y-2 text-[#16324F]">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                        <span className="font-semibold text-[#526579]">Method:</span>
                        <span className="font-medium">{ret.returnMethod || 'Campus Office Pickup'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                        <span className="font-semibold text-[#526579]">Location:</span>
                        <span className="font-medium">{ret.meetingLocation || 'Central Security Desk'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                        <span className="font-semibold text-[#526579]">Schedule:</span>
                        <span className="font-medium">
                          {ret.scheduledDate
                            ? `${new Date(ret.scheduledDate).toLocaleDateString()} ${ret.scheduledTime || ''}`
                            : 'Drop-in during office hours (9:00 AM - 5:00 PM)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] mb-2.5">
                      Verification & Security
                    </h3>
                    {isOwner ? (
                      <div className="space-y-2">
                        {ret.verificationCode ? (
                          <div className="p-3 bg-white border border-[#00695C]/30 rounded-xl shadow-xs">
                            <span className="text-xs text-[#526579] font-medium block">Your Secret Verification Code:</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-lg font-mono font-extrabold tracking-wider text-[#00695C]">
                                {ret.verificationCode}
                              </span>
                              <button
                                onClick={() => handleCopyCode(ret.verificationCode)}
                                className="flex items-center gap-1 text-xs font-bold text-[#00695C] hover:text-[#00897B] bg-[#E0F2F1] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                {copiedCode === ret.verificationCode ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-[#718096] mt-1">
                              Present this code and your Student ID card to the custodian.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-[#526579] font-medium">
                            Verification completed. Code has been securely retired.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-[#16324F]">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                          <span className="font-semibold text-[#526579]">Verified Student:</span>
                          <span className="font-bold text-[#16324F]">{ret.verifiedOwnerIdentity?.fullName || ret.owner?.fullName || 'Verified Claimant'}</span>
                        </div>
                        <div className="text-xs text-[#526579]">
                          Register No: {ret.verifiedOwnerIdentity?.registerNumber || ret.owner?.registerNumber || 'Verified on ID'}
                        </div>
                        <div className="text-xs text-[#526579]">
                          Department: {ret.verifiedOwnerIdentity?.department || ret.owner?.department || 'Campus Department'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D9E2E8]">
                  <div className="flex items-center gap-2">
                    {/* View Handover Station Link */}
                    <Link to={`/return/${ret._id || ret.id}`}>
                      <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Open Handover Station</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    {/* Schedule Button */}
                    {!isReturned && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSchedule(ret)}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </Button>
                    )}

                    {/* Digital Receipt Button */}
                    {isReturned && ret.receipt?.receiptNumber && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveReceipt(ret)}
                        className="flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Return Receipt</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Owner Confirm Received Button */}
                    {isOwner && !isReturned && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmReceived(ret._id || ret.id)}
                        className="text-[#2E7D32] border-[#2E7D32]/40 hover:bg-[#E8F5E9]"
                      >
                        Confirm Received
                      </Button>
                    )}

                    {/* Report Dispute Button */}
                    {!isReturned && !isDisputed && (
                      <button
                        onClick={() => setDisputingReturn(ret)}
                        className="text-xs text-[#718096] hover:text-[#D32F2F] font-semibold px-2 py-1 rounded transition cursor-pointer"
                      >
                        Report Issue
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {schedulingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl border border-[#D9E2E8] rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2E8] mb-4">
              <h3 className="font-bold text-lg text-[#16324F] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00695C]" />
                Schedule Return Appointment
              </h3>
              <button
                onClick={() => setSchedulingReturn(null)}
                className="text-[#718096] hover:text-[#16324F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-[#16324F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Preferred Time (Optional)
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-[#16324F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Handover Location
                </label>
                <input
                  type="text"
                  value={scheduleLocation}
                  onChange={(e) => setScheduleLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-[#16324F] focus:outline-none"
                  placeholder="e.g. Administration & Security Desk"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Return Method
                </label>
                <select
                  value={scheduleMethod}
                  onChange={(e) => setScheduleMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-[#16324F] focus:outline-none bg-white"
                >
                  <option value="Campus Office Pickup">Campus Office Pickup</option>
                  <option value="Authorized Staff Handover">Authorized Staff Handover</option>
                  <option value="Department Office">Department Office</option>
                  <option value="Direct Handover">Direct Handover</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSchedulingReturn(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingSchedule}
                >
                  {submittingSchedule ? 'Saving...' : 'Confirm Appointment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Dispute Modal */}
      {disputingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl border border-[#D9E2E8] rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2E8] mb-4">
              <h3 className="font-bold text-lg text-[#D32F2F] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D32F2F]" />
                Report Return Dispute
              </h3>
              <button
                onClick={() => setDisputingReturn(null)}
                className="text-[#718096] hover:text-[#16324F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <p className="text-xs text-[#526579] leading-relaxed">
                Please explain the issue (e.g. wrong item handed over, damaged condition, unauthorized recipient). This will immediately halt the handover and alert campus administrators.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Reason for Dispute *
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-[#16324F] focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Wrong Item Handed Over">Wrong Item Handed Over</option>
                  <option value="Item Condition Damaged or Altered">Item Condition Damaged or Altered</option>
                  <option value="Recipient Identity Mismatch">Recipient Identity Mismatch</option>
                  <option value="Verification Code Issue">Verification Code Issue</option>
                  <option value="Other Discrepancy">Other Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Specific Details & Description
                </label>
                <textarea
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Describe the discrepancy clearly..."
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-[#16324F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDisputingReturn(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={submittingDispute || !disputeReason}
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Official Return Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-8 bg-white shadow-2xl rounded-2xl border border-[#D9E2E8]">
            <div className="text-center pb-6 border-b border-[#D9E2E8]">
              <div className="w-14 h-14 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#2E7D32]/20">
                <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#16324F]">Official Return Receipt</h2>
              <p className="text-xs text-[#00695C] font-mono font-bold mt-1">
                Receipt Number: {activeReceipt.receipt?.receiptNumber || 'REC-COMPLETED'}
              </p>
            </div>

            <div className="py-6 space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[#D9E2E8]">
                <span className="text-[#526579]">Item Name:</span>
                <span className="font-bold text-[#16324F]">{activeReceipt.item?.itemName || activeReceipt.item?.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D9E2E8]">
                <span className="text-[#526579]">Returned To:</span>
                <span className="font-bold text-[#16324F]">
                  {activeReceipt.verifiedOwnerIdentity?.fullName || activeReceipt.owner?.fullName}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D9E2E8]">
                <span className="text-[#526579]">Register Number:</span>
                <span className="font-mono font-bold text-[#00695C]">
                  {activeReceipt.verifiedOwnerIdentity?.registerNumber || activeReceipt.owner?.registerNumber || 'Verified on ID'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D9E2E8]">
                <span className="text-[#526579]">Handover Location:</span>
                <span className="text-[#16324F] font-medium">{activeReceipt.meetingLocation || 'Central Security Desk'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D9E2E8]">
                <span className="text-[#526579]">Date & Time:</span>
                <span className="text-[#16324F] font-medium">
                  {activeReceipt.completedAt
                    ? new Date(activeReceipt.completedAt).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#526579]">Verification State:</span>
                <span className="font-bold text-[#2E7D32]">✓ Cryptographically Verified</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D9E2E8] flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveReceipt(null)}
              >
                Close Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyReturns;
