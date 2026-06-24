interface Mp3Encoder {
  new (channels: number, samplerate: number, kbps: number): {
    encodeBuffer: (left: Int16Array, right?: Int16Array) => Int8Array;
    flush: () => Int8Array;
  };
}

let lamejsMp3Encoder: Mp3Encoder | null = null;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const buffer = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return buffer;
}

function interleaveChannels(left: Float32Array, right: Float32Array): Float32Array {
  const length = left.length + right.length;
  const result = new Float32Array(length);
  let idx = 0;
  for (let i = 0; i < left.length; i++) {
    result[idx++] = left[i];
    result[idx++] = right[i];
  }
  return result;
}

export function buildWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  let samples: Float32Array;
  if (numChannels === 2) {
    samples = interleaveChannels(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
  } else {
    samples = audioBuffer.getChannelData(0);
  }
  const pcm = floatTo16BitPCM(samples);
  const dataSize = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const w = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  w(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  w(36, 'data');
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
  return new Blob([buffer], { type: 'audio/wav' });
}

function buildMp3BlobInner(audioBuffer: AudioBuffer, bitrate: number): Blob | null {
  if (!lamejsMp3Encoder) return null;
  const channels: Float32Array[] = [];
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) channels.push(audioBuffer.getChannelData(i));
  const encoder = new lamejsMp3Encoder(channels.length, audioBuffer.sampleRate, bitrate);
  const left16 = floatTo16BitPCM(channels[0]);
  const right16 = channels.length > 1 ? floatTo16BitPCM(channels[1]) : undefined;
  const blockSize = 1152;
  const mp3Data: Int8Array[] = [];
  for (let i = 0; i < left16.length; i += blockSize) {
    const buf = encoder.encodeBuffer(left16.subarray(i, i + blockSize), right16?.subarray(i, i + blockSize));
    if (buf.length > 0) mp3Data.push(buf);
  }
  const flushBuf = encoder.flush();
  if (flushBuf.length > 0) mp3Data.push(flushBuf);
  return new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
}

export async function processAudioFile(
  file: File,
  format: 'wav' | 'mp3',
  quality: number,
  onProgress: (p: number) => void,
): Promise<Blob | null> {
  try {
    onProgress(10);
    const ab = await file.arrayBuffer();
    onProgress(25);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuf = await ctx.decodeAudioData(ab);
    onProgress(50);
    if (format === 'mp3') {
      if (!lamejsMp3Encoder) {
        const mod = await import('lamejs');
        lamejsMp3Encoder = mod.Mp3Encoder;
      }
      onProgress(60);
      const blob = buildMp3BlobInner(audioBuf, quality);
      onProgress(100);
      return blob;
    }
    const blob = buildWavBlob(audioBuf);
    onProgress(100);
    return blob;
  } catch {
    return null;
  }
}

export const QUALITY_PRESETS = [
  { label: 'Low (128 kbps)', value: 128 },
  { label: 'Standard (192 kbps)', value: 192 },
  { label: 'High (256 kbps)', value: 256 },
  { label: 'Very High (320 kbps)', value: 320 },
];
