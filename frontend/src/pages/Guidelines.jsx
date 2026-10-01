import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Lock,
  ArrowRight
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { CAMPUS_LOCATIONS } from '../utils/constants.js';

export const Guidelines = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2F1] border border-[#00695C]/30 text-[#00695C] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00695C]" />
          <span>Campus Security Operating Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
          Lost & Found Campus Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-[#526579] max-w-xl mx-auto leading-relaxed font-medium">
          Standard operating procedures to ensure safe, verified, and rapid recovery of student and staff personal property across campus.
        </p>
      </div>

      {/* 3 Core Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3 border-[#FF9800]/40 shadow-xs">
          <span className="text-3xl font-black text-[#FF9800]">01</span>
          <h3 className="font-bold text-[#16324F] text-base">Protect Identifying Secrets</h3>
          <p className="text-xs text-[#526579] leading-relaxed font-medium">
            When reporting a found item, do not list every unique identifier (e.g. lockscreen wallpaper, engravings, serial number hints). These details are used as verification questions.
          </p>
        </Card>

        <Card className="p-6 space-y-3 border-[#00695C]/40 shadow-xs">
          <span className="text-3xl font-black text-[#00695C]">02</span>
          <h3 className="font-bold text-[#16324F] text-base">Prompt Desk Handover</h3>
          <p className="text-xs text-[#526579] leading-relaxed font-medium">
            If you discover an unattended item on campus grounds, hand it over to the nearest designated campus holding desk or security station within 24 hours.
          </p>
        </Card>

        <Card className="p-6 space-y-3 border-[#2E7D32]/40 shadow-xs">
          <span className="text-3xl font-black text-[#2E7D32]">03</span>
          <h3 className="font-bold text-[#16324F] text-base">In-Person Verification</h3>
          <p className="text-xs text-[#526579] leading-relaxed font-medium">
            All property returns must be conducted at designated desks with active student or staff identification. Security logs the physical release of every item.
          </p>
        </Card>
      </div>

      {/* Designated Desks List */}
      <Card id="desks" className="p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-3">
          <MapPin className="w-5 h-5 text-[#FF9800]" />
          <h2 className="text-base font-bold text-[#16324F]">
            Designated Campus Holding Desks & Operating Hours
          </h2>
        </div>

        <p className="text-xs text-[#526579] font-medium">
          Unclaimed items are safely cataloged and stored at these authorized locations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {CAMPUS_LOCATIONS.map((loc, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#16324F]">{loc}</p>
                <p className="text-[11px] text-[#526579] mt-0.5 font-medium">
                  Hours: Mon – Fri (08:30 AM – 05:30 PM)
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-[#FFF3E0] border border-[#FF9800]/30 flex items-start gap-3 text-xs text-[#16324F]">
        <AlertTriangle className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#F57C00]">False Claim Policy</p>
          <p className="leading-relaxed font-medium text-[#526579]">
            Attempting to claim property that does not belong to you is a serious violation of the campus student honor code. All claim submissions are logged with timestamp and user identification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
