'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface MethodResult {
  name: string;
  year: string;
  maleFormula: string;
  femaleFormula: string;
  idealKg: number;
  idealLbs: number;
}

interface CalculationResult {
  methods: MethodResult[];
  minHealthyKg: number;
  maxHealthyKg: number;
  minHealthyLbs: number;
  maxHealthyLbs: number;
  currentKg: number;
  currentLbs: number;
  heightCm: number;
  heightM: number;
  gender: string;
  weightUnit: string;
  recommendations: string[];
}

const devine = (hCm: number, g: string): number => {
  const base = g === 'male' ? 50 : 45.5;
  return base + 0.9 * (hCm - 152.4);
};

const robinson = (hCm: number, g: string): number => {
  const hIn = hCm / 2.54;
  const diff = hIn - 60;
  if (g === 'male') return 52 + 1.9 * diff;
  return 49 + 1.7 * diff;
};

const miller = (hCm: number, g: string): number => {
  const hIn = hCm / 2.54;
  const diff = hIn - 60;
  if (g === 'male') return 56.2 + 1.41 * diff;
  return 53.1 + 1.36 * diff;
};

const hamwi = (hCm: number, g: string): number => {
  const hIn = hCm / 2.54;
  const diff = hIn - 60;
  if (g === 'male') return 48 + 1.1 * diff;
  return 45.5 + 1.0 * diff;
};

const broca = (hCm: number, _g: string): number => {
  return hCm - 100;
};

const bmiBased = (hCm: number, _g: string): number => {
  const hM = hCm / 100;
  return 21.75 * hM * hM;
};

const computeMethods = (heightCm: number, gender: string): MethodResult[] => {
  const hCm = heightCm;
  const g = gender;

  return [
    { name: 'Devine', year: '1974', maleFormula: '50 + 0.9 × (cm − 152.4)', femaleFormula: '45.5 + 0.9 × (cm − 152.4)', idealKg: devine(hCm, g), idealLbs: devine(hCm, g) * 2.20462 },
    { name: 'Robinson', year: '1983', maleFormula: '52 + 1.9 × (in − 60)', femaleFormula: '49 + 1.7 × (in − 60)', idealKg: robinson(hCm, g), idealLbs: robinson(hCm, g) * 2.20462 },
    { name: 'Miller', year: '1983', maleFormula: '56.2 + 1.41 × (in − 60)', femaleFormula: '53.1 + 1.36 × (in − 60)', idealKg: miller(hCm, g), idealLbs: miller(hCm, g) * 2.20462 },
    { name: 'Hamwi', year: '1964', maleFormula: '48 + 1.1 × (in − 60)', femaleFormula: '45.5 + 1.0 × (in − 60)', idealKg: hamwi(hCm, g), idealLbs: hamwi(hCm, g) * 2.20462 },
    { name: 'Broca', year: '1871', maleFormula: 'cm − 100', femaleFormula: 'cm − 100', idealKg: broca(hCm, g), idealLbs: broca(hCm, g) * 2.20462 },
    { name: 'BMI-Based', year: '—', maleFormula: '21.75 × m²', femaleFormula: '21.75 × m²', idealKg: bmiBased(hCm, g), idealLbs: bmiBased(hCm, g) * 2.20462 },
  ];
};

const computeResult = (
  unitMode: 'metric' | 'imperial',
  gender: string,
  weightKg: number,
  weightLbs: number,
  heightCm: number
): CalculationResult => {
  const hM = heightCm / 100;
  const methods = computeMethods(heightCm, gender);

  const minHealthyKg = parseFloat((18.5 * hM * hM).toFixed(1));
  const maxHealthyKg = parseFloat((24.9 * hM * hM).toFixed(1));

  const recommendations: string[] = [];
  const avgIdeal = methods.reduce((sum, m) => sum + m.idealKg, 0) / methods.length;

  if (weightKg < minHealthyKg) {
    recommendations.push('Your current weight is below the healthy BMI range. Consider our Weight Gain Calculator for a structured surplus plan.');
    recommendations.push('The Devine formula is most commonly used in clinical settings; it may be a good starting point for setting your target.');
  } else if (weightKg > maxHealthyKg) {
    recommendations.push('Your current weight is above the healthy BMI range. Consider our Weight Loss Calculator for a structured deficit plan.');
    recommendations.push('The Devine formula is widely referenced, but the BMI-based method gives the midpoint of the healthy weight range.');
  } else {
    recommendations.push('Your current weight is within the healthy BMI range. Use these formulas as reference points for maintaining your weight.');
  }

  recommendations.push('Different formulas were developed for different populations — no single formula is universally "correct." Use the range as a guide.');
  recommendations.push('Frame size, muscle mass, and bone density can affect what is a healthy weight for you personally.');
  if (weightKg > avgIdeal * 1.1) {
    recommendations.push('Pair this with our Calorie Calculator to align your intake with your weight goals, or try our Body Fat Calculator for a fuller picture.');
  } else if (weightKg < avgIdeal * 0.9) {
    recommendations.push('Pair this with our Calorie Calculator to align your intake with your weight goals.');
  }
  recommendations.push('Update your measurements monthly and track trends rather than focusing on a single number.');
  recommendations.push('For personalized medical advice, consult a healthcare provider who can assess your full health profile.');

  return {
    methods,
    minHealthyKg,
    maxHealthyKg,
    minHealthyLbs: parseFloat((minHealthyKg * 2.20462).toFixed(1)),
    maxHealthyLbs: parseFloat((maxHealthyKg * 2.20462).toFixed(1)),
    currentKg: weightKg,
    currentLbs: weightLbs,
    heightCm,
    heightM: hM,
    gender,
    weightUnit: unitMode === 'metric' ? 'kg' : 'lbs',
    recommendations,
  };
};

