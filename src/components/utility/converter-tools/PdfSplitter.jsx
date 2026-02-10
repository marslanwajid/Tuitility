import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import TableOfContents from '../../tool/TableOfContents';
import FeedbackForm from '../../tool/FeedbackForm';
import Seo from '../../Seo';
import '../../../assets/css/utility/converter-tools/pdf-splitter.css';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfSplitter = () => {
    // State
    const [file, setFile] = useState(null);
    const [pdfInfo, setPdfInfo] = useState({ numPages: 0, name: '', size: 0 });
    const [splitMode, setSplitMode] = useState('range'); // 'range', 'extract', 'every'
    const [splitConfig, setSplitConfig] = useState({
        startPage: 1,
        endPage: 1,
        selectedPages: '',
        pagesPerFile: 1
    });
    const [processing, setProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const [pagePreviews, setPagePreviews] = useState([]);
    const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);

    // Refs
    const fileInputRef = useRef(null);

    // Constants
    const toolData = {
        name: 'PDF Splitter',
        description: 'Split PDF files into multiple documents. Extract pages, split by range, or separate every page. Free and secure client-side processing.',
        icon: 'fas fa-cut',
        category: 'Utility',
        breadcrumb: ['Utility', 'Converter Tools', 'PDF Splitter']
    };

    const seoData = {
        title: 'PDF Splitter - Split PDF Pages Online Free | Tuitility',
        description: 'Split PDF files instantly. Extract pages, split by range, or separate every page. Free online tool, no upload required.',
        keywords: 'pdf splitter, split pdf, extract pdf pages, cut pdf, free pdf tool',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/split-pdf'
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
        { name: 'Merge PDF', url: '/utility-tools/converter-tools/merge-pdf', icon: 'fas fa-object-group' },
        { name: 'PDF to Image', url: '/utility-tools/converter-tools/pdf-to-image-converter', icon: 'fas fa-file-image' },
        { name: 'OCR PDF Generator', url: '/utility-tools/ocr-pdf-generator', icon: 'fas fa-file-pdf' },
        { name: 'Delete PDF Pages', url: '/utility-tools/converter-tools/delete-pdf-pages', icon: 'fas fa-trash-alt' },
        { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' }
    ];

    const tableOfContents = [
        { id: 'splitter', title: 'PDF Splitter' },
        { id: 'introduction', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'split-methods', title: 'Split Methods' },
        { id: 'features', title: 'Features' },
        { id: 'faqs', title: 'FAQs' }
    ];

    // Notification Helper
    const showNotification = (message, type = 'info') => {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            max-width: 300px;
            font-size: 0.9rem;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 4000);
    };

    const generatePreviews = async (pdf) => {
        setIsGeneratingPreviews(true);
        const previews = [];
        try {
            const numPages = pdf.numPages;
            for (let i = 1; i <= numPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.3 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context, viewport }).promise;
                    previews.push({ pageNum: i, imgData: canvas.toDataURL() });
                } catch (e) {
                    console.error(`Error rendering page ${i}`, e);
                    previews.push({ pageNum: i, imgData: null });
                }
            }
            setPagePreviews(previews);
        } catch (e) {
            console.error("Preview generation failed", e);
        } finally {
            setIsGeneratingPreviews(false);
        }
    };

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;
        const selectedFile = files[0];

        if (selectedFile.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit.');
            return;
        }

        setError(null);
        setResults([]);
        setProcessing(true);
        setProcessingMessage('Loading PDF...');

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            setFile(selectedFile);
            setPdfInfo({
                name: selectedFile.name,
                numPages: pdf.numPages,
                size: selectedFile.size
            });

            // Initialize config with valid range
            setSplitConfig(prev => ({
                ...prev,
                startPage: 1,
                endPage: pdf.numPages,
                pagesPerFile: 1
            }));

            // Generate previews
            setProcessingMessage('Generating previews...');
            await generatePreviews(pdf);

            setProcessing(false);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF. Please try again.');
            setProcessing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileSelect(files);
    };

    const parsePageNumbers = (input) => {
        const pages = new Set();
        const parts = input.split(',');
        const max = pdfInfo.numPages;

        for (let part of parts) {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (start && end && start <= end && start >= 1 && end <= max) {
                    for (let i = start; i <= end; i++) pages.add(i);
                }
            } else {
                const num = parseInt(part);
                if (num >= 1 && num <= max) pages.add(num);
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const isPageSelected = (pageNum) => {
        if (splitMode === 'extract') {
            const selected = parsePageNumbers(splitConfig.selectedPages);
            return selected.includes(pageNum);
        } else if (splitMode === 'range') {
            const { startPage, endPage } = splitConfig;
            return pageNum >= startPage && pageNum <= endPage;
        }
        return false;
    };

    const handlePageClick = (pageNum) => {
        if (splitMode !== 'extract') {
            setSplitMode('extract');
        }

        const currentSelected = parsePageNumbers(splitConfig.selectedPages);
        let newSelected;

        if (currentSelected.includes(pageNum)) {
            newSelected = currentSelected.filter(p => p !== pageNum);
        } else {
            newSelected = [...currentSelected, pageNum].sort((a, b) => a - b);
        }

        setSplitConfig(prev => ({ ...prev, selectedPages: newSelected.join(', ') }));
    };

    const selectAllPages = () => {
        setSplitMode('extract');
        const all = Array.from({ length: pdfInfo.numPages }, (_, i) => i + 1);
        setSplitConfig(prev => ({ ...prev, selectedPages: all.join(', ') }));
    };

    const clearSelection = () => {
        setSplitConfig(prev => ({ ...prev, selectedPages: '' }));
    };

    const splitPDF = async () => {
        if (!file) return;

        setProcessing(true);
        setProcessingMessage('Splitting PDF...');
        setError(null);
        setResults([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer);
            const generatedFiles = [];

            if (splitMode === 'range') {
                const { startPage, endPage } = splitConfig;
                if (startPage < 1 || endPage > pdfInfo.numPages || startPage > endPage) {
                    throw new Error('Invalid page range');
                }

                const newDoc = await PDFDocument.create();
                const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i);
                const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
                copiedPages.forEach(p => newDoc.addPage(p));

                const pdfBytes = await newDoc.save();
                generatedFiles.push({
                    name: `split_${startPage}-${endPage}_${pdfInfo.name}`,
                    blob: new Blob([pdfBytes], { type: 'application/pdf' }),
                    description: `Pages ${startPage}-${endPage}`
                });

            } else if (splitMode === 'extract') {
                const pagesToExtract = parsePageNumbers(splitConfig.selectedPages);
                if (pagesToExtract.length === 0) throw new Error('No valid pages selected');

                const newDoc = await PDFDocument.create();
                // map 1-based page numbers to 0-based indices
                const pageIndices = pagesToExtract.map(p => p - 1);
                const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
                copiedPages.forEach(p => newDoc.addPage(p));

                const pdfBytes = await newDoc.save();
                generatedFiles.push({
                    name: `extracted_pages_${pdfInfo.name}`,
                    blob: new Blob([pdfBytes], { type: 'application/pdf' }),
                    description: `Extracted ${pagesToExtract.length} pages`
                });

            } else if (splitMode === 'every') {
                const { pagesPerFile } = splitConfig;
                if (pagesPerFile < 1) throw new Error('Invalid pages per file');

                const totalPages = pdfInfo.numPages;
                for (let i = 0; i < totalPages; i += pagesPerFile) {
                    const newDoc = await PDFDocument.create();

                    // Determine range for this chunk
                    const startIdx = i;
                    const endIdx = Math.min(i + pagesPerFile, totalPages);
                    const pageIndices = [];
                    for (let j = startIdx; j < endIdx; j++) pageIndices.push(j);

                    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
                    copiedPages.forEach(p => newDoc.addPage(p));

                    const pdfBytes = await newDoc.save();
                    generatedFiles.push({
                        name: `split_part_${Math.floor(i / pagesPerFile) + 1}_${pdfInfo.name}`,
                        blob: new Blob([pdfBytes], { type: 'application/pdf' }),
                        description: `Pages ${startIdx + 1}-${endIdx}`
                    });

                    setProcessingMessage(`Processing part ${Math.floor(i / pagesPerFile) + 1}...`);
                }
            }

            setResults(generatedFiles);
            showNotification('PDF split successfully!', 'success');
        } catch (err) {
            console.error('Split Error:', err);
            setError(err.message || 'Failed to split PDF');
            showNotification('Failed to split PDF', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const downloadFile = (result) => {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadAll = async () => {
        if (results.length === 0) return;

        const zip = new JSZip();
        results.forEach(res => {
            zip.file(res.name, res.blob);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `splitted_files_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setPdfInfo({ numPages: 0, name: '', size: 0 });
        setResults([]);
        setPagePreviews([]);
        setError(null);
        setSplitConfig({ startPage: 1, endPage: 1, selectedPages: '', pagesPerFile: 1 });
    };

    // Helper formatter
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
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
                <CalculatorSection title="" id="splitter">
                    <div className="pdf-splitter-container">

                        {!file ? (
                            <div className="pdf-drop-zone"
                                onDrop={handleDrop}
                                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('highlight'); }}
                                onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('highlight'); }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <i className="fas fa-file-pdf"></i>
                                <h3>Drag & Drop PDF file here</h3>
                                <p>or click to browse</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={e => handleFileSelect(e.target.files)}
                                    accept="application/pdf"
                                    hidden
                                />
                                <button className="pdf-upload-btn">Choose File</button>
                                {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                            </div>
                        ) : (
                            <div className="pdf-interface-container">
                                {/* Left Controls */}
                                <div className="pdf-controls-sidebar">
                                    <div className="pdf-file-header">
                                        <i className="fas fa-file-pdf pdf-file-header-icon"></i>
                                        <div className="pdf-file-header-details">
                                            <h3>{pdfInfo.name.length > 20 ? pdfInfo.name.substring(0, 20) + '...' : pdfInfo.name}</h3>
                                            <p>{pdfInfo.numPages} Pages • {formatSize(pdfInfo.size)}</p>
                                        </div>
                                        <button onClick={reset} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>

                                    {/* Visual Page Selection */}
                                    <div className="visual-selection-container">
                                        <div className="visual-selection-header">
                                            <h4>
                                                <i className="fas fa-th-large" style={{ marginRight: '0.5rem' }}></i>
                                                Visual Selection
                                            </h4>
                                            <div className="selection-actions">
                                                <button className="selection-action-btn" onClick={selectAllPages}>
                                                    <i className="fas fa-check-double"></i> All
                                                </button>
                                                <button className="selection-action-btn" onClick={clearSelection}>
                                                    <i className="fas fa-eraser"></i> Clear
                                                </button>
                                            </div>
                                        </div>

                                        {isGeneratingPreviews ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                                <p>Generating previews...</p>
                                            </div>
                                        ) : (
                                            <div className="page-preview-grid">
                                                {pagePreviews.map((preview) => (
                                                    <div
                                                        key={preview.pageNum}
                                                        className={`page-thumbnail ${isPageSelected(preview.pageNum) ? 'selected' : ''}`}
                                                        onClick={() => handlePageClick(preview.pageNum)}
                                                    >
                                                        {preview.imgData ? (
                                                            <img src={preview.imgData} alt={`Page ${preview.pageNum}`} />
                                                        ) : (
                                                            <div className="page-thumbnail-placeholder">
                                                                <i className="fas fa-file"></i>
                                                            </div>
                                                        )}
                                                        <div className="page-number-badge">Page {preview.pageNum}</div>
                                                        <div className="check-overlay"><i className="fas fa-check"></i></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
                                            Click pages to select/deselect. Selection auto-activates "Extract" mode.
                                        </p>
                                    </div>

                                    <div className="split-tabs">
                                        <button
                                            className={`split-tab ${splitMode === 'range' ? 'active' : ''}`}
                                            onClick={() => setSplitMode('range')}
                                        >Range</button>
                                        <button
                                            className={`split-tab ${splitMode === 'extract' ? 'active' : ''}`}
                                            onClick={() => setSplitMode('extract')}
                                        >Extract</button>
                                        <button
                                            className={`split-tab ${splitMode === 'every' ? 'active' : ''}`}
                                            onClick={() => setSplitMode('every')}
                                        >Every X</button>
                                    </div>

                                    {splitMode === 'range' && (
                                        <div className="pdf-control-group">
                                            <label className="pdf-control-label">Range Mode</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label className="pdf-input-help">From</label>
                                                    <input
                                                        type="number"
                                                        className="pdf-input"
                                                        min="1"
                                                        max={pdfInfo.numPages}
                                                        value={splitConfig.startPage}
                                                        onChange={e => setSplitConfig({ ...splitConfig, startPage: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label className="pdf-input-help">To</label>
                                                    <input
                                                        type="number"
                                                        className="pdf-input"
                                                        min="1"
                                                        max={pdfInfo.numPages}
                                                        value={splitConfig.endPage}
                                                        onChange={e => setSplitConfig({ ...splitConfig, endPage: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {splitMode === 'extract' && (
                                        <div className="pdf-control-group">
                                            <label className="pdf-control-label">Extract Pages</label>
                                            <input
                                                type="text"
                                                className="pdf-input"
                                                placeholder="e.g. 1, 3-5, 8"
                                                value={splitConfig.selectedPages}
                                                onChange={e => setSplitConfig({ ...splitConfig, selectedPages: e.target.value })}
                                            />
                                            <span className="pdf-input-help">Enter page numbers or ranges separated by commas.</span>
                                        </div>
                                    )}

                                    {splitMode === 'every' && (
                                        <div className="pdf-control-group">
                                            <label className="pdf-control-label">Split Every X Pages</label>
                                            <input
                                                type="number"
                                                className="pdf-input"
                                                min="1"
                                                max={pdfInfo.numPages}
                                                value={splitConfig.pagesPerFile}
                                                onChange={e => setSplitConfig({ ...splitConfig, pagesPerFile: parseInt(e.target.value) })}
                                            />
                                            <span className="pdf-input-help">Break document into files of this many pages.</span>
                                        </div>
                                    )}

                                    <button
                                        className="pdf-main-action-btn"
                                        onClick={splitPDF}
                                        disabled={processing}
                                    >
                                        {processing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cut"></i>}
                                        {processing ? processingMessage : 'Split PDF'}
                                    </button>

                                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                                </div>

                                {/* Right Results */}
                                <div className="pdf-preview-area" style={{ alignItems: results.length > 0 ? 'flex-start' : 'center' }}>
                                    {results.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                            <i className="fas fa-file-pdf" style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                                            <p>Select split options and click "Split PDF" to see results here.</p>
                                        </div>
                                    ) : (
                                        <div className="pdf-results-container">
                                            <div className="pdf-results-header">
                                                <h3>Split Results ({results.length})</h3>
                                                {results.length > 1 && (
                                                    <button className="pdf-download-all-btn" onClick={downloadAll}>
                                                        <i className="fas fa-file-archive"></i> Download All (ZIP)
                                                    </button>
                                                )}
                                            </div>
                                            <div className="pdf-results-list">
                                                {results.map((res, idx) => (
                                                    <div key={idx} className="pdf-result-item">
                                                        <div className="pdf-result-info">
                                                            <i className="fas fa-file-pdf pdf-result-icon"></i>
                                                            <div className="pdf-result-details">
                                                                <span className="pdf-result-name">{res.name}</span>
                                                                <span className="pdf-result-meta">{res.description} • {formatSize(res.blob.size)}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="pdf-download-btn-small"
                                                            onClick={() => downloadFile(res)}
                                                            title="Download File"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                    <ContentSection id="introduction" title="Introduction to PDF Splitting">
                        <p>
                            Managing large PDF documents can be a challenging task, especially when you only need specific information from a comprehensive report,
                            e-book, or scanned document. Our <strong>PDF Splitter</strong> is a professional-grade tool designed to give you complete control over your PDF files.
                            It allows you to extract exactly what you need, discarding the rest, or breaking down massive files into smaller, easier-to-handle components.
                        </p>
                        <p>
                            Whether you are a student submitting a specific assignment chapter, a legal professional extracting relevant case pages, or a business
                            user organizing receipts and invoices, this tool offers the precision you require. Unlike other tools that upload your sensitive data to
                            remote servers, our PDF Splitter functions entirely within your browser, ensuring maximum privacy and security for your documents.
                        </p>
                    </ContentSection>

                    <ContentSection id="how-it-works" title="How to Split PDF Files">
                        <p>
                            We have designed our PDF Splitter to be intuitive and fast. Follow these simple steps to split your PDF documents:
                        </p>
                        <ol className="usage-steps">
                            <li><strong>Select Your File:</strong> Drag and drop your PDF file into the upload area or click "Choose File" to browse your device.</li>
                            <li><strong>Choose Your Strategy:</strong>
                                <ul>
                                    <li><em>Range Mode:</em> Ideal for extracting a continuous block of pages (e.g., Chapter 3, pages 25-40).</li>
                                    <li><em>Extract Mode:</em> Best for cherry-picking specific pages (e.g., pages 1, 5, and 10) or combining multiple ranges.</li>
                                    <li><em>Every N Pages:</em> Perfect for batch processing, splitting a large document into equal-sized files (e.g., every 5 pages).</li>
                                </ul>
                            </li>
                            <li><strong>Configure Settings:</strong> Enter the specific page numbers or ranges you wish to keep. Our tool will validate your input to ensure it matches the document's length.</li>
                            <li><strong>Split & Preview:</strong> Click "Split PDF". The tool will process your file instantly and generate the new documents.</li>
                            <li><strong>Download:</strong> Review the generated files in the results list. You can download specific files individually or grab everything at once with the "Download All (ZIP)" button.</li>
                        </ol>
                    </ContentSection>

                    <ContentSection id="split-methods" title="Advanced Split Capabilities">
                        <p>Our tool supports versatile splitting logic to handle any scenario:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-arrows-alt-h"></i> Custom Page Ranges</h3>
                                <p>Isolate specific chapters or sections. By defining a start and end page, you create a focused customized document consisting only of the relevant contiguous material.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-file-export"></i> Precise Page Extraction</h3>
                                <p>Need pages 3, 7, and 12-15? The Extraction mode gives you granular control. Enter any combination of single page numbers and ranges to build a new PDF containing exactly the content you selected.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-cut"></i> Bulk Segmentation</h3>
                                <p>Automate the breakdown of massive files. The "Every X Pages" function is a time-saver for processing scanned batches, double-sided invoices, or monthly reports that need to be separated into individual files.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="features" title="Why Choose Tuitility PDF Splitter?">
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-user-shield"></i> 100% Client-Side Privacy</h3>
                                <p>Your files generally leave your device. All splitting operations occur locally in your browser, making this tool safe for sensitive personal or business documents.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-tachometer-alt"></i> Lightning Fast</h3>
                                <p>Without the need to upload and download large files from a server, the processing is subject only to your device's speed, resulting in near-instant operations.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-file-archive"></i> Convenient Delivery</h3>
                                <p>Dealing with 50 split files? Don't download them one by one. Our automatic ZIP generation bundles your results into a single easy-to-manage package.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-mobile-alt"></i> Fully Responsive</h3>
                                <p>Split PDFs on the go. Our interface is optimized for desktops, tablets, and mobile phones, ensuring you can work from anywhere.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <FAQSection faqs={[
                        {
                            question: "Is there a page limit for the PDF Splitter?",
                            answer: "Our tool uses your browser's resources. While we generally limit uploads to 50MB to ensure stability, the number of pages we can process depends largely on your device's memory. Most standard documents of hundreds of pages are processed in seconds."
                        },
                        {
                            question: "Can I merge pages back together after splitting?",
                            answer: "Absolutely! After splitting your document, you can use our <a href='/utility-tools/converter-tools/merge-pdf'>PDF Merger</a> tool to combine the split files with other documents or reorder them as needed."
                        },
                        {
                            question: "Does the quality of the PDF decrease after splitting?",
                            answer: "No. Our tool manipulates the internal structure of the PDF file to copy pages directly. It does not re-compress images or alter fonts, ensuring your split files are identical in quality to the original."
                        },
                        {
                            question: "Is this tool free to use?",
                            answer: "Yes, Tuitility PDF Splitter is completely free. There are no hidden costs, watermarks added to your files, or daily usage limits."
                        },
                        {
                            question: "How do I split a PDF into single pages?",
                            answer: "Select the 'Every X Pages' mode and set the value to '1'. This will break your entire document into individual PDF files for each page."
                        },
                        {
                            question: "My PDF has a password. Can I still split it?",
                            answer: "For security reasons, we cannot process encrypted files directly. You must remove the password protection before uploading the file to our splitter."
                        }
                    ]} />
                </div>
            </ToolPageLayout>
        </>
    );
};

export default PdfSplitter;
