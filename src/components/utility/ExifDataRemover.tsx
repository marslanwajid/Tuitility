'use client';

import React, { useState, useRef, useCallback } from 'react';
import exifr from 'exifr';

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
};

const EXIF_LABELS: Record<string, string> = {
  Make: 'Camera Make',
  Model: 'Camera Model',
  DateTimeOriginal: 'Date Taken',
  ISO: 'ISO',
  FNumber: 'Aperture (F-Stop)',
  FocalLength: 'Focal Length',
  ExposureTime: 'Shutter Speed',
  ExposureProgram: 'Exposure Program',
  ExposureMode: 'Exposure Mode',
  ExposureCompensation: 'Exposure Compensation',
  Flash: 'Flash',
  WhiteBalance: 'White Balance',
  MeteringMode: 'Metering Mode',
  ColorSpace: 'Color Space',
  Software: 'Software',
  Orientation: 'Orientation',
  ResolutionUnit: 'Resolution Unit',
  XResolution: 'X Resolution',
  YResolution: 'Y Resolution',
  latitude: 'GPS Latitude',
  longitude: 'GPS Longitude',
  altitude: 'GPS Altitude',
  Artist: 'Artist',
  Copyright: 'Copyright',
  ImageDescription: 'Description',
  UserComment: 'User Comment',
};

const formatExifValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return 'N/A';
  if (key === 'FNumber') return `f/${String(value)}`;
  if (key === 'FocalLength') return `${Number(value).toFixed(1)} mm`;
  if (key === 'ExposureTime') {
    const v = Number(value);
    return v < 1 ? `1/${Math.round(1 / v)} sec` : `${v} sec`;
  }
  if (key === 'ISO') return `ISO ${value}`;
  if (key === 'latitude' || key === 'longitude') return String(value);
  if (key === 'Orientation') {
    const orientations: Record<number, string> = {
      1: 'Normal', 2: 'Mirrored', 3: 'Rotated 180°', 4: 'Mirrored + 180°',
      5: 'Mirrored + 90° CCW', 6: 'Rotated 90° CW', 7: 'Mirrored + 90° CW', 8: 'Rotated 90° CCW',
    };
    return orientations[Number(value)] || `Unknown (${value})`;
  }
  if (key === 'Flash') {
    const flashModes: Record<number, string> = {
      0: 'No Flash', 1: 'Flash Fired', 5: 'Flash Fired (Return Detected)',
      7: 'Flash Fired (Return Not Detected)', 9: 'Flash Fired (Compulsory)',
      13: 'Flash Fired (Compulsory, Return Detected)',
      15: 'Flash Fired (Compulsory, Return Not Detected)',
      16: 'No Flash (Compulsory)', 24: 'No Flash (Auto)',
      25: 'Flash Fired (Auto)', 29: 'Flash Fired (Auto, Return Detected)',
      31: 'Flash Fired (Auto, Return Not Detected)',
      32: 'No Flash (No Flash Function)', 65: 'Flash Fired (Red-Eye)',
      69: 'Flash Fired (Red-Eye, Return Detected)',
      71: 'Flash Fired (Red-Eye, Return Not Detected)',
      73: 'Flash Fired (Red-Eye, Compulsory)',
      77: 'Flash Fired (Red-Eye, Compulsory, Return Detected)',
      79: 'Flash Fired (Red-Eye, Compulsory, Return Not Detected)',
      80: 'No Flash (Red-Eye)',
      88: 'No Flash (Auto, Red-Eye)',
      89: 'Flash Fired (Auto, Red-Eye)',
      93: 'Flash Fired (Auto, Red-Eye, Return Detected)',
      95: 'Flash Fired (Auto, Red-Eye, Return Not Detected)',
    };
    return flashModes[Number(value)] || `Flash Mode ${value}`;
  }
  if (key === 'WhiteBalance') {
    return Number(value) === 0 ? 'Auto' : 'Manual';
  }
  if (key === 'MeteringMode') {
    const modes: Record<number, string> = {
      0: 'Unknown', 1: 'Average', 2: 'Center-Weighted Average', 3: 'Spot',
      4: 'Multi-Spot', 5: 'Pattern', 6: 'Partial', 255: 'Other',
    };
    return modes[Number(value)] || `Mode ${value}`;
  }
  if (key === 'ExposureProgram') {
    const programs: Record<number, string> = {
      0: 'Not Defined', 1: 'Manual', 2: 'Program AE', 3: 'Aperture Priority',
      4: 'Shutter Priority', 5: 'Creative (Slow Speed)', 6: 'Action (High Speed)',
      7: 'Portrait', 8: 'Landscape',
    };
    return programs[Number(value)] || `Program ${value}`;
  }
  if (key === 'ResolutionUnit') {
    return Number(value) === 2 ? 'inches' : Number(value) === 3 ? 'cm' : 'N/A';
  }
  if (typeof value === 'number') return String(value);
  return String(value);
};

