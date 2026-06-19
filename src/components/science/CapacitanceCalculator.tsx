'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface CalcResult {
  solveMode: 'capacitance' | 'energy' | 'voltage';
  capacitance: number;
  capacitanceFormatted: string;
  energy: number;
  energyFormatted: string;
  voltage: number;
  voltageFormatted: string;
  charge: number;
  chargeFormatted: string;
  capacitorType: string;
  typicalUse: string;
  energyDensity: string;
  capacitanceRange: string;
  timeConstant: number | null;
  cutoffFreq: number | null;
  steps: string[];
}

const ENERGY_UNITS: Record<string, number> = { J: 1, mJ: 1e-3, '\u00B5J': 1e-6, nJ: 1e-9, pJ: 1e-12, kWh: 3.6e6 };
const VOLTAGE_UNITS: Record<string, number> = { V: 1, mV: 1e-3, kV: 1e3, MV: 1e6 };
const CAPACITANCE_UNITS: Record<string, number> = { F: 1, mF: 1e-3, '\u00B5F': 1e-6, nF: 1e-9, pF: 1e-12 };

interface Example {
  label: string;
  mode: 'capacitance' | 'energy' | 'voltage';
  energy?: string;
  energyUnit?: string;
  voltage?: string;
  voltageUnit?: string;
  capacitance?: string;
  capacitanceUnit?: string;
}

const EXAMPLES: Example[] = [
  { label: 'Small Ceramic (100 pF @ 50 V)', mode: 'energy', capacitance: '100', capacitanceUnit: 'pF', voltage: '50', voltageUnit: 'V' },
  { label: 'Film Cap (1 \u00B5F @ 250 V)', mode: 'energy', capacitance: '1', capacitanceUnit: '\u00B5F', voltage: '250', voltageUnit: 'V' },
  { label: 'Electrolytic (100 \u00B5F @ 25 V)', mode: 'energy', capacitance: '100', capacitanceUnit: '\u00B5F', voltage: '25', voltageUnit: 'V' },
  { label: 'Supercapacitor (1 F @ 2.7 V)', mode: 'energy', capacitance: '1', capacitanceUnit: 'F', voltage: '2.7', voltageUnit: 'V' },
  { label: 'Power Supply (10 mF @ 12 V)', mode: 'energy', capacitance: '10', capacitanceUnit: 'mF', voltage: '12', voltageUnit: 'V' },
  { label: 'Energy in 100 J @ 50 V', mode: 'capacitance', energy: '100', energyUnit: 'J', voltage: '50', voltageUnit: 'V' },
];

function formatCapacitance(F: number): string {
  if (F >= 1) return `${F >= 1000 ? (F / 1000).toFixed(3) : F.toFixed(3)} ${F >= 1000 ? 'kF' : 'F'}`;
  if (F >= 1e-3) return `${(F * 1e3).toFixed(3)} mF`;
  if (F >= 1e-6) return `${(F * 1e6).toFixed(3)} \u00B5F`;
  if (F >= 1e-9) return `${(F * 1e9).toFixed(3)} nF`;
  return `${(F * 1e12).toFixed(3)} pF`;
}

function formatEnergy(J: number): string {
  if (J >= 1e6) return `${(J / 1e6).toFixed(4)} kWh`;
  if (J >= 1) return `${J.toFixed(4)} J`;
  if (J >= 1e-3) return `${(J * 1e3).toFixed(4)} mJ`;
  if (J >= 1e-6) return `${(J * 1e6).toFixed(4)} \u00B5J`;
  if (J >= 1e-9) return `${(J * 1e9).toFixed(4)} nJ`;
  return `${(J * 1e12).toFixed(4)} pJ`;
}

function formatVoltage(V: number): string {
  if (V >= 1e6) return `${(V / 1e6).toFixed(3)} MV`;
  if (V >= 1e3) return `${(V / 1e3).toFixed(3)} kV`;
  if (V >= 1) return `${V.toFixed(3)} V`;
  return `${(V * 1e3).toFixed(3)} mV`;
}

