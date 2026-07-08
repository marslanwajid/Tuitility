'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
type UnitMode = 'metric' | 'imperial';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; multiplier: number }> = {
  'sedentary': { label: 'Sedentary (little/no exercise)', multiplier: 1.2 },
  'light': { label: 'Light (1\u20133 days/week)', multiplier: 1.375 },
  'moderate': { label: 'Moderate (3\u20135 days/week)', multiplier: 1.55 },
  'active': { label: 'Active (6\u20137 days/week)', multiplier: 1.725 },
  'very-active': { label: 'Very Active (2x/day)', multiplier: 1.9 },
};

const ACTIVITY_LEVELS = Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[];

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtOne = (n: number) => n.toFixed(1);

interface MacroGoal {
  label: string;
  cal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  color: string;
}

function MacroBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center space-x-2 text-[10px]">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
      <span className="font-bold text-slate-500 w-12">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-black font-mono text-slate-700 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

function GoalCard({ goal, idx }: { goal: MacroGoal; idx: number }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-xs font-extrabold uppercase tracking-wider flex items-center">
          <span className={`w-5 h-5 rounded-full ${goal.color.replace('text', 'bg').replace('slate-900', 'bg-slate-900')} text-white text-[9px] font-black flex items-center justify-center mr-1.5`}>
            {idx + 1}
          </span>
          {goal.label}
        </span>
        <span className={`text-lg font-black font-mono ${goal.color}`}>{fmt(goal.cal)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Protein</span>
          <span className="text-xs font-black font-mono text-slate-900">{fmt(goal.proteinG)}g</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Carbs</span>
          <span className="text-xs font-black font-mono text-slate-900">{fmt(goal.carbsG)}g</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Fat</span>
          <span className="text-xs font-black font-mono text-slate-900">{fmt(goal.fatG)}g</span>
        </div>
      </div>
      <div className="space-y-1 pt-1">
        <MacroBar label="Protein" pct={goal.proteinPct} color="#3b82f6" />
        <MacroBar label="Carbs" pct={goal.carbsPct} color="#f59e0b" />
        <MacroBar label="Fat" pct={goal.fatPct} color="#ef4444" />
      </div>
    </div>
  );
}

