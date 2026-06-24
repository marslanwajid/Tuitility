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

type FormatType = 'react' | 'react-native' | 'vue' | 'angular' | 'html' | 'css-uri' | 'css-mask';
type InputTab = 'upload' | 'paste' | 'url';

const SVG_ATTR_MAP: Record<string, string> = {
  'class': 'className',
  'for': 'htmlFor',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'font-style': 'fontStyle',
  'text-anchor': 'textAnchor',
  'alignment-baseline': 'alignmentBaseline',
  'dominant-baseline': 'dominantBaseline',
  'xml:space': 'xmlSpace',
  'xlink:href': 'xlinkHref',
  'xlink:title': 'xlinkTitle',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-interpolation': 'colorInterpolation',
};

const REACT_NATIVE_ELEMENTS: Record<string, string> = {
  'svg': 'Svg',
  'path': 'Path',
  'circle': 'Circle',
  'rect': 'Rect',
  'line': 'Line',
  'ellipse': 'Ellipse',
  'polygon': 'Polygon',
  'polyline': 'Polyline',
  'g': 'G',
  'defs': 'Defs',
  'clipPath': 'ClipPath',
  'linearGradient': 'LinearGradient',
  'radialGradient': 'RadialGradient',
  'stop': 'Stop',
  'use': 'Use',
  'mask': 'Mask',
  'pattern': 'Pattern',
  'image': 'SvgImage',
  'text': 'Text',
  'tspan': 'TSpan',
  'symbol': 'Symbol',
  'marker': 'Marker',
  'filter': 'Filter',
  'feGaussianBlur': 'FeGaussianBlur',
  'feOffset': 'FeOffset',
  'feMerge': 'FeMerge',
  'feMergeNode': 'FeMergeNode',
  'feColorMatrix': 'FeColorMatrix',
  'feBlend': 'FeBlend',
  'feComposite': 'FeComposite',
  'feFlood': 'FeFlood',
  'feImage': 'FeImage',
  'feMorphology': 'FeMorphology',
  'feTurbulence': 'FeTurbulence',
  'externalResource': 'externalResource',
};

const FORMAT_LABELS: Record<FormatType, string> = {
  'react': 'React JSX Component',
  'react-native': 'React Native SVG',
  'vue': 'Vue SFC',
  'angular': 'Angular Component',
  'html': 'HTML Embed',
  'css-uri': 'CSS Data URI',
  'css-mask': 'CSS Mask',
};

const FORMAT_EXTENSIONS: Record<FormatType, string> = {
  'react': 'tsx',
  'react-native': 'tsx',
  'vue': 'vue',
  'angular': 'ts',
  'html': 'html',
  'css-uri': 'css',
  'css-mask': 'css',
};

const REACT_NATIVE_IMPORTS = 'import React from \'react\';\nimport { Svg, Path, Circle, Rect, Line, Ellipse, Polygon, Polyline, G, Defs, ClipPath, LinearGradient, RadialGradient, Stop, Use, Mask, Pattern, Image as SvgImage, Text, TSpan, Symbol, Marker, Filter, FeGaussianBlur, FeOffset, FeMerge, FeMergeNode, FeColorMatrix, FeBlend, FeComposite, FeFlood, FeImage, FeMorphology, FeTurbulence } from \'react-native-svg\';\n';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cssTextToObject = (css: string): string => {
  const parts: string[] = [];
  css.replace(/\/\*[\s\S]*?\*\//g, '').split(';').forEach(decl => {
    const trimmed = decl.trim();
    if (!trimmed) return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return;
    const prop = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();
    const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && val === numVal.toString()) {
      parts.push(`  ${jsProp}: ${numVal}`);
    } else if (val.startsWith('#')) {
      parts.push(`  ${jsProp}: '${val}'`);
    } else {
      parts.push(`  ${jsProp}: '${val.replace(/'/g, "\\'")}'`);
    }
  });
  return `{\n${parts.join(',\n')}\n}`;
};

