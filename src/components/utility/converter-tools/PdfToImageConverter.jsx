import React, { useState, useRef, useEffect } from 'react';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import TableOfContents from '../../tool/TableOfContents';
import FeedbackForm from '../../tool/FeedbackForm';
import Seo from '../../Seo';
import '../../../assets/css/utility/converter-tools/pdf-to-image.css';

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';

// Import worker directly for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Import AI Background Removal
import { removeBackground } from '@imgly/background-removal';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfToImageConverter = () => {
    // State
    const [pdfDoc, setPdfDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [processingAI, setProcessingAI] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState('');
    const [settings, setSettings] = useState({
        format: 'png',
        quality: 0.9,
        scale: 1.5,
        invertColors: false,
        backgroundMode: 'none' // 'none', 'simple', 'ai'
    });

    // Refs
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Constants
    const toolData = {
        name: 'PDF to Image Converter',
        description: 'Convert PDF pages to high-quality images (PNG, JPG). Free, fast, and secure - files are processed entirely in your browser.',
        icon: 'fas fa-file-image',
        category: 'Utility',
        breadcrumb: ['Utility', 'Converter Tools', 'PDF to Image']
    };

    const seoData = {
        title: 'PDF to Image Converter - Free Online Tool | Tuitility',
        description: 'Convert PDF documents to images (JPG, PNG) instantly. Free online tool, no upload required, works 100% in your browser.',
        keywords: 'pdf to image, pdf to jpg, pdf to png, pdf converter, free pdf tool',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/pdf-to-image-converter'
    };

    const categories = [
        { name: 'Utility Tools', url: '/utility-tools', icon: 'fas fa-tools' },
        { name: 'Math Calculators', url: '/math', icon: 'fas fa-calculator' },
        { name: 'Finance Calculators', url: '/finance', icon: 'fas fa-dollar-sign' },
        { name: 'Health Calculators', url: '/health', icon: 'fas fa-heartbeat' },
        { name: 'Knowledge Tools', url: '/knowledge', icon: 'fas fa-brain' },
        { name: 'Science Calculators', url: '/science', icon: 'fas fa-flask' }
    ];

    const relatedTools = [
        { name: 'OCR PDF Generator', url: '/utility-tools/ocr-pdf-generator', icon: 'fas fa-file-pdf' },
        { name: 'Image to WebP', url: '/utility-tools/image-tools/image-to-webp-converter', icon: 'fas fa-image' },
        { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' }
    ];

    const tableOfContents = [
        { id: 'converter', title: 'Converter' },
        { id: 'how-to', title: 'How to Use' },
        { id: 'features', title: 'Features' },
        { id: 'faqs', title: 'FAQs' }
    ];

    // Handlers
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) processFile(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('highlight');
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('highlight');
    };

    const processFile = async (file) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setLoading(true);
        setError(null);
        setFileName(file.name);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            setPdfDoc(loadedPdf);
            setTotalPages(loadedPdf.numPages);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF. The file might be corrupted or password protected.');
        } finally {
            setLoading(false);
        }
    };

    const renderPage = async () => {
        if (!pdfDoc || !canvasRef.current) return;

        setLoading(true);
        if (settings.backgroundMode === 'ai') setProcessingAI(true);

        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale: settings.scale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d', { willReadFrequently: true });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            // 1. Invert Colors (if active)
            if (settings.invertColors) {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];     // R
                    data[i + 1] = 255 - data[i + 1]; // G
                    data[i + 2] = 255 - data[i + 2]; // B
                }
                context.putImageData(imageData, 0, 0);
            }

            // 2. Background Removal
            if (settings.backgroundMode === 'simple') {
                // Improved Manual Algorithm
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const tolerance = 40; // Tolerance for "near white"

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    let alpha = 255;

                    if (settings.invertColors) {
                        // Remove Black (near 0) if inverted
                        if (r < tolerance && g < tolerance && b < tolerance) {
                            const dist = Math.max(r, g, b);
                            alpha = Math.max(0, (dist / tolerance) * 255);
                        }
                    } else {
                        // Remove White (near 255)
                        if (r > (255 - tolerance) && g > (255 - tolerance) && b > (255 - tolerance)) {
                            const dist = Math.max(255 - r, 255 - g, 255 - b);
                            alpha = Math.max(0, (dist / tolerance) * 255);
                        }
                    }

                    if (alpha < 255) {
                        data[i + 3] = alpha;
                    }
                }
                context.putImageData(imageData, 0, 0);

            } else if (settings.backgroundMode === 'ai') {
                // AI Background Removal
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

                try {
                    const imageBlob = await removeBackground(blob);
                    const img = new Image();
                    img.src = URL.createObjectURL(imageBlob);
                    await new Promise((resolve) => {
                        img.onload = () => {
                            context.clearRect(0, 0, canvas.width, canvas.height);
                            context.drawImage(img, 0, 0);
                            URL.revokeObjectURL(img.src);
                            resolve();
                        };
                    });
                } catch (aiErr) {
                    console.error("AI Removal Failed:", aiErr);
                    setError("AI Background Removal failed. Using simple mode might work better for this file.");
                }
            }

        } catch (err) {
            console.error('Error rendering page:', err);
            setError('Error rendering page.');
        } finally {
            setLoading(false);
            setProcessingAI(false);
        }
    };

    // Effect to re-render when page or doc changes
    useEffect(() => {
        if (pdfDoc) {
            renderPage();
        }
    }, [pdfDoc, currentPage, settings.scale, settings.backgroundMode, settings.invertColors]);

    const handleDownload = () => {
        if (!canvasRef.current) return;

        const link = document.createElement('a');
        const imageType = settings.format === 'jpg' ? 'image/jpeg' : (settings.format === 'webp' ? 'image/webp' : 'image/png');
        const extension = settings.format; // jpg, png, or webp

        // Create clean filename: original-page-X.ext
        const baseName = fileName.replace('.pdf', '').replace(/\s+/g, '-').toLowerCase();
        link.download = `${baseName}-page-${currentPage}.${extension}`;

        link.href = canvasRef.current.toDataURL(imageType, settings.quality);
        link.click();
    };

    const handleReset = () => {
        setPdfDoc(null);
        setFileName('');
        setTotalPages(0);
        setCurrentPage(1);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSettings({
            format: 'png',
            quality: 0.9,
            scale: 1.5,
            invertColors: false,
            backgroundMode: 'none'
        });
    };

    return (
        <>
            <Seo {...seoData} />
            <ToolPageLayout
                toolData={toolData}
                categories={categories}
                relatedTools={relatedTools}
                tableOfContents={tableOfContents}
            >
                <CalculatorSection title="" id="converter">
                    <div className="pdf-converter-container">

                        {!pdfDoc ? (
                            // Upload State
                            <div className="pdf-upload-section">
                                <div
                                    className="pdf-drop-zone"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <h3>Drag & Drop PDF here</h3>
                                    <p>or click to browse files</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="application/pdf"
                                        hidden
                                    />
                                    <button className="pdf-upload-btn">
                                        Choose File
                                    </button>
                                </div>
                                {error && <div className="error-message" style={{ color: '#dc2626', marginTop: '1rem' }}>{error}</div>}
                            </div>
                        ) : (
                            // Editing/Preview State
                            <div className="pdf-interface-container">

                                {/* Left Sidebar: Controls */}
                                <div className="pdf-controls-sidebar">
                                    <div className="pdf-file-info">
                                        <i className="fas fa-file-pdf pdf-file-icon"></i>
                                        <div className="pdf-filename" title={fileName}>{fileName}</div>
                                    </div>

                                    {/* Page Selection */}
                                    <div className="pdf-control-group">
                                        <label className="pdf-control-label">Page Selection</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button
                                                className="pdf-reset-btn"
                                                style={{ width: 'auto' }}
                                                disabled={currentPage <= 1 || loading}
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                            <span style={{ flex: 1, textAlign: 'center', fontWeight: '500' }}>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                className="pdf-reset-btn"
                                                style={{ width: 'auto' }}
                                                disabled={currentPage >= totalPages || loading}
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="pdf-control-group">
                                        <label className="pdf-control-label">Export Format</label>
                                        <select
                                            className="pdf-select-input"
                                            value={settings.format}
                                            onChange={(e) => setSettings({ ...settings, format: e.target.value })}
                                        >
                                            <option value="png">PNG (High Quality)</option>
                                            <option value="jpg">JPG (Smaller Size)</option>
                                            <option value="webp">WebP (Modern Web)</option>
                                        </select>
                                    </div>

                                    <div className="pdf-control-group">
                                        <label className="pdf-control-label">Background Removal</label>
                                        <select
                                            className="pdf-select-input"
                                            value={settings.backgroundMode}
                                            onChange={(e) => setSettings({ ...settings, backgroundMode: e.target.value })}
                                        >
                                            <option value="none">No Removal (Original)</option>
                                            <option value="simple">Simple (Instant - Remove White)</option>
                                            <option value="ai">AI Removal (High Quality - Slower)</option>
                                        </select>
                                    </div>

                                    <div className="pdf-control-group">
                                        <div className="pdf-toggle-group">
                                            <span className="pdf-toggle-label">Invert Colors</span>
                                            <label className="pdf-toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.invertColors}
                                                    onChange={(e) => setSettings({ ...settings, invertColors: e.target.checked })}
                                                />
                                                <span className="pdf-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pdf-control-group">
                                        <label className="pdf-control-label">Resolution (Scale: {settings.scale}x)</label>
                                        <input
                                            type="range"
                                            className="pdf-range-input"
                                            min="1"
                                            max="3"
                                            step="0.5"
                                            value={settings.scale}
                                            onChange={(e) => setSettings({ ...settings, scale: parseFloat(e.target.value) })}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280' }}>
                                            <span>Low (1x)</span>
                                            <span>High (3x)</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pdf-actions">
                                        <button
                                            className="pdf-main-action-btn"
                                            onClick={handleDownload}
                                            disabled={loading}
                                        >
                                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-download"></i>}
                                            Download Image
                                        </button>
                                        <button className="pdf-reset-btn" onClick={handleReset}>
                                            Upload Different PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Preview Area */}
                                <div className="pdf-preview-area">
                                    {loading && (
                                        <div className="pdf-skeleton-loader" style={{ position: 'relative' }}>
                                            {processingAI && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    textAlign: 'center',
                                                    color: '#374151'
                                                }}>
                                                    <i className="fas fa-magic fa-spin fa-2x" style={{ marginBottom: '10px' }}></i>
                                                    <p>AI Removing Background...<br />(First time load may happen)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="pdf-canvas-container" style={{ display: loading ? 'none' : 'block' }}>
                                        <canvas ref={canvasRef}></canvas>
                                    </div>
                                </div>


                            </div>
                        )}

                    </div>
                </CalculatorSection>

                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                <div className="pdf-converter-content">
                    <ContentSection id="how-to" title="How to Convert PDF to Image">
                        <ul className="usage-steps">
                            <li><strong>Upload:</strong> Drag and drop your PDF file into the upload box or click to select from your device.</li>
                            <li><strong>Select Page:</strong> Use the navigation controls to find the specific page you want to convert.</li>
                            <li><strong>Adjust Settings:</strong> Choose between PNG (better quality) or JPG (smaller file size) and adjust resolution.</li>
                            <li><strong>Background Features:</strong> Use 'Simple' mode for instant white background removal, or 'AI Removal' for complex images.</li>
                            <li><strong>Download:</strong> Click the "Download Image" button to save the current page to your device.</li>
                        </ul>
                    </ContentSection>

                    <ContentSection id="formats-guide" title="Image Formats Guide: PNG vs JPG vs WebP">
                        <p>Choosing the right format is crucial for your needs. Here is a quick guide:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3>PNG (Portable Network Graphics)</h3>
                                <p><strong>Best for:</strong> Text-heavy documents, diagrams, and images requiring transparency.</p>
                                <p>PNG is a lossless format, meaning no quality is lost during conversion. It supports transparent backgrounds, making it ideal for logos and design assets.</p>
                            </div>
                            <div className="application-item">
                                <h3>JPG (JPEG)</h3>
                                <p><strong>Best for:</strong> Photographs and full-color scanned documents.</p>
                                <p>JPG offers smaller file sizes through compression. While it doesn't support transparency, it's widely compatible and great for sharing photos or documents via email.</p>
                            </div>
                            <div className="application-item">
                                <h3>WebP (Modern Web Format)</h3>
                                <p><strong>Best for:</strong> Websites and web applications.</p>
                                <p>WebP provides superior compression and quality compared to both PNG and JPG. It supports transparency and is favored by Google for faster website loading speeds.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="features" title="Why Use This Tool?">
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-shield-alt"></i> 100% Secure</h3>
                                <p>Your files never leave your browser. All processing happens locally on your device.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-bolt"></i> High Quality</h3>
                                <p>Render PDFs at high resolution (up to 3x scale) for crisp, clear images.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-money-bill-wave"></i> Completely Free</h3>
                                <p>No daily limits, no watermarks, and no registration required.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="advanced-features" title="Advanced Features">
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-magic"></i> Transparent Background</h3>
                                <p>Automatically remove white backgrounds from your PDF pages, making them perfect for logos, signatures, and overlay graphics.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-adjust"></i> Dark Mode (Invert)</h3>
                                <p>Invert colors to create a "dark mode" version of your document, ideal for comfortable reading at night or creating distinct visual styles.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-layer-group"></i> WebP Support</h3>
                                <p>Export to the modern WebP format for superior compression and web performance, significantly smaller than PNG without quality loss.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="use-cases" title="Common Use Cases">
                        <ul className="usage-steps">
                            <li><strong>Social Media Content:</strong> Convert PDF flyers or infographics into images for Instagram, LinkedIn, or Twitter posts.</li>
                            <li><strong>Web Development:</strong> Extract assets from design PDFs with transparency for use in websites.</li>
                            <li><strong>E-Signature:</strong> Extract your signature from a scanned PDF to use in other digital documents.</li>
                            <li><strong>Presentation:</strong> Turn PDF slides into individual images for PowerPoint or Keynote presentations.</li>
                            <li><strong>Archiving:</strong> Save important document pages as images for easy viewing on mobile devices without a PDF reader.</li>
                        </ul>
                    </ContentSection>

                    <ContentSection id="troubleshooting" title="Troubleshooting Common Issues">
                        <ul className="usage-steps">
                            <li><strong>File Not Loading?</strong> Ensure your PDF is not password-protected. Try removing the password and uploading again.</li>
                            <li><strong>Blurry Images?</strong> unexpected blurry results usually mean the resolution is too low. Increase the "Resolution" slider to 2x or 3x for sharper text.</li>
                            <li><strong>Background Removal Failed?</strong> The 'Simple' mode works best on pure white backgrounds. For scanned papers or complex scenes, switch to 'AI Removal' mode.</li>
                            <li><strong>Browser Slow?</strong> Very large PDF files (over 50MB) can tax your browser's memory. Try converting one page at a time.</li>
                        </ul>
                    </ContentSection>

                    <ContentSection id="privacy" title="Privacy & Security Assurance">
                        <p>In an era of data breaches, we prioritize your security above all else. Unlike other "free" converters that upload your sensitive documents to cloud servers, <strong>Tuitility performs all conversions locally on your device.</strong></p>
                        <p>This means:</p>
                        <ul>
                            <li>Your PDF never leaves your computer.</li>
                            <li>No temporary files are stored on our servers.</li>
                            <li>No employees or bots can access your content.</li>
                            <li>You can even use this tool while offline!</li>
                        </ul>
                    </ContentSection>

                    <ContentSection id="technical-details" title="Technical Accuracy">
                        <p>Our tool uses the same rendering engine as Mozilla Firefox's built-in PDF viewer (PDF.js). This ensures that fonts, vectors, and complex layouts are rendered exactly as they appear in the original document. By processing files on your device (Client-Side Rendering), we eliminate network latency and server-side risks.</p>
                    </ContentSection>

                    <FAQSection faqs={[
                        {
                            question: "Is it safe to use this converter?",
                            answer: "Yes, absolutely! Since the conversion happens entirely within your web browser, your files are never uploaded to any server. Your privacy is guaranteed."
                        },
                        {
                            question: "Can I convert all pages at once?",
                            answer: "Currently, this tool is designed to preview and download pages one by one to ensure the highest quality. We are working on a bulk download feature."
                        },
                        {
                            question: "What is the difference between PNG and JPG?",
                            answer: "PNG is a lossless format, meaning it preserves all image quality and transparency, but results in larger file sizes. JPG is compressed, which creates smaller files but may slightly reduce quality. Use PNG for text and screenshots, and JPG for photos."
                        },
                        {
                            question: "Why is the file size limit 50MB?",
                            answer: "To ensure the browser remains responsive while processing the PDF file. Larger files might crash the browser tab during rendering."
                        }
                    ]} />
                </div>

            </ToolPageLayout>
        </>
    );
};

export default PdfToImageConverter;
