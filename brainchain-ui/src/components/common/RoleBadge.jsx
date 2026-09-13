import { Shield } from 'lucide-react'
import { ROLES } from '../../config/roles'

/**
 * RoleBadge - Displays role identity badge with icon and styling corresponding to role permissions.
 *
 * @param {Object} props
 * @param {string|Object} props.role - Role key (e.g. 'admin', 'operations', 'sustainability') or role object
 * @param {boolean} [props.showIcon=true] - Whether to show the role icon
 * @param {'sm'|'md'} [props.size='sm'] - Badge size
 * @param {string} [props.className=''] - Additional CSS classes
 */
export function RoleBadge({
  role = 'admin',
  showIcon = true,
  size = 'sm',
  className = '',
}) {
  // Normalize string or object
  let config = null

  if (typeof role === 'string') {
    const key = role.toLowerCase().replace(/[\s-]+/g, '_')
    config = ROLES[key] || ROLES[role]
  } else if (role && typeof role === 'object') {
    config = role
  }

  // Fallback if role is not recognized
  if (!config) {
    config = {
      label: typeof role === 'string' ? role : 'Unknown Role',
      shortLabel: typeof role === 'string' ? role : 'Unknown',
      icon: Shield,
      color: '#9ca3af',
      badgeClass: 'bg-gray-50 text-gray-600 border-gray-200/60',
    }
  }

  const RoleIcon = config.icon || Shield
  const displayText = config.shortLabel || config.label || 'Role'

  const sizeClasses =
    size === 'md' ? 'px-3 py-1 text-sm gap-2' : 'px-2.5 py-0.5 text-xs gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border  select-none transition-colors ${sizeClasses} ${
        config.badgeClass || 'bg-gray-50 text-gray-600 border-gray-200'
      } ${className}`}
      title={config.description || config.label}
    >
      {showIcon && RoleIcon && (
        <RoleIcon
          className={size === 'md' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
          style={config.color ? { color: config.color } : undefined}
        />
      )}
      <span className="tracking-wide">{displayText}</span>
    </span>
  )
}

export default RoleBadge
