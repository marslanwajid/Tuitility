'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: string;
}

interface GPAConfig {
  scaleValue: number; // 4.0 or 5.0
  gradePoints: Record<string, number>;
}

const SCALE_4_0: GPAConfig = {
  scaleValue: 4.0,
  gradePoints: {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0,
  },
};

const SCALE_5_0: GPAConfig = {
  scaleValue: 5.0,
  gradePoints: {
    'A+': 5.0,
    'A': 5.0,
    'A-': 4.7,
    'B+': 4.3,
    'B': 4.0,
    'B-': 3.7,
    'C+': 3.3,
    'C': 3.0,
    'C-': 2.7,
    'D+': 2.3,
    'D': 2.0,
    'F': 0.0,
  },
};

interface CalculationResult {
  mode: 'semester' | 'cumulative';
  scale: number;
  calculatedGPA: number;
  totalCredits: number;
  totalPoints: number;
  coursesEvaluated: {
    name: string;
    grade: string;
    points: number;
    credits: number;
    weightedPoints: number;
  }[];

  // Cumulative Mode variables
  priorGPA: number;
  priorCredits: number;
  newSemesterGPA: number;
  newSemesterCredits: number;
  combinedGPA: number;
  combinedCredits: number;

  // Target GPA variables
  targetGPA: number;
  targetRequiredGPA: number;
  isTargetAchievable: boolean;

  steps: string[];
}

