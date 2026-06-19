'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface WeeklyProjection {
  week: number;
  weight: number;
}

interface CalculationResult {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  dailyDeficit: number;
  weeksToGoal: number;
  currentBmi: number;
  targetBmi: number;
  currentBmiCategory: string;
  targetBmiCategory: string;
  macros: { protein: number; carbs: number; fat: number };
  projection: WeeklyProjection[];
  recommendations: string[];
  currentWeight: number;
  targetWeight: number;
  weightUnit: string;
}

const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: '1.375', label: 'Light Activity', desc: 'Light exercise 1-3 days/week' },
  { value: '1.55', label: 'Moderate Activity', desc: 'Moderate exercise 3-5 days/week' },
  { value: '1.725', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { value: '1.9', label: 'Extra Active', desc: 'Very hard exercise, physical job' }
];

const METRIC_RATES = [
  { value: '0.25', label: 'Slow (0.25 kg/week)' },
  { value: '0.5', label: 'Moderate (0.5 kg/week)' },
  { value: '0.75', label: 'Fast (0.75 kg/week)' },
  { value: '1.0', label: 'Aggressive (1.0 kg/week)' }
];

const IMPERIAL_RATES = [
  { value: '0.5', label: 'Slow (0.5 lbs/week)' },
  { value: '1.0', label: 'Moderate (1.0 lbs/week)' },
  { value: '1.5', label: 'Fast (1.5 lbs/week)' },
  { value: '2.0', label: 'Aggressive (2.0 lbs/week)' }
];

const getBmiCategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const calculateBMR = (weightKg: number, heightCm: number, age: number, gender: string): number => {
  if (gender === 'male') return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
};

const computeResult = (
  unitMode: 'metric' | 'imperial',
  weightKg: number, weightLbs: number,
  targetWeightKg: number, targetWeightLbs: number,
  heightCm: number, heightFt: number, heightIn: number,
  age: number, gender: string, activityLevel: string, rate: string
): CalculationResult | null => {
  const w = weightKg;
  const h = heightCm;
  const targetW = targetWeightKg;

  if (targetW >= w) return null;

  const bmr = Math.round(calculateBMR(w, h, age, gender));
  const activityMultiplier = parseFloat(activityLevel);
  const maintenanceCalories = Math.round(bmr * activityMultiplier);

  const rateNum = parseFloat(rate);
  const weeklyDeficit = rateNum * 1100;
  const dailyDeficit = Math.round(weeklyDeficit / 7);
  let targetCalories = Math.round(maintenanceCalories - dailyDeficit);

  const minCalories = gender === 'male' ? 1500 : 1200;
  if (targetCalories < minCalories) targetCalories = minCalories;

  const totalToLose = w - targetW;
  const weeksToGoal = Math.ceil(totalToLose / rateNum);

  const heightInM = h / 100;
  const currentBmi = parseFloat((w / (heightInM * heightInM)).toFixed(1));
  const targetBmi = parseFloat((targetW / (heightInM * heightInM)).toFixed(1));

  const maxWeeks = Math.min(weeksToGoal, 52);
  const projection: WeeklyProjection[] = [];
  for (let i = 0; i <= maxWeeks; i++) {
    const projectedWeight = w - rateNum * i;
    if (projectedWeight <= targetW) {
      projection.push({ week: i, weight: parseFloat(targetW.toFixed(1)) });
      break;
    }
    projection.push({ week: i, weight: parseFloat(projectedWeight.toFixed(1)) });
  }
  if (projection.length <= maxWeeks && projection[projection.length - 1].weight > targetW) {
    projection.push({ week: projection.length, weight: parseFloat(targetW.toFixed(1)) });
  }

  const proteinG = Math.round((targetCalories * 0.30) / 4);
  const carbsG = Math.round((targetCalories * 0.40) / 4);
  const fatG = Math.round((targetCalories * 0.30) / 9);

  const recommendations: string[] = [];
  if (targetCalories <= minCalories) {
    recommendations.push('Your calorie target is at the minimum safe level — consult a healthcare provider before starting this plan.');
  }
  if (rateNum > 0.75) {
    recommendations.push('Consider a slower weight loss rate (0.25-0.5 kg/week) for more sustainable results and better muscle preservation.');
  }
  recommendations.push('Focus on creating a moderate calorie deficit through a combination of diet and exercise.');
  recommendations.push('Include strength training 2-3 times per week to preserve muscle mass during weight loss.');
  recommendations.push('Prioritize protein intake to support satiety and maintain lean body mass.');
  recommendations.push('Track your food intake consistently using a food diary or app for best results.');
  recommendations.push('Drink plenty of water throughout the day — aim for 2-3 liters daily.');
  recommendations.push('Get adequate sleep (7-9 hours per night) for optimal metabolic function and recovery.');
  recommendations.push('Be patient — sustainable weight loss takes time. Focus on building habits, not just reaching the number.');
  if (currentBmi >= 30) {
    recommendations.push('Consider consulting a registered dietitian or healthcare provider for personalized guidance.');
  }

  return {
    bmr, maintenanceCalories, targetCalories,
    dailyDeficit: maintenanceCalories - targetCalories,
    weeksToGoal, currentBmi, targetBmi,
    currentBmiCategory: getBmiCategory(currentBmi),
    targetBmiCategory: getBmiCategory(targetBmi),
    macros: { protein: proteinG, carbs: carbsG, fat: fatG },
    projection,
    recommendations,
    currentWeight: w,
    targetWeight: targetW,
    weightUnit: unitMode === 'metric' ? 'kg' : 'lbs'
  };
};

