'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Isotope {
  id: string;
  name: string;
  mass: string;
  abundance: string;
}

interface CalculationResult {
  solveMode: 'averageMass' | 'abundance';
  // Mode averageMass inputs & results
  isotopes: {
    name: string;
    mass: number;
    abundance: number;
  }[];
  calculatedAverageMass: number;
  totalAbundance: number;
  isNormalized: boolean;

  // Mode abundance inputs & results
  targetAverageMass: number;
  isotope1Mass: number;
  isotope2Mass: number;
  isotope1Abundance: number;
  isotope2Abundance: number;
  isAbundancePhysicallyPossible: boolean;

  steps: string[];
}

interface ElementPreset {
  name: string;
  symbol: string;
  isotopes: { name: string; mass: string; abundance: string }[];
}

const ELEMENT_PRESETS: ElementPreset[] = [
  {
    name: 'Hydrogen',
    symbol: 'H',
    isotopes: [
      { name: 'H-1 (Protium)', mass: '1.007825', abundance: '99.9885' },
      { name: 'H-2 (Deuterium)', mass: '2.014102', abundance: '0.0115' },
    ],
  },
  {
    name: 'Carbon',
    symbol: 'C',
    isotopes: [
      { name: 'C-12', mass: '12.00000', abundance: '98.93' },
      { name: 'C-13', mass: '13.00335', abundance: '1.07' },
    ],
  },
  {
    name: 'Chlorine',
    symbol: 'Cl',
    isotopes: [
      { name: 'Cl-35', mass: '34.96885', abundance: '75.78' },
      { name: 'Cl-37', mass: '36.96590', abundance: '24.22' },
    ],
  },
  {
    name: 'Silicon',
    symbol: 'Si',
    isotopes: [
      { name: 'Si-28', mass: '27.97693', abundance: '92.2297' },
      { name: 'Si-29', mass: '28.97649', abundance: '4.6832' },
      { name: 'Si-30', mass: '29.97377', abundance: '3.0871' },
    ],
  },
  {
    name: 'Copper',
    symbol: 'Cu',
    isotopes: [
      { name: 'Cu-63', mass: '62.92960', abundance: '69.17' },
      { name: 'Cu-65', mass: '64.92779', abundance: '30.83' },
    ],
  },
];

