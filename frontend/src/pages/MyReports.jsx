import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  MapPin,
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  RotateCw
} from 'lucide-react';
import itemService from '../services/itemService.js';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../utils/constants.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export const MyReports = () => {
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: '',
    category: '',
    description: '',
    location: '',
    color: '',
    brand: '',
    status: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Dialog State
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchUserReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lostRes, foundRes] = await Promise.allSettled([
        itemService.getMyLostItems(),
        itemService.getMyFoundItems()
      ]);

      if (lostRes.status === 'fulfilled') {
        const lData = lostRes.value?.data?.data || lostRes.value?.data || [];
        setLostItems(Array.isArray(lData) ? lData : []);
      }
      if (foundRes.status === 'fulfilled') {
        const fData = foundRes.value?.data?.data || foundRes.value?.data || [];
        setFoundItems(Array.isArray(fData) ? fData : []);
      }
    } catch (err) {
      console.warn('Failed to load user reports:', err);
      setError('Could not load your reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReports();
  }, []);

  const items = activeTab === 'lost' ? lostItems : foundItems;

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      itemName: item.itemName || item.title || '',
      category: item.category || ITEM_CATEGORIES[0],
      description: item.description || '',
      location: item.location || item.lostLocation || item.foundLocation || '',
      color: item.color || '',
      brand: item.brand || '',
      status: item.status || (activeTab === 'lost' ? 'ACTIVE' : 'FOUND')
    });
    setEditError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditSubmitting(true);
    setEditError(null);

    try {
      await itemService.updateItem(
        editingItem._id,
        {
          itemName: editForm.itemName.trim(),
          title: editForm.itemName.trim(),
          category: editForm.category,
          description: editForm.description.trim(),
          location: editForm.location.trim(),
          color: editForm.color.trim(),
          brand: editForm.brand.trim(),
          status: editForm.status
        },
        activeTab
      );

      setEditingItem(null);
      await fetchUserReports();
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update item report.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteSubmitting(true);

    try {
      await itemService.deleteItem(deletingItem._id, activeTab);
      setDeletingItem(null);
      await fetchUserReports();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete report.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D9E2E8] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F] tracking-tight">My Incident Reports</h1>
          <p className="text-xs sm:text-sm text-[#526579] font-medium mt-0.5">
            Manage your reported lost belongings and items you have turned into campus holding desks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/report-lost">
            <Button variant="outline" size="sm" icon={PlusCircle} className="text-[#D32F2F] border-[#D32F2F]/40 hover:bg-[#FFEBEE]">
              Report Lost Item
            </Button>
          </Link>
          <Link to="/report-found">
            <Button variant="accent" size="sm" icon={ShieldCheck} className="font-semibold shadow-xs">
              Report Found Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#D9E2E8] pb-2">
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'lost'
              ? 'bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/40 shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Lost Reports ({lostItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'found'
              ? 'bg-[#E0F2F1] text-[#00695C] border border-[#00897B]/40 shadow-xs'
              : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Found Reports ({foundItems.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#526579] font-medium">Loading your registered reports...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-16 space-y-4 bg-white border-[#D9E2E8] shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center mx-auto">
            {activeTab === 'lost' ? <FileText className="w-7 h-7 text-[#D32F2F]" /> : <ShieldCheck className="w-7 h-7 text-[#00695C]" />}
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#16324F]">
              No {activeTab === 'lost' ? 'lost items' : 'found items'} reported yet
            </p>
            <p className="text-xs text-[#526579] font-medium max-w-md mx-auto">
              {activeTab === 'lost'
                ? 'Misplaced personal belongings? File a report to trigger automated alerts and community matches.'
                : 'Found an unattended item? Help campus members recover their property by logging it.'}
            </p>
          </div>
          <div className="pt-2">
            <Link to={activeTab === 'lost' ? '/report-lost' : '/report-found'}>
              <Button variant="accent" size="md">
                Create {activeTab === 'lost' ? 'Lost' : 'Found'} Report
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => {
            const hasImage = item.images && item.images.length > 0;
            const primaryImage = hasImage ? item.images[0] : null;
            const title = item.itemName || item.title || 'Untitled Report';
            const location = item.location || item.lostLocation || item.foundLocation || 'Campus';
            const reportDate = item.dateLost || item.dateFound || item.date || item.createdAt;

            return (
              <Card
                key={item._id}
                className="flex flex-col justify-between p-5 bg-white border-[#D9E2E8] hover:border-[#00897B] transition-all space-y-4 shadow-xs"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F0F7F6] border border-[#D9E2E8] shrink-0">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#718096]">
                        <ImageIcon className="w-6 h-6 opacity-40 mb-0.5 text-[#526579]" />
                        <span className="text-[9px] font-semibold text-[#526579]">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded border border-[#00897B]/30">
                        {item.category}
                      </span>
                      <StatusBadge status={item.status || (activeTab === 'lost' ? 'ACTIVE' : 'FOUND')} />
                    </div>

                    <h3 className="font-bold text-[#16324F] text-base truncate">{title}</h3>
                    <p className="text-xs text-[#526579] font-medium line-clamp-2">{item.description}</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-3 border-t border-[#D9E2E8] grid grid-cols-2 gap-2 text-[11px] text-[#526579]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                    <span className="truncate font-medium">{location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                    <span className="truncate font-medium">Date: {new Date(reportDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 text-[10px] text-[#718096] font-medium">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>Last updated: {new Date(item.updatedAt || item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D9E2E8]">
                  <Link to={`/item/${activeTab}/${item._id}`}>
                    <Button variant="ghost" size="sm" icon={ExternalLink} className="text-xs text-[#526579] hover:text-[#16324F]">
                      View
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenEdit(item)}
                      className="text-xs text-[#00695C] border-[#D9E2E8] hover:border-[#00695C]"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setDeletingItem(item)}
                      className="text-xs text-[#D32F2F] hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D9E2E8] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#00695C]" />
                <h3 className="font-bold text-[#16324F] text-base">Edit Report Details</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#718096] hover:text-[#16324F] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-lg bg-[#FFEBEE] border border-[#D32F2F]/30 text-[#D32F2F] text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <Input
                id="edit-name"
                name="itemName"
                label="Item Name"
                value={editForm.itemName}
                onChange={handleEditChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                  >
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                  >
                    {activeTab === 'lost' ? (
                      <>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="MATCH_FOUND">MATCH_FOUND</option>
                        <option value="CLAIM_IN_PROGRESS">CLAIM_IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </>
                    ) : (
                      <>
                        <option value="FOUND">FOUND</option>
                        <option value="UNDER_VERIFICATION">UNDER_VERIFICATION</option>
                        <option value="CLAIMED">CLAIMED</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="CLOSED">CLOSED</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="edit-color"
                  name="color"
                  label="Color"
                  value={editForm.color}
                  onChange={handleEditChange}
                />
                <Input
                  id="edit-brand"
                  name="brand"
                  label="Brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1">
                  Location
                </label>
                <select
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9E2E8]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={editSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={editSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#D9E2E8] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-[#D32F2F]">
              <div className="w-10 h-10 rounded-full bg-[#FFEBEE] flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#D32F2F]" />
              </div>
              <h3 className="font-bold text-[#16324F] text-base">Delete Report?</h3>
            </div>

            <p className="text-xs text-[#526579] font-medium leading-relaxed">
              Are you sure you want to remove the report for{' '}
              <strong className="text-[#16324F]">
                {deletingItem.itemName || deletingItem.title || 'this item'}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D9E2E8]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingItem(null)}
                disabled={deleteSubmitting}
              >
                Keep Report
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={deleteSubmitting}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
