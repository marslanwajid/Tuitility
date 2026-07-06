'use client';

import React, { useState, useMemo, useRef } from 'react';
import { diffLines, diffWords } from 'diff';

type ViewMode = 'side-by-side' | 'unified';

interface WordPart {
  text: string;
  type: 'added' | 'removed' | 'unchanged';
}

interface DiffRow {
  left: { num: number; type: 'unchanged' | 'removed'; text: string; parts: WordPart[] } | null;
  right: { num: number; type: 'unchanged' | 'added'; text: string; parts: WordPart[] } | null;
}

function computeRows(original: string, modified: string): DiffRow[] {
  if (!original && !modified) return [];
  const changes = diffLines(original, modified);
  const rows: DiffRow[] = [];
  let leftNum = 0, rightNum = 0;

  for (let ci = 0; ci < changes.length; ci++) {
    const ch = changes[ci];
    const rawLines = ch.value.split('\n');
    const lines = rawLines[rawLines.length - 1] === '' ? rawLines.slice(0, -1) : rawLines;

    if (ch.added) {
      for (const line of lines) {
        rightNum++;
        const parts: WordPart[] = line
          ? diffWords('', line).map(p => ({ text: p.value, type: p.added ? 'added' : p.removed ? 'removed' : 'unchanged' }))
          : [];
        rows.push({ left: null, right: { num: rightNum, type: 'added', text: line, parts } });
      }
    } else if (ch.removed) {
      for (const line of lines) {
        leftNum++;
        const parts: WordPart[] = line
          ? diffWords(line, '').map(p => ({ text: p.value, type: p.added ? 'added' : p.removed ? 'removed' : 'unchanged' }))
          : [];
        rows.push({ left: { num: leftNum, type: 'removed', text: line, parts }, right: null });
      }
      const next = changes[ci + 1];
      if (next?.added) {
        const nextLines = next.value.split('\n');
        const added = nextLines[nextLines.length - 1] === '' ? nextLines.slice(0, -1) : nextLines;
        for (const line of added) {
          rightNum++;
          const parts: WordPart[] = line
            ? diffWords('', line).map(p => ({ text: p.value, type: p.added ? 'added' : p.removed ? 'removed' : 'unchanged' }))
            : [];
          const lastRow = rows[rows.length - 1];
          if (lastRow && lastRow.left && !lastRow.right) {
            lastRow.right = { num: rightNum, type: 'added', text: line, parts };
          } else {
            rows.push({ left: null, right: { num: rightNum, type: 'added', text: line, parts } });
          }
        }
        ci++;
      }
    } else {
      for (const line of lines) {
        leftNum++;
        rightNum++;
        rows.push({
          left: { num: leftNum, type: 'unchanged', text: line, parts: [{ text: line, type: 'unchanged' }] },
          right: { num: rightNum, type: 'unchanged', text: line, parts: [{ text: line, type: 'unchanged' }] },
        });
      }
    }
  }

  return rows;
}

function countChanges(rows: DiffRow[]): { added: number; removed: number; unchanged: number } {
  let added = 0, removed = 0, unchanged = 0;
  for (const row of rows) {
    if (row.left?.type === 'removed' || row.right?.type === 'added') {
      if (row.left?.type === 'removed') removed++;
      if (row.right?.type === 'added') added++;
    } else {
      unchanged++;
    }
  }
  return { added, removed, unchanged };
}

