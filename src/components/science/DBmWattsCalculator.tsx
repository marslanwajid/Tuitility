'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface CalculationResult {
  solveMode: 'dbmToWatts' | 'wattsToDbm';
  inputPower: number;
  inputUnit: string;
  impedance: number;
  
  // Power units
  powerDbm: number;
  powerDbw: number;
  powerW: number;
  powerMw: number;
  powerUw: number;
  powerNw: number;
  powerKw: number;
  powerMwLinear: number; // Megawatts (MW)

  // Derived electrical units (at impedance Z)
  vRms: number;
  vPeak: number;
  vPp: number;
  vDbuv: number;
  iRms: number;

  steps: string[];
}

interface Benchmark {
  value: number; // in dBm
  label: string;
  desc: string;
  icon: string;
}

const POWER_BENCHMARKS: Benchmark[] = [
  { value: 60, label: 'FM Transmitter', desc: 'Typical high-power broadcast station (1 kW)', icon: 'fa-broadcast-tower' },
  { value: 43, label: 'LTE Base Station', desc: 'Typical cellular tower transmitter output (20 W)', icon: 'fa-signal' },
  { value: 30, label: 'Mobile Phone Max', desc: 'Maximum cellular transmitter burst power (1 W)', icon: 'fa-mobile-alt' },
  { value: 20, label: 'Wi-Fi Router Tx', desc: 'Typical Wi-Fi transmit power limit (100 mW)', icon: 'fa-wifi' },
  { value: 0, label: '1 mW Standard', desc: 'Zero reference level for dBm calculations', icon: 'fa-dot-circle' },
  { value: -30, label: 'Strong RF Signal', desc: 'Receiver very close to transmitter (1 µW)', icon: 'fa-arrow-down' },
  { value: -70, label: 'Good Wi-Fi / LTE', desc: 'Reliable connection indicator (100 pW)', icon: 'fa-check-circle' },
  { value: -90, label: 'Wi-Fi Rx Limit', desc: 'Average sensitivity limit for connection (1 pW)', icon: 'fa-exclamation-circle' },
  { value: -110, label: 'LTE Out-of-Service', desc: 'Typical celular cell boundary edge drop (10 fW)', icon: 'fa-times-circle' },
  { value: -174, label: 'Thermal Noise Floor', desc: 'Theoretical limit in 1 Hz bandwidth at room temp', icon: 'fa-snowflake' },
];

