import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Droplets,
  Trash2,
  Wind,
  Car,
  Layers,
  ShieldAlert,
  Award,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const MODULE_META = {
  energy: { title: 'Energy Grid', icon: Zap, color: '#d97706', category: 'Sustainability', unit: 'kWh' },
  water: { title: 'Water Reserves', icon: Droplets, color: '#2563eb', category: 'Sustainability', unit: '%' },
  waste: { title: 'Waste Fill', icon: Trash2, color: '#059669', category: 'Sustainability', unit: '% Fill' },
  air_quality: { title: 'Air Quality (AQI)', icon: Wind, color: '#0891b2', category: 'Safety', unit: 'AQI' },
  traffic: { title: 'Traffic & Parking', icon: Car, color: '#7c3aed', category: 'Operations', unit: 'veh/h' },
  assets: { title: 'Asset Utilization', icon: Layers, color: '#db2777', category: 'Operations', unit: '%' },
  asset_utilization: { title: 'Asset Utilization', icon: Layers, color: '#db2777', category: 'Operations', unit: '%' },
  safety: { title: 'Facility Safety', icon: ShieldAlert, color: '#dc2626', category: 'Safety', unit: 'Incidents' },
  scorecard: { title: 'ESG Sustainability', icon: Award, color: '#0d9488', category: 'Sustainability', unit: 'pts' },
};

const DUMMY_TELEMETRY_ROW = {
  energy: { current: '2,840', min: '1,420', max: '3,890', trend: '+4.2%', trendUp: true, anomalyRisk: '12%', status: 'Nominal', spark: [30, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 88] },
  water: { current: '74', min: '52', max: '98', trend: '-2.1%', trendUp: false, anomalyRisk: '8%', status: 'Nominal', spark: [85, 82, 80, 78, 76, 75, 74, 76, 75, 74, 73, 74] },
  waste: { current: '84', min: '20', max: '92', trend: '+14%', trendUp: true, anomalyRisk: '78%', status: 'Dispatch Req.', spark: [20, 30, 42, 50, 60, 68, 72, 77, 80, 82, 84, 86] },
  air_quality: { current: '42', min: '28', max: '88', trend: '-8 AQI', trendUp: false, anomalyRisk: '5%', status: 'Good', spark: [55, 52, 48, 50, 45, 42, 40, 44, 46, 43, 42, 41] },
  traffic: { current: '310', min: '45', max: '460', trend: '+1.5%', trendUp: true, anomalyRisk: '15%', status: 'Flowing', spark: [45, 60, 120, 280, 340, 420, 390, 310, 250, 220, 290, 310] },
  assets: { current: '91', min: '65', max: '96', trend: '+3.2%', trendUp: true, anomalyRisk: '4%', status: 'Optimal', spark: [80, 82, 84, 86, 88, 87, 89, 90, 91, 92, 90, 91] },
  asset_utilization: { current: '91', min: '65', max: '96', trend: '+3.2%', trendUp: true, anomalyRisk: '4%', status: 'Optimal', spark: [80, 82, 84, 86, 88, 87, 89, 90, 91, 92, 90, 91] },
  safety: { current: '0', min: '0', max: '1', trend: '0%', trendUp: true, anomalyRisk: '1%', status: 'Secure', spark: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0] },
  scorecard: { current: '78.5', min: '71.0', max: '84.2', trend: '+2.4 pts', trendUp: true, anomalyRisk: '0%', status: 'Tier-1 Rated', spark: [72, 73, 74, 75, 75, 76, 77, 77, 78, 78, 79, 78.5] },
};

export function ModuleMetricsMatrix({
  modules = ['energy', 'water', 'waste', 'air_quality', 'traffic', 'assets', 'safety', 'scorecard'],
  onFocusModule,
  onOpenDetail,
}) {
  return (
    <div className="w-full bg-white border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Facility Cockpit Telemetry Matrix</h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time consolidated telemetry feeds, min/max envelopes, and ML risk scores.</p>
        </div>
        <span className="text-xs font-mono text-gray-400 font-semibold">{modules.length} Connected Subsystems</span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 sm:px-6">Module & Sensor</th>
              <th className="py-3 px-4">Current Reading</th>
              <th className="py-3 px-4 hidden md:table-cell">24H Range (Min/Max)</th>
              <th className="py-3 px-4 hidden sm:table-cell">7D Micro Trend</th>
              <th className="py-3 px-4">ML Anomaly Risk</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {modules.map((modId) => {
              const meta = MODULE_META[modId] || { title: modId, icon: Zap, color: '#6b7280', category: 'General', unit: '' };
              const rowData = DUMMY_TELEMETRY_ROW[modId] || {
                current: '100', min: '50', max: '150', trend: '+0%', trendUp: true, anomalyRisk: '5%', status: 'Nominal',
                spark: [10, 20, 30, 40, 50, 60, 70]
              };
              const Icon = meta.icon;
              const isAlert = ['Dispatch Req.', 'Alert', 'Low Reserve'].includes(rowData.status);

              const sparkData = rowData.spark.map((val, idx) => ({ val, idx }));

              return (
                <tr key={modId} className="hover:bg-gray-50/70 transition-colors group">
                  {/* Module Name & Icon */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block group-hover:text-emerald-800 transition-colors">
                          {meta.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {meta.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Current Reading */}
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-sm">
                    {rowData.current} <span className="text-xs font-normal text-gray-500 font-sans">{meta.unit}</span>
                  </td>

                  {/* 24H Min / Max */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-gray-600 font-mono text-[11px]">
                    <span className="text-gray-400">Min:</span> {rowData.min} · <span className="text-gray-400">Max:</span> {rowData.max}
                  </td>

                  {/* 7D Micro Sparkline */}
                  <td className="py-3.5 px-4 hidden sm:table-cell w-28">
                    <div className="w-24 h-7">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line
                            type="monotone"
                            dataKey="val"
                            stroke={meta.color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>

                  {/* Anomaly Risk */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <span
                      className={`font-semibold ${
                        parseInt(rowData.anomalyRisk) > 50
                          ? 'text-rose-600 font-bold'
                          : parseInt(rowData.anomalyRisk) > 20
                          ? 'text-amber-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {rowData.anomalyRisk}
                    </span>
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isAlert
                          ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isAlert && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 animate-pulse" />}
                      {!isAlert && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                      {rowData.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onFocusModule(modId)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-semibold border border-gray-200 transition-all shadow-2xs"
                      title="Open Interactive Studio"
                    >
                      Studio Focus
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(modId)}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Deep Inspector"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ModuleMetricsMatrix;
