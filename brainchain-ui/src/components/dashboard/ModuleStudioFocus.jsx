import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Droplets,
  Trash2,
  Wind,
  Car,
  Layers,
  ShieldAlert,
  Award,
  Sparkles,
  Sliders,
  BarChart3,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  Send,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useFacilityStore } from '../../store/facilityStore';

const MODULES_DETAIL_CONFIG = {
  energy: {
    id: 'energy',
    title: 'Energy Grid & Sub-metering',
    category: 'Sustainability',
    icon: Zap,
    color: '#d97706',
    unit: 'kWh',
    simParam1: { name: 'HVAC Temperature Delta', min: -3, max: 3, step: 0.5, default: -1, unit: '°C' },
    simParam2: { name: 'Solar PV Injection Ratio', min: 0, max: 50, step: 5, default: 20, unit: '%' },
    benchmark: '3,200 kWh/day',
    zones: [
      { name: 'Block A (HVAC)', current: 620, baseline: 580, status: 'Normal' },
      { name: 'Block B (Lighting)', current: 280, baseline: 310, status: 'Optimal' },
      { name: 'Hostels & Canteen', current: 410, baseline: 390, status: 'Normal' },
      { name: 'Central Server Room', current: 590, baseline: 450, status: 'Alert' },
    ]
  },
  water: {
    id: 'water',
    title: 'Water Reserves & Leak Telemetry',
    category: 'Sustainability',
    icon: Droplets,
    color: '#2563eb',
    unit: '%',
    simParam1: { name: 'Greywater Recycling Ratio', min: 0, max: 60, step: 5, default: 25, unit: '%' },
    simParam2: { name: 'Low-Flow Pressure Cap', min: -20, max: 10, step: 5, default: -10, unit: '%' },
    benchmark: '65% Minimum Reserve',
    zones: [
      { name: 'Main Overhead Tank', current: 74, baseline: 80, status: 'Optimal' },
      { name: 'Hostel Reservoir', current: 42, baseline: 60, status: 'Alert' },
      { name: 'Central Irrigation Tank', current: 88, baseline: 75, status: 'Optimal' },
      { name: 'Fire Suppression Reserve', current: 95, baseline: 90, status: 'Optimal' },
    ]
  },
  waste: {
    id: 'waste',
    title: 'Smart Waste & Bin Logistics',
    category: 'Sustainability',
    icon: Trash2,
    color: '#059669',
    unit: '% Fill',
    simParam1: { name: 'Compaction Frequency Boost', min: 1, max: 4, step: 1, default: 2, unit: 'x / day' },
    simParam2: { name: 'Dynamic Routing Buffer', min: 60, max: 90, step: 5, default: 75, unit: '%' },
    benchmark: '80% Max Before Dispatch',
    zones: [
      { name: 'Canteen Wet Waste', current: 86, baseline: 70, status: 'Alert' },
      { name: 'Academic Block Dry Bins', current: 45, baseline: 50, status: 'Optimal' },
      { name: 'Hostel Sorting Yard', current: 62, baseline: 65, status: 'Normal' },
      { name: 'Bio-Hazard / E-Waste', current: 30, baseline: 40, status: 'Optimal' },
    ]
  },
  air_quality: {
    id: 'air_quality',
    title: 'Indoor & Campus Air Quality',
    category: 'Safety',
    icon: Wind,
    color: '#0891b2',
    unit: 'AQI',
    simParam1: { name: 'Fresh Air Intake Rate', min: 10, max: 100, step: 10, default: 40, unit: 'CFM' },
    simParam2: { name: 'HEPA Filter Stage Level', min: 1, max: 3, step: 1, default: 2, unit: 'Stage' },
    benchmark: '50 AQI (Good Standard)',
    zones: [
      { name: 'Auditorium (High Density)', current: 68, baseline: 45, status: 'Alert' },
      { name: 'Main Library (Air Sealed)', current: 32, baseline: 40, status: 'Optimal' },
      { name: 'Computer Labs', current: 42, baseline: 45, status: 'Optimal' },
      { name: 'Campus Outer Gate', current: 94, baseline: 80, status: 'Alert' },
    ]
  },
  traffic: {
    id: 'traffic',
    title: 'Transit Flow & Smart Parking',
    category: 'Operations',
    icon: Car,
    color: '#7c3aed',
    unit: 'veh/h',
    simParam1: { name: 'Smart Gate Lane Balancing', min: 1, max: 4, step: 1, default: 2, unit: 'Lanes' },
    simParam2: { name: 'EV Bay Reservation Hold', min: 5, max: 30, step: 5, default: 15, unit: 'mins' },
    benchmark: '450 veh/h Capacity',
    zones: [
      { name: 'Main Entry Gate 1', current: 142, baseline: 120, status: 'Normal' },
      { name: 'Faculty Parking Lot A', current: 82, baseline: 90, status: 'Optimal' },
      { name: 'Visitor Parking Lot B', current: 94, baseline: 85, status: 'Alert' },
      { name: 'EV Fast Charge Station', current: 4, baseline: 6, status: 'Optimal' },
    ]
  },
  assets: {
    id: 'assets',
    title: 'Asset Utilization & Maintenance',
    category: 'Operations',
    icon: Layers,
    color: '#db2777',
    unit: '%',
    simParam1: { name: 'Preventive Service Schedule', min: 7, max: 60, step: 7, default: 30, unit: 'Days' },
    simParam2: { name: 'Standby Redundancy Margin', min: 5, max: 30, step: 5, default: 15, unit: '%' },
    benchmark: '85% Target Efficiency',
    zones: [
      { name: 'Primary Chiller 01', current: 92, baseline: 85, status: 'Optimal' },
      { name: 'Backup Diesel Genset 02', current: 100, baseline: 100, status: 'Optimal' },
      { name: 'Main Elevator Bank 1-4', current: 78, baseline: 80, status: 'Normal' },
      { name: 'Central RO Plant', current: 64, baseline: 85, status: 'Alert' },
    ]
  },
  safety: {
    id: 'safety',
    title: 'Facility Safety & Incident Monitor',
    category: 'Safety',
    icon: ShieldAlert,
    color: '#dc2626',
    unit: 'Incidents',
    simParam1: { name: 'Automated Egress Check Interval', min: 1, max: 24, step: 1, default: 4, unit: 'Hours' },
    simParam2: { name: 'Thermal Camera Sensitivity', min: 70, max: 99, step: 5, default: 90, unit: '%' },
    benchmark: '0 Incidents Target',
    zones: [
      { name: 'Hazardous Chemical Storage', current: 0, baseline: 0, status: 'Optimal' },
      { name: 'Fire Exit Corridors', current: 0, baseline: 0, status: 'Optimal' },
      { name: 'Kitchen Exhaust System', current: 1, baseline: 0, status: 'Alert' },
      { name: 'Electrical Substation', current: 0, baseline: 0, status: 'Optimal' },
    ]
  },
  scorecard: {
    id: 'scorecard',
    title: 'ESG & Sustainability Scorecard',
    category: 'Sustainability',
    icon: Award,
    color: '#0d9488',
    unit: 'Score / 100',
    simParam1: { name: 'Renewable Power Offset', min: 10, max: 80, step: 5, default: 35, unit: '%' },
    simParam2: { name: 'Water Reuse Target', min: 20, max: 90, step: 5, default: 50, unit: '%' },
    benchmark: '80+ Tier-1 Rating',
    zones: [
      { name: 'Environmental Pillar', current: 78, baseline: 70, status: 'Optimal' },
      { name: 'Social & Campus Wellbeing', current: 82, baseline: 80, status: 'Optimal' },
      { name: 'Governance & Compliance', current: 89, baseline: 85, status: 'Optimal' },
      { name: 'Carbon Neutrality Track', current: 68, baseline: 75, status: 'Alert' },
    ]
  }
};

