'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface GravityResult {
  force: number;
  acceleration1: number;
  acceleration2: number;
  mass1InKg: number;
  mass2InKg: number;
  distanceInMeters: number;
  gConstant: string;
  mass1Formatted: string;
  mass2Formatted: string;
  distanceFormatted: string;
  forceFormatted: string;
  accel1Formatted: string;
  accel2Formatted: string;
  potentialEnergy: number;
  peFormatted: string;
  escapeVelocity?: number;
  evFormatted?: string;
  orbitalVelocity?: number;
  ovFormatted?: string;
  orbitalPeriod?: number;
  opFormatted?: string;
  fieldStrength?: number;
  fsFormatted?: string;
  steps: string[];
}

const MASS_CONVERSION: Record<string, number> = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  earth: 5.972e24,
  sun: 1.989e30,
};

const DISTANCE_CONVERSION: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.34,
  au: 149597870700,
  ly: 9.461e15,
};

const EXAMPLES: Record<string, { mass1: string; mass1Unit: string; mass2: string; mass2Unit: string; distance: string; distanceUnit: string }> = {
  'earth-moon': { mass1: '1', mass1Unit: 'earth', mass2: '0.0123', mass2Unit: 'earth', distance: '384400', distanceUnit: 'km' },
  'earth-sun': { mass1: '1', mass1Unit: 'sun', mass2: '1', mass2Unit: 'earth', distance: '1', distanceUnit: 'au' },
  'sun-jupiter': { mass1: '1', mass1Unit: 'sun', mass2: '317.8', mass2Unit: 'earth', distance: '5.2', distanceUnit: 'au' },
  'lab': { mass1: '1', mass1Unit: 'kg', mass2: '1', mass2Unit: 'kg', distance: '1', distanceUnit: 'm' },
  'binary-stars': { mass1: '1.5', mass1Unit: 'sun', mass2: '0.8', mass2Unit: 'sun', distance: '0.01', distanceUnit: 'ly' },
};

const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs < 0.001 || abs >= 10000) {
    return num.toExponential(4).replace(/\+/, '');
  }
  return parseFloat(num.toFixed(4)).toString();
};

const formatWithUnit = (num: number, unit: string): string => `${formatNumber(num)} ${unit}`;

const convertMassToKg = (mass: number, unit: string): number => {
  const factor = MASS_CONVERSION[unit];
  if (!factor) throw new Error(`Unknown mass unit: ${unit}`);
  return mass * factor;
};

const convertDistanceToMeters = (distance: number, unit: string): number => {
  const factor = DISTANCE_CONVERSION[unit];
  if (!factor) throw new Error(`Unknown distance unit: ${unit}`);
  return distance * factor;
};