export default function DBmWattsCalculator() {
  const [solveMode, setSolveMode] = useState<'dbmToWatts' | 'wattsToDbm'>('dbmToWatts');
  const [inputValue, setInputValue] = useState<string>('0');
  const [inputUnit, setInputUnit] = useState<string>('dBm'); // dBm, dBW or linear (W, mW, uW, nW, kW, MW)
  const [impedance, setImpedance] = useState<string>('50');
  const [activeField, setActiveField] = useState<'power' | 'impedance'>('power');

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // SVG Wave Visualizer animation references
  const pathRef = useRef<SVGPathElement>(null);
  const timeRef = useRef<number>(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Synchronize input unit when mode changes
  useEffect(() => {
    if (solveMode === 'dbmToWatts') {
      setInputUnit('dBm');
      setInputValue('0');
    } else {
      setInputUnit('W');
      setInputValue('1');
    }
    setError('');
  }, [solveMode]);

  // Recalculate silently on change if previously calculated
  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [inputValue, inputUnit, impedance, solveMode]);

  // Oscilloscope Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      timeRef.current += 0.05;
      if (pathRef.current) {
        const width = 800;
        const height = 100;
        const points = [];

        // Determine current dBm to drive amplitude visually
        let dbm = 0;
        if (result) {
          dbm = result.powerDbm;
        } else {
          const val = parseFloat(inputValue) || 0;
          if (solveMode === 'dbmToWatts') {
            dbm = inputUnit === 'dBW' ? val + 30 : val;
          } else {
            const linearWatts = convertToWatts(val, inputUnit);
            dbm = linearWatts > 0 ? 10 * Math.log10(linearWatts) + 30 : -150;
          }
        }

        // Clamp dBm to reasonable visual range (-100 to +40 dBm)
        const minDbm = -100;
        const maxDbm = 40;
        const normalizedPower = Math.min(1, Math.max(0, (dbm - minDbm) / (maxDbm - minDbm)));

        // visual amplitude from 1px to 40px
        const amplitude = 1 + normalizedPower * 38;
        // visual frequency from 1 to 4 cycles
        const frequency = 1 + normalizedPower * 3;
        const k = (2 * Math.PI * frequency) / width;
        const phase = timeRef.current * (1 + normalizedPower * 4);

        for (let x = 0; x <= width; x += 4) {
          const y = height / 2 + amplitude * Math.sin(k * x - phase);
          if (x === 0) {
            points.push(`M ${x} ${y}`);
          } else {
            points.push(`L ${x} ${y}`);
          }
        }
        pathRef.current.setAttribute('d', points.join(' '));
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inputValue, inputUnit, solveMode, result]);

  const convertToWatts = (val: number, unit: string): number => {
    switch (unit) {
      case 'W': return val;
      case 'mW': return val * 1e-3;
      case 'uW': return val * 1e-6;
      case 'nW': return val * 1e-9;
      case 'kW': return val * 1e3;
      case 'MW': return val * 1e6;
      default: return val;
    }
  };

  const formatUnitValue = (val: number): string => {
    if (val === 0) return '0';
    if (Math.abs(val) < 1e-4 || Math.abs(val) >= 1e7) {
      return val.toExponential(6).replace(/\+/, '');
    }
    return val.toFixed(6).replace(/\.?0+$/, '');
  };

  const recalculateSilently = () => {
    try {
      const calcResult = performCalculation();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const performCalculation = (): CalculationResult => {
    const pVal = parseFloat(inputValue);
    const zVal = parseFloat(impedance);

    if (isNaN(pVal)) throw new Error('Please enter a valid power value.');
    if (isNaN(zVal) || zVal <= 0) throw new Error('Impedance must be a positive number.');

    let powerDbm = 0;
    let powerDbw = 0;
    let powerW = 0;
    let powerMw = 0;
    let powerUw = 0;
    let powerNw = 0;
    let powerKw = 0;
    let powerMwLinear = 0;

    const steps: string[] = [];

    steps.push('**Step 1: Convert Input Power to Base Units**');

    if (solveMode === 'dbmToWatts') {
      if (inputUnit === 'dBm') {
        powerDbm = pVal;
        powerDbw = powerDbm - 30;
        steps.push(`Input is given in decibels relative to 1 milliwatt: $P_{\\text{dBm}} = ${pVal}\\text{ dBm}$.`);
        steps.push('We convert dBm to Power in milliwatts ($P_{\\text{mW}}$) using:');
        steps.push('$$P_{\\text{mW}} = 10^{\\frac{P_{\\text{dBm}}}{10}}$$');
        
        powerMw = Math.pow(10, powerDbm / 10);
        steps.push(`$$P_{\\text{mW}} = 10^{\\frac{${powerDbm}}{10}} = 10^{${(powerDbm / 10).toFixed(2)}} = ${formatUnitValue(powerMw)}\\text{ mW}$$`);
        
        powerW = powerMw / 1000;
        steps.push(`Then convert milliwatts to Watts: $P_{\\text{W}} = \\frac{P_{\\text{mW}}}{1000} = ${formatUnitValue(powerW)}\\text{ W}$.`);
      } else {
        // dBW
        powerDbw = pVal;
        powerDbm = powerDbw + 30;
        steps.push(`Input is given in decibels relative to 1 Watt: $P_{\\text{dBW}} = ${pVal}\\text{ dBW}$.`);
        steps.push('Convert dBW to dBm: $P_{\\text{dBm}} = P_{\\text{dBW}} + 30 = ' + powerDbm + '\\text{ dBm}$.');
        steps.push('Convert dBW to Power in Watts ($P_{\\text{W}}$) using:');
        steps.push('$$P_{\\text{W}} = 10^{\\frac{P_{\\text{dBW}}}{10}}$$');
        
        powerW = Math.pow(10, powerDbw / 10);
        powerMw = powerW * 1000;
        steps.push(`$$P_{\\text{W}} = 10^{\\frac{${powerDbw}}{10}} = ${formatUnitValue(powerW)}\\text{ W}$$`);
      }
    } else {
      // Linear Watts / mW etc. to dBm/dBW
      const linearW = convertToWatts(pVal, inputUnit);
      if (linearW <= 0) {
        throw new Error('Power in linear units must be greater than zero for logarithmic decibel calculations.');
      }
      powerW = linearW;
      powerMw = powerW * 1000;
      
      steps.push(`Input is given in linear units: $P = ${pVal}\\text{ ${inputUnit}}$.`);
      steps.push(`Convert to base Watts: $P_{\\text{W}} = ${formatUnitValue(powerW)}\\text{ W}$.`);
      steps.push('Convert to dBm using:');
      steps.push('$$P_{\\text{dBm}} = 10 \\log_{10}(P_{\\text{W}} \\times 1000)$$');
      
      powerDbm = 10 * Math.log10(powerMw);
      powerDbw = powerDbm - 30;
      
      steps.push(`$$P_{\\text{dBm}} = 10 \\log_{10}(${formatUnitValue(powerMw)}) = ${powerDbm.toFixed(6)}\\text{ dBm}$$`);
      steps.push(`Convert to dBW: $P_{\\text{dBW}} = P_{\\text{dBm}} - 30 = ${powerDbw.toFixed(6)}\\text{ dBW}$.`);
    }

    // Solve other units
    powerUw = powerW * 1e6;
    powerNw = powerW * 1e9;
    powerKw = powerW * 1e-3;
    powerMwLinear = powerW * 1e-6;

    // Derived electrical values
    // V_rms = sqrt(P * Z)
    const vRms = Math.sqrt(powerW * zVal);
    const vPeak = vRms * Math.sqrt(2);
    const vPp = vPeak * 2;
    // dBµV = 120 + 20 * log10(V_rms)
    const vDbuv = vRms > 0 ? 120 + 20 * Math.log10(vRms) : 0;
    // I_rms = sqrt(P / Z)
    const iRms = Math.sqrt(powerW / zVal);

    steps.push('\n**Step 2: Calculate Derived Power Scaling**');
    steps.push(`Using $P_{\\text{W}} = ${formatUnitValue(powerW)}\\text{ W}$:`);
    steps.push(`* $P_{\\text{mW}} = ${formatUnitValue(powerMw)}\\text{ mW}$`);
    steps.push(`* $P_{\\text{kW}} = ${formatUnitValue(powerKw)}\\text{ kW}$`);
    steps.push(`* $P_{\\text{dBW}} = ${powerDbw.toFixed(6)}\\text{ dBW}$`);

    steps.push('\n**Step 3: Calculate Derived Voltage & Current at Impedance**');
    steps.push(`Given Characteristic Impedance $Z = ${zVal}\\ \\Omega$:`);
    steps.push('We compute the Root Mean Square (RMS) Voltage using Joule\'s Law ($P = V^2 / Z$):');
    steps.push('$$V_{\\text{RMS}} = \\sqrt{P_{\\text{W}} \\times Z}$$');
    steps.push(`$$V_{\\text{RMS}} = \\sqrt{${formatUnitValue(powerW)} \\times ${zVal}} = ${vRms.toFixed(6)}\\text{ V}$$`);
    
    steps.push('Peak Voltage ($V_{\\text{peak}}$) and Peak-to-Peak Voltage ($V_{\\text{p-p}}$):');
    steps.push('$$V_{\\text{peak}} = V_{\\text{RMS}} \\times \\sqrt{2}$$');
    steps.push(`$$V_{\\text{peak}} = ${vRms.toFixed(6)} \\times 1.4142 = ${vPeak.toFixed(6)}\\text{ V}$$`);
    steps.push(`$$V_{\\text{p-p}} = 2 \\times V_{\\text{peak}} = ${vPp.toFixed(6)}\\text{ V}$$`);

    steps.push('Decibel Voltage relative to $1\\ \\mu\\text{V}$ ($\\text{dB}\\mu\\text{V}$):');
    steps.push('$$\\text{dB}\\mu\\text{V} = 120 + 20 \\log_{15}(V_{\\text{RMS}})$$');
    steps.push(`$$\\text{dB}\\mu\\text{V} = 120 + 20 \\log_{10}(${vRms.toExponential(4)}) = ${vDbuv.toFixed(4)}\\text{ dB}\\mu\\text{V}$$`);

    steps.push('We compute the RMS Current ($I_{\\text{RMS}}$) using Ohm\'s Law ($P = I^2 Z$):');
    steps.push('$$I_{\\text{RMS}} = \\sqrt{\\frac{P_{\\text{W}}}{Z}}$$');
    steps.push(`$$I_{\\text{RMS}} = \\sqrt{\\frac{${formatUnitValue(powerW)}}{${zVal}}} = ${iRms.toFixed(6)}\\text{ A}$$`);

    return {
      solveMode,
      inputPower: pVal,
      inputUnit,
      impedance: zVal,
      powerDbm,
      powerDbw,
      powerW,
      powerMw,
      powerUw,
      powerNw,
      powerKw,
      powerMwLinear,
      vRms,
      vPeak,
      vPp,
      vDbuv,
      iRms,
      steps,
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = performCalculation();
      setResult(calcResult);
      setHasCalculated(true);
      setError('');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setSolveMode('dbmToWatts');
    setInputValue('0');
    setInputUnit('dBm');
    setImpedance('50');
    setActiveField('power');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const adjustPowerValue = (ratio: number, isAdditive: boolean = false) => {
    const currentVal = parseFloat(inputValue) || 0;
    let newVal = 0;

    if (isAdditive) {
      newVal = currentVal + ratio;
    } else {
      if (currentVal === 0) {
        newVal = ratio > 0 ? ratio : 0;
      } else {
        newVal = currentVal * ratio;
      }
    }

    if (solveMode === 'wattsToDbm' && newVal <= 0 && !isAdditive) {
      newVal = 1e-3; // Default fallback to avoid log errors
    }

    // Format output string cleanly
    if (Math.abs(newVal) < 1e-3 || Math.abs(newVal) > 1e6) {
      setInputValue(newVal.toExponential(4).replace(/\+/, ''));
    } else {
      setInputValue(newVal.toFixed(newVal % 1 === 0 ? 0 : 4).replace(/\.?0+$/, ''));
    }
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    let currentStr = activeField === 'power' ? inputValue : impedance;
    let setVal = activeField === 'power' ? setInputValue : setImpedance;

    if (char === 'clear') {
      setVal('0');
    } else if (char === 'back') {
      setVal(currentStr.slice(0, -1) || '0');
    } else if (char === '.') {
      if (!currentStr.includes('.')) {
        setVal(currentStr + '.');
      }
    } else if (char === 'e') {
      if (!currentStr.includes('e') && !currentStr.includes('E')) {
        setVal(currentStr + 'e');
      }
    } else if (char === '-') {
      if (currentStr.endsWith('e') || currentStr.endsWith('E')) {
        setVal(currentStr + '-');
      } else if (currentStr === '0' || currentStr === '') {
        setVal('-');
      } else if (!currentStr.startsWith('-')) {
        setVal('-' + currentStr);
      } else {
        setVal(currentStr.slice(1));
      }
    } else {
      if (currentStr === '0') {
        setVal(char);
      } else {
        setVal(currentStr + char);
      }
    }
    setError('');
  };

  const loadBenchmark = (b: Benchmark) => {
    setSolveMode('dbmToWatts');
    setInputUnit('dBm');
    setInputValue(b.value.toString());
    setError('');
    if (hasCalculated) {
      // auto calculate
      setTimeout(() => {
        const pVal = b.value;
        const zVal = parseFloat(impedance) || 50;
        const powerMw = Math.pow(10, pVal / 10);
        const powerW = powerMw / 1000;
        const vRms = Math.sqrt(powerW * zVal);
        const vPeak = vRms * Math.sqrt(2);
        const vPp = vPeak * 2;
        const vDbuv = vRms > 0 ? 120 + 20 * Math.log10(vRms) : 0;
        const iRms = Math.sqrt(powerW / zVal);

        setResult({
          solveMode: 'dbmToWatts',
          inputPower: pVal,
          inputUnit: 'dBm',
          impedance: zVal,
          powerDbm: pVal,
          powerDbw: pVal - 30,
          powerW,
          powerMw,
          powerUw: powerW * 1e6,
          powerNw: powerW * 1e9,
          powerKw: powerW * 1e-3,
          powerMwLinear: powerW * 1e-6,
          vRms,
          vPeak,
          vPp,
          vDbuv,
          iRms,
          steps: [
            `Loaded benchmark preset: **${b.label}** (${b.value} dBm).`,
            `Power in milliwatts: $P_{\\text{mW}} = 10^{\\frac{${b.value}}{10}} = ${formatUnitValue(powerMw)}\\text{ mW}$`,
            `Power in Watts: $P_{\\text{W}} = ${formatUnitValue(powerW)}\\text{ W}$`
          ]
        });
      }, 50);
    }
  };

  // Slider marker position calculations (-180 dBm to +80 dBm)
  const getMarkerPercentage = (dbm: number): number => {
    const min = -180;
    const max = 80;
    const clamped = Math.min(max, Math.max(min, dbm));
    return ((clamped - min) / (max - min)) * 100;
  };

  const currentDbmForIndicator = (): number => {
    if (result) return result.powerDbm;
    const val = parseFloat(inputValue) || 0;
    if (solveMode === 'dbmToWatts') {
      return inputUnit === 'dBW' ? val + 30 : val;
    } else {
      const linearW = convertToWatts(val, inputUnit);
      return linearW > 0 ? 10 * Math.log10(linearW * 1000) : -180;
    }
  };

  const indicatorDbm = currentDbmForIndicator();

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Scope Mode Dropdown & Presets Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Solve Target Mode
          </span>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[
              { id: 'dbmToWatts', label: 'dBm to Watts (Log → Linear)' },
              { id: 'wattsToDbm', label: 'Watts to dBm (Linear → Log)' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setSolveMode(mode.id as any);
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  solveMode === mode.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Impedance Shortcuts */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Characteristic Impedance Presets
          </span>
          <div className="flex space-x-2 mt-1.5">
            {[
              { label: '50 Ω (RF / Coax)', val: '50' },
              { label: '75 Ω (TV / Cable)', val: '75' },
              { label: '600 Ω (Audio / Telco)', val: '600' }
            ].map((zPreset) => (
              <button
                key={zPreset.val}
                type="button"
                onClick={() => {
                  setImpedance(zPreset.val);
                  setError('');
                }}
                className={`px-3 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                  impedance === zPreset.val
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {zPreset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Inputs & Tactile Pad */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Power Input Card */}
              <div
                onClick={() => setActiveField('power')}
                className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all cursor-pointer ${
                  activeField === 'power'
                    ? 'border-slate-900 shadow'
                    : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Input Power Level:
                </span>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                      setError('');
                    }}
                    className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
                  />
                  
                  <select
                    value={inputUnit}
                    onChange={(e) => {
                      setInputUnit(e.target.value);
                      setError('');
                    }}
                    className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-slate-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {solveMode === 'dbmToWatts' ? (
                      <>
                        <option value="dBm">dBm</option>
                        <option value="dBW">dBW</option>
                      </>
                    ) : (
                      <>
                        <option value="W">Watts (W)</option>
                        <option value="mW">Milliwatts (mW)</option>
                        <option value="uW">Microwatts (µW)</option>
                        <option value="nW">Nanowatts (nW)</option>
                        <option value="kW">Kilowatts (kW)</option>
                        <option value="MW">Megawatts (MW)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Tactile Value Adjustments */}
                <div className="flex space-x-1.5 pt-1">
                  {solveMode === 'dbmToWatts' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(10, true)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        +10 dB
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(-10, true)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        -10 dB
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(1, true)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        +1 dB
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(-1, true)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        -1 dB
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(10)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        ×10
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(0.1)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        ÷10
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(1, true)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPowerValue(-1, true)}
                        className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                      >
                        -1
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Impedance Input Card */}
              <div
                onClick={() => setActiveField('impedance')}
                className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all cursor-pointer ${
                  activeField === 'impedance'
                    ? 'border-slate-900 shadow'
                    : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  System Impedance (Z):
                </span>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={impedance}
                    onChange={(e) => {
                      setImpedance(e.target.value.replace(/[^0-9.]/g, ''));
                      setError('');
                    }}
                    className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-400 font-black text-sm pr-2">Ohms (Ω)</span>
                </div>

                <div className="flex space-x-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(impedance) || 0;
                      setImpedance(Math.max(1, cur + 5).toString());
                    }}
                    className="px-2.5 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                  >
                    +5 Ω
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(impedance) || 0;
                      setImpedance(Math.max(1, cur - 5).toString());
                    }}
                    className="px-2.5 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                  >
                    -5 Ω
                  </button>
                </div>
              </div>

            </div>

            {/* Helper Keypad */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                Tactile Pad (editing {activeField === 'power' ? 'Power' : 'Impedance'})
              </span>
              <div className="grid grid-cols-4 gap-2 w-full">
                {['7', '8', '9', 'clear'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardInput(key)}
                    className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                      key === 'clear' ? 'text-rose-600 text-[10px] uppercase' : 'text-slate-800 text-sm'
                    }`}
                  >
                    {key === 'clear' ? 'Clear' : key}
                  </button>
                ))}
                {['4', '5', '6', '.'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardInput(key)}
                    className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
                  >
                    {key}
                  </button>
                ))}
                {['1', '2', '3', 'back'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardInput(key)}
                    className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                      key === 'back' ? 'text-slate-500 text-xs' : 'text-slate-800 text-sm'
                    }`}
                  >
                    {key === 'back' ? '⌫' : key}
                  </button>
                ))}
                {['e', '0', '-', 'dummy'].map((key) => {
                  if (key === 'dummy') {
                    return <div key={key} className="h-11" />;
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={activeField === 'impedance' && (key === 'e' || key === '-')}
                      onClick={() => handleKeyboardInput(key)}
                      className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm ${
                        activeField === 'impedance' && (key === 'e' || key === '-') ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
              >
                Calculate Power Levels
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Signal Oscillation Visualizer */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-3">
            <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                <i className="fas fa-wave-square mr-2 text-slate-400 animate-pulse"></i>
                RF Carrier Signal Amplitude (Visualized Volts)
              </span>
              <span className="text-[9px] text-slate-450 font-medium">
                Signal voltage shifts relative to impedance and power level.
              </span>
            </div>

            <div className="w-full relative">
              <svg viewBox="0 0 800 100" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-xl shadow-inner relative overflow-hidden block">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1c1c1c" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <line x1="0" y1="50" x2="800" y2="50" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3 3" />
                <path
                  ref={pathRef}
                  d="M 0 50"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                />
              </svg>

              <div className="absolute top-2 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex space-x-3">
                <div><span className="text-neutral-500">Impedance:</span> {impedance} Ω</div>
                <div><span className="text-neutral-500">Peak:</span> {result ? `${result.vPeak.toFixed(4)} V` : '--'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Logarithmic Power Ruler Benchmark Gauge */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-5 space-y-4">
          <div className="border-b border-slate-250 pb-2 text-left">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Logarithmic RF Power Ruler
            </span>
            <span className="text-[9px] text-slate-450 font-medium">
              Click any level to load into the calculator.
            </span>
          </div>

          <div className="flex space-x-4 h-[680px] relative select-none">
            {/* The vertical slider track scale */}
            <div className="w-6 bg-slate-200 rounded-full h-full relative border border-slate-300/60 flex flex-col justify-between items-center py-2">
              {/* Vertical tick marks */}
              {[80, 60, 40, 20, 0, -20, -40, -60, -80, -100, -120, -140, -160, -180].map((t) => (
                <div key={t} className="w-2.5 h-[1px] bg-slate-400/80 relative" style={{ top: 'auto' }}>
                  <span className="absolute -left-7 -top-1.5 font-mono text-[8px] text-slate-400 font-bold w-6 text-right">
                    {t}
                  </span>
                </div>
              ))}

              {/* Glowing Indicator Bubble */}
              <div
                className="absolute w-5 h-5 bg-slate-900 border-2 border-white rounded-full shadow-md transition-all duration-300 ease-out left-0.5 flex items-center justify-center"
                style={{
                  bottom: `${getMarkerPercentage(indicatorDbm)}%`,
                  transform: 'translateY(50%)',
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            {/* Benchmarks list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-left h-full scrollbar-thin">
              {POWER_BENCHMARKS.map((b) => {
                const isActive = Math.abs(indicatorDbm - b.value) < 1.0;
                return (
                  <div
                    key={b.label}
                    onClick={() => loadBenchmark(b)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-[1.01]'
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 p-1 rounded-md text-xs ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <i className={`fas ${b.icon} w-3 text-center`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-[10px] font-black truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {b.label}
                        </span>
                        <span className="font-mono text-[9px] font-bold shrink-0 ml-1">
                          {b.value > 0 ? `+${b.value}` : b.value} dBm
                        </span>
                      </div>
                      <p className={`text-[8px] leading-tight mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Calculated Results Block */}
      {result && (
        <div
          ref={resultsRef}
          className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up"
        >
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">DBM</span>
          </div>

          <div className="relative z-10 space-y-8 text-left">
            <h3 className="text-lg font-extrabold text-white text-center font-display border-b border-slate-800/80 pb-4">
              Calculated Power & Derived Metrics
            </h3>

            {/* Core Power Conversion grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Power in dBm
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {result.powerDbm.toFixed(4)} dBm
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Power in dBW
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {result.powerDbw.toFixed(4)} dBW
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Power in Watts (W)
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {formatUnitValue(result.powerW)} W
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Power in Milliwatts (mW)
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {formatUnitValue(result.powerMw)} mW
                </span>
              </div>
            </div>

            {/* Subunit Scaling Table */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  Linear Power Equivalents
                </span>
                <span className="text-[9px] text-slate-400 font-mono">At any impedance load</span>
              </div>
              <div className="divide-y divide-slate-700/50 font-mono text-xs">
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Megawatts (MW)</span>
                  <span className="font-bold text-white">{formatUnitValue(result.powerMwLinear)} MW</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Kilowatts (kW)</span>
                  <span className="font-bold text-white">{formatUnitValue(result.powerKw)} kW</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Microwatts (µW)</span>
                  <span className="font-bold text-white">{formatUnitValue(result.powerUw)} µW</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Nanowatts (nW)</span>
                  <span className="font-bold text-white">{formatUnitValue(result.powerNw)} nW</span>
                </div>
              </div>
            </div>

            {/* Derived electrical readings at impedance */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Derived Electrical Parameters (at {result.impedance} Ω Impedance)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    RMS Voltage (V_RMS)
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    {result.vRms.toFixed(6)} V
                  </div>
                  <p className="text-[8px] text-slate-400 leading-snug">
                    Effective voltage across the load: <InlineMath math="V_{\text{RMS}} = \sqrt{P \cdot Z}" />
                  </p>
                </div>

                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    Peak & Peak-to-Peak
                  </span>
                  <div className="text-base font-black text-white font-mono">
                    {result.vPeak.toFixed(5)} V <span className="text-xs font-normal text-slate-400">(peak)</span>
                  </div>
                  <div className="text-sm font-bold text-slate-300 font-mono">
                    {result.vPp.toFixed(5)} V <span className="text-xs font-normal text-slate-400">(p-p)</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    RMS Current (I_RMS)
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    {result.iRms.toFixed(6)} A
                  </div>
                  <p className="text-[8px] text-slate-400 leading-snug">
                    RMS Current flow: <InlineMath math="I_{\text{RMS}} = \sqrt{P / Z}" />
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    Voltage Level in dBµV
                  </span>
                  <div className="text-lg font-black text-white font-mono">
                    {result.vDbuv.toFixed(4)} dBµV
                  </div>
                  <p className="text-[8px] text-slate-400 leading-snug">
                    Decibels relative to 1 microvolt RMS: <InlineMath math="\text{dB}\mu\text{V} = 120 + 20 \log_{10}(V_{\text{RMS}})" />
                  </p>
                </div>

                {result.impedance === 50 && (
                  <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Quick RF Rule of Thumb
                    </span>
                    <p className="text-[9px] text-slate-300 leading-normal font-medium">
                      At exactly <span className="font-bold">50 Ω</span>, the conversion to dBµV simplifies to:
                      <span className="font-bold block text-white mt-0.5">
                        dBµV = dBm + 107
                      </span>
                      Your value check: {result.powerDbm.toFixed(2)} + 107 = {(result.powerDbm + 107).toFixed(2)} dBµV.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mathematical Steps with KaTeX */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Step-by-Step Mathematical Calculations
              </h4>
              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                {result.steps.map((step, idx) => {
                  if (step.startsWith('$$')) {
                    const formula = step.replace(/\$\$/g, '');
                    return (
                      <div key={idx} className="my-2.5 overflow-x-auto">
                        <BlockMath math={formula} />
                      </div>
                    );
                  }
                  
                  // Parse inline code / markdown formatting roughly for steps
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  let formattedText = step.split('\n').map((line, lIdx) => {
                    let temp = line;
                    // replace math placeholders
                    const parts = [];
                    let lastIndex = 0;
                    const inlineMathRegex = /\$(.*?)\$/g;
                    let match;

                    while ((match = inlineMathRegex.exec(line)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(line.substring(lastIndex, match.index));
                      }
                      parts.push(<InlineMath key={match.index} math={match[1]} />);
                      lastIndex = inlineMathRegex.lastIndex;
                    }
                    if (lastIndex < line.length) {
                      parts.push(line.substring(lastIndex));
                    }

                    // Render and bold check
                    return (
                      <span key={lIdx} className="block mt-1">
                        {parts.map((p, pIdx) => {
                          if (typeof p === 'string') {
                            // bold formatting check
                            const subparts = [];
                            let subLastIndex = 0;
                            let subMatch;
                            const bRegex = /\*\*(.*?)\*\*/g;
                            while ((subMatch = bRegex.exec(p)) !== null) {
                              if (subMatch.index > subLastIndex) {
                                subparts.push(p.substring(subLastIndex, subMatch.index));
                              }
                              subparts.push(<strong key={subMatch.index} className="text-white font-extrabold">{subMatch[1]}</strong>);
                              subLastIndex = bRegex.lastIndex;
                            }
                            if (subLastIndex < p.length) {
                              subparts.push(p.substring(subLastIndex));
                            }
                            return <React.Fragment key={pIdx}>{subparts}</React.Fragment>;
                          }
                          return p;
                        })}
                      </span>
                    );
                  });

                  return <div key={idx}>{formattedText}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
