'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// WHO Classification Range Interface
interface BMICategory {
  name: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  advice: string[];
}

const WHO_CATEGORIES: BMICategory[] = [
  {
    name: 'Severe Underweight',
    min: 0,
    max: 16.0,
    color: '#3b82f6', // blue
    bgColor: 'bg-blue-50/50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    advice: [
      'Focus on nutrient-dense foods (nuts, seeds, lean protein, healthy fats).',
      'Consider speaking with a doctor or registered dietitian to evaluate nutritional needs.',
      'Incorporate strength training exercises to build healthy muscle mass.',
      'Eat smaller, more frequent meals if larger meals feel overwhelming.'
    ]
  },
  {
    name: 'Underweight',
    min: 16.0,
    max: 18.5,
    color: '#60a5fa', // light blue
    bgColor: 'bg-sky-50/50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-100',
    advice: [
      'Aim for a steady weight gain by adding 300–500 extra calories per day.',
      'Prioritize protein-rich foods and complex carbohydrates.',
      'Stay hydrated, but avoid drinking right before meals to maintain appetite.',
      'Consult a wellness professional to plan a safe, steady weight adjustment.'
    ]
  },
  {
    name: 'Normal Weight',
    min: 18.5,
    max: 25.0,
    color: '#10b981', // green
    bgColor: 'bg-emerald-50/50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-100',
    advice: [
      'Maintain your current healthy balance with a variety of whole foods.',
      'Aim for at least 150 minutes of moderate cardiovascular activity per week.',
      'Combine aerobic fitness with strength training twice a week.',
      'Ensure adequate sleep (7-9 hours) and keep stress levels managed.'
    ]
  },
  {
    name: 'Overweight',
    min: 25.0,
    max: 30.0,
    color: '#f59e0b', // orange
    bgColor: 'bg-amber-50/50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-100',
    advice: [
      'Focus on a moderate, sustainable calorie deficit (e.g., 200–500 kcal/day).',
      'Increase consumption of dietary fiber (vegetables, legumes, whole grains).',
      'Increase daily non-exercise activity (like walking more steps per day).',
      'Monitor portion sizes and limit processed foods with added sugars.'
    ]
  },
  {
    name: 'Obese (Class I)',
    min: 30.0,
    max: 35.0,
    color: '#ef4444', // red
    bgColor: 'bg-rose-50/50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-100',
    advice: [
      'Consider consulting a healthcare provider for personalized medical guidance.',
      'Focus on permanent lifestyle changes rather than quick restrictive diets.',
      'Incorporate low-impact activities (swimming, cycling, walking) to protect joints.',
      'Track meals and identify emotional or stress-related eating triggers.'
    ]
  },
  {
    name: 'Obese (Class II & III)',
    min: 35.0,
    max: 100.0,
    color: '#b91c1c', // dark red
    bgColor: 'bg-red-50/50',
    textColor: 'text-red-700',
    borderColor: 'border-red-100',
    advice: [
      'We strongly recommend discussing weight management plans with a medical professional.',
      'Prioritize cardiovascular health and joint protection with guided activity.',
      'Focus on small, highly consistent dietary and activity milestones.',
      'Address metabolic health metrics like blood pressure and insulin levels with your doctor.'
    ]
  }
];

// Helper to get active category details
const getCategory = (bmi: number): BMICategory => {
  return WHO_CATEGORIES.find((cat) => bmi >= cat.min && bmi < cat.max) || WHO_CATEGORIES[2];
};

// SVG arc coordinate helpers
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
};

interface CalculationResult {
  bmi: number;
  ponderalIndex: number;
  idealMinWeight: number;
  idealMaxWeight: number;
  weightDiff: number;
  idealWeightUnit: string;
  activeCategory: BMICategory;
  needleAngle: number;
}

