'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PantoneColor {
  code: string;
  hex: string;
  name: string;
}

interface MatchResult {
  closest: PantoneColor;
  alternatives: { pantone: PantoneColor; distance: number }[];
  accuracy: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const PANTONE_COLORS: PantoneColor[] = [
  { code: "PMS 100", hex: "#F4ED7C", name: "Pantone 100" }, { code: "PMS 101", hex: "#F4ED47", name: "Pantone 101" }, { code: "PMS 102", hex: "#F9E814", name: "Pantone 102" }, { code: "PMS 103", hex: "#C6AD0F", name: "Pantone 103" }, { code: "PMS 104", hex: "#AD9B0C", name: "Pantone 104" }, { code: "PMS 105", hex: "#82750F", name: "Pantone 105" }, { code: "PMS 106", hex: "#F7E859", name: "Pantone 106" }, { code: "PMS 107", hex: "#F9E526", name: "Pantone 107" }, { code: "PMS 108", hex: "#FEDB00", name: "Pantone 108" }, { code: "PMS 109", hex: "#FFCC00", name: "Pantone 109" }, { code: "PMS 110", hex: "#D9A514", name: "Pantone 110" }, { code: "PMS 111", hex: "#AA8A00", name: "Pantone 111" }, { code: "PMS 112", hex: "#99780A", name: "Pantone 112" }, { code: "PMS 113", hex: "#F9E667", name: "Pantone 113" }, { code: "PMS 114", hex: "#FADE2A", name: "Pantone 114" }, { code: "PMS 115", hex: "#FBDA12", name: "Pantone 115" }, { code: "PMS 116", hex: "#FFCC00", name: "Pantone 116" }, { code: "PMS 117", hex: "#C69214", name: "Pantone 117" }, { code: "PMS 118", hex: "#A07A00", name: "Pantone 118" }, { code: "PMS 119", hex: "#7A5C00", name: "Pantone 119" }, { code: "PMS 120", hex: "#F2E68C", name: "Pantone 120" }, { code: "PMS 121", hex: "#F2E14F", name: "Pantone 121" }, { code: "PMS 122", hex: "#F2DB1B", name: "Pantone 122" }, { code: "PMS 123", hex: "#FFC70A", name: "Pantone 123" }, { code: "PMS 124", hex: "#E0AA0F", name: "Pantone 124" }, { code: "PMS 125", hex: "#B58500", name: "Pantone 125" }, { code: "PMS 126", hex: "#8C6600", name: "Pantone 126" }, { code: "PMS 127", hex: "#E8DD7C", name: "Pantone 127" }, { code: "PMS 128", hex: "#E3D140", name: "Pantone 128" }, { code: "PMS 129", hex: "#DBBD12", name: "Pantone 129" }, { code: "PMS 130", hex: "#F2A900", name: "Pantone 130" }, { code: "PMS 131", hex: "#CC8A00", name: "Pantone 131" }, { code: "PMS 132", hex: "#996600", name: "Pantone 132" }, { code: "PMS 133", hex: "#664700", name: "Pantone 133" }, { code: "PMS 134", hex: "#F2D857", name: "Pantone 134" }, { code: "PMS 135", hex: "#F2CA26", name: "Pantone 135" }, { code: "PMS 136", hex: "#F2BC1B", name: "Pantone 136" }, { code: "PMS 137", hex: "#FFA300", name: "Pantone 137" }, { code: "PMS 138", hex: "#D78100", name: "Pantone 138" }, { code: "PMS 139", hex: "#A36100", name: "Pantone 139" }, { code: "PMS 140", hex: "#754700", name: "Pantone 140" }, { code: "PMS 141", hex: "#E8D67A", name: "Pantone 141" }, { code: "PMS 142", hex: "#E0C14F", name: "Pantone 142" }, { code: "PMS 143", hex: "#E0B01E", name: "Pantone 143" }, { code: "PMS 144", hex: "#ED8B00", name: "Pantone 144" }, { code: "PMS 145", hex: "#C67600", name: "Pantone 145" }, { code: "PMS 146", hex: "#9E5C00", name: "Pantone 146" }, { code: "PMS 147", hex: "#6B4000", name: "Pantone 147" }, { code: "PMS 148", hex: "#F2CE68", name: "Pantone 148" }, { code: "PMS 149", hex: "#F2BF49", name: "Pantone 149" }, { code: "PMS 150", hex: "#EDAA1F", name: "Pantone 150" }, { code: "PMS 151", hex: "#FF7F00", name: "Pantone 151" }, { code: "PMS 152", hex: "#D16700", name: "Pantone 152" }, { code: "PMS 153", hex: "#A35200", name: "Pantone 153" }, { code: "PMS 154", hex: "#703800", name: "Pantone 154" }, { code: "PMS 155", hex: "#E8D19A", name: "Pantone 155" }, { code: "PMS 156", hex: "#E0BF73", name: "Pantone 156" }, { code: "PMS 157", hex: "#D6A642", name: "Pantone 157" }, { code: "PMS 158", hex: "#FF6B00", name: "Pantone 158" }, { code: "PMS 159", hex: "#D15C00", name: "Pantone 159" }, { code: "PMS 160", hex: "#A34700", name: "Pantone 160" }, { code: "PMS 161", hex: "#6B3300", name: "Pantone 161" }, { code: "PMS 1767", hex: "#FFB2C9", name: "Pantone 1767" }, { code: "PMS 1777", hex: "#FF6687", name: "Pantone 1777" }, { code: "PMS 1787", hex: "#FF3D5A", name: "Pantone 1787" }, { code: "PMS 1797", hex: "#D81A36", name: "Pantone 1797" }, { code: "PMS 1807", hex: "#A81A2D", name: "Pantone 1807" }, { code: "PMS 1817", hex: "#5C1F1A", name: "Pantone 1817" }, { code: "PMS 185", hex: "#E4002B", name: "Pantone 185" }, { code: "PMS 186", hex: "#D0021B", name: "Pantone 186" }, { code: "PMS 187", hex: "#A6192E", name: "Pantone 187" }, { code: "PMS 188", hex: "#76232F", name: "Pantone 188" }, { code: "PMS 189", hex: "#FF6699", name: "Pantone 189" }, { code: "PMS 190", hex: "#FF3980", name: "Pantone 190" }, { code: "PMS 191", hex: "#FA0068", name: "Pantone 191" }, { code: "PMS 192", hex: "#DD0A5E", name: "Pantone 192" }, { code: "PMS 193", hex: "#BF0D3E", name: "Pantone 193" }, { code: "PMS 194", hex: "#9B0A34", name: "Pantone 194" }, { code: "PMS 195", hex: "#6D0F29", name: "Pantone 195" }, { code: "PMS 196", hex: "#F2A5BD", name: "Pantone 196" }, { code: "PMS 197", hex: "#ED6B9E", name: "Pantone 197" }, { code: "PMS 198", hex: "#E63F8A", name: "Pantone 198" }, { code: "PMS 199", hex: "#D60270", name: "Pantone 199" }, { code: "PMS 200", hex: "#BA0C65", name: "Pantone 200" }, { code: "PMS 201", hex: "#9E1068", name: "Pantone 201" }, { code: "PMS 202", hex: "#7C1855", name: "Pantone 202" }, { code: "PMS 203", hex: "#F2A5C8", name: "Pantone 203" }, { code: "PMS 204", hex: "#ED6BA5", name: "Pantone 204" }, { code: "PMS 205", hex: "#E6308C", name: "Pantone 205" }, { code: "PMS 206", hex: "#D60270", name: "Pantone 206" }, { code: "PMS 207", hex: "#AD005B", name: "Pantone 207" }, { code: "PMS 208", hex: "#8C004C", name: "Pantone 208" }, { code: "PMS 209", hex: "#70193D", name: "Pantone 209" }, { code: "PMS 210", hex: "#F2AACF", name: "Pantone 210" }, { code: "PMS 211", hex: "#ED7DB8", name: "Pantone 211" }, { code: "PMS 212", hex: "#E64AA1", name: "Pantone 212" }, { code: "PMS 213", hex: "#D60087", name: "Pantone 213" }, { code: "PMS 214", hex: "#AD0075", name: "Pantone 214" }, { code: "PMS 215", hex: "#8C0063", name: "Pantone 215" }, { code: "PMS 216", hex: "#701F4F", name: "Pantone 216" }, { code: "PMS 217", hex: "#EDADD6", name: "Pantone 217" }, { code: "PMS 218", hex: "#E680BF", name: "Pantone 218" }, { code: "PMS 219", hex: "#D6008C", name: "Pantone 219" }, { code: "PMS 220", hex: "#AD0075", name: "Pantone 220" }, { code: "PMS 221", hex: "#8C0063", name: "Pantone 221" }, { code: "PMS 222", hex: "#701F4F", name: "Pantone 222" }, { code: "PMS 223", hex: "#F2AAD2", name: "Pantone 223" }, { code: "PMS 224", hex: "#ED7DC0", name: "Pantone 224" }, { code: "PMS 225", hex: "#E64AA8", name: "Pantone 225" }, { code: "PMS 226", hex: "#D60090", name: "Pantone 226" }, { code: "PMS 227", hex: "#AD0075", name: "Pantone 227" }, { code: "PMS 228", hex: "#8C0063", name: "Pantone 228" }, { code: "PMS 229", hex: "#701F4F", name: "Pantone 229" }, { code: "PMS 230", hex: "#F2AAD2", name: "Pantone 230" }, { code: "PMS 231", hex: "#ED7DC0", name: "Pantone 231" }, { code: "PMS 232", hex: "#E64AA8", name: "Pantone 232" }, { code: "PMS 233", hex: "#D60090", name: "Pantone 233" }, { code: "PMS 234", hex: "#AD0075", name: "Pantone 234" }, { code: "PMS 235", hex: "#8C0063", name: "Pantone 235" }, { code: "PMS 236", hex: "#F2AAD2", name: "Pantone 236" }, { code: "PMS 237", hex: "#ED7DC0", name: "Pantone 237" }, { code: "PMS 238", hex: "#E64AA8", name: "Pantone 238" }, { code: "PMS 239", hex: "#D60090", name: "Pantone 239" }, { code: "PMS 240", hex: "#AD0075", name: "Pantone 240" }, { code: "PMS 241", hex: "#8C0063", name: "Pantone 241" }, { code: "PMS 242", hex: "#701F4F", name: "Pantone 242" }, { code: "PMS 243", hex: "#F2AAD2", name: "Pantone 243" }, { code: "PMS 244", hex: "#ED7DC0", name: "Pantone 244" }, { code: "PMS 245", hex: "#E64AA8", name: "Pantone 245" }, { code: "PMS 246", hex: "#D60090", name: "Pantone 246" }, { code: "PMS 247", hex: "#AD0075", name: "Pantone 247" }, { code: "PMS 248", hex: "#8C0063", name: "Pantone 248" }, { code: "PMS 249", hex: "#701F4F", name: "Pantone 249" }, { code: "PMS 250", hex: "#F2AAD2", name: "Pantone 250" }, { code: "PMS 251", hex: "#ED7DC0", name: "Pantone 251" }, { code: "PMS 252", hex: "#E64AA8", name: "Pantone 252" }, { code: "PMS 253", hex: "#D60090", name: "Pantone 253" }, { code: "PMS 254", hex: "#AD0075", name: "Pantone 254" }, { code: "PMS 255", hex: "#8C0063", name: "Pantone 255" }, { code: "PMS 256", hex: "#F2AAD2", name: "Pantone 256" }, { code: "PMS 257", hex: "#ED7DC0", name: "Pantone 257" }, { code: "PMS 258", hex: "#E64AA8", name: "Pantone 258" }, { code: "PMS 259", hex: "#D60090", name: "Pantone 259" }, { code: "PMS 260", hex: "#AD0075", name: "Pantone 260" }, { code: "PMS 261", hex: "#8C0063", name: "Pantone 261" }, { code: "PMS 262", hex: "#701F4F", name: "Pantone 262" }, { code: "PMS 263", hex: "#E6D1E6", name: "Pantone 263" }, { code: "PMS 264", hex: "#D1AADB", name: "Pantone 264" }, { code: "PMS 265", hex: "#AA7DC8", name: "Pantone 265" }, { code: "PMS 266", hex: "#8C4AA8", name: "Pantone 266" }, { code: "PMS 267", hex: "#6B2E8C", name: "Pantone 267" }, { code: "PMS 268", hex: "#5C2D7D", name: "Pantone 268" }, { code: "PMS 269", hex: "#4F2D63", name: "Pantone 269" }, { code: "PMS 270", hex: "#D1C0DB", name: "Pantone 270" }, { code: "PMS 271", hex: "#BFA3D1", name: "Pantone 271" }, { code: "PMS 272", hex: "#A382C1", name: "Pantone 272" }, { code: "PMS 273", hex: "#5C2D91", name: "Pantone 273" }, { code: "PMS 274", hex: "#4F2D7F", name: "Pantone 274" }, { code: "PMS 275", hex: "#472D7F", name: "Pantone 275" }, { code: "PMS 276", hex: "#33246B", name: "Pantone 276" }, { code: "PMS 277", hex: "#B8CCE6", name: "Pantone 277" }, { code: "PMS 278", hex: "#99B3DB", name: "Pantone 278" }, { code: "PMS 279", hex: "#6689CC", name: "Pantone 279" }, { code: "PMS 280", hex: "#003087", name: "Pantone 280" }, { code: "PMS 281", hex: "#00246B", name: "Pantone 281" }, { code: "PMS 282", hex: "#001A5B", name: "Pantone 282" }, { code: "PMS 283", hex: "#A5C1E5", name: "Pantone 283" }, { code: "PMS 284", hex: "#7DA7D9", name: "Pantone 284" }, { code: "PMS 285", hex: "#5084CC", name: "Pantone 285" }, { code: "PMS 286", hex: "#0047BB", name: "Pantone 286" }, { code: "PMS 287", hex: "#003087", name: "Pantone 287" }, { code: "PMS 288", hex: "#00246B", name: "Pantone 288" }, { code: "PMS 289", hex: "#001E5B", name: "Pantone 289" }, { code: "PMS 290", hex: "#C6D6E6", name: "Pantone 290" }, { code: "PMS 291", hex: "#A5C1E5", name: "Pantone 291" }, { code: "PMS 292", hex: "#7DA7D9", name: "Pantone 292" }, { code: "PMS 293", hex: "#0047BB", name: "Pantone 293" }, { code: "PMS 294", hex: "#003087", name: "Pantone 294" }, { code: "PMS 295", hex: "#00246B", name: "Pantone 295" }, { code: "PMS 296", hex: "#001E5B", name: "Pantone 296" }, { code: "PMS 297", hex: "#82C6E6", name: "Pantone 297" }, { code: "PMS 298", hex: "#4DAAE6", name: "Pantone 298" }, { code: "PMS 299", hex: "#0072CE", name: "Pantone 299" }, { code: "PMS 300", hex: "#005BBF", name: "Pantone 300" }, { code: "PMS 301", hex: "#00539B", name: "Pantone 301" }, { code: "PMS 302", hex: "#004876", name: "Pantone 302" }, { code: "PMS 303", hex: "#003D5B", name: "Pantone 303" }, { code: "PMS 304", hex: "#A5D6E6", name: "Pantone 304" }, { code: "PMS 305", hex: "#6BC1E6", name: "Pantone 305" }, { code: "PMS 306", hex: "#00A3DD", name: "Pantone 306" }, { code: "PMS 307", hex: "#0072B5", name: "Pantone 307" }, { code: "PMS 308", hex: "#00598C", name: "Pantone 308" }, { code: "PMS 309", hex: "#003D5B", name: "Pantone 309" }, { code: "PMS 310", hex: "#7FD6E6", name: "Pantone 310" }, { code: "PMS 311", hex: "#33C1E6", name: "Pantone 311" }, { code: "PMS 312", hex: "#00A3DD", name: "Pantone 312" }, { code: "PMS 313", hex: "#0093C9", name: "Pantone 313" }, { code: "PMS 314", hex: "#0082B5", name: "Pantone 314" }, { code: "PMS 315", hex: "#00729B", name: "Pantone 315" }, { code: "PMS 316", hex: "#00537A", name: "Pantone 316" }, { code: "PMS 317", hex: "#C1E5E6", name: "Pantone 317" }, { code: "PMS 318", hex: "#8CD9E6", name: "Pantone 318" }, { code: "PMS 319", hex: "#4DCCE6", name: "Pantone 319" }, { code: "PMS 320", hex: "#00A3B5", name: "Pantone 320" }, { code: "PMS 321", hex: "#00829B", name: "Pantone 321" }, { code: "PMS 322", hex: "#006B7F", name: "Pantone 322" }, { code: "PMS 323", hex: "#00596B", name: "Pantone 323" }, { code: "PMS 324", hex: "#AAD6D6", name: "Pantone 324" }, { code: "PMS 325", hex: "#7FCCC6", name: "Pantone 325" }, { code: "PMS 326", hex: "#33B5AA", name: "Pantone 326" }, { code: "PMS 327", hex: "#00998C", name: "Pantone 327" }, { code: "PMS 328", hex: "#007F7A", name: "Pantone 328" }, { code: "PMS 329", hex: "#006B63", name: "Pantone 329" }, { code: "PMS 330", hex: "#00594F", name: "Pantone 330" }, { code: "PMS 331", hex: "#BFDBDB", name: "Pantone 331" }, { code: "PMS 332", hex: "#99CCC6", name: "Pantone 332" }, { code: "PMS 333", hex: "#66C1B2", name: "Pantone 333" }, { code: "PMS 334", hex: "#00AA9E", name: "Pantone 334" }, { code: "PMS 335", hex: "#008C82", name: "Pantone 335" }, { code: "PMS 336", hex: "#007263", name: "Pantone 336" }, { code: "PMS 337", hex: "#A5D6CC", name: "Pantone 337" }, { code: "PMS 338", hex: "#8CCCC0", name: "Pantone 338" }, { code: "PMS 339", hex: "#66C1B2", name: "Pantone 339" }, { code: "PMS 340", hex: "#00AA9E", name: "Pantone 340" }, { code: "PMS 341", hex: "#008C82", name: "Pantone 341" }, { code: "PMS 342", hex: "#007263", name: "Pantone 342" }, { code: "PMS 343", hex: "#006B5B", name: "Pantone 343" }, { code: "PMS 344", hex: "#BFE5D1", name: "Pantone 344" }, { code: "PMS 345", hex: "#99D6BF", name: "Pantone 345" }, { code: "PMS 346", hex: "#7FCCA5", name: "Pantone 346" }, { code: "PMS 347", hex: "#00A87E", name: "Pantone 347" }, { code: "PMS 348", hex: "#008C63", name: "Pantone 348" }, { code: "PMS 349", hex: "#007A53", name: "Pantone 349" }, { code: "PMS 350", hex: "#006B47", name: "Pantone 350" }, { code: "PMS 351", hex: "#A5E5CC", name: "Pantone 351" }, { code: "PMS 352", hex: "#8CDBBA", name: "Pantone 352" }, { code: "PMS 353", hex: "#7FD6B5", name: "Pantone 353" }, { code: "PMS 354", hex: "#00BF7D", name: "Pantone 354" }, { code: "PMS 355", hex: "#00A85B", name: "Pantone 355" }, { code: "PMS 356", hex: "#007A3D", name: "Pantone 356" }, { code: "PMS 357", hex: "#006B3F", name: "Pantone 357" }, { code: "PMS 358", hex: "#BFE5C6", name: "Pantone 358" }, { code: "PMS 359", hex: "#A5DBB2", name: "Pantone 359" },
];

const hexToRgb = (h: string) => {
  let hex = h.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

const calculateColorDistance = (rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }) =>
  Math.sqrt(Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2));

