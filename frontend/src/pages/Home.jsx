import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Compass,
  ShieldCheck,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  FileText,
  RotateCcw,
  BookmarkCheck,
  Layers
} from 'lucide-react';
import itemService from '../services/itemService.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const Home = () => {
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const [lostRes, foundRes] = await Promise.allSettled([
          itemService.getLostItems({ limit: 3 }),
          itemService.getFoundItems({ limit: 3 })
        ]);

        if (lostRes.status === 'fulfilled' && lostRes.value?.data) {
          const lData = lostRes.value.data.data || lostRes.value.data;
          if (Array.isArray(lData)) setRecentLost(lData.slice(0, 3));
        }
        if (foundRes.status === 'fulfilled' && foundRes.value?.data) {
          const fData = foundRes.value.data.data || foundRes.value.data;
          if (Array.isArray(fData)) setRecentFound(fData.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load recent items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#E0F2F1]/40 via-[#F7FAFC] to-[#F7FAFC] border-b border-[#D9E2E8] pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Campus Verified Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#00695C]" />
                <span>Official University Lost &amp; Found Portal</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#16324F] tracking-tight leading-[1.15]">
                Lost something? <br />
                <span className="text-[#00695C]">Found something?</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#526579] font-normal leading-relaxed max-w-xl">
                The university's centralized recovery platform. Report misplaced belongings, discover automated smart matches, and schedule supervised, verified handovers at campus desks.
              </p>

              {/* Dual Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/report-lost">
                  <Button variant="primary" size="lg" icon={PlusCircle} className="shadow-xs">
                    Report Lost Item
                  </Button>
                </Link>
                <Link to="/report-found">
                  <Button variant="accent" size="lg" icon={ShieldCheck} className="shadow-xs">
                    Report Found Item
                  </Button>
                </Link>
                <Link to="/browse-found">
                  <Button variant="secondary" size="lg" icon={Search}>
                    Search Items
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#526579]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>Student ID Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00695C]" />
                  <span>Security Desk Supervised</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9800]" />
                  <span>Zero Public Contact Leaks</span>
                </div>
              </div>
            </div>

            {/* Right Column: Campus Illustration / Verification Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-sm space-y-5 relative">
                <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] font-bold">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#16324F]">Campus Recovery Live</h3>
                      <p className="text-[11px] text-[#526579]">Official Desk Status</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                    Operational
                  </span>
                </div>

                {/* 4-Step Flow Pill Highlights */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-[10px] font-bold">1</span>
                      Report Property
                    </span>
                    <span className="text-[#526579] font-medium text-[11px]">Under 60 seconds</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FFF3E0] text-[#D84315] flex items-center justify-center text-[10px] font-bold">2</span>
                      Smart Match Correlation
                    </span>
                    <span className="text-[#526579] font-medium text-[11px]">Instant Engine</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center text-[10px] font-bold">3</span>
                      Proof Verification
                    </span>
                    <span className="text-[#526579] font-medium text-[11px]">Security Checked</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-[10px] font-bold">4</span>
                      Secure Return Handover
                    </span>
                    <span className="text-[#2E7D32] font-bold text-[11px]">Verified Code</span>
                  </div>
                </div>

                {/* Quick Link Card Footer */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#D9E2E8]">
                  <span className="text-[#718096]">Supervised by Campus Security</span>
                  <Link to="/guidelines" className="text-[#00695C] hover:text-[#004D40] font-bold flex items-center gap-1">
                    Read Protocol <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#00695C]">92%</p>
              <p className="text-xs font-semibold text-[#526579] mt-1">Verified Return Rate</p>
            </div>
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#FF9800]">10+</p>
              <p className="text-xs font-semibold text-[#526579] mt-1">Campus Holding Desks</p>
            </div>
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#00695C]">&lt; 24h</p>
              <p className="text-xs font-semibold text-[#526579] mt-1">Avg. Claim Review Time</p>
            </div>
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#2E7D32]">100%</p>
              <p className="text-xs font-semibold text-[#526579] mt-1">Student Privacy Shield</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section: REPORT -> MATCH -> CLAIM -> RETURN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#00695C] text-xs font-bold uppercase tracking-wider mb-2">
            The 4-Step Recovery Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
            REPORT → MATCH → CLAIM → RETURN
          </h2>
          <p className="text-sm text-[#526579] mt-2">
            A transparent, auditable process designed to protect personal privacy and ensure rightful property return.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: REPORT */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs hover:border-[#00897B] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#00695C]" /> Report
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              Log missing items or turn in found belongings with precise campus locations and incident dates. Identifying marks stay confidential.
            </p>
          </div>

          {/* Card 2: MATCH */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs hover:border-[#00897B] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-[#D84315] font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9800]" /> Match
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              Algorithmic engine scores category, brand, color, location, and date proximity to recommend candidate items with detailed score breakdowns.
            </p>
          </div>

          {/* Card 3: CLAIM */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs hover:border-[#00897B] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] border border-[#BBDEFB] flex items-center justify-center text-[#1565C0] font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-[#1976D2]" /> Claim
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              Claimants submit identifying proof and receipts. Campus administrators adjudicate claims securely to prevent false handovers.
            </p>
          </div>

          {/* Card 4: RETURN */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs hover:border-[#00897B] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] font-bold text-base">
              4
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#2E7D32]" /> Return
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              A single-use verification code is issued for pickup at the designated holding desk. Custodians verify the code and log the official receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Campus Items Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D9E2E8] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#16324F]">
              Recent Campus Item Reports
            </h2>
            <p className="text-xs text-[#526579] mt-1">
              Active open lost listings and turned-in items currently at campus holding desks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/browse-lost"
              className="text-xs font-bold text-[#00695C] hover:text-[#004D40] flex items-center gap-1"
            >
              All Lost Items <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link
              to="/browse-found"
              className="text-xs font-bold text-[#FF9800] hover:text-[#F57C00] flex items-center gap-1"
            >
              All Found Items <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#526579] text-xs">
            Loading recent campus activity...
          </div>
        ) : recentLost.length === 0 && recentFound.length === 0 ? (
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-8 text-center space-y-3 shadow-xs">
            <Compass className="w-8 h-8 text-[#00695C] mx-auto opacity-75" />
            <p className="text-sm font-bold text-[#16324F]">No active reports yet</p>
            <p className="text-xs text-[#526579] max-w-md mx-auto">
              Be the first to report a lost or found item to help fellow students recover their belongings.
            </p>
            <div className="pt-2">
              <Link to="/report-lost">
                <Button variant="primary" size="sm">
                  Report Item
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentLost.map((item) => (
              <Card key={item._id} hover className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#D84315] uppercase tracking-wider">
                      Lost Item
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="font-bold text-base text-[#16324F]">{item.itemName}</h3>
                  <p className="text-xs text-[#526579] line-clamp-2">{item.description}</p>
                </div>
                <div className="pt-3 border-t border-[#D9E2E8] space-y-1.5 text-[11px] text-[#526579]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                    <span className="truncate">{item.lostLocation || item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                    <span>{new Date(item.lostDate || item.dateLost || item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))}

            {recentFound.map((item) => (
              <Card key={item._id} hover className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider">
                      Found Item
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="font-bold text-base text-[#16324F]">{item.itemName}</h3>
                  <p className="text-xs text-[#526579] line-clamp-2">{item.description}</p>
                </div>
                <div className="pt-3 border-t border-[#D9E2E8] space-y-1.5 text-[11px] text-[#526579]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span className="truncate">{item.foundLocation || item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                    <span>{new Date(item.foundDate || item.dateFound || item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Campus Privacy Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#B2DFDB] bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#16324F]">
                Institutional Privacy &amp; Ownership Safeguard
              </h3>
              <p className="text-xs sm:text-sm text-[#526579] mt-1 max-w-2xl leading-relaxed">
                Student telephone numbers, register numbers, and private evidence marks are never displayed publicly. Communication occurs exclusively through supervised verification channels and campus security holding desks.
              </p>
            </div>
          </div>
          <Link to="/guidelines" className="shrink-0">
            <Button variant="secondary" size="sm">
              Review Safety Protocols
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
