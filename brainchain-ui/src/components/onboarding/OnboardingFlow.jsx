import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, GraduationCap, Hospital as HospitalIcon, 
  ChevronRight, CheckCircle2, Zap, Droplets, Wind, Trash2, 
  Car, ShieldAlert, Activity, LayoutDashboard, Brain
} from 'lucide-react';
import { useFacilityStore } from '../../store/facilityStore';
import { FACILITY_PRESETS, MODULE_CONFIG } from '../../config/moduleConfig';

const ICONS = {
  energy: Zap,
  water: Droplets,
  air_quality: Wind,
  waste: Trash2,
  traffic: Car,
  safety: ShieldAlert,
  assets: Building2,
  scorecard: Activity
};

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { completeOnboarding } = useFacilityStore();
  
  const [orgData, setOrgData] = useState({
    name: '',
    location: '',
    type: 'corporate'
  });

  const [selectedModules, setSelectedModules] = useState([...FACILITY_PRESETS.corporate.modules]);

  const handlePresetSelect = (presetId) => {
    const preset = FACILITY_PRESETS[presetId];
    setOrgData(prev => ({ ...prev, type: presetId, name: preset.defaultName, location: preset.defaultLocation }));
    setSelectedModules([...preset.modules]);
  };

  const toggleModule = (modId) => {
    setSelectedModules(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const facilityId = orgData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // Register with the local SQLite backend
      const res = await fetch('http://localhost:3001/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: facilityId,
          name: orgData.name || 'My Facility',
          location: orgData.location || 'Unknown Location',
          type: orgData.type,
          activeModules: selectedModules
        })
      });
      
      if (!res.ok) throw new Error('Failed to create facility');
      
      useFacilityStore.setState({
        facilityName: orgData.name || 'My Facility',
        location: orgData.location || 'Unknown Location',
        facilityType: orgData.type,
        activeModules: selectedModules,
        activeFacility: {
          id: facilityId,
          name: orgData.name || 'My Facility',
          location: orgData.location || 'Unknown Location',
          type: orgData.type,
          activeModules: selectedModules,
        }
      });
      completeOnboarding();
      if (onComplete) onComplete();
      else navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Error creating organization. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-emerald-600">
          <Brain className="w-6 h-6" />
          <span className="font-bold text-lg tracking-tight">BrainChain</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <span className={step >= 1 ? 'text-emerald-600' : ''}>Organization</span>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className={step >= 2 ? 'text-emerald-600' : ''}>Modules</span>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className={step >= 3 ? 'text-emerald-600' : ''}>Initialize</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Register your organization</h2>
              <p className="text-gray-500 mb-8">Select a facility type to load AI baselines and presets.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'corporate', icon: Building2, title: 'Corporate Campus', desc: 'Commercial real estate & tech parks' },
                  { id: 'college', icon: GraduationCap, title: 'Educational Campus', desc: 'Universities & school districts' },
                  { id: 'hospital', icon: HospitalIcon, title: 'Medical Facility', desc: 'Hospitals & clinical zones' }
                ].map(preset => (
                  <div 
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`cursor-pointer rounded-xl p-5 border-2 transition-all duration-200 ${
                      orgData.type === preset.id 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      orgData.type === preset.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <preset.icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold mb-1 ${orgData.type === preset.id ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {preset.title}
                    </h3>
                    <p className="text-xs text-gray-500">{preset.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Facility Name</label>
                  <input 
                    type="text" 
                    value={orgData.name}
                    onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                    placeholder="e.g. TCS Infopark"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={orgData.location}
                    onChange={(e) => setOrgData({...orgData, location: e.target.value})}
                    placeholder="e.g. Mumbai, India"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  disabled={!orgData.name || !orgData.location}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select IoT Modules</h2>
              <p className="text-gray-500 mb-8">Choose the intelligent sub-systems to activate for your facility.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {MODULE_CONFIG.map(mod => {
                  const isSelected = selectedModules.includes(mod.id);
                  const Icon = ICONS[mod.id] || LayoutDashboard;
                  return (
                    <div 
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`cursor-pointer flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{mod.name}</h4>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{mod.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-all"
                >
                  Back
                </button>
                <button 
                  disabled={selectedModules.length === 0}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  Confirm Modules
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                {loading && (
                  <div className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                )}
                <Brain className={`w-10 h-10 text-emerald-600 ${loading ? 'animate-pulse' : ''}`} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {loading ? 'Provisioning AI Engine...' : 'Ready for Launch'}
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-10">
                {loading 
                  ? `Initializing historical baselines and forecasting models for ${orgData.name}.` 
                  : 'Your intelligent facility dashboard is fully configured and ready.'}
              </p>

              <button 
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-80 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {loading ? 'Optimizing Parameters...' : 'Launch Dashboard'}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
