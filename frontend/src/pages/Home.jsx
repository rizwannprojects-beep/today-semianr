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
  Phone,
  Building,
  HelpCircle
} from 'lucide-react';
import itemService from '../services/itemService.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { CAMPUS_LOCATIONS } from '../utils/constants.js';

export const Home = () => {
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const foundRes = await itemService.getFoundItems({ limit: 4 });
        if (foundRes?.data) {
          const fData = foundRes.data.data || foundRes.data;
          if (Array.isArray(fData)) setRecentFound(fData.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not load recent found items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#E0F2F1]/50 via-[#F7FAFC] to-[#F7FAFC] border-b border-[#D9E2E8] pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="app-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Campus Verified Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#00695C]" />
                <span>Official Campus Lost &amp; Found Portal</span>
              </div>

              {/* Exact Presentation Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#16324F] tracking-tight leading-[1.15]">
                Lost Something on Campus? <br />
                <span className="text-[#00695C]">Let's Help You Find It.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#526579] font-normal leading-relaxed max-w-xl">
                The centralized university recovery platform. Report lost belongings, browse found items turned in by fellow students, match claims with automated algorithms, and collect your property safely at campus holding desks.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/report-lost">
                  <Button variant="primary" size="lg" icon={PlusCircle} className="shadow-xs">
                    Report Lost Item
                  </Button>
                </Link>
                <Link to="/browse-found">
                  <Button variant="secondary" size="lg" icon={Search} className="border-[#00695C] text-[#00695C] hover:bg-[#E0F2F1]">
                    Browse Found Items
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
                  <span>Privacy Protected</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Desk Snapshot */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-sm space-y-5 relative">
                <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C] font-bold">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#16324F]">Campus Desk Status</h3>
                      <p className="text-[11px] text-[#526579]">College Library &amp; Security HQ</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                    Open Today
                  </span>
                </div>

                {/* Workflow Summary Card */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center text-[10px] font-bold">1</span>
                      Report Item
                    </span>
                    <span className="text-[#526579] font-medium text-[11px]">Instant submission</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FFF3E0] text-[#D84315] flex items-center justify-center text-[10px] font-bold">2</span>
                      Smart Match Engine
                    </span>
                    <span className="text-[#526579] font-medium text-[11px]">Automatic correlation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center text-[10px] font-bold">3</span>
                      Verified Ownership
                    </span>
                    <span className="text-[#526579] font-medium text-[11px]">Desk inspection</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                    <span className="font-bold text-[#16324F] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-[10px] font-bold">4</span>
                      Fast Handover
                    </span>
                    <span className="text-[#2E7D32] font-bold text-[11px]">PIN verification</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#D9E2E8]">
                  <span className="text-[#718096]">Holding Desk: Room 102</span>
                  <Link to="/guidelines" className="text-[#00695C] hover:text-[#004D40] font-bold flex items-center gap-1">
                    How It Works <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="app-container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#00695C] text-xs font-bold uppercase tracking-wider mb-2">
            Campus Recovery Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
            How It Works
          </h2>
          <p className="text-sm text-[#526579] mt-2 font-medium">
            From reporting a misplaced item to verified collection at the campus security desk in 4 simple stages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-[#D84315] font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#D84315]" /> Report Item
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              Report your lost or found item with category, campus location, and incident date. Identifying marks are securely shielded.
            </p>
          </div>

          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] border border-[#FFE082] flex items-center justify-center text-[#FF9800] font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9800]" /> Match Engine
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              The system cross-references category, brand, time, and location to notify owners instantly when a matching item is turned in.
            </p>
          </div>

          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] border border-[#BBDEFB] flex items-center justify-center text-[#1565C0] font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-[#1976D2]" /> Submit Claim
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              The owner provides private proof of ownership (e.g., sticker details, wallpaper, receipt) that campus staff review.
            </p>
          </div>

          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] font-bold text-base">
              4
            </div>
            <h3 className="font-bold text-base text-[#16324F] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#2E7D32]" /> Secure Handover
            </h3>
            <p className="text-xs text-[#526579] leading-relaxed">
              Meet at the designated Campus Security Desk. Verify with your student ID &amp; PIN code to complete the official return.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/guidelines" className="text-xs font-bold text-[#00695C] hover:text-[#004D40] inline-flex items-center gap-1.5">
            View the detailed 7-step standard operating procedure <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. RECENT FOUND ITEMS */}
      <section className="app-container space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D9E2E8] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#16324F]">
              Recent Found Items
            </h2>
            <p className="text-xs text-[#526579] mt-1">
              Belongings turned in by students and currently secured at campus holding desks.
            </p>
          </div>
          <Link
            to="/browse-found"
            className="text-xs font-bold text-[#00695C] hover:text-[#004D40] flex items-center gap-1"
          >
            Browse All Found Items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#526579] text-xs">
            Loading recent found items...
          </div>
        ) : recentFound.length === 0 ? (
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-8 text-center space-y-3 shadow-xs">
            <Compass className="w-8 h-8 text-[#00695C] mx-auto opacity-75" />
            <p className="text-sm font-bold text-[#16324F]">No found items currently in queue</p>
            <p className="text-xs text-[#526579] max-w-md mx-auto">
              If you discover an unattended item on campus, report it to help your fellow students recover it.
            </p>
            <div className="pt-2">
              <Link to="/report-found">
                <Button variant="accent" size="sm">
                  Report Found Item
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentFound.map((item) => (
              <Card key={item._id} hover className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="font-bold text-base text-[#16324F] line-clamp-1">{item.itemName}</h3>
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
                  <div className="pt-2">
                    <Link to={`/item/found/${item._id}`}>
                      <Button variant="secondary" size="xs" className="w-full text-xs">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY CAMPUS LOST & FOUND */}
      <section className="app-container">
        <div className="bg-[#F0F7F6] border border-[#B2DFDB] rounded-2xl p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] text-[#00695C] text-xs font-bold uppercase tracking-wider mb-2">
              Campus Benefits
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
              Why Campus Lost &amp; Found?
            </h2>
            <p className="text-xs sm:text-sm text-[#526579] mt-2 leading-relaxed">
              Replacing scattered WhatsApp messages and physical noticeboards with an official, tamper-proof university recovery standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#E0F2F1] text-[#00695C] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#16324F] text-sm">Verified Student Identities</h3>
              <p className="text-xs text-[#526579] leading-relaxed">
                Only authenticated students and faculty can post and claim. Every action is tied to official register numbers and university emails.
              </p>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] text-[#D84315] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#16324F] text-sm">Automated Match Correlation</h3>
              <p className="text-xs text-[#526579] leading-relaxed">
                Algorithms match lost and found reports based on category, location, and dates so students are notified immediately.
              </p>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#16324F] text-sm">Strict Zero-Leak Privacy</h3>
              <p className="text-xs text-[#526579] leading-relaxed">
                Personal phone numbers and private identifying markings are never publicly exposed. All communications are safeguarded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SAFE OWNERSHIP VERIFICATION */}
      <section className="app-container">
        <div className="rounded-2xl border border-[#B2DFDB] bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C] shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#16324F]">
                Safe Ownership Verification &amp; Anti-Fraud Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-[#526579] mt-1 max-w-2xl leading-relaxed">
                To prevent fraudulent claims, finders withhold unique characteristics (such as engravings, serial numbers, or stickers). Owners must independently describe these identifiers during the claim review before release is authorized.
              </p>
            </div>
          </div>
          <Link to="/guidelines" className="shrink-0">
            <Button variant="secondary" size="sm">
              Review Verification Rules
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. CAMPUS HOLDING DESK & CONTACT DESK */}
      <section className="app-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Campus Holding Desks */}
          <div className="lg:col-span-7 bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-3">
              <Building className="w-5 h-5 text-[#00695C]" />
              <h3 className="text-base font-bold text-[#16324F]">
                Campus Holding Desks
              </h3>
            </div>
            <p className="text-xs text-[#526579]">
              Physical custody locations where found items are safely secured until owner verification is completed:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {CAMPUS_LOCATIONS.slice(0, 4).map((loc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#16324F]">
                    <MapPin className="w-3.5 h-3.5 text-[#00695C]" />
                    <span>{loc}</span>
                  </div>
                  <p className="text-[11px] text-[#526579] mt-1 font-medium">Hours: 08:30 AM – 05:30 PM</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Desk */}
          <div className="lg:col-span-5 bg-white border border-[#D9E2E8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-3">
              <Phone className="w-5 h-5 text-[#FF9800]" />
              <h3 className="text-base font-bold text-[#16324F]">
                Contact Campus Security Desk
              </h3>
            </div>
            <p className="text-xs text-[#526579] leading-relaxed">
              Need immediate assistance or reporting an urgent lost property such as student ID, keys, or laptops?
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8]">
                <span className="text-[11px] text-[#526579]">Security Control Room Helpline</span>
                <p className="font-bold text-[#16324F] text-sm mt-0.5">+91 (0484) 285-8000</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8]">
                <span className="text-[11px] text-[#526579]">Official Desk Email</span>
                <p className="font-bold text-[#00695C] text-sm mt-0.5">lostfound@campus.demo</p>
              </div>
            </div>
            <div className="pt-1">
              <Link to="/contact">
                <Button variant="secondary" size="sm" className="w-full">
                  Visit Contact Desk Page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
