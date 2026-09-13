import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Droplets,
  Trash2,
  Wind,
  Award,
  TreeDeciduous,
  Target,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import scorecardData from '../../demo-data/scorecard.json';
import { useFacilityStore } from '../../store/useFacilityStore';
import { StatCard, AlertBadge } from '../common';

const TrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-emerald-200 bg-white p-3.5 shadow-2xl ">
        <p className="text-xs font-semibold text-gray-600">{label} Performance</p>
        <p className="mt-1 text-base font-extrabold text-emerald-700">
          Composite Score: {data.score}/100
        </p>
        <div className="mt-2 space-y-1 text-xs border-t border-gray-200 pt-1.5 text-gray-500">
          <div className="flex justify-between gap-4">
            <span>Energy:</span> <span className="text-gray-900 font-medium">{data.energy}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Water:</span> <span className="text-gray-900 font-medium">{data.water}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Waste:</span> <span className="text-gray-900 font-medium">{data.waste}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Air Quality:</span> <span className="text-gray-900 font-medium">{data.air}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ScorecardPanel = () => {
  const { activeFacility } = useFacilityStore();

  // Filter by facility_id === activeFacility.id with fallback
  const { facilityScorecard, historicalData } = useMemo(() => {
    if (!scorecardData) return { facilityScorecard: {}, historicalData: [] };
    const dataset = Array.isArray(scorecardData) ? scorecardData : Object.values(scorecardData);
    
    // Get all records for this facility
    let facilityRecords = dataset.filter((item) => item.facility_id === (activeFacility?.id || 'bput-campus'));
    if (!facilityRecords.length) facilityRecords = dataset;
    
    // The flat array is usually sorted by time, but let's grab the last item as latest
    const latest = facilityRecords[facilityRecords.length - 1] || {};
    
    // Map to the expected chart format
    const history = facilityRecords.map(r => ({
      month: r.month,
      score: r.score,
      energy: r.energy_score,
      water: r.water_score,
      waste: r.waste_score,
      air: r.air_score
    }));

    return { facilityScorecard: latest, historicalData: history };
  }, [activeFacility?.id]);

  const score = facilityScorecard?.score ?? 75;
  const trend = facilityScorecard?.trend ?? 'improving';
  const trendChange = facilityScorecard?.trend_change ?? '+2 pts';
  const subScores = {
    energy_score: facilityScorecard?.energy_score ?? 80,
    water_score: facilityScorecard?.water_score ?? 72,
    waste_score: facilityScorecard?.waste_score ?? 78,
    air_score: facilityScorecard?.air_score ?? 84,
  };
  const breakdown = facilityScorecard?.breakdown || {};

  // Score color logic: < 50 red, 50-70 amber, > 70 green
  const getScoreColor = (val) => {
    if (val < 50) return '#ef4444';
    if (val <= 70) return '#f59e0b';
    return '#22c55e';
  };

  const scoreColor = getScoreColor(score);

  // Pie chart donut data
  const donutData = [
    { name: 'Achieved', value: score },
    { name: 'Remaining', value: Math.max(0, 100 - score) },
  ];

  const donutColors = [scoreColor, '#e5e7eb'];

  // Sub-score items config
  const subScoreItems = [
    {
      key: 'energy_score',
      label: 'Energy Efficiency',
      value: subScores.energy_score || 0,
      icon: Zap,
      color: '#10b981',
      unit: '/100',
    },
    {
      key: 'water_score',
      label: 'Water Stewardship',
      value: subScores.water_score || 0,
      icon: Droplets,
      color: '#06b6d4',
      unit: '/100',
    },
    {
      key: 'waste_score',
      label: 'Waste Diversion',
      value: subScores.waste_score || 0,
      icon: Trash2,
      color: '#f59e0b',
      unit: '/100',
    },
    {
      key: 'air_score',
      label: 'Air Quality Compliance',
      value: subScores.air_score || 0,
      icon: Wind,
      color: '#8b5cf6',
      unit: '/100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 border border-emerald-200">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Sustainability & ESG Scorecard
              </h2>
              <p className="text-xs text-gray-500">
                Derived composite sustainability index across energy, water, waste & air quality
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
            <Award className="h-3.5 w-3.5 text-emerald-700" />
            Facility: {activeFacility?.name || 'Selected Campus'}
          </span>
          <AlertBadge
            severity={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'critical'}
            text={score >= 70 ? 'Tier-1 High Rating' : score >= 50 ? 'Moderate Compliance' : 'Deficit Alert'}
          />
        </div>
      </div>

      {/* HERO SECTION: Circular Donut Score + Animated Trend + Sub-Scores */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left HERO Donut card */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-xl  lg:col-span-6 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: scoreColor }}
          />

          <div className="w-full flex items-center justify-between border-b border-gray-200 pb-3 mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Composite Index
              </span>
              <h3 className="text-sm font-bold text-gray-900">Overall Sustainability Rating</h3>
            </div>

            {/* Animated Trend Arrow Badge */}
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                trend === 'improving'
                  ? 'border-emerald-200 bg-emerald-500/15 text-emerald-700'
                  : trend === 'declining'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              {trend === 'improving' ? (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                </motion.div>
              ) : trend === 'declining' ? (
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                </motion.div>
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span className="capitalize">{trend} ({trendChange})</span>
            </div>
          </div>

          {/* Donut Container with Big Centered Number */}
          <div className="relative my-2 flex h-52 w-52 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={88}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={donutColors[index % donutColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Big center number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-4xl font-black tracking-tight"
                style={{ color: scoreColor }}
              >
                {score}
              </motion.span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                / 100 PTS
              </span>
              <span className="mt-0.5 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {facilityScorecard?.rating || (score >= 70 ? 'Grade A' : score >= 50 ? 'Grade B' : 'Grade C')}
              </span>
            </div>
          </div>

          {/* Benchmark status footer */}
          <div className="mt-2 w-full flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-200 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> &gt;70 High Green
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> 50-70 Amber
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> &lt;50 Red
            </span>
          </div>
        </div>

        {/* Right sub-scores card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl  lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Core Sustainability Pillars</h3>
                <p className="text-xs text-gray-500">Sub-score breakdown feeding into composite formula</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
            </div>

            {/* Small horizontal bars for sub-scores */}
            <div className="space-y-4">
              {subScoreItems.map((item) => {
                const Icon = item.icon;
                const barColor = getScoreColor(item.value);

                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-md p-1"
                          style={{ backgroundColor: `${item.color}20`, color: item.color }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-gray-800">{item.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-gray-900 text-sm">{item.value}</span>
                        <span className="text-[10px] text-gray-500">{item.unit}</span>
                      </div>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-50/90 border border-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GenAI Recommendation note */}
          {facilityScorecard?.recommendations && facilityScorecard.recommendations.length > 0 && (
            <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-50 p-3 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Recommendation Engine:</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                {facilityScorecard.recommendations[0]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend: recharts AreaChart showing score over 6 months */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 ">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              6-Month Historical Sustainability Performance
            </h3>
            <p className="text-xs text-gray-500">
              Evolution of overall facility score across the past 2 quarters
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Score Index
            </span>
            <span className="text-gray-500">Target: 80+ PTS</span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalData}
              margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scorecardGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.25} vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[50, 100]}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#22c55e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scorecardGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Breakdown Stats: CO2 avoided, water saved, waste diverted */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="CO2 Emissions Avoided"
          value={breakdown.co2_avoided || '48.6 tCO2e'}
          change={breakdown.co2_change || '+12.4%'}
          changeType="positive"
          icon={Leaf}
          color="green"
          subtitle="Net solar offset & HVAC scheduling"
          status="Net Zero Path"
        />

        <StatCard
          title="Water Conserved"
          value={breakdown.water_saved || '214,800 L'}
          change={breakdown.water_change || '+8.1%'}
          changeType="positive"
          icon={Droplets}
          color="green"
          subtitle="Recycled via graywater filtration"
        />

        <StatCard
          title="Waste Diverted from Landfill"
          value={breakdown.waste_diverted || '82.4%'}
          change={breakdown.waste_diverted_tonnage || '18.2 Tons'}
          changeType="positive"
          icon={Trash2}
          color="green"
          subtitle="Recycled, composted & segregated"
        />

        <StatCard
          title="Renewable Power Share"
          value={breakdown.renewable_energy_share || '34.5%'}
          change={breakdown.tree_equivalent || '1,240 Trees'}
          changeType="positive"
          icon={TreeDeciduous}
          color="green"
          subtitle="Equivalent carbon capture"
          status="Verified"
        />
      </div>
    </div>
  );
};

export default ScorecardPanel;
