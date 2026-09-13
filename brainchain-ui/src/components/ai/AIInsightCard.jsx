import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, CheckCircle2, ShieldCheck, Wrench, Leaf, Zap } from 'lucide-react';
import { useTypingEffect } from '../../hooks/useTypingEffect';

/**
 * AIInsightCard
 * 
 * Recommendation card presenting an AI-generated insight with animated icons,
 * role badges, character-by-character typing reveal, and action trigger.
 * 
 * @param {string|object} insight - Insight text or object containing insight details
 * @param {number} index - Index for staggered framer-motion entrance
 * @param {string} role - Target role: 'admin' | 'ops' | 'sustainability'
 */
export function AIInsightCard({ insight, index = 0, role }) {
  const [actionTaken, setActionTaken] = useState(false);

  // Normalize insight text and role whether insight is passed as a string or object
  const insightText = typeof insight === 'string'
    ? insight
    : (insight?.insight || insight?.text || insight?.description || '');

  const activeRole = (role || (typeof insight === 'object' ? insight?.role : '') || 'admin').toLowerCase();
  const category = typeof insight === 'object' ? insight?.category : null;
  const impact = typeof insight === 'object' ? insight?.impact : null;
  const actionLabel = typeof insight === 'object' && insight?.actionText ? insight.actionText : 'Take Action';

  // Typing effect animation
  const displayedText = useTypingEffect(insightText, 14);
  const isTyping = displayedText.length < insightText.length;

  // Role badge configuration
  const roleBadgeConfig = {
    admin: {
      label: 'Admin',
      badgeClass: 'bg-purple-50/60 text-purple-300 border-purple-700/50',
      icon: ShieldCheck,
    },
    ops: {
      label: 'Operations',
      badgeClass: 'bg-amber-50/60 text-amber-300 border-amber-700/50',
      icon: Wrench,
    },
    operations: {
      label: 'Operations',
      badgeClass: 'bg-amber-50/60 text-amber-300 border-amber-700/50',
      icon: Wrench,
    },
    sustainability: {
      label: 'Sustainability',
      badgeClass: 'bg-emerald-50/60 text-emerald-600 border-emerald-700/50',
      icon: Leaf,
    },
  };

  const currentRoleConfig = roleBadgeConfig[activeRole] || {
    label: activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) : 'General',
    badgeClass: 'bg-teal-50/60 text-teal-300 border-teal-700/50',
    icon: Zap,
  };

  const RoleIcon = currentRoleConfig.icon;

  const handleTakeAction = () => {
    setActionTaken(true);
    setTimeout(() => {
      // Keep feedback active
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index || 0) * 0.1, ease: 'easeOut' }}
      className="group relative bg-gradient-to-br from-emerald-950/50 to-gray-50/80 border border-emerald-200 rounded-xl p-4 shadow-lg shadow-sm/20 hover:border-emerald-300 transition-all duration-300  overflow-hidden"
    >
      {/* Subtle top edge emerald ambient light */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

      <div className="flex items-start gap-3.5">
        {/* Left: Animated spark/AI icon in emerald circle with subtle pulse */}
        <div className="relative shrink-0 mt-0.5">
          <motion.div
            animate={{
              scale: [1, 1.07, 1],
              boxShadow: [
                '0 0 0px rgba(16, 185, 129, 0)',
                '0 0 14px rgba(16, 185, 129, 0.45)',
                '0 0 0px rgba(16, 185, 129, 0)',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'easeInOut',
            }}
            className="w-9 h-9 rounded-full bg-emerald-50/90 border border-emerald-500/40 flex items-center justify-center text-emerald-700 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </motion.div>

          {/* Pulse ping point */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        {/* Center/Right Content */}
        <div className="flex-1 min-w-0">
          {/* Optional Category & Impact Header */}
          {(category || impact) && (
            <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
              {category && (
                <span className="text-gray-500 font-medium tracking-wide">
                  {category}
                </span>
              )}
              {impact && (
                <span className="font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
                  {impact}
                </span>
              )}
            </div>
          )}

          {/* Text with typing animation */}
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

      {/* Bottom bar: Role-colored badge + 'AI Insight' label + 'Take Action' button */}
      <div className="mt-3.5 pt-3 border-t border-emerald-900/30 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Role-colored badge */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${currentRoleConfig.badgeClass}`}
          >
            <RoleIcon className="w-3 h-3" />
            <span>{currentRoleConfig.label}</span>
          </span>

          {/* 'AI Insight' label */}
          <span className="inline-flex items-center text-[10px] font-semibold tracking-wider text-emerald-700/90 uppercase px-2 py-0.5 rounded bg-emerald-50/40 border border-emerald-800/40">
            AI Insight
          </span>
        </div>

        {/* 'Take Action' button (outlined emerald) */}
        <button
          type="button"
          onClick={handleTakeAction}
          disabled={actionTaken}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${
            actionTaken
              ? 'bg-emerald-600/20 border-emerald-500/80 text-emerald-600 shadow-sm'
              : 'border-emerald-500/40 hover:border-emerald-400 text-emerald-600 hover:text-gray-900 hover:bg-emerald-500/15 active:scale-95'
          }`}
        >
          {actionTaken ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Applied</span>
            </>
          ) : (
            <>
              <span>{actionLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700/80 group-hover:text-emerald-600 transition-colors" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default AIInsightCard;
