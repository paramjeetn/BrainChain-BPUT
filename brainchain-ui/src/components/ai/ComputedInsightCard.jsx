import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Info,
  Leaf,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingEffect } from '../../hooks/useTypingEffect';

/**
 * ComputedInsightCard
 * 
 * Renders an AI-computed recommendation or anomaly event conforming to the
 * structured insights schema with real-time character typing reveal, severity badges,
 * confidence telemetry indicator, and animated interactive action dispatch.
 * 
 * @param {Object} insight - Insight payload object
 * @param {string} insight.id - Unique identifier
 * @param {string} insight.text - Core insight description/findings
 * @param {string} insight.module - Target module (e.g. 'energy', 'water', 'air_quality')
 * @param {string} insight.severity - Urgency tier: 'high' | 'medium' | 'info' | 'low'
 * @param {string} insight.action - Prescribed remediation or operational recommendation
 * @param {number} insight.confidence - Model confidence score (0-1 or 0-100)
 * @param {string} insight.model_basis - Underlying model provenance (e.g. 'Z-score + linear forecast')
 * @param {number} index - Index for staggered entrance motion
 * @param {string} _role - Active user role view (admin / ops / sustainability)
 */
export function ComputedInsightCard({ insight, index = 0, role: _role }) {
  const [actionDispatched, setActionDispatched] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Normalize insight fields with robust fallbacks
  const isStringInsight = typeof insight === 'string';
  const text = isStringInsight
    ? insight
    : (insight?.text || insight?.insight || insight?.description || '');
  const rawSeverity = (!isStringInsight && insight?.severity) ? String(insight.severity).toLowerCase() : 'medium';
  const moduleName = (!isStringInsight && insight?.module) ? insight.module : 'system';
  const actionText = (!isStringInsight && (insight?.action || insight?.actionText))
    ? (insight.action || insight.actionText)
    : 'Schedule HVAC audit for Block B';
  const rawConfidence = (!isStringInsight && insight?.confidence !== undefined) ? insight.confidence : 0.87;
  const confidencePct = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);
  const modelBasis = (!isStringInsight && (insight?.model_basis || insight?.modelBasis))
    ? (insight.model_basis || insight.modelBasis)
    : 'Z-score + linear forecast';

  // Severity style configuration
  const severityConfigs = {
    high: {
      label: 'High',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50 border-red-200 shadow-sm',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      cardBorder: 'border-red-200 hover:border-red-300',
      topGlow: 'from-transparent via-red-500/20 to-transparent',
    },
    medium: {
      label: 'Medium',
      icon: TrendingUp,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50 border-amber-200 shadow-sm',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      cardBorder: 'border-amber-200 hover:border-amber-300',
      topGlow: 'from-transparent via-amber-500/20 to-transparent',
    },
    info: {
      label: 'Info',
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200 shadow-sm',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      cardBorder: 'border-blue-200 hover:border-blue-300',
      topGlow: 'from-transparent via-blue-500/20 to-transparent',
    },
    low: {
      label: 'Low',
      icon: Leaf,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200 shadow-sm',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cardBorder: 'border-emerald-200 hover:border-emerald-300',
      topGlow: 'from-transparent via-emerald-500/20 to-transparent',
    },
  };

  const currentSeverity = severityConfigs[rawSeverity] || severityConfigs.medium;
  const SeverityIcon = currentSeverity.icon;
  const isHighSeverity = rawSeverity === 'high';

  // Real-time character typewriter reveal
  const displayedText = useTypingEffect(text, 14);
  const isTyping = displayedText.length < text.length;

  // Handle "Take Action" click
  const handleTakeAction = () => {
    setActionDispatched(true);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index || 0) * 0.08, ease: 'easeOut' }}
      className={`group relative bg-white border ${currentSeverity.cardBorder} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
    >
      {/* Subtle top edge severity glow line */}
      <div
        className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r ${currentSeverity.topGlow} pointer-events-none`}
      />

      {/* Main Row: Icon on Left, Text in Middle */}
      <div className="flex items-start gap-3.5">
        {/* Left: Severity-colored icon container */}
        <div className="relative shrink-0 mt-0.5">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: 'easeInOut',
            }}
            className={`w-9 h-9 rounded-xl border ${currentSeverity.iconBg} flex items-center justify-center shadow-md`}
          >
            <SeverityIcon className={`w-4 h-4 ${currentSeverity.iconColor}`} />
          </motion.div>
        </div>

        {/* Main: Insight text with typewriter reveal */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 text-sm leading-relaxed tracking-normal font-normal select-text">
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 align-middle rounded-sm"
              />
            )}
          </p>
        </div>
      </div>

      {/* Action Feedback Toast / Popover */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mt-3 p-2.5 bg-emerald-50/95 border border-emerald-500/60 rounded-lg flex items-center gap-2.5 text-xs text-emerald-200 shadow-xl "
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400/80 flex items-center justify-center text-emerald-600 shrink-0"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            </motion.div>
            <div className="flex-1 min-w-0 truncate">
              <span className="font-semibold text-emerald-600">Action: </span>
              <span className="text-emerald-100">{actionText}</span>
            </div>
            <span className="text-[10px] text-emerald-700/90 font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/50 shrink-0">
              Dispatched
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div className="mt-3.5 pt-3 border-t border-gray-200 flex items-center justify-between gap-2.5 flex-wrap">
        {/* Left: Module Badge + Severity Badge */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-50/90 border border-gray-200 text-gray-700">
            {moduleName}
          </span>
          <span
            className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${currentSeverity.badgeClass}`}
          >
            {currentSeverity.label}
          </span>
        </div>

        {/* Center: Model provenance in gray mono */}
        <div className="hidden sm:flex items-center">
          <span className="text-[11px] text-gray-500 font-mono truncate max-w-[190px]" title={`Model: ${modelBasis}`}>
            Model: {modelBasis}
          </span>
        </div>

        {/* Right: Confidence bar + percentage + Green "Take Action" Button */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Confidence Indicator */}
          <div className="flex items-center gap-1.5" title={`Model confidence: ${confidencePct}%`}>
            <div className="w-10 bg-gray-50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-medium">
              {confidencePct}%
            </span>
          </div>

          {/* Green "Take Action" Button */}
          <button
            type="button"
            onClick={handleTakeAction}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
              actionDispatched
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                : isHighSeverity 
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 active:scale-95'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-700 active:scale-95'
            }`}
          >
            {actionDispatched ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Actioned</span>
              </>
            ) : (
              <>
                <span>Take Action</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-700/80 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ComputedInsightCard;
