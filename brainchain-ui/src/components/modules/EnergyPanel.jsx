import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Flame, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Clock,
  Gauge,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { StatCard, AlertBadge, PanelWrapper, AnomalyBadge, AssumptionsCard } from '../common';
import { ForecastChart } from '../charts';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useFacilityStore } from '../../stores/useFacilityStore';
;

// Custom dark tooltip for Recharts BarChart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-amber-500/40 rounded-lg p-2.5 shadow-xl text-xs ">
        <p className="font-semibold text-gray-800">{label || data.name}</p>
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center justify-between gap-3 text-amber-400 font-medium">
            <span>Total Load:</span>
            <span>{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value} kWh</span>
          </div>
          {data.hvac !== undefined && (
            <div className="flex items-center justify-between gap-3 text-gray-500">
              <span>HVAC:</span>
              <span>{data.hvac.toLocaleString()} kWh</span>
            </div>
          )}
          {data.lighting !== undefined && (
            <div className="flex items-center justify-between gap-3 text-gray-500">
              <span>Lighting:</span>
              <span>{data.lighting.toLocaleString()} kWh</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const EnergyPanel = ({ className = '', moduleId = 'energy' }) => {
  const store = useFacilityStore ? useFacilityStore() : {};
  const activeFacility = store.activeFacility || {
    id: store.facilityType === 'hospital' ? 'kims-hospital' : store.facilityType === 'corporate' ? 'tcs-campus' : 'bput-campus',
    name: store.facilityName || 'Facility',
    type: store.facilityType || 'college'
  };
  const facilityId = activeFacility.id;

  // Filter records by facility_id
  const { data: facilityRecords, loading } = useTelemetry('energy');

  // Aggregate by day to compute 7-day trend and today vs yesterday
  const { dailySummaries, todayMetrics, zoneData } = useMemo(() => {
    const daysMap = new Map();
    const zoneMap = new Map();

    facilityRecords.forEach(r => {
      const date = new Date(r.timestamp);
      const dayKey = isNaN(date.getTime()) ? '2026-09-13' : date.toISOString().slice(0, 10);
      const dayLabel = isNaN(date.getTime()) ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });

      // Daily grouping
      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          date: dayKey,
          label: dayLabel,
          total: 0,
          hvac: 0,
          lighting: 0,
          peak: 0
        });
      }
      const dayEntry = daysMap.get(dayKey);
      const totalKwh = r.kWh_total ?? r.value ?? 0;
      const hvacKwh = r.kWh_HVAC ?? Math.round(totalKwh * 0.55);
      const lightingKwh = r.kWh_lighting ?? Math.round(totalKwh * 0.25);

      dayEntry.total += totalKwh;
      dayEntry.hvac += hvacKwh;
      dayEntry.lighting += lightingKwh;
      if (totalKwh > dayEntry.peak) dayEntry.peak = totalKwh;

      // Zone grouping for the latest readings
      const zid = r.zone_id || 'Main';
      if (!zoneMap.has(zid)) {
        zoneMap.set(zid, { name: zid, kwh: 0, hvac: 0, lighting: 0, count: 0 });
      }
      const zEntry = zoneMap.get(zid);
      zEntry.kwh += totalKwh;
      zEntry.hvac += hvacKwh;
      zEntry.lighting += lightingKwh;
      zEntry.count += 1;
    });

    const sortedDays = Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const today = sortedDays[sortedDays.length - 1] || { total: 14280, hvac: 6840, lighting: 3120, peak: 410 };
    const yesterday = sortedDays[sortedDays.length - 2] || { total: 14850, hvac: 7100, lighting: 3200, peak: 425 };

    const pctChange = yesterday.total > 0
      ? Number((((today.total - yesterday.total) / yesterday.total) * 100).toFixed(1))
      : -3.8;

    // Zone averages / totals
    const zones = Array.from(zoneMap.values()).map(z => ({
      name: z.name,
      kwh: Math.round(z.kwh),
      hvac: Math.round(z.hvac),
      lighting: Math.round(z.lighting)
    })).sort((a, b) => b.kwh - a.kwh);

    return {
      dailySummaries: sortedDays.map(d => ({
        time: d.label,
        total: Math.round(d.total),
        hvac: Math.round(d.hvac),
        lighting: Math.round(d.lighting)
      })),
      todayMetrics: {
        totalKwh: Math.round(today.total),
        hvacKwh: Math.round(today.hvac),
        lightingKwh: Math.round(today.lighting),
        peakDemandKw: Math.round(today.peak || today.total * 0.08),
        pctChangeYesterday: pctChange
      },
      zoneData: zones.length > 0 ? zones : [
        { name: 'Block A', kwh: 680, hvac: 380, lighting: 180 },
        { name: 'Block B', kwh: 750, hvac: 420, lighting: 190 }
      ]
    };
  }, [facilityRecords]);

  const isSaving = todayMetrics.pctChangeYesterday < 0;
  const absChange = Math.abs(todayMetrics.pctChangeYesterday);

  return (
    <PanelWrapper
      title="Energy Usage"
      subtitle={`${activeFacility.name} • Smart Metering & Sub-meters`}
      icon={Zap}
      color="#f59e0b"
      moduleId={moduleId}
      actions={
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            isSaving
              ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}
        >
          {isSaving ? (
            <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {isSaving ? `-${absChange}%` : `+${absChange}%`} vs yesterday
          </span>
        </span>
      }
      className={className}
    >
      <div className="space-y-4">
        {/* ML Anomaly Badge */}
        <AnomalyBadge anomalies={facilityRecords.filter(r => r.anomaly)} />

        {/* 4 StatCards: Total kWh today, HVAC kWh, Lighting kWh, Peak demand */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatCard
            title="Total kWh Today"
            value={todayMetrics.totalKwh.toLocaleString()}
            unit="kWh"
            change={`${isSaving ? '-' : '+'}${absChange}% vs yest`}
            changeType={isSaving ? 'decrease' : 'increase'}
            icon={Zap}
            color="amber"
          />
          <StatCard
            title="HVAC kWh"
            value={todayMetrics.hvacKwh.toLocaleString()}
            unit="kWh"
            subtitle={`${Math.round((todayMetrics.hvacKwh / (todayMetrics.totalKwh || 1)) * 100)}% of load`}
            icon={Flame}
            color="amber"
          />
          <StatCard
            title="Lighting kWh"
            value={todayMetrics.lightingKwh.toLocaleString()}
            unit="kWh"
            subtitle={`${Math.round((todayMetrics.lightingKwh / (todayMetrics.totalKwh || 1)) * 100)}% of load`}
            icon={Sun}
            color="amber"
          />
          <StatCard
            title="Peak Demand"
            value={todayMetrics.peakDemandKw}
            unit="kW"
            subtitle="Contract cap: 500 kW"
            icon={Gauge}
            color={todayMetrics.peakDemandKw > 450 ? 'red' : 'amber'}
          />
        </div>

        {/* BarChart (recharts) showing kWh by zone */}
        <div className="bg-white/60 border border-gray-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Energy Consumption by Zone (kWh)
              </h4>
            </div>
            <span className="text-[11px] text-amber-400/90 font-medium">
              Primary Consumer: {zoneData[0]?.name || 'Academic'}
            </span>
          </div>

          <div className="h-44 sm:h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zoneData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.35} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#9ca3af' }}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#9ca3af' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} />
                <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                  {zoneData.map((entry, index) => {
                    const amberTones = ['#f59e0b', '#fbbf24', '#d97706', '#b45309', '#fcd34d'];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={amberTones[index % amberTones.length]}
                        fillOpacity={0.92}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line chart showing 7-day energy trend + 24h Forecast */}
        <div className="bg-white/60 border border-gray-200 rounded-lg p-3.5">
          <div className="h-48 sm:h-56 w-full">
            <ForecastChart
              data={facilityRecords.filter(r => r.zone_id === (facilityRecords.find(f => f.is_forecast)?.zone_id || zoneData[0]?.name))}
              color="#f59e0b"
              label="Energy"
              unit=" kWh"
              nowTimestamp="2026-09-13T23:59:59Z"
            />
          </div>
        </div>
        
        {/* Assumptions Card */}
        <AssumptionsCard 
          sourceTier="Synthetic IoT Feeds"
          model="Z-score anomaly detection + LinearTrend forecast"
          confidence={0.85}
          assumptions={[
            "Rolling 7-day window mean and standard deviation computed per zone.",
            "Forecast assumes linear trend with hourly seasonality.",
            "Confidence interval set to ±15% of the projected value."
          ]}
        />
      </div>
    </PanelWrapper>
  );
};

export default EnergyPanel;
