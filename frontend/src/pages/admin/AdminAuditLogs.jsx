import { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Search,
  ArrowLeft,
  Filter,
  Lock,
  User,
  Calendar,
  Layers,
  Clock,
  Download
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import adminService from '../../services/adminService.js';

export const AdminAuditLogs = () => {
  const location = useLocation();
  const isSecurityDefault = location.pathname.includes('/admin/security-events');
  const [activeTab, setActiveTab] = useState(isSecurityDefault ? 'security' : 'audit');
  const [logs, setLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });

  const fetchAuditData = async (page = 1) => {
    try {
      setLoading(true);
      if (activeTab === 'audit') {
        const res = await adminService.getAuditLogs({
          page,
          limit: 20,
          action: actionFilter || undefined
        });
        if (res?.data?.logs) {
          setLogs(res.data.logs);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      } else {
        const res = await adminService.getSecurityEvents();
        if (res?.data?.events) {
          setSecurityEvents(res.data.events);
        } else if (Array.isArray(res?.data)) {
          setSecurityEvents(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(1);
  }, [activeTab, actionFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#00695C]" />
            Audit Ledger & Security Events
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Immutable, read-only chronological trail of system modifications, authentication forensics, and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#00695C] bg-[#E0F2F1] px-3.5 py-2 rounded-xl border border-[#00695C]/20 font-bold shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#00695C]" />
          <span>WORM Compliance (Write Once, Read Only)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#00695C] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          General System Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#D32F2F] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#FF9800]" />
          Critical Security Events
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'audit' && (
        <Card className="p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#16324F] font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#718096]" /> Action Filter:
            </span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="">All Action Types</option>
              <option value="login_success">User Login</option>
              <option value="user_suspended">User Suspension</option>
              <option value="user_reactivated">User Reactivation</option>
              <option value="claim_approved">Claim Approval</option>
              <option value="claim_rejected">Claim Rejection</option>
              <option value="return_verified">Return Verification</option>
              <option value="dispute_resolved">Dispute Resolved</option>
            </select>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="p-0 overflow-hidden shadow-xs border-[#D9E2E8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16324F] min-w-[700px]">
            <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity & Target</th>
                <th className="py-3 px-4">Result / Context</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#526579] font-medium">
                    Loading audit records...
                  </td>
                </tr>
              ) : (activeTab === 'audit' ? logs : securityEvents).length > 0 ? (
                (activeTab === 'audit' ? logs : securityEvents).map((l) => {
                  const id = l._id || l.id;
                  const isSecurity = ['user_suspended', 'failed_login', 'unauthorized_access_attempt'].includes(l.action);

                  return (
                    <tr key={id} className="hover:bg-[#F0F7F6] transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#526579] whitespace-nowrap font-medium">
                        {new Date(l.timestamp || l.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                          isSecurity
                            ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30'
                            : 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/30'
                        }`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#16324F] font-bold">
                          {l.actor?.fullName || l.actorEmail || 'System / Admin'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#16324F] font-semibold">{l.entityType || 'Platform'}</div>
                        <div className="text-[10px] font-mono text-[#00695C] font-bold">
                          {l.entityId ? `#${l.entityId.toString().slice(-6)}` : '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-[#526579] text-[11px] truncate font-medium">
                        {l.metadata?.reason || l.metadata?.action || JSON.stringify(l.metadata || {})}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#718096] text-[11px]">
                        {l.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-[#526579] font-medium">
                    No log entries matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar for Audit Logs */}
        {activeTab === 'audit' && pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-[#D9E2E8] flex items-center justify-between text-xs text-[#526579] font-medium bg-[#F7FAFC]">
            <span>
              Showing {logs.length} of {pagination.totalItems} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchAuditData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] disabled:opacity-40 hover:bg-[#F0F7F6] font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-bold text-[#16324F]">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchAuditData(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] disabled:opacity-40 hover:bg-[#F0F7F6] font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