const parseStyleObject = (css: string): Record<string, string | number> => {
  const obj: Record<string, string | number> = {};
  css.replace(/\/\*[\s\S]*?\*\//g, '').split(';').forEach(decl => {
    const trimmed = decl.trim();
    if (!trimmed) return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return;
    const prop = trimmed.slice(0, colonIdx).trim();
    let val: string | number = trimmed.slice(colonIdx + 1).trim();
    const numVal = parseFloat(val as string);
    if (!isNaN(numVal) && val === numVal.toString()) {
      val = numVal;
    }
    obj[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  });
  return obj;
};

function isNumeric(val: string): boolean {
  const n = parseFloat(val);
  return !isNaN(n) && val === n.toString();
}

const highlightCode = (code: string): string => {
  let highlighted = escapeXml(code);
  highlighted = highlighted.replace(/(\/\/.*)/g, '<span class="text-green-400/70">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-green-400/70">$1</span>');
  highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, (m, bracket, tag) => `${bracket}<span class="text-blue-300">${tag}</span>`);
  highlighted = highlighted.replace(/(["'`])((?:(?!\1).)*?\1)/g, '<span class="text-amber-200/90">$&</span>');
  highlighted = highlighted.replace(/\b(import|from|export|default|const|let|var|function|return|interface|extends|as|type)\b/g, '<span class="text-purple-300/90">$1</span>');
  highlighted = highlighted.replace(/\b(true|false|undefined|null)\b/g, '<span class="text-orange-300/90">$1</span>');
  return highlighted;
};

const cleanSvgId = (id: string): string => {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(id)) return id;
  return `"${id}"`;
};

export default function SvgToCodeConverter() {
  const [inputTab, setInputTab] = useState<InputTab>('paste');
  const [svgInput, setSvgInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<FormatType>('react');
  const [componentName, setComponentName] = useState('SvgComponent');
  const [removeSize, setRemoveSize] = useState(true);
  const [cleanAttrs, setCleanAttrs] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [simpleHtml, setSimpleHtml] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [colorReplacements, setColorReplacements] = useState<Record<string, string>>({});
  const [globalFill, setGlobalFill] = useState('');
  const [globalStroke, setGlobalStroke] = useState('');
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [originalAspect, setOriginalAspect] = useState(1);
  const [globalStrokeWidth, setGlobalStrokeWidth] = useState('');
  const [transparentBg, setTransparentBg] = useState(false);
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widthInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const detectColors = useCallback((svg: string) => {
    const colors = new Set<string>();
    const attrRe = /(?:fill|stroke|stop-color|color)="(#(?:[0-9a-fA-F]{3,8}))"/g;
    let m;
    while ((m = attrRe.exec(svg)) !== null) colors.add(m[1].toLowerCase());
    const styleRe = /(?:fill|stroke|stop-color|color):\s*(#[0-9a-fA-F]{3,8})/g;
    while ((m = styleRe.exec(svg)) !== null) colors.add(m[1].toLowerCase());
    return Array.from(colors).sort();
  }, []);

  useEffect(() => {
    if (svgInput) {
      const colors = detectColors(svgInput);
      setDetectedColors(colors);
      setColorReplacements(prev => {
        const next = { ...prev };
        for (const c of colors) if (!(c in next)) next[c] = '';
        for (const k of Object.keys(next)) if (!colors.includes(k)) delete next[k];
        return next;
      });
      const vb = /viewBox="\d+\s+\d+\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/.exec(svgInput);
      if (vb) setOriginalAspect(parseFloat(vb[1]) / parseFloat(vb[2]));
    } else {
      setDetectedColors([]);
      setColorReplacements({});
      setGlobalFill('');
      setGlobalStroke('');
      setNewWidth('');
      setNewHeight('');
      setGlobalStrokeWidth('');
    }
  }, [svgInput, detectColors]);

  const modifiedSvg = useMemo(() => {
    if (!svgInput) return '';
    let svg = svgInput;

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

    if (globalStrokeWidth) {
      svg = svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${globalStrokeWidth}"`);
      svg = svg.replace(/stroke-width:\s*[^;]+/g, `stroke-width: ${globalStrokeWidth}`);
    }

    if (newWidth || newHeight || globalFill || globalStroke || globalStrokeWidth) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgEl = doc.documentElement;
        if (newWidth) svgEl.setAttribute('width', newWidth);
        if (newHeight) svgEl.setAttribute('height', newHeight);
        if (globalFill && !svgEl.hasAttribute('fill')) {
          svgEl.setAttribute('fill', globalFill);
        }
        if (globalStroke && !svgEl.hasAttribute('stroke')) {
          svgEl.setAttribute('stroke', globalStroke);
        }
        if (globalStrokeWidth && !svgEl.hasAttribute('stroke-width')) {
          svgEl.setAttribute('stroke-width', globalStrokeWidth);
        }
        const serializer = new XMLSerializer();
        svg = serializer.serializeToString(svgEl);
      } catch { /* skip resize and fallback attributes on parse error */ }
    }

    return svg;
  }, [svgInput, colorReplacements, globalFill, globalStroke, newWidth, newHeight, globalStrokeWidth]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const processSvgString = useCallback((svgStr: string) => {
    if (!svgStr.trim()) {
      setError(null);
      setCodeOutput('');
      if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
      return;
    }
    setError(null);
    setIsProcessing(true);
    setProgress(0);

    setTimeout(() => {
      try {
        if (svgStr.length > 500000) {
          addToast('Large SVG detected — processing may take a moment', 'info');
        }
        const totalWork = 3;
        setProgress(1 / totalWork * 100);

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgStr, 'image/svg+xml');
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          setError('Invalid SVG markup. Please check your input.');
          setIsProcessing(false);
          return;
        }

        setProgress(2 / totalWork * 100);

        const root = doc.documentElement;
        if (!root || root.tagName.toLowerCase() !== 'svg') {
          setError('No SVG element found in the input.');
          setIsProcessing(false);
          return;
        }

        const output = generateCode(root, format, componentName, { removeSize, cleanAttrs, prettyPrint, simpleHtml });
        setCodeOutput(output);

        const serializer = new XMLSerializer();
        let displaySvg = svgStr;
        if (removeSize) {
          const displayDoc = parser.parseFromString(svgStr, 'image/svg+xml');
          const svgEl = displayDoc.documentElement;
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          displaySvg = serializer.serializeToString(svgEl);
        }
        const blob = new Blob([displaySvg], { type: 'image/svg+xml' });
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        setProgress(100);
        setIsProcessing(false);
      } catch (e) {
        setError('Failed to process SVG: ' + (e instanceof Error ? e.message : 'Unknown error'));
        setIsProcessing(false);
      }
    }, 50);
  }, [format, componentName, removeSize, cleanAttrs, prettyPrint, simpleHtml, blobUrl, addToast]);

  useEffect(() => {
    processSvgString(modifiedSvg);
  }, [modifiedSvg, format, componentName, removeSize, cleanAttrs, prettyPrint, simpleHtml]);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg')) {
      addToast('Please select an SVG file', 'error');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSvgInput(text);
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

  const handleUrlFetch = useCallback(async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { addToast('Enter a URL first', 'error'); return; }
    setIsProcessing(true);
    try {
      const res = await fetch(trimmed);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes('<svg')) throw new Error('Response does not contain SVG markup');
      setSvgInput(text);
      setInputTab('paste');
      addToast('SVG fetched successfully', 'success');
    } catch (e) {
      addToast('Failed to fetch SVG: ' + (e instanceof Error ? e.message : 'Unknown error'), 'error');
    }
    setIsProcessing(false);
  }, [urlInput, addToast]);

  const handleCopy = useCallback(async () => {
    if (!codeOutput) { addToast('Nothing to copy', 'error'); return; }
    try {
      await navigator.clipboard.writeText(codeOutput);
      addToast('Code copied to clipboard!', 'success');
    } catch {
      addToast('Could not copy', 'error');
    }
  }, [codeOutput, addToast]);

  const handleDownload = useCallback(() => {
    if (!codeOutput) { addToast('Nothing to download', 'error'); return; }
    const ext = FORMAT_EXTENSIONS[format];
    const blob = new Blob([codeOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName || 'svg-output'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('File downloaded!', 'success');
  }, [codeOutput, format, componentName, addToast]);

  const handleDownloadPng = useCallback(() => {
    if (!blobUrl) { addToast('No SVG to render', 'error'); return; }
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
          a.download = (fileName ? fileName.replace(/\.[^.]+$/, '') : 'svg') + '.png';
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
    setSvgInput('');
    setUrlInput('');
    setFileName('');
    setCodeOutput('');
    setError(null);
    setComponentName('SvgComponent');
    setColorReplacements({});
    setGlobalFill('');
    setGlobalStroke('');
    setNewWidth('');
    setNewHeight('');
    setGlobalStrokeWidth('');
    setTransparentBg(false);
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
    addToast('Reset complete', 'info');
  }, [blobUrl, addToast]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Privacy Banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-slate-800/60 rounded-xl text-xs text-slate-400">
        <i className="fas fa-shield-alt text-emerald-500 text-sm"></i>
        <span><strong className="text-slate-300">100% client-side:</strong> Your SVG file never leaves your browser. No uploads, no servers.</span>
      </div>

      {/* Main Widget */}
      <div className="bg-[#1a1a1a] border border-slate-800/60 rounded-2xl p-5 md:p-7 space-y-5">

        {/* Input Tabs */}
        <div className="flex flex-wrap border-b border-slate-800/60 pb-3 gap-1">
          {(['upload', 'paste', 'url'] as InputTab[]).map(tab => (
            <button key={tab} type="button" onClick={() => setInputTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all uppercase tracking-wider ${inputTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
              <i className={`fas ${tab === 'upload' ? 'fa-upload' : tab === 'paste' ? 'fa-paste' : 'fa-link'} mr-1.5`}></i>
              {tab === 'upload' ? 'Upload' : tab === 'paste' ? 'Paste SVG' : 'From URL'}
            </button>
          ))}
        </div>

        {/* Input Content */}
        {inputTab === 'upload' && (
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-slate-700/60 rounded-xl p-8 md:p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors bg-slate-900/30"
            onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
            <i className="fas fa-cloud-upload-alt text-4xl text-slate-600 mb-3"></i>
            <p className="text-sm text-slate-400 font-medium">Drop your <strong className="text-slate-300">.svg</strong> file here or click to browse</p>
            {fileName && <p className="text-xs text-blue-400 mt-2"><i className="fas fa-check-circle mr-1"></i>{fileName}</p>}
          </div>
        )}

        {inputTab === 'paste' && (
          <textarea value={svgInput} onChange={e => setSvgInput(e.target.value)}
            placeholder="Paste your SVG markup here..."
            className="w-full h-48 md:h-56 bg-slate-900/50 border border-slate-700/60 rounded-xl p-4 text-xs font-mono text-slate-300 placeholder-slate-600 resize-y focus:outline-none focus:border-blue-500/50 transition-colors" spellCheck={false} />
        )}

        {inputTab === 'url' && (
          <div className="flex gap-2">
            <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.svg"
              className="flex-1 bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
            <button type="button" onClick={handleUrlFetch} disabled={isProcessing}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2">
              <i className="fas fa-download"></i> Fetch
            </button>
          </div>
        )}

        {/* Settings Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Output Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as FormatType)}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-blue-500/50 cursor-pointer">
              {(Object.entries(FORMAT_LABELS) as [FormatType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Component Name</label>
            <input type="text" value={componentName} onChange={e => setComponentName(e.target.value || 'SvgComponent')}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-lg cursor-pointer hover:border-blue-500/40 transition-colors select-none">
              <input type="checkbox" checked={removeSize} onChange={e => setRemoveSize(e.target.checked)} className="accent-blue-500" />
              <span className="text-[11px] text-slate-400 font-medium">Remove w/h</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-lg cursor-pointer hover:border-blue-500/40 transition-colors select-none">
              <input type="checkbox" checked={cleanAttrs} onChange={e => setCleanAttrs(e.target.checked)} className="accent-blue-500" />
              <span className="text-[11px] text-slate-400 font-medium">Clean attrs</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-lg cursor-pointer hover:border-blue-500/40 transition-colors select-none">
              <input type="checkbox" checked={prettyPrint} onChange={e => setPrettyPrint(e.target.checked)} className="accent-blue-500" />
              <span className="text-[11px] text-slate-400 font-medium">Pretty print</span>
            </label>
            <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors select-none ${format === 'html' ? 'bg-slate-900/80 border-slate-700/60 hover:border-blue-500/40' : 'bg-slate-900/30 border-slate-800/30 opacity-40 pointer-events-none'}`}>
              <input type="checkbox" checked={simpleHtml} onChange={e => setSimpleHtml(e.target.checked)} disabled={format !== 'html'} className="accent-blue-500" />
              <span className="text-[11px] text-slate-400 font-medium">Simple HTML</span>
            </label>
          </div>
        </div>

        {/* Color & Size Controls — always visible */}
        {svgInput.trim() && (
          <>
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
              <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer select-none">
                <input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} className="accent-blue-500" />
                Lock
              </label>
              <button type="button" onClick={() => { setNewWidth(''); setNewHeight(''); }}
                className="text-[10px] text-red-400 hover:text-red-300 font-medium">Reset size</button>
              <div className="border-l border-slate-700/50 pl-3 flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  Stroke W:
                  <input type="text" value={globalStrokeWidth} onChange={e => setGlobalStrokeWidth(e.target.value)} placeholder="auto"
                    className="w-16 bg-slate-900/80 border border-slate-700/60 rounded px-1.5 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500/50" />
                </label>
                {globalStrokeWidth && <button type="button" onClick={() => setGlobalStrokeWidth('')} className="text-red-400 hover:text-red-300"><i className="fas fa-times text-[8px]"></i></button>}
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-900/20 border border-red-800/40 rounded-xl text-xs text-red-400">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* Split Preview */}
        {(modifiedSvg.trim() && !error && !isProcessing) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SVG Render */}
            <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/40">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <i className="fas fa-image mr-1.5"></i>SVG Preview
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer select-none">
                    <input type="checkbox" checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)} className="accent-blue-500" />
                    Transparent PNG
                  </label>
                  <button type="button" onClick={handleDownloadPng} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-download"></i> PNG
                  </button>
                  <button type="button" onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(modifiedSvg);
                      addToast('SVG markup copied!', 'success');
                    } catch { addToast('Could not copy', 'error'); }
                  }} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-copy"></i> Copy SVG
                  </button>
                </div>
              </div>
              <div className="p-4 min-h-[200px] flex items-center justify-center">
                {blobUrl ? (
                  <object data={blobUrl} type="image/svg+xml" className="max-w-full max-h-[400px]" aria-label="SVG Preview">
                    <div className="text-slate-500 text-xs">SVG preview</div>
                  </object>
                ) : (
                  <div className="text-slate-600 text-xs"><i className="fas fa-image mr-2"></i>Preview</div>
                )}
              </div>
            </div>

            {/* Code Output */}
            <div className="relative bg-[#0d0d0d] border border-slate-800/40 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/40">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <i className="fas fa-code mr-1.5"></i>
                  {FORMAT_LABELS[format]}.{FORMAT_EXTENSIONS[format]}
                </span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={handleCopy} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-copy"></i> Copy
                  </button>
                  <button type="button" onClick={handleDownload} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1">
                    <i className="fas fa-download"></i> Download
                  </button>
                  <button type="button" onClick={handleReset} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer">
                    <i className="fas fa-undo"></i>
                  </button>
                </div>
              </div>
              <pre className="p-4 overflow-auto max-h-[500px] text-[11px] leading-relaxed font-mono text-slate-300/90 scrollbar-thin"
                dangerouslySetInnerHTML={{ __html: highlightCode(codeOutput) }} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!svgInput.trim() && !isProcessing && (
          <div className="text-center py-10 text-slate-600">
            <i className="fas fa-vector-square text-4xl mb-3 text-slate-700"></i>
            <p className="text-xs font-medium">Upload, paste, or fetch an SVG to convert it into code</p>
          </div>
        )}
      </div>

      {/* Cross-promotion */}
      <div className="bg-[#1a1a1a] border border-slate-800/60 rounded-2xl p-5 md:p-7">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Image Converter', icon: 'fa-image', url: '/utility-tools/image-tools/image-converter' },
            { name: 'Image to WebP', icon: 'fa-file-image', url: '/utility-tools/image-tools/image-to-webp-converter' },
            { name: 'RGB to Hex', icon: 'fa-palette', url: '/utility-tools/converter-tools/rgb-to-hex-converter' },
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

