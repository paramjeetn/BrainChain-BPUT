import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Zap, Droplets, Wind, Trash2, ShieldAlert,
  Activity, ArrowRight, BarChart3, Cpu, Globe, CheckCircle2,
  TrendingDown, Award
} from 'lucide-react'
import { useFacilityStore } from '../store/facilityStore'

const FEATURES = [
  { icon: Zap,        title: 'Energy Intelligence',   desc: 'Real-time kWh tracking with ML anomaly detection and 24h load forecasting.',      color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { icon: Droplets,   title: 'Water Management',      desc: 'Tank level monitoring, depletion prediction and zone-level consumption analytics.', color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  { icon: Wind,       title: 'Air Quality Monitoring', desc: 'Live AQI, PM2.5 & CO₂ sensors with ventilation recommendations and alerts.',      color: 'text-cyan-500',   bg: 'bg-cyan-50',   border: 'border-cyan-200'  },
  { icon: Trash2,     title: 'Smart Waste Dispatch',  desc: 'Ultrasonic bin-fill tracking with route-optimised smart collection scheduling.',    color: 'text-emerald-500',bg: 'bg-emerald-50',border: 'border-emerald-200'},
  { icon: ShieldAlert,title: 'Safety & Compliance',   desc: 'Incident tracking, safety zone monitoring and automated compliance reporting.',      color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200'   },
  { icon: Award,      title: 'ESG Scorecard',         desc: 'Composite sustainability score with trend analysis and carbon-offset tracking.',     color: 'text-teal-500',   bg: 'bg-teal-50',   border: 'border-teal-200'  },
]

const STATS = [
  { value: '40%', label: 'Average energy saved', icon: TrendingDown },
  { value: '3×',  label: 'Faster incident response', icon: ShieldAlert },
  { value: '88%', label: 'Forecast accuracy', icon: BarChart3 },
  { value: '100%', label: 'IoT coverage', icon: Cpu },
]

const FACILITIES = [
  { type: 'Corporate', name: 'TCS Infopark', desc: 'HVAC optimization & occupancy-driven energy savings' },
  { type: 'Hospital',  name: 'KIMS Medical', desc: 'Biomedical waste compliance & critical power monitoring' },
  { type: 'Campus',    name: 'BPUT University', desc: 'Multi-zone water metering & student transit analytics' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const setActiveFacility = useFacilityStore(s => s.setActiveFacility)
  const completeOnboarding = useFacilityStore(s => s.completeOnboarding)

  const handleLiveDemo = () => {
    // Set KIMS hospital as the demo active facility with full data
    useFacilityStore.setState({
      activeFacility: {
        id: 'kims-hospital',
        name: 'Apollo - KIMS Super Specialty Hospital',
        location: 'Bhubaneswar, Odisha',
        type: 'hospital',
        activeModules: ['energy', 'water', 'waste', 'air_quality', 'safety', 'scorecard'],
      },
      facilityType: 'hospital',
      facilityName: 'Apollo - KIMS Super Specialty Hospital',
      isOnboarded: true,
    })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-emerald-700">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">BrainChain</span>
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">AI Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/register')}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-sm font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 shadow-sm shadow-emerald-200 transition-all flex items-center gap-1.5"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/></span>
            AI-Powered · Live Telemetry · ML Forecasting
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.08] mb-6">
            Intelligent Facility<br/>
            <span className="text-emerald-600">Operations Platform</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            BrainChain gives your campus, hospital, or office a unified AI brain — combining real-time IoT sensors, predictive ML models, and ESG compliance in one dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all text-base flex items-center gap-2"
            >
              Register your Facility <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLiveDemo}
              className="px-7 py-3.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-base flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-emerald-600" /> View Live Demo
            </button>
          </div>
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden bg-gray-50"
        >
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-mono text-gray-400">brainchain.io/dashboard — BPUT Campus · Live</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {[
              { label: 'Energy Load', val: '1,247 kWh', sub: '+4.2% vs baseline', color: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
              { label: 'Water Reserves', val: '68%', sub: 'Main Reservoir', color: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
              { label: 'Air Quality', val: '45 AQI', sub: 'Good — All zones', color: 'bg-cyan-50 border-cyan-200', dot: 'bg-cyan-500' },
              { label: 'ESG Score', val: '74.2 pts', sub: '+1.5 this month', color: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
            ].map((card, i) => (
              <div key={i} className={`rounded-xl border p-4 ${card.color}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2 h-2 rounded-full ${card.dot}`} />
                  <span className="text-xs font-semibold text-gray-500">{card.label}</span>
                </div>
                <div className="text-2xl font-black text-gray-900">{card.val}</div>
                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 h-20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-700">AI Insight · High Confidence</div>
                <div className="text-xs text-gray-500 mt-0.5">Block B HVAC recorded 2.3σ anomaly. Forecast shows elevated consumption tomorrow. Schedule inspection.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-gray-400 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Everything your facility needs</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Each module is an independent AI sub-system you can toggle based on what sensors you have deployed.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              className={`p-6 rounded-2xl border bg-white hover:shadow-md transition-all ${f.border}`}
            >
              <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-4 border ${f.border}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Built for every facility type</h2>
            <p className="text-gray-500 text-lg">AI baselines auto-adjust to your facility type on first registration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FACILITIES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">{f.type}</div>
                <div className="text-xl font-black text-gray-900 mb-2">{f.name}</div>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Ready to make your facility intelligent?</h2>
          <p className="text-gray-500 text-lg mb-8">Register your organization in under 2 minutes. No hardware required to start.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all text-lg flex items-center gap-2 mx-auto"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
            {['No credit card', 'Local SQLite DB', 'Open source'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" />{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-gray-700">BrainChain</span>
          <span className="text-gray-300">·</span>
          <span>Sustainable Facility Intelligence Platform</span>
        </div>
        <p>Built for the hackathon · BPUT 2026</p>
      </footer>
    </div>
  )
}
