'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type InputTab = 'paste' | 'upload';

const HEX_RE = /(?:fill|stroke|stop-color|color)="(#(?:[0-9a-fA-F]{3,8}|[0-9a-fA-F]{6}))"/g;

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const highlightCode = (code: string): string => {
  let h = escapeXml(code);
  h = h.replace(/(\/\/.*)/g, '<span class="text-green-400/70">$1</span>');
  h = h.replace(/(&lt;\/?)([\w-]+)/g, (m, b, tag) => `${b}<span class="text-blue-300">${tag}</span>`);
  h = h.replace(/(["'`])((?:(?!\1).)*?\1)/g, '<span class="text-amber-200/90">$&</span>');
  return h;
};

const formatSvg = (svg: string): string => {
  let depth = 0;
  return svg.replace(/(<\/?)(\w+)([^>]*?)(\/?>)/g, (m, open, tag, attrs, close) => {
    const isClosing = close.startsWith('</');
    const isSelfClosing = close.endsWith('/>');
    if (isClosing) depth = Math.max(0, depth - 1);
    const indent = '  '.repeat(depth);
    if (!isClosing && !isSelfClosing) depth++;
    return '\n' + indent + open + tag + attrs + close;
  }).trim();
};

interface SvgMeta {
  viewBox: string;
  width: string;
  height: string;
  elementCount: number;
  byteSize: number;
}

function getMeta(svg: string): SvgMeta {
  const vb = svg.match(/viewBox="([^"]*)"/)?.[1] || '—';
  const w = svg.match(/width="([^"]*)"/)?.[1] || '—';
  const h = svg.match(/height="([^"]*)"/)?.[1] || '—';
  const elems = (svg.match(/<(\w+)[\s>]/g) || []).length;
  return { viewBox: vb, width: w, height: h, elementCount: elems, byteSize: new Blob([svg]).size };
}

