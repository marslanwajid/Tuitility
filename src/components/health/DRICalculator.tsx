'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface MacroDetail {
  percent: number;
  grams: number;
  calories: number;
}

interface MacrosResult {
  protein: MacroDetail;
  carbs: MacroDetail;
  fat: MacroDetail;
  fiber: number;
}

interface CalculationResult {
  energy: number;
  macros: MacrosResult;
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  water: number;
  waterCups: number;
  recommendations: string[];
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra: 1.9,
};

const DIET_ADJUSTMENTS: Record<string, { protein: number; carbs: number; fat: number }> = {
  omnivore: { protein: 15, carbs: 55, fat: 30 },
  vegetarian: { protein: 15, carbs: 60, fat: 25 },
  vegan: { protein: 15, carbs: 60, fat: 25 },
  keto: { protein: 20, carbs: 5, fat: 75 },
  mediterranean: { protein: 15, carbs: 50, fat: 35 },
  paleo: { protein: 25, carbs: 35, fat: 40 },
};

const VITAMIN_LABELS: Record<string, string> = {
  vitaminA: 'Vitamin A', vitaminC: 'Vitamin C', vitaminD: 'Vitamin D', vitaminE: 'Vitamin E',
  vitaminK: 'Vitamin K', thiamin: 'Thiamin (B1)', riboflavin: 'Riboflavin (B2)', niacin: 'Niacin (B3)',
  vitaminB6: 'Vitamin B6', vitaminB12: 'Vitamin B12', folate: 'Folate (B9)', biotin: 'Biotin (B7)',
  pantothenicAcid: 'Pantothenic Acid (B5)',
};

const VITAMIN_UNITS: Record<string, string> = {
  vitaminA: 'μg RAE', vitaminC: 'mg', vitaminD: 'μg', vitaminE: 'mg',
  vitaminK: 'μg', thiamin: 'mg', riboflavin: 'mg', niacin: 'mg',
  vitaminB6: 'mg', vitaminB12: 'μg', folate: 'μg', biotin: 'μg',
  pantothenicAcid: 'mg',
};

const MINERAL_LABELS: Record<string, string> = {
  calcium: 'Calcium', iron: 'Iron', magnesium: 'Magnesium', zinc: 'Zinc',
  potassium: 'Potassium', sodium: 'Sodium', phosphorus: 'Phosphorus', selenium: 'Selenium',
  copper: 'Copper', manganese: 'Manganese', chromium: 'Chromium', molybdenum: 'Molybdenum',
};

const MINERAL_UNITS: Record<string, string> = {
  calcium: 'mg', iron: 'mg', magnesium: 'mg', zinc: 'mg',
  potassium: 'mg', sodium: 'mg', phosphorus: 'mg', selenium: 'μg',
  copper: 'μg', manganese: 'mg', chromium: 'μg', molybdenum: 'μg',
};

const computeBMR = (gender: string, weightKg: number, heightCm: number, age: number): number => {
  return gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
};

const getHeightInCm = (unitMode: 'metric' | 'imperial', heightCm: number, heightFt: number, heightIn: number): number => {
  return unitMode === 'metric' ? heightCm : heightFt * 30.48 + heightIn * 2.54;
};

const getWeightInKg = (unitMode: 'metric' | 'imperial', weightKg: number, weightLbs: number): number => {
  return unitMode === 'metric' ? weightKg : weightLbs * 0.453592;
};

const calculateEnergyNeeds = (
  gender: string, age: number, weightKg: number, heightCm: number,
  activityLevel: string, pregnancy: string, lactation: string
): number => {
  let bmr = computeBMR(gender, weightKg, heightCm, age);
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.375;
  let tdee = bmr * mult;
  if (pregnancy === 'second') tdee += 340;
  else if (pregnancy === 'third') tdee += 450;
  if (lactation === 'exclusive') tdee += 500;
  else if (lactation === 'partial') tdee += 300;
  return tdee;
};

