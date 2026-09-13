import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from './components/shell/AppShell'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
const ResponsiveGridLayout = WidthProvider(Responsive)
import { useFacilityStore } from './store/facilityStore'
import { useLayoutStore } from './store/layoutStore'

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

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'scorecard',         x: 0,  y: 0, w: 3, h: 5 },
    { i: 'energy',            x: 3,  y: 0, w: 3, h: 5 },
    { i: 'water',             x: 6,  y: 0, w: 3, h: 5 },
    { i: 'waste',             x: 9,  y: 0, w: 3, h: 5 },
    { i: 'zone_map',          x: 0,  y: 5, w: 6, h: 6 },
    { i: 'air_quality',       x: 6,  y: 5, w: 3, h: 5 },
    { i: 'traffic',           x: 9,  y: 5, w: 3, h: 5 },
    { i: 'safety',            x: 6,  y: 10, w: 3, h: 5 },
    { i: 'assets',            x: 9,  y: 10, w: 3, h: 5 },
    { i: 'ai_insights',       x: 0,  y: 11, w: 12, h: 12 },
  ],
  md: [
    { i: 'scorecard',   x: 0, y: 0, w: 4, h: 5 },
    { i: 'energy',      x: 4, y: 0, w: 4, h: 5 },
    { i: 'water',       x: 0, y: 5, w: 4, h: 5 },
    { i: 'waste',       x: 4, y: 5, w: 4, h: 5 },
    { i: 'zone_map',    x: 0, y: 10, w: 8, h: 6 },
    { i: 'air_quality', x: 0, y: 16, w: 4, h: 5 },
    { i: 'traffic',     x: 4, y: 16, w: 4, h: 5 },
    { i: 'safety',      x: 0, y: 21, w: 4, h: 5 },
    { i: 'assets',      x: 4, y: 21, w: 4, h: 5 },
    { i: 'ai_insights', x: 0, y: 26, w: 8, h: 12 },
  ],
  sm: [
    { i: 'scorecard',   x: 0, y: 0,  w: 4, h: 5 },
    { i: 'energy',      x: 0, y: 5,  w: 4, h: 5 },
    { i: 'water',       x: 0, y: 10, w: 4, h: 5 },
    { i: 'waste',       x: 0, y: 15, w: 4, h: 5 },
    { i: 'zone_map',    x: 0, y: 20, w: 4, h: 6 },
    { i: 'air_quality', x: 0, y: 26, w: 4, h: 5 },
    { i: 'ai_insights', x: 0, y: 31, w: 4, h: 12 },
  ],
}

// Facility summary bar below topbar
function FacilitySummaryBar({ facility }) {
  const typeColors = {
    college:   'text-emerald-700 bg-emerald-50 border-emerald-200',
    hospital:  'text-rose-700 bg-rose-50 border-rose-200',
    corporate: 'text-blue-700 bg-blue-50 border-blue-200',
  }
  const typeColor = typeColors[facility?.type] || 'text-gray-500 bg-gray-50 border-gray-200'
  const moduleCount = facility?.activeModules?.length || 7

  return (
    <div className="flex items-center gap-4 px-5 py-2.5 bg-white/80 border-b border-gray-100 text-sm backdrop-blur-sm">
      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize ${typeColor}`}>
        {facility?.type || 'Facility'}
      </span>
      <span className="text-gray-500 truncate font-medium">{facility?.name || 'My Facility'}</span>
      <span className="text-gray-300">•</span>
      <span className="text-gray-400 hidden md:block">
        <span className="text-gray-800 font-semibold">{moduleCount}</span> active modules
      </span>
      <span className="text-gray-300 hidden lg:block">•</span>
      <span className="text-gray-400 hidden lg:block">{facility?.location || ''}</span>
    </div>
  )
}

// The main dashboard view
function DashboardView() {
  const store = useFacilityStore()
  const navigate = useNavigate()
  const { activeFacility, activeModules: storeActiveModules, isOnboarded, currentView } = store
  const { layouts, updateLayout } = useLayoutStore()
  const [savedLayouts, setSavedLayouts] = useState(layouts || DEFAULT_LAYOUTS)
  const [detailModule, setDetailModule] = useState(null)

  // Redirect to register if not onboarded
  useEffect(() => {
    if (!isOnboarded || currentView === 'onboarding') {
      navigate('/register')
    }
  }, [isOnboarded, currentView, navigate])

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setDetailModule(null) }
    if (detailModule) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [detailModule])

  const activeModules = activeFacility?.activeModules || storeActiveModules || [
    'energy', 'water', 'waste', 'traffic', 'safety', 'scorecard', 'air_quality'
  ]
  const activePanels = [...activeModules.filter(m => PANEL_COMPONENTS[m]), 'zone_map', 'ai_insights']
  const filteredLayouts = {
    lg: DEFAULT_LAYOUTS.lg.filter(l => activePanels.includes(l.i)),
    md: DEFAULT_LAYOUTS.md.filter(l => activePanels.includes(l.i)),
    sm: DEFAULT_LAYOUTS.sm.filter(l => activePanels.includes(l.i)),
  }

  const handleLayoutChange = (_, allLayouts) => {
    setSavedLayouts(allLayouts)
    if (updateLayout) updateLayout(allLayouts)
  }

  const DetailComponent = detailModule ? PANEL_COMPONENTS[detailModule] : null

  if (!isOnboarded) return null

  return (
    <AppShell>
      <FacilitySummaryBar facility={activeFacility} />
      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFacility?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ResponsiveGridLayout
              className="layout"
              layouts={filteredLayouts}
              breakpoints={{ lg: 1200, md: 800, sm: 480 }}
              cols={{ lg: 12, md: 8, sm: 4 }}
              rowHeight={32}
              margin={[14, 14]}
              draggableHandle=".panel-drag-handle"
              onLayoutChange={handleLayoutChange}
              useCSSTransforms={true}
            >
              {activePanels.map(moduleId => {
                if (moduleId === 'ai_insights') {
                  return (
                    <div key="ai_insights" className="h-full">
                      <AIInsightPanel />
                    </div>
                  )
                }
                if (moduleId === 'zone_map') {
                  return (
                    <div key="zone_map" className="h-full">
                      <ZoneMapPanel />
                    </div>
                  )
                }
                return (
                  <div key={moduleId}>
                    <ModuleSummaryCard moduleId={moduleId} onClick={setDetailModule} />
                  </div>
                )
              })}
            </ResponsiveGridLayout>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModule && DetailComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/25 backdrop-blur-[3px]"
            onClick={() => setDetailModule(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white border border-gray-200 ring-1 ring-gray-100"
            >
              <DetailComponent className="min-h-full border-none rounded-2xl bg-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

// Register page wrapper
function RegisterPage() {
  const { isOnboarded } = useFacilityStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isOnboarded) navigate('/dashboard')
  }, [isOnboarded, navigate])

  return <OnboardingFlow onComplete={() => navigate('/dashboard')} />
}

// Root App with routing
export default function App() {
  const { isOnboarded } = useFacilityStore()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={isOnboarded ? <DashboardView /> : <Navigate to="/register" replace />}
      />
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
