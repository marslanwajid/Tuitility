'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface WaveResult {
  solveFor: 'speed' | 'frequency' | 'wavelength';
  waveSpeed: number;
  frequency: number;
  wavelength: number;
  period: number;
  angularFrequency: number;
  waveNumber: number;
  waveType: string;
  medium: string;
  energy?: number; // EM Wave energy (J)
  momentum?: number; // EM Wave momentum (kg m/s)
  steps: string[];
}

export default function WaveSpeedCalculator() {
  const [solveFor, setSolveFor] = useState<'speed' | 'frequency' | 'wavelength'>('speed');
  const [frequency, setFrequency] = useState<string>('440'); // default sound frequency (A4)
  const [wavelength, setWavelength] = useState<string>('0.78'); // default sound wavelength in air
  const [speed, setSpeed] = useState<string>('343.2'); // default sound speed
  const [activeField, setActiveField] = useState<'speed' | 'frequency' | 'wavelength'>('frequency');

  const [result, setResult] = useState<WaveResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // SVG wave visualizer refs
  const pathRef = useRef<SVGPathElement>(null);
  const timeRef = useRef<number>(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Recalculate silently on parameter updates once calculated
  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [solveFor, frequency, wavelength, speed]);

  const recalculateSilently = () => {
    try {
      const calcResult = computeWaveModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  // Oscilloscope Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      timeRef.current += 0.04;
      if (pathRef.current) {
        const width = 800;
        const height = 120;
        const amplitude = 32;
        const points = [];

        // Fetch numerical inputs or defaults
        const fVal = Math.abs(parseFloat(frequency)) || 1;
        const wVal = Math.abs(parseFloat(wavelength)) || 1;

        // Visual wavelength scaling (width in pixels of one cycle)
        // Logarithmic scaling to handle nano-scale to mega-scale
        const logW = Math.log10(wVal);
        // Map logW (e.g. -7 for nm, 6 for mega-meters) to comfortable pixels (40 to 400px)
        const wScaled = 150 + Math.min(200, Math.max(-110, logW * 40));

        // Visual frequency scaling (cycles speed)
        const logF = Math.log10(fVal);
        const fScaled = 1 + Math.min(8, Math.max(-5, logF * 1.5));

        const k = (2 * Math.PI) / wScaled;
        const phase = timeRef.current * fScaled;

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
  }, [frequency, wavelength, speed, solveFor]);

  // Adjust inputs via tactile steppers
  const adjustValue = (field: 'speed' | 'frequency' | 'wavelength', ratio: number, isAdditive: boolean = false) => {
    let currentStr = '';
    let setVal: (v: string) => void;

    if (field === 'speed') {
      currentStr = speed;
      setVal = setSpeed;
    } else if (field === 'frequency') {
      currentStr = frequency;
      setVal = setFrequency;
    } else {
      currentStr = wavelength;
      setVal = setWavelength;
    }

    const currentVal = parseFloat(currentStr) || 0;
    let newVal = 0;

    if (isAdditive) {
      newVal = Math.max(0, currentVal + ratio);
    } else {
      newVal = Math.max(0, currentVal * ratio);
    }

    // Scientific notation check for formatting
    if (newVal < 1e-3 || newVal > 1e6) {
      setVal(newVal.toExponential(4).replace(/\+/, ''));
    } else {
      setVal(newVal.toFixed(newVal % 1 === 0 ? 0 : 4).replace(/\.?0+$/, ''));
    }
    setError('');
  };

  // Keyboard helper
  const handleKeyboardInput = (char: string) => {
    let currentStr = '';
    let setVal: (v: string) => void;
    if (activeField === 'speed') {
      currentStr = speed;
      setVal = setSpeed;
    } else if (activeField === 'frequency') {
      currentStr = frequency;
      setVal = setFrequency;
    } else {
      currentStr = wavelength;
      setVal = setWavelength;
    }

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
      // Allow minus sign for exponents (e.g., e-6) or as a negative prefix
      if (currentStr.endsWith('e') || currentStr.endsWith('E')) {
        setVal(currentStr + '-');
      } else if (currentStr === '0' || currentStr === '') {
        setVal('-');
      }
    } else {
      if (currentStr === '0') {
        setVal(char);
      } else {
        setVal(currentStr + char);
      }
    }
  };

  // Load Presets
  const loadPreset = (fVal: string, wVal: string, sVal: string) => {
    setFrequency(fVal);
    setWavelength(wVal);
    setSpeed(sVal);
    setError('');
    // Trigger recalculation if calculated
    if (hasCalculated) {
      setHasCalculated(true);
    }
  };

  // Wave Classification & Medium rules
  const determineWaveType = (freq: number): string => {
    if (freq < 20) return 'Infrasound (Low frequency sound)';
    if (freq >= 20 && freq <= 20000) return 'Audible Sound (Human hearing range)';
    if (freq > 20000 && freq < 1e9) return 'Ultrasound (High frequency sound / Sonar)';
    if (freq >= 1e9 && freq < 1e12) return 'Microwave (EM Spectrum)';
    if (freq >= 1e12 && freq < 4.3e14) return 'Infrared radiation (EM Spectrum)';
    if (freq >= 4.3e14 && freq < 7.5e14) return 'Visible Light (EM Spectrum)';
    if (freq >= 7.5e14 && freq < 1e16) return 'Ultraviolet light (EM Spectrum)';
    if (freq >= 1e16 && freq < 1e19) return 'X-ray (EM Spectrum)';
    return 'Gamma Ray (EM Spectrum)';
  };

  const determineMedium = (wvSpeed: number): string => {
    const c = 299792458; // Speed of light
    const vSound = 343; // Speed of sound in air (20C)
    const tolLight = 0.05; // 5% tolerance for EM waves
    const tolSound = 0.15; // 15% tolerance for acoustic sound

    if (Math.abs(wvSpeed - c) / c < tolLight) {
      return 'Vacuum / Free Space (Electromagnetic wave)';
    }
    if (wvSpeed >= 0.5 * c && wvSpeed < c) {
      return 'Dense Optical Medium (e.g. Glass, Water for Light)';
    }
    if (Math.abs(wvSpeed - vSound) / vSound < tolSound) {
      return 'Air at room temperature (Sound wave)';
    }
    if (wvSpeed >= 1000 && wvSpeed <= 2000) {
      return 'Water / Aqueous Medium (Acoustic wave)';
    }
    if (wvSpeed > 2000 && wvSpeed <= 10000) {
      return 'Solid Material (e.g. Iron, Steel, Granite, Wood)';
    }
    if (wvSpeed > 10000 && wvSpeed < 0.5 * c) {
      return 'Extreme High-Velocity Solids or Ionized Gas / Plasma';
    }
    if (wvSpeed < 1000) {
      return 'Liquid or Gas medium';
    }
    return 'Unknown medium / Specialized propagation conditions';
  };

  const computeWaveModel = (): WaveResult => {
    const fNum = Math.abs(parseFloat(frequency));
    const wNum = Math.abs(parseFloat(wavelength));
    const sNum = Math.abs(parseFloat(speed));

    if (solveFor === 'speed') {
      if (isNaN(fNum) || fNum <= 0) throw new Error('Please enter a valid positive frequency.');
      if (isNaN(wNum) || wNum <= 0) throw new Error('Please enter a valid positive wavelength.');
    } else if (solveFor === 'frequency') {
      if (isNaN(sNum) || sNum <= 0) throw new Error('Please enter a valid positive wave speed.');
      if (isNaN(wNum) || wNum <= 0) throw new Error('Please enter a valid positive wavelength.');
    } else {
      if (isNaN(sNum) || sNum <= 0) throw new Error('Please enter a valid positive wave speed.');
      if (isNaN(fNum) || fNum <= 0) throw new Error('Please enter a valid positive frequency.');
    }

    let waveSpeed = sNum;
    let computedFrequency = fNum;
    let computedWavelength = wNum;
    const steps: string[] = [];

    steps.push('**Step 1: Identify the formula based on the target variable**');

    if (solveFor === 'speed') {
      waveSpeed = computedFrequency * computedWavelength;
      steps.push('We want to calculate Wave Speed ($v$). We use the fundamental wave equation:');
      steps.push('$v = f \\times \\lambda$');
      steps.push('\n**Step 2: Substitute known variables**');
      steps.push(`Frequency ($f$) = $${computedFrequency.toExponential(4)}$ Hz`);
      steps.push(`Wavelength ($\\lambda$) = $${computedWavelength.toExponential(4)}$ m`);
      steps.push('$v = (' + computedFrequency.toExponential(4) + ') \\times (' + computedWavelength.toExponential(4) + ')$');
      steps.push('\n**Step 3: Perform calculation**');
      steps.push(`$v = ${waveSpeed.toExponential(4)}$ m/s`);
    } else if (solveFor === 'frequency') {
      computedFrequency = waveSpeed / computedWavelength;
      steps.push('We want to calculate Frequency ($f$). We rearrange the wave equation:');
      steps.push('$f = \\frac{v}{\\lambda}$');
      steps.push('\n**Step 2: Substitute known variables**');
      steps.push(`Wave Speed ($v$) = $${waveSpeed.toExponential(4)}$ m/s`);
      steps.push(`Wavelength ($\\lambda$) = $${computedWavelength.toExponential(4)}$ m`);
      steps.push('$f = \\frac{' + waveSpeed.toExponential(4) + '}{' + computedWavelength.toExponential(4) + '}$');
      steps.push('\n**Step 3: Perform calculation**');
      steps.push(`$f = ${computedFrequency.toExponential(4)}$ Hz`);
    } else {
      computedWavelength = waveSpeed / computedFrequency;
      steps.push('We want to calculate Wavelength ($\\lambda$). We rearrange the wave equation:');
      steps.push('$\\lambda = \\frac{v}{f}$');
      steps.push('\n**Step 2: Substitute known variables**');
      steps.push(`Wave Speed ($v$) = $${waveSpeed.toExponential(4)}$ m/s`);
      steps.push(`Frequency ($f$) = $${computedFrequency.toExponential(4)}$ Hz`);
      steps.push('$\\lambda = \\frac{' + waveSpeed.toExponential(4) + '}{' + computedFrequency.toExponential(4) + '}$');
      steps.push('\n**Step 3: Perform calculation**');
      steps.push(`$\\lambda = ${computedWavelength.toExponential(4)}$ m`);
    }

    // Compute derived properties
    const period = 1 / computedFrequency;
    const angularFrequency = 2 * Math.PI * computedFrequency;
    const waveNumber = (2 * Math.PI) / computedWavelength;

    const waveType = determineWaveType(computedFrequency);
    const medium = determineMedium(waveSpeed);

    const resultObj: WaveResult = {
      solveFor,
      waveSpeed,
      frequency: computedFrequency,
      wavelength: computedWavelength,
      period,
      angularFrequency,
      waveNumber,
      waveType,
      medium,
      steps,
    };

    // If EM wave properties are detected, add energy and momentum
    // (EM waves typically travel near speed of light c, or belong to EM spectrum frequencies)
    if (waveSpeed >= 2e8 || waveType.includes('EM Spectrum')) {
      const h = 6.62607015e-34; // Planck's Constant J*s
      const energy = h * computedFrequency;
      const momentum = energy / waveSpeed;
      resultObj.energy = energy;
      resultObj.momentum = momentum;
    }

    return resultObj;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeWaveModel();
      setResult(calcResult);
      setHasCalculated(true);
      setError('');

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

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
    setSolveFor('speed');
    setFrequency('440');
    setWavelength('0.78');
    setSpeed('343.2');
    setActiveField('frequency');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Scope Mode Dropdown & Presets Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Solve Target Variable
          </span>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[
              { id: 'speed', label: 'Wave Speed (v)' },
              { id: 'frequency', label: 'Frequency (f)' },
              { id: 'wavelength', label: 'Wavelength (λ)' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setSolveFor(mode.id as any);
                  // Set active field based on solve target
                  if (mode.id === 'speed') {
                    setActiveField('frequency');
                  } else if (mode.id === 'frequency') {
                    setActiveField('speed');
                  } else {
                    setActiveField('speed');
                  }
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  solveFor === mode.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Shortcuts */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Wave Presets
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {[
              { name: 'Sound (A4 note)', f: '440', w: '0.78', s: '343.2' },
              { name: 'FM Radio (100MHz)', f: '1e8', w: '3', s: '3e8' },
              { name: 'Red Light (700nm)', f: '4.28e14', w: '7e-7', s: '3e8' },
              { name: 'Ultrasound Scan', f: '5e6', w: '0.000308', s: '1540' },
              { name: 'Deep Ocean Wave', f: '0.1', w: '156', s: '15.6' }
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  loadPreset(p.f, p.w, p.s);
                }}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-slate-350 transition-all text-slate-700"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Wave Speed input card */}
          <div
            onClick={() => {
              if (solveFor !== 'speed') setActiveField('speed');
            }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3.5 relative transition-all ${
              solveFor === 'speed'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'speed'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Wave Speed (v, m/s):
              </span>
              {solveFor === 'speed' && (
                <span className="text-[9px] font-extrabold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <input
              type="text"
              value={solveFor === 'speed' ? 'Calculated' : speed}
              disabled={solveFor === 'speed'}
              onChange={(e) => {
                setSpeed(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                setError('');
              }}
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            {solveFor !== 'speed' && (
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => adjustValue('speed', 10)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  ×10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('speed', 0.1)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  ÷10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('speed', 10, true)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('speed', -10, true)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  -10
                </button>
              </div>
            )}
          </div>

          {/* Frequency input card */}
          <div
            onClick={() => {
              if (solveFor !== 'frequency') setActiveField('frequency');
            }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3.5 relative transition-all ${
              solveFor === 'frequency'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'frequency'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Frequency (f, Hz):
              </span>
              {solveFor === 'frequency' && (
                <span className="text-[9px] font-extrabold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <input
              type="text"
              value={solveFor === 'frequency' ? 'Calculated' : frequency}
              disabled={solveFor === 'frequency'}
              onChange={(e) => {
                setFrequency(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                setError('');
              }}
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            {solveFor !== 'frequency' && (
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => adjustValue('frequency', 10)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  ×10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('frequency', 0.1)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  ÷10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('frequency', 100, true)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('frequency', -100, true)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  -100
                </button>
              </div>
            )}
          </div>

          {/* Wavelength input card */}
          <div
            onClick={() => {
              if (solveFor !== 'wavelength') setActiveField('wavelength');
            }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3.5 relative transition-all ${
              solveFor === 'wavelength'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'wavelength'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Wavelength (λ, meters):
              </span>
              {solveFor === 'wavelength' && (
                <span className="text-[9px] font-extrabold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <input
              type="text"
              value={solveFor === 'wavelength' ? 'Calculated' : wavelength}
              disabled={solveFor === 'wavelength'}
              onChange={(e) => {
                setWavelength(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                setError('');
              }}
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            {solveFor !== 'wavelength' && (
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => adjustValue('wavelength', 10)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  ×10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('wavelength', 0.1)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  ÷10
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('wavelength', 1, true)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => adjustValue('wavelength', -1, true)}
                  className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                >
                  -1
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Keyboard Helper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
            Tactile Pad (editing {activeField === 'speed' ? 'Speed' : activeField === 'frequency' ? 'Frequency' : 'Wavelength'})
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
            {['e', '0', '-', 'plus_minus_dummy'].map((key) => {
              if (key === 'plus_minus_dummy') {
                return (
                  <div key={key} className="h-11 bg-transparent border border-transparent rounded-xl" />
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyboardInput(key)}
                  className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
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
            Calculate Wave Parameters
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

      {/* Error block */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Real-time Oscilloscope visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-wave-square mr-2 text-slate-400"></i>
            Live Wave Propagation Scope (Oscilloscope View)
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Wavelength cycles and speed adjust in real-time to parameters.
          </span>
        </div>

        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 120" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            
            {/* Grid overlay lines */}
            <defs>
              <pattern id="oscilloscope-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222222" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#oscilloscope-grid)" />
            
            {/* Center zero axis lines */}
            <line x1="0" y1="60" x2="800" y2="60" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="400" y1="0" x2="400" y2="120" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            
            {/* The Animated Wave Path */}
            <path
              ref={pathRef}
              d="M 0 60"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            />
          </svg>
          
          {/* Floating overlays for wave parameter readouts */}
          <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
            <div><span className="text-neutral-400">f:</span> {frequency || '0'} Hz</div>
            <div><span className="text-neutral-400">λ:</span> {wavelength || '0'} m</div>
          </div>
          <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
            <span className="text-neutral-400">v:</span> {speed || '0'} m/s
          </div>
        </div>
      </div>

      {/* Calculated Results Block */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">WAVE</span>
          </div>

          <div className="relative z-10 space-y-8 text-left">
            <div className="text-center pb-4 border-b border-slate-800/80">
              <h3 className="text-lg font-extrabold text-white font-display">Calculated Wave Properties</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Propagation Speed (v)</span>
                <span className="text-xl font-black text-white font-mono">
                  {result.waveSpeed.toExponential(4).includes('e') && (result.waveSpeed < 1e-3 || result.waveSpeed > 1e5)
                    ? result.waveSpeed.toExponential(4).replace(/\+/, '')
                    : result.waveSpeed.toFixed(result.waveSpeed % 1 === 0 ? 0 : 4).replace(/\.?0+$/, '')}{' '}
                  m/s
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Frequency (f)</span>
                <span className="text-xl font-black text-white font-mono">
                  {result.frequency.toExponential(4).includes('e') && (result.frequency < 1e-3 || result.frequency > 1e5)
                    ? result.frequency.toExponential(4).replace(/\+/, '')
                    : result.frequency.toFixed(result.frequency % 1 === 0 ? 0 : 4).replace(/\.?0+$/, '')}{' '}
                  Hz
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Wavelength (\u03BB)</span>
                <span className="text-xl font-black text-white font-mono">
                  {result.wavelength.toExponential(4).includes('e') && (result.wavelength < 1e-3 || result.wavelength > 1e5)
                    ? result.wavelength.toExponential(4).replace(/\+/, '')
                    : result.wavelength.toFixed(result.wavelength % 1 === 0 ? 0 : 4).replace(/\.?0+$/, '')}{' '}
                  m
                </span>
              </div>
            </div>

            {/* Detailed Calculations breakdown */}
            <div className="bg-white/5 border border-slate-700/50 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center border-b border-slate-700/50 pb-3">
                Step-by-Step Resolution
              </h4>
              <div className="space-y-4 font-mono text-sm leading-relaxed max-h-80 overflow-y-auto text-slate-200">
                {result.steps.map((step, idx) => {
                  if (step.startsWith('**') && step.endsWith('**')) {
                    return (
                      <strong key={idx} className="text-white font-extrabold block mt-2 mb-1">
                        {step.replace(/\*\*/g, '')}
                      </strong>
                    );
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

            {/* Secondary Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-slate-700/50 p-6 rounded-3xl space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center">
                  Derived Wave Mechanics
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Wave Period (T)</span>
                    <span className="font-mono font-black text-white">
                      {result.period.toExponential(4).includes('e') && (result.period < 1e-3 || result.period > 1e5)
                        ? result.period.toExponential(4).replace(/\+/, '')
                        : result.period.toFixed(6).replace(/\.?0+$/, '')}{' '}
                      s
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Angular Frequency (\u03C9)</span>
                    <span className="font-mono font-black text-white">
                      {result.angularFrequency.toExponential(4).includes('e') && (result.angularFrequency < 1e-3 || result.angularFrequency > 1e5)
                        ? result.angularFrequency.toExponential(4).replace(/\+/, '')
                        : result.angularFrequency.toFixed(4).replace(/\.?0+$/, '')}{' '}
                      rad/s
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Wave Number (k)</span>
                    <span className="font-mono font-black text-white">
                      {result.waveNumber.toExponential(4).includes('e') && (result.waveNumber < 1e-3 || result.waveNumber > 1e5)
                        ? result.waveNumber.toExponential(4).replace(/\+/, '')
                        : result.waveNumber.toFixed(4).replace(/\.?0+$/, '')}{' '}
                      rad/m
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-6 rounded-3xl space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center">
                  Wave Classification &amp; Medium
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Spectral Type</span>
                    <span className="font-extrabold text-white text-right">{result.waveType}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                    <span className="font-bold text-slate-400">Likely Medium</span>
                    <span className="font-extrabold text-white text-right">{result.medium}</span>
                  </div>

                  {/* EM Specific bonus properties */}
                  {result.energy !== undefined && result.momentum !== undefined && (
                    <>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                        <span className="font-bold text-slate-400">Photon Energy (E)</span>
                        <span className="font-mono font-black text-white text-right">
                          {result.energy.toExponential(4).replace(/\+/, '')} J
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50">
                        <span className="font-bold text-slate-400">Photon Momentum (p)</span>
                        <span className="font-mono font-black text-white text-right">
                          {result.momentum.toExponential(4).replace(/\+/, '')} kg\u00B7m/s
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