const getLuminance = (r: number, g: number, b: number) => (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#fff';

export default function RgbToPantoneConverter() {
  const [rgb, setRgb] = useState({ r: 128, g: 128, b: 128 });
  const [hex, setHex] = useState('#808080');
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    let closest = PANTONE_COLORS[0];
    let closestDistance = Infinity;
    const distances: { pantone: PantoneColor; distance: number }[] = [];

    PANTONE_COLORS.forEach(pantone => {
      const pantoneRgb = hexToRgb(pantone.hex);
      const distance = calculateColorDistance(rgb, pantoneRgb);
      distances.push({ pantone, distance });
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = pantone;
      }
    });

    distances.sort((a, b) => a.distance - b.distance);
    const accuracy = Math.max(0, 100 - (closestDistance / 4.41));

    setMatch({ closest, alternatives: distances.slice(1, 7), accuracy });
  }, [rgb]);

  const handleHexChange = (val: string) => {
    setHex(val);
    const clean = val.replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      setRgb(hexToRgb(val));
    }
  };

  const handleRgbChange = (key: 'r' | 'g' | 'b', val: string) => {
    const num = Math.min(255, Math.max(0, parseInt(val) || 0));
    const newRgb = { ...rgb, [key]: num };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleColorPicker = (val: string) => {
    setHex(val);
    setRgb(hexToRgb(val));
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('Copied to clipboard!', 'success');
    } catch {
      addToast('Could not copy.', 'error');
    }
  };

  const accuracyColor = match ? (match.accuracy >= 90 ? 'text-emerald-400' : match.accuracy >= 70 ? 'text-yellow-400' : 'text-red-400') : '';

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Banner */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PMS</span>
        </div>
        <i className="fas fa-swatchbook text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All color matching is done locally in your browser. No data is ever uploaded.
          </p>
        </div>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Main Widget */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">PANTONE</span>
        </div>

        <div className="relative z-10 p-5 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Input Panel */}
            <div className="lg:w-5/12 space-y-5">
              {/* Color Preview */}
              <div className="h-32 rounded-xl border border-white/10 flex items-center justify-center text-sm font-mono font-bold cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: hex, color: getLuminance(rgb.r, rgb.g, rgb.b) }}>
                <input type="color" value={hex} onChange={e => handleColorPicker(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="drop-shadow-sm">{hex}</span>
              </div>

              {/* Hex Input */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Hex Code</label>
                <div className="flex gap-2">
                  <input type="text" value={hex} onChange={e => handleHexChange(e.target.value)} maxLength={7}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/40" />
                  <button onClick={() => copyText(hex)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 transition-colors">
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>

              {/* RGB Inputs */}
              {(['r', 'g', 'b'] as const).map(ch => (
                <div key={ch}>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{ch.toUpperCase()}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={255} value={rgb[ch]}
                      onChange={e => handleRgbChange(ch, e.target.value)}
                      className="flex-1 accent-white h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer"
                      style={{ accentColor: ch === 'r' ? '#ef4444' : ch === 'g' ? '#22c55e' : '#3b82f6' }} />
                    <input type="number" min={0} max={255} value={rgb[ch]}
                      onChange={e => handleRgbChange(ch, e.target.value)}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs font-mono text-center focus:outline-none focus:border-white/40" />
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Result Panel */}
            <div className="lg:w-7/12 space-y-5">
              {match && (
                <>
                  {/* Closest Match */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Closest Match</p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl border border-white/10 shrink-0" style={{ backgroundColor: match.closest.hex }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{match.closest.code}</span>
                          <span className={`text-[10px] font-bold ${accuracyColor}`}>{Math.round(match.accuracy)}%</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{match.closest.name}</p>
                      </div>
                      <button onClick={() => copyText(match.closest.code)}
                        className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 transition-colors shrink-0">
                        <i className="fas fa-copy mr-1"></i>PMS
                      </button>
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl p-3 border border-white/10 text-center" style={{ backgroundColor: hex }}>
                      <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: getLuminance(rgb.r, rgb.g, rgb.b) }}>Input</span>
                    </div>
                    <div className="flex-1 rounded-xl p-3 border border-white/10 text-center" style={{ backgroundColor: match.closest.hex }}>
                      <span className="text-[8px] font-semibold uppercase tracking-wider text-white/70">Match</span>
                    </div>
                  </div>

                  {/* Alternatives */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Alternative Matches</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {match.alternatives.map((alt, i) => (
                        <button key={i} onClick={() => { setHex(alt.pantone.hex); setRgb(hexToRgb(alt.pantone.hex)); }}
                          className="bg-white/5 rounded-xl border border-white/10 p-2.5 flex items-center gap-2 hover:bg-white/10 transition-colors text-left">
                          <div className="w-8 h-8 rounded-lg shrink-0 border border-white/10" style={{ backgroundColor: alt.pantone.hex }}></div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white truncate">{alt.pantone.code}</p>
                            <p className="text-[9px] text-slate-500">{Math.round(Math.max(0, 100 - (alt.distance / 4.41)))}%</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cross-promotion */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3 mt-6">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need more color tools? Try <a href="/utility-tools/converter-tools/rgb-to-hex-converter" className="text-white font-bold underline hover:text-slate-200">RGB to HEX</a>, check accessibility with <a href="/utility-tools/image-tools/color-blindness-simulator" className="text-white font-bold underline hover:text-slate-200">Color Blindness Simulator</a>, or generate codes with <a href="/utility-tools/qr-code-generator" className="text-white font-bold underline hover:text-slate-200">QR Code Generator</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
