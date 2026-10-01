import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft, Download, ShieldAlert, CheckCircle2, Clock, Calendar } from 'lucide-react';
import adminService from '../../services/adminService.js';
import useAuth from '../../hooks/useAuth.js';
import Button from '../../components/Button.jsx';

export const AdminAnalyticsReport = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatedDate] = useState(new Date().toLocaleString());

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [resOverview, resCats, resLocs] = await Promise.all([
          adminService.getAnalyticsOverview({ range: 'last30days' }),
          adminService.getAnalyticsCategories({ range: 'last30days' }),
          adminService.getAnalyticsLocations({ range: 'last30days' })
        ]);
        setData(resOverview.data?.data || null);
        setCategories(resCats.data?.data?.categories || []);
        setLocations(resLocs.data?.data?.locations || []);
      } catch (err) {
        console.error('Failed to load printable report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const metrics = data?.metrics || {};

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#16324F] p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
      {/* Non-printable Screen Controls */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#16324F] hover:text-[#00695C] bg-white border border-[#D9E2E8] px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#00695C]" />
          <span>Back to Analytics Console</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            icon={Printer}
            className="font-bold shadow-xs"
          >
            Print Official Report
          </Button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="max-w-5xl mx-auto bg-white border border-[#D9E2E8] rounded-2xl p-8 sm:p-12 print:border-none print:p-0 print:bg-white print:text-black shadow-xs">
        {/* Document Header */}
        <div className="border-b border-[#D9E2E8] print:border-black/20 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#00695C] print:text-[#00695C] mb-1">
              Campus Security & Property Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#16324F] print:text-black">
              Official Lost & Found Analytics Report
            </h1>
            <p className="text-xs text-[#718096] print:text-gray-600 mt-1 font-mono font-medium">
              Audit Reference ID: LF-REP-{Date.now().toString(36).toUpperCase()}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-[#526579] print:text-gray-700 space-y-1 font-medium">
            <p>
              <strong className="text-[#16324F]">Audit Period:</strong> Last 30 Days
            </p>
            <p>
              <strong className="text-[#16324F]">Generated:</strong> {generatedDate}
            </p>
            <p>
              <strong className="text-[#16324F]">Prepared By:</strong> {user?.fullName || 'Campus Security Administrator'} ({user?.email})
            </p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#16324F] print:text-black border-b border-[#D9E2E8] print:border-gray-300 pb-2 mb-4">
            1. Executive Operations Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F7FAFC] print:bg-gray-50 border border-[#D9E2E8] print:border-gray-200 rounded-xl">
              <span className="text-[11px] text-[#718096] print:text-gray-600 uppercase font-bold">Lost Property Reports</span>
              <p className="text-3xl font-black text-[#D32F2F] print:text-red-700 mt-1">
                {metrics.totalLost?.current ?? 0}
              </p>
              <span className="text-[10px] text-[#718096] print:text-gray-500 font-medium">Prior: {metrics.totalLost?.previous ?? 0}</span>
            </div>

            <div className="p-4 bg-[#F7FAFC] print:bg-gray-50 border border-[#D9E2E8] print:border-gray-200 rounded-xl">
              <span className="text-[11px] text-[#718096] print:text-gray-600 uppercase font-bold">Found Items in Custody</span>
              <p className="text-3xl font-black text-[#2E7D32] print:text-green-700 mt-1">
                {metrics.totalFound?.current ?? 0}
              </p>
              <span className="text-[10px] text-[#718096] print:text-gray-500 font-medium">Prior: {metrics.totalFound?.previous ?? 0}</span>
            </div>

            <div className="p-4 bg-[#F7FAFC] print:bg-gray-50 border border-[#D9E2E8] print:border-gray-200 rounded-xl">
              <span className="text-[11px] text-[#718096] print:text-gray-600 uppercase font-bold">Recovery / Return Rate</span>
              <p className="text-3xl font-black text-[#00695C] print:text-[#00695C] mt-1">
                {metrics.recoveryRate?.current ?? '0%'}
              </p>
              <span className="text-[10px] text-[#718096] print:text-gray-500 font-medium">Prior: {metrics.recoveryRate?.previous ?? '0%'}</span>
            </div>

            <div className="p-4 bg-[#F7FAFC] print:bg-gray-50 border border-[#D9E2E8] print:border-gray-200 rounded-xl">
              <span className="text-[11px] text-[#718096] print:text-gray-600 uppercase font-bold">Verified Restorations</span>
              <p className="text-3xl font-black text-[#F57C00] print:text-amber-800 mt-1">
                {metrics.returnedCount?.current ?? 0}
              </p>
              <span className="text-[10px] text-[#718096] print:text-gray-500 font-medium">Prior: {metrics.returnedCount?.previous ?? 0}</span>
            </div>
          </div>
        </section>

        {/* Detailed Metrics Table */}
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#16324F] print:text-black border-b border-[#D9E2E8] print:border-gray-300 pb-2 mb-4">
            2. Core Operational Metrics Ledger
          </h2>

          <table className="w-full text-left text-xs border border-[#D9E2E8] print:border-gray-300 rounded-xl overflow-hidden">
            <thead className="bg-[#F0F7F6] print:bg-gray-100 text-[#16324F] print:text-black font-bold uppercase text-[11px] border-b border-[#D9E2E8] print:border-gray-300">
              <tr>
                <th className="p-3">Indicator / Domain</th>
                <th className="p-3 text-center">Current Period</th>
                <th className="p-3 text-center">Previous Equivalent</th>
                <th className="p-3 text-center">Variance (Diff)</th>
                <th className="p-3 text-center">Status / Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8] print:divide-gray-200">
              {[
                { label: 'Total Incident Reports', cur: metrics.totalReports?.current, prev: metrics.totalReports?.previous, diff: metrics.totalReports?.diff },
                { label: 'Active Unresolved Cases', cur: metrics.activeCases?.current, prev: metrics.activeCases?.previous, diff: metrics.activeCases?.diff },
                { label: 'Resolved Closed Cases', cur: metrics.resolvedCases?.current, prev: metrics.resolvedCases?.previous, diff: metrics.resolvedCases?.diff },
                { label: 'Ownership Claims Submitted', cur: metrics.totalClaims?.current, prev: metrics.totalClaims?.previous, diff: metrics.totalClaims?.diff },
                { label: 'Correlation Matches Produced', cur: metrics.totalMatches?.current, prev: metrics.totalMatches?.previous, diff: metrics.totalMatches?.diff },
                { label: 'Formal Handover Workflows', cur: metrics.totalReturns?.current, prev: metrics.totalReturns?.previous, diff: metrics.totalReturns?.diff },
                { label: 'Flagged / Disputed Cases', cur: metrics.disputedCases?.current, prev: metrics.disputedCases?.previous, diff: metrics.disputedCases?.diff }
              ].map((row, idx) => (
                <tr key={idx} className="print:bg-transparent hover:bg-[#F0F7F6] transition-colors">
                  <td className="p-3 font-bold text-[#16324F]">{row.label}</td>
                  <td className="p-3 text-center font-bold text-[#00695C] print:text-black">{row.cur ?? 0}</td>
                  <td className="p-3 text-center text-[#718096] print:text-gray-600 font-medium">{row.prev ?? 0}</td>
                  <td className="p-3 text-center font-bold">
                    {(row.diff ?? 0) > 0 ? `+${row.diff}` : row.diff ?? 0}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-[#00695C] bg-[#E0F2F1] border border-[#00695C]/20 px-2 py-0.5 rounded-full print:text-[#00695C]">
                      Normal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Category Breakdown Table */}
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#16324F] print:text-black border-b border-[#D9E2E8] print:border-gray-300 pb-2 mb-4">
            3. Property Breakdown by Category
          </h2>

          <table className="w-full text-left text-xs border border-[#D9E2E8] print:border-gray-300 rounded-xl overflow-hidden">
            <thead className="bg-[#F0F7F6] print:bg-gray-100 text-[#16324F] print:text-black font-bold uppercase text-[11px] border-b border-[#D9E2E8] print:border-gray-300">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Lost Count</th>
                <th className="p-3 text-center">Found Count</th>
                <th className="p-3 text-center">Returned Count</th>
                <th className="p-3 text-center">Category Total</th>
                <th className="p-3 text-center">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8] print:divide-gray-200">
              {categories.slice(0, 10).map((cat) => (
                <tr key={cat.category} className="hover:bg-[#F0F7F6] transition-colors">
                  <td className="p-3 font-bold text-[#16324F]">{cat.category}</td>
                  <td className="p-3 text-center font-medium text-[#D32F2F]">{cat.lost}</td>
                  <td className="p-3 text-center font-medium text-[#2E7D32]">{cat.found}</td>
                  <td className="p-3 text-center font-bold text-[#00695C] print:text-[#00695C]">{cat.returned}</td>
                  <td className="p-3 text-center font-bold text-[#16324F] print:text-black">{cat.total}</td>
                  <td className="p-3 text-center font-semibold text-[#526579]">{cat.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Verification Sign-Off Footer */}
        <div className="border-t border-[#D9E2E8] print:border-black/30 pt-8 mt-12 grid grid-cols-2 gap-8 text-xs text-[#526579] print:text-gray-700">
          <div>
            <p className="font-bold text-[#16324F] print:text-black mb-1">Administrative Endorsement:</p>
            <div className="h-14 border-b border-dashed border-[#D9E2E8] print:border-gray-400 mb-1"></div>
            <p className="text-[11px] font-medium text-[#718096]">Authorized Signatory, Campus Security</p>
          </div>
          <div>
            <p className="font-bold text-[#16324F] print:text-black mb-1">Official University Stamp:</p>
            <div className="h-14 border border-dashed border-[#D9E2E8] print:border-gray-400 rounded-xl flex items-center justify-center text-[10px] text-[#718096] font-mono">
              [SEAL RECORDED ELECTRONICALLY]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsReport;
