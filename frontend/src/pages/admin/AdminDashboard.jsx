import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Package,
  FileText,
  BookmarkCheck,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  Megaphone,
  BarChart3
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import adminService from '../../services/adminService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await adminService.getDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setError(err.message || 'Unable to retrieve administrative metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = dashboardData?.stats || dashboardData || {};
  const usersStats = stats.users || { total: 0, active: 0, suspended: 0, newStudents: 0 };
  const itemsStats = stats.items || { total: 0, lost: 0, found: 0, active: 0, resolved: 0, returned: 0 };
  const claimsStats = stats.claims || { total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0, completed: 0 };
  const matchesStats = stats.matches || { total: 0, highConfidence: 0, possible: 0, resolved: 0 };
  const returnsStats = stats.returns || { total: 0, pending: 0, scheduled: 0, completed: 0, disputed: 0 };
  const recentActivity = dashboardData?.recentActivity || [];

  const handleDownloadCsv = (entity) => {
    const url = adminService.exportCsvUrl(entity);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Control Actions */}
      <div className="border-b border-[#D9E2E8] pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00695C] mb-1">
            <ShieldAlert className="w-4 h-4 text-[#00695C]" /> Campus Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
            Institutional Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-[#526579] mt-1 max-w-2xl font-medium">
            Live campus lost & found custody metrics, claim dispute oversight, audit logging, and student account governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-xs font-semibold text-[#16324F] rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh database metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00695C] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Sync Data'}</span>
          </button>

          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFF3E0] border border-[#FF9800]/40 hover:bg-[#FFE0B2] text-xs font-bold text-[#F57C00] rounded-xl transition-all shadow-xs cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#D9E2E8] rounded-xl shadow-xl py-1.5 z-20 hidden group-hover:block">
              <button
                onClick={() => handleDownloadCsv('items')}
                className="w-full text-left px-3 py-2 text-xs text-[#16324F] hover:bg-[#F0F7F6] font-medium cursor-pointer"
              >
                Export Items Registry
              </button>
              <button
                onClick={() => handleDownloadCsv('claims')}
                className="w-full text-left px-3 py-2 text-xs text-[#16324F] hover:bg-[#F0F7F6] font-medium cursor-pointer"
              >
                Export Claims Ledger
              </button>
              <button
                onClick={() => handleDownloadCsv('returns')}
                className="w-full text-left px-3 py-2 text-xs text-[#16324F] hover:bg-[#F0F7F6] font-medium cursor-pointer"
              >
                Export Returns & Handovers
              </button>
            </div>
          </div>

          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00695C] hover:bg-[#00897B] text-xs font-bold text-white rounded-xl transition-all shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics Suite</span>
          </Link>

          <Link
            to="/admin/announcements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF9800] hover:bg-[#F57C00] text-xs font-bold text-white rounded-xl transition-all shadow-xs"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#D32F2F]/30 text-[#D32F2F] text-xs flex items-center justify-between font-semibold">
          <span>{error}</span>
          <button onClick={() => fetchDashboard(false)} className="underline hover:text-[#B71C1C] cursor-pointer">Retry</button>
        </div>
      )}

      {/* 1. Primary Operational Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* USERS STAT */}
        <div className="bg-white border border-[#D9E2E8] hover:shadow-md rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#1976D2] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Students
            </span>
            <Link to="/admin/users" className="text-[#718096] hover:text-[#16324F]">
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-3xl font-black text-[#00695C] tracking-tight">
            {loading ? '—' : usersStats.total}
          </div>
          <div className="mt-3 pt-3 border-t border-[#D9E2E8] text-[11px] flex items-center justify-between text-[#526579]">
            <span>Active: <strong className="text-[#2E7D32] font-bold">{loading ? '—' : usersStats.active}</strong></span>
            <span>Suspended: <strong className="text-[#D32F2F] font-bold">{loading ? '—' : usersStats.suspended}</strong></span>
          </div>
        </div>

        {/* ITEMS STAT */}
        <div className="bg-white border border-[#D9E2E8] hover:shadow-md rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#F57C00] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Items Inventory
            </span>
            <Link to="/admin/lost-items" className="text-[#718096] hover:text-[#16324F]">
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-3xl font-black text-[#00695C] tracking-tight">
            {loading ? '—' : itemsStats.total}
          </div>
          <div className="mt-3 pt-3 border-t border-[#D9E2E8] text-[11px] flex items-center justify-between text-[#526579]">
            <span>Lost: <strong className="text-[#D32F2F] font-bold">{loading ? '—' : itemsStats.lost}</strong></span>
            <span>Found: <strong className="text-[#2E7D32] font-bold">{loading ? '—' : itemsStats.found}</strong></span>
          </div>
        </div>

        {/* CLAIMS STAT */}
        <div className="bg-white border border-[#D9E2E8] hover:shadow-md rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#2E7D32] flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5" /> Claims Desk
            </span>
            <Link to="/admin/claims" className="text-[#718096] hover:text-[#16324F]">
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-3xl font-black text-[#00695C] tracking-tight">
            {loading ? '—' : claimsStats.total}
          </div>
          <div className="mt-3 pt-3 border-t border-[#D9E2E8] text-[11px] flex items-center justify-between text-[#526579]">
            <span>Pending: <strong className="text-[#F57C00] font-bold">{loading ? '—' : claimsStats.pending}</strong></span>
            <span>Approved: <strong className="text-[#2E7D32] font-bold">{loading ? '—' : claimsStats.approved}</strong></span>
          </div>
        </div>

        {/* MATCHES STAT */}
        <div className="bg-white border border-[#D9E2E8] hover:shadow-md rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#7B1FA2] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Smart Matches
            </span>
            <Link to="/admin/matches" className="text-[#718096] hover:text-[#16324F]">
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-3xl font-black text-[#00695C] tracking-tight">
            {loading ? '—' : matchesStats.total}
          </div>
          <div className="mt-3 pt-3 border-t border-[#D9E2E8] text-[11px] flex items-center justify-between text-[#526579]">
            <span>High: <strong className="text-[#2E7D32] font-bold">{loading ? '—' : matchesStats.highConfidence}</strong></span>
            <span>Resolved: <strong className="text-[#00695C] font-bold">{loading ? '—' : matchesStats.resolved}</strong></span>
          </div>
        </div>

        {/* RETURNS STAT */}
        <div className="bg-white border border-[#D9E2E8] hover:shadow-md rounded-2xl p-5 transition-all">
          <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#00695C] flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Handovers
            </span>
            <Link to="/admin/returns" className="text-[#718096] hover:text-[#16324F]">
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-3xl font-black text-[#00695C] tracking-tight">
            {loading ? '—' : returnsStats.total}
          </div>
          <div className="mt-3 pt-3 border-t border-[#D9E2E8] text-[11px] flex items-center justify-between text-[#526579]">
            <span>Returned: <strong className="text-[#00695C] font-bold">{loading ? '—' : returnsStats.completed}</strong></span>
            <span>Disputed: <strong className="text-[#D32F2F] font-bold">{loading ? '—' : returnsStats.disputed}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Visual Aggregations & Status Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Ratio Gauge */}
        <Card className="p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3 mb-4">
              <h3 className="font-bold text-[#16324F] text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF9800]" /> Lost vs Found Ratio
              </h3>
              <span className="text-[11px] text-[#718096] font-medium">Inventory Distribution</span>
            </div>

            <div className="space-y-4">
              {itemsStats.total > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#D32F2F]">Lost Property ({itemsStats.lost})</span>
                    <span className="text-[#2E7D32]">Found Items ({itemsStats.found})</span>
                  </div>
                  <div className="w-full h-3 bg-[#F0F7F6] rounded-full overflow-hidden flex border border-[#D9E2E8]">
                    <div
                      style={{ width: `${itemsStats.total > 0 ? (itemsStats.lost / itemsStats.total) * 100 : 50}%` }}
                      className="bg-[#D32F2F] transition-all duration-500"
                    />
                    <div
                      style={{ width: `${itemsStats.total > 0 ? (itemsStats.found / itemsStats.total) * 100 : 50}%` }}
                      className="bg-[#2E7D32] transition-all duration-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#526579] pt-2">
                    <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8]">
                      <div className="text-[#718096]">Active Pipeline</div>
                      <div className="font-bold text-[#16324F] text-sm">{itemsStats.active} reports</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8]">
                      <div className="text-[#718096]">Resolved / Returned</div>
                      <div className="font-bold text-[#00695C] text-sm">{itemsStats.resolved + itemsStats.returned} items</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-[#718096] text-xs font-medium">
                  No items cataloged in database yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E2E8] text-right">
            <Link to="/admin/lost-items" className="text-xs text-[#00695C] hover:text-[#00897B] font-bold inline-flex items-center gap-1">
              Inspect Lost Queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Claims Verification Pipeline */}
        <Card className="p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3 mb-4">
              <h3 className="font-bold text-[#16324F] text-sm flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-[#2E7D32]" /> Claims Lifecycle Status
              </h3>
              <span className="text-[11px] text-[#718096] font-medium">Verification Desk</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Pending Evaluation', count: claimsStats.pending, color: 'bg-[#FF9800]', text: 'text-[#F57C00]' },
                { label: 'Under Active Review', count: claimsStats.underReview, color: 'bg-[#1976D2]', text: 'text-[#1976D2]' },
                { label: 'Verified & Approved', count: claimsStats.approved, color: 'bg-[#2E7D32]', text: 'text-[#2E7D32]' },
                { label: 'Disapproved / Rejected', count: claimsStats.rejected, color: 'bg-[#D32F2F]', text: 'text-[#D32F2F]' },
                { label: 'Completed Handovers', count: claimsStats.completed, color: 'bg-[#00695C]', text: 'text-[#00695C]' }
              ].map((c) => {
                const pct = claimsStats.total > 0 ? Math.round((c.count / claimsStats.total) * 100) : 0;
                return (
                  <div key={c.label} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#16324F] font-semibold">{c.label}</span>
                      <span className={`font-mono font-bold ${c.text}`}>{c.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F7F6] rounded-full overflow-hidden border border-[#D9E2E8]">
                      <div style={{ width: `${pct}%` }} className={`h-full ${c.color} transition-all duration-500`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E2E8] text-right">
            <Link to="/admin/claims" className="text-xs text-[#00695C] hover:text-[#00897B] font-bold inline-flex items-center gap-1">
              Open Claims Desk <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Handover & Dispute Health */}
        <Card className="p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3 mb-4">
              <h3 className="font-bold text-[#16324F] text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00695C]" /> Security Handover Health
              </h3>
              <span className="text-[11px] text-[#718096] font-medium">Desk Integrity</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#16324F]">Scheduled Pickups</div>
                  <div className="text-[11px] text-[#526579] font-medium">At campus security reception</div>
                </div>
                <div className="text-xl font-bold text-[#FF9800] font-mono">
                  {returnsStats.scheduled + returnsStats.pending}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#16324F]">Completed Handovers</div>
                  <div className="text-[11px] text-[#526579] font-medium">Dual-verified with secure code</div>
                </div>
                <div className="text-xl font-bold text-[#2E7D32] font-mono">
                  {returnsStats.completed}
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                returnsStats.disputed > 0
                  ? 'bg-[#FFEBEE] border-[#D32F2F]/30'
                  : 'bg-[#F7FAFC] border-[#D9E2E8]'
              }`}>
                <div>
                  <div className="text-xs font-bold text-[#16324F] flex items-center gap-1.5">
                    {returnsStats.disputed > 0 && <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />}
                    Disputed Handovers
                  </div>
                  <div className="text-[11px] text-[#526579] font-medium">Requires administrative arbitration</div>
                </div>
                <div className={`text-xl font-bold font-mono ${returnsStats.disputed > 0 ? 'text-[#D32F2F]' : 'text-[#718096]'}`}>
                  {returnsStats.disputed}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D9E2E8] text-right">
            <Link to="/admin/returns" className="text-xs text-[#00695C] hover:text-[#00897B] font-bold inline-flex items-center gap-1">
              Manage Handovers & Disputes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. Real Forensic Audit Activity Feed */}
      <Card className="p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
          <div>
            <h3 className="font-bold text-[#16324F] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1976D2]" /> Real System Audit Activity
            </h3>
            <p className="text-xs text-[#526579] mt-0.5 font-medium">
              Live immutable stream of administrative decisions, report status changes, and handover events.
            </p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-[#00695C] hover:text-[#00897B] font-bold inline-flex items-center gap-1">
            Full Audit Logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-[#D9E2E8]">
            {recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs gap-3 hover:bg-[#F0F7F6] px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#00695C] shrink-0" />
                  <span className="font-mono text-[#00695C] font-bold uppercase text-[11px] tracking-wider px-2 py-0.5 rounded bg-[#E0F2F1] border border-[#00695C]/20">
                    {log.action}
                  </span>
                  <span className="text-[#16324F] font-semibold truncate">
                    {log.entityType ? `${log.entityType} (${log.entityId?.slice?.(-6) || 'ref'})` : 'Administrative action'}
                  </span>
                  <span className="text-[#718096] text-[11px] hidden sm:inline font-medium">
                    by {log.actorName}
                  </span>
                </div>
                <div className="text-[11px] text-[#718096] shrink-0 font-mono font-medium">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-[#718096] text-xs">
            <Activity className="w-8 h-8 mx-auto text-[#718096] mb-2" />
            <p className="font-bold text-[#16324F]">No recent administrative events recorded.</p>
            <p className="text-[#526579] text-[11px] mt-0.5 font-medium">All actions taken by administrators and students will record here in real time.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
