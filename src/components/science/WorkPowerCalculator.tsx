'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface WorkPowerResult {
  solveFor: 'work-power' | 'force' | 'distance' | 'time' | 'angle';
  work: number;
  power: number;
  force: number;
  distance: number;
  angle: number;
  time: number;
  forceInNewtons: number;
  distanceInMeters: number;
  angleInRadians: number;
  timeInSeconds: number;
  workInJoules: number;
  powerInWatts: number;
  acceleration: number;
  finalVelocity: number;
  steps: string[];
}

const FORCE_CONVERSION: Record<string, number> = {
  N: 1,
  kN: 1000,
  lbf: 4.44822,
};

const DISTANCE_CONVERSION: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  ft: 0.3048,
};

const TIME_CONVERSION: Record<string, number> = {
  s: 1,
  min: 60,
  h: 3600,
};

const WORK_CONVERSION: Record<string, number> = {
  J: 1,
  kJ: 1000,
  'ft-lbf': 1.35582,
};

const POWER_CONVERSION: Record<string, number> = {
  W: 1,
  kW: 1000,
  hp: 745.7,
};

const convertAngleToRad = (val: number, unit: string): number => {
  if (unit === 'deg') return val * (Math.PI / 180);
  return val; // rad
};

const convertRadToAngle = (rad: number, unit: string): number => {
  if (unit === 'deg') return rad * (180 / Math.PI);
  return rad;
};

const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs < 0.001 || abs >= 100000) {
    return num.toExponential(4).replace(/\+/, '');
  }
  return parseFloat(num.toFixed(4)).toString();
};

