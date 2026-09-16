import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FACILITY_PRESETS } from '../config/moduleConfig'

const DEFAULT_PRESET = FACILITY_PRESETS.college

export const useFacilityStore = create(
  persist(
    (set, get) => ({
      // Multi-facility registry and active states
      facilities: [],
      activeFacility: null,
      activeRole: 'admin',

      // Core Facility Meta
      facilityType: DEFAULT_PRESET.id,
      facilityName: DEFAULT_PRESET.defaultName,
      location: DEFAULT_PRESET.defaultLocation,
      isOnboarded: true,
      currentView: 'dashboard', // 'dashboard' | 'configure' | 'onboarding'

      // Active Modules (Array of module id strings)
      activeModules: [...DEFAULT_PRESET.modules],

      // Numerical Alert Thresholds
      thresholds: {
        ...DEFAULT_PRESET.thresholds,
      },

      // Facility Spatial Zones
      zones: [...DEFAULT_PRESET.zones],

      // Role-Based User Registry
      roles: [...DEFAULT_PRESET.roles],

      // Active Role ('admin' | 'ops' | 'sustainability')
      activeRole: 'admin',
      setActiveRole: (role) => set({ activeRole: typeof role === 'string' ? role.toLowerCase() : 'admin' }),

      // Active Facility object for AI Insights & Scenarios
      activeFacility: {
        id: DEFAULT_PRESET.id,
        name: DEFAULT_PRESET.defaultName,
        type: DEFAULT_PRESET.id,
        location: DEFAULT_PRESET.defaultLocation,
        occupancy: 68,
        temperature: 25,
      },
      setActiveFacility: (facilityOrId) => {
        if (typeof facilityOrId === 'string') {
          const preset = FACILITY_PRESETS[facilityOrId]
          if (preset) {
            set({
              activeFacility: {
                id: preset.id,
                name: preset.defaultName,
                type: preset.id,
                location: preset.defaultLocation,
                occupancy: 68,
                temperature: 25,
              },
              facilityType: preset.id,
              facilityName: preset.defaultName,
            })
          } else {
            set({
              activeFacility: {
                id: facilityOrId,
                name: facilityOrId,
                type: facilityOrId,
                occupancy: 65,
                temperature: 25,
              },
            })
          }
        } else if (facilityOrId && typeof facilityOrId === 'object') {
          set({ activeFacility: facilityOrId })
        }
      },

      // Helper check if module is currently enabled
      isModuleActive: (moduleId) => {
        return get().activeModules.includes(moduleId)
      },

      // Navigation & Workflow
      setCurrentView: (view) => set({ currentView: view }),

      completeOnboarding: () => {
        set({ isOnboarded: true, currentView: 'dashboard' })
      },

      resetOnboarding: () => {
        set({ isOnboarded: false, currentView: 'onboarding' })
      },

      // Facility collection and active facility management
      setFacilities: (facilitiesList) => {
        const list = Array.isArray(facilitiesList) ? facilitiesList : []
        const currentActive = get().activeFacility
        const activeId = typeof currentActive === 'object' ? currentActive?.id : currentActive
        const matched = (activeId && list.find((f) => f.id === activeId)) || list[0] || null

        set({
          facilities: list,
          activeFacility: matched,
          facilityName: matched?.name || get().facilityName,
          facilityType: matched?.type || get().facilityType,
          location: matched?.location || get().location,
          activeModules: matched?.activeModules || get().activeModules,
          thresholds: { ...get().thresholds, ...(matched?.thresholds || {}) },
          zones: matched?.zones || get().zones,
        })
      },

      setActiveFacility: (facilityOrId) => {
        const facs = get().facilities || []
        const fac =
          typeof facilityOrId === 'string'
            ? facs.find((f) => f.id === facilityOrId) || { id: facilityOrId, name: facilityOrId }
            : facilityOrId

        if (!fac) return

        set({
          activeFacility: fac,
          facilityName: fac?.name || get().facilityName,
          facilityType: fac?.type || get().facilityType,
          location: fac?.location || get().location,
          activeModules: fac?.activeModules || get().activeModules,
          thresholds: { ...get().thresholds, ...(fac?.thresholds || {}) },
          zones: fac?.zones || get().zones,
        })
      },

      setActiveRole: (role) => {
        const normalized = typeof role === 'string' ? role.toLowerCase() : 'admin'
        set({ activeRole: normalized })
      },

      // Apply an entire preset cleanly
      applyPreset: (presetId) => {
        const preset = FACILITY_PRESETS[presetId]
        if (!preset) return

        set({
          facilityType: preset.id,
          facilityName: preset.defaultName,
          location: preset.defaultLocation,
          activeModules: [...preset.modules],
          thresholds: { ...preset.thresholds },
          zones: [...preset.zones],
          roles: [...preset.roles],
        })
      },

      // Facility identity updates
      setFacilityType: (type) => {
        const preset = FACILITY_PRESETS[type]
        if (preset) {
          set({
            facilityType: type,
            // Keep customized name if already modified, or supply default
            facilityName: preset.defaultName,
            location: preset.defaultLocation,
            activeModules: [...preset.modules],
            thresholds: { ...preset.thresholds },
            zones: [...preset.zones],
            roles: [...preset.roles],
          })
        } else {
          set({ facilityType: type })
        }
      },

      setFacilityInfo: ({ name, location }) => {
        set((state) => ({
          facilityName: name !== undefined ? name : state.facilityName,
          location: location !== undefined ? location : state.location,
        }))
      },

      // Module configuration toggles
      toggleModule: (moduleId) => {
        set((state) => {
          const exists = state.activeModules.includes(moduleId)
          const newModules = exists
            ? state.activeModules.filter((id) => id !== moduleId)
            : [...state.activeModules, moduleId]
          return { activeModules: newModules }
        })
      },

      setModuleActive: (moduleId, isActive) => {
        set((state) => {
          const current = new Set(state.activeModules)
          if (isActive) {
            current.add(moduleId)
          } else {
            current.delete(moduleId)
          }
          return { activeModules: Array.from(current) }
        })
      },

      setActiveModules: (modules) => set({ activeModules: modules }),

      // Alert Thresholds
      setThreshold: (key, value) => {
        set((state) => ({
          thresholds: {
            ...state.thresholds,
            [key]: typeof value === 'number' ? value : parseFloat(value) || 0,
          },
        }))
      },

      updateThresholds: (newThresholds) => {
        set((state) => ({
          thresholds: {
            ...state.thresholds,
            ...newThresholds,
          },
        }))
      },

      // Zones CRUD
      addZone: (zone) => {
        const newZone = {
          id: zone.id || `zone-${Date.now()}`,
          name: zone.name || 'New Facility Zone',
          category: zone.category || 'General',
          status: zone.status || 'Active',
          sensorCount: zone.sensorCount !== undefined ? zone.sensorCount : 6,
        }
        set((state) => ({ zones: [...state.zones, newZone] }))
      },

      updateZone: (id, updatedFields) => {
        set((state) => ({
          zones: state.zones.map((z) => (z.id === id ? { ...z, ...updatedFields } : z)),
        }))
      },

      removeZone: (id) => {
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== id),
        }))
      },

      // Roles CRUD
      addRole: (role) => {
        const newRole = {
          id: role.id || `user-${Date.now()}`,
          name: role.name || 'New Stakeholder',
          email: role.email || 'user@facility.org',
          role: role.role || 'operations',
          roleLabel:
            role.role === 'admin'
              ? 'Facility Administrator'
              : role.role === 'sustainability'
              ? 'Sustainability Officer'
              : 'Operations Officer',
          permissions: role.permissions || 'Standard Dashboard & Alerts View',
          lastActive: 'Just now',
        }
        set((state) => ({ roles: [...state.roles, newRole] }))
      },

      updateRole: (id, updatedFields) => {
        set((state) => ({
          roles: state.roles.map((r) => {
            if (r.id === id) {
              const updated = { ...r, ...updatedFields }
              if (updatedFields.role) {
                updated.roleLabel =
                  updatedFields.role === 'admin'
                    ? 'Facility Administrator'
                    : updatedFields.role === 'sustainability'
                    ? 'Sustainability Officer'
                    : 'Operations Officer'
              }
              return updated
            }
            return r
          }),
        }))
      },

      removeRole: (id) => {
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id),
        }))
      },
    }),
    {
      name: 'brainchain-facility-storage',
    }
  )
)

export default useFacilityStore
