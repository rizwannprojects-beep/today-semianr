import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  PlusCircle,
  AlertCircle,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import itemService from '../services/itemService.js';
import {
  ITEM_CATEGORIES,
  CAMPUS_LOCATIONS,
  LOST_STATUS_OPTIONS
} from '../utils/constants.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';

export const BrowseLost = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [status, setStatus] = useState('all');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input by 300ms
  const debounceTimerRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let sortParam = '-createdAt';
      if (sortBy === 'oldest') sortParam = 'createdAt';
      if (sortBy === 'recently_updated') sortParam = '-updatedAt';

      const params = {
        search: debouncedSearch.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        location: location !== 'all' ? location : undefined,
        status: status !== 'all' ? status : undefined,
        color: color.trim() || undefined,
        brand: brand.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: sortParam,
        page,
        limit: 9
      };

      const res = await itemService.getLostItems(params);
      const data = res?.data?.data || res?.data || [];
      const meta = res?.data?.meta || res?.meta || {};

      setItems(Array.isArray(data) ? data : []);
      setTotalPages(meta.pagination?.totalPages || 1);
      setTotalCount(meta.pagination?.totalItems || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.warn('Error fetching lost items:', err.message);
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, location, status, color, brand, startDate, endDate, sortBy, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategory('all');
    setLocation('all');
    setStatus('all');
    setColor('');
    setBrand('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch ||
    category !== 'all' ||
    location !== 'all' ||
    status !== 'all' ||
    color ||
    brand ||
    startDate ||
    endDate ||
    sortBy !== 'newest';

  return (
    <div className="app-container py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D9E2E8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
              Reported Lost Items
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#526579] mt-1">
            Search items reported missing on campus. Smart multi-term search and filters enabled.
          </p>
        </div>

        <Link to="/report-lost">
          <Button variant="primary" size="md" icon={PlusCircle} className="font-bold shadow-xs">
            Report Lost Item
          </Button>
        </Link>
      </div>

      {/* Registry Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-1">
        <Link
          to="/browse-lost"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#FFF3E0] text-[#D84315] border border-[#FFE0B2] shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#D84315]" />
          <span>Lost Items ({totalCount})</span>
        </Link>
        <Link
          to="/browse-found"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] border border-transparent transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#2E7D32]/50" />
          <span>Found Items</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <Card className="space-y-4 p-5 sm:p-6 bg-white border-[#D9E2E8] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Smart Search Bar */}
          <div className="md:col-span-6 relative">
            <Input
              id="lost-search-input"
              placeholder="Smart search (e.g. 'black samsung phone', 'library blue bottle')..."
              value={searchInput}
              onChange={handleSearchChange}
              icon={Search}
            />
            {searchInput && (
              <span className="absolute right-3 top-2.5 text-[10px] text-[#00695C] font-mono flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3" /> Smart
              </span>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 flex gap-2">
            <select
              aria-label="Sort items"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="recently_updated">Sort: Recently Updated</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-3 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-[#E0F2F1] border-[#00695C] text-[#00695C]'
                  : 'bg-[#F7FAFC] border-[#D9E2E8] text-[#526579] hover:border-[#00695C]'
              }`}
              title="Toggle Advanced Filters"
              aria-label="Toggle Advanced Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#D9E2E8] animate-fadeIn">
            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-[#526579] uppercase tracking-wider mb-1">
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                <option value="all">All Campus Locations</option>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-[#526579] uppercase tracking-wider mb-1">
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                <option value="all">All Statuses</option>
                {LOST_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#526579] uppercase tracking-wider mb-1">
                Brand / Make
              </label>
              <input
                type="text"
                placeholder="e.g. Apple, Dell, Titan"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#526579] uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                placeholder="e.g. Black, Blue, Grey"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-[11px] font-bold text-[#526579] uppercase tracking-wider mb-1">
                Lost From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[11px] font-bold text-[#526579] uppercase tracking-wider mb-1">
                Lost To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
            </div>
          </div>
        )}

        {/* Results count & Reset Bar */}
        <div className="flex items-center justify-between text-xs text-[#526579] pt-2 border-t border-[#D9E2E8]">
          <span className="flex items-center gap-1.5 font-medium">
            Showing <strong className="text-[#16324F]">{items.length}</strong> of{' '}
            <strong className="text-[#00695C]">{totalCount}</strong> reported lost items
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#00695C] hover:text-[#004D40] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-[#D9E2E8] rounded-2xl p-5 space-y-4 animate-pulse shadow-xs"
            >
              <div className="w-full h-44 bg-[#F0F7F6] rounded-xl" />
              <div className="h-4 bg-[#F0F7F6] rounded w-2/3" />
              <div className="h-3 bg-[#F0F7F6] rounded w-full" />
              <div className="h-3 bg-[#F0F7F6] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#D9E2E8] rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FFF3E0] border border-[#FFE0B2] text-[#FF9800] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#16324F] text-lg">No matching lost items found</h3>
            <p className="text-xs sm:text-sm text-[#526579] max-w-md mx-auto">
              We couldn't find any reports matching your criteria. Try loosening your keywords or clearing date/category filters.
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="mx-auto">
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const primaryImage = (item.images && item.images.length > 0 ? item.images[0] : null) || item.primaryImage || item.image;
            const hasImage = Boolean(primaryImage);
            const itemTitle = item.itemName || item.title || 'Reported Lost Item';
            const itemLoc = item.location || item.lostLocation || 'Campus';
            const itemDate = item.dateLost || item.date || item.createdAt;

            return (
              <Card
                key={item._id}
                hover
                className="flex flex-col justify-between overflow-hidden bg-white border-[#D9E2E8] hover:border-[#00897B] transition-all group shadow-xs"
              >
                <div>
                  {/* Item Image with fallbacks */}
                  <div className="relative w-full h-48 bg-[#F7FAFC] rounded-xl overflow-hidden mb-4 border border-[#D9E2E8]">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#718096] bg-[#F7FAFC]">
                        <ImageIcon className="w-10 h-10 mb-1 opacity-50 text-[#00695C]" />
                        <span className="text-[11px] font-medium text-[#718096]">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Category pill */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#00695C] border border-[#B2DFDB] shadow-2xs">
                      {item.category}
                    </span>

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge status={item.status || 'ACTIVE'} />
                    </div>

                    {/* Multi-image indicator */}
                    {item.images && item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/90 text-[#16324F] font-bold shadow-2xs">
                        +{item.images.length - 1} photos
                      </span>
                    )}
                  </div>

                  {/* Header & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#16324F] line-clamp-1 group-hover:text-[#00695C] transition-colors">
                      {itemTitle}
                    </h3>

                    {/* Chips for brand/color */}
                    {(item.brand || item.color) && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {item.brand && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0F7F6] text-[#00695C] border border-[#B2DFDB] font-semibold">
                            {item.brand}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0F7F6] text-[#00695C] border border-[#B2DFDB] font-semibold">
                            {item.color}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#526579] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="pt-4 mt-4 border-t border-[#D9E2E8] space-y-2 text-xs text-[#526579]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                    <span className="truncate">{itemLoc}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                    <span>Lost: {new Date(itemDate).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-2">
                    <Link to={`/item/lost/${item._id}`} className="block w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold hover:border-[#00695C]">
                        View Item Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-[#526579] px-3 font-semibold">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrowseLost;
