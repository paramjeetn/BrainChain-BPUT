import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Truck, 
  Recycle, 
  CheckCircle2, 
  AlertTriangle, 
  Biohazard, 
  Layers,
  Sparkles,
  MapPin,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { StatCard, AlertBadge, PanelWrapper, AnomalyBadge, AssumptionsCard } from '../common';
import { ForecastChart } from '../charts';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useFacilityStore } from '../../stores/useFacilityStore';
;

const getFillColor = (fillPct) => {
  if (fillPct < 60) return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal' };
  if (fillPct <= 80) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Warning' };
  return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500/40', label: 'Critical' };
};

const WASTE_TYPE_COLORS = {
  general: '#6b7280',
  recyclable: '#3b82f6',
  organic: '#10b981',
  biomedical: '#ef4444',
  electronic: '#8b5cf6'
};

const TYPE_ICONS = {
  general: Layers,
  recyclable: Recycle,
  organic: Sparkles,
  biomedical: Biohazard,
  electronic: Trash2
};

export const WastePanel = ({ className = '' }) => {
  const { activeFacility } = useFacilityStore ? useFacilityStore() : { activeFacility: { id: 'bput-campus' } };
  const facilityId = activeFacility?.id || 'bput-campus';

  const { data: facilityRecords, loading } = useTelemetry('waste');

  const historicalRecords = useMemo(() => facilityRecords.filter(r => !r.is_forecast), [facilityRecords]);
  const anomalies = useMemo(() => facilityRecords.filter(r => r.anomaly), [facilityRecords]);

  // Derive latest bins info
  const bins = useMemo(() => {
    const binMap = new Map();
    historicalRecords.forEach(r => {
      const zid = r.zone_id;
      if (!binMap.has(zid) || new Date(r.timestamp) > new Date(binMap.get(zid).timestamp)) {
        binMap.set(zid, r);
      }
    });
    return Array.from(binMap.values());
  }, [historicalRecords]);

  const binsAtCapacity = useMemo(() => bins.filter(b => (b.bin_fill_pct ?? b.value ?? 0) > 85), [bins]);
  const isDispatchRequired = binsAtCapacity.length > 0;

  const metrics = useMemo(() => {
    const totalBins = bins.length || 1;
    const avgFill = Math.round(bins.reduce((acc, b) => acc + (b.bin_fill_pct ?? b.value ?? 0), 0) / totalBins);
    return {
      avgFill,
      binsAtCapacityCount: binsAtCapacity.length,
      collectionEfficiency: 96.4
    };
  }, [bins, binsAtCapacity]);

  const breakdownData = useMemo(() => {
    // We can group by waste_type across all latest bins
    const counts = {};
    bins.forEach(b => {
      const wt = (b.waste_type || 'general').toLowerCase();
      counts[wt] = (counts[wt] || 0) + (b.bin_fill_pct ?? b.value ?? 0);
    });
    
    return Object.entries(counts).map(([type, totalFill]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: Math.max(20, totalFill), // just for pie proportions
      pct: 0, 
      type,
      color: WASTE_TYPE_COLORS[type] || '#10b981'
    }));
  }, [bins]);

  return (
    <PanelWrapper
      title="Waste Management"
      subtitle={`${activeFacility?.name || 'Facility'} • Ultrasonic Bin Sensors & Smart Dispatch`}
      icon={Trash2}
      badge={
        isDispatchRequired ? (
          <AlertBadge
            label="Dispatch Required"
            variant="danger"
            pulse
          />
        ) : (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-emerald-500/20 text-emerald-700 border-emerald-200">
            All Routes Optimal
          </span>
        )
      }
      className={className}
    >
      <div className="space-y-4">
        {/* ML Anomaly Badge */}
        <AnomalyBadge anomalies={anomalies} />

        {isDispatchRequired && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/40 border border-red-500/40 text-red-600">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-red-200">
                  Critical Bin Fill Levels Detected
                </p>
                <p className="text-[11px] text-red-600/80">
                  {binsAtCapacity.map(b => `${b.zone_id} (${b.bin_fill_pct ?? b.value}%)`).join(', ')}. Autonomous route optimization activated.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-gray-900 text-[11px] font-semibold rounded-md shadow flex items-center gap-1.5 transition-colors">
              <Truck className="w-3.5 h-3.5" />
              Dispatch
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatCard
            title="Avg Bin Fill"
            value={metrics.avgFill}
            unit="%"
            change="+12% since morning"
            changeType="increase"
            icon={Layers}
            color={metrics.avgFill > 75 ? 'red' : metrics.avgFill > 50 ? 'amber' : 'emerald'}
          />
          <StatCard
            title="Bins > 85%"
            value={metrics.binsAtCapacityCount}
            subtitle={`Out of ${bins.length} monitored`}
            icon={AlertTriangle}
            color={metrics.binsAtCapacityCount > 0 ? 'red' : 'emerald'}
          />
          <StatCard
            title="Collection Route Eff."
            value={metrics.collectionEfficiency}
            unit="%"
            subtitle="AI optimized pathing"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Recycling Rate"
            value={42}
            unit="%"
            subtitle="Campus average"
            icon={Recycle}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 bg-white/60 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                Live Bin Status
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {bins.map((bin, idx) => {
                  const fill = bin.bin_fill_pct ?? bin.value ?? 0;
                  const c = getFillColor(fill);
                  const Icon = TYPE_ICONS[bin.waste_type?.toLowerCase()] || Trash2;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate w-16">{bin.zone_id}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="w-full max-w-[60px] h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div className={`h-full ${c.bg}`} style={{ width: `${fill}%` }} />
                        </div>
                        <span className={`text-[11px] font-mono w-7 text-right ${c.text}`}>{fill}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white/60 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                Fill Rate Forecast ({
                  (() => {
                    const f = facilityRecords.find(r => r.is_forecast);
                    return f ? f.zone_id : bins[0]?.zone_id;
                  })()
                })
              </h4>
            </div>
            <div className="h-44 w-full">
              <ForecastChart
                data={facilityRecords.filter(r => r.zone_id === (
                  facilityRecords.find(f => f.is_forecast)?.zone_id || bins[0]?.zone_id
                ))}
                color="#10b981"
                label="Fill"
                unit="%"
                nowTimestamp="2026-09-13T23:59:59Z"
              />
            </div>
          </div>
        </div>

        <AssumptionsCard 
          sourceTier="Synthetic IoT Feeds"
          model="FillRate-Extrapolation (Route Dispatching)"
          confidence={0.91}
          assumptions={[
            "Bin fill accumulation is non-linear and correlated with occupancy.",
            "Overflow threshold set at >85% to provide dispatch lead time.",
            "Forecast drops to 0% following scheduled virtual collection pickups."
          ]}
        />
      </div>
    </PanelWrapper>
  );
};

export default WastePanel;
