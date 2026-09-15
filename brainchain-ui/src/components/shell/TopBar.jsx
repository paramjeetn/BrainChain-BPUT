import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Activity,
  Check,
  MapPin,
  Settings,
  X,
  Brain,
  LogOut,
  RotateCcw,
} from 'lucide-react'
import { useFacilityStore } from '../../store/facilityStore'

const DEFAULT_FACILITIES = [
  {
    id: 'hospital',
    name: 'KIMS Medical Campus',
    type: 'hospital',
    typeName: 'Hospital',
    location: 'Bhubaneswar, Odisha',
    summary: '24/7 critical power, medical gas & biomedical waste',
    color: 'indigo',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    activeCardClass: 'border-indigo-500/80 bg-indigo-50/30 shadow-indigo-200/50',
    hoverCardClass: 'hover:border-indigo-500/40 hover:bg-indigo-50/20',
    iconBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  },
  {
    id: 'college',
    name: 'BPUT Engineering Campus',
    type: 'college',
    typeName: 'College Campus',
    location: 'Rourkela, Odisha',
    summary: 'Multi-zone energy, water metering & student transit',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-200',
    activeCardClass: 'border-emerald-500/80 bg-emerald-50/30 shadow-emerald-200/50',
    hoverCardClass: 'hover:border-emerald-500/40 hover:bg-emerald-50/20',
    iconBg: 'bg-emerald-500/20 text-emerald-600 border border-emerald-200',
  },
  {
    id: 'corporate',
    name: 'TCS Infopark Phase II',
    type: 'corporate',
    typeName: 'Corporate Office',
    location: 'Bhubaneswar, Odisha',
    summary: 'Occupancy-driven HVAC, ESG scorecard & smart indoor air',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    activeCardClass: 'border-amber-500/80 bg-amber-50/30 shadow-amber-200/50',
    hoverCardClass: 'hover:border-amber-500/40 hover:bg-amber-50/20',
    iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
]

export default function TopBar() {
  const store = typeof useFacilityStore === 'function' ? useFacilityStore() : {}
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [localFacilityId, setLocalFacilityId] = useState('hospital')
  const popoverRef = useRef(null)

  // Facilities resolution
  const facilities = useMemo(() => {
    const storeFacilities = store?.facilities
    if (Array.isArray(storeFacilities) && storeFacilities.length > 0) {
      return storeFacilities.map((sf) => {
        const typeKey = (sf.type || sf.id || '').toLowerCase()
        const defaultMatch = DEFAULT_FACILITIES.find(
          (df) => df.id === sf.id || df.type === typeKey
        )
        return {
          ...defaultMatch,
          ...sf,
          typeName: sf.typeName || defaultMatch?.typeName || (sf.type ? sf.type.toUpperCase() : 'Facility'),
          badgeClass: defaultMatch?.badgeClass || 'bg-gray-50 text-gray-700 border-gray-200',
          activeCardClass: defaultMatch?.activeCardClass || 'border-emerald-500 bg-emerald-50/20',
          hoverCardClass: defaultMatch?.hoverCardClass || 'hover:border-gray-200 hover:bg-gray-100/40',
          iconBg: defaultMatch?.iconBg || 'bg-gray-50 text-gray-700',
        }
      })
    }
    return DEFAULT_FACILITIES
  }, [store?.facilities])

  // Current active facility
  const activeFacilityId = useMemo(() => {
    const active = store?.activeFacility
    if (typeof active === 'string') return active
    if (active && typeof active === 'object' && active.id) return active.id
    if (store?.currentFacility?.id) return store.currentFacility.id
    return localFacilityId
  }, [store?.activeFacility, store?.currentFacility, localFacilityId])

  const currentFacility = useMemo(() => {
    return facilities.find((f) => f.id === activeFacilityId) || facilities[0]
  }, [facilities, activeFacilityId])

  // Handle facility switch
  const handleSelectFacility = (fac) => {
    setLocalFacilityId(fac.id)
    if (typeof store?.setActiveFacility === 'function') {
      store.setActiveFacility(fac.id)
    }
    setIsPickerOpen(false)
  }

  // Handle reset onboarding (register new org)
  const handleResetOnboarding = () => {
    if (typeof store?.resetOnboarding === 'function') {
      store.resetOnboarding()
    }
    setIsSettingsOpen(false)
  }

  // Dismiss dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPickerOpen(false)
      }
    }
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPickerOpen])

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between relative z-40 select-none">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-200">
          <Brain className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-gray-900 leading-none flex items-center gap-1.5">
            BrainChain
          </span>
          <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">
            Facility Intelligence
          </span>
        </div>
      </div>

      {/* Center: Facility selector */}
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsPickerOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200/60 hover:border-gray-300 text-gray-900 transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          aria-expanded={isPickerOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100/60 text-emerald-700">
            <Building2 className="w-3.5 h-3.5" />
          </div>

          <span className="text-sm font-semibold text-gray-900 tracking-tight max-w-[160px] sm:max-w-[240px] truncate">
            {currentFacility?.name}
          </span>

          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${currentFacility?.badgeClass}`}
          >
            {currentFacility?.typeName || currentFacility?.type}
          </span>

          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isPickerOpen ? 'rotate-180 text-gray-900' : ''
            }`}
          />
        </button>

        {/* Facility Picker Popover */}
        <AnimatePresence>
          {isPickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-84 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl p-2.5 z-50 "
            >
              <div className="px-2 py-1.5 mb-1 flex items-center justify-between border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Select Facility
                </span>
                <span className="text-[10px] text-gray-500 font-mono">3 Presets</span>
              </div>

              <div className="flex flex-col gap-2 mt-1.5">
                {facilities.map((fac) => {
                  const isSelected = fac.id === activeFacilityId
                  return (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => handleSelectFacility(fac)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-3 ${
                        isSelected
                          ? `${fac.activeCardClass} border`
                          : `border-gray-100 bg-gray-50/50 hover:bg-gray-100 ${fac.hoverCardClass}`
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5 ${fac.iconBg}`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {fac.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${fac.badgeClass}`}
                          >
                            {fac.typeName}
                          </span>
                        </div>

                        {fac.location && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="truncate">{fac.location}</span>
                          </div>
                        )}

                        {fac.summary && (
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">
                            {fac.summary}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Live Data + Settings */}
      <div className="flex items-center gap-3">
        {/* LIVE DATA status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50/40 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wider select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity className="w-3.5 h-3.5 text-emerald-700" />
          <span className="tracking-widest">LIVE DATA</span>
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
          title="Settings"
        >
          <Settings className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Settings Slide-over Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50"
              onClick={() => setIsSettingsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              key="settings-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">BrainChain</h2>
                    <p className="text-xs text-gray-400">v1.0 · Facility Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Current Facility */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Facility</p>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">{currentFacility?.name || '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentFacility?.location || '—'}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      {currentFacility?.typeName || currentFacility?.type || '—'}
                    </span>
                  </div>
                </div>

                {/* Facility Switcher */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Switch Facility</p>
                  <div className="space-y-2">
                    {facilities.map(fac => (
                      <button
                        key={fac.id}
                        onClick={() => { handleSelectFacility(fac); setIsSettingsOpen(false); }}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-medium ${fac.id === activeFacilityId ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                      >
                        {fac.name}
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">{fac.location}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
