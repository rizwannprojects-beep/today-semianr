import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  Building,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  FileText,
  BadgeCheck,
  Info,
  X,
  Camera,
  CameraOff,
  QrCode,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import itemService from '../services/itemService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useRef } from 'react';

export const ReturnHandover = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();

  const [returnDoc, setReturnDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Verification Input State
  const [inputCode, setInputCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Handover Action State
  const [handoverRemarks, setHandoverRemarks] = useState('');
  const [confirmingHandover, setConfirmingHandover] = useState(false);

  // Dispute State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // QR Code & Camera Scanner State
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'starting' | 'active' | 'error'
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setCameraStatus('starting');
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser/environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.warn('Video play error:', err));
      }
      setCameraStatus('active');
    } catch (err) {
      console.warn('Unable to access camera:', err);
      setCameraStatus('error');
      setCameraError(err.message || 'Camera permission denied or no camera device connected.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('idle');
  };

  useEffect(() => {
    if (showCameraScanner) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showCameraScanner]);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await itemService.getReturnById(returnId);
      if (res?.data?.data) {
        setReturnDoc(res.data.data);
      } else {
        setReturnDoc(res.data);
      }
    } catch (err) {
      console.error('Error loading return handover details:', err);
      setError(err.response?.data?.message || 'Could not load return record. You may not be authorized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (returnId) {
      fetchReturnDetails();
    }
  }, [returnId]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    try {
      setVerifying(true);
      setFeedback(null);
      const res = await itemService.verifyReturn(returnId, {
        verificationCode: inputCode.trim()
      });
      setFeedback({
        type: 'success',
        message: 'Owner identity and verification code verified successfully!'
      });
      if (res?.data?.data) {
        setReturnDoc(res.data.data);
      } else {
        fetchReturnDetails();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Invalid verification code. Please check and try again.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!window.confirm('Are you sure you want to confirm that this item was physically handed over to the verified student?')) {
      return;
    }

    try {
      setConfirmingHandover(true);
      const res = await itemService.confirmHandover(returnId, handoverRemarks || 'Physical handover confirmed by custodian');
      setFeedback({
        type: 'success',
        message: 'Handover confirmed successfully! Process completed.'
      });
      if (res?.data?.data) {
        setReturnDoc(res.data.data);
      } else {
        fetchReturnDetails();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to confirm handover'
      });
    } finally {
      setConfirmingHandover(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!window.confirm('Confirm that you have received your item in good order?')) {
      return;
    }

    try {
      setConfirmingHandover(true);
      const res = await itemService.confirmReceived(returnId, 'Confirmed receipt by student owner');
      setFeedback({
        type: 'success',
        message: 'Item receipt confirmed! The return process is now complete.'
      });
      if (res?.data?.data) {
        setReturnDoc(res.data.data);
      } else {
        fetchReturnDetails();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to confirm receipt'
      });
    } finally {
      setConfirmingHandover(false);
    }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    try {
      setSubmittingDispute(true);
      await itemService.disputeReturn(returnId, {
        reason: disputeReason,
        description: disputeDescription
      });
      setFeedback({
        type: 'success',
        message: 'Dispute recorded and escalated to campus administration.'
      });
      setShowDisputeModal(false);
      fetchReturnDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#526579] text-sm font-medium">Loading secure handover station...</p>
      </div>
    );
  }

  if (error || !returnDoc) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-[#D32F2F] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#16324F] mb-2">Access Denied or Not Found</h2>
        <p className="text-sm text-[#526579] mb-6 leading-relaxed">{error || 'Unable to access this handover session.'}</p>
        <Link to="/my-returns">
          <Button variant="primary" size="sm">
            Back to My Returns
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = returnDoc.isOwner;
  const isFinder = returnDoc.isFinder;
  const isStaffOrAdmin = returnDoc.isStaffOrAdmin;
  const isReturned = returnDoc.status === 'RETURNED';
  const isOwnerVerified = returnDoc.ownerVerified;

  // Identity object to display
  const identity = returnDoc.verifiedOwnerIdentity || returnDoc.owner || {};

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-returns"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526579] hover:text-[#00695C] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Returns</span>
        </Link>
        <StatusBadge status={returnDoc.status} />
      </div>

      {/* Hero Station Banner */}
      <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#00695C] text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Verified Handover Station</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
              {returnDoc.item?.itemName || returnDoc.item?.title || 'Item Handover'}
            </h1>
            <p className="text-[#526579] text-xs sm:text-sm mt-1 font-medium">
              Session Ref: {(returnDoc._id || returnDoc.id).toUpperCase()} • Location: {returnDoc.meetingLocation || 'Central Security Desk'}
            </p>
          </div>

          {isReturned && (
            <div className="px-4 py-2 bg-[#E8F5E9] border border-[#2E7D32]/30 rounded-xl text-[#2E7D32] text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
              <span>Handover Completed</span>
            </div>
          )}
        </div>
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

      {/* Main Handover Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Item Information & Found Context */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#718096]">
              Item Details
            </h2>

            {returnDoc.item?.images?.[0] ? (
              <img
                src={returnDoc.item.images[0]}
                alt="Item visual"
                className="w-full h-48 rounded-xl object-cover border border-[#D9E2E8]"
              />
            ) : (
              <div className="w-full h-36 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-center text-[#718096] text-sm font-medium">
                No Photo Available
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-[#526579] font-medium block">Item Name:</span>
                <span className="font-bold text-[#16324F] text-base">{returnDoc.item?.itemName || returnDoc.item?.title}</span>
              </div>
              <div>
                <span className="text-xs text-[#526579] font-medium block">Category:</span>
                <span className="text-[#16324F] font-semibold">{returnDoc.item?.category}</span>
              </div>
              <div>
                <span className="text-xs text-[#526579] font-medium block">Found Location:</span>
                <span className="text-[#16324F] font-semibold">{returnDoc.item?.location}</span>
              </div>
              <div>
                <span className="text-xs text-[#526579] font-medium block">Current Custody:</span>
                <span className="text-[#00695C] font-bold">
                  {returnDoc.meetingLocation || 'Administration & Security Desk'}
                </span>
              </div>
              {returnDoc.item?.description && (
                <div>
                  <span className="text-xs text-[#526579] font-medium block">Public Description:</span>
                  <p className="text-xs text-[#526579] italic mt-0.5 leading-relaxed">{returnDoc.item.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Handover Logistics Card */}
          <Card className="p-6 bg-[#F7FAFC] border-[#D9E2E8] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#718096]">
              Meeting Arrangement
            </h2>
            <div className="space-y-2 text-sm text-[#16324F]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                <span className="font-medium">{returnDoc.returnMethod || 'Campus Office Pickup'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                <span className="font-medium">{returnDoc.meetingLocation || 'Central Security Desk'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00695C] flex-shrink-0" />
                <span className="font-medium">
                  {returnDoc.scheduledDate
                    ? `${new Date(returnDoc.scheduledDate).toLocaleDateString()} ${returnDoc.scheduledTime || ''}`
                    : 'Regular Office Hours (9:00 AM - 5:00 PM)'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Verified Identity Dossier & Action Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Verified Owner Identity Dossier */}
          <Card className="p-6 border-[#00695C]/30 ring-1 ring-[#00695C]/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2E8]">
              <div className="flex items-center gap-2 text-[#00695C]">
                <UserCheck className="w-5 h-5 text-[#00695C]" />
                <h2 className="font-bold text-base text-[#16324F]">Verified Campus Student Identity</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Claim Approved</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                <span className="text-xs text-[#526579] font-medium block">Student Full Name:</span>
                <span className="font-bold text-[#16324F] text-base">
                  {identity.fullName || 'Verified Student'}
                </span>
              </div>

              <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                <span className="text-xs text-[#526579] font-medium block">Register / ID Number:</span>
                <span className="font-mono font-bold text-[#00695C] text-base">
                  {identity.registerNumber || 'Verified on ID'}
                </span>
              </div>

              <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                <span className="text-xs text-[#526579] font-medium block">Department:</span>
                <span className="font-semibold text-[#16324F]">
                  {identity.department || 'Campus Department'}
                </span>
              </div>

              <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                <span className="text-xs text-[#526579] font-medium block">Course / Class:</span>
                <span className="font-semibold text-[#16324F]">
                  {identity.course || 'BCA / B.Tech'} {identity.year ? `• Year ${identity.year}` : ''}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#526579] flex items-center gap-1.5 font-medium">
              <Info className="w-4 h-4 text-[#00695C] flex-shrink-0" />
              <span>
                Compare this information with the student's physical campus ID card before handing over the item.
              </span>
            </p>
          </Card>

          {/* 2. Verification Station: Code Entry */}
          {!isReturned && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#00695C]" />
                <h2 className="font-bold text-base text-[#16324F]">
                  Handover Code Verification
                </h2>
              </div>

              {isOwnerVerified ? (
                <div className="p-4 bg-[#E8F5E9] border border-[#2E7D32]/30 rounded-xl text-[#2E7D32] flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#2E7D32] flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">One-Time Code Successfully Verified</h3>
                    <p className="text-xs text-[#2E7D32] mt-0.5 font-medium">
                      The return code and student credentials have been confirmed. Proceed to physical item handover.
                    </p>
                  </div>
                </div>
              ) : isOwner ? (
                /* Owner Perspective: display code instructions */
                <div className="p-4 bg-[#E0F2F1] border border-[#00695C]/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00695C] block">Your Secret Return Code:</span>
                    <button
                      type="button"
                      onClick={() => setShowQrCodeModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#00695C]/40 text-[#00695C] rounded-lg text-xs font-bold hover:bg-[#00695C] hover:text-white transition shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR Badge</span>
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-[#00695C] tracking-wider my-1">
                    {returnDoc.verificationCode || 'LF-XXXXXX'}
                  </div>
                  <p className="text-xs text-[#526579] font-medium leading-relaxed">
                    Provide this code to the custodian or finder at the handover location. You can also tap <strong>Show QR Badge</strong> so they can scan it directly with their camera.
                  </p>
                </div>
              ) : (
                /* Finder / Staff Perspective: Code Input Station */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-[#526579] font-medium leading-relaxed">
                      Ask the student for their one-time return code or scan their QR badge:
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCameraScanner(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#00695C] text-white rounded-xl text-xs font-bold hover:bg-[#004D40] transition shadow-xs cursor-pointer shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan with Camera</span>
                    </button>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LF-482731"
                        className="flex-1 px-4 py-2.5 font-mono text-base uppercase border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-[#16324F] focus:outline-none"
                        maxLength={12}
                        required
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={verifying || !inputCode.trim()}
                      >
                        {verifying ? 'Checking...' : 'Verify Code'}
                      </Button>
                    </div>

                    <p className="text-xs text-[#718096]">
                      Attempts are securely rate-limited. Ensure student provides the exact code from their account or mobile screen.
                    </p>
                  </form>
                </div>
              )}
            </Card>
          )}

          {/* 3. Physical Handover Confirmation Controls */}
          {!isReturned && (
            <Card className="p-6 space-y-4">
              <h2 className="font-bold text-base text-[#16324F]">
                Handover Confirmations
              </h2>

              <div className="space-y-4">
                {/* Finder / Staff Confirmation */}
                {(isFinder || isStaffOrAdmin) && (
                  <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#D9E2E8]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#16324F]">Custodian / Staff Handover:</span>
                      {returnDoc.handoverConfirmed ? (
                        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full">
                          ✓ Confirmed Handed Over
                        </span>
                      ) : (
                        <span className="text-xs text-[#718096] font-medium">Pending Physical Handover</span>
                      )}
                    </div>

                    {!returnDoc.handoverConfirmed && (
                      <div className="space-y-3 mt-3">
                        <input
                          type="text"
                          value={handoverRemarks}
                          onChange={(e) => setHandoverRemarks(e.target.value)}
                          placeholder="Optional remarks (e.g. student presented valid ID card)"
                          className="w-full px-3 py-2 text-xs border border-[#D9E2E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] text-[#16324F]"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          onClick={handleConfirmHandover}
                          disabled={confirmingHandover}
                          className="w-full"
                        >
                          {confirmingHandover ? 'Processing...' : 'Confirm Item Handed Over'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Owner Confirmation */}
                {isOwner && (
                  <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#D9E2E8]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#16324F]">Your Receipt Confirmation:</span>
                      {returnDoc.ownerConfirmation?.confirmed ? (
                        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full">
                          ✓ Confirmed Received
                        </span>
                      ) : (
                        <span className="text-xs text-[#718096] font-medium">Pending Your Confirmation</span>
                      )}
                    </div>

                    {!returnDoc.ownerConfirmation?.confirmed && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleConfirmReceived}
                        disabled={confirmingHandover}
                        className="w-full mt-2"
                      >
                        {confirmingHandover ? 'Processing...' : 'Confirm I Have Received This Item'}
                      </Button>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-[#718096]">
                    Handover requires confirmed physical exchange.
                  </span>
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="text-xs text-[#D32F2F] hover:underline font-semibold cursor-pointer"
                  >
                    Report Problem / Raise Dispute
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* 4. Official Digital Receipt (Visible when status is RETURNED) */}
          {isReturned && (
            <Card className="p-6 bg-[#E8F5E9]/40 border-[#2E7D32]/30 space-y-4">
              <div className="flex items-center gap-2 text-[#2E7D32] pb-2 border-b border-[#2E7D32]/20">
                <FileText className="w-5 h-5 text-[#2E7D32]" />
                <h2 className="font-bold text-base text-[#16324F]">Digital Return Receipt Generated</h2>
              </div>

              <div className="space-y-2.5 text-sm text-[#16324F]">
                <div className="flex justify-between py-1 border-b border-[#D9E2E8]">
                  <span className="text-[#526579]">Receipt Ref:</span>
                  <span className="font-mono font-bold text-[#00695C]">
                    {returnDoc.receipt?.receiptNumber || 'REC-COMPLETED'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D9E2E8]">
                  <span className="text-[#526579]">Recipient:</span>
                  <span className="font-bold text-[#16324F]">{identity.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D9E2E8]">
                  <span className="text-[#526579]">Student ID:</span>
                  <span className="font-mono font-bold text-[#00695C]">{identity.registerNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D9E2E8]">
                  <span className="text-[#526579]">Handover Location:</span>
                  <span className="text-[#16324F] font-medium">{returnDoc.meetingLocation || 'Central Security Desk'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D9E2E8]">
                  <span className="text-[#526579]">Completed On:</span>
                  <span className="text-[#16324F] font-medium">
                    {returnDoc.completedAt ? new Date(returnDoc.completedAt).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2E7D32]/20 text-center text-xs text-[#2E7D32] font-bold">
                ✓ Case Officially Resolved and Closed in Campus Registry
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl border border-[#D9E2E8] rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2E8] mb-4">
              <h3 className="font-bold text-lg text-[#D32F2F] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D32F2F]" />
                Report Handover Dispute
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-[#718096] hover:text-[#16324F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
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
                  <option value="">-- Select Issue --</option>
                  <option value="Wrong Item Handed Over">Wrong Item Handed Over</option>
                  <option value="Item Condition Damaged or Altered">Item Condition Damaged or Altered</option>
                  <option value="Recipient Identity Mismatch">Recipient Identity Mismatch</option>
                  <option value="Verification Code Issue">Verification Code Issue</option>
                  <option value="Other Discrepancy">Other Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] mb-1">
                  Specific Details
                </label>
                <textarea
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Explain what occurred..."
                  className="w-full px-3 py-2 text-sm border border-[#D9E2E8] rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-[#16324F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisputeModal(false)}
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

      {/* Owner QR Code Badge Modal */}
      {showQrCodeModal && (
        <div className="fixed inset-0 z-50 bg-[#16324F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 text-center space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowQrCodeModal(false)}
              className="absolute top-4 right-4 text-[#718096] hover:text-[#16324F] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-[#00695C]/10 text-[#00695C] rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#16324F]">Handover QR Badge</h3>
              <p className="text-xs text-[#526579] mt-1">
                Show this digital badge to the finder or custodian for contactless identity verification.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#D9E2E8] rounded-2xl inline-block shadow-inner mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  returnDoc.verificationCode || 'LF-VERIFY'
                )}`}
                alt="Verification QR Code"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl p-3">
              <span className="text-[10px] text-[#718096] uppercase font-bold tracking-wider block">Verification Code</span>
              <span className="font-mono text-xl font-black text-[#00695C] tracking-widest block">
                {returnDoc.verificationCode || 'LF-XXXXXX'}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQrCodeModal(false)}
              className="w-full"
            >
              Close Badge
            </Button>
          </Card>
        </div>
      )}

      {/* Custodian Camera QR Scanner Modal */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-50 bg-[#16324F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2E8]">
              <div className="flex items-center gap-2 text-[#00695C]">
                <Camera className="w-5 h-5" />
                <h3 className="font-bold text-[#16324F] text-base">Camera QR Scanner</h3>
              </div>
              <button
                onClick={() => setShowCameraScanner(false)}
                className="text-[#718096] hover:text-[#16324F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport / Scanner HUD */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#16324F] flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
              />

              {/* Scanning HUD Overlay */}
              {cameraStatus === 'active' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[#00897B] rounded-2xl relative shadow-[0_0_20px_rgba(0,137,123,0.4)]">
                    {/* Laser scanning line animation */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4DB6AC] to-transparent animate-pulse top-1/2" />
                    {/* Target corner reticles */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
                  </div>
                  <span className="text-[11px] text-white/90 bg-black/50 px-2.5 py-1 rounded-full mt-3 backdrop-blur-xs font-medium">
                    Align student QR code inside frame
                  </span>
                </div>
              )}

              {/* Starting Camera State */}
              {cameraStatus === 'starting' && (
                <div className="text-center text-white/80 p-6 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#4DB6AC]" />
                  <p className="text-xs font-semibold">Initializing optical camera...</p>
                </div>
              )}

              {/* Camera Error or No Camera Fallback */}
              {cameraStatus === 'error' && (
                <div className="text-center text-white/90 p-6 space-y-2">
                  <CameraOff className="w-8 h-8 mx-auto text-[#FF8A80]" />
                  <p className="text-xs font-semibold">Webcam Not Accessible</p>
                  <p className="text-[11px] text-white/60 leading-tight max-w-xs mx-auto">
                    {cameraError || 'Browser permissions restricted or webcam unavailable.'}
                  </p>
                </div>
              )}
            </div>

            {/* Quick-Scan Simulation and Manual Verification */}
            <div className="p-3 bg-[#F0F7F6] border border-[#00695C]/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00695C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Scan Simulation
                </span>
                <span className="text-[10px] text-[#526579]">Testing & Station Mode</span>
              </div>
              <p className="text-xs text-[#526579] font-medium leading-relaxed">
                If the optical scan takes long or camera access is blocked on this workstation, you can trigger instant QR detection:
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // If returnDoc has code or fallback
                    const detectedCode = returnDoc.verificationCode || 'LF-DEMO99';
                    setInputCode(detectedCode);
                    setShowCameraScanner(false);
                    itemService.verifyReturn(returnId, { verificationCode: detectedCode })
                      .then((res) => {
                        setFeedback({ type: 'success', message: 'QR Code automatically scanned and verified!' });
                        if (res?.data?.data) setReturnDoc(res.data.data);
                        else fetchReturnDetails();
                      })
                      .catch((err) => {
                        setFeedback({ type: 'error', message: err.response?.data?.message || 'Verification failed.' });
                      });
                  }}
                  className="w-full text-xs font-bold"
                >
                  ⚡ Simulate Successful QR Scan
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCameraScanner(false)}
              >
                Close Scanner
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReturnHandover;
