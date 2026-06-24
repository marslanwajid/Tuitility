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

const CVD_MATRICES: Record<string, number[]> = {
  protanopia: [0.567, 0.433, 0, 0, 0.558, 0.442, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 1],
  deuteranopia: [0.625, 0.375, 0, 0, 0.7, 0.3, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 1],
  tritanopia: [0.95, 0.05, 0, 0, 0, 0.433, 0.567, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 1],
  achromatopsia: [0.299, 0.587, 0.114, 0, 0.299, 0.587, 0.114, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 1],
  protanomaly: [0.817, 0.183, 0, 0, 0.333, 0.667, 0, 0, 0, 0.125, 0.875, 0, 0, 0, 0, 1],
  deuteranomaly: [0.8, 0.2, 0, 0, 0.258, 0.742, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 1],
};

const SIMULATION_TYPES = [
  { key: 'protanopia', label: 'Protanopia', tag: 'Red-Blind', desc: 'Lacking red cones. Reds appear dark or greenish.' },
  { key: 'deuteranopia', label: 'Deuteranopia', tag: 'Green-Blind', desc: 'Lacking green cones. Most common severe form.' },
  { key: 'tritanopia', label: 'Tritanopia', tag: 'Blue-Blind', desc: 'Lacking blue cones. Very rare condition.' },
  { key: 'achromatopsia', label: 'Achromatopsia', tag: 'Monochromacy', desc: 'Total color blindness. Greyscale vision.' },
  { key: 'protanomaly', label: 'Protanomaly', tag: 'Red-Weak', desc: 'Reduced red sensitivity. Muted reds.' },
  { key: 'deuteranomaly', label: 'Deuteranomaly', tag: 'Green-Weak', desc: 'Reduced green sensitivity. Affects ~5% of males.' },
];

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

const calculateAspectRatioFit = (srcW: number, srcH: number, maxW: number, maxH: number) => {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { width: Math.floor(srcW * ratio), height: Math.floor(srcH * ratio) };
};

export default function ColorBlindnessSimulator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | ''>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const setStatus = (type: 'info' | 'success' | 'error' | '', text: string) => {
    setStatusType(type);
    setStatusText(text);
  };

  const drawImageToCanvas = (image: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dims = calculateAspectRatioFit(image.width, image.height, MAX_WIDTH, MAX_HEIGHT);
    canvas.width = dims.width;
    canvas.height = dims.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  const applyFilter = (image: HTMLImageElement, canvas: HTMLCanvasElement, type: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dims = calculateAspectRatioFit(image.width, image.height, MAX_WIDTH, MAX_HEIGHT);
    canvas.width = dims.width;
    canvas.height = dims.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const m = CVD_MATRICES[type];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = r * m[0] + g * m[1] + b * m[2] + m[3];
      data[i + 1] = r * m[4] + g * m[5] + b * m[6] + m[7];
      data[i + 2] = r * m[8] + g * m[9] + b * m[10] + m[11];
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file.', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setShowResults(false);
    setStatus('info', 'Image loaded. Click "Simulate Vision" to process.');
    addToast('Image loaded successfully!', 'success');
  };

  useEffect(() => {
    if (selectedImage && originalCanvasRef.current) {
      const img = new Image();
      img.onload = () => drawImageToCanvas(img, originalCanvasRef.current!);
      img.src = selectedImage;
    }
  }, [selectedImage]);

  const simulateAll = () => {
    if (!selectedImage) return;
    setIsSimulating(true);
    setStatus('info', 'Simulating color vision deficiencies...');

    const img = new Image();
    img.onload = () => {
      SIMULATION_TYPES.forEach(({ key }) => {
        const canvas = canvasRefs.current[key];
        if (canvas) applyFilter(img, canvas, key);
      });
      setIsSimulating(false);
      setShowResults(true);
      setStatus('success', 'Simulation complete!');
      addToast('All 6 simulations generated.', 'success');
    };
    img.src = selectedImage;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addToast(`${filename} downloaded.`, 'success');
  };

  const resetAll = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    setShowResults(false);
    setStatus('', '');
    setStatusText('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Banner */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">CVD</span>
        </div>
        <i className="fas fa-eye text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All image processing is done locally in your browser. Nothing is ever uploaded.
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
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">BLIND</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center space-y-3 cursor-pointer hover:border-white/40 transition-colors"
            style={{ background: isDragOver ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}
            onClick={() => fileInputRef.current?.click()}>
            <i className="fas fa-cloud-upload-alt text-3xl text-slate-500"></i>
            <p className="text-xs text-slate-400 font-semibold">Drag & drop an image or click to upload</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
          </div>

          {selectedImage && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <canvas ref={originalCanvasRef} className="w-20 h-20 rounded-lg object-cover bg-black/30" style={{ display: selectedImage ? 'block' : 'none' }}></canvas>
                <div className="flex gap-2 flex-1 flex-wrap">
                  {!showResults && (
                    <button onClick={simulateAll} disabled={isSimulating}
                      className="px-5 py-2.5 rounded-xl bg-white text-[#1a1a1a] text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                      <i className={`fas ${isSimulating ? 'fa-spinner fa-spin' : 'fa-eye'}`}></i>
                      {isSimulating ? 'Processing...' : 'Simulate Vision'}
                    </button>
                  )}
                  <button onClick={resetAll}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-1.5">
                    <i className="fas fa-times"></i>Reset
                  </button>
                </div>
              </div>

              {statusText && (
                <div className={`px-4 py-2 rounded-lg text-xs font-semibold ${statusType === 'success' ? 'bg-emerald-600/20 text-emerald-400' : statusType === 'error' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                  {statusText}
                </div>
              )}
            </div>
          )}

          {/* Hidden original canvas used for dimension reference */}
          <canvas ref={originalCanvasRef} style={{ display: 'none' }}></canvas>

          {/* Results Grid — always rendered so canvas refs exist */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${showResults ? '' : 'hidden'}`}>
              {SIMULATION_TYPES.map(({ key, label, tag, desc }) => (
                <div key={key} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{label}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 uppercase tracking-wider">{tag}</span>
                    </div>
                    <button onClick={() => downloadCanvas(canvasRefs.current[key], `${key}.png`)}
                      className="text-slate-400 hover:text-white transition-colors" title="Download">
                      <i className="fas fa-download text-xs"></i>
                    </button>
                  </div>
                  <canvas
                    ref={el => { canvasRefs.current[key] = el; }}
                    className="w-full bg-black/20"
                    style={{ minHeight: '120px' }}>
                  </canvas>
                  <p className="px-4 py-2 text-[10px] text-slate-400">{desc}</p>
                </div>
              ))}
            </div>

          {/* Cross-promotion */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Optimize your accessible assets further with <a href="/utility-tools/image-tools/image-to-webp-converter" className="text-white font-bold underline hover:text-slate-200">Image to WebP</a>, resize with <a href="/utility-tools/image-tools/aspect-ratio-converter" className="text-white font-bold underline hover:text-slate-200">Aspect Ratio Converter</a>, or review brand colors with <a href="/utility-tools/converter-tools/rgb-to-hex-converter" className="text-white font-bold underline hover:text-slate-200">RGB to HEX</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
