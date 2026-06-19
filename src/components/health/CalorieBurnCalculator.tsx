'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface FoodEquivalent {
  food: string;
  quantity: number;
  calories: number;
}

interface CalculationResult {
  caloriesBurned: number;
  met: number;
  fatBurned: number;
  caloriesPerMinute: number;
  timeToBurn: number;
  dailyGoalPercentage: number;
  foodEquivalents: FoodEquivalent[];
  explanation: string;
  activityName: string;
  activityDescription: string;
  adjustedMet: number;
  weightInKg: number;
  durationInHours: number;
}

const ACTIVITIES = [
  { group: 'Light Activities', items: [
    { value: 'walking_slow', label: 'Slow Walking', met: 2.5 },
    { value: 'cycling_light', label: 'Light Cycling', met: 4.0 },
    { value: 'swimming_light', label: 'Light Swimming', met: 4.5 },
    { value: 'yoga', label: 'Yoga', met: 2.5 },
    { value: 'stretching', label: 'Stretching', met: 2.3 }
  ]},
  { group: 'Moderate Activities', items: [
    { value: 'walking_brisk', label: 'Brisk Walking', met: 3.8 },
    { value: 'cycling_moderate', label: 'Moderate Cycling', met: 6.8 },
    { value: 'swimming_moderate', label: 'Moderate Swimming', met: 6.0 },
    { value: 'dancing', label: 'Dancing', met: 4.5 },
    { value: 'hiking', label: 'Hiking', met: 5.3 }
  ]},
  { group: 'Vigorous Activities', items: [
    { value: 'running', label: 'Running', met: 9.8 },
    { value: 'cycling_vigorous', label: 'Vigorous Cycling', met: 10.0 },
    { value: 'swimming_vigorous', label: 'Vigorous Swimming', met: 9.0 },
    { value: 'hiit', label: 'HIIT', met: 8.0 },
    { value: 'weightlifting', label: 'Weightlifting', met: 6.0 }
  ]}
];

const ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  walking_slow: "Low-impact activity great for beginners and recovery days.",
  cycling_light: "Excellent cardiovascular exercise that's easy on the joints.",
  swimming_light: "Full-body workout with minimal joint stress.",
  yoga: "Combines physical postures, breathing exercises, and meditation.",
  stretching: "Improves flexibility and helps prevent injuries.",
  walking_brisk: "Raises heart rate as effectively as jogging for cardiovascular health.",
  cycling_moderate: "Builds endurance and strengthens your lower body.",
  swimming_moderate: "Excellent way to build endurance and muscle tone.",
  dancing: "Fun way to improve coordination, balance, and cardiovascular health.",
  hiking: "Combines cardiovascular exercise with the mental benefits of nature.",
  running: "High-impact activity that burns significant calories.",
  cycling_vigorous: "Intense workout that builds strength and endurance.",
  swimming_vigorous: "Challenging workout building cardiovascular and muscular strength.",
  hiit: "Alternates between intense bursts of activity and fixed rest periods.",
  weightlifting: "Builds muscle mass, which can increase resting metabolic rate."
};

const FOOD_EQUIVALENTS = [
  { food: 'Apple', calories: 95 },
  { food: 'Banana', calories: 105 },
  { food: 'Slice of bread', calories: 80 },
  { food: 'Chocolate bar', calories: 230 },
  { food: 'Cheeseburger', calories: 300 },
  { food: 'Pizza slice', calories: 285 },
  { food: 'Can of soda', calories: 150 },
  { food: 'Cup of rice', calories: 200 },
  { food: 'Avocado', calories: 240 },
  { food: 'Donut', calories: 195 },
  { food: 'Glass of wine', calories: 125 },
  { food: 'Beer', calories: 155 },
  { food: 'Cookie', calories: 50 },
  { food: 'Egg', calories: 70 },
  { food: 'Cup of pasta', calories: 220 }
];

const getActivityName = (key: string): string => {
  for (const group of ACTIVITIES) {
    for (const item of group.items) {
      if (item.value === key) return item.label;
    }
  }
  return 'Exercise';
};

const getBaseMet = (key: string): number => {
  for (const group of ACTIVITIES) {
    for (const item of group.items) {
      if (item.value === key) return item.met;
    }
  }
  return 3.0;
};