/* ---- SVG to Code Conversion Engine ---- */

interface ConversionOptions {
  removeSize: boolean;
  cleanAttrs: boolean;
  prettyPrint: boolean;
  simpleHtml: boolean;
}

const SVG_SELF_CLOSING = new Set(['path', 'circle', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'use', 'image', 'feGaussianBlur', 'feOffset', 'feMergeNode', 'feColorMatrix', 'feBlend', 'feComposite', 'feFlood', 'feImage', 'feMorphology', 'feTurbulence', 'stop', 'br', 'hr', 'input', 'meta', 'link']);

function getOutputIndent(pretty: boolean, depth: number): string {
  return pretty ? '  '.repeat(depth) : '';
}

function getNewline(pretty: boolean): string {
  return pretty ? '\n' : ' ';
}

function convertAttrsToJsx(el: Element, options: ConversionOptions): string {
  const attrs: string[] = [];
  const skipAttrs = new Set<string>();
  if (options.cleanAttrs) {
    skipAttrs.add('xmlns');
    skipAttrs.add('xmlns:xlink');
    skipAttrs.add('version');
  }
  if (options.removeSize) {
    skipAttrs.add('width');
    skipAttrs.add('height');
  }

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (skipAttrs.has(attr.name)) continue;

    let jsxName = SVG_ATTR_MAP[attr.name] || attr.name;
    let val = attr.value;

    if (attr.name === 'style') {
      attrs.push(`style={${cssTextToObject(val)}}`);
      continue;
    }

    if (jsxName.includes('-') && /^[a-z]/.test(jsxName)) {
      jsxName = `'${jsxName}'`;
    }

    if (typeof val === 'string' && val.includes("'")) {
      val = val.replace(/'/g, "\\'");
    }

    const needsCurly = isNumeric(val);
    if (needsCurly) {
      attrs.push(`${jsxName}={${val}}`);
    } else if (/^#[0-9a-fA-F]{3,8}$/.test(val) || val === 'none' || val === 'inherit') {
      attrs.push(`${jsxName}="${val}"`);
    } else if (val.includes('url(#') || val.includes('(')) {
      attrs.push(`${jsxName}="${val}"`);
    } else {
      attrs.push(`${jsxName}="${val}"`);
    }
  }
  return attrs.join(' ');
}

