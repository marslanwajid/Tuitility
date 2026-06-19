'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface BodyShape {
  shape: string;
  description: string;
  characteristics: string;
}

interface HealthRisk {
  risk: string;
  level: string;
  factors: string[];
  score: number;
}

interface Recommendation {
  category: string;
  title: string;
  items: string[];
}

interface CalculationResult {
  bri: number;
  bmi: number;
  whtr: number;
  whr: number;
  bmiCategory: { name: string; color: string };
  bodyShape: BodyShape;
  healthRisk: HealthRisk;
  riskCategory: { key: string; label: string; color: string; range: string };
  bsa: number;
  idealWeightMin: number;
  idealWeightMax: number;
  weightDifference: number;
  metabolicAge: number;
  recommendations: Recommendation[];
}

const BMI_CATEGORIES = [
  { name: 'Underweight', color: '#3b82f6' },
  { name: 'Normal', color: '#2ecc71' },
  { name: 'Overweight', color: '#f1c40f' },
  { name: 'Obese', color: '#e74c3c' },
];

const RISK_CATEGORIES = [
  { key: 'veryLow', label: 'Very Low', range: '0 \u2013 < 1', color: 'text-emerald-400', bg: 'bg-emerald-500', prob: 'Lowest' },
  { key: 'low', label: 'Low', range: '1 \u2013 < 2', color: 'text-lime-400', bg: 'bg-lime-500', prob: 'Low' },
  { key: 'moderate', label: 'Moderate', range: '2 \u2013 < 3', color: 'text-amber-400', bg: 'bg-amber-500', prob: 'Moderate' },
  { key: 'high', label: 'High', range: '3 \u2013 < 4', color: 'text-orange-400', bg: 'bg-orange-500', prob: 'High' },
  { key: 'veryHigh', label: 'Very High', range: '4+', color: 'text-red-400', bg: 'bg-red-500', prob: 'Highest' },
];

const getBmiCategory = (bmi: number): { name: string; color: string } => {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25) return BMI_CATEGORIES[1];
  if (bmi < 30) return BMI_CATEGORIES[2];
  return BMI_CATEGORIES[3];
};

const getHeightInCm = (unitMode: 'metric' | 'imperial', heightCm: number, heightFt: number, heightIn: number): number => {
  return unitMode === 'metric' ? heightCm : heightFt * 30.48 + heightIn * 2.54;
};

const getWeightInKg = (unitMode: 'metric' | 'imperial', weightKg: number, weightLbs: number): number => {
  return unitMode === 'metric' ? weightKg : weightLbs * 0.453592;
};

const getCmFromUnit = (unitMode: 'metric' | 'imperial', metricVal: number, imperialVal: number): number => {
  return unitMode === 'metric' ? metricVal : imperialVal * 2.54;
};

