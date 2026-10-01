import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Lock,
  PlusCircle,
  Search,
  Sparkles,
  BookmarkCheck,
  UserCheck,
  PackageCheck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { CAMPUS_LOCATIONS } from '../utils/constants.js';

export const Guidelines = () => {
  const steps = [
    {
      step: '01',
      title: 'Report a Lost Item',
      badge: 'Owner Action',
      color: 'text-[#D84315] bg-[#FFF3E0] border-[#FFE0B2]',
      icon: PlusCircle,
      description:
        'Submit a lost item report specifying the item category, brand, approximate time, and campus location (e.g. College Library, Block A, Computer Lab). Any private identifying features are kept confidential.'
    },
    {
      step: '02',
      title: 'Report a Found Item',
      badge: 'Finder Action',
      color: 'text-[#00695C] bg-[#E0F2F1] border-[#B2DFDB]',
      icon: ShieldCheck,
      description:
        'A student or campus custodian logs an item found on university premises. Public listings only display general characteristics to protect the integrity of the ownership verification process.'
    },
    {
      step: '03',
      title: 'System Finds Possible Matches',
      badge: 'Automated Match Engine',
      color: 'text-[#FF9800] bg-[#FFF8E1] border-[#FFE082]',
      icon: Sparkles,
      description:
        'The algorithmic matching engine evaluates category, item name, location, and date proximity. When confidence criteria are met, an automated "Possible Match Found" notification is generated.'
    },
    {
      step: '04',
      title: 'Owner Submits Claim',
      badge: 'Verification Step',
      color: 'text-[#1976D2] bg-[#E3F2FD] border-[#BBDEFB]',
      icon: BookmarkCheck,
      description:
        'The rightful owner reviews the possible match and submits an ownership claim providing specific identifying evidence not visible on the public listing (e.g. unique stickers, serial numbers, screen locks).'
    },
    {
      step: '05',
      title: 'Ownership Is Verified',
      badge: 'Campus Security Review',
      color: 'text-[#7B1FA2] bg-[#F3E5F5] border-[#E1BEE7]',
      icon: UserCheck,
      description:
        'Authorized campus desk custodians or administrators cross-check the submitted proof against the physical item in custody to validate rightful ownership before authorizing release.'
    },
    {
      step: '06',
      title: 'Item Is Handed Over',
      badge: 'Supervised Handover',
      color: 'text-[#00897B] bg-[#E0F2F1] border-[#80CBC4]',
      icon: PackageCheck,
      description:
        'The owner visits the designated Campus Security Desk or Lost & Found Desk. A secure one-time verification PIN is validated in the presence of the desk custodian.'
    },
    {
      step: '07',
      title: 'Return Is Recorded',
      badge: 'Official Audit Log',
      color: 'text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]',
      icon: RotateCcw,
      description:
        'The item status is officially marked as RETURNED. An audit ledger record logs the owner, finder, timestamp, and verification details, permanently completing the recovery lifecycle.'
    }
  ];

  return (
    <div className="app-container py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E0F2F1] border border-[#00695C]/30 text-[#00695C] text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#00695C]" />
          <span>Campus Recovery Standard Operating Procedure</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
          How It Works: The 7-Step Item Recovery Lifecycle
        </h1>
        <p className="text-xs sm:text-sm text-[#526579] max-w-2xl mx-auto leading-relaxed font-medium">
          Our centralized campus recovery process guarantees privacy, eliminates false claims, and ensures seamless returns through supervised campus security holding desks.
        </p>
      </div>

      {/* 7-Step Visual Process Timeline */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#00897B] transition-all relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#16324F]/30">{s.step}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>
                      {s.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-center text-[#00695C] shrink-0">
                      <IconComp className="w-4 h-4 text-[#00695C]" />
                    </div>
                    <h3 className="font-bold text-[#16324F] text-sm">{s.title}</h3>
                  </div>
                  <p className="text-xs text-[#526579] leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#E0F2F1] via-white to-[#FFF3E0] border border-[#B2DFDB] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-bold text-[#16324F] text-base">Ready to report an item?</h2>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            It takes less than 60 seconds to file a report and initiate automated matching.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/report-lost">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Report Lost Item
            </Button>
          </Link>
          <Link to="/report-found">
            <Button variant="accent" size="sm" icon={ShieldCheck}>
              Report Found Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Designated Desks List */}
      <Card id="desks" className="p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-3">
          <MapPin className="w-5 h-5 text-[#FF9800]" />
          <h2 className="text-base font-bold text-[#16324F]">
            Designated Campus Holding Desks &amp; Operating Hours
          </h2>
        </div>

        <p className="text-xs text-[#526579] font-medium">
          Found items must be transferred to an authorized campus custody desk within 24 hours. Physical handovers are verified and supervised at these locations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {CAMPUS_LOCATIONS.map((loc, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#16324F]">{loc}</p>
                <p className="text-[11px] text-[#526579] mt-0.5 font-medium">
                  Mon – Fri: 08:30 AM – 05:30 PM
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Safety & Honor Code Notice */}
      <div className="p-4 rounded-xl bg-[#FFF3E0] border border-[#FF9800]/30 flex items-start gap-3 text-xs text-[#16324F]">
        <AlertTriangle className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#F57C00]">Institutional Integrity &amp; False Claim Policy</p>
          <p className="leading-relaxed font-medium text-[#526579]">
            Attempting to claim property that does not belong to you violates the Student Code of Conduct. All claim submissions, IP addresses, and physical handovers are logged to the permanent audit ledger.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
