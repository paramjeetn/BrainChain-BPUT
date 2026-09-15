import React, { useState, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from './components/shell/AppShell'
import { useFacilityStore } from './store/facilityStore'

import AirQualityPanel from './components/modules/AirQualityPanel'
import EnergyPanel from './components/modules/EnergyPanel'
import WaterPanel from './components/modules/WaterPanel'
import WastePanel from './components/modules/WastePanel'
import TrafficPanel from './components/modules/TrafficPanel'
import AssetPanel from './components/modules/AssetPanel'
import SafetyPanel from './components/modules/SafetyPanel'
import ScorecardPanel from './components/modules/ScorecardPanel'
import AIInsightPanel from './components/ai/AIInsightPanel'
import ZoneMapPanel from './components/modules/ZoneMapPanel'
import { ModuleSummaryCard } from './components/modules/ModuleSummaryCard'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import LandingPage from './pages/LandingPage'

import { DashboardControlHub } from './components/dashboard/DashboardControlHub'
import { ModuleStudioFocus } from './components/dashboard/ModuleStudioFocus'
import { ModuleMetricsMatrix } from './components/dashboard/ModuleMetricsMatrix'

const PANEL_COMPONENTS = {
  air_quality: AirQualityPanel,
  energy: EnergyPanel,
  water: WaterPanel,
  waste: WastePanel,
  traffic: TrafficPanel,
  scorecard: ScorecardPanel,
  safety: SafetyPanel,
  assets: AssetPanel,
  asset_utilization: AssetPanel,
  zone_map: ZoneMapPanel,
}

// ─── Facility summary strip ─────────────────────────────────────────────────
function FacilitySummaryBar({ facility }) {
  const typeColors = {
    college:   'text-emerald-700 bg-emerald-50 border-emerald-200',
    hospital:  'text-rose-700 bg-rose-50 border-rose-200',
    corporate: 'text-blue-700 bg-blue-50 border-blue-200',
  }
  const typeColor = typeColors[facility?.type] || 'text-gray-500 bg-gray-50 border-gray-200'
  const moduleCount = facility?.activeModules?.length || 8

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-white/90 border-b border-gray-200 text-sm shrink-0">
      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold capitalize tracking-wide ${typeColor}`}>
        {facility?.type || 'Facility'}
      </span>
      <span className="text-gray-900 truncate font-semibold text-[13px]">{facility?.name || 'My Facility'}</span>
      <span className="text-gray-300 text-xs">|</span>
      <span className="text-gray-500 hidden md:block text-xs">
        <span className="text-gray-900 font-bold">{moduleCount}</span> connected subsystems
      </span>
      <span className="text-gray-300 hidden lg:block text-xs">|</span>
      <span className="text-gray-400 hidden lg:block text-xs truncate">{facility?.location || ''}</span>
    </div>
  )
}

// ─── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div>
        <h2 className="text-[13px] font-bold text-gray-800 leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {count != null && (
        <span className="ml-auto text-[11px] font-mono font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
          {count} active
        </span>
      )}
    </div>
  )
}

// ─── Main dashboard view ─────────────────────────────────────────────────────
function DashboardView() {
  const store = useFacilityStore()
  const navigate = useNavigate()
  const { activeFacility, activeModules: storeActiveModules, isOnboarded, currentView } = store
  const [detailModule, setDetailModule] = useState(null)

  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [activeStudioModule, setActiveStudioModule] = useState('energy')
  const [timeRange, setTimeRange] = useState('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLiveSyncing, setIsLiveSyncing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setDetailModule(null) }
    if (detailModule) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [detailModule])

  const activeModules = useMemo(() => {
    return activeFacility?.activeModules || storeActiveModules || [
      'energy', 'water', 'waste', 'traffic', 'safety', 'scorecard', 'air_quality', 'assets'
    ]
  }, [activeFacility, storeActiveModules])

  const filteredModules = useMemo(() => {
    let list = [...activeModules]
    if (activeCategory === 'sustainability') list = list.filter(m => ['energy', 'water', 'waste', 'scorecard'].includes(m))
    else if (activeCategory === 'operations')   list = list.filter(m => ['traffic', 'assets', 'asset_utilization'].includes(m))
    else if (activeCategory === 'safety')       list = list.filter(m => ['air_quality', 'safety'].includes(m))
    else if (activeCategory === 'anomalies')    list = list.filter(m => ['energy', 'waste'].includes(m))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(m => m.toLowerCase().includes(q))
    }
    return list
  }, [activeModules, activeCategory, searchQuery])

  const handleTriggerSync = () => {
    setIsLiveSyncing(true)
    setTimeout(() => {
      setIsLiveSyncing(false)
      showToast('Live IoT telemetry feeds synchronized across all subsystems.')
    }, 800)
  }

  const handleSimulateAnomaly = () => {
    setActiveCategory('anomalies')
    setActiveStudioModule('waste')
    setViewMode('studio')
    showToast('Waste Fill spike simulated in Canteen Sector. Remediation available in Studio.')
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const DetailComponent = detailModule ? PANEL_COMPONENTS[detailModule] : null

  return (
    <AppShell>
      <FacilitySummaryBar facility={activeFacility} />

      {/* Sticky Command Hub */}
      <DashboardControlHub
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        timeRange={timeRange}
        onChangeTimeRange={setTimeRange}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        anomalyCount={2}
        isLiveSyncing={isLiveSyncing}
        onTriggerSync={handleTriggerSync}
        onSimulateAnomaly={handleSimulateAnomaly}
      />

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-[88px] right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl shadow-2xl border border-white/10 text-xs font-medium max-w-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-5 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">

          {/* ── VIEW: BENTO GRID ─────────────────────────────────── */}
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              {/* Module Cards Section */}
              <section>
                <SectionHeader
                  title="Subsystem Overview"
                  subtitle={`Live IoT telemetry · ${
                    timeRange === '1h' ? 'Last 1 hour' :
                    timeRange === '24h' ? '24-hour rolling' :
                    timeRange === '7d' ? '7-day average' :
                    '+24H AI forecast'
                  }`}
                  count={filteredModules.length}
                />

                {filteredModules.length > 0 ? (
                  <BentoModuleGrid
                    modules={filteredModules}
                    onCardClick={setDetailModule}
                    onFocusStudio={(id) => { setActiveStudioModule(id); setViewMode('studio') }}
                    timeRange={timeRange}
                  />
                ) : (
                  <EmptyState
                    onReset={() => { setActiveCategory('all'); setSearchQuery('') }}
                  />
                )}
              </section>

              {/* Spatial Intelligence Deck */}
              <section>
                <SectionHeader
                  title="Spatial Intelligence"
                  subtitle="Zone map · AI recommendations"
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  <div className="lg:col-span-7 h-[460px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                    <ZoneMapPanel />
                  </div>
                  <div className="lg:col-span-5 h-[460px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                    <AIInsightPanel />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ── VIEW: STUDIO FOCUS ───────────────────────────────── */}
          {viewMode === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <ModuleStudioFocus
                activeModuleId={activeStudioModule}
                onSelectModule={setActiveStudioModule}
                onOpenFullDetail={setDetailModule}
                timeRange={timeRange}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-7 h-[440px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                  <ZoneMapPanel />
                </div>
                <div className="lg:col-span-5 h-[440px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                  <AIInsightPanel />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── VIEW: METRICS MATRIX ─────────────────────────────── */}
          {viewMode === 'matrix' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <ModuleMetricsMatrix
                modules={filteredModules}
                onFocusModule={(id) => { setActiveStudioModule(id); setViewMode('studio') }}
                onOpenDetail={setDetailModule}
              />
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                <AIInsightPanel />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {detailModule && DetailComponent && (
          <motion.div
            key="modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-[3px]"
            onClick={() => setDetailModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white border border-gray-200"
            >
              <DetailComponent className="min-h-full border-none rounded-2xl bg-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

// ─── Bento Module Grid ────────────────────────────────────────────────────────
// Creates a visually structured Bento grid:
//   Row 1: 4 equal cards (always first 4)
//   Row 2: wide card (col-span-2) + 2 normal cards (if 5–8 modules)
//   Remaining: standard 4-col grid
function BentoModuleGrid({ modules, onCardClick, onFocusStudio, timeRange = '24h' }) {
  if (modules.length === 0) return null

  // Split into rows for the Bento layout
  const row1 = modules.slice(0, 4)      // 4 top KPI cards
  const row2 = modules.slice(4, 7)      // next 3: one wide + 2 standard
  const rowRest = modules.slice(7)      // any additional

  return (
    <div className="space-y-4">
      {/* Row 1 — Four equal KPI cards */}
      {row1.length > 0 && (
        <div className={`grid gap-4 ${
          row1.length === 1 ? 'grid-cols-1 sm:grid-cols-2' :
          row1.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          row1.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {row1.map((moduleId, i) => (
            <motion.div
              key={moduleId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <ModuleSummaryCard
                moduleId={moduleId}
                onClick={onCardClick}
                onFocusStudio={onFocusStudio}
                timeRange={timeRange}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Row 2 — Featured wide card + 2 standard cards */}
      {row2.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Wide featured card */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModuleSummaryCard
              moduleId={row2[0]}
              onClick={onCardClick}
              onFocusStudio={onFocusStudio}
              featured
              timeRange={timeRange}
            />
          </motion.div>

          {/* Two standard cards */}
          {row2.slice(1).map((moduleId, i) => (
            <motion.div
              key={moduleId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: (i + 5) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <ModuleSummaryCard
                moduleId={moduleId}
                onClick={onCardClick}
                onFocusStudio={onFocusStudio}
                timeRange={timeRange}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Remaining modules — 4-col grid */}
      {rowRest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rowRest.map((moduleId, i) => (
            <motion.div
              key={moduleId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: (i + 7) * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <ModuleSummaryCard
                moduleId={moduleId}
                onClick={onCardClick}
                onFocusStudio={onFocusStudio}
                timeRange={timeRange}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">No subsystems match your filters</p>
      <p className="text-xs text-gray-400 mb-4 text-center max-w-xs">Try a different category or clear your search to see all connected modules.</p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-700 transition-colors active:scale-95"
      >
        Clear Filters
      </button>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardView />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
