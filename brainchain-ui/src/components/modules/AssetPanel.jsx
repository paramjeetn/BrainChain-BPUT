import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Cpu,
  Wrench,
  Activity,
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Zap,
  Clock,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import assetsData from '../../demo-data/assets.json';
import { useFacilityStore } from '../../store/useFacilityStore';
import { StatCard, AlertBadge } from '../common';

export const AssetPanel = () => {
  const { activeFacility } = useFacilityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('utilization'); // 'utilization' | 'name' | 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' | 'asc'
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Filter by facility_id === activeFacility.id with fallback
  const facilityAssets = useMemo(() => {
    if (!assetsData) return [];
    const list = Array.isArray(assetsData) ? assetsData : Object.values(assetsData);
    const filtered = list.filter((item) => item.facility_id === activeFacility?.id);
    return filtered.length > 0 ? filtered : list.filter((item) => item.facility_id === 'bput-campus');
  }, [activeFacility?.id]);

  // Summary statistics calculation
  const stats = useMemo(() => {
    const total = facilityAssets.length;
    if (total === 0) return { total: 0, operationalCount: 0, operationalPct: 0, avgUtil: 0, highLoadCount: 0 };

    const operationalCount = facilityAssets.filter(
      (a) => a.status?.toLowerCase() === 'operational'
    ).length;
    const operationalPct = Math.round((operationalCount / total) * 100);
    const totalUtil = facilityAssets.reduce((sum, a) => sum + (a.utilization_pct || 0), 0);
    const avgUtil = Math.round(totalUtil / total);
    const highLoadCount = facilityAssets.filter((a) => (a.utilization_pct || 0) > 85).length;

    return { total, operationalCount, operationalPct, avgUtil, highLoadCount };
  }, [facilityAssets]);

  // Processed, filtered and sorted assets
  const processedAssets = useMemo(() => {
    let result = [...facilityAssets];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.type?.toLowerCase().includes(q) ||
          a.zone?.toLowerCase().includes(q) ||
          a.id?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status?.toLowerCase() === statusFilter);
    }

    // Sort by utilization desc by default
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'utilization') {
        comparison = (a.utilization_pct || 0) - (b.utilization_pct || 0);
      } else if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [facilityAssets, searchQuery, statusFilter, sortField, sortDirection]);

  // Helper for progress bar color
  const getUtilColor = (pct) => {
    if (pct > 85) return 'bg-orange-500';
    if (pct > 70) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  // Status badge renderer
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'operational') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Operational
        </span>
      );
    }
    if (s === 'maintenance') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Maintenance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        Offline
      </span>
    );
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-700 border border-orange-200">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Asset Utilization & Health Telemetry
              </h2>
              <p className="text-xs text-gray-500">
                Continuous operational tracking, equipment load profiling & maintenance cycles
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600">
            <Layers className="h-3.5 w-3.5 text-orange-700" />
            Facility: {activeFacility?.name || 'Selected Campus'}
          </span>
          <AlertBadge
            severity={stats.highLoadCount > 0 ? 'warning' : 'success'}
            text={`${stats.highLoadCount} High-Load Assets`}
          />
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Monitored Assets"
          value={stats.total}
          unit="units"
          icon={Boxes}
          color="orange"
          subtitle={`${stats.operationalCount} active online`}
          status="Catalog Active"
        />

        <StatCard
          title="Operational Availability"
          value={`${stats.operationalPct}%`}
          change="+1.5% uptime"
          changeType="positive"
          icon={Activity}
          color="orange"
          subtitle="99.2% MTBF benchmark"
        />

        <StatCard
          title="Average Utilization"
          value={`${stats.avgUtil}%`}
          change={stats.avgUtil > 80 ? '+6.2% heavy load' : '+1.8%'}
          changeType={stats.avgUtil > 80 ? 'neutral' : 'positive'}
          icon={Cpu}
          color="orange"
          subtitle="Aggregated across all systems"
        />

        <StatCard
          title="Under Maintenance"
          value={facilityAssets.filter((a) => a.status?.toLowerCase() === 'maintenance').length}
          unit="scheduled"
          icon={Wrench}
          color="orange"
          subtitle="No critical outages"
          status="Preventative"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white/60 p-3.5 ">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, zones, types..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50/90 pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Status:
          </span>
          {[
            { key: 'all', label: 'All' },
            { key: 'operational', label: 'Operational' },
            { key: 'maintenance', label: 'Maintenance' },
            { key: 'offline', label: 'Offline' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                statusFilter === tab.key
                  ? 'bg-orange-600 text-gray-900 shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table View */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/70 shadow-xl ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/60 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="cursor-pointer px-4 py-3.5 hover:text-orange-700 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asset Name & ID</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Category / Type</th>
                <th className="px-4 py-3.5">Facility Zone</th>
                <th
                  onClick={() => toggleSort('utilization')}
                  className="cursor-pointer px-4 py-3.5 hover:text-orange-700 transition-colors min-w-[190px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Utilization Rate</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-orange-700" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="cursor-pointer px-4 py-3.5 hover:text-orange-700 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Power / Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              <AnimatePresence>
                {processedAssets.length > 0 ? (
                  processedAssets.map((asset, index) => {
                    const util = asset.utilization_pct || 0;
                    const isSelected = selectedAsset?.id === asset.id;

                    return (
                      <motion.tr
                        key={asset.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => setSelectedAsset(isSelected ? null : asset)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-orange-50'
                            : index % 2 === 0
                            ? 'bg-white hover:bg-gray-50/60'
                            : 'bg-white/20 hover:bg-gray-50/60'
                        }`}
                      >
                        {/* Name & ID */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <span>{asset.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-gray-500">{asset.id}</span>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200/60">
                            {asset.type}
                          </span>
                        </td>

                        {/* Zone */}
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-orange-700/80 shrink-0" />
                            <span className="truncate max-w-[140px]">{asset.zone}</span>
                          </div>
                        </td>

                        {/* Utilization Bar */}
                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-900">{util}%</span>
                              <span
                                className={`text-[10px] font-medium ${
                                  util > 85
                                    ? 'text-orange-700'
                                    : util > 70
                                    ? 'text-amber-400'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {util > 85 ? 'Peak Load' : util > 70 ? 'Moderate' : 'Nominal'}
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-50">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${getUtilColor(
                                  util
                                )}`}
                                style={{ width: `${util}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3">{renderStatusBadge(asset.status)}</td>

                        {/* Power / Load */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono font-medium text-gray-600">
                            {asset.power_kw ? `${asset.power_kw} kW` : '—'}
                          </span>
                          {asset.efficiency_rating && (
                            <div className="text-[10px] text-gray-500">
                              {asset.efficiency_rating} eff
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No assets found matching current criteria.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Selected Asset Details Drawer / Footer */}
        {selectedAsset && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{selectedAsset.name}</span>
                  <span className="font-mono text-xs text-orange-700">({selectedAsset.id})</span>
                  {renderStatusBadge(selectedAsset.status)}
                </div>
                <p className="text-xs text-gray-500">
                  Located in <span className="text-gray-800 font-medium">{selectedAsset.zone}</span> · Category: <span className="text-gray-800 font-medium">{selectedAsset.type}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                {selectedAsset.last_maintenance && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-orange-700" />
                    <span>Last Serviced: {selectedAsset.last_maintenance}</span>
                  </div>
                )}
                {selectedAsset.runtime_hours && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Activity className="h-3.5 w-3.5 text-emerald-700" />
                    <span>{selectedAsset.runtime_hours} Run Hours</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetPanel;
