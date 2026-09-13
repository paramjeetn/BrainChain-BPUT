import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * AnimatedNumber - Renders an animated counter using Framer Motion animate.
 */
function AnimatedNumber({ value }) {
  const numeric =
    typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(/[^0-9.-]+/g, ''))
  const isNumeric = !Number.isNaN(numeric) && Number.isFinite(numeric)

  const count = useMotionValue(0)
  const isInteger = Number.isInteger(numeric)

  const display = useTransform(count, (latest) => {
    if (!isNumeric) return value
    return isInteger ? Math.round(latest).toLocaleString() : latest.toFixed(1)
  })

  useEffect(() => {
    if (isNumeric) {
      const controls = animate(count, numeric, {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      })
      return () => controls.stop()
    }
  }, [numeric, isNumeric, count])

  if (!isNumeric) {
    return <span>{value}</span>
  }

  return <motion.span>{display}</motion.span>
}

/**
 * StatCard - Small metric display card with animated value, trend badge, and colored icon.
 *
 * @param {Object} props
 * @param {string} [props.label] - Metric description (e.g. "Total Energy", "AQI Score")
 * @param {string} [props.title] - Alias for label
 * @param {string|number} props.value - Metric value to display
 * @param {string} [props.unit=''] - Unit of measurement (e.g. "kWh", "ppm", "%")
 * @param {string} [props.trend] - Trend string (e.g. "+12%", "-4.5%")
 * @param {string} [props.change] - Alias for trend
 * @param {boolean} [props.trendUp] - True if positive direction, false if negative
 * @param {string} [props.changeType] - 'positive' | 'negative' (alias for trendUp)
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {string} [props.color='#10b981'] - Hex or named color
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.status] - Optional small status chip
 */
export function StatCard({
  label,
  title,
  value,
  unit = '',
  trend,
  change,
  trendUp,
  changeType,
  icon: Icon,
  color = '#10b981',
  className = '',
  status,
  onClick,
}) {
  const displayLabel = label || title || ''
  const displayTrend = trend !== undefined ? trend : change

  // Determine trend direction
  let isPositive = null
  if (typeof trendUp === 'boolean') {
    isPositive = trendUp
  } else if (changeType === 'positive' || changeType === 'increase') {
    isPositive = true
  } else if (changeType === 'negative' || changeType === 'decrease') {
    isPositive = false
  } else if (displayTrend) {
    const trimmed = String(displayTrend).trim()
    if (trimmed.startsWith('+')) isPositive = true
    else if (trimmed.startsWith('-')) isPositive = false
  }

  // Resolve color (handle hex or theme name)
  const resolvedColor =
    color.startsWith('#') || color.startsWith('rgb')
      ? color
      : color === 'blue'
        ? '#3b82f6'
        : color === 'amber' || color === 'orange'
          ? '#f59e0b'
          : color === 'red'
            ? '#ef4444'
            : color === 'purple'
              ? '#a855f7'
              : '#10b981'

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between bg-white shadow-sm  border border-gray-200 rounded-lg p-3 transition-all duration-200 hover:border-gray-300/70 hover:bg-gray-50 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top row: Icon in colored circle & Trend / Status badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {Icon ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${resolvedColor}18`,
              borderColor: `${resolvedColor}35`,
              color: resolvedColor,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-2" />
        )}

        <div className="flex items-center gap-1.5">
          {displayTrend !== undefined && displayTrend !== null && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                isPositive === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-500/25'
                  : isPositive === false
                    ? 'bg-red-50 text-red-700 border-red-500/25'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {isPositive === true && <TrendingUp className="w-3 h-3" />}
              {isPositive === false && <TrendingDown className="w-3 h-3" />}
              {isPositive === null && <Minus className="w-3 h-3" />}
              <span>{displayTrend}</span>
            </div>
          )}

          {status && (
            <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600">
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Value & Unit */}
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
          <AnimatedNumber value={value} />
        </span>
        {unit && (
          <span className="text-xs font-medium text-gray-500 ml-0.5">
            {unit}
          </span>
        )}
      </div>

      {/* Label */}
      <div className="text-xs font-medium text-gray-500 tracking-wide uppercase mt-1.5 truncate">
        {displayLabel}
      </div>
    </div>
  )
}

export default StatCard
