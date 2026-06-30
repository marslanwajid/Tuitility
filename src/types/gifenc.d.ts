declare module 'gifenc' {
  export type GifPalette = number[][];
  
  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgba4444' | 'rgba8888';
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions
  ): GifPalette;
  
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: GifPalette,
    format?: 'rgb565' | 'rgba4444' | 'rgba8888'
  ): Uint8Array;
  
  export interface WriteFrameOptions {
    delay?: number;
    palette?: GifPalette;
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
    disposal?: number;
  }

  export class GIFEncoder {
    constructor();
    writeFrame(
      index: Uint8Array | Uint8ClampedArray,
      width: number,
      height: number,
      options?: WriteFrameOptions
    ): void;
    finish(): void;
    bytesView(): Uint8Array;
    bytes(): Uint8Array;
  }
}
