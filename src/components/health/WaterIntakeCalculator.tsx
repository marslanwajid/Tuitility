'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CalculationResult {
  waterIntake: number;
  waterCups: number;
  waterOunces: number;
  morningCups: number;
  afternoonCups: number;
  eveningCups: number;
  isSpecialCase: boolean;
  specialMessage: string;
  tips: string[];
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light Activity', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate Activity', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'very', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { value: 'extra', label: 'Extra Active', desc: 'Very hard exercise, physical job' }
];

const CLIMATES = [
  { value: 'moderate', label: 'Moderate', desc: 'Temperate climate' },
  { value: 'hot', label: 'Hot/Dry', desc: 'Hot, arid conditions' },
  { value: 'humid', label: 'Hot/Humid', desc: 'Tropical or humid climate' },
  { value: 'cold', label: 'Cold', desc: 'Cold climate' }
];

const HYDRATION_TIPS = [
  'Start your day with a glass of water to kickstart hydration.',
  'Keep a reusable water bottle with you throughout the day.',
  'Set reminders on your phone to drink water regularly.',
  'Add natural flavors like lemon, cucumber, or berries to make water more appealing.',
  'Drink a glass of water before each meal to help with digestion.',
  'Consume water-rich foods like fruits and vegetables to supplement your hydration.'
];

const getHeightInCm = (unit: string, cm: number, ft: number, inches: number): number => {
  if (unit === 'cm') return cm;
  if (unit === 'ft') return (ft * 12 + inches) * 2.54;
  return cm;
};

