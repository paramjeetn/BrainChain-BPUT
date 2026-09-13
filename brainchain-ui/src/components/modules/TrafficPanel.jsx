import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Clock,
  AlertTriangle,
  Zap,
  Layers,
  CheckCircle,
  Filter,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import trafficData from '../../demo-data/traffic.json';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useFacilityStore } from '../../store/useFacilityStore';
import { StatCard, AlertBadge } from '../common';
import { TrendChart } from '../charts';

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-purple-500/30 bg-white p-3 shadow-xl ">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-purple-300">
          {payload[0].value}% Occupancy
        </p>
        {payload[0].payload.vehicles && (
          <p className="text-xs text-gray-500">
            Est. Vehicles: <span className="text-gray-900 font-medium">{payload[0].payload.vehicles}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const TrafficPanel = () => {
  const { activeFacility } = useFacilityStore();
  const [spotFilter, setSpotFilter] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Filter traffic dataset by activeFacility.id with fallback
  const facilityTraffic = useMemo(() => {
    if (!trafficData) return {};
    const dataset = Array.isArray(trafficData) ? trafficData : Object.values(trafficData);
    let facilityRecords = dataset.filter((item) => item.facility_id === (activeFacility?.id || 'bput-campus'));
    if (!facilityRecords.length) facilityRecords = dataset;

    // Grab the latest record
    const latest = facilityRecords[facilityRecords.length - 1] || {};

    // Get time series for the chart (filter for vehicle_count metric to avoid duplicates)
    const history = facilityRecords
      .filter(r => r.metric_name === 'vehicle_count' || r.vehicle_count !== undefined)
      .map(r => ({
        timestamp: r.timestamp,
        timeLabel: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: r.occupancy_pct ?? r.value,
        vehicles: r.vehicle_count
      }));

    return { latest, history };
  }, [activeFacility?.id]);

  const currentOccupancy = facilityTraffic.latest?.occupancy_pct ?? 45;
  const vehicleCount = facilityTraffic.latest?.vehicle_count ?? 120;
  const totalCapacity = 400; // Hardcoded fallback capacity
  const peakHour = facilityTraffic.latest?.peak_hour ?? '10:00 AM - 12:00 PM';
  const isHighOccupancy = currentOccupancy > 85;

  // Dynamically generate spots matrix based on current occupancy
  const spots = useMemo(() => {
    const generated = [];
    for (let i = 0; i < totalCapacity; i++) {
      generated.push({
        id: `spot-${i + 1}`,
        label: `B${i + 1}`,
        occupied: i < vehicleCount, // fill first N spots to match count
        type: i % 15 === 0 ? 'ev' : 'standard' // sprinkle some EV spots
      });
    }
    // Simple shuffle for realistic scattered look
    return generated.sort(() => Math.random() - 0.5);
  }, [vehicleCount, totalCapacity]);
  const filteredSpots = useMemo(() => {
    if (spotFilter === 'all') return spots;
    if (spotFilter === 'occupied') return spots.filter((s) => s.occupied);
    if (spotFilter === 'empty') return spots.filter((s) => !s.occupied);
    if (spotFilter === 'ev') return spots.filter((s) => s.type?.toLowerCase().includes('ev'));
    return spots;
  }, [spots, spotFilter]);

  const occupiedSpotsCount = spots.filter((s) => s.occupied).length;
  const emptySpotsCount = spots.length - occupiedSpotsCount;

  return (
    <div className="space-y-6">
      {/* Header section with status badges */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Traffic & Parking Intelligence
              </h2>
              <p className="text-xs text-gray-500">
                Live gate telemetry, parking zone bay analytics & congestion forecasting
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300">
            <Radio className="h-3.5 w-3.5 animate-pulse text-purple-400" />
            Active Facility: {activeFacility?.name || 'Selected Campus'}
          </span>
          {isHighOccupancy ? (
            <AlertBadge severity="critical" pulse text="Capacity Alert > 85%" />
          ) : (
            <AlertBadge severity="success" text="Normal Flow" />
          )}
        </div>
      </div>

      {/* Critical Occupancy Alert Banner if > 85% */}
      <AnimatePresence>
        {isHighOccupancy && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/50 via-rose-900/30 to-purple-950/40 p-4 shadow-lg shadow-rose-950/20 "
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-rose-200">
                  Critical Congestion Warning — Occupancy at {currentOccupancy}%
                </h4>
                <AlertBadge severity="high" size="sm" text="Threshold Exceeded" />
              </div>
              <p className="mt-1 text-xs text-rose-300/90 leading-relaxed">
                Occupancy has surpassed the safe threshold of 85% ({vehicleCount} of {totalCapacity} vehicle capacity taken). Dynamic digital signage at Campus Gates 1 & 3 has been advised to route inbound traffic to the South Auxiliary Overflow Parking Lot.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* StatCards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Occupancy"
          value={`${currentOccupancy}%`}
          change={currentOccupancy > 80 ? '+8.4% vs avg' : '+2.1%'}
          changeType={currentOccupancy > 85 ? 'negative' : 'neutral'}
          icon={Car}
          color="purple"
          subtitle={`${vehicleCount} / ${totalCapacity} spots active`}
          status={isHighOccupancy ? 'Heavy Load' : 'Optimal'}
        />

        <StatCard
          title="Active Vehicle Count"
          value={vehicleCount}
          unit="vehicles"
          change="+42 last hour"
          changeType="increase"
          icon={Layers}
          color="purple"
          subtitle="Monitored across 4 access gates"
        />

        <StatCard
          title="Peak Hour Today"
          value={peakHour}
          icon={Clock}
          color="purple"
          subtitle={`Peak expected at ${facilityTraffic?.peak_occupancy_pct || 92}%`}
        />

        <StatCard
          title="Available Capacity"
          value={Math.max(0, totalCapacity - vehicleCount)}
          unit="free bays"
          icon={Zap}
          color={isHighOccupancy ? 'amber' : 'purple'}
          subtitle="12 EV fast charging bays"
          status="Gate 2 Open"
        />
      </div>

      {/* Main Visuals Grid: Parking Spots Visualizer + Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Parking Bay Visualization (Occupancy Grid) */}
        <div className="rounded-xl border border-gray-200 bg-white/70 p-5  lg:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Parking Spot Occupancy Matrix
                </h3>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-medium text-purple-300">
                  Live Sensor Grid
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time ultrasonic IoT bay sensors ({occupiedSpotsCount} filled, {emptySpotsCount} vacant)
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1 border border-gray-200/60">
              <button
                onClick={() => setSpotFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  spotFilter === 'all'
                    ? 'bg-purple-600 text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All ({spots.length})
              </button>
              <button
                onClick={() => setSpotFilter('occupied')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  spotFilter === 'occupied'
                    ? 'bg-amber-500 text-gray-950 font-semibold shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Filled ({occupiedSpotsCount})
              </button>
              <button
                onClick={() => setSpotFilter('empty')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  spotFilter === 'empty'
                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Empty ({emptySpotsCount})
              </button>
            </div>
          </div>

          {/* Grid of colored squares (filled=amber, empty=gray) */}
          <div className="mt-5">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2.5 max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-700">
              {filteredSpots.map((spot) => {
                const isOccupied = spot.occupied;
                return (
                  <motion.button
                    key={spot.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSpot(spot)}
                    className={`group relative flex h-10 w-full flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition-all duration-200 ${
                      isOccupied
                        ? 'border-amber-400/50 bg-amber-500 text-gray-950 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:border-amber-300'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-purple-500/60 hover:text-purple-300'
                    }`}
                    title={`Spot ${spot.number} (${spot.type}) - ${isOccupied ? 'Occupied' : 'Vacant'}`}
                  >
                    <span>{spot.number}</span>
                    {spot.type === 'EV Charging' && (
                      <span className="text-[9px] font-mono text-purple-950/80 leading-none">EV</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Grid Legend & Status Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-amber-500 border border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <span className="text-gray-600">Filled Bay (Amber)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-gray-50 border border-gray-200" />
                  <span className="text-gray-500">Empty Bay (Gray)</span>
                </div>
              </div>

              {selectedSpot ? (
                <div className="flex items-center gap-2 text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                  <span className="font-semibold">Bay #{selectedSpot.number}:</span>
                  <span>{selectedSpot.occupied ? 'Occupied' : 'Vacant'}</span>
                  <span className="text-gray-500">({selectedSpot.zone})</span>
                </div>
              ) : (
                <span className="text-gray-500 italic">Click any bay for telemetry detail</span>
              )}
            </div>
          </div>
        </div>

        {/* Time of Day Pattern Bar Chart */}
        <div className="rounded-xl border border-gray-200 bg-white/70 p-5  lg:col-span-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Time-of-Day Congestion Profile</h3>
            <p className="text-xs text-gray-500">Typical occupancy shifts across shift schedules</p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={facilityTraffic?.time_of_day_patterns || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.25} vertical={false} />
                <XAxis
                  dataKey="slot"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="avg_occupancy" radius={[4, 4, 0, 0]}>
                  {(facilityTraffic?.time_of_day_patterns || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.avg_occupancy > 85 ? '#f59e0b' : '#8b5cf6'}
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-200">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Standard Load (&lt;85%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Peak Congestion (&ge;85%)
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Trend Line Chart */}
      <div>
        <TrendChart
          data={facilityTraffic.history}
          dataKey="value"
          xKey="timeLabel"
          title="Hourly Parking Occupancy Trend (Today)"
          color="#8b5cf6"
          unit="%"
          height={240}
          type="line"
          referenceLine={85}
          referenceLabel="85% High Threshold"
        />
      </div>

      {/* Zone / Lot Breakdown Cards */}
      {facilityTraffic?.lots && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facilityTraffic.lots.map((lot, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-3.5 "
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-gray-800">{lot.name}</span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    lot.occupancy_pct > 85
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}
                >
                  {lot.occupancy_pct}%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-50">
                <div
                  className={`h-full transition-all duration-500 ${
                    lot.occupancy_pct > 85 ? 'bg-amber-400' : 'bg-purple-500'
                  }`}
                  style={{ width: `${lot.occupancy_pct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-gray-500">
                <span>{lot.occupied} occupied</span>
                <span>{lot.capacity} capacity</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrafficPanel;