const calculateMacros = (
  energy: number, gender: string, age: number,
  pregnancy: string, lactation: string,
  healthConditions: string[], dietType: string
): MacrosResult => {
  let { protein: pp, carbs: cp, fat: fp } = DIET_ADJUSTMENTS[dietType] || DIET_ADJUSTMENTS.omnivore;

  healthConditions.forEach(cond => {
    if (cond === 'diabetes') { pp = 20; cp = 45; fp = 35; }
    if (cond === 'heart_disease') { fp = 25; }
  });

  if (pregnancy !== 'none' || lactation !== 'none') {
    pp = Math.max(pp, 18);
  }

  const proteinGrams = (energy * (pp / 100)) / 4;
  const carbsGrams = (energy * (cp / 100)) / 4;
  const fatGrams = (energy * (fp / 100)) / 9;
  const fiber = gender === 'male' ? (age < 51 ? 38 : 30) : (age < 51 ? 25 : 21);

  return {
    protein: { percent: pp, grams: Math.round(proteinGrams), calories: Math.round(proteinGrams * 4) },
    carbs: { percent: cp, grams: Math.round(carbsGrams), calories: Math.round(carbsGrams * 4) },
    fat: { percent: fp, grams: Math.round(fatGrams), calories: Math.round(fatGrams * 9) },
    fiber: Math.round(fiber),
  };
};

const calculateVitamins = (
  gender: string, age: number, pregnancy: string,
  lactation: string, healthConditions: string[]
): Record<string, number> => {
  let v: Record<string, number> = {
    vitaminA: 900, vitaminC: 90, vitaminD: 15, vitaminE: 15, vitaminK: 120,
    thiamin: 1.2, riboflavin: 1.3, niacin: 16, vitaminB6: 1.3, vitaminB12: 2.4,
    folate: 400, biotin: 30, pantothenicAcid: 5,
  };

  if (gender === 'female') {
    if (age < 19) {
      v = { vitaminA: 700, vitaminC: 75, vitaminD: 15, vitaminE: 15, vitaminK: 75, thiamin: 1.0, riboflavin: 1.0, niacin: 14, vitaminB6: 1.2, vitaminB12: 2.4, folate: 400, biotin: 25, pantothenicAcid: 5 };
    } else {
      v = { vitaminA: 700, vitaminC: 75, vitaminD: 15, vitaminE: 15, vitaminK: 90, thiamin: 1.1, riboflavin: 1.1, niacin: 14, vitaminB6: 1.3, vitaminB12: 2.4, folate: 400, biotin: 30, pantothenicAcid: 5 };
    }

    if (pregnancy !== 'none') {
      v = { vitaminA: 770, vitaminC: 85, vitaminD: 15, vitaminE: 15, vitaminK: 90, thiamin: 1.4, riboflavin: 1.4, niacin: 18, vitaminB6: 1.9, vitaminB12: 2.6, folate: 600, biotin: 30, pantothenicAcid: 6 };
    }

    if (lactation !== 'none') {
      v = { vitaminA: 1300, vitaminC: 120, vitaminD: 15, vitaminE: 19, vitaminK: 90, thiamin: 1.4, riboflavin: 1.6, niacin: 17, vitaminB6: 2.0, vitaminB12: 2.8, folate: 500, biotin: 35, pantothenicAcid: 7 };
    }
  }

  if (age >= 71) {
    v.vitaminD = 20;
    v.vitaminB6 = gender === 'male' ? 1.7 : 1.5;
  }

  healthConditions.forEach(cond => {
    if (cond === 'osteoporosis') { v.vitaminD = Math.round(v.vitaminD * 1.5 * 10) / 10; v.vitaminK = Math.round(v.vitaminK * 1.2 * 10) / 10; }
    if (cond === 'anemia') { v.vitaminC = Math.round(v.vitaminC * 1.3 * 10) / 10; v.folate = Math.round(v.folate * 1.2); v.vitaminB12 = Math.round(v.vitaminB12 * 1.2 * 10) / 10; }
  });

  Object.keys(v).forEach(k => { v[k] = Math.round(v[k] * 10) / 10; });
  return v;
};

