'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Question {
  id: number;
  text: string;
  category: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

const QUESTIONS: Question[] = [
  // Realistic (R)
  { id: 1, text: "Operating machinery, physical equipment, or power tools.", category: 'R' },
  { id: 2, text: "Building, assembling, or repairing mechanical/physical objects.", category: 'R' },
  { id: 3, text: "Working outdoors, landscaping, or managing agricultural activities.", category: 'R' },
  
  // Investigative (I)
  { id: 4, text: "Analyzing scientific data, solving logic puzzles, or doing research.", category: 'I' },
  { id: 5, text: "Writing code, analyzing complex datasets, or resolving technical bugs.", category: 'I' },
  { id: 6, text: "Conducting laboratory experiments or studying technical scientific concepts.", category: 'I' },

  // Artistic (A)
  { id: 7, text: "Designing visual layouts, graphics, branding, or media assets.", category: 'A' },
  { id: 8, text: "Writing creative literature, blog articles, screenplays, or copywriting.", category: 'A' },
  { id: 9, text: "Developing artistic concepts, painting, sketching, or composing music.", category: 'A' },

  // Social (S)
  { id: 10, text: "Teaching others new concepts, tutoring students, or tutoring in skills.", category: 'S' },
  { id: 11, text: "Helping people in need, volunteering, counseling, or healthcare support.", category: 'S' },
  { id: 12, text: "Facilitating group work, community activities, or team discussions.", category: 'S' },

  // Enterprising (E)
  { id: 13, text: "Leading a project team, developing strategy goals, or managing projects.", category: 'E' },
  { id: 14, text: "Pitching business campaigns, selling products, or negotiating agreements.", category: 'E' },
  { id: 15, text: "Launching a business startup, pitching investments, or planning campaigns.", category: 'E' },

  // Conventional (C)
  { id: 16, text: "Organizing structured files, spreadsheets, databases, or documentation.", category: 'C' },
  { id: 17, text: "Auditing financial accounts, tracking budgets, or data tabulation.", category: 'C' },
  { id: 18, text: "Verifying written reports, checking data for errors, or cataloging records.", category: 'C' },
];

const CATEGORY_NAMES = {
  R: 'Realistic (Doers)',
  I: 'Investigative (Thinkers)',
  A: 'Artistic (Creators)',
  S: 'Social (Helpers)',
  E: 'Enterprising (Persuaders)',
  C: 'Conventional (Organizers)',
};

const CATEGORY_DESCS = {
  R: 'Focuses on working with hands, machinery, tools, and concrete physical objects. Prefers practical, hands-on activities.',
  I: 'Focuses on logic, mathematical analysis, research, and scientific discovery. Prefers intellectual challenges and solving complex puzzles.',
  A: 'Focuses on self-expression, creative innovation, writing, design, and aesthetics. Prefers unstructured environments where imagination is key.',
  S: 'Focuses on cooperation, empathy, teaching, counseling, and helping others. Prefers direct human contact and serving community goals.',
  E: 'Focuses on leadership, strategy planning, persuasion, sales, and management. Prefers competitive, goal-driven business environments.',
  C: 'Focuses on organization, data tracking, accounting, file systems, and accuracy. Prefers structured work with attention to details.',
};

interface ScoreProfile {
  category: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  name: string;
  points: number;
  maxPoints: number;
  percentage: number;
}

interface CareerMatch {
  title: string;
  categoryCode: string;
  desc: string;
}

