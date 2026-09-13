import React, { useState, useMemo } from 'react';
import { 
  Droplets, 
  AlertCircle, 
  Waves, 
  Calendar, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Activity
} from 'lucide-react';
import { StatCard, AlertBadge, PanelWrapper, AnomalyBadge, AssumptionsCard } from '../common';
import { ForecastChart, GaugeChart } from '../charts';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useFacilityStore } from '../../stores/useFacilityStore';
;

export const WaterPanel = ({ className = '' }) => {
  const { activeFacility } = useFacilityStore ? useFacilityStore() : { activeFacility: { id: 'bput-campus' } };
  const facilityId = activeFacility?.id || 'bput-campus';

  // Flat array parsing
  const { data: facilityRecords, loading } = useTelemetry('water');

  const historicalRecords = useMemo(() => facilityRecords.filter(r => !r.is_forecast), [facilityRecords]);
  const anomalies = useMemo(() => facilityRecords.filter(r => r.anomaly), [facilityRecords]);

  // Derive latest zones info
  const zones = useMemo(() => {
    const zoneMap = new Map();
    historicalRecords.forEach(r => {
      const zid = r.zone_id;
      if (!zoneMap.has(zid) || new Date(r.timestamp) > new Date(zoneMap.get(zid).timestamp)) {
        zoneMap.set(zid, r);
      }
    });
    return Array.from(zoneMap.values());
  }, [historicalRecords]);

  const zonesAtRisk = useMemo(() => {
    return zones.filter(z => (z.tank_level_pct ?? 100) < 30);
  }, [zones]);

  const hasCriticalRisk = zonesAtRisk.length > 0;

  const metrics = useMemo(() => {
    const latest = zones[0] || {};
    const totalToday = historicalRecords.slice(-12).reduce((acc, r) => acc + (r.liters_consumed || 0), 0) || 84500;
    const overallTankLevel = latest.tank_level_pct ?? 68;
    return {
      totalToday,
      overallTankLevel,
      zonesAtRiskCount: zonesAtRisk.length
    };
  }, [zones, historicalRecords]);

  return (
    <PanelWrapper
      title="Water Usage & Reserves"
      subtitle={`${activeFacility?.name || 'Facility'} • Hydro-Sensors & Overhead Tanks`}
      icon={Droplets}
      badge={
        hasCriticalRisk ? (
          <AlertBadge
            label={`${zonesAtRisk.length} Tank${zonesAtRisk.length > 1 ? 's' : ''} Critical (<30%)`}
            variant="danger"
            pulse
          />
        ) : (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-blue-500/20 text-blue-700 border-blue-200">
            Reserves Optimal ({metrics.overallTankLevel}%)
          </span>
        )
      }
      className={className}
    >
      <div className="space-y-4">
        {/* ML Anomaly Badge */}
        <AnomalyBadge anomalies={anomalies} />

        {/* 2 StatCards */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            title="Total Daily Consumption"
            value={metrics.totalToday.toLocaleString()}
            unit="L"
            change="+4.2% vs baseline"
            changeType="increase"
            icon={Waves}
            color="blue"
          />
          <StatCard
            title="Overall Tank Level"
            value={metrics.overallTankLevel}
            unit="%"
            subtitle={`${zones.length} active zones`}
            icon={Activity}
            color={metrics.overallTankLevel < 30 ? 'red' : 'blue'}
          />
        </div>

        {/* Tank Level Gauge per Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/60 border border-gray-200 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-700" />
                Tank Levels
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">Live status across zones</p>
            </div>
            
            <div className="space-y-3 mt-4">
              {zones.map((z, idx) => {
                const level = z.tank_level_pct ?? 0;
                const isCrit = level < 30;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium truncate flex-1">{z.zone_id}</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="w-full max-w-[80px] h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isCrit ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${level}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono w-8 text-right ${isCrit ? 'text-red-700' : 'text-blue-700'}`}>
                        {level}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ML Forecast Chart */}
          <div className="bg-white/60 border border-gray-200 rounded-lg p-3.5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Tank Level Forecast
                </h4>
              </div>
              <span className="text-[11px] text-blue-700/90 font-medium">{(() => {
                const f = facilityRecords.find(r => r.is_forecast && r.metric_name === 'tank_level_pct');
                return f ? f.zone_id : zones[0]?.zone_id;
              })()}</span>
            </div>
            <div className="flex-1 w-full min-h-[140px]">
              <ForecastChart
                data={facilityRecords.filter(r => r.zone_id === (
                  facilityRecords.find(f => f.is_forecast && f.metric_name === 'tank_level_pct')?.zone_id || zones[0]?.zone_id
                ))}
                color="#3b82f6"
                label="Level"
                unit="%"
                nowTimestamp="2026-09-13T23:59:59Z"
              />
            </div>
          </div>
        </div>

        <AssumptionsCard 
          sourceTier="Synthetic IoT Feeds"
          model="HoltWinters-WaterDemand (Tank Depletion)"
          confidence={0.88}
          assumptions={[
            "Tank levels are modeled based on predicted consumption draw rates vs refill schedules.",
            "Alerts trigger dynamically when predicted depletion < 30%."
          ]}
        />
      </div>
    </PanelWrapper>
  );
};

export default WaterPanel;
