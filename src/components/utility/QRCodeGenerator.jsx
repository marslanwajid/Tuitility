import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import '../../assets/css/utility/qr-code-generator.css';

const QRCodeGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [transparentBg, setTransparentBg] = useState(false);
  const qrRef = useRef();

  const handleDownload = (format) => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.download = `qrcode.${format}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target.result);
      reader.readAsDataURL(file);
      setIncludeLogo(true);
    }
  };

  const toolData = {
    name: "QR Code Generator",
    title: "QR Code Generator",
    description: "Create professional QR codes instantly. Customize colors, add logos, and download in multiple formats with optional transparent backgrounds.",
    icon: "fas fa-qrcode",
    category: "Utility",
    breadcrumb: ["Utility", "Tools", "QR Code Generator"],
    tags: ["qr", "code", "generator", "barcode", "link"],
    lastUpdated: "2024-01-20"
  };

  const categories = [
    { name: "Utility Tools", url: "/utility-tools", icon: "fas fa-tools" }
  ];

  const relatedTools = [
     { name: "Password Generator", url: "/utility-tools/password-generator", icon: "fas fa-key" },
     { name: "Word Counter", url: "/utility-tools/word-counter", icon: "fas fa-font" }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
      tableOfContents={[]}
    >
      <CalculatorSection title="QR Code Generator" icon="fas fa-qrcode">
        <div className="qr-generator-container">
          <div className="qr-controls">
            <div className="qr-input-group">
              <label>Content</label>
              <textarea
                placeholder="Enter URL or text..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="qr-input-text"
              />
            </div>

            <div className="qr-options-grid">
               <div className="qr-input-group">
                <label>Size (px)</label>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  min={128}
                  max={2048}
                  className="qr-input-number"
                />
              </div>
              
              <div className="qr-input-group">
                 <label>Foreground</label>
                 <div className="color-picker-wrapper">
                   <input 
                     type="color" 
                     value={fgColor} 
                     onChange={(e) => setFgColor(e.target.value)} 
                   />
                   <span>{fgColor}</span>
                 </div>
              </div>

              <div className="qr-input-group">
                 <label>Background</label>
                 <div className="color-picker-wrapper">
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)}
                      disabled={transparentBg}
                    />
                    <span>{transparentBg ? 'Transparent' : bgColor}</span>
                 </div>
              </div>
            </div>
            
            <div className="qr-toggles">
                <label className="qr-checkbox">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                  />
                  Transparent Background
                </label>
            </div>

            <div className="qr-logo-upload">
               <label className="qr-section-title">Logo Overlay (Optional)</label>
               <input type="file" accept="image/*" onChange={handleLogoUpload} className="qr-file-input"/>
            </div>
          </div>

          <div className="qr-preview-section">
            <div className="qr-canvas-wrapper" ref={qrRef}>
               {inputText ? (
                  <QRCodeCanvas
                    value={inputText}
                    size={size}
                    bgColor={transparentBg ? 'transparent' : bgColor}
                    fgColor={fgColor}
                    level="H"
                    includeMargin={true}
                    imageSettings={includeLogo && logoUrl ? {
                      src: logoUrl,
                      x: undefined,
                      y: undefined,
                      height: size * 0.2,
                      width: size * 0.2,
                      excavate: true,
                    } : undefined}
                  />
               ) : (
                 <div className="qr-placeholder">
                    <i className="fas fa-qrcode"></i>
                    <p>Enter text to generate</p>
                 </div>
               )}
            </div>
            
            {inputText && (
              <div className="qr-actions">
                <button onClick={() => handleDownload('png')} className="qr-btn primary">
                  <i className="fas fa-download"></i> PNG
                </button>
                <button onClick={() => handleDownload('webp')} className="qr-btn secondary">
                  <i className="fas fa-download"></i> WebP
                </button>
              </div>
            )}
          </div>
        </div>
      </CalculatorSection>
    </ToolPageLayout>
  );
};

export default QRCodeGenerator;
