import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wind,
  Zap,
  Droplets,
  Trash2,
  Car,
  Layers,
  ShieldAlert,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react'
import { MODULE_CONFIG } from '../../config/moduleConfig'
import { useLayoutStore } from '../../store/layoutStore'
import { useFacilityStore } from '../../store/facilityStore'

const DEFAULT_MODULES = [
  { id: 'scorecard', name: 'Scorecard', icon: Award },
  { id: 'air_quality', name: 'Air Quality', icon: Wind },
  { id: 'energy', name: 'Energy Usage', icon: Zap },
  { id: 'water', name: 'Water Use', icon: Droplets },
  { id: 'waste', name: 'Waste Mgmt', icon: Trash2 },
  { id: 'traffic', name: 'Traffic & Parking', icon: Car },
  { id: 'assets', name: 'Asset Utilization', icon: Layers },
  { id: 'safety', name: 'Safety Incidents', icon: ShieldAlert },
]

const ICON_LOOKUP = {
  scorecard: Award,
  sustainability: Award,
  air_quality: Wind,
  airquality: Wind,
  air: Wind,
  energy: Zap,
  water: Droplets,
  waste: Trash2,
  traffic: Car,
  parking: Car,
  assets: Layers,
  asset_utilization: Layers,
  safety: ShieldAlert,
}

export default function Sidebar() {
  const store = typeof useLayoutStore === 'function' ? useLayoutStore() : {}
  const [localCollapsed, setLocalCollapsed] = useState(false)
  const [localActivePanels, setLocalActivePanels] = useState(
    () => new Set(['scorecard', 'energy', 'air_quality'])
  )

  // Collapse state derived from store or local state
  const isCollapsed =
    typeof store?.sidebarCollapsed === 'boolean'
      ? store.sidebarCollapsed
      : typeof store?.isSidebarCollapsed === 'boolean'
        ? store.isSidebarCollapsed
        : localCollapsed

  const toggleCollapse = () => {
    if (typeof store?.toggleSidebar === 'function') {
      store.toggleSidebar()
    } else if (typeof store?.setSidebarCollapsed === 'function') {
      store.setSidebarCollapsed(!isCollapsed)
    } else {
      setLocalCollapsed((prev) => !prev)
    }
  }

  // Resolve module configuration
  const modules = useMemo(() => {
    const rawConfig = MODULE_CONFIG?.MODULE_CONFIG || MODULE_CONFIG
    if (!rawConfig) return DEFAULT_MODULES

    if (Array.isArray(rawConfig)) {
      return rawConfig.map((m) => {
        const idKey = (m.id || '').toLowerCase()
        const FallbackIcon = ICON_LOOKUP[idKey] || LayoutGrid
        return {
          id: m.id || idKey,
          name: m.name || m.label || m.title || idKey,
          icon: m.icon || FallbackIcon,
          ...m,
        }
      })
    }

    if (typeof rawConfig === 'object') {
      return Object.entries(rawConfig).map(([key, val]) => {
        const idKey = (val.id || key).toLowerCase()
        const FallbackIcon = ICON_LOOKUP[idKey] || LayoutGrid
        return {
          id: idKey,
          name: typeof val === 'string' ? val : val.name || val.label || key,
          icon: (typeof val === 'object' && val.icon) || FallbackIcon,
          ...(typeof val === 'object' ? val : {}),
        }
      })
    }

    return DEFAULT_MODULES
  }, [])

  // Check if a module panel is active
  const isModuleActive = (moduleId) => {
    const { activePanels, visiblePanels, activeModules, activeModule, selectedPanel, openPanels, panels } =
      store || {}

    if (Array.isArray(activePanels)) return activePanels.includes(moduleId)
    if (activePanels && typeof activePanels === 'object') return Boolean(activePanels[moduleId])

    if (Array.isArray(visiblePanels)) return visiblePanels.includes(moduleId)
    if (visiblePanels && typeof visiblePanels === 'object') return Boolean(visiblePanels[moduleId])

    if (Array.isArray(activeModules)) return activeModules.includes(moduleId)
    if (activeModules && typeof activeModules === 'object') return Boolean(activeModules[moduleId])

    if (Array.isArray(openPanels)) return openPanels.includes(moduleId)
    if (openPanels && typeof openPanels === 'object') return Boolean(openPanels[moduleId])

    if (panels && typeof panels === 'object') {
      if (Array.isArray(panels)) return panels.includes(moduleId)
      return Boolean(panels[moduleId]?.enabled ?? panels[moduleId]?.active ?? panels[moduleId])
    }

    if (activeModule === moduleId || selectedPanel === moduleId) return true

    return localActivePanels.has(moduleId)
  }

  // Handle clicking module
  const handleModuleClick = (moduleId) => {
    if (typeof store?.togglePanel === 'function') {
      store.togglePanel(moduleId)
    } else if (typeof store?.toggleModule === 'function') {
      store.toggleModule(moduleId)
    }

    setLocalActivePanels((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-white border-r border-gray-200 shrink-0 z-30 select-none overflow-hidden"
    >
      {/* Module Navigation links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-gray-200">
        {!isCollapsed && (
          <div className="px-3 pb-2 pt-1">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase font-mono">
              Modules & Sensors
            </span>
          </div>
        )}

        {modules.map((module) => {
          const active = isModuleActive(module.id)
          const IconComponent = module.icon || LayoutGrid

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => handleModuleClick(module.id)}
              title={isCollapsed ? module.name : undefined}
              className={`w-full flex items-center h-10 px-2.5 rounded-lg transition-all duration-150 relative group ${
                active
                  ? 'bg-emerald-500/15 text-emerald-700 font-semibold border-l-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
              } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              <span className="shrink-0 flex items-center justify-center w-6 h-6">
                {typeof IconComponent === 'function' ? (
                  <IconComponent className="w-5 h-5" />
                ) : (
                  <LayoutGrid className="w-5 h-5" />
                )}
              </span>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="ml-3 truncate text-sm whitespace-nowrap overflow-hidden text-left flex-1"
                  >
                    {module.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active dot indicator on the right when expanded */}
              {!isCollapsed && active && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto shrink-0 shadow-sm shadow-emerald-400/50" />
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom Area: Settings, Version, Collapse toggle */}
      <div className="border-t border-gray-200 p-2 bg-white/90 flex flex-col gap-1 shrink-0">
        {/* Settings button */}
        <button
          type="button"
          className={`w-full flex items-center h-9 px-2.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100/60 transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="ml-3 text-sm whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Version info */}
        {!isCollapsed ? (
          <div className="px-2.5 py-1 text-[11px] text-gray-500 font-mono flex items-center justify-between">
            <span>Version</span>
            <span className="text-gray-500">v0.1 demo</span>
          </div>
        ) : (
          <div className="text-center py-0.5 text-[9px] text-gray-500 font-mono">
            v0.1
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className={`w-full flex items-center h-9 px-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200/60 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? 'Expand sidebar (240px)' : 'Collapse sidebar (64px)'}
        >
          <div className="flex items-center">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0" />
            )}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="ml-2 text-xs font-medium"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {!isCollapsed && (
            <span className="text-[10px] text-gray-500 font-mono">64px</span>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
