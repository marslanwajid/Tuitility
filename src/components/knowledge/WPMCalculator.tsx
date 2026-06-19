'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface WPMResult {
  wpm: number;
  accuracy: number;
  category: string;
  wordsTyped: number;
  charactersTyped: number;
  timeTaken: number;
  steps: string[];
}

const SAMPLE_TEXTS = [
  "The art of programming is a journey that never truly ends. As technology evolves, programmers must constantly adapt and learn new skills. Writing clean, efficient code is not just about making things work; it's about making them work elegantly.",
  "Artificial intelligence and machine learning are revolutionizing the way we interact with technology. From voice assistants to autonomous vehicles, AI systems are becoming increasingly sophisticated. These technologies analyze vast amounts of data to identify patterns.",
  "The history of computing dates back to ancient civilizations using abacuses for calculations. However, the modern computer age began with pioneers like Alan Turing and Ada Lovelace. Their groundbreaking work laid the foundation for today's digital revolution.",
  "Cybersecurity is more important than ever in our interconnected world. As our reliance on digital systems grows, so does the need to protect sensitive information. Hackers constantly develop new methods to breach security measures.",
  "The internet of things has created a network where everyday objects can communicate and share data. Smart homes, wearable devices, and industrial sensors are just a few examples. This interconnectivity brings convenience but also raises important questions about privacy.",
  "Cloud computing has transformed how businesses and individuals store and process data. Instead of maintaining expensive local infrastructure, organizations can now access scalable resources on demand. This shift has democratized access to powerful computing.",
  "Video game development combines artistry with technical expertise. Game designers must create engaging narratives while implementing complex physics engines and graphics rendering. The gaming industry continues to push technological boundaries.",
  "Environmental technology is crucial in addressing climate change. Renewable energy systems, smart grids, and energy-efficient buildings demonstrate how technology can help create a sustainable future.",
  "Data science combines statistical analysis with programming to extract meaningful insights from large datasets. Machine learning algorithms can identify patterns that humans might miss, leading to breakthroughs in medical diagnosis and financial forecasting.",
  "Web development evolves rapidly with new frameworks and technologies emerging regularly. Modern websites must be responsive, accessible, and secure while providing seamless user experiences across all devices.",
  "Digital photography has transformed how we capture and share moments. Modern cameras use sophisticated algorithms for features like face detection and image stabilization. Post-processing software allows photographers to enhance images.",
  "Blockchain technology extends far beyond cryptocurrencies. Its decentralized nature and immutable record-keeping have applications in supply chain management, voting systems, and digital identity verification.",
];

const getWPMCategory = (wpm: number): string => {
  if (wpm >= 120) return 'Expert';
  if (wpm >= 91) return 'Professional';
  if (wpm >= 71) return 'Excellent';
  if (wpm >= 51) return 'Good';
  if (wpm >= 31) return 'Average';
  return 'Beginner';
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Expert': return '#f44336';
    case 'Professional': return '#ff9800';
    case 'Excellent': return '#4caf50';
    case 'Good': return '#2196f3';
    case 'Average': return '#9c27b0';
    case 'Beginner': return '#607d8b';
    default: return '#607d8b';
  }
};

