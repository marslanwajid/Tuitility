'use client';

import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import heic2any from 'heic2any';
import * as UTIF from 'utif';

const OUTPUT_FORMATS = [
  { value: 'image/png', label: 'PNG', ext: 'png', lossless: true },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg', lossless: false },
  { value: 'image/webp', label: 'WebP', ext: 'webp', lossless: false },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp', lossless: true },
  { value: 'image/avif', label: 'AVIF', ext: 'avif', lossless: false },
];

const ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg,.avif,.bmp,.ico,.tiff,.tif,.heic,.hif,.psd,.pdf,.eps,.ai,.arw,.srf,.sr2,.cr3,.cr2,.crw,.nef,.nrw,.raf,.rw2,.raw,.orf,.ori,.rwl,.dng,.3fr,.fff,.iiq,.braw';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  preview: string;
  outputFormat: string;
  quality: number;
  convertedBlob?: Blob;
  convertedSize?: number;
  status: 'idle' | 'converting' | 'done' | 'error';
  errorMsg?: string;
}

const TIFF_EXTS = ['.cr2', '.cr3', '.crw', '.arw', '.raf', '.raw', '.tiff', '.tif', '.dng', '.3fr', '.fff', '.iiq', '.rwl', '.rw2', '.nef', '.nrw', '.orf', '.ori', '.srf', '.sr2'];