const calculateMinerals = (
  gender: string, age: number, pregnancy: string,
  lactation: string, healthConditions: string[]
): Record<string, number> => {
  let m: Record<string, number> = {
    calcium: 1000, iron: 8, magnesium: 400, zinc: 11, potassium: 3400, sodium: 1500,
    phosphorus: 700, selenium: 55, copper: 900, manganese: 2.3, chromium: 35, molybdenum: 45,
  };

  if (gender === 'female') {
    if (age < 19) {
      m = { calcium: 1300, iron: 15, magnesium: 360, zinc: 9, potassium: 2300, sodium: 1500, phosphorus: 1250, selenium: 55, copper: 890, manganese: 1.6, chromium: 24, molybdenum: 43 };
    } else if (age < 51) {
      m = { calcium: 1000, iron: 18, magnesium: 310, zinc: 8, potassium: 2600, sodium: 1500, phosphorus: 700, selenium: 55, copper: 900, manganese: 1.8, chromium: 25, molybdenum: 45 };
    } else {
      m = { calcium: 1200, iron: 8, magnesium: 320, zinc: 8, potassium: 2600, sodium: 1500, phosphorus: 700, selenium: 55, copper: 900, manganese: 1.8, chromium: 20, molybdenum: 45 };
    }

    if (pregnancy !== 'none') {
      m.iron = 27;
      m.zinc = age < 19 ? 12 : 11;
      m.potassium = 2900;
      m.magnesium = age < 19 ? 400 : 350;
      m.selenium = 60;
      m.copper = 1000;
      m.manganese = 2.0;
      m.chromium = 29;
      m.molybdenum = 50;
    }

    if (lactation !== 'none') {
      m.iron = age < 19 ? 10 : 9;
      m.zinc = age < 19 ? 13 : 12;
      m.potassium = 2900;
      m.selenium = 70;
      m.copper = 1300;
      m.manganese = 2.6;
      m.chromium = 44;
      m.molybdenum = 50;
    }
  } else {
    if (age < 19) {
      m = { calcium: 1300, iron: 11, magnesium: 410, zinc: 11, potassium: 3000, sodium: 1500, phosphorus: 1250, selenium: 55, copper: 890, manganese: 2.2, chromium: 35, molybdenum: 43 };
    } else if (age >= 51 && age < 71) {
      m.calcium = 1000; m.magnesium = 420;
    } else if (age >= 71) {
      m.calcium = 1200; m.magnesium = 420;
    }
  }

  healthConditions.forEach(cond => {
    if (cond === 'hypertension') { m.sodium = Math.round(m.sodium * 0.7); m.potassium = Math.round(m.potassium * 1.1); }
    if (cond === 'osteoporosis') { m.calcium = Math.round(m.calcium * 1.2); m.magnesium = Math.round(m.magnesium * 1.1); }
    if (cond === 'anemia') { m.iron = Math.round(m.iron * 1.5); m.copper = Math.round(m.copper * 1.1); }
    if (cond === 'kidney_disease') { m.protein = Math.round((m as any).protein * 0.8 || 0); m.potassium = Math.round(m.potassium * 0.8); }
  });

  Object.keys(m).forEach(k => { m[k] = Math.round(m[k]); });
  return m;
};

const calculateWater = (
  weightKg: number, activityLevel: string,
  pregnancy: string, lactation: string
): number => {
  const adj: Record<string, number> = { sedentary: 1.0, light: 1.1, moderate: 1.2, active: 1.3, extra: 1.4 };
  let water = weightKg * 35 * (adj[activityLevel] || 1.0);
  if (pregnancy !== 'none') water += 300;
  if (lactation === 'exclusive') water += 700;
  else if (lactation !== 'none') water += 400;
  return Math.round(water);
};

