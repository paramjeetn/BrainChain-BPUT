import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Droplets, Trash2, Wind, Car, Layers,
  ShieldAlert, Award, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, BarChart2, LineChart as LineIcon
} from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';

const MODULE_META = {
  energy: {
    title: 'Energy Grid',
    category: 'Sustainability',
    icon: Zap,
    color: '#d97706',
    accent: 'amber',
    gradient: 'from-amber-50 to-white',
    ring: 'ring-amber-200/60',
    iconBg: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
  },
  water: {
    title: 'Water Reserves',
    category: 'Sustainability',
    icon: Droplets,
    color: '#2563eb',
    accent: 'blue',
    gradient: 'from-blue-50 to-white',
    ring: 'ring-blue-200/60',
    iconBg: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800',
  },
  waste: {
    title: 'Waste Logistics',
    category: 'Sustainability',
    icon: Trash2,
    color: '#059669',
    accent: 'emerald',
    gradient: 'from-emerald-50 to-white',
    ring: 'ring-emerald-200/60',
    iconBg: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  air_quality: {
    title: 'Air Quality',
    category: 'Safety',
    icon: Wind,
    color: '#0891b2',
    accent: 'cyan',
    gradient: 'from-cyan-50 to-white',
    ring: 'ring-cyan-200/60',
    iconBg: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  traffic: {
    title: 'Traffic & Flow',
    category: 'Operations',
    icon: Car,
    color: '#7c3aed',
    accent: 'violet',
    gradient: 'from-violet-50 to-white',
    ring: 'ring-violet-200/60',
    iconBg: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-800',
  },
  assets: {
    title: 'Asset Utilization',
    category: 'Operations',
    icon: Layers,
    color: '#db2777',
    accent: 'pink',
    gradient: 'from-pink-50 to-white',
    ring: 'ring-pink-200/60',
    iconBg: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-800',
  },
  asset_utilization: {
    title: 'Asset Utilization',
    category: 'Operations',
    icon: Layers,
    color: '#db2777',
    accent: 'pink',
    gradient: 'from-pink-50 to-white',
    ring: 'ring-pink-200/60',
    iconBg: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-800',
  },
  safety: {
    title: 'Facility Safety',
    category: 'Safety',
    icon: ShieldAlert,
    color: '#dc2626',
    accent: 'red',
    gradient: 'from-red-50 to-white',
    ring: 'ring-red-200/60',
    iconBg: 'bg-red-500',
    badge: 'bg-red-100 text-red-800',
  },
  scorecard: {
    title: 'ESG Scorecard',
    category: 'Sustainability',
    icon: Award,
    color: '#0d9488',
    accent: 'teal',
    gradient: 'from-teal-50 to-white',
    ring: 'ring-teal-200/60',
    iconBg: 'bg-teal-500',
    badge: 'bg-teal-100 text-teal-800',
  },
};

const MODULE_API_ID = {
  air_quality: 'air-quality',
  asset_utilization: 'assets',
};

// How many records to show in the sparkline per time range
const SLICE_MAP = {
  '1h':       4,   // ~1 hour  (every ~15 min interval)
  '24h':      16,  // ~24 hours (default)
  '7d':       96,  // ~7 days
  'forecast': 20,  // include forecast records
};

export function ModuleSummaryCard({ moduleId, onClick, onFocusStudio, featured = false, timeRange = '24h', className = '' }) {
  const [chartMode, setChartMode] = useState('area');
  const apiModuleId = MODULE_API_ID[moduleId] || moduleId;
  const { data: telemetryData, loading } = useTelemetry(apiModuleId);

  const config = MODULE_META[moduleId] || {
    title: moduleId,
    icon: Activity,
    color: '#4b5563',
    category: 'General',
    gradient: 'from-gray-50 to-white',
    ring: 'ring-gray-200/60',
    iconBg: 'bg-gray-500',
    badge: 'bg-gray-100 text-gray-700',
  };
  const Icon = config.icon;

  const kpi = useMemo(() => {
    const staticStub = {
      scorecard: { value: '78.5', unit: 'pts', trend: '+2.4 pts', trendUp: true, status: 'Tier-1 Rated', alert: false },
      traffic:   { value: '310',  unit: 'veh/h', trend: '-14%', trendUp: false, status: 'Flowing', alert: false },
      assets:    { value: '92',   unit: '%', trend: '+2%', trendUp: true, status: 'Optimal', alert: false },
      asset_utilization: { value: '92', unit: '%', trend: '+2%', trendUp: true, status: 'Optimal', alert: false },
      safety:    { value: '0',    unit: 'Inc', trend: '0 Today', trendUp: true, status: 'Secure', alert: false },
    };

    const sliceCount = SLICE_MAP[timeRange] ?? 16;
    const includeForecast = timeRange === 'forecast';

    // Stub history length matches the chosen slice
    const historyStub = (seed = 0) => Array.from({ length: sliceCount }, (_, i) => ({
      v: Math.round(42 + Math.sin(i * 0.65 + seed) * 28 + Math.random() * 10),
    }));

    if (staticStub[moduleId]) {
      return { ...staticStub[moduleId], history: historyStub(moduleId.length) };
    }

    if (loading || !Array.isArray(telemetryData) || telemetryData.length === 0) {
      return {
        value: '—', unit: '', trend: 'Loading…', trendUp: true,
        status: 'Streaming', alert: false, history: historyStub(2),
      };
    }

    // Forecast mode includes predicted records; otherwise live-only
    const records = includeForecast
      ? telemetryData
      : telemetryData.filter(r => !r.is_forecast);

    // Slice to the chosen time window
    const windowRecords = records.slice(-sliceCount);

    const history = windowRecords.map(r => ({
      v: r.value ?? r.tank_level_pct ?? r.bin_fill_pct ?? r.aqi ?? r.liters_consumed ?? 0,
      forecast: !!r.is_forecast,
    }));

    // Suffix appended to trend text so the user knows what window it reflects
    const trendSuffix =
      timeRange === '1h' ? ' (1h)' :
      timeRange === '7d' ? ' (7d avg)' :
      timeRange === 'forecast' ? ' (fcst)' : '';

    if (moduleId === 'energy') {
      const todayKwh = windowRecords.reduce((s, r) => s + (r.value || 0), 0);
      const hasAlert = windowRecords.some(r => r.anomaly);
      return { value: Math.round(todayKwh || 2840).toLocaleString(), unit: 'kWh', trend: `+4.2%${trendSuffix}`, trendUp: true, status: hasAlert ? 'ML Anomaly' : 'Nominal', alert: hasAlert, history };
    }
    if (moduleId === 'water') {
      const latest = windowRecords.at(-1)?.tank_level_pct ?? windowRecords.at(-1)?.value ?? 74;
      const low = latest < 30;
      return { value: Math.round(latest), unit: '%', trend: `-2.1%${trendSuffix}`, trendUp: false, status: low ? 'Low Reserve' : 'Nominal', alert: low, history };
    }
    if (moduleId === 'air_quality') {
      const latest = windowRecords.at(-1)?.aqi ?? windowRecords.at(-1)?.value ?? 42;
      const bad = latest > 100;
      return { value: Math.round(latest), unit: 'AQI', trend: `-6 AQI${trendSuffix}`, trendUp: false, status: bad ? 'Unhealthy' : 'Good', alert: bad, history };
    }
    if (moduleId === 'waste') {
      const latest = windowRecords.at(-1)?.bin_fill_pct ?? windowRecords.at(-1)?.value ?? 84;
      const hasAlert = windowRecords.some(r => (r.bin_fill_pct ?? r.value) > 80);
      return { value: Math.round(latest), unit: '%', trend: `+14%${trendSuffix}`, trendUp: true, status: hasAlert ? 'Dispatch Req.' : 'Normal', alert: hasAlert, history };
    }

    return { value: '92', unit: '%', trend: `+1%${trendSuffix}`, trendUp: true, status: 'Online', alert: false, history };
  }, [moduleId, telemetryData, loading, timeRange]);

  const isAlert = kpi.alert;

  const handleCardClick = () => {
    if (onClick) onClick(moduleId);
    else if (onFocusStudio) onFocusStudio(moduleId);
  };

  const handleStudioClick = (e) => {
    e.stopPropagation();
    if (onFocusStudio) onFocusStudio(moduleId);
    else if (onClick) onClick(moduleId);
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${
        isAlert
          ? 'border-rose-300 shadow-md shadow-rose-100 ring-1 ring-rose-300/30'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
      } ${featured ? 'h-[220px]' : 'h-[196px]'} ${className}`}
      onClick={handleCardClick}
    >
      {/* Gradient wash at top */}
      <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${config.gradient} pointer-events-none`} />

      {/* Alert pulse overlay */}
      {isAlert && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-rose-400/20 pointer-events-none animate-pulse" />
      )}

      {/* Header */}
      <div className="relative flex items-start justify-between px-4 pt-4 pb-1 z-10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${config.iconBg}`}
          >
            <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{config.title}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{config.category}</p>
          </div>
        </div>

        {/* Action buttons - shown on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setChartMode(p => p === 'area' ? 'bar' : 'area'); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Toggle chart type"
          >
            {chartMode === 'area' ? <BarChart2 className="w-3.5 h-3.5" /> : <LineIcon className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleStudioClick}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Studio Focus"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Value + Sparkline */}
      <div className="relative flex-1 flex items-center justify-between px-4 z-10 pb-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Live Reading</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] sm:text-[32px] font-black text-gray-950 tracking-tight leading-none font-mono">
              {kpi.value}
            </span>
            <span className="text-sm font-semibold text-gray-400">{kpi.unit}</span>
          </div>
        </div>

        {/* Sparkline chart */}
        {kpi.history && kpi.history.length > 2 && (
          <div className="w-[88px] h-[44px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={kpi.history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`sg-${moduleId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={config.color}
                    strokeWidth={1.5}
                    fill={`url(#sg-${moduleId})`}
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              ) : (
                <BarChart data={kpi.history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="v" fill={config.color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer: trend + status */}
      <div className="relative flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center justify-center w-4 h-4 rounded-full ${kpi.trendUp ? 'bg-emerald-100' : 'bg-sky-100'}`}>
            {kpi.trendUp
              ? <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
              : <TrendingDown className="w-2.5 h-2.5 text-sky-600" />
            }
          </span>
          <span className="text-[11px] font-semibold text-gray-600">{kpi.trend}</span>
        </div>

        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
          isAlert
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isAlert && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
            </span>
          )}
          {kpi.status}
        </span>
      </div>
    </motion.div>
  );
}

export default ModuleSummaryCard;
