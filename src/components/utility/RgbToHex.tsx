'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace(/^#/, '').match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const [R, G, B] = [r, g, b].map((c) => c / 255);
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) * 60;
  else if (max === G) h = ((B - R) / d + 2) * 60;
  else h = ((R - G) / d + 4) * 60;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

interface ColorHistoryItem {
  hex: string;
  r: number;
  g: number;
  b: number;
}

const MAX_HISTORY = 12;

export default function RgbToHex() {
  const [r, setR] = useState(128);
  const [g, setG] = useState(128);
  const [b, setB] = useState(128);
  const [hexInput, setHexInput] = useState('#808080');
  const [history, setHistory] = useState<ColorHistoryItem[]>([]);
  const [copied, setCopied] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [picking, setPicking] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverColor, setHoverColor] = useState<{ r: number; g: number; b: number; hex: string } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const magnifierRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoom = 10;
  const magnifierSize = 160;

  const hex = useMemo(() => rgbToHex(r, g, b), [r, g, b]);
  const hsl = useMemo(() => rgbToHsl(r, g, b), [r, g, b]);
  const hslStr = useMemo(() => hslToString(hsl.h, hsl.s, hsl.l), [hsl]);

  const updateFromRgb = useCallback((nr: number, ng: number, nb: number) => {
    setR(clamp(nr, 0, 255));
    setG(clamp(ng, 0, 255));
    setB(clamp(nb, 0, 255));
    setHexInput(rgbToHex(clamp(nr, 0, 255), clamp(ng, 0, 255), clamp(nb, 0, 255)));
  }, []);

  const updateFromHex = useCallback((val: string) => {
    setHexInput(val);
    const parsed = hexToRgb(val);
    if (parsed) { setR(parsed.r); setG(parsed.g); setB(parsed.b); }
  }, []);

  const handleColorPicker = useCallback((val: string) => {
    setHexInput(val);
    const parsed = hexToRgb(val);
    if (parsed) { setR(parsed.r); setG(parsed.g); setB(parsed.b); }
  }, []);

  const addToHistory = useCallback(() => {
    setHistory((prev) => {
      const item: ColorHistoryItem = { hex, r, g, b };
      const filtered = prev.filter((h) => h.hex !== hex);
      return [item, ...filtered].slice(0, MAX_HISTORY);
    });
  }, [hex, r, g, b]);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      const canvas = hiddenCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }, []);

  const pixelFromImg = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    const canvas = hiddenCanvasRef.current;
    if (!img || !canvas) return null;
    const rect = img.getBoundingClientRect();
    const dispW = rect.width, dispH = rect.height;
    const nw = canvas.width, nh = canvas.height;
    const imgAspect = nw / nh;
    const dispAspect = dispW / dispH;
    let drawW: number, drawH: number, offX: number, offY: number;
    if (imgAspect > dispAspect) {
      drawW = dispW;
      drawH = dispW / imgAspect;
      offX = 0;
      offY = (dispH - drawH) / 2;
    } else {
      drawH = dispH;
      drawW = dispH * imgAspect;
      offX = (dispW - drawW) / 2;
      offY = 0;
    }
    const mx = e.clientX - rect.left - offX;
    const my = e.clientY - rect.top - offY;
    if (mx < 0 || my < 0 || mx > drawW || my > drawH) return null;
    const px = Math.round((mx / drawW) * nw);
    const py = Math.round((my / drawH) * nh);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const data = ctx.getImageData(Math.min(px, nw - 1), Math.min(py, nh - 1), 1, 1).data;
    if (data.length < 3) return null;
    return { x: px, y: py, r: data[0], g: data[1], b: data[2], hex: rgbToHex(data[0], data[1], data[2]) };
  }, []);

  const drawMagnifier = useCallback((srcX: number, srcY: number) => {
    const mCanvas = magnifierRef.current;
    const srcCanvas = hiddenCanvasRef.current;
    if (!mCanvas || !srcCanvas) return;
    const ctx = mCanvas.getContext('2d');
    if (!ctx) return;
    const size = magnifierSize;
    const halfView = Math.floor(size / zoom / 2);
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(
      srcCanvas,
      Math.max(0, srcX - halfView), Math.max(0, srcY - halfView),
      size / zoom, size / zoom,
      0, 0, size, size
    );
    const cx = size / 2, cy = size / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, size, size);
  }, []);

  const handleImgMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!picking) return;
    const pixel = pixelFromImg(e);
    if (!pixel) { setHoverPos(null); setHoverColor(null); return; }
    const rect = imgRef.current!.getBoundingClientRect();
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoverColor({ r: pixel.r, g: pixel.g, b: pixel.b, hex: pixel.hex });
    drawMagnifier(pixel.x, pixel.y);
  }, [picking, pixelFromImg, drawMagnifier]);

  const handleImgLeave = useCallback(() => {
    setHoverPos(null);
    setHoverColor(null);
  }, []);

  const handleImgClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!picking) return;
    const pixel = pixelFromImg(e);
    if (!pixel) return;
    const rect = imgRef.current!.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    updateFromRgb(pixel.r, pixel.g, pixel.b);
  }, [picking, pixelFromImg, updateFromRgb]);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleImageUpload(f);
  }, [handleImageUpload]);

  const handleImageDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleImageDragLeave = () => setDragging(false);

  const removeImage = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
    setImgNatural(null);
    setCursorPos(null);
  }, [imageUrl]);

  const handleCopy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500); } catch { }
  };

  const complementary = useMemo(() => `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`, [hsl]);
  const analogous = useMemo(() => [
    `hsl(${(hsl.h + 330) % 360}, ${hsl.s}%, ${hsl.l}%)`,
    `hsl(${(hsl.h + 30) % 360}, ${hsl.s}%, ${hsl.l}%)`,
    `hsl(${(hsl.h + 300) % 360}, ${hsl.s}%, ${hsl.l}%)`,
    `hsl(${(hsl.h + 60) % 360}, ${hsl.s}%, ${hsl.l}%)`,
  ], [hsl]);

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
            All color conversion and processing happens 100% locally inside your browser. No data is ever uploaded.
          </p>
        </div>
      </div>

      {/* Color Preview Swatch */}
      <div
        className="w-full h-32 md:h-44 rounded-2xl border border-slate-100 transition-all duration-200"
        style={{ backgroundColor: hex }}
      ></div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RGB Sliders */}
        <div className="space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <i className="fas fa-sliders-h mr-2 text-slate-400"></i>RGB Values
          </span>
          {[
            { label: 'R', val: r, set: (v: number) => updateFromRgb(v, g, b), color: 'red', bg: 'bg-red-500' },
            { label: 'G', val: g, set: (v: number) => updateFromRgb(r, v, b), color: 'green', bg: 'bg-green-500' },
            { label: 'B', val: b, set: (v: number) => updateFromRgb(r, g, v), color: 'blue', bg: 'bg-blue-500' },
          ].map((channel) => (
            <div key={channel.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{channel.label}</span>
                <input
                  type="number"
                  min={0} max={255}
                  value={channel.val}
                  onChange={(e) => channel.set(parseInt(e.target.value) || 0)}
                  className="w-16 text-center text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <input
                type="range"
                min={0} max={255}
                value={channel.val}
                onChange={(e) => channel.set(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-slate-900"
                style={{
                  background: `linear-gradient(to right, ${channel.label === 'R' ? '#fee2e2' : channel.label === 'G' ? '#dcfce7' : '#dbeafe'}, ${channel.bg.replace('bg-', 'rgb(').replace('-500', '500)')})`,
                }}
              />
            </div>
          ))}
        </div>

        {/* HEX + Color Picker */}
        <div className="space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <i className="fas fa-hashtag mr-2 text-slate-400"></i>HEX & Color Picker
          </span>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">HEX Value</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => updateFromHex(e.target.value)}
              placeholder="#000000"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Color Picker</label>
            <input
              type="color"
              value={hex}
              onChange={(e) => handleColorPicker(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 cursor-pointer bg-white p-1"
            />
          </div>
          <button
            onClick={addToHistory}
            className="px-5 py-2.5 rounded-full bg-[#1a1a1a] text-white font-extrabold text-xs hover:bg-neutral-800 transition-colors w-full"
          >
            <i className="fas fa-plus mr-1.5"></i>Save to History
          </button>
        </div>
      </div>

      {/* Color History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <i className="fas fa-clock mr-2 text-slate-400"></i>Color History
          </span>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item.hex}
                onClick={() => updateFromRgb(item.r, item.g, item.b)}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: item.hex }}
                title={item.hex}
              ></button>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload — Pick Color from Photo */}
      <div className="space-y-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
          <i className="fas fa-image mr-2 text-slate-400"></i>Pick Color from Image
        </span>
        {!imageUrl ? (
          <div
            className={`w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              dragging ? 'border-slate-900 bg-slate-50 scale-[0.99]' : 'border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 bg-white'
            }`}
            onDrop={handleImageDrop}
            onDragOver={handleImageDragOver}
            onDragLeave={handleImageDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
            />
            <div className="space-y-2">
              <i className="fas fa-cloud-upload-alt text-3xl text-slate-300"></i>
              <p className="text-sm text-slate-600 font-semibold">Drop an image here or click to browse</p>
              <p className="text-[10px] text-slate-400">Upload a photo or design to pick colors directly from it</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <div className="absolute top-3 right-3 z-20 flex space-x-2">
              <button
                onClick={() => { setPicking(!picking); if (!picking) { setCursorPos(null); setHoverPos(null); setHoverColor(null); } }}
                className={`px-4 py-2 rounded-full text-[11px] font-extrabold transition-colors shadow-md ${
                  picking ? 'bg-[#1a1a1a] text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <i className={`fas ${picking ? 'fa-crosshairs' : 'fa-eye-dropper'} mr-1.5`}></i>
                {picking ? 'Picking Active' : 'Pick Color'}
              </button>
              <button
                onClick={removeImage}
                className="px-4 py-2 rounded-full bg-white text-slate-600 border border-slate-200 text-[11px] font-extrabold hover:bg-slate-50 transition-colors shadow-md"
              >
                <i className="fas fa-times mr-1.5"></i>Remove
              </button>
            </div>
            <div className="relative select-none">
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Uploaded"
                className={`w-full max-h-[400px] object-contain ${picking ? 'cursor-crosshair' : ''}`}
                draggable={false}
                onClick={handleImgClick}
                onMouseMove={handleImgMove}
                onMouseLeave={handleImgLeave}
              />
              <canvas ref={hiddenCanvasRef} className="hidden" />

              {/* Magnifier */}
              {picking && hoverPos && hoverColor && (
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    left: Math.min(hoverPos.x + 24, (containerRef.current?.offsetWidth || 600) - magnifierSize - 10),
                    top: Math.min(Math.max(hoverPos.y - magnifierSize - 32, 8), (containerRef.current?.offsetHeight || 400) - magnifierSize - 60),
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <canvas
                      ref={magnifierRef}
                      width={magnifierSize}
                      height={magnifierSize}
                      className="rounded-2xl border-2 border-white shadow-2xl"
                      style={{ width: magnifierSize, height: magnifierSize }}
                    />
                    <div className="mt-1.5 bg-[#1a1a1a] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap border border-white/10 shadow-lg">
                      {hoverColor.hex.toUpperCase()} · rgb({hoverColor.r}, {hoverColor.g}, {hoverColor.b})
                    </div>
                  </div>
                </div>
              )}

              {/* Pin on last picked position */}
              {cursorPos && (
                <div
                  className="absolute w-7 h-7 rounded-full border-[2.5px] border-white shadow-2xl pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: cursorPos.x,
                    top: cursorPos.y,
                    backgroundColor: hex,
                    boxShadow: `0 0 0 1px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.25)`,
                  }}
                ></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dark Panel */}
      <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">COLOR</span>
        </div>
        <div className="relative z-10 space-y-6">
          {/* Large Color Swatch */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl border border-white/10 shrink-0" style={{ backgroundColor: hex }}></div>
            <div>
              <span className="text-lg font-black text-white font-mono">{hex.toUpperCase()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{hslStr}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'HEX', value: hex.toUpperCase(), copyText: hex.toUpperCase() },
              { label: 'RGB', value: `${r}, ${g}, ${b}`, copyText: `rgb(${r}, ${g}, ${b})` },
              { label: 'HSL', value: hslStr, copyText: hslStr },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">{item.label}</span>
                  <button
                    onClick={() => handleCopy(item.label, item.copyText)}
                    className="text-[10px] text-white/30 hover:text-white transition-colors"
                  >
                    <i className={`fas ${copied === item.label ? 'fa-check' : 'fa-copy'}`}></i>
                  </button>
                </div>
                <span className="text-sm font-black text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>

          {/* SVG Hue Spectrum Widget */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-wider flex items-center">
              <i className="fas fa-chart-line mr-2 text-white/30"></i>Hue Spectrum
            </span>
            <div className="relative h-8">
              <svg
                viewBox="0 0 360 32"
                className="w-full h-8 rounded-lg"
                preserveAspectRatio="none"
              >
                <defs>
                  {(() => {
                    const stops = [];
                    for (let i = 0; i <= 360; i += 30) {
                      stops.push(
                        <stop key={i} offset={`${(i / 360) * 100}%`} stopColor={`hsl(${i}, 70%, 50%)`} />
                      );
                    }
                    return (
                      <linearGradient id="hueGradient" x1="0" y1="0" x2="1" y2="0">
                        {stops}
                      </linearGradient>
                    );
                  })()}
                </defs>
                <rect width="360" height="32" rx="8" fill="url(#hueGradient)" />
              </svg>
              {/* Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0 h-0 z-10"
                style={{ left: `${(hsl.h / 360) * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-3 h-3 bg-white rotate-45 border-2 border-slate-900 shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Color Harmony */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-wider flex items-center">
              <i className="fas fa-palette mr-2 text-white/30"></i>Color Harmony
            </span>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Base', color: hex },
                { label: 'Complement', color: complementary },
                { label: 'Analog +1', color: analogous[0] },
                { label: 'Analog +2', color: analogous[1] },
                { label: 'Analog -1', color: analogous[2] },
              ].map((item) => (
                <div key={item.label} className="text-center space-y-1.5">
                  <div
                    className="w-full aspect-square rounded-xl border border-white/10 cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: item.color }}
                    onClick={() => {
                      const parsed = hexToRgb(item.color.replace(/^hsl\(|\)/g, ''));
                      if (!parsed) return;
                      const m = item.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                      if (!m) return;
                      // Approximate HSL → RGB for harmony clicks
                      const h = parseInt(m[1]), s = parseInt(m[2]) / 100, l = parseInt(m[3]) / 100;
                      const C = (1 - Math.abs(2 * l - 1)) * s;
                      const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
                      const mVal = l - C / 2;
                      let r1 = 0, g1 = 0, b1 = 0;
                      if (h < 60) { r1 = C; g1 = X; }
                      else if (h < 120) { r1 = X; g1 = C; }
                      else if (h < 180) { g1 = C; b1 = X; }
                      else if (h < 240) { g1 = X; b1 = C; }
                      else if (h < 300) { r1 = X; b1 = C; }
                      else { r1 = C; b1 = X; }
                      updateFromRgb(Math.round((r1 + mVal) * 255), Math.round((g1 + mVal) * 255), Math.round((b1 + mVal) * 255));
                    }}
                  ></div>
                  <span className="text-[9px] text-white/40 font-semibold block truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All Colors Row */}
          <div className="flex flex-wrap gap-1.5">
            {[hex, complementary, ...analogous].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-md border border-white/10" style={{ backgroundColor: c }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
