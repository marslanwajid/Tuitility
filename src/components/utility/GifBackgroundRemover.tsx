'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GIFEncoder, quantize } from 'gifenc';
import { GifReader } from 'omggif';

interface GifFrame {
  pixels: Uint8ClampedArray;
  delay: number;
}

export default function GifBackgroundRemover() {
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

  // Chroma Key Settings (YCbCr space matching)
  const [keyColor, setKeyColor] = useState<string>('#ffffff');
  const [tolerance, setTolerance] = useState<number>(25); // chrominance threshold
  const [softness, setSoftness] = useState<number>(8); // feather edge
  const [outputMode, setOutputMode] = useState<'transparent' | 'solid'>('transparent');
  const [replacementColor, setReplacementColor] = useState<string>('#ff0000');

  // Processing States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [processingTime, setProcessingTime] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImgRef = useRef<HTMLImageElement>(null);

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  // Convert RGB to HEX utility
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' : '' + hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert RGB to YCbCr utility for high-fidelity chroma keying
  const rgbToYCbCr = (r: number, g: number, b: number) => {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    return { y, cb, cr };
  };

  // Decode GIF file using omggif
  const decodeGif = useCallback(async (selectedFile: File) => {
    setIsDecoding(true);
    setDecodeProgress(5);
    setDecodedFrames([]);
    setProcessedUrl('');
    setProcessedSize(0);

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

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

      for (let i = 0; i < numFrames; i++) {
        const info = reader.frameInfo(i);

        // Handle disposal of previous frame
        if (i > 0) {
          const prevInfo = reader.frameInfo(i - 1);
          if (prevInfo.disposal === 2) {
            ctx.clearRect(prevInfo.x, prevInfo.y, prevInfo.width, prevInfo.height);
          } else if (prevInfo.disposal === 3 && previousCanvasData) {
            ctx.putImageData(previousCanvasData, 0, 0);
          }
        }

        if (info.disposal === 3) {
          previousCanvasData = ctx.getImageData(0, 0, width, height);
        }

        const currentImageData = ctx.getImageData(0, 0, width, height);
        reader.decodeAndBlitFrameRGBA(i, currentImageData.data);
        ctx.putImageData(currentImageData, 0, 0);

        const framePixels = new Uint8ClampedArray(currentImageData.data);
        framesList.push({
          pixels: framePixels,
          delay: info.delay * 10, // 10ms units to ms
        });

        // Set default key color to the top-left pixel color on loading the first frame
        if (i === 0 && framePixels.length >= 4) {
          const r = framePixels[0];
          const g = framePixels[1];
          const b = framePixels[2];
          setKeyColor(rgbToHex(r, g, b));
        }

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
  }, [originalUrl, processedUrl]);

  // Handle click on original image to sample color
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = originalImgRef.current;
    if (!img || !img.naturalWidth) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to natural image size
    const naturalX = Math.floor((x / rect.width) * img.naturalWidth);
    const naturalY = Math.floor((y / rect.height) * img.naturalHeight);

    // Draw to temporary canvas to extract color
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(naturalX, naturalY, 1, 1).data;
    setKeyColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
  };

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

  // Run YCbCr chroma key background removal processing loop
  const handleRemoveBackground = async () => {
    if (decodedFrames.length === 0) return;
    setIsProcessing(true);
    setProcessProgress(5);

    const startTime = performance.now();

    // Parse target key color coordinates
    const kr = parseInt(keyColor.slice(1, 3), 16);
    const kg = parseInt(keyColor.slice(3, 5), 16);
    const kb = parseInt(keyColor.slice(5, 7), 16);
    const keyYCbCr = rgbToYCbCr(kr, kg, kb);

    // Parse replacement color coordinates
    const repR = parseInt(replacementColor.slice(1, 3), 16);
    const repG = parseInt(replacementColor.slice(3, 5), 16);
    const repB = parseInt(replacementColor.slice(5, 7), 16);

    try {
      const processedFrames: GifFrame[] = [];

      for (let i = 0; i < decodedFrames.length; i++) {
        const currentPixels = new Uint8ClampedArray(decodedFrames[i].pixels);
        const len = currentPixels.length;

        for (let j = 0; j < len; j += 4) {
          const r = currentPixels[j];
          const g = currentPixels[j + 1];
          const b = currentPixels[j + 2];
          const a = currentPixels[j + 3];

          // If the pixel is already transparent and we want a solid color replacement, paint it
          if (a === 0) {
            if (outputMode === 'solid') {
              currentPixels[j] = repR;
              currentPixels[j + 1] = repG;
              currentPixels[j + 2] = repB;
              currentPixels[j + 3] = 255;
            }
            continue;
          }

          // Calculate YCbCr distance
          const pixelYCbCr = rgbToYCbCr(r, g, b);
          const cbDiff = pixelYCbCr.cb - keyYCbCr.cb;
          const crDiff = pixelYCbCr.cr - keyYCbCr.cr;
          const chrominanceDist = Math.sqrt(cbDiff * cbDiff + crDiff * crDiff);

          if (chrominanceDist <= tolerance) {
            // Mask background color completely
            if (outputMode === 'transparent') {
              currentPixels[j] = 0;
              currentPixels[j + 1] = 0;
              currentPixels[j + 2] = 0;
              currentPixels[j + 3] = 0;
            } else {
              currentPixels[j] = repR;
              currentPixels[j + 1] = repG;
              currentPixels[j + 2] = repB;
              currentPixels[j + 3] = 255;
            }
          } else if (chrominanceDist <= tolerance + softness && softness > 0) {
            // Edge feathering transition zone
            const factor = (chrominanceDist - tolerance) / softness; // 0 to 1
            if (outputMode === 'transparent') {
              currentPixels[j + 3] = Math.round(a * factor);
            } else {
              currentPixels[j] = Math.round(r * factor + repR * (1 - factor));
              currentPixels[j + 1] = Math.round(g * factor + repG * (1 - factor));
              currentPixels[j + 2] = Math.round(b * factor + repB * (1 - factor));
            }
          }
        }

        processedFrames.push({
          pixels: currentPixels,
          delay: decodedFrames[i].delay,
        });

        if (i % 20 === 0) {
          setProcessProgress(Math.round((i / decodedFrames.length) * 45) + 10);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // Encode output GIF using gifenc with a robust transparent index mapping
      const encoder = new GIFEncoder();
      const format = 'rgba8888';

      for (let i = 0; i < processedFrames.length; i++) {
        const frameData = processedFrames[i].pixels;
        
        // 1. Gather all non-transparent pixels
        const visiblePixels = [];
        for (let j = 0; j < frameData.length; j += 4) {
          if (frameData[j + 3] > 0) {
            visiblePixels.push(frameData[j], frameData[j + 1], frameData[j + 2], frameData[j + 3]);
          }
        }

        // 2. Quantize only the visible colors (saving index 0 for transparency)
        let framePalette: number[][];
        if (visiblePixels.length > 0) {
          framePalette = quantize(new Uint8Array(visiblePixels), 255, { format });
        } else {
          framePalette = [[0, 0, 0]];
        }

        // 3. Prepend transparency color [0, 0, 0] to the palette at index 0
        const finalPalette = [[0, 0, 0], ...framePalette];
        
        // 4. Map frame pixels manually to ensure exact mapping and avoid gifenc transparency leaks
        const numPixels = frameData.length / 4;
        const indexMap = new Uint8Array(numPixels);
        let hasTransparency = false;

        for (let j = 0; j < numPixels; j++) {
          const r = frameData[j * 4];
          const g = frameData[j * 4 + 1];
          const b = frameData[j * 4 + 2];
          const a = frameData[j * 4 + 3];

          if (a === 0) {
            indexMap[j] = 0; // transparent index
            hasTransparency = true;
          } else {
            // Find closest color in palette starting at index 1
            let minDistance = Infinity;
            let closestIndex = 1;
            
            for (let p = 1; p < finalPalette.length; p++) {
              const pr = finalPalette[p][0];
              const pg = finalPalette[p][1];
              const pb = finalPalette[p][2];
              
              const distSq = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
              if (distSq < minDistance) {
                minDistance = distSq;
                closestIndex = p;
              }
            }
            indexMap[j] = closestIndex;
          }
        }

        // Encode current frame with index 0 designated as transparency
        encoder.writeFrame(indexMap, originalWidth, originalHeight, {
          palette: finalPalette,
          delay: processedFrames[i].delay,
          disposal: 2, // disposal 2 clears background, crucial to prevent trail ghosting on transparent outputs!
          transparent: hasTransparency,
          transparentIndex: hasTransparency ? 0 : undefined,
        });

        if (i % 15 === 0) {
          setProcessProgress(Math.round((i / processedFrames.length) * 40) + 55);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      encoder.finish();
      const compressedBytes = encoder.bytesView();
      const compressedBlob = new Blob([compressedBytes as any], { type: 'image/gif' });

      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedUrl(URL.createObjectURL(compressedBlob));
      setProcessedSize(compressedBlob.size);

      const endTime = performance.now();
      setProcessingTime(Math.round((endTime - startTime) / 100) / 10);
    } catch (err) {
      console.error('Error removing background:', err);
      alert('Failed to process image. Adjust your tolerance values and try again.');
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl('');
    setOriginalSize(0);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOriginalFramesCount(0);
    setDecodedFrames([]);
    setProcessedUrl('');
    setProcessedSize(0);
    setKeyColor('#ffffff');
    setTolerance(25);
    setSoftness(8);
    setOutputMode('transparent');
    setReplacementColor('#ff0000');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isHighLoad = originalFramesCount > 120;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Banner */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PRIVACY</span>
        </div>
        <i className="fas fa-shield-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All GIF frame parsing and background removal are processed 100% locally inside your browser cache. No images, animated clips, or metadata are ever transmitted or uploaded to any backend server.
          </p>
        </div>
      </div>

      {!file ? (
        /* File Drag/Drop Layout */
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
            /* Decoding Spinner */
            <div className="flex flex-col items-center gap-3 px-6 w-full max-w-sm">
              <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mb-1"></div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Parsing GIF Frames...</span>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-[#1a1a1a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${decodeProgress}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-500">{decodeProgress}% complete</span>
            </div>
          ) : (
            /* Upload Prompts */
            <>
              <div className="w-16 h-16 bg-slate-50 group-hover:scale-105 group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-500 mb-5">
                <i className="fas fa-eraser text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upload GIF</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 max-w-sm">
                Drag and drop your animated GIF here, or click to browse. Supported format: GIF.
              </p>
              <div className="mt-6 flex items-center space-x-1.5 bg-slate-100 text-slate-500 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                <i className="fas fa-bolt text-[9px]"></i>
                <span>Local Background Removal</span>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Workspace Controls */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Visual Previews Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Preview with click-to-pick capability */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center">
                      <i className="fas fa-eye mr-1.5 text-slate-400"></i> Original (Click to Pick Color)
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded">
                      {originalWidth} &times; {originalHeight} px
                    </span>
                  </div>
                  {/* Grid pattern background wrapper to inspect transparent source gifs if any */}
                  <div className="w-full aspect-square bg-[#0b0c10]/03 rounded-xl border border-slate-150/60 overflow-hidden flex items-center justify-center relative p-2 min-h-[220px]">
                    {originalUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        ref={originalImgRef}
                        src={originalUrl}
                        alt="Original GIF"
                        onClick={handleImageClick}
                        className="max-w-full max-h-full object-contain rounded-lg cursor-crosshair hover:opacity-90 active:scale-99 transition-all"
                        title="Click on the background of the image to pick its color!"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    {formatBytes(originalSize)} &bull; {originalFramesCount} frames
                  </span>
                </div>

                {/* Processed/Masked Preview */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center">
                      <i className="fas fa-magic mr-1.5 text-slate-400"></i> Output Preview
                    </span>
                    {processedUrl && (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {outputMode === 'transparent' ? 'Transparent' : 'Background Swapped'}
                      </span>
                    )}
                  </div>
                  {/* Checkered Grid background to inspect transparency */}
                  <div 
                    className="w-full aspect-square rounded-xl border border-slate-150/60 overflow-hidden flex items-center justify-center relative p-2 min-h-[220px]"
                    style={{
                      backgroundImage: outputMode === 'transparent' ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)' : 'none',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      backgroundColor: outputMode === 'transparent' ? '#ffffff' : '#f8fafc'
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"></div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-450">Processing...</span>
                      </div>
                    ) : processedUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={processedUrl}
                        alt="Background Removed GIF"
                        className="max-w-full max-h-full object-contain rounded-lg animate-fade-in"
                      />
                    ) : (
                      <div className="text-slate-400 text-center px-4 text-xs font-semibold">
                        <i className="fas fa-wand-magic-sparkles text-3xl opacity-20 mb-2 block"></i>
                        Pick a color &amp; click Remove Background
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    {processedSize > 0 ? (
                      `${formatBytes(processedSize)} (${Math.round(((originalSize - processedSize) / originalSize) * 100)}% size diff)`
                    ) : (
                      'Waiting for process'
                    )}
                  </span>
                </div>
              </div>

              {/* Reset Uploader Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-550 shrink-0">
                    <i className="fas fa-file-image text-xs"></i>
                  </div>
                  <div className="truncate text-left">
                    <span className="block text-xs font-bold text-slate-800 truncate">{file.name}</span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                      {originalWidth} &times; {originalHeight} px &bull; {originalFramesCount} frames
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

            {/* Config controls column */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Target key color picking */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-eyedropper mr-2 text-slate-400"></i>
                    Background Color to Remove
                  </span>
                  <span className="text-[10px] font-bold text-slate-450 uppercase">{keyColor}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={keyColor}
                    onChange={(e) => setKeyColor(e.target.value)}
                    className="w-12 h-10 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer p-0.5 transition-all focus:outline-none"
                  />
                  <input
                    type="text"
                    value={keyColor}
                    onChange={(e) => setKeyColor(e.target.value)}
                    placeholder="#ffffff"
                    maxLength={7}
                    className="flex-1 bg-white border border-slate-250 rounded-xl px-3.5 py-2 text-xs text-slate-850 font-bold uppercase tracking-wider focus:outline-none focus:border-slate-400"
                  />
                </div>
                <p className="text-[10px] text-slate-550 leading-normal font-semibold italic">
                  Tip: You can also click directly on the left original image preview to sample its color!
                </p>
              </div>

              {/* 2. Tolerance Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-sliders-h mr-2 text-slate-400"></i>
                    Color Tolerance (YCbCr Match)
                  </span>
                  <span className="text-[10px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded">
                    {tolerance}
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="90"
                  step="1"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
                <p className="text-[9px] text-slate-500 font-semibold leading-normal">
                  Adjust tolerance to match backgrounds. High-fidelity chrominance comparison isolates shadows and highlights.
                </p>
              </div>

              {/* 3. Softness Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-circle-notch mr-2 text-slate-400"></i>
                    Edge Softness (Feathering)
                  </span>
                  <span className="text-[10px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded">
                    {softness}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={softness}
                  onChange={(e) => setSoftness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1a1a1a]"
                />
                <p className="text-[9px] text-slate-500 font-semibold leading-normal">
                  Feathers edges to make the mask blend smoothly instead of leaving pixelated borders.
                </p>
              </div>

              {/* 4. Output Mode */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                    <i className="fas fa-brush mr-2 text-slate-400"></i>
                    Replacement Background
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOutputMode('transparent')}
                    className={`py-2.5 border rounded-xl text-xs font-bold transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-1.5 ${
                      outputMode === 'transparent'
                        ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
                    }`}
                  >
                    <i className="fas fa-border-none text-[10px]"></i> Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputMode('solid')}
                    className={`py-2.5 border rounded-xl text-xs font-bold transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-1.5 ${
                      outputMode === 'solid'
                        ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
                    }`}
                  >
                    <i className="fas fa-fill-drip text-[10px]"></i> Solid Color
                  </button>
                </div>

                {outputMode === 'solid' && (
                  <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-3 rounded-xl animate-fade-in-up">
                    <input
                      type="color"
                      value={replacementColor}
                      onChange={(e) => setReplacementColor(e.target.value)}
                      className="w-10 h-8 bg-white border border-slate-200 cursor-pointer p-0.5 rounded-lg focus:outline-none"
                    />
                    <input
                      type="text"
                      value={replacementColor}
                      onChange={(e) => setReplacementColor(e.target.value)}
                      placeholder="#ff0000"
                      maxLength={7}
                      className="flex-1 bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold uppercase focus:outline-none focus:border-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Memory High-load warning */}
              {isHighLoad && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 leading-normal font-semibold flex gap-2 text-left animate-fade-in-up">
                  <i className="fas fa-exclamation-triangle text-xs mt-0.5 text-amber-600"></i>
                  <div>
                    This GIF contains many frames ({originalFramesCount}). Quantization may consume significant memory. 
                    Be patient during rendering.
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="border-t border-slate-100 pt-4">
                {isProcessing ? (
                  <div className="space-y-2.5">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-[#1a1a1a] h-full rounded-full transition-all duration-300"
                        style={{ width: `${processProgress}%` }}
                      ></div>
                    </div>
                    <button
                      disabled
                      className="w-full py-3.5 bg-slate-50 border border-slate-150 text-slate-400 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-spinner animate-spin"></i> Rendering ({processProgress}%)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRemoveBackground}
                    className="w-full py-3.5 bg-[#1a1a1a] hover:bg-neutral-800 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <i className="fas fa-wand-magic-sparkles group-hover:scale-105 transition-transform"></i> Remove Background
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          {processedUrl && !isProcessing && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5.5 space-y-4 animate-fade-in-up relative overflow-hidden text-left">
              <div className="absolute top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-extrabold select-none">
                Background Removed
              </div>

              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 flex items-center gap-1.5 select-none">
                <i className="fas fa-tachometer-alt text-emerald-600"></i> Metrics &amp; Actions
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Original Size</span>
                  <span className="text-xs font-black text-slate-800">{formatBytes(originalSize)}</span>
                </div>
                <div className="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col gap-0.5">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Compressed Size</span>
                  <span className="text-xs font-black text-slate-800">{formatBytes(processedSize)}</span>
                </div>
                <div className="bg-white border border-emerald-100/50 rounded-xl p-3 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Elapsed Time</span>
                  <span className="text-xs font-black text-slate-800">{processingTime} seconds</span>
                </div>
              </div>

              {processedSize > originalSize && (
                <div className="bg-amber-50 border border-amber-100/70 rounded-xl p-3 text-[10px] text-amber-800 font-semibold leading-normal">
                  <i className="fas fa-info-circle mr-1 text-amber-600"></i>
                  The background-removed GIF size is slightly larger than the original due to transparency encoding parameters. 
                  You can reduce its file size by running it through our [GIF Compressor](/utility-tools/image-tools/gif-compressor).
                </div>
              )}

              <a
                href={processedUrl}
                download={file.name.replace(/\.gif$/i, '_transparent.gif')}
                className="block w-full py-4 bg-[#1a1a1a] hover:bg-neutral-800 text-white font-extrabold uppercase tracking-widest text-xs rounded-2xl text-center shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <i className="fas fa-download mr-1.5"></i> Download Reconstructed GIF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
