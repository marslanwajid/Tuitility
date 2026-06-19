'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface ConversionResult {
  solveMode: 'dbmToMw' | 'mwToDbm';
  inputPower: number;
  inputUnit: string;
  impedance: number;

  // Power units (mW-centric)
  powerDbm: number;
  powerMw: number;
  powerUw: number;
  powerNw: number;
  powerPw: number;
  powerW: number;

  // Derived electrical units (at impedance Z)
  vRms: number;
  vPeak: number;
  vPp: number;
  vDbuv: number;
  iRms: number;

  // Classification
  powerLevel: string;
  signalStrength: string;
  typicalUse: string;

  steps: string[];
}

interface Benchmark {
  value: number;
  label: string;
  desc: string;
  icon: string;
}

const POWER_BENCHMARKS: Benchmark[] = [
  { value: 60, label: 'FM Transmitter', desc: '1 kW broadcast station (1,000,000 mW)', icon: 'fa-broadcast-tower' },
  { value: 43, label: 'LTE Base Station', desc: '20 W cellular tower output (20,000 mW)', icon: 'fa-signal' },
  { value: 30, label: 'Mobile Phone Max', desc: '1 W cellular transmit burst (1000 mW)', icon: 'fa-mobile-alt' },
  { value: 20, label: 'Wi-Fi Router Tx', desc: '100 mW transmit power limit', icon: 'fa-wifi' },
  { value: 0, label: '1 mW Reference', desc: 'Zero dBm reference level', icon: 'fa-dot-circle' },
  { value: -10, label: 'Bluetooth Class 3', desc: '0.1 mW low-power radio', icon: 'fa-bluetooth' },
  { value: -30, label: 'Strong Rx Signal', desc: '1 µW receiver input (0.001 mW)', icon: 'fa-arrow-down' },
  { value: -70, label: 'Good Wi-Fi / LTE', desc: '100 pW reliable signal (0.0001 mW)', icon: 'fa-check-circle' },
  { value: -90, label: 'Wi-Fi Rx Limit', desc: '1 pW sensitivity threshold', icon: 'fa-exclamation-circle' },
  { value: -110, label: 'LTE Out-of-Service', desc: '10 fW cell edge drop', icon: 'fa-times-circle' },
  { value: -174, label: 'Thermal Noise Floor', desc: '1 Hz bandwidth limit at room temp', icon: 'fa-snowflake' },
];

const getPowerLevel = (dbm: number): string => {
  if (dbm >= 50) return 'Very High Power';
  if (dbm >= 30) return 'High Power';
  if (dbm >= 20) return 'Medium High Power';
  if (dbm >= 10) return 'Medium Power';
  if (dbm >= 0) return 'Low Power';
  if (dbm >= -30) return 'Very Low Power';
  if (dbm >= -60) return 'Micro Power';
  if (dbm >= -90) return 'Nano Power';
  return 'Pico Power';
};

const getSignalStrength = (dbm: number): string => {
  if (dbm >= 30) return 'Excellent';
  if (dbm >= 20) return 'Very Good';
  if (dbm >= 10) return 'Good';
  if (dbm >= 0) return 'Fair';
  if (dbm >= -20) return 'Poor';
  if (dbm >= -40) return 'Very Poor';
  if (dbm >= -60) return 'Weak';
  if (dbm >= -80) return 'Very Weak';
  return 'Extremely Weak';
};

const getTypicalUse = (dbm: number): string => {
  if (dbm >= 50) return 'High-power RF transmitters, radar systems';
  if (dbm >= 30) return 'Cell towers, broadcast transmitters, base stations';
  if (dbm >= 20) return 'WiFi routers, wireless access points';
  if (dbm >= 10) return 'Bluetooth devices, portable transmitters';
  if (dbm >= 0) return 'Short-range devices, IoT sensors';
  if (dbm >= -30) return 'Received signals, low-power wireless links';
  if (dbm >= -60) return 'Weak received signals, receiver front-end';
  if (dbm >= -90) return 'Noise floor region, weak satellite signals';
  return 'Extremely weak signals, thermal noise region';
};