const CAREER_DATABASE: CareerMatch[] = [
  { title: "Data Scientist / AI Engineer", categoryCode: "IRC", desc: "Builds predictive models, writes analytical algorithms, and structures raw big data for commercial solutions." },
  { title: "UI/UX Designer", categoryCode: "AIE", desc: "Researches user behavior and designs creative interfaces, layout maps, and beautiful application systems." },
  { title: "Mechanical / Robotics Engineer", categoryCode: "RIE", desc: "Designs, models, and builds mechanical devices, automation robots, and hands-on electrical machinery." },
  { title: "Software Architect", categoryCode: "ISE", desc: "Plans large-scale software systems, structures databases, and coordinates project teams to deploy products." },
  { title: "Digital Marketing Strategist", categoryCode: "EAS", desc: "Coordinates marketing campaigns, designs creative ads, and leads sales strategies to pitch products." },
  { title: "Creative Writer / Content Strategist", categoryCode: "AIS", desc: "Drafts engaging content, creative scripts, copy materials, and structures company messaging strategies." },
  { title: "Investment Analyst / Accountant", categoryCode: "CEI", desc: "Tracks financial budgets, audits record books, and structures mathematical risk projections for companies." },
  { title: "Systems Administrator", categoryCode: "CRI", desc: "Maintains files, manages server configurations, and resolves network infrastructure security issues." },
  { title: "Clinical Psychologist / Counselor", categoryCode: "SIA", desc: "Helps patients resolve mental obstacles, coordinates counseling sessions, and performs behavioral studies." },
  { title: "Business Consultant", categoryCode: "EIS", desc: "Analyzes business frameworks, pitches optimization plans, and trains management teams for higher efficiency." },
  { title: "University Lecturer / Teacher", categoryCode: "SIE", desc: "Teaches classes, constructs syllabus materials, and guides student learning paths in research areas." },
  { title: "Database Administrator", categoryCode: "CIS", desc: "Structures database records, maintains data integrity checks, and guarantees secure network operations." },
];

interface CalculationResult {
  scores: ScoreProfile[];
  hollandCode: string; // top 3 letters (e.g. IAS)
  topCategory: string;
  topMatchedCareers: CareerMatch[];
  steps: string[];
}