export default function TDEECalculator() {
  const [unit, setUnit] = useState<UnitMode>('metric');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>('male');
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [weightLbs, setWeightLbs] = useState(154);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [bodyFat, setBodyFat] = useState('');
  const [result, setResult] = useState<{
    bmr: number; tdee: number; goals: MacroGoal[]; leanMass?: number;
  } | null>(null);
  const [error, setError] = useState('');

  const getHeightCm = (): number => {
    if (unit === 'metric') return heightCm;
    return heightFt * 30.48 + heightIn * 2.54;
  };

  const getWeightKg = (): number => {
    if (unit === 'metric') return weightKg;
    return weightLbs * 0.453592;
  };

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const w = getWeightKg();
    const h = getHeightCm();

    if (age <= 0 || age > 120) { setError('Age must be between 1 and 120.'); return; }
    if (w <= 0 || w > 700) { setError('Please enter a valid weight.'); return; }
    if (h <= 0 || h > 300) { setError('Please enter a valid height.'); return; }

    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;

    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity].multiplier;

    const bf = bodyFat ? parseFloat(bodyFat) : null;
    let leanMass: number | undefined;
    if (bf !== null && !isNaN(bf) && bf > 0 && bf < 100) {
      leanMass = w * (1 - bf / 100);
    }

    const buildGoal = (
      label: string,
      calAdj: number,
      proteinPct: number,
      carbsPct: number,
      fatPct: number,
      color: string
    ): MacroGoal => {
      const cal = tdee + calAdj;
      return {
        label,
        cal,
        proteinG: (cal * proteinPct / 100) / 4,
        carbsG: (cal * carbsPct / 100) / 4,
        fatG: (cal * fatPct / 100) / 9,
        proteinPct, carbsPct, fatPct, color,
      };
    };

    const goals = [
      buildGoal('Cutting', -500, 35, 35, 30, 'text-rose-500'),
      buildGoal('Maintenance', 0, 30, 40, 30, 'text-emerald-500'),
      buildGoal('Bulking', 500, 25, 50, 25, 'text-blue-500'),
    ];

    setResult({ bmr, tdee, goals, leanMass });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1a1a1a', '#ffffff', '#a1a1a1'],
    });
  };

  const handleReset = () => {
    setAge(30);
    setGender('male');
    setWeightKg(70);
    setHeightCm(175);
    setWeightLbs(154);
    setHeightFt(5);
    setHeightIn(9);
    setActivity('moderate');
    setBodyFat('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalc} className="space-y-6">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-full w-fit mx-auto">
          <button type="button" onClick={() => setUnit('metric')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase transition-all ${unit === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            Metric
          </button>
          <button type="button" onClick={() => setUnit('imperial')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase transition-all ${unit === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            Imperial
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Age</label>
            <input type="number" min="1" max="120" value={age}
              onChange={(e) => setAge(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Gender</label>
            <div className="flex space-x-2">
              {(['male', 'female'] as Gender[]).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    gender === g
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}>
                  {g === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'})
            </label>
            <div className="flex items-center space-x-1">
              <input type="number" min="0" max={unit === 'metric' ? '700' : '1500'} step="0.1"
                value={unit === 'metric' ? weightKg : weightLbs}
                onChange={(e) => {
                  const v = Math.max(0, parseFloat(e.target.value) || 0);
                  if (unit === 'metric') { setWeightKg(v); setWeightLbs(v / 0.453592); }
                  else { setWeightLbs(v); setWeightKg(v * 0.453592); }
                }}
                className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black focus:outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Height ({unit === 'metric' ? 'cm' : 'ft/in'})
            </label>
            {unit === 'metric' ? (
              <input type="number" min="0" max="300" value={heightCm}
                onChange={(e) => setHeightCm(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black focus:outline-none" />
            ) : (
              <div className="flex space-x-1">
                <input type="number" min="0" max="8" value={heightFt}
                  onChange={(e) => setHeightFt(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-2 rounded-xl font-mono text-sm font-black focus:outline-none" placeholder="ft" />
                <input type="number" min="0" max="11" value={heightIn}
                  onChange={(e) => setHeightIn(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-2 rounded-xl font-mono text-sm font-black focus:outline-none" placeholder="in" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Activity Level</label>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_LEVELS.map((key) => (
              <button key={key} type="button" onClick={() => setActivity(key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                  activity === key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}>
                {ACTIVITY_MULTIPLIERS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            Body Fat % <span className="text-slate-400 font-medium normal-case">(optional)</span>
          </label>
          <input type="number" min="0" max="100" step="0.1" value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="e.g. 15"
            className="w-full sm:w-40 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black focus:outline-none" />
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i><span>{error}</span>
          </div>
        )}

        <div className="flex justify-center space-x-4 pt-2">
          <button type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all shadow-sm active:scale-95 text-sm">
            Calculate TDEE
          </button>
          <button type="button" onClick={handleReset}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all active:scale-95 text-sm">
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="pt-6 border-t border-slate-100 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center">
            <i className="fas fa-fire mr-2 text-slate-400"></i>
            Your TDEE Results
          </h3>

          <div className="bg-[#1a1a1a] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[8rem] font-black text-white/5 leading-none select-none pointer-events-none italic mr-[-0.5rem] mt-[-0.5rem]">
              TDEE
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">BMR</span>
                <span className="text-2xl md:text-3xl font-black font-mono">{fmt(result.bmr)}</span>
                <span className="text-[9px] text-slate-400 block">kcal/day</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">TDEE</span>
                <span className="text-2xl md:text-3xl font-black font-mono">{fmt(result.tdee)}</span>
                <span className="text-[9px] text-slate-400 block">kcal/day</span>
              </div>
            </div>
            {result.leanMass !== undefined && (
              <div className="mt-3 pt-3 border-t border-white/10 text-center relative z-10">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lean Body Mass</span>
                <span className="text-base font-black font-mono text-emerald-400 ml-2">{fmtOne(result.leanMass)} kg</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.goals.map((goal, i) => (
              <GoalCard key={goal.label} goal={goal} idx={i} />
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl text-[10px] text-slate-500 font-semibold leading-relaxed space-y-1">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider block text-[9px] mb-1">How It Works</span>
            <p>
              BMR (Basal Metabolic Rate) calculated using the Mifflin-St Jeor equation. TDEE = BMR &times; {ACTIVITY_MULTIPLIERS[activity].multiplier} ({ACTIVITY_MULTIPLIERS[activity].label}).
              Cutting = TDEE &minus; 500 kcal/day (approx. &minus;0.5 kg/week). Bulking = TDEE + 500 kcal/day (approx. +0.5 kg/week).
              {result.leanMass !== undefined ? ' Macro targets adjusted for lean body mass.' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