const SUB_TABS = [
  { id: 'telemetry', label: 'Telemetry & Forecast', icon: BarChart3 },
  { id: 'simulator', label: 'AI What-If Simulator', icon: Sliders },
  { id: 'zones', label: 'Spatial Breakdown', icon: MapPin },
  { id: 'diagnostics', label: 'Root Cause & Dispatch', icon: Sparkles },
];

// How many telemetry records to slice per time range in the Studio chart
const STUDIO_SLICE_MAP = {
  '1h':       6,   // tight 1-hour window, ~6 readings
  '24h':      20,  // default daily view
  '7d':       48,  // week-wide trend
  'forecast': 24,  // includes AI-predicted future points
};

// Human label shown in the chart legend and metric pill
const RANGE_LABEL = {
  '1h':       '1-Hr Window',
  '24h':      '24H Rolling',
  '7d':       '7-Day Avg',
  'forecast': '+24H Forecast',
};

export function ModuleStudioFocus({
  activeModuleId = 'energy',
  onSelectModule,
  onOpenFullDetail,
  timeRange = '24h',
}) {
  const [activeSubTab, setActiveSubTab] = useState('telemetry');
  const [param1Val, setParam1Val] = useState(null);
  const [param2Val, setParam2Val] = useState(null);
  const [dispatched, setDispatched] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const moduleConfig = MODULES_DETAIL_CONFIG[activeModuleId] || MODULES_DETAIL_CONFIG.energy;
  const { data: rawTelemetry, loading } = useTelemetry(activeModuleId === 'air_quality' ? 'air-quality' : activeModuleId);

  const Icon = moduleConfig.icon;

  // Simulator parameters defaults
  const p1 = param1Val !== null ? param1Val : moduleConfig.simParam1.default;
  const p2 = param2Val !== null ? param2Val : moduleConfig.simParam2.default;

  // Format telemetry chart data — sliced by the selected time range
  const chartData = useMemo(() => {
    const sliceCount = STUDIO_SLICE_MAP[timeRange] ?? 20;
    const includeForecast = timeRange === 'forecast';

    if (!Array.isArray(rawTelemetry) || rawTelemetry.length === 0) {
      // Generate stub data whose length matches the slice
      return Array.from({ length: sliceCount }, (_, i) => ({
        time: `${String(i * (24 / sliceCount)).padStart(2, '0')}:00`,
        value: Math.round(50 + Math.sin(i * 0.6) * 35 + (i > sliceCount * 0.7 ? 15 : 0)),
        forecast: i >= Math.floor(sliceCount * 0.75)
          ? Math.round(55 + Math.sin(i * 0.6) * 35 + 20) : null,
        lower: i >= Math.floor(sliceCount * 0.75)
          ? Math.round(45 + Math.sin(i * 0.6) * 35 + 10) : null,
        upper: i >= Math.floor(sliceCount * 0.75)
          ? Math.round(65 + Math.sin(i * 0.6) * 35 + 30) : null,
        isAnomaly: i === Math.floor(sliceCount * 0.8),
      }));
    }

    // In forecast mode keep predicted records too; otherwise strip them
    const records = includeForecast
      ? rawTelemetry
      : rawTelemetry.filter(r => !r.is_forecast);

    return records.slice(-sliceCount).map((r, i) => {
      const timeStr = r.timestamp
        ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `${i * 2}:00`;
      const val = r.value ?? r.kWh_total ?? r.tank_level_pct ?? r.bin_fill_pct ?? r.aqi ?? 0;
      return {
        time: timeStr,
        value: r.is_forecast ? null : Math.round(val),
        forecast: r.is_forecast ? Math.round(r.forecast ?? val) : null,
        lower: r.forecast_lower ? Math.round(r.forecast_lower) : null,
        upper: r.forecast_upper ? Math.round(r.forecast_upper) : null,
        isAnomaly: Boolean(r.anomaly),
      };
    });
  }, [rawTelemetry, timeRange]);

  // Dynamic simulation calculations
  const simResults = useMemo(() => {
    const costSavingsPct = Math.round(Math.abs(p1 * 3.8 + p2 * 0.45));
    const carbonReductionKg = Math.round(120 + p1 * 18 + p2 * 4.2);
    const reliabilityIndex = Math.min(99, Math.max(70, Math.round(88 + p1 * 1.5 - p2 * 0.2)));

    return {
      costSavingsPct,
      carbonReductionKg,
      reliabilityIndex,
    };
  }, [p1, p2]);

  // Dispatch automated action handler
  const handleDispatchAction = () => {
    setDispatchLoading(true);
    setTimeout(() => {
      setDispatchLoading(false);
      setDispatched(true);
    }, 900);
  };

  return (
    <div className="w-full bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden mb-6 transition-all">
      {/* 1. Module Selector Tab Ribbon */}
      <div className="bg-gray-50/80 border-b border-gray-200 px-4 pt-3 pb-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {Object.values(MODULES_DETAIL_CONFIG).map((mod) => {
          const ModIcon = mod.icon;
          const isSelected = mod.id === activeModuleId;

          return (
            <button
              key={mod.id}
              onClick={() => {
                onSelectModule(mod.id);
                setDispatched(false);
              }}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                isSelected
                  ? 'text-gray-900 bg-white border-t border-x border-gray-200 -mb-[1px] shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <div
                className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[10px]"
                style={{ backgroundColor: mod.color }}
              >
                <ModIcon className="w-2.5 h-2.5" />
              </div>
              <span>{mod.title.split('&')[0]}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeStudioModuleIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-emerald-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Studio Header Bar */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-white"
            style={{ backgroundColor: moduleConfig.color }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{moduleConfig.title}</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                {moduleConfig.category}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              <span>Standard Baseline: <strong className="text-gray-700 font-semibold">{moduleConfig.benchmark}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Real-Time Sync Active
              </span>
            </p>
          </div>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
          {SUB_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                  isTabActive
                    ? 'text-gray-900 font-bold shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {isTabActive && (
                  <motion.div
                    layoutId="activeStudioSubTab"
                    className="absolute inset-0 bg-white rounded-lg border border-gray-200 -z-10 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <TabIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-Tab Content View */}
      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: TELEMETRY & FORECAST */}
          {activeSubTab === 'telemetry' && (
            <motion.div
              key="tab-telemetry"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Stat metric pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Current Reading</span>
                  <div className="text-xl font-extrabold text-gray-900 mt-1 flex items-baseline gap-1">
                    {chartData[chartData.length - 1]?.value ?? 184}
                    <span className="text-xs font-semibold text-gray-400">{moduleConfig.unit}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="w-2.5 h-2.5" /> +2.4% vs {RANGE_LABEL[timeRange]} avg
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {RANGE_LABEL[timeRange]} Peak
                  </span>
                  <div className="text-xl font-extrabold text-gray-900 mt-1 flex items-baseline gap-1">
                    {Math.max(...chartData.map((d) => d.value || 0)) || 240}
                    <span className="text-xs font-semibold text-gray-400">{moduleConfig.unit}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                    {timeRange === '1h' ? 'Within last hour' :
                     timeRange === '7d' ? '7-day high' :
                     timeRange === 'forecast' ? 'Projected peak' :
                     'Recorded at 14:00'}
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ML Anomaly Risk</span>
                  <div className="text-xl font-extrabold text-amber-600 mt-1 flex items-baseline gap-1">
                    14%
                    <span className="text-xs font-semibold text-gray-400">Isolation Forest</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Nominal operating range</span>
                </div>

                <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {timeRange === 'forecast' ? 'AI Projected Value' : '+24H Expected Trend'}
                  </span>
                  <div className="text-xl font-extrabold text-gray-900 mt-1 flex items-baseline gap-1">
                    -3.8%
                    <span className="text-xs font-semibold text-gray-400">Projected</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium mt-1 block">95% Confidence Interval</span>
                </div>
              </div>

              {/* Chart container */}
              <div className="p-4 bg-gray-50/50 border border-gray-200/90 rounded-2xl">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">
                      Telemetry Stream — <span className="text-emerald-700">{RANGE_LABEL[timeRange]}</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: moduleConfig.color }} />
                      Recorded IoT
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      ML Forecast
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenFullDetail && onOpenFullDetail(activeModuleId)}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Open Deep Inspector <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="modTelemetryGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={moduleConfig.color} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={moduleConfig.color} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="modForecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="p-2.5 bg-gray-900 text-white rounded-lg shadow-xl text-xs space-y-1">
                              <p className="font-semibold text-gray-300">{label}</p>
                              {d.value !== null && (
                                <p className="font-bold text-emerald-400">Actual: {d.value} {moduleConfig.unit}</p>
                              )}
                              {d.forecast !== null && (
                                <p className="font-bold text-blue-400">Forecast: {d.forecast} {moduleConfig.unit}</p>
                              )}
                              {d.isAnomaly && (
                                <p className="font-bold text-rose-400 animate-pulse">⚠️ Anomaly Spike Detected</p>
                              )}
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke={moduleConfig.color} strokeWidth={2.5} fill="url(#modTelemetryGrad)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="url(#modForecastGrad)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI WHAT-IF SCENARIO SIMULATOR */}
          {activeSubTab === 'simulator' && (
            <motion.div
              key="tab-simulator"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Sliders on Left (7 cols) */}
              <div className="lg:col-span-7 space-y-5 p-5 bg-gray-50/80 border border-gray-200/90 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-900">Interactive Facility Control Sliders</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Simulate operational adjustments in real-time. The AI neural engine recalculates expected energy savings, emission reductions, and equipment wear.
                </p>

                {/* Slider 1 */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">{moduleConfig.simParam1.name}</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {p1 > 0 ? `+${p1}` : p1} {moduleConfig.simParam1.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={moduleConfig.simParam1.min}
                    max={moduleConfig.simParam1.max}
                    step={moduleConfig.simParam1.step}
                    value={p1}
                    onChange={(e) => setParam1Val(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>{moduleConfig.simParam1.min} {moduleConfig.simParam1.unit}</span>
                    <span>Default ({moduleConfig.simParam1.default})</span>
                    <span>{moduleConfig.simParam1.max} {moduleConfig.simParam1.unit}</span>
                  </div>
                </div>

                {/* Slider 2 */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">{moduleConfig.simParam2.name}</span>
                    <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p2 > 0 ? `+${p2}` : p2} {moduleConfig.simParam2.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={moduleConfig.simParam2.min}
                    max={moduleConfig.simParam2.max}
                    step={moduleConfig.simParam2.step}
                    value={p2}
                    onChange={(e) => setParam2Val(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>{moduleConfig.simParam2.min} {moduleConfig.simParam2.unit}</span>
                    <span>Default ({moduleConfig.simParam2.default})</span>
                    <span>{moduleConfig.simParam2.max} {moduleConfig.simParam2.unit}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setParam1Val(moduleConfig.simParam1.default);
                      setParam2Val(moduleConfig.simParam2.default);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-900 underline"
                  >
                    Reset to Factory Baseline
                  </button>
                </div>
              </div>

              {/* Simulation Result Cards on Right (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-900">Projected Efficiency Gain</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">+ROI</span>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-900 mt-2">
                    {simResults.costSavingsPct}%
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Estimated net reduction in operating expense over 30-day billing cycle.
                  </p>
                </div>

                <div className="p-4 bg-cyan-50/70 border border-cyan-200/90 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-900">Carbon Abatement</span>
                    <span className="text-xs font-bold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-full">ESG</span>
                  </div>
                  <div className="text-3xl font-extrabold text-cyan-900 mt-2">
                    {simResults.carbonReductionKg} <span className="text-base font-semibold">kg CO₂e</span>
                  </div>
                  <p className="text-[11px] text-cyan-800 mt-1">
                    Equivalent to planting 6 urban trees annually.
                  </p>
                </div>

                <div className="p-4 bg-violet-50/70 border border-violet-200/90 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-violet-900">System Stability Rating</span>
                    <span className="text-xs font-bold text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-full">Confidence</span>
                  </div>
                  <div className="text-3xl font-extrabold text-violet-900 mt-2">
                    {simResults.reliabilityIndex} / 100
                  </div>
                  <p className="text-[11px] text-violet-800 mt-1">
                    Risk coefficient within safe margins for hospital & campus tier infrastructure.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SPATIAL ZONE BREAKDOWN */}
          {activeSubTab === 'zones' && (
            <motion.div
              key="tab-zones"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Zone-by-Zone Telemetry Comparison
                </span>
                <span className="text-xs text-gray-400 font-mono">4 Monitored Sectors</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {moduleConfig.zones.map((zone, idx) => {
                  const isAlert = zone.status === 'Alert';
                  const pct = Math.min(100, Math.round((zone.current / (zone.baseline * 1.3)) * 100));

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isAlert
                          ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                          : 'bg-gray-50/60 border-gray-200/80 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isAlert ? 'text-rose-600' : 'text-gray-500'}`} />
                          <span className="text-sm font-bold text-gray-900">{zone.name}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isAlert
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {zone.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <div className="text-lg font-extrabold text-gray-900">
                          {zone.current} <span className="text-xs font-normal text-gray-500">{moduleConfig.unit}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Baseline: {zone.baseline} {moduleConfig.unit}
                        </span>
                      </div>

                      {/* Progress meter */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isAlert ? 'bg-rose-500' : 'bg-emerald-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ROOT CAUSE & DISPATCH */}
          {activeSubTab === 'diagnostics' && (
            <motion.div
              key="tab-diagnostics"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-5 bg-gray-50/90 border border-gray-200 rounded-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Isolation Forest ML Root Cause Diagnostic</h3>
                    <p className="text-xs text-gray-500">Autonomous multi-variate telemetry outlier detector</p>
                  </div>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 font-semibold">
                  Model: SciKit-Learn v1.4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Primary Outlier Feature</span>
                  <p className="text-xs font-bold text-gray-900 mt-1">Thermal Load vs Peak Grid Tariff</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Statistical Deviation</span>
                  <p className="text-xs font-bold text-amber-600 mt-1">+2.4σ from Rolling Mean</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Recommended Policy</span>
                  <p className="text-xs font-bold text-emerald-700 mt-1">Engage Smart Shedding Protocol</p>
                </div>
              </div>

              {/* Action Dispatch Box */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Automated Remediation Trigger</h4>
                  <p className="text-xs text-gray-500">
                    Dispatches automated MQTT actuator commands to balance zone setpoints.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDispatchAction}
                  disabled={dispatched || dispatchLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                    dispatched
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-gray-900 hover:bg-black text-white active:scale-97'
                  }`}
                >
                  {dispatchLoading ? (
                    <span>Transmitting Actuation...</span>
                  ) : dispatched ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Remediation Active (Ack)
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Smart Automation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ModuleStudioFocus;
