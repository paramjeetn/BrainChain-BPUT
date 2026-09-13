import React, { useMemo, useState } from 'react';
import { 
  Zap, Droplets, Trash2, Wind, Car, Layers,
  ShieldAlert, Award, GripHorizontal, TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useFacilityStore } from '../../stores/useFacilityStore';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const MODULE_META = {
  energy:      { title: 'Energy Load',    icon: Zap,        color: '#d97706', bg: 'bg-amber-50',   text: 'text-amber-600',  gradient: 'from-amber-50 to-white'   },
  water:       { title: 'Water Reserves', icon: Droplets,   color: '#2563eb', bg: 'bg-blue-50',    text: 'text-blue-600',   gradient: 'from-blue-50 to-white'    },
  waste:       { title: 'Waste Fill',     icon: Trash2,     color: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-600',gradient: 'from-emerald-50 to-white' },
  air_quality: { title: 'Air Quality',    icon: Wind,       color: '#0891b2', bg: 'bg-cyan-50',    text: 'text-cyan-600',   gradient: 'from-cyan-50 to-white'    },
  traffic:     { title: 'Traffic Flow',   icon: Car,        color: '#7c3aed', bg: 'bg-violet-50',  text: 'text-violet-600', gradient: 'from-violet-50 to-white'  },
  assets:      { title: 'Asset Util.',    icon: Layers,     color: '#db2777', bg: 'bg-pink-50',    text: 'text-pink-600',   gradient: 'from-pink-50 to-white'    },
  asset_utilization: { title: 'Asset Util.', icon: Layers,  color: '#db2777', bg: 'bg-pink-50',   text: 'text-pink-600',   gradient: 'from-pink-50 to-white'    },
  safety:      { title: 'Safety Status', icon: ShieldAlert, color: '#dc2626', bg: 'bg-red-50',     text: 'text-red-600',    gradient: 'from-red-50 to-white'     },
  scorecard:   { title: 'ESG Score',      icon: Award,      color: '#0d9488', bg: 'bg-teal-50',    text: 'text-teal-600',   gradient: 'from-teal-50 to-white'    },
};

// Map internal module IDs to API route IDs
const MODULE_API_ID = {
  air_quality: 'air-quality',
  asset_utilization: 'assets',
};

export function ModuleSummaryCard({ moduleId, onClick, className = '' }) {
  const facilityId = useFacilityStore(s => s.activeFacility?.id);
  const apiModuleId = MODULE_API_ID[moduleId] || moduleId;
  const { data: telemetryData, loading } = useTelemetry(apiModuleId);

  const config = MODULE_META[moduleId] || {
    title: moduleId, icon: Activity, color: '#4b5563',
    bg: 'bg-gray-100', text: 'text-gray-600', gradient: 'from-gray-50 to-white'
  };
  const Icon = config.icon;

  const kpi = useMemo(() => {
    // Stub data for modules with no API telemetry
    const staticStub = {
      scorecard: { value: '74.2', unit: 'pts',   trend: '+1.5 pts',  trendUp: true,  status: 'Improving', statusColor: 'text-emerald-600 bg-emerald-50' },
      traffic:   { value: '342',  unit: 'veh/h', trend: '-14%',      trendUp: false, status: 'Flowing',   statusColor: 'text-blue-600 bg-blue-50'      },
      assets:    { value: '92',   unit: '%',      trend: '+2%',       trendUp: true,  status: 'Efficient', statusColor: 'text-emerald-600 bg-emerald-50' },
      asset_utilization: { value: '92', unit: '%', trend: '+2%',      trendUp: true,  status: 'Efficient', statusColor: 'text-emerald-600 bg-emerald-50' },
      safety:    { value: '0',    unit: 'Inc',    trend: '0%',        trendUp: true,  status: 'Secure',    statusColor: 'text-emerald-600 bg-emerald-50' },
    };

    if (staticStub[moduleId]) {
      // Generate random-ish history for static modules
      const history = Array.from({ length: 12 }, (_, i) => ({ value: 50 + Math.sin(i * 0.8) * 30 + Math.random() * 10, index: i }));
      return { ...staticStub[moduleId], history };
    }

    if (loading || !Array.isArray(telemetryData) || telemetryData.length === 0) {
      return { value: '—', unit: '', trend: '...', trendUp: true, status: 'Loading', statusColor: 'text-gray-400 bg-gray-50', history: [] };
    }

    const records = telemetryData.filter(r => !r.is_forecast);
    const history = records.slice(-15).map((r, i) => ({
      value: r.value ?? r.tank_level_pct ?? r.bin_fill_pct ?? r.aqi ?? r.liters_consumed ?? 0,
      index: i,
    }));

    if (moduleId === 'energy') {
      const todayKwh = records.slice(-12).reduce((s, r) => s + (r.value || 0), 0);
      const hasAlert = records.some(r => r.anomaly);
      return {
        value: Math.round(todayKwh).toLocaleString(), unit: 'kWh',
        trend: '+4.2%', trendUp: true,
        status: hasAlert ? 'Anomaly' : 'Optimal',
        statusColor: hasAlert ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50',
        history,
      };
    }
    if (moduleId === 'water') {
      const latest = records[records.length - 1]?.tank_level_pct ?? records[records.length - 1]?.value ?? 68;
      return {
        value: Math.round(latest), unit: '%',
        trend: '-2.1%', trendUp: false,
        status: latest < 30 ? 'Low Reserve' : 'Optimal',
        statusColor: latest < 30 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50',
        history,
      };
    }
    if (moduleId === 'air_quality') {
      const latest = records[records.length - 1]?.aqi ?? records[records.length - 1]?.value ?? 45;
      return {
        value: Math.round(latest), unit: 'AQI',
        trend: '-5 AQI', trendUp: false,
        status: latest > 100 ? 'Unhealthy' : 'Good',
        statusColor: latest > 100 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50',
        history,
      };
    }
    if (moduleId === 'waste') {
      const latest = records[records.length - 1]?.bin_fill_pct ?? records[records.length - 1]?.value ?? 40;
      const hasAlert = records.some(r => (r.bin_fill_pct ?? r.value) > 85);
      return {
        value: Math.round(latest), unit: '%',
        trend: '+12%', trendUp: true,
        status: hasAlert ? 'Dispatch' : 'Normal',
        statusColor: hasAlert ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50',
        history,
      };
    }

    return { value: '--', unit: '', trend: '', trendUp: true, status: 'Online', statusColor: 'text-gray-500 bg-gray-100', history: [] };
  }, [moduleId, telemetryData, loading]);

  const isAlert = ['Anomaly', 'Low Reserve', 'Unhealthy', 'Dispatch'].includes(kpi.status);

  return (
    <div
      className={`relative flex flex-col h-full bg-white border ${
        isAlert
          ? 'border-red-300 shadow-[0_4px_12px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
          : 'border-gray-200/80 shadow-sm'
      } rounded-[24px] overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-300 ${className}`}
      onClick={() => onClick(moduleId)}
    >
      {/* Subtle bg gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 pb-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shadow-sm ${config.bg} ${config.text} border border-white/60`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700 tracking-tight">{config.title}</span>
        </div>
        <div className="panel-drag-handle opacity-0 group-hover:opacity-100 p-1.5 -mr-1.5 rounded-md cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all" title="Drag to reorder">
          <GripHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 flex flex-col justify-end p-4 pt-1 z-10">
        {/* KPI + Sparkline row */}
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{kpi.value}</span>
            <span className="text-sm font-semibold text-gray-400">{kpi.unit}</span>
          </div>

          {kpi.history && kpi.history.length > 2 && (
            <div className="w-20 h-10 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${moduleId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={config.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={config.color}
                    strokeWidth={2}
                    fill={`url(#grad-${moduleId})`}
                    isAnimationActive={false}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Trend + Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${kpi.trendUp ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            </div>
            <span className="text-xs font-semibold text-gray-500">{kpi.trend}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border border-white/50 shadow-sm ${kpi.statusColor}`}>
            {isAlert && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
            )}
            {kpi.status}
          </div>
        </div>
      </div>
    </div>
  );
}
