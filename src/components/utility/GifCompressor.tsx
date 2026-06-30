'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { GifReader } from 'omggif';

interface GifFrame {
  pixels: Uint8ClampedArray;
  delay: number;
}

export default function GifCompressor() {
  // File states
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [originalFramesCount, setOriginalFramesCount] = useState<number>(0);
  
  // Decoding & Frames
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [decodedFrames, setDecodedFrames] = useState<GifFrame[]>([]);
  const [decodeProgress, setDecodeProgress] = useState<number>(0);
  
  // Compression Settings
  const [scale, setScale] = useState<number>(80); // 10% to 100%
  const [colors, setColors] = useState<number>(128); // 16 to 256
  const [frameDrop, setFrameDrop] = useState<number>(1); // 1 = Keep all, 2 = keep 1 drop 1 (50%), 3 = keep 1 drop 2 (66%)
  const [deltaOptimize, setDeltaOptimize] = useState<boolean>(true);
  const [deltaTolerance, setDeltaTolerance] = useState<number>(12); // color diff tolerance
  const [dither, setDither] = useState<boolean>(false);
  
  // Processing States
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionTime, setCompressionTime] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  // Decode GIF file using omggif
  const decodeGif = useCallback(async (selectedFile: File) => {
    setIsDecoding(true);
    setDecodeProgress(5);
    setDecodedFrames([]);
    setCompressedUrl('');
    setCompressedSize(0);
    
    // Revoke previous URLs
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    setOriginalUrl(URL.createObjectURL(selectedFile));
    setOriginalSize(selectedFile.size);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const reader = new GifReader(new Uint8Array(arrayBuffer));
      
      const width = reader.width;
      const height = reader.height;
      const numFrames = reader.numFrames();
      
      setOriginalWidth(width);
      setOriginalHeight(height);
      setOriginalFramesCount(numFrames);

      // Compositing offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      let previousCanvasData: ImageData | null = null;
      const framesList: GifFrame[] = [];

      // Yield rendering in chunks to keep UI responsive
      for (let i = 0; i < numFrames; i++) {
        const info = reader.frameInfo(i);

        // Handle disposal of previous frame
        if (i > 0) {
          const prevInfo = reader.frameInfo(i - 1);
          if (prevInfo.disposal === 2) {
            // Restore to background (clear frame bounding box)
            ctx.clearRect(prevInfo.x, prevInfo.y, prevInfo.width, prevInfo.height);
          } else if (prevInfo.disposal === 3 && previousCanvasData) {
            // Restore to previous frame state
            ctx.putImageData(previousCanvasData, 0, 0);
          }
        }

        // Save current canvas state before rendering current frame if current disposal is 3
        if (info.disposal === 3) {
          previousCanvasData = ctx.getImageData(0, 0, width, height);
        }

        // Get visual data
        const currentImageData = ctx.getImageData(0, 0, width, height);
        reader.decodeAndBlitFrameRGBA(i, currentImageData.data);
        ctx.putImageData(currentImageData, 0, 0);

        // Store composited pixel buffer
        const framePixels = new Uint8ClampedArray(currentImageData.data);
        framesList.push({
          pixels: framePixels,
          delay: info.delay * 10, // 10ms units to ms
        });

        // Update progress
        setDecodeProgress(Math.round((i / numFrames) * 90) + 10);

        if (i % 15 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      setDecodedFrames(framesList);
    } catch (err) {
      console.error('Error decoding GIF:', err);
      alert('Failed to parse this GIF. Make sure it is a valid, uncorrupted GIF image.');
      setFile(null);
    } finally {
      setIsDecoding(false);
      setDecodeProgress(0);
    }
  }, [originalUrl, compressedUrl]);

  // Handle file drop/selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      decodeGif(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type === 'image/gif') {
      setFile(selected);
      decodeGif(selected);
    } else {
      alert('Please upload a valid .gif image.');
    }
  };

  // Run Compression
  const handleCompress = async () => {
    if (decodedFrames.length === 0) return;
    setIsCompressing(true);
    setCompressProgress(5);
    
    const startTime = performance.now();

    try {
      // 1. Process Frame Skipping (Frame Rate Reduction)
      const skipFactor = frameDrop; // 1, 2, 3
      const skippedFrames: GifFrame[] = [];
      let accumulatedDelay = 0;

      for (let i = 0; i < decodedFrames.length; i++) {
        accumulatedDelay += decodedFrames[i].delay;
        if (i % skipFactor === 0 || i === decodedFrames.length - 1) {
          skippedFrames.push({
            pixels: decodedFrames[i].pixels,
            delay: Math.max(20, accumulatedDelay), // GIF minimum standard delay is usually 20ms
          });
          accumulatedDelay = 0;
        }
      }

      // 2. Determine scaled dimensions
      const finalWidth = Math.round(originalWidth * (scale / 100));
      const finalHeight = Math.round(originalHeight * (scale / 100));

      // Canvas for scaling frames
      const scaleCanvas = document.createElement('canvas');
      scaleCanvas.width = finalWidth;
      scaleCanvas.height = finalHeight;
      const scaleCtx = scaleCanvas.getContext('2d', { willReadFrequently: true })!;

      // Canvas to draw full-size frame buffer
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalWidth;
      tempCanvas.height = originalHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;

      // Intermediate processed frames
      const processedFrames: GifFrame[] = [];

      for (let i = 0; i < skippedFrames.length; i++) {
        // Draw frame to temp full-size canvas
        const tempImgData = tempCtx.createImageData(originalWidth, originalHeight);
        tempImgData.data.set(skippedFrames[i].pixels);
        tempCtx.putImageData(tempImgData, 0, 0);

        // Clear scaled canvas, then draw scaled
        scaleCtx.clearRect(0, 0, finalWidth, finalHeight);
        scaleCtx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight, 0, 0, finalWidth, finalHeight);

        // Extract scaled frame pixels
        const scaledImgData = scaleCtx.getImageData(0, 0, finalWidth, finalHeight);
        processedFrames.push({
          pixels: new Uint8ClampedArray(scaledImgData.data),
          delay: skippedFrames[i].delay,
        });

        if (i % 20 === 0) {
          setCompressProgress(Math.round((i / skippedFrames.length) * 40) + 10);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // 3. Process Delta/Transparency Optimization
      const optimizedFrames: GifFrame[] = [];
      if (deltaOptimize && processedFrames.length > 1) {
        optimizedFrames.push({ ...processedFrames[0] }); // keep first frame intact

        for (let i = 1; i < processedFrames.length; i++) {
          const currentPixels = new Uint8ClampedArray(processedFrames[i].pixels);
          const prevPixels = processedFrames[i - 1].pixels;
          const len = currentPixels.length;
          const tolerance = deltaTolerance;

          for (let j = 0; j < len; j += 4) {
            const r1 = currentPixels[j];
            const g1 = currentPixels[j + 1];
            const b1 = currentPixels[j + 2];
            const a1 = currentPixels[j + 3];

            const r2 = prevPixels[j];
            const g2 = prevPixels[j + 1];
            const b2 = prevPixels[j + 2];
            const a2 = prevPixels[j + 3];

            // If color matches within tolerance threshold, make it fully transparent
            if (a1 === a2 && Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) <= tolerance) {
              currentPixels[j] = 0;
              currentPixels[j + 1] = 0;
              currentPixels[j + 2] = 0;
              currentPixels[j + 3] = 0;
            }
          }

          optimizedFrames.push({
            pixels: currentPixels,
            delay: processedFrames[i].delay,
          });
        }
      } else {
        optimizedFrames.push(...processedFrames);
      }

      // 4. Encode GIF using gifenc
      const encoder = new GIFEncoder();
      const format = 'rgba8888';

      for (let i = 0; i < optimizedFrames.length; i++) {
        const frameData = optimizedFrames[i].pixels;
        
        // Sample colors and construct optimized palette
        const palette = quantize(frameData, colors, { format });
        const index = applyPalette(frameData, palette, format);

        // Find the transparent color index assigned by applyPalette (where alpha = 0)
        let transparentIndex = 0;
        let hasTransparency = false;
        
        for (let j = 0; j < frameData.length / 4; j++) {
          if (frameData[j * 4 + 3] === 0) {
            transparentIndex = index[j];
            hasTransparency = true;
            break;
          }
        }

        // Encode current frame
        encoder.writeFrame(index, finalWidth, finalHeight, {
          palette,
          delay: optimizedFrames[i].delay,
          disposal: deltaOptimize ? 1 : 2, // 1 = keep (overlay), 2 = restore to bg
          transparent: hasTransparency,
          transparentIndex: hasTransparency ? transparentIndex : undefined,
        });

        if (i % 15 === 0) {
          setCompressProgress(Math.round((i / optimizedFrames.length) * 45) + 50);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      encoder.finish();
      const compressedBytes = encoder.bytesView();
      
      const compressedBlob = new Blob([compressedBytes as any], { type: 'image/gif' });
      
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(URL.createObjectURL(compressedBlob));
      setCompressedSize(compressedBlob.size);
      
      const endTime = performance.now();
      setCompressionTime(Math.round((endTime - startTime) / 100) / 10);
    } catch (err) {
      console.error('Error compressing GIF:', err);
      alert('Failed to compress this GIF. Try adjusting the settings (e.g. increase colors or resolution scale).');
    } finally {
      setIsCompressing(false);
      setCompressProgress(0);
    }
  };

  // Reset tool state
  const handleReset = () => {
    setFile(null);
    setOriginalUrl('');
    setOriginalSize(0);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOriginalFramesCount(0);
    setDecodedFrames([]);
    setCompressedUrl('');
    setCompressedSize(0);
    setScale(80);
    setColors(128);
    setFrameDrop(1);
    setDeltaOptimize(true);
    setDeltaTolerance(12);
  };

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Estimate complexity rating for safety warnings
  const predictedOutputFrames = Math.ceil(originalFramesCount / frameDrop);
  const isHighLoad = predictedOutputFrames > 120;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Guard Alert */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PRIVACY</span>
        </div>
        <i className="fas fa-shield-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All GIF decoding, frame processing, and compression are processed 100% locally inside your browser cache. No files, animated clips, or metadata are ever transmitted or uploaded to any backend server.
          </p>
        </div>
      </div>

      {!file ? (
        /* Dropzone Upload Layout (Matches VideoToGifConverter Uploader) */
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-slate-405 hover:bg-slate-50/50 cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[300px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/gif"
            className="hidden"
          />

          {isDecoding ? (
            /* Loading/Decoding Status */
            <div className="flex flex-col items-center gap-3 px-6 w-full max-w-sm">
              <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mb-1"></div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Decoding GIF Frames...</span>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-[#1a1a1a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${decodeProgress}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-500">{decodeProgress}% complete</span>
            </div>
          ) : (
            /* Standard Upload Message */
            <>
              <div className="w-16 h-16 bg-slate-50 group-hover:scale-105 group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-500 mb-5">
                <i className="fas fa-compress-arrows-alt text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upload GIF</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 max-w-sm">
                Drag and drop your animated GIF here, or click to browse. Supported format: GIF.
              </p>
              <div className="mt-6 flex items-center space-x-1.5 bg-slate-100 text-slate-500 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                <i className="fas fa-bolt text-[9px]"></i>
                <span>Local Compression</span>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Settings & Editing Layout */
        <div className="space-y-6">
          {/* Main Editing Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Previews Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Preview */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center">
                      <i className="fas fa-history mr-1.5 text-slate-400"></i> Original Input
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded">
                      {originalWidth} &times; {originalHeight} px
                    </span>
                  </div>
                  <div className="w-full aspect-square bg-[#0b0c10]/03 rounded-xl border border-slate-150/60 overflow-hidden flex items-center justify-center relative p-2 min-h-[220px]">
                    {originalUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={originalUrl}
                        alt="Original GIF"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    {formatBytes(originalSize)} &bull; {originalFramesCount} frames
                  </span>
                </div>

                {/* Compressed Preview */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center">
                      <i className="fas fa-check-circle mr-1.5 text-slate-400"></i> Compressed Output
                    </span>
                    {compressedUrl && (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {Math.round(originalWidth * (scale / 100))} &times; {Math.round(originalHeight * (scale / 100))} px
                      </span>
                    )}
                  </div>
                  <div className="w-full aspect-square bg-[#0b0c10]/03 rounded-xl border border-slate-150/60 overflow-hidden flex items-center justify-center relative p-2 min-h-[220px]">
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"></div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450">Compressing...</span>
                      </div>
                    ) : compressedUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={compressedUrl}
                        alt="Compressed GIF"
                        className="max-w-full max-h-full object-contain rounded-lg animate-fade-in"
                      />
                    ) : (
                      <div className="text-slate-400 text-center px-4 text-xs font-semibold">
                        <i className="fas fa-image text-3xl opacity-20 mb-2 block"></i>
                        Adjust parameters &amp; compress
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    {compressedSize > 0 ? (
                      `${formatBytes(compressedSize)} (${Math.round(((originalSize - compressedSize) / originalSize) * 100)}% saved)`
                    ) : (
                      'Waiting for compression'
                    )}
                  </span>
                </div>
              </div>

              {/* File Info / Change file action footer */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-550 shrink-0">
                    <i className="fas fa-file-image text-xs"></i>
                  </div>
                  <div className="truncate text-left">
                    <span className="block text-xs font-bold text-slate-800 truncate">{file.name}</span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      {originalWidth} &times; {originalHeight} &bull; {originalFramesCount} frames &bull; {formatBytes(originalSize)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Config Parameters Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Scale Resizer */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-compress mr-2 text-slate-400"></i>
                    Scale Resolution
                  </span>
                  <span className="text-[10px] font-bold text-slate-450">
                    {scale}% ({Math.round(originalWidth * (scale / 100))} &times; {Math.round(originalHeight * (scale / 100))}px)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
              </div>

              {/* 2. Color Palette Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-palette mr-2 text-slate-400"></i>
                    Max Color Palette
                  </span>
                  <span className="text-[10px] font-bold text-slate-450">
                    {colors} Colors
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[256, 128, 64, 32, 16].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColors(c)}
                      className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                        colors === c
                          ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
                          : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Frame Dropping Dropdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-history mr-2 text-slate-400"></i>
                    Frame Dropping
                  </span>
                </div>
                <select
                  value={frameDrop}
                  onChange={(e) => setFrameDrop(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer font-bold"
                >
                  <option value={1}>Keep all frames (Full fidelity)</option>
                  <option value={2}>Drop every 2nd frame (50% smaller)</option>
                  <option value={3}>Drop 2 of 3 frames (66% smaller)</option>
                </select>
              </div>

              {/* 4. Delta-Transparency Switch */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col text-left pr-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Delta Optimization</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-tight">
                      Convert matching pixels between frames to transparent layers
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={deltaOptimize}
                      onChange={(e) => setDeltaOptimize(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a1a1a] peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {deltaOptimize && (
                  <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5 animate-fade-in-up">
                    <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Tolerance Threshold</span>
                      <span className="text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">{deltaTolerance}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="2"
                      value={deltaTolerance}
                      onChange={(e) => setDeltaTolerance(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                    />
                  </div>
                )}
              </div>

              {/* 5. Dithering Switch */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 py-1">
                <div className="flex flex-col text-left pr-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Floyd-Steinberg Dithering</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-tight">
                    Diffuse color banding (tends to increase file size)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dither}
                    onChange={(e) => setDither(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a1a1a] peer-checked:after:bg-white"></div>
                </label>
              </div>

              {/* Memory Usage Warnings */}
              {isHighLoad && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 leading-normal font-semibold flex gap-2 text-left">
                  <i className="fas fa-exclamation-triangle text-xs mt-0.5 text-amber-600"></i>
                  <div>
                    This GIF contains many frames ({originalFramesCount}). Quantization may consume significant memory. 
                    Consider reducing <strong>Scale Resolution</strong> or setting <strong>Frame Dropping</strong> to 50% for faster encoding.
                  </div>
                </div>
              )}

              {/* Action / Progress Buttons */}
              <div className="border-t border-slate-100 pt-4">
                {isCompressing ? (
                  <div className="space-y-2.5">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-[#1a1a1a] h-full rounded-full transition-all duration-300"
                        style={{ width: `${compressProgress}%` }}
                      ></div>
                    </div>
                    <button
                      disabled
                      className="w-full py-3.5 bg-slate-50 border border-slate-150 text-slate-400 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-spinner animate-spin"></i> Compiling ({compressProgress}%)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCompress}
                    className="w-full py-3.5 bg-[#1a1a1a] hover:bg-neutral-800 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <i className="fas fa-compress-arrows-alt group-hover:scale-105 transition-transform"></i> Compress GIF
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          {compressedUrl && !isCompressing && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5.5 space-y-4 animate-fade-in-up relative overflow-hidden text-left">
              {/* Savings Badge */}
              <div className="absolute top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-extrabold select-none">
                {compressedSize < originalSize ? (
                  `Saved ${Math.round(((originalSize - compressedSize) / originalSize) * 100)}%`
                ) : (
                  'Size Increased'
                )}
              </div>

              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5 select-none">
                <i className="fas fa-tachometer-alt text-emerald-600"></i> Metrics &amp; Actions
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Bytes Saved</span>
                  <span className="text-xs font-black text-slate-800">
                    {compressedSize < originalSize ? formatBytes(originalSize - compressedSize) : '0 Bytes'}
                  </span>
                </div>
                <div className="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Encoding Duration</span>
                  <span className="text-xs font-black text-slate-800">{compressionTime} seconds</span>
                </div>
                <div className="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">New Dimensions</span>
                  <span className="text-xs font-black text-slate-800">
                    {Math.round(originalWidth * (scale / 100))} &times; {Math.round(originalHeight * (scale / 100))} px
                  </span>
                </div>
              </div>

              {compressedSize >= originalSize && (
                <div className="bg-amber-50 border border-amber-100/70 rounded-xl p-3 text-[10px] text-amber-800 font-semibold leading-normal">
                  <i className="fas fa-info-circle mr-1 text-amber-600"></i>
                  The compressed size is larger than the original! Try disabling <strong>Dithering</strong>, lowering the <strong>Color Palette</strong> to 64, or setting <strong>Scale Resolution</strong> below 80%.
                </div>
              )}

              <a
                href={compressedUrl}
                download={file.name.replace(/\.gif$/i, '_compressed.gif')}
                className="block w-full py-4 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-extrabold uppercase tracking-widest text-xs rounded-2xl text-center shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <i className="fas fa-download mr-1.5"></i> Download Optimized GIF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