export default function WorkPowerCalculator() {
  const [solveFor, setSolveFor] = useState<'work-power' | 'force' | 'distance' | 'time' | 'angle'>('work-power');
  
  // Fields state
  const [force, setForce] = useState<string>('50');
  const [forceUnit, setForceUnit] = useState<string>('N');
  const [distance, setDistance] = useState<string>('10');
  const [distanceUnit, setDistanceUnit] = useState<string>('m');
  const [angle, setAngle] = useState<string>('30');
  const [angleUnit, setAngleUnit] = useState<string>('deg');
  const [time, setTime] = useState<string>('5');
  const [timeUnit, setTimeUnit] = useState<string>('s');
  const [work, setWork] = useState<string>('433.01');
  const [workUnit, setWorkUnit] = useState<string>('J');
  const [power, setPower] = useState<string>('86.60');
  const [powerUnit, setPowerUnit] = useState<string>('W');
  
  // Advanced Calibration
  const [mass, setMass] = useState<string>('10');
  const [initVelocity, setInitVelocity] = useState<string>('0');

  const [activeField, setActiveField] = useState<'force' | 'distance' | 'angle' | 'time' | 'work' | 'power' | 'mass' | 'initVelocity'>('force');

  const [result, setResult] = useState<WorkPowerResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Recalculate silently on state changes if already calculated
  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [solveFor, force, forceUnit, distance, distanceUnit, angle, angleUnit, time, timeUnit, work, workUnit, power, powerUnit, mass, initVelocity]);

  const recalculateSilently = () => {
    try {
      const calcResult = computeModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const adjustValue = (field: typeof activeField, delta: number, isAdditive: boolean = false) => {
    let currentStr = '';
    let setVal: (v: string) => void;

    switch (field) {
      case 'force': currentStr = force; setVal = setForce; break;
      case 'distance': currentStr = distance; setVal = setDistance; break;
      case 'angle': currentStr = angle; setVal = setAngle; break;
      case 'time': currentStr = time; setVal = setTime; break;
      case 'work': currentStr = work; setVal = setWork; break;
      case 'power': currentStr = power; setVal = setPower; break;
      case 'mass': currentStr = mass; setVal = setMass; break;
      case 'initVelocity': currentStr = initVelocity; setVal = setInitVelocity; break;
      default: return;
    }

    const currentVal = parseFloat(currentStr) || 0;
    let newVal = 0;

    if (isAdditive) {
      newVal = currentVal + delta;
      if (field !== 'angle' && field !== 'initVelocity') {
        newVal = Math.max(0, newVal);
      }
    } else {
      newVal = currentVal * delta;
      if (field !== 'angle' && field !== 'initVelocity') {
        newVal = Math.max(0, newVal);
      }
    }

    setVal(formatNumber(newVal));
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    let currentStr = '';
    let setVal: (v: string) => void;

    switch (activeField) {
      case 'force': currentStr = force; setVal = setForce; break;
      case 'distance': currentStr = distance; setVal = setDistance; break;
      case 'angle': currentStr = angle; setVal = setAngle; break;
      case 'time': currentStr = time; setVal = setTime; break;
      case 'work': currentStr = work; setVal = setWork; break;
      case 'power': currentStr = power; setVal = setPower; break;
      case 'mass': currentStr = mass; setVal = setMass; break;
      case 'initVelocity': currentStr = initVelocity; setVal = setInitVelocity; break;
      default: return;
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
  };

  const loadPreset = (fVal: string, dVal: string, aVal: string, tVal: string) => {
    setForce(fVal);
    setForceUnit('N');
    setDistance(dVal);
    setDistanceUnit('m');
    setAngle(aVal);
    setAngleUnit('deg');
    setTime(tVal);
    setTimeUnit('s');
    setSolveFor('work-power');
    setError('');
  };

  const computeModel = (): WorkPowerResult => {
    const fVal = parseFloat(force);
    const dVal = parseFloat(distance);
    const aVal = parseFloat(angle);
    const tVal = parseFloat(time);
    const wVal = parseFloat(work);
    const pVal = parseFloat(power);
    const mVal = parseFloat(mass) || 10;
    const viVal = parseFloat(initVelocity) || 0;

    let computedForce = fVal;
    let computedDistance = dVal;
    let computedAngle = aVal;
    let computedTime = tVal;
    let computedWork = wVal;
    let computedPower = pVal;

    const steps: string[] = [];

    // Mode-specific conversions and calculations
    if (solveFor === 'work-power') {
      if (isNaN(fVal) || fVal <= 0) throw new Error('Please enter a valid positive force.');
      if (isNaN(dVal) || dVal <= 0) throw new Error('Please enter a valid positive distance.');
      if (isNaN(aVal)) throw new Error('Please enter a valid angle.');
      if (isNaN(tVal) || tVal <= 0) throw new Error('Please enter a valid positive time.');

      const fSI = fVal * FORCE_CONVERSION[forceUnit];
      const dSI = dVal * DISTANCE_CONVERSION[distanceUnit];
      const tSI = tVal * TIME_CONVERSION[timeUnit];
      const thetaRad = angleUnit === 'deg' ? aVal * (Math.PI / 180) : aVal;

      const workSI = fSI * dSI * Math.cos(thetaRad);
      const powerSI = workSI / tSI;

      computedWork = workSI / WORK_CONVERSION[workUnit];
      computedPower = powerSI / POWER_CONVERSION[powerUnit];

      steps.push('**Step 1: Identify formulas for Work and Power**');
      steps.push('Work is defined as:');
      steps.push('$W = F \\cdot d \\cdot \\cos(\\theta)$');
      steps.push('Power is defined as the rate of work done:');
      steps.push('$P = \\frac{W}{t}$');
      steps.push('\n**Step 2: Convert all variables to standard SI units**');
      steps.push(`Force ($F$) = $${formatNumber(fSI)}$ N`);
      steps.push(`Distance ($d$) = $${formatNumber(dSI)}$ m`);
      steps.push(`Angle ($\\theta$) = $${formatNumber(thetaRad)}$ rad ($${formatNumber(aVal)}^\\circ$)`);
      steps.push(`Time ($t$) = $${formatNumber(tSI)}$ s`);
      steps.push('\n**Step 3: Calculate Mechanical Work**');
      steps.push(`$W = ${formatNumber(fSI)} \\times ${formatNumber(dSI)} \\times \\cos(${formatNumber(thetaRad)})$`);
      steps.push(`$W = ${formatNumber(workSI)}$ Joules`);
      steps.push('\n**Step 4: Calculate Mechanical Power**');
      steps.push(`$P = \\frac{${formatNumber(workSI)}}{${formatNumber(tSI)}}$`);
      steps.push(`$P = ${formatNumber(powerSI)}$ Watts`);
    } 
    else if (solveFor === 'force') {
      if (isNaN(wVal)) throw new Error('Please enter a valid work value.');
      if (isNaN(dVal) || dVal <= 0) throw new Error('Please enter a valid positive distance.');
      if (isNaN(aVal)) throw new Error('Please enter a valid angle.');
      if (isNaN(tVal) || tVal <= 0) throw new Error('Please enter a valid positive time.');

      const wSI = wVal * WORK_CONVERSION[workUnit];
      const dSI = dVal * DISTANCE_CONVERSION[distanceUnit];
      const tSI = tVal * TIME_CONVERSION[timeUnit];
      const thetaRad = angleUnit === 'deg' ? aVal * (Math.PI / 180) : aVal;

      const cosVal = Math.cos(thetaRad);
      if (Math.abs(cosVal) < 1e-7) {
        throw new Error('Force cannot be solved at 90° because the vertical force component performs zero work.');
      }

      const forceSI = wSI / (dSI * cosVal);
      const powerSI = wSI / tSI;

      computedForce = forceSI / FORCE_CONVERSION[forceUnit];
      computedWork = wSI;
      computedPower = powerSI / POWER_CONVERSION[powerUnit];

      steps.push('**Step 1: Rearrange the Work equation to solve for Force**');
      steps.push('$F = \\frac{W}{d \\cdot \\cos(\\theta)}$');
      steps.push('\n**Step 2: Convert known inputs to SI units**');
      steps.push(`Work ($W$) = $${formatNumber(wSI)}$ J`);
      steps.push(`Distance ($d$) = $${formatNumber(dSI)}$ m`);
      steps.push(`Angle ($\\theta$) = $${formatNumber(thetaRad)}$ rad`);
      steps.push('\n**Step 3: Calculate Force**');
      steps.push(`$F = \\frac{${formatNumber(wSI)}}{${formatNumber(dSI)} \\times \\cos(${formatNumber(thetaRad)})}$`);
      steps.push(`$F = ${formatNumber(forceSI)}$ Newtons`);
      steps.push('\n**Step 4: Calculate Power**');
      steps.push(`$P = \\frac{W}{t} = \\frac{${formatNumber(wSI)}}{${formatNumber(tSI)}} = ${formatNumber(powerSI)}$ Watts`);
    } 
    else if (solveFor === 'distance') {
      if (isNaN(wVal)) throw new Error('Please enter a valid work value.');
      if (isNaN(fVal) || fVal <= 0) throw new Error('Please enter a valid positive force.');
      if (isNaN(aVal)) throw new Error('Please enter a valid angle.');
      if (isNaN(tVal) || tVal <= 0) throw new Error('Please enter a valid positive time.');

      const wSI = wVal * WORK_CONVERSION[workUnit];
      const fSI = fVal * FORCE_CONVERSION[forceUnit];
      const tSI = tVal * TIME_CONVERSION[timeUnit];
      const thetaRad = angleUnit === 'deg' ? aVal * (Math.PI / 180) : aVal;

      const cosVal = Math.cos(thetaRad);
      if (Math.abs(cosVal) < 1e-7) {
        throw new Error('Distance cannot be solved at 90° because force does not do any work in this direction.');
      }

      const distanceSI = wSI / (fSI * cosVal);
      if (distanceSI < 0) {
        throw new Error('The combination of work and force directions results in negative distance, which is physically impossible. Check your input values.');
      }
      const powerSI = wSI / tSI;

      computedDistance = distanceSI / DISTANCE_CONVERSION[distanceUnit];
      computedPower = powerSI / POWER_CONVERSION[powerUnit];

      steps.push('**Step 1: Rearrange the Work equation to solve for Distance**');
      steps.push('$d = \\frac{W}{F \\cdot \\cos(\\theta)}$');
      steps.push('\n**Step 2: Convert known inputs to SI units**');
      steps.push(`Work ($W$) = $${formatNumber(wSI)}$ J`);
      steps.push(`Force ($F$) = $${formatNumber(fSI)}$ N`);
      steps.push(`Angle ($\\theta$) = $${formatNumber(thetaRad)}$ rad`);
      steps.push('\n**Step 3: Calculate Distance**');
      steps.push(`$d = \\frac{${formatNumber(wSI)}}{${formatNumber(fSI)} \\times \\cos(${formatNumber(thetaRad)})}$`);
      steps.push(`$d = ${formatNumber(distanceSI)}$ meters`);
      steps.push('\n**Step 4: Calculate Power**');
      steps.push(`$P = \\frac{W}{t} = \\frac{${formatNumber(wSI)}}{${formatNumber(tSI)}} = ${formatNumber(powerSI)}$ Watts`);
    } 
    else if (solveFor === 'time') {
      if (isNaN(wVal)) throw new Error('Please enter a valid work value.');
      if (isNaN(pVal) || pVal <= 0) throw new Error('Please enter a valid positive power.');
      if (isNaN(fVal)) computedForce = 0;
      if (isNaN(dVal)) computedDistance = 0;
      if (isNaN(aVal)) computedAngle = 0;

      const wSI = wVal * WORK_CONVERSION[workUnit];
      const pSI = pVal * POWER_CONVERSION[powerUnit];

      const timeSI = wSI / pSI;
      if (timeSI <= 0) {
        throw new Error('Calculated time is negative or zero, check input Work polarity.');
      }

      computedTime = timeSI / TIME_CONVERSION[timeUnit];

      steps.push('**Step 1: Rearrange the Power equation to solve for Time**');
      steps.push('$t = \\frac{W}{P}$');
      steps.push('\n**Step 2: Convert inputs to SI units**');
      steps.push(`Work ($W$) = $${formatNumber(wSI)}$ J`);
      steps.push(`Power ($P$) = $${formatNumber(pSI)}$ W`);
      steps.push('\n**Step 3: Calculate Time**');
      steps.push(`$t = \\frac{${formatNumber(wSI)}}{${formatNumber(pSI)}}$`);
      steps.push(`$t = ${formatNumber(timeSI)}$ seconds`);
    } 
    else { // solveFor === 'angle'
      if (isNaN(wVal)) throw new Error('Please enter a valid work value.');
      if (isNaN(fVal) || fVal <= 0) throw new Error('Please enter a valid positive force.');
      if (isNaN(dVal) || dVal <= 0) throw new Error('Please enter a valid positive distance.');
      if (isNaN(tVal) || tVal <= 0) throw new Error('Please enter a valid positive time.');

      const wSI = wVal * WORK_CONVERSION[workUnit];
      const fSI = fVal * FORCE_CONVERSION[forceUnit];
      const dSI = dVal * DISTANCE_CONVERSION[distanceUnit];
      const tSI = tVal * TIME_CONVERSION[timeUnit];

      const cosVal = wSI / (fSI * dSI);
      if (cosVal > 1.000001 || cosVal < -1.000001) {
        throw new Error(`The work done (${formatNumber(wSI)} J) exceeds the maximum potential work done by this force over this distance (${formatNumber(fSI * dSI)} J). Try raising force/distance or lowering work.`);
      }

      // Clamp to prevent floating precision NaN on arccos
      const clampedCos = Math.max(-1, Math.min(1, cosVal));
      const thetaRad = Math.acos(clampedCos);
      computedAngle = convertRadToAngle(thetaRad, angleUnit);
      
      const powerSI = wSI / tSI;
      computedPower = powerSI / POWER_CONVERSION[powerUnit];

      steps.push('**Step 1: Rearrange the Work equation to solve for Cosine of Angle**');
      steps.push('$\\cos(\\theta) = \\frac{W}{F \\cdot d}$');
      steps.push('\n**Step 2: Substitute SI units and solve for Cosine**');
      steps.push(`Work ($W$) = $${formatNumber(wSI)}$ J`);
      steps.push(`Force ($F$) = $${formatNumber(fSI)}$ N`);
      steps.push(`Distance ($d$) = $${formatNumber(dSI)}$ m`);
      steps.push(`$\\cos(\\theta) = \\frac{${formatNumber(wSI)}}{${formatNumber(fSI)} \\times ${formatNumber(dSI)}} = ${formatNumber(clampedCos)}$`);
      steps.push('\n**Step 3: Solve for Angle (\\theta)**');
      steps.push(`$\\theta = \\arccos(${formatNumber(clampedCos)}) = ${formatNumber(thetaRad)}$ radians`);
      steps.push(`$\\theta = ${formatNumber(convertRadToAngle(thetaRad, 'deg'))}^\\circ$`);
      steps.push('\n**Step 4: Calculate Power**');
      steps.push(`$P = \\frac{W}{t} = \\frac{${formatNumber(wSI)}}{${formatNumber(tSI)}} = ${formatNumber(powerSI)}$ Watts`);
    }

    // Convert values back to standard SI representations for secondary outputs
    const forceSI = computedForce * FORCE_CONVERSION[forceUnit];
    const distanceSI = computedDistance * DISTANCE_CONVERSION[distanceUnit];
    const angleSI = convertAngleToRad(computedAngle, angleUnit);
    const timeSI = computedTime * TIME_CONVERSION[timeUnit];
    const workSI = computedWork * WORK_CONVERSION[workUnit];
    const powerSI = computedPower * POWER_CONVERSION[powerUnit];

    // Compute Advanced Kinematics / Kinematics calibration
    let acceleration = 0;
    let finalVelocity = viVal;

    if (mVal > 0) {
      const forceX = forceSI * Math.cos(angleSI);
      acceleration = forceX / mVal;
      // v_f^2 = v_i^2 + 2 * a * d
      const vfSquared = Math.pow(viVal, 2) + 2 * acceleration * distanceSI;
      if (vfSquared >= 0) {
        finalVelocity = Math.sqrt(vfSquared);
      } else {
        finalVelocity = 0; // deceleration stopped the mass
      }
    }

    return {
      solveFor,
      work: computedWork,
      power: computedPower,
      force: computedForce,
      distance: computedDistance,
      angle: computedAngle,
      time: computedTime,
      forceInNewtons: forceSI,
      distanceInMeters: distanceSI,
      angleInRadians: angleSI,
      timeInSeconds: timeSI,
      workInJoules: workSI,
      powerInWatts: powerSI,
      acceleration,
      finalVelocity,
      steps,
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeModel();
      setResult(calcResult);
      setHasCalculated(true);
      setError('');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#1a1a1a', '#ffffff', '#7a7a7a'],
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setSolveFor('work-power');
    setForce('50');
    setForceUnit('N');
    setDistance('10');
    setDistanceUnit('m');
    setAngle('30');
    setAngleUnit('deg');
    setTime('5');
    setTimeUnit('s');
    setWork('433.01');
    setWorkUnit('J');
    setPower('86.60');
    setPowerUnit('W');
    setMass('10');
    setInitVelocity('0');
    setActiveField('force');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  // Pre-calculate visual coordinates for vector display
  const fValVisual = Math.abs(parseFloat(force)) || 0;
  const dValVisual = Math.abs(parseFloat(distance)) || 0;
  const aValVisual = parseFloat(angle) || 0;
  const aRadVisual = angleUnit === 'deg' ? aValVisual * (Math.PI / 180) : aValVisual;

  // Render SVG Force Vector parameters
  const originX = 240;
  const originY = 220;
  const forceArrowLength = Math.min(180, Math.max(60, 90 + Math.log10(fValVisual || 1) * 25));
  const distArrowLength = Math.min(220, Math.max(65, 95 + Math.log10(dValVisual || 1) * 35));

  const forceEndX = originX + forceArrowLength * Math.cos(aRadVisual);
  const forceEndY = originY - forceArrowLength * Math.sin(aRadVisual);

  const horizontalForceEndX = originX + forceArrowLength * Math.cos(aRadVisual);

  // Arc path for angle visualizer
  const arcRadius = 35;
  const arcStartX = originX + arcRadius;
  const arcStartY = originY;
  const arcEndX = originX + arcRadius * Math.cos(aRadVisual);
  const arcEndY = originY - arcRadius * Math.sin(aRadVisual);
  // SVG arc flag
  const largeArcFlag = Math.abs(aRadVisual) > Math.PI ? 1 : 0;
  const sweepFlag = aRadVisual < 0 ? 1 : 0;
  const arcPath = isNaN(arcEndX) || isNaN(arcEndY) 
    ? 'M 0 0'
    : `M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${arcEndX} ${arcEndY}`;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Scope Selector & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Solve Target Variable
          </span>
          <div className="flex flex-wrap space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[
              { id: 'work-power', label: 'Work & Power' },
              { id: 'force', label: 'Force (F)' },
              { id: 'distance', label: 'Distance (d)' },
              { id: 'time', label: 'Time (t)' },
              { id: 'angle', label: 'Angle (θ)' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setSolveFor(mode.id as any);
                  setError('');
                  // Set active field default
                  if (mode.id === 'work-power') setActiveField('force');
                  else if (mode.id === 'force') setActiveField('work');
                  else if (mode.id === 'distance') setActiveField('work');
                  else if (mode.id === 'time') setActiveField('work');
                  else if (mode.id === 'angle') setActiveField('work');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
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

        {/* Physics Presets */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Mechanical Presets
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {[
              { name: 'Pushing a Cart', f: '30', d: '10', a: '0', t: '8' },
              { name: 'Lifting Box Vertically', f: '50', d: '2', a: '0', t: '5' },
              { name: 'Pulling at 30°', f: '40', d: '5', a: '30', t: '3' },
              { name: 'Frictional Deceleration', f: '15', d: '6', a: '180', t: '4' }
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => loadPreset(p.f, p.d, p.a, p.t)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all text-slate-700"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Force Input */}
          <div
            onClick={() => { if (solveFor !== 'force') setActiveField('force'); }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all ${
              solveFor === 'force'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'force'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Applied Force (F)
              </span>
              {solveFor === 'force' && (
                <span className="text-[9px] font-extrabold text-slate-450 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="text"
                value={solveFor === 'force' ? 'Calculated' : force}
                disabled={solveFor === 'force'}
                onChange={(e) => {
                  setForce(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
              />
              {solveFor !== 'force' && (
                <select
                  value={forceUnit}
                  onChange={(e) => setForceUnit(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-500 focus:outline-none cursor-pointer border-none p-0 pr-1"
                >
                  <option value="N">N</option>
                  <option value="kN">kN</option>
                  <option value="lbf">lbf</option>
                </select>
              )}
            </div>
            {solveFor !== 'force' && (
              <div className="flex space-x-1">
                {['+10', '-10', '×2', '÷2'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (op.startsWith('+')) adjustValue('force', parseFloat(op.slice(1)), true);
                      else if (op.startsWith('-')) adjustValue('force', -parseFloat(op.slice(1)), true);
                      else if (op.startsWith('×')) adjustValue('force', parseFloat(op.slice(1)));
                      else adjustValue('force', 1 / parseFloat(op.slice(1)));
                    }}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Distance Input */}
          <div
            onClick={() => { if (solveFor !== 'distance') setActiveField('distance'); }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all ${
              solveFor === 'distance'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'distance'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Displacement Distance (d)
              </span>
              {solveFor === 'distance' && (
                <span className="text-[9px] font-extrabold text-slate-450 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="text"
                value={solveFor === 'distance' ? 'Calculated' : distance}
                disabled={solveFor === 'distance'}
                onChange={(e) => {
                  setDistance(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
              />
              {solveFor !== 'distance' && (
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-500 focus:outline-none cursor-pointer border-none p-0 pr-1"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              )}
            </div>
            {solveFor !== 'distance' && (
              <div className="flex space-x-1">
                {['+5', '-5', '×2', '÷2'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (op.startsWith('+')) adjustValue('distance', parseFloat(op.slice(1)), true);
                      else if (op.startsWith('-')) adjustValue('distance', -parseFloat(op.slice(1)), true);
                      else if (op.startsWith('×')) adjustValue('distance', parseFloat(op.slice(1)));
                      else adjustValue('distance', 1 / parseFloat(op.slice(1)));
                    }}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Angle Input */}
          <div
            onClick={() => { if (solveFor !== 'angle') setActiveField('angle'); }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all ${
              solveFor === 'angle'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'angle'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Force Angle (θ)
              </span>
              {solveFor === 'angle' && (
                <span className="text-[9px] font-extrabold text-slate-450 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="text"
                value={solveFor === 'angle' ? 'Calculated' : angle}
                disabled={solveFor === 'angle'}
                onChange={(e) => {
                  setAngle(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
              />
              {solveFor !== 'angle' && (
                <select
                  value={angleUnit}
                  onChange={(e) => setAngleUnit(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-500 focus:outline-none cursor-pointer border-none p-0 pr-1"
                >
                  <option value="deg">°</option>
                  <option value="rad">rad</option>
                </select>
              )}
            </div>
            {solveFor !== 'angle' && (
              <div className="flex space-x-1">
                {['+15', '-15', '0', '90'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (op === '0' || op === '90') {
                        setAngle(op);
                      } else if (op.startsWith('+')) {
                        adjustValue('angle', parseFloat(op.slice(1)), true);
                      } else {
                        adjustValue('angle', -parseFloat(op.slice(1)), true);
                      }
                    }}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    {op === '0' || op === '90' ? `${op}°` : op}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Input */}
          <div
            onClick={() => { if (solveFor !== 'time') setActiveField('time'); }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all ${
              solveFor === 'time'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'time'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Duration Time (t)
              </span>
              {solveFor === 'time' && (
                <span className="text-[9px] font-extrabold text-slate-450 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="text"
                value={solveFor === 'time' ? 'Calculated' : time}
                disabled={solveFor === 'time'}
                onChange={(e) => {
                  setTime(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
              />
              {solveFor !== 'time' && (
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-500 focus:outline-none cursor-pointer border-none p-0 pr-1"
                >
                  <option value="s">s</option>
                  <option value="min">min</option>
                  <option value="h">h</option>
                </select>
              )}
            </div>
            {solveFor !== 'time' && (
              <div className="flex space-x-1">
                {['+1', '-1', '×5', '÷5'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (op.startsWith('+')) adjustValue('time', parseFloat(op.slice(1)), true);
                      else if (op.startsWith('-')) adjustValue('time', -parseFloat(op.slice(1)), true);
                      else if (op.startsWith('×')) adjustValue('time', parseFloat(op.slice(1)));
                      else adjustValue('time', 1 / parseFloat(op.slice(1)));
                    }}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Work Input */}
          <div
            onClick={() => { if (solveFor !== 'work-power') setActiveField('work'); }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all ${
              solveFor === 'work-power'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'work'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Mechanical Work (W)
              </span>
              {solveFor === 'work-power' && (
                <span className="text-[9px] font-extrabold text-slate-450 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="text"
                value={solveFor === 'work-power' ? 'Calculated' : work}
                disabled={solveFor === 'work-power'}
                onChange={(e) => {
                  setWork(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
              />
              {solveFor !== 'work-power' && (
                <select
                  value={workUnit}
                  onChange={(e) => setWorkUnit(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-500 focus:outline-none cursor-pointer border-none p-0 pr-1"
                >
                  <option value="J">J</option>
                  <option value="kJ">kJ</option>
                  <option value="ft-lbf">ft-lbf</option>
                </select>
              )}
            </div>
            {solveFor !== 'work-power' && (
              <div className="flex space-x-1">
                {['+100', '-100', '×2', '÷2'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (op.startsWith('+')) adjustValue('work', parseFloat(op.slice(1)), true);
                      else if (op.startsWith('-')) adjustValue('work', -parseFloat(op.slice(1)), true);
                      else if (op.startsWith('×')) adjustValue('work', parseFloat(op.slice(1)));
                      else adjustValue('work', 1 / parseFloat(op.slice(1)));
                    }}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Power Input */}
          <div
            onClick={() => { if (solveFor !== 'work-power' && solveFor !== 'time') setActiveField('power'); }}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3 relative transition-all ${
              solveFor === 'work-power' || solveFor === 'time'
                ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                : activeField === 'power'
                ? 'border-slate-900 shadow cursor-pointer'
                : 'border-slate-200/80 hover:border-slate-350 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Mechanical Power (P)
              </span>
              {(solveFor === 'work-power' || solveFor === 'time') && (
                <span className="text-[9px] font-extrabold text-slate-450 bg-slate-200/50 px-2 py-0.5 rounded-md">
                  SOLVED VALUE
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-1">
              <input
                type="text"
                value={solveFor === 'work-power' || solveFor === 'time' ? 'Calculated' : power}
                disabled={solveFor === 'work-power' || solveFor === 'time'}
                onChange={(e) => {
                  setPower(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
              />
              {solveFor !== 'work-power' && solveFor !== 'time' && (
                <select
                  value={powerUnit}
                  onChange={(e) => setPowerUnit(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-500 focus:outline-none cursor-pointer border-none p-0 pr-1"
                >
                  <option value="W">W</option>
                  <option value="kW">kW</option>
                  <option value="hp">hp</option>
                </select>
              )}
            </div>
            {solveFor !== 'work-power' && solveFor !== 'time' && (
              <div className="flex space-x-1">
                {['+50', '-50', '×2', '÷2'].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (op.startsWith('+')) adjustValue('power', parseFloat(op.slice(1)), true);
                      else if (op.startsWith('-')) adjustValue('power', -parseFloat(op.slice(1)), true);
                      else if (op.startsWith('×')) adjustValue('power', parseFloat(op.slice(1)));
                      else adjustValue('power', 1 / parseFloat(op.slice(1)));
                    }}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Collapsible Advanced Options: Mass calibration */}
        <details className="group bg-slate-50/50 border border-slate-150 rounded-2xl p-4 text-left transition-all">
          <summary className="font-extrabold text-xs uppercase tracking-wider text-slate-500 cursor-pointer list-none flex justify-between items-center select-none">
            <span className="flex items-center">
              <i className="fas fa-sliders-h mr-2 text-slate-400"></i>
              Advanced Mass &amp; Kinematics Calibration (Velocity output)
            </span>
            <i className="fas fa-chevron-down text-xs text-slate-400 group-open:rotate-180 transition-transform duration-300"></i>
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-200/60">
            {/* Mass */}
            <div
              onClick={() => setActiveField('mass')}
              className={`bg-white border p-4 rounded-xl text-left space-y-2 cursor-pointer transition-all ${
                activeField === 'mass' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Object Mass (kg)
              </span>
              <input
                type="text"
                value={mass}
                onChange={(e) => {
                  setMass(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-lg font-black text-slate-900 focus:outline-none"
              />
            </div>
            {/* Initial Velocity */}
            <div
              onClick={() => setActiveField('initVelocity')}
              className={`bg-white border p-4 rounded-xl text-left space-y-2 cursor-pointer transition-all ${
                activeField === 'initVelocity' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Initial Velocity (v₀, m/s)
              </span>
              <input
                type="text"
                value={initVelocity}
                onChange={(e) => {
                  setInitVelocity(e.target.value.replace(/[^0-9.eE+-]/g, ''));
                  setError('');
                }}
                className="w-full bg-transparent text-lg font-black text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </details>

        {/* Tactile Keypad */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
            Tactile Pad (editing {activeField.toUpperCase()})
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
            Calculate Work &amp; Power
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

      {/* Interactive Vector component visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-drafting-compass mr-2 text-slate-400"></i>
            Force Vector Component Visualizer
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Shows Force vector, displacement axis, and the horizontal component doing work.
          </span>
        </div>

        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 320" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="vector-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1c1c1c" strokeWidth="1" />
              </pattern>
              <marker id="force-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ffffff" />
              </marker>
              <marker id="comp-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#8a8a8a" />
              </marker>
              <marker id="dist-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#a1a1a1" />
              </marker>
            </defs>

            <rect width="100%" height="100%" fill="url(#vector-grid)" />

            {/* Zero/Baseline coordinates axis */}
            <line x1="50" y1={originY} x2="750" y2={originY} stroke="#1b1b1b" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1={originX} y1="30" x2={originX} y2="290" stroke="#1b1b1b" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Ground surface line */}
            <line x1="50" y1="250" x2="750" y2="250" stroke="#2a2a2a" strokeWidth="2" />
            
            {/* The Crate block */}
            <rect
              x={originX - 45}
              y="190"
              width="90"
              height="60"
              fill="#111111"
              stroke="#444444"
              strokeWidth="2"
              rx="4"
              className="shadow-xl"
            />
            <line x1={originX - 45} y1="190" x2={originX + 45} y2="250" stroke="#222222" strokeWidth="1.5" />
            <line x1={originX + 45} y1="190" x2={originX - 45} y2="250" stroke="#222222" strokeWidth="1.5" />

            {/* Displacement vector path */}
            {!isNaN(distArrowLength) && (
              <line
                x1={originX}
                y1={originY}
                x2={originX + distArrowLength}
                y2={originY}
                stroke="#a1a1a1"
                strokeWidth="2.5"
                markerEnd="url(#dist-arrow)"
                className="drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]"
              />
            )}

            {/* Force vector arrow */}
            {!isNaN(forceEndX) && !isNaN(forceEndY) && (
              <line
                x1={originX}
                y1={originY}
                x2={forceEndX}
                y2={forceEndY}
                stroke="#ffffff"
                strokeWidth="3"
                markerEnd="url(#force-arrow)"
                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              />
            )}

            {/* Projection line from force endpoint vertically down to displacement baseline */}
            {!isNaN(forceEndX) && !isNaN(forceEndY) && (
              <line
                x1={forceEndX}
                y1={forceEndY}
                x2={horizontalForceEndX}
                y2={originY}
                stroke="#555555"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            )}

            {/* Horizontal force component F cos(theta) */}
            {!isNaN(horizontalForceEndX) && (
              <line
                x1={originX}
                y1={originY}
                x2={horizontalForceEndX}
                y2={originY}
                stroke="#8a8a8a"
                strokeWidth="3"
                markerEnd="url(#comp-arrow)"
                className="drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"
              />
            )}

            {/* Theta Angle Arc */}
            <path
              d={arcPath}
              fill="none"
              stroke="#888888"
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />

            {/* Floating text value indicators */}
            {!isNaN(forceEndX) && !isNaN(forceEndY) && (
              <text x={forceEndX + 10} y={forceEndY - 10} fill="#ffffff" className="font-mono text-[10px] font-bold">
                F = {fValVisual} {forceUnit}
              </text>
            )}
            {!isNaN(horizontalForceEndX) && (
              <text x={horizontalForceEndX > originX ? horizontalForceEndX + 5 : horizontalForceEndX - 105} y={originY + 18} fill="#8a8a8a" className="font-mono text-[9px] font-bold">
                Fx = {(fValVisual * Math.cos(aRadVisual)).toFixed(2)} N
              </text>
            )}
            <text x={originX + distArrowLength - 40} y={originY - 12} fill="#a1a1a1" className="font-mono text-[9px] font-bold">
              d = {dValVisual} {distanceUnit}
            </text>
            <text x={originX + 40} y={originY - 14} fill="#888888" className="font-mono text-[9px] font-bold">
              θ = {aValVisual.toFixed(1)}°
            </text>
          </svg>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="pt-6 border-t border-slate-150 space-y-8 animate-fade-in-up text-left">
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">
            Calculated Mechanical Properties
          </h3>

          {/* Core outputs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Mechanical Work Done (W)
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatNumber(result.work)} {workUnit}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Average Power Level (P)
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatNumber(result.power)} {powerUnit}
              </span>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-2 text-slate-400"></i>
              Step-by-Step Resolution
            </h4>
            <div className="space-y-4 font-mono text-sm leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner overflow-y-auto max-h-80">
              {result.steps.map((step, idx) => {
                if (step.startsWith('**') && step.endsWith('**')) {
                  return (
                    <strong key={idx} className="text-slate-950 font-extrabold block mt-2 mb-1">
                      {step.replace(/\*\*/g, '')}
                    </strong>
                  );
                }
                const parts = step.split('$');
                return (
                  <div key={idx} className="block text-slate-750 py-0.5 leading-relaxed">
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
            {/* Input quantities mapped to SI Units */}
            <div className="bg-slate-50/50 border border-slate-150 p-6 rounded-3xl space-y-4">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center">
                <i className="fas fa-cogs mr-2 text-slate-400"></i>
                Input Quantities (SI Units)
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Force (F)</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.forceInNewtons)} N
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Displacement (d)</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.distanceInMeters)} m
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Angle (θ)</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.angleInRadians)} rad
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Duration (t)</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.timeInSeconds)} s
                  </span>
                </div>
              </div>
            </div>

            {/* Derived Kinematics Mechanics */}
            <div className="bg-slate-50/50 border border-slate-150 p-6 rounded-3xl space-y-4">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center">
                <i className="fas fa-chart-line mr-2 text-slate-400"></i>
                Kinematics &amp; Work-Energy Theorem
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Object mass (m)</span>
                  <span className="font-mono font-black text-slate-800">{mass} kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Acceleration along axis</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.acceleration)} m/s²
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Initial velocity (v₀)</span>
                  <span className="font-mono font-black text-slate-800">{initVelocity} m/s</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Final velocity (v_f)</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.finalVelocity)} m/s
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-150">
                  <span className="font-bold text-slate-500">Change in Kinetic Energy (ΔKE)</span>
                  <span className="font-mono font-black text-slate-800">
                    {formatNumber(result.workInJoules)} J
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
