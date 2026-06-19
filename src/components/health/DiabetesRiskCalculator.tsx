'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface FactorScore {
  factor: string;
  value: string;
  points: number;
  maxPoints: number;
}

interface CalculationResult {
  totalScore: number;
  category: string;
  categoryKey: string;
  categoryIndex: number;
  probability: string;
  probabilityPercent: number;
  bmi: number;
  bmiCategory: { name: string; color: string };
  riskFactors: FactorScore[];
  recommendations: Recommendation[];
}

interface Recommendation {
  type: string;
  title: string;
  content?: string;
  subtitle?: string;
  items?: string[];
  note?: string;
}

const CATEGORIES = [
  { key: 'low', label: 'Low', range: '0–6', prob: '1 in 100', pct: 1, color: 'text-emerald-400', bg: 'bg-emerald-500', desc: 'Low probability. Maintain healthy habits and retest every 3–5 years.' },
  { key: 'slightlyElevated', label: 'Slightly Elevated', range: '7–11', prob: '1 in 25', pct: 4, color: 'text-amber-400', bg: 'bg-amber-500', desc: 'Slightly above average. Consider lifestyle improvements and annual check-ups.' },
  { key: 'moderate', label: 'Moderate', range: '12–14', prob: '1 in 6', pct: 17, color: 'text-orange-400', bg: 'bg-orange-500', desc: 'Moderate probability. Discuss blood glucose testing with your doctor.' },
  { key: 'high', label: 'High', range: '15–20', prob: '1 in 3', pct: 33, color: 'text-red-400', bg: 'bg-red-500', desc: 'High probability. Schedule a medical evaluation and blood glucose test soon.' },
  { key: 'veryHigh', label: 'Very High', range: '21+', prob: '1 in 2', pct: 50, color: 'text-purple-400', bg: 'bg-purple-500', desc: 'Very high probability. See your healthcare provider as soon as possible.' },
];

const getAgeScore = (age: number): number => {
  if (age < 45) return 0;
  if (age <= 54) return 2;
  if (age <= 64) return 3;
  return 4;
};

const getAgeLabel = (age: number): string => {
  if (age < 45) return 'Under 45';
  if (age <= 54) return '45–54';
  if (age <= 64) return '55–64';
  return '65 or older';
};

const calculateBMI = (heightCm: number, weightKg: number): number => {
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
};

const getBmiScore = (bmi: number): number => {
  if (bmi < 25) return 0;
  if (bmi <= 30) return 1;
  return 3;
};

