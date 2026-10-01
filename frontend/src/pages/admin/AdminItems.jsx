import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Tag,
  MapPin,
  ArrowLeft,
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  Archive,
  AlertTriangle,
  RotateCcw,
  Calendar,
  X,
  ExternalLink,
  Download
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import adminService from '../../services/adminService.js';

export const AdminItems = () => {
  const location = useLocation();
  const initialType = location.pathname.includes('lost-items')
    ? 'lost'
    : location.pathname.includes('found-items')
    ? 'found'
    : '';

  const [activeTab, setActiveTab] = useState(initialType);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalItems: 0, totalPages: 1 });

  // Selected Item details modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Moderation action modal
  const [moderatingItem, setModeratingItem] = useState(null);
  const [moderationAction, setModerationAction] = useState('hide');
  const [moderationNotes, setModerationNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const fetchItems = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        type: activeTab || undefined,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined
      };

      let res;
      if (activeTab === 'lost') {
        res = await adminService.getLostItems(params);
      } else if (activeTab === 'found') {
        res = await adminService.getFoundItems(params);
      } else {
        res = await adminService.getItems(params);
      }

      if (res?.data?.items) {
        setItems(res.data.items);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchItems(1);
    }, 300);
    return () => clearTimeout(delayTimer);
  }, [activeTab, search, categoryFilter, statusFilter]);

  const handleOpenModeration = (item, action) => {
    setModeratingItem(item);
    setModerationAction(action);
    setModerationNotes('');
    setActionMessage({ type: '', text: '' });
  };

  const handleConfirmModeration = async () => {
    try {
      setActionLoading(true);
      const itemId = moderatingItem._id || moderatingItem.id;
      await adminService.moderateItem(itemId, moderationAction, moderationNotes);
      setActionMessage({
        type: 'success',
        text: `Item successfully updated (Action: ${moderationAction.toUpperCase()}).`
      });
      setModeratingItem(null);
      fetchItems(pagination.page);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Moderation action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#00695C]" />
            Campus Items Custody & Moderation
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Audit lost and found property filings, moderate questionable reports, and enforce custodial records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(adminService.exportCsvUrl('items'), '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-xs font-semibold text-[#16324F] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00695C]" />
            <span>Export Registry</span>
          </button>
        </div>
      </div>

      {actionMessage.text && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between font-semibold border ${
          actionMessage.type === 'error'
            ? 'bg-[#FFEBEE] border-[#D32F2F]/30 text-[#D32F2F]'
            : 'bg-[#E8F5E9] border-[#2E7D32]/30 text-[#2E7D32]'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage({ type: '', text: '' })} className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === ''
              ? 'bg-[#00695C] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          All Items Inventory
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'lost'
              ? 'bg-[#D32F2F] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          Lost Property Filings
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'found'
              ? 'bg-[#2E7D32] text-white shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          Found Belongings in Custody
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#718096]" />
            <input
              type="text"
              placeholder="Search by title, location, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Mobile Phone">Mobile Phone</option>
              <option value="Laptop">Laptop / Notebook</option>
              <option value="Keys">Keys</option>
              <option value="Wallets & Cards">Wallets & Cards</option>
              <option value="Identification & Cards">Identification & Cards</option>
              <option value="Bags & Backpacks">Bags & Backpacks</option>
              <option value="Books & Study Materials">Books & Study Materials</option>
              <option value="Clothing">Clothing</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="FOUND">FOUND</option>
              <option value="CLAIMED">CLAIMED</option>
              <option value="RETURNED">RETURNED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="FLAGGED">FLAGGED / HIDDEN</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card className="p-0 overflow-hidden shadow-xs border-[#D9E2E8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16324F] min-w-[750px]">
            <thead className="bg-[#F0F7F6] text-[#16324F] font-bold uppercase tracking-wider text-[11px] border-b border-[#D9E2E8]">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2E8]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#526579] font-medium">
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => {
                  const id = item._id || item.id;
                  const isLost = item.type === 'lost';
                  const isFlagged = item.status === 'FLAGGED' || item.visibility === 'private';

                  return (
                    <tr key={id} className="hover:bg-[#F0F7F6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#16324F] truncate max-w-[200px]">
                          {item.title || item.itemName}
                        </div>
                        <div className="text-[11px] text-[#526579] truncate max-w-[220px]">
                          {item.description || 'No description provided'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isLost ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30' : 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#16324F] font-medium">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-[#16324F]">
                        <div className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                          <span className="truncate max-w-[140px]">{item.location}</span>
                        </div>
                        {item.storageLocation && (
                          <div className="text-[10px] text-[#FF9800] font-mono font-bold">
                            Desk: {item.storageLocation}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#16324F]">
                          {item.reporter?.fullName || item.reporter?.name || 'Student'}
                        </div>
                        <div className="text-[10px] text-[#718096]">
                          {item.reporter?.email || ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          item.status === 'ACTIVE'
                            ? 'bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]/30'
                            : item.status === 'FOUND'
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                            : item.status === 'FLAGGED'
                            ? 'bg-[#FFF3E0] text-[#F57C00] border-[#FF9800]/40'
                            : item.status === 'CLAIMED'
                            ? 'bg-[#F3E5F5] text-[#7B1FA2] border-[#7B1FA2]/30'
                            : item.status === 'RETURNED'
                            ? 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/30'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-[#00695C] cursor-pointer shadow-xs"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isFlagged ? (
                            <button
                              onClick={() => handleOpenModeration(item, 'restore')}
                              className="p-1.5 rounded-lg bg-[#E8F5E9] border border-[#2E7D32]/40 text-[#2E7D32] hover:bg-[#C8E6C9] cursor-pointer shadow-xs"
                              title="Restore to Active"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModeration(item, 'hide')}
                              className="p-1.5 rounded-lg bg-white border border-[#D9E2E8] hover:bg-[#FFEBEE] hover:text-[#D32F2F] hover:border-[#D32F2F]/40 text-[#718096] cursor-pointer shadow-xs"
                              title="Flag / Hide Inappropriate Content"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenModeration(item, 'close')}
                            className="p-1.5 rounded-lg bg-white border border-[#D9E2E8] hover:bg-[#F0F7F6] text-[#718096] hover:text-[#16324F] cursor-pointer shadow-xs"
                            title="Close / Archive Report"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-[#526579] font-medium">
                    No items found matching the selected filter.
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
              Showing {items.length} of {pagination.totalItems} items
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchItems(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] disabled:opacity-40 hover:bg-[#F0F7F6] font-semibold cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-bold text-[#16324F]">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchItems(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] disabled:opacity-40 hover:bg-[#F0F7F6] font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Item Details Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 border ${
                  selectedItem.type === 'lost' ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30' : 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/30'
                }`}>
                  {selectedItem.type} property
                </span>
                <h3 className="text-lg font-bold text-[#16324F]">
                  {selectedItem.title || selectedItem.itemName}
                </h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-[#718096] hover:text-[#16324F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#16324F]">
              <div className="p-3.5 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                <span className="text-[#718096] block text-[10px] uppercase font-bold">Description</span>
                <p className="mt-1 leading-relaxed text-[#16324F] font-medium">{selectedItem.description}</p>
              </div>

              {selectedItem.identifyingMarks && (
                <div className="p-3.5 bg-[#FFF3E0] border border-[#FF9800]/30 rounded-xl">
                  <span className="text-[#F57C00] block text-[10px] font-bold uppercase">Distinguishing Marks / Serial Number</span>
                  <p className="mt-1 text-[#16324F] font-mono font-bold">{selectedItem.identifyingMarks}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Location</span>
                  <span className="text-[#16324F] font-bold">{selectedItem.location}</span>
                </div>
                <div className="p-3 bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl">
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Storage / Custody Desk</span>
                  <span className="text-[#00695C] font-bold">{selectedItem.storageLocation || 'Campus Office'}</span>
                </div>
              </div>

              {selectedItem.images && selectedItem.images.length > 0 && (
                <div>
                  <span className="text-[#718096] block text-[11px] mb-2 font-bold uppercase">Attached Item Photos</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedItem.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="item"
                        className="w-full h-24 object-cover rounded-xl border border-[#D9E2E8]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#D9E2E8] flex items-center justify-between">
              <Link
                to={`/items/${selectedItem._id || selectedItem.id}`}
                target="_blank"
                className="text-xs text-[#00695C] hover:underline font-bold flex items-center gap-1"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Confirmation Modal */}
      {moderatingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#FF9800] font-bold text-base">
              <AlertTriangle className="w-5 h-5" /> Administrative Item Moderation
            </div>
            <p className="text-xs text-[#16324F] font-medium leading-relaxed">
              Action: <strong className="text-[#00695C] uppercase font-mono font-bold">{moderationAction}</strong> for item{' '}
              <strong className="text-[#16324F] font-bold">"{moderatingItem.title || moderatingItem.itemName}"</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[#16324F] uppercase tracking-wider mb-1">
                Moderation Notes / Audit Justification:
              </label>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="e.g., Inappropriate content, duplicate filing, spam, or verified custody closure..."
                className="w-full p-3 bg-white border border-[#D9E2E8] rounded-xl text-xs text-[#16324F] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModeratingItem(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={handleConfirmModeration}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Apply Moderation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminItems;
