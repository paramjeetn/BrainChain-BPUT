import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Layers, Building2, SlidersHorizontal, Info, Brain,
} from 'lucide-react';
import { useFacilityStore } from '../../store/useFacilityStore';
import insightsData from '../../demo-data/insights.json';
import { ComputedInsightCard } from './ComputedInsightCard';
import { ScenarioSlider } from './ScenarioSlider';

const FACILITY_ID_MAP = {
  college:   'bput-campus',
  hospital:  'kims-hospital',
  corporate: 'tcs-campus',
};

export function AIInsightPanel() {
  const activeFacility = useFacilityStore((s) => s.activeFacility);

  // Resolve facility identity robustly
  const facilityId = useMemo(() => {
    const raw = typeof activeFacility === 'object' ? activeFacility?.id : activeFacility;
    return FACILITY_ID_MAP[raw] || raw || 'bput-campus';
  }, [activeFacility]);

  const facilityName = useMemo(() => {
    if (typeof activeFacility === 'object' && activeFacility?.name) return activeFacility.name;
    const mapped = FACILITY_ID_MAP[activeFacility];
    if (mapped === 'bput-campus') return 'BPUT Engineering Campus';
    if (mapped === 'kims-hospital') return 'Apollo - KIMS Hospital';
    if (mapped === 'tcs-campus') return 'TCS Infopark';
    return 'Your Facility';
  }, [activeFacility]);

  // Flatten insights.json (nested: { facilityId: { role: [items] } })
  const allInsights = useMemo(() => {
    if (Array.isArray(insightsData)) return insightsData;
    const flattened = [];
    if (insightsData && typeof insightsData === 'object') {
      Object.entries(insightsData).forEach(([facKey, rolesMap]) => {
        if (rolesMap && typeof rolesMap === 'object') {
          Object.entries(rolesMap).forEach(([roleKey, items]) => {
            if (Array.isArray(items)) {
              items.forEach((item, idx) => {
                if (item && typeof item === 'object') {
                  flattened.push({
                    ...item,
                    id: item.id || `${facKey}-${roleKey}-${idx}`,
                    facilityId: facKey,
                    role: item.role || roleKey,
                  });
                }
              });
            }
          });
        }
      });
    }
    return flattened;
  }, []);

  // Filter: show ALL role insights for the active facility (no role gate)
  const displayedInsights = useMemo(() => {
    const matched = allInsights.filter(item =>
      !item.facilityId ||
      item.facilityId === 'all' ||
      item.facilityId === facilityId
    );
    // If nothing matched, fall back to bput-campus data as demo content
    if (matched.length === 0) {
      return allInsights.filter(i => i.facilityId === 'bput-campus').slice(0, 5);
    }
    return matched;
  }, [allInsights, facilityId]);

  return (
    <aside className="w-full max-w-full shrink-0 bg-white border border-gray-200 rounded-2xl h-full flex flex-col overflow-hidden text-gray-900 select-none shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 md:p-5 pb-3 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">AI Recommendations</h2>
              <p className="text-[11px] text-gray-400">Cognitive decision support engine</p>
            </div>
          </div>

          {/* Facility tag — shows correct name */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-medium max-w-[160px]"
            title={facilityName}
          >
            <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{facilityName}</span>
          </div>
        </div>
      </div>

      {/* ML model metadata strip */}
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/40 border-b border-emerald-100 shrink-0">
        <Brain className="w-3.5 h-3.5 text-emerald-700" />
        <span className="text-[11px] text-emerald-700 font-mono">Z-score anomaly · LinearTrend+Seasonality forecast</span>
        <span className="ml-auto text-[11px] text-gray-400">Avg 88% confidence</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 custom-scrollbar">

        {/* Insights Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Active Recommendations ({displayedInsights.length})
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Live IoT Stream</span>
          </div>

          <AnimatePresence mode="popLayout">
            {displayedInsights.length > 0 ? (
              displayedInsights.map((insight, idx) => (
                <ComputedInsightCard
                  key={insight.id}
                  insight={insight}
                  index={idx}
                  role="admin"
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-2"
              >
                <Info className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500">No anomalies detected. All systems nominal.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scenario Simulator */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-3">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Facility Stress Testing
            </span>
          </div>
          <ScenarioSlider />
        </div>
      </div>
    </aside>
  );
}

export default AIInsightPanel;