function formatCharge(Q: number): string {
  if (Q >= 1) return `${Q.toFixed(4)} C`;
  if (Q >= 1e-3) return `${(Q * 1e3).toFixed(4)} mC`;
  if (Q >= 1e-6) return `${(Q * 1e6).toFixed(4)} \u00B5C`;
  return `${(Q * 1e9).toFixed(4)} nC`;
}

function categorizeCapacitor(C: number): string {
  if (C >= 1) return 'Supercapacitor';
  if (C >= 1e-3) return 'Electrolytic Capacitor';
  if (C >= 1e-6) return 'Film Capacitor';
  if (C >= 1e-9) return 'Ceramic Capacitor';
  if (C >= 1e-12) return 'Small Ceramic Capacitor';
  return 'Very Small Capacitor';
}

function getTypicalUse(C: number): string {
  if (C >= 1) return 'Energy storage, backup power systems';
  if (C >= 1e-3) return 'Power supply filtering, audio circuits';
  if (C >= 1e-6) return 'Signal coupling, timing circuits';
  if (C >= 1e-9) return 'High-frequency filtering, RF circuits';
  if (C >= 1e-12) return 'Oscillator circuits, precision timing';
  return 'Specialized applications';
}

function getEnergyDensity(E: number, C: number): string {
  const ed = C > 0 ? E / C : 0;
  if (ed >= 1000) return 'Very High';
  if (ed >= 100) return 'High';
  if (ed >= 10) return 'Medium';
  if (ed >= 1) return 'Low';
  return 'Very Low';
}

function getCapacitanceRange(C: number): string {
  if (C >= 1) return '1 F \u2013 5000 F (Supercapacitors)';
  if (C >= 1e-3) return '1 mF \u2013 1000 mF (Electrolytic)';
  if (C >= 1e-6) return '1 \u00B5F \u2013 100 \u00B5F (Film/Ceramic)';
  if (C >= 1e-9) return '1 nF \u2013 1000 nF (Ceramic)';
  if (C >= 1e-12) return '1 pF \u2013 1000 pF (Small Ceramic)';
  return 'Sub-picofarad range';
}

