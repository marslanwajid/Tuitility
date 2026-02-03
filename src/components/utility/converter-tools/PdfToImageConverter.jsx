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
        { id: 'introduction', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'supported-formats', title: 'Supported Formats' },
        { id: 'quality-options', title: 'Quality Options' },
        { id: 'why-convert', title: 'Why Convert' },
        { id: 'features', title: 'Features' },
        { id: 'applications', title: 'Applications' },
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
                    <ContentSection id="introduction" title="What is PDF to Image Conversion?">
                        <p>
                            PDF to Image conversion is the process of transforming PDF document pages into image files (PNG, JPG, WebP).
                            This conversion allows you to extract individual pages from PDF documents and save them as standalone images
                            that can be easily shared, edited, or embedded in other documents and websites.
                        </p>
                        <p>
                            Our online converter provides a fast, secure, and high-quality solution for converting PDFs to images without
                            requiring any software installation. All processing happens directly in your browser, ensuring complete privacy
                            and security.
                        </p>
                    </ContentSection>

                    <ContentSection id="how-it-works" title="How Our PDF to Image Converter Works">
                        <p>Our converter uses advanced algorithms to process PDF pages and generate high-quality image output:</p>
                        <ol className="usage-steps">
                            <li><strong>PDF Analysis:</strong> The system analyzes your PDF document's structure, fonts, and graphics</li>
                            <li><strong>Page Rendering:</strong> Each page is rendered at your selected resolution using PDF.js technology</li>
                            <li><strong>Quality Preservation:</strong> Maintains original document quality, colors, and details</li>
                            <li><strong>Format Conversion:</strong> Converts the rendered page to your chosen image format (PNG/JPG/WebP)</li>
                            <li><strong>Download Ready:</strong> Generates a high-quality image file ready for download</li>
                        </ol>
                    </ContentSection>

                    <ContentSection id="supported-formats" title="Supported Image Formats">
                        <p>Our converter supports all major image formats for maximum flexibility:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-file-image"></i> PNG Format</h3>
                                <p>Portable Network Graphics with lossless compression and transparency support. Best for text-heavy documents, diagrams, and images requiring transparency.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-image"></i> JPEG/JPG Format</h3>
                                <p>Joint Photographic Experts Group format with efficient compression. Ideal for photographs and full-color scanned documents with smaller file sizes.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-globe"></i> WebP Format</h3>
                                <p>Modern web image format with excellent compression and quality. Perfect for websites with superior compression compared to PNG and JPG.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="quality-options" title="Conversion Quality Options">
                        <p>Choose the right quality level based on your specific needs:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-star"></i> High Quality (3x Scale)</h3>
                                <p>Best output with maximum resolution preservation. Ideal for professional documents, presentations, and printing. Larger file sizes but crystal-clear results.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-balance-scale"></i> Standard Quality (1.5x Scale)</h3>
                                <p>Balanced quality and file size, suitable for most use cases. Perfect for web use, email sharing, and general document conversion.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-compress"></i> Compressed (1x Scale)</h3>
                                <p>Smaller file size with standard resolution. Great for quick sharing, storage optimization, and mobile viewing.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="why-convert" title="Why Convert PDF to Images?">
                        <p>Converting PDFs to images offers several important benefits:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-share-alt"></i> Easy Sharing</h3>
                                <p>Share specific pages as images via social media, messaging apps, or email without sending the entire PDF document.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-edit"></i> Simple Editing</h3>
                                <p>Edit PDF content using standard image editing tools like Photoshop, GIMP, or online editors.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-globe-americas"></i> Universal Compatibility</h3>
                                <p>Images can be viewed on any device without requiring a PDF reader application.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-code"></i> Web Integration</h3>
                                <p>Embed PDF pages directly into websites, blogs, and presentations as images.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-mobile-alt"></i> Mobile Friendly</h3>
                                <p>Images load faster and display better on mobile devices compared to PDF documents.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-archive"></i> Archival Quality</h3>
                                <p>Preserve important document pages as images for long-term storage and easy access.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="features" title="Key Features & Functionality">
                        <p>Our PDF to Image converter includes advanced features for professional results:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-sliders-h"></i> Resolution Control</h3>
                                <p>Adjust output resolution from 1x to 3x scale for perfect balance between quality and file size.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-palette"></i> Format Options</h3>
                                <p>Choose between PNG, JPG, and WebP formats based on your specific requirements.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-magic"></i> Background Removal</h3>
                                <p>Simple and AI-powered background removal options for creating transparent images.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-adjust"></i> Color Inversion</h3>
                                <p>Invert colors to create dark mode versions or achieve special visual effects.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-file-alt"></i> Page Selection</h3>
                                <p>Navigate through multi-page PDFs and convert specific pages individually.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-shield-alt"></i> Privacy First</h3>
                                <p>100% client-side processing ensures your documents never leave your device.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="applications" title="Common Applications">
                        <p>PDF to Image conversion is essential for various professional and personal uses:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-hashtag"></i> Social Media</h3>
                                <p>Convert PDF flyers, infographics, or presentations into images for Instagram, LinkedIn, Twitter, and Facebook posts.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-laptop-code"></i> Web Development</h3>
                                <p>Extract design assets, diagrams, and graphics from PDFs for use in websites and applications.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-signature"></i> Digital Signatures</h3>
                                <p>Extract signatures from scanned PDFs to use in other digital documents and forms.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-presentation"></i> Presentations</h3>
                                <p>Convert PDF slides into individual images for PowerPoint, Keynote, or Google Slides presentations.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-envelope"></i> Email Marketing</h3>
                                <p>Create email-friendly images from PDF marketing materials and newsletters.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-book"></i> Documentation</h3>
                                <p>Extract specific pages from manuals, reports, or ebooks for easy reference and sharing.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <FAQSection faqs={[
                        {
                            question: "Is the conversion process secure?",
                            answer: "Yes, all files are processed securely in your browser. Your PDFs never leave your device, and we don't store any files on our servers."
                        },
                        {
                            question: "What image formats are supported?",
                            answer: "We support PNG (best quality with transparency), JPG (smaller file size), and WebP (modern format with superior compression)."
                        },
                        {
                            question: "Will my image quality be preserved?",
                            answer: "Yes, our converter maintains the original document quality. You can adjust the resolution scale (1x to 3x) to control the output quality and file size."
                        },
                        {
                            question: "Can I convert multiple pages at once?",
                            answer: "Currently, you can navigate through pages and download them individually. This ensures the highest quality for each converted page."
                        },
                        {
                            question: "How long does conversion take?",
                            answer: "Most conversions complete instantly (under 2 seconds per page), depending on the PDF complexity and your selected resolution."
                        },
                        {
                            question: "What if the conversion fails?",
                            answer: "Ensure your PDF isn't password-protected and is under 50MB. Try refreshing the page and uploading again. For very large files, try reducing the resolution scale."
                        }
                    ]} />
                </div>

            </ToolPageLayout>
        </>
    );
};

export default PdfToImageConverter;