export default function ImageConverter() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [globalFormat, setGlobalFormat] = useState('image/webp');
  const [globalQuality, setGlobalQuality] = useState(80);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => { itemsRef.current.forEach((it) => { if (it.preview) URL.revokeObjectURL(it.preview); }); };
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); };

  const formatBytes = (b: number, d = 2) => {
    if (b === 0) return '0 Bytes'; const k = 1024; const s = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(d)) + ' ' + s[i];
  };

  const getExtHint = (ext: string) => {
    const map: Record<string, string> = {
      cr2: 'Canon RAW', cr3: 'Canon RAW', crw: 'Canon RAW',
      nef: 'Nikon RAW', nrw: 'Nikon RAW',
      arw: 'Sony RAW', srf: 'Sony RAW', sr2: 'Sony RAW',
      raf: 'Fujifilm RAW',
      rw2: 'Panasonic RAW',
      raw: 'generic RAW', orf: 'Olympus RAW', ori: 'Olympus RAW',
      rwl: 'Leica RAW',
      dng: 'Adobe DNG',
      '3fr': 'Hasselblad RAW', fff: 'Hasselblad RAW',
      iiq: 'Phase One RAW',
      braw: 'Blackmagic RAW',
      psd: 'Adobe Photoshop',
      ai: 'Adobe Illustrator',
      eps: 'Encapsulated PostScript',
      pdf: 'PDF document',
      tiff: 'TIFF', tif: 'TIFF',
    };
    return map[ext] || ext.toUpperCase();
  };

  const ifdToBitmap = (ifd: UTIF.IFD): Promise<ImageBitmap> => {
    const w = ifd.width;
    const h = ifd.height;
    if (!w || !h) throw new Error('Invalid image dimensions');
    const rgba: ArrayBuffer | Uint8Array = UTIF.toRGBA8(ifd);
    if (!rgba) throw new Error('Empty image data');
    const r = rgba as any;
    if ((r.byteLength !== undefined ? r.byteLength : r.length) === 0) throw new Error('Empty image data');
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create canvas context');
    const imageData = ctx.createImageData(w, h);
    imageData.data.set(rgba instanceof Uint8Array ? rgba : new Uint8ClampedArray(rgba));
    ctx.putImageData(imageData, 0, 0);
    return createImageBitmap(canvas);
  };

  const utifToBitmap = async (file: File): Promise<ImageBitmap> => {
    const buffer = await file.arrayBuffer();
    const ifds = UTIF.decode(buffer);
    if (!ifds || ifds.length === 0) throw new Error('No image data found in TIFF/RAW file');
    // CR2 stores RAW data in sub-IFDs; try each IFD until one decodes
    const errors: string[] = [];
    for (const ifd of ifds) {
      try {
        UTIF.decodeImage(buffer, ifd);
        return await ifdToBitmap(ifd);
      } catch (e: any) {
        errors.push(e.message || 'unknown error');
      }
    }
    throw new Error(`All ${ifds.length} IFD(s) failed: ${errors.join('; ')}`);
  };

  const decodeImage = async (file: File): Promise<ImageBitmap> => {
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop()?.toLowerCase() || '';

    // HEIC/HEIF — decode via heic2any
    if (ext === 'heic' || ext === 'hif') {
      const blob = await heic2any({ blob: file, toType: 'image/png' });
      const b = Array.isArray(blob) ? blob[0] : blob;
      return createImageBitmap(b);
    }

    // TIFF-based RAW formats — try utif first, then createImageBitmap
    if (TIFF_EXTS.some((e) => name.endsWith(e))) {
      try {
        return await utifToBitmap(file);
      } catch (utifErr: any) {
        console.warn('utif decode failed for', ext, ':', utifErr.message);
        // fall through to createImageBitmap
      }
    }

    // createImageBitmap as primary decoder (handles PNG, JPEG, WebP, BMP, GIF, SVG, ICO, AVIF,
    // plus OS-dependent RAW support via system codecs)
    try {
      return await createImageBitmap(file);
    } catch {
      const hint = getExtHint(ext);
      if ((ext === 'cr2' || ext === 'cr3' || ext === 'crw') && TIFF_EXTS.some((e) => name.endsWith(e))) {
        throw new Error(
          `${hint} decoding failed — your browser lacks the required codec. Try installing Canon RAW codecs for Windows, or pre-convert to DNG/JPEG using Canon's Digital Photo Professional.`
        );
      }
      throw new Error(
        `${hint} format cannot be decoded by your browser. Try converting to JPEG/PNG first using dedicated software, or install OS-level codecs for RAW camera formats.`
      );
    }
  };

  const addFiles = async (files: File[]) => {
    const newItems: ImageItem[] = [];
    for (const file of files) {
      try {
        const bitmap = await decodeImage(file);
        const preview = URL.createObjectURL(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file, name: file.name, originalSize: file.size,
          originalWidth: bitmap.width, originalHeight: bitmap.height,
          preview, outputFormat: globalFormat, quality: globalQuality, status: 'idle',
        });
        bitmap.close();
      } catch (err: any) {
        const preview = URL.createObjectURL(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file, name: file.name, originalSize: file.size,
          originalWidth: 0, originalHeight: 0,
          preview, outputFormat: globalFormat, quality: globalQuality,
          status: 'error', errorMsg: err.message || 'Unsupported format',
        });
      }
    }
    if (newItems.length === 0) setError('No valid image files found.');
    else { setError(''); setItems((p) => [...p, ...newItems]); }
  };

  const removeItem = (id: string) => {
    setItems((p) => { const t = p.find((it) => it.id === id); if (t?.preview) URL.revokeObjectURL(t.preview); return p.filter((it) => it.id !== id); });
  };

  const clearAll = () => { items.forEach((it) => URL.revokeObjectURL(it.preview)); setItems([]); setError(''); };

  const convertImage = (bitmap: ImageBitmap | HTMLCanvasElement, mime: string, q: number): Promise<Blob> =>
    new Promise((res, rej) => {
      const c = document.createElement('canvas');
      c.width = bitmap instanceof HTMLCanvasElement ? bitmap.width : bitmap.width;
      c.height = bitmap instanceof HTMLCanvasElement ? bitmap.height : bitmap.height;
      const ctx = c.getContext('2d'); if (!ctx) { rej(new Error('Failed to get canvas context')); return; }
      ctx.drawImage(bitmap, 0, 0);
      c.toBlob((blob) => { blob ? res(blob) : rej(new Error(`Failed to encode ${mime}`)); }, mime, q / 100);
    });

  const doConvert = async () => {
    const toConvert = items.filter((it) => it.status !== 'done');
    if (toConvert.length === 0) return;
    setIsConverting(true); setError('');
    const up = [...items];
    for (let i = 0; i < up.length; i++) {
      const it = up[i];
      if (it.status === 'done' || it.status === 'error') continue;
      up[i] = { ...it, status: 'converting' };
      setItems([...up]);
      try {
        const bitmap = await decodeImage(it.file);
        const blob = await convertImage(bitmap, it.outputFormat, it.quality);
        bitmap.close();
        up[i] = { ...up[i], status: 'done', convertedBlob: blob, convertedSize: blob.size };
      } catch (err: any) {
        up[i] = { ...up[i], status: 'error', errorMsg: err.message || 'Conversion failed' };
      }
      setItems([...up]);
    }
    setIsConverting(false);
  };

  const downloadItem = (it: ImageItem) => {
    if (!it.convertedBlob) return;
    const fmt = OUTPUT_FORMATS.find((f) => f.value === it.outputFormat);
    const url = URL.createObjectURL(it.convertedBlob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${it.name.substring(0, it.name.lastIndexOf('.')) || it.name}.${fmt?.ext || 'bin'}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadBatch = async (list: ImageItem[]) => {
    const zip = new JSZip();
    list.forEach((it) => {
      if (!it.convertedBlob) return;
      const fmt = OUTPUT_FORMATS.find((f) => f.value === it.outputFormat);
      zip.file(`${it.name.substring(0, it.name.lastIndexOf('.')) || it.name}.${fmt?.ext || 'bin'}`, it.convertedBlob);
    });
    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'converted_images.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { setError('Failed to package batch download.'); }
  };

  const totalOrig = items.reduce((s, it) => s + it.originalSize, 0);
  const totalNew = items.reduce((s, it) => s + (it.convertedSize || 0), 0);
  const doneItems = items.filter((it) => it.status === 'done');

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
            All images are processed 100% locally. No files are uploaded. RAW decoding uses utif (TIFF-based) and browser codecs where available.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? 'border-slate-900 bg-slate-50 scale-[0.99]' : 'border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 bg-white'
        }`}
      >
        <input type="file" ref={fileRef} multiple accept={ACCEPT} onChange={handleFileInput} className="hidden" />
        <div className="w-16 h-16 bg-slate-950 text-white rounded-full flex items-center justify-center text-xl mx-auto shadow-md mb-4">
          <i className="fas fa-images"></i>
        </div>
        <h3 className="text-lg font-black text-slate-900 font-display mb-1">Drag & Drop Images Here</h3>
        <p className="text-xs text-slate-400 font-semibold mb-2">Supports 30+ formats: PNG, JPG, WEBP, GIF, BMP, SVG, TIFF, HEIC, PSD, RAW (CR2, NEF, ARW, DNG...), and more</p>
        <p className="text-[10px] text-slate-400 font-medium mb-4">RAW files decode via utif (TIFF-based) or browser codecs. Canon CR2, Nikon NEF, Sony ARW, and DNG are supported.</p>
        <button type="button" className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">Select Files</button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-start space-x-2">
          <i className="fas fa-exclamation-circle mt-0.5"></i><span>{error}</span>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">IMAGE</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Global Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center"><i className="fas fa-file-export mr-1"></i>Output Format</label>
                <select value={globalFormat} onChange={(e) => { setGlobalFormat(e.target.value); setItems((p) => p.map((it) => ({ ...it, outputFormat: e.target.value }))); }}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer">
                  {OUTPUT_FORMATS.map((f) => <option key={f.value} value={f.value} className="bg-[#1a1a1a] text-white">{f.label} ({f.lossless ? 'lossless' : 'lossy'})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center"><i className="fas fa-sliders-h mr-1"></i>Quality</label>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Small</span>
                  <input type="range" min="1" max="100" value={globalQuality} onChange={(e) => { const v = Number(e.target.value); setGlobalQuality(v); setItems((p) => p.map((it) => ({ ...it, quality: v }))); }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Best</span>
                  <span className="text-xs font-bold text-white w-10 text-right">{globalQuality}%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Only applies to JPEG, WebP, and AVIF. PNG and BMP are always lossless.</p>
              </div>
            </div>

            {/* Stats Bar */}
            {doneItems.length > 0 && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                <span className="text-slate-300 font-bold">{doneItems.length}/{items.length} converted</span>
                <span className="text-slate-400 font-medium">Original: <span className="text-white font-bold">{formatBytes(totalOrig)}</span></span>
                <span className="text-slate-400 font-medium">New: <span className="text-emerald-400 font-bold">{formatBytes(totalNew)}</span></span>
                {totalOrig > 0 && (
                  <span className="text-slate-400 font-medium">Saved: <span className="text-emerald-400 font-bold">{Math.round((1 - totalNew / totalOrig) * 100)}%</span></span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button type="button" onClick={doConvert} disabled={isConverting}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-slate-900 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50">
                {isConverting ? (
                  <><i className="fas fa-spinner animate-spin text-[10px]"></i><span>Converting...</span></>
                ) : (
                  <><i className="fas fa-exchange-alt text-[10px]"></i><span>Convert All</span></>
                )}
              </button>
              <button type="button" onClick={clearAll} disabled={isConverting}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/10 text-white border border-white/20 font-extrabold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40">
                <i className="fas fa-trash text-[10px]"></i><span>Clear All</span>
              </button>
              {doneItems.length > 0 && (
                <>
                  <button type="button" onClick={() => downloadBatch(doneItems)}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-slate-900 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center space-x-2 ml-auto">
                    <i className="fas fa-download text-[10px]"></i><span>Download All (.zip)</span>
                  </button>
                </>
              )}
            </div>

            {/* Items Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Queue ({items.length})</span>
              </div>
              {items.map((it) => {
                const fmt = OUTPUT_FORMATS.find((f) => f.value === it.outputFormat);
                const isLossy = fmt && !fmt.lossless;
                const savingsPct = it.convertedSize ? Math.round(((it.originalSize - it.convertedSize) / it.originalSize) * 100) : 0;
                return (
                  <div key={it.id} className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${it.status === 'error' ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-white/5 border border-white/10'}`}>
                    <div className="flex items-center space-x-3 w-full sm:w-auto min-w-0">
                      <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {it.status !== 'error' ? (
                          <img src={it.preview} alt={it.name} className="w-full h-full object-contain" />
                        ) : (
                          <i className="fas fa-exclamation-triangle text-rose-400 text-sm"></i>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-black text-white block truncate leading-tight max-w-[180px] md:max-w-[280px]">{it.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {formatBytes(it.originalSize)}
                          {it.originalWidth > 0 && ` \u00b7 ${it.originalWidth}\u00d7${it.originalHeight}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end ml-auto">
                      {it.status === 'idle' && (
                        <>
                          <select value={it.outputFormat} onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, outputFormat: e.target.value } : x))}
                            className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-[9px] font-bold text-white focus:outline-none appearance-none cursor-pointer">
                            {OUTPUT_FORMATS.map((f) => <option key={f.value} value={f.value} className="bg-[#1a1a1a]">{f.label}</option>)}
                          </select>
                          {isLossy && (
                            <input type="range" min="1" max="100" value={it.quality} onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, quality: Number(e.target.value) } : x))}
                              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" title={`Quality: ${it.quality}%`} />
                          )}
                          <span className="px-2 py-1 bg-white/10 border border-white/20 text-slate-400 font-extrabold text-[9px] uppercase rounded-lg">Pending</span>
                        </>
                      )}
                      {it.status === 'converting' && (
                        <span className="px-2 py-1 bg-white/10 border border-white/20 text-white font-extrabold text-[9px] uppercase rounded-lg flex items-center space-x-1">
                          <i className="fas fa-spinner animate-spin text-[8px]"></i><span>Converting...</span>
                        </span>
                      )}
                      {it.status === 'error' && (
                        <span className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-[9px] uppercase rounded-lg">
                          {it.errorMsg?.substring(0, 40) || 'Error'}
                        </span>
                      )}
                      {it.status === 'done' && it.convertedSize && (
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <span className="text-[10px] font-black text-white block leading-tight">{formatBytes(it.convertedSize)}</span>
                            <span className="text-[9px] text-emerald-400 font-bold block">{savingsPct > 0 ? `-${savingsPct}%` : 'No change'}</span>
                          </div>
                          <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-[9px] uppercase rounded-lg">Done</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 border-l border-white/10 pl-2">
                        {it.status === 'done' && it.convertedBlob && (
                          <button type="button" onClick={() => downloadItem(it)}
                            className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer" title="Download">
                            <i className="fas fa-download text-[10px]"></i>
                          </button>
                        )}
                        {it.status === 'done' && (
                          <button type="button" onClick={() => { setItems((p) => p.map((x) => x.id === it.id ? { ...x, status: 'idle', convertedBlob: undefined, convertedSize: undefined } : x)); }}
                            className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer" title="Compress Further">
                            <i className="fas fa-compress-alt text-[10px]"></i>
                          </button>
                        )}
                        <button type="button" onClick={() => removeItem(it.id)}
                          className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer" title="Remove">
                          <i className="fas fa-times text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