export default function CapacitanceCalculator() {
  const [solveMode, setSolveMode] = useState<'capacitance' | 'energy' | 'voltage'>('capacitance');
  const [energy, setEnergy] = useState<string>('');
  const [energyUnit, setEnergyUnit] = useState<string>('J');
  const [voltage, setVoltage] = useState<string>('');
  const [voltageUnit, setVoltageUnit] = useState<string>('V');
  const [capacitance, setCapacitance] = useState<string>('');
  const [capacitanceUnit, setCapacitanceUnit] = useState<string>('\u00B5F');
  const [resistance, setResistance] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const pathRef = useRef<SVGPathElement>(null);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; speed: number; size: number }[]>([]);

  useEffect(() => {
    if (solveMode === 'capacitance') { setEnergy(''); setVoltage(''); setCapacitance(''); }
    else if (solveMode === 'energy') { setCapacitance(''); setVoltage(''); setEnergy(''); }
    else { setEnergy(''); setCapacitance(''); setVoltage(''); }
    setError('');
  }, [solveMode]);

  const getEnergyJ = (): number => {
    const v = parseFloat(energy);
    return isNaN(v) ? 0 : v * (ENERGY_UNITS[energyUnit] || 1);
  };
  const getVoltageV = (): number => {
    const v = parseFloat(voltage);
    return isNaN(v) ? 0 : v * (VOLTAGE_UNITS[voltageUnit] || 1);
  };
  const getCapacitanceF = (): number => {
    const v = parseFloat(capacitance);
    return isNaN(v) ? 0 : v * (CAPACITANCE_UNITS[capacitanceUnit] || 1);
  };

  const performCalc = (): CalcResult => {
    const steps: string[] = [];
    let C = 0, E = 0, V = 0;

    if (solveMode === 'capacitance') {
      const eV = getEnergyJ();
      const vV = getVoltageV();
      if (isNaN(eV) || eV <= 0) throw new Error('Energy must be a positive number.');
      if (isNaN(vV) || vV <= 0) throw new Error('Voltage must be a positive number.');
      E = eV;
      V = vV;
      C = (2 * E) / (V * V);
      steps.push('**Given Values**');
      steps.push(`Energy stored: $E = ${formatEnergy(E)}$`);
      steps.push(`Voltage across capacitor: $V = ${formatVoltage(V)}$`);
      steps.push('');
      steps.push('**Formula**');
      steps.push('Capacitance is derived from stored energy: $C = \\dfrac{2E}{V^2}$');
      steps.push('');
      steps.push('**Substitution**');
      steps.push(`$C = \\dfrac{2 \\times ${E.toExponential(4)}}{(${V.toExponential(4)})^2}$`);
      steps.push(`$C = \\dfrac{${(2 * E).toExponential(4)}}{${(V * V).toExponential(4)}}$`);
      steps.push('');
      steps.push('**Result**');
      steps.push(`$C = ${C.toExponential(6)}\\text{ F} = ${formatCapacitance(C)}$`);
    } else if (solveMode === 'energy') {
      const cF = getCapacitanceF();
      const vV = getVoltageV();
      if (isNaN(cF) || cF <= 0) throw new Error('Capacitance must be a positive number.');
      if (isNaN(vV) || vV <= 0) throw new Error('Voltage must be a positive number.');
      C = cF;
      V = vV;
      E = 0.5 * C * V * V;
      steps.push('**Given Values**');
      steps.push(`Capacitance: $C = ${formatCapacitance(C)}$`);
      steps.push(`Voltage across capacitor: $V = ${formatVoltage(V)}$`);
      steps.push('');
      steps.push('**Formula**');
      steps.push('Energy stored in a capacitor: $E = \\dfrac{1}{2} C V^2$');
      steps.push('');
      steps.push('**Substitution**');
      steps.push(`$E = \\dfrac{1}{2} \\times ${C.toExponential(4)} \\times (${V.toExponential(4)})^2$`);
      steps.push('');
      steps.push('**Result**');
      steps.push(`$E = ${E.toExponential(6)}\\text{ J} = ${formatEnergy(E)}$`);
    } else {
      const eV = getEnergyJ();
      const cF = getCapacitanceF();
      if (isNaN(eV) || eV <= 0) throw new Error('Energy must be a positive number.');
      if (isNaN(cF) || cF <= 0) throw new Error('Capacitance must be a positive number.');
      E = eV;
      C = cF;
      V = Math.sqrt((2 * E) / C);
      steps.push('**Given Values**');
      steps.push(`Energy stored: $E = ${formatEnergy(E)}$`);
      steps.push(`Capacitance: $C = ${formatCapacitance(C)}$`);
      steps.push('');
      steps.push('**Formula**');
      steps.push('Voltage from energy and capacitance: $V = \\sqrt{\\dfrac{2E}{C}}$');
      steps.push('');
      steps.push('**Substitution**');
      steps.push(`$V = \\sqrt{\\dfrac{2 \\times ${E.toExponential(4)}}{${C.toExponential(4)}}}$`);
      steps.push('');
      steps.push('**Result**');
      steps.push(`$V = ${V.toExponential(6)}\\text{ V} = ${formatVoltage(V)}$`);
    }

    const Q = C * V;
    const tau = resistance ? parseFloat(resistance) > 0 ? C * parseFloat(resistance) : null : null;
    const fc = tau && tau > 0 ? 1 / (2 * Math.PI * tau) : null;

    if (solveMode === 'capacitance') {
      steps.push('');
      steps.push('**Charge Stored**');
      steps.push(`$Q = C \\times V = ${formatCapacitance(C)} \\times ${formatVoltage(V)} = ${formatCharge(Q)}$`);
      if (tau !== null) {
        steps.push('');
        steps.push('**RC Time Constant**');
        steps.push(`$\\tau = R \\times C = ${resistance} \\times ${formatCapacitance(C)} = ${tau.toExponential(4)}\\text{ s}$`);
      }
      if (fc !== null) {
        steps.push('**Cutoff Frequency**');
        steps.push(`$f_c = \\dfrac{1}{2\\pi RC} = \\dfrac{1}{2\\pi \\times \\tau} = ${fc.toExponential(4)}\\text{ Hz}$`);
      }
    }

    return {
      solveMode,
      capacitance: C,
      capacitanceFormatted: formatCapacitance(C),
      energy: E,
      energyFormatted: formatEnergy(E),
      voltage: V,
      voltageFormatted: formatVoltage(V),
      charge: Q,
      chargeFormatted: formatCharge(Q),
      capacitorType: categorizeCapacitor(C),
      typicalUse: getTypicalUse(C),
      energyDensity: getEnergyDensity(E, C),
      capacitanceRange: getCapacitanceRange(C),
      timeConstant: tau,
      cutoffFreq: fc,
      steps,
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = performCalc();
      setResult(r);
      setHasCalculated(true);
      setError('');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#1a1a1a', '#ffffff', '#3b82f6', '#10b981'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setEnergy('');
    setVoltage('');
    setCapacitance('');
    setResistance('');
    setEnergyUnit('J');
    setVoltageUnit('V');
    setCapacitanceUnit('\u00B5F');
    setResult(null);
    setHasCalculated(false);
    setError('');
    setShowAdvanced(false);
  };

  const loadExample = (ex: Example) => {
    setSolveMode(ex.mode);
    if (ex.energy !== undefined) { setEnergy(ex.energy); setEnergyUnit(ex.energyUnit || 'J'); }
    else setEnergy('');
    if (ex.voltage !== undefined) { setVoltage(ex.voltage); setVoltageUnit(ex.voltageUnit || 'V'); }
    else setVoltage('');
    if (ex.capacitance !== undefined) { setCapacitance(ex.capacitance); setCapacitanceUnit(ex.capacitanceUnit || 'F'); }
    else setCapacitance('');
    setError('');
  };

  useEffect(() => {
    let animFrameId: number;

    if (!particlesRef.current.length) {
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x: Math.random() * 200,
          y: 90 + Math.random() * 80,
          speed: 0.3 + Math.random() * 0.7,
          size: 1 + Math.random() * 2,
        });
      }
    }

    const animate = () => {
      timeRef.current += 0.03;

      // Determine charge level (0-1) from result
      let chargeLevel = 0.5;
      if (result) {
        const maxExample = 1000;
        const energyVal = result.energy;
        chargeLevel = Math.min(1, Math.max(0.1, Math.log10(1 + energyVal) / Math.log10(1 + maxExample)));
      } else {
        const eV = getEnergyJ();
        const vV = getVoltageV();
        if (eV > 0 && vV > 0) {
          const estC = (2 * eV) / (vV * vV);
          chargeLevel = Math.min(1, Math.max(0.1, Math.log10(1 + estC) / 7));
        }
      }

      // Update particles (move upward toward top plate)
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const targetY = 90 - 60 * chargeLevel;
        p.y -= p.speed * (0.3 + 0.7 * chargeLevel);
        if (p.y < targetY) {
          p.y = 90 + Math.random() * 80;
          p.x = 60 + Math.random() * 80;
          p.speed = 0.3 + Math.random() * 0.7;
        }
      }

      // Draw exponential charging curve
      if (pathRef.current) {
        const w = 480;
        const h = 100;
        const amp = chargeLevel * 35;
        const tau = 1.5;
        const points: string[] = [];
        for (let x = 0; x <= w; x += 3) {
          const t = (x / w + timeRef.current * 0.15) % 2;
          const vOut = t <= 1 ? amp * (1 - Math.exp(-t / tau)) : amp * Math.exp(-(t - 1) / tau);
          const y = h / 2 + 30 - vOut;
          points.push(x === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        pathRef.current.setAttribute('d', points.join(' '));
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [result, energy, voltage, capacitance, solveMode]);

  const renderInputs = () => {
    if (solveMode === 'capacitance') {
      return (
        <>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Energy (E):</span>
            <input type="text" value={energy} onChange={(e) => { setEnergy(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 0.5" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={energyUnit} onChange={(e) => setEnergyUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(ENERGY_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Voltage (V):</span>
            <input type="text" value={voltage} onChange={(e) => { setVoltage(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 12" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={voltageUnit} onChange={(e) => setVoltageUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(VOLTAGE_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </>
      );
    } else if (solveMode === 'energy') {
      return (
        <>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Capacitance (C):</span>
            <input type="text" value={capacitance} onChange={(e) => { setCapacitance(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 100" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={capacitanceUnit} onChange={(e) => setCapacitanceUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(CAPACITANCE_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Voltage (V):</span>
            <input type="text" value={voltage} onChange={(e) => { setVoltage(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 250" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={voltageUnit} onChange={(e) => setVoltageUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(VOLTAGE_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Energy (E):</span>
            <input type="text" value={energy} onChange={(e) => { setEnergy(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 0.5" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={energyUnit} onChange={(e) => setEnergyUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(ENERGY_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Capacitance (C):</span>
            <input type="text" value={capacitance} onChange={(e) => { setCapacitance(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 100" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={capacitanceUnit} onChange={(e) => setCapacitanceUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(CAPACITANCE_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </>
      );
    }
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Capacitance Energy Storage</span>
          <span className="text-xs text-slate-500 mt-1"><InlineMath math="E = \\frac{1}{2} C V^2" /></span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Examples</span>
          <select onChange={(e) => { const idx = parseInt(e.target.value); if (idx >= 0) loadExample(EXAMPLES[idx]); }} defaultValue=""
            className="mt-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-400">
            <option value="" disabled>Select an example...</option>
            {EXAMPLES.map((ex, i) => <option key={i} value={i}>{ex.label}</option>)}
          </select>
        </div>
      </div>

      {/* Solve Mode Tabs */}
      <div className="flex space-x-2 bg-slate-50 p-1 rounded-xl w-fit mx-auto">
        {([
          { key: 'capacitance', label: 'Solve for C' },
          { key: 'energy', label: 'Solve for E' },
          { key: 'voltage', label: 'Solve for V' },
        ] as const).map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setSolveMode(key)}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-200 ${solveMode === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInputs()}
        </div>

        {/* Advanced: Resistance for TC and Cutoff */}
        <div className="text-left">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
            {showAdvanced ? '\u25BC' : '\u25B6'} Advanced: Time Constant & Cutoff
          </button>
          {showAdvanced && (
            <div className="mt-3 max-w-xs">
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl text-left space-y-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Resistance (R):</span>
                <input type="text" value={resistance} onChange={(e) => setResistance(e.target.value.replace(/[^0-9.eE+-]/g, ''))}
                  placeholder="e.g., 1000" className="w-full bg-transparent text-lg font-bold text-slate-900 focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button type="submit" className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm">
            Calculate
          </button>
          <button type="button" onClick={handleReset}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm">
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
      )}

      {/* Capacitor Charging Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">Capacitor Charging Visualizer</span>
          <span className="text-[9px] text-slate-450 font-medium">Animated charge distribution and voltage waveform.</span>
        </div>
        <div className="w-full max-w-4xl relative">
          <svg viewBox="0 0 800 220" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl overflow-hidden block">
            <defs>
              <pattern id="cap-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
              </pattern>
              <marker id="cap-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
              </marker>
              <linearGradient id="plate-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4b5563" />
                <stop offset="100%" stopColor="#1f2937" />
              </linearGradient>
              <linearGradient id="charge-dot" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="dot-glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="curve-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <rect width="100%" height="100%" fill="url(#cap-grid)" />

            {/* Left side: Capacitor plates */}
            <g transform="translate(30, 20)">
              {/* Top plate */}
              <rect x="20" y="20" width="140" height="8" rx="2" fill="url(#plate-grad)" stroke="#6b7280" strokeWidth="0.5" />
              {/* Bottom plate */}
              <rect x="20" y="152" width="140" height="8" rx="2" fill="url(#plate-grad)" stroke="#6b7280" strokeWidth="0.5" />
              {/* Dielectric label */}
              <text x="90" y="93" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">Dielectric</text>
              {/* Electric field lines */}
              <line x1="40" y1="28" x2="40" y2="152" stroke="#3b82f6" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4" />
              <line x1="90" y1="28" x2="90" y2="152" stroke="#3b82f6" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4" />
              <line x1="140" y1="28" x2="140" y2="152" stroke="#3b82f6" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4" />
              {/* Lead wires */}
              <line x1="90" y1="0" x2="90" y2="20" stroke="#6b7280" strokeWidth="1.5" />
              <line x1="90" y1="160" x2="90" y2="180" stroke="#6b7280" strokeWidth="1.5" />
              {/* Charge particles */}
              {particlesRef.current.map((p, i) => {
                const cx = 30 + p.x * 0.5;
                const cy = p.y;
                return <circle key={i} cx={cx} cy={cy} r={p.size} fill="url(#charge-dot)" filter="url(#dot-glow)" opacity={0.85} />;
              })}

              {/* Voltage indicator */}
              <rect x="5" y="28" width="8" height="124" rx="2" fill="#1f2937" stroke="#374151" strokeWidth="0.5" />
              <rect x="5" y={28 + 124 - (() => {
                let level = 0.5;
                if (result) {
                  const maxExample = 1000;
                  level = Math.min(1, Math.max(0.05, Math.log10(1 + result.energy) / Math.log10(1 + maxExample)));
                }
                return level * 124;
              })()} width="8" height={(() => {
                let level = 0.5;
                if (result) {
                  const maxExample = 1000;
                  level = Math.min(1, Math.max(0.05, Math.log10(1 + result.energy) / Math.log10(1 + maxExample)));
                }
                return level * 124;
              })()} rx="1" fill="#3b82f6" opacity="0.8" />
            </g>

            {/* Right side: Oscilloscope charging curve */}
            <g transform="translate(280, 20)">
              <rect x="0" y="0" width="490" height="180" rx="4" fill="#0d1117" stroke="#1f2937" strokeWidth="1" />
              {/* Grid */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <line key={`gh${i}`} x1="0" y1={i * 36} x2="490" y2={i * 36} stroke="#1a2332" strokeWidth="0.5" />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <line key={`gv${i}`} x1={i * 49} y1="0" x2={i * 49} y2="180" stroke="#1a2332" strokeWidth="0.5" />
              ))}
              {/* Center axis */}
              <line x1="0" y1="90" x2="490" y2="90" stroke="#2d3748" strokeWidth="0.8" strokeDasharray="4 4" />
              {/* Trace path */}
              <path ref={pathRef} d="" fill="none" stroke="#10b981" strokeWidth="2" filter="url(#curve-glow)" />
              {/* Labels */}
              <text x="245" y="175" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">Time (t) &rarr;</text>
              <text x="8" y="12" fill="#10b981" fontSize="7" fontFamily="monospace" fontWeight="bold">V(t)</text>
              <text x="470" y="12" textAnchor="end" fill="#6b7280" fontSize="6" fontFamily="monospace">
                {result ? `${result.voltageFormatted}` : '0 V'}
              </text>
              {/* Charge level indicator */}
              <text x="245" y="20" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">
                {result ? `Energy: ${result.energyFormatted}` : 'Waiting for input...'}
              </text>
              {/* Voltage markers */}
              <text x="475" y="88" textAnchor="end" fill="#374151" fontSize="6" fontFamily="monospace">0</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">CAP</span>
          </div>

          <div className="relative z-10 space-y-8 text-left">
            <div className="text-center pb-4 border-b border-slate-800/80">
              <h3 className="text-lg font-extrabold text-white font-display">
                {solveMode === 'capacitance' ? 'Capacitance' : solveMode === 'energy' ? 'Stored Energy' : 'Voltage'} Result
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Capacitance</span>
                <span className="text-lg font-black text-white font-mono">{result.capacitanceFormatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Energy</span>
                <span className="text-lg font-black text-white font-mono">{result.energyFormatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Voltage</span>
                <span className="text-lg font-black text-white font-mono">{result.voltageFormatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Charge (Q)</span>
                <span className="text-lg font-black text-white font-mono">{result.chargeFormatted}</span>
              </div>
            </div>

            {/* Capacitor Analysis */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Capacitor Analysis</span>
              </div>
              <div className="divide-y divide-slate-700/50 text-xs">
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Capacitor Type</span>
                  <span className="font-bold text-white">{result.capacitorType}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Typical Use</span>
                  <span className="font-bold text-white">{result.typicalUse}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Energy Density</span>
                  <span className="font-bold text-white">{result.energyDensity}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Capacitance Range</span>
                  <span className="font-bold text-white">{result.capacitanceRange}</span>
                </div>
              </div>
            </div>

            {/* Derived Parameters */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Derived RC Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Time Constant (&tau;)</span>
                  <div className="text-lg font-black text-white font-mono">
                    {result.timeConstant !== null ? `${result.timeConstant.toExponential(4)} s` : '\u2014'}
                  </div>
                  <p className="text-[8px] text-slate-400 leading-snug">
                    <InlineMath math="\tau = R \times C" /> &mdash; time to reach 63% charge
                  </p>
                </div>
                <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cutoff Frequency (f<sub>c</sub>)</span>
                  <div className="text-lg font-black text-white font-mono">
                    {result.cutoffFreq !== null ? `${result.cutoffFreq.toExponential(4)} Hz` : '\u2014'}
                  </div>
                  <p className="text-[8px] text-slate-400 leading-snug">
                    <InlineMath math="f_c = 1 / (2\pi RC)" /> &mdash; RC filter -3 dB point
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Step-by-Step Calculations
              </h4>
              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                {result.steps.map((step, idx) => {
                  if (step.startsWith('$$')) {
                    return <div key={idx} className="my-2.5 overflow-x-auto"><BlockMath math={step.replace(/\$\$/g, '')} /></div>;
                  }
                  const parts: React.ReactNode[] = [];
                  let lastIdx = 0;
                  const mathRegex = /\$(.*?)\$/g;
                  let m: RegExpExecArray | null;
                  while ((m = mathRegex.exec(step)) !== null) {
                    if (m.index > lastIdx) parts.push(step.substring(lastIdx, m.index));
                    parts.push(<InlineMath key={m.index} math={m[1]} />);
                    lastIdx = mathRegex.lastIndex;
                  }
                  if (lastIdx < step.length) parts.push(step.substring(lastIdx));
                  const formatted = parts.map((p, pIdx) => {
                    if (typeof p === 'string') {
                      const subParts: React.ReactNode[] = [];
                      let sLast = 0;
                      const bRegex = /\*\*(.*?)\*\*/g;
                      let bm: RegExpExecArray | null;
                      while ((bm = bRegex.exec(p)) !== null) {
                        if (bm.index > sLast) subParts.push(p.substring(sLast, bm.index));
                        subParts.push(<strong key={bm.index} className="text-white font-extrabold">{bm[1]}</strong>);
                        sLast = bRegex.lastIndex;
                      }
                      if (sLast < p.length) subParts.push(p.substring(sLast));
                      return <React.Fragment key={pIdx}>{subParts}</React.Fragment>;
                    }
                    return p;
                  });
                  return step === '' ? <br key={idx} /> : <div key={idx}>{formatted}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
