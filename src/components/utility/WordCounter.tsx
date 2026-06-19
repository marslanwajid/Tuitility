'use client';

import React, { useState, useMemo, useRef } from 'react';

interface WordFrequency {
  word: string;
  count: number;
}

function getStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
  const readingTime = Math.max(1, Math.ceil(words.length / 200));
  const speakingTime = Math.max(1, Math.ceil(words.length / 130));

  const wordLengths = words.map((w) => w.replace(/[^a-zA-Z0-9]/g, '').length).filter(Boolean);
  const avgWordLen = wordLengths.length > 0 ? wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length : 0;
  const longestWord = wordLengths.length > 0 ? words.reduce((a, b) => (b.replace(/[^a-zA-Z0-9]/g, '').length > a.replace(/[^a-zA-Z0-9]/g, '').length ? b : a), '') : '-';
  const shortestWord = wordLengths.length > 0 ? words.reduce((a, b) => {
    const c = b.replace(/[^a-zA-Z0-9]/g, '');
    if (!c) return a;
    return c.length < (a.replace(/[^a-zA-Z0-9]/g, '').length || Infinity) ? b : a;
  }, words[0]) : '-';

  // Word frequency (words with 2+ chars)
  const freqMap = new Map<string, number>();
  words.forEach((w) => {
    const clean = w.replace(/[^a-zA-Z0-9']/g, '').toLowerCase();
    if (clean && clean.length > 1) freqMap.set(clean, (freqMap.get(clean) || 0) + 1);
  });
  const topWords: WordFrequency[] = [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Letter frequency
  const letterMap = new Map<string, number>();
  for (const ch of text.toLowerCase()) { if (/[a-z]/.test(ch)) letterMap.set(ch, (letterMap.get(ch) || 0) + 1); }
  const topLetters = [...letterMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 26);

  // Word length distribution
  const lenMap = new Map<number, number>();
  wordLengths.forEach((l) => lenMap.set(l, (lenMap.get(l) || 0) + 1));
  const lengthDist = [...lenMap.entries()].sort((a, b) => a[0] - b[0]);

  return {
    words: words.length, chars, charsNoSpace, sentences, paragraphs,
    readingTime, speakingTime, avgWordLen, longestWord, shortestWord,
    topWords, topLetters, lengthDist,
  };
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => getStats(text), [text]);

  const handleClear = () => { setText(''); textareaRef.current?.focus(); };

  const handleCopy = async () => {
    const summary = [
      `Words: ${stats.words}`,
      `Characters: ${stats.chars}`,
      `Characters (no spaces): ${stats.charsNoSpace}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Reading Time: ${stats.readingTime} min`,
      `Speaking Time: ${stats.speakingTime} min`,
      `Avg Word Length: ${stats.avgWordLen.toFixed(1)}`,
      `Longest Word: ${stats.longestWord}`,
      `Shortest Word: ${stats.shortestWord}`,
    ].join('\n');
    try { await navigator.clipboard.writeText(summary); } catch { /* ignore */ }
  };

  const maxFreq = stats.topWords.length > 0 ? stats.topWords[0].count : 1;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Guard */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PRIVACY</span>
        </div>
        <i className="fas fa-shield-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All text is processed 100% locally inside your browser. No content, logs, or data are ever uploaded to any backend server.
          </p>
        </div>
      </div>

      {/* Text Input Area */}
      <div className="space-y-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to start counting..."
          className="w-full min-h-[280px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 font-medium resize-y focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button type="button" onClick={handleClear}
              className="px-7 py-3 rounded-full bg-white/10 text-slate-900 border border-slate-200 font-extrabold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 hover:bg-slate-50">
              <i className="fas fa-trash text-[10px]"></i><span>Clear</span>
            </button>
            <button type="button" onClick={handleCopy}
              className="px-7 py-3 rounded-full bg-white/10 text-slate-900 border border-slate-200 font-extrabold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 hover:bg-slate-50">
              <i className="fas fa-copy text-[10px]"></i><span>Copy Stats</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">{stats.chars.toLocaleString()} characters &bull; {stats.words.toLocaleString()} words</span>
        </div>
      </div>

      {/* Word Frequency Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400"></i>
            Word Frequency Distribution
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Top 10 most used words with occurrence count and proportional bar chart.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 280" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="wf-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="wf-glow"><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <linearGradient id="wf-bar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#wf-grid)" />
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {text.trim() ? `Top words from ${stats.words.toLocaleString()} total words` : 'Type or paste text above to see word frequency distribution'}
            </text>
            {text.trim() && stats.topWords.length > 0 ? (
              <>
                {stats.topWords.slice(0, 8).map(({ word, count }, i) => {
                  const barWidth = (count / maxFreq) * 400;
                  const y = 45 + i * 28;
                  return (
                    <g key={word}>
                      <rect x="160" y={y} width={Math.max(barWidth, 4)} height="18" rx="3" fill="url(#wf-bar)" opacity="0.8" />
                      <text x="155" y={y + 13} textAnchor="end" fill="#9ca3af" fontSize="9" fontFamily="monospace" fontWeight="bold">{word}</text>
                      <text x={165 + Math.max(barWidth, 4)} y={y + 13} textAnchor="start" fill="#a78bfa" fontSize="8" fontFamily="monospace">{count}x</text>
                    </g>
                  );
                })}
              </>
            ) : (
              <>
                <rect x="160" y="70" width="400" height="18" rx="3" fill="#2a2a2a" opacity="0.5" />
                <text x="400" y="145" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
                  Word frequency bars will appear here
                </text>
              </>
            )}
          </svg>
          {text.trim() && stats.topWords.length > 0 && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Unique words:</span> {stats.topWords.length < 10 ? stats.topWords.length : '10+'}</div>
              <div><span className="text-neutral-400">Total words:</span> {stats.words.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">WORD COUNT</span>
        </div>
        <div className="relative z-10 space-y-6">
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-3xl md:text-4xl font-black text-white block">{stats.words.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Words</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-3xl md:text-4xl font-black text-white block">{stats.chars.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Characters</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-3xl md:text-4xl font-black text-white block">{stats.charsNoSpace.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Chars (no space)</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-3xl md:text-4xl font-black text-white block">{stats.sentences.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Sentences</span>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Paragraphs</span>
              <span className="text-xl font-black text-white mt-1 block">{stats.paragraphs.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Reading Time</span>
              <span className="text-xl font-black text-white mt-1 block">{stats.readingTime} min</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Speaking Time</span>
              <span className="text-xl font-black text-white mt-1 block">{stats.speakingTime} min</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Avg Word Length</span>
              <span className="text-xl font-black text-white mt-1 block">{stats.avgWordLen.toFixed(1)}</span>
            </div>
          </div>

          {/* Word Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Longest Word</span>
              <span className="text-sm font-black text-white mt-1 block break-all leading-tight">{stats.longestWord}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">Shortest Word</span>
              <span className="text-sm font-black text-white mt-1 block break-all leading-tight">{stats.shortestWord}</span>
            </div>
          </div>

          {/* Top Words Frequency */}
          {stats.topWords.length > 0 && (
            <div className="space-y-3">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Top Words by Frequency</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {stats.topWords.map(({ word, count }) => (
                  <div key={word} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs font-black text-white truncate mr-2">{word}</span>
                    <span className="text-[10px] font-black text-emerald-400 shrink-0">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!text.trim() && (
            <div className="text-center py-6">
              <i className="fas fa-font text-3xl text-white/20 mb-3"></i>
              <p className="text-xs text-slate-500 font-bold">Type or paste text above to see real-time statistics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
