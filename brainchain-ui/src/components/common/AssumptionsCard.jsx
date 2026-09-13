import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Database, Cpu, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AssumptionsCard
 * 
 * Collapsible data transparency and model provenance card placed at the bottom
 * of module panels to clarify telemetry tier, algorithmic assumptions, and confidence.
 * 
 * @param {string} sourceTier - Data origin tier: 'Real (CPCB Public Data)' | 'Synthetic IoT Feeds' | 'Manual Logged Data' | 'Derived ESG Engine'
 * @param {string} model - Forecast or anomaly model name: 'Z-score anomaly detection' | 'LinearTrend+Seasonality forecast' | 'Cross-module aggregation'
 * @param {number} confidence - Model confidence score (0 to 1 or 0 to 100)
 * @param {string} disclaimer - Optional disclaimer text override
 * @param {Array<string>} assumptions - Bulleted list of underlying mathematical/system assumptions
 * @param {string} className - Optional styling class
 */
export function AssumptionsCard({
  sourceTier = 'Synthetic IoT Feeds',
  model = 'Z-score anomaly detection',
  confidence = 0.85,
  disclaimer = 'This is a decision-support tool, not an official measurement. Validate with on-ground inspection.',
  assumptions = [],
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize confidence percentage
  const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  // Friendly short-tier label for collapsed summary
  const getShortTier = (tier) => {
    if (!tier) return 'Synthetic IoT';
    if (tier.includes('CPCB')) return 'Real CPCB';
    if (tier.includes('Synthetic')) return 'Synthetic IoT';
    if (tier.includes('Manual')) return 'Manual Logged';
    if (tier.includes('Derived')) return 'Derived ESG';
    return tier;
  };

  // Friendly short-model label for collapsed summary
  const getShortModel = (m) => {
    if (!m) return 'Z-score detection';
    if (m.includes('Z-score')) return 'Z-score detection';
    if (m.includes('LinearTrend')) return 'LinearTrend forecast';
    if (m.includes('Cross-module')) return 'Cross-module aggregation';
    return m;
  };

  // Source tier badge styling configuration
  const getTierBadgeStyle = (tier) => {
    if (tier.includes('Real') || tier.includes('CPCB')) {
      return 'bg-emerald-50/70 border-emerald-700/50 text-emerald-600';
    }
    if (tier.includes('Synthetic')) {
      return 'bg-blue-50/70 border-blue-700/50 text-blue-600';
    }
    if (tier.includes('Manual')) {
      return 'bg-amber-50/70 border-amber-700/50 text-amber-300';
    }
    return 'bg-teal-50/70 border-teal-700/50 text-teal-300';
  };

  // Default assumption bullets if none provided
  const resolvedAssumptions = assumptions && assumptions.length > 0
    ? assumptions
    : [
        'Rolling 7-day diurnal baseline window with dynamic outlier attenuation.',
        'Temporal telemetry sampled at continuous intervals; missing windows interpolated linearly.',
        'Anomalies flagged beyond ±2.0σ standard deviations from seasonal zone mean.',
      ];

  const shortTier = getShortTier(sourceTier);
  const shortModel = getShortModel(model);

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Collapsed Info Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200/60 text-gray-500 text-xs hover:bg-white/70 hover:border-gray-200/60 hover:text-gray-600 transition-all duration-200 cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <Info className="w-3.5 h-3.5 text-emerald-700/80 shrink-0" />
          <span className="truncate font-mono text-[11px] text-gray-500">
            ℹ {shortTier} · {shortModel} · {confidencePct}% confidence
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-gray-500 hover:text-gray-600">
          <span className="text-[10px] uppercase font-semibold tracking-wider">
            {isExpanded ? 'Hide' : 'Transparency'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Breakdown Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden w-full mt-2"
          >
            <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 text-xs text-gray-500 space-y-3 shadow-xl ">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">
                    Data Transparency & Engine Assumptions
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  Audit Protocol v2.4
                </span>
              </div>

              {/* Grid: Source Tier + Forecast Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Data Source */}
                <div className="p-2 rounded-lg bg-gray-50/60 border border-gray-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    <Database className="w-3 h-3 text-gray-500" />
                    <span>Data Source</span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${getTierBadgeStyle(
                        sourceTier
                      )}`}
                    >
                      {sourceTier}
                    </span>
                  </div>
                </div>

                {/* Forecast / Detection Model */}
                <div className="p-2 rounded-lg bg-gray-50/60 border border-gray-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    <Cpu className="w-3 h-3 text-gray-500" />
                    <span>Forecast Model</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-gray-200/70 text-gray-800 text-[11px] font-mono">
                      {model}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Level with Progress Bar */}
              <div className="p-2.5 rounded-lg bg-gray-50/60 border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Confidence Level</span>
                  <span className="text-emerald-700 font-mono font-bold text-xs">
                    {confidencePct}%
                  </span>
                </div>
                <div className="w-full bg-gray-50/90 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  />
                </div>
              </div>

              {/* Key Assumptions List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Key Assumptions
                </span>
                <ul className="space-y-1.5 text-xs text-gray-500">
                  {resolvedAssumptions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 mt-0.5 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="pt-2 border-t border-gray-200 flex items-start gap-2 text-[11px] text-gray-500 italic">
                <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {disclaimer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AssumptionsCard;