const generateRecommendations = (
  gender: string, age: number, pregnancy: string,
  lactation: string, healthConditions: string[], dietType: string
): string[] => {
  const recs: string[] = [];

  if (age >= 65) {
    recs.push('Consider vitamin B12 supplementation as absorption may decrease with age');
    recs.push('Ensure adequate vitamin D intake for bone health');
    recs.push('Include protein-rich foods to maintain muscle mass');
  }

  if (gender === 'female' && age >= 19 && age <= 50) {
    recs.push('Focus on iron-rich foods to meet higher iron needs');
    recs.push('Include folate-rich foods in case of future pregnancy');
  }

  if (pregnancy !== 'none') {
    recs.push('Take a prenatal vitamin with folic acid to prevent birth defects');
    recs.push('Include iron-rich foods and consider iron supplementation');
    recs.push('Ensure adequate calcium intake for fetal bone development');
    recs.push('Consume omega-3 fatty acids for fetal brain development');
  }

  if (lactation !== 'none') {
    recs.push('Continue prenatal vitamins during breastfeeding');
    recs.push('Increase fluid intake to support milk production');
    recs.push('Include calcium-rich foods to maintain bone health');
  }

  if (dietType === 'vegan' || dietType === 'vegetarian') {
    recs.push('Consider vitamin B12 supplementation');
    recs.push('Combine plant proteins to ensure complete amino acid profiles');
    recs.push('Include iron-rich plant foods with vitamin C for better absorption');
  }

  if (dietType === 'keto') {
    recs.push('Monitor electrolyte balance, especially sodium and potassium');
    recs.push('Include nutrient-dense, low-carb vegetables');
    recs.push('Consider magnesium supplementation');
  }

  healthConditions.forEach(cond => {
    switch (cond) {
      case 'diabetes':
        recs.push('Focus on complex carbohydrates and fiber-rich foods');
        recs.push('Monitor carbohydrate intake and timing');
        break;
      case 'hypertension':
        recs.push('Limit sodium intake and increase potassium-rich foods');
        recs.push('Follow the DASH diet pattern');
        break;
      case 'heart_disease':
        recs.push('Limit saturated and trans fats');
        recs.push('Include omega-3 fatty acids from fish or supplements');
        break;
      case 'osteoporosis':
        recs.push('Ensure adequate calcium and vitamin D intake');
        recs.push('Include weight-bearing exercises');
        break;
      case 'kidney_disease':
        recs.push('Monitor protein and potassium intake');
        recs.push('Work with a registered dietitian');
        break;
    }
  });

  recs.push('Eat a variety of nutrient-dense foods from all food groups');
  recs.push('Stay hydrated throughout the day');
  recs.push('Consult with a healthcare provider before making significant dietary changes');

  return recs;
};

const computeResult = (
  gender: string, age: number, unitMode: 'metric' | 'imperial',
  heightCm: number, heightFt: number, heightIn: number,
  weightKg: number, weightLbs: number,
  activityLevel: string, pregnancy: string, lactation: string,
  dietType: string, healthConditions: string[]
): CalculationResult => {
  const hCm = getHeightInCm(unitMode, heightCm, heightFt, heightIn);
  const wKg = getWeightInKg(unitMode, weightKg, weightLbs);

  const energy = calculateEnergyNeeds(gender, age, wKg, hCm, activityLevel, pregnancy, lactation);
  const macros = calculateMacros(energy, gender, age, pregnancy, lactation, healthConditions, dietType);
  const vitamins = calculateVitamins(gender, age, pregnancy, lactation, healthConditions);
  const minerals = calculateMinerals(gender, age, pregnancy, lactation, healthConditions);
  const water = calculateWater(wKg, activityLevel, pregnancy, lactation);
  const recommendations = generateRecommendations(gender, age, pregnancy, lactation, healthConditions, dietType);

  return { energy, macros, vitamins, minerals, water, waterCups: Math.round(water / 250), recommendations };
};

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (1\u20133 days/week)' },
  { value: 'moderate', label: 'Moderate (3\u20135 days/week)' },
  { value: 'active', label: 'Active (6\u20137 days/week)' },
  { value: 'extra', label: 'Extra Active (physical job)' },
];

const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Ketogenic' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'paleo', label: 'Paleo' },
];

const HEALTH_CONDITIONS = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'High Blood Pressure' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'kidney_disease', label: 'Kidney Disease' },
  { value: 'osteoporosis', label: 'Osteoporosis' },
  { value: 'anemia', label: 'Anemia' },
];