const getBmiCategory = (bmi: number): { name: string; color: string } => {
  if (bmi < 18.5) return { name: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { name: 'Normal', color: '#2ecc71' };
  if (bmi < 30) return { name: 'Overweight', color: '#f1c40f' };
  return { name: 'Obese', color: '#e74c3c' };
};

const getBmiLabel = (bmi: number): string => {
  return `BMI ${bmi.toFixed(1)} (${getBmiCategory(bmi).name})`;
};

const getWaistOptions = (gender: string, unitMode: 'metric' | 'imperial') => {
  if (gender === 'male') {
    return unitMode === 'metric'
      ? [
          { value: '0', label: '\u2264 94 cm', pts: 0 },
          { value: '3', label: '94\u2013102 cm', pts: 3 },
          { value: '4', label: '> 102 cm', pts: 4 },
        ]
      : [
          { value: '0', label: '\u2264 37 in', pts: 0 },
          { value: '3', label: '37\u201340 in', pts: 3 },
          { value: '4', label: '> 40 in', pts: 4 },
        ];
  }
  return unitMode === 'metric'
    ? [
        { value: '0', label: '\u2264 80 cm', pts: 0 },
        { value: '3', label: '80\u201388 cm', pts: 3 },
        { value: '4', label: '> 88 cm', pts: 4 },
      ]
    : [
        { value: '0', label: '\u2264 31 in', pts: 0 },
        { value: '3', label: '31\u201335 in', pts: 3 },
        { value: '4', label: '> 35 in', pts: 4 },
      ];
};

const getWaistLabel = (val: string, gender: string, unitMode: 'metric' | 'imperial'): string => {
  const opts = getWaistOptions(gender, unitMode);
  const found = opts.find(o => o.value === val);
  return found ? found.label : val;
};

const computeResult = (
  unitMode: 'metric' | 'imperial',
  gender: string,
  age: number,
  heightCm: number,
  weightKg: number,
  waist: string,
  physicalActivity: string,
  diet: string,
  medication: string,
  bloodGlucose: string,
  familyHistory: string,
  gestationalDiabetes: string
): CalculationResult => {
  const bmi = calculateBMI(heightCm, weightKg);
  const bmiCat = getBmiCategory(bmi);
  const factors: FactorScore[] = [];

  const agePts = getAgeScore(age);
  factors.push({ factor: 'Age', value: getAgeLabel(age), points: agePts, maxPoints: 4 });

  const genderPts = gender === 'male' ? 1 : 0;
  factors.push({ factor: 'Gender', value: gender === 'male' ? 'Male' : 'Female', points: genderPts, maxPoints: 1 });

  const bmiPts = getBmiScore(bmi);
  factors.push({ factor: 'BMI', value: getBmiLabel(bmi), points: bmiPts, maxPoints: 3 });

  const waistPts = parseInt(waist);
  factors.push({ factor: 'Waist Circumference', value: getWaistLabel(waist, gender, unitMode), points: waistPts, maxPoints: 4 });

  const actPts = physicalActivity === '2' ? 2 : 0;
  factors.push({ factor: 'Physical Activity', value: physicalActivity === '2' ? 'Little or no exercise' : 'Regular exercise', points: actPts, maxPoints: 2 });

  const dietPts = diet === '2' ? 2 : 0;
  factors.push({ factor: 'Diet', value: diet === '2' ? 'Poor diet' : 'Healthy diet', points: dietPts, maxPoints: 2 });

  const medPts = medication === '2' ? 2 : 0;
  factors.push({ factor: 'Blood Pressure Medication', value: medication === '2' ? 'Taking medication' : 'No medication', points: medPts, maxPoints: 2 });

  const glucPts = bloodGlucose === '5' ? 5 : 0;
  factors.push({ factor: 'Blood Glucose', value: bloodGlucose === '5' ? 'High (\u2265 100 mg/dL)' : 'Normal (< 100 mg/dL)', points: glucPts, maxPoints: 5 });

  const famPts = familyHistory === '5' ? 5 : 0;
  factors.push({ factor: 'Family History', value: familyHistory === '5' ? 'Family history of diabetes' : 'No family history', points: famPts, maxPoints: 5 });

  if (gender === 'female') {
    const gdPts = gestationalDiabetes === '1' ? 1 : 0;
    factors.push({ factor: 'Gestational Diabetes', value: gestationalDiabetes === '1' ? 'Yes' : 'No', points: gdPts, maxPoints: 1 });
  }

  const totalScore = factors.reduce((sum, f) => sum + f.points, 0);

  let categoryIndex = 0;
  if (totalScore >= 21) categoryIndex = 4;
  else if (totalScore >= 15) categoryIndex = 3;
  else if (totalScore >= 12) categoryIndex = 2;
  else if (totalScore >= 7) categoryIndex = 1;

  const cat = CATEGORIES[categoryIndex];

  const recommendations: Recommendation[] = [];

  recommendations.push({
    type: 'general',
    title: `Your diabetes risk level is ${cat.label}`,
    content: `Your calculated BMI is ${bmi.toFixed(1)} kg/m\u00B2 (${bmiCat.name}).`
  });

  if (totalScore < 7) {
    recommendations.push({
      type: 'low-risk',
      title: 'Your risk of developing type 2 diabetes is low.',
      subtitle: 'To maintain your low risk:',
      items: [
        'Continue your healthy lifestyle habits',
        'Maintain a healthy weight',
        'Stay physically active with at least 30 minutes of activity daily',
        'Keep eating a balanced diet rich in fruits and vegetables'
      ],
      note: 'Consider rechecking your risk every 5 years, or sooner if your health status changes.'
    });
  } else if (totalScore <= 11) {
    recommendations.push({
      type: 'slightly-elevated',
      title: 'Your risk of developing type 2 diabetes is slightly elevated.',
      subtitle: 'Consider these steps:',
      items: [
        'Aim to lose 5\u20137% of your body weight if overweight',
        'Increase physical activity to at least 150 minutes per week',
        'Reduce intake of processed foods and sugary beverages',
        'Increase consumption of whole grains, lean proteins, and vegetables'
      ],
      note: 'Consider discussing your risk with a healthcare provider during your next visit.'
    });
  } else if (totalScore <= 14) {
    recommendations.push({
      type: 'moderate',
      title: 'Your risk of developing type 2 diabetes is moderate.',
      subtitle: 'Take action with these steps:',
      items: [
        'Schedule a check-up with your healthcare provider to discuss your diabetes risk',
        'Ask about getting your blood glucose levels tested',
        'Work on achieving a healthier weight through diet and exercise',
        'Aim for 30 minutes of moderate exercise most days of the week',
        'Consider consulting with a dietitian for personalized nutrition advice'
      ],
      note: 'Regular monitoring of your health is recommended.'
    });
  } else {
    recommendations.push({
      type: 'high-risk',
      title: `Your risk of developing type 2 diabetes is ${cat.label.toLowerCase()}.`,
      subtitle: 'Take these important steps:',
      items: [
        'Make an appointment with your healthcare provider soon to discuss your diabetes risk',
        'Request blood glucose testing to check for prediabetes or diabetes',
        'Consider participating in a diabetes prevention program',
        'Make significant lifestyle changes including diet improvements and increased physical activity',
        'Monitor other health conditions like blood pressure and cholesterol',
        'If recommended by your doctor, consider medication options to help prevent diabetes'
      ],
      note: 'Taking action now can significantly reduce your risk of developing type 2 diabetes.'
    });
  }

  if (bmi >= 25) {
    recommendations.push({
      type: 'bmi-recommendation',
      title: 'BMI Recommendation:',
      content: `Your BMI is ${bmi.toFixed(1)}, which is ${bmi >= 30 ? 'in the obese range' : 'overweight'}.`,
      note: 'Weight loss of 5\u201310% can significantly reduce your diabetes risk and improve overall health.'
    });
  }

  return {
    totalScore,
    category: cat.label,
    categoryKey: cat.key,
    categoryIndex,
    probability: cat.prob,
    probabilityPercent: cat.pct,
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCategory: bmiCat,
    riskFactors: factors,
    recommendations,
  };
};

export default function DiabetesRiskCalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('female');
  const [age, setAge] = useState<number>(45);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(5);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [waist, setWaist] = useState<string>('0');
  const [physicalActivity, setPhysicalActivity] = useState<string>('0');
  const [diet, setDiet] = useState<string>('0');
  const [medication, setMedication] = useState<string>('0');
  const [bloodGlucose, setBloodGlucose] = useState<string>('0');
  const [familyHistory, setFamilyHistory] = useState<string>('0');
  const [gestationalDiabetes, setGestationalDiabetes] = useState<string>('0');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const weightUnit = unitMode === 'metric' ? 'kg' : 'lbs';
  const cmOrIn = unitMode === 'metric' ? 'cm' : 'in';

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
      setResult(computeResult(unitMode, gender, age, heightCm, weightKg, waist, physicalActivity, diet, medication, bloodGlucose, familyHistory, gestationalDiabetes));
    }
  }, [unitMode, gender, age, heightCm, heightFt, heightIn, weightKg, weightLbs, waist, physicalActivity, diet, medication, bloodGlucose, familyHistory, gestationalDiabetes, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(unitMode, gender, age, heightCm, weightKg, waist, physicalActivity, diet, medication, bloodGlucose, familyHistory, gestationalDiabetes));
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
    setAge(45);
    setHeightCm(165);
    setHeightFt(5);
    setHeightIn(5);
    setWeightKg(70);
    setWeightLbs(154);
    setWaist('0');
    setPhysicalActivity('0');
    setDiet('0');
    setMedication('0');
    setBloodGlucose('0');
    setFamilyHistory('0');
    setGestationalDiabetes('0');
    setResult(null);
    setHasCalculated(false);
  };

  const renderButtonGroup = (
    options: { value: string; label: string }[],
    current: string,
    onChange: (v: string) => void,
    small = false
  ) => (
    <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 ${small ? 'py-2' : 'py-2.5'} text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${
            current === opt.value
              ? 'bg-[#1a1a1a] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="space-y-6">
          {/* Row 1: Gender + Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Gender</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {['male', 'female'].map((g) => (
                    <button key={g} type="button" onClick={() => { setGender(g); if (g === 'male') setGestationalDiabetes('0'); }}
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
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Age</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={age} onChange={(e) => setAge(Math.max(18, Math.min(100, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">yrs</span>
                  </div>
                </div>
                <input type="range" min="18" max="100" step="1" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>18</span><span>45</span><span>65</span><span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Height (full-width with unit toggle) */}
          <div className="flex flex-col [&>div]:flex-1">
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Height</label>
                <div className="flex bg-slate-200/50 p-0.5 rounded-xl border border-slate-200/30">
                  <button type="button" onClick={() => handleUnitToggle('metric')}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${unitMode === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>cm</button>
                  <button type="button" onClick={() => handleUnitToggle('imperial')}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${unitMode === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>ft/in</button>
                </div>
              </div>
              {unitMode === 'metric' ? (
                <div className="flex items-center space-x-2">
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(Math.max(50, Math.min(250, parseInt(e.target.value) || 0)))}
                    className="w-24 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">cm</span>
                  <input type="range" min="100" max="250" step="1" value={heightCm} onChange={(e) => setHeightCm(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 ml-2" />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input type="number" min="3" max="8" value={heightFt} onChange={(e) => setHeightFt(Math.max(3, Math.min(8, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">ft</span>
                  <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">in</span>
                  <input type="range" min="36" max="96" step="1" value={heightFt * 12 + heightIn}
                    onChange={(e) => { const t = parseInt(e.target.value); setHeightFt(Math.floor(t / 12)); setHeightIn(t % 12); }}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 ml-2" />
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Weight + Waist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Weight</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={unitMode === 'metric' ? weightKg : weightLbs}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 0);
                        if (unitMode === 'metric') setWeightKg(Math.min(300, val));
                        else setWeightLbs(Math.min(660, val));
                      }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{weightUnit}</span>
                  </div>
                </div>
                {unitMode === 'metric' ? (
                  <input type="range" min="30" max="300" step="1" value={weightKg} onChange={(e) => setWeightKg(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                ) : (
                  <input type="range" min="66" max="660" step="1" value={weightLbs} onChange={(e) => setWeightLbs(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                )}
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>{unitMode === 'metric' ? '30 kg' : '66 lbs'}</span>
                  <span>{unitMode === 'metric' ? '100 kg' : '220 lbs'}</span>
                  <span>{unitMode === 'metric' ? '200 kg' : '440 lbs'}</span>
                  <span>{unitMode === 'metric' ? '300 kg' : '660 lbs'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Waist Circumference</label>
                <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/30">
                  {getWaistOptions(gender, unitMode).map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setWaist(opt.value)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${waist === opt.value ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Physical Activity + Diet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Physical Activity</label>
                {renderButtonGroup([
                  { value: '0', label: 'Regular (\u2265 3x/wk)' },
                  { value: '2', label: 'Little or no exercise' },
                ], physicalActivity, setPhysicalActivity)}
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Diet</label>
                {renderButtonGroup([
                  { value: '0', label: 'Healthy' },
                  { value: '2', label: 'Poor' },
                ], diet, setDiet)}
              </div>
            </div>
          </div>

          {/* Row 5: Medication + Blood Glucose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Blood Pressure Medication</label>
                {renderButtonGroup([
                  { value: '0', label: 'No' },
                  { value: '2', label: 'Yes' },
                ], medication, setMedication)}
              </div>
            </div>
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Blood Glucose Level</label>
                {renderButtonGroup([
                  { value: '0', label: 'Normal (< 100 mg/dL)' },
                  { value: '5', label: 'High (\u2265 100)' },
                ], bloodGlucose, setBloodGlucose)}
              </div>
            </div>
          </div>

          {/* Row 6: Family History + Gestational Diabetes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col [&>div]:flex-1">
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Family History of Diabetes</label>
                {renderButtonGroup([
                  { value: '0', label: 'No' },
                  { value: '5', label: 'Yes' },
                ], familyHistory, setFamilyHistory)}
              </div>
            </div>
            {gender === 'female' && (
              <div className="flex flex-col [&>div]:flex-1">
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-2.5 transition-all hover:border-slate-300">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Gestational Diabetes</label>
                  {renderButtonGroup([
                    { value: '0', label: 'No' },
                    { value: '1', label: 'Yes' },
                  ], gestationalDiabetes, setGestationalDiabetes)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer">
            Calculate Diabetes Risk
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
            Your Diabetes Risk Assessment
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">ADA</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Score + Category */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Diabetes Risk Score</span>
                <div className="text-6xl font-black text-white font-mono tracking-tight">
                  {result.totalScore}
                </div>
                <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase border ${CATEGORIES[result.categoryIndex].color}`}>
                  {result.category}
                </span>
              </div>

              {/* Probability + BMI */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800/80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Probability</span>
                  <span className="font-mono font-black text-2xl text-white">{result.probability}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">({result.probabilityPercent}% chance)</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">BMI</span>
                  <span className="font-mono font-black text-2xl text-white">{result.bmi}</span>
                  <span className="text-[10px] text-slate-500 font-medium block" style={{ color: result.bmiCategory.color }}>{result.bmiCategory.name}</span>
                </div>
              </div>

              {/* Factor Breakdown Table */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Factor Breakdown</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <th className="py-2 pr-3">Factor</th>
                        <th className="py-2 pr-3">Value</th>
                        <th className="py-2 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {result.riskFactors.map((f, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-3 font-bold text-white">{f.factor}</td>
                          <td className="py-2 pr-3 text-slate-400 text-[10px]">{f.value}</td>
                          <td className="py-2 text-right font-mono font-black">
                            {f.points}/{f.maxPoints}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-700 font-black">
                        <td className="py-2 pr-3 text-white">Total</td>
                        <td className="py-2 pr-3"></td>
                        <td className="py-2 text-right font-mono">{result.totalScore}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Risk Gauge */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Risk Level</span>
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                  {CATEGORIES.map((cat, idx) => (
                    <div key={idx} className={`h-full ${cat.bg} transition-all duration-500 ${idx <= result.categoryIndex ? '' : 'opacity-25'}`}
                      style={{ width: '20%' }}>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 font-bold">
                  {CATEGORIES.map((cat, idx) => (
                    <span key={idx} className={`${idx === result.categoryIndex ? cat.color : ''} text-center`} style={{ width: '20%' }}>{cat.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Reference Table */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-table text-slate-800 mr-2.5 text-sm"></i>
                Diabetes Risk Categories
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Comprehensive Scoring</span>
            </div>
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[500px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Score Range</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Probability</th>
                    <th className="px-6 py-3.5">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {CATEGORIES.map((cat, idx) => (
                    <tr key={idx} className={`${result.categoryIndex === idx ? 'bg-slate-900/5 font-black text-slate-900' : 'hover:bg-slate-50/55'} transition-colors duration-250`}>
                      <td className="px-6 py-3.5 font-mono font-bold">
                        {result.categoryIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse inline-block mr-2"></span>}
                        {cat.range}
                      </td>
                      <td className="px-6 py-3.5 font-bold">
                        <span className={cat.color}>{cat.label}</span>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold">{cat.prob} ({cat.pct}%)</td>
                      <td className="px-6 py-3.5 text-slate-500 text-[10px]">{cat.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                <i className="fas fa-lightbulb text-amber-500"></i>
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Personalized Recommendations</h4>
                <p className="text-xs text-slate-500 font-medium">Based on your diabetes risk assessment</p>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-5 shadow-sm">
                  <h5 className="text-sm font-extrabold text-slate-800 mb-1.5">{rec.title}</h5>
                  {rec.content && <p className="text-xs font-medium text-slate-600 mb-2">{rec.content}</p>}
                  {rec.subtitle && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{rec.subtitle}</p>}
                  {rec.items && (
                    <ul className="space-y-1">
                      {rec.items.map((item, iidx) => (
                        <li key={iidx} className="flex items-start text-xs font-medium text-slate-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-slate-800 rounded-full mr-2 mt-[5px] shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {rec.note && <p className="text-[10px] text-slate-400 italic mt-2 font-medium">{rec.note}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Formula Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">Scoring Method</h3>
              <span className="text-[10px] text-slate-400 font-mono">Comprehensive Risk Scoring</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Risk Factor Scoring</span>
                <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                  <li><span className="font-bold">Age:</span> {'<'}45=0, 45-54=2, 55-64=3, 65+=4</li>
                  <li><span className="font-bold">Gender:</span> Female=0, Male=1</li>
                  <li><span className="font-bold">BMI:</span> {'<'}25=0, 25-30=1, 30+=3</li>
                  <li><span className="font-bold">Waist (M):</span> {'\u2264'}94cm=0, 94-102=3, {'>'}102=4</li>
                  <li><span className="font-bold">Waist (F):</span> {'\u2264'}80cm=0, 80-88=3, {'>'}88=4</li>
                  <li><span className="font-bold">Activity:</span> Regular=0, Little/none=2</li>
                  <li><span className="font-bold">Diet:</span> Healthy=0, Poor=2</li>
                  <li><span className="font-bold">BP Medication:</span> No=0, Yes=2</li>
                  <li><span className="font-bold">Blood Glucose:</span> Normal=0, High=5</li>
                  <li><span className="font-bold">Family History:</span> No=0, Yes=5</li>
                  <li><span className="font-bold">Gestational Diabetes:</span> No=0, Yes=1</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Score Interpretation</span>
                <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                  <li><span className="font-bold text-emerald-600">0\u20136 (Low):</span> 1 in 100 \u2014 maintain lifestyle</li>
                  <li><span className="font-bold text-amber-600">7\u201311 (Slightly Elevated):</span> 1 in 25 \u2014 consider improvements</li>
                  <li><span className="font-bold text-orange-600">12\u201314 (Moderate):</span> 1 in 6 \u2014 consult doctor</li>
                  <li><span className="font-bold text-red-600">15\u201320 (High):</span> 1 in 3 \u2014 seek medical evaluation</li>
                  <li><span className="font-bold text-purple-600">21+ (Very High):</span> 1 in 2 \u2014 see doctor soon</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
