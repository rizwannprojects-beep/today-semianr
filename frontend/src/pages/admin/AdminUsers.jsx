import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Mail,
  GraduationCap,
  AlertCircle,
  ArrowLeft,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  UserX,
  UserCheck,
  Download,
  Phone,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import adminService from '../../services/adminService.js';
import useAuth from '../../hooks/useAuth.js';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalItems: 0, totalPages: 1 });

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        accountStatus: statusFilter || undefined,
        department: departmentFilter || undefined
      };
      const res = await adminService.getUsers(params);
      if (res?.data?.users) {
        setUsers(res.data.users);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(delayTimer);
  }, [search, roleFilter, statusFilter, departmentFilter]);

  const handleOpenDetails = async (u) => {
    try {
      setSelectedUser(u);
      setDetailsLoading(true);
      const uid = u._id || u.id;
      const res = await adminService.getUserById(uid);
      if (res?.data) {
        setUserDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenSuspendModal = (u) => {
    setSuspendingUser(u);
    setSuspendReason('');
    setActionError('');
  };

  const handleConfirmSuspend = async () => {
    if (!suspendReason.trim() || suspendReason.trim().length < 5) {
      setActionError('Please provide a valid suspension reason (minimum 5 characters).');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      const uid = suspendingUser._id || suspendingUser.id;
      await adminService.suspendUser(uid, suspendReason.trim());
      setActionSuccess(`Student account for ${suspendingUser.fullName || suspendingUser.name} suspended.`);
      setSuspendingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to suspend user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (u) => {
    try {
      setActionLoading(true);
      const uid = u._id || u.id;
      await adminService.reactivateUser(uid, 'Reactivated by administration');
      setActionSuccess(`Account for ${u.fullName || u.name} reactivated successfully.`);
      fetchUsers(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to reactivate user.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00695C]" />
            Institutional User Governance
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Directory of campus students and administrative staff. Search, audit records, and manage access privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(adminService.exportCsvUrl('items'), '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-xs font-semibold text-[#16324F] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00695C]" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs flex items-center justify-between font-semibold">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-[#FFEBEE] border border-[#D32F2F]/30 text-[#D32F2F] text-xs flex items-center justify-between font-semibold">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#718096]" />
            <input
              type="text"
              placeholder="Search by name, reg#, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="">All Account Roles</option>
              <option value="student">Students</option>
              <option value="admin">Administrators</option>
              <option value="staff">Staff Personnel</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
              <option value="Electrical">Electrical & Electronics</option>
              <option value="Campus Security">Campus Security</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden shadow-xs border-[#D9E2E8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16324F] min-w-[700px]">
            <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
              <tr>
                <th className="py-3 px-4">Student / Name</th>
                <th className="py-3 px-4">Register #</th>
                <th className="py-3 px-4">Department & Class</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#526579] font-medium">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const uid = u._id || u.id;
                  const isSuspended = u.accountStatus === 'suspended';
                  const isCurrent = currentUser?._id === uid || currentUser?.id === uid;

                  return (
                    <tr key={uid} className="hover:bg-[#F0F7F6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#16324F]">{u.fullName || u.name}</div>
                        <div className="text-[11px] text-[#526579] flex items-center gap-1 font-medium">
                          <Mail className="w-3 h-3 text-[#718096]" /> {u.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#00695C]">
                        {u.registerNumber || <span className="text-[#718096] italic font-normal">None</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#16324F]">{u.department || 'General'}</div>
                        <div className="text-[11px] text-[#526579]">
                          {u.course ? `${u.course} (Yr ${u.year || 1})` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          u.role === 'admin'
                            ? 'bg-[#FFF3E0] text-[#F57C00] border-[#FF9800]/40'
                            : u.role === 'superadmin'
                            ? 'bg-[#F3E5F5] text-[#7B1FA2] border-[#7B1FA2]/40'
                            : 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/40">
                            <XCircle className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/40">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#718096] font-mono text-[11px] font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(u)}
                            className="p-1.5 rounded-lg bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-[#00695C] cursor-pointer shadow-xs"
                            title="View Full Profile & Activity"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isSuspended ? (
                            <button
                              onClick={() => handleReactivate(u)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/40 text-[#2E7D32] hover:bg-[#C8E6C9] text-[11px] font-bold cursor-pointer"
                              title="Reactivate Account"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSuspendModal(u)}
                              disabled={isCurrent || actionLoading}
                              className={`p-1.5 rounded-lg text-[#718096] border border-[#D9E2E8] ${
                                isCurrent
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-[#FFEBEE] hover:text-[#D32F2F] hover:border-[#D32F2F]/40 cursor-pointer shadow-xs'
                              }`}
                              title={isCurrent ? 'Cannot suspend self' : 'Suspend Account'}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-[#526579] font-medium">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-[#D9E2E8] flex items-center justify-between text-xs text-[#526579] font-medium bg-[#F7FAFC]">
            <span>
              Showing {users.length} of {pagination.totalItems} users
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] disabled:opacity-40 hover:bg-[#F0F7F6] font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-bold text-[#16324F]">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] disabled:opacity-40 hover:bg-[#F0F7F6] font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00695C]" />
                  {selectedUser.fullName || selectedUser.name}
                </h3>
                <p className="text-xs text-[#526579] font-medium">Institutional Profile & Activity Audit</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-[#718096] hover:text-[#16324F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-[#526579] text-xs font-medium">Loading user profile...</div>
            ) : userDetails ? (
              <div className="space-y-5">
                {/* Profile Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold">Email Address</span>
                    <span className="text-[#16324F] font-bold truncate block">{userDetails.user?.email}</span>
                  </div>
                  <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold">Register Number</span>
                    <span className="text-[#00695C] font-mono font-bold">{userDetails.user?.registerNumber || '—'}</span>
                  </div>
                  <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold">Role / Status</span>
                    <span className="text-[#00695C] font-bold uppercase text-[11px]">
                      {userDetails.user?.role} ({userDetails.user?.accountStatus})
                    </span>
                  </div>
                  <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold">Department</span>
                    <span className="text-[#16324F] font-semibold">{userDetails.user?.department || '—'}</span>
                  </div>
                  <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold">Course & Year</span>
                    <span className="text-[#16324F] font-semibold">{userDetails.user?.course || 'B.Tech'} (Yr {userDetails.user?.year || 1})</span>
                  </div>
                  <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                    <span className="text-[#718096] block text-[10px] uppercase font-bold">Member Since</span>
                    <span className="text-[#16324F] font-medium font-mono">
                      {new Date(userDetails.user?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Activity Counts */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#FFEBEE]/40 border border-[#D32F2F]/20">
                    <div className="text-[#D32F2F] font-bold text-[10px] uppercase">Lost Reports</div>
                    <div className="text-xl font-black text-[#D32F2F] font-mono">{userDetails.activitySummary?.lostReportsCount || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#E8F5E9]/40 border border-[#2E7D32]/20">
                    <div className="text-[#2E7D32] font-bold text-[10px] uppercase">Found Reports</div>
                    <div className="text-xl font-black text-[#2E7D32] font-mono">{userDetails.activitySummary?.foundReportsCount || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFF3E0]/40 border border-[#FF9800]/20">
                    <div className="text-[#F57C00] font-bold text-[10px] uppercase">Claims Filed</div>
                    <div className="text-xl font-black text-[#F57C00] font-mono">{userDetails.activitySummary?.claimsCount || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#E0F2F1]/40 border border-[#00695C]/20">
                    <div className="text-[#00695C] font-bold text-[10px] uppercase">Handovers</div>
                    <div className="text-xl font-black text-[#00695C] font-mono">{userDetails.activitySummary?.returnsCount || 0}</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-[#D9E2E8] flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#D32F2F] font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-[#D32F2F]" /> Confirm Account Suspension
            </div>
            <p className="text-xs text-[#16324F] font-medium leading-relaxed">
              Are you sure you want to suspend the student account for <strong className="text-[#16324F] font-bold">{suspendingUser.fullName}</strong> ({suspendingUser.email})?
            </p>
            <p className="text-[11px] text-[#526579] font-medium">
              Suspended users cannot sign in, create new reports, file claims, or perform campus handovers. Historical records remain intact for audit compliance.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                Reason for Suspension (Required, min 5 chars):
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g., Policy violation, fraudulent claim submission, false report..."
                className="w-full p-3 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] h-24"
              />
            </div>

            {actionError && (
              <div className="text-[#D32F2F] text-xs font-semibold">{actionError}</div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSuspendingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmSuspend}
                disabled={actionLoading}
              >
                {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
