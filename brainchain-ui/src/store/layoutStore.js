import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ALL_MODULES = [
  'scorecard',
  'air_quality',
  'energy',
  'water',
  'waste',
  'traffic',
  'assets',
  'safety',
]

const DEFAULT_ACTIVE_MODULES = [
  'energy',
  'water',
  'waste',
  'traffic',
  'safety',
  'scorecard',
]

export const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'zone_map',    x: 0, y: 0, w: 8, h: 10, minW: 6, minH: 8 },
    { i: 'scorecard',   x: 8, y: 0, w: 4, h: 5,  minW: 3, minH: 4 },
    { i: 'energy',      x: 8, y: 5, w: 4, h: 5,  minW: 3, minH: 4 },
    { i: 'water',       x: 0, y: 10, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'waste',       x: 3, y: 10, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'air_quality', x: 6, y: 10, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'traffic',     x: 9, y: 10, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'safety',      x: 0, y: 15, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'assets',      x: 3, y: 15, w: 3, h: 5, minW: 3, minH: 4 },
    { i: 'ai_insights', x: 0, y: 20, w: 12, h: 10, minW: 12, minH: 8 },
  ],
  md: [
    { i: 'zone_map',    x: 0, y: 0, w: 8, h: 8 },
    { i: 'scorecard',   x: 0, y: 8, w: 4, h: 5 },
    { i: 'energy',      x: 4, y: 8, w: 4, h: 5 },
    { i: 'water',       x: 0, y: 13, w: 4, h: 5 },
    { i: 'waste',       x: 4, y: 13, w: 4, h: 5 },
    { i: 'air_quality', x: 0, y: 18, w: 4, h: 5 },
    { i: 'traffic',     x: 4, y: 18, w: 4, h: 5 },
    { i: 'safety',      x: 0, y: 23, w: 4, h: 5 },
    { i: 'assets',      x: 4, y: 23, w: 4, h: 5 },
    { i: 'ai_insights', x: 0, y: 28, w: 8, h: 10 },
  ],
  sm: [
    { i: 'zone_map',    x: 0, y: 0, w: 4, h: 6 },
    { i: 'scorecard',   x: 0, y: 6, w: 4, h: 5 },
    { i: 'energy',      x: 0, y: 11, w: 4, h: 5 },
    { i: 'water',       x: 0, y: 16, w: 4, h: 5 },
    { i: 'waste',       x: 0, y: 21, w: 4, h: 5 },
    { i: 'air_quality', x: 0, y: 26, w: 4, h: 5 },
    { i: 'traffic',     x: 0, y: 31, w: 4, h: 5 },
    { i: 'safety',      x: 0, y: 36, w: 4, h: 5 },
    { i: 'assets',      x: 0, y: 41, w: 4, h: 5 },
    { i: 'ai_insights', x: 0, y: 46, w: 4, h: 10 },
  ],
}

export const createDefaultPanels = (activeModules = DEFAULT_ACTIVE_MODULES) => {
  const panels = {}
  ALL_MODULES.forEach((mod) => {
    panels[mod] = {
      visible: activeModules.includes(mod),
      minimized: false,
    }
  })
  return panels
}

export const useLayoutStore = create(
  persist(
    (set, get) => ({
      layouts: DEFAULT_LAYOUTS,
      panels: createDefaultPanels(),

      updateLayout: (layout, allLayouts) => {
        if (allLayouts && typeof allLayouts === 'object') {
          set({ layouts: allLayouts })
        } else if (Array.isArray(layout)) {
          set((state) => ({
            layouts: {
              ...state.layouts,
              lg: layout,
            },
          }))
        } else if (layout && typeof layout === 'object') {
          set((state) => ({
            layouts: {
              ...state.layouts,
              ...layout,
            },
          }))
        }
      },

      togglePanel: (moduleId) => {
        set((state) => {
          const current = state.panels[moduleId] || { visible: false, minimized: false }
          return {
            panels: {
              ...state.panels,
              [moduleId]: {
                ...current,
                visible: !current.visible,
              },
            },
          }
        })
      },

      minimizePanel: (moduleId) => {
        set((state) => {
          const current = state.panels[moduleId] || { visible: true, minimized: false }
          return {
            panels: {
              ...state.panels,
              [moduleId]: {
                ...current,
                minimized: !current.minimized,
              },
            },
          }
        })
      },

      setPanelVisibility: (moduleId, visible) => {
        set((state) => {
          const current = state.panels[moduleId] || { visible: false, minimized: false }
          return {
            panels: {
              ...state.panels,
              [moduleId]: {
                ...current,
                visible: Boolean(visible),
              },
            },
          }
        })
      },

      syncPanelsWithModules: (activeModules = []) => {
        set((state) => {
          const updatedPanels = { ...state.panels }
          ALL_MODULES.forEach((mod) => {
            const current = updatedPanels[mod] || { visible: false, minimized: false }
            updatedPanels[mod] = {
              ...current,
              visible: activeModules.includes(mod),
            }
          })
          return { panels: updatedPanels }
        })
      },

      resetLayout: (activeModules) => {
        set({
          layouts: DEFAULT_LAYOUTS,
          panels: createDefaultPanels(activeModules),
        })
      },
    }),
    {
      name: 'brainchain-dashboard-layout',
      version: 2, // Bump version to force reset
    }
  )
)