const computeResult = (
  weight: number, weightUnit: string,
  age: number | null, gender: string,
  heightUnit: string, heightCm: number, heightFt: number, heightIn: number,
  activityLevel: string, climate: string,
  caffeine: string, alcohol: string,
  pregnancy: string, healthConditions: string
): CalculationResult => {
  const weightInKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
  const heightInCm = getHeightInCm(heightUnit, heightCm, heightFt, heightIn);
  const useAdvanced = age !== null && age > 0 && heightInCm > 0;

  let waterIntake: number;

  if (useAdvanced) {
    waterIntake = (weightInKg * 0.033) + (heightInCm * 0.0005) - (age * 0.005) + 1.5;

    if (gender === 'female') waterIntake *= 0.95;
  } else {
    waterIntake = weightInKg * 0.033;
  }

  const activityMultipliers: Record<string, number> = { sedentary: 1.0, light: 1.1, moderate: 1.2, very: 1.3, extra: 1.4 };
  waterIntake *= activityMultipliers[activityLevel] || 1.0;

  const climateMultipliers: Record<string, number> = { moderate: 1.0, hot: 1.2, humid: 1.3, cold: 0.95 };
  waterIntake *= climateMultipliers[climate] || 1.0;

  if (useAdvanced) {
    const caffeineAdjustments: Record<string, number> = { none: 0, low: 0.2, moderate: 0.4, high: 0.6 };
    waterIntake += caffeineAdjustments[caffeine] || 0;

    const alcoholAdjustments: Record<string, number> = { none: 0, light: 0.3, moderate: 0.6, heavy: 1.0 };
    waterIntake += alcoholAdjustments[alcohol] || 0;

    if (gender === 'female') {
      const pregnancyAdjustments: Record<string, number> = { no: 0, first: 0.3, second: 0.5, third: 0.7, breastfeeding: 1.0 };
      waterIntake += pregnancyAdjustments[pregnancy] || 0;
    }

    if (healthConditions === 'kidney') {
      return {
        waterIntake: 0,
        waterCups: 0,
        waterOunces: 0,
        morningCups: 0,
        afternoonCups: 0,
        eveningCups: 0,
        isSpecialCase: true,
        specialMessage: 'Consult your doctor',
        tips: ['For kidney issues, please consult with a healthcare professional for personalized water intake recommendations.', 'Excess water intake may strain kidney function in certain conditions.']
      };
    } else if (healthConditions === 'heart') {
      waterIntake *= 0.9;
    } else if (healthConditions === 'diabetes') {
      waterIntake *= 1.1;
    }
  }

  const cups = Math.round(waterIntake * 4.227);
  const ounces = Math.round(waterIntake * 33.814);

  let tips = [...HYDRATION_TIPS];
  if (healthConditions === 'heart') {
    tips.unshift('If you have a heart condition, consult your doctor before significantly changing water intake.');
  }
  if (healthConditions === 'diabetes') {
    tips.unshift('Staying hydrated helps manage blood sugar levels. Monitor your intake as recommended by your healthcare provider.');
  }
  if (caffeine !== 'none') {
    tips.push('Caffeine has a mild diuretic effect. Compensate by drinking extra water throughout the day.');
  }
  if (alcohol !== 'none') {
    tips.push('Alcohol dehydrates the body. Drink extra water when consuming alcoholic beverages.');
  }
  if (gender === 'female' && pregnancy !== 'no') {
    tips.unshift('Pregnancy and breastfeeding increase fluid needs. Follow your healthcare provider\'s specific recommendations.');
  }

  return {
    waterIntake: parseFloat(waterIntake.toFixed(2)),
    waterCups: cups,
    waterOunces: ounces,
    morningCups: Math.round(cups * 0.35),
    afternoonCups: Math.round(cups * 0.40),
    eveningCups: Math.round(cups * 0.25),
    isSpecialCase: false,
    specialMessage: '',
    tips
  };
};

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>('female');
  const [heightUnit, setHeightUnit] = useState<string>('cm');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [activityLevel, setActivityLevel] = useState<string>('light');
  const [climate, setClimate] = useState<string>('moderate');
  const [caffeine, setCaffeine] = useState<string>('none');
  const [alcohol, setAlcohol] = useState<string>('none');
  const [pregnancy, setPregnancy] = useState<string>('no');
  const [healthConditions, setHealthConditions] = useState<string>('none');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(
        weight, weightUnit,
        showAdvanced ? age : null, showAdvanced ? gender : 'female',
        heightUnit, heightCm, heightFt, heightIn,
        activityLevel, climate,
        showAdvanced ? caffeine : 'none', showAdvanced ? alcohol : 'none',
        showAdvanced ? pregnancy : 'no', showAdvanced ? healthConditions : 'none'
      ));
    }
  }, [weight, weightUnit, age, gender, heightUnit, heightCm, heightFt, heightIn, activityLevel, climate, caffeine, alcohol, pregnancy, healthConditions, showAdvanced, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(
      weight, weightUnit,
      showAdvanced ? age : null, showAdvanced ? gender : 'female',
      heightUnit, heightCm, heightFt, heightIn,
      activityLevel, climate,
      showAdvanced ? caffeine : 'none', showAdvanced ? alcohol : 'none',
      showAdvanced ? pregnancy : 'no', showAdvanced ? healthConditions : 'none'
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
    setWeight(70);
    setWeightUnit('kg');
    setShowAdvanced(false);
    setAge(30);
    setGender('female');
    setHeightUnit('cm');
    setHeightCm(170);
    setHeightFt(5);
    setHeightIn(7);
    setActivityLevel('light');
    setClimate('moderate');
    setCaffeine('none');
    setAlcohol('none');
    setPregnancy('no');
    setHealthConditions('none');
    setResult(null);
    setHasCalculated(false);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="flex flex-col gap-6 [&>div]:flex-1">

            {/* Weight Card */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Weight</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{weightUnit}</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="1"
                value={weightUnit === 'kg' ? weight : Math.round(weight / 0.453592)}
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>10 kg</span>
                <span>80 kg</span>
                <span>160 kg</span>
                <span>250 kg</span>
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                <button
                  type="button"
                  onClick={() => { if (weightUnit === 'lb') setWeight(Math.round(weight / 0.453592)); setWeightUnit('kg'); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${weightUnit === 'kg' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => { if (weightUnit === 'kg') setWeight(Math.round(weight * 0.453592)); setWeightUnit('lb'); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${weightUnit === 'lb' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Activity Level Card */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Activity Level</label>
              <div className="space-y-1">
                {ACTIVITY_LEVELS.map((al) => (
                  <button
                    key={al.value}
                    type="button"
                    onClick={() => setActivityLevel(al.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activityLevel === al.value
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'bg-white/60 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 border border-slate-200/50'
                    }`}
                  >
                    <span className="font-extrabold">{al.label}</span>
                    <span className={`float-right text-[10px] ${
                      activityLevel === al.value ? 'text-white/60' : 'text-slate-400'
                    }`}>{al.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 [&>div]:flex-1">

            {/* Climate Card */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Climate</label>
              <div className="space-y-1">
                {CLIMATES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setClimate(c.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      climate === c.value
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'bg-white/60 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 border border-slate-200/50'
                    }`}
                  >
                    <span className="font-extrabold">{c.label}</span>
                    <span className={`float-right text-[10px] ${
                      climate === c.value ? 'text-white/60' : 'text-slate-400'
                    }`}>{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2 transition-all hover:border-slate-300">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Quick Info</span>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                The general recommendation is 8 glasses (64 oz) per day, but individual needs vary based on weight, activity level, climate, and health factors.
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Use the Advanced Factors below for a more personalized calculation.
              </p>
            </div>

          </div>

        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <i className={`fas fa-chevron-${showAdvanced ? 'down' : 'right'} text-[10px]`}></i>
            Advanced Factors (Age, Gender, Height, Caffeine, Alcohol, Health)
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-fade-in-up">

              {/* Age + Gender */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Age & Gender</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Math.max(1, Math.min(120, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">yrs</span>
                  <div className="flex bg-slate-200/50 p-0.5 rounded-xl border border-slate-200/30 ml-auto">
                    {['female', 'male'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`px-3 py-1.5 text-xs font-extrabold rounded-lg capitalize transition-all cursor-pointer ${
                          gender === g ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {g === 'male' ? <i className="fas fa-mars mr-1"></i> : <i className="fas fa-venus mr-1"></i>}
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Height */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Height</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30 mb-2">
                  <button type="button" onClick={() => setHeightUnit('cm')}
                    className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${heightUnit === 'cm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>cm</button>
                  <button type="button" onClick={() => setHeightUnit('ft')}
                    className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${heightUnit === 'ft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>ft/in</button>
                </div>
                {heightUnit === 'ft' ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={heightFt} onChange={(e) => setHeightFt(Math.max(1, Math.min(8, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">ft</span>
                    <input type="number" value={heightIn} onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">in</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input type="number" value={heightCm} onChange={(e) => setHeightCm(Math.max(50, Math.min(250, parseInt(e.target.value) || 0)))}
                      className="w-20 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">cm</span>
                  </div>
                )}
              </div>

              {/* Caffeine */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Caffeine Intake</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' }
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCaffeine(c.value)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${
                        caffeine === c.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium block">
                  {caffeine === 'none' ? 'No caffeine' :
                   caffeine === 'low' ? '1-2 cups/day' :
                   caffeine === 'moderate' ? '3-4 cups/day' :
                   '5+ cups/day'}
                </span>
              </div>

              {/* Alcohol */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Alcohol Intake</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'light', label: 'Light' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'heavy', label: 'Heavy' }
                  ].map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAlcohol(a.value)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${
                        alcohol === a.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium block">
                  {alcohol === 'none' ? 'No alcohol' :
                   alcohol === 'light' ? '1-2 drinks/week' :
                   alcohol === 'moderate' ? '3-7 drinks/week' :
                   '8+ drinks/week'}
                </span>
              </div>

              {/* Pregnancy + Health Conditions */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Pregnancy / Breastfeeding</label>
                <select
                  value={pregnancy}
                  onChange={(e) => setPregnancy(e.target.value)}
                  disabled={gender === 'male'}
                  className={`w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-400 ${
                    gender === 'male' ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="no">Not pregnant</option>
                  <option value="first">First Trimester</option>
                  <option value="second">Second Trimester</option>
                  <option value="third">Third Trimester</option>
                  <option value="breastfeeding">Breastfeeding</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Health Conditions</label>
                <select
                  value={healthConditions}
                  onChange={(e) => setHealthConditions(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-400"
                >
                  <option value="none">None</option>
                  <option value="kidney">Kidney Issues</option>
                  <option value="heart">Heart Conditions</option>
                  <option value="diabetes">Diabetes</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer"
          >
            Calculate Water Intake
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

      {/* Results */}
      {result && (
        <div className="pt-8 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-xl font-extrabold text-slate-950 text-center tracking-tight font-display">
            Water Intake Recommendations
          </h3>

          {result.isSpecialCase ? (
            <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 text-center shadow-lg">
              <div className="text-2xl font-black mb-4">⚠️</div>
              <div className="text-2xl font-black mb-2">{result.specialMessage}</div>
              <p className="text-sm text-slate-300">{result.tips[0]}</p>
            </div>
          ) : (
            <>
              {/* Premium Black Result Card */}
              <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
                  <span className="text-[120px] font-black italic">H₂O</span>
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Primary: Liters */}
                  <div className="pb-6 border-b border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">
                      Daily Water Intake
                    </span>
                    <div className="text-6xl font-black text-white font-mono tracking-tight">
                      {result.waterIntake}
                    </div>
                    <div className="text-lg font-bold text-slate-400">liters</div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800/80">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">In Cups</span>
                      <span className="font-mono font-black text-lg text-white">{result.waterCups}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">In Ounces</span>
                      <span className="font-mono font-black text-lg text-white">{result.waterOunces} oz</span>
                    </div>
                  </div>

                  {/* Daily Schedule */}
                  <div className="pt-2 space-y-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Daily Hydration Schedule
                    </span>

                    <div className="space-y-3">
                      <div className="text-left">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-white">Morning (6 AM - 12 PM)</span>
                          <span className="font-mono text-slate-300">{result.morningCups} cups</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white/80 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-white">Afternoon (12 PM - 6 PM)</span>
                          <span className="font-mono text-slate-300">{result.afternoonCups} cups</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white/80 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-white">Evening (6 PM - 12 AM)</span>
                          <span className="font-mono text-slate-300">{result.eveningCups} cups</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-white/80 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hydration Tips */}
              <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
                  <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                    <i className="fas fa-lightbulb text-slate-600"></i>
                  </span>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Hydration Tips</h4>
                    <p className="text-xs text-slate-500 font-medium">Personalized recommendations</p>
                  </div>
                </div>
                <ul className="space-y-2 text-left">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1.5 shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
