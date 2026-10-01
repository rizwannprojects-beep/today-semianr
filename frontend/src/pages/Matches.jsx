import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  ShieldCheck,
  Tag,
  Building2,
  X
} from 'lucide-react';
import itemService from '../services/itemService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalMatch, setActiveModalMatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await itemService.getMatches();
      if (res?.data?.data) {
        setMatches(res.data.data);
      } else if (Array.isArray(res?.data)) {
        setMatches(res.data);
      }
    } catch (err) {
      console.warn('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDismiss = async (matchId) => {
    try {
      setActionLoading(true);
      await itemService.dismissMatch(matchId);
      setMatches((prev) => prev.filter((m) => m._id !== matchId && m.id !== matchId));
      if (activeModalMatch?._id === matchId || activeModalMatch?.id === matchId) {
        setActiveModalMatch(null);
      }
      setActionMessage('Match dismissed from your active correlation feed.');
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      console.error('Error dismissing match:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetails = async (match) => {
    setActiveModalMatch(match);
    try {
      // Mark as viewed in background
      await itemService.viewMatch(match._id || match.id);
    } catch (err) {
      // Silent view update
    }
  };

  const getMatchBadge = (score, level) => {
    if (score >= 80 || level === 'HIGH_POSSIBILITY') {
      return (
        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
          High Correlation ({score}%)
        </span>
      );
    }
    if (score >= 60 || level === 'POSSIBLE') {
      return (
        <span className="text-xs font-bold text-[#F57C00] bg-[#FFF3E0] border border-[#FF9800]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F57C00]" />
          Possible Match ({score}%)
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-[#00695C] bg-[#E0F2F1] border border-[#00695C]/30 px-2.5 py-0.5 rounded-full">
        Low Correlation ({score}%)
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F] tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FF9800]" />
            Smart Item Correlations
          </h1>
          <p className="text-xs text-[#526579] mt-1">
            Automated correlation engine comparing categories, keywords, brands, and incident locations between your reports and newly cataloged found items.
          </p>
        </div>

        <Link to="/browse-found">
          <Button variant="outline" size="sm">
            Browse All Found Catalog
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-[#D9E2E8] space-y-4">
              <div className="h-5 bg-[#E0F2F1] rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-20 bg-[#F7FAFC] rounded-xl border border-[#D9E2E8]"></div>
                <div className="h-20 bg-[#F7FAFC] rounded-xl border border-[#D9E2E8]"></div>
              </div>
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <Card className="text-center py-16 space-y-4 border-dashed border-[#D9E2E8]">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] border border-[#FF9800]/30 flex items-center justify-center mx-auto text-[#FF9800]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#16324F]">No active correlation matches</p>
            <p className="text-xs text-[#526579] max-w-md mx-auto leading-relaxed">
              When a found item matching your lost report's category, brand, color, or location is turned in, our deterministic matching engine will automatically highlight it here.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/browse-found">
              <Button variant="primary" size="sm">
                Search Found Property
              </Button>
            </Link>
            <Link to="/report-lost">
              <Button variant="outline" size="sm">
                File Lost Report
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {matches.map((match) => {
            const lost = match.lostItem || {};
            const found = match.foundItem || {};
            const factors = match.matchingFactors || {};
            const reasons = factors.reasons || [];
            const score = match.matchScore || match.matchingScore || 0;
            const level = match.matchLevel;

            return (
              <Card
                key={match._id || match.id}
                className={`space-y-4 transition-all duration-200 hover:shadow-md hover:border-[#00695C]/40 ${
                  score >= 80 ? 'border-[#2E7D32]/40' : score >= 60 ? 'border-[#FF9800]/40' : 'border-[#D9E2E8]'
                }`}
              >
                {/* Match Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D9E2E8] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {getMatchBadge(score, level)}
                    <span className="text-[11px] font-semibold text-[#718096]">
                      ID: {String(match._id || match.id).slice(-6).toUpperCase()}
                    </span>
                    {match.status && <StatusBadge status={match.status} />}
                  </div>

                  <span className="text-[11px] text-[#718096] flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#526579]" />
                    Detected {new Date(match.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your Lost Report */}
                  <div className="p-4 rounded-xl bg-[#FFEBEE]/30 border border-[#D32F2F]/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFEBEE] border border-[#D32F2F]/30">
                        Your Lost Report
                      </span>
                      <span className="text-[11px] font-medium text-[#526579]">{lost.category}</span>
                    </div>

                    <h3 className="font-bold text-[#16324F] text-sm">
                      {lost.itemName || lost.title || 'Untitled Lost Item'}
                    </h3>

                    <div className="space-y-1 text-[#526579]">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                        <span className="font-medium">{lost.location || 'Campus'}</span>
                      </p>
                      {(lost.dateLost || lost.date) && (
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                          <span>Reported Lost: {new Date(lost.dateLost || lost.date).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Corresponding Found Property */}
                  <div className="p-4 rounded-xl bg-[#E8F5E9]/30 border border-[#2E7D32]/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8F5E9] border border-[#2E7D32]/30">
                        Turned-in Found Property
                      </span>
                      <span className="text-[11px] font-medium text-[#526579]">{found.category}</span>
                    </div>

                    <h3 className="font-bold text-[#16324F] text-sm">
                      {found.itemName || found.title || 'Cataloged Property'}
                    </h3>

                    <div className="space-y-1 text-[#526579]">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                        <span className="font-medium">{found.location || 'Campus'}</span>
                      </p>
                      {found.storageLocation && (
                        <p className="flex items-center gap-1.5 text-[#00695C] font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                          <span>Held at: {found.storageLocation}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reasons / Matching Factors */}
                {reasons.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-[#526579] uppercase tracking-wider">
                      Why this was suggested:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {reasons.slice(0, 4).map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-[#F1FAF9] border border-[#E0F2F1] text-[#00695C] px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#00695C] shrink-0" />
                          {reason}
                        </span>
                      ))}
                      {reasons.length > 4 && (
                        <span className="text-[11px] text-[#718096] px-1 py-0.5 font-medium">
                          +{reasons.length - 4} more factors
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#D9E2E8]">
                  <p className="text-[11px] text-[#718096] italic">
                    * Correlation scores indicate potential match and require ownership verification.
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(match._id || match.id)}
                      disabled={actionLoading}
                    >
                      Dismiss
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenDetails(match)}
                    >
                      View Breakdown
                    </Button>

                    <Link to={`/item/found/${found._id || found.id || ''}`}>
                      <Button variant="primary" size="sm" icon={ArrowRight}>
                        Verify & Claim
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Match Details Breakdown Modal */}
      {activeModalMatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D9E2E8] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9800]" />
                <h3 className="font-bold text-[#16324F] text-base">Match Analysis Breakdown</h3>
              </div>
              <button
                onClick={() => setActiveModalMatch(null)}
                className="text-[#718096] hover:text-[#16324F] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-[#F1FAF9] p-4 rounded-xl border border-[#E0F2F1]">
                <div>
                  <span className="text-xs text-[#526579] font-medium">Algorithmic Correlation Score</span>
                  <div className="text-2xl font-extrabold text-[#00695C] mt-0.5">
                    {activeModalMatch.matchScore || activeModalMatch.matchingScore}% Confidence
                  </div>
                </div>
                {getMatchBadge(activeModalMatch.matchScore, activeModalMatch.matchLevel)}
              </div>

              {/* Contributing Factors Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#16324F] uppercase tracking-wider">
                  Contributing Match Factors
                </h4>
                <div className="space-y-2">
                  {(activeModalMatch.matchingFactors?.reasons || []).map((reason, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center gap-3 text-xs text-[#16324F] font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#FFEBEE]/30 border border-[#D32F2F]/20 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#D32F2F] uppercase">Your Lost Report</span>
                  <p className="font-bold text-[#16324F]">{activeModalMatch.lostItem?.itemName || activeModalMatch.lostItem?.title}</p>
                  <p className="text-[#526579]">{activeModalMatch.lostItem?.description || 'No description provided'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E8F5E9]/30 border border-[#2E7D32]/20 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#2E7D32] uppercase">Found Property</span>
                  <p className="font-bold text-[#16324F]">{activeModalMatch.foundItem?.itemName || activeModalMatch.foundItem?.title}</p>
                  <p className="text-[#526579]">{activeModalMatch.foundItem?.description || 'No public description'}</p>
                  {activeModalMatch.foundItem?.storageLocation && (
                    <p className="text-[#00695C] font-semibold pt-1">
                      Desk: {activeModalMatch.foundItem.storageLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* Safeguard Notice */}
              <div className="p-3.5 rounded-xl bg-[#E3F2FD] border border-[#1976D2]/20 text-xs text-[#1976D2] font-medium flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1976D2] shrink-0 mt-0.5" />
                <p>
                  Privacy Notice: Confidential identification marks and finder contact credentials remain protected until verified by campus staff.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D9E2E8] bg-[#F7FAFC] flex justify-between items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(activeModalMatch._id || activeModalMatch.id)}
              >
                Dismiss Match
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveModalMatch(null)}>
                  Close
                </Button>
                <Link to={`/item/found/${activeModalMatch.foundItem?._id || activeModalMatch.foundItem?.id}`}>
                  <Button variant="primary" size="sm" icon={ArrowRight}>
                    Proceed to Claim
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
