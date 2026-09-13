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
    { i: 'scorecard', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'energy', x: 0, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'water', x: 6, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'air_quality', x: 0, y: 12, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'waste', x: 6, y: 12, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'traffic', x: 0, y: 20, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'assets', x: 6, y: 20, w: 6, h: 7, minW: 4, minH: 5 },
    { i: 'safety', x: 0, y: 27, w: 12, h: 6, minW: 6, minH: 4 },
  ],
  md: [
    { i: 'scorecard', x: 0, y: 0, w: 10, h: 4, minW: 5, minH: 3 },
    { i: 'energy', x: 0, y: 4, w: 5, h: 8, minW: 4, minH: 6 },
    { i: 'water', x: 5, y: 4, w: 5, h: 8, minW: 4, minH: 6 },
    { i: 'air_quality', x: 0, y: 12, w: 5, h: 8, minW: 4, minH: 6 },
    { i: 'waste', x: 5, y: 12, w: 5, h: 8, minW: 4, minH: 6 },
    { i: 'traffic', x: 0, y: 20, w: 5, h: 7, minW: 4, minH: 5 },
    { i: 'assets', x: 5, y: 20, w: 5, h: 7, minW: 4, minH: 5 },
    { i: 'safety', x: 0, y: 27, w: 10, h: 6, minW: 5, minH: 4 },
  ],
  sm: [
    { i: 'scorecard', x: 0, y: 0, w: 6, h: 4 },
    { i: 'energy', x: 0, y: 4, w: 6, h: 7 },
    { i: 'water', x: 0, y: 11, w: 6, h: 7 },
    { i: 'air_quality', x: 0, y: 18, w: 6, h: 7 },
    { i: 'waste', x: 0, y: 25, w: 6, h: 7 },
    { i: 'traffic', x: 0, y: 32, w: 6, h: 7 },
    { i: 'assets', x: 0, y: 39, w: 6, h: 7 },
    { i: 'safety', x: 0, y: 46, w: 6, h: 6 },
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
    }
  )
)