export default function GPACalculator() {
  const [mode, setMode] = useState<'semester' | 'cumulative'>('semester');
  const [scale, setScale] = useState<4.0 | 5.0>(4.0);

  // Semester Mode State
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Course 1', grade: 'A', credits: '3' },
    { id: '2', name: 'Course 2', grade: 'B+', credits: '4' },
    { id: '3', name: 'Course 3', grade: 'A-', credits: '3' },
  ]);

  // Cumulative Mode State
  const [priorGPA, setPriorGPA] = useState<string>('3.20');
  const [priorCredits, setPriorCredits] = useState<string>('45');
  const [targetGPA, setTargetGPA] = useState<string>('3.50');

  // Keypad Navigation Active Field
  const [activeField, setActiveField] = useState<
    | { type: 'course'; id: string; field: 'credits' }
    | { type: 'cumulative'; field: 'priorGPA' | 'priorCredits' | 'targetGPA' }
  >({ type: 'course', id: '1', field: 'credits' });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const currentScaleConfig = scale === 4.0 ? SCALE_4_0 : SCALE_5_0;

  // Automatically recalculate if user has clicked Calculate
  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [courses, priorGPA, priorCredits, targetGPA, mode, scale]);

  const recalculateSilently = () => {
    try {
      const calcResult = performCalculation();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const addCourse = () => {
    if (courses.length >= 10) {
      setError('You can add a maximum of 10 courses.');
      return;
    }
    const nextId = (
      courses.length > 0 ? Math.max(...courses.map((c) => parseInt(c.id))) + 1 : 1
    ).toString();
    setCourses([
      ...courses,
      { id: nextId, name: `Course ${nextId}`, grade: 'A', credits: '3' },
    ]);
    setError('');
  };

  const removeCourse = (id: string) => {
    if (courses.length <= 1) {
      setError('You must have at least 1 course.');
      return;
    }
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    setError('');
  };

  const updateCourseValue = (id: string, field: 'name' | 'grade' | 'credits', value: string) => {
    const updated = courses.map((c) => {
      if (c.id === id) {
        if (field === 'credits') {
          // Allow digits and single decimal
          const sanitized = value.replace(/[^0-9.]/g, '');
          return { ...c, [field]: sanitized };
        }
        return { ...c, [field]: value };
      }
      return c;
    });
    setCourses(updated);
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    setError('');
    if (activeField.type === 'course') {
      const activeCourse = courses.find((c) => c.id === activeField.id);
      if (!activeCourse) return;

      const currentVal = activeCourse.credits;
      let newVal = '';

      if (char === 'clear') {
        newVal = '0';
      } else if (char === 'back') {
        newVal = currentVal.slice(0, -1) || '0';
      } else if (char === '.') {
        newVal = currentVal.includes('.') ? currentVal : currentVal + '.';
      } else {
        newVal = currentVal === '0' ? char : currentVal + char;
      }

      updateCourseValue(activeField.id, 'credits', newVal);
    } else {
      let currentVal = '';
      let setVal: (v: string) => void;

      if (activeField.field === 'priorGPA') {
        currentVal = priorGPA;
        setVal = setPriorGPA;
      } else if (activeField.field === 'priorCredits') {
        currentVal = priorCredits;
        setVal = setPriorCredits;
      } else {
        currentVal = targetGPA;
        setVal = setTargetGPA;
      }

      let newVal = '';
      if (char === 'clear') {
        newVal = '0';
      } else if (char === 'back') {
        newVal = currentVal.slice(0, -1) || '0';
      } else if (char === '.') {
        newVal = currentVal.includes('.') ? currentVal : currentVal + '.';
      } else {
        newVal = currentVal === '0' ? char : currentVal + char;
      }

      setVal(newVal);
    }
  };

  const adjustValue = (amount: number) => {
    setError('');
    if (activeField.type === 'course') {
      const activeCourse = courses.find((c) => c.id === activeField.id);
      if (!activeCourse) return;

      const currentVal = parseFloat(activeCourse.credits) || 0;
      const newVal = Math.max(0, currentVal + amount);
      updateCourseValue(activeField.id, 'credits', newVal.toString());
    } else {
      let currentVal = 0;
      let setVal: (v: string) => void;

      if (activeField.field === 'priorGPA') {
        currentVal = parseFloat(priorGPA) || 0;
        setVal = setPriorGPA;
      } else if (activeField.field === 'priorCredits') {
        currentVal = parseFloat(priorCredits) || 0;
        setVal = setPriorCredits;
      } else {
        currentVal = parseFloat(targetGPA) || 0;
        setVal = setTargetGPA;
      }

      const newVal = Math.max(0, currentVal + amount);
      setVal(newVal.toFixed(2).replace(/\.?0+$/, ''));
    }
  };

  const performCalculation = (): CalculationResult => {
    const steps: string[] = [];

    // Parse course inputs
    const parsedCourses = courses.map((c) => {
      const creditsVal = parseFloat(c.credits) || 0;
      const gradePointsVal = currentScaleConfig.gradePoints[c.grade] ?? 0;
      return {
        name: c.name || `Course (${c.grade})`,
        grade: c.grade,
        points: gradePointsVal,
        credits: creditsVal,
        weightedPoints: gradePointsVal * creditsVal,
      };
    });

    // Validation
    parsedCourses.forEach((c, idx) => {
      if (isNaN(c.credits) || c.credits < 0) {
        throw new Error(`Please enter valid credit hours for row ${idx + 1}.`);
      }
    });

    const totalSemesterCredits = parsedCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalSemesterPoints = parsedCourses.reduce((sum, c) => sum + c.weightedPoints, 0);
    const calculatedSemesterGPA =
      totalSemesterCredits > 0 ? totalSemesterPoints / totalSemesterCredits : 0;

    if (mode === 'semester') {
      if (totalSemesterCredits === 0) {
        throw new Error('Total semester credit hours must be greater than zero.');
      }

      steps.push('**Step 1: Map letter grades to their respective grade points**');
      parsedCourses.forEach((c) => {
        steps.push(`* ${c.name}: Grade **${c.grade}** $\\implies$ **${c.points.toFixed(2)}** points`);
      });

      steps.push('\n**Step 2: Multiply grade points by credit hours for each course**');
      parsedCourses.forEach((c) => {
        steps.push(
          `* ${c.name}: $${c.points.toFixed(2)} \\text{ points} \\times ${c.credits.toFixed(
            1
          )} \\text{ credits} = ${c.weightedPoints.toFixed(2)} \\text{ quality points}$`
        );
      });

      steps.push('\n**Step 3: Calculate GPA by dividing total quality points by total credits**');
      steps.push('$$\\text{GPA} = \\frac{\\sum (\\text{Grade Points}_i \\times \\text{Credits}_i)}{\\sum \\text{Credits}_i}$$');
      steps.push(
        `$$\\text{GPA} = \\frac{${totalSemesterPoints.toFixed(2)}}{${totalSemesterCredits.toFixed(
          1
        )}} = ${calculatedSemesterGPA.toFixed(4)}$$`
      );
      steps.push(`Final Semester GPA is **${calculatedSemesterGPA.toFixed(2)}** on a ${scale.toFixed(1)} scale.`);

      return {
        mode,
        scale,
        calculatedGPA: calculatedSemesterGPA,
        totalCredits: totalSemesterCredits,
        totalPoints: totalSemesterPoints,
        coursesEvaluated: parsedCourses,
        priorGPA: 0,
        priorCredits: 0,
        newSemesterGPA: 0,
        newSemesterCredits: 0,
        combinedGPA: 0,
        combinedCredits: 0,
        targetGPA: 0,
        targetRequiredGPA: 0,
        isTargetAchievable: true,
        steps,
      };
    } else {
      // Cumulative Mode calculations
      const pGPA = parseFloat(priorGPA) || 0;
      const pCredits = parseFloat(priorCredits) || 0;
      const tGPA = parseFloat(targetGPA) || 0;

      if (isNaN(pGPA) || pGPA < 0 || pGPA > scale) {
        throw new Error(`Prior GPA must be a number between 0 and ${scale}.`);
      }
      if (isNaN(pCredits) || pCredits < 0) {
        throw new Error('Prior earned credits must be a positive number.');
      }
      if (isNaN(tGPA) || tGPA < 0 || tGPA > scale) {
        throw new Error(`Target GPA must be a number between 0 and ${scale}.`);
      }
      if (totalSemesterCredits === 0) {
        throw new Error('Please add courses with valid credits for this term.');
      }

      const combinedCredits = pCredits + totalSemesterCredits;
      const priorTotalPoints = pGPA * pCredits;
      const combinedTotalPoints = priorTotalPoints + totalSemesterPoints;
      const combinedGPA = combinedCredits > 0 ? combinedTotalPoints / combinedCredits : 0;

      steps.push('**Step 1: Calculate quality points from prior academic record**');
      steps.push(
        `* Prior Quality Points = $${pGPA.toFixed(2)} \\text{ GPA} \\times ${pCredits.toFixed(
          1
        )} \\text{ credits} = ${priorTotalPoints.toFixed(2)}$`
      );

      steps.push('\n**Step 2: Calculate new semester quality points**');
      parsedCourses.forEach((c) => {
        steps.push(
          `* ${c.name}: $${c.points.toFixed(2)} \\times ${c.credits.toFixed(
            1
          )} = ${c.weightedPoints.toFixed(2)}`
        );
      });
      steps.push(`* Term Total Quality Points = **${totalSemesterPoints.toFixed(2)}**`);
      steps.push(`* Term Total Credits = **${totalSemesterCredits.toFixed(1)}**`);
      steps.push(`* Term GPA = $${totalSemesterPoints.toFixed(2)} / ${totalSemesterCredits.toFixed(1)} = ${calculatedSemesterGPA.toFixed(2)}$`);

      steps.push('\n**Step 3: Calculate combined Cumulative GPA**');
      steps.push('$$\\text{Cumulative GPA} = \\frac{\\text{Prior Points} + \\text{New Term Points}}{\\text{Prior Credits} + \\text{New Term Credits}}$$');
      steps.push(
        `$$\\text{CGPA} = \\frac{${priorTotalPoints.toFixed(2)} + ${totalSemesterPoints.toFixed(
          2
        )}}{${pCredits.toFixed(1)} + ${totalSemesterCredits.toFixed(
          1
        )}} = \\frac{${combinedTotalPoints.toFixed(2)}}{${combinedCredits.toFixed(1)}} = ${combinedGPA.toFixed(4)}$$`
      );

      // Solve for Target GPA Gap:
      // CGPA_target = (priorPoints + newSemesterCredits * GPA_required) / combinedCredits
      // GPA_required = (CGPA_target * combinedCredits - priorPoints) / newSemesterCredits
      const targetRequiredGPA =
        totalSemesterCredits > 0
          ? (tGPA * combinedCredits - priorTotalPoints) / totalSemesterCredits
          : 0;
      const isTargetAchievable = targetRequiredGPA <= scale;

      steps.push('\n**Step 4: Analyze target GPA gap**');
      steps.push(`Target GPA: **${tGPA.toFixed(2)}**`);
      if (tGPA <= combinedGPA) {
        steps.push(`* Congratulations! Your projected Cumulative GPA ($${combinedGPA.toFixed(2)}$) already meets or exceeds your target GPA of **${tGPA.toFixed(2)}**.`);
      } else {
        steps.push('The required GPA in this term to reach your target cumulative GPA is:');
        steps.push('$$\\text{GPA}_{\\text{required}} = \\frac{(\\text{GPA}_{\\text{target}} \\times C_{\\text{combined}}) - \\text{Prior Points}}{C_{\\text{term}}}$$');
        steps.push(
          `$$\\text{GPA}_{\\text{required}} = \\frac{(${tGPA.toFixed(2)} \\times ${combinedCredits.toFixed(
            1
          )}) - ${priorTotalPoints.toFixed(2)}}{${totalSemesterCredits.toFixed(
            1
          )}} = \\frac{${(tGPA * combinedCredits).toFixed(2)} - ${priorTotalPoints.toFixed(
            2
          )}}{${totalSemesterCredits.toFixed(1)}} = ${targetRequiredGPA.toFixed(4)}$$`
        );

        if (isTargetAchievable) {
          steps.push(`* You need to earn an average GPA of **${targetRequiredGPA.toFixed(
            2
          )}** in this term's courses to hit your target of **${tGPA.toFixed(2)}**.`);
        } else {
          steps.push(`* **Warning**: Hitting your target is mathematically impossible with your remaining credits. It requires a term GPA of **${targetRequiredGPA.toFixed(
            2
          )}**, which exceeds the scale limit of **${scale.toFixed(1)}**.`);
        }
      }

      return {
        mode,
        scale,
        calculatedGPA: calculatedSemesterGPA,
        totalCredits: totalSemesterCredits,
        totalPoints: totalSemesterPoints,
        coursesEvaluated: parsedCourses,
        priorGPA: pGPA,
        priorCredits: pCredits,
        newSemesterGPA: calculatedSemesterGPA,
        newSemesterCredits: totalSemesterCredits,
        combinedGPA,
        combinedCredits,
        targetGPA: tGPA,
        targetRequiredGPA,
        isTargetAchievable,
        steps,
      };
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = performCalculation();
      setResult(calcResult);
      setHasCalculated(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      setError('');

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setCourses([
      { id: '1', name: 'Course 1', grade: 'A', credits: '3' },
      { id: '2', name: 'Course 2', grade: 'B+', credits: '4' },
      { id: '3', name: 'Course 3', grade: 'A-', credits: '3' },
    ]);
    setPriorGPA('3.20');
    setPriorCredits('45');
    setTargetGPA('3.50');
    setActiveField({ type: 'course', id: '1', field: 'credits' });
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  // Grade Distribution Counts
  const getGradeDistribution = () => {
    const list = result ? result.coursesEvaluated : courses.map(c => ({ grade: c.grade }));
    const counts: Record<string, number> = {};
    Object.keys(currentScaleConfig.gradePoints).forEach(g => {
      counts[g] = 0;
    });
    list.forEach(c => {
      if (counts[c.grade] !== undefined) {
        counts[c.grade]++;
      }
    });
    return counts;
  };

  const gradeCounts = getGradeDistribution();
  const maxGradeCount = Math.max(...Object.values(gradeCounts), 1);

  // SVG Progress Ring calculations
  const displayGPA = result ? (mode === 'semester' ? result.calculatedGPA : result.combinedGPA) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayGPA / scale) * circumference;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      
      {/* Upper Options: Mode & Scale */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 text-left">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Calculation Mode
          </span>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[
              { id: 'semester', label: 'Semester GPA' },
              { id: 'cumulative', label: 'Cumulative CGPA' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id as any);
                  if (m.id === 'semester') {
                    setActiveField({ type: 'course', id: '1', field: 'credits' });
                  } else {
                    setActiveField({ type: 'cumulative', field: 'priorGPA' });
                  }
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mode === m.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Grading Scale
          </span>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[4.0, 5.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setScale(s as any);
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  scale === s
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s.toFixed(1)} Scale
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Editor */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            
            {/* Cumulative Mode Prior Fields */}
            {mode === 'cumulative' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                
                {/* Prior CGPA */}
                <div
                  onClick={() => setActiveField({ type: 'cumulative', field: 'priorGPA' })}
                  className={`bg-white border p-3.5 rounded-xl text-left cursor-pointer transition-all ${
                    activeField.type === 'cumulative' && activeField.field === 'priorGPA'
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Prior CGPA</span>
                  <input
                    type="text"
                    readOnly
                    value={priorGPA}
                    className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none cursor-pointer mt-1"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">Scale: 0.0 – {scale.toFixed(1)}</span>
                </div>

                {/* Prior Credits */}
                <div
                  onClick={() => setActiveField({ type: 'cumulative', field: 'priorCredits' })}
                  className={`bg-white border p-3.5 rounded-xl text-left cursor-pointer transition-all ${
                    activeField.type === 'cumulative' && activeField.field === 'priorCredits'
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Prior Earned Credits</span>
                  <input
                    type="text"
                    readOnly
                    value={priorCredits}
                    className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none cursor-pointer mt-1"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">Total existing units</span>
                </div>

                {/* Target Cumulative GPA */}
                <div
                  onClick={() => setActiveField({ type: 'cumulative', field: 'targetGPA' })}
                  className={`bg-white border p-3.5 rounded-xl text-left cursor-pointer transition-all ${
                    activeField.type === 'cumulative' && activeField.field === 'targetGPA'
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Target CGPA Goal</span>
                  <input
                    type="text"
                    readOnly
                    value={targetGPA}
                    className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none cursor-pointer mt-1"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">Academic goal</span>
                </div>

              </div>
            )}

            {/* Courses List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-left">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {mode === 'cumulative' ? "This Term's Courses" : 'Course Grade List'}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-medium">Add all classes to calculate GPA.</p>
                </div>
                <button
                  type="button"
                  onClick={addCourse}
                  className="px-3 py-1.5 text-[10px] font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                >
                  + Add Class
                </button>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin divide-y divide-slate-100">
                {courses.map((course, idx) => {
                  const isActive =
                    activeField.type === 'course' &&
                    activeField.id === course.id &&
                    activeField.field === 'credits';

                  return (
                    <div key={course.id} className="grid grid-cols-12 gap-3 items-center py-2.5 first:pt-0">
                      
                      {/* Course Name */}
                      <div className="col-span-4 text-left">
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => updateCourseValue(course.id, 'name', e.target.value)}
                          placeholder={`Course Name ${idx + 1}`}
                          className="w-full bg-transparent text-xs font-extrabold text-slate-800 border-none focus:outline-none focus:ring-0 p-0"
                        />
                      </div>

                      {/* Grade Selector */}
                      <div className="col-span-4 bg-white border border-slate-200 hover:border-slate-350 p-2 rounded-xl text-left transition-all">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Grade</span>
                        <select
                          value={course.grade}
                          onChange={(e) => updateCourseValue(course.id, 'grade', e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none mt-0.5 border-none p-0 cursor-pointer"
                        >
                          {Object.keys(currentScaleConfig.gradePoints).map((g) => (
                            <option key={g} value={g}>
                              {g} ({currentScaleConfig.gradePoints[g].toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Credits Input */}
                      <div
                        onClick={() => setActiveField({ type: 'course', id: course.id, field: 'credits' })}
                        className={`col-span-3 bg-white border p-2 rounded-xl text-left cursor-pointer transition-all ${
                          isActive
                            ? 'border-slate-900 ring-1 ring-slate-900'
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Credits</span>
                        <input
                          type="text"
                          readOnly
                          value={course.credits}
                          className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer mt-0.5"
                        />
                      </div>

                      {/* Trash Button */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          disabled={courses.length <= 1}
                          onClick={() => removeCourse(course.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 text-slate-450 hover:text-rose-600 transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:border-slate-200 disabled:hover:text-slate-450"
                        >
                          <i className="fas fa-trash-alt text-[10px]"></i>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Card */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left flex items-start space-x-3 text-rose-800 animate-shake">
                <i className="fas fa-exclamation-circle mt-0.5"></i>
                <div>
                  <h4 className="text-xs font-bold">Calculation Error</h4>
                  <p className="text-[10px] font-medium mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer text-sm"
              >
                Calculate GPA
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-6 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all cursor-pointer text-sm text-slate-600"
              >
                Reset
              </button>
            </div>

          </form>
        </div>

        {/* Right Column - Keypad and Visualizer */}
        <div className="space-y-6">
          
          {/* Keypad Panel */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
            <div className="flex justify-between items-center w-full">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                Value Pad
              </span>
              <div className="flex space-x-1">
                {[-1, +1, -3, +3].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => adjustValue(amt)}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-white hover:bg-slate-100 active:scale-95 transition-all text-slate-600 cursor-pointer"
                  >
                    {amt > 0 ? `+${amt}` : amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyboardInput(key)}
                  className={`py-3 text-xs font-bold border rounded-xl active:scale-95 transition-all cursor-pointer ${
                    key === 'back'
                      ? 'bg-slate-200/50 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  {key === 'back' ? <i className="fas fa-backspace"></i> : key}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeyboardInput('clear')}
                className="col-span-3 py-2 text-[10px] font-extrabold border border-slate-200 bg-slate-200/30 hover:bg-slate-200/70 rounded-xl text-slate-600 transition-all cursor-pointer"
              >
                Clear Field
              </button>
            </div>
          </div>

          {/* SVG Progress Ring Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center text-center">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-4">
              GPA Gauge
            </span>
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-200 fill-none"
                  strokeWidth="8"
                />
                {/* Filled Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-900 fill-none transition-all duration-500 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {displayGPA.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400 font-bold mt-1">
                  of {scale.toFixed(1)} Scale
                </span>
              </div>
            </div>

            {/* Display status label */}
            <div className="mt-4">
              <span className="text-xs font-black text-slate-800 block">
                {displayGPA >= 3.8
                  ? 'Excellent (Summa Cum Laude)'
                  : displayGPA >= 3.6
                  ? 'Great (Magna Cum Laude)'
                  : displayGPA >= 3.4
                  ? 'Good (Cum Laude)'
                  : displayGPA >= 3.0
                  ? 'Satisfactory'
                  : displayGPA >= 2.0
                  ? 'Passing'
                  : displayGPA > 0
                  ? 'Needs Improvement'
                  : 'No Grades Computed'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Result Panel & Visualizations */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">GPA</span>
          </div>
          <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-white font-display">
                Calculation Output
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Detailed metrics for your academic record.
              </p>
            </div>
            <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-center shrink-0 shadow-sm border border-white/10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-70">
                {mode === 'semester' ? 'Semester GPA' : 'Projected CGPA'}
              </span>
              <span className="text-2xl font-black block mt-0.5 leading-none">
                {displayGPA.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Mode-specific metrics breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {mode === 'semester' ? (
              <>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Credits</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {result.totalCredits.toFixed(1)}
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Quality Points</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {result.totalPoints.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Average Points/Course</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {(result.totalPoints / Math.max(result.coursesEvaluated.length, 1)).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Prior Record</span>
                  <span className="text-sm font-black text-white mt-1 block">
                    {result.priorGPA.toFixed(2)} GPA ({result.priorCredits.toFixed(1)} credits)
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Term Record</span>
                  <span className="text-sm font-black text-white mt-1 block">
                    {result.newSemesterGPA.toFixed(2)} GPA ({result.newSemesterCredits.toFixed(1)} credits)
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">New Combined Record</span>
                  <span className="text-sm font-black text-white mt-1 block">
                    {result.combinedGPA.toFixed(2)} GPA ({result.combinedCredits.toFixed(1)} credits)
                  </span>
                </div>
              </>
            )}

          </div>

          {/* Target GPA Gap analysis visualizer (Cumulative Mode Only) */}
          {mode === 'cumulative' && (
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Target GPA Aligner Analysis
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/80">
                  <span>Current Projected Cumulative: {result.combinedGPA.toFixed(2)}</span>
                  <span>Target Goal: {result.targetGPA.toFixed(2)}</span>
                </div>
                
                {/* Horizontal progress bar mapping current and target */}
                <div className="relative h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  {/* Current GPA Progress Bar */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-slate-900 transition-all duration-500 ease-out"
                    style={{ width: `${(result.combinedGPA / scale) * 100}%` }}
                  />
                  {/* Target GPA marker overlay */}
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-400 transition-all duration-500 ease-out"
                    style={{ left: `${(result.targetGPA / scale) * 100}%` }}
                    title="Target Marker"
                  />
                </div>
              </div>

              {/* Solved Target Details */}
              {result.targetGPA <= result.combinedGPA ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <i className="fas fa-check-circle"></i>
                  <span>Target achieved! Your projected Cumulative GPA exceeds your target cumulative goal.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {result.isTargetAchievable ? (
                    <div className="p-3.5 bg-white/10 border border-white/10 text-white/90 rounded-xl text-xs font-medium space-y-1">
                      <p className="font-bold flex items-center space-x-2">
                        <i className="fas fa-info-circle text-white"></i>
                        <span>Target Hitting Path:</span>
                      </p>
                      <p className="text-[11px] text-white/70 mt-1">
                        To raise your cumulative average from **{result.priorGPA.toFixed(2)}** to your target of **{result.targetGPA.toFixed(2)}**, you must earn an average GPA of <span className="font-black text-white">{result.targetRequiredGPA.toFixed(2)}</span> across the remaining <span className="font-bold">{result.newSemesterCredits.toFixed(1)}</span> credits of this term.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium space-y-1">
                      <p className="font-bold flex items-center space-x-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Mathematically Impossible Target:</span>
                      </p>
                      <p className="text-[11px] text-rose-700 mt-1">
                        Reaching a cumulative target of **{result.targetGPA.toFixed(2)}** is not mathematically possible in this term. It requires earning a term GPA of <span className="font-black">{result.targetRequiredGPA.toFixed(2)}</span>, which exceeds your maximum scale of <span className="font-bold">{scale.toFixed(1)}</span>. To achieve this target, you will need more credit hours or subsequent semesters.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grade Distribution counts panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Grade Distribution Graph
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(gradeCounts)
                .filter(k => gradeCounts[k] > 0)
                .map((g) => {
                  const cnt = gradeCounts[g];
                  const widthPct = (cnt / maxGradeCount) * 100;
                  return (
                    <div key={g} className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <span className="text-xs font-black text-white w-6">{g}</span>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-white/30 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-12 text-right">
                        {cnt} {cnt === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  );
                })}
              {Object.values(gradeCounts).reduce((s, c) => s + c, 0) === 0 && (
                <p className="text-xs text-slate-400 font-medium">No grades are added to calculate a distribution.</p>
              )}
            </div>
          </div>

          {/* Formula step by step KaTeX */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Step-by-Step Resolution Steps
            </h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {result.steps.map((step, idx) => {
                  const trimmed = step.trim();
                  if (trimmed.startsWith('$$')) {
                    const latexStr = trimmed.replace(/\$\$/g, '');
                    return (
                      <div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin">
                        <BlockMath math={latexStr} />
                      </div>
                    );
                  }
                  
                  const isBold = trimmed.startsWith('**');
                  const cleanText = trimmed.replace(/^\* |\*\*/g, '');

                  const inlineRegex = /\$([^$]+)\$/g;
                  let lastIdx = 0;
                  const parts = [];
                  let match;

                  while ((match = inlineRegex.exec(cleanText)) !== null) {
                    if (match.index > lastIdx) {
                      parts.push(cleanText.substring(lastIdx, match.index));
                    }
                    parts.push(<InlineMath key={match.index} math={match[1]} />);
                    lastIdx = inlineRegex.lastIndex;
                  }

                  if (lastIdx < cleanText.length) {
                    parts.push(cleanText.substring(lastIdx));
                  }

                  return (
                    <p key={idx} className={isBold ? 'font-black text-white pt-2 first:pt-0' : ''}>
                      {parts.length > 0 ? parts : cleanText}
                    </p>
                  );
                })}
              </div>
          </div>

          </div>
        </div>
      )}

    </div>
  );
}
