'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const PRESETS = {
  standard: [
    { label: '1:1', w: 1, h: 1 },
    { label: '4:3', w: 4, h: 3 },
    { label: '16:9', w: 16, h: 9 },
    { label: '3:2', w: 3, h: 2 },
    { label: '21:9', w: 21, h: 9 },
    { label: '5:4', w: 5, h: 4 },
  ],
  social: [
    { label: '9:16', w: 9, h: 16 },
    { label: '4:5', w: 4, h: 5 },
    { label: '2:3', w: 2, h: 3 },
  ],
};

const ANCHORS = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right',
];

const calculateGCD = (a: number, b: number): number => (b === 0 ? a : calculateGCD(b, a % b));

export default function AspectRatioConverter() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'converter'>('calculator');
  const [calcState, setCalcState] = useState({ width: 1920, height: 1080, ratioW: 16, ratioH: 9 });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [cropMode, setCropMode] = useState<'fit' | 'crop'>('fit');
  const [convertSettings, setConvertSettings] = useState({ targetW: 1080, targetH: 1080 });
  const [cropAnchor, setCropAnchor] = useState('center');
  const [customRatio, setCustomRatio] = useState({ w: 1, h: 1 });
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleCalcChange = (field: string, value: string) => {
    const val = parseFloat(value) || 0;
    setCalcState(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'width') next.height = Math.round(val * (prev.ratioH / prev.ratioW));
      else if (field === 'height') next.width = Math.round(val * (prev.ratioW / prev.ratioH));
      else if (field === 'ratioW' || field === 'ratioH') {
        next.height = Math.round(next.width * (next.ratioH / next.ratioW));
      }
      return next;
    });
  };

  const applyPreset = (w: number, h: number) => {
    setCalcState(prev => ({ ...prev, ratioW: w, ratioH: h, height: Math.round(prev.width * (h / w)) }));
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUploadedImage(result);
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setConvertSettings({ targetW: img.width, targetH: img.height });
        setManualOffset({ x: 0, y: 0 });
        setCropAnchor('center');
        addToast('Image loaded successfully!', 'success');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const applyConverterPreset = (w: number, h: number) => {
    setConvertSettings(prev => ({ ...prev, targetH: Math.round(prev.targetW * (h / w)) }));
    setManualOffset({ x: 0, y: 0 });
  };

  const applyCustomRatio = () => {
    if (customRatio.w > 0 && customRatio.h > 0) {
      applyConverterPreset(customRatio.w, customRatio.h);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImageObj(null);
    setManualOffset({ x: 0, y: 0 });
  };

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { targetW, targetH } = convertSettings;
    canvas.width = targetW;
    canvas.height = targetH;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetW, targetH);

    let sw = imageObj.width;
    let sh = imageObj.height;
    let sx = 0, sy = 0, dx = 0, dy = 0, dw = targetW, dh = targetH;

    const srcRatio = sw / sh;
    const targetRatio = targetW / targetH;

    if (cropMode === 'crop') {
      if (srcRatio > targetRatio) {
        sw = imageObj.height * targetRatio;
        let baseX = (imageObj.width - sw) / 2;
        if (cropAnchor.includes('left')) baseX = 0;
        else if (cropAnchor.includes('right')) baseX = imageObj.width - sw;
        sx = Math.max(0, Math.min(baseX - manualOffset.x, imageObj.width - sw));
      } else {
        sh = imageObj.width / targetRatio;
        let baseY = (imageObj.height - sh) / 2;
        if (cropAnchor.includes('top')) baseY = 0;
        else if (cropAnchor.includes('bottom')) baseY = imageObj.height - sh;
        sy = Math.max(0, Math.min(baseY - manualOffset.y, imageObj.height - sh));
      }
    } else {
      if (srcRatio > targetRatio) {
        dw = targetW;
        dh = targetW / srcRatio;
        dy = (targetH - dh) / 2;
      } else {
        dh = targetH;
        dw = targetH * srcRatio;
        dx = (targetW - dw) / 2;
      }
    }

    ctx.drawImage(imageObj, sx, sy, sw, sh, dx, dy, dw, dh);
  }, [imageObj, convertSettings, cropMode, cropAnchor, manualOffset, bgColor]);

  useEffect(() => {
    if (imageObj && canvasRef.current) drawPreview();
  }, [drawPreview, imageObj]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cropMode !== 'crop') return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || cropMode !== 'crop' || !imageObj || !canvasRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const rect = canvasRef.current.getBoundingClientRect();
    setManualOffset(prev => ({
      x: prev.x + deltaX * (imageObj.width / rect.width),
      y: prev.y + deltaY * (imageObj.height / rect.height),
    }));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `resized-${convertSettings.targetW}x${convertSettings.targetH}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    addToast('Image downloaded!', 'success');
  };

  const gcd = calculateGCD(calcState.width, calcState.height);
  const simplifiedW = calcState.width / gcd;
  const simplifiedH = calcState.height / gcd;

  const renderCalculator = () => (
    <div className="space-y-5">
      {/* Standard Presets */}
      <div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Standard</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.standard.map(p => (
            <button key={p.label} onClick={() => applyPreset(p.w, p.h)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${calcState.ratioW === p.w && calcState.ratioH === p.h ? 'bg-white text-[#1a1a1a]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {/* Social Presets */}
      <div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Social Media</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.social.map(p => (
            <button key={p.label} onClick={() => applyPreset(p.w, p.h)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${calcState.ratioW === p.w && calcState.ratioH === p.h ? 'bg-white text-[#1a1a1a]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimension Inputs */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Width (px)</label>
          <input type="number" value={calcState.width} onChange={e => handleCalcChange('width', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
        </div>
        <div className="flex items-center justify-center pb-2">
          <i className="fas fa-link text-slate-500 text-sm"></i>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Height (px)</label>
          <input type="number" value={calcState.height} onChange={e => handleCalcChange('height', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
        </div>
      </div>

      {/* Ratio Inputs */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Ratio W</label>
          <input type="number" value={calcState.ratioW} onChange={e => handleCalcChange('ratioW', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
        </div>
        <div className="flex items-center justify-center pb-2 text-white/40 text-lg font-bold">:</div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Ratio H</label>
          <input type="number" value={calcState.ratioH} onChange={e => handleCalcChange('ratioH', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
        </div>
      </div>

      {/* Visual Preview */}
      <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center min-h-[180px]">
        <div className="bg-white/10 rounded-lg flex items-center justify-center flex-col text-center"
          style={{ aspectRatio: `${calcState.ratioW}/${calcState.ratioH}`, maxWidth: '100%', maxHeight: '260px', width: '100%' }}>
          <span className="text-white font-mono text-sm font-bold">{calcState.width} × {calcState.height}</span>
          <span className="text-slate-400 text-[10px] font-mono mt-1">{simplifiedW}:{simplifiedH}</span>
        </div>
      </div>
    </div>
  );

  const renderConverter = () => (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center space-y-3 cursor-pointer hover:border-white/40 transition-colors"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); handleDrop(e); }}
          onClick={() => fileInputRef.current?.click()}
          style={{ background: isDragOver ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
          <i className="fas fa-image text-3xl text-slate-500"></i>
          <p className="text-xs text-slate-400 font-semibold">Drag & drop an image or click to upload</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        </div>
      ) : (
        <>
          {/* Image Info */}
          <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10 flex items-center gap-3">
            <i className="fas fa-info-circle text-slate-400"></i>
            <span className="text-[11px] text-slate-300 font-mono">Original: {imageObj?.width} × {imageObj?.height} px</span>
          </div>

          {/* Settings */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Width</label>
                <input type="number" value={convertSettings.targetW} onChange={e => setConvertSettings(prev => ({ ...prev, targetW: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
              </div>
              <span className="text-slate-500 pb-2">×</span>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Height</label>
                <input type="number" value={convertSettings.targetH} onChange={e => setConvertSettings(prev => ({ ...prev, targetH: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
              </div>
            </div>

            {/* Presets */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Quick Ratios</p>
              <div className="flex flex-wrap gap-1.5">
                {[...PRESETS.standard, ...PRESETS.social].map(p => (
                  <button key={p.label} onClick={() => applyConverterPreset(p.w, p.h)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[10px] font-bold hover:bg-white/20 transition-colors">{p.label}</button>
                ))}
              </div>
            </div>

            {/* Custom Ratio */}
            <div className="flex items-end gap-2">
              <div className="w-16">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">W</label>
                <input type="number" value={customRatio.w} onChange={e => setCustomRatio(prev => ({ ...prev, w: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-white/40" />
              </div>
              <span className="text-slate-500 pb-2">:</span>
              <div className="w-16">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">H</label>
                <input type="number" value={customRatio.h} onChange={e => setCustomRatio(prev => ({ ...prev, h: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-white/40" />
              </div>
              <button onClick={applyCustomRatio}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold hover:bg-white/20 transition-colors mb-px">Apply</button>
            </div>

            {/* Mode + Color + Anchor */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg p-1">
                <button onClick={() => { setCropMode('fit'); setManualOffset({ x: 0, y: 0 }); }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${cropMode === 'fit' ? 'bg-white text-[#1a1a1a]' : 'text-white hover:text-white/80'}`}>
                  <i className="fas fa-compress mr-1"></i>Fit
                </button>
                <button onClick={() => { setCropMode('crop'); }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${cropMode === 'crop' ? 'bg-white text-[#1a1a1a]' : 'text-white hover:text-white/80'}`}>
                  <i className="fas fa-crop mr-1"></i>Crop
                </button>
              </div>
              {cropMode === 'fit' && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-slate-400 font-semibold">BG Color</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
                </div>
              )}
            </div>

            {cropMode === 'crop' && (
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Anchor</p>
                <div className="grid grid-cols-3 gap-1 w-fit">
                  {ANCHORS.map(pos => (
                    <button key={pos} onClick={() => { setCropAnchor(pos); setManualOffset({ x: 0, y: 0 }); }}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${cropAnchor === pos ? 'bg-white text-[#1a1a1a]' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Preview */}
          <div className="bg-black/30 rounded-xl p-4 flex flex-col items-center">
            <canvas ref={canvasRef}
              className={`max-w-full h-auto rounded-lg ${cropMode === 'crop' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
              style={{ maxHeight: '400px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} />
            {cropMode === 'crop' && (
              <p className="text-[10px] text-slate-500 mt-2">
                <i className="fas fa-hand-paper mr-1"></i>Drag to reposition crop area
              </p>
            )}
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Output: {convertSettings.targetW} × {convertSettings.targetH} px · PNG
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleDownload} className="px-5 py-2.5 rounded-xl bg-white text-[#1a1a1a] text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <i className="fas fa-download"></i>Download
            </button>
            <button onClick={removeImage} className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-1.5">
              <i className="fas fa-times"></i>Remove Image
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Banner */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">RATIO</span>
        </div>
        <i className="fas fa-expand-arrows-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All processing happens entirely in your browser. Images are never uploaded to any server.
          </p>
        </div>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Main Widget */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">ARC</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'calculator' ? 'bg-white text-[#1a1a1a]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <i className="fas fa-calculator mr-1.5"></i>Ratio Calculator
            </button>
            <button onClick={() => setActiveTab('converter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'converter' ? 'bg-white text-[#1a1a1a]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <i className="fas fa-image mr-1.5"></i>Image Converter
            </button>
          </div>

          {activeTab === 'calculator' ? renderCalculator() : renderConverter()}

          {/* Cross-promotion */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need to optimize further? Try the <a href="/utility-tools/image-tools/image-to-webp-converter" className="text-white font-bold underline hover:text-slate-200">Image to WebP</a> converter, check color accessibility with <a href="/utility-tools/image-tools/color-blindness-simulator" className="text-white font-bold underline hover:text-slate-200">Color Blindness Simulator</a>, or clean up colors with <a href="/utility-tools/converter-tools/rgb-to-hex-converter" className="text-white font-bold underline hover:text-slate-200">RGB to HEX</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
