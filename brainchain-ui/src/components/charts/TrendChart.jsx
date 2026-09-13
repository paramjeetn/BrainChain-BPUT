import { format, parseISO, isValid } from 'date-fns'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'

/**
 * Format timestamps into 'MM/dd HH:mm' using date-fns format
 */
const formatTimestamp = (val) => {
  if (!val) return ''
  try {
    let date
    if (val instanceof Date) {
      date = val
    } else if (typeof val === 'number') {
      date = new Date(val < 10000000000 ? val * 1000 : val)
    } else if (typeof val === 'string') {
      date = parseISO(val)
      if (!isValid(date)) {
        date = new Date(val)
      }
    }
    if (date && isValid(date)) {
      return format(date, 'MM/dd HH:mm')
    }
    return String(val)
  } catch {
    return String(val)
  }
}

/**
 * Custom dark tooltip with white text
 */
function CustomTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload || !payload.length) return null

  const dataPoint = payload[0]
  const formattedTime = formatTimestamp(label)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xl  text-xs">
      {formattedTime && (
        <p className="mb-1 text-xs font-medium text-gray-500 border-b border-gray-200 pb-1">
          {formattedTime}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color || dataPoint.color || '#10b981' }}
        />
        <span className="text-gray-600 font-medium capitalize">
          {dataPoint.name || 'Value'}:
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {typeof dataPoint.value === 'number'
            ? Number.isInteger(dataPoint.value)
              ? dataPoint.value.toLocaleString()
              : dataPoint.value.toFixed(1)
            : dataPoint.value}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  )
}

/**
 * TrendChart - Reusable time-series line chart with dark theme styling.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Time-series data points
 * @param {string} props.dataKey - Key of the value attribute
 * @param {string} [props.color='#10b981'] - Line stroke & glow color
 * @param {number} [props.height=200] - Chart height in pixels
 * @param {boolean} [props.showGrid=true] - Whether to render cartesian grid
 * @param {string} [props.unit=''] - Unit suffix for tooltips & values
 * @param {string} [props.xKey] - Key for the X-axis (defaults to 'timestamp' or 'time')
 * @param {string} [props.xAxisKey] - Alias for xKey
 * @param {string} [props.title] - Optional title above chart
 * @param {number} [props.referenceLine] - Optional threshold benchmark
 * @param {string} [props.referenceLabel] - Label for reference line
 * @param {string} [props.className=''] - Additional CSS classes
 */
export function TrendChart({
  data = [],
  dataKey = 'value',
  color = '#10b981',
  height = 200,
  showGrid = true,
  unit = '',
  xKey,
  xAxisKey,
  title,
  referenceLine,
  referenceLabel = 'Threshold',
  className = '',
}) {
  const effectiveXKey = xAxisKey || xKey || 'timestamp'

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-gray-500 bg-white rounded-lg border border-dashed border-gray-200 ${className}`}
        style={{ height }}
      >
        No telemetry data recorded
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="mb-2.5 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            {title}
          </h4>
          {referenceLine !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
              <span className="h-0.5 w-3 bg-rose-400/80" />
              <span>
                {referenceLabel} ({referenceLine}{unit ? ` ${unit}` : ''})
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
          >
            {showGrid && (
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.5}
              />
            )}

            <XAxis
              dataKey={effectiveXKey}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatTimestamp}
              minTickGap={24}
            />

            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={42}
            />

            <Tooltip
              content={<CustomTooltip unit={unit} color={color} />}
            />

            {referenceLine !== undefined && (
              <ReferenceLine
                y={referenceLine}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}

            <Line
              type="monotone"
              dataKey={dataKey}
              name={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: '#111827',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TrendChart