export default function CareerAssessmentCalculator() {
  const [stage, setStage] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Monitor keyboard key strokes for hotkeys (1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'quiz') return;
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const rating = parseInt(e.key);
        handleSelectRating(rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, currentQuestionIdx, answers]);

  const handleSelectRating = (rating: number) => {
    const activeQ = QUESTIONS[currentQuestionIdx];
    const updatedAnswers = { ...answers, [activeQ.id]: rating };
    setAnswers(updatedAnswers);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Evaluate results on final answer
      evaluateQuiz(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const startQuiz = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setStage('quiz');
    setResult(null);
  };

  const evaluateQuiz = (finalAnswers: Record<number, number>) => {
    const categoryPoints: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', number> = {
      R: 0, I: 0, A: 0, S: 0, E: 0, C: 0,
    };

    QUESTIONS.forEach((q) => {
      const rating = finalAnswers[q.id] || 3; // Default neutral if missing
      categoryPoints[q.category] += rating;
    });

    const maxPointsPerCategory = 3 * 5; // 3 questions * 5 max rating

    // Map to profile array
    const profiles: ScoreProfile[] = Object.keys(categoryPoints).map((catKey) => {
      const pts = categoryPoints[catKey as keyof typeof categoryPoints];
      return {
        category: catKey as any,
        name: CATEGORY_NAMES[catKey as keyof typeof CATEGORY_NAMES],
        points: pts,
        maxPoints: maxPointsPerCategory,
        percentage: parseFloat(((pts / maxPointsPerCategory) * 100).toFixed(1)),
      };
    });

    // Sort by score descending to find top categories
    const sortedProfiles = [...profiles].sort((a, b) => b.points - a.points);
    const topThreeCode = sortedProfiles.slice(0, 3).map((p) => p.category).join('');

    // Dynamic matched career algorithm
    // Checks database for overlapping codes, or outputs default high-matching careers
    let matchedCareers = CAREER_DATABASE.filter((c) => {
      // Must contain at least two of the top categories
      let overlapCount = 0;
      for (let i = 0; i < c.categoryCode.length; i++) {
        if (topThreeCode.includes(c.categoryCode[i])) {
          overlapCount++;
        }
      }
      return overlapCount >= 2;
    });

    // Limit to top 4 matches
    if (matchedCareers.length === 0) {
      // Fallback defaults
      matchedCareers = CAREER_DATABASE.slice(0, 3);
    } else {
      matchedCareers = matchedCareers.slice(0, 4);
    }

    const steps: string[] = [];
    steps.push('**Step 1: Sum ratings (1-5) for each RIASEC dimension (3 questions each)**');
    profiles.forEach((p) => {
      steps.push(`* **${p.name}**: Total Points = $${p.points}$ of $15$ max points`);
    });

    steps.push('\n**Step 2: Calculate percentage score for each category**');
    steps.push('$$\\text{Score}_D = \\frac{\\sum R_i}{5 \\times n} \\times 100\\%$$');
    profiles.forEach((p) => {
      steps.push(`* **${p.category}**: $S = \\frac{${p.points}}{15} \\times 100\\% = ${p.percentage.toFixed(1)}\\%$`);
    });

    steps.push('\n**Step 3: Extract top 3 scoring categories to form Holland Code**');
    const sortedCodeLog = sortedProfiles.map((p) => `${p.category} (${p.percentage}%)`).join(' > ');
    steps.push(`* Ranked Order: **${sortedCodeLog}**`);
    steps.push(`* Your Top 3 Holland Code is **${topThreeCode}**`);

    setResult({
      scores: profiles,
      hollandCode: topThreeCode,
      topCategory: sortedProfiles[0].name,
      topMatchedCareers: matchedCareers,
      steps,
    });
    setStage('results');

    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
    });
  };

  const getRadarSvgData = () => {
    const cx = 100;
    const cy = 100;
    const r = 70;
    const vertices = ['R', 'I', 'A', 'S', 'E', 'C'];
    
    // Angles for R, I, A, S, E, C starting at -90 degrees (pointing up)
    const angles = vertices.map((_, i) => -Math.PI / 2 + (i * Math.PI) / 3);

    // Coordinate grid hexagons (20%, 40%, 60%, 80%, 100%)
    const grids = [0.2, 0.4, 0.6, 0.8, 1.0].map((scaleFactor) => {
      const pts = angles.map((theta) => {
        const x = cx + r * scaleFactor * Math.cos(theta);
        const y = cy + r * scaleFactor * Math.sin(theta);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return pts;
    });

    // Coordinate axis lines
    const axisLines = angles.map((theta) => {
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      return { x, y };
    });

    // Score Polygon Coordinates
    const scoreMap = result ? result.scores : QUESTIONS.reduce((acc, q) => {
      acc[q.category] = 3; // default neutral
      return acc;
    }, {} as Record<string, number>);

    const scoreVertices = vertices.map((v, i) => {
      const pts = result ? result.scores.find((p) => p.category === v)?.points || 9 : 9;
      const scaleFactor = pts / 15; // normalize (0 to 1)
      const theta = angles[i];
      const x = cx + r * scaleFactor * Math.cos(theta);
      const y = cy + r * scaleFactor * Math.sin(theta);
      return { x, y, xStr: x.toFixed(1), yStr: y.toFixed(1) };
    });

    const scorePath = scoreVertices.map((v) => `${v.xStr},${v.yStr}`).join(' ');

    return { cx, cy, r, vertices, angles, grids, axisLines, scoreVertices, scorePath };
  };

  const { cx, cy, vertices, angles, grids, axisLines, scoreVertices, scorePath } = getRadarSvgData();

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      
      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="space-y-6 max-w-2xl mx-auto py-8 text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl mx-auto shadow-md">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Holland Code Career Assessment Test
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Explore your professional interests using the industry-standard RIASEC model. Rate 18 statements describing daily tasks, analytical challenges, creative workflows, and leadership duties to discover your core three-letter Holland Occupational Code.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left pt-2">
            {Object.keys(CATEGORY_NAMES).map((key) => (
              <div key={key} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-slate-900 uppercase block">{CATEGORY_NAMES[key as keyof typeof CATEGORY_NAMES]}</span>
                <p className="text-[9px] text-slate-500 leading-normal font-medium">{CATEGORY_DESCS[key as keyof typeof CATEGORY_DESCS].slice(0, 60)}...</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={startQuiz}
              className="py-3.5 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-md text-sm"
            >
              Start Sourcing Assessment
            </button>
          </div>
        </div>
      )}

      {/* Quiz Stage */}
      {stage === 'quiz' && (
        <div className="space-y-8 max-w-2xl mx-auto py-6">
          
          {/* Progress bar info */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              <span>Section: {CATEGORY_NAMES[QUESTIONS[currentQuestionIdx].category]}</span>
              <span>Question {currentQuestionIdx + 1} of {QUESTIONS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/55">
              <div
                className="h-full bg-slate-900 transition-all duration-300 ease-out"
                style={{ width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Statement box */}
          <div className="p-8 bg-slate-550/5 border border-slate-150 rounded-3xl min-h-[160px] flex items-center justify-center text-center">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug font-display">
              &ldquo;{QUESTIONS[currentQuestionIdx].text}&rdquo;
            </h3>
          </div>

          {/* User selection buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { score: 1, label: 'Strongly Dislike' },
              { score: 2, label: 'Dislike' },
              { score: 3, label: 'Neutral' },
              { score: 4, label: 'Like' },
              { score: 5, label: 'Strongly Like' },
            ].map((option) => (
              <button
                key={option.score}
                type="button"
                onClick={() => handleSelectRating(option.score)}
                className="py-3 px-4 bg-white border border-slate-200 hover:border-slate-900 rounded-xl font-bold text-xs text-slate-800 transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center space-y-1 hover:shadow-sm"
              >
                <span className="text-base font-black text-slate-900">{option.score}</span>
                <span className="text-[9px] text-slate-500 font-extrabold text-center block uppercase tracking-wider">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Navigation Controls and Hotkey Keypad Panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-slate-100">
            
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={handleBack}
              className="py-2.5 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
              <span>Back</span>
            </button>

            {/* Hotkeys helper display */}
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">
                Numeric Hotkeys Enabled:
              </span>
              <div className="flex space-x-1">
                {['1', '2', '3', '4', '5'].map((h) => (
                  <span
                    key={h}
                    className="w-4 h-4 rounded border border-slate-300 bg-white text-[9px] font-black text-slate-500 flex items-center justify-center"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectRating(3)}
              className="py-2.5 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Skip (Neutral)
            </button>
          </div>

        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && result && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Header Summary Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-6 text-left">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Your Career Assessment Profile
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Evaluation results based on the RIASEC Holland Code Model.
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-center shadow-md">
                <span className="text-[9px] font-extrabold uppercase tracking-widest block opacity-75">
                  Holland Code
                </span>
                <span className="text-3xl font-black block mt-0.5 leading-none font-display">
                  {result.hollandCode}
                </span>
              </div>
              <button
                type="button"
                onClick={startQuiz}
                className="py-3 px-5 border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold text-xs text-slate-600 transition-all flex items-center space-x-2 cursor-pointer shrink-0"
              >
                <i className="fas fa-redo text-[10px]"></i>
                <span>Retake Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: SVG Radar Chart */}
            <div className="flex flex-col items-center bg-slate-50 p-6 rounded-3xl border border-slate-200/50 justify-center">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-4">
                RIASEC Interest Radar Graph
              </span>
              
              <div className="relative w-full max-w-[240px]">
                <svg className="w-full h-auto" viewBox="0 0 200 200">
                  {/* Grid Hexagons */}
                  {grids.map((pathStr, idx) => (
                    <polygon
                      key={idx}
                      points={pathStr}
                      className="fill-none stroke-slate-200"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                  ))}
                  
                  {/* Axis lines */}
                  {axisLines.map((line, idx) => (
                    <line
                      key={idx}
                      x1={cx}
                      y1={cy}
                      x2={line.x}
                      y2={line.y}
                      className="stroke-slate-200"
                      strokeWidth="0.8"
                    />
                  ))}

                  {/* Axis Labels */}
                  {vertices.map((v, i) => {
                    const labelRadius = 85;
                    const theta = angles[i];
                    const labelX = cx + labelRadius * Math.cos(theta);
                    const labelY = cy + labelRadius * Math.sin(theta);
                    
                    // Adjust text anchor and baseline alignment based on position
                    let textAnchor = 'middle';
                    if (Math.abs(Math.cos(theta)) > 0.1) {
                      textAnchor = Math.cos(theta) > 0 ? 'start' : 'end';
                    }
                    let alignmentBaseline = 'middle';
                    if (Math.abs(Math.sin(theta)) > 0.8) {
                      alignmentBaseline = Math.sin(theta) > 0 ? 'text-before-edge' : 'text-after-edge';
                    }

                    return (
                      <text
                        key={v}
                        x={labelX}
                        y={labelY}
                        textAnchor={textAnchor as any}
                        alignmentBaseline={alignmentBaseline as any}
                        className="text-[10px] font-black fill-slate-800"
                      >
                        {v}
                      </text>
                    );
                  })}

                  {/* Filled Score Area Polygon */}
                  <polygon
                    points={scorePath}
                    className="fill-slate-900/10 stroke-slate-900"
                    strokeWidth="1.8"
                  />

                  {/* Accent Highlight Circles */}
                  {scoreVertices.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      className="fill-slate-900 stroke-white"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              {/* Quick Info text */}
              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Top Interest Profile</span>
                <span className="text-xs font-black text-slate-800 mt-1 block">{result.topCategory}</span>
              </div>
            </div>

            {/* Right Columns: Core Breakdown & Careers */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* Category Scores Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">
                  Interest Dimension Scores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.scores.map((p) => (
                    <div key={p.category} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span className="font-black">{p.name}</span>
                        <span>{p.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div
                          className="h-full bg-slate-900"
                          style={{ width: `${p.percentage}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-450 leading-normal font-medium">
                        {CATEGORY_DESCS[p.category]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Careers Sourcing Recommendations */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">
                  Top Matched Careers Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.topMatchedCareers.map((c) => (
                    <div key={c.title} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-900">{c.title}</span>
                          <span className="text-[8px] font-black text-slate-450 uppercase border border-slate-250 bg-white px-1.5 py-0.5 rounded-md">
                            Code: {c.categoryCode}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-normal mt-1.5">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mathematical formulation KaTeX steps */}
              <div className="space-y-4 pt-4 border-t border-slate-200/60">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">
                  Step-by-Step Resolution Steps
                </h4>
                <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1 text-xs text-slate-650 leading-relaxed font-medium">
                  {result.steps.map((step, idx) => {
                    if (step.startsWith('$$')) {
                      const latexStr = step.replace(/\$\$/g, '');
                      return (
                        <div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin">
                          <BlockMath math={latexStr} />
                        </div>
                      );
                    }
                    
                    // Match inline math blocks $...$
                    const inlineRegex = /\$([^$]+)\$/g;
                    let lastIdx = 0;
                    const parts = [];
                    let match;

                    while ((match = inlineRegex.exec(step)) !== null) {
                      if (match.index > lastIdx) {
                        parts.push(step.substring(lastIdx, match.index));
                      }
                      parts.push(<InlineMath key={match.index} math={match[1]} />);
                      lastIdx = inlineRegex.lastIndex;
                    }

                    if (lastIdx < step.length) {
                      parts.push(step.substring(lastIdx));
                    }

                    if (step.startsWith('* ')) {
                      return (
                        <div key={idx} className="pl-4 relative flex items-start space-x-1">
                          <span className="select-none">•</span>
                          <span>{parts.length > 0 ? parts : step.substring(2)}</span>
                        </div>
                      );
                    }

                    return (
                      <p key={idx} className={step.startsWith('**') ? 'font-black text-slate-800 pt-2 first:pt-0' : ''}>
                        {parts.length > 0 ? parts : step}
                      </p>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
