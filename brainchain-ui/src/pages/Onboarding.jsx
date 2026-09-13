import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Switch from '@radix-ui/react-switch'
import {
  Hospital,
  GraduationCap,
  Building2,
  Wind,
  Zap,
  Droplets,
  Trash2,
  Car,
  Activity,
  ShieldAlert,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Building,
  CheckCircle2,
  Layers,
  Leaf,
  Info,
  RotateCcw,
} from 'lucide-react'
import { FACILITY_PRESETS, MODULE_CONFIG } from '../config/moduleConfig'
import { useFacilityStore } from '../store/facilityStore'

// Helper map to match icon string to Lucide component
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

export default function Onboarding({ onComplete, onNavigate }) {
  const store = useFacilityStore()

  // Local step state: 1 to 5
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward

  // Local setup state initialized from store or college preset
  const initialPreset = FACILITY_PRESETS[store.facilityType] || FACILITY_PRESETS.college

  const [selectedType, setSelectedType] = useState(store.facilityType || 'college')
  const [facilityName, setFacilityName] = useState(store.facilityName || initialPreset.defaultName)
  const [location, setLocation] = useState(store.location || initialPreset.defaultLocation)
  const [activeModules, setActiveModules] = useState(
    store.activeModules.length > 0 ? store.activeModules : [...initialPreset.modules]
  )

  // Step names for top indicator
  const steps = [
    { number: 1, title: 'Welcome' },
    { number: 2, title: 'Facility Type' },
    { number: 3, title: 'Active Modules' },
    { number: 4, title: 'Facility Details' },
    { number: 5, title: 'Launch' },
  ]

  // Handler when facility type card is selected
  const handleSelectType = (typeKey) => {
    setSelectedType(typeKey)
    const preset = FACILITY_PRESETS[typeKey]
    if (preset) {
      // Auto-populate defaults from the chosen preset
      setActiveModules([...preset.modules])
      setFacilityName(preset.defaultName)
      setLocation(preset.defaultLocation)
    }
  }

  // Toggle module state
  const handleToggleModule = (moduleId) => {
    setActiveModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  // Quick preset resets
  const handleResetModules = () => {
    const preset = FACILITY_PRESETS[selectedType]
    if (preset) {
      setActiveModules([...preset.modules])
    }
  }

  const handleSelectAllModules = () => {
    setActiveModules(MODULE_CONFIG.map((m) => m.id))
  }

  // Navigation handlers
  const goToStep = (stepNumber) => {
    setDirection(stepNumber > currentStep ? 1 : -1)
    setCurrentStep(stepNumber)
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Launch dashboard handler
  const handleLaunchDashboard = () => {
    // Commit everything to global store
    store.setFacilityType(selectedType)
    store.setFacilityInfo({ name: facilityName, location })
    store.setActiveModules(activeModules)
    store.completeOnboarding()

    // Trigger external callbacks if provided
    if (onComplete) {
      onComplete({
        facilityType: selectedType,
        facilityName,
        location,
        activeModules,
      })
    } else if (onNavigate) {
      onNavigate('dashboard')
    }
  }

  // Motion animation variants for step transitions
  const stepVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  const activePreset = FACILITY_PRESETS[selectedType] || FACILITY_PRESETS.college

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gray-50/95 text-gray-900 backdrop-blur-xl overflow-y-auto antialiased">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-teal-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Top Header & Progress Dots */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200/80">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-gray-50 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-emerald-400 bg-clip-text text-transparent">
                BrainChain
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Setup Engine
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Sustainable Facility Intelligence
            </p>
          </div>
        </div>

        {/* Progress Dots Indicator */}
        <nav aria-label="Setup Steps" className="flex items-center gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const isCompleted = step.number < currentStep
            const isCurrent = step.number === currentStep

            return (
              <div key={step.number} className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(step.number)}
                  className={`group relative flex items-center gap-2 focus:outline-none transition-all ${
                    isCurrent
                      ? 'text-gray-900'
                      : isCompleted
                      ? 'text-emerald-400 cursor-pointer'
                      : 'text-gray-500'
                  }`}
                  title={step.title}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-emerald-500 text-gray-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/40'
                        : isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 group-hover:bg-emerald-500/30'
                        : 'bg-gray-50/80 border border-gray-200/60 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium tracking-wide">
                    {step.title}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-4 sm:w-6 rounded transition-colors duration-300 ${
                      step.number < currentStep ? 'bg-emerald-500' : 'bg-gray-50'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </nav>
      </header>

      {/* Main Step Body with Framer-motion Transitions */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ========================================================= */}
          {/* STEP 1: WELCOME SCREEN */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8 my-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>One Codebase · Many Facility Types</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    BrainChain
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                    Sustainable Facility Intelligence
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  A modular AI-powered decision support platform tailored for Indian institutional estates.
                  Configure air quality, energy baselines, waste sorting, and sustainability scorecards in minutes.
                </p>
              </div>

              {/* Highlight Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-left">
                <div className="p-3.5 rounded-xl bg-white/80 border border-gray-200 shadow-md">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Plug & Play Catalog</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    8 self-contained modules composed on-the-fly without code rewrites.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 border border-gray-200 shadow-md">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
                    <Wind className="w-4 h-4" />
                    <span>CPCB & IoT Feeds</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Real public pollution data with synthetic sensor streams for energy & water.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 border border-gray-200 shadow-md">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Role-Based Views</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Targeted insight surfaces for Admins, Operations, and ESG Sustainability Officers.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: CHOOSE FACILITY TYPE */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 my-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  Choose Facility Type
                </h2>
                <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
                  Select your institutional domain. BrainChain will load targeted module presets,
                  alert baselines, and spatial zones suited for your estate.
                </p>
              </div>

              {/* 3 Large Vertical Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {Object.values(FACILITY_PRESETS).map((preset) => {
                  const isSelected = selectedType === preset.id
                  const IconComponent = PRESET_ICON_MAP[preset.icon] || Building

                  // Color themes for card styling
                  const themeStyles = {
                    hospital: {
                      border: isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/40 bg-gradient-to-b from-rose-950/30 to-gray-50'
                        : 'border-gray-200 hover:border-rose-500/40 bg-white/60',
                      badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
                      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                      glow: 'group-hover:bg-rose-500/5',
                    },
                    college: {
                      border: isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-200/40 bg-gradient-to-b from-emerald-950/30 to-gray-50'
                        : 'border-gray-200 hover:border-emerald-500/40 bg-white/60',
                      badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                      glow: 'group-hover:bg-emerald-500/5',
                    },
                    corporate: {
                      border: isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-xl shadow-blue-200/40 bg-gradient-to-b from-blue-950/30 to-gray-50'
                        : 'border-gray-200 hover:border-blue-500/40 bg-white/60',
                      badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
                      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                      glow: 'group-hover:bg-blue-500/5',
                    },
                  }[preset.id]

                  return (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.025, y: -4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectType(preset.id)}
                      className={`group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between text-left ${themeStyles.border}`}
                    >
                      {/* Selection Ribbon Badge */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-gray-950 font-semibold text-xs shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Selected</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Preset Icon */}
                        <div className={`w-13 h-13 rounded-xl flex items-center justify-center ${themeStyles.iconBg}`}>
                          <IconComponent className="w-7 h-7" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Preset Archetype
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                            {preset.name}
                          </h3>
                          <p className="text-sm font-medium text-emerald-400/90 mt-0.5">
                            {preset.tagline}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                          {preset.description}
                        </p>

                        {/* Bullets */}
                        <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                          {preset.highlights.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="text-emerald-400 font-bold mt-0.5">▪</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Default Modules:</span>
                        <span className="font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {preset.modules.length} active of 8
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: CONFIGURE MODULES */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5 my-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                    Configure Modules
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Review and toggle active analytics modules. Loaded defaults for{' '}
                    <span className="text-emerald-400 font-semibold">{activePreset.name}</span>.
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleResetModules}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-gray-50 text-gray-600 border border-gray-200/60 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Preset</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllModules}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enable All (8)</span>
                  </button>
                </div>
              </div>

              {/* 8 Module Cards Grid with Switch toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {MODULE_CONFIG.map((mod) => {
                  const isChecked = activeModules.includes(mod.id)
                  const Icon = MODULE_ICON_MAP[mod.icon] || Activity

                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleToggleModule(mod.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isChecked
                          ? 'bg-white/90 border-emerald-500/40 shadow-sm shadow-emerald-200/30'
                          : 'bg-white/30 border-gray-200/80 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div>
                        {/* Top: Icon + Switch */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${mod.bgColor} ${mod.accentColor} border ${mod.borderColor}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Accessible Switch Component from Radix UI */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch.Root
                              checked={isChecked}
                              onCheckedChange={() => handleToggleModule(mod.id)}
                              className="w-10 h-5 bg-gray-50 rounded-full relative data-[state=checked]:bg-emerald-500 outline-none transition-colors cursor-pointer border border-gray-200"
                            >
                              <Switch.Thumb className="block w-3.5 h-3.5 bg-white rounded-full transition-transform duration-150 will-change-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                            </Switch.Root>
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 tracking-tight">
                              {mod.name}
                            </h4>
                            <span className="text-[10px] uppercase font-semibold text-gray-500">
                              {mod.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      {/* Data tier badge */}
                      <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 font-mono">Source:</span>
                        <span className="text-gray-600 font-medium">{mod.dataTier}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Status summary */}
              <div className="p-3.5 rounded-xl bg-white/60 border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>
                    Selected <strong className="text-emerald-400">{activeModules.length}</strong> of 8 modules.
                    All modules adhere to the unified core schema.
                  </span>
                </div>
                <span className="text-gray-500 hidden sm:inline">
                  Adjustable anytime in Configure Settings
                </span>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: NAME YOUR FACILITY */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-2xl mx-auto w-full space-y-6 my-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  Name Your Facility
                </h2>
                <p className="text-sm text-gray-500">
                  Identify your institutional facility and anchor its operational coordinates.
                </p>
              </div>

              <div className="bg-white/80 border border-gray-200 rounded-2xl p-6 space-y-5 shadow-xl">
                {/* Facility Name Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="facilityName" className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Facility / Campus Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="facilityName"
                      type="text"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="e.g. BPUT Main Campus"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    This name will appear on official dashboards, alerts, and ESG summary reports.
                  </p>
                </div>

                {/* Facility Location Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="facilityLocation" className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Geographic Location / City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="facilityLocation"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Rourkela, Odisha"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Used to link real-time CPCB ambient air quality telemetry and regional weather baselines.
                  </p>
                </div>

                {/* Live Preview Card */}
                <div className="mt-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-2">
                    Header Preview
                  </span>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {facilityName ? facilityName.charAt(0) : 'F'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          {facilityName || 'Unnamed Facility'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-emerald-400 font-medium">{activePreset.name}</span>
                          <span>•</span>
                          <span>{location || 'Location Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {activeModules.length} Modules Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: LAUNCH DASHBOARD */}
          {/* ========================================================= */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-2xl mx-auto w-full space-y-6 my-auto text-center"
            >
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto shadow-xl shadow-emerald-500/20">
                  <div className="w-full h-full bg-gray-50 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  Ready to Launch Dashboard
                </h2>
                <p className="text-sm text-gray-500 max-w-lg mx-auto">
                  Your facility twin configuration is assembled. Click below to initialize real-time
                  decision intelligence telemetry.
                </p>
              </div>

              {/* Summary Overview Card */}
              <div className="bg-white/80 border border-gray-200 rounded-2xl p-5 text-left space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Target Facility
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                      {facilityName || 'Unnamed Facility'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{location || 'Location Not Set'}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      Profile Archetype
                    </span>
                    <div className="mt-0.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activePreset.name}</span>
                    </div>
                  </div>
                </div>

                {/* Active Modules Pills */}
                <div>
                  <span className="text-[11px] font-semibold text-gray-600 block mb-2">
                    Active Telemetry Modules ({activeModules.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModules.map((id) => {
                      const mod = MODULE_CONFIG.find((m) => m.id === id)
                      if (!mod) return null
                      return (
                        <span
                          key={id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200/80 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{mod.shortName || mod.name}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Default Thresholds Snapshot */}
                <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-gray-50/60 border border-gray-200">
                    <span className="text-gray-500 block text-[10px] uppercase">AQI Limit</span>
                    <strong className="text-emerald-400 text-sm font-semibold">
                      {activePreset.thresholds.aqiLimit || 100} AQI
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50/60 border border-gray-200">
                    <span className="text-gray-500 block text-[10px] uppercase">Energy Limit</span>
                    <strong className="text-amber-400 text-sm font-semibold">
                      {activePreset.thresholds.energyLimitKwh || 3200} kWh
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50/60 border border-gray-200">
                    <span className="text-gray-500 block text-[10px] uppercase">Bin Fill Alert</span>
                    <strong className="text-teal-400 text-sm font-semibold">
                      {activePreset.thresholds.binFillLimitPct || 80}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Large Launch Button */}
              <div className="pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLaunchDashboard}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-gray-950" />
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-5 h-5 text-gray-950" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Action / Navigation Bar */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 border-t border-gray-200/80 flex items-center justify-between">
        {/* Back Button */}
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200/60 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {/* Step Info Counter */}
        <div className="text-xs text-gray-500 font-medium">
          Step <span className="text-emerald-400 font-bold">{currentStep}</span> of 5
        </div>

        {/* Next / Proceed Button */}
        {currentStep < 5 && (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>{currentStep === 1 ? 'Get Started' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {currentStep === 5 && (
          <button
            type="button"
            onClick={handleLaunchDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>Launch Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  )
}
