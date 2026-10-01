import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Compass,
  Layers,
  Flame,
  Search,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import itemService from '../services/itemService.js';
import { INITIAL_LOST_ITEMS, INITIAL_FOUND_ITEMS } from '../services/mockData.js';

// Campus Zones Specification
const CAMPUS_ZONES = [
  {
    id: 'library',
    name: 'Central Library',
    code: 'LIB',
    type: 'Study & Research',
    description: 'Reading halls, digital resource center, and study carrels.',
    x: 48,
    y: 28,
    riskLevel: 'HIGH',
    riskScore: 88,
    color: '#00695C',
    aliases: ['Central Library', 'College Library', 'Library']
  },
  {
    id: 'academic',
    name: 'Main Academic Block (Block A)',
    code: 'ACA',
    type: 'Lecture Halls & Classrooms',
    description: 'Lecture theaters, tutorial rooms, and faculty offices.',
    x: 25,
    y: 42,
    riskLevel: 'HIGH',
    riskScore: 78,
    color: '#D84315',
    aliases: ['Main Academic Block', 'Block A', 'Classroom Block']
  },
  {
    id: 'it_complex',
    name: 'Computer & IT Complex',
    code: 'ITC',
    type: 'Labs & Technical Centers',
    description: 'Computer labs, server rooms, and software development center.',
    x: 72,
    y: 38,
    riskLevel: 'MEDIUM',
    riskScore: 62,
    color: '#1565C0',
    aliases: ['Computer & IT Complex', 'Computer Lab', 'IT Lab']
  },
  {
    id: 'canteen',
    name: 'Campus Food Court & Canteen',
    code: 'FDC',
    type: 'Dining & Recreation',
    description: 'Central cafeteria, outdoor seating, and student refreshment stalls.',
    x: 35,
    y: 68,
    riskLevel: 'CRITICAL',
    riskScore: 94,
    color: '#E65100',
    aliases: ['Campus Food Court & Canteen', 'Canteen', 'Cafeteria']
  },
  {
    id: 'sports',
    name: 'Sports Complex & Gymnasium',
    code: 'SPT',
    type: 'Athletics & Physical Ed',
    description: 'Indoor stadium, fitness center, running tracks, and locker rooms.',
    x: 78,
    y: 72,
    riskLevel: 'MEDIUM',
    riskScore: 55,
    color: '#2E7D32',
    aliases: ['Sports Complex & Gymnasium', 'Sports Complex', 'Gymnasium']
  },
  {
    id: 'hostels',
    name: 'Hostels & Residential Quarters',
    code: 'RES',
    type: 'Student Housing',
    description: 'Student dormitories, mess facilities, and residential common areas.',
    x: 18,
    y: 80,
    riskLevel: 'LOW',
    riskScore: 40,
    color: '#6A1B9A',
    aliases: ['Hostels & Residential Quarters', 'Hostel', 'Dormitory']
  },
  {
    id: 'security_desk',
    name: 'Campus Security & Custody Desk',
    code: 'SEC',
    type: 'Official Custody Point',
    description: 'Central security gate, administrative holding locker, and handover desk.',
    x: 50,
    y: 56,
    riskLevel: 'SAFE_HOLD',
    riskScore: 10,
    color: '#004D40',
    aliases: ['Campus Security', 'Lost & Found Desk', 'Administration & Security Desk']
  }
];

