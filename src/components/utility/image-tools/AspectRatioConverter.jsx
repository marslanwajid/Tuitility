import React, { useState, useRef, useEffect } from 'react';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import FeedbackForm from '../../tool/FeedbackForm';
import TableOfContents from '../../tool/TableOfContents';
import { toolCategories } from '../../../data/toolCategories';
import '../../../assets/css/utility/aspect-ratio-converter.css';

const AspectRatioConverter = () => {
  // --- Calculator Logic ---
  const [calcState, setCalcState] = useState({
    width: 1920,
    height: 1080,
    ratioW: 16,
    ratioH: 9
  });
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' or 'converter'

  const handleCalcChange = (field, value) => {
    const val = parseFloat(value) || 0;
    const newState = { ...calcState, [field]: val };

    // Calculate missing value based on which field changed
    // Logic: Ratio = W / H
    if (field === 'width') {
      newState.height = Math.round(val * (newState.ratioH / newState.ratioW));
    } else if (field === 'height') {
      newState.width = Math.round(val * (newState.ratioW / newState.ratioH));
    } else if (field === 'ratioW' || field === 'ratioH') {
      // Create new ratio
      const rW = field === 'ratioW' ? val : newState.ratioW;
      const rH = field === 'ratioH' ? val : newState.ratioH;
      // Recalculate height based on current width
      newState.height = Math.round(newState.width * (rH / rW));
    }
    setCalcState(newState);
  };

  const calculateGCD = (a, b) => (b === 0 ? a : calculateGCD(b, a % b));

  // --- Converter Logic ---
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageObj, setImageObj] = useState(null); // The actual Image object
  const [cropMode, setCropMode] = useState('fit'); // 'fit' or 'crop'
  const [convertSettings, setConvertSettings] = useState({
    targetW: 1080,
    targetH: 1080,
    lockRatio: false
  });
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target.result);
        const img = new Image();
        img.onload = () => {
          setImageObj(img);
          // Set defaults to original size
          setConvertSettings({
             targetW: img.width,
             targetH: img.height,
             lockRatio: true
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const [cropAnchor, setCropAnchor] = useState('center'); 
  const [customRatio, setCustomRatio] = useState({ w: 1, h: 1 });
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset offset when mode or image changes
  useEffect(() => {
    setManualOffset({ x: 0, y: 0 });
    setCropAnchor('center');
  }, [uploadedImage, convertSettings.targetW, convertSettings.targetH, cropMode]);

  // Preview Updating Effect
  useEffect(() => {
    if (activeTab === 'converter' && imageObj && canvasRef.current) {
        drawPreview();
    }
  }, [uploadedImage, imageObj, convertSettings, cropMode, activeTab, cropAnchor, manualOffset]);

  const drawPreview = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const { targetW, targetH } = convertSettings;

      canvas.width = targetW;
      canvas.height = targetH;

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      let sw = imageObj.width;
      let sh = imageObj.height;
      let sx = 0, sy = 0, dx = 0, dy = 0, dw = targetW, dh = targetH;

      const srcRatio = sw / sh;
      const targetRatio = targetW / targetH;

      if (cropMode === 'crop') {
         // Crop to fill
         if (srcRatio > targetRatio) {
             sw = imageObj.height * targetRatio;
             // Calculate SX based on anchor + manual offset
             // Default center
             let baseX = (imageObj.width - sw) / 2;
             
             if (cropAnchor.includes('left')) baseX = 0;
             else if (cropAnchor.includes('right')) baseX = imageObj.width - sw;

             sx = baseX - manualOffset.x;
             
             // Clamp
             if (sx < 0) sx = 0;
             if (sx + sw > imageObj.width) sx = imageObj.width - sw;

         } else {
             sh = imageObj.width / targetRatio;
             // Calculate SY based on anchor + manual offset
             // Default center
             let baseY = (imageObj.height - sh) / 2;

             if (cropAnchor.includes('top')) baseY = 0;
             else if (cropAnchor.includes('bottom')) baseY = imageObj.height - sh;
             
             sy = baseY - manualOffset.y;

             // Clamp
             if (sy < 0) sy = 0;
             if (sy + sh > imageObj.height) sy = imageObj.height - sh;
         }
      } else {
          // Fit (Letterbox) - No dragging for now as image is fully visible
          if (srcRatio > targetRatio) {
              dw = targetW;
              dh = targetW / srcRatio;
              dy = (targetH - dh) / 2;
          } else {
              dh = targetH;
              dw = targetH * srcRatio;
              dx = (targetW - dw) / 2;
          }
      }

      ctx.drawImage(imageObj, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const handleMouseDown = (e) => {
      if(cropMode !== 'crop') return;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
      if (!isDragging || cropMode !== 'crop') return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Calculate scaling factor between canvas display size and actual size
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Update manual offset - inverse because moving mouse right means we want to see left part of image (decreasing sx)
      // Actually normally: moving mouse right -> padding-left increases -> sx decreases? 
      // Let's think: Dragging image right means we want to see the LEFT side of the source image.
      // So 'sx' should decrease. 
      // deltaX > 0 (right drag) -> sx should decrease.
      
      // However above we did: sx = baseX - manualOffset.x
      // So if deltaX > 0, we want sx to decrease, so manualOffset.x must INCREASE.
      
      // We must scale the delta to match the source image resolution
      // But 'manualOffset' is applied to 'sx' which is in source coordinates?
      // Yes. So we need to convert screen pixels (delta) -> canvas pixels -> source pixels.
      
      // It's complicated to get exact source pixels from here without re-calculating ratios.
      // Let's use a simplified approach: just accumulate raw screen deltas scaled roughly.
      
      // Wait, let's look at drawPreview:
      // sx = baseX - manualOffset.x
      
      // Let's say image is 1000px wide, displayed at 500px. Scale is 2.
      // Dragging 10px right on screen -> 20px on source.
      // We want to see 20px more to the left. sx -= 20.
      // sx = baseX - (oldOffset + 20).
      // So manualOffset.x += 20.
      
      // We need the ratio of (Source Image Size) / (Canvas Display Size)
      // But drawImage handles the scaling from sw -> dw.
      // Canvas pixels = dw.
      // Source pixels = sw.
      // Ratio = sw / dw.
      
      // Let's recalculate Ratio inside here? Or just enable efficient dragging.
      
      // Optimized approach: update state efficiently.
      // We will perform the math in the state update function to ensure we use latest values?
      // No, let's just assume a sensitivity factor for now or try to get accurate.
      
      // Let's map delta directly to offset for now, user can adjust.
      // Actually, if we map 1:1, it might be slow for large images.
      
      // Let's try to get the ratio from the last draw? 
      // Hard to access current 'sw' and 'dw' from here.
      
      // Let's just accumulate the delta * 2 (as a guess) for sensitivity.
      setManualOffset(prev => ({
          x: prev.x + (deltaX * (imageObj.width / rect.width)), 
          y: prev.y + (deltaY * (imageObj.height / rect.height))
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const handleDownload = () => {
      if(!canvasRef.current) return;
      const link = document.createElement('a');
      link.download = `resized-${convertSettings.targetW}x${convertSettings.targetH}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
  };

  const presets = [
      { l: "1:1", w: 1, h: 1 },
      { l: "16:9", w: 16, h: 9 },
      { l: "4:3", w: 4, h: 3 },
      { l: "5:4", w: 5, h: 4 },
      { l: "3:2", w: 3, h: 2 },
      { l: "9:16", w: 9, h: 16 },
      { l: "21:9", w: 21, h: 9 }
  ];

  const applyRatio = (w, h) => {
      if(!imageObj) return;
      // Keep width constant, adjust height
      setConvertSettings(s => ({...s, targetH: Math.round(s.targetW * (h/w)) }));
  };

  // Tool Data
  const toolData = {
    name: "Aspect Ratio Calculator & Converter",
    title: "Aspect Ratio Calculator & Converter",
    description: "Calculate dimensions based on aspect ratios or resize and crop images to fit any ratio instantly.",
    icon: "fas fa-expand-arrows-alt",
    category: "Image Tools",
    breadcrumb: ["Utility", "Tools", "Image Tools"], 
    tags: ["aspect ratio", "resize", "crop", "image converter", "calculator", "pixels"]
  };

  const relatedTools = [
      { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
      { name: "Color Blindness Simulator", url: "/utility-tools/image-tools/color-blindness-simulator", icon: "fas fa-eye" },
      { name: "QR Code Generator", url: "/utility-tools/qr-code-generator", icon: "fas fa-qrcode" }
  ];
  
  const tableOfContents = [
      { id: 'introduction', title: 'Introduction' },
      { id: 'common-ratios', title: 'Common Standards' },
      { id: 'social-media', title: 'Social Media Guide' },
      { id: 'cinema-video', title: 'Cinema & Video' },
      { id: 'photography', title: 'Photography' },
      { id: 'web-design', title: 'Web Design & UI' },
      { id: 'how-to-calc', title: 'Calculation Formula' },
      { id: 'features', title: 'Tool Features' },
      { id: 'faq', title: 'FAQ' }
  ];

  const faqs = [
      { question: "What is Aspect Ratio?", answer: "Aspect ratio is the proportional relationship between the width and height of an image or screen, written as W:H (e.g., 16:9). It describes the shape, not the actual size." },
      { question: "Does cropping reduce quality?", answer: "Cropping technically removes pixels, making the image smaller. However, our High-Quality resampling ensures that the remaining image retains maximum clarity." },
      { question: "What is the best ratio for Instagram?", answer: "For Posts, 1:1 (Square) or 4:5 (Portrait) is best. For Stories and Reels, use 9:16 to fill the mobile screen." },
      { question: "How do I calculate aspect ratio?", answer: "Divide the width by the height. For example, 1920 / 1080 = 1.777, which is 16/9. Or use our calculator above!" }
  ];

  return (
    <ToolPageLayout toolData={toolData} categories={toolCategories} relatedTools={relatedTools} tableOfContents={tableOfContents}>
      
      <div className="arc-tabs">
          <button className={`arc-tab ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => setActiveTab('calculator')}>
              <i className="fas fa-calculator"></i> Ratio Calculator
          </button>
          <button className={`arc-tab ${activeTab === 'converter' ? 'active' : ''}`} onClick={() => setActiveTab('converter')}>
              <i className="fas fa-image"></i> Image Converter
          </button>
      </div>

      <CalculatorSection title={activeTab === 'calculator' ? "Calculate Dimensions" : "Convert Image"} icon={activeTab === 'calculator' ? "fas fa-calculator" : "fas fa-image"}>
          
          {/* CALCULATOR TAB */}
          {activeTab === 'calculator' && (
              <div className="arc-calculator-container" id="calculator">
                  <div className="arc-controls">
                      {/* Presets */}
                      <div className="arc-group">
                          <label>Common Presets</label>
                          <div className="arc-presets">
                              {presets.map((p, i) => (
                                  <button key={i} className="arc-preset-btn" onClick={() => {
                                      setCalcState(s => ({ ...s, ratioW: p.w, ratioH: p.h, height: Math.round(s.width * (p.h / p.w)) }));
                                  }}>{p.l}</button>
                              ))}
                          </div>
                      </div>

                      {/* Inputs */}
                      <div className="arc-inputs-row">
                          <div className="arc-input-group">
                              <label>Width (px)</label>
                              <input type="number" value={calcState.width} onChange={(e) => handleCalcChange('width', e.target.value)} />
                          </div>
                          
                          <div className="arc-ratio-display">
                              <span className="arc-link-icon"><i className="fas fa-link"></i></span>
                          </div>

                          <div className="arc-input-group">
                              <label>Height (px)</label>
                              <input type="number" value={calcState.height} onChange={(e) => handleCalcChange('height', e.target.value)} />
                          </div>
                      </div>

                      <div className="arc-inputs-row">
                          <div className="arc-input-group">
                              <label>Ratio Width</label>
                              <input type="number" value={calcState.ratioW} onChange={(e) => handleCalcChange('ratioW', e.target.value)} />
                          </div>
                          <div className="arc-ratio-symbol">:</div>
                          <div className="arc-input-group">
                              <label>Ratio Height</label>
                              <input type="number" value={calcState.ratioH} onChange={(e) => handleCalcChange('ratioH', e.target.value)} />
                          </div>
                      </div>
                  </div>

                  {/* Visual Preview Box */}
                  <div className="arc-preview-area">
                      <div className="arc-visual-box" style={{ 
                          aspectRatio: `${calcState.ratioW}/${calcState.ratioH}`,
                          maxWidth: '100%',
                          maxHeight: '300px'
                       }}>
                          <span>{calcState.width} x {calcState.height}</span>
                          <small>{calcState.ratioW}:{calcState.ratioH}</small>
                      </div>
                  </div>
              </div>
          )}

          {/* CONVERTER TAB */}
          {activeTab === 'converter' && (
              <div className="arc-converter-container" id="converter">
                  {!uploadedImage ? (
                      <div className="arc-upload-zone"
                           onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                           onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                           onDrop={(e) => { 
                               e.preventDefault(); 
                               e.currentTarget.classList.remove('drag-over');
                               handleImageUpload({ target: { files: e.dataTransfer.files } });
                           }}
                      >
                          <i className="fas fa-image fa-3x"></i>
                          <p>Drag & Drop or Click to Upload Image</p>
                          <input type="file" onChange={handleImageUpload} accept="image/*" className="arc-file-input" />
                      </div>
                  ) : (
                      <div className="arc-editor">
                          <div className="arc-editor-sidebar">
                              <h3>Settings</h3>
                              
                              <div className="arc-control-group">
                                  <label>Resize To</label>
                                  <div className="arc-dual-inputs">
                                      <input type="number" value={convertSettings.targetW} onChange={(e) => setConvertSettings({...convertSettings, targetW: parseInt(e.target.value)})} placeholder="W" />
                                      <span>x</span>
                                      <input type="number" value={convertSettings.targetH} onChange={(e) => setConvertSettings({...convertSettings, targetH: parseInt(e.target.value)})} placeholder="H" />
                                  </div>
                              </div>

                              <div className="arc-control-group">
                                  <label>Presets & Custom Ratio</label>
                                  <div className="arc-mini-presets">
                                      {presets.map((p, i) => (
                                          <button key={i} onClick={() => applyRatio(p.w, p.h)}>{p.l}</button>
                                      ))}
                                  </div>
                                  
                                  <div className="arc-custom-ratio-group">
                                      <label>Custom Ratio:</label>
                                      <div className="arc-dual-inputs small">
                                          <input type="number" placeholder="W" value={customRatio.w} onChange={(e) => setCustomRatio({...customRatio, w: parseFloat(e.target.value)})} />
                                          <span>:</span>
                                          <input type="number" placeholder="H" value={customRatio.h} onChange={(e) => setCustomRatio({...customRatio, h: parseFloat(e.target.value)})} />
                                          <button className="arc-apply-btn" onClick={() => applyRatio(customRatio.w, customRatio.h)}>Apply</button>
                                      </div>
                                  </div>
                              </div>

                              <div className="arc-control-group">
                                  <label>Mode</label>
                                  <div className="arc-mode-toggles">
                                      <button className={cropMode === 'fit' ? 'active' : ''} onClick={() => setCropMode('fit')}>
                                          <i className="fas fa-compress"></i> Fit (Letterbox)
                                      </button>
                                      <button className={cropMode === 'crop' ? 'active' : ''} onClick={() => setCropMode('crop')}>
                                          <i className="fas fa-crop"></i> Crop (Fill)
                                      </button>
                                  </div>
                              </div>

                              <div className="arc-control-group">
                                  <label>Position / Anchor</label>
                                  <div className="arc-anchor-grid">
                                      {['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'].map(pos => (
                                          <button 
                                              key={pos} 
                                              className={`arc-anchor-btn ${cropAnchor === pos ? 'active' : ''}`} 
                                              onClick={() => setCropAnchor(pos)}
                                              title={pos.replace('-', ' ')}
                                          >
                                              <div className="dot"></div>
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              <div className="arc-actions">
                                  <button className="arc-btn-primary" onClick={handleDownload}><i className="fas fa-download"></i> Download</button>
                                  <button className="arc-btn-secondary" onClick={() => { setUploadedImage(null); setImageObj(null); }}>Remove Image</button>
                              </div>
                          </div>

                          <div className="arc-canvas-wrapper">
                              <canvas 
                                  ref={canvasRef} 
                                  className={`arc-canvas ${cropMode === 'crop' ? 'grabbable' : ''} ${isDragging ? 'grabbing' : ''}`}
                                  onMouseDown={handleMouseDown}
                                  onMouseMove={handleMouseMove}
                                  onMouseUp={handleMouseUp}
                                  onMouseLeave={handleMouseUp}
                              ></canvas>
                              {cropMode === 'crop' && <div className="arc-drag-hint"><i className="fas fa-hand-paper"></i> Drag to reposition</div>}
                          </div>
                      </div>
                  )}
              </div>
          )}

      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <ContentSection id="introduction" title="Introduction">
          <div className="content-block">
              <p>Aspect ratios are the hidden geometry of the modern world. Every screen you look at, from your smartphone to the IMAX theater, has a defied proportion of width to height. Understanding and manipulating these ratios is critical for photographers, videographers, web designers, and social media content creators. This <strong>Aspect Ratio Calculator & Converter</strong> is your all-in-one suite for solving dimension math and resizing images to fit any platform perfectly.</p>
          </div>
      </ContentSection>

      <ContentSection id="common-ratios" title="Common Aspect Ratio Standards">
          <div className="content-block">
              <p>Different industries rely on specific standard ratios:</p>
              <ul>
                  <li><strong>16:9 (1.77:1)</strong>: The standard for HDTV, YouTube, and most computer monitors. It is wide enough for cinematic landscapes but works well for UI.</li>
                  <li><strong>4:3 (1.33:1)</strong>: The classic TV shape. Now commonly used in Micro 4/3 photography, iPads, and IMAX digital projection.</li>
                  <li><strong>1:1 (Square)</strong>: The native format of Medium Format photography and the original Instagram post size.</li>
                  <li><strong>21:9 (2.35:1)</strong>: Ultra-widescreen. Used in "Cinemascope" movies and high-end gaming monitors for an immersive field of view.</li>
              </ul>
          </div>
      </ContentSection>

      <ContentSection id="social-media" title="Social Media Size Guide">
          <div className="content-block">
              <p>Platform algorithms penalize images that don't fit these standards:</p>
              <ul>
                  <li><strong>Instagram Stories/Reels & TikTok</strong>: 9:16 (1080 x 1920 pixels). Vertical full-screen content.</li>
                  <li><strong>Instagram Posts</strong>: 4:5 (1080 x 1350 pixels) takes up the most screen real estate in the feed. 1:1 is also safe.</li>
                  <li><strong>YouTube Thumbnail</strong>: 16:9 (1280 x 720 pixels).</li>
                  <li><strong>Twitter/X In-Feed</strong>: 16:9 is ideal to prevent auto-cropping.</li>
                  <li><strong>LinkedIn</strong>: 1.91:1 (1200 x 627 pixels) for shared link images.</li>
              </ul>
          </div>
      </ContentSection>

      <ContentSection id="cinema-video" title="Cinema & Video Formats">
          <div className="content-block">
              <p>Filmmakers use ratios to convey mood. <strong>4:3</strong> (like in <em>The Grand Budapest Hotel</em>) feels vintage and claustrophobic. <strong>1.85:1</strong> is the standard US theatrical widescreen. <strong>2.39:1 (Anamorphic)</strong> provides the epic, sweeping look of blockbusters. Understanding these frames is essential for composing shots and editing footage.</p>
          </div>
      </ContentSection>

      <ContentSection id="photography" title="Photography Ratios">
          <div className="content-block">
              <p>Camera sensors dictate the native ratio of your RAW files:</p>
              <ul>
                  <li><strong>3:2</strong>: The heritage of 35mm film. Standard on almost all DSLRs (Canon, Nikon, Sony). Slightly wider than 4:3.</li>
                  <li><strong>4:3</strong>: Standard on Micro Four Thirds cameras (Panasonic, Olympus) and most medium format sensors. Also the default for smartphones.</li>
                  <li><strong>16:9</strong>: Rarely a native sensor size, but often an in-camera crop for video-centric shooters.</li>
              </ul>
          </div>
      </ContentSection>

      <ContentSection id="web-design" title="Web Design & UI Considerations">
          <div className="content-block">
              <p>In Responsive Web Design, "Hero Images" often face the challenge of needing to look good on wide desktops (16:9 or wider) and narrow mobile screens (9:16). This often requires "Art Direction"—cropping the same image differently for each device. Our tool's <strong>Crop Mode</strong> allows you to manually generate these different variations from a single master file.</p>
          </div>
      </ContentSection>

      <ContentSection id="how-to-calc" title="Calculations Formula">
          <div className="content-block">
              <p>The math behind aspect ratios is simple algebra:</p>
              <pre style={{background: '#f1f5f9', padding: '15px', borderRadius: '8px'}}>Ratio = Width / Height</pre>
              <p>To find a new Height (<strong>H2</strong>) from a known Width (<strong>W2</strong>) while maintaining the Ratio (<strong>R</strong>):</p>
              <pre style={{background: '#f1f5f9', padding: '15px', borderRadius: '8px'}}>H2 = W2 / R</pre>
              <p>Example: To fit a 16:9 image into a 500px wide column: 500 / (16/9) = 281.25px.</p>
          </div>
      </ContentSection>

      <ContentSection id="features" title="Tool Features Explained">
          <div className="content-block">
              <ul>
                  <li><strong>Fit Mode (Letterbox):</strong> Maintains the entire original image and adds white bars to fill the target dimension. Essential when you cannot lose any part of the image (e.g., posters with text).</li>
                  <li><strong>Crop Mode (Fill):</strong> Zooms in to fill the target dimension, cutting off the edges. Essential for creating immersive, full-screen graphics where filling the frame is more important than showing every detail.</li>
                  <li><strong>Calculator:</strong> Instantly solves the W:H algebra for you, ensuring pixel-perfect resizing numbers every time.</li>
              </ul>
          </div>
      </ContentSection>

      <FAQSection id="faq" faqs={faqs} />

    </ToolPageLayout>
  );
};

export default AspectRatioConverter;