const getRiskCategory = (bri: number) => {
  const cats = [
    { key: 'veryLow', label: 'Very Low', range: '0 \u2013 < 1', color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { key: 'low', label: 'Low', range: '1 \u2013 < 2', color: 'text-lime-400', bg: 'bg-lime-500' },
    { key: 'moderate', label: 'Moderate', range: '2 \u2013 < 3', color: 'text-amber-400', bg: 'bg-amber-500' },
    { key: 'high', label: 'High', range: '3 \u2013 < 4', color: 'text-orange-400', bg: 'bg-orange-500' },
    { key: 'veryHigh', label: 'Very High', range: '4+', color: 'text-red-400', bg: 'bg-red-500' },
  ];
  if (bri < 1) return { ...cats[0], index: 0 };
  if (bri < 2) return { ...cats[1], index: 1 };
  if (bri < 3) return { ...cats[2], index: 2 };
  if (bri < 4) return { ...cats[3], index: 3 };
  return { ...cats[4], index: 4 };
};

const computeResult = (
  gender: string, age: number, unitMode: 'metric' | 'imperial',
  heightCm: number, heightFt: number, heightIn: number,
  weightKg: number, weightLbs: number,
  waistCm: number, waistIn: number,
  hipCm: number, hipIn: number
): CalculationResult => {
  const hCm = getHeightInCm(unitMode, heightCm, heightFt, heightIn);
  const wKg = getWeightInKg(unitMode, weightKg, weightLbs);
  const waist = getCmFromUnit(unitMode, waistCm, waistIn);
  const hip = getCmFromUnit(unitMode, hipCm, hipIn);

  const hM = hCm / 100;
  const bmi = wKg / (hM * hM);

  const whtr = waist / hCm;
  const whr = waist / hip;

  const waistM = waist / 100;
  const ratio = waistM / (2 * Math.PI * hM);
  const eccentricity = Math.sqrt(1 - Math.pow(ratio, 2));
  const bri = Math.max(0, Math.round((364.2 - 365.5 * eccentricity) * 100) / 100);

  const thresholds = gender === 'male' ? { pear: 0.85, avocado: 0.95 } : { pear: 0.75, avocado: 0.85 };
  let bodyShape: BodyShape;
  if (whr < thresholds.pear) {
    bodyShape = { shape: 'Pear', description: 'Lower body fat distribution', characteristics: 'Fat storage primarily in hips, thighs, and buttocks. Generally lower cardiovascular risk.' };
  } else if (whr < thresholds.avocado) {
    bodyShape = { shape: 'Avocado', description: 'Balanced fat distribution', characteristics: 'Even distribution of body fat. Moderate cardiovascular risk.' };
  } else {
    bodyShape = { shape: 'Apple', description: 'Upper body fat distribution', characteristics: 'Fat storage primarily in abdomen and waist. Higher cardiovascular risk.' };
  }

  const riskCategory = getRiskCategory(bri);
  let risk = riskCategory.label;
  let level = riskCategory.index === 0 ? 'Excellent health profile' : riskCategory.index === 1 ? 'Good health profile' : riskCategory.index === 2 ? 'Increased health risk' : riskCategory.index === 3 ? 'High health risk' : 'Very high health risk';
  const factors: string[] = [];

  if (whtr > 0.6) { factors.push('High waist-to-height ratio'); if (risk === 'Low') risk = 'Moderate'; else if (risk === 'Very Low') risk = 'Low'; }
  if (bmi >= 30) { factors.push('Obesity (BMI \u2265 30)'); if (risk === 'Low') risk = 'Moderate'; else if (risk === 'Moderate') risk = 'High'; }
  if (age >= 50) factors.push('Age-related risk factors');
  if (gender === 'male' && whr > 0.95) factors.push('High waist-to-hip ratio (male)');
  else if (gender === 'female' && whr > 0.85) factors.push('High waist-to-hip ratio (female)');

  let score = Math.min(bri * 10, 40);
  if (bmi >= 30) score += 25; else if (bmi >= 25) score += 15;
  if (whtr > 0.6) score += 20; else if (whtr > 0.5) score += 10;
  if (age >= 65) score += 10; else if (age >= 50) score += 5;
  if (whr > 0.9) score += 5;
  score = Math.min(Math.round(score), 100);

  const bsa = Math.round(Math.sqrt((hCm * wKg) / 3600) * 100) / 100;
  const idealWeightMin = Math.round(18.5 * hM * hM * 10) / 10;
  const idealWeightMax = Math.round(24.9 * hM * hM * 10) / 10;
  const weightDiff = Math.round((wKg - (idealWeightMin + idealWeightMax) / 2) * 10) / 10;

  let metabolicAge = age;
  if (bmi < 18.5) metabolicAge += 2;
  else if (bmi > 30) metabolicAge += 5;
  else if (bmi > 25) metabolicAge += 2;
  if (whtr > 0.6) metabolicAge += 3;
  else if (whtr < 0.4) metabolicAge -= 2;
  if (gender === 'female' && waist > 88) metabolicAge += 2;
  else if (gender === 'male' && waist > 102) metabolicAge += 2;
  metabolicAge = Math.max(18, Math.min(metabolicAge, 80));

  const recommendations: Recommendation[] = [];

  if (bri < 1) {
    recommendations.push({ category: 'Maintenance', title: 'Excellent Body Composition', items: ['Maintain your current healthy lifestyle', 'Continue regular physical activity (150+ min/week)', 'Keep following a balanced, nutrient-rich diet', 'Regular health check-ups for monitoring'] });
  } else if (bri < 2) {
    recommendations.push({ category: 'Optimization', title: 'Good Body Composition', items: ['Aim for 150-300 minutes of moderate exercise weekly', 'Include both cardio and strength training', 'Focus on whole foods, lean proteins, fruits, and vegetables', 'Monitor waist circumference regularly'] });
  } else if (bri < 3) {
    recommendations.push({ category: 'Improvement', title: 'Moderate Health Risk', items: ['Consult with a healthcare provider about your body composition', 'Target waist reduction through diet and exercise', 'Increase physical activity to 300+ minutes per week', 'Monitor blood pressure and blood sugar levels'] });
  } else {
    recommendations.push({ category: 'Action Required', title: 'High Health Risk - Take Action', items: ['Schedule an appointment with your healthcare provider immediately', 'Request screening for diabetes and cardiovascular disease', 'Focus on sustainable dietary changes', 'Start with gentle, regular physical activity'] });
  }

  if (bmi >= 30) {
    recommendations.push({ category: 'Weight Management', title: 'BMI Consideration', items: ['Your BMI indicates consider comprehensive weight management', 'Focus on sustainable lifestyle changes rather than quick fixes', 'Consider medical supervision for weight loss'] });
  }
  if (whtr > 0.6) {
    recommendations.push({ category: 'Waist Reduction', title: 'Waist Circumference Focus', items: ['High waist-to-height ratio increases health risks', 'Focus on abdominal fat reduction', 'Consider stress management techniques', 'Limit alcohol consumption'] });
  }
  if (age >= 50) {
    recommendations.push({ category: 'Age-Specific', title: 'Age-Related Considerations', items: ['Focus on maintaining muscle mass through strength training', 'Ensure adequate calcium and vitamin D intake for bone health', 'Consider regular health screenings'] });
  }
  recommendations.push({ category: 'General Health', title: 'General Recommendations', items: ['Stay hydrated throughout the day', 'Get adequate sleep (7-9 hours per night)', 'Manage stress through relaxation techniques', 'Avoid smoking and limit alcohol consumption'] });

  return {
    bri, bmi, whtr: Math.round(whtr * 100) / 100, whr: Math.round(whr * 100) / 100,
    bmiCategory: getBmiCategory(bmi),
    bodyShape, healthRisk: { risk, level, factors, score }, riskCategory,
    bsa, idealWeightMin, idealWeightMax, weightDifference: weightDiff, metabolicAge,
    recommendations,
  };
};

export default function BRICalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('female');
  const [age, setAge] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(5);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [waistCm, setWaistCm] = useState<number>(80);
  const [waistIn, setWaistIn] = useState<number>(31.5);
  const [hipCm, setHipCm] = useState<number>(95);
  const [hipIn, setHipIn] = useState<number>(37);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const weightUnit = unitMode === 'metric' ? 'kg' : 'lbs';
  const cmOrIn = unitMode === 'metric' ? 'cm' : 'in';

  const handleUnitToggle = (mode: 'metric' | 'imperial') => {
    if (mode === 'metric' && unitMode === 'imperial') {
      const totalInches = heightFt * 12 + heightIn;
      setHeightCm(Math.round(totalInches * 2.54));
      setWeightKg(Math.round(weightLbs * 0.45359237));
      setWaistCm(Math.round(waistIn * 2.54));
      setHipCm(Math.round(hipIn * 2.54));
    } else if (mode === 'imperial' && unitMode === 'metric') {
      const totalInches = heightCm / 2.54;
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg / 0.45359237));
      setWaistIn(Math.round(waistCm / 2.54));
      setHipIn(Math.round(hipCm / 2.54));
    }
    setUnitMode(mode);
  };

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(gender, age, unitMode, heightCm, heightFt, heightIn, weightKg, weightLbs, waistCm, waistIn, hipCm, hipIn));
    }
  }, [gender, age, unitMode, heightCm, heightFt, heightIn, weightKg, weightLbs, waistCm, waistIn, hipCm, hipIn, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(gender, age, unitMode, heightCm, heightFt, heightIn, weightKg, weightLbs, waistCm, waistIn, hipCm, hipIn));
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
    setHeightCm(165);
    setHeightFt(5);
    setHeightIn(5);
    setWeightKg(70);
    setWeightLbs(154);
    setWaistCm(80);
    setWaistIn(31.5);
    setHipCm(95);
    setHipIn(37);
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

  const rc = result;
  const riskIdx = rc ? getRiskCategory(rc.bri).index : 0;

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
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${gender === g ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
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
                    <input type="number" value={age} onChange={(e) => setAge(Math.max(18, Math.min(120, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">yrs</span>
                  </div>
                </div>
                <input type="range" min="18" max="120" step="1" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>18</span><span>40</span><span>65</span><span>90</span><span>120</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Height (full-width) */}
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
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(Math.max(100, Math.min(250, parseInt(e.target.value) || 0)))}
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
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Waist</label>
                  <div className="flex items-center space-x-1.5">
                    <input type="number" value={unitMode === 'metric' ? waistCm : waistIn} step="0.1"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (unitMode === 'metric') setWaistCm(Math.min(200, Math.max(40, val)));
                        else setWaistIn(Math.min(80, Math.max(16, val)));
                      }}
                      className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cmOrIn}</span>
                  </div>
                </div>
                <input type="range"
                  min={unitMode === 'metric' ? 40 : 16}
                  max={unitMode === 'metric' ? 200 : 80}
                  step="0.5"
                  value={unitMode === 'metric' ? waistCm : waistIn}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (unitMode === 'metric') setWaistCm(val);
                    else setWaistIn(val);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
                  <span>{unitMode === 'metric' ? '40 cm' : '16 in'}</span>
                  <span>{unitMode === 'metric' ? '120 cm' : '48 in'}</span>
                  <span>{unitMode === 'metric' ? '200 cm' : '80 in'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Hip (full-width) */}
          <div className="flex flex-col [&>div]:flex-1">
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Hip Circumference</label>
                <div className="flex items-center space-x-1.5">
                  <input type="number" value={unitMode === 'metric' ? hipCm : hipIn} step="0.1"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (unitMode === 'metric') setHipCm(Math.min(200, Math.max(40, val)));
                      else setHipIn(Math.min(80, Math.max(16, val)));
                    }}
                    className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cmOrIn}</span>
                </div>
              </div>
              <input type="range"
                min={unitMode === 'metric' ? 40 : 16}
                max={unitMode === 'metric' ? 200 : 80}
                step="0.5"
                value={unitMode === 'metric' ? hipCm : hipIn}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (unitMode === 'metric') setHipCm(val);
                  else setHipIn(val);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex justify-between text-xs text-slate-400 font-mono font-bold">
                <span>{unitMode === 'metric' ? '40 cm' : '16 in'}</span>
                <span>{unitMode === 'metric' ? '120 cm' : '48 in'}</span>
                <span>{unitMode === 'metric' ? '200 cm' : '80 in'}</span>
              </div>
              <div className="bg-slate-100/70 border border-slate-200/40 rounded-xl p-3 text-[10px] text-slate-500 font-medium leading-relaxed">
                <span className="font-extrabold text-slate-600 uppercase tracking-wider text-[9px]">Measurement Tip:</span> Measure at the widest part of your hips/buttocks using a flexible tape over light clothing.
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer">
            Calculate BRI
          </button>
          <button type="button" onClick={handleReset}
            className="px-8 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 hover:text-slate-800 transition-all duration-350 active:scale-95 text-sm cursor-pointer">
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {rc && (
        <div className="pt-8 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-xl font-extrabold text-slate-950 text-center tracking-tight font-display">
            Your Body Roundness Index (BRI) Results
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">BRI</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* BRI Primary Metric */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Body Roundness Index</span>
                <div className="text-6xl font-black text-white font-mono tracking-tight">{rc.bri}</div>
                <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase border ${RISK_CATEGORIES[riskIdx].color}`}>
                  {rc.riskCategory.label}
                </span>
              </div>

              {/* Secondary Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pb-6 border-b border-slate-800/80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">BMI</span>
                  <span className="font-mono font-black text-xl text-white">{rc.bmi.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-500 font-medium block" style={{ color: rc.bmiCategory.color }}>{rc.bmiCategory.name}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">WHtR</span>
                  <span className="font-mono font-black text-xl text-white">{rc.whtr.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-500 font-medium block">{rc.whtr > 0.5 ? 'Elevated' : 'Normal'}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">WHR</span>
                  <span className="font-mono font-black text-xl text-white">{rc.whr.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-500 font-medium block">{rc.bodyShape.shape}</span>
                </div>
              </div>

              {/* Body Shape + Health Risk */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800/80">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Body Shape</span>
                  <div className="text-2xl font-black text-white">{rc.bodyShape.shape}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium">{rc.bodyShape.description}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Risk Score</span>
                  <div className="text-2xl font-black text-white">{rc.healthRisk.score}/100</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium">{rc.healthRisk.level}</div>
                </div>
              </div>

              {/* Risk Gauge */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">BRI Risk Category</span>
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                  {RISK_CATEGORIES.map((cat, idx) => (
                    <div key={idx} className={`h-full ${cat.bg} transition-all duration-500 ${idx <= riskIdx ? '' : 'opacity-25'}`}
                      style={{ width: '20%' }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 font-bold">
                  {RISK_CATEGORIES.map((cat, idx) => (
                    <span key={idx} style={{ width: '20%' }} className={`text-center ${idx === riskIdx ? cat.color : ''}`}>{cat.label}</span>
                  ))}
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">BSA</span>
                  <span className="font-mono font-black text-sm text-white">{rc.bsa} m\u00B2</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Ideal Weight</span>
                  <span className="font-mono font-black text-sm text-white">{rc.idealWeightMin}\u2013{rc.idealWeightMax} kg</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Weight \u0394</span>
                  <span className="font-mono font-black text-sm text-white">{rc.weightDifference > 0 ? '+' : ''}{rc.weightDifference} kg</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Metabolic Age</span>
                  <span className="font-mono font-black text-sm text-white">{rc.metabolicAge} yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Category Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-table text-slate-800 mr-2.5 text-sm"></i>
                BRI Risk Categories
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Body Roundness Index</span>
            </div>
            <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-inner">
              <table className="w-full min-w-[400px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <th className="px-6 py-3.5">Score Range</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {RISK_CATEGORIES.map((cat, idx) => (
                    <tr key={idx} className={`${riskIdx === idx ? 'bg-slate-900/5 font-black text-slate-900' : 'hover:bg-slate-50/55'} transition-colors duration-250`}>
                      <td className="px-6 py-3.5 font-mono font-bold">
                        {riskIdx === idx && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse inline-block mr-2"></span>}
                        {cat.range}
                      </td>
                      <td className="px-6 py-3.5 font-bold"><span className={cat.color}>{cat.label}</span></td>
                      <td className="px-6 py-3.5 text-slate-500 text-[10px]">{cat.prob}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Factors */}
          {rc.healthRisk.factors.length > 0 && (
            <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-3 text-left">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-amber-500"></i>
                Risk Factors Identified
              </h4>
              <div className="space-y-2">
                {rc.healthRisk.factors.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/70 rounded-xl px-4 py-2.5 border border-slate-100/60">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-800 border border-slate-100">
                <i className="fas fa-lightbulb text-amber-500"></i>
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Personalized Recommendations</h4>
                <p className="text-xs text-slate-500 font-medium">Based on your BRI assessment</p>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {rc.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-5 shadow-sm">
                  <h5 className="text-sm font-extrabold text-slate-800 mb-2">{rec.title}</h5>
                  <ul className="space-y-1">
                    {rec.items.map((item, iidx) => (
                      <li key={iidx} className="flex items-start text-xs font-medium text-slate-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full mr-2 mt-[5px] shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">Calculation Method</h3>
              <span className="text-[10px] text-slate-400 font-mono">Geometric Body Composition</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Core Formulas</span>
                <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                  <li><span className="font-bold">BRI:</span> 364.2 - 365.5 × sqrt(1 - (Waist/(2π×Height))²)</li>
                  <li><span className="font-bold">BMI:</span> Weight (kg) / Height (m)²</li>
                  <li><span className="font-bold">WHtR:</span> Waist / Height</li>
                  <li><span className="font-bold">WHR:</span> Waist / Hip</li>
                  <li><span className="font-bold">BSA:</span> sqrt((Ht × Wt) / 3600) (Mosteller)</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Body Shape & Risk</span>
                <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                  <li><span className="font-bold">Pear:</span> WHR {'<'} threshold (lower body fat)</li>
                  <li><span className="font-bold">Avocado:</span> WHR between thresholds (balanced)</li>
                  <li><span className="font-bold">Apple:</span> WHR {'>'} threshold (upper body fat)</li>
                  <li><span className="font-bold">Risk Score:</span> 0-100 composite of BRI, BMI, WHtR, age, WHR</li>
                  <li><span className="font-bold">Metabolic Age:</span> BMI + waist + WHtR adjustments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