export default function DRICalculator() {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<string>('female');
  const [age, setAge] = useState<number>(30);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(5);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [pregnancy, setPregnancy] = useState<string>('none');
  const [lactation, setLactation] = useState<string>('none');
  const [dietType, setDietType] = useState<string>('omnivore');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
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

  const toggleHealthCondition = (cond: string) => {
    setHealthConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  useEffect(() => {
    if (hasCalculated) {
      setResult(computeResult(gender, age, unitMode, heightCm, heightFt, heightIn, weightKg, weightLbs, activityLevel, pregnancy, lactation, dietType, healthConditions));
    }
  }, [gender, age, unitMode, heightCm, heightFt, heightIn, weightKg, weightLbs, activityLevel, pregnancy, lactation, dietType, healthConditions, hasCalculated]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(computeResult(gender, age, unitMode, heightCm, heightFt, heightIn, weightKg, weightLbs, activityLevel, pregnancy, lactation, dietType, healthConditions));
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
    setActivityLevel('moderate');
    setPregnancy('none');
    setLactation('none');
    setDietType('omnivore');
    setHealthConditions([]);
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

  const renderSelect = (
    options: { value: string; label: string }[],
    current: string,
    onChange: (v: string) => void,
  ) => (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl font-extrabold text-xs text-slate-700 focus:outline-none focus:border-slate-400 appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
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
                    <input type="number" value={age} onChange={(e) => setAge(Math.max(1, Math.min(120, parseInt(e.target.value) || 0)))}
                      className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">yrs</span>
                  </div>
                </div>
                <input type="range" min="1" max="120" step="1" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex justify-between text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  <span>1</span><span>30</span><span>60</span><span>90</span><span>120</span>
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

          {/* Row 3: Weight + Activity Level */}
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
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Activity Level</label>
                {renderButtonGroup(ACTIVITY_OPTIONS, activityLevel, setActivityLevel, true)}
              </div>
            </div>
          </div>

          {/* Advanced Section (collapsible) */}
          <details className="group bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden transition-all hover:border-slate-300">
            <summary className="text-xs font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer p-5 select-none list-none flex items-center gap-3 hover:text-slate-700 transition-colors">
              <i className="fas fa-cog text-slate-400 group-open:rotate-90 transition-transform duration-300"></i>
              Advanced Options
              <span className="text-[10px] font-mono text-slate-400 font-bold ml-auto">Pregnancy · Lactation · Diet · Health</span>
            </summary>
            <div className="px-5 pb-5 space-y-4 border-t border-slate-200/40 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Pregnancy Status</label>
                  {renderSelect([
                    { value: 'none', label: 'Not Pregnant' },
                    { value: 'first', label: 'First Trimester' },
                    { value: 'second', label: 'Second Trimester' },
                    { value: 'third', label: 'Third Trimester' },
                  ], pregnancy, setPregnancy)}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Lactation Status</label>
                  {renderSelect([
                    { value: 'none', label: 'Not Breastfeeding' },
                    { value: 'exclusive', label: 'Exclusive Breastfeeding' },
                    { value: 'partial', label: 'Partial Breastfeeding' },
                  ], lactation, setLactation)}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Diet Type</label>
                  {renderSelect(DIET_OPTIONS, dietType, setDietType)}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Health Conditions (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_CONDITIONS.map((cond) => (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => toggleHealthCondition(cond.value)}
                      className={`px-3.5 py-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                        healthConditions.includes(cond.value)
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-slate-100">
          <button type="submit" className="px-8 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-350 shadow hover:shadow-md active:scale-95 text-sm cursor-pointer">
            Calculate DRI
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
            Your Dietary Reference Intakes (DRI)
          </h3>

          {/* Premium Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">DRI</span>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Energy + Water */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Energy Needs</span>
                <div className="text-5xl font-black text-white font-mono tracking-tight">
                  {result.energy.toLocaleString()}
                </div>
                <span className="text-sm text-slate-400 font-bold tracking-wide">kcal per day</span>
                <div className="mt-3 text-sm text-slate-400 font-bold">
                  Water: <span className="text-white font-black">{result.water} mL</span> ({result.waterCups} cups)
                </div>
              </div>

              {/* Macros */}
              <div className="pb-6 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Macronutrients</span>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="text-xs text-slate-400 font-extrabold uppercase">Protein</div>
                    <div className="font-mono font-black text-lg text-white">{result.macros.protein.grams}g</div>
                    <div className="text-[10px] text-slate-500">({result.macros.protein.percent}%)</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="text-xs text-slate-400 font-extrabold uppercase">Carbs</div>
                    <div className="font-mono font-black text-lg text-white">{result.macros.carbs.grams}g</div>
                    <div className="text-[10px] text-slate-500">({result.macros.carbs.percent}%)</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="text-xs text-slate-400 font-extrabold uppercase">Fat</div>
                    <div className="font-mono font-black text-lg text-white">{result.macros.fat.grams}g</div>
                    <div className="text-[10px] text-slate-500">({result.macros.fat.percent}%)</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="text-xs text-slate-400 font-extrabold uppercase">Fiber</div>
                    <div className="font-mono font-black text-lg text-white">{result.macros.fiber}g</div>
                    <div className="text-[10px] text-slate-500">daily</div>
                  </div>
                </div>
              </div>

              {/* Vitamins */}
              <div className="pb-6 border-b border-slate-800/80 text-left">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Vitamins</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <th className="py-2 pr-3">Vitamin</th>
                        <th className="py-2 text-right">RDA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {Object.entries(VITAMIN_LABELS).map(([key, label]) => (
                        <tr key={key} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-3 font-bold text-white">{label}</td>
                          <td className="py-2 text-right font-mono font-black text-slate-200">{result.vitamins[key]} {VITAMIN_UNITS[key]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Minerals */}
              <div className="pb-6 border-b border-slate-800/80 text-left">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Minerals</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <th className="py-2 pr-3">Mineral</th>
                        <th className="py-2 text-right">RDA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {Object.entries(MINERAL_LABELS).map(([key, label]) => (
                        <tr key={key} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-3 font-bold text-white">{label}</td>
                          <td className="py-2 text-right font-mono font-black text-slate-200">{result.minerals[key]} {MINERAL_UNITS[key]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">Personalized Recommendations</span>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start text-xs text-slate-300 font-medium">
                        <span className="w-1.5 h-1.5 bg-white/30 rounded-full mr-2 mt-[5px] shrink-0"></span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DRI Reference Info */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
                <i className="fas fa-book-open text-slate-800 mr-2.5 text-sm"></i>
                DRI Components
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Dietary Reference Intakes</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'RDA', desc: 'Recommended Dietary Allowance — average daily intake sufficient for 97-98% of healthy individuals' },
                { title: 'AI', desc: 'Adequate Intake — used when RDA cannot be determined, based on observed estimates' },
                { title: 'EAR', desc: 'Estimated Average Requirement — intake that meets needs of 50% of healthy individuals' },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">{item.title}</span>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulas Reference */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">Calculation Method</h3>
              <span className="text-[10px] text-slate-400 font-mono">Mifflin-St Jeor</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Energy Needs</span>
                <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                  <li><span className="font-bold">BMR (Male):</span> 10 × W + 6.25 × H − 5 × A + 5</li>
                  <li><span className="font-bold">BMR (Female):</span> 10 × W + 6.25 × H − 5 × A − 161</li>
                  <li><span className="font-bold">TDEE:</span> BMR × Activity Factor</li>
                  <li><span className="font-bold">Pregnancy:</span> +340 kcal (2nd), +450 (3rd)</li>
                  <li><span className="font-bold">Lactation:</span> +500 kcal (exclusive), +300 (partial)</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Nutrient Requirements</span>
                <ul className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                  <li><span className="font-bold">Macros:</span> Calorie % by diet type (protein/carbs/fat)</li>
                  <li><span className="font-bold">Vitamins:</span> Age & gender adjusted RDA values</li>
                  <li><span className="font-bold">Minerals:</span> Age & gender adjusted RDA values</li>
                  <li><span className="font-bold">Water:</span> 35 mL × kg × activity factor</li>
                  <li><span className="font-bold">Health Conditions:</span> Modify specific nutrient targets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
