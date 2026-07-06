'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface ZodiacInfo {
  name: string; symbol: string; element: string; quality: string; planet: string;
  traits: string; compatibility: string[];
}

interface MoonInfo {
  phase: string; lunarAge: number; illumination: number; emoji: string;
}

interface CalcResult {
  zodiac: ZodiacInfo;
  moon: MoonInfo;
  todayMoon: MoonInfo;
  chineseZodiac: { animal: string; emoji: string };
  steps: string[];
}

const ZODIAC_SIGNS: ZodiacInfo[] = [
  { name: 'Capricorn', symbol: '\u2651', element: 'Earth', quality: 'Cardinal', planet: 'Saturn', traits: 'Disciplined, responsible, and ambitious. Strategic builders of lasting success.', compatibility: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'] },
  { name: 'Aquarius', symbol: '\u2652', element: 'Air', quality: 'Fixed', planet: 'Uranus', traits: 'Innovative, humanitarian, and progressive. Visionaries who think outside the box.', compatibility: ['Gemini', 'Libra', 'Aries', 'Sagittarius'] },
  { name: 'Pisces', symbol: '\u2653', element: 'Water', quality: 'Mutable', planet: 'Neptune', traits: 'Compassionate, artistic, and intuitive. Deeply empathetic with a rich inner world.', compatibility: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'] },
  { name: 'Aries', symbol: '\u2648', element: 'Fire', quality: 'Cardinal', planet: 'Mars', traits: 'Bold, ambitious, and energetic. Natural leaders who thrive on challenge.', compatibility: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'] },
  { name: 'Taurus', symbol: '\u2649', element: 'Earth', quality: 'Fixed', planet: 'Venus', traits: 'Reliable, patient, and practical. Lovers of comfort and beauty.', compatibility: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'] },
  { name: 'Gemini', symbol: '\u264A', element: 'Air', quality: 'Mutable', planet: 'Mercury', traits: 'Adaptable, curious, and communicative. Quick-witted social butterflies.', compatibility: ['Libra', 'Aquarius', 'Aries', 'Leo'] },
  { name: 'Cancer', symbol: '\u264B', element: 'Water', quality: 'Cardinal', planet: 'Moon', traits: 'Intuitive, emotional, and nurturing. Deeply connected to home and family.', compatibility: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'] },
  { name: 'Leo', symbol: '\u264C', element: 'Fire', quality: 'Fixed', planet: 'Sun', traits: 'Confident, charismatic, and generous. Natural performers who love center stage.', compatibility: ['Aries', 'Sagittarius', 'Gemini', 'Libra'] },
  { name: 'Virgo', symbol: '\u264D', element: 'Earth', quality: 'Mutable', planet: 'Mercury', traits: 'Analytical, detail-oriented, and helpful. Perfectionists with a heart of service.', compatibility: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'] },
  { name: 'Libra', symbol: '\u264E', element: 'Air', quality: 'Cardinal', planet: 'Venus', traits: 'Diplomatic, charming, and fair-minded. Seekers of balance and harmony.', compatibility: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'] },
  { name: 'Scorpio', symbol: '\u264F', element: 'Water', quality: 'Fixed', planet: 'Pluto', traits: 'Passionate, resourceful, and determined. Mysterious with intense emotional depth.', compatibility: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'] },
  { name: 'Sagittarius', symbol: '\u2650', element: 'Fire', quality: 'Mutable', planet: 'Jupiter', traits: 'Adventurous, optimistic, and independent. Freedom-loving explorers at heart.', compatibility: ['Aries', 'Leo', 'Libra', 'Aquarius'] },
];

const CHINESE_ZODIAC = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
const CHINESE_EMOJI = ['\uD83D\uDC35', '\uD83D\uDC13', '\uD83D\uDC36', '\uD83D\uDC37', '\uD83D\uDC00', '\uD83D\uDC02', '\uD83D\uDC05', '\uD83D\uDC07', '\uD83D\uDC32', '\uD83D\uDC0D', '\uD83D\uDC0E', '\uD83D\uDC10'];

const MOON_PHASES = [
  { min: 0, max: 1.845, name: 'New Moon', emoji: '\uD83C\uDF11' },
  { min: 1.845, max: 5.537, name: 'Waxing Crescent', emoji: '\uD83C\uDF12' },
  { min: 5.537, max: 9.23, name: 'First Quarter', emoji: '\uD83C\uDF13' },
  { min: 9.23, max: 12.922, name: 'Waxing Gibbous', emoji: '\uD83C\uDF14' },
  { min: 12.922, max: 16.615, name: 'Full Moon', emoji: '\uD83C\uDF15' },
  { min: 16.615, max: 20.307, name: 'Waning Gibbous', emoji: '\uD83C\uDF16' },
  { min: 20.307, max: 24.0, name: 'Last Quarter', emoji: '\uD83C\uDF17' },
  { min: 24.0, max: 29.53, name: 'Waning Crescent', emoji: '\uD83C\uDF18' },
];

function julianDay(y: number, m: number, d: number): number {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function getMoon(y: number, m: number, d: number): MoonInfo {
  const jd = julianDay(y, m, d);
  const newMoonRef = 2451549.5;
  const lunarCycle = 29.53058867;
  const daysSinceRef = jd - newMoonRef;
  const lunarAge = ((daysSinceRef % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = (1 - Math.cos(lunarAge / lunarCycle * 2 * Math.PI)) / 2;
  const phase = MOON_PHASES.find(p => lunarAge >= p.min && lunarAge < p.max) || MOON_PHASES[0];
  return { phase: phase.name, lunarAge, illumination, emoji: phase.emoji };
}

function getZodiac(m: number, d: number): ZodiacInfo {
  const boundaries = [21, 20, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  const idx = (d < boundaries[m - 1] ? m - 1 : m) % 12;
  return ZODIAC_SIGNS[idx];
}

function getChineseZodiac(y: number): { animal: string; emoji: string } {
  const idx = ((y % 12) + 12) % 12;
  return { animal: CHINESE_ZODIAC[idx], emoji: CHINESE_EMOJI[idx] };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CURR_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => CURR_YEAR - i);

const ELEMENT_COLORS: Record<string, string> = { Fire: '#f97316', Earth: '#65a30d', Air: '#0ea5e9', Water: '#6366f1' };

export default function ZodiacMoonPhaseCalculator() {
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(2000);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    if (!month || !day || !year) { setError('Please select a valid date.'); return; }
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) { setError(`Invalid date: ${MONTHS[month - 1]} ${year} only has ${daysInMonth} days.`); return; }
    if (year < 1900 || year > CURR_YEAR) { setError(`Year must be between 1900 and ${CURR_YEAR}.`); return; }

    const zodiac = getZodiac(month, day);
    const moon = getMoon(year, month, day);
    const today = new Date();
    const todayMoon = getMoon(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const chineseZodiac = getChineseZodiac(year);

    const steps: string[] = [];
    steps.push('**Step 1: Determine Zodiac Sign**');
    steps.push('The zodiac sign is determined by the month and day of birth based on traditional tropical astrology date boundaries.');
    steps.push(`* ${MONTHS[month - 1]} ${day}, ${year} falls under **${zodiac.symbol} ${zodiac.name}**`);
    steps.push(`* Element: ${zodiac.element} | Quality: ${zodiac.quality} | Ruling Planet: ${zodiac.planet}`);
    steps.push('**Step 2: Calculate Julian Day Number**');
    steps.push(`$$JD = \\left\\lfloor 365.25(y + 4716) \\right\\rfloor + \\left\\lfloor 30.6001(m + 1) \\right\\rfloor + d + B - 1524.5$$`);
    const jd = julianDay(year, month, day);
    steps.push(`* $JD(${year}, ${month}, ${day}) = ${jd.toFixed(2)}$`);
    steps.push('**Step 3: Compute Lunar Age**');
    steps.push('$$\\text{Lunar Age} = (JD - \\text{New Moon Ref}) \\bmod 29.53058867$$');
    const newMoonRef = 2451549.5;
    const daysSinceRef = jd - newMoonRef;
    const lunarAge = ((daysSinceRef % 29.53058867) + 29.53058867) % 29.53058867;
    steps.push(`* Lunar Age: ${lunarAge.toFixed(4)} days since the last new moon`);
    steps.push('**Step 4: Derive Moon Phase and Illumination**');
    steps.push('$$\\text{Illumination} = \\frac{1 - \\cos(\\theta)}{2}, \\quad \\theta = \\frac{\\text{Lunar Age} \\times 2\\pi}{29.53}$$');
    const illumination = (1 - Math.cos(lunarAge / 29.53058867 * 2 * Math.PI)) / 2;
    steps.push(`* Phase: **${moon.emoji} ${moon.phase}**`);
    steps.push(`* Illumination: **${(illumination * 100).toFixed(1)}%**`);
    steps.push(`* Today\'s Moon: ${todayMoon.emoji} ${todayMoon.phase} (${(todayMoon.illumination * 100).toFixed(1)}% illuminated)`);

    setResult({ zodiac, moon, todayMoon, chineseZodiac, steps });
    setError('');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#1a1a1a', '#ffffff', '#8a8a8a'] });
  };

  const handleDayChange = (d: number) => {
    setDay(d);
    setError('');
  };

  const elementColor = result ? ELEMENT_COLORS[result.zodiac.element] || '#6366f1' : '#6366f1';

  const MoonDisk = ({ phase, illumination, size }: { phase: string; illumination: number; size: number }) => {
    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    const isWaxing = phase.includes('Waxing') || phase === 'New Moon' || phase === 'First Quarter';
    const termX = (1 - illumination) * r * (isWaxing ? 1 : -1);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs><clipPath id="mc"><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
        <circle cx={cx} cy={cy} r={r + 3} fill="#fbbf24" opacity={Math.max(0.1, illumination * 0.35)} />
        <circle cx={cx} cy={cy} r={r} fill="#1e293b" />
        <circle cx={cx + termX * 0.7} cy={cy} r={r} fill="#fef3c7" clipPath="url(#mc)" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      {/* Date Input */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Month</label>
            <select value={month} onChange={e => { setMonth(Number(e.target.value)); setError(''); }}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              {MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Day</label>
            <select value={day} onChange={e => handleDayChange(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Year</label>
            <select value={year} onChange={e => { setYear(Number(e.target.value)); setError(''); }}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
        )}

        <div className="flex justify-center space-x-4">
          <button type="button" onClick={calculate}
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
            <span className="mr-2">🌙</span>Discover My Birth Chart
          </button>
        </div>
      </div>

      {/* Moon Phase SVG Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <span className="mr-2">🌙</span>
            Celestial Phase Chart
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Lunar phase visualization for your birth date and today.
          </span>
        </div>
        <div className="w-full max-w-lg relative">
          <svg viewBox="0 0 600 220" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl overflow-hidden block">
            <defs>
              <pattern id="c-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#c-grid)" />
            <text x="300" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {result
                ? `${result.zodiac.symbol} ${result.zodiac.name}  ·  ${result.moon.emoji} ${result.moon.phase}  ·  ${(result.moon.illumination * 100).toFixed(0)}% illuminated`
                : 'Select your birth date and click discover to see your celestial chart'}
            </text>
            {result && (
              <>
                {/* Birth moon */}
                <circle cx="160" cy="100" r="38" fill={elementColor} opacity="0.1" />
                <text x="160" y="65" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">Birth Moon</text>
                <foreignObject x="125" y="72" width="70" height="56">
                  <MoonDisk phase={result.moon.phase} illumination={result.moon.illumination} size={55} />
                </foreignObject>
                <text x="160" y="145" textAnchor="middle" fill={elementColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {result.zodiac.symbol} {result.zodiac.name}
                </text>
                {/* Separator */}
                <text x="300" y="118" textAnchor="middle" fill="#4b5563" fontSize="14" fontFamily="monospace">→</text>
                {/* Today moon */}
                <circle cx="440" cy="100" r="38" fill="#0ea5e9" opacity="0.1" />
                <text x="440" y="65" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">Today's Moon</text>
                <foreignObject x="405" y="72" width="70" height="56">
                  <MoonDisk phase={result.todayMoon.phase} illumination={result.todayMoon.illumination} size={55} />
                </foreignObject>
                <text x="440" y="145" textAnchor="middle" fill="#0ea5e9" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {result.todayMoon.emoji} {result.todayMoon.phase}
                </text>
              </>
            )}
            {!result && (
              <>
                <circle cx="160" cy="100" r="35" fill="#2a2a2a" opacity="0.5" />
                <circle cx="300" cy="100" r="35" fill="#2a2a2a" opacity="0.5" />
                <text x="160" y="165" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">Your Birth Moon</text>
                <text x="440" y="165" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">Today's Moon</text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">ZODIAC</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Hero */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Your Birth Chart</span>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-5xl">{result.zodiac.symbol}</span>
                <div className="text-left">
                  <span className="text-2xl md:text-3xl font-black tracking-tight">{result.zodiac.name}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-300">{result.chineseZodiac.emoji} {result.chineseZodiac.animal}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-xs text-slate-300">{result.moon.emoji} {result.moon.phase}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zodiac Info Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Element', value: result.zodiac.element, color: elementColor },
                { label: 'Quality', value: result.zodiac.quality, color: '#a78bfa' },
                { label: 'Planet', value: result.zodiac.planet, color: '#fbbf24' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-sm font-black text-white mt-1 block" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Traits */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Personality Traits</h4>
              <p className="text-xs text-white/80 leading-relaxed">{result.zodiac.traits}</p>
            </div>

            {/* Compatibility */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Best Matches</h4>
              <div className="flex flex-wrap gap-2">
                {result.zodiac.compatibility.map(s => {
                  const z = ZODIAC_SIGNS.find(z => z.name === s);
                  return (
                    <span key={s} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/80 font-medium">
                      {z?.symbol} {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Moon Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Birth Moon</span>
                <span className="text-2xl block my-1">{result.moon.emoji}</span>
                <span className="text-sm font-black text-white">{result.moon.phase}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{(result.moon.illumination * 100).toFixed(1)}% illuminated</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Today's Moon</span>
                <span className="text-2xl block my-1">{result.todayMoon.emoji}</span>
                <span className="text-sm font-black text-white">{result.todayMoon.phase}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{(result.todayMoon.illumination * 100).toFixed(1)}% illuminated</span>
              </div>
            </div>

            {/* Step-by-Step */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Step-by-Step Resolution Steps</h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {result.steps.map((step, idx) => {
                  const trimmed = step.trim();
                  if (trimmed.startsWith('$$')) {
                    return <div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin"><BlockMath math={trimmed.replace(/\$\$/g, '')} /></div>;
                  }
                  const isBold = trimmed.startsWith('**');
                  const cleanText = trimmed.replace(/^\* |\*\*/g, '');
                  const inlineRegex = /\$([^$]+)\$/g;
                  let lastIdx = 0;
                  const parts: React.ReactNode[] = [];
                  let match;
                  while ((match = inlineRegex.exec(cleanText)) !== null) {
                    if (match.index > lastIdx) parts.push(cleanText.substring(lastIdx, match.index));
                    parts.push(<InlineMath key={match.index} math={match[1]} />);
                    lastIdx = inlineRegex.lastIndex;
                  }
                  if (lastIdx < cleanText.length) parts.push(cleanText.substring(lastIdx));
                  return <p key={idx} className={isBold ? 'font-black text-white pt-2 first:pt-0' : ''}>{parts.length > 0 ? parts : cleanText}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