export default function ExifDataRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [exifData, setExifData] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<'idle' | 'loaded' | 'cleaned'>('idle');
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedSize, setCleanedSize] = useState<number>(0);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (f: File) => {
    setError('');
    setStatus('loaded');
    setCleanedBlob(null);
    setCleanedSize(0);

    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WebP, TIFF).');
      setStatus('idle');
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);

    try {
      const arrBuf = await f.arrayBuffer();
      const parsed = await exifr.parse(arrBuf);
      setExifData(parsed || {});
    } catch {
      setExifData({});
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleRemoveExif = async () => {
    if (!preview || !file) return;
    setIsProcessing(true);
    setError('');

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = preview;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(img, 0, 0);

      const mimeType = file.type || 'image/png';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to encode image'));
        }, mimeType, 0.92);
      });

      setCleanedBlob(blob);
      setCleanedSize(blob.size);
      setStatus('cleaned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove EXIF data.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedBlob || !file) return;
    const url = URL.createObjectURL(cleanedBlob);
    const a = document.createElement('a');
    a.href = url;
    const dot = file.name.lastIndexOf('.');
    const base = dot > 0 ? file.name.slice(0, dot) : file.name;
    const ext = dot > 0 ? file.name.slice(dot) : '';
    a.download = `${base}-clean${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setExifData(null);
    setStatus('idle');
    setCleanedBlob(null);
    setCleanedSize(0);
    setError('');
    setIsProcessing(false);
  };

  const exifEntries = exifData
    ? Object.entries(exifData).filter(([k]) => EXIF_LABELS[k])
    : [];

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
            All EXIF data is removed 100% locally in your browser. No files are uploaded to any server.
            Your image never leaves your device.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {status === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
            isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400 bg-white'
          }`}
        >
          <i className="fas fa-image text-4xl text-slate-300 mb-4 block"></i>
          <p className="text-sm font-bold text-slate-500">Drop an image here or click to browse</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Supports JPEG, PNG, WebP, TIFF</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Loaded State */}
      {status !== 'idle' && preview && (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-sm text-slate-900 truncate">{file?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {file ? fmtSize(file.size) : ''}
              </p>
            </div>
          </div>

          {/* EXIF Data Table */}
          {exifEntries.length > 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center">
                <i className="fas fa-info-circle mr-1.5"></i>
                Found Metadata ({exifEntries.length} fields)
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {exifEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1.5 px-3 bg-white rounded-xl border border-slate-100 text-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {EXIF_LABELS[key] || key}
                    </span>
                    <span className="font-mono font-black text-slate-900 text-xs text-right ml-2 break-all">
                      {formatExifValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 text-center">
              <i className="fas fa-check-circle text-emerald-500 text-lg mb-1 block"></i>
              <p className="text-xs font-bold text-emerald-700">No EXIF data detected — this image is already clean!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {status === 'loaded' && (
              <button
                onClick={handleRemoveExif}
                disabled={isProcessing}
                className="px-6 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-alt"></i>
                    <span>Remove EXIF &amp; Download</span>
                  </>
                )}
              </button>
            )}
            {status === 'cleaned' && cleanedBlob && (
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-full bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition-all active:scale-95 text-sm flex items-center space-x-2"
              >
                <i className="fas fa-download"></i>
                <span>Download Cleaned Image</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all active:scale-95 text-sm"
            >
              Start Over
            </button>
          </div>

          {/* Size Comparison */}
          {status === 'cleaned' && file && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center">
                <i className="fas fa-chart-bar mr-1.5"></i>
                File Size Comparison
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Original</span>
                <span className="font-mono font-black text-sm text-slate-900">{fmtSize(file.size)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Cleaned</span>
                <span className={`font-mono font-black text-sm ${cleanedSize <= file.size ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {fmtSize(cleanedSize)}
                  <span className="text-[10px] ml-1 font-bold">
                    ({cleanedSize > 0 ? ((cleanedSize / file.size - 1) * 100).toFixed(1) : 0}%)
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