function convertAttrsToVue(el: Element, options: ConversionOptions): string {
  const attrs: string[] = [];
  const skipAttrs = new Set<string>();
  if (options.cleanAttrs) {
    skipAttrs.add('xmlns:xlink');
    skipAttrs.add('version');
  }
  if (options.removeSize) {
    skipAttrs.add('width');
    skipAttrs.add('height');
  }
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (skipAttrs.has(attr.name)) continue;
    let val = attr.value;
    if (val.includes('"')) val = val.replace(/"/g, '&quot;');
    if (attr.name === 'class') {
      attrs.push(`class="${val}"`);
    } else if (attr.name === 'style') {
      attrs.push(`:style="${JSON.stringify(parseStyleObject(val)).replace(/"/g, '\'')}"`);
    } else {
      attrs.push(`${attr.name}="${val}"`);
    }
  }
  return attrs.join(' ');
}

function convertAttrsToAngular(el: Element, options: ConversionOptions): string {
  const attrs: string[] = [];
  const skipAttrs = new Set<string>();
  if (options.cleanAttrs) {
    skipAttrs.add('xmlns:xlink');
    skipAttrs.add('version');
  }
  if (options.removeSize) {
    skipAttrs.add('width');
    skipAttrs.add('height');
  }
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (skipAttrs.has(attr.name)) continue;
    let val = attr.value;
    if (val.includes('"')) val = val.replace(/"/g, '&quot;');
    if (attr.name === 'class') {
      attrs.push(`class="${val}"`);
    } else if (attr.name === 'style') {
      attrs.push(`[style]="'${val.replace(/'/g, "\\'")}'"`);
    } else {
      attrs.push(`${attr.name}="${val}"`);
    }
  }
  return attrs.join(' ');
}

