import React, { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO, isValid } from 'date-fns'
import { AlertTriangle, TrendingUp, Brain } from 'lucide-react'

/**
 * Format timestamp values into readable 'MM/dd HH:mm'
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
 * Custom Anomaly Dot renderer
 * Draws a glowing warning indicator over flagged anomaly coordinates
 */
const AnomalyDot = (props) => {
  const { cx, cy, payload, showAnomalies = true } = props
  if (!showAnomalies || !payload?.anomaly || cx == null || cy == null || isNaN(cx) || isNaN(cy)) {
    return null
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill="#ef4444" opacity={0.25} />
      <circle cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#fca5a5" strokeWidth={1.5} />
    </g>
  )
}

/**
 * Custom Tooltip with anomaly analysis and ML forecasting telemetry
 */
const ForecastTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload

  // Filter out internal confidence band fills, and avoid duplicate point at boundary
  const visiblePayload = payload.filter((p) => {
    if (p.value == null) return false
    if (p.dataKey === 'confidenceHigh' || p.dataKey === 'confidenceLow') return false
    if (!d?.is_forecast && p.dataKey === 'predicted') return false
    return true
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-2xl text-xs max-w-xs ">
      <p className="text-gray-500 mb-1.5 font-mono text-[11px]">{label}</p>

      {visiblePayload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-0.5">
          <span style={{ color: p.color || '#10b981' }} className="font-medium">
            {p.name}:
          </span>
          <span className="text-gray-900 font-mono font-semibold">
            {typeof p.value === 'number'
              ? Number.isInteger(p.value)
                ? p.value.toLocaleString()
                : p.value.toFixed(1)
              : p.value}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}

      {d?.confidenceLow != null && d?.confidenceHigh != null && d?.is_forecast && (
        <div className="flex items-center justify-between gap-4 text-gray-500 my-0.5 text-[11px]">
          <span className="text-gray-500">95% CI:</span>
          <span className="text-gray-600 font-mono">
            [{typeof d.confidenceLow === 'number' ? d.confidenceLow.toFixed(1) : d.confidenceLow} -{' '}
            {typeof d.confidenceHigh === 'number' ? d.confidenceHigh.toFixed(1) : d.confidenceHigh}
            {unit ? ` ${unit}` : ''}]
          </span>
        </div>
      )}

      {d?.anomaly && (
        <div className="mt-2 pt-2 border-t border-red-200">
          <div className="flex items-center gap-1.5 text-red-700 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Anomaly Detected</span>
          </div>
          {d.anomaly_score != null && (
            <p className="text-red-600 mt-0.5">
              {typeof d.anomaly_score === 'number'
                ? d.anomaly_score.toFixed(2)
                : d.anomaly_score}
              σ above baseline
            </p>
          )}
          {d.anomaly_reason && (
            <p className="text-gray-500 mt-0.5 leading-relaxed">{d.anomaly_reason}</p>
          )}
        </div>
      )}

      {d?.is_forecast && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
            <Brain className="w-3.5 h-3.5 shrink-0" />
            <span>Forecast</span>
          </div>
          {d.model && <p className="text-gray-500 mt-0.5">Model: {d.model}</p>}
          {d.confidence != null && (
            <p className="text-gray-500 mt-0.5">
              Confidence: {Math.round(d.confidence > 1 ? d.confidence : d.confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * ForecastChart
 * 
 * Reusable AI-powered time-series chart component combining:
 * 1. Historical actual telemetry (solid line)
 * 2. Forecast projections (dashed line at 60% opacity)
 * 3. Confidence band (shaded interval between forecast_lower and forecast_upper)
 * 4. Anomaly detection callouts (accented red markers)
 * 5. Current timestamp separation boundary ("NOW" reference line)
 * 6. Top summary bar with anomaly count, model info, and ML confidence percentage
 */
export function ForecastChart({
  data = [],
  color = '#10b981',
  label = 'Actual',
  unit = '',
  height = 220,
  nowTimestamp,
  showForecast = true,
  showAnomalies = true,
  showLegend = false,
  title,
  modelName: modelNameProp,
  forecastHorizon: forecastHorizonProp,
  confidence: confidenceProp,
  className = '',
  areaBackground = '#f9fafb',
}) {
  // Identify forecast points and metadata
  const forecastPoints = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((d) => d.is_forecast)
  }, [data])

  const hasForecast = showForecast && forecastPoints.length > 0

  // Count anomalies
  const anomalyCount = useMemo(() => {
    if (!showAnomalies || !Array.isArray(data)) return 0
    return data.filter((d) => d.anomaly).length
  }, [data, showAnomalies])

  // Inferred model name & horizon
  const modelName =
    modelNameProp ||
    forecastPoints.find((d) => d.model)?.model ||
    'LinearTrend+Seasonality'

  const forecastHorizon =
    forecastHorizonProp ||
    (forecastPoints.length > 0 ? `${forecastPoints.length}h` : '24h')

  // Compute average confidence score
  const avgConfidence = useMemo(() => {
    if (confidenceProp !== undefined) {
      return confidenceProp > 1 ? Math.round(confidenceProp) : Math.round(confidenceProp * 100)
    }
    const pointsWithConf = forecastPoints.filter((d) => d.confidence != null)
    if (pointsWithConf.length > 0) {
      const avg = pointsWithConf.reduce((sum, d) => sum + d.confidence, 0) / pointsWithConf.length
      return avg > 1 ? Math.round(avg) : Math.round(avg * 100)
    }
    return 85
  }, [forecastPoints, confidenceProp])

  // Create merged dataset where each point has actual, predicted, and confidence bounds
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []

    const sorted = [...data].sort(
      (a, b) => new Date(a.timestamp || a.time || 0) - new Date(b.timestamp || b.time || 0)
    )

    // Find index of the transition point (last historical point before forecast)
    const lastHistoricalIndex = sorted.reduce(
      (lastIdx, d, idx) => (!d.is_forecast ? idx : lastIdx),
      -1
    )
    const hasForecastData = sorted.some((p) => p.is_forecast)

    return sorted.map((d, index) => {
      const isForecast = !!d.is_forecast
      const rawVal = d.value !== undefined ? d.value : d.actual
      const forecastVal = d.forecast !== undefined ? d.forecast : (isForecast ? rawVal : null)

      // Bridge the boundary point so the forecast line connects seamlessly
      const isBoundary = index === lastHistoricalIndex && hasForecastData

      return {
        ...d,
        displayTime: formatTimestamp(d.timestamp || d.time),
        // Actual value or null
        actual: isForecast ? null : rawVal,
        // Forecast value or null
        predicted: isForecast ? forecastVal : isBoundary ? rawVal : null,
        // Confidence band — only for forecast points and boundary
        confidenceLow: isForecast
          ? d.forecast_lower !== undefined
            ? d.forecast_lower
            : d.confidence_lower !== undefined
            ? d.confidence_lower
            : null
          : isBoundary
          ? rawVal
          : null,
        confidenceHigh: isForecast
          ? d.forecast_upper !== undefined
            ? d.forecast_upper
            : d.confidence_upper !== undefined
            ? d.confidence_upper
            : null
          : isBoundary
          ? rawVal
          : null,
      }
    })
  }, [data])

  // Resolve X-coordinate for NOW reference line
  const effectiveNowX = useMemo(() => {
    if (!chartData || chartData.length === 0) return null

    if (nowTimestamp) {
      const formatted = formatTimestamp(nowTimestamp)
      const exactMatch = chartData.find((d) => d.displayTime === formatted)
      if (exactMatch) return exactMatch.displayTime

      // Match closest point
      const targetMs = new Date(nowTimestamp).getTime()
      if (!isNaN(targetMs)) {
        let closest = chartData[0]
        let minDiff = Math.abs(new Date(closest.timestamp || closest.time || 0).getTime() - targetMs)
        for (let i = 1; i < chartData.length; i++) {
          const diff = Math.abs(new Date(chartData[i].timestamp || chartData[i].time || 0).getTime() - targetMs)
          if (diff < minDiff) {
            minDiff = diff
            closest = chartData[i]
          }
        }
        return closest.displayTime
      }
      return formatted
    }

    // Auto-detect boundary if no timestamp given
    const lastHistorical = [...chartData].reverse().find((d) => !d.is_forecast)
    const hasAnyForecast = chartData.some((d) => d.is_forecast)
    if (hasAnyForecast && lastHistorical) {
      return lastHistorical.displayTime
    }

    return null
  }, [nowTimestamp, chartData])

  // Empty state handling
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-gray-500 bg-white rounded-lg border border-dashed border-gray-200 ${className}`}
        style={{ height }}
      >
        No telemetry or forecast data available
      </div>
    )
  }

  const showHeader = title || (showAnomalies && anomalyCount > 0) || (showForecast && hasForecast)

  return (
    <div className={`w-full ${className}`}>
      {/* Header telemetry summary bar */}
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
          <div className="flex flex-wrap items-center gap-2">
            {title && (
              <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                {title}
              </span>
            )}

            {showAnomalies && anomalyCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="w-3 h-3 text-red-700 shrink-0" />
                <span>
                  {anomalyCount} {anomalyCount === 1 ? 'anomaly' : 'anomalies'} detected
                </span>
              </span>
            )}

            {showForecast && hasForecast && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Brain className="w-3 h-3 text-blue-700 shrink-0" />
                <span>
                  {forecastHorizon} forecast · {modelName}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showForecast && hasForecast && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                <TrendingUp className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>
                  Confidence: <span className="text-emerald-700 font-semibold">{avgConfidence}%</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chart Canvas */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="displayTime"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ForecastTooltip unit={unit} />} />

            {/* Confidence band */}
            {showForecast && (
              <Area
                type="monotone"
                dataKey="confidenceHigh"
                stroke="none"
                fill={color}
                fillOpacity={0.08}
                name="Upper bound"
                legendType="none"
                tooltipType="none"
                isAnimationActive={false}
              />
            )}
            {showForecast && (
              <Area
                type="monotone"
                dataKey="confidenceLow"
                stroke="none"
                fill={areaBackground}
                fillOpacity={1}
                name="Lower bound"
                legendType="none"
                tooltipType="none"
                isAnimationActive={false}
              />
            )}

            {/* Actual historical line */}
            <Line
              type="monotone"
              dataKey="actual"
              name={label || 'Actual'}
              stroke={color}
              strokeWidth={2}
              dot={<AnomalyDot showAnomalies={showAnomalies} />}
              activeDot={{ r: 4, fill: color }}
              connectNulls={false}
            />

            {/* Forecast dashed line */}
            {showForecast && (
              <Line
                type="monotone"
                dataKey="predicted"
                name="Forecast"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 4 }}
                opacity={0.6}
                connectNulls={false}
              />
            )}

            {/* NOW reference line */}
            {effectiveNowX && (
              <ReferenceLine
                x={effectiveNowX}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                label={{ value: 'NOW', position: 'top', fill: '#6b7280', fontSize: 10 }}
              />
            )}

            {showLegend && (
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ForecastChart
