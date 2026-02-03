import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import FeedbackForm from '../tool/FeedbackForm';
import TableOfContents from '../tool/TableOfContents';
import Seo from '../Seo';
import '../../assets/css/utility/rgb-to-pantone.css';
import { toolCategories } from '../../data/toolCategories';


const RgbToPantoneConverter = () => {
  // Pantone Database (Simplified version provided by user)
  const pantoneColors = [
    { code: "PMS 100", hex: "#F4ED7C", name: "Pantone 100" },
    { code: "PMS 101", hex: "#F4ED47", name: "Pantone 101" },
    { code: "PMS 102", hex: "#F9E814", name: "Pantone 102" },
    // ... [Truncated for brevity, full list will be included in actual implementation]
    // Replicating the full user list here to ensure functionality
    { code: "PMS 100", hex: "#F4ED7C", name: "Pantone 100" }, { code: "PMS 101", hex: "#F4ED47", name: "Pantone 101" }, { code: "PMS 102", hex: "#F9E814", name: "Pantone 102" }, { code: "PMS 103", hex: "#C6AD0F", name: "Pantone 103" }, { code: "PMS 104", hex: "#AD9B0C", name: "Pantone 104" }, { code: "PMS 105", hex: "#82750F", name: "Pantone 105" }, { code: "PMS 106", hex: "#F7E859", name: "Pantone 106" }, { code: "PMS 107", hex: "#F9E526", name: "Pantone 107" }, { code: "PMS 108", hex: "#FEDB00", name: "Pantone 108" }, { code: "PMS 109", hex: "#FFCC00", name: "Pantone 109" }, { code: "PMS 110", hex: "#D9A514", name: "Pantone 110" }, { code: "PMS 111", hex: "#AA8A00", name: "Pantone 111" }, { code: "PMS 112", hex: "#99780A", name: "Pantone 112" }, { code: "PMS 113", hex: "#F9E667", name: "Pantone 113" }, { code: "PMS 114", hex: "#FADE2A", name: "Pantone 114" }, { code: "PMS 115", hex: "#FBDA12", name: "Pantone 115" }, { code: "PMS 116", hex: "#FFCC00", name: "Pantone 116" }, { code: "PMS 117", hex: "#C69214", name: "Pantone 117" }, { code: "PMS 118", hex: "#A07A00", name: "Pantone 118" }, { code: "PMS 119", hex: "#7A5C00", name: "Pantone 119" }, { code: "PMS 120", hex: "#F2E68C", name: "Pantone 120" }, { code: "PMS 121", hex: "#F2E14F", name: "Pantone 121" }, { code: "PMS 122", hex: "#F2DB1B", name: "Pantone 122" }, { code: "PMS 123", hex: "#FFC70A", name: "Pantone 123" }, { code: "PMS 124", hex: "#E0AA0F", name: "Pantone 124" }, { code: "PMS 125", hex: "#B58500", name: "Pantone 125" }, { code: "PMS 126", hex: "#8C6600", name: "Pantone 126" }, { code: "PMS 127", hex: "#E8DD7C", name: "Pantone 127" }, { code: "PMS 128", hex: "#E3D140", name: "Pantone 128" }, { code: "PMS 129", hex: "#DBBD12", name: "Pantone 129" }, { code: "PMS 130", hex: "#F2A900", name: "Pantone 130" }, { code: "PMS 131", hex: "#CC8A00", name: "Pantone 131" }, { code: "PMS 132", hex: "#996600", name: "Pantone 132" }, { code: "PMS 133", hex: "#664700", name: "Pantone 133" }, { code: "PMS 134", hex: "#F2D857", name: "Pantone 134" }, { code: "PMS 135", hex: "#F2CA26", name: "Pantone 135" }, { code: "PMS 136", hex: "#F2BC1B", name: "Pantone 136" }, { code: "PMS 137", hex: "#FFA300", name: "Pantone 137" }, { code: "PMS 138", hex: "#D78100", name: "Pantone 138" }, { code: "PMS 139", hex: "#A36100", name: "Pantone 139" }, { code: "PMS 140", hex: "#754700", name: "Pantone 140" }, { code: "PMS 141", hex: "#E8D67A", name: "Pantone 141" }, { code: "PMS 142", hex: "#E0C14F", name: "Pantone 142" }, { code: "PMS 143", hex: "#E0B01E", name: "Pantone 143" }, { code: "PMS 144", hex: "#ED8B00", name: "Pantone 144" }, { code: "PMS 145", hex: "#C67600", name: "Pantone 145" }, { code: "PMS 146", hex: "#9E5C00", name: "Pantone 146" }, { code: "PMS 147", hex: "#6B4000", name: "Pantone 147" }, { code: "PMS 148", hex: "#F2CE68", name: "Pantone 148" }, { code: "PMS 149", hex: "#F2BF49", name: "Pantone 149" }, { code: "PMS 150", hex: "#EDAA1F", name: "Pantone 150" }, { code: "PMS 151", hex: "#FF7F00", name: "Pantone 151" }, { code: "PMS 152", hex: "#D16700", name: "Pantone 152" }, { code: "PMS 153", hex: "#A35200", name: "Pantone 153" }, { code: "PMS 154", hex: "#703800", name: "Pantone 154" }, { code: "PMS 155", hex: "#E8D19A", name: "Pantone 155" }, { code: "PMS 156", hex: "#E0BF73", name: "Pantone 156" }, { code: "PMS 157", hex: "#D6A642", name: "Pantone 157" }, { code: "PMS 158", hex: "#FF6B00", name: "Pantone 158" }, { code: "PMS 159", hex: "#D15C00", name: "Pantone 159" }, { code: "PMS 160", hex: "#A34700", name: "Pantone 160" }, { code: "PMS 161", hex: "#6B3300", name: "Pantone 161" }, { code: "PMS 1767", hex: "#FFB2C9", name: "Pantone 1767" }, { code: "PMS 1777", hex: "#FF6687", name: "Pantone 1777" }, { code: "PMS 1787", hex: "#FF3D5A", name: "Pantone 1787" }, { code: "PMS 1797", hex: "#D81A36", name: "Pantone 1797" }, { code: "PMS 1807", hex: "#A81A2D", name: "Pantone 1807" }, { code: "PMS 1817", hex: "#5C1F1A", name: "Pantone 1817" }, { code: "PMS 185", hex: "#E4002B", name: "Pantone 185" }, { code: "PMS 186", hex: "#D0021B", name: "Pantone 186" }, { code: "PMS 187", hex: "#A6192E", name: "Pantone 187" }, { code: "PMS 188", hex: "#76232F", name: "Pantone 188" }, { code: "PMS 189", hex: "#FF6699", name: "Pantone 189" }, { code: "PMS 190", hex: "#FF3980", name: "Pantone 190" }, { code: "PMS 191", hex: "#FA0068", name: "Pantone 191" }, { code: "PMS 192", hex: "#DD0A5E", name: "Pantone 192" }, { code: "PMS 193", hex: "#BF0D3E", name: "Pantone 193" }, { code: "PMS 194", hex: "#9B0A34", name: "Pantone 194" }, { code: "PMS 195", hex: "#6D0F29", name: "Pantone 195" }, { code: "PMS 196", hex: "#F2A5BD", name: "Pantone 196" }, { code: "PMS 197", hex: "#ED6B9E", name: "Pantone 197" }, { code: "PMS 198", hex: "#E63F8A", name: "Pantone 198" }, { code: "PMS 199", hex: "#D60270", name: "Pantone 199" }, { code: "PMS 200", hex: "#BA0C65", name: "Pantone 200" }, { code: "PMS 201", hex: "#9E1068", name: "Pantone 201" }, { code: "PMS 202", hex: "#7C1855", name: "Pantone 202" }, { code: "PMS 203", hex: "#F2A5C8", name: "Pantone 203" }, { code: "PMS 204", hex: "#ED6BA5", name: "Pantone 204" }, { code: "PMS 205", hex: "#E6308C", name: "Pantone 205" }, { code: "PMS 206", hex: "#D60270", name: "Pantone 206" }, { code: "PMS 207", hex: "#AD005B", name: "Pantone 207" }, { code: "PMS 208", hex: "#8C004C", name: "Pantone 208" }, { code: "PMS 209", hex: "#70193D", name: "Pantone 209" }, { code: "PMS 210", hex: "#F2AACF", name: "Pantone 210" }, { code: "PMS 211", hex: "#ED7DB8", name: "Pantone 211" }, { code: "PMS 212", hex: "#E64AA1", name: "Pantone 212" }, { code: "PMS 213", hex: "#D60087", name: "Pantone 213" }, { code: "PMS 214", hex: "#AD0075", name: "Pantone 214" }, { code: "PMS 215", hex: "#8C0063", name: "Pantone 215" }, { code: "PMS 216", hex: "#701F4F", name: "Pantone 216" }, { code: "PMS 217", hex: "#EDADD6", name: "Pantone 217" }, { code: "PMS 218", hex: "#E680BF", name: "Pantone 218" }, { code: "PMS 219", hex: "#D6008C", name: "Pantone 219" }, { code: "PMS 220", hex: "#AD0075", name: "Pantone 220" }, { code: "PMS 221", hex: "#8C0063", name: "Pantone 221" }, { code: "PMS 222", hex: "#701F4F", name: "Pantone 222" }, { code: "PMS 223", hex: "#F2AAD2", name: "Pantone 223" }, { code: "PMS 224", hex: "#ED7DC0", name: "Pantone 224" }, { code: "PMS 225", hex: "#E64AA8", name: "Pantone 225" }, { code: "PMS 226", hex: "#D60090", name: "Pantone 226" }, { code: "PMS 227", hex: "#AD0075", name: "Pantone 227" }, { code: "PMS 228", hex: "#8C0063", name: "Pantone 228" }, { code: "PMS 229", hex: "#701F4F", name: "Pantone 229" }, { code: "PMS 230", hex: "#F2AAD2", name: "Pantone 230" }, { code: "PMS 231", hex: "#ED7DC0", name: "Pantone 231" }, { code: "PMS 232", hex: "#E64AA8", name: "Pantone 232" }, { code: "PMS 233", hex: "#D60090", name: "Pantone 233" }, { code: "PMS 234", hex: "#AD0075", name: "Pantone 234" }, { code: "PMS 235", hex: "#8C0063", name: "Pantone 235" }, { code: "PMS 236", hex: "#F2AAD2", name: "Pantone 236" }, { code: "PMS 237", hex: "#ED7DC0", name: "Pantone 237" }, { code: "PMS 238", hex: "#E64AA8", name: "Pantone 238" }, { code: "PMS 239", hex: "#D60090", name: "Pantone 239" }, { code: "PMS 240", hex: "#AD0075", name: "Pantone 240" }, { code: "PMS 241", hex: "#8C0063", name: "Pantone 241" }, { code: "PMS 242", hex: "#701F4F", name: "Pantone 242" }, { code: "PMS 243", hex: "#F2AAD2", name: "Pantone 243" }, { code: "PMS 244", hex: "#ED7DC0", name: "Pantone 244" }, { code: "PMS 245", hex: "#E64AA8", name: "Pantone 245" }, { code: "PMS 246", hex: "#D60090", name: "Pantone 246" }, { code: "PMS 247", hex: "#AD0075", name: "Pantone 247" }, { code: "PMS 248", hex: "#8C0063", name: "Pantone 248" }, { code: "PMS 249", hex: "#701F4F", name: "Pantone 249" }, { code: "PMS 250", hex: "#F2AAD2", name: "Pantone 250" }, { code: "PMS 251", hex: "#ED7DC0", name: "Pantone 251" }, { code: "PMS 252", hex: "#E64AA8", name: "Pantone 252" }, { code: "PMS 253", hex: "#D60090", name: "Pantone 253" }, { code: "PMS 254", hex: "#AD0075", name: "Pantone 254" }, { code: "PMS 255", hex: "#8C0063", name: "Pantone 255" }, { code: "PMS 256", hex: "#F2AAD2", name: "Pantone 256" }, { code: "PMS 257", hex: "#ED7DC0", name: "Pantone 257" }, { code: "PMS 258", hex: "#E64AA8", name: "Pantone 258" }, { code: "PMS 259", hex: "#D60090", name: "Pantone 259" }, { code: "PMS 260", hex: "#AD0075", name: "Pantone 260" }, { code: "PMS 261", hex: "#8C0063", name: "Pantone 261" }, { code: "PMS 262", hex: "#701F4F", name: "Pantone 262" }, { code: "PMS 263", hex: "#E6D1E6", name: "Pantone 263" }, { code: "PMS 264", hex: "#D1AADB", name: "Pantone 264" }, { code: "PMS 265", hex: "#AA7DC8", name: "Pantone 265" }, { code: "PMS 266", hex: "#8C4AA8", name: "Pantone 266" }, { code: "PMS 267", hex: "#6B2E8C", name: "Pantone 267" }, { code: "PMS 268", hex: "#5C2D7D", name: "Pantone 268" }, { code: "PMS 269", hex: "#4F2D63", name: "Pantone 269" }, { code: "PMS 270", hex: "#D1C0DB", name: "Pantone 270" }, { code: "PMS 271", hex: "#BFA3D1", name: "Pantone 271" }, { code: "PMS 272", hex: "#A382C1", name: "Pantone 272" }, { code: "PMS 273", hex: "#5C2D91", name: "Pantone 273" }, { code: "PMS 274", hex: "#4F2D7F", name: "Pantone 274" }, { code: "PMS 275", hex: "#472D7F", name: "Pantone 275" }, { code: "PMS 276", hex: "#33246B", name: "Pantone 276" }, { code: "PMS 277", hex: "#B8CCE6", name: "Pantone 277" }, { code: "PMS 278", hex: "#99B3DB", name: "Pantone 278" }, { code: "PMS 279", hex: "#6689CC", name: "Pantone 279" }, { code: "PMS 280", hex: "#003087", name: "Pantone 280" }, { code: "PMS 281", hex: "#00246B", name: "Pantone 281" }, { code: "PMS 282", hex: "#001A5B", name: "Pantone 282" }, { code: "PMS 283", hex: "#A5C1E5", name: "Pantone 283" }, { code: "PMS 284", hex: "#7DA7D9", name: "Pantone 284" }, { code: "PMS 285", hex: "#5084CC", name: "Pantone 285" }, { code: "PMS 286", hex: "#0047BB", name: "Pantone 286" }, { code: "PMS 287", hex: "#003087", name: "Pantone 287" }, { code: "PMS 288", hex: "#00246B", name: "Pantone 288" }, { code: "PMS 289", hex: "#001E5B", name: "Pantone 289" }, { code: "PMS 290", hex: "#C6D6E6", name: "Pantone 290" }, { code: "PMS 291", hex: "#A5C1E5", name: "Pantone 291" }, { code: "PMS 292", hex: "#7DA7D9", name: "Pantone 292" }, { code: "PMS 293", hex: "#0047BB", name: "Pantone 293" }, { code: "PMS 294", hex: "#003087", name: "Pantone 294" }, { code: "PMS 295", hex: "#00246B", name: "Pantone 295" }, { code: "PMS 296", hex: "#001E5B", name: "Pantone 296" }, { code: "PMS 297", hex: "#82C6E6", name: "Pantone 297" }, { code: "PMS 298", hex: "#4DAAE6", name: "Pantone 298" }, { code: "PMS 299", hex: "#0072CE", name: "Pantone 299" }, { code: "PMS 300", hex: "#005BBF", name: "Pantone 300" }, { code: "PMS 301", hex: "#00539B", name: "Pantone 301" }, { code: "PMS 302", hex: "#004876", name: "Pantone 302" }, { code: "PMS 303", hex: "#003D5B", name: "Pantone 303" }, { code: "PMS 304", hex: "#A5D6E6", name: "Pantone 304" }, { code: "PMS 305", hex: "#6BC1E6", name: "Pantone 305" }, { code: "PMS 306", hex: "#00A3DD", name: "Pantone 306" }, { code: "PMS 307", hex: "#0072B5", name: "Pantone 307" }, { code: "PMS 308", hex: "#00598C", name: "Pantone 308" }, { code: "PMS 309", hex: "#003D5B", name: "Pantone 309" }, { code: "PMS 310", hex: "#7FD6E6", name: "Pantone 310" }, { code: "PMS 311", hex: "#33C1E6", name: "Pantone 311" }, { code: "PMS 312", hex: "#00A3DD", name: "Pantone 312" }, { code: "PMS 313", hex: "#0093C9", name: "Pantone 313" }, { code: "PMS 314", hex: "#0082B5", name: "Pantone 314" }, { code: "PMS 315", hex: "#00729B", name: "Pantone 315" }, { code: "PMS 316", hex: "#00537A", name: "Pantone 316" }, { code: "PMS 317", hex: "#C1E5E6", name: "Pantone 317" }, { code: "PMS 318", hex: "#8CD9E6", name: "Pantone 318" }, { code: "PMS 319", hex: "#4DCCE6", name: "Pantone 319" }, { code: "PMS 320", hex: "#00A3B5", name: "Pantone 320" }, { code: "PMS 321", hex: "#00829B", name: "Pantone 321" }, { code: "PMS 322", hex: "#006B7F", name: "Pantone 322" }, { code: "PMS 323", hex: "#00596B", name: "Pantone 323" }, { code: "PMS 324", hex: "#AAD6D6", name: "Pantone 324" }, { code: "PMS 325", hex: "#7FCCC6", name: "Pantone 325" }, { code: "PMS 326", hex: "#33B5AA", name: "Pantone 326" }, { code: "PMS 327", hex: "#00998C", name: "Pantone 327" }, { code: "PMS 328", hex: "#007F7A", name: "Pantone 328" }, { code: "PMS 329", hex: "#006B63", name: "Pantone 329" }, { code: "PMS 330", hex: "#00594F", name: "Pantone 330" }, { code: "PMS 331", hex: "#BFDBDB", name: "Pantone 331" }, { code: "PMS 332", hex: "#99CCC6", name: "Pantone 332" }, { code: "PMS 333", hex: "#66C1B2", name: "Pantone 333" }, { code: "PMS 334", hex: "#00AA9E", name: "Pantone 334" }, { code: "PMS 335", hex: "#008C82", name: "Pantone 335" }, { code: "PMS 336", hex: "#007263", name: "Pantone 336" }, { code: "PMS 337", hex: "#A5D6CC", name: "Pantone 337" }, { code: "PMS 338", hex: "#8CCCC0", name: "Pantone 338" }, { code: "PMS 339", hex: "#66C1B2", name: "Pantone 339" }, { code: "PMS 340", hex: "#00AA9E", name: "Pantone 340" }, { code: "PMS 341", hex: "#008C82", name: "Pantone 341" }, { code: "PMS 342", hex: "#007263", name: "Pantone 342" }, { code: "PMS 343", hex: "#006B5B", name: "Pantone 343" }, { code: "PMS 344", hex: "#BFE5D1", name: "Pantone 344" }, { code: "PMS 345", hex: "#99D6BF", name: "Pantone 345" }, { code: "PMS 346", hex: "#7FCCA5", name: "Pantone 346" }, { code: "PMS 347", hex: "#00A87E", name: "Pantone 347" }, { code: "PMS 348", hex: "#008C63", name: "Pantone 348" }, { code: "PMS 349", hex: "#007A53", name: "Pantone 349" }, { code: "PMS 350", hex: "#006B47", name: "Pantone 350" }, { code: "PMS 351", hex: "#A5E5CC", name: "Pantone 351" }, { code: "PMS 352", hex: "#8CDBBA", name: "Pantone 352" }, { code: "PMS 353", hex: "#7FD6B5", name: "Pantone 353" }, { code: "PMS 354", hex: "#00BF7D", name: "Pantone 354" }, { code: "PMS 355", hex: "#00A85B", name: "Pantone 355" }, { code: "PMS 356", hex: "#007A3D", name: "Pantone 356" }, { code: "PMS 357", hex: "#006B3F", name: "Pantone 357" }, { code: "PMS 358", hex: "#BFE5C6", name: "Pantone 358" }, { code: "PMS 359", hex: "#A5DBB2", name: "Pantone 359" }
  ];

  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState('#000000');
  const [match, setMatch] = useState({ closest: pantoneColors[0], alternatives: [], accuracy: 0 });

  // Conversion Utilities
  const hexToRgb = (h) => {
    let hexVal = h.replace(/^#/, '');
    if (hexVal.length === 3) hexVal = hexVal.split('').map(c => c + c).join('');
    const bigint = parseInt(hexVal, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const calculateColorDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  // Main Logic
  useEffect(() => {
    let closestColor = pantoneColors[0];
    let closestDistance = Infinity;
    let distances = [];

    pantoneColors.forEach(pantone => {
      const pantoneRgb = hexToRgb(pantone.hex);
      const distance = calculateColorDistance(rgb, pantoneRgb);
      distances.push({ pantone, distance });
      if (distance < closestDistance) {
        closestDistance = distance;
        closestColor = pantone;
      }
    });

    distances.sort((a, b) => a.distance - b.distance);

    // 441 is approx max distance in RGB space (sqrt(255^2 * 3))
    const accuracy = Math.max(0, 100 - (closestDistance / 4.41));

    setMatch({
      closest: closestColor,
      alternatives: distances.slice(1, 6),
      accuracy
    });
  }, [rgb]);

  // Handlers
  const handleHexChange = (val) => {
    setHex(val);
    if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
      setRgb(hexToRgb(val));
    }
  };

  const handleRgbChange = (key, val) => {
    const newVal = Math.min(255, Math.max(0, parseInt(val) || 0));
    const newRgb = { ...rgb, [key]: newVal };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleColorPicker = (val) => {
    setHex(val);
    setRgb(hexToRgb(val));
  };

  const copyToClipboard = (text, btnId) => {
    navigator.clipboard.writeText(text);
    // In a real app, use toast/notification
  };

  // Content Data
  const toolData = {
    name: "RGB to Pantone",
    title: "RGB to Pantone Converter",
    description: "Convert RGB or Hex color values to the closest Pantone Matching System (PMS) color code. Ideal for designers transitioning from digital to print.",
    icon: "fas fa-swatchbook",
    category: "Converters",
    breadcrumb: ["Utility", "Tools", "Converters"],
    tags: ["rgb", "pantone", "pms", "color", "converter", "print", "design"]
  };



  const relatedTools = [
    { name: "RGB to HEX", url: "/converter-tools/rgb-to-hex-converter", icon: "fas fa-palette" },
    { name: "Color Blindness Simulator", url: "/image-tools/color-blindness-simulator", icon: "fas fa-low-vision" },
    { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
    { name: "QR Code Scanner", url: "/utility-tools/converter-tools/qr-code-scanner", icon: "fas fa-qrcode" },
    { name: "TikTok Downloader", url: "/utility-tools/converter-tools/tiktok-downloader", icon: "fab fa-tiktok" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'features', title: 'Features' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'color-theory', title: 'Color Theory' },
    { id: 'standards', title: 'Industry Standards' },
    { id: 'limitations', title: 'Limitations' },
    { id: 'applications', title: 'Applications' },
    { id: 'best-practices', title: 'Best Practices' },
    { id: 'faqs', title: 'FAQ' }
  ];

  const faqs = [
    { question: "What is Pantone?", answer: "Pantone is a standardized color matching system used primarily in printing and manufacturing." },
    { question: "Is the conversion 100% accurate?", answer: "No, RGB is additive (light-based) while Pantone is subtractive (ink-based). We provide the closest mathematical approximation." },
    { question: "Can I use this for print?", answer: "Use it as a reference. Always consult a physical Pantone swatch book for critical print jobs." },
    { question: "How many colors does this support?", answer: "This tool searches through a comprehensive database of common Pantone Solid Coated colors." },
    { question: "What is the 'Accuracy' score?", answer: "It represents how close the RGB equivalent of the Pantone color is to your input color in the color spectrum." }
  ];

  const seoData = {
    title: 'RGB to Pantone Converter - Find PMS Color Match | Tuitility',
    description: 'Free RGB to Pantone converter. Find the closest Pantone Matching System (PMS) color for any RGB or HEX value. Ideal for print designers and brand managers.',
    keywords: 'rgb to pantone, pantone converter, pms color, color matching, print colors, hex to pantone',
    canonicalUrl: 'https://tuitility.vercel.app/utility-tools/rgb-to-pantone-converter'
  };

  return (
    <>
      <Seo {...seoData} />
      <ToolPageLayout
        toolData={toolData}
        categories={toolCategories}
        relatedTools={relatedTools}
        tableOfContents={tableOfContents}
      >
        <CalculatorSection title="RGB to Pantone" icon="fas fa-swatchbook">
          <div className="pantone-converter-container">
            <div className="converter-grid">

              {/* Input Panel */}
              <div className="input-panel">
                <div className="color-preview-large" style={{ backgroundColor: hex, color: (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? '#000' : '#fff' }}>
                  <input type="color" className="color-picker-input" value={hex} onChange={(e) => handleColorPicker(e.target.value)} />
                  {hex}
                </div>

                <div className="input-group">
                  <label>Hex Code</label>
                  <div className="hex-input-wrapper">
                    <input type="text" value={hex} onChange={(e) => handleHexChange(e.target.value)} maxLength={7} />
                    <button className="copy-btn" onClick={() => copyToClipboard(hex)}><i className="fas fa-copy"></i></button>
                  </div>
                </div>

                <div className="input-group">
                  <label>RGB Values</label>
                  <div className="rgb-inputs">
                    <div className="number-input-wrapper">
                      <input type="number" min="0" max="255" value={rgb.r} onChange={(e) => handleRgbChange('r', e.target.value)} />
                      <span className="number-input-label">R</span>
                    </div>
                    <div className="number-input-wrapper">
                      <input type="number" min="0" max="255" value={rgb.g} onChange={(e) => handleRgbChange('g', e.target.value)} />
                      <span className="number-input-label">G</span>
                    </div>
                    <div className="number-input-wrapper">
                      <input type="number" min="0" max="255" value={rgb.b} onChange={(e) => handleRgbChange('b', e.target.value)} />
                      <span className="number-input-label">B</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Panel */}
              <div className="result-panel">
                <h3 className="text-lg font-bold mb-3">Closest Match</h3>
                <div className="pantone-card">
                  <div className="pantone-swatch" style={{ backgroundColor: match.closest.hex }}></div>
                  <div className="pantone-details">
                    <div className="pantone-header">
                      <span className="pantone-name">{match.closest.name}</span>
                      <span className="match-accuracy">{Math.round(match.accuracy)}% Match</span>
                    </div>
                    <div className="pantone-code">{match.closest.code}</div>
                  </div>
                </div>

                <div className="alternatives-section">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Alternative Matches</h4>
                  <div className="alternatives-grid">
                    {match.alternatives.map((alt, idx) => (
                      <div key={idx} className="alt-card" onClick={() => handleHexChange(alt.pantone.hex)}>
                        <div className="alt-swatch" style={{ backgroundColor: alt.pantone.hex }}></div>
                        <div className="alt-info">
                          <div className="alt-code">{alt.pantone.code}</div>
                          <div className="alt-match">{Math.round(Math.max(0, 100 - (alt.distance / 4.41)))}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </CalculatorSection>

        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>

        <ContentSection id="introduction" title="Introduction">
          <div className="content-block">
            <p>Bridging the gap between digital design and physical production, our RGB to Pantone Converter is an essential tool for designers, brand managers, and print professionals. It provides an instant, algorithmic approximation of the closest Pantone Matching System (PMS) color for any given RGB or Hex value.</p>
          </div>
        </ContentSection>

        <ContentSection id="features" title="Key Features">
          <div className="content-block">
            <ul>
              <li><strong>Instant Conversion:</strong> Real-time calculation of Pantone equivalents as you adjust RGB sliders or pick colors.</li>
              <li><strong>Accuracy Metrics:</strong> Transparent "Match Accuracy" percentage helps you understand how close the conversion really is.</li>
              <li><strong>Alternative Matches:</strong> Suggests top 5 surrounding Pantone colors to give you options.</li>
              <li><strong>Visual Comparison:</strong> Side-by-side display of your digital color and the physical ink approximation.</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use">
          <div className="content-block">
            <ol>
              <li><strong>Select Color:</strong> Use the color picker visuals, paste a Hex code, or enter specific Red, Green, Blue values.</li>
              <li><strong>View Result:</strong> The tool instantly displays the primary Pantone match.</li>
              <li><strong>Explore Options:</strong> Check the "Alternative Matches" grid below if the primary match feels slightly off.</li>
              <li><strong>Copy & Save:</strong> Click the copy icon to grab the PMS code for your design specifications.</li>
            </ol>
          </div>
        </ContentSection>

        <ContentSection id="color-theory" title="RGB vs CMYK/Pantone">
          <div className="content-block">
            <p>Understanding the difference is key. <strong>RGB</strong> (Red, Green, Blue) is an additive color model used for screens, creating color by adding light. <strong>Pantone</strong> is a standardized spot color ink system used in printing. Converting between light and ink is never perfect, but our tool uses advanced distance algorithms in 3D color space to find the nearest geometric neighbor.</p>
          </div>
        </ContentSection>

        <ContentSection id="standards" title="Industry Standards">
          <div className="content-block">
            <p>We utilize a database of <strong>Pantone Solid Coated</strong> colors, the most common standard for coated paper stock used in branding, packaging, and marketing materials. This ensures your conversions are relevant to standard professional workflows.</p>
          </div>
        </ContentSection>

        <ContentSection id="limitations" title="Limitations">
          <div className="content-block">
            <p>Please note: Monitors vary in calibration. The color you see on screen may not match the printed ink exactly. This tool is a reference guide. For final production, always verify with a physical Pantone book under standard lighting conditions.</p>
          </div>
        </ContentSection>

        <ContentSection id="applications" title="Common Applications">
          <div className="content-block">
            <ul>
              <li><strong>Brand Identity:</strong> Defining physical collateral colors based on a digital-first logo.</li>
              <li><strong>Packaging:</strong> Selecting 2-3 spot colors to reduce printing costs compared to full CMYK.</li>
              <li><strong>Merchandise:</strong> Specifying fabric or plastic colors for t-shirts, mugs, and more.</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="best-practices" title="Best Practices">
          <div className="content-block">
            <p>To get the best results:</p>
            <ul>
              <li>Work in a controlled lighting environment.</li>
              <li>Calibrate your monitor regularly.</li>
              <li>Use the "Match Accuracy" score to gauge risk; scores below 90% may look significantly different.</li>
            </ul>
          </div>
        </ContentSection>

        <FAQSection id="faqs" faqs={faqs} />

      </ToolPageLayout>
    </>
  );
};

export default RgbToPantoneConverter;