function convertAttrsToHtml(el: Element, options: ConversionOptions): string {
  const attrs: string[] = [];
  const skipAttrs = new Set<string>();
  if (options.cleanAttrs) {
    skipAttrs.add('xmlns:xlink');
    skipAttrs.add('version');
  }
  if (options.removeSize) {
    skipAttrs.add('width');
    skipAttrs.add('height');
  }
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (skipAttrs.has(attr.name)) continue;
    let val = attr.value;
    if (val.includes('"')) val = val.replace(/"/g, '&quot;');
    attrs.push(`${attr.name}="${val}"`);
  }
  return attrs.join(' ');
}

function walkChildren(el: Element, depth: number, format: FormatType, options: ConversionOptions): string {
  let result = '';
  const indent = getOutputIndent(options.prettyPrint, depth);
  const nl = getNewline(options.prettyPrint);
  const children = Array.from(el.children);
  const textContent = el.textContent?.trim();

  for (const child of children) {
    const tag = child.tagName.toLowerCase();
    const isSelfClosing = SVG_SELF_CLOSING.has(tag);
    let convertedTag = tag;

    if (format === 'react-native') {
      convertedTag = REACT_NATIVE_ELEMENTS[tag] || tag;
    }

    let attrs = '';
    if (format === 'react' || format === 'react-native') {
      attrs = convertAttrsToJsx(child, options);
    } else if (format === 'vue') {
      attrs = convertAttrsToVue(child, options);
    } else if (format === 'angular') {
      attrs = convertAttrsToAngular(child, options);
    } else {
      attrs = convertAttrsToHtml(child, options);
    }

    const inner = walkChildren(child, depth + 1, format, options);
    const hasChildren = inner.length > 0;
    const hasText = child.textContent?.trim() && child.children.length === 0;

    if (isSelfClosing && !hasChildren && !hasText) {
      result += `${indent}<${convertedTag}${attrs ? ' ' + attrs : ''} />${nl}`;
    } else if (hasText && !hasChildren) {
      const escaped = child.textContent?.trim() || '';
      if (format === 'react' || format === 'react-native') {
        result += `${indent}<${convertedTag}${attrs ? ' ' + attrs : ''}>${escaped.replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;')}</${convertedTag}>${nl}`;
      } else {
        result += `${indent}<${convertedTag}${attrs ? ' ' + attrs : ''}>${escaped}</${convertedTag}>${nl}`;
      }
    } else {
      const innerContent = `${nl}${inner}${getOutputIndent(options.prettyPrint, depth)}`;
      result += `${indent}<${convertedTag}${attrs ? ' ' + attrs : ''}>${innerContent}</${convertedTag}>${nl}`;
    }
  }

  if (format === 'react' || format === 'react-native') {
    if (textContent && children.length === 0 && !result) {
      result = textContent.replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;');
    }
  }

  return result;
}

