import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Switch from '@radix-ui/react-switch'
import {
  Wind,
  Zap,
  Droplets,
  Trash2,
  Car,
  Activity,
  ShieldAlert,
  Sparkles,
  Sliders,
  Layers,
  Users,
  Bell,
  MapPin,
  Building,
  Check,
  CheckCircle2,
  Save,
  Plus,
  Trash,
  Edit3,
  X,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Building2,
  GraduationCap,
  Hospital,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useFacilityStore } from '../store/facilityStore'
import { MODULE_CONFIG, FACILITY_PRESETS } from '../config/moduleConfig'

// Icon mapping helpers
const MODULE_ICON_MAP = {
  Wind,
  Zap,
  Droplets,
  Trash2,
  Car,
  Activity,
  ShieldAlert,
  Sparkles,
}

const PRESET_ICON_MAP = {
  Hospital,
  GraduationCap,
  Building2,
}

export default function Configure({ onNavigate }) {
  const store = useFacilityStore()

  // Local editable state initialized from global store
  const [activeModules, setActiveModules] = useState([...store.activeModules])
  const [thresholds, setThresholds] = useState({ ...store.thresholds })
  const [zones, setZones] = useState([...store.zones])
  const [roles, setRoles] = useState([...store.roles])
  const [facilityName, setFacilityName] = useState(store.facilityName)
  const [location, setLocation] = useState(store.location)

  // Save feedback state
  const [isSaved, setIsSaved] = useState(false)

  // Add/Edit Zone states
  const [isAddingZone, setIsAddingZone] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneCategory, setNewZoneCategory] = useState('Academic')
  const [newZoneSensors, setNewZoneSensors] = useState(12)
  const [editingZoneId, setEditingZoneId] = useState(null)
  const [editingZoneName, setEditingZoneName] = useState('')
  const [editingZoneCategory, setEditingZoneCategory] = useState('')

  // Add Role / User states
  const [isAddingRole, setIsAddingRole] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('operations')

  // Switch presets quickly
  const handleApplyPreset = (presetKey) => {
    const preset = FACILITY_PRESETS[presetKey]
    if (!preset) return

    store.applyPreset(presetKey)
    setActiveModules([...preset.modules])
    setThresholds({ ...preset.thresholds })
    setZones([...preset.zones])
    setRoles([...preset.roles])
    setFacilityName(preset.defaultName)
    setLocation(preset.defaultLocation)

    triggerSavedFeedback()
  }

  // Module toggle
  const handleToggleModule = (moduleId) => {
    setActiveModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  // Threshold change
  const handleThresholdChange = (key, val) => {
    const num = parseFloat(val)
    setThresholds((prev) => ({
      ...prev,
      [key]: isNaN(num) ? '' : num,
    }))
  }

  // Zones CRUD (UI demo state + committed on Save)
  const handleAddZone = (e) => {
    e?.preventDefault()
    if (!newZoneName.trim()) return

    const newZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      category: newZoneCategory,
      status: 'Monitored',
      sensorCount: parseInt(newZoneSensors, 10) || 8,
    }

    setZones((prev) => [...prev, newZone])
    setNewZoneName('')
    setIsAddingZone(false)
  }

  const handleStartEditZone = (zone) => {
    setEditingZoneId(zone.id)
    setEditingZoneName(zone.name)
    setEditingZoneCategory(zone.category)
  }

  const handleSaveEditZone = (id) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === id ? { ...z, name: editingZoneName, category: editingZoneCategory } : z
      )
    )
    setEditingZoneId(null)
  }

  const handleRemoveZone = (id) => {
    setZones((prev) => prev.filter((z) => z.id !== id))
  }

  // Roles CRUD
  const handleAddRoleUser = (e) => {
    e?.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return

    const roleLabelMap = {
      admin: 'Facility Administrator',
      operations: 'Operations Officer',
      sustainability: 'Sustainability Officer',
    }

    const permissionsMap = {
      admin: 'Full System Control, Module Setup, Crisis Override',
      operations: 'Active Alarms, Route Dispatch, Maintenance Logging',
      sustainability: 'ESG Compliance, Scope Emissions, Sustainability Reports',
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      roleLabel: roleLabelMap[newUserRole] || 'Team Member',
      permissions: permissionsMap[newUserRole] || 'Standard Dashboard View',
      lastActive: 'Just now',
    }

    setRoles((prev) => [...prev, newUser])
    setNewUserName('')
    setNewUserEmail('')
    setIsAddingRole(false)
  }

  const handleRoleChange = (userId, newRole) => {
    const roleLabelMap = {
      admin: 'Facility Administrator',
      operations: 'Operations Officer',
      sustainability: 'Sustainability Officer',
    }
    const permissionsMap = {
      admin: 'Full System Control, Module Setup, Crisis Override',
      operations: 'Active Alarms, Route Dispatch, Maintenance Logging',
      sustainability: 'ESG Compliance, Scope Emissions, Sustainability Reports',
    }

    setRoles((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
              roleLabel: roleLabelMap[newRole] || u.roleLabel,
              permissions: permissionsMap[newRole] || u.permissions,
            }
          : u
      )
    )
  }

  const handleRemoveRole = (userId) => {
    setRoles((prev) => prev.filter((u) => u.id !== userId))
  }

  // Trigger Save & Framer-motion success notification
  const triggerSavedFeedback = () => {
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
    }, 2800)
  }

  const handleSaveAll = () => {
    store.setActiveModules(activeModules)
    store.updateThresholds(thresholds)
    store.setFacilityInfo({ name: facilityName, location })

    // Also update zones and roles in store
    useFacilityStore.setState({
      zones: [...zones],
      roles: [...roles],
    })

    triggerSavedFeedback()
  }

  const currentPreset = FACILITY_PRESETS[store.facilityType] || FACILITY_PRESETS.college
  const PresetIcon = PRESET_ICON_MAP[currentPreset.icon] || Building

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Save Success Toast Banner */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white border border-emerald-500/60 text-gray-900 shadow-2xl shadow-emerald-500/20"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Configuration Saved!</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Live
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Facility parameters & module telemetry thresholds updated.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ========================================================= */}
        {/* HEADER: FACILITY CONFIGURATION + NAME */}
        {/* ========================================================= */}
        <header className="bg-white/70 border border-gray-200/90 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Administration & Estate Registry</span>
              </div>

              <div className="flex items-baseline flex-wrap gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  Facility Configuration
                </h1>
                <span className="text-gray-500 text-2xl font-light hidden sm:inline">/</span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  {facilityName || store.facilityName}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-3 pt-1 text-xs text-gray-500">
                {/* Facility Type Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-emerald-300 border border-emerald-500/30 font-medium">
                  <PresetIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentPreset.name}</span>
                </div>

                {/* Location Badge */}
                <div className="inline-flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>{location || store.location}</span>
                </div>

                <span className="text-gray-600">•</span>

                {/* Active Modules Counter */}
                <span className="text-gray-600">
                  <strong className="text-emerald-400">{activeModules.length}</strong> of 8 Modules Active
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center flex-wrap gap-3">
              {/* Preset Switcher Quick Buttons */}
              <div className="p-1 rounded-xl bg-gray-50/80 border border-gray-200 flex items-center gap-1 text-xs">
                <span className="text-gray-500 text-[10px] uppercase font-bold px-2">Preset:</span>
                {Object.values(FACILITY_PRESETS).map((p) => {
                  const isActivePreset = store.facilityType === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        isActivePreset
                          ? 'bg-emerald-500 text-gray-950 font-bold shadow'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title={`Switch to ${p.name} defaults`}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  )
                })}
              </div>

              {/* Save Button with Animation */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Quick Facility Name & Location Inline Edit */}
          <div className="mt-6 pt-5 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cfgFacilityName" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Facility Display Name
              </label>
              <input
                id="cfgFacilityName"
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="cfgFacilityLocation" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Geographic Location
              </label>
              <input
                id="cfgFacilityLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SECTION 1: ACTIVE MODULES (SWITCH TOGGLES) */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Section 1: Active Modules</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Plug-and-play module catalog. Enabling a module immediately connects its ingestion adapter to the unified core schema.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveModules(MODULE_CONFIG.map((m) => m.id))}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition cursor-pointer"
              >
                Enable All
              </button>
              <button
                type="button"
                onClick={() => setActiveModules([...currentPreset.modules])}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
              >
                Preset Default
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULE_CONFIG.map((mod) => {
              const isActive = activeModules.includes(mod.id)
              const Icon = MODULE_ICON_MAP[mod.icon] || Activity

              return (
                <div
                  key={mod.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'bg-white/90 border-emerald-500/40 shadow-md shadow-emerald-200/30'
                      : 'bg-white/30 border-gray-200/70 opacity-65 hover:opacity-90'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon + Radix Switch */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.bgColor} ${mod.accentColor} border ${mod.borderColor}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Radix UI Switch Component */}
                      <Switch.Root
                        checked={isActive}
                        onCheckedChange={() => handleToggleModule(mod.id)}
                        className="w-11 h-6 bg-gray-50 rounded-full relative data-[state=checked]:bg-emerald-500 outline-none transition-colors cursor-pointer border border-gray-200"
                        id={`switch-${mod.id}`}
                      >
                        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-150 will-change-transform data-[state=checked]:translate-x-5 translate-x-1" />
                      </Switch.Root>
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`switch-${mod.id}`}
                          className="text-base font-bold text-gray-900 tracking-tight cursor-pointer"
                        >
                          {mod.name}
                        </label>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {mod.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    {/* Monitored Metrics Pills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {mod.metrics.map((m, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-50 text-gray-600 border border-gray-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Ingestion Data Source Tier */}
                  <div className="mt-4 pt-3 border-t border-gray-200/70 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Ingestion Tier:</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        mod.dataTier.includes('Real')
                          ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                          : mod.dataTier.includes('Synthetic')
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                      }`}
                    >
                      {mod.dataTier}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ALERT THRESHOLDS */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Section 2: Alert Thresholds</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Parametric threshold limits feeding into the anomaly detection engine. Exceeding these triggers automated route dispatch, advisories, and load throttling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Threshold 1: AQI Limit */}
            <div className="bg-white/80 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Air Quality Limit</h3>
                    <p className="text-[11px] text-gray-500">CPCB PM2.5 / AQI Index</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  AQI
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Threshold Limit:</span>
                  <span className="text-sky-400 font-bold text-sm">
                    {thresholds.aqiLimit || 100} AQI
                  </span>
                </div>
                <input
                  type="number"
                  min="20"
                  max="500"
                  step="5"
                  value={thresholds.aqiLimit || ''}
                  onChange={(e) => handleThresholdChange('aqiLimit', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-base font-semibold focus:outline-none focus:border-sky-500"
                />
              </div>

              <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
                Triggers facility-wide ventilation alarms, HVAC positive pressurization, and pollution hotspot advisories.
              </p>
            </div>

            {/* Threshold 2: Peak Energy Limit */}
            <div className="bg-white/80 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Energy Consumption</h3>
                    <p className="text-[11px] text-gray-500">Daily Demand Ceiling</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  kWh / day
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Threshold Limit:</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {thresholds.energyLimitKwh || 3200} kWh
                  </span>
                </div>
                <input
                  type="number"
                  min="500"
                  max="20000"
                  step="100"
                  value={thresholds.energyLimitKwh || ''}
                  onChange={(e) => handleThresholdChange('energyLimitKwh', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-base font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
                Dispatches load shedding alerts, optimizes chiller sets, and recommends peak tariff battery discharge.
              </p>
            </div>

            {/* Threshold 3: Bin Fill % Limit */}
            <div className="bg-white/80 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Bin Fill Level</h3>
                    <p className="text-[11px] text-gray-500">Smart Waste Clearing</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  % Fill
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Threshold Limit:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {thresholds.binFillLimitPct || 80}%
                  </span>
                </div>
                <input
                  type="number"
                  min="40"
                  max="100"
                  step="5"
                  value={thresholds.binFillLimitPct || ''}
                  onChange={(e) => handleThresholdChange('binFillLimitPct', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono text-base font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
                Auto-generates optimized collection truck routes and flags potential overflow or biomedical hazards.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: ZONES MANAGEMENT (LIST WITH ADD / EDIT / REMOVE) */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-teal-400" />
                <span>Section 3: Zones & Spatial Blocks</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Spatial breakdown for sub-metered energy, air quality hotspots, and waste bins across the campus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZones([...currentPreset.zones])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default Zones</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddingZone(!isAddingZone)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isAddingZone ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isAddingZone ? 'Cancel' : 'Add Zone'}</span>
              </button>
            </div>
          </div>

          {/* Add Zone Inline Form */}
          <AnimatePresence>
            {isAddingZone && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddZone}
                className="bg-white border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Create New Spatial Zone</span>
                  </h3>
                  <span className="text-xs text-gray-500">Add to facility monitoring matrix</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="newZoneName" className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Zone / Building Name *
                    </label>
                    <input
                      id="newZoneName"
                      type="text"
                      placeholder="e.g. Mechanical Workshop B"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newZoneCategory" className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Functional Category
                    </label>
                    <select
                      id="newZoneCategory"
                      value={newZoneCategory}
                      onChange={(e) => setNewZoneCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Laboratories">Laboratories</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Critical Care">Critical Care</option>
                      <option value="Workspaces">Workspaces</option>
                      <option value="Residential">Residential</option>
                      <option value="Transit">Transit / Parking</option>
                      <option value="Utilities">Utilities & HVAC</option>
                      <option value="Bio-Hazard">Bio-Hazard / Waste</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="newZoneSensors" className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Installed Sensors Count
                    </label>
                    <input
                      id="newZoneSensors"
                      type="number"
                      min="1"
                      max="100"
                      value={newZoneSensors}
                      onChange={(e) => setNewZoneSensors(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingZone(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-gray-950 bg-emerald-500 hover:bg-emerald-400 transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    Save Zone
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Zones Table / List */}
          <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Zone Identifier</th>
                    <th className="py-3 px-4 font-semibold">Classification</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-center">Telemetry Nodes</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80 text-gray-600">
                  {zones.map((zone) => {
                    const isEditing = editingZoneId === zone.id

                    return (
                      <tr key={zone.id} className="hover:bg-gray-50/40 transition">
                        {/* Zone Name */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingZoneName}
                              onChange={(e) => setEditingZoneName(e.target.value)}
                              className="px-2.5 py-1 rounded bg-gray-50 border border-emerald-500 text-gray-900 text-xs w-full max-w-xs focus:outline-none"
                            />
                          ) : (
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <span>{zone.name}</span>
                              <span className="text-[10px] font-mono text-gray-500">{zone.id}</span>
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingZoneCategory}
                              onChange={(e) => setEditingZoneCategory(e.target.value)}
                              className="px-2.5 py-1 rounded bg-gray-50 border border-emerald-500 text-gray-900 text-xs w-28 focus:outline-none"
                            />
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                              {zone.category}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{zone.status || 'Active'}</span>
                          </span>
                        </td>

                        {/* Sensor Count */}
                        <td className="py-3 px-4 text-center font-mono text-xs text-gray-600">
                          {zone.sensorCount || 12} sensors
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEditZone(zone.id)}
                                className="px-2 py-1 rounded bg-emerald-500 text-gray-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditZone(zone)}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
                                title="Edit Zone"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveZone(zone.id)}
                              className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete Zone"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {zones.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500 text-xs">
                        No active zones configured. Click "Add Zone" or "Reset Default Zones".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: ROLE MANAGEMENT (ADMIN, OPS, SUSTAINABILITY) */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Section 4: Role Management & Access Control</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Tailor who sees what. The dashboard filters views based on roles: Admin (Scorecards + Overrides), Operations (Alerts + Dispatches), Sustainability (ESG + Carbon Audits).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingRole(!isAddingRole)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-gray-900 transition cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {isAddingRole ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAddingRole ? 'Cancel' : 'Invite Member'}</span>
            </button>
          </div>

          {/* Add Stakeholder User Inline Form */}
          <AnimatePresence>
            {isAddingRole && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddRoleUser}
                className="bg-white border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>Invite Facility Stakeholder</span>
                  </h3>
                  <span className="text-xs text-gray-500">Assign role-based access scope</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="newUserName" className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="newUserName"
                      type="text"
                      placeholder="e.g. Sunita Dash"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newUserEmail" className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Institutional Email *
                    </label>
                    <input
                      id="newUserEmail"
                      type="email"
                      placeholder="e.g. s.dash@facility.ac.in"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newUserRole" className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Assigned Role
                    </label>
                    <select
                      id="newUserRole"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="admin">Facility Administrator</option>
                      <option value="operations">Operations Officer</option>
                      <option value="sustainability">Sustainability Officer</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingRole(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-gray-900 bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    Grant Access
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Roles Table */}
          <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">User & Identity</th>
                    <th className="py-3.5 px-4 font-semibold">Assigned Role</th>
                    <th className="py-3.5 px-4 font-semibold">Permission Scope</th>
                    <th className="py-3.5 px-4 font-semibold">Last Active</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80 text-gray-600">
                  {roles.map((user) => {
                    const roleBadgeStyles = {
                      admin: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                      operations: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                      sustainability: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
                    }[user.role] || 'bg-gray-50 text-gray-600 border-gray-200'

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/40 transition">
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-600 flex items-center justify-center text-xs font-bold text-gray-900">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Role */}
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-gray-50 cursor-pointer focus:outline-none ${roleBadgeStyles}`}
                          >
                            <option value="admin">Administrator</option>
                            <option value="operations">Operations Officer</option>
                            <option value="sustainability">Sustainability Officer</option>
                          </select>
                        </td>

                        {/* Permissions */}
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {user.permissions}
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">
                          {user.lastActive || 'Recently'}
                        </td>

                        {/* Remove Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(user.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Revoke User Access"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BOTTOM SAVE ACTION BAR */}
        {/* ========================================================= */}
        <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-white/90 border border-gray-200 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="hidden sm:inline">
              Changes are immediately applied to real-time ingestion filters and analytics modules.
            </span>
            <span className="sm:hidden">Ready to apply changes.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('dashboard')
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            >
              Back to Dashboard
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 shadow-xl shadow-emerald-500/20 transition cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Configuration Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