export default function WPMCalculator() {
  const [testDuration, setTestDuration] = useState<number>(60);
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [result, setResult] = useState<WPMResult | null>(null);
  const [error, setError] = useState('');

  const textDisplayRef = useRef<HTMLDivElement>(null);
  const typingInputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomText = useCallback((): string => {
    const idx = Math.floor(Math.random() * SAMPLE_TEXTS.length);
    return SAMPLE_TEXTS[idx];
  }, []);

  const startTest = () => {
    if (!useCustomText || !customText.trim()) {
      setCurrentText(getRandomText());
    } else {
      setCurrentText(customText);
    }
    setIsTestActive(true);
    setTimeLeft(testDuration);
    setTypedText('');
    setWordCount(0);
    setCorrectCharacters(0);
    setTotalCharacters(0);
    setError('');

    setTimeout(() => {
      typingInputRef.current?.focus();
    }, 200);
  };

  const endTest = useCallback(() => {
    setIsTestActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const timeElapsed = testDuration - timeLeft;
    const actualDuration = Math.max(timeElapsed, 1);
    const wpm = Math.round((wordCount / actualDuration) * 60);
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;
    const category = getWPMCategory(wpm);

    const incorrectChars = totalCharacters - correctCharacters;
    const steps: string[] = [];
    steps.push('**Step 1: Count total words typed**');
    steps.push(`* Words typed: $${wordCount}$`);
    steps.push('**Step 2: Measure time taken**');
    steps.push(`* Time elapsed: $${actualDuration}$ seconds = $${(actualDuration / 60).toFixed(2)}$ minutes`);
    steps.push('**Step 3: Calculate WPM**');
    steps.push('$$\\text{WPM} = \\frac{\\text{Words Typed}}{\\text{Time (minutes)}}$$');
    steps.push(`$$\\text{WPM} = \\frac{${wordCount}}{${(actualDuration / 60).toFixed(2)}} = ${wpm}$$`);
    steps.push(`* Category: **${category}** ($${wpm} \\text{ WPM}$)`);
    steps.push('**Step 4: Calculate accuracy**');
    steps.push('$$\\text{Accuracy} = \\frac{\\text{Correct Characters}}{\\text{Total Characters}} \\times 100\\%$$');
    steps.push(`$$\\text{Accuracy} = \\frac{${correctCharacters}}{${totalCharacters}} \\times 100\\% = ${accuracy}\\%$$`);

    setResult({ wpm, accuracy, category, wordsTyped: wordCount, charactersTyped: totalCharacters, timeTaken: actualDuration, steps });

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
    });
  }, [testDuration, timeLeft, wordCount, correctCharacters, totalCharacters]);

  // Timer effect
  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTestActive, timeLeft]);

  // Auto-end when timer reaches 0
  useEffect(() => {
    if (isTestActive && timeLeft === 0) {
      endTest();
    }
  }, [isTestActive, timeLeft, endTest]);

  // Update text display with character highlighting
  useEffect(() => {
    const el = textDisplayRef.current;
    if (!el || !currentText) return;

    const inputWords = typedText.trim().split(/\s+/);
    const targetWords = currentText.trim().split(/\s+/);
    let html = '';
    let pos = 0;

    targetWords.forEach((tw, wi) => {
      const iw = inputWords[wi] || '';
      if (wi > 0) {
        if (pos < typedText.length) {
          html += '<span style="color:#4caf50;opacity:0.8"> </span>';
        } else {
          html += '<span style="color:#64748b;opacity:0.4"> </span>';
        }
        pos++;
      }
      for (let ci = 0; ci < tw.length; ci++) {
        if (pos < typedText.length) {
          if (ci < iw.length) {
            if (iw[ci] === tw[ci]) {
              html += `<span style="color:#4caf50;font-weight:700">${tw[ci]}</span>`;
            } else {
              html += `<span style="color:#ef4444;font-weight:700;text-decoration:underline">${tw[ci]}</span>`;
            }
          } else {
            html += `<span style="color:#ef4444;opacity:0.6">${tw[ci]}</span>`;
          }
        } else {
          html += `<span style="color:#64748b;opacity:0.4">${tw[ci]}</span>`;
        }
        pos++;
      }
    });

    el.innerHTML = html;
  }, [currentText, typedText]);

  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTestActive) return;

    let inputText = e.target.value;
    if (inputText.length > currentText.length) {
      inputText = inputText.substring(0, currentText.length);
      e.target.value = inputText;
    }

    setTypedText(inputText);

    const inputWords = inputText.trim().split(/\s+/).filter(w => w.length > 0);
    const targetWords = currentText.trim().split(/\s+/);
    setTotalCharacters(inputText.length);
    setWordCount(inputWords.length);

    let correct = 0;
    let pos = 0;

    targetWords.forEach((tw, wi) => {
      const iw = inputWords[wi] || '';
      if (wi > 0 && pos < inputText.length) {
        if (inputText[pos] === ' ') correct++;
        pos++;
      }
      for (let ci = 0; ci < tw.length; ci++) {
        if (pos < inputText.length && ci < iw.length) {
          if (inputText[pos] === tw[ci]) correct++;
        }
        pos++;
      }
    });

    setCorrectCharacters(correct);
  };

  const resetTest = () => {
    setIsTestActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(testDuration);
    setTypedText('');
    setWordCount(0);
    setCorrectCharacters(0);
    setTotalCharacters(0);
    setCurrentText('');
    setResult(null);
    setError('');
    if (textDisplayRef.current) {
      textDisplayRef.current.innerHTML = "Click 'Start Test' to begin the typing test...";
    }
  };

  useEffect(() => {
    setTimeLeft(testDuration);
  }, [testDuration]);

  // Compute real-time WPM and accuracy for display
  const timeElapsed = testDuration - timeLeft;
  const realTimeWPM = timeElapsed > 0 && isTestActive ? Math.round((wordCount / timeElapsed) * 60) : 0;
  const realTimeAccuracy = totalCharacters > 0 && isTestActive ? Math.round((correctCharacters / totalCharacters) * 100) : 0;

  // SVG gauge bar
  const maxWPM = 200;
  const gaugeWPM = result ? result.wpm : (isTestActive ? realTimeWPM : 0);
  const gaugePercent = Math.min((gaugeWPM / maxWPM) * 100, 100);
  const gaugeColor = result ? getCategoryColor(result.category) : '#1a1a1a';

  const displayCategory = result ? result.category : (isTestActive ? getWPMCategory(realTimeWPM) : '');

  // Check if typing is complete (all words typed)
  const isTypingComplete = isTestActive && typedText.trim() === currentText.trim();
  useEffect(() => {
    if (isTypingComplete) {
      endTest();
    }
  }, [isTypingComplete, endTest]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main test area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Settings */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Duration:</span>
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-full">
                {[30, 60, 120, 300].map(d => (
                  <button
                    key={d}
                    type="button"
                    disabled={isTestActive}
                    onClick={() => setTestDuration(d)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      testDuration === d
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    } ${isTestActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {d < 60 ? `${d}s` : `${d / 60}m`}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center space-x-2 text-xs text-slate-500 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomText}
                onChange={e => setUseCustomText(e.target.checked)}
                disabled={isTestActive}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Custom Text</span>
            </label>
          </div>

          {/* Custom text input */}
          {useCustomText && (
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              disabled={isTestActive}
              placeholder="Paste your own text here..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all resize-none disabled:opacity-40"
            />
          )}

          {/* Text Display */}
          <div
            ref={textDisplayRef}
            className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-sm leading-relaxed font-mono min-h-[100px] select-none"
            style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
          >
            {currentText || "Click 'Start Test' to begin the typing test..."}
          </div>

          {/* Typing Input */}
          <textarea
            ref={typingInputRef}
            value={typedText}
            onChange={handleTypingInput}
            onPaste={e => e.preventDefault()}
            disabled={!isTestActive}
            placeholder={isTestActive ? 'Start typing here...' : 'Press Start Test to begin...'}
            rows={2}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed"
          />

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left flex items-start space-x-3 text-rose-800 animate-shake">
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <div>
                <h4 className="text-xs font-bold">Error</h4>
                <p className="text-[10px] font-medium mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={startTest}
              disabled={isTestActive}
              className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play mr-2"></i>
              Start Test
            </button>
            <button
              type="button"
              onClick={resetTest}
              disabled={!isTestActive && !result}
              className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i className="fas fa-redo mr-2"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Right: Stats & Gauge */}
        <div className="space-y-6">
          {/* Live Stats Panel */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
              Live Stats
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 text-center">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Time</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{timeLeft}s</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 text-center">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">WPM</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{isTestActive ? realTimeWPM : (result ? result.wpm : 0)}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 text-center">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Accuracy</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{isTestActive ? `${realTimeAccuracy}%` : (result ? `${result.accuracy}%` : '0%')}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/50 text-center">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Words</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{isTestActive ? wordCount : (result ? result.wordsTyped : 0)}</span>
              </div>
            </div>
          </div>

          {/* Speed Gauge */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col items-center text-center">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-3">
              Speed Gauge
            </span>
            <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${gaugePercent}%`, backgroundColor: gaugeColor }}
              />
            </div>
            <span className="text-xl font-black text-slate-900">{gaugeWPM}</span>
            <span className="text-[9px] text-slate-400 font-bold">of {maxWPM} WPM</span>
            {displayCategory && (
              <span
                className="mt-2 px-3 py-0.5 rounded-full text-[10px] font-black border"
                style={{
                  color: getCategoryColor(displayCategory),
                  borderColor: `${getCategoryColor(displayCategory)}40`,
                  backgroundColor: `${getCategoryColor(displayCategory)}15`,
                }}
              >
                {displayCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Typing Rhythm Visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-wave-square mr-2 text-slate-400"></i>
            Live Typing Rhythm Scope
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Real-time waveform of your typing speed and accuracy.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 160" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="typing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="typing-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#typing-grid)" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            {[0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => (
              <line key={x} x1={x} y1="60" x2={x} y2="100" stroke="#1f1f1f" strokeWidth="0.5" opacity="0.5" />
            ))}
            {[20, 40, 60, 80, 100, 120, 140].map(y => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#1f1f1f" strokeWidth="0.5" opacity="0.3" />
            ))}
            <g>
              {Array.from({ length: 20 }).map((_, i) => {
                const barW = 30;
                const gap = 8;
                const x = 20 + i * (barW + gap);
                const currentWPM = isTestActive ? realTimeWPM : (result ? result.wpm : 0);
                const h = currentWPM > 0 ? (currentWPM / 200) * 120 : 0;
                const hue = h > 100 ? 120 : h > 50 ? 50 : 0;
                const barH = Math.max(h * (1 - i / 20 * 0.3), 2);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={145 - barH}
                    width={barW}
                    rx="3"
                    fill={`hsl(${hue}, 80%, ${50 + i * 1.5}%)`}
                    opacity={0.7}
                    className="transition-all duration-500"
                    height={barH}
                  />
                );
              })}
            </g>
            <text x="400" y="12" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {isTestActive ? 'TYPING IN PROGRESS' : (result ? 'TEST COMPLETE' : 'IDLE')}
            </text>
          </svg>
          <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
            <div><span className="text-neutral-400">WPM:</span> {isTestActive ? realTimeWPM : (result ? result.wpm : 0)}</div>
            <div><span className="text-neutral-400">Acc:</span> {isTestActive ? `${realTimeAccuracy}%` : (result ? `${result.accuracy}%` : '0%')}</div>
          </div>
          <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
            <span className="text-neutral-400">Category:</span> {displayCategory || '\u2014'}
          </div>
        </div>
      </div>

      {/* Result Panel */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">WPM</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Main result */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Typing Speed Result</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight">{result.wpm} WPM</span>
              <div className="mt-2">
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs font-black border"
                  style={{
                    color: getCategoryColor(result.category),
                    borderColor: `${getCategoryColor(result.category)}40`,
                    backgroundColor: `${getCategoryColor(result.category)}15`,
                  }}
                >
                  {result.category}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Accuracy', value: `${result.accuracy}%` },
                { label: 'Words Typed', value: result.wordsTyped },
                { label: 'Characters', value: result.charactersTyped },
                { label: 'Time Taken', value: `${result.timeTaken}s` },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-lg font-black text-white mt-1 block">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Character Analysis */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Character Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Correct</span>
                  <span className="text-xl font-black text-emerald-400 mt-1 block">{result.charactersTyped}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Incorrect</span>
                  <span className="text-xl font-black text-rose-400 mt-1 block">{Math.round(result.charactersTyped * (100 - result.accuracy) / 100)}</span>
                </div>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.accuracy}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Accuracy: {result.accuracy}%</span>
                <span>Error Rate: {100 - result.accuracy}%</span>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Performance Summary</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                {result.accuracy >= 95
                  ? `Excellent accuracy of ${result.accuracy}%! Your typing is highly precise.`
                  : result.accuracy >= 85
                  ? `Good accuracy of ${result.accuracy}%. With practice, you can reduce errors further.`
                  : `Accuracy of ${result.accuracy}% needs improvement. Focus on typing correctly before increasing speed.`}
                {' '}
                {result.wpm >= 71
                  ? `Your speed of ${result.wpm} WPM places you in the ${result.category} range.`
                  : result.wpm >= 51
                  ? `Your speed of ${result.wpm} WPM is ${result.category}. Regular practice will boost both speed and accuracy.`
                  : `Your speed of ${result.wpm} WPM is in the ${result.category} range. Consistent daily practice of 10-15 minutes will help you improve.`}
              </p>
            </div>

            {/* Step-by-step */}
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
                  const parts: React.ReactNode[] = [];
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