function generateCode(root: Element, format: FormatType, name: string, options: ConversionOptions): string {
  const indent = (d: number) => getOutputIndent(options.prettyPrint, d);
  const nl = getNewline(options.prettyPrint);
  const svgContent = walkChildren(root, 1, format, options);
  const inner = `${nl}${svgContent}${indent(0)}`;

  switch (format) {
    case 'react': {
      let svgAttrs = convertAttrsToJsx(root, { ...options, removeSize: false });
      if (options.removeSize) {
        svgAttrs = convertAttrsToJsx(root, options);
      }
      const propsName = name.charAt(0).toUpperCase() + name.slice(1).replace(/Component$/, '') + 'Props';
      return `import React from 'react';

interface ${propsName} extends React.SVGProps<SVGSVGElement> {}

const ${name}: React.FC<${propsName}> = (props) => (
  <svg${svgAttrs ? ' ' + svgAttrs : ''} {...props}>${inner}</svg>
);

export default ${name};
`;
    }

    case 'react-native': {
      let svgAttrs = convertAttrsToJsx(root, { ...options, removeSize: false });
      if (options.removeSize) {
        svgAttrs = convertAttrsToJsx(root, options);
      }
      return `${REACT_NATIVE_IMPORTS}
interface ${name}Props {}

const ${name}: React.FC<${name}Props> = (props) => (
  <Svg${svgAttrs ? ' ' + svgAttrs : ''} {...props}>${inner}</Svg>
);

export default ${name};
`;
    }

    case 'vue': {
      let svgAttrs = convertAttrsToVue(root, { ...options, removeSize: false });
      if (options.removeSize) {
        svgAttrs = convertAttrsToVue(root, options);
      }
      return `<template>
  <svg${svgAttrs ? ' ' + svgAttrs : ''}>${inner}</svg>
</template>

<script setup lang="ts">
</script>
`;
    }

    case 'angular': {
      let svgAttrs = convertAttrsToAngular(root, { ...options, removeSize: false });
      if (options.removeSize) {
        svgAttrs = convertAttrsToAngular(root, options);
      }
      const sel = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      return `import { Component } from '@angular/core';

@Component({
  selector: '${sel}',
  template: \`
    <svg${svgAttrs ? ' ' + svgAttrs : ''}>${inner.replace(/`/g, '\\`')}</svg>
  \`,
  styles: [\`
    :host { display: inline-block; }
  \`]
})
export class ${name}Component {}
`;
    }

    case 'html': {
      if (options.simpleHtml) {
        const serializer = new XMLSerializer();
        const clone = root.cloneNode(true) as Element;
        if (options.removeSize) {
          clone.removeAttribute('width');
          clone.removeAttribute('height');
        }
        if (options.cleanAttrs) {
          clone.removeAttribute('xmlns:xlink');
          clone.removeAttribute('version');
        }
        let raw = serializer.serializeToString(clone);
        if (!options.prettyPrint) raw = raw.replace(/>\s+</g, '><').trim();
        return raw;
      }
      let svgAttrs = convertAttrsToHtml(root, { ...options, removeSize: false });
      if (options.removeSize) {
        svgAttrs = convertAttrsToHtml(root, options);
      }
      return `<svg${svgAttrs ? ' ' + svgAttrs : ''}>${inner}</svg>`;
    }

    case 'css-uri': {
      const serializer = new XMLSerializer();
      const doc = root.ownerDocument;
      if (!doc) return '/* No SVG data */';
      const clone = root.cloneNode(true) as Element;
      if (options.removeSize) {
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      }
      if (options.cleanAttrs) {
        clone.removeAttribute('xmlns:xlink');
        clone.removeAttribute('version');
      }
      let svgStr = serializer.serializeToString(clone);
      svgStr = svgStr.replace(/%/g, '%25').replace(/#/g, '%23').replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\s+/g, ' ').trim();
      return `background-image: url("data:image/svg+xml,${svgStr}");`;
    }

    case 'css-mask': {
      const serializer = new XMLSerializer();
      const doc = root.ownerDocument;
      if (!doc) return '/* No SVG data */';
      const clone = root.cloneNode(true) as Element;
      if (options.removeSize) {
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      }
      if (options.cleanAttrs) {
        clone.removeAttribute('xmlns:xlink');
        clone.removeAttribute('version');
      }
      let svgStr = serializer.serializeToString(clone);
      svgStr = svgStr.replace(/%/g, '%25').replace(/#/g, '%23').replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\s+/g, ' ').trim();
      return `mask: url("data:image/svg+xml,${svgStr}");
-webkit-mask: url("data:image/svg+xml,${svgStr}");`;
    }

    default:
      return '';
  }
}
