import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import api from '../../services/api.js';

export const AdminMatches = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-[#D9E2E8] pb-4">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>
        <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#00695C]" />
          Smart Match Engine Management
        </h1>
        <p className="text-xs text-[#526579] mt-0.5 font-medium">
          Review automated similarity scores, category correlation, and geographic proximity matches.
        </p>
      </div>

      <Card className="p-12 text-center text-[#526579] text-xs shadow-xs border-[#D9E2E8]">
        <div className="w-16 h-16 rounded-2xl bg-[#E0F2F1] border border-[#00695C]/20 flex items-center justify-center text-[#00695C] mx-auto mb-3">
          <Sparkles className="w-8 h-8" />
        </div>
        <p className="font-bold text-[#16324F] text-base">Smart Matching Engine</p>
        <p className="text-[#526579] max-w-sm mx-auto mt-1 font-medium leading-relaxed">
          Automated scoring pairs lost reports with found belongings, highlighting high-probability matches for campus staff.
        </p>
      </Card>
    </div>
  );
};

export default AdminMatches;