export default function DiffChecker() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const origRef = useRef<HTMLTextAreaElement>(null);
  const modRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const origFileRef = useRef<HTMLInputElement>(null);
  const modFileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => computeRows(original, modified), [original, modified]);
  const stats = useMemo(() => countChanges(rows), [rows]);
  const hasDiff = original && modified;

  const handleSwap = () => {
    setOriginal(modified);
    setModified(original);
  };

  const handleFileUpload = (side: 'original' | 'modified') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (side === 'original') setOriginal(text);
      else setModified(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
    origRef.current?.focus();
  };

  const handleCopyDiff = async () => {
    const text = rows.map(r => {
      const left = r.left ? `${r.left.type === 'removed' ? '-' : ' '} ${r.left.text}` : '';
      const right = r.right ? `${r.right.type === 'added' ? '+' : ' '} ${r.right.text}` : '';
      return viewMode === 'side-by-side'
        ? `${left.padEnd(60)}${right}`
        : r.left && r.right
          ? ` ${r.left.text}`
          : r.left
            ? `- ${r.left.text}`
            : `+ ${r.right!.text}`;
    }).join('\n');
    await navigator.clipboard.writeText(text);
  };

  const renderLineParts = (parts: WordPart[]) => {
    if (!parts.length) return <span className="text-slate-300">&nbsp;</span>;
    return parts.map((p, i) => {
      if (p.type === 'added') return <span key={i} className="bg-green-500/20 text-green-300 rounded px-0.5">{p.text || '\u00A0'}</span>;
      if (p.type === 'removed') return <span key={i} className="bg-red-500/20 text-red-300 rounded px-0.5">{p.text || '\u00A0'}</span>;
      return <span key={i} className="text-slate-300">{p.text || '\u00A0'}</span>;
    });
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Guard */}
      <div className="relative bg-[#1a1a1a] rounded-2xl p-5 overflow-hidden">
        <div className="absolute inset-0 opacity-5 select-none pointer-events-none text-[8rem] font-black leading-none flex items-center justify-end pr-4">PRIVACY</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="bg-white/10 p-2.5 rounded-lg shrink-0"><svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
          <div><p className="text-white font-semibold text-sm">Your text never leaves your device.</p><p className="text-white/50 text-xs mt-0.5">All diff processing happens locally in your browser. Nothing is uploaded.</p></div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
          {(['side-by-side', 'unified'] as ViewMode[]).map(mode => (
            <button key={mode} type="button" onClick={() => setViewMode(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              {mode === 'side-by-side' ? 'Side by Side' : 'Unified'}
            </button>
          ))}
        </div>
        {hasDiff && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-600 font-medium">+{stats.added}</span>
            <span className="text-red-600 font-medium">-{stats.removed}</span>
            <span className="text-slate-400">{stats.unchanged}</span>
          </div>
        )}
      </div>

      {/* Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original</label>
            <button type="button" onClick={() => origFileRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload File
            </button>
            <input ref={origFileRef} type="file" accept=".txt,.md,.json,.csv,.html,.css,.js,.ts,.jsx,.tsx,.xml,.yml,.yaml,.log" onChange={handleFileUpload('original')} className="hidden" />
          </div>
          <textarea ref={origRef} value={original} onChange={e => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
            className="w-full h-44 p-4 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modified</label>
            <button type="button" onClick={() => modFileRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload File
            </button>
            <input ref={modFileRef} type="file" accept=".txt,.md,.json,.csv,.html,.css,.js,.ts,.jsx,.tsx,.xml,.yml,.yaml,.log" onChange={handleFileUpload('modified')} className="hidden" />
          </div>
          <textarea ref={modRef} value={modified} onChange={e => setModified(e.target.value)}
            placeholder="Paste modified text here..."
            className="w-full h-44 p-4 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={handleSwap}
          disabled={!hasDiff}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
          Swap
        </button>
        <button type="button" onClick={handleCopyDiff}
          disabled={!hasDiff}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Copy Diff
        </button>
        <button type="button" onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Clear
        </button>
      </div>

      {/* Diff Result */}
      {hasDiff && rows.length > 0 && (
        <div ref={resultRef} className="bg-[#1a1a1a] rounded-2xl overflow-hidden animate-fade-in">
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/80 text-sm font-medium">Diff Output</span>
            {viewMode === 'side-by-side' && (
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="text-green-400 font-mono">+{stats.added} added</span>
                <span className="text-red-400 font-mono">-{stats.removed} removed</span>
                <span className="text-white/30 font-mono">{stats.unchanged} unchanged</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            {viewMode === 'side-by-side' ? (
              <table className="w-full text-sm font-mono border-collapse">
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-white/5 ${row.left?.type === 'removed' ? 'bg-red-500/5' : row.right?.type === 'added' ? 'bg-green-500/5' : ''}`}>
                      <td className={`w-12 px-3 py-1 text-right text-xs select-none border-r border-white/10 ${row.left?.type === 'removed' ? 'text-red-400 bg-red-500/10' : 'text-white/30'}`}>
                        {row.left?.num ?? ''}
                      </td>
                      <td className={`px-3 py-1 ${row.left?.type === 'removed' ? 'bg-red-500/10' : ''}`}>
                        {row.left ? <div className="flex items-center gap-2">{renderLineParts(row.left.parts)}</div> : <span className="text-white/20">&nbsp;</span>}
                      </td>
                      <td className={`w-12 px-3 py-1 text-right text-xs select-none border-x border-white/10 ${row.right?.type === 'added' ? 'text-green-400 bg-green-500/10' : 'text-white/30'}`}>
                        {row.right?.num ?? ''}
                      </td>
                      <td className={`px-3 py-1 ${row.right?.type === 'added' ? 'bg-green-500/10' : ''}`}>
                        {row.right ? <div className="flex items-center gap-2">{renderLineParts(row.right.parts)}</div> : <span className="text-white/20">&nbsp;</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm font-mono border-collapse">
                <tbody>
                  {rows.map((row, i) => {
                    const isAdded = !row.left && !!row.right;
                    const isRemoved = !!row.left && !row.right;
                    const isModified = row.left?.type === 'removed' && row.right?.type === 'added';
                    const displayText = row.right?.text ?? row.left?.text ?? '';
                    const displayParts = (isAdded || (isModified && row.right)) ? row.right!.parts : (isRemoved ? row.left!.parts : []);
                    const prefix = isAdded ? '+' : isRemoved ? '-' : ' ';
                    const bg = isAdded ? 'bg-green-500/10' : isRemoved ? 'bg-red-500/10' : '';
                    const prefixColor = isAdded ? 'text-green-400' : isRemoved ? 'text-red-400' : 'text-white/30';
                    return (
                      <tr key={i} className={`border-b border-white/5 ${bg}`}>
                        <td className={`w-8 px-2 py-1 text-right text-xs select-none border-r border-white/10 text-white/30`}>
                          {row.left?.num ?? ''}
                        </td>
                        <td className={`w-8 px-2 py-1 text-right text-xs select-none border-r border-white/10 text-white/30`}>
                          {row.right?.num ?? ''}
                        </td>
                        <td className={`w-6 px-2 py-1 text-center select-none ${prefixColor}`}>{prefix}</td>
                        <td className={`px-3 py-1 ${bg}`}>
                          {displayParts.length > 0 ? renderLineParts(displayParts) : <span className={isAdded ? 'text-green-300' : isRemoved ? 'text-red-300' : 'text-slate-300'}>{displayText || '\u00A0'}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {viewMode === 'unified' && (
            <div className="px-5 py-3 border-t border-white/10 flex items-center gap-4 text-xs">
              <span className="text-green-400 font-mono">+{stats.added} added</span>
              <span className="text-red-400 font-mono">-{stats.removed} removed</span>
              <span className="text-white/30 font-mono">{stats.unchanged} unchanged</span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasDiff && (
        <div className="bg-slate-50 rounded-2xl p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-slate-500 text-sm">Paste text or upload files in both panels above to see the difference.</p>
        </div>
      )}
    </div>
  );
}
