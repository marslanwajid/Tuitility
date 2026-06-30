'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface PresetFps {
  value: number;
  label: string;
}

const FPS_PRESETS: PresetFps[] = [
  { value: 10, label: '10 FPS (Low)' },
  { value: 15, label: '15 FPS (Standard)' },
  { value: 24, label: '24 FPS (Cinematic)' },
  { value: 30, label: '30 FPS (High)' },
  { value: 60, label: '60 FPS (Ultra Smooth)' },
];

interface PresetWidth {
  value: number | 'original';
  label: string;
}

const WIDTH_PRESETS: PresetWidth[] = [
  { value: 320, label: '320px (Mobile)' },
  { value: 480, label: '480px (Medium)' },
  { value: 640, label: '640px (Web)' },
  { value: 'original', label: 'Original Size' },
];

export default function VideoToGifConverter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);

  // User input settings
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [fps, setFps] = useState<number>(15);
  const [targetWidth, setTargetWidth] = useState<number | 'original'>('original');
  const [infiniteLoop, setInfiniteLoop] = useState<boolean>(true);
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [filename, setFilename] = useState<string>('tuitility-export');

  // Conversion process state
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [totalFrames, setTotalFrames] = useState<number>(0);
  const [gifBlobUrl, setGifBlobUrl] = useState<string>('');
  const [gifSize, setGifSize] = useState<number>(0); // in bytes
  const [cancelRequested, setCancelRequested] = useState<boolean>(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const renderVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (gifBlobUrl) URL.revokeObjectURL(gifBlobUrl);
    };
  }, [videoSrc, gifBlobUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setGifBlobUrl('');
      setGifSize(0);
      setStartTime(0);
      setEndTime(0);
      setFilename(file.name.substring(0, file.name.lastIndexOf('.')) || 'tuitility-export');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setGifBlobUrl('');
      setGifSize(0);
      setStartTime(0);
      setEndTime(0);
      setFilename(file.name.substring(0, file.name.lastIndexOf('.')) || 'tuitility-export');
    }
  };

  const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoDuration(video.duration);
    setVideoWidth(video.videoWidth);
    setVideoHeight(video.videoHeight);
    setEndTime(Math.min(video.duration, 5)); // Default to first 5 seconds
  };

  const handleStartTimeChange = (val: number) => {
    const safeVal = Math.max(0, Math.min(val, endTime - 0.1));
    setStartTime(Number(safeVal.toFixed(2)));
    if (videoRef.current) {
      videoRef.current.currentTime = safeVal;
    }
  };

  const handleEndTimeChange = (val: number) => {
    const safeVal = Math.max(startTime + 0.1, Math.min(val, videoDuration));
    setEndTime(Number(safeVal.toFixed(2)));
    if (videoRef.current) {
      videoRef.current.currentTime = safeVal;
    }
  };

  const setStartToCurrent = () => {
    if (videoRef.current) {
      handleStartTimeChange(videoRef.current.currentTime);
    }
  };

  const setEndToCurrent = () => {
    if (videoRef.current) {
      handleEndTimeChange(videoRef.current.currentTime);
    }
  };

  const cancelConversion = () => {
    setCancelRequested(true);
  };

  const startConversion = async () => {
    if (!videoFile || !renderVideoRef.current || !canvasRef.current) return;

    setIsConverting(true);
    setProgress(0);
    setCurrentFrame(0);
    setCancelRequested(false);
    setGifBlobUrl('');

    const renderVideo = renderVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions
    const scaleWidth = targetWidth === 'original' ? videoWidth : targetWidth;
    const scaleHeight = Math.round((scaleWidth * videoHeight) / videoWidth);

    canvas.width = scaleWidth;
    canvas.height = scaleHeight;

    const clipDuration = endTime - startTime;
    const frameDelay = 1000 / fps;
    const calculatedTotalFrames = Math.ceil(clipDuration * fps);
    setTotalFrames(calculatedTotalFrames);

    const format = 'rgba8888';
    const formatBytes = 4; // RGBA is 4 bytes
    const encoder = new GIFEncoder();

    let frameIdx = 0;
    
    const runFrame = async (): Promise<Uint8Array | null> => {
      if (cancelRequested) {
        return null;
      }

      if (frameIdx >= calculatedTotalFrames) {
        encoder.finish();
        return encoder.bytesView();
      }

      const frameTime = startTime + (frameIdx / fps);
      renderVideo.currentTime = frameTime;

      // Wait for seeking to finish
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          renderVideo.removeEventListener('seeked', onSeeked);
          resolve();
        };
        renderVideo.addEventListener('seeked', onSeeked);
      });

      // Draw onto canvas
      ctx.drawImage(renderVideo, 0, 0, scaleWidth, scaleHeight);

      // Extract raw image bytes
      const imageData = ctx.getImageData(0, 0, scaleWidth, scaleHeight);
      const rgba = imageData.data;

      // Quantize colors and create indexed palette
      const palette = quantize(rgba, 256, { format });
      const index = applyPalette(rgba, palette, format);

      // Write frame into the encoder bytes stream
      encoder.writeFrame(index, scaleWidth, scaleHeight, {
        palette,
        delay: frameDelay,
        repeat: infiniteLoop ? 0 : repeatCount,
      });

      frameIdx++;
      setCurrentFrame(frameIdx);
      setProgress(Math.round((frameIdx / calculatedTotalFrames) * 100));

      // Yield event loop to let UI render progress
      await new Promise((r) => setTimeout(r, 0));
      return runFrame();
    };

    try {
      const bytes = await runFrame();
      if (bytes) {
        const blob = new Blob([bytes as any], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        setGifBlobUrl(url);
        setGifSize(blob.size);
      }
    } catch (err) {
      console.error('Error encoding GIF:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!gifBlobUrl) return;
    const a = document.createElement('a');
    a.href = gifBlobUrl;
    a.download = `${filename}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(2);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const isHighLoad = useMemo(() => {
    const duration = endTime - startTime;
    return duration * fps > 250;
  }, [startTime, endTime, fps]);

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
            All video parsing and GIF conversion are processed 100% locally inside your browser cache. No files, video clips, or metadata are ever transmitted or uploaded to any backend server.
          </p>
        </div>
      </div>

      {!videoFile ? (
        // File Uploader Area
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-slate-400 hover:bg-slate-50/50 cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[300px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
          <div className="w-16 h-16 bg-slate-50 group-hover:scale-105 group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-500 mb-5">
            <i className="fas fa-file-video text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upload Video</h3>
          <p className="text-xs text-slate-400 font-medium mt-2 max-w-sm">
            Drag and drop your video file here, or click to browse. Supports MP4, WebM, MOV, or OGG format.
          </p>
          <div className="mt-6 flex items-center space-x-1.5 bg-slate-100 text-slate-500 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <i className="fas fa-bolt text-[9px]"></i>
            <span>Local Conversion</span>
          </div>
        </div>
      ) : (
        // Settings & Editing Layout
        <div className="space-y-6">
          {/* Main Editing Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Video Player Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onLoadedMetadata={onLoadedMetadata}
                  controls
                  className="w-full h-full max-h-[420px] object-contain"
                />
              </div>

              {/* Hidden Video Tag specifically for seeking / rendering without interfering with visual preview player */}
              <video
                ref={renderVideoRef}
                src={videoSrc}
                className="hidden"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* File Info */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <i className="fas fa-video text-xs"></i>
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-bold text-slate-800 truncate">{videoFile.name}</span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      {videoWidth} &times; {videoHeight} &bull; {formatTime(videoDuration)} &bull; {formatBytes(videoFile.size)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setVideoFile(null);
                    setVideoSrc('');
                    setGifBlobUrl('');
                  }}
                  className="px-4.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Config parameters column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Timeline Trimming Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-cut mr-2 text-slate-400"></i>
                    Trim Video Timeline
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Selected: {((endTime - startTime) || 0).toFixed(2)}s
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start time */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Start Offset</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={(endTime - 0.1) || 0}
                        step="0.1"
                        value={startTime}
                        onChange={(e) => handleStartTimeChange(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
                      />
                      <button
                        onClick={setStartToCurrent}
                        title="Set start offset to current time"
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors text-xs"
                      >
                        <i className="fas fa-map-pin"></i>
                      </button>
                    </div>
                  </div>

                  {/* End time */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">End Offset</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={(startTime + 0.1) || 0}
                        max={videoDuration || 0}
                        step="0.1"
                        value={endTime}
                        onChange={(e) => handleEndTimeChange(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
                      />
                      <button
                        onClick={setEndToCurrent}
                        title="Set end offset to current time"
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors text-xs"
                      >
                        <i className="fas fa-map-pin"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Range Sliders */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                      <span>Start Time: {formatTime(startTime)}</span>
                      <span>Max: {formatTime(videoDuration)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      step="0.05"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-extrabold">
                      <span>End Time: {formatTime(endTime)}</span>
                      <span>Max: {formatTime(videoDuration)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      step="0.05"
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Framerate & Resolution Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-sliders-h mr-2 text-slate-400"></i>
                    Framerate &amp; Scale Settings
                  </span>
                </div>

                {/* Target Width */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Output Width</label>
                  <div className="flex flex-wrap gap-2">
                    {WIDTH_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setTargetWidth(preset.value)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border active:scale-95 cursor-pointer ${
                          targetWidth === preset.value
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Framerate Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Frame Rate (FPS)</label>
                    <span className="text-xs font-black text-slate-900">{fps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {FPS_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setFps(preset.value)}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                          fps === preset.value
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {preset.value} FPS
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Configurations */}
              <div className="space-y-3.5 bg-slate-50 border border-slate-150 rounded-2xl p-4.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Advanced Settings</div>
                
                {/* Looping options */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Infinite Repeating Loop</span>
                  <label className="flex items-center space-x-2.5 cursor-pointer group">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={infiniteLoop}
                      onClick={() => setInfiniteLoop(!infiniteLoop)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        infiniteLoop ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-500'
                      }`}
                    >
                      {infiniteLoop && <i className="fas fa-check text-[8px] text-white"></i>}
                    </button>
                  </label>
                </div>

                {!infiniteLoop && (
                  <div className="flex items-center justify-between pt-1 animate-fade-in-up">
                    <span className="text-[11px] font-bold text-slate-700">Repeat Count</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))}
                      className="w-20 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                )}

                {/* Output Filename */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">File Output Name</label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="Enter output name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Prediction Warning Alerts */}
              {isHighLoad && (
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex items-start space-x-2.5 animate-fade-in-up">
                  <i className="fas fa-exclamation-triangle text-amber-500 text-xs mt-0.5"></i>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Heavy Load Warning</span>
                    <p className="text-[9px] text-amber-600 font-medium leading-relaxed">
                      This configuration outputs over 250 frames. Encoding might take a few moments and will use high browser memory. Consider lowering the FPS or trimming the duration for faster results.
                    </p>
                  </div>
                </div>
              )}

              {/* Conversion Trigger Button */}
              {!isConverting ? (
                <button
                  type="button"
                  onClick={startConversion}
                  disabled={startTime >= endTime}
                  className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2.5"
                >
                  <i className="fas fa-magic"></i>
                  <span>Convert to GIF</span>
                </button>
              ) : (
                <div className="space-y-3.5">
                  {/* Progress panel */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <span className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping mr-2"></span>
                        Encoding GIF Frame...
                      </span>
                      <span>{progress}%</span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>Frame {currentFrame} / {totalFrames}</span>
                      <span>Processing Locally</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={cancelConversion}
                    className="w-full py-3.5 rounded-2xl bg-white border border-rose-250 text-rose-500 hover:bg-rose-50/50 font-extrabold text-xs tracking-wider uppercase active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Cancel Encoding
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Showcase Block */}
          {gifBlobUrl && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-fade-in-up">
              <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
                <span className="text-white/[0.02] text-[120px] italic font-black tracking-tighter">GIF COMPILER</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center space-y-5 text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 inline-block max-w-full">
                  <img
                    src={gifBlobUrl}
                    alt="Generated GIF Preview"
                    className="max-h-[300px] object-contain rounded-lg max-w-full shadow-2xl block"
                  />
                </div>

                <div className="space-y-1.5">
                  <strong className="block text-base font-black tracking-tight text-white">Conversion Successful!</strong>
                  <span className="block text-xs font-bold text-slate-400">
                    File size: {formatBytes(gifSize)} &bull; Output: {targetWidth === 'original' ? videoWidth : targetWidth}px width &bull; Framerate: {fps} FPS
                  </span>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 rounded-full bg-white text-slate-900 font-extrabold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all duration-300 shadow-lg active:scale-95 flex items-center space-x-2 cursor-pointer"
                  >
                    <i className="fas fa-download text-[11px]"></i>
                    <span>Download GIF</span>
                  </button>
                  <button
                    onClick={() => {
                      setGifBlobUrl('');
                      setGifSize(0);
                    }}
                    className="px-6 py-3 rounded-full bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-white/15 transition-all duration-300 active:scale-95 border border-white/10 cursor-pointer"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
