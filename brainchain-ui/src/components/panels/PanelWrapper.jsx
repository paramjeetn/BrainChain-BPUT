import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Minus, Plus, X } from 'lucide-react'

/**
 * PanelWrapper - Draggable, collapsible card container for dashboard modules.
 *
 * @param {Object} props
 * @param {string} props.title - Panel title
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {string} [props.color='#10b981'] - Hex accent color for the icon & glows
 * @param {React.ReactNode} props.children - Panel body content
 * @param {string} [props.moduleId] - Unique ID of the module (e.g. 'air_quality')
 * @param {function} [props.onMinimize] - Callback when minimize button is clicked (moduleId, isMinimized)
 * @param {function} [props.onClose] - Callback when close button is clicked (moduleId)
 * @param {boolean} [props.isMinimized] - Controlled minimized state
 * @param {string} [props.className] - Additional wrapper CSS classes
 * @param {string} [props.subtitle] - Optional subtitle under header
 * @param {React.ReactNode} [props.actions] - Optional additional header action elements
 */
export function PanelWrapper({
  title,
  icon: Icon,
  color = '#10b981',
  children,
  moduleId,
  onMinimize,
  onClose,
  isMinimized: controlledMinimized,
  className = '',
  subtitle,
  actions,
}) {
  const [internalMinimized, setInternalMinimized] = useState(false)
  const isMinimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized

  const handleToggleMinimize = (e) => {
    e.stopPropagation()
    const nextState = !isMinimized
    if (controlledMinimized === undefined) {
      setInternalMinimized(nextState)
    }
    if (onMinimize) {
      onMinimize(moduleId, nextState)
    }
  }

  const handleClose = (e) => {
    e.stopPropagation()
    if (onClose) {
      onClose(moduleId)
    }
  }

  return (
    <div
      className={`relative flex flex-col bg-white shadow-xl  border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-xl shadow-gray-200 group ${className}`}
    >
      {/* Header: drag handle, icon, title, actions */}
      <div
        className="drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-grab active:cursor-grabbing select-none bg-gray-50/50"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Drag Handle Icon */}
          <div
            className="text-gray-500 group-hover:text-gray-500 transition-colors p-0.5 -ml-1 cursor-grab active:cursor-grabbing"
            title="Drag to reposition"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Module Icon in colored circle */}
          {Icon && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${color}18`,
                borderColor: `${color}35`,
                color: color,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Panel Title & Subtitle */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wide truncate">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[11px] text-gray-500 truncate -mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (header controls) */}
        <div
          className="flex items-center gap-1 shrink-0 ml-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {actions}

          {/* Minimize / Expand button */}
          <button
            type="button"
            onClick={handleToggleMinimize}
            className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title={isMinimized ? 'Expand panel' : 'Minimize panel'}
            aria-label={isMinimized ? 'Expand panel' : 'Minimize panel'}
          >
            {isMinimized ? (
              <Plus className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-md text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Close / hide panel"
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body: Animated collapse / expand */}
      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div
            key="panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden flex-1"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PanelWrapper