export default function GravityCalculator() {
  const [mass1, setMass1] = useState<string>('');
  const [mass1Unit, setMass1Unit] = useState<string>('kg');
  const [mass2, setMass2] = useState<string>('');
  const [mass2Unit, setMass2Unit] = useState<string>('kg');
  const [distance, setDistance] = useState<string>('');
  const [distanceUnit, setDistanceUnit] = useState<string>('m');
  const [gConstant, setGConstant] = useState<string>('6.67430');

  const [result, setResult] = useState<GravityResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const validateAndCompute = (): GravityResult => {
    const m1 = parseFloat(mass1);
    const m2 = parseFloat(mass2);
    const dist = parseFloat(distance);
    const g = parseFloat(gConstant);

    if (isNaN(m1) || m1 <= 0) throw new Error('Please enter a valid positive Mass 1.');
    if (isNaN(m2) || m2 <= 0) throw new Error('Please enter a valid positive Mass 2.');
    if (isNaN(dist) || dist <= 0) throw new Error('Please enter a valid positive Distance.');
    if (isNaN(g) || g <= 0) throw new Error('Please enter a valid positive Gravitational Constant.');

    const m1Kg = convertMassToKg(m1, mass1Unit);
    const m2Kg = convertMassToKg(m2, mass2Unit);
    const distM = convertDistanceToMeters(dist, distanceUnit);
    const gSI = g * 1e-11;

    const force = gSI * (m1Kg * m2Kg) / (distM * distM);
    const accel1 = gSI * m2Kg / (distM * distM);
    const accel2 = gSI * m1Kg / (distM * distM);
    const pe = -gSI * (m1Kg * m2Kg) / distM;
    const escV = Math.sqrt(2 * gSI * m2Kg / distM);
    const orbV = Math.sqrt(gSI * m2Kg / distM);
    const orbP = 2 * Math.PI * Math.sqrt(Math.pow(distM, 3) / (gSI * m2Kg));
    const fieldS = gSI * m2Kg / (distM * distM);

    const steps: string[] = [];

    steps.push('**Step 1: Newton\u2019s Law of Universal Gravitation**');
    steps.push('The gravitational force between two masses is given by:');
    steps.push('$F = G \\frac{m_1 m_2}{r^2}$');
    steps.push('');

    steps.push('**Step 2: Convert inputs to SI units**');
    steps.push(`Mass 1 = $${formatNumber(m1Kg)}$ kg`);
    steps.push(`Mass 2 = $${formatNumber(m2Kg)}$ kg`);
    steps.push(`Distance = $${formatNumber(distM)}$ m`);
    steps.push(`Gravitational Constant = $${g} \\times 10^{-11}$ m\u00B3/(kg\u00B7s\u00B2)`);
    steps.push('');

    steps.push('**Step 3: Calculate Gravitational Force**');
    steps.push(`$F = (${g} \\times 10^{-11}) \\times \\frac{${formatNumber(m1Kg)} \\times ${formatNumber(m2Kg)}}{(${formatNumber(distM)})^2}$`);
    steps.push(`$F = ${formatNumber(force)}$ N`);
    steps.push('');

    steps.push('**Step 4: Calculate Gravitational Accelerations**');
    steps.push(`$a_1 = \\frac{F}{m_1} = ${formatNumber(accel1)}$ m/s\u00B2`);
    steps.push(`$a_2 = \\frac{F}{m_2} = ${formatNumber(accel2)}$ m/s\u00B2`);

    return {
      force,
      acceleration1: accel1,
      acceleration2: accel2,
      mass1InKg: m1Kg,
      mass2InKg: m2Kg,
      distanceInMeters: distM,
      gConstant: `${g} \u00D7 10\u207B\u00B9\u00B9`,
      mass1Formatted: formatWithUnit(m1Kg, 'kg'),
      mass2Formatted: formatWithUnit(m2Kg, 'kg'),
      distanceFormatted: formatWithUnit(distM, 'm'),
      forceFormatted: formatWithUnit(force, 'N'),
      accel1Formatted: formatWithUnit(accel1, 'm/s\u00B2'),
      accel2Formatted: formatWithUnit(accel2, 'm/s\u00B2'),
      potentialEnergy: pe,
      peFormatted: formatWithUnit(pe, 'J'),
      escapeVelocity: escV,
      evFormatted: formatWithUnit(escV, 'm/s'),
      orbitalVelocity: orbV,
      ovFormatted: formatWithUnit(orbV, 'm/s'),
      orbitalPeriod: orbP,
      opFormatted: formatWithUnit(orbP, 's'),
      fieldStrength: fieldS,
      fsFormatted: formatWithUnit(fieldS, 'm/s\u00B2'),
      steps,
    };
  };

  useEffect(() => {
    if (hasCalculated) {
      try {
        const calc = validateAndCompute();
        setResult(calc);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Calculation error.');
        setResult(null);
      }
    }
  }, [mass1, mass1Unit, mass2, mass2Unit, distance, distanceUnit, gConstant]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calc = validateAndCompute();
      setResult(calc);
      setHasCalculated(true);
      setError('');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#1a1a1a', '#ffffff', '#7a7a7a'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setMass1('');
    setMass1Unit('kg');
    setMass2('');
    setMass2Unit('kg');
    setDistance('');
    setDistanceUnit('m');
    setGConstant('6.67430');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const loadExample = (key: string) => {
    const ex = EXAMPLES[key];
    if (!ex) return;
    setMass1(ex.mass1);
    setMass1Unit(ex.mass1Unit);
    setMass2(ex.mass2);
    setMass2Unit(ex.mass2Unit);
    setDistance(ex.distance);
    setDistanceUnit(ex.distanceUnit);
    setError('');
  };

  // --- Orbital Simulator ---
  const m1KgOrbit = parseFloat(mass1) > 0 ? convertMassToKg(parseFloat(mass1), mass1Unit) : 0;
  const m2KgOrbit = parseFloat(mass2) > 0 ? convertMassToKg(parseFloat(mass2), mass2Unit) : 0;
  const distMOrbit = parseFloat(distance) > 0 ? convertDistanceToMeters(parseFloat(distance), distanceUnit) : 0;
  const gValOrbit = parseFloat(gConstant) > 0 ? parseFloat(gConstant) * 1e-11 : 0;

  const primaryMassForOrbit = Math.max(m1KgOrbit, m2KgOrbit);
  const secondaryMassForOrbit = Math.min(m1KgOrbit, m2KgOrbit);
  const hasValidOrbit = primaryMassForOrbit > 0 && secondaryMassForOrbit > 0 && distMOrbit > 0 && gValOrbit > 0;
  const angularVelocityOrbit = hasValidOrbit ? Math.sqrt(gValOrbit * primaryMassForOrbit / Math.pow(distMOrbit, 3)) : 0;
  const orbitalVelocityOrbit = hasValidOrbit ? Math.sqrt(gValOrbit * primaryMassForOrbit / distMOrbit) : 0;

  const logDistOrbit = distMOrbit > 0 ? Math.log10(distMOrbit) : 0;
  const orbitRadiusPx = 80 + Math.min(280, Math.max(0, (logDistOrbit + 1) / 18 * 280));
  const primaryRadiusPx = Math.max(8, Math.min(38, 8 + Math.log10(Math.max(1, primaryMassForOrbit)) * 1.8));
  const massRatioOrbit = primaryMassForOrbit > 0 ? secondaryMassForOrbit / primaryMassForOrbit : 0;
  const secondaryRadiusPx = Math.max(4, Math.min(22, primaryRadiusPx * Math.pow(massRatioOrbit, 0.35)));

  const orbitPathRef = useRef<SVGPathElement>(null);
  const trailPathRef = useRef<SVGPathElement>(null);
  const secondaryRef = useRef<SVGCircleElement>(null);
  const forceArrowRef = useRef<SVGLineElement>(null);
  const velocityArrowRef = useRef<SVGLineElement>(null);
  const timeRefOrbit = useRef<number>(0);
  const trailRefOrbit = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!hasValidOrbit) return;
    let animFrameId: number;
    const cx = 400, cy = 250;

    const animate = () => {
      timeRefOrbit.current += 0.02;
      const phase = angularVelocityOrbit * timeRefOrbit.current * 3;
      const x = cx + orbitRadiusPx * Math.cos(phase);
      const y = cy + orbitRadiusPx * Math.sin(phase);

      trailRefOrbit.current.push({ x, y });
      if (trailRefOrbit.current.length > 180) {
        trailRefOrbit.current = trailRefOrbit.current.slice(-180);
      }

      if (secondaryRef.current) {
        secondaryRef.current.setAttribute('cx', String(x));
        secondaryRef.current.setAttribute('cy', String(y));
      }

      if (trailPathRef.current && trailRefOrbit.current.length > 1) {
        const d = trailRefOrbit.current.map((p, i) =>
          i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
        ).join(' ');
        trailPathRef.current.setAttribute('d', d);
      }

      if (forceArrowRef.current) {
        const arrowLen = Math.min(80, orbitRadiusPx * 0.35);
        const angle = Math.atan2(cy - y, cx - x);
        const tipX = x + arrowLen * Math.cos(angle);
        const tipY = y + arrowLen * Math.sin(angle);
        forceArrowRef.current.setAttribute('x1', String(x));
        forceArrowRef.current.setAttribute('y1', String(y));
        forceArrowRef.current.setAttribute('x2', String(tipX));
        forceArrowRef.current.setAttribute('y2', String(tipY));
      }

      if (velocityArrowRef.current) {
        const arrowLen = Math.min(60, orbitRadiusPx * 0.3);
        const tangent = phase + Math.PI / 2;
        const tipX = x + arrowLen * Math.cos(tangent);
        const tipY = y + arrowLen * Math.sin(tangent);
        velocityArrowRef.current.setAttribute('x1', String(x));
        velocityArrowRef.current.setAttribute('y1', String(y));
        velocityArrowRef.current.setAttribute('x2', String(tipX));
        velocityArrowRef.current.setAttribute('y2', String(tipY));
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [hasValidOrbit, angularVelocityOrbit, orbitRadiusPx, mass1, mass2, distance, gConstant]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Newton\u2019s Law of Universal Gravitation
          </span>
          <span className="text-xs text-slate-500 mt-1">
            <InlineMath math="F = G \\frac{m_1 m_2}{r^2}" />
          </span>
        </div>

        {/* Common Examples */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Common Examples
          </span>
          <select
            onChange={(e) => { if (e.target.value) loadExample(e.target.value); }}
            defaultValue=""
            className="mt-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="" disabled>Select an example...</option>
            <option value="earth-moon">Earth and Moon</option>
            <option value="earth-sun">Earth and Sun</option>
            <option value="sun-jupiter">Sun and Jupiter</option>
            <option value="lab">Laboratory Objects (1 kg at 1 m)</option>
            <option value="binary-stars">Binary Star System</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mass 1 */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Mass 1 (m\u2081):
            </span>
            <input
              type="text"
              value={mass1}
              onChange={(e) => { setMass1(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="Enter mass"
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            <select
              value={mass1Unit}
              onChange={(e) => setMass1Unit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="mg">mg</option>
              <option value="lb">lb</option>
              <option value="earth">Earth masses</option>
              <option value="sun">Sun masses</option>
            </select>
          </div>

          {/* Mass 2 */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Mass 2 (m\u2082):
            </span>
            <input
              type="text"
              value={mass2}
              onChange={(e) => { setMass2(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="Enter mass"
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            <select
              value={mass2Unit}
              onChange={(e) => setMass2Unit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="mg">mg</option>
              <option value="lb">lb</option>
              <option value="earth">Earth masses</option>
              <option value="sun">Sun masses</option>
            </select>
          </div>

          {/* Distance */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Distance (r):
            </span>
            <input
              type="text"
              value={distance}
              onChange={(e) => { setDistance(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
              placeholder="Enter distance"
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400"
            >
              <option value="m">m</option>
              <option value="km">km</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="mi">miles</option>
              <option value="au">AU</option>
              <option value="ly">light years</option>
            </select>
          </div>
        </div>

        {/* G Constant */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-3 max-w-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Gravitational Constant (\u00D710\u207B\u00B9\u00B9)
          </span>
          <input
            type="text"
            value={gConstant}
            onChange={(e) => { setGConstant(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
            placeholder="6.67430"
            className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Calculate Gravitational Force
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

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">
          {error}
        </div>
      )}

      {/* Gravity Orbital Simulator */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            Gravitational Orbital Simulator
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Real-time two-body orbital motion based on current input parameters.
          </span>
        </div>

        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 500" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="orbit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ff6b35" />
              </marker>
              <marker id="arrowhead-v" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#4fc3f7" />
              </marker>
            </defs>

            <rect width="100%" height="100%" fill="url(#orbit-grid)" />

            {/* Center crosshairs */}
            <line x1="0" y1="250" x2="800" y2="250" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="400" y1="0" x2="400" y2="500" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Concentric distance reference rings */}
            {hasValidOrbit && [0.3, 0.6, 0.9, 1.2].map((scale, i) => (
              <circle
                key={i}
                cx="400" cy="250"
                r={orbitRadiusPx * scale}
                fill="none"
                stroke="#1f1f1f"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.5"
              />
            ))}

            {/* Orbit path (theoretical) */}
            {hasValidOrbit && (
              <circle
                cx="400" cy="250"
                r={orbitRadiusPx}
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            )}

            {/* Orbital trail */}
            <path
              ref={trailPathRef}
              d="M 400 250"
              fill="none"
              stroke="#4fc3f7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
              className="drop-shadow-[0_0_6px_rgba(79,195,247,0.5)]"
            />

            {/* Force arrow (gravitational pull) */}
            {hasValidOrbit && (
              <line
                ref={forceArrowRef}
                x1="400" y1="250" x2="480" y2="250"
                stroke="#ff6b35"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                opacity="0.9"
              />
            )}

            {/* Velocity arrow (tangential) */}
            {hasValidOrbit && (
              <line
                ref={velocityArrowRef}
                x1="400" y1="250" x2="460" y2="190"
                stroke="#4fc3f7"
                strokeWidth="2"
                markerEnd="url(#arrowhead-v)"
                opacity="0.9"
              />
            )}

            {/* Primary mass */}
            <circle cx="400" cy="250" r={hasValidOrbit ? primaryRadiusPx : 12} fill="#ff6b35" className="drop-shadow-[0_0_14px_rgba(255,107,53,0.9)]" />

            {/* Secondary mass (orbiting) */}
            {hasValidOrbit && (
              <circle
                ref={secondaryRef}
                cx="400" cy="170"
                r={secondaryRadiusPx}
                fill="#4fc3f7"
                className="drop-shadow-[0_0_12px_rgba(79,195,247,0.9)]"
              />
            )}
          </svg>

          {/* Overlay labels */}
          <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
            <div><span className="text-neutral-400">M:</span> {hasValidOrbit ? formatNumber(primaryMassForOrbit) : '\u2014'} kg</div>
            <div><span className="text-neutral-400">m:</span> {hasValidOrbit ? formatNumber(secondaryMassForOrbit) : '\u2014'} kg</div>
            <div><span className="text-neutral-400">r:</span> {hasValidOrbit ? formatNumber(distMOrbit) : '\u2014'} m</div>
          </div>

          <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
            <div><span className="text-neutral-400">F:</span> {hasValidOrbit ? formatNumber(gValOrbit * primaryMassForOrbit * secondaryMassForOrbit / (distMOrbit * distMOrbit)) : '\u2014'} N</div>
            <div><span className="text-neutral-400">v\u2092\u1D63\u1D62:</span> {hasValidOrbit ? formatNumber(orbitalVelocityOrbit) : '\u2014'} m/s</div>
            <div><span className="text-neutral-400">\u03C9:</span> {hasValidOrbit ? formatNumber(angularVelocityOrbit) : '\u2014'} rad/s</div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">GRAVITY</span>
          </div>
          <div className="relative z-10 space-y-8 text-left">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-extrabold text-white text-center font-display">
                Gravitational Interaction Results
              </h3>
            </div>

            {/* Primary Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Gravitational Force (F)
                </span>
                <span className="text-xl font-black text-white font-mono">{result.forceFormatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Acceleration (m\u2081)
                </span>
                <span className="text-xl font-black text-white font-mono">{result.accel1Formatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Acceleration (m\u2082)
                </span>
                <span className="text-xl font-black text-white font-mono">{result.accel2Formatted}</span>
              </div>
            </div>

            {/* Step-by-Step */}
            <div className="bg-white/5 border border-slate-700/50 p-6 rounded-3xl space-y-4">
              <h4 className="text-sm text-slate-300 font-extrabold uppercase tracking-wider flex items-center">
                Step-by-Step Resolution
              </h4>
              <div className="space-y-4 font-mono text-sm leading-relaxed p-5 rounded-2xl overflow-y-auto max-h-80">
                {result.steps.map((step, idx) => {
                  if (step.startsWith('**') && step.endsWith('**')) {
                    return (
                      <strong key={idx} className="text-white font-extrabold block mt-2 mb-1">
                        {step.replace(/\*\*/g, '')}
                      </strong>
                    );
                  }
                  if (step === '') {
                    return <br key={idx} />;
                  }
                  const parts = step.split('$');
                  return (
                    <div key={idx} className="block text-slate-300 py-0.5 leading-relaxed">
                      {parts.map((part, index) => {
                        if (index % 2 === 1) {
                          return <InlineMath key={index} math={part} />;
                        }
                        return part;
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Conversion */}
            <div className="bg-white/5 border border-slate-700/50 p-6 rounded-3xl space-y-4">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center">
                Input Values (SI Units)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                  <span className="font-bold text-slate-400">Mass 1</span>
                  <span className="font-mono font-black text-white">{result.mass1Formatted}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                  <span className="font-bold text-slate-400">Mass 2</span>
                  <span className="font-mono font-black text-white">{result.mass2Formatted}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                  <span className="font-bold text-slate-400">Distance</span>
                  <span className="font-mono font-black text-white">{result.distanceFormatted}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                  <span className="font-bold text-slate-400">Gravitational Constant</span>
                  <span className="font-mono font-black text-white">{result.gConstant} m\u00B3/(kg\u00B7s\u00B2)</span>
                </div>
              </div>
            </div>

            {/* Derived Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-slate-700/50 p-6 rounded-3xl space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center">
                  Energy &amp; Potential
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Potential Energy (U)</span>
                    <span className="font-mono font-black text-white">{result.peFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Field Strength (g)</span>
                    <span className="font-mono font-black text-white">{result.fsFormatted}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-6 rounded-3xl space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center">
                  Orbital Mechanics
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Escape Velocity (v\u2091\u209B\u1D04)</span>
                    <span className="font-mono font-black text-white">{result.evFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Orbital Velocity (v\u2092\u1D63\u1D62)</span>
                    <span className="font-mono font-black text-white">{result.ovFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Orbital Period (T)</span>
                    <span className="font-mono font-black text-white">{result.opFormatted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
