'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type Status = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';
type VideoFormat = 'mp4' | 'webm' | 'mov' | 'mkv';
type VideoCodec = 'h264' | 'h265' | 'vp9';
type Resolution = 'source' | '480p' | '720p' | '1080p' | '4k';
type FpsOpt = 'source' | 24 | 30 | 60;
type AudioMode = 'keep' | 'remove' | 'reencode';
type SpeedPreset = 'ultrafast' | 'medium' | 'slow';

interface CompressOptions {
  format: VideoFormat;
  codec: VideoCodec;
  crf: number;
  preset: SpeedPreset;
  resolution: Resolution;
  fps: FpsOpt;
  audioMode: AudioMode;
  audioBitrate: string;
  trimStart: number;
  trimEnd: number;
}

interface PresetProfile {
  label: string;
  options: CompressOptions;
}

const PRESETS: Record<string, PresetProfile> = {
  'youtube': { label: 'YouTube', options: { format: 'mp4', codec: 'h264', crf: 23, preset: 'medium', resolution: '1080p', fps: 30, audioMode: 'reencode', audioBitrate: '128k', trimStart: 0, trimEnd: 0 } },
  'twitter': { label: 'Twitter / X', options: { format: 'mp4', codec: 'h264', crf: 28, preset: 'medium', resolution: '720p', fps: 30, audioMode: 'reencode', audioBitrate: '64k', trimStart: 0, trimEnd: 0 } },
  'instagram': { label: 'Instagram', options: { format: 'mp4', codec: 'h264', crf: 26, preset: 'medium', resolution: '1080p', fps: 30, audioMode: 'reencode', audioBitrate: '128k', trimStart: 0, trimEnd: 0 } },
  'discord': { label: 'Discord', options: { format: 'mp4', codec: 'h264', crf: 28, preset: 'medium', resolution: '720p', fps: 30, audioMode: 'reencode', audioBitrate: '96k', trimStart: 0, trimEnd: 0 } },
  'webm-web': { label: 'WebM Video', options: { format: 'webm', codec: 'vp9', crf: 30, preset: 'medium', resolution: '720p', fps: 30, audioMode: 'reencode', audioBitrate: '128k', trimStart: 0, trimEnd: 0 } },
  'high-quality': { label: 'High Quality', options: { format: 'mp4', codec: 'h264', crf: 18, preset: 'slow', resolution: 'source', fps: 'source', audioMode: 'keep', audioBitrate: '192k', trimStart: 0, trimEnd: 0 } },
  'small-file': { label: 'Small File', options: { format: 'mp4', codec: 'h265', crf: 32, preset: 'medium', resolution: '480p', fps: 24, audioMode: 'reencode', audioBitrate: '64k', trimStart: 0, trimEnd: 0 } },
  'custom': { label: 'Custom', options: { format: 'mp4', codec: 'h264', crf: 23, preset: 'medium', resolution: '1080p', fps: 30, audioMode: 'reencode', audioBitrate: '128k', trimStart: 0, trimEnd: 0 } },
};

const CODEC_MAP: Record<VideoCodec, { lib: string; formats: VideoFormat[]; label: string }> = {
  h264: { lib: 'libx264', formats: ['mp4', 'mov', 'mkv'], label: 'H.264 (AVC)' },
  h265: { lib: 'libx265', formats: ['mp4', 'mkv'], label: 'H.265 (HEVC)' },
  vp9: { lib: 'libvpx-vp9', formats: ['webm', 'mkv'], label: 'VP9' },
};

const FORMAT_DEFAULT_CODEC: Record<VideoFormat, VideoCodec> = {
  mp4: 'h264',
  webm: 'vp9',
  mov: 'h264',
  mkv: 'h264',
};

const RES_MAP: Record<string, string> = {
  '480p': 'scale=854:-2',
  '720p': 'scale=1280:-2',
  '1080p': 'scale=1920:-2',
  '4k': 'scale=3840:-2',
};

const FFMPEG_CORE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

// Persistent IndexedDB Cache Helpers
const DB_NAME = 'TuitilityFFmpegCacheDB';
const STORE_NAME = 'ffmpeg_files';
const DB_VERSION = 1;

function openFFmpegCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedFFmpegFile(key: string): Promise<Blob | null> {
  try {
    const db = await openFFmpegCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedFFmpegFile(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openFFmpegCacheDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to save to IndexedDB:', e);
  }
}

async function getCachedBlobURL(
  url: string,
  mimeType: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const cacheKey = `ffmpeg_core_${url.split('/').pop()}`;

  // 1. Try IndexedDB cache
  const cachedBlob = await getCachedFFmpegFile(cacheKey);
  if (cachedBlob && cachedBlob.size > 0) {
    if (onProgress) onProgress(100);
    return URL.createObjectURL(cachedBlob);
  }

  // 2. Fetch with progress tracking
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  let received = 0;
  const chunks: Uint8Array[] = [];

  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        if (onProgress && total > 0) {
          onProgress(Math.round((received / total) * 100));
        }
      }
    }
  } else {
    const buffer = await response.arrayBuffer();
    chunks.push(new Uint8Array(buffer));
  }

  const blob = new Blob(chunks as BlobPart[], { type: mimeType });
  setCachedFFmpegFile(cacheKey, blob).catch(err => console.warn('Cache save error:', err));
  return URL.createObjectURL(blob);
}

function fmtBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fmtDuration(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoCompressor() {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [status, setStatus] = useState<Status>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCachedEngine, setIsCachedEngine] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileDuration, setFileDuration] = useState(0);
  const [fileName, setFileName] = useState('');
  const [presetId, setPresetId] = useState('youtube');
  const [opts, setOpts] = useState<CompressOptions>(PRESETS['youtube'].options);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const progressRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const origVideoRef = useRef<HTMLVideoElement>(null);
  const compVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => { [fileUrl, originalUrl, resultUrl].forEach(u => { if (u) URL.revokeObjectURL(u); }); };
  }, [fileUrl, originalUrl, resultUrl]);

  const loadFFmpeg = useCallback(async () => {
    if (status !== 'idle') return;
    setStatus('loading');
    setDownloadProgress(0);
    try {
      const base = FFMPEG_CORE;
      const cachedWasm = await getCachedFFmpegFile('ffmpeg_core_ffmpeg-core.wasm');
      if (cachedWasm) {
        setIsCachedEngine(true);
      }

      const coreURL = await getCachedBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await getCachedBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm', (pct) => {
        setDownloadProgress(pct);
      });

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      ffmpeg.on('progress', ({ progress: p }) => {
        const val = Math.min(0.99, p);
        progressRef.current = val;
        setProgress(val);
      });
      setStatus('ready');
    } catch (err) {
      console.error('FFmpeg loading error:', err);
      setError('Failed to load video engine. Check your internet connection and try again.');
      setStatus('error');
    }
  }, [ffmpeg, status]);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('video/') && !f.name.match(/\.(mp4|webm|mov|mkv|avi|flv|m4v)$/i)) {
      setError('Please select a valid video file (MP4, WebM, MOV, MKV, AVI).');
      return;
    }
    setError('');
    setResultUrl('');
    setResultSize(0);
    setProgress(0);
    setShowCompare(false);
    setFile(f);
    setFileName(f.name);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setOriginalUrl(url);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setFileDuration(video.duration || 0);
      URL.revokeObjectURL(video.src);
    };
    video.src = url;
    if (status === 'idle') loadFFmpeg();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    setOpts(PRESETS[id].options);
  };

  const updateOpt = <K extends keyof CompressOptions>(key: K, val: CompressOptions[K]) => {
    setPresetId('custom');
    if (key === 'format') {
      const newFormat = val as VideoFormat;
      const allowedCodecs = Object.entries(CODEC_MAP)
        .filter(([_, info]) => info.formats.includes(newFormat))
        .map(([c]) => c as VideoCodec);
      
      let newCodec = opts.codec;
      if (!allowedCodecs.includes(opts.codec)) {
        newCodec = FORMAT_DEFAULT_CODEC[newFormat] || allowedCodecs[0];
      }
      setOpts(prev => ({ ...prev, format: newFormat, codec: newCodec }));
    } else {
      setOpts(prev => ({ ...prev, [key]: val }));
    }
  };

  // Live estimated file size calculation
  const estimatedOutput = useMemo(() => {
    if (!file || fileDuration <= 0) return { size: 0, percentChange: 0 };

    const effectiveDuration = (opts.trimEnd > opts.trimStart && opts.trimEnd <= fileDuration)
      ? (opts.trimEnd - opts.trimStart)
      : (fileDuration > opts.trimStart ? fileDuration - opts.trimStart : fileDuration);

    if (effectiveDuration <= 0) return { size: file.size, percentChange: 0 };

    const totalBps = (file.size * 8) / fileDuration;
    const srcAudioBps = 128000;
    const srcVideoBps = Math.max(100000, totalBps - srcAudioBps);

    let resFactor = 1.0;
    if (opts.resolution === '480p') resFactor = 0.25;
    else if (opts.resolution === '720p') resFactor = 0.45;
    else if (opts.resolution === '1080p') resFactor = 0.75;
    else if (opts.resolution === '4k') resFactor = 1.0;

    let crfFactor = 1.0;
    if (opts.codec === 'h264') {
      crfFactor = Math.pow(2, (23 - opts.crf) / 6.0);
    } else if (opts.codec === 'h265') {
      crfFactor = Math.pow(2, (28 - opts.crf) / 6.0) * 0.7;
    } else if (opts.codec === 'vp9') {
      crfFactor = Math.pow(2, (30 - opts.crf) / 7.0) * 0.8;
    }

    let fpsFactor = 1.0;
    if (opts.fps !== 'source') {
      fpsFactor = Number(opts.fps) / 30;
    }

    const estVideoBps = Math.max(80000, Math.min(srcVideoBps * resFactor * crfFactor * fpsFactor, 40000000));

    let estAudioBps = srcAudioBps;
    if (opts.audioMode === 'remove') {
      estAudioBps = 0;
    } else if (opts.audioMode === 'reencode' || opts.format === 'webm') {
      estAudioBps = (parseInt(opts.audioBitrate) || 128) * 1000;
    }

    const estTotalBytes = Math.max(1024, Math.round((effectiveDuration * (estVideoBps + estAudioBps)) / 8));
    const percentChange = Math.round(((estTotalBytes - file.size) / file.size) * 100);

    return { size: estTotalBytes, percentChange };
  }, [file, fileDuration, opts]);

  const compress = async () => {
    if (!file || status !== 'ready') return;
    setStatus('processing');
    setProgress(0);
    setProgressText('Preparing video files...');
    setResultUrl('');
    setResultSize(0);
    setShowCompare(false);
    setError('');

    try {
      const ext = opts.format;
      const inExt = file.name.substring(file.name.lastIndexOf('.')) || '.mp4';
      const inName = `input_${Date.now()}${inExt}`;
      const outName = `output_${Date.now()}.${ext}`;

      await ffmpeg.writeFile(inName, await fetchFile(file));

      const args: string[] = ['-i', inName];

      // Trim settings
      if (opts.trimEnd > 0 && opts.trimEnd > opts.trimStart) {
        args.push('-ss', String(opts.trimStart));
        args.push('-to', String(opts.trimEnd));
      } else if (opts.trimStart > 0) {
        args.push('-ss', String(opts.trimStart));
      }

      // Video Codec & Quality
      const codec = CODEC_MAP[opts.codec];
      args.push('-c:v', codec.lib);

      if (opts.codec === 'h264' || opts.codec === 'h265') {
        args.push('-crf', String(opts.crf));
        args.push('-preset', opts.preset);
        args.push('-pix_fmt', 'yuv420p');
        if (opts.codec === 'h265') {
          args.push('-tag:v', 'hvc1');
        }
      } else if (opts.codec === 'vp9') {
        args.push('-crf', String(opts.crf));
        args.push('-b:v', '0'); // Required for VP9 Constant Quality / CRF mode
        args.push('-cpu-used', opts.preset === 'ultrafast' ? '5' : opts.preset === 'slow' ? '1' : '3');
      }

      // Resolution scaling
      if (opts.resolution !== 'source' && RES_MAP[opts.resolution]) {
        args.push('-vf', RES_MAP[opts.resolution]);
      }

      // FPS option
      if (opts.fps !== 'source') {
        args.push('-r', String(opts.fps));
      }

      // Audio handling
      if (opts.audioMode === 'remove') {
        args.push('-an');
      } else {
        if (ext === 'webm') {
          args.push('-c:a', 'libopus');
          args.push('-b:a', opts.audioBitrate || '128k');
        } else if (opts.audioMode === 'reencode') {
          args.push('-c:a', 'aac');
          args.push('-b:a', opts.audioBitrate);
        } else {
          args.push('-c:a', 'copy');
        }
      }

      // Container flags (only MP4 and MOV support faststart)
      if (ext === 'mp4' || ext === 'mov') {
        args.push('-movflags', '+faststart');
      }

      args.push('-y', outName);

      setProgressText(`Compressing & converting to ${ext.toUpperCase()}...`);
      await ffmpeg.exec(args);

      const raw = await ffmpeg.readFile(outName) as Uint8Array;
      if (!raw || raw.byteLength === 0) {
        throw new Error('Conversion failed or returned empty output.');
      }
      const data = Uint8Array.from(raw);
      const mimeType = ext === 'webm' ? 'video/webm' : ext === 'mkv' ? 'video/x-matroska' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      // Clean virtual FS
      try {
        await ffmpeg.deleteFile(inName);
        await ffmpeg.deleteFile(outName);
      } catch {}

      setResultUrl(url);
      setResultSize(blob.size);
      setProgress(1);
      setProgressText('');
      setStatus('done');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      setShowCompare(true);
    } catch (err: any) {
      console.error('Compression error:', err);
      setError(err?.message || 'An error occurred during compression/conversion.');
      setStatus('ready');
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    const baseName = fileName.replace(/\.[^.]+$/, '');
    a.href = resultUrl;
    a.download = `${baseName}-converted.${opts.format}`;
    a.click();
  };

  const handleClear = () => {
    setFile(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl('');
    setOriginalUrl('');
    setFileDuration(0);
    setFileName('');
    setResultUrl('');
    setResultSize(0);
    setProgress(0);
    setError('');
    setShowCompare(false);
    setStatus('idle');
    setPresetId('youtube');
    setOpts(PRESETS['youtube'].options);
  };

  const syncVideos = () => {
    if (showCompare && origVideoRef.current && compVideoRef.current) {
      if (origVideoRef.current.paused && !compVideoRef.current.paused) compVideoRef.current.pause();
      else if (!origVideoRef.current.paused && compVideoRef.current.paused) compVideoRef.current.play();
    }
  };

  const formatExt = opts.format;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy & Performance Guard */}
      <div className="relative bg-[#1a1a1a] rounded-2xl p-5 overflow-hidden">
        <div className="absolute inset-0 opacity-5 select-none pointer-events-none text-[8rem] font-black leading-none flex items-center justify-end pr-4">PRIVACY</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="bg-white/10 p-2.5 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Your video never leaves your browser.</p>
            <p className="text-white/50 text-xs mt-0.5">
              Processing runs 100% locally via FFmpeg WebAssembly. Engine files are cached in IndexedDB for instant reload across browser sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center space-y-4">
          <div className="inline-block w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <div>
            <p className="text-slate-700 text-sm font-semibold">
              {isCachedEngine ? 'Loading cached video engine...' : 'Downloading video engine (~30MB)...'}
            </p>
            {!isCachedEngine && downloadProgress > 0 && (
              <div className="w-48 mx-auto bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-slate-900 h-full transition-all duration-200" style={{ width: `${downloadProgress}%` }} />
              </div>
            )}
            <p className="text-slate-400 text-xs mt-2">
              {isCachedEngine ? 'Loading instantly from browser IndexedDB.' : `${downloadProgress}% completed. Engine will be cached locally.`}
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {status !== 'loading' && !file && (
        <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/40"
          onClick={() => fileInputRef.current?.click()}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold">Drop a video here or click to browse</p>
          <p className="text-slate-400 text-xs mt-1">Supports MP4, WebM, MOV, MKV, AVI files</p>
          <input ref={fileInputRef} type="file" accept="video/*,.mp4,.webm,.mov,.mkv,.avi" onChange={handleFileInput} className="hidden" />
        </div>
      )}

      {/* File Info + Settings */}
      {status !== 'loading' && file && (
        <div className="space-y-6">
          {/* Selected File Info Header */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-8 h-8 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{fileName}</p>
                <p className="text-xs text-slate-400">{fmtBytes(file.size)} &middot; {fmtDuration(fileDuration)}</p>
              </div>
            </div>
            <button type="button" onClick={handleClear} className="text-xs text-slate-400 hover:text-slate-600 underline">Remove</button>
          </div>

          {/* Presets */}
          <div className="space-y-3">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([id, p]) => (
                <button key={id} type="button" onClick={() => applyPreset(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${presetId === id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compression Settings */}
          {(status === 'ready' || status === 'processing' || status === 'done') && (
            <div className="bg-slate-50/70 rounded-2xl p-5 space-y-5 border border-slate-100">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Compression &amp; Format Settings</span>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Target Format</label>
                  <select value={opts.format} onChange={e => updateOpt('format', e.target.value as VideoFormat)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer">
                    {(['mp4', 'webm', 'mov', 'mkv'] as VideoFormat[]).map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Codec</label>
                  <select value={opts.codec} onChange={e => updateOpt('codec', e.target.value as VideoCodec)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer">
                    {(Object.entries(CODEC_MAP) as [VideoCodec, typeof CODEC_MAP[VideoCodec]][]).map(([k, v]) => (
                      <option key={k} value={k} disabled={!v.formats.includes(opts.format)}>{v.label}{!v.formats.includes(opts.format) ? ' (N/A)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Resolution</label>
                  <select value={opts.resolution} onChange={e => updateOpt('resolution', e.target.value as Resolution)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer">
                    {(['source', '480p', '720p', '1080p', '4k'] as Resolution[]).map(r => <option key={r} value={r}>{r === 'source' ? 'Original Source' : r}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Frame Rate</label>
                  <select value={opts.fps} onChange={e => updateOpt('fps', e.target.value as unknown as FpsOpt)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer">
                    {(['source', 24, 30, 60] as FpsOpt[]).map(f => <option key={String(f)} value={String(f)}>{f === 'source' ? 'Original Source' : `${f} FPS`}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Quality (CRF): <span className="font-mono text-slate-800 font-bold">{opts.crf}</span></label>
                  <input type="range" min="15" max="45" value={opts.crf} onChange={e => updateOpt('crf', Number(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer" />
                  <div className="flex justify-between text-[8px] text-slate-400"><span>Higher Quality</span><span>Smaller File</span></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Speed</label>
                  <select value={opts.preset} onChange={e => updateOpt('preset', e.target.value as SpeedPreset)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer">
                    {(['ultrafast', 'medium', 'slow'] as SpeedPreset[]).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Audio</label>
                  <select value={opts.audioMode} onChange={e => updateOpt('audioMode', e.target.value as AudioMode)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer">
                    <option value="keep">Keep Original</option>
                    <option value="reencode">Re-encode</option>
                    <option value="remove">Mute / Remove Audio</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Audio Bitrate</label>
                  <select value={opts.audioBitrate} onChange={e => updateOpt('audioBitrate', e.target.value)}
                    disabled={opts.audioMode !== 'reencode' && opts.format !== 'webm'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer disabled:opacity-40">
                    {['64k', '96k', '128k', '192k', '320k'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Trim Start (sec)</label>
                  <input type="number" min="0" value={opts.trimStart} onChange={e => updateOpt('trimStart', Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase">Trim End (0 = full)</label>
                  <input type="number" min="0" value={opts.trimEnd} onChange={e => updateOpt('trimEnd', Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>

              {/* Real-time Estimated Output Size Card */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-green-400 font-bold shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Live Estimated Output Size</div>
                    <div className="text-base font-bold flex items-center gap-2 mt-0.5">
                      <span>~{fmtBytes(estimatedOutput.size)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        estimatedOutput.percentChange <= 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {estimatedOutput.percentChange <= 0 
                          ? `${Math.abs(estimatedOutput.percentChange)}% smaller` 
                          : `+${estimatedOutput.percentChange}% larger`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                  <span>Original: <strong className="text-white">{fmtBytes(file.size)}</strong></span>
                  <span>Target: <strong className="text-slate-200">{opts.format.toUpperCase()} ({CODEC_MAP[opts.codec].label})</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {status === 'ready' && (
              <button type="button" onClick={compress}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Compress &amp; Convert Video
              </button>
            )}
            {status === 'processing' && (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{progressText || 'Processing video...'}</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(5, progress * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Section */}
      {(status === 'done' && resultUrl) && (
        <div ref={resultRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-fade-in-up">
          <div className="relative z-10 space-y-6">
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Conversion Complete</span>
              <div className="flex items-center justify-center gap-4 text-base">
                <span className="text-white/60">{fmtBytes(file!.size)}</span>
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-green-400 font-extrabold text-lg">{fmtBytes(resultSize)}</span>
                <span className="text-white/40 text-xs">
                  ({resultSize <= file!.size ? `${Math.round((1 - resultSize / file!.size) * 100)}% smaller` : `${Math.round((resultSize / file!.size - 1) * 100)}% larger`})
                </span>
              </div>
            </div>

            {/* Side-by-Side Video Players */}
            {showCompare && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Original Video</span>
                  <video ref={origVideoRef} src={originalUrl} controls className="w-full rounded-xl bg-black aspect-video object-contain" onPlay={syncVideos} onPause={syncVideos} />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Compressed / Converted ({formatExt.toUpperCase()})</span>
                  <video ref={compVideoRef} src={resultUrl} controls className="w-full rounded-xl bg-black aspect-video object-contain" onPlay={syncVideos} onPause={syncVideos} />
                </div>
              </div>
            )}

            {/* Download Actions */}
            <div className="flex justify-center gap-4 flex-wrap">
              <button type="button" onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-all active:scale-95 shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download {formatExt.toUpperCase()} ({fmtBytes(resultSize)})
              </button>
              <button type="button" onClick={() => { setResultUrl(''); setStatus('ready'); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95">
                Compress Another Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