export default function IdealWeightCalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('female');
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(65);
  const [weightLbs, setWeightLbs] = useState<number>(143);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(5);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const weightUnit = unitMode === 'metric' ? 'kg' : 'lbs';

  const handleUnitToggle = (mode: 'metric' | 'imperial') => {
    if (mode === 'metric' && unitMode === 'imperial') {
      const totalInches = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round(weightLbs * 0.45359237));
    } else if (mode === 'imperial' && unitMode === 'metric') {
      const totalInches = heightCm / 2.54;
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg / 0.45359237));
    }
    setUnitMode(mode);
  };

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(unitMode, gender, weightKg, weightLbs, heightCm));
    }
  }, [unitMode, gender, age, weightKg, weightLbs, heightCm, heightFt, heightIn, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(unitMode, gender, weightKg, weightLbs, heightCm));
    setHasCalculated(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1a1a1a', '#ffffff', '#a1a1a1'],
    });
  };

  const handleReset = () => {
    setUnitMode('metric');
    setGender('female');
    setAge(30);
    setWeightKg(65);
    setWeightLbs(143);
    setHeightCm(165);
    setHeightFt(5);
    setHeightIn(5);
    setResult(null);
    setHasCalculated(false);
  };

  const currentKg = result?.currentKg ?? weightKg;
  const avgIdeal = result ? result.methods.reduce((s, m) => s + m.idealKg, 0) / result.methods.length : 0;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="space-y-6">
          {/* Row 1: Unit System + Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Unit System</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  <button type="button" onClick={() => handleUnitToggle('metric')}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${unitMode === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Metric (kg/cm)</button>
                  <button type="button" onClick={() => handleUnitToggle('imperial')}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${unitMode === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Imperial (lbs/ft-in)</button>
                </div>
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                {unitMode === 'metric' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Height</label>
                      <div className="flex items-center space-x-1.5">
                        <input type="number" value={heightCm} onChange={(e) => setHeightCm(Math.max(50, Math.min(250, parseInt(e.target.value) || 0)))}
                          className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">cm</span>
                      </div>
                    </div>
                    <input type="range" min="50" max="250" step="1" value={heightCm} onChange={(e) => setHeightCm(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <span>50 cm</span><span>150 cm</span><span>175 cm</span><span>250 cm</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Height</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <input type="number" min="1" max="8" value={heightFt} onChange={(e) => setHeightFt(Math.max(1, Math.min(8, parseInt(e.target.value) || 0)))}
                            className="w-12 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ft</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                            className="w-12 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">in</span>
                        </div>
                      </div>
                    </div>
                    <input type="range" min="24" max="96" step="1" value={heightFt * 12 + heightIn} onChange={(e) => { const t = parseInt(e.target.value); setHeightFt(Math.floor(t / 12)); setHeightIn(t % 12); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <span>2&apos;0&quot;</span><span>5&apos;0&quot;</span><span>6&apos;0&quot;</span><span>8&apos;0&quot;</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Gender + Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Gender</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {['male', 'female'].map((g) => (
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${gender === g ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {g === 'male' && <i className="fas fa-mars mr-1.5 text-[10px]"></i>}
                      {g === 'female' && <i className="fas fa-venus mr-1.5 text-[10px]"></i>}
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Current Weight</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={unitMode === 'metric' ? weightKg : weightLbs}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 0);
                        if (unitMode === 'metric') setWeightKg(Math.min(500, val));
                        else setWeightLbs(Math.min(1100, val));
                      }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{weightUnit}</span>
                  </div>
                </div>
                {unitMode === 'metric' ? (
                  <input type="range" min="20" max="250" step="1" value={weightKg} onChange={(e) => setWeightKg(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                ) : (
                  <input type="range" min="40" max="550" step="1" value={weightLbs} onChange={(e) => setWeightLbs(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                )}
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>{unitMode === 'metric' ? '20 kg' : '40 lbs'}</span>
                  <span>{unitMode === 'metric' ? '100 kg' : '220 lbs'}</span>
                  <span>{unitMode === 'metric' ? '175 kg' : '385 lbs'}</span>
                  <span>{unitMode === 'metric' ? '250 kg' : '550 lbs'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Age (full-width) */}
          <div className="flex flex-col [&>div]:flex-1">
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Age</label>
                <div className="flex items-center space-x-1.5">
                  <input type="number" value={age} onChange={(e) => setAge(Math.max(2, Math.min(120, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">yrs</span>
                </div>
              </div>
              <input type="range" min="2" max="120" step="1" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>2 yrs</span><span>Adult (18+)</span><span>Senior (65+)</span><span>120 yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer">
            Calculate Ideal Weight
          </button>
          <button type="button" onClick={handleReset}
            className="px-8 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 hover:text-slate-800 transition-all duration-350 active:scale-95 text-sm cursor-pointer">
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="pt-8 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-xl font-extrabold text-slate-950 text-center tracking-tight font-display">
            Your Ideal Weight Assessment
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">IBW</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Average Ideal Weight */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Average Ideal Weight (all methods)</span>
                <div className="text-5xl font-black text-white font-mono tracking-tight">
                  {avgIdeal.toFixed(1)}<span className="text-lg font-medium text-slate-400 ml-1">{weightUnit === 'kg' ? 'kg' : 'lbs'}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1 font-medium">
                  Your current: {unitMode === 'metric' ? weightKg : weightLbs} {weightUnit}
                </div>
              </div>

              {/* All Methods Comparison Table */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">All Methods Comparison</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <th className="py-2 pr-3">Method</th>
                        <th className="py-2 pr-3">Year</th>
                        <th className="py-2 pr-3 text-right">Ideal</th>
                        <th className="py-2 pr-3 text-right">Ideal (lbs)</th>
                        <th className="py-2 text-right">vs You</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {result.methods.map((m) => {
                        const diffKg = currentKg - m.idealKg;
                        const diffAbs = Math.abs(diffKg);
                        const isOver = diffKg > 2;
                        const isUnder = diffKg < -2;
                        return (
                          <tr key={m.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-2 pr-3 font-bold text-white">{m.name}</td>
                            <td className="py-2 pr-3 text-slate-400 font-mono">{m.year}</td>
                            <td className="py-2 pr-3 text-right font-mono font-black">{m.idealKg.toFixed(1)}</td>
                            <td className="py-2 pr-3 text-right font-mono text-slate-400">{m.idealLbs.toFixed(1)}</td>
                            <td className="py-2 text-right font-mono font-bold">
                              {isOver ? (
                                <span className="text-amber-400">+{diffKg.toFixed(1)}</span>
                              ) : isUnder ? (
                                <span className="text-sky-400">{diffKg.toFixed(1)}</span>
                              ) : (
                                <span className="text-emerald-400">\u2713</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Your Position vs Healthy Range */}
              <div className="pb-4 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Healthy BMI Range (18.5–24.9)</span>
                <div className="flex items-center justify-center gap-4 text-sm font-mono font-black">
                  <span className="text-slate-400">{unitMode === 'metric' ? result.minHealthyKg : result.minHealthyLbs} {weightUnit}</span>
                  <div className="h-2 flex-1 max-w-[200px] bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="h-full bg-emerald-500 rounded-full" style={{
                      width: `${Math.max(0, Math.min(100, ((currentKg - result.minHealthyKg) / (result.maxHealthyKg - result.minHealthyKg)) * 100))}%`
                    }}></div>
                  </div>
                  <span className="text-slate-400">{unitMode === 'metric' ? result.maxHealthyKg : result.maxHealthyLbs} {weightUnit}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-medium">
                  {currentKg < result.minHealthyKg ? 'Below healthy range' :
                   currentKg > result.maxHealthyKg ? 'Above healthy range' :
                   'Within healthy range'}
                </div>
              </div>

              {/* Formula Range */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2">Ideal Weight Range (all methods)</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono font-black text-emerald-400">
                    {Math.min(...result.methods.map(m => m.idealKg)).toFixed(1)} {weightUnit}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">to</span>
                  <span className="font-mono font-black text-amber-400">
                    {Math.max(...result.methods.map(m => m.idealKg)).toFixed(1)} {weightUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formula Reference Cards */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-square-root-alt text-slate-800 mr-2.5 text-sm"></i>
                Formula Details
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">6 methods</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.methods.map((m) => (
                <div key={m.name} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{m.name} ({m.year})</span>
                    <span className="font-mono font-black text-sm text-slate-800">{m.idealKg.toFixed(1)} {weightUnit}</span>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-slate-700 leading-relaxed bg-white/60 rounded-xl px-3 py-2 border border-slate-200/60">
                    {gender === 'male' ? m.maleFormula : m.femaleFormula}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {gender === 'male' ? 'Male' : 'Female'} formula
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Healthy Weight Range Table */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-weight text-slate-800 mr-2.5 text-sm"></i>
                Healthy BMI Weight Range
              </h3>
            </div>
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[400px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">BMI Range</th>
                    <th className="px-6 py-3.5">Weight Range ({weightUnit})</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { cat: 'Underweight', bmi: '< 18.5', low: 0, high: result.minHealthyKg, color: 'text-sky-500' },
                    { cat: 'Normal', bmi: '18.5–24.9', low: result.minHealthyKg, high: result.maxHealthyKg, color: 'text-emerald-500' },
                    { cat: 'Overweight', bmi: '25–29.9', low: result.maxHealthyKg, high: parseFloat((29.9 * result.heightM * result.heightM).toFixed(1)), color: 'text-amber-500' },
                    { cat: 'Obese', bmi: '30+', low: parseFloat((29.9 * result.heightM * result.heightM).toFixed(1)), high: parseFloat((40 * result.heightM * result.heightM).toFixed(1)), color: 'text-red-500' },
                  ].map((row, idx) => {
                    const displayLow = weightUnit === 'kg' ? row.low : row.low * 2.20462;
                    const displayHigh = weightUnit === 'kg' ? row.high : row.high * 2.20462;
                    const inCategory = currentKg >= row.low && (idx === 0 ? currentKg < result.minHealthyKg : currentKg <= row.high);
                    return (
                      <tr key={idx} className={`${inCategory ? 'bg-slate-900/5 font-black text-slate-900' : 'hover:bg-slate-50/55'} transition-colors duration-250`}>
                        <td className="px-6 py-3.5 font-bold">
                          {inCategory && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse inline-block mr-2"></span>}
                          <span className={row.color}>{row.cat}</span>
                        </td>
                        <td className="px-6 py-3.5 font-mono font-bold">{row.bmi}</td>
                        <td className="px-6 py-3.5 font-mono font-bold">
                          {idx === 0 ? `< ${displayHigh.toFixed(1)}` : idx === 3 ? `> ${row.low.toFixed(1)}` : `${displayLow.toFixed(1)} – ${displayHigh.toFixed(1)}`}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">{inCategory ? 'You are here' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                <i className="fas fa-lightbulb text-amber-500"></i>
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Personalized Insights</h4>
                <p className="text-xs text-slate-500 font-medium">What these numbers mean for you</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {result.recommendations.map((item, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-4 flex gap-3 shadow-sm hover:-translate-y-0.5 transition-all duration-350">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-650 font-black text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed pt-0.5">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">Calculation Methods</h3>
              <span className="text-[10px] text-slate-400 font-mono">6 standard formulas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Devine (1974)</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Male: 50 + 0.9 × (cm − 152.4)
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Female: 45.5 + 0.9 × (cm − 152.4)
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Most widely used clinical formula; original gentamicin dosing reference</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Robinson (1983)</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Male: 52 + 1.9 × (in − 60)
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Female: 49 + 1.7 × (in − 60)
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Modified Devine using height in inches; often yields lower values</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Miller (1983)</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Male: 56.2 + 1.41 × (in − 60)
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Female: 53.1 + 1.36 × (in − 60)
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Based on actuarial data from the Metropolitan Life Insurance tables</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Hamwi (1964)</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Male: 48 + 1.1 × (in − 60)
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Female: 45.5 + 1.0 × (in − 60)
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Simple rule-based formula; 100 lbs for 5 ft + 5 lbs per inch (male)</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Broca (1871)</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  IBW = Height (cm) − 100
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Classic French formula; originally for average frames, ±10% allowed</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">BMI-Based</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  IBW = 21.75 × Height (m)²
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Uses the midpoint of normal BMI (18.5–24.9) for an ideal target</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