export default function AverageAtomicMassCalculator() {
  const [solveMode, setSolveMode] = useState<'averageMass' | 'abundance'>('averageMass');
  
  // State for Average Mass Mode
  const [isotopes, setIsisotopes] = useState<Isotope[]>([
    { id: '1', name: 'Isotope 1', mass: '34.96885', abundance: '75.78' },
    { id: '2', name: 'Isotope 2', mass: '36.96590', abundance: '24.22' },
  ]);
  
  // State for Abundance Solver Mode
  const [targetAverageMass, setTargetAverageMass] = useState<string>('63.546');
  const [isotope1Mass, setIsotope1Mass] = useState<string>('62.9296');
  const [isotope2Mass, setIsotope2Mass] = useState<string>('64.9278');

  // Keypad navigation
  const [activeField, setActiveField] = useState<{ type: 'isotope'; id: string; field: 'mass' | 'abundance' } | { type: 'abundanceSolver'; field: 'avg' | 'iso1' | 'iso2' }>({
    type: 'isotope',
    id: '1',
    field: 'mass',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Recalculate silently on value changes once user has pressed Calculate
  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [isotopes, targetAverageMass, isotope1Mass, isotope2Mass, solveMode]);

  const recalculateSilently = () => {
    try {
      const calcResult = performCalculation();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const addIsotope = () => {
    if (isotopes.length >= 8) {
      setError('You can add a maximum of 8 isotopes.');
      return;
    }
    const nextId = (Math.max(...isotopes.map((i) => parseInt(i.id))) + 1).toString();
    setIsisotopes([
      ...isotopes,
      { id: nextId, name: `Isotope ${nextId}`, mass: '', abundance: '' },
    ]);
    setError('');
  };

  const removeIsotope = (id: string) => {
    if (isotopes.length <= 2) {
      setError('An element must have at least 2 isotopes to calculate a weighted average.');
      return;
    }
    const updated = isotopes.filter((iso) => iso.id !== id);
    setIsisotopes(updated);
    setError('');
  };

  const updateIsotopeValue = (id: string, field: 'mass' | 'abundance', value: string) => {
    const updated = isotopes.map((iso) => {
      if (iso.id === id) {
        return { ...iso, [field]: value.replace(/[^0-9.]/g, '') };
      }
      return iso;
    });
    setIsisotopes(updated);
    setError('');
  };

  const normalizeAbundances = () => {
    const total = isotopes.reduce((sum, iso) => sum + (parseFloat(iso.abundance) || 0), 0);
    if (total === 0) {
      setError('Cannot normalize abundances when total is 0.');
      return;
    }
    const normalized = isotopes.map((iso) => {
      const currentAb = parseFloat(iso.abundance) || 0;
      const normalizedAb = (currentAb / total) * 100;
      return {
        ...iso,
        abundance: normalizedAb.toFixed(4).replace(/\.?0+$/, ''),
      };
    });
    setIsisotopes(normalized);
    setError('');
    
    // Trigger temporary confetti for user action
    confetti({
      particleCount: 30,
      spread: 30,
      colors: ['#1a1a1a', '#8a8a8a', '#ffffff'],
    });
  };

  const loadPreset = (preset: ElementPreset) => {
    setSolveMode('averageMass');
    const loaded = preset.isotopes.map((iso, idx) => ({
      id: (idx + 1).toString(),
      name: iso.name,
      mass: iso.mass,
      abundance: iso.abundance,
    }));
    setIsisotopes(loaded);
    setError('');
    if (hasCalculated) {
      recalculateSilently();
    }
  };

  const performCalculation = (): CalculationResult => {
    const steps: string[] = [];

    if (solveMode === 'averageMass') {
      const parsedIsotopes = isotopes.map((iso) => ({
        name: iso.name || `Isotope (${iso.mass} u)`,
        mass: parseFloat(iso.mass),
        abundance: parseFloat(iso.abundance),
      }));

      // Validation checks
      parsedIsotopes.forEach((iso, idx) => {
        if (isNaN(iso.mass) || iso.mass <= 0) {
          throw new Error(`Please enter a valid positive mass for isotope row ${idx + 1}.`);
        }
        if (isNaN(iso.abundance) || iso.abundance < 0) {
          throw new Error(`Please enter a valid non-negative abundance for isotope row ${idx + 1}.`);
        }
      });

      const totalAbundance = parsedIsotopes.reduce((sum, iso) => sum + iso.abundance, 0);
      if (totalAbundance === 0) {
        throw new Error('Total isotope abundance cannot be zero.');
      }

      // Check normalization within margin of error
      const isNormalized = Math.abs(totalAbundance - 100) < 1e-3;

      let sumProducts = 0;
      parsedIsotopes.forEach((iso) => {
        sumProducts += iso.mass * (iso.abundance / 100);
      });

      steps.push('**Step 1: Convert isotope abundances to decimal form (divide by 100)**');
      parsedIsotopes.forEach((iso, idx) => {
        steps.push(`* ${iso.name}: Abundance = $${iso.abundance}\\% \\implies \\text{Decimal} = \\frac{${iso.abundance}}{100} = ${(iso.abundance / 100).toFixed(6)}$`);
      });

      steps.push('\n**Step 2: Multiply each isotope\'s mass by its decimal abundance**');
      parsedIsotopes.forEach((iso) => {
        const weightedContribution = iso.mass * (iso.abundance / 100);
        steps.push(`* ${iso.name}: $${iso.mass.toFixed(6)}\\text{ u} \\times ${(iso.abundance / 100).toFixed(6)} = ${weightedContribution.toFixed(6)}\\text{ u}$`);
      });

      steps.push('\n**Step 3: Sum the weighted contributions to find Average Atomic Mass**');
      steps.push('The fundamental average atomic mass equation is:');
      steps.push('$$M_{\\text{avg}} = \\sum (m_i \\times A_i)$$');
      
      const summationTerms = parsedIsotopes.map(iso => `(${iso.mass.toFixed(5)} \\times ${(iso.abundance / 100).toFixed(4)})`).join(' + ');
      steps.push(`$$M_{\\text{avg}} = ${summationTerms}$$`);
      
      steps.push(`$$M_{\\text{avg}} = ${sumProducts.toFixed(6)}\\text{ u}$$`);

      if (!isNormalized) {
        steps.push('\n**Note on Abundance Normalization**:');
        steps.push(`The input abundances sum to **${totalAbundance.toFixed(2)}%** instead of exactly **100%**.`);
        steps.push(`The calculator scales the abundances proportionally: $P_{\\text{scaled}} = \\frac{P_{\\text{input}}}{\\text{Total Abundance}}$.`);
        
        let correctedAvg = 0;
        parsedIsotopes.forEach((iso) => {
          correctedAvg += iso.mass * (iso.abundance / totalAbundance);
        });
        
        steps.push(`Normalized Average Atomic Mass:`);
        steps.push(`$$M_{\\text{avg, normalized}} = \\sum \\left( m_i \\times \\frac{\\text{Abundance}_i}{\\text{Total}} \\right) = ${correctedAvg.toFixed(6)}\\text{ u}$$`);
        
        return {
          solveMode,
          isotopes: parsedIsotopes,
          calculatedAverageMass: correctedAvg,
          totalAbundance,
          isNormalized,
          targetAverageMass: 0,
          isotope1Mass: 0,
          isotope2Mass: 0,
          isotope1Abundance: 0,
          isotope2Abundance: 0,
          isAbundancePhysicallyPossible: true,
          steps,
        };
      }

      return {
        solveMode,
        isotopes: parsedIsotopes,
        calculatedAverageMass: sumProducts,
        totalAbundance,
        isNormalized,
        targetAverageMass: 0,
        isotope1Mass: 0,
        isotope2Mass: 0,
        isotope1Abundance: 0,
        isotope2Abundance: 0,
        isAbundancePhysicallyPossible: true,
        steps,
      };
    } else {
      // Solve Isotope Abundances Mode
      const avg = parseFloat(targetAverageMass);
      const iso1 = parseFloat(isotope1Mass);
      const iso2 = parseFloat(isotope2Mass);

      if (isNaN(avg) || avg <= 0) throw new Error('Please enter a valid positive target average mass.');
      if (isNaN(iso1) || iso1 <= 0) throw new Error('Please enter a valid positive mass for Isotope 1.');
      if (isNaN(iso2) || iso2 <= 0) throw new Error('Please enter a valid positive mass for Isotope 2.');
      if (iso1 === iso2) throw new Error('Isotopes must have different mass values to solve for fractional abundances.');

      // System of linear equations:
      // m1 * A1 + m2 * A2 = avg
      // A1 + A2 = 1.0 => A2 = 1.0 - A1
      // m1 * A1 + m2 * (1.0 - A1) = avg
      // A1 * (m1 - m2) + m2 = avg
      // A1 = (avg - m2) / (m1 - m2)
      
      const a1 = (avg - iso2) / (iso1 - iso2);
      const a2 = 1.0 - a1;

      const isAbundancePhysicallyPossible = a1 >= 0 && a1 <= 1.0 && a2 >= 0 && a2 <= 1.0;

      steps.push('**Step 1: Set up the system of linear equations**');
      steps.push(`Let $A_1$ be the abundance of Isotope 1 ($${iso1}\\text{ u}$), and $A_2$ be the abundance of Isotope 2 ($${iso2}\\text{ u}$).`);
      steps.push('The abundances must sum to 100% (fractional 1.0) and yield the target average mass:');
      steps.push('$$\\begin{cases} A_1 + A_2 = 1.0 \\\\ ' + iso1 + ' A_1 + ' + iso2 + ' A_2 = ' + avg + ' \\end{cases}$$');

      steps.push('\n**Step 2: Solve the system by substitution**');
      steps.push('Substitute $A_2 = 1.0 - A_1$ into the second equation:');
      steps.push(`$$${iso1} A_1 + ${iso2}(1.0 - A_1) = ${avg}$$`);
      steps.push(`$$A_1 (${iso1} - ${iso2}) + ${iso2} = ${avg}$$`);
      steps.push(`$$A_1 (${(iso1 - iso2).toFixed(5)}) = ${avg} - ${iso2}$$`);
      steps.push(`$$A_1 = \\frac{${(avg - iso2).toFixed(5)}}{${(iso1 - iso2).toFixed(5)}}$$`);
      
      steps.push('\n**Step 3: Solve for $A_1$ and $A_2$**');
      steps.push(`$$A_1 = ${a1.toFixed(6)} \\implies A_1 = ${(a1 * 100).toFixed(4)}\\%$$`);
      steps.push(`$$A_2 = 1.0 - A_1 = ${(1.0 - a1).toFixed(6)} \\implies A_2 = ${(a2 * 100).toFixed(4)}\\%$$`);

      if (!isAbundancePhysicallyPossible) {
        steps.push('\n**Caution/Error Note**:');
        steps.push(`The solved abundances are mathematically calculated but **physically impossible** (abundances must be between 0% and 100%).`);
        steps.push(`This occurs because the target average mass ($${avg}\\text{ u}$) does not fall between the masses of the two isotopes ($${iso1}\\text{ u}$ and $${iso2}\\text{ u}$).`);
      }

      return {
        solveMode,
        isotopes: [
          { name: 'Isotope 1', mass: iso1, abundance: a1 * 100 },
          { name: 'Isotope 2', mass: iso2, abundance: a2 * 100 },
        ],
        calculatedAverageMass: avg,
        totalAbundance: 100,
        isNormalized: true,
        targetAverageMass: avg,
        isotope1Mass: iso1,
        isotope2Mass: iso2,
        isotope1Abundance: a1 * 100,
        isotope2Abundance: a2 * 100,
        isAbundancePhysicallyPossible,
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
      setError('');

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

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
    setSolveMode('averageMass');
    setIsisotopes([
      { id: '1', name: 'Isotope 1', mass: '34.96885', abundance: '75.78' },
      { id: '2', name: 'Isotope 2', mass: '36.96590', abundance: '24.22' },
    ]);
    setTargetAverageMass('63.546');
    setIsotope1Mass('62.9296');
    setIsotope2Mass('64.9278');
    setActiveField({ type: 'isotope', id: '1', field: 'mass' });
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    setError('');
    
    // Mode A: Isotope Input Card
    if (activeField.type === 'isotope') {
      const activeIso = isotopes.find((i) => i.id === activeField.id);
      if (!activeIso) return;
      
      let currentVal = activeField.field === 'mass' ? activeIso.mass : activeIso.abundance;
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

      updateIsotopeValue(activeField.id, activeField.field, newVal);
    } 
    // Mode B: Abundance Solver Input Card
    else {
      let currentVal = '';
      let setVal: (v: string) => void;

      if (activeField.field === 'avg') {
        currentVal = targetAverageMass;
        setVal = setTargetAverageMass;
      } else if (activeField.field === 'iso1') {
        currentVal = isotope1Mass;
        setVal = setIsotope1Mass;
      } else {
        currentVal = isotope2Mass;
        setVal = setIsotope2Mass;
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
    if (activeField.type === 'isotope') {
      const activeIso = isotopes.find((i) => i.id === activeField.id);
      if (!activeIso) return;
      
      const currentVal = parseFloat(activeField.field === 'mass' ? activeIso.mass : activeIso.abundance) || 0;
      const newVal = Math.max(0, currentVal + amount);
      updateIsotopeValue(activeField.id, activeField.field, newVal.toString());
    } else {
      let currentVal = 0;
      let setVal: (v: string) => void;

      if (activeField.field === 'avg') {
        currentVal = parseFloat(targetAverageMass) || 0;
        setVal = setTargetAverageMass;
      } else if (activeField.field === 'iso1') {
        currentVal = parseFloat(isotope1Mass) || 0;
        setVal = setIsotope1Mass;
      } else {
        currentVal = parseFloat(isotope2Mass) || 0;
        setVal = setIsotope2Mass;
      }

      const newVal = Math.max(0, currentVal + amount);
      setVal(newVal.toString());
    }
  };

  // SVG Visualizer Parameter Calculations
  const getVisualizerData = () => {
    let list: { mass: number; abundance: number; name: string }[] = [];
    let avgMass = 0;

    if (result) {
      list = result.isotopes.map((iso) => ({
        mass: iso.mass,
        abundance: iso.abundance,
        name: iso.name,
      }));
      avgMass = result.calculatedAverageMass;
    } else {
      // Fallback draft values
      if (solveMode === 'averageMass') {
        list = isotopes.map((iso) => ({
          mass: parseFloat(iso.mass) || 0,
          abundance: parseFloat(iso.abundance) || 0,
          name: iso.name,
        }));
        const totalAb = list.reduce((s, i) => s + i.abundance, 0);
        avgMass = totalAb > 0 ? list.reduce((s, i) => s + i.mass * (i.abundance / 100), 0) : 0;
      } else {
        const avg = parseFloat(targetAverageMass) || 0;
        const iso1 = parseFloat(isotope1Mass) || 0;
        const iso2 = parseFloat(isotope2Mass) || 0;
        const a1 = (iso1 - iso2) !== 0 ? (avg - iso2) / (iso1 - iso2) : 0.5;
        list = [
          { name: 'Isotope 1', mass: iso1, abundance: a1 * 100 },
          { name: 'Isotope 2', mass: iso2, abundance: (1 - a1) * 100 },
        ];
        avgMass = avg;
      }
    }

    // Filter valid entries
    const valid = list.filter((i) => i.mass > 0 && i.abundance >= 0);
    if (valid.length === 0) return { list: [], avgMass: 0, minM: 0, maxM: 10, maxAb: 100 };

    const masses = valid.map((i) => i.mass);
    if (avgMass > 0) masses.push(avgMass);
    
    let minM = Math.min(...masses);
    let maxM = Math.max(...masses);
    const maxAb = Math.max(...valid.map((i) => i.abundance), 10);

    // Padding for X axis
    const diff = maxM - minM;
    if (diff === 0) {
      minM -= 2;
      maxM += 2;
    } else {
      minM -= diff * 0.15;
      maxM += diff * 0.15;
    }

    return { list: valid, avgMass, minM, maxM, maxAb };
  };

  const { list: vizList, avgMass: vizAvg, minM, maxM, maxAb } = getVisualizerData();

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Scope Mode Selector & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Solve Target Parameter
          </span>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full mt-1.5 w-fit">
            {[
              { id: 'averageMass', label: 'Average Atomic Mass' },
              { id: 'abundance', label: 'Isotope Abundances (2-Isotope)' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setSolveMode(mode.id as any);
                  // Setup active field defaults for new mode
                  if (mode.id === 'averageMass') {
                    setActiveField({ type: 'isotope', id: '1', field: 'mass' });
                  } else {
                    setActiveField({ type: 'abundanceSolver', field: 'avg' });
                  }
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  solveMode === mode.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-955'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Natural Isotopes Presets Panel */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
            Isotope Preset Profiles
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {ELEMENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => loadPreset(preset)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-slate-350 transition-all text-slate-700"
              >
                {preset.symbol} ({preset.name})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Editor */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            
            {solveMode === 'averageMass' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">Isotope List</h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={normalizeAbundances}
                      className="px-3 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all text-slate-600"
                    >
                      Normalize to 100%
                    </button>
                    <button
                      type="button"
                      onClick={addIsotope}
                      className="px-3 py-1 text-[10px] font-bold bg-slate-900 rounded-lg text-white hover:bg-slate-800 transition-all"
                    >
                      + Add Isotope
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin divide-y divide-slate-100">
                  {isotopes.map((iso, idx) => {
                    const isMassActive = activeField.type === 'isotope' && activeField.id === iso.id && activeField.field === 'mass';
                    const isAbActive = activeField.type === 'isotope' && activeField.id === iso.id && activeField.field === 'abundance';

                    return (
                      <div
                        key={iso.id}
                        className="grid grid-cols-12 gap-3 items-center py-2.5 first:pt-0"
                      >
                        <div className="col-span-3 text-left">
                          <input
                            type="text"
                            value={iso.name}
                            onChange={(e) => {
                              const updated = isotopes.map((i) => i.id === iso.id ? { ...i, name: e.target.value } : i);
                              setIsisotopes(updated);
                            }}
                            placeholder={`Isotope ${idx + 1}`}
                            className="w-full bg-transparent text-xs font-extrabold text-slate-900 border-none focus:outline-none focus:ring-0 p-0"
                          />
                        </div>

                        {/* Mass Input */}
                        <div
                          onClick={() => setActiveField({ type: 'isotope', id: iso.id, field: 'mass' })}
                          className={`col-span-4 bg-white border p-2 rounded-xl text-left cursor-pointer transition-all ${
                            isMassActive ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-350'
                          }`}
                        >
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Mass (u)</span>
                          <input
                            type="text"
                            readOnly
                            value={iso.mass}
                            className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                          />
                        </div>

                        {/* Abundance Input */}
                        <div
                          onClick={() => setActiveField({ type: 'isotope', id: iso.id, field: 'abundance' })}
                          className={`col-span-4 bg-white border p-2 rounded-xl text-left cursor-pointer transition-all ${
                            isAbActive ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-350'
                          }`}
                        >
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Abundance (%)</span>
                          <input
                            type="text"
                            readOnly
                            value={iso.abundance}
                            className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                          />
                        </div>

                        {/* Remove Action */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            disabled={isotopes.length <= 2}
                            onClick={() => removeIsotope(iso.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 bg-slate-550/5 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                          >
                            <i className="fas fa-trash-alt text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Abundance Solver Mode
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Target Average Mass */}
                <div
                  onClick={() => setActiveField({ type: 'abundanceSolver', field: 'avg' })}
                  className={`bg-white border p-4 rounded-xl text-left cursor-pointer transition-all ${
                    activeField.type === 'abundanceSolver' && activeField.field === 'avg'
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Target Average Mass</span>
                  <input
                    type="text"
                    readOnly
                    value={targetAverageMass}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer mt-1"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block mt-1">u (unified units)</span>
                </div>

                {/* Isotope 1 Mass */}
                <div
                  onClick={() => setActiveField({ type: 'abundanceSolver', field: 'iso1' })}
                  className={`bg-white border p-4 rounded-xl text-left cursor-pointer transition-all ${
                    activeField.type === 'abundanceSolver' && activeField.field === 'iso1'
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Isotope 1 Mass</span>
                  <input
                    type="text"
                    readOnly
                    value={isotope1Mass}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer mt-1"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block mt-1">u (unified units)</span>
                </div>

                {/* Isotope 2 Mass */}
                <div
                  onClick={() => setActiveField({ type: 'abundanceSolver', field: 'iso2' })}
                  className={`bg-white border p-4 rounded-xl text-left cursor-pointer transition-all ${
                    activeField.type === 'abundanceSolver' && activeField.field === 'iso2'
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Isotope 2 Mass</span>
                  <input
                    type="text"
                    readOnly
                    value={isotope2Mass}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer mt-1"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block mt-1">u (unified units)</span>
                </div>

              </div>
            )}

            {/* Tactile Keypad Controls */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Numeric Pad Modifier
                </span>
                
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => adjustValue(1)}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-white hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                  >
                    +1.0
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustValue(-1)}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-white hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                  >
                    -1.0
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustValue(0.1)}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-white hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                  >
                    +0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustValue(-0.1)}
                    className="px-2 py-0.5 text-[9px] font-extrabold border border-slate-200 rounded bg-white hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                  >
                    -0.1
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 w-full">
                {['7', '8', '9', 'clear'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardInput(key)}
                    className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                      key === 'clear' ? 'text-rose-600 text-[10px] uppercase' : 'text-slate-800 text-sm'
                    }`}
                  >
                    {key === 'clear' ? 'Clear' : key}
                  </button>
                ))}
                {['4', '5', '6', '.'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardInput(key)}
                    className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
                  >
                    {key}
                  </button>
                ))}
                {['1', '2', '3', 'back'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyboardInput(key)}
                    className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                      key === 'back' ? 'text-slate-550 text-xs' : 'text-slate-800 text-sm'
                    }`}
                  >
                    {key === 'back' ? '⌫' : key}
                  </button>
                ))}
                {['0', 'dummy1', 'dummy2', 'dummy3'].map((key) => {
                  if (key.startsWith('dummy')) {
                    return <div key={key} className="h-11" />;
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeyboardInput(key)}
                      className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculations Button */}
            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
              >
                Calculate Atomic Mass Properties
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm"
              >
                Reset
              </button>
            </div>

          </form>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column - Mass Spectrum & Balance Visualizer */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-5 flex flex-col space-y-4">
          <div className="border-b border-slate-250 pb-2 text-left">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Isotopic Distribution & Balance
            </span>
            <span className="text-[9px] text-slate-450 font-medium">
              Real-time spectrum peaks and center-of-mass balance point.
            </span>
          </div>

          <div className="w-full flex-1 min-h-[300px] flex items-center justify-center relative">
            {vizList.length > 0 ? (
              <svg viewBox="0 0 400 320" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-xl overflow-hidden block">
                
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="40" y2="220" stroke="#1f1f1f" strokeWidth="1" />
                <line x1="40" y1="220" x2="380" y2="220" stroke="#1f1f1f" strokeWidth="1.5" />
                
                {/* Grid Horizontal Ticks */}
                {[0, 25, 50, 75, 100].map((t) => {
                  const y = 220 - (t / 100) * 180;
                  return (
                    <g key={t} className="opacity-40">
                      <line x1="35" y1={y} x2="380" y2={y} stroke="#222" strokeWidth="0.5" strokeDasharray="2 2" />
                      <text x="30" y={y + 3} fill="#666" fontSize="8" fontFamily="monospace" textAnchor="end">{t}%</text>
                    </g>
                  );
                })}

                {/* Y-Axis Label */}
                <text x="12" y="120" fill="#444" fontSize="8" fontFamily="sans-serif" transform="rotate(-90,12,120)" textAnchor="middle" fontWeight="bold">
                  ABUNDANCE (%)
                </text>

                {/* Draw Isotope Peaks (Mass Spectrometer Analogy) */}
                {vizList.map((iso, idx) => {
                  const xPct = (iso.mass - minM) / (maxM - minM);
                  const x = 50 + xPct * 300;
                  const yVal = 220 - (iso.abundance / maxAb) * 170;

                  return (
                    <g key={idx} className="group">
                      {/* Peak line */}
                      <line
                        x1={x}
                        y1="220"
                        x2={x}
                        y2={yVal}
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeDasharray={solveMode === 'abundance' && !result?.isAbundancePhysicallyPossible ? '3 3' : 'none'}
                        className="drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                      />
                      {/* Peak dot */}
                      <circle
                        cx={x}
                        cy={yVal}
                        r="4.5"
                        fill="#ffffff"
                        className="drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                      />
                      {/* Isotope label */}
                      <text
                        x={x}
                        y={yVal - 8}
                        fill="#888"
                        fontSize="7"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {iso.abundance.toFixed(1)}%
                      </text>
                      <text
                        x={x}
                        y="232"
                        fill="#ffffff"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {iso.mass.toFixed(2)} u
                      </text>
                    </g>
                  );
                })}

                {/* Center of Mass Balance Pivot Section */}
                {vizAvg > 0 && (
                  <g>
                    {/* Pivot beam */}
                    <line x1="40" y1="265" x2="380" y2="265" stroke="#444" strokeWidth="2" />
                    
                    {/* Pivot triangle */}
                    {(() => {
                      const xPct = (vizAvg - minM) / (maxM - minM);
                      const pivotX = 50 + xPct * 300;
                      return (
                        <g>
                          {/* Triangle Pivot */}
                          <polygon
                            points={`${pivotX},265 ${pivotX - 10},285 ${pivotX + 10},285`}
                            fill="#8a8a8a"
                            stroke="#555"
                            strokeWidth="1"
                          />
                          {/* Average Mass Line Marker */}
                          <line
                            x1={pivotX}
                            y1="220"
                            x2={pivotX}
                            y2="265"
                            stroke="#8a8a8a"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                          {/* Weighted Center text overlay */}
                          <rect
                            x={pivotX - 45}
                            y="288"
                            width="90"
                            height="16"
                            rx="4"
                            fill="#111"
                            stroke="#444"
                            strokeWidth="0.5"
                          />
                          <text
                            x={pivotX}
                            y="299"
                            fill="#ffffff"
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            Avg: {vizAvg.toFixed(4)} u
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}

                {/* X-Axis label */}
                <text x="210" y="246" fill="#444" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                  ISOTOPE MASS (u)
                </text>
              </svg>
            ) : (
              <div className="text-slate-400 font-mono text-xs">Enter valid isotope masses to display chart.</div>
            )}
          </div>
        </div>

      </div>

      {/* Calculated Results Block */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">ATOM</span>
          </div>

          <div className="relative z-10 space-y-8 text-left">
            <div className="text-center pb-4 border-b border-slate-800/80">
              <h3 className="text-lg font-extrabold text-white font-display">
                Calculated Isotopic Results
              </h3>
              {solveMode === 'abundance' && !result.isAbundancePhysicallyPossible && (
                <div className="max-w-md mx-auto mt-3 py-1 px-3 bg-amber-900/40 border border-amber-700/50 text-amber-300 text-[10px] rounded-lg font-bold flex items-center justify-center space-x-1.5 animate-pulse">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>Caution: Calculated abundances are mathematically correct but physically impossible.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Average Atomic Mass
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  {result.calculatedAverageMass.toFixed(5)} u
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-1">
                  {solveMode === 'averageMass' ? 'Weighted average of elements' : 'Input target criteria'}
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  {solveMode === 'averageMass' ? 'Main Isotope Contribution' : 'Isotope 1 Abundance'}
                </span>
                <span className="text-xl font-black text-white font-mono">
                  {result.isotopes[0].abundance.toFixed(4)}%
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-1">
                  Mass: {result.isotopes[0].mass.toFixed(5)} u
                </span>
              </div>

              <div className="bg-white/5 border border-slate-700/50 p-5 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  {solveMode === 'averageMass' ? `Isotope 2 Contribution` : 'Isotope 2 Abundance'}
                </span>
                <span className="text-xl font-black text-white font-mono">
                  {result.isotopes[1].abundance.toFixed(4)}%
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-1">
                  Mass: {result.isotopes[1].mass.toFixed(5)} u
                </span>
              </div>
            </div>

            {solveMode === 'averageMass' && result.isotopes.length > 2 && (
              <div className="bg-white/5 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                    Full Isotope Breakdown Table
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Total abundance: {result.totalAbundance.toFixed(2)}%</span>
                </div>
                <div className="divide-y divide-slate-700/50 font-mono text-xs">
                  {result.isotopes.map((iso, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex justify-between items-center">
                      <span className="font-extrabold text-white">{iso.name}</span>
                      <div className="flex space-x-6">
                        <div><span className="text-slate-400 text-[10px]">MASS:</span> {iso.mass.toFixed(5)} u</div>
                        <div><span className="text-slate-400 text-[10px]">ABUNDANCE:</span> {iso.abundance.toFixed(4)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mathematical Step-by-Step KaTeX Math */}
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 border-b border-slate-700/50 pb-1">
                Step-by-Step Mathematical Calculations
              </h4>
              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                {result.steps.map((step, idx) => {
                  if (step.startsWith('$$')) {
                    const formula = step.replace(/\$\$/g, '');
                    return (
                      <div key={idx} className="my-2.5 overflow-x-auto">
                        <BlockMath math={formula} />
                      </div>
                    );
                  }

                  const inlineMathRegex = /\$(.*?)\$/g;
                  let formattedText = step.split('\n').map((line, lIdx) => {
                    let temp = line;
                    const parts = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = inlineMathRegex.exec(line)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(line.substring(lastIndex, match.index));
                      }
                      parts.push(<InlineMath key={match.index} math={match[1]} />);
                      lastIndex = inlineMathRegex.lastIndex;
                    }
                    if (lastIndex < line.length) {
                      parts.push(line.substring(lastIndex));
                    }

                    return (
                      <span key={lIdx} className="block mt-1">
                        {parts.map((p, pIdx) => {
                          if (typeof p === 'string') {
                            const subparts = [];
                            let subLastIndex = 0;
                            let subMatch;
                            const bRegex = /\*\*(.*?)\*\*/g;
                            while ((subMatch = bRegex.exec(p)) !== null) {
                              if (subMatch.index > subLastIndex) {
                                subparts.push(p.substring(subLastIndex, subMatch.index));
                              }
                              subparts.push(<strong key={subMatch.index} className="text-white font-extrabold">{subMatch[1]}</strong>);
                              subLastIndex = bRegex.lastIndex;
                            }
                            if (subLastIndex < p.length) {
                              subparts.push(p.substring(subLastIndex));
                            }
                            return <React.Fragment key={pIdx}>{subparts}</React.Fragment>;
                          }
                          return p;
                        })}
                      </span>
                    );
                  });

                  return <div key={idx}>{formattedText}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
