import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Heart,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

const HONOR_FINDERS = [
  {
    id: 'f1',
    name: 'Rahul Menon',
    department: 'Computer Science & Engineering',
    role: 'Student Finder',
    itemsReturned: 6,
    karmaPoints: 680,
    badge: 'Campus Hero',
    badgeColor: '#D84315',
    badgeBg: '#FFF3E0',
    recentItem: 'Sony WH-1000XM5 Headphones & HP Pavilion Laptop',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    joined: 'August 2025'
  },
  {
    id: 'f2',
    name: 'Aisha Rahman',
    department: 'Electrical & Electronics',
    role: 'Student Finder',
    itemsReturned: 4,
    karmaPoints: 460,
    badge: 'Gold Samaritan',
    badgeColor: '#B78103',
    badgeBg: '#FFF8E1',
    recentItem: 'Scientific Calculator & College Notebook',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    joined: 'September 2025'
  },
  {
    id: 'f3',
    name: 'Muhammed Shamil',
    department: 'Mechanical Engineering',
    role: 'Campus Volunteer',
    itemsReturned: 3,
    karmaPoints: 340,
    badge: 'Verified Finder',
    badgeColor: '#00695C',
    badgeBg: '#E0F2F1',
    recentItem: 'Black Backpack with Course Materials',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    joined: 'November 2025'
  },
  {
    id: 'f4',
    name: 'Neha Krishnan',
    department: 'Civil Engineering',
    role: 'Student Finder',
    itemsReturned: 2,
    karmaPoints: 240,
    badge: 'Honest Citizen',
    badgeColor: '#1565C0',
    badgeBg: '#E3F2FD',
    recentItem: 'House Keys (with Brass Keychain)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    joined: 'January 2026'
  }
];

export const HonorWall = () => {
  return (
    <div className="space-y-8">
      {/* Hero Banner (Unified Portal Light Theme) */}
      <div className="bg-white border border-[#D9E2E8] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E0F2F1]/70 via-[#F0F7F6]/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] text-xs font-bold uppercase tracking-wider text-[#00695C] shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-[#00695C]" />
            <span>Community Integrity &amp; Good Samaritans</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#16324F]">
            Campus Honor Wall &amp; Karma Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-[#526579] leading-relaxed">
            Recognizing honest students and staff members who deposited found belongings at security custody desks and helped restore property to their rightful owners.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="bg-[#F7FAFC] px-3.5 py-2 rounded-xl border border-[#D9E2E8] flex items-center gap-2 text-[#16324F] font-medium shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#FF9800]" />
              <span><strong className="text-[#16324F] font-bold">142+</strong> Belongings Reunited</span>
            </div>
            <div className="bg-[#F7FAFC] px-3.5 py-2 rounded-xl border border-[#D9E2E8] flex items-center gap-2 text-[#16324F] font-medium shadow-2xs">
              <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
              <span><strong className="text-[#16324F] font-bold">₹4,80,000+</strong> Student Assets Protected</span>
            </div>
            <div className="bg-[#F7FAFC] px-3.5 py-2 rounded-xl border border-[#D9E2E8] flex items-center gap-2 text-[#16324F] font-medium shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#00695C]" />
              <span><strong className="text-[#16324F] font-bold">96.4%</strong> Successful Recovery Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Finders Leaderboard Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00695C]" />
              Top Campus Honor Finders
            </h2>
            <p className="text-xs text-[#526579]">
              Students awarded university recognition for immediate handover compliance.
            </p>
          </div>
          <Link to="/report-found">
            <Button variant="accent" size="sm" className="font-bold text-xs">
              + Report a Found Item
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HONOR_FINDERS.map((finder, idx) => (
            <Card
              key={finder.id}
              hover
              className="flex flex-col justify-between p-6 bg-white border-[#D9E2E8] hover:border-[#00897B] transition-all space-y-4 shadow-xs relative overflow-hidden group"
            >
              {/* Rank Badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-center text-xs font-extrabold text-[#16324F]">
                #{idx + 1}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={finder.avatar}
                    alt={finder.name}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-[#B2DFDB] shadow-2xs"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#16324F] group-hover:text-[#00695C] transition-colors">
                      {finder.name}
                    </h3>
                    <p className="text-[11px] text-[#526579] font-medium leading-tight mt-0.5">
                      {finder.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: finder.badgeBg, color: finder.badgeColor }}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-black/10"
                  >
                    {finder.badge}
                  </span>
                  <span className="text-[10px] font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">
                    ★ {finder.karmaPoints} Karma
                  </span>
                </div>

                <div className="pt-2 border-t border-[#D9E2E8] space-y-1.5 text-xs text-[#526579]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Items Handed Over:</span>
                    <strong className="text-[#16324F] font-bold">{finder.itemsReturned} verified items</strong>
                  </div>
                  <p className="text-[11px] text-[#718096] italic line-clamp-2">
                    &ldquo;Restored {finder.recentItem}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D9E2E8] text-[10px] text-[#718096] flex items-center justify-between">
                <span>Active Since: {finder.joined}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00695C]" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* University Honor Pledge Card */}
      <div className="rounded-3xl border border-[#B2DFDB] bg-[#F0F7F6] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00695C] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-6 h-6 text-[#80CBC4]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#16324F] text-lg">The Campus Integrity Covenant</h3>
            <p className="text-xs sm:text-sm text-[#526579] max-w-2xl leading-relaxed">
              If you discover an unattended bag, phone, or identity document, turn it in to the nearest security holding point within 30 minutes. Every verified item earns Official University Karma points and inclusion in the annual Chancellor&apos;s Honor Roll.
            </p>
          </div>
        </div>

        <Link to="/report-found" className="shrink-0">
          <Button variant="primary" size="md" className="font-bold text-xs shadow-xs">
            Submit a Found Item Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HonorWall;