export const CampusMap = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(CAMPUS_ZONES[0]);
  const [viewMode, setViewMode] = useState('pins'); // 'pins' | 'heatmap'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'lost' | 'found'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const res = await itemService.getItems({ limit: 50 });
        const fetched = res?.data?.data || res?.data?.items || res?.data;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setItems(fetched);
        } else {
          setItems([...INITIAL_LOST_ITEMS, ...INITIAL_FOUND_ITEMS]);
        }
      } catch (err) {
        setItems([...INITIAL_LOST_ITEMS, ...INITIAL_FOUND_ITEMS]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // Filter items associated with a zone
  const getZoneItems = (zone) => {
    return items.filter((item) => {
      const loc = (item.location || item.lostLocation || item.foundLocation || item.storageLocation || '').toLowerCase();
      const matchesZone = zone.aliases.some((a) => loc.includes(a.toLowerCase())) || loc.includes(zone.name.toLowerCase());
      if (!matchesZone) return false;

      if (typeFilter !== 'all') {
        const itemType = (item.type || (item.status === 'lost' || item.status === 'LOST' ? 'lost' : 'found')).toLowerCase();
        if (itemType !== typeFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          (item.itemName || item.title || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  };

  const selectedZoneItems = selectedZone ? getZoneItems(selectedZone) : [];

  // Count total stats
  const totalLostOnCampus = items.filter((i) => (i.type === 'lost' || i.status === 'LOST' || i.status === 'lost')).length;
  const totalFoundOnCampus = items.filter((i) => (i.type === 'found' || i.status === 'FOUND' || i.status === 'found')).length;

  return (
    <div className="space-y-8">
      {/* Header Banner (Unified Portal Light Theme) */}
      <div className="bg-white border border-[#D9E2E8] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E0F2F1]/70 via-[#F0F7F6]/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] text-xs font-bold uppercase tracking-wider text-[#00695C] shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#00695C]" />
            <span>Spatial Campus Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#16324F]">
            Interactive Campus Map &amp; Loss Heatmap
          </h1>
          <p className="text-sm sm:text-base text-[#526579] leading-relaxed">
            Visualize where items are frequently misplaced across campus facilities, track real-time holdings at custody desks, and browse incident reports by physical location.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="bg-[#F7FAFC] px-3.5 py-2 rounded-xl border border-[#D9E2E8] flex items-center gap-2 text-[#16324F] font-medium shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] animate-pulse" />
              <span><strong className="text-[#16324F] font-bold">{totalLostOnCampus}</strong> Active Lost Reports</span>
            </div>
            <div className="bg-[#F7FAFC] px-3.5 py-2 rounded-xl border border-[#D9E2E8] flex items-center gap-2 text-[#16324F] font-medium shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
              <span><strong className="text-[#16324F] font-bold">{totalFoundOnCampus}</strong> Securely Held at Desks</span>
            </div>
            <div className="bg-[#F7FAFC] px-3.5 py-2 rounded-xl border border-[#D9E2E8] flex items-center gap-2 text-[#16324F] font-medium shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#00695C]" />
              <span><strong className="text-[#16324F] font-bold">7</strong> Monitored Campus Zones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Toggle, Type Filter, Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#D9E2E8] shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#526579] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-4 h-4 text-[#00695C]" /> Mode:
          </span>
          <button
            onClick={() => setViewMode('pins')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'pins'
                ? 'bg-[#00695C] text-white shadow-xs'
                : 'bg-[#F7FAFC] text-[#526579] hover:bg-[#E0F2F1] hover:text-[#00695C]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Building Pins
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'heatmap'
                ? 'bg-[#D84315] text-white shadow-xs'
                : 'bg-[#F7FAFC] text-[#526579] hover:bg-[#FFE0B2] hover:text-[#D84315]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Loss Risk Heatmap
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F7FAFC] p-1 rounded-xl border border-[#D9E2E8]">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-[#16324F] shadow-2xs' : 'text-[#526579]'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'lost' ? 'bg-[#FFEBEE] text-[#D32F2F] shadow-2xs' : 'text-[#526579]'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'found' ? 'bg-[#E8F5E9] text-[#2E7D32] shadow-2xs' : 'text-[#526579]'
              }`}
            >
              Found Only
            </button>
          </div>

          <div className="relative min-w-[200px] hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              placeholder="Search items in zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] text-xs text-[#16324F] focus:outline-none focus:border-[#00695C] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid: Interactive Visual Map (Left 7 Cols) + Zone Specification Panel (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Map Surface */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#D9E2E8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9E2E8]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00695C]" />
              <h2 className="text-base font-bold text-[#16324F]">Campus Ground Layout</h2>
            </div>
            <span className="text-[11px] text-[#526579] font-medium">Click any building to inspect records</span>
          </div>

          {/* Interactive SVG Campus Layout */}
          <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#E8F1F2] border-2 border-[#D9E2E8] overflow-hidden select-none shadow-inner">
            {/* Background Grid & Walkways */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1E2E4" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Campus Roads & Walkways */}
              <path
                d="M 50 10 L 50 90 M 15 50 L 85 50 M 25 25 L 75 75 M 25 75 L 75 25"
                stroke="#CBD5E1"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 50 10 L 50 90 M 15 50 L 85 50 M 25 25 L 75 75 M 25 75 L 75 25"
                stroke="#FFFFFF"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />

              {/* Greenery Parks */}
              <circle cx="50%" cy="30%" r="35" fill="#C8E6C9" opacity="0.4" />
              <circle cx="35%" cy="65%" r="45" fill="#C8E6C9" opacity="0.3" />
              <circle cx="75%" cy="60%" r="40" fill="#C8E6C9" opacity="0.35" />
            </svg>

            {/* Heatmap Layer (if enabled) */}
            {viewMode === 'heatmap' && (
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-500">
                {CAMPUS_ZONES.map((zone) => {
                  const intensity = zone.riskScore / 100;
                  return (
                    <div
                      key={`heat-${zone.id}`}
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${120 + intensity * 100}px`,
                        height: `${120 + intensity * 100}px`,
                        background: `radial-gradient(circle, rgba(230, 81, 0, ${0.45 * intensity}) 0%, rgba(255, 152, 0, ${0.2 * intensity}) 50%, transparent 70%)`
                      }}
                      className="absolute rounded-full pointer-events-none animate-pulse"
                    />
                  );
                })}
              </div>
            )}

            {/* Campus Zone Pins & Interactive Cards */}
            {CAMPUS_ZONES.map((zone) => {
              const zoneItems = getZoneItems(zone);
              const isSelected = selectedZone?.id === zone.id;
              const hasItems = zoneItems.length > 0;

              return (
                <div
                  key={zone.id}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedZone(zone)}
                  className={`absolute cursor-pointer transition-all duration-300 z-20 group ${
                    isSelected ? 'scale-115 z-30' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-md border-2 transition-all ${
                      isSelected
                        ? 'bg-[#16324F] text-white border-[#00695C] ring-4 ring-[#00695C]/30'
                        : 'bg-white text-[#16324F] border-[#D9E2E8] hover:border-[#00897B]'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: isSelected ? '#80CBC4' : zone.color }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <span className="text-xs font-bold whitespace-nowrap">{zone.code}</span>

                    {/* Count Pill */}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white text-[#16324F]'
                          : hasItems
                          ? 'bg-[#E0F2F1] text-[#00695C]'
                          : 'bg-[#ECEFF1] text-[#718096]'
                      }`}
                    >
                      {zoneItems.length}
                    </span>
                  </div>

                  {/* Pulsing beacon for high risk */}
                  {zone.riskLevel === 'CRITICAL' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E65100] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D84315]" />
                    </span>
                  )}
                </div>
              );
            })}

            {/* Compass Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-[#D9E2E8] shadow-xs text-[10px] font-bold text-[#526579] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#00695C]" />
              <span>North-Oriented Campus Grid</span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#526579]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00695C]" /> Academic / Research
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" /> High Incident / Dining
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" /> Athletics / Field
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004D40]" /> Security Custody Desk
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Zone Details & Live Item Inventory */}
        <div className="lg:col-span-5 space-y-6">
          {selectedZone ? (
            <Card className="p-6 space-y-6 bg-white border-[#D9E2E8] shadow-xs">
              {/* Zone Header */}
              <div className="space-y-2 border-b border-[#D9E2E8] pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E0F2F1] text-[#00695C] px-2.5 py-1 rounded-md border border-[#B2DFDB]">
                    ZONE CODE: {selectedZone.code}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${
                      selectedZone.riskLevel === 'CRITICAL'
                        ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#FFCDD2]'
                        : selectedZone.riskLevel === 'HIGH'
                        ? 'bg-[#FFF3E0] text-[#D84315] border-[#FFE0B2]'
                        : selectedZone.riskLevel === 'SAFE_HOLD'
                        ? 'bg-[#E0F2F1] text-[#00695C] border-[#B2DFDB]'
                        : 'bg-[#F0F7F6] text-[#526579] border-[#D9E2E8]'
                    }`}
                  >
                    Risk: {selectedZone.riskLevel} ({selectedZone.riskScore}%)
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-[#16324F]">{selectedZone.name}</h3>
                <p className="text-xs text-[#526579] leading-relaxed">{selectedZone.description}</p>
              </div>

              {/* Items Inventory at this building */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#16324F] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#00695C]" />
                    Belongings at this Location ({selectedZoneItems.length})
                  </h4>

                  <Link
                    to="/report-lost"
                    className="text-xs font-bold text-[#00695C] hover:text-[#004D40] hover:underline"
                  >
                    + Report Incident
                  </Link>
                </div>

                {selectedZoneItems.length === 0 ? (
                  <div className="bg-[#F7FAFC] border border-dashed border-[#D9E2E8] rounded-2xl p-8 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#00695C] mx-auto opacity-60" />
                    <p className="text-xs font-bold text-[#16324F]">No active incident reports in this zone</p>
                    <p className="text-[11px] text-[#526579]">
                      Items turned in or reported missing in {selectedZone.name} will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {selectedZoneItems.map((item) => {
                      const itemImg = item.primaryImage || item.images?.[0] || item.image;
                      const itemType = (item.type || (item.status === 'lost' || item.status === 'LOST' ? 'lost' : 'found')).toLowerCase();
                      const itemLink = `/item/${itemType}/${item._id}`;
                      const formattedDate = item.date || (item.dateLost || item.dateFound ? new Date(item.dateLost || item.dateFound).toLocaleDateString() : 'Recent');

                      return (
                        <div
                          key={item._id}
                          className="p-3.5 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] hover:border-[#00897B] transition-all flex items-center gap-3.5 group"
                        >
                          <Link
                            to={itemLink}
                            className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#D9E2E8] shrink-0 flex items-center justify-center group-hover:border-[#00695C]"
                          >
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={item.itemName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-[#718096]" />
                            )}
                          </Link>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <Link
                                to={itemLink}
                                className="text-xs font-bold text-[#16324F] hover:text-[#00695C] truncate block"
                              >
                                {item.itemName || item.title}
                              </Link>
                              <StatusBadge status={item.status} />
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-[#526579]">
                              <span className="font-bold text-[#00695C] uppercase">{item.category}</span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formattedDate}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#526579] line-clamp-1">{item.description}</p>
                          </div>

                          <Link to={itemLink} className="shrink-0">
                            <Button variant="outline" size="xs" className="text-[11px] font-bold">
                              Inspect
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-4 border-t border-[#D9E2E8] flex items-center justify-between gap-3 text-xs">
                <Link to="/browse-lost" className="text-[#00695C] font-bold hover:underline">
                  Browse All Lost &rarr;
                </Link>
                <Link to="/browse-found" className="text-[#00695C] font-bold hover:underline">
                  Browse All Found &rarr;
                </Link>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