export default function CodeToSvgConverter() {
  const [inputTab, setInputTab] = useState<InputTab>('paste');
  const [codeInput, setCodeInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [svgOutput, setSvgOutput] = useState('');
  const [meta, setMeta] = useState<SvgMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [transparentBg, setTransparentBg] = useState(false);
  const [colorReplacements, setColorReplacements] = useState<Record<string, string>>({});
  const [globalFill, setGlobalFill] = useState('');
  const [globalStroke, setGlobalStroke] = useState('');
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [originalAspect, setOriginalAspect] = useState(1);
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 5;

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [blobUrl]);

  /* Detect colors when SVG output changes — scan both attribute and inline-style colors */
  useEffect(() => {
    if (svgOutput) {
      const colors = new Set<string>();
      const attrRe = /(?:fill|stroke|stop-color|color)="(#(?:[0-9a-fA-F]{3,8}))"/g;
      let m;
      while ((m = attrRe.exec(svgOutput)) !== null) colors.add(m[1].toLowerCase());
      const styleRe = /(?:fill|stroke|stop-color|color):\s*(#[0-9a-fA-F]{3,8})/g;
      while ((m = styleRe.exec(svgOutput)) !== null) colors.add(m[1].toLowerCase());
      const arr = Array.from(colors).sort();
      setDetectedColors(arr);
      setColorReplacements(prev => {
        const next = { ...prev };
        for (const c of arr) if (!(c in next)) next[c] = '';
        for (const k of Object.keys(next)) if (!arr.includes(k)) delete next[k];
        return next;
      });
      const vb = /viewBox="\d+\s+\d+\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/.exec(svgOutput);
      if (vb) setOriginalAspect(parseFloat(vb[1]) / parseFloat(vb[2]));
    } else {
      setDetectedColors([]);
      setColorReplacements({});
      setGlobalFill('');
      setGlobalStroke('');
      setNewWidth('');
      setNewHeight('');
    }
  }, [svgOutput]);

  /* Apply modifications — attribute + inline style colors */
  const modifiedSvg = useMemo(() => {
    if (!svgOutput) return '';
    let svg = svgOutput;

    const replacements = { ...colorReplacements };
    const hasActive = Object.values(replacements).some(v => v);
    if (hasActive) {
      for (const [original, replacement] of Object.entries(replacements)) {
        if (replacement && replacement !== original) {
          const attrRe = new RegExp(`((?:fill|stroke|stop-color|color)="${original}")`, 'gi');
          svg = svg.replace(attrRe, (m) => m.replace(original, replacement));
          const styleRe = new RegExp(`((?:fill|stroke|stop-color|color):\\s*)${original.replace('#', '\\#')}([;\\s])`, 'gi');
          svg = svg.replace(styleRe, (m, prefix, suffix) => `${prefix}${replacement}${suffix}`);
        }
      }
    }

    if (globalFill) {
      svg = svg.replace(/(fill="(?!none|inherit|currentColor)(?:#[0-9a-fA-F]+|[a-zA-Z]+)")/g, `fill="${globalFill}"`);
      svg = svg.replace(/(fill:\s*)#[0-9a-fA-F]{3,8}([\s;])/g, `$1${globalFill}$2`);
    }
    if (globalStroke) {
      svg = svg.replace(/(stroke="(?!none|inherit|currentColor)(?:#[0-9a-fA-F]+|[a-zA-Z]+)")/g, `stroke="${globalStroke}"`);
      svg = svg.replace(/(stroke:\s*)#[0-9a-fA-F]{3,8}([\s;])/g, `$1${globalStroke}$2`);
    }

    if (newWidth || newHeight || globalFill || globalStroke) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const el = doc.documentElement;
        if (newWidth) el.setAttribute('width', newWidth);
        if (newHeight) el.setAttribute('height', newHeight);
        if (globalFill && !el.hasAttribute('fill')) {
          el.setAttribute('fill', globalFill);
        }
        if (globalStroke && !el.hasAttribute('stroke')) {
          el.setAttribute('stroke', globalStroke);
        }
        svg = new XMLSerializer().serializeToString(el);
      } catch { /* skip */ }
    }

    return svg;
  }, [svgOutput, colorReplacements, globalFill, globalStroke, newWidth, newHeight]);

  /* Auto-convert on input change */
  useEffect(() => {
    if (!codeInput.trim()) {
      setSvgOutput('');
      setMeta(null);
      setError(null);
      return;
    }
    const process = () => {
      let svg = codeInput.trim();
      const svgMatch = svg.match(/<svg[\s\S]*?<\/svg>/i);
      if (!svgMatch) {
        setError('No SVG markup found in the input. Paste or upload an SVG file.');
        setSvgOutput('');
        setMeta(null);
        return;
      }
      svg = svgMatch[0];
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        if (doc.querySelector('parsererror')) {
          setError('Invalid SVG markup. Please check your input.');
          setSvgOutput('');
          setMeta(null);
          return;
        }
      } catch {
        setError('Could not parse SVG.');
        setSvgOutput('');
        setMeta(null);
        return;
      }
      setError(null);
      const formatted = formatSvg(svg);
      setSvgOutput(formatted);
      setMeta(getMeta(formatted));
    };
    const timer = setTimeout(process, 100);
    return () => clearTimeout(timer);
  }, [codeInput]);

  /* Update preview blob when modifiedSvg changes */
  useEffect(() => {
    if (!modifiedSvg) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
    setBlobUrl(URL.createObjectURL(blob));
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, [modifiedSvg]);

  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCodeInput(e.target?.result as string);
      setInputTab('paste');
    };
    reader.onerror = () => addToast('Failed to read file', 'error');
    reader.readAsText(file);
  }, [addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleCopy = useCallback(async () => {
    if (!modifiedSvg) { addToast('Nothing to copy', 'error'); return; }
    try {
      await navigator.clipboard.writeText(modifiedSvg);
      addToast('SVG copied to clipboard!', 'success');
    } catch { addToast('Could not copy', 'error'); }
  }, [modifiedSvg, addToast]);

  const handleDownloadSvg = useCallback(() => {
    if (!modifiedSvg) return;
    const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (fileName ? fileName.replace(/\.[^.]+$/, '') : 'image') + '.svg';
    a.click();
    URL.revokeObjectURL(url);
    addToast('SVG downloaded!', 'success');
  }, [modifiedSvg, fileName, addToast]);

  const handleDownloadPng = useCallback(() => {
    if (!blobUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = Math.min(img.naturalWidth, 2048);
      const h = Math.min(img.naturalHeight, 2048);
      canvas.width = w || 300;
      canvas.height = h || 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (!transparentBg) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      canvas.toBlob(b => {
        if (b) {
          const url = URL.createObjectURL(b);
          const a = document.createElement('a');
          a.href = url;
          a.download = (fileName ? fileName.replace(/\.[^.]+$/, '') : 'image') + '.png';
          a.click();
          URL.revokeObjectURL(url);
          addToast('PNG downloaded!', 'success');
        }
      });
    };
    img.onerror = () => addToast('Could not render PNG from SVG', 'error');
    img.src = blobUrl;
  }, [blobUrl, fileName, transparentBg, addToast]);

  const handleReset = useCallback(() => {
    setCodeInput('');
    setFileName('');
    setSvgOutput('');
    setMeta(null);
    setError(null);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setShowGrid(true);
    setTransparentBg(false);
    setColorReplacements({});
    setGlobalFill('');
    setGlobalStroke('');
    setNewWidth('');
    setNewHeight('');
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
    addToast('Reset complete', 'info');
  }, [blobUrl, addToast]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.002)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { setIsPanning(true); setPanStart({ x: e.clientX - panX, y: e.clientY - panY }); }
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setPanX(e.clientX - panStart.x); setPanY(e.clientY - panStart.y); }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Privacy Banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-slate-800/60 rounded-xl text-xs text-slate-400">
        <i className="fas fa-shield-alt text-emerald-500 text-sm"></i>
        <span><strong className="text-slate-300">100% client-side:</strong> Your SVG never leaves your browser. No uploads, no servers.</span>
      </div>

      {/* Main Widget */}
      <div className="bg-[#1a1a1a] border border-slate-800/60 rounded-2xl p-5 md:p-7 space-y-5">

        {/* Input Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/60 pb-3 gap-1">
          <div className="flex gap-1">
            {(['paste', 'upload'] as InputTab[]).map(tab => (
              <button key={tab} type="button" onClick={() => setInputTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all uppercase tracking-wider ${inputTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <i className={`fas ${tab === 'paste' ? 'fa-paste' : 'fa-upload'} mr-1.5`}></i>
                {tab === 'paste' ? 'Paste SVG' : 'Upload SVG'}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
            <i className="fas fa-undo"></i> Reset
          </button>
        </div>

        {/* Input Content */}
        {inputTab === 'upload' && (
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-slate-700/60 rounded-xl p-8 md:p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors bg-slate-900/30"
            onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept=".svg,.html,.txt" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
            <i className="fas fa-cloud-upload-alt text-4xl text-slate-600 mb-3"></i>
            <p className="text-sm text-slate-400 font-medium">Drop an <strong className="text-slate-300">.svg</strong> file here or click to browse</p>
            {fileName && <p className="text-xs text-blue-400 mt-2"><i className="fas fa-check-circle mr-1"></i>{fileName}</p>}
          </div>
        )}

        {inputTab === 'paste' && (
          <textarea value={codeInput} onChange={e => setCodeInput(e.target.value)}
            placeholder="Paste your SVG markup here..."
            className="w-full h-48 md:h-56 bg-slate-900/50 border border-slate-700/60 rounded-xl p-4 text-xs font-mono text-slate-300 placeholder-slate-600 resize-y focus:outline-none focus:border-blue-500/50 transition-colors" spellCheck={false} />
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-900/20 border border-red-800/40 rounded-xl text-xs text-red-400">
            <i className="fas fa-exclamation-triangle"></i><span>{error}</span>
          </div>
        )}

        {/* SVG Viewer */}
        {svgOutput && !error && (
          <div className="space-y-4">
            {/* Viewer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/40 border border-slate-800/40 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Zoom</span>
                <button type="button" onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - 0.25))} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer">−</button>
                <span className="text-xs font-mono text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + 0.25))} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer">+</button>
                <button type="button" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer">Fit</button>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer select-none">
                  <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="accent-blue-500" />
                  Grid
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer select-none">
                  <input type="checkbox" checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)} className="accent-blue-500" />
                  Transparent PNG
                </label>
                <div className="flex gap-1.5">
                  <button type="button" onClick={handleCopy} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-copy"></i> Copy SVG
                  </button>
                  <button type="button" onClick={handleDownloadSvg} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-download"></i> SVG
                  </button>
                  <button type="button" onClick={handleDownloadPng} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-file-image"></i> PNG
                  </button>
                </div>
              </div>
            </div>

            {/* Color & Size Controls — always visible */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/30 border border-slate-800/40 rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1"><i className="fas fa-palette mr-1.5 text-blue-400"></i>Colors</span>
              {detectedColors.length > 0 && detectedColors.map(color => {
                const replacement = colorReplacements[color] || '';
                const displayColor = replacement || color;
                return (
                  <div key={color} className="flex items-center gap-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1">
                    <input type="color" value={displayColor} onChange={e => setColorReplacements(prev => ({ ...prev, [color]: e.target.value === color ? '' : e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0" />
                    <span className="text-[9px] font-mono text-slate-500">{color}</span>
                  </div>
                );
              })}
              <div className={`flex items-center gap-2 ${detectedColors.length > 0 ? 'border-l border-slate-700/50 pl-3' : ''}`}>
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-slate-400 font-medium">Fill:</span>
                  <input type="color" value={globalFill && globalFill !== 'none' ? globalFill : '#000000'} disabled={globalFill === 'none'}
                    onChange={e => setGlobalFill(e.target.value)}
                    className={`w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 ${globalFill === 'none' ? 'opacity-30' : ''}`} />
                  <button type="button" onClick={() => setGlobalFill(globalFill === 'none' ? '' : 'none')}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-colors select-none ${globalFill === 'none' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/50'}`}>
                    None
                  </button>
                  {globalFill && globalFill !== 'none' && (
                    <button type="button" onClick={() => setGlobalFill('')} className="text-red-400 hover:text-red-300 ml-0.5"><i className="fas fa-times text-[8px]"></i></button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-slate-400 font-medium">Stroke:</span>
                  <input type="color" value={globalStroke && globalStroke !== 'none' ? globalStroke : '#000000'} disabled={globalStroke === 'none'}
                    onChange={e => setGlobalStroke(e.target.value)}
                    className={`w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 ${globalStroke === 'none' ? 'opacity-30' : ''}`} />
                  <button type="button" onClick={() => setGlobalStroke(globalStroke === 'none' ? '' : 'none')}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-colors select-none ${globalStroke === 'none' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/50'}`}>
                    None
                  </button>
                  {globalStroke && globalStroke !== 'none' && (
                    <button type="button" onClick={() => setGlobalStroke('')} className="text-red-400 hover:text-red-300 ml-0.5"><i className="fas fa-times text-[8px]"></i></button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/30 border border-slate-800/40 rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1"><i className="fas fa-expand mr-1.5 text-blue-400"></i>Size</span>
              <label className="flex items-center gap-1.5 text-[10px] text-slate-500">
                W:
                <input type="text" value={newWidth} onChange={e => setNewWidth(e.target.value)} placeholder="auto"
                  className="w-16 bg-slate-900/80 border border-slate-700/60 rounded px-1.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500/50" />
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-slate-500">
                H:
                <input type="text" value={newHeight} onChange={e => setNewHeight(e.target.value)} placeholder="auto"
                  className="w-16 bg-slate-900/80 border border-slate-700/60 rounded px-1.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500/50" />
              </label>
              <button type="button" onClick={() => { setNewWidth(''); setNewHeight(''); }}
                className="text-[10px] text-red-400 hover:text-red-300 font-medium">Reset size</button>
            </div>

            {/* Viewer + Metadata + Code */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* SVG Render */}
              <div className={`lg:col-span-2 bg-slate-900/40 border border-slate-800/40 rounded-xl overflow-hidden`}
                style={showGrid ? { backgroundImage: 'linear-gradient(45deg, #1e1e2a 25%, transparent 25%), linear-gradient(-45deg, #1e1e2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e1e2a 75%), linear-gradient(-45deg, transparent 75%, #1e1e2a 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' } : {}}>
                <div className="p-4 min-h-[300px] flex items-center justify-center overflow-hidden"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: isPanning ? 'grabbing' : 'grab' }}>
                  {blobUrl ? (
                    <img src={blobUrl} alt="SVG Preview"
                      style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transition: isPanning ? 'none' : 'transform 0.15s ease' }}
                      className="max-w-none origin-center" draggable={false} />
                  ) : (
                    <div className="text-slate-600 text-xs"><i className="fas fa-image mr-2"></i>Preview</div>
                  )}
                </div>
              </div>

              {/* Metadata + Code */}
              <div className="space-y-4">
                {meta && (
                  <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">SVG Info</span>
                    {[
                      ['viewBox', meta.viewBox],
                      ['Width', meta.width],
                      ['Height', meta.height],
                      ['Elements', String(meta.elementCount)],
                      ['Size', meta.byteSize > 1024 ? `${(meta.byteSize / 1024).toFixed(1)} KB` : `${meta.byteSize} B`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-[11px]">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-300 font-mono font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative bg-[#0d0d0d] border border-slate-800/40 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <i className="fas fa-code mr-1.5"></i>SVG Output
                    </span>
                    <button type="button" onClick={handleCopy} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                      <i className="fas fa-copy"></i> Copy
                    </button>
                  </div>
                  <pre className="p-4 overflow-auto max-h-[300px] text-[11px] leading-relaxed font-mono text-slate-300/90 scrollbar-thin"
                    dangerouslySetInnerHTML={{ __html: highlightCode(modifiedSvg) }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!codeInput.trim() && !svgOutput && (
          <div className="text-center py-10 text-slate-600">
            <i className="fas fa-eye text-4xl mb-3 text-slate-700"></i>
            <p className="text-xs font-medium">Paste or upload an SVG to view and inspect it</p>
          </div>
        )}
      </div>

      {/* Cross-promotion */}
      <div className="bg-[#1a1a1a] border border-slate-800/60 rounded-2xl p-5 md:p-7">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'SVG to Code', icon: 'fa-code', url: '/utility-tools/converter-tools/svg-to-code-converter' },
            { name: 'Image Converter', icon: 'fa-image', url: '/utility-tools/image-tools/image-converter' },
            { name: 'Image to WebP', icon: 'fa-file-image', url: '/utility-tools/image-tools/image-to-webp-converter' },
            { name: 'HTML to Markdown', icon: 'fa-markdown', url: '/utility-tools/html-to-markdown-converter' },
          ].map(t => (
            <a key={t.url} href={t.url}
              className="flex items-center gap-2.5 px-3 py-3 bg-slate-900/30 border border-slate-800/40 rounded-xl hover:border-slate-700/60 transition-all text-left group">
              <i className={`fas ${t.icon} text-sm text-slate-500 group-hover:text-blue-400 transition-colors`}></i>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors leading-tight">{t.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`pointer-events-auto px-5 py-2.5 rounded-xl text-xs font-bold shadow-2xl transition-all duration-300 animate-fade-in-up ${t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
            <i className={`fas ${t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2`}></i>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
