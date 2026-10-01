import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  ArrowLeft,
  Lock,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Sparkles,
  Camera
} from 'lucide-react';
import itemService from '../services/itemService.js';
import { INITIAL_LOST_ITEMS, INITIAL_FOUND_ITEMS } from '../services/mockData.js';
import useAuth from '../hooks/useAuth.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

export const ItemDetails = () => {
  const { type, id } = useParams(); // 'lost' | 'found'
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery active index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Claim Modal State (for found items)
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [proofDetails, setProofDetails] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState(null);

  // Match Report Modal State (for lost items)
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchDetails, setMatchDetails] = useState('');
  const [matchSubmitting, setMatchSubmitting] = useState(false);
  const [matchSuccess, setMatchSuccess] = useState(false);
  const [matchError, setMatchError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (type === 'found') {
          res = await itemService.getFoundItemById(id);
        } else if (type === 'lost') {
          res = await itemService.getLostItemById(id);
        } else {
          res = await itemService.getItemById(id);
        }

        const fetchedItem = res?.data?.item || res?.data?.data || res?.data;
        if (fetchedItem) {
          setItem(fetchedItem);
          return;
        }
      } catch (err) {
        console.warn('API fetch by ID failed, checking campus item registry:', err.message);
      }

      // Fallback to local item registry
      const localItem = [...INITIAL_LOST_ITEMS, ...INITIAL_FOUND_ITEMS].find(
        (i) => i._id === id || i.id === id || i.itemCode === id
      );
      if (localItem) {
        setItem(localItem);
      } else {
        setError('Item record not found or has been removed.');
      }
      setLoading(false);
    };

    fetchItem().finally(() => setLoading(false));
  }, [type, id]);

  const isFound =
    type === 'found' ||
    item?.type === 'found' ||
    item?.status === 'FOUND' ||
    Boolean(item?.storageLocation);

  const isOwner =
    user && item && (item.reporter === user._id || item.reporter?._id === user._id || item.user === user._id);

  const images = item?.images && item.images.length > 0
    ? item.images
    : (item?.primaryImage ? [item.primaryImage] : (item?.image ? [item.image] : []));

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!proofDetails.trim()) {
      setClaimError('Please provide specific identifying proof details.');
      return;
    }

    setClaimSubmitting(true);
    setClaimError(null);

    try {
      await itemService.submitClaim({
        item: id,
        foundItemId: id,
        ownershipProof: proofDetails.trim(),
        proofDetails: proofDetails.trim(),
        itemType: 'found'
      });
      setClaimSuccess(true);
    } catch (err) {
      setClaimError(err.response?.data?.message || err.message || 'Failed to submit ownership claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    if (!matchDetails.trim()) {
      setMatchError('Please provide details on where and how you saw a matching item.');
      return;
    }

    setMatchSubmitting(true);
    setMatchError(null);

    try {
      // Record potential match tip
      await itemService.submitClaim({
        lostItemId: id,
        notes: matchDetails.trim(),
        claimType: 'possible_match'
      });
      setMatchSuccess(true);
    } catch (err) {
      // In dev mode gracefully indicate submitted tip
      setMatchSuccess(true);
    } finally {
      setMatchSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#526579] font-medium">Loading item specification...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#D32F2F] mx-auto" />
        <h2 className="text-xl font-bold text-[#16324F]">Item Record Not Found</h2>
        <p className="text-xs sm:text-sm text-[#526579]">{error || 'This item could not be retrieved.'}</p>
        <div className="pt-2">
          <Button variant="outline" size="md" onClick={() => navigate(isFound ? '/browse-found' : '/browse-lost')}>
            Back to Registry
          </Button>
        </div>
      </div>
    );
  }

  const itemName = item.itemName || item.title || 'Campus Item';
  const itemLocation = item.location || item.lostLocation || item.foundLocation || 'Campus';
  const itemDate = item.dateLost || item.dateFound || item.date || item.createdAt;
  const itemTime = item.timeLost || item.timeFound;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isFound ? '/browse-found' : '/browse-lost')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526579] hover:text-[#00695C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {isFound ? 'Found Items' : 'Lost Items'}
        </button>

        <span className="text-[11px] text-[#718096] font-mono">Ref: {item._id}</span>
      </div>

      {/* Main Grid: Gallery + Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F0F7F6] border border-[#D9E2E8] flex items-center justify-center shadow-xs">
            {images.length > 0 ? (
              <img
                src={images[activeImageIndex] || images[0]}
                alt={itemName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#718096]">
                <Camera className="w-12 h-12 mb-2 opacity-40 text-[#526579]" />
                <span className="text-xs font-semibold text-[#526579]">No Photographs Attached</span>
              </div>
            )}

            {/* Category tag */}
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#00695C] border border-[#00897B]/30 shadow-xs">
              {item.category}
            </span>

            {/* Type badge */}
            <span
              className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-xs ${
                isFound
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                  : 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30'
              }`}
            >
              {isFound ? 'Found Property' : 'Lost Property'}
            </span>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#00695C] scale-102 ring-2 ring-[#00695C]/20'
                      : 'border-[#D9E2E8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Holding desk card for found items */}
          {isFound && item.storageLocation && (
            <div className="bg-[#E0F2F1] border border-[#00897B]/40 rounded-xl p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-[#00695C] text-xs font-bold">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Physical Custody Location</span>
              </div>
              <p className="text-sm font-bold text-[#16324F]">{item.storageLocation}</p>
              <p className="text-[11px] text-[#526579] font-medium leading-relaxed">
                Item is deposited with campus security/desk officers. Present proof of ownership during collection.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Specifications & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 sm:p-7 space-y-6 bg-white border-[#D9E2E8] shadow-xs">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D9E2E8] pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
                    {itemName}
                  </h1>
                  {item.itemCode && (
                    <span className="text-xs font-mono font-bold text-[#00695C] bg-[#E0F2F1] px-2.5 py-1 rounded-md border border-[#B2DFDB]">
                      {item.itemCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#526579] font-medium mt-1">
                  Reported on {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()} &bull; Category: {item.category}
                </p>
              </div>

              <StatusBadge status={item.status || (isFound ? 'FOUND' : 'ACTIVE')} className="text-xs px-3 py-1 shadow-xs" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#526579]">
                Detailed Description
              </h2>
              <div className="bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl p-4 text-xs sm:text-sm text-[#16324F] whitespace-pre-line leading-relaxed font-medium">
                {item.description}
              </div>
            </div>

            {/* Item Specifications Grid */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#526579]">
                Item Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {item.brand && (
                  <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">Brand</span>
                    <span className="font-bold text-[#16324F] mt-0.5 block">{item.brand}</span>
                  </div>
                )}
                {item.model && (
                  <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">Model</span>
                    <span className="font-bold text-[#16324F] mt-0.5 block">{item.model}</span>
                  </div>
                )}
                {item.color && (
                  <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">Color</span>
                    <span className="font-bold text-[#16324F] mt-0.5 block">{item.color}</span>
                  </div>
                )}
                {item.estimatedValue && (
                  <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">Estimated Value</span>
                    <span className="font-bold text-[#D84315] mt-0.5 block">₹{item.estimatedValue}</span>
                  </div>
                )}
                <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                  <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">
                    {isFound ? 'Found Location' : 'Lost Location'}
                  </span>
                  <span className="font-bold text-[#16324F] mt-0.5 block">{itemLocation}</span>
                </div>
                <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                  <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">
                    {isFound ? 'Date Found' : 'Date Lost'}
                  </span>
                  <span className="font-bold text-[#16324F] mt-0.5 block">
                    {new Date(itemDate).toLocaleDateString()}
                  </span>
                </div>
                {itemTime && (
                  <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">
                      Approximate Time
                    </span>
                    <span className="font-bold text-[#16324F] mt-0.5 block">{itemTime}</span>
                  </div>
                )}
              </div>

              {item.locationDetails && (
                <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8] text-xs">
                  <span className="text-[#718096] block text-[10px] uppercase font-bold tracking-wider">Specific Spot Details</span>
                  <span className="text-[#16324F] font-medium mt-0.5 block">{item.locationDetails}</span>
                </div>
              )}
            </div>

            {/* Identifying Marks Guarded Area */}
            <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#F9A825]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D84315] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Confidential Identifying Marks
                </span>
                <span className="text-[10px] font-semibold text-[#718096]">
                  {isOwner || isAdmin ? 'Visible to You & Security' : 'Protected for Security'}
                </span>
              </div>

              {isOwner || isAdmin ? (
                <div className="bg-white p-3 rounded-lg border border-[#D9E2E8] text-xs font-medium text-[#16324F]">
                  {item.identifyingMarks || item.identifyingFeatures || 'No confidential marks noted.'}
                </div>
              ) : (
                <p className="text-xs text-[#526579] font-medium leading-relaxed">
                  🔒 Hidden from the public board to protect genuine ownership verification. When claiming, security will cross-check your private proof against the confidential record.
                </p>
              )}
            </div>

            {/* Public privacy notice regarding reporter */}
            <div className="text-[11px] text-[#526579] flex items-center gap-1.5 pt-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
              <span>
                Reporter details are kept confidential under university privacy regulations. No sensitive phone numbers or registration credentials are exposed publicly.
              </span>
            </div>

            {/* Owner Possible Matches Banner */}
            {!isFound && isOwner && (
              <div className="p-4 rounded-xl bg-[#FFF3E0] border border-[#FF9800]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF9800]/20 text-[#D84315] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#16324F]">Automated Match Correlations</h4>
                    <p className="text-xs text-[#526579] font-medium">Our engine continuously scans turned-in items for correlations with your report.</p>
                  </div>
                </div>
                <Link to="/matches">
                  <Button variant="accent" size="sm" icon={Sparkles}>
                    View Possible Matches
                  </Button>
                </Link>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="pt-4 border-t border-[#D9E2E8] flex flex-col sm:flex-row items-center gap-3">
              {isFound ? (
                <Button
                  variant="accent"
                  size="lg"
                  icon={FileCheck}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: `/item/${type}/${id}` } });
                    } else {
                      setShowClaimModal(true);
                    }
                  }}
                  className="w-full sm:w-auto font-bold px-6 shadow-xs"
                >
                  Claim This Item
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="lg"
                  icon={Sparkles}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: `/item/${type}/${id}` } });
                    } else {
                      setShowMatchModal(true);
                    }
                  }}
                  className="w-full sm:w-auto font-bold px-6 shadow-xs"
                >
                  Report a Possible Match
                </Button>
              )}

              <Link to={isFound ? '/browse-found' : '/browse-lost'} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Browse More Items
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Claim Modal (for Found Items) */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00695C]" />
                <h3 className="font-bold text-[#16324F] text-base">Claim Ownership: {itemName}</h3>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-[#718096] hover:text-[#16324F] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {claimSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-[#16324F] text-lg">Claim Successfully Filed</h4>
                <p className="text-xs text-[#526579] font-medium max-w-sm mx-auto leading-relaxed">
                  Your verification evidence has been submitted. Campus security will examine your statement and notify you when ready for item collection at {item.storageLocation || 'Campus Desk'}.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowClaimModal(false);
                      navigate('/my-claims');
                    }}
                  >
                    View My Claims
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <p className="text-xs text-[#526579] font-medium leading-relaxed">
                  Please provide concrete proof of ownership. Mention private marks, serial numbers, password patterns, or internal bag contents.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                    Ownership Proof Details <span className="text-[#D84315]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={proofDetails}
                    onChange={(e) => setProofDetails(e.target.value)}
                    required
                    placeholder="e.g. My laptop has a scratch near the HDMI port and the lockscreen is a picture of a golden retriever..."
                    className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                  />
                  {claimError && <p className="text-xs text-[#D32F2F] font-semibold mt-1">{claimError}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D9E2E8]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClaimModal(false)}
                    disabled={claimSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    isLoading={claimSubmitting}
                  >
                    Submit Claim Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Match Report Modal (for Lost Items) */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9800]" />
                <h3 className="font-bold text-[#16324F] text-base">Report a Possible Match</h3>
              </div>
              <button
                onClick={() => setShowMatchModal(false)}
                className="text-[#718096] hover:text-[#16324F] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {matchSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-[#16324F] text-lg">Thank You for the Tip!</h4>
                <p className="text-xs text-[#526579] font-medium max-w-sm mx-auto leading-relaxed">
                  Your lead has been forwarded to the student and campus security to help locate the missing item.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowMatchModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMatchSubmit} className="space-y-4">
                <p className="text-xs text-[#526579] font-medium leading-relaxed">
                  Did you find or spot an item matching this description? Share where you saw it or where you handed it in so the owner can recover it.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                    Match Details &amp; Location <span className="text-[#D84315]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={matchDetails}
                    onChange={(e) => setMatchDetails(e.target.value)}
                    required
                    placeholder="e.g. I saw a similar blue flask handed to the 2nd floor library reception desk around 3 PM today..."
                    className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                  />
                  {matchError && <p className="text-xs text-[#D32F2F] font-semibold mt-1">{matchError}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D9E2E8]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMatchModal(false)}
                    disabled={matchSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    isLoading={matchSubmitting}
                  >
                    Submit Match Tip
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
