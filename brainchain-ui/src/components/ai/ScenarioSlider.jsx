import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import {
  FlaskConical as BeakerIcon,
  Play,
  RotateCcw,
  Zap,
  Droplets,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Thermometer,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { useFacilityStore } from '../../store/useFacilityStore';

/**
 * ScenarioSlider
 * 
 * Interactive simulation panel allowing administrators and operators to perturb
 * facility parameters (Occupancy, Temperature, Hour of Day) and observe immediate
 * AI forecast impacts on energy, water, and alert probability.
 */
export function ScenarioSlider() {
  const activeFacility = useFacilityStore((state) => state.activeFacility);

  // Baseline facility parameters from store or sensible defaults
  const facilityBaselineOccupancy = activeFacility?.occupancy ?? 65;
  const facilityBaselineTemp = activeFacility?.temperature ?? 25;
  const currentHour = new Date().getHours();

  // Slider states
  const [occupancy, setOccupancy] = useState(facilityBaselineOccupancy);
  const [temperature, setTemperature] = useState(facilityBaselineTemp);
  const [hourOfDay, setHourOfDay] = useState(currentHour);

  // Simulation run state and computed results
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Update slider baselines when active facility changes
  useEffect(() => {
    if (activeFacility) {
      const newBaseOcc = activeFacility.occupancy ?? 65;
      const newBaseTemp = activeFacility.temperature ?? 25;
      setOccupancy(newBaseOcc);
      setTemperature(newBaseTemp);
      setHasRun(false);
      setSimulationResult(null);
    }
  }, [activeFacility?.id]);

  // Compute forecast impact metrics
  const calculateImpact = (occ, temp, hour) => {
    const baseOcc = facilityBaselineOccupancy || 50;

    // Energy change: +/- X% based on occupancy * 0.3 + thermal deviation penalty
    const occDelta = occ - baseOcc;
    const thermalStress = temp > 25 ? (temp - 25) * 0.7 : (20 - temp > 0 ? (20 - temp) * 0.4 : 0);
    const energyChangeNum = (occDelta * 0.3) + thermalStress;
    const energyChangeFormatted = (energyChangeNum >= 0 ? '+' : '') + energyChangeNum.toFixed(1) + '%';

    // Water change: +/- X% based on occupancy * 0.15
    const waterChangeNum = occDelta * 0.15;
    const waterChangeFormatted = (waterChangeNum >= 0 ? '+' : '') + waterChangeNum.toFixed(1) + '%';

    // Alert probability calculation based on all three factors
    let alertScore = 10; // Baseline 10%
    if (occ > 75) alertScore += (occ - 75) * 0.9;
    if (temp > 32) alertScore += (temp - 32) * 2.8;
    if (temp < 18) alertScore += (18 - temp) * 1.8;
    if (hour >= 11 && hour <= 16) alertScore += 12; // Peak hours penalty
    if (occ > 90 && temp > 36) alertScore += 18; // Compounded overload risk

    const alertProbability = Math.min(Math.max(Math.round(alertScore), 5), 98);

    // AI Contextual narrative based on simulation results
    let narrative = '';
    if (alertProbability >= 65) {
      narrative = `Critical stress scenario: High occupancy (${occ}%) and ${temp}°C ambient temperature induce high transformer peak loading at ${String(hour).padStart(2, '0')}:00. Automated load shedding recommended.`;
    } else if (energyChangeNum < -5) {
      narrative = `Low demand scenario: Load shedding potential verified (-${Math.abs(energyChangeNum).toFixed(1)}% kWh). Favorable window for scheduled equipment maintenance or solar storage charging.`;
    } else {
      narrative = `Moderate operating envelope: Facility systems absorb the shift with minor HVAC throttling required (+${Math.abs(energyChangeNum).toFixed(1)}% power swing).`;
    }

    return {
      energyChange: energyChangeFormatted,
      energyChangeNum,
      waterChange: waterChangeFormatted,
      waterChangeNum,
      alertProbability,
      narrative,
    };
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);

    // Provide a brief realistic AI computation delay
    setTimeout(() => {
      const results = calculateImpact(occupancy, temperature, hourOfDay);
      setSimulationResult(results);
      setHasRun(true);
      setIsSimulating(false);
    }, 280);
  };

  const handleReset = () => {
    setOccupancy(facilityBaselineOccupancy);
    setTemperature(facilityBaselineTemp);
    setHourOfDay(currentHour);
    setHasRun(false);
    setSimulationResult(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shadow-sm border border-emerald-100">
            <BeakerIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 tracking-wide">
              Scenario Simulation
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Perturb facility conditions to see forecast impact
            </p>
          </div>
        </div>

        {/* Reset button */}
        {(hasRun || occupancy !== facilityBaselineOccupancy || temperature !== facilityBaselineTemp) && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset parameters to baseline"
            className="text-gray-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-gray-100/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sliders Container */}
      <div className="space-y-4 pt-1">
        {/* Slider 1: Occupancy % */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Occupancy</span>
            </div>
            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50/80 border border-emerald-700/50 text-emerald-600 text-xs shadow-inner">
              {occupancy}%
            </span>
          </div>

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
            value={[occupancy]}
            onValueChange={([val]) => setOccupancy(val)}
            min={0}
            max={100}
            step={5}
            aria-label="Occupancy percentage"
          >
            <Slider.Track className="bg-gray-50/90 relative grow rounded-full h-2 border border-gray-200 overflow-hidden">
              <Slider.Range className="absolute bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4.5 h-4.5 bg-emerald-400 border-2 border-white rounded-full shadow-md shadow-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-transform cursor-grab active:cursor-grabbing" />
          </Slider.Root>

          <div className="flex justify-between text-[10px] text-gray-500 px-0.5">
            <span>0% (Empty)</span>
            <span className="text-gray-500">Baseline: {facilityBaselineOccupancy}%</span>
            <span>100% (Max)</span>
          </div>
        </div>

        {/* Slider 2: Temperature °C */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-teal-400" />
              <span>Ambient Temperature</span>
            </div>
            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-teal-50/80 border border-teal-700/50 text-teal-300 text-xs shadow-inner">
              {temperature}°C
            </span>
          </div>

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
            value={[temperature]}
            onValueChange={([val]) => setTemperature(val)}
            min={15}
            max={45}
            step={1}
            aria-label="Ambient Temperature in Celsius"
          >
            <Slider.Track className="bg-gray-50/90 relative grow rounded-full h-2 border border-gray-200 overflow-hidden">
              <Slider.Range className="absolute bg-gradient-to-r from-teal-500 to-amber-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4.5 h-4.5 bg-teal-400 border-2 border-white rounded-full shadow-md shadow-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-transform cursor-grab active:cursor-grabbing" />
          </Slider.Root>

          <div className="flex justify-between text-[10px] text-gray-500 px-0.5">
            <span>15°C (Cool)</span>
            <span className="text-gray-500">Standard: 25°C</span>
            <span>45°C (Extreme Heat)</span>
          </div>
        </div>

        {/* Slider 3: Hour of Day */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Hour of Day</span>
            </div>
            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-800 text-xs shadow-inner">
              {String(hourOfDay).padStart(2, '0')}:00 hrs
            </span>
          </div>

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
            value={[hourOfDay]}
            onValueChange={([val]) => setHourOfDay(val)}
            min={0}
            max={23}
            step={1}
            aria-label="Hour of Day"
          >
            <Slider.Track className="bg-gray-50/90 relative grow rounded-full h-2 border border-gray-200 overflow-hidden">
              <Slider.Range className="absolute bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4.5 h-4.5 bg-emerald-400 border-2 border-white rounded-full shadow-md shadow-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-transform cursor-grab active:cursor-grabbing" />
          </Slider.Root>

          <div className="flex justify-between text-[10px] text-gray-500 px-0.5">
            <span>00:00 (Midnight)</span>
            <span className="text-gray-500">Current: {String(currentHour).padStart(2, '0')}:00</span>
            <span>23:00 (Night)</span>
          </div>
        </div>
      </div>

      {/* 'Run Simulation' Button (emerald gradient) */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-400 text-gray-900 font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-75 cursor-pointer"
        >
          {isSimulating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span className="text-sm">Computing Forecast Matrix...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span className="text-sm tracking-wide">Run Simulation</span>
            </>
          )}
        </button>
      </div>

      {/* Forecast Impact Section (Animated with framer-motion) */}
      <AnimatePresence>
        {hasRun && simulationResult && (
          <motion.div
            key="simulation-impact-result"
            initial={{ opacity: 0, height: 0, y: 12 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="overflow-hidden mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-gray-700 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Forecast Impact
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                {activeFacility?.name || 'Facility Model'}
              </span>
            </div>

            {/* Impact Metric Cards Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Energy Change */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[11px] font-medium">Energy</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-sm font-bold font-mono ${
                      simulationResult.energyChangeNum > 0
                        ? 'text-amber-400'
                        : simulationResult.energyChangeNum < 0
                        ? 'text-emerald-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {simulationResult.energyChange}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                  {simulationResult.energyChangeNum > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      <span>Grid Draw</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-emerald-700" />
                      <span>Shedding</span>
                    </>
                  )}
                </div>
              </div>

              {/* Water Change */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[11px] font-medium">Water</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-sm font-bold font-mono ${
                      simulationResult.waterChangeNum > 0
                        ? 'text-cyan-400'
                        : simulationResult.waterChangeNum < 0
                        ? 'text-emerald-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {simulationResult.waterChange}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                  {simulationResult.waterChangeNum > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span>Usage Shift</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-emerald-700" />
                      <span>Conserved</span>
                    </>
                  )}
                </div>
              </div>

              {/* Alert Probability */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[11px] font-medium">Alert Risk</span>
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${
                      simulationResult.alertProbability >= 65
                        ? 'text-red-700'
                        : simulationResult.alertProbability >= 35
                        ? 'text-amber-400'
                        : 'text-emerald-700'
                    }`}
                  />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-sm font-bold font-mono ${
                      simulationResult.alertProbability >= 65
                        ? 'text-red-700'
                        : simulationResult.alertProbability >= 35
                        ? 'text-amber-400'
                        : 'text-emerald-700'
                    }`}
                  >
                    {simulationResult.alertProbability}%
                  </span>
                </div>
                {/* Visual probability bar */}
                <div className="w-full bg-gray-50 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      simulationResult.alertProbability >= 65
                        ? 'bg-red-500'
                        : simulationResult.alertProbability >= 35
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${simulationResult.alertProbability}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Narrative Commentary */}
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/30 border border-emerald-800/40 text-[11px] text-gray-700 leading-relaxed">
              <span className="font-semibold text-emerald-700 mr-1">AI Recommendation:</span>
              {simulationResult.narrative}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScenarioSlider;
