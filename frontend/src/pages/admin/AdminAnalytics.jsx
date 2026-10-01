import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookmarkCheck,
  Package,
  PackageCheck,
  ShieldCheck,
  Layers,
  MapPin,
  Building,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';

export const AdminAnalytics = () => {
  // Query parameters state
  const [rangePreset, setRangePreset] = useState('last30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [trendInterval, setTrendInterval] = useState('daily');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Analytics data stores
  const [overview, setOverview] = useState(null);
  const [itemsData, setItemsData] = useState(null);
  const [claimsData, setClaimsData] = useState(null);
  const [matchesData, setMatchesData] = useState(null);
  const [returnsData, setReturnsData] = useState(null);
  const [resolutionTimes, setResolutionTimes] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [locationsData, setLocationsData] = useState(null);
  const [departmentsData, setDepartmentsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);

  // Fetch all analytics datasets
  const fetchAllAnalytics = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = {
        range: rangePreset,
        ...(rangePreset === 'custom' && customStart && { startDate: customStart }),
        ...(rangePreset === 'custom' && customEnd && { endDate: customEnd }),
        interval: trendInterval
      };

      const [
        resOverview,
        resItems,
        resClaims,
        resMatches,
        resReturns,
        resResTimes,
        resCategories,
        resLocations,
        resDepartments,
        resTrends
      ] = await Promise.all([
        adminService.getAnalyticsOverview(params),
        adminService.getAnalyticsItems(params),
        adminService.getAnalyticsClaims(params),
        adminService.getAnalyticsMatches(params),
        adminService.getAnalyticsReturns(params),
        adminService.getAnalyticsResolutionTimes(params),
        adminService.getAnalyticsCategories(params),
        adminService.getAnalyticsLocations(params),
        adminService.getAnalyticsDepartments(params),
        adminService.getAnalyticsTrends(params)
      ]);

      setOverview(resOverview.data?.data || null);
      setItemsData(resItems.data?.data || null);
      setClaimsData(resClaims.data?.data || null);
      setMatchesData(resMatches.data?.data || null);
      setReturnsData(resReturns.data?.data || null);
      setResolutionTimes(resResTimes.data?.data || null);
      setCategoriesData(resCategories.data?.data || null);
      setLocationsData(resLocations.data?.data || null);
      setDepartmentsData(resDepartments.data?.data || null);
      setTrendsData(resTrends.data?.data || null);
    } catch (err) {
      console.error('Failed to load administrative analytics:', err);
      setError(err.response?.data?.message || err.message || 'Unable to retrieve campus analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (rangePreset !== 'custom' || (customStart && customEnd)) {
      fetchAllAnalytics();
    }
  }, [rangePreset, trendInterval]);

  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    fetchAllAnalytics(true);
  };

  const handleDownloadCsv = (dataset) => {
    const params = {
      range: rangePreset,
      ...(rangePreset === 'custom' && customStart && { startDate: customStart }),
      ...(rangePreset === 'custom' && customEnd && { endDate: customEnd })
    };
    const url = adminService.getAnalyticsExportUrl(dataset, params);
    window.open(url, '_blank');
  };

  const metrics = overview?.metrics || {};

  // Render trend badge
  const renderTrendBadge = (trendObj) => {
    if (!trendObj) return null;
    const { changePercent, trend } = trendObj;

    if (changePercent === 'N/A' || changePercent === undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#526579] bg-slate-100 px-2 py-0.5 rounded border border-[#D9E2E8]">
          <Minus className="w-3 h-3 text-[#526579]" />
          <span>Prior: {trendObj.previous ?? '0'} (N/A)</span>
        </span>
      );
    }

    const isPositive = Number(changePercent) > 0;
    const isNeutral = Number(changePercent) === 0;

    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
          isNeutral
            ? 'text-[#526579] bg-slate-100 border-[#D9E2E8]'
            : isPositive
            ? 'text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/30'
            : 'text-[#D32F2F] bg-[#FFEBEE] border-[#D32F2F]/30'
        }`}
      >
        {isNeutral ? (
          <Minus className="w-3 h-3" />
        ) : isPositive ? (
          <ArrowUpRight className="w-3 h-3" />
        ) : (
          <ArrowDownRight className="w-3 h-3" />
        )}
        <span>{isPositive ? `+${changePercent}%` : `${changePercent}%`}</span>
        <span className="text-[10px] opacity-80 font-normal ml-0.5">(vs prev: {trendObj.previous})</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-[#D9E2E8] pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00695C] mb-1">
              <TrendingUp className="w-4 h-4 text-[#FF9800]" /> Campus Intelligence & Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
              Institutional Reporting & Analytics Suite
            </h1>
            <p className="text-sm text-[#526579] mt-1 max-w-2xl">
              Real-time recovery rates, matching efficacy, claim cycle durations, and operational trends computed from university records.
            </p>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchAllAnalytics(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-[#16324F] hover:bg-[#F0F7F6] hover:text-[#00695C] rounded-lg border border-[#D9E2E8] shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00695C] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/analytics/report"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#E0F2F1] text-[#00695C] hover:bg-[#b2dfdb] rounded-lg border border-[#00695C]/30 shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Printable Report</span>
            </Link>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#FF9800] text-white hover:bg-[#F57C00] rounded-lg shadow-xs transition-all cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#D9E2E8] rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                <button
                  onClick={() => handleDownloadCsv('summary')}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#16324F] hover:bg-[#F0F7F6] hover:text-[#00695C] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF9800]" /> Executive Summary
                </button>
                <button
                  onClick={() => handleDownloadCsv('categories')}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#16324F] hover:bg-[#F0F7F6] hover:text-[#00695C] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#2E7D32]" /> Categories Data
                </button>
                <button
                  onClick={() => handleDownloadCsv('locations')}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#16324F] hover:bg-[#F0F7F6] hover:text-[#00695C] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#1976D2]" /> Campus Locations
                </button>
                <button
                  onClick={() => handleDownloadCsv('trends')}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#16324F] hover:bg-[#F0F7F6] hover:text-[#00695C] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Daily Trends
                </button>
                <button
                  onClick={() => handleDownloadCsv('departments')}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#16324F] hover:bg-[#F0F7F6] hover:text-[#00695C] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Building className="w-3.5 h-3.5 text-[#D32F2F]" /> Departments
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Date Filter Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white border border-[#D9E2E8] rounded-xl p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#16324F] flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#00695C]" /> Period:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7days', label: 'Last 7 Days' },
              { id: 'last30days', label: 'Last 30 Days' },
              { id: 'last90days', label: 'Last 90 Days' },
              { id: 'thismonth', label: 'This Month' },
              { id: 'previousmonth', label: 'Previous Month' },
              { id: 'thisyear', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setRangePreset(p.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  rangePreset === p.id
                    ? 'bg-[#00695C] text-white shadow-xs'
                    : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6] border border-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Form (Shown when custom is selected) */}
          {rangePreset === 'custom' && (
            <form onSubmit={handleApplyCustomRange} className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white border border-[#D9E2E8] rounded px-2.5 py-1 text-xs text-[#16324F] focus:outline-none focus:border-[#00695C]"
                required
              />
              <span className="text-xs text-[#526579]">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white border border-[#D9E2E8] rounded px-2.5 py-1 text-xs text-[#16324F] focus:outline-none focus:border-[#00695C]"
                required
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#00695C] text-white hover:bg-[#00897B] rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}

          {/* Active Period Display */}
          <div className="text-[11px] font-medium text-[#526579] ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            <span>Current: {overview?.timeRange ? `${new Date(overview.timeRange.startDate).toLocaleDateString()} – ${new Date(overview.timeRange.endDate).toLocaleDateString()}` : 'Loading window...'}</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#FFEBEE] border border-[#D32F2F]/30 text-[#D32F2F] rounded-xl p-4 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D32F2F] shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchAllAnalytics(true)}
            className="px-3 py-1 bg-[#D32F2F] text-white rounded text-xs font-semibold hover:bg-red-700 cursor-pointer shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics Sub-Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#D9E2E8] pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Layers },
          { id: 'items', label: 'Lost vs Found', icon: Package },
          { id: 'claims', label: 'Claims & Review', icon: BookmarkCheck },
          { id: 'matching', label: 'Smart Matching', icon: Sparkles },
          { id: 'returns', label: 'Returns & Recovery', icon: RotateCcw },
          { id: 'categories', label: 'Categories', icon: BarChart3 },
          { id: 'locations', label: 'Campus Locations', icon: MapPin },
          { id: 'departments', label: 'Departments & Years', icon: Building },
          { id: 'trends', label: 'Historical Trends', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/30 shadow-xs'
                  : 'text-[#526579] hover:text-[#16324F] hover:bg-[#F0F7F6]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00695C]' : 'text-[#718096]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Reports */}
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs hover:border-[#00695C] transition-all">
              <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
                <span className="font-bold uppercase tracking-wider text-[#16324F]">Total Reports</span>
                <div className="w-8 h-8 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#00695C]" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#16324F]">
                {loading ? '...' : metrics.totalReports?.current ?? 0}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                {renderTrendBadge(metrics.totalReports)}
                <span className="text-[11px] font-medium text-[#526579]">
                  Lost: {metrics.totalLost?.current ?? 0} | Found: {metrics.totalFound?.current ?? 0}
                </span>
              </div>
            </div>

            {/* Card 2: Recovery Rate */}
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs hover:border-[#2E7D32] transition-all">
              <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
                <span className="font-bold uppercase tracking-wider text-[#16324F]">Campus Recovery Rate</span>
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#2E7D32]">
                {loading ? '...' : metrics.recoveryRate?.current ?? '0%'}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                {renderTrendBadge(metrics.recoveryRate)}
                <span className="text-[11px] font-medium text-[#526579]">
                  Returned: {metrics.returnedCount?.current ?? 0} items
                </span>
              </div>
            </div>

            {/* Card 3: Active Cases */}
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs hover:border-[#FF9800] transition-all">
              <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
                <span className="font-bold uppercase tracking-wider text-[#16324F]">Active Search Cases</span>
                <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#F57C00]" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#F57C00]">
                {loading ? '...' : metrics.activeCases?.current ?? 0}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                {renderTrendBadge(metrics.activeCases)}
                <span className="text-[11px] font-medium text-[#526579]">In active circulation</span>
              </div>
            </div>

            {/* Card 4: Resolved Cases */}
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs hover:border-[#00695C] transition-all">
              <div className="flex items-center justify-between text-xs text-[#526579] mb-2">
                <span className="font-bold uppercase tracking-wider text-[#16324F]">Resolved / Restored</span>
                <div className="w-8 h-8 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#00695C]" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#00695C]">
                {loading ? '...' : metrics.resolvedCases?.current ?? 0}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                {renderTrendBadge(metrics.resolvedCases)}
                <span className="text-[11px] font-medium text-[#526579]">Cases closed</span>
              </div>
            </div>
          </div>

          {/* Secondary Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-[#526579] mb-1">Total Ownership Claims</div>
              <div className="text-xl font-extrabold text-[#16324F] flex items-center justify-between">
                <span>{loading ? '...' : metrics.totalClaims?.current ?? 0}</span>
                <BookmarkCheck className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <div className="mt-2">{renderTrendBadge(metrics.totalClaims)}</div>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-[#526579] mb-1">Smart Engine Matches</div>
              <div className="text-xl font-extrabold text-[#16324F] flex items-center justify-between">
                <span>{loading ? '...' : metrics.totalMatches?.current ?? 0}</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2">{renderTrendBadge(metrics.totalMatches)}</div>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-[#526579] mb-1">Handover Workflows</div>
              <div className="text-xl font-extrabold text-[#16324F] flex items-center justify-between">
                <span>{loading ? '...' : metrics.totalReturns?.current ?? 0}</span>
                <RotateCcw className="w-4 h-4 text-[#00695C]" />
              </div>
              <div className="mt-2">{renderTrendBadge(metrics.totalReturns)}</div>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-[#526579] mb-1">Disputed Cases</div>
              <div className="text-xl font-extrabold text-[#D32F2F] flex items-center justify-between">
                <span>{loading ? '...' : metrics.disputedCases?.current ?? 0}</span>
                <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
              </div>
              <div className="mt-2">{renderTrendBadge(metrics.disputedCases)}</div>
            </div>
          </div>

          {/* Operational Resolution Times Card */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#16324F] flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#00695C]" />
              Operational Turnaround Durations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl">
                <div className="text-xs font-semibold text-[#526579]">Lost Report to Resolution</div>
                <div className="text-2xl font-extrabold text-[#F57C00] mt-1">
                  {resolutionTimes?.resolutionMetrics?.lostReportToResolutionHours ?? 0} hrs
                </div>
                <div className="text-[11px] text-[#718096] mt-1">
                  Based on {resolutionTimes?.resolutionMetrics?.lostRecordsAnalyzed ?? 0} cases
                </div>
              </div>

              <div className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl">
                <div className="text-xs font-semibold text-[#526579]">Found Report to Return</div>
                <div className="text-2xl font-extrabold text-[#00695C] mt-1">
                  {resolutionTimes?.resolutionMetrics?.foundReportToReturnHours ?? 0} hrs
                </div>
                <div className="text-[11px] text-[#718096] mt-1">
                  Based on {resolutionTimes?.resolutionMetrics?.foundRecordsAnalyzed ?? 0} cases
                </div>
              </div>

              <div className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl">
                <div className="text-xs font-semibold text-[#526579]">Average Claim Review Time</div>
                <div className="text-2xl font-extrabold text-[#1976D2] mt-1">
                  {resolutionTimes?.resolutionMetrics?.claimReviewHours ?? 0} hrs
                </div>
                <div className="text-[11px] text-[#718096] mt-1">
                  Based on {resolutionTimes?.resolutionMetrics?.claimRecordsAnalyzed ?? 0} claims
                </div>
              </div>

              <div className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl">
                <div className="text-xs font-semibold text-[#526579]">Return Workflow Handover Time</div>
                <div className="text-2xl font-extrabold text-[#2E7D32] mt-1">
                  {resolutionTimes?.resolutionMetrics?.returnCompletionHours ?? 0} hrs
                </div>
                <div className="text-[11px] text-[#718096] mt-1">
                  Based on {resolutionTimes?.resolutionMetrics?.returnRecordsAnalyzed ?? 0} returns
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lost vs Found Comparison */}
      {activeTab === 'items' && itemsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#D32F2F] font-bold mb-2 uppercase">
                <span>Lost Item Reports</span>
                <Package className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-[#16324F]">
                {itemsData.comparison?.totalLost}
              </div>
              <p className="text-xs text-[#526579] mt-2">
                Share: <strong className="text-[#D32F2F]">{itemsData.comparison?.lostPercentage}%</strong> of all reports
              </p>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#2E7D32] font-bold mb-2 uppercase">
                <span>Found Item Custody</span>
                <PackageCheck className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-[#16324F]">
                {itemsData.comparison?.totalFound}
              </div>
              <p className="text-xs text-[#526579] mt-2">
                Share: <strong className="text-[#2E7D32]">{itemsData.comparison?.foundPercentage}%</strong> of all reports
              </p>
            </div>

            <div className="bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#F57C00] font-bold mb-2 uppercase">
                <span>Net Lost-to-Found Ratio</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold text-[#16324F]">
                {itemsData.comparison?.ratio} : 1
              </div>
              <p className="text-xs text-[#526579] mt-2">
                Difference: <strong className="text-[#16324F]">{itemsData.comparison?.difference} items</strong>
              </p>
            </div>
          </div>

          {/* Visual Bar Comparison */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#16324F] mb-4">Volume Comparison & Photographic Verification</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#16324F] mb-1.5">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#D32F2F]"></span> Lost Property ({itemsData.comparison?.totalLost})</span>
                  <span>{itemsData.comparison?.lostPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D32F2F] transition-all duration-500" style={{ width: `${itemsData.comparison?.lostPercentage}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#16324F] mb-1.5">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#2E7D32]"></span> Found Custody ({itemsData.comparison?.totalFound})</span>
                  <span>{itemsData.comparison?.foundPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2E7D32] transition-all duration-500" style={{ width: `${itemsData.comparison?.foundPercentage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#D9E2E8] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                <div className="text-xs font-semibold text-[#526579]">Overall Photo Attachment Rate</div>
                <div className="text-xl font-extrabold text-[#00695C] mt-1">{itemsData.comparison?.imageAttachmentRate?.overall}%</div>
              </div>
              <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                <div className="text-xs font-semibold text-[#526579]">Lost Reports with Images</div>
                <div className="text-xl font-extrabold text-[#D32F2F] mt-1">{itemsData.comparison?.imageAttachmentRate?.lost}%</div>
              </div>
              <div className="bg-[#F7FAFC] p-3 rounded-lg border border-[#D9E2E8]">
                <div className="text-xs font-semibold text-[#526579]">Found Reports with Images</div>
                <div className="text-xl font-extrabold text-[#2E7D32] mt-1">{itemsData.comparison?.imageAttachmentRate?.found}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Claims Analytics */}
      {activeTab === 'claims' && claimsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#526579] uppercase font-bold">Total Claims</div>
              <div className="text-3xl font-extrabold text-[#16324F] mt-1">{claimsData.totalClaims}</div>
              <div className="text-xs text-[#718096] mt-2">All filed claims</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#2E7D32] uppercase font-bold">Approval Rate</div>
              <div className="text-3xl font-extrabold text-[#2E7D32] mt-1">{claimsData.rates?.approvalRate}</div>
              <div className="text-xs text-[#718096] mt-2">Of resolved claims</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#D32F2F] uppercase font-bold">Rejection Rate</div>
              <div className="text-3xl font-extrabold text-[#D32F2F] mt-1">{claimsData.rates?.rejectionRate}</div>
              <div className="text-xs text-[#718096] mt-2">Insufficient proof</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#F57C00] uppercase font-bold">Average Processing</div>
              <div className="text-3xl font-extrabold text-[#F57C00] mt-1">{claimsData.performance?.averageProcessingHours} hrs</div>
              <div className="text-xs text-[#718096] mt-2">Submission to review</div>
            </div>
          </div>

          {/* Status Breakdown Table */}
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#16324F] mb-4">Claim Verification Status Funnel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(claimsData.statusBreakdown || {}).map(([key, val]) => (
                <div key={key} className="bg-[#F7FAFC] border border-[#D9E2E8] p-3 rounded-lg text-center">
                  <div className="text-[11px] text-[#526579] capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-xl font-extrabold text-[#00695C] mt-1">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Smart Matching Analytics */}
      {activeTab === 'matching' && matchesData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-purple-700 font-bold uppercase">Total Generated Matches</div>
              <div className="text-3xl font-extrabold text-[#16324F] mt-1">{matchesData.totalMatches}</div>
              <div className="text-xs text-[#718096] mt-2">Correlation engine pairs</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#2E7D32] font-bold uppercase">Verification Rate</div>
              <div className="text-3xl font-extrabold text-[#2E7D32] mt-1">{matchesData.verificationRate}</div>
              <div className="text-xs text-[#718096] mt-2">Confirmed by counterparty</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#00695C] font-bold uppercase">Average Confidence Score</div>
              <div className="text-3xl font-extrabold text-[#00695C] mt-1">{matchesData.averageScore} / 100</div>
              <div className="text-xs text-[#718096] mt-2">Multi-attribute algorithm</div>
            </div>
          </div>

          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#16324F] mb-4">Correlation Confidence Tiers</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#16324F] mb-1">
                  <span>High Possibility (Score &ge; 80%)</span>
                  <span className="font-bold text-[#2E7D32]">{matchesData.confidenceBreakdown?.highConfidence} ({matchesData.confidenceBreakdown?.highConfidencePercentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2E7D32]" style={{ width: `${matchesData.confidenceBreakdown?.highConfidencePercentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#16324F] mb-1">
                  <span>Possible Match (50% &le; Score &lt; 80%)</span>
                  <span className="font-bold text-[#F57C00]">{matchesData.confidenceBreakdown?.possible} ({matchesData.confidenceBreakdown?.possiblePercentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F57C00]" style={{ width: `${matchesData.confidenceBreakdown?.possiblePercentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#16324F] mb-1">
                  <span>Low Possibility (Score &lt; 50%)</span>
                  <span className="font-bold text-[#526579]">{matchesData.confidenceBreakdown?.lowConfidence} ({matchesData.confidenceBreakdown?.lowConfidencePercentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400" style={{ width: `${matchesData.confidenceBreakdown?.lowConfidencePercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Returns & Recovery */}
      {activeTab === 'returns' && returnsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#00695C] font-bold uppercase">Total Return Cases</div>
              <div className="text-3xl font-extrabold text-[#16324F] mt-1">{returnsData.totalReturns}</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#2E7D32] font-bold uppercase">Completion Rate</div>
              <div className="text-3xl font-extrabold text-[#2E7D32] mt-1">{returnsData.completionRate}</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#D32F2F] font-bold uppercase">Dispute Rate</div>
              <div className="text-3xl font-extrabold text-[#D32F2F] mt-1">{returnsData.disputeRate}</div>
            </div>
            <div className="bg-white border border-[#D9E2E8] p-5 rounded-xl shadow-xs">
              <div className="text-xs text-[#F57C00] font-bold uppercase">Avg Return Completion</div>
              <div className="text-3xl font-extrabold text-[#F57C00] mt-1">{returnsData.averageCompletionHours} hrs</div>
            </div>
          </div>

          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#16324F] mb-4">Handover Lifecycle Pipeline</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {Object.entries(returnsData.statusBreakdown || {}).map(([key, count]) => (
                <div key={key} className="bg-[#F7FAFC] border border-[#D9E2E8] p-3 rounded-lg text-center">
                  <div className="text-[11px] text-[#526579] capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-xl font-extrabold text-[#00695C] mt-1">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Category Analytics */}
      {activeTab === 'categories' && categoriesData && (
        <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#16324F] mb-4 flex items-center justify-between">
            <span>Property Distribution by Category</span>
            <span className="text-xs font-semibold text-[#526579]">{categoriesData.totalItems} items recorded</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F7F6] border-b border-[#D9E2E8] text-[#16324F] uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Lost</th>
                  <th className="py-3 px-3 text-center">Found</th>
                  <th className="py-3 px-3 text-center">Returned</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Share</th>
                  <th className="py-3 px-3 text-center">Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E2E8]">
                {categoriesData.categories?.map((c) => (
                  <tr key={c.category} className="hover:bg-[#F0F7F6] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#16324F] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00695C]"></span>
                      <span>{c.category}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-[#D32F2F] font-bold">{c.lost}</td>
                    <td className="py-3 px-3 text-center text-[#2E7D32] font-bold">{c.found}</td>
                    <td className="py-3 px-3 text-center text-[#00695C] font-bold">{c.returned}</td>
                    <td className="py-3 px-3 text-center text-[#16324F] font-extrabold">{c.total}</td>
                    <td className="py-3 px-3 text-center text-[#526579] font-medium">{c.percentage}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        c.recoveryRate >= 50
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : c.recoveryRate > 0
                          ? 'bg-[#FFF3E0] text-[#F57C00]'
                          : 'bg-slate-100 text-[#526579]'
                      }`}>
                        {c.recoveryRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Location Analytics */}
      {activeTab === 'locations' && locationsData && (
        <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#16324F] mb-4 flex items-center justify-between">
            <span>Campus Location Frequency & Recovery</span>
            <span className="text-xs font-semibold text-[#526579]">Normalized zones</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locationsData.locations?.map((loc) => (
              <div key={loc.location} className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[#16324F] text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#00695C]" />
                    <span>{loc.location}</span>
                  </h4>
                  <span className="text-xs font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded">
                    {loc.total} reports
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-[#D9E2E8]">
                  <div>
                    <span className="text-[10px] text-[#526579] font-semibold uppercase">Lost</span>
                    <p className="font-extrabold text-[#D32F2F] text-sm">{loc.lost}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#526579] font-semibold uppercase">Found</span>
                    <p className="font-extrabold text-[#2E7D32] text-sm">{loc.found}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#526579] font-semibold uppercase">Returned</span>
                    <p className="font-extrabold text-[#00695C] text-sm">{loc.returned}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Department Analytics (Privacy-Safe) */}
      {activeTab === 'departments' && departmentsData && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#16324F] mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#00695C]" />
              Academic Department Distributions (Aggregated)
            </h3>
            <p className="text-xs text-[#526579] mb-4">
              Individual student credentials, names, and register numbers are strictly suppressed to guarantee student privacy.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0F7F6] border-b border-[#D9E2E8] text-[#16324F] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 text-center">Lost Property</th>
                    <th className="py-3 px-3 text-center">Found Reports</th>
                    <th className="py-3 px-3 text-center">Total Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2E8]">
                  {departmentsData.departments?.map((d) => (
                    <tr key={d.department} className="hover:bg-[#F0F7F6]">
                      <td className="py-3 px-3 font-semibold text-[#16324F]">{d.department}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#D32F2F]">{d.lost}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#2E7D32]">{d.found}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-[#00695C]">{d.reports}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#16324F] mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#00695C]" />
              Distribution by Academic Year
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {departmentsData.academicYears?.map((yr) => (
                <div key={yr.year} className="bg-[#F7FAFC] border border-[#D9E2E8] p-3 rounded-lg text-center">
                  <div className="text-xs text-[#526579] font-bold">{yr.year}</div>
                  <div className="text-xl font-extrabold text-[#16324F] mt-1">{yr.count}</div>
                  <div className="text-[10px] font-semibold text-[#00695C] mt-1">{yr.percentage}% share</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Historical Trends */}
      {activeTab === 'trends' && trendsData && (
        <div className="bg-white border border-[#D9E2E8] rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#16324F] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00695C]" />
                Historical Activity Timelines
              </h3>
              <p className="text-xs text-[#526579] mt-0.5">Chronological incident generation across campus</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F7FAFC] p-1 rounded-lg border border-[#D9E2E8]">
              {['daily', 'weekly', 'monthly'].map((int) => (
                <button
                  key={int}
                  onClick={() => setTrendInterval(int)}
                  className={`px-3 py-1 rounded text-xs font-bold capitalize cursor-pointer transition-all ${
                    trendInterval === int
                      ? 'bg-[#00695C] text-white shadow-xs'
                      : 'text-[#526579] hover:text-[#16324F]'
                  }`}
                >
                  {int}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Trend Visualization */}
          {trendsData.timeline?.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[600px] h-64 relative flex items-end gap-2 pt-8 px-4 border-b border-l border-[#D9E2E8] bg-[#F7FAFC] rounded-bl-lg">
                {trendsData.timeline.map((point) => {
                  const maxVal = Math.max(
                    ...trendsData.timeline.map((p) => Math.max(p.lost, p.found, p.claims, p.returns, 1))
                  );
                  const lostHeight = (point.lost / maxVal) * 100;
                  const foundHeight = (point.found / maxVal) * 100;
                  const claimHeight = (point.claims / maxVal) * 100;
                  const returnHeight = (point.returns / maxVal) * 100;

                  return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-24 hidden group-hover:block bg-[#16324F] text-white text-[10px] p-2.5 rounded-lg shadow-xl z-50 whitespace-nowrap">
                        <p className="font-bold text-[#FF9800]">{point.date}</p>
                        <p className="text-rose-300">Lost: {point.lost}</p>
                        <p className="text-emerald-300">Found: {point.found}</p>
                        <p className="text-purple-300">Claims: {point.claims}</p>
                        <p className="text-teal-300">Returns: {point.returns}</p>
                      </div>

                      {/* Bar Group */}
                      <div className="w-full flex items-end justify-center gap-1 h-48">
                        <div
                          className="w-1.5 bg-[#D32F2F] rounded-t transition-all hover:w-2"
                          style={{ height: `${Math.max(lostHeight, 4)}%` }}
                          title={`Lost: ${point.lost}`}
                        ></div>
                        <div
                          className="w-1.5 bg-[#2E7D32] rounded-t transition-all hover:w-2"
                          style={{ height: `${Math.max(foundHeight, 4)}%` }}
                          title={`Found: ${point.found}`}
                        ></div>
                        <div
                          className="w-1.5 bg-purple-600 rounded-t transition-all hover:w-2"
                          style={{ height: `${Math.max(claimHeight, 4)}%` }}
                          title={`Claims: ${point.claims}`}
                        ></div>
                        <div
                          className="w-1.5 bg-[#00695C] rounded-t transition-all hover:w-2"
                          style={{ height: `${Math.max(returnHeight, 4)}%` }}
                          title={`Returns: ${point.returns}`}
                        ></div>
                      </div>

                      <span className="text-[9px] text-[#526579] font-medium truncate max-w-[45px] rotate-45 origin-left mt-2">
                        {point.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-xs font-semibold text-[#16324F]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#D32F2F] rounded"></span> Lost Property</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#2E7D32] rounded"></span> Found Property</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-600 rounded"></span> Claims Filed</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#00695C] rounded"></span> Handover Returns</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#526579] text-sm font-medium">
              No chronological incidents recorded for the selected window.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