export default function DBmMilliwattsCalculator() {
  const [solveMode, setSolveMode] = useState<'dbmToMw' | 'mwToDbm'>('dbmToMw');
  const [inputValue, setInputValue] = useState<string>('0');
  const [inputUnit, setInputUnit] = useState<string>('dBm');
  const [impedance, setImpedance] = useState<string>('50');
  const [activeField, setActiveField] = useState<'power' | 'impedance'>('power');

  const [result, setResult] = useState<ConversionResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const pathRef = useRef<SVGPathElement>(null);
  const timeRef = useRef<number>(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (solveMode === 'dbmToMw') {
      setInputUnit('dBm');
      setInputValue('0');
    } else {
      setInputUnit('mW');
      setInputValue('1');
    }
    setError('');
  }, [solveMode]);

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [inputValue, inputUnit, impedance, solveMode]);

  // Oscilloscope Animation
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      timeRef.current += 0.05;
      if (pathRef.current) {
        const width = 800;
        const height = 100;
        const points = [];

        let dbm = 0;
        if (result) {
          dbm = result.powerDbm;
        } else {
          const val = parseFloat(inputValue) || 0;
          if (solveMode === 'dbmToMw') {
            dbm = val;
          } else {
            dbm = val > 0 ? 10 * Math.log10(val) : -150;
          }
        }

        const minDbm = -100;
        const maxDbm = 40;
        const normalizedPower = Math.min(1, Math.max(0, (dbm - minDbm) / (maxDbm - minDbm)));
        const amplitude = 1 + normalizedPower * 38;
        const frequency = 1 + normalizedPower * 3;
        const k = (2 * Math.PI * frequency) / width;
        const phase = timeRef.current * (1 + normalizedPower * 4);

        for (let x = 0; x <= width; x += 4) {
          const y = height / 2 + amplitude * Math.sin(k * x - phase);
          points.push(x === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        pathRef.current.setAttribute('d', points.join(' '));
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inputValue, inputUnit, solveMode, result]);

  const formatValue = (val: number): string => {
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
    } catch {
      // silent
    }
  };

  const performCalculation = (): ConversionResult => {
    const pVal = parseFloat(inputValue);
    const zVal = parseFloat(impedance);

    if (isNaN(pVal)) throw new Error('Please enter a valid power value.');
    if (isNaN(zVal) || zVal <= 0) throw new Error('Impedance must be a positive number.');

    let powerDbm = 0;
    let powerMw = 0;
    let powerUw = 0;
    let powerNw = 0;
    let powerPw = 0;
    let powerW = 0;

    const steps: string[] = [];

    steps.push('**Step 1: Convert Input Power**');

    if (solveMode === 'dbmToMw') {
      powerDbm = pVal;
      steps.push(`Input is given in decibels relative to 1 milliwatt: $P_{\\text{dBm}} = ${pVal}\\text{ dBm}$.`);
      steps.push('Convert dBm to milliwatts using:');
      steps.push('$$P_{\\text{mW}} = 10^{\\frac{P_{\\text{dBm}}}{10}}$$');

      powerMw = Math.pow(10, powerDbm / 10);
      steps.push(`$$P_{\\text{mW}} = 10^{\\frac{${powerDbm}}{10}} = 10^{${(powerDbm / 10).toFixed(2)}} = ${formatValue(powerMw)}\\text{ mW}$$`);
    } else {
      if (pVal <= 0) throw new Error('Power in milliwatts must be greater than zero for logarithmic conversion.');
      powerMw = pVal;
      steps.push(`Input is given in linear units: $P = ${pVal}\\text{ mW}$.`);
      steps.push('Convert to dBm using:');
      steps.push('$$P_{\\text{dBm}} = 10 \\cdot \\log_{10}(P_{\\text{mW}})$$');

      powerDbm = 10 * Math.log10(powerMw);
      steps.push(`$$P_{\\text{dBm}} = 10 \\cdot \\log_{10}(${formatValue(powerMw)}) = ${powerDbm.toFixed(6)}\\text{ dBm}$$`);
    }

    powerW = powerMw / 1000;
    powerUw = powerMw * 1000;
    powerNw = powerMw * 1e6;
    powerPw = powerMw * 1e9;

    const vRms = Math.sqrt(powerW * zVal);
    const vPeak = vRms * Math.sqrt(2);
    const vPp = vPeak * 2;
    const vDbuv = vRms > 0 ? 120 + 20 * Math.log10(vRms) : 0;
    const iRms = Math.sqrt(powerW / zVal);

    steps.push('\n**Step 2: Scale to Other Power Units**');
    steps.push(`* $P_{\\text{W}} = ${formatValue(powerW)}\\text{ W}$`);
    steps.push(`* $P_{\\mu\\text{W}} = ${formatValue(powerUw)}\\text{ µW}$`);
    steps.push(`* $P_{\\text{nW}} = ${formatValue(powerNw)}\\text{ nW}$`);

    steps.push('\n**Step 3: Derived Voltage & Current at Impedance**');
    steps.push(`Given $Z = ${zVal}\\ \\Omega$:`);
    steps.push('$$V_{\\text{RMS}} = \\sqrt{P_{\\text{W}} \\times Z}$$');
    steps.push(`$$V_{\\text{RMS}} = \\sqrt{${formatValue(powerW)} \\times ${zVal}} = ${vRms.toFixed(6)}\\text{ V}$$`);
    steps.push('$$V_{\\text{peak}} = V_{\\text{RMS}} \\times \\sqrt{2}$$');
    steps.push(`$$V_{\\text{peak}} = ${vRms.toFixed(6)} \\times 1.4142 = ${vPeak.toFixed(6)}\\text{ V}$$`);
    steps.push(`$$V_{\\text{p-p}} = 2 \\times V_{\\text{peak}} = ${vPp.toFixed(6)}\\text{ V}$$`);
    steps.push('$$\\text{dB}\\mu\\text{V} = 120 + 20 \\log_{10}(V_{\\text{RMS}})$$');
    steps.push(`$$\\text{dB}\\mu\\text{V} = 120 + 20 \\log_{10}(${vRms.toExponential(4)}) = ${vDbuv.toFixed(4)}\\text{ dB}\\mu\\text{V}$$`);
    steps.push('$$I_{\\text{RMS}} = \\sqrt{\\frac{P_{\\text{W}}}{Z}}$$');
    steps.push(`$$I_{\\text{RMS}} = \\sqrt{\\frac{${formatValue(powerW)}}{${zVal}}} = ${iRms.toFixed(6)}\\text{ A}$$`);

    return {
      solveMode,
      inputPower: pVal,
      inputUnit,
      impedance: zVal,
      powerDbm,
      powerMw,
      powerUw,
      powerNw,
      powerPw,
      powerW,
      vRms,
      vPeak,
      vPp,
      vDbuv,
      iRms,
      powerLevel: getPowerLevel(powerDbm),
      signalStrength: getSignalStrength(powerDbm),
      typicalUse: getTypicalUse(powerDbm),
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
    setSolveMode('dbmToMw');
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

    if (solveMode === 'mwToDbm' && newVal <= 0 && !isAdditive) {
      newVal = 0.001;
    }

    if (Math.abs(newVal) < 1e-3 || Math.abs(newVal) > 1e6) {
      setInputValue(newVal.toExponential(4).replace(/\+/, ''));
    } else {
      setInputValue(newVal.toFixed(newVal % 1 === 0 ? 0 : 4).replace(/\.?0+$/, ''));
    }
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    const currentStr = activeField === 'power' ? inputValue : impedance;
    const setVal = activeField === 'power' ? setInputValue : setImpedance;

    if (char === 'clear') {
      setVal('0');
    } else if (char === 'back') {
      setVal(currentStr.slice(0, -1) || '0');
    } else if (char === '.') {
      if (!currentStr.includes('.')) setVal(currentStr + '.');
    } else if (char === 'e') {
      if (!currentStr.includes('e') && !currentStr.includes('E')) setVal(currentStr + 'e');
    } else if (char === '-') {
      if (currentStr.endsWith('e') || currentStr.endsWith('E')) setVal(currentStr + '-');
      else if (currentStr === '0' || currentStr === '') setVal('-');
      else if (!currentStr.startsWith('-')) setVal('-' + currentStr);
      else setVal(currentStr.slice(1));
    } else {
      setVal(currentStr === '0' ? char : currentStr + char);
    }
    setError('');
  };

  const loadBenchmark = (b: Benchmark) => {
    setSolveMode('dbmToMw');
    setInputUnit('dBm');
    setInputValue(b.value.toString());
    setError('');
    if (hasCalculated) {
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
          solveMode: 'dbmToMw',
          inputPower: pVal,
          inputUnit: 'dBm',
          impedance: zVal,
          powerDbm: pVal,
          powerMw,
          powerUw: powerMw * 1000,
          powerNw: powerMw * 1e6,
          powerPw: powerMw * 1e9,
          powerW,
          vRms,
          vPeak,
          vPp,
          vDbuv,
          iRms,
          powerLevel: getPowerLevel(pVal),
          signalStrength: getSignalStrength(pVal),
          typicalUse: getTypicalUse(pVal),
          steps: [
            `Loaded benchmark preset: **${b.label}** (${b.value} dBm).`,
            `Power in milliwatts: $P_{\\text{mW}} = 10^{\\frac{${b.value}}{10}} = ${formatValue(powerMw)}\\text{ mW}$`,
            `Power in Watts: $P_{\\text{W}} = ${formatValue(powerW)}\\text{ W}$`
          ],
        });
      }, 50);
    }
  };

  const getMarkerPercentage = (dbm: number): number => {
    const min = -180;
    const max = 80;
    return ((Math.min(max, Math.max(min, dbm)) - min) / (max - min)) * 100;
  };

  const currentDbmForIndicator = (): number => {
    if (result) return result.powerDbm;
    const val = parseFloat(inputValue) || 0;
    if (solveMode === 'dbmToMw') return val;
    return val > 0 ? 10 * Math.log10(val) : -180;
  };

  const indicatorDbm = currentDbmForIndicator();

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Scope Mode & Impedance Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Solve Target Mode
          </span>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[
              { id: 'dbmToMw', label: 'dBm to mW (Log \u2192 Linear)' },
              { id: 'mwToDbm', label: 'mW to dBm (Linear \u2192 Log)' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => { setSolveMode(mode.id as any); setError(''); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  solveMode === mode.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Characteristic Impedance Presets
          </span>
          <div className="flex space-x-2 mt-1.5">
            {[
              { label: '50 \u03A9 (RF / Coax)', val: '50' },
              { label: '75 \u03A9 (TV / Cable)', val: '75' },
              { label: '600 \u03A9 (Audio / Telco)', val: '600' },
            ].map((z) => (
              <button
                key={z.val}
                type="button"
                onClick={() => { setImpedance(z.val); setError(''); }}
                className={`px-3 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                  impedance === z.val ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Power Input Card */}
              <div
                onClick={() => setActiveField('power')}
                className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all cursor-pointer ${
                  activeField === 'power' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Input Power Level:
                </span>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
                    className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
                  />
                  <select
                    value={inputUnit}
                    onChange={(e) => { setInputUnit(e.target.value); setError(''); }}
                    className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-slate-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {solveMode === 'dbmToMw' ? (
                      <option value="dBm">dBm</option>
                    ) : (
                      <>
                        <option value="mW">Milliwatts (mW)</option>
                        <option value="uW">Microwatts (\u00B5W)</option>
                        <option value="nW">Nanowatts (nW)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex space-x-1.5 pt-1">
                  {solveMode === 'dbmToMw' ? (
                    <>
                      <button type="button" onClick={() => adjustPowerValue(10, true)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">+10 dB</button>
                      <button type="button" onClick={() => adjustPowerValue(-10, true)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">-10 dB</button>
                      <button type="button" onClick={() => adjustPowerValue(1, true)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">+1 dB</button>
                      <button type="button" onClick={() => adjustPowerValue(-1, true)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">-1 dB</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => adjustPowerValue(10)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">\u00D710</button>
                      <button type="button" onClick={() => adjustPowerValue(0.1)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">\u00F710</button>
                      <button type="button" onClick={() => adjustPowerValue(1, true)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">+1</button>
                      <button type="button" onClick={() => adjustPowerValue(-1, true)} className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">-1</button>
                    </>
                  )}
                </div>
              </div>

              {/* Impedance Input Card */}
              <div
                onClick={() => setActiveField('impedance')}
                className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all cursor-pointer ${
                  activeField === 'impedance' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  System Impedance (Z):
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={impedance}
                    onChange={(e) => { setImpedance(e.target.value.replace(/[^0-9.]/g, '')); setError(''); }}
                    className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-400 font-black text-sm pr-2">Ohms (\u03A9)</span>
                </div>
                <div className="flex space-x-1.5 pt-1">
                  <button type="button" onClick={() => setImpedance(Math.max(1, (parseFloat(impedance) || 0) + 5).toString())} className="px-2.5 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">+5 \u03A9</button>
                  <button type="button" onClick={() => setImpedance(Math.max(1, (parseFloat(impedance) || 0) - 5).toString())} className="px-2.5 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600">-5 \u03A9</button>
                </div>
              </div>

            </div>

            {/* Keypad */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                Tactile Pad (editing {activeField === 'power' ? 'Power' : 'Impedance'})
              </span>
              <div className="grid grid-cols-4 gap-2 w-full">
                {['7','8','9','clear'].map((k) => (
                  <button key={k} type="button" onClick={() => handleKeyboardInput(k)}
                    className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                      k === 'clear' ? 'text-rose-600 text-[10px] uppercase' : 'text-slate-800 text-sm'
                    }`}>
                    {k === 'clear' ? 'Clear' : k}
                  </button>
                ))}
                {['4','5','6','.'].map((k) => (
                  <button key={k} type="button" onClick={() => handleKeyboardInput(k)}
                    className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm">{k}</button>
                ))}
                {['1','2','3','back'].map((k) => (
                  <button key={k} type="button" onClick={() => handleKeyboardInput(k)}
                    className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                      k === 'back' ? 'text-slate-500 text-xs' : 'text-slate-800 text-sm'
                    }`}>
                    {k === 'back' ? '\u232B' : k}
                  </button>
                ))}
                {['e','0','-','dummy'].map((k) => {
                  if (k === 'dummy') return <div key={k} className="h-11" />;
                  return (
                    <button key={k} type="button"
                      disabled={activeField === 'impedance' && (k === 'e' || k === '-')}
                      onClick={() => handleKeyboardInput(k)}
                      className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm ${
                        activeField === 'impedance' && (k === 'e' || k === '-') ? 'opacity-40 cursor-not-allowed' : ''
                      }`}>
                      {k}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4">
              <button type="submit"
                className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm">
                Convert Power Level
              </button>
              <button type="button" onClick={handleReset}
                className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm">
                Reset
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Oscilloscope */}
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
                  <pattern id="grid-mw" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1c1c1c" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-mw)" />
                <line x1="0" y1="50" x2="800" y2="50" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3 3" />
                <path ref={pathRef} d="M 0 50" fill="none" stroke="#ffffff" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
              </svg>

              <div className="absolute top-2 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex space-x-3">
                <div><span className="text-neutral-500">Impedance:</span> {impedance} \u03A9</div>
                <div><span className="text-neutral-500">Peak:</span> {result ? `${result.vPeak.toFixed(4)} V` : '--'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - RF Power Ruler */}
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
            <div className="w-6 bg-slate-200 rounded-full h-full relative border border-slate-300/60 flex flex-col justify-between items-center py-2">
              {[80, 60, 40, 20, 0, -20, -40, -60, -80, -100, -120, -140, -160, -180].map((t) => (
                <div key={t} className="w-2.5 h-[1px] bg-slate-400/80 relative">
                  <span className="absolute -left-7 -top-1.5 font-mono text-[8px] text-slate-400 font-bold w-6 text-right">{t}</span>
                </div>
              ))}
              <div
                className="absolute w-5 h-5 bg-slate-900 border-2 border-white rounded-full shadow-md transition-all duration-300 ease-out left-0.5 flex items-center justify-center"
                style={{ bottom: `${getMarkerPercentage(indicatorDbm)}%`, transform: 'translateY(50%)' }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-left h-full scrollbar-thin">
              {POWER_BENCHMARKS.map((b) => {
                const isActive = Math.abs(indicatorDbm - b.value) < 1.0;
                return (
                  <div key={b.label} onClick={() => loadBenchmark(b)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                      isActive ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-[1.01]' : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 p-1 rounded-md text-xs ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <i className={`fas ${b.icon} w-3 text-center`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-[10px] font-black truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>{b.label}</span>
                        <span className="font-mono text-[9px] font-bold shrink-0 ml-1">{b.value > 0 ? `+${b.value}` : b.value} dBm</span>
                      </div>
                      <p className={`text-[8px] leading-tight mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">MW</span>
          </div>
          <div className="relative z-10 space-y-8 text-left">
            <h3 className="text-lg font-extrabold text-white text-center font-display border-b border-slate-800/80 pb-4">
              Conversion &amp; Derived Metrics
            </h3>

            {/* Core Power Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Power in dBm</span>
                <span className="text-lg font-black text-white font-mono">{result.powerDbm.toFixed(4)} dBm</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Power in mW</span>
                <span className="text-lg font-black text-white font-mono">{formatValue(result.powerMw)} mW</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Power in Watts</span>
                <span className="text-lg font-black text-white font-mono">{formatValue(result.powerW)} W</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Signal Strength</span>
                <span className="text-sm font-black text-white">{result.signalStrength}</span>
              </div>
            </div>

            {/* Subunit Scaling */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Linear Power Equivalents</span>
                <span className="text-[9px] text-slate-400 font-mono">Sub-milliwatt scaling</span>
              </div>
              <div className="divide-y divide-slate-700/50 font-mono text-xs">
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Microwatts (\u00B5W)</span>
                  <span className="font-bold text-white">{formatValue(result.powerUw)} \u00B5W</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Nanowatts (nW)</span>
                  <span className="font-bold text-white">{formatValue(result.powerNw)} nW</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Picowatts (pW)</span>
                  <span className="font-bold text-white">{formatValue(result.powerPw)} pW</span>
                </div>
              </div>
            </div>

            {/* Derived Electrical */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Derived Electrical Parameters (at {result.impedance} \u03A9 Impedance)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">RMS Voltage (V_RMS)</span>
                  <div className="text-xl font-black text-white font-mono">{result.vRms.toFixed(6)} V</div>
                  <p className="text-[8px] text-slate-400 leading-snug"><InlineMath math="V_{\text{RMS}} = \sqrt{P \cdot Z}" /></p>
                </div>
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Peak &amp; Peak-to-Peak</span>
                  <div className="text-base font-black text-white font-mono">{result.vPeak.toFixed(5)} V <span className="text-xs font-normal text-slate-400">(peak)</span></div>
                  <div className="text-sm font-bold text-slate-300 font-mono">{result.vPp.toFixed(5)} V <span className="text-xs font-normal text-slate-400">(p-p)</span></div>
                </div>
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">RMS Current (I_RMS)</span>
                  <div className="text-xl font-black text-white font-mono">{result.iRms.toFixed(6)} A</div>
                  <p className="text-[8px] text-slate-400 leading-snug"><InlineMath math="I_{\text{RMS}} = \sqrt{P / Z}" /></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Voltage Level in dB\u00B5V</span>
                  <div className="text-lg font-black text-white font-mono">{result.vDbuv.toFixed(4)} dB\u00B5V</div>
                  <p className="text-[8px] text-slate-400 leading-snug"><InlineMath math="\text{dB}\mu\text{V} = 120 + 20 \log_{10}(V_{\text{RMS}})" /></p>
                </div>
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Power Level Classification</span>
                  <span className="text-lg font-black text-white block">{result.powerLevel}</span>
                  <p className="text-[8px] text-slate-400 leading-snug">{result.typicalUse}</p>
                </div>
              </div>
            </div>

            {/* Step-by-Step */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Step-by-Step Mathematical Calculations
              </h4>
              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                {result.steps.map((step, idx) => {
                  if (step.startsWith('$$')) {
                    return <div key={idx} className="my-2.5 overflow-x-auto"><BlockMath math={step.replace(/\$\$/g, '')} /></div>;
                  }
                  const parsed = [];
                  let lastIdx = 0;
                  const mathRegex = /\$(.*?)\$/g;
                  let m;
                  while ((m = mathRegex.exec(step)) !== null) {
                    if (m.index > lastIdx) parsed.push(step.substring(lastIdx, m.index));
                    parsed.push(<InlineMath key={m.index} math={m[1]} />);
                    lastIdx = mathRegex.lastIndex;
                  }
                  if (lastIdx < step.length) parsed.push(step.substring(lastIdx));
                  return (
                    <div key={idx} className="block mt-1">
                      {parsed.map((p, pi) => {
                        if (typeof p === 'string') {
                          const boldParts = [];
                          let bLast = 0;
                          const bRe = /\*\*(.*?)\*\*/g;
                          let bm;
                          while ((bm = bRe.exec(p)) !== null) {
                            if (bm.index > bLast) boldParts.push(p.substring(bLast, bm.index));
                            boldParts.push(<strong key={bm.index} className="text-white font-extrabold">{bm[1]}</strong>);
                            bLast = bRe.lastIndex;
                          }
                          if (bLast < p.length) boldParts.push(p.substring(bLast));
                          return <React.Fragment key={pi}>{boldParts}</React.Fragment>;
                        }
                        return p;
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
