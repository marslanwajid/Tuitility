declare module 'omggif' {
  export interface FrameInfo {
    x: number;
    y: number;
    width: number;
    height: number;
    has_local_palette: boolean;
    palette_offset: number | null;
    palette_size: number | null;
    data_offset: number;
    data_length: number;
    transparent_index: number | null;
    interlaced: boolean;
    delay: number; // in hundredths of a second (10ms units)
    disposal: number; // 0: no action, 1: keep, 2: restore to background, 3: restore to previous
  }

  export class GifReader {
    width: number;
    height: number;
    constructor(buf: Uint8Array);
    numFrames(): number;
    loopCount(): number;
    frameInfo(frameNumber: number): FrameInfo;
    decodeAndBlitFrameRGBA(frameNumber: number, pixels: Uint8Array | Uint8ClampedArray): void;
  }

  export interface GifWriterOptions {
    loop?: number;
  }

  export class GifWriter {
    constructor(buf: Uint8Array, width: number, height: number, gopts?: GifWriterOptions);
    addFrame(
      x: number,
      y: number,
      w: number,
      h: number,
      indexedPixels: Uint8Array,
      opts?: {
        palette?: number[] | null;
        delay?: number;
        disposal?: number;
        transparent?: number | null;
      }
    ): number;
    end(): number;
  }
}