const calculateBMR = (weightKg: number, heightCm: number, age: number, gender: string): number => {
  if (gender === 'male') return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  if (gender === 'female') return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
};

const getFoodEquivalents = (calories: number): FoodEquivalent[] => {
  const equivalents: FoodEquivalent[] = [];
  let remainingCalories = calories;
  const available = [...FOOD_EQUIVALENTS];
  while (equivalents.length < 3 && remainingCalories > 50 && available.length > 0) {
    const possible = available.filter(f => f.calories <= remainingCalories);
    if (possible.length === 0) break;
    const idx = Math.floor(Math.random() * possible.length);
    const selected = possible[idx];
    const qty = Math.max(1, Math.floor(remainingCalories / selected.calories));
    equivalents.push({ food: selected.food, quantity: qty, calories: qty * selected.calories });
    remainingCalories -= qty * selected.calories;
    available.splice(available.indexOf(selected), 1);
  }
  return equivalents;
};

const generateExplanation = (
  weight: number, weightUnit: string, duration: number, durationUnit: string,
  activity: string, caloriesBurned: number, age: number | null, heightCm: number | null,
  fitnessLevel: string
): string => {
  const name = getActivityName(activity);
  const desc = ACTIVITY_DESCRIPTIONS[activity] || '';
  let text = `Based on your weight of ${weight} ${weightUnit} and ${duration} ${durationUnit === 'min' ? 'minutes' : 'hours'} of ${name.toLowerCase()}, you burned approximately ${Math.round(caloriesBurned)} calories. ${desc}`;
  if (age || heightCm) text += ` Your personal metrics were factored in for greater accuracy.`;
  if (age) text += ` Age affects metabolic rate and has been considered.`;
  if (fitnessLevel !== 'intermediate') text += ` Your ${fitnessLevel} fitness level impacts how efficiently your body burns calories.`;
  if (age && heightCm) text += ` Your height and age were used to calculate a personalized metabolic rate.`;
  return text;
};

const getHeightInCm = (unit: string, cm: number, ft: number, inches: number): number => {
  if (unit === 'cm') return cm;
  if (unit === 'ft') return (ft * 12 + inches) * 2.54;
  return cm;
};

const computeResult = (
  weight: number, weightUnit: string, activity: string, duration: number, durationUnit: string,
  age: number | null, gender: string, heightUnit: string, heightCm: number, heightFt: number, heightInches: number, fitnessLevel: string,
  intensity: string, temperature: number | null, temperatureUnit: string
): CalculationResult | null => {
  if (!weight || weight <= 0 || !activity || !duration || duration <= 0) return null;

  const weightInKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
  const durationInHours = durationUnit === 'min' ? duration / 60 : duration;
  const heightInCm = getHeightInCm(heightUnit, heightCm, heightFt, heightInches);

  let met = getBaseMet(activity);

  // Fitness level adjustment
  if (fitnessLevel === 'beginner') met *= 0.85;
  else if (fitnessLevel === 'advanced') met *= 1.1;
  else if (fitnessLevel === 'athlete') met *= 1.2;

  // Age adjustment
  if (age && age > 40) {
    const ageFactor = 1 - ((age - 40) * 0.005);
    met *= Math.max(0.8, ageFactor);
  }

  // BMR-based adjustment
  if (age && heightInCm > 0 && gender) {
    const bmr = calculateBMR(weightInKg, heightInCm, age, gender);
    const avgBmr = weightInKg * 24;
    met *= bmr / avgBmr;
  }

  // Intensity adjustment
  if (intensity === 'low') met *= 0.85;
  else if (intensity === 'high') met *= 1.15;

  // Temperature adjustment
  if (temperature !== null) {
    let temp = temperature;
    if (temperatureUnit === 'f') temp = (temp - 32) * 5 / 9;
    if (temp < 10) met *= 1 + ((10 - temp) * 0.01);
    else if (temp > 25) met *= 1 + ((temp - 25) * 0.015);
  }

  const caloriesBurned = met * weightInKg * durationInHours;
  const caloriesPerMinute = durationInHours > 0 ? caloriesBurned / (durationInHours * 60) : 0;
  const adjustedMet = parseFloat(met.toFixed(1));

  return {
    caloriesBurned: Math.round(caloriesBurned),
    met: adjustedMet,
    fatBurned: Math.round(caloriesBurned / 7700 * 1000),
    caloriesPerMinute: parseFloat(caloriesPerMinute.toFixed(1)),
    timeToBurn: caloriesPerMinute > 0 ? Math.round(500 / caloriesPerMinute) : 0,
    dailyGoalPercentage: Math.round(durationInHours * 60 / 30 * 100),
    foodEquivalents: getFoodEquivalents(caloriesBurned),
    explanation: generateExplanation(weight, weightUnit, duration, durationUnit, activity, caloriesBurned, age, heightInCm, fitnessLevel),
    activityName: getActivityName(activity),
    activityDescription: ACTIVITY_DESCRIPTIONS[activity] || '',
    adjustedMet,
    weightInKg: parseFloat(weightInKg.toFixed(1)),
    durationInHours: parseFloat(durationInHours.toFixed(2))
  };
};

