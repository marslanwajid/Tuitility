import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/utility/qr-code-generator.css';
import { toolCategories } from '../../data/toolCategories';

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
    lastUpdated: "2024-01-20",
    seoTitle: 'QR Code Generator for Links, Text, Branding, and Downloads | Tuitility',
    seoDescription: 'Generate custom QR codes for URLs and text, change colors, add logo overlays, and download high-quality PNG or WebP QR images online.',
    seoKeywords: [
      'qr code generator',
      'custom qr code maker',
      'qr code with logo',
      'download qr code png',
      'free qr code creator',
      'url qr code generator',
    ],
    canonicalUrl: 'https://tuitility.vercel.app/utility-tools/qr-code-generator',
    schemaData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'QR Code Generator',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        description: 'Online QR code generator with color customization, logo overlays, and image downloads.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'QR code creation from text or URLs',
          'Foreground and background customization',
          'Logo overlay support',
          'PNG and WebP download options',
        ],
        url: 'https://tuitility.vercel.app/utility-tools/qr-code-generator',
      },
    ],
  };

  const relatedTools = [
    { name: "Password Generator", url: "/utility-tools/password-generator", icon: "fas fa-key" },
    { name: "Word Counter", url: "/utility-tools/word-counter", icon: "fas fa-font" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'design-options', title: 'Design Options' },
    { id: 'best-practices', title: 'Best Practices' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const faqs = [
    {
      question: 'What content can I turn into a QR code?',
      answer: 'You can generate QR codes for URLs, plain text, contact details, short instructions, product links, and many other scannable text-based payloads.'
    },
    {
      question: 'Does adding a logo make scanning harder?',
      answer: 'It can if the logo is too large or removes too much code area. Keeping the logo moderate and using high error correction improves scan reliability.'
    },
    {
      question: 'Should I use a transparent background?',
      answer: 'Transparent backgrounds are useful for design flexibility, but you should still test scan quality against the final placement background before publishing.'
    },
    {
      question: 'What file format should I download?',
      answer: 'PNG is a strong default for broad compatibility, while WebP can be useful when you want smaller file sizes in web-focused workflows.'
    }
  ];

  return (
      <ToolPageLayout
        toolData={toolData}
        categories={toolCategories}
        relatedTools={relatedTools}
        tableOfContents={tableOfContents}
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
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="qr-file-input" />
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

        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>

        <ContentSection id="introduction" title="Introduction">
          <p>
            A QR code generator lets you turn text or links into scannable codes that can be used in print,
            packaging, signage, menus, product inserts, and digital campaigns. This tool focuses on both speed
            and presentation, so you can create a code and still customize how it looks.
          </p>
          <p>
            Because the generator supports color choices, logo overlays, and transparent backgrounds, it works
            well for branded use cases as well as simple utility use.
          </p>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use">
          <ol>
            <li>Enter the URL or text you want encoded in the QR code.</li>
            <li>Choose the output size and color styling.</li>
            <li>Optionally enable a transparent background or upload a logo.</li>
            <li>Preview the result and download it in PNG or WebP format.</li>
          </ol>
        </ContentSection>

        <ContentSection id="design-options" title="Design Options">
          <p>
            QR codes can be functional and still match a visual identity. This tool supports foreground and
            background color changes, size control, and logo overlays so that branded assets can remain usable
            without looking generic.
          </p>
          <ul>
            <li><strong>Size control:</strong> useful for print, posters, product cards, and screens.</li>
            <li><strong>Color customization:</strong> match campaigns while maintaining contrast.</li>
            <li><strong>Logo support:</strong> add brand recognition inside the code.</li>
            <li><strong>Transparent background:</strong> helpful for layered graphic design use.</li>
          </ul>
        </ContentSection>

        <ContentSection id="best-practices" title="QR Code Best Practices">
          <p>
            A QR code is only useful if it scans reliably. Strong contrast, sensible logo sizing, and enough
            physical space around the code all improve scan performance. It is also a good idea to test the final
            downloaded image on multiple devices before printing or publishing it widely.
          </p>
          <ul>
            <li>Use dark foregrounds on lighter backgrounds whenever possible.</li>
            <li>Keep embedded logos modest so they do not block too much code data.</li>
            <li>Test the final file after download, not just the on-screen preview.</li>
            <li>Match output size to the intended display or print environment.</li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <p>
            QR codes are used in marketing, packaging, event access, menus, payments, onboarding, and product
            support. A customizable generator is especially valuable when the code needs to work as part of a
            designed asset instead of just a plain black square.
          </p>
        </ContentSection>

        <FAQSection faqs={faqs} />

      </ToolPageLayout>
  );
};

export default QRCodeGenerator;
