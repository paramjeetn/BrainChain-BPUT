import { AlertCircle, AlertTriangle, CheckCircle2, Flame, Info } from 'lucide-react'

/**
 * AlertBadge - Alert severity badge with colored status dot and pill styling.
 * Colors: low=emerald, medium=amber, high=red, critical=red with pulse animation.
 *
 * @param {Object} props
 * @param {'low'|'medium'|'high'|'critical'|string} props.severity - Alert severity level
 * @param {string} [props.label] - Text label
 * @param {string} [props.text] - Alias for label
 * @param {React.ReactNode} [props.children] - Children content
 * @param {boolean} [props.showIcon=false] - Whether to show alert icon
 * @param {React.ComponentType} [props.icon] - Custom icon
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant
 * @param {string} [props.className=''] - Additional CSS classes
 */
export function AlertBadge({
  severity,
  variant,
  pulse = false,
  label,
  text,
  children,
  showIcon = false,
  icon: CustomIcon,
  size = 'md',
  className = '',
}) {
  const variantMap = {
    danger: 'critical',
    warning: 'medium',
    success: 'low',
    info: 'low',
  };
  const effectiveSeverity = severity || variantMap[variant] || variant || 'low';
  const normalized = String(effectiveSeverity).toLowerCase();

  const severityConfigs = {
    low: {
      bg: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-400',
      pulse: false,
      icon: CheckCircle2,
      defaultLabel: 'Low',
    },
    medium: {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      pulse: false,
      icon: AlertCircle,
      defaultLabel: 'Medium',
    },
    high: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-400',
      pulse: false,
      icon: AlertTriangle,
      defaultLabel: 'High',
    },
    critical: {
      bg: 'bg-red-100 text-red-600 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse',
      dot: 'bg-red-500',
      pulse: true,
      icon: Flame,
      defaultLabel: 'Critical',
    },
  }

  const config = severityConfigs[normalized] || severityConfigs.low
  const content = label || text || children || config.defaultLabel
  const IconComponent = CustomIcon || (showIcon ? config.icon : null)

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size] || 'text-xs px-2.5 py-0.5 gap-1.5'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border  select-none transition-colors ${config.bg} ${sizeClasses} ${className}`}
    >
      {(config.pulse || pulse) ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}

      {IconComponent && <IconComponent className="h-3.5 w-3.5 shrink-0" />}

      <span className="truncate capitalize">{content}</span>
    </span>
  )
}

export default AlertBadge
