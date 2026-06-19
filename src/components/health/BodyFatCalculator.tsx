'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CalculationResult {
  bodyFatPercent: number;
  bodyFatCategory: string;
  bodyFatCategoryColor: string;
  fatMassKg: number;
  leanMassKg: number;
  fmi: number;
  bmi: number;
  bmiCategory: string;
  method: string;
  recommendations: string[];
  weightUnit: string;
  displayWeight: number;
}

const METHODS = [
  { value: 'navy', label: 'US Navy Method (Circumference)', desc: 'Uses neck, waist & hip measurements' },
  { value: 'bmi', label: 'BMI-Based Estimation', desc: 'Quick estimate using BMI, age & gender' }
];

const getBodyFatCategory = (bf: number, gender: string): { category: string; color: string } => {
  if (gender === 'male') {
    if (bf < 2) return { category: 'Essential', color: 'text-sky-500' };
    if (bf < 6) return { category: 'Essential', color: 'text-sky-500' };
    if (bf < 14) return { category: 'Athlete', color: 'text-emerald-500' };
    if (bf < 18) return { category: 'Fitness', color: 'text-green-500' };
    if (bf < 25) return { category: 'Acceptable', color: 'text-amber-500' };
    return { category: 'Obese', color: 'text-red-500' };
  }
  if (bf < 10) return { category: 'Essential', color: 'text-sky-500' };
  if (bf < 14) return { category: 'Essential', color: 'text-sky-500' };
  if (bf < 21) return { category: 'Athlete', color: 'text-emerald-500' };
  if (bf < 25) return { category: 'Fitness', color: 'text-green-500' };
  if (bf < 32) return { category: 'Acceptable', color: 'text-amber-500' };
  return { category: 'Obese', color: 'text-red-500' };
};

const getBmiCategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const navyMethod = (waistIn: number, neckIn: number, hipIn: number | null, heightIn: number, gender: string): number => {
  if (gender === 'male') {
    return 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  }
  const h = hipIn || waistIn;
  return 163.205 * Math.log10(waistIn + h - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
};

const bmiMethod = (bmi: number, age: number, gender: string): number => {
  const genderVal = gender === 'male' ? 1 : 0;
  return 1.20 * bmi + 0.23 * age - 10.8 * genderVal - 5.4;
};

const computeResult = (
  unitMode: 'metric' | 'imperial',
  weightKg: number, weightLbs: number,
  heightCm: number, heightFt: number, heightIn: number,
  age: number, gender: string,
  neckCm: number, neckIn: number,
  waistCm: number, waistIn: number,
  hipCm: number, hipIn: number,
  method: string
): CalculationResult | null => {
  const w = weightKg;
  const hCm = heightCm;
  const hIn = heightFt * 12 + heightIn;
  const hM = hCm / 100;
  const bmi = parseFloat((w / (hM * hM)).toFixed(1));

  let bf: number;
  if (method === 'navy') {
    const waist = unitMode === 'imperial' ? waistIn : waistCm / 2.54;
    const neck = unitMode === 'imperial' ? neckIn : neckCm / 2.54;
    const hip = unitMode === 'imperial' ? hipIn : hipCm / 2.54;
    const height = unitMode === 'imperial' ? hIn : hCm / 2.54;
    bf = navyMethod(waist, neck, gender === 'female' ? hip : null, height, gender);
  } else {
    bf = bmiMethod(bmi, age, gender);
  }

  bf = parseFloat(Math.max(1, Math.min(70, bf)).toFixed(1));

  const { category, color } = getBodyFatCategory(bf, gender);
  const fatMassKg = parseFloat((w * bf / 100).toFixed(1));
  const leanMassKg = parseFloat((w - fatMassKg).toFixed(1));
  const fmi = parseFloat((fatMassKg / (hM * hM)).toFixed(1));

  const recommendations: string[] = [];
  if (bf < 6 && gender === 'male') recommendations.push('Your body fat is very low (essential range). Ensure adequate caloric intake to maintain hormonal health and energy levels.');
  if (bf < 10 && gender === 'female') recommendations.push('Your body fat is in the essential range for women. Be cautious — extremely low body fat can affect menstrual health and bone density.');
  if (bf > 25 && gender === 'male') recommendations.push('Your body fat is in the acceptable or higher range. Consider a moderate calorie deficit and increased physical activity.');
  if (bf > 31 && gender === 'female') recommendations.push('Your body fat is elevated. A combination of strength training, cardio, and a moderate calorie deficit can help reduce it.');
  if (method === 'navy') recommendations.push('The US Navy Method is more accurate than BMI-based estimation for individuals who carry more muscle mass.');
  if (method === 'bmi') recommendations.push('BMI-based body fat is a quick estimate. For better accuracy, try the US Navy Method with circumference measurements.');
  recommendations.push('Strength training 3-4 times per week helps maintain lean mass and can improve body composition regardless of your goal.');
  if (bmi >= 25 && bf < 20) recommendations.push('Your BMI suggests overweight but body fat is moderate — you may have higher lean mass. Use body fat % rather than BMI to track progress.');
  recommendations.push('Track body fat measurements monthly (not daily) since meaningful changes take weeks to appear.');
  if (bf >= 25) recommendations.push('Pair this with our Weight Loss Calculator to create a structured plan, or use our Calorie Calculator to dial in your intake.');
  if (bf < 14 && gender === 'male') recommendations.push('If you are looking to gain muscle, check our Weight Gain Calculator for a structured surplus plan.');

  return {
    bodyFatPercent: bf,
    bodyFatCategory: category,
    bodyFatCategoryColor: color,
    fatMassKg,
    leanMassKg,
    fmi,
    bmi,
    bmiCategory: getBmiCategory(bmi),
    method: method === 'navy' ? 'US Navy Method' : 'BMI-Based Method',
    recommendations,
    weightUnit: unitMode === 'metric' ? 'kg' : 'lbs',
    displayWeight: unitMode === 'metric' ? weightKg : weightLbs
  };
};

export default function BodyFatCalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('male');
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [neckCm, setNeckCm] = useState<number>(38);
  const [neckIn, setNeckIn] = useState<number>(15);
  const [waistCm, setWaistCm] = useState<number>(85);
  const [waistIn, setWaistIn] = useState<number>(33.5);
  const [hipCm, setHipCm] = useState<number>(95);
  const [hipIn, setHipIn] = useState<number>(37);
  const [method, setMethod] = useState<string>('navy');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const weightUnit = unitMode === 'metric' ? 'kg' : 'lbs';
  const cmOrIn = unitMode === 'metric' ? 'cm' : 'in';

  const handleUnitToggle = (mode: 'metric' | 'imperial') => {
    if (mode === 'metric' && unitMode === 'imperial') {
      const totalInches = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round(weightLbs * 0.45359237));
      setNeckCm(Math.round(neckIn * 2.54));
      setWaistCm(Math.round(waistIn * 2.54));
      setHipCm(Math.round(hipIn * 2.54));
    } else if (mode === 'imperial' && unitMode === 'metric') {
      const totalInches = heightCm / 2.54;
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg / 0.45359237));
      setNeckIn(Math.round(neckCm / 2.54));
      setWaistIn(Math.round(waistCm / 2.54));
      setHipIn(Math.round(hipCm / 2.54));
    }
    setUnitMode(mode);
  };

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(
        unitMode, weightKg, weightLbs, heightCm, heightFt, heightIn,
        age, gender, neckCm, neckIn, waistCm, waistIn, hipCm, hipIn, method
      ));
    }
  }, [unitMode, gender, age, weightKg, weightLbs, heightCm, heightFt, heightIn, neckCm, neckIn, waistCm, waistIn, hipCm, hipIn, method, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(
      unitMode, weightKg, weightLbs, heightCm, heightFt, heightIn,
      age, gender, neckCm, neckIn, waistCm, waistIn, hipCm, hipIn, method
    ));
    setHasCalculated(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1a1a1a', '#ffffff', '#a1a1a1']
    });
  };

  const handleReset = () => {
    setUnitMode('metric');
    setGender('male');
    setAge(30);
    setWeightKg(70);
    setWeightLbs(154);
    setHeightCm(175);
    setHeightFt(5);
    setHeightIn(9);
    setNeckCm(38);
    setNeckIn(15);
    setWaistCm(85);
    setWaistIn(33.5);
    setHipCm(95);
    setHipIn(37);
    setMethod('navy');
    setResult(null);
    setHasCalculated(false);
  };

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
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Weight</label>
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

          {/* Row 3: Age + Neck */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Neck</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={unitMode === 'metric' ? neckCm : neckIn}
                      onChange={(e) => {
                        const val = Math.max(1, parseFloat(e.target.value) || 0);
                        if (unitMode === 'metric') setNeckCm(Math.min(80, val));
                        else setNeckIn(Math.min(32, val));
                      }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cmOrIn}</span>
                  </div>
                </div>
                <input type="range" min={unitMode === 'metric' ? 25 : 10} max={unitMode === 'metric' ? 80 : 32} step="0.5"
                  value={unitMode === 'metric' ? neckCm : neckIn}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (unitMode === 'metric') setNeckCm(val);
                    else setNeckIn(val);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>{unitMode === 'metric' ? '25 cm' : '10 in'}</span>
                  <span>{unitMode === 'metric' ? '55 cm' : '22 in'}</span>
                  <span>{unitMode === 'metric' ? '80 cm' : '32 in'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Calculation Method + Waist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col gap-3 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Calculation Method</label>
                <div className="flex flex-col flex-1 gap-1.5">
                  {METHODS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setMethod(opt.value)}
                      className={`w-full flex-1 text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${method === opt.value ? 'bg-[#1a1a1a] text-white shadow-sm' : 'bg-slate-200/40 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'}`}>
                      <span className="block font-extrabold">{opt.label}</span>
                      <span className={`block text-[10px] font-medium mt-0.5 ${method === opt.value ? 'text-white/70' : 'text-slate-400'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Waist</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={unitMode === 'metric' ? waistCm : waistIn}
                      onChange={(e) => {
                        const val = Math.max(1, parseFloat(e.target.value) || 0);
                        if (unitMode === 'metric') setWaistCm(Math.min(200, val));
                        else setWaistIn(Math.min(79, val));
                      }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cmOrIn}</span>
                  </div>
                </div>
                <input type="range" min={unitMode === 'metric' ? 50 : 20} max={unitMode === 'metric' ? 200 : 79} step="0.5"
                  value={unitMode === 'metric' ? waistCm : waistIn}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (unitMode === 'metric') setWaistCm(val);
                    else setWaistIn(val);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>{unitMode === 'metric' ? '50 cm' : '20 in'}</span>
                  <span>{unitMode === 'metric' ? '125 cm' : '49 in'}</span>
                  <span>{unitMode === 'metric' ? '200 cm' : '79 in'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hip Circumference (female only, full width) */}
          {gender === 'female' && (
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Hip</label>
                <div className="flex items-center space-x-1.5">
                  <input type="number" value={unitMode === 'metric' ? hipCm : hipIn}
                    onChange={(e) => {
                      const val = Math.max(1, parseFloat(e.target.value) || 0);
                      if (unitMode === 'metric') setHipCm(Math.min(200, val));
                      else setHipIn(Math.min(79, val));
                    }}
                    className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cmOrIn}</span>
                </div>
              </div>
              <input type="range" min={unitMode === 'metric' ? 50 : 20} max={unitMode === 'metric' ? 200 : 79} step="0.5"
                value={unitMode === 'metric' ? hipCm : hipIn}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (unitMode === 'metric') setHipCm(val);
                  else setHipIn(val);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>{unitMode === 'metric' ? '50 cm' : '20 in'}</span>
                <span>{unitMode === 'metric' ? '125 cm' : '49 in'}</span>
                <span>{unitMode === 'metric' ? '200 cm' : '79 in'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer">
            Calculate Body Fat
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
            Your Body Fat Analysis
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">%</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Body Fat Percentage */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Body Fat</span>
                <div className="text-6xl font-black text-white font-mono tracking-tight">
                  {result.bodyFatPercent}<span className="text-lg font-medium text-slate-400 ml-1">%</span>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${result.bodyFatCategoryColor}`}>
                  {result.bodyFatCategory}
                </span>
              </div>

              {/* Body Composition Grid */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800/80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Fat Mass</span>
                  <span className="font-mono font-black text-2xl text-white">{result.fatMassKg} <span className="text-xs font-medium text-slate-400">{weightUnit}</span></span>
                  <span className="text-[10px] text-slate-500 font-medium block">FMI: {result.fmi}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Lean Mass</span>
                  <span className="font-mono font-black text-2xl text-white">{result.leanMassKg} <span className="text-xs font-medium text-slate-400">{weightUnit}</span></span>
                  <span className="text-[10px] text-slate-500 font-medium block">Muscle, bone & water</span>
                </div>
              </div>

              {/* Method + BMI */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Method</span>
                  <span className="text-sm font-bold">{result.method}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">BMI</span>
                  <span className="font-mono font-black text-lg text-white">{result.bmi} <span className="text-xs font-medium text-slate-400">{result.bmiCategory}</span></span>
                </div>
              </div>

              {/* Composition Bar */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Body Composition</span>
                <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden flex">
                  <div className="h-full bg-amber-500 rounded-l-full transition-all duration-500" style={{ width: `${Math.min(result.bodyFatPercent, 100)}%` }}></div>
                  <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${Math.max(0, 100 - result.bodyFatPercent)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-mono mt-1.5">
                  <span className="text-amber-500 font-bold">{result.bodyFatPercent}% Fat</span>
                  <span className="font-bold text-slate-300">{(100 - result.bodyFatPercent).toFixed(1)}% Lean</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Fat Category Reference Table */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-tags text-slate-800 mr-2.5 text-sm"></i>
                Body Fat Category Reference ({gender === 'male' ? 'Male' : 'Female'})
              </h3>
            </div>
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[400px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Male Range</th>
                    <th className="px-6 py-3.5">Female Range</th>
                    <th className="px-6 py-3.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { cat: 'Essential', male: '2–5%', female: '10–13%', desc: 'Required for health', color: 'text-sky-500' },
                    { cat: 'Athlete', male: '6–13%', female: '14–20%', desc: 'Fit & lean', color: 'text-emerald-500' },
                    { cat: 'Fitness', male: '14–17%', female: '21–24%', desc: 'Good fitness level', color: 'text-green-500' },
                    { cat: 'Acceptable', male: '18–24%', female: '25–31%', desc: 'Average range', color: 'text-amber-500' },
                    { cat: 'Obese', male: '25%+', female: '32%+', desc: 'Excessive body fat', color: 'text-red-500' },
                  ].map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/55 transition-colors duration-250 ${result.bodyFatCategory === row.cat ? 'bg-slate-900/5 font-black text-slate-900' : ''}`}>
                      <td className="px-6 py-3.5 font-bold">
                        {result.bodyFatCategory === row.cat && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse inline-block mr-2"></span>}
                        <span className={row.color}>{row.cat}</span>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold">{row.male}</td>
                      <td className="px-6 py-3.5 font-mono font-bold">{row.female}</td>
                      <td className="px-6 py-3.5 text-slate-500">{row.desc}</td>
                    </tr>
                  ))}
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
                <h4 className="text-base font-extrabold text-slate-900">Personalized Recommendations</h4>
                <p className="text-xs text-slate-500 font-medium">Insights based on your body composition</p>
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
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">Calculation Method</h3>
              <span className="text-[10px] text-slate-400 font-mono">{result.method}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {method === 'navy' ? (
                <>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">US Navy (Male)</span>
                    <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                      BF% = 86.010 × log(W−N) − 70.041 × log(H) + 36.76
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">W = waist, N = neck, H = height (all in inches)</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">US Navy (Female)</span>
                    <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                      BF% = 163.205 × log(W+H−N) − 97.684 × log(H) − 78.387
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">W = waist, H = hip, N = neck, Ht = height (inches)</p>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2 md:col-span-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">BMI-Based Estimation</span>
                  <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                    BF% = 1.20 × BMI + 0.23 × Age − 10.8 × Gender − 5.4
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Gender = 1 (male), 0 (female)</p>
                </div>
              )}
            </div>
          </div>

          {/* Measurement Tips */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                <i className="fas fa-ruler text-slate-800"></i>
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">How to Measure</h4>
                <p className="text-xs text-slate-500 font-medium">For best results with the US Navy Method</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/80 border border-slate-100/60 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-extrabold text-slate-800 block mb-1">
                  <i className="fas fa-circle text-[6px] text-slate-400 align-middle mr-1.5"></i>Neck
                </span>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Measure just below the larynx (Adam&apos;s apple), with tape perpendicular to the neck&apos;s long axis.</p>
              </div>
              <div className="bg-white/80 border border-slate-100/60 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-extrabold text-slate-800 block mb-1">
                  <i className="fas fa-circle text-[6px] text-slate-400 align-middle mr-1.5"></i>Waist
                </span>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Measure at the level of the navel (belly button) for men, at the narrowest point for women.</p>
              </div>
              <div className="bg-white/80 border border-slate-100/60 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-extrabold text-slate-800 block mb-1">
                  <i className="fas fa-circle text-[6px] text-slate-400 align-middle mr-1.5"></i>Hip (Female)
                </span>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Measure at the widest point around the buttocks, keeping the tape parallel to the floor.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
