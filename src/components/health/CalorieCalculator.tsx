'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface MacroResult {
  calories: number;
  grams: number;
}

interface WeightProjection {
  currentWeight: number;
  projectedWeight: number;
  totalChange: number;
}

interface CalculationResult {
  bmr: number;
  maintenanceCalories: number;
  goalCalories: number;
  calorieChange: number;
  macros: {
    protein: MacroResult;
    carbs: MacroResult;
    fat: MacroResult;
  };
  weightProjection: WeightProjection | null;
  recommendations: string[];
  goal: string;
  rate: number;
}

const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: '1.375', label: 'Light Activity', desc: 'Light exercise 1-3 days/week' },
  { value: '1.55', label: 'Moderate Activity', desc: 'Moderate exercise 3-5 days/week' },
  { value: '1.725', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { value: '1.9', label: 'Extra Active', desc: 'Very hard exercise, physical job' }
];

const RATE_OPTIONS = [
  { value: '0.25', label: 'Slow (0.25 kg/week)' },
  { value: '0.5', label: 'Moderate (0.5 kg/week)' },
  { value: '0.75', label: 'Fast (0.75 kg/week)' },
  { value: '1.0', label: 'Aggressive (1.0 kg/week)' }
];

const calculateBMR = (weightKg: number, heightCm: number, age: number, gender: string): number => {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
};

const computeResult = (
  unitMode: 'metric' | 'imperial',
  weightKg: number,
  weightLbs: number,
  heightCm: number,
  heightFt: number,
  heightIn: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string,
  rate: string
): CalculationResult => {
  let w = weightKg;
  let h = heightCm;

  if (unitMode === 'imperial') {
    const totalInches = heightFt * 12 + heightIn;
    w = weightLbs * 0.45359237;
    h = totalInches * 2.54;
  }

  const bmr = Math.round(calculateBMR(w, h, age, gender));
  const activityMultiplier = parseFloat(activityLevel);
  const maintenanceCalories = Math.round(bmr * activityMultiplier);

  const rateNum = parseFloat(rate) || 0;
  let goalCalories = maintenanceCalories;
  let calorieChange = 0;

  if (goal === 'lose') {
    calorieChange = rateNum * 1100;
    goalCalories = Math.round(maintenanceCalories - calorieChange);
  } else if (goal === 'gain') {
    calorieChange = rateNum * 500;
    goalCalories = Math.round(maintenanceCalories + calorieChange);
  }

  const minCalories = gender === 'male' ? 1500 : 1200;
  if (goalCalories < minCalories) {
    goalCalories = minCalories;
  }

  const proteinCalories = Math.round(goalCalories * 0.30);
  const carbsCalories = Math.round(goalCalories * 0.40);
  const fatCalories = Math.round(goalCalories * 0.30);

  const macros = {
    protein: { calories: proteinCalories, grams: Math.round(proteinCalories / 4) },
    carbs: { calories: carbsCalories, grams: Math.round(carbsCalories / 4) },
    fat: { calories: fatCalories, grams: Math.round(fatCalories / 9) }
  };

  let weightProjection: WeightProjection | null = null;
  if (goal !== 'maintain') {
    const weeklyChange = goal === 'lose' ? -rateNum : rateNum;
    const projectedWeight = Math.max(w + weeklyChange * 12, 0);
    weightProjection = {
      currentWeight: parseFloat(w.toFixed(1)),
      projectedWeight: parseFloat(projectedWeight.toFixed(1)),
      totalChange: parseFloat((Math.abs(projectedWeight - w)).toFixed(1))
    };
  }

  const recommendations: string[] = [];
  if (goal === 'lose') {
    if (rateNum > 1) {
      recommendations.push('Consider a slower weight loss rate (0.5-1 kg/week) for sustainable results');
    }
    recommendations.push('Focus on creating a moderate calorie deficit through diet and exercise');
    recommendations.push('Include strength training to preserve muscle mass during weight loss');
  } else if (goal === 'gain') {
    if (rateNum > 0.5) {
      recommendations.push('Consider a slower weight gain rate (0.25-0.5 kg/week) for healthy muscle gain');
    }
    recommendations.push('Focus on nutrient-dense foods and strength training for lean muscle gain');
    recommendations.push('Ensure adequate protein intake to support muscle growth');
  } else {
    recommendations.push('Maintain your current eating and exercise habits for weight maintenance');
    recommendations.push('Focus on balanced nutrition and regular physical activity');
  }
  if (goalCalories <= minCalories) {
    recommendations.push('Your calorie target is at the minimum safe level - consult a healthcare provider');
  }
  recommendations.push('Track your food intake consistently for best results');
  recommendations.push('Drink plenty of water throughout the day');
  recommendations.push('Get adequate sleep (7-9 hours) for optimal metabolism');
  recommendations.push('Be patient - sustainable changes take time');

  return {
    bmr,
    maintenanceCalories,
    goalCalories,
    calorieChange: Math.round(calorieChange),
    macros,
    weightProjection,
    recommendations,
    goal,
    rate: rateNum
  };
};

