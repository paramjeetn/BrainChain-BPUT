import React, { useState, useMemo } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';

/**
 * Format timestamp safely with date-fns
 */
const formatAnomalyTime = (ts) => {
  if (!ts) return '';
  try {
    let date;
    if (ts instanceof Date) {
      date = ts;
    } else if (typeof ts === 'string') {
      date = parseISO(ts);
      if (!isValid(date)) {
        date = new Date(ts);
      }
    } else if (typeof ts === 'number') {
      date = new Date(ts < 10000000000 ? ts * 1000 : ts);
    }
    if (date && isValid(date)) {
      return format(date, 'MMM dd, HH:mm');
    }
    return String(ts);
  } catch {
    return String(ts);
  }
};

/**
 * AnomalyBadge
 * 
 * Collapsible notification badge and drawer displaying detected statistical anomalies.
 * 
 * @param {Array} anomalies - Array of anomaly records from module data
 * @param {string} className - Optional container styling overrides
 */
export function AnomalyBadge({ anomalies = [], className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter valid anomaly entries (support raw telemetry records with anomaly=true or anomaly items)
  const anomalyList = useMemo(() => {
    if (!Array.isArray(anomalies)) return [];
    return anomalies.filter((item) => {
      if (!item) return false;
      // If flag is explicitly false, skip
      if (item.anomaly === false) return false;
      // Match anomaly flag, high anomaly score, or present anomaly reason
      return (
        item.anomaly === true ||
        (typeof item.anomaly_score === 'number' && item.anomaly_score > 0) ||
        Boolean(item.anomaly_reason)
      );
    });
  }, [anomalies]);

  const count = anomalyList.length;

  // Do not render anything if no anomalies are detected
  if (count === 0) {
    return null;
  }

  return (
    <div className={`relative inline-block w-full max-w-full ${className}`}>
      {/* Collapsed Pill Button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50/60 border border-red-200 text-red-700 hover:bg-red-900/60 hover:border-red-600/80 transition-all duration-200 cursor-pointer shadow-sm select-none"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
        <span>
          {count} {count === 1 ? 'anomaly' : 'anomalies'} detected
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-red-700/80 shrink-0 ml-0.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-red-700/80 shrink-0 ml-0.5" />
        )}
      </button>

      {/* Expanded Breakdown Card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden w-full mt-2"
          >
            <div className="bg-red-50/40 border border-red-200 rounded-xl p-3.5 shadow-xl  space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-900/40 pb-2 text-[11px]">
                <span className="font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                  Telemetry Deviations ({count})
                </span>
                <span className="text-red-700/70 font-mono text-[10px]">
                  Z-Score Threshold &gt; 2.0&sigma;
                </span>
              </div>

              {/* Anomaly Records List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-900/50 scrollbar-track-transparent">
                {anomalyList.map((anomaly, idx) => {
                  const timestampStr = formatAnomalyTime(anomaly.timestamp || anomaly.time || anomaly.date);
                  const zone = anomaly.zone_id || anomaly.zone || anomaly.location || 'Zone Baseline';
                  const score = anomaly.anomaly_score !== undefined && anomaly.anomaly_score !== null
                    ? `${Number(anomaly.anomaly_score).toFixed(2)}σ`
                    : '> 2.0σ';
                  const reason = anomaly.anomaly_reason ||
                    anomaly.reason ||
                    anomaly.description ||
                    `Statistical anomaly logged exceeding threshold in ${zone}`;

                  return (
                    <div
                      key={anomaly.id || idx}
                      className="p-2.5 rounded-lg bg-red-50/50 border border-red-800/40 space-y-1.5 text-xs transition-colors hover:bg-red-50/70"
                    >
                      {/* Top row: Zone + Sigma Score */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-700 shrink-0" />
                          <span className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700/40 text-[11px] font-mono font-medium">
                            {zone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600 font-mono font-bold text-xs">
                          <Activity className="w-3 h-3 text-red-700 shrink-0" />
                          <span>{score}</span>
                        </div>
                      </div>

                      {/* Reason Description */}
                      <p className="text-gray-500 text-xs leading-relaxed font-normal">
                        {reason}
                      </p>

                      {/* Timestamp Footer */}
                      {timestampStr && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono pt-0.5">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{timestampStr}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnomalyBadge;
