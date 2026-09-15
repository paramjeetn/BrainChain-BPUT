import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Sparkles, Table2,
  Clock, Search, RefreshCw,
  Zap, Leaf, ShieldCheck, Building2, AlertTriangle, Layers
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all',            label: 'All',           icon: Layers,        count: 8 },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf,          count: 4 },
  { id: 'operations',     label: 'Operations',    icon: Building2,     count: 3 },
  { id: 'safety',         label: 'Safety',        icon: ShieldCheck,   count: 2 },
  { id: 'anomalies',      label: 'Alerts',        icon: AlertTriangle, count: null, isAlert: true },
];

export const TIME_RANGES = [
  { id: '1h',       label: '1H' },
  { id: '24h',      label: '24H' },
  { id: '7d',       label: '7D' },
  { id: 'forecast', label: 'Forecast' },
];

export const VIEW_MODES = [
  { id: 'grid',   label: 'Grid',   icon: LayoutGrid },
  { id: 'studio', label: 'Studio', icon: Sparkles },
  { id: 'matrix', label: 'Matrix', icon: Table2 },
];

export function DashboardControlHub({
  activeCategory,
  onSelectCategory,
  viewMode,
  onChangeViewMode,
  timeRange,
  onChangeTimeRange,
  searchQuery,
  onChangeSearchQuery,
  anomalyCount = 0,
  isLiveSyncing = false,
  onTriggerSync,
  onSimulateAnomaly,
}) {
  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Single row: Categories | Search | Controls */}
        <div className="flex items-center gap-3 py-2.5">

          {/* Left: Category Tabs */}
          <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'anomalies' ? anomalyCount : cat.count;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors duration-150 select-none ${
                    isActive
                      ? 'text-gray-950'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCat"
                      className="absolute inset-0 bg-gray-100 border border-gray-200 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      cat.isAlert && anomalyCount > 0 ? 'text-rose-500' :
                      isActive ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                    strokeWidth={2}
                  />
                  <span>{cat.label}</span>
                  {count !== null && (
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md ${
                      cat.isAlert && anomalyCount > 0
                        ? 'bg-rose-100 text-rose-700'
                        : isActive
                        ? 'bg-white text-gray-700 border border-gray-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 shrink-0 hidden sm:block" />

          {/* Center: Search */}
          <div className="relative flex-1 hidden sm:block min-w-0 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-[12px] text-gray-800 placeholder-gray-400 rounded-lg border border-gray-200 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden lg:block" />

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Time range */}
            <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0 hidden md:flex">
              <Clock className="w-3 h-3 text-gray-400 mx-1.5 shrink-0" />
              {TIME_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => onChangeTimeRange(range.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    timeRange === range.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* View mode switcher */}
            <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0">
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onChangeViewMode(mode.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      isSelected ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title={mode.label}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeView"
                        className="absolute inset-0 bg-white border border-gray-200 rounded-md -z-10 shadow-xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 hidden md:block" />

            {/* Live IoT pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold shrink-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="hidden lg:inline font-mono text-[10px] tracking-widest uppercase">Live</span>
              <button
                type="button"
                onClick={onTriggerSync}
                title="Sync feeds"
                className="text-emerald-600 hover:text-emerald-900 transition-colors p-0.5 rounded"
              >
                <RefreshCw className={`w-3 h-3 ${isLiveSyncing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
              </button>
            </div>

            {/* Anomaly sim */}
            <button
              type="button"
              onClick={onSimulateAnomaly}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold transition-all shrink-0 active:scale-95 hidden lg:flex"
              title="Simulate anomaly"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardControlHub;
