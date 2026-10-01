import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  Building2,
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
  FOUND_STATUS_OPTIONS
} from '../utils/constants.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';

export const BrowseFound = () => {
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

      const res = await itemService.getFoundItems(params);
      const data = res?.data?.data || res?.data || [];
      const meta = res?.data?.meta || res?.meta || {};

      setItems(Array.isArray(data) ? data : []);
      setTotalPages(meta.pagination?.totalPages || 1);
      setTotalCount(meta.pagination?.totalItems || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.warn('Error fetching found items:', err.message);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D9E2E8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00897B] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
              Turned-in / Found Items
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#526579] mt-1 font-medium">
            Browse discovered campus property held in campus custody awaiting verified owner claims.
          </p>
        </div>

        <Link to="/report-found">
          <Button variant="accent" size="md" icon={ShieldCheck} className="font-semibold shadow-xs">
            Report Found Item
          </Button>
        </Link>
      </div>

      {/* Registry Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-1">
        <Link
          to="/browse-lost"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#526579] hover:text-[#00695C] hover:bg-[#F0F7F6] border border-transparent transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#D32F2F]/60" />
          <span>Lost Items</span>
        </Link>
        <Link
          to="/browse-found"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-[#E0F2F1] text-[#00695C] border border-[#00897B]/30 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#00897B]" />
          <span>Found Items ({totalCount})</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <Card className="space-y-4 p-5 sm:p-6 bg-white border-[#D9E2E8] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Smart Search Bar */}
          <div className="md:col-span-6 relative">
            <Input
              id="found-search-input"
              placeholder="Smart search (e.g. 'casio calculator', 'library brown wallet')..."
              value={searchInput}
              onChange={handleSearchChange}
              icon={Search}
            />
            {searchInput && (
              <span className="absolute right-3 top-2.5 text-[10px] text-[#00695C] font-semibold font-mono flex items-center gap-1">
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
              className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
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
              className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="recently_updated">Sort: Recently Updated</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-3.5 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-[#FFF3E0] border-[#FF9800] text-[#D84315]'
                  : 'bg-white border-[#D9E2E8] text-[#526579] hover:border-[#00695C] hover:text-[#00695C]'
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
                Found Location
              </label>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                <option value="all">All Locations</option>
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                <option value="all">All Statuses</option>
                {FOUND_STATUS_OPTIONS.map((st) => (
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
                placeholder="e.g. Casio, Dell, Fastrack"
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
                placeholder="e.g. Black, Blue, Silver"
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
                Found From Date
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
                Found To Date
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
            <strong className="text-[#00695C]">{totalCount}</strong> found items
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#D84315] hover:text-[#BF360C] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
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
              className="bg-white border border-[#D9E2E8] rounded-xl p-5 space-y-4 animate-pulse shadow-xs"
            >
              <div className="w-full h-44 bg-[#F0F7F6] rounded-lg" />
              <div className="h-4 bg-[#F0F7F6] rounded w-2/3" />
              <div className="h-3 bg-[#F0F7F6] rounded w-full" />
              <div className="h-3 bg-[#F0F7F6] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#D9E2E8] rounded-xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#E0F2F1] text-[#00695C] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#16324F] text-lg">No found items matched your criteria</h3>
            <p className="text-xs sm:text-sm text-[#526579] max-w-md mx-auto">
              If you misplaced an item, be sure to file a Lost Report so you get notified immediately upon recovery.
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
            const hasImage = item.images && item.images.length > 0;
            const primaryImage = hasImage ? item.images[0] : null;
            const itemTitle = item.itemName || item.title || 'Found Property';
            const itemLoc = item.location || item.foundLocation || 'Campus Ground';
            const itemDate = item.dateFound || item.date || item.createdAt;

            return (
              <Card
                key={item._id}
                hover
                className="flex flex-col justify-between overflow-hidden bg-white border-[#D9E2E8] hover:border-[#00897B] transition-all group shadow-xs"
              >
                <div>
                  {/* Item Image */}
                  <div className="relative w-full h-48 bg-[#F0F7F6] rounded-lg overflow-hidden mb-4 border border-[#D9E2E8]">
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
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#526579] bg-[#F1FAF9]">
                        <ImageIcon className="w-10 h-10 mb-1 text-[#718096]/50" />
                        <span className="text-[11px] font-semibold text-[#526579]">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Category pill */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#00695C] border border-[#00897B]/30 shadow-xs">
                      {item.category}
                    </span>

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5 shadow-xs">
                      <StatusBadge status={item.status || 'FOUND'} />
                    </div>

                    {/* Multi-image indicator */}
                    {item.images && item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#16324F]/80 text-white font-medium">
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
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1FAF9] text-[#00695C] border border-[#E0F2F1]">
                            {item.brand}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1FAF9] text-[#00695C] border border-[#E0F2F1]">
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
                    <MapPin className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                    <span className="truncate font-medium">Found at: {itemLoc}</span>
                  </div>

                  {item.storageLocation && (
                    <div className="flex items-center gap-1.5 text-[#00695C] font-semibold truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#00897B] shrink-0" />
                      <span className="truncate">Held at: {item.storageLocation}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                    <span className="font-medium">Discovered: {new Date(itemDate).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-2">
                    <Link to={`/item/found/${item._id}`} className="block w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold group-hover:border-[#00695C] group-hover:text-[#00695C]">
                        View Item &amp; Claim
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
          <span className="text-xs text-[#526579] px-3 font-semibold font-mono">
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

export default BrowseFound;
