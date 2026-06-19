'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface CalcResult {
  fluxEA: number;
  fluxGauss: number;
  electricField: number;
  fieldUnit: string;
  angle: number;
  area: number;
  areaUnit: string;
  charge: number;
  chargeUnit: string;
  permittivity: number;
  fluxType: string;
  fieldStrength: string;
  surfaceOrientation: string;
  typicalApplication: string;
  steps: string[];
}

const CHARGE_MULT: Record<string, number> = {
  C: 1, mC: 1e-3, '\u00B5C': 1e-6, nC: 1e-9, pC: 1e-12,
  e: 1.602176634e-19, Ah: 3600, mAh: 3.6,
};

const PERMITTIVITY_PRESETS: Record<string, string> = {
  Vacuum: '8.854',
  Air: '8.854',
  Glass: '50',
  Silicon: '117',
  Water: '710',
  'Teflon (PTFE)': '21',
};

interface Example {
  label: string;
  field: string;
  fieldUnit: string;
  angle: string;
  area: string;
  areaUnit: string;
  charge: string;
  chargeUnit: string;
  permittivity: string;
}

const EXAMPLES: Example[] = [
  { label: 'Uniform Field (10 V/m, 15 m\u00B2, 5\u00B0)', field: '10', fieldUnit: 'V/m', angle: '5', area: '15', areaUnit: 'm\u00B2', charge: '4.36', chargeUnit: 'nC', permittivity: '8.854' },
  { label: 'Gauss Sphere (4.36 nC)', field: '50', fieldUnit: 'V/m', angle: '0', area: '10', areaUnit: 'm\u00B2', charge: '4.36', chargeUnit: 'nC', permittivity: '8.854' },
  { label: 'Perpendicular Max Flux (20 V/m, 5 m\u00B2, 0\u00B0)', field: '20', fieldUnit: 'V/m', angle: '0', area: '5', areaUnit: 'm\u00B2', charge: '10', chargeUnit: 'nC', permittivity: '8.854' },
  { label: 'Parallel Zero Flux (50 V/m, 10 m\u00B2, 90\u00B0)', field: '50', fieldUnit: 'V/m', angle: '90', area: '10', areaUnit: 'm\u00B2', charge: '0', chargeUnit: 'nC', permittivity: '8.854' },
  { label: 'Strong Field (1 kV/m, 0.1 m\u00B2, 30\u00B0)', field: '1', fieldUnit: 'kV/m', angle: '30', area: '0.1', areaUnit: 'm\u00B2', charge: '5', chargeUnit: '\u00B5C', permittivity: '8.854' },
  { label: 'Large Charge (100 \u00B5C in Vacuum)', field: '100', fieldUnit: 'V/m', angle: '45', area: '2', areaUnit: 'm\u00B2', charge: '100', chargeUnit: '\u00B5C', permittivity: '8.854' },
];

const FIELD_UNITS: Record<string, number> = { 'V/m': 1, 'kV/m': 1e3, 'MV/m': 1e6, 'N/C': 1 };
const AREA_UNITS: Record<string, number> = { 'm\u00B2': 1, 'cm\u00B2': 1e-4, 'mm\u00B2': 1e-6, 'km\u00B2': 1e6 };

function fmt(v: number, d = 4): string {
  if (!isFinite(v)) return '0';
  if (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-4 && v !== 0)) return v.toExponential(d);
  return v.toFixed(d);
}

function categorizeFlux(f: number): string {
  const a = Math.abs(f);
  if (a >= 1000) return 'Very High Flux';
  if (a >= 100) return 'High Flux';
  if (a >= 10) return 'Medium Flux';
  if (a >= 1) return 'Low Flux';
  if (a >= 0.1) return 'Very Low Flux';
  return 'Minimal Flux';
}

function categorizeField(E: number): string {
  if (E >= 1e6) return 'Very Strong (Lightning)';
  if (E >= 1e4) return 'Strong (High Voltage)';
  if (E >= 1e2) return 'Medium (Power Lines)';
  if (E >= 1) return 'Weak (Household)';
  if (E >= 1e-3) return 'Very Weak (Sensors)';
  return 'Minimal (Background)';
}