export default function CalorieCalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('female');
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(150);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [activityLevel, setActivityLevel] = useState<string>('1.55');
  const [goal, setGoal] = useState<string>('lose');
  const [rate, setRate] = useState<string>('0.5');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const handleUnitToggle = (mode: 'metric' | 'imperial') => {
    if (mode === 'metric' && unitMode === 'imperial') {
      const totalInches = heightFt * 12 + heightIn;
      const calculatedCm = Math.round(totalInches * 2.54);
      const calculatedKg = Math.round(weightLbs * 0.45359237);
      setHeightCm(Math.max(50, Math.min(250, calculatedCm)));
      setWeightKg(Math.max(10, Math.min(250, calculatedKg)));
    } else if (mode === 'imperial' && unitMode === 'metric') {
      const totalInches = heightCm / 2.54;
      const calculatedFt = Math.floor(totalInches / 12);
      const calculatedIn = Math.round(totalInches % 12);
      const calculatedLbs = Math.round(weightKg / 0.45359237);
      setHeightFt(Math.max(1, Math.min(8, calculatedFt)));
      setHeightIn(Math.max(0, Math.min(11, calculatedIn)));
      setWeightLbs(Math.max(20, Math.min(550, calculatedLbs)));
    }
    setUnitMode(mode);
  };

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(
        unitMode, weightKg, weightLbs, heightCm, heightFt, heightIn,
        age, gender, activityLevel, goal, rate
      ));
    }
  }, [unitMode, gender, age, weightKg, heightCm, weightLbs, heightFt, heightIn, activityLevel, goal, rate, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(
      unitMode, weightKg, weightLbs, heightCm, heightFt, heightIn,
      age, gender, activityLevel, goal, rate
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
    setWeightKg(70);
    setHeightCm(170);
    setWeightLbs(150);
    setHeightFt(5);
    setHeightIn(7);
    setActivityLevel('1.55');
    setGoal('lose');
    setRate('0.5');
    setResult(null);
    setHasCalculated(false);
  };

  const currentWeight = unitMode === 'metric' ? weightKg : weightLbs;
  const weightUnit = unitMode === 'metric' ? 'kg' : 'lbs';

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Inputs Form */}
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
                          className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
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
                            className="w-12 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ft</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                            className="w-12 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">in</span>
                        </div>
                      </div>
                    </div>
                    <input type="range" min="24" max="96" step="1" value={heightFt * 12 + heightIn}
                      onChange={(e) => { const t = parseInt(e.target.value); setHeightFt(Math.floor(t / 12)); setHeightIn(t % 12); }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <span>2&apos;0&quot; (24&quot;)</span><span>5&apos;0&quot; (60&quot;)</span><span>6&apos;0&quot; (72&quot;)</span><span>8&apos;0&quot; (96&quot;)</span>
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
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Weight</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={unitMode === 'metric' ? weightKg : weightLbs}
                      onChange={(e) => { const val = Math.max(1, parseInt(e.target.value) || 0); if (unitMode === 'metric') setWeightKg(Math.min(500, val)); else setWeightLbs(Math.min(1100, val)); }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{unitMode === 'metric' ? 'kg' : 'lbs'}</span>
                  </div>
                </div>
                {unitMode === 'metric' ? (
                  <input type="range" min="10" max="250" step="1" value={weightKg} onChange={(e) => setWeightKg(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                ) : (
                  <input type="range" min="20" max="550" step="1" value={weightLbs} onChange={(e) => setWeightLbs(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                )}
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>{unitMode === 'metric' ? '10 kg' : '20 lbs'}</span>
                  <span>{unitMode === 'metric' ? '80 kg' : '150 lbs'}</span>
                  <span>{unitMode === 'metric' ? '160 kg' : '350 lbs'}</span>
                  <span>{unitMode === 'metric' ? '250 kg' : '550 lbs'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Age (full width) */}
          <div>
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

          {/* Row 4: Weight Goal + Activity Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col gap-3 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Weight Goal</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {[
                    { value: 'maintain', label: 'Maintain', icon: 'fas fa-equals' },
                    { value: 'lose', label: 'Lose', icon: 'fas fa-arrow-down' },
                    { value: 'gain', label: 'Gain', icon: 'fas fa-arrow-up' }
                  ].map((g) => (
                    <button key={g.value} type="button" onClick={() => setGoal(g.value)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${goal === g.value ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      <i className={`${g.icon} mr-1.5 text-[10px]`}></i>{g.label}
                    </button>
                  ))}
                </div>
                {goal !== 'maintain' && (
                  <div className="flex flex-col flex-1 gap-2.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">{goal === 'lose' ? 'Weight Loss' : 'Weight Gain'} Rate</label>
                    <div className="flex flex-col flex-1 gap-1.5">
                      {RATE_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setRate(opt.value)}
                          className={`w-full flex-1 text-left px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${rate === opt.value ? 'bg-[#1a1a1a] text-white shadow-sm' : 'bg-slate-200/40 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
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
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer"
          >
            Calculate Calories
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-8 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 hover:text-slate-800 transition-all duration-350 active:scale-95 text-sm cursor-pointer"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results Block */}
      {result && (
        <div className="pt-8 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-xl font-extrabold text-slate-950 text-center tracking-tight font-display">
            Your Daily Calorie & Nutrition Results
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">kcal</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* BMR and TDEE row */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Basal Metabolic Rate (BMR)</span>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {result.bmr}
                    <span className="text-sm font-medium text-slate-400 ml-1">kcal</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Energy at complete rest</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Total Daily Energy (TDEE)</span>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {result.maintenanceCalories}
                    <span className="text-sm font-medium text-slate-400 ml-1">kcal</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">With activity adjustment</p>
                </div>
              </div>

              {/* Goal Calories */}
              <div className="pt-2 pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">
                  {result.goal === 'lose' ? 'Weight Loss' : result.goal === 'gain' ? 'Weight Gain' : 'Maintenance'} Target
                </span>
                <div className="text-5xl font-black text-white font-mono tracking-tight">
                  {result.goalCalories}
                  <span className="text-base font-medium text-slate-400 ml-1.5">kcal/day</span>
                </div>
                {result.goal !== 'maintain' && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${
                    result.goal === 'lose' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                  }`}>
                    {result.goal === 'lose' ? '-' : '+'}{result.calorieChange} kcal/day adjustment
                  </span>
                )}
              </div>

              {/* Macronutrient Breakdown */}
              <div className="pt-2 text-left">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3 text-center">
                  Recommended Macronutrient Distribution
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block mb-1">Protein</span>
                    <div className="text-2xl font-black text-white font-mono">{result.macros.protein.grams}<span className="text-xs font-medium text-slate-400 ml-0.5">g</span></div>
                    <span className="text-[10px] text-slate-500 font-medium">{result.macros.protein.calories} kcal</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block mb-1">Carbs</span>
                    <div className="text-2xl font-black text-white font-mono">{result.macros.carbs.grams}<span className="text-xs font-medium text-slate-400 ml-0.5">g</span></div>
                    <span className="text-[10px] text-slate-500 font-medium">{result.macros.carbs.calories} kcal</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-pink-400 font-extrabold uppercase tracking-wider block mb-1">Fat</span>
                    <div className="text-2xl font-black text-white font-mono">{result.macros.fat.grams}<span className="text-xs font-medium text-slate-400 ml-0.5">g</span></div>
                    <span className="text-[10px] text-slate-500 font-medium">{result.macros.fat.calories} kcal</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                  <span>30% Protein</span>
                  <span>·</span>
                  <span>40% Carbs</span>
                  <span>·</span>
                  <span>30% Fat</span>
                </div>
              </div>

              {/* Weight Projection */}
              {result.weightProjection && (
                <div className="pt-4 border-t border-slate-800/80 text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2 text-center">
                    12-Week Weight Projection
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current</span>
                      <span className="font-mono font-black text-base text-slate-100">{result.weightProjection.currentWeight} <span className="text-xs font-medium text-slate-400">{weightUnit}</span></span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Projected</span>
                      <span className="font-mono font-black text-base text-slate-100">{result.weightProjection.projectedWeight} <span className="text-xs font-medium text-slate-400">{weightUnit}</span></span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Change</span>
                      <span className={`font-mono font-black text-base ${result.goal === 'lose' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {result.goal === 'lose' ? '-' : '+'}{result.weightProjection.totalChange} <span className="text-xs font-medium text-slate-400">{weightUnit}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Block */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                <i className="fas fa-lightbulb text-amber-500"></i>
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Personalized Recommendations</h4>
                <p className="text-xs text-slate-500 font-medium">Contextual suggestions based on your goals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {result.recommendations.map((item, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-4 flex gap-3 shadow-sm hover:-translate-y-0.5 transition-all duration-350">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-650 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed pt-0.5">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Macro Distribution Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                Macronutrient Reference Guide
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Standard 30/40/30 Split</span>
            </div>

            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[500px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Macronutrient</th>
                    <th className="px-6 py-3.5">Calories per Gram</th>
                    <th className="px-6 py-3.5 text-center">Recommended %</th>
                    <th className="px-6 py-3.5 text-center">Primary Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { name: 'Protein', color: '#3b82f6', calPerGram: 4, pct: '30%', role: 'Muscle repair, satiety, enzyme function' },
                    { name: 'Carbohydrates', color: '#f59e0b', calPerGram: 4, pct: '40%', role: 'Primary energy source, brain function' },
                    { name: 'Fat', color: '#ec4899', calPerGram: 9, pct: '30%', role: 'Hormone production, nutrient absorption' }
                  ].map((macro, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/55 transition-colors duration-250">
                      <td className="px-6 py-4 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: macro.color }}></span>
                        {macro.name}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">{macro.calPerGram} kcal/g</td>
                      <td className="px-6 py-4 text-center font-mono font-bold">{macro.pct}</td>
                      <td className="px-6 py-4 text-slate-500">{macro.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Level Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                Activity Level Reference
              </h3>
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
                    <tr key={idx} className={`hover:bg-slate-50/55 transition-colors duration-250 ${
                      activityLevel === level.value ? 'bg-slate-900/5 font-black text-slate-900' : ''
                    }`}>
                      <td className="px-6 py-4 font-bold flex items-center gap-2">
                        {activityLevel === level.value && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>
                        )}
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

          {/* Mifflin-St Jeor Formula */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                Mifflin-St Jeor Equation
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">BMR Calculation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600"><i className="fas fa-mars mr-1.5"></i>Male BMR</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  BMR = 10W + 6.25H − 5A + 5
                </div>
                <p className="text-[10px] text-slate-500 font-medium">W = weight (kg), H = height (cm), A = age (years)</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600"><i className="fas fa-venus mr-1.5"></i>Female BMR</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  BMR = 10W + 6.25H − 5A − 161
                </div>
                <p className="text-[10px] text-slate-500 font-medium">W = weight (kg), H = height (cm), A = age (years)</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">TDEE (Total Daily Energy Expenditure)</span>
              <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                TDEE = BMR × Activity Multiplier
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Multiply your BMR by the activity factor that matches your lifestyle</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
