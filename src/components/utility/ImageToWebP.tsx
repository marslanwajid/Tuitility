'use client';

import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  newSize?: number;
  preview: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  convertedBlob?: Blob;
  errorMsg?: string;
}

export default function ImageToWebP() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [useAdvanced, setUseAdvanced] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<ImageFile[]>([]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) addFilesToQueue(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFilesToQueue(Array.from(e.target.files));
  };

  const addFilesToQueue = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => f.type.startsWith('image/')).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file, name: file.name, originalSize: file.size, preview: URL.createObjectURL(file), status: 'pending' as const,
    }));
    if (valid.length === 0 && newFiles.length > 0) setConversionError('Please upload valid image files (JPG, PNG, GIF, etc.).');
    else { setConversionError(''); setFiles((p) => [...p, ...valid]); }
  };

  const removeFile = (id: string) => {
    setFiles((p) => { const t = p.find((f) => f.id === id); if (t?.preview) URL.revokeObjectURL(t.preview); return p.filter((f) => f.id !== id); });
  };

  const clearQueue = () => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setConversionError(''); };

  const formatBytes = (bytes: number, d = 2) => {
    if (bytes === 0) return '0 Bytes'; const k = 1024; const s = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(d)) + ' ' + s[i];
  };

  const convertStandard = async (fileObj: ImageFile, q: number): Promise<Blob> => {
    try {
      const bitmap = await createImageBitmap(fileObj.file);
      try {
        return await new Promise<Blob>((resolve, reject) => {
          const c = document.createElement('canvas'); c.width = bitmap.width; c.height = bitmap.height;
          const ctx = c.getContext('2d'); if (!ctx) { reject(new Error('Failed to create canvas 2D context')); return; }
          ctx.drawImage(bitmap, 0, 0);
          c.toBlob((blob) => { blob ? resolve(blob) : reject(new Error('Canvas WebP generation returned null')); }, 'image/webp', q);
        });
      } finally {
        bitmap.close();
      }
    } catch (bitmapError) {
      // Fallback to Image loader in DOM if createImageBitmap fails
      return new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
          const ctx = c.getContext('2d'); if (!ctx) { reject(new Error('Failed to create canvas 2D context')); return; }
          ctx.drawImage(img, 0, 0);
          c.toBlob((blob) => { blob ? resolve(blob) : reject(new Error('Canvas WebP generation returned null')); }, 'image/webp', q);
        };
        img.onerror = () => reject(new Error('Failed to load original image in DOM'));
        img.src = fileObj.preview;
      });
    }
  };

  const convertAdvanced = async (file: File, q: number): Promise<Blob> => {
    return await imageCompression(file, {
      maxSizeMB: 50, maxWidthOrHeight: 4096, useWebWorker: true, fileType: 'image/webp', initialQuality: q, alwaysKeepResolution: true,
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true); setConversionError('');
    const q = quality / 100;
    // Reset all items to converting (clear previous conversion data so quality changes re-apply)
    const up: ImageFile[] = files.map((f) => ({ ...f, status: 'converting', convertedBlob: undefined, newSize: undefined }));
    setFiles(up);
    for (let i = 0; i < up.length; i++) {
      const item = up[i];
      try {
        const blob = useAdvanced ? await convertAdvanced(item.file, q) : await convertStandard(item, q);
        up[i] = { ...item, status: 'done', newSize: blob.size, convertedBlob: blob };
      } catch (err: any) {
        console.error(`Conversion error for ${item.name}:`, err);
        up[i] = { ...item, status: 'error', errorMsg: err.message || 'Compression failed' };
      }
      setFiles([...up]);
    }
    setIsConverting(false);
    const done = up.filter((f) => f.status === 'done' && f.convertedBlob);
    if (done.length === 1) downloadSingle(done[0]);
    else if (done.length > 1) downloadBatch(done);
  };

  const downloadSingle = (item: ImageFile) => {
    if (!item.convertedBlob) return;
    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${item.name.substring(0, item.name.lastIndexOf('.')) || item.name}.webp`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadBatch = async (items: ImageFile[]) => {
    const zip = new JSZip();
    items.forEach((it) => {
      if (it.convertedBlob) zip.file(`${it.name.substring(0, it.name.lastIndexOf('.')) || it.name}.webp`, it.convertedBlob);
    });
    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'converted_images.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { setConversionError('Failed to package batch download.'); }
  };

  const totalOrig = files.reduce((s, f) => s + f.originalSize, 0);
  const totalNew = files.reduce((s, f) => s + (f.newSize || 0), 0);
  const doneCount = files.filter((f) => f.status === 'done').length;

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
            All images are processed 100% locally inside your browser cache. No photos, logs, or data are ever uploaded to any backend database.
          </p>
        </div>
      </div>

      {/* Drag-Drop Upload */}
      <div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? 'border-slate-900 bg-slate-50 scale-[0.99]' : 'border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 bg-white'
        }`}
      >
        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileInput} className="hidden" />
        <div className="w-16 h-16 bg-slate-950 text-white rounded-full flex items-center justify-center text-xl mx-auto shadow-md mb-4">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
        <h3 className="text-lg font-black text-slate-900 font-display mb-1">Drag & Drop Images Here</h3>
        <p className="text-xs text-slate-400 font-semibold mb-4">Supports JPG, PNG, WEBP, GIF, BMP, and SVG files up to 50MB</p>
        <button type="button" className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">
          Select Files
        </button>
      </div>

      {conversionError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-start space-x-2">
          <i className="fas fa-exclamation-circle mt-0.5"></i><span>{conversionError}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
              <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">WEBP</span>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-slate-300 uppercase tracking-wider">
                    <span>Compression Quality</span><span>{quality}%</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Max Compress</span>
                    <input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Best Quality</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">Recommended: 80% for excellent size savings with negligible quality loss.</p>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-black text-white uppercase tracking-wider block">Advanced Optimization</span>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Uses multi-threaded Web Workers to prevent browser freeze on large images.</p>
                  </div>
                  <button type="button" onClick={() => setUseAdvanced(!useAdvanced)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useAdvanced ? 'bg-white' : 'bg-slate-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAdvanced ? 'translate-x-6 bg-slate-900' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Stats summary bar */}
              {doneCount > 0 && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                  <span className="text-slate-300 font-bold">{doneCount}/{files.length} converted</span>
                  <span className="text-slate-400 font-medium">Original: <span className="text-white font-bold">{formatBytes(totalOrig)}</span></span>
                  <span className="text-slate-400 font-medium">New: <span className="text-emerald-400 font-bold">{formatBytes(totalNew)}</span></span>
                  {totalOrig > 0 && (
                    <span className="text-slate-400 font-medium">Saved: <span className="text-emerald-400 font-bold">{Math.round((1 - totalNew / totalOrig) * 100)}%</span></span>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button type="button" onClick={handleConvert} disabled={isConverting}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-slate-900 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50">
                  {isConverting ? (
                    <><i className="fas fa-spinner animate-spin text-[10px]"></i><span>Converting Queue...</span></>
                  ) : (
                    <><i className="fas fa-magic text-[10px]"></i><span>Convert Images ({useAdvanced ? 'Advanced' : 'Standard'})</span></>
                  )}
                </button>
                <button type="button" onClick={clearQueue} disabled={isConverting}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/10 text-white border border-white/20 font-extrabold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-40">
                  <i className="fas fa-trash text-[10px]"></i><span>Clear Queue</span>
                </button>
                {files.some((f) => f.status === 'done') && (
                  <button type="button" onClick={() => downloadBatch(files.filter((f) => f.status === 'done'))}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-slate-900 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center space-x-2 ml-auto">
                    <i className="fas fa-download text-[10px]"></i><span>Download All (.zip)</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Queue ({files.length})</span>
                </div>
                {files.map((fileObj) => {
                  const isDone = fileObj.status === 'done'; const isError = fileObj.status === 'error'; const isProcessing = fileObj.status === 'converting';
                  let savingsPct = 0;
                  if (isDone && fileObj.newSize) savingsPct = Math.round(((fileObj.originalSize - fileObj.newSize) / fileObj.originalSize) * 100);
                  return (
                    <div key={fileObj.id} className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${isDone ? 'bg-white/5 border border-white/10' : 'bg-white/5 border border-white/10'}`}>
                      <div className="flex items-center space-x-3 w-full sm:w-auto min-w-0">
                        <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={fileObj.preview} alt={fileObj.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-black text-white block truncate leading-tight max-w-[200px] md:max-w-[300px]">{fileObj.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{formatBytes(fileObj.originalSize)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end ml-auto">
                        {fileObj.status === 'pending' && (
                          <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider rounded-lg">Pending</span>
                        )}
                        {isProcessing && (
                          <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center space-x-1">
                            <i className="fas fa-spinner animate-spin text-[8px]"></i><span>Optimizing...</span>
                          </span>
                        )}
                        {isError && (
                          <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-[9px] uppercase tracking-wider rounded-lg">Failed: {fileObj.errorMsg || 'Error'}</span>
                        )}
                        {isDone && fileObj.newSize && (
                          <div className="flex items-center space-x-3">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] font-black text-white block leading-tight">{formatBytes(fileObj.newSize)}</span>
                              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">{savingsPct > 0 ? `Saved ${savingsPct}%` : 'No size savings'}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-[9px] uppercase tracking-wider rounded-lg">Done</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1.5 border-l border-white/10 pl-3">
                          {isDone && fileObj.convertedBlob && (
                            <button type="button" onClick={() => downloadSingle(fileObj)} className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer" title="Download WebP">
                              <i className="fas fa-download text-[10px]"></i>
                            </button>
                          )}
                          <button type="button" onClick={() => removeFile(fileObj.id)} className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer" title="Remove">
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
        </div>
      )}
    </div>
  );
}