function categorizeSurface(a: number): string {
  if (a <= 5) return 'Nearly Perpendicular';
  if (a <= 15) return 'Slightly Tilted';
  if (a <= 45) return 'Moderately Tilted';
  if (a <= 75) return 'Highly Tilted';
  if (a <= 90) return 'Nearly Parallel';
  return 'Opposite Direction';
}

function getTypicalApp(f: number): string {
  const a = Math.abs(f);
  if (a >= 1000) return 'High-power systems, lightning research';
  if (a >= 100) return 'Power transmission, industrial equipment';
  if (a >= 10) return 'Household appliances, electronic devices';
  if (a >= 1) return 'Small circuits, sensors';
  return 'Precision measurements, research';
}

export default function ElectricFluxCalculator() {
  const [field, setField] = useState('10');
  const [fieldUnit, setFieldUnit] = useState('V/m');
  const [angle, setAngle] = useState('5');
  const [area, setArea] = useState('15');
  const [areaUnit, setAreaUnit] = useState('m\u00B2');
  const [charge, setCharge] = useState('4.36');
  const [chargeUnit, setChargeUnit] = useState('nC');
  const [permittivity, setPermittivity] = useState('8.854');
  const [result, setResult] = useState<CalcResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<{ x: number; y: number; speed: number; line: number }[]>([]);
  const timeRef = useRef(0);
  const surfaceRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (!particlesRef.current.length) {
      const pts: typeof particlesRef.current = [];
      for (let i = 0; i < 40; i++) {
        pts.push({ x: 100 + (i % 9) * 55 + Math.random() * 20, y: Math.random() * 200, speed: 0.3 + Math.random() * 0.8, line: i % 9 });
      }
      particlesRef.current = pts;
    }
  }, []);

  const getFieldVm = (): number => {
    const v = parseFloat(field);
    return isNaN(v) ? 0 : v * (FIELD_UNITS[fieldUnit] || 1);
  };
  const getAreaM2 = (): number => {
    const v = parseFloat(area);
    return isNaN(v) ? 0 : v * (AREA_UNITS[areaUnit] || 1);
  };
  const getChargeC = (): number => {
    const v = parseFloat(charge);
    return isNaN(v) ? 0 : v * (CHARGE_MULT[chargeUnit] || 1);
  };
  const getPermFm = (): number => {
    const v = parseFloat(permittivity);
    return isNaN(v) ? 8.854 : v;
  };

  const performCalc = (): CalcResult => {
    const eVm = getFieldVm();
    const aM2 = getAreaM2();
    const angDeg = parseFloat(angle);
    const qC = getChargeC();
    const eps = getPermFm();

    if (isNaN(eVm) || eVm < 0) throw new Error('Electric field must be a non-negative number.');
    if (isNaN(aM2) || aM2 <= 0) throw new Error('Surface area must be a positive number.');
    if (isNaN(angDeg) || angDeg < 0 || angDeg > 180) throw new Error('Angle must be between 0 and 180 degrees.');
    if (isNaN(qC)) throw new Error('Charge must be a valid number.');
    if (isNaN(eps) || eps <= 0) throw new Error('Permittivity must be a positive number.');

    const angRad = angDeg * Math.PI / 180;
    const fluxEA = eVm * aM2 * Math.cos(angRad);
    const permSI = eps * 1e-12;
    const fluxGauss = permSI > 0 ? qC / permSI : 0;

    const steps: string[] = [];

    steps.push('**Given Values**');
    steps.push(`Electric field: $E = ${fmt(eVm, 2)}\\text{ V/m}$`);
    steps.push(`Surface area: $A = ${fmt(aM2, 2)}\\text{ m}^2$`);
    steps.push(`Angle: $\\theta = ${fmt(angDeg, 1)}^{\\circ}$`);
    steps.push(`Charge: $Q = ${fmt(qC, 4)}\\text{ C}$`);
    steps.push(`Permittivity: $\\varepsilon = ${eps} \\times 10^{-12}\\text{ F/m}$`);
    steps.push('');

    steps.push('**Method 1: Surface Integral — $\\Phi = E \\cdot A \\cdot \\cos(\\theta)$**');
    steps.push(`Convert angle to radians: $\\theta = ${fmt(angDeg, 1)}^{\\circ} \\times \\frac{\\pi}{180} = ${fmt(angRad, 4)}\\text{ rad}$`);
    steps.push(`$\\Phi_1 = ${fmt(eVm, 2)} \\times ${fmt(aM2, 2)} \\times \\cos(${fmt(angRad, 4)})$`);
    steps.push(`$\\Phi_1 = ${fmt(fluxEA, 4)}\\text{ V}\\cdot\\text{m}$`);
    steps.push('');

    steps.push('**Method 2: Gauss\'s Law — $\\Phi = \\frac{Q}{\\varepsilon}$**');
    steps.push(`$\\Phi_2 = \\frac{${fmt(qC, 4)}}{${eps} \\times 10^{-12}}$`);
    steps.push(`$\\Phi_2 = ${fmt(fluxGauss, 4)}\\text{ V}\\cdot\\text{m}$`);
    steps.push('');

    steps.push('**Comparison**');
    steps.push(`Difference: $|\\Phi_1 - \\Phi_2| = ${fmt(Math.abs(fluxEA - fluxGauss), 4)}\\text{ V}\\cdot\\text{m}$`);

    return {
      fluxEA, fluxGauss,
      electricField: eVm, fieldUnit,
      angle: angDeg, area: aM2, areaUnit,
      charge: qC, chargeUnit,
      permittivity: eps,
      fluxType: categorizeFlux(fluxEA),
      fieldStrength: categorizeField(eVm),
      surfaceOrientation: categorizeSurface(angDeg),
      typicalApplication: getTypicalApp(fluxEA),
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
        particleCount: 100, spread: 70, origin: { y: 0.65 },
        colors: ['#1a1a1a', '#ffffff', '#8b5cf6', '#3b82f6'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setField('10'); setFieldUnit('V/m'); setAngle('5'); setArea('15'); setAreaUnit('m\u00B2');
    setCharge('4.36'); setChargeUnit('nC'); setPermittivity('8.854');
    setResult(null); setHasCalculated(false); setError('');
  };

  const loadExample = (ex: Example) => {
    setField(ex.field); setFieldUnit(ex.fieldUnit); setAngle(ex.angle);
    setArea(ex.area); setAreaUnit(ex.areaUnit);
    setCharge(ex.charge); setChargeUnit(ex.chargeUnit); setPermittivity(ex.permittivity);
    setError('');
  };

  const angDeg = parseFloat(angle) || 5;
  const angRadVis = angDeg * Math.PI / 180;
  const fluxLevel = Math.min(1, Math.max(0.02, (() => {
    if (result) return Math.min(1, Math.log10(1 + Math.abs(result.fluxEA)) / 5);
    const ev = getFieldVm(); const am = getAreaM2();
    if (ev > 0 && am > 0) return Math.min(1, Math.log10(1 + ev * am) / 6);
    return 0.3;
  })()));

  useEffect(() => {
    let animId: number;
    const animate = () => {
      timeRef.current += 0.025;
      const pts = particlesRef.current;
      const centerY = 110;
      const visAngleRad = angRadVis;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.y += p.speed * (0.5 + fluxLevel) * 0.8;
        if (p.y > 220) { p.y = 10; p.x = 100 + (p.line) * 55 + Math.random() * 20; }
      }

      if (surfaceRef.current) {
        const cosA = Math.cos(visAngleRad);
        const w = 80 + 420 * (1 - Math.abs(cosA) * 0.5);
        const h = Math.max(6, 18 * (1 - Math.abs(cosA) * 0.3));
        surfaceRef.current.setAttribute('width', String(w));
        surfaceRef.current.setAttribute('height', String(h));
        surfaceRef.current.setAttribute('x', String((800 - w) / 2));
        surfaceRef.current.setAttribute('y', String(centerY - h / 2));
      }

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [angRadVis, fluxLevel, result, angle, field, area]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Electric Flux &amp; Gauss's Law</span>
          <span className="text-xs text-slate-500 mt-1"><InlineMath math="\Phi_E = \vec{E} \cdot \vec{A} = E \, A \cos\theta" /></span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Examples</span>
          <select onChange={(e) => { const i = parseInt(e.target.value); if (i >= 0) loadExample(EXAMPLES[i]); }} defaultValue=""
            className="mt-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-400">
            <option value="" disabled>Select an example...</option>
            {EXAMPLES.map((ex, i) => <option key={i} value={i}>{ex.label}</option>)}
          </select>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Row 1: Field, Angle, Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Electric Field (E):</span>
            <input type="text" value={field} onChange={(e) => { setField(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 10" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={fieldUnit} onChange={(e) => setFieldUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(FIELD_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Angle (\u03B8):</span>
            <input type="text" value={angle} onChange={(e) => { setAngle(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 5" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <span className="text-[10px] text-slate-400 font-semibold">degrees (0\u2013180)</span>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Surface Area (A):</span>
            <input type="text" value={area} onChange={(e) => { setArea(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 15" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(AREA_UNITS).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Charge, Charge Unit, Permittivity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Charge (Q):</span>
            <input type="text" value={charge} onChange={(e) => { setCharge(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 4.36" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={chargeUnit} onChange={(e) => setChargeUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              {Object.keys(CHARGE_MULT).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Permittivity (\u03B5 \u00D710\u207B\u00B9\u00B2 F/m):</span>
            <input type="text" value={permittivity} onChange={(e) => { setPermittivity(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="e.g., 8.854" className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
            <select value={Object.entries(PERMITTIVITY_PRESETS).find(([, v]) => v === permittivity)?.[0] || ''}
              onChange={(e) => { if (e.target.value) setPermittivity(PERMITTIVITY_PRESETS[e.target.value]); }}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
              <option value="">Presets...</option>
              {Object.entries(PERMITTIVITY_PRESETS).map(([k, v]) => <option key={k} value={k}>{k} ({v})</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3 flex flex-col justify-center items-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">\u03B5\u2080 = 8.854\u00D710\u207B\u00B9\u00B2 F/m</span>
            <span className="text-[9px] text-slate-450">Vacuum permittivity constant</span>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button type="submit" className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm">
            Calculate Electric Flux
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

      {/* Electric Field Visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">Electric Field &amp; Surface Visualizer</span>
          <span className="text-[9px] text-slate-450 font-medium">Field lines passing through a surface tilted at \u03B8.</span>
        </div>
        <div className="w-full max-w-4xl relative">
          <svg viewBox="0 0 800 250" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl overflow-hidden block">
            <defs>
              <pattern id="flux-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
              </pattern>
              <filter id="flux-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="surface-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="field-line-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
              <marker id="arrow-down" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
                <polygon points="0 0, 6 0, 3 6" fill="#8b5cf6" />
              </marker>
            </defs>

            <rect width="100%" height="100%" fill="url(#flux-grid)" />

            {/* Field source symbols at top */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
              const cx = 100 + i * 55;
              return (
                <g key={`src${i}`}>
                  <text x={cx} y="22" textAnchor="middle" fill="#8b5cf6" fontSize="11" fontWeight="bold" filter="url(#flux-glow)">+</text>
                  <line x1={cx} y1="28" x2={cx} y2="40" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
                </g>
              );
            })}

            {/* Field lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
              const cx = 100 + i * 55;
              return (
                <g key={`line${i}`}>
                  <line x1={cx} y1="40" x2={cx} y2="210" stroke="url(#field-line-grad)" strokeWidth="1.5" opacity="0.5" />
                  <line x1={cx} y1="40" x2={cx} y2="210" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 6" />
                  <line x1={cx} y1="50" x2={cx} y2="65" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-down)" />
                </g>
              );
            })}

            {/* Animated particles flowing along field lines */}
            {particlesRef.current.map((p, i) => {
              const alpha = 0.4 + 0.6 * ((Math.sin(timeRef.current * 3 + i) + 1) / 2);
              return (
                <circle key={`p${i}`} cx={p.x} cy={p.y} r="2" fill="#a78bfa" opacity={alpha} filter="url(#flux-glow)" />
              );
            })}

            {/* Surface plane */}
            <g>
              <rect ref={surfaceRef} x="250" y="95" width="300" height="18" rx="3" fill="#3b82f6" opacity={0.25 + 0.4 * fluxLevel} filter="url(#surface-glow)" />
              <rect ref={surfaceRef} x="250" y="95" width="300" height="18" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1" opacity={0.5 + 0.5 * fluxLevel} />
            </g>

            {/* Angle arc annotation */}
            <g transform="translate(400, 104)">
              <path d={`M 0 0 L ${40 * Math.sin(angRadVis)} ${-40 * Math.cos(angRadVis)}`} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
              <path d={`M 0 0 L 0 -40`} fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
              <path d={`M 0 0 A 40 40 0 0 ${angDeg > 180 ? 1 : 0} ${40 * Math.sin(angRadVis)} ${-40 * Math.cos(angRadVis)}`} fill="none" stroke="#f59e0b" strokeWidth="1" />
              <text x="10" y="-20" fill="#f59e0b" fontSize="8" fontFamily="monospace">{'\u03B8'} = {angDeg.toFixed(0)}°</text>
            </g>

            {/* Bottom info bar */}
            <rect x="0" y="225" width="800" height="25" fill="#111827" opacity="0.8" />
            <text x="20" y="240" fill="#9ca3af" fontSize="8" fontFamily="monospace">
              E = {fmt(getFieldVm(), 2)} V/m
            </text>
            <text x="250" y="240" fill="#9ca3af" fontSize="8" fontFamily="monospace">
              A = {fmt(getAreaM2(), 2)} m²
            </text>
            <text x="450" y="240" fill="#9ca3af" fontSize="8" fontFamily="monospace">
              {'\u03B8'} = {angDeg.toFixed(1)}°
            </text>
            <text x="600" y="240" fill={result ? '#10b981' : '#6b7280'} fontSize="8" fontFamily="monospace" fontWeight="bold">
              {result ? `\u03A6 = ${fmt(result.fluxEA, 2)} V\u00B7m` : 'Waiting for input...'}
            </text>

            {/* Flux type badge */}
            {result && (
              <g>
                <rect x="20" y="35" rx="4" width="100" height="18" fill="#1f2937" opacity="0.85" />
                <text x="70" y="47" textAnchor="middle" fill="#10b981" fontSize="7" fontFamily="monospace" fontWeight="bold">
                  {result.fluxType}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">FLUX</span>
          </div>
          <div className="relative z-10 space-y-8 text-left">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-extrabold text-white text-center font-display">Electric Flux Results</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">\u03A6 = E\u00B7A\u00B7cos(\u03B8)</span>
                <span className="text-lg font-black text-white font-mono">{fmt(result.fluxEA, 4)} V\u00B7m</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">\u03A6 = Q/\u03B5 (Gauss)</span>
                <span className="text-lg font-black text-white font-mono">{fmt(result.fluxGauss, 4)} V\u00B7m</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Difference</span>
                <span className="text-lg font-black text-white font-mono">{fmt(Math.abs(result.fluxEA - result.fluxGauss), 4)} V\u00B7m</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Flux Classification</span>
                <span className="text-lg font-black text-white font-mono">{result.fluxType}</span>
              </div>
            </div>

            {/* Flux Analysis */}
            <div className="bg-white/5 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-4 py-2.5 bg-white/5 border-b border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Flux Analysis</span>
              </div>
              <div className="divide-y divide-slate-700/50 text-xs">
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Field Strength</span>
                  <span className="font-bold text-white">{result.fieldStrength}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Surface Orientation</span>
                  <span className="font-bold text-white">{result.surfaceOrientation}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Typical Application</span>
                  <span className="font-bold text-white">{result.typicalApplication}</span>
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