export default function CalorieBurnCalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [activity, setActivity] = useState<string>('running');
  const [duration, setDuration] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<'min' | 'hr'>('min');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>('female');
  const [heightUnit, setHeightUnit] = useState<string>('cm');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [fitnessLevel, setFitnessLevel] = useState<string>('intermediate');
  const [intensity, setIntensity] = useState<string>('moderate');
  const [temperature, setTemperature] = useState<string>('');
  const [temperatureUnit, setTemperatureUnit] = useState<'c' | 'f'>('c');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(
        weight, weightUnit, activity, duration, durationUnit,
        age, gender, heightUnit, heightCm, heightFt, heightIn, fitnessLevel, intensity,
        temperature ? parseFloat(temperature) : null, temperatureUnit
      ));
    }
  }, [weight, weightUnit, activity, duration, durationUnit, age, gender, heightUnit, heightCm, heightFt, heightIn, fitnessLevel, intensity, temperature, temperatureUnit, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(
      weight, weightUnit, activity, duration, durationUnit,
      age, gender, heightUnit, heightCm, heightFt, heightIn, fitnessLevel, intensity,
      temperature ? parseFloat(temperature) : null, temperatureUnit
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
    setActivity('running');
    setDuration(30);
    setDurationUnit('min');
    setShowAdvanced(false);
    setAge(30);
    setGender('female');
    setHeightUnit('cm');
    setHeightCm(170);
    setHeightFt(5);
    setHeightIn(7);
    setFitnessLevel('intermediate');
    setIntensity('moderate');
    setTemperature('');
    setTemperatureUnit('c');
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
                  onClick={() => { if (weightUnit === 'lb') { setWeight(Math.round(weight / 0.453592)); } setWeightUnit('kg'); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${weightUnit === 'kg' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => { if (weightUnit === 'kg') { setWeight(Math.round(weight * 0.453592)); } setWeightUnit('lb'); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${weightUnit === 'lb' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Duration Card */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Duration</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{durationUnit === 'min' ? 'min' : 'hr'}</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max={durationUnit === 'min' ? "180" : "6"}
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>{durationUnit === 'min' ? '1 min' : '0.5 hr'}</span>
                <span>{durationUnit === 'min' ? '45 min' : '2 hr'}</span>
                <span>{durationUnit === 'min' ? '90 min' : '4 hr'}</span>
                <span>{durationUnit === 'min' ? '180 min' : '6 hr'}</span>
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                <button
                  type="button"
                  onClick={() => { if (durationUnit === 'hr') setDuration(duration * 60); setDurationUnit('min'); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${durationUnit === 'min' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Minutes
                </button>
                <button
                  type="button"
                  onClick={() => { if (durationUnit === 'min') setDuration(Math.round(duration / 60)); setDurationUnit('hr'); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${durationUnit === 'hr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Hours
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 [&>div]:flex-1">
            {/* Activity Card */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Activity Type</label>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {ACTIVITIES.map((group) => (
                  <div key={group.group}>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5 ml-0.5">{group.group}</span>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setActivity(item.value)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activity === item.value
                              ? 'bg-[#1a1a1a] text-white shadow-sm'
                              : 'bg-white/60 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 border border-slate-200/50'
                          }`}
                        >
                          <span className="font-extrabold">{item.label}</span>
                          <span className={`float-right font-mono text-[10px] ${
                            activity === item.value ? 'text-white/60' : 'text-slate-400'
                          }`}>
                            {item.met} MET
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
            Advanced Options (Age, Gender, Height, Fitness, Intensity, Temperature)
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

              {/* Fitness Level */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Fitness Level</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                    { value: 'athlete', label: 'Athlete' }
                  ].map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFitnessLevel(f.value)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${
                        fitnessLevel === f.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Intensity</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {[
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' }
                  ].map((i) => (
                    <button
                      key={i.value}
                      type="button"
                      onClick={() => setIntensity(i.value)}
                      className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl capitalize transition-all cursor-pointer ${
                        intensity === i.value
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Temperature (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-24 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm font-black focus:outline-none"
                  />
                  <div className="flex bg-slate-200/50 p-0.5 rounded-xl border border-slate-200/30">
                    <button
                      type="button"
                      onClick={() => setTemperatureUnit('c')}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        temperatureUnit === 'c' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemperatureUnit('f')}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        temperatureUnit === 'f' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>
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
            Calculate Calories Burned
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
            Calorie Burn Results
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">BURN</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Primary: Calories Burned */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">
                  {result.activityName}
                </span>
                <div className="text-6xl font-black text-white font-mono tracking-tight">
                  {result.caloriesBurned}
                </div>
                <div className="text-lg font-bold text-slate-400">calories burned</div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800/80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">MET Value</span>
                  <span className="font-mono font-black text-lg text-white">{result.met}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Fat Burned</span>
                  <span className="font-mono font-black text-lg text-white">{result.fatBurned}g</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Cal/min</span>
                  <span className="font-mono font-black text-lg text-white">{result.caloriesPerMinute}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">500 cal in</span>
                  <span className="font-mono font-black text-lg text-white">{result.timeToBurn}min</span>
                </div>
              </div>

              {/* Food Equivalents */}
              {result.foodEquivalents.length > 0 && (
                <div className="pt-2 pb-4 border-b border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">
                    That&apos;s equivalent to
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.foodEquivalents.map((eq, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm">
                        <span className="font-black text-white">{eq.quantity}</span>
                        <span className="text-slate-300 font-medium">{eq.food}{eq.quantity > 1 ? 's' : ''}</span>
                        <span className="text-slate-500 font-mono text-[10px]">({eq.calories} cal)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="pt-2 text-left">
                <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          </div>

          {/* Activity Description */}
          {result.activityDescription && (
            <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                  <i className="fas fa-info-circle text-slate-600"></i>
                </span>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">About {result.activityName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{result.activityDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* MET Reference Table */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                MET Values Reference
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Metabolic Equivalent of Task</span>
            </div>

            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[500px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Activity</th>
                    <th className="px-6 py-3.5 text-center">MET Value</th>
                    <th className="px-6 py-3.5">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ACTIVITIES.map((group) =>
                    group.items.map((item, idx) => (
                      <tr key={item.value} className={`transition-colors duration-250 ${
                        activity === item.value ? 'bg-slate-900/5 font-black text-slate-900' : 'hover:bg-slate-50/55'
                      }`}>
                        <td className="px-6 py-3.5 font-bold flex items-center gap-2">
                          {activity === item.value && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>}
                          {item.label}
                        </td>
                        <td className="px-6 py-3.5 text-center font-mono font-bold">{item.met}</td>
                        <td className="px-6 py-3.5 text-slate-500">{group.group}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                Calculation Method
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">MET × Weight × Duration</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Calorie Burn Formula</span>
                <div className="font-mono text-sm font-bold text-slate-800 leading-relaxed">
                  Calories = MET × Weight(kg) × Duration(hr)
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Core formula used for all calorie burn estimates</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Personal Adjustment Factors</span>
                <ul className="text-[10px] text-slate-600 font-medium space-y-1 list-disc list-inside">
                  <li>Fitness: Beginner ×0.85, Advanced ×1.1, Athlete ×1.2</li>
                  <li>Age: −0.5%/yr after 40 (max 20%)</li>
                  <li>BMR: Individual / average metabolic ratio</li>
                  <li>Intensity: Low ×0.85, High ×1.15</li>
                  <li>Temperature: +1%/°C below 10°C, +1.5%/°C above 25°C</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