export default function WeightLossCalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('female');
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(80);
  const [weightLbs, setWeightLbs] = useState<number>(176);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(65);
  const [targetWeightLbs, setTargetWeightLbs] = useState<number>(143);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [activityLevel, setActivityLevel] = useState<string>('1.55');
  const [rate, setRate] = useState<string>('0.5');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [targetError, setTargetError] = useState<string>('');

  const currentWeight = unitMode === 'metric' ? weightKg : weightLbs;
  const weightUnit = unitMode === 'metric' ? 'kg' : 'lbs';
  const rates = unitMode === 'metric' ? METRIC_RATES : IMPERIAL_RATES;

  const handleUnitToggle = (mode: 'metric' | 'imperial') => {
    if (mode === 'metric' && unitMode === 'imperial') {
      const totalInches = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round(weightLbs * 0.45359237));
      setTargetWeightKg(Math.round(targetWeightLbs * 0.45359237));
    } else if (mode === 'imperial' && unitMode === 'metric') {
      const totalInches = heightCm / 2.54;
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg / 0.45359237));
      setTargetWeightLbs(Math.round(targetWeightKg / 0.45359237));
    }
    setUnitMode(mode);
  };

  const validateTarget = (val: number) => {
    const current = unitMode === 'metric' ? weightKg : weightLbs;
    if (val >= current) {
      setTargetError('Target weight must be less than current weight');
      return false;
    }
    if (val <= 0) {
      setTargetError('Please enter a valid target weight');
      return false;
    }
    setTargetError('');
    return true;
  };

  useEffect(() => {
    if (hasCalculated) {
      const targetValid = validateTarget(unitMode === 'metric' ? targetWeightKg : targetWeightLbs);
      if (!targetValid) { setResult(null); return; }
      setResult(computeResult(
        unitMode, weightKg, weightLbs, targetWeightKg, targetWeightLbs,
        heightCm, heightFt, heightIn, age, gender, activityLevel, rate
      ));
    }
  }, [unitMode, gender, age, weightKg, targetWeightKg, weightLbs, targetWeightLbs, heightCm, heightFt, heightIn, activityLevel, rate, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetValid = validateTarget(unitMode === 'metric' ? targetWeightKg : targetWeightLbs);
    if (!targetValid) return;
    setResult(computeResult(
      unitMode, weightKg, weightLbs, targetWeightKg, targetWeightLbs,
      heightCm, heightFt, heightIn, age, gender, activityLevel, rate
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
    setGender('female');
    setAge(30);
    setWeightKg(80);
    setWeightLbs(176);
    setTargetWeightKg(65);
    setTargetWeightLbs(143);
    setHeightCm(170);
    setHeightFt(5);
    setHeightIn(7);
    setActivityLevel('1.55');
    setRate('0.5');
    setResult(null);
    setHasCalculated(false);
    setTargetError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* Unit System */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Unit System</label>
            <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
              <button type="button" onClick={() => handleUnitToggle('metric')}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${unitMode === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Metric (kg/cm)</button>
              <button type="button" onClick={() => handleUnitToggle('imperial')}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${unitMode === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Imperial (lbs/ft-in)</button>
            </div>
          </div>

          {/* Height */}
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

          {/* Gender */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Gender</label>
            <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
              {['female', 'male'].map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${gender === g ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {g === 'male' && <i className="fas fa-mars mr-1.5 text-[10px]"></i>}
                  {g === 'female' && <i className="fas fa-venus mr-1.5 text-[10px]"></i>}
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Current Weight */}
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

          {/* Age */}
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

          {/* Target Weight */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Target Weight</label>
            <div className="flex items-center space-x-1.5">
              <input type="number" value={unitMode === 'metric' ? targetWeightKg : targetWeightLbs}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 0);
                  if (unitMode === 'metric') setTargetWeightKg(Math.min(500, val));
                  else setTargetWeightLbs(Math.min(1100, val));
                  if (hasCalculated) validateTarget(val);
                }}
                className="w-24 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{weightUnit}</span>
            </div>
            {targetError && <p className="text-xs font-bold text-red-500">{targetError}</p>}
            <p className="text-[10px] text-slate-400 font-medium">Set the weight you want to reach</p>
          </div>

          {/* Activity Level */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Activity Level</label>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map((level) => (
                <button key={level.value} type="button" onClick={() => setActivityLevel(level.value)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activityLevel === level.value ? 'bg-[#1a1a1a] text-white shadow-sm' : 'bg-slate-200/40 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'}`}>
                  <span className="block font-extrabold">{level.label}</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${activityLevel === level.value ? 'text-white/70' : 'text-slate-400'}`}>{level.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weight Loss Rate */}
          <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col gap-3 transition-all hover:border-slate-300">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Weekly Loss Rate</label>
            <div className="flex flex-col flex-1 gap-1.5">
              {rates.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setRate(opt.value)}
                  className={`w-full flex-1 text-left px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${rate === opt.value ? 'bg-[#1a1a1a] text-white shadow-sm' : 'bg-slate-200/40 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer">
            Calculate Weight Loss Plan
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
            Your Weight Loss Plan
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">⚖️</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* BMR + TDEE */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Basal Metabolic Rate (BMR)</span>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">{result.bmr}<span className="text-sm font-medium text-slate-400 ml-1">kcal</span></div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Energy at complete rest</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Total Daily Energy (TDEE)</span>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">{result.maintenanceCalories}<span className="text-sm font-medium text-slate-400 ml-1">kcal</span></div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">With activity adjustment</p>
                </div>
              </div>

              {/* Target Calories */}
              <div className="pt-2 pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Weight Loss Target</span>
                <div className="text-5xl font-black text-white font-mono tracking-tight">
                  {result.targetCalories}<span className="text-base font-medium text-slate-400 ml-1.5">kcal/day</span>
                </div>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border text-amber-400 border-amber-500/40 bg-amber-500/10">
                  -{result.dailyDeficit} kcal/day deficit
                </span>
              </div>

              {/* Timeline + BMI */}
              <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-800/80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Time to Goal</span>
                  <span className="font-mono font-black text-xl text-white">{result.weeksToGoal}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">{result.weeksToGoal === 1 ? 'week' : 'weeks'} ({(result.weeksToGoal / 4).toFixed(1)} months)</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Current BMI</span>
                  <span className="font-mono font-black text-xl text-white">{result.currentBmi}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">{result.currentBmiCategory}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Target BMI</span>
                  <span className="font-mono font-black text-xl text-white">{result.targetBmi}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">{result.targetBmiCategory}</span>
                </div>
              </div>

              {/* Weight Summary */}
              <div className="grid grid-cols-3 gap-3 pb-4 border-b border-slate-800/80">
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Current</span>
                  <span className="font-mono font-black text-base text-slate-100">{result.currentWeight} <span className="text-xs font-medium text-slate-400">{result.weightUnit}</span></span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Target</span>
                  <span className="font-mono font-black text-base text-slate-100">{result.targetWeight} <span className="text-xs font-medium text-slate-400">{result.weightUnit}</span></span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">To Lose</span>
                  <span className="font-mono font-black text-base text-amber-400">-{(result.currentWeight - result.targetWeight).toFixed(1)} <span className="text-xs font-medium text-slate-400">{result.weightUnit}</span></span>
                </div>
              </div>

              {/* Macros */}
              <div className="pt-2 text-left">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3 text-center">Recommended Macros</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block mb-1">Protein</span>
                    <div className="text-2xl font-black text-white font-mono">{result.macros.protein}<span className="text-xs font-medium text-slate-400 ml-0.5">g</span></div>
                    <span className="text-[10px] text-slate-500 font-medium">{Math.round(result.targetCalories * 0.30)} kcal</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block mb-1">Carbs</span>
                    <div className="text-2xl font-black text-white font-mono">{result.macros.carbs}<span className="text-xs font-medium text-slate-400 ml-0.5">g</span></div>
                    <span className="text-[10px] text-slate-500 font-medium">{Math.round(result.targetCalories * 0.40)} kcal</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-pink-400 font-extrabold uppercase tracking-wider block mb-1">Fat</span>
                    <div className="text-2xl font-black text-white font-mono">{result.macros.fat}<span className="text-xs font-medium text-slate-400 ml-0.5">g</span></div>
                    <span className="text-[10px] text-slate-500 font-medium">{Math.round(result.targetCalories * 0.30)} kcal</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                  <span>30% Protein</span><span>·</span><span>40% Carbs</span><span>·</span><span>30% Fat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Projection Table */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-calendar-alt text-slate-800 mr-2.5 text-sm"></i>
                Weekly Weight Projection
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{result.projection.length} {result.projection.length === 1 ? 'week' : 'weeks'}</span>
            </div>

            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner max-h-[400px] overflow-y-auto">
              <table className="w-full min-w-[400px] text-xs border-collapse text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Week</th>
                    <th className="px-6 py-3.5">Weight</th>
                    <th className="px-6 py-3.5">Lost This Week</th>
                    <th className="px-6 py-3.5">Total Lost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {result.projection.map((row, idx) => {
                    const weeklyLoss = idx === 0 ? 0 : parseFloat(((result.projection[idx - 1]?.weight || result.currentWeight) - row.weight).toFixed(1));
                    const totalLost = parseFloat((result.currentWeight - row.weight).toFixed(1));
                    return (
                      <tr key={idx} className={`hover:bg-slate-50/55 transition-colors duration-250 ${idx === result.projection.length - 1 ? 'bg-slate-900/5 font-black text-slate-900' : ''}`}>
                        <td className="px-6 py-3.5 font-bold">
                          {idx === 0 ? 'Start' : `Week ${row.week}`}
                          {idx === result.projection.length - 1 && idx > 0 && <span className="ml-2 text-xs text-emerald-500 font-black">GOAL</span>}
                        </td>
                        <td className="px-6 py-3.5 font-mono font-bold">{row.weight} {result.weightUnit}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-500">{idx === 0 ? '—' : `-${Math.abs(weeklyLoss).toFixed(1)} ${result.weightUnit}`}</td>
                        <td className={`px-6 py-3.5 font-mono font-bold ${totalLost > 0 ? 'text-amber-600' : ''}`}>{idx === 0 ? '—' : `-${totalLost.toFixed(1)} ${result.weightUnit}`}</td>
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
                <h4 className="text-base font-extrabold text-slate-900">Personalized Recommendations</h4>
                <p className="text-xs text-slate-500 font-medium">Tips for a successful weight loss journey</p>
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
              <span className="text-[10px] text-slate-400 font-mono">Mifflin-St Jeor + Deficit</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">BMR (Mifflin-St Jeor)</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Male: BMR = 10W + 6.25H − 5A + 5
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Female: BMR = 10W + 6.25H − 5A − 161
                </div>
                <p className="text-[10px] text-slate-500 font-medium">W = weight (kg), H = height (cm), A = age</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Deficit & Target</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  TDEE = BMR × Activity Multiplier
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Target = TDEE − (WeeklyRate × 1100 ÷ 7)
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Weekly loss (kg) × 1100 = weekly calorie deficit</p>
              </div>
            </div>
          </div>

          {/* Activity Level Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">Activity Level Reference</h3>
              <span className="text-[10px] text-slate-400 font-mono">TDEE Multiplier</span>
            </div>
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[500px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Level</th>
                    <th className="px-6 py-3.5">Multiplier</th>
                    <th className="px-6 py-3.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ACTIVITY_LEVELS.map((level, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/55 transition-colors duration-250 ${activityLevel === level.value ? 'bg-slate-900/5 font-black text-slate-900' : ''}`}>
                      <td className="px-6 py-4 font-bold flex items-center gap-2">
                        {activityLevel === level.value && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>}
                        {level.label}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">{level.value}</td>
                      <td className="px-6 py-4 text-slate-500">{level.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