export default function BMICalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [age, setAge] = useState<number>(30);

  // Metric States
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);

  // Imperial States
  const [weightLbs, setWeightLbs] = useState<number>(150);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);

  // Result and Interaction States
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Syncing state on toggle to keep approximate numbers
  const handleUnitToggle = (mode: 'metric' | 'imperial') => {
    if (mode === 'metric' && unitMode === 'imperial') {
      // Imperial -> Metric
      const totalInches = heightFt * 12 + heightIn;
      const calculatedCm = Math.round(totalInches * 2.54);
      const calculatedKg = Math.round(weightLbs * 0.45359237);
      setHeightCm(Math.max(50, Math.min(250, calculatedCm)));
      setWeightKg(Math.max(10, Math.min(250, calculatedKg)));
    } else if (mode === 'imperial' && unitMode === 'metric') {
      // Metric -> Imperial
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

  const computeBmiResult = (): CalculationResult => {
    let w = 70; // in kg
    let h = 1.70; // in meters
    let idealUnit = 'kg';

    if (unitMode === 'metric') {
      w = weightKg;
      h = heightCm / 100;
      idealUnit = 'kg';
    } else {
      const totalInches = heightFt * 12 + heightIn;
      w = weightLbs * 0.45359237;
      h = (totalInches * 2.54) / 100;
      idealUnit = 'lbs';
    }

    const calculatedBmi = h > 0 ? w / (h * h) : 0;
    const calculatedPi = h > 0 ? w / (h * h * h) : 0;

    let minW = 0;
    let maxW = 0;
    let diff = 0;

    if (unitMode === 'metric') {
      minW = 18.5 * (h * h);
      maxW = 24.9 * (h * h);
      if (calculatedBmi < 18.5) {
        diff = minW - weightKg;
      } else if (calculatedBmi >= 25.0) {
        diff = weightKg - maxW;
      }
    } else {
      const totalInches = heightFt * 12 + heightIn;
      minW = (18.5 * (totalInches * totalInches)) / 703;
      maxW = (24.9 * (totalInches * totalInches)) / 703;
      if (calculatedBmi < 18.5) {
        diff = minW - weightLbs;
      } else if (calculatedBmi >= 25.0) {
        diff = weightLbs - maxW;
      }
    }

    const finalBmi = parseFloat(calculatedBmi.toFixed(1));
    const activeCat = getCategory(finalBmi);

    // SVG needle angle mapping
    const minBmi = 10;
    const maxBmi = 40;
    const percentage = Math.min(1, Math.max(0, (finalBmi - minBmi) / (maxBmi - minBmi)));
    const angle = -90 + percentage * 180;

    return {
      bmi: finalBmi,
      ponderalIndex: parseFloat(calculatedPi.toFixed(2)),
      idealMinWeight: parseFloat(minW.toFixed(1)),
      idealMaxWeight: parseFloat(maxW.toFixed(1)),
      weightDiff: parseFloat(diff.toFixed(1)),
      idealWeightUnit: idealUnit,
      activeCategory: activeCat,
      needleAngle: angle
    };
  };

  // Live recalculate on any input changes (sliders or fields) once user has submitted first calculation
  useEffect(() => {
    if (hasCalculated) {
      setResult(computeBmiResult());
    }
  }, [unitMode, gender, age, weightKg, heightCm, weightLbs, heightFt, heightIn, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeBmiResult());
    setHasCalculated(true);

    // Trigger celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1a1a1a', '#10b981', '#3b82f6', '#f59e0b', '#ef4444']
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
    setResult(null);
    setHasCalculated(false);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Inputs Form */}
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="space-y-6">
          {/* Row 1: Unit System + Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              {/* Unit System Card */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Unit System</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('metric')}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      unitMode === 'metric'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Metric (kg/cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('imperial')}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      unitMode === 'imperial'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Imperial (lbs/ft-in)
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              {/* Height Card */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                {unitMode === 'metric' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Height</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Math.max(50, Math.min(250, parseInt(e.target.value) || 0)))}
                          className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">cm</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      step="1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <span>50 cm</span>
                      <span>150 cm</span>
                      <span>175 cm</span>
                      <span>250 cm</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Height</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={heightFt}
                            onChange={(e) => setHeightFt(Math.max(1, Math.min(8, parseInt(e.target.value) || 0)))}
                            className="w-12 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                          />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ft</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="11"
                            value={heightIn}
                            onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                            className="w-12 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                          />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">in</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="96"
                      step="1"
                      value={heightFt * 12 + heightIn}
                      onChange={(e) => {
                        const totalVal = parseInt(e.target.value);
                        setHeightFt(Math.floor(totalVal / 12));
                        setHeightIn(totalVal % 12);
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                      <span>2'0" (24")</span>
                      <span>5'0" (60")</span>
                      <span>6'0" (72")</span>
                      <span>8'0" (96")</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Gender + Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              {/* Gender Card */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Gender</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {(['female', 'male', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-[#1a1a1a] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {g === 'male' && <i className="fas fa-mars mr-1.5 text-[10px]"></i>}
                      {g === 'female' && <i className="fas fa-venus mr-1.5 text-[10px]"></i>}
                      {g === 'other' && <i className="fas fa-genderless mr-1.5 text-[10px]"></i>}
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              {/* Weight Card */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Weight</label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      value={unitMode === 'metric' ? weightKg : weightLbs}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 0);
                        if (unitMode === 'metric') {
                          setWeightKg(Math.min(500, val));
                        } else {
                          setWeightLbs(Math.min(1100, val));
                        }
                      }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{unitMode === 'metric' ? 'kg' : 'lbs'}</span>
                  </div>
                </div>
                {unitMode === 'metric' ? (
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                ) : (
                  <input
                    type="range"
                    min="20"
                    max="550"
                    step="1"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
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
            {/* Age Card */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Age</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Math.max(2, Math.min(120, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">yrs</span>
                </div>
              </div>
              <input
                type="range"
                min="2"
                max="120"
                step="1"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>2 yrs</span>
                <span>Adult (18+)</span>
                <span>Senior (65+)</span>
                <span>120 yrs</span>
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
            Calculate
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

      {/* Conditionally Rendered Results Block */}
      {result && (
        <div className="pt-8 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-xl font-extrabold text-slate-950 text-center tracking-tight font-display">
            Calculation Results
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column inside results: Visual SVG Gauge */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-150 p-6 rounded-3xl flex flex-col items-center justify-center space-y-4">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block self-start">
                Visual BMI Spectrum Gauge
              </span>

              <div className="w-full flex flex-col items-center pt-2">
                <svg width="100%" height="120" viewBox="0 0 200 110" className="max-w-[280px]">
                  {/* Arc tracks */}
                  {/* Underweight path */}
                  <path
                    d={describeArc(100, 100, 80, -90, -39)}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Normal range path */}
                  <path
                    d={describeArc(100, 100, 80, -37, 0)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="16"
                  />
                  {/* Overweight path */}
                  <path
                    d={describeArc(100, 100, 80, 2, 30)}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="16"
                  />
                  {/* Obese path */}
                  <path
                    d={describeArc(100, 100, 80, 32, 90)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />

                  {/* Grid markings */}
                  <text x="16" y="106" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">10</text>
                  <text x="56" y="32" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">18.5</text>
                  <text x="100" y="14" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">25</text>
                  <text x="144" y="32" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">30</text>
                  <text x="184" y="106" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle">40</text>

                  {/* Gauge Needle */}
                  <g transform={`rotate(${result.needleAngle} 100 100)`}>
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="28"
                      stroke="#1a1a1a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <polygon points="96,40 100,22 104,40" fill="#1a1a1a" />
                  </g>

                  {/* Pivot center */}
                  <circle cx="100" cy="100" r="8" fill="#1a1a1a" />
                  <circle cx="100" cy="100" r="3" fill="#ffffff" />
                </svg>

                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-5 text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-sky-400 mr-1.5"></span>&lt;18.5 Under</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-1.5"></span>18.5-25 Normal</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-amber-500 mr-1.5"></span>25-30 Over</span>
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-red-500 mr-1.5"></span>&gt;30 Obese</span>
                </div>
              </div>
            </div>

            {/* Right Column inside results: Black Result Panel */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Premium Black Result Card */}
              <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
                  <span className="text-[120px] font-black italic">BMI</span>
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="text-center pb-4 border-b border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Calculated BMI</span>
                    <div className="text-6xl font-black text-white font-mono tracking-tight">
                      {result.bmi}
                    </div>
                    <div className="mt-3.5 flex justify-center">
                      <span
                        className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase border shadow-sm"
                        style={{
                          backgroundColor: result.activeCategory.color + '20',
                          borderColor: result.activeCategory.color,
                          color: result.activeCategory.color
                        }}
                      >
                        {result.activeCategory.name}
                      </span>
                    </div>
                  </div>

                  {/* Metrics subgrid */}
                  <div className="grid grid-cols-2 gap-4 pt-2 text-left">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ideal Weight range</span>
                      <span className="font-mono font-black text-sm text-slate-100">
                        {result.idealMinWeight} - {result.idealMaxWeight} {result.idealWeightUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ponderal Index</span>
                      <span className="font-mono font-black text-sm text-slate-100">
                        {result.ponderalIndex} kg/m³
                      </span>
                    </div>
                  </div>

                  {/* Target statement advice */}
                  <div className="pt-3 border-t border-slate-800/80 text-xs text-left">
                    {result.bmi < 18.5 ? (
                      <p className="text-blue-300 font-medium">
                         You are below the recommended healthy weight range. To reach a normal BMI of 18.5, you need to gain approximately <strong className="text-white font-black font-mono">{result.weightDiff} {result.idealWeightUnit}</strong>.
                      </p>
                    ) : result.bmi >= 25.0 ? (
                      <p className="text-amber-300 font-medium">
                         You are above the recommended healthy weight range. To reach a normal BMI of 24.9, you need to lose approximately <strong className="text-white font-black font-mono">{result.weightDiff} {result.idealWeightUnit}</strong>.
                      </p>
                    ) : (
                      <p className="text-emerald-300 font-medium">
                         Congratulations! Your body weight is inside the medically recommended healthy range of 18.5 to 24.9 BMI. Keep up the excellent habit!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Health Suggestions Block */}
          <div className={`${result.activeCategory.bgColor} border ${result.activeCategory.borderColor} rounded-3xl p-6 md:p-8 space-y-4 text-left`}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                <i className="fas fa-heartbeat text-red-500 animate-pulse"></i>
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Personalized Wellness Advice</h4>
                <p className="text-xs text-slate-500 font-medium">Contextual suggestions based on your BMI category</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {result.activeCategory.advice.map((item, idx) => (
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

          {/* WHO Reference Table */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                WHO BMI Classifications Reference
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Standard Adult Reference</span>
            </div>
            
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[500px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">BMI Range</th>
                    <th className="px-6 py-3.5">Weight Designation</th>
                    <th className="px-6 py-3.5 text-center">Status Color Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {WHO_CATEGORIES.map((cat, idx) => {
                    const isCurrent = result.activeCategory.name === cat.name;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors duration-250 ${
                          isCurrent
                            ? 'bg-slate-900/5 font-black text-slate-900'
                            : 'hover:bg-slate-50/55'
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold">
                          {cat.min === 0
                            ? `< 16.0`
                            : cat.max === 100
                            ? `≥ 35.0`
                            : `${cat.min.toFixed(1)} - ${cat.max.toFixed(1)}`}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>
                          )}
                          {cat.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span
                              className="w-14 h-3.5 rounded-full border shadow-sm block"
                              style={{
                                backgroundColor: cat.color + '40',
                                borderColor: cat.color
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
