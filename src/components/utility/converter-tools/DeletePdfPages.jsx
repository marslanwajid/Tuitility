import React, { useState, useRef, useEffect } from 'react';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import TableOfContents from '../../tool/TableOfContents';
import FeedbackForm from '../../tool/FeedbackForm';
import Seo from '../../Seo';
import '../../../assets/css/utility/converter-tools/delete-pdf-pages.css';

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Import PDF-lib
import { PDFDocument } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DeletePdfPages = () => {
    // State
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [selectionMethod, setSelectionMethod] = useState('visual');
    const [pageInput, setPageInput] = useState('');
    const [inputValidation, setInputValidation] = useState({ valid: true, message: '' });
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [processedPDF, setProcessedPDF] = useState(null);
    const [outputFileName, setOutputFileName] = useState('document-pages-deleted.pdf');
    const [pagePreviews, setPagePreviews] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Refs
    const fileInputRef = useRef(null);

    // Tool data
    const toolData = {
        name: 'Delete PDF Pages',
        description: 'Remove unwanted pages from PDF documents quickly and easily. Select pages visually or by page numbers, then download your edited PDF.',
        icon: 'fas fa-file-pdf',
        category: 'Utility',
        breadcrumb: ['Utility', 'Converter Tools', 'Delete PDF Pages']
    };

    const seoData = {
        title: 'Delete PDF Pages - Remove Pages from PDF Online | Tuitility',
        description: 'Delete unwanted pages from PDF files online for free. Visual page selection, batch deletion, secure client-side processing. No upload required.',
        keywords: 'delete pdf pages, remove pdf pages, pdf page remover, edit pdf, pdf tool',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/delete-pdf-pages'
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
        { name: 'PDF Merger', url: '/utility-tools/converter-tools/merge-pdf', icon: 'fas fa-file-pdf' },
        { name: 'PDF to Image', url: '/utility-tools/converter-tools/pdf-to-image-converter', icon: 'fas fa-file-image' },
        { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' }
    ];

    const tableOfContents = [
        { id: 'tool', title: 'Delete Pages Tool' },
        { id: 'introduction', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'features', title: 'Features' },
        { id: 'page-selection', title: 'Page Selection' },
        { id: 'use-cases', title: 'Use Cases' },
        { id: 'faqs', title: 'FAQs' }
    ];

    // File handling
    const handleFileSelect = async (file) => {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showError('Please select a PDF file only.');
            return;
        }

        if (file.size > 25 * 1024 * 1024) {
            showError('File is too large. Maximum size is 25MB.');
            return;
        }

        // Reset state
        setProcessedPDF(null);
        setSelectedPages(new Set());
        setPageInput('');
        setError(null);
        setSuccess(null);

        setLoading(true);
        setProcessingMessage('Analyzing PDF file...');

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Load with PDF-lib
            const pdfDocument = await PDFDocument.load(arrayBuffer);
            const pageCount = pdfDocument.getPageCount();

            setPdfFile(file);
            setPdfDoc(pdfDocument);
            setTotalPages(pageCount);
            setOutputFileName(file.name.replace('.pdf', '-pages-deleted.pdf'));

            // Generate previews
            await generatePreviews(arrayBuffer, pageCount);

            setLoading(false);
            showSuccess(`PDF loaded successfully! ${pageCount} pages detected.`);
        } catch (err) {
            console.error('Failed to load PDF:', err);
            setLoading(false);
            showError(`Failed to load PDF: ${err.message}`);
        }
    };

    const generatePreviews = async (arrayBuffer, pageCount) => {
        const previews = [];

        try {
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            for (let i = 1; i <= pageCount; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.5 });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = Math.floor(viewport.width);
                    canvas.height = Math.floor(viewport.height);

                    await page.render({ canvasContext: context, viewport }).promise;

                    previews.push({
                        pageNum: i,
                        canvas: canvas.toDataURL()
                    });
                } catch (err) {
                    console.error(`Failed to render page ${i}:`, err);
                    previews.push({ pageNum: i, canvas: null });
                }
            }

            pdf.destroy();
            setPagePreviews(previews);
        } catch (err) {
            console.error('Failed to generate previews:', err);
        }
    };

    // Page selection
    const togglePageSelection = (pageNum) => {
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageNum)) {
            newSelection.delete(pageNum);
        } else {
            newSelection.add(pageNum);
        }
        setSelectedPages(newSelection);

        // Sync to text input
        if (selectionMethod === 'visual') {
            const sorted = Array.from(newSelection).sort((a, b) => a - b);
            setPageInput(sorted.join(','));
        }
    };

    const selectAllPages = () => {
        const all = new Set();
        for (let i = 1; i <= totalPages; i++) {
            all.add(i);
        }
        setSelectedPages(all);
        const sorted = Array.from(all).sort((a, b) => a - b);
        setPageInput(sorted.join(','));
    };

    const clearSelection = () => {
        setSelectedPages(new Set());
        setPageInput('');
    };

    // Page input validation
    const validatePageInput = (input) => {
        if (!input.trim()) {
            setInputValidation({ valid: true, message: 'Examples: "1,3,5" • "5-8" • "1,3,5-8,10"' });
            if (selectionMethod === 'text') {
                setSelectedPages(new Set());
            }
            return;
        }

        try {
            const pages = parsePageSelection(input);

            if (pages.length === 0) {
                setInputValidation({ valid: false, message: 'No valid pages specified.' });
                return;
            }

            if (pages.length >= totalPages) {
                setInputValidation({ valid: false, message: 'Cannot delete all pages. At least one page must remain.' });
                return;
            }

            const invalidPages = pages.filter(p => p < 1 || p > totalPages);
            if (invalidPages.length > 0) {
                setInputValidation({ valid: false, message: `Invalid page numbers: ${invalidPages.join(', ')}. Valid range: 1-${totalPages}` });
                return;
            }

            // Sync to visual selection
            if (selectionMethod === 'text') {
                setSelectedPages(new Set(pages));
            }

            setInputValidation({ valid: true, message: `${pages.length} page(s) will be deleted, ${totalPages - pages.length} will remain.` });
        } catch (err) {
            setInputValidation({ valid: false, message: `Invalid format: ${err.message}` });
        }
    };

    const parsePageSelection = (input) => {
        const pages = new Set();
        const parts = input.split(',').map(p => p.trim()).filter(p => p);

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(p => parseInt(p.trim()));
                if (isNaN(start) || isNaN(end)) {
                    throw new Error(`Invalid range: ${part}`);
                }
                if (start > end) {
                    throw new Error(`Invalid range: ${part} (start > end)`);
                }
                for (let i = start; i <= end; i++) {
                    pages.add(i);
                }
            } else {
                const page = parseInt(part);
                if (isNaN(page)) {
                    throw new Error(`Invalid page number: ${part}`);
                }
                pages.add(page);
            }
        }

        return Array.from(pages).sort((a, b) => a - b);
    };

    // Delete pages
    const handleDeletePages = async () => {
        if (selectedPages.size === 0) {
            showError('Please select pages to delete.');
            return;
        }

        if (selectedPages.size >= totalPages) {
            showError('Cannot delete all pages. At least one page must remain.');
            return;
        }

        setProcessing(true);
        setProcessingMessage('Deleting selected pages...');

        try {
            const pagesToDelete = Array.from(selectedPages).sort((a, b) => a - b);
            const newPdf = await PDFDocument.create();

            // Copy pages to keep
            const pagesToKeep = [];
            for (let i = 1; i <= totalPages; i++) {
                if (!pagesToDelete.includes(i)) {
                    pagesToKeep.push(i - 1); // 0-based index
                }
            }

            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
            copiedPages.forEach(page => newPdf.addPage(page));

            // Set metadata
            newPdf.setTitle(`${pdfFile.name} - Pages Deleted`);
            newPdf.setCreator('PDF Page Deletion Tool');
            newPdf.setProducer('Tuitility');
            newPdf.setCreationDate(new Date());
            newPdf.setModificationDate(new Date());

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            setProcessedPDF(blob);
            setProcessing(false);
            showSuccess('Pages deleted successfully!');

            // Auto-download
            setTimeout(() => {
                downloadPDF(blob);
            }, 500);
        } catch (err) {
            console.error('Failed to delete pages:', err);
            setProcessing(false);
            showError(`Failed to delete pages: ${err.message}`);
        }
    };

    const downloadPDF = (blob = processedPDF) => {
        if (!blob) {
            showError('No processed PDF available.');
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName.endsWith('.pdf') ? outputFileName : outputFileName + '.pdf';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Notifications
    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const showSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(null), 3000);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        validatePageInput(pageInput);
    }, [pageInput, totalPages, selectionMethod]);

    return (
        <>
            <Seo {...seoData} />
            <ToolPageLayout
                toolData={toolData}
                categories={categories}
                relatedTools={relatedTools}
                tableOfContents={tableOfContents}
            >
                <CalculatorSection title="Delete PDF Pages" id="tool">
                    {/* Notifications */}
                    {error && (
                        <div className="notification error-notification">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="notification success-notification">
                            <i className="fas fa-check-circle"></i>
                            {success}
                        </div>
                    )}

                    {/* Upload Section */}
                    <div
                        className="pdf-drop-zone"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('highlight');
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.classList.remove('highlight');
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('highlight');
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileSelect(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <i className="fas fa-file-pdf"></i>
                        <h3>Upload PDF Document</h3>
                        <p>Drag and drop your PDF here or click to browse</p>
                        <button type="button" className="pdf-upload-btn">
                            <i className="fas fa-upload"></i> Choose PDF File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Processing Overlay */}
                    {(loading || processing) && (
                        <div className="pdf-processing">
                            <div className="pdf-processing-content">
                                <div className="pdf-processing-spinner"></div>
                                <p>{processingMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* PDF Info */}
                    {pdfFile && (
                        <div className="pdf-info">
                            <div className="pdf-info-item">
                                <i className="fas fa-file-pdf"></i>
                                <div>
                                    <strong>File:</strong> {pdfFile.name}
                                </div>
                            </div>
                            <div className="pdf-info-item">
                                <i className="fas fa-file-alt"></i>
                                <div>
                                    <strong>Pages:</strong> {totalPages}
                                </div>
                            </div>
                            <div className="pdf-info-item">
                                <i className="fas fa-hdd"></i>
                                <div>
                                    <strong>Size:</strong> {formatFileSize(pdfFile.size)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selection Methods */}
                    {pdfFile && (
                        <div className="selection-methods">
                            <div className="method-tabs">
                                <button
                                    className={`method-tab ${selectionMethod === 'visual' ? 'active' : ''}`}
                                    onClick={() => setSelectionMethod('visual')}
                                >
                                    <i className="fas fa-th"></i> Visual Selection
                                </button>
                                <button
                                    className={`method-tab ${selectionMethod === 'text' ? 'active' : ''}`}
                                    onClick={() => setSelectionMethod('text')}
                                >
                                    <i className="fas fa-keyboard"></i> Text Input
                                </button>
                            </div>

                            {/* Visual Selection */}
                            {selectionMethod === 'visual' && (
                                <div className="visual-method">
                                    <div className="selection-controls">
                                        <button onClick={selectAllPages} className="control-btn">
                                            <i className="fas fa-check-double"></i> Select All
                                        </button>
                                        <button onClick={clearSelection} className="control-btn">
                                            <i className="fas fa-times"></i> Clear Selection
                                        </button>
                                        <div className="selected-count">
                                            Selected: {selectedPages.size} page(s)
                                        </div>
                                    </div>

                                    <div className="page-preview-grid">
                                        {pagePreviews.map((preview) => (
                                            <div
                                                key={preview.pageNum}
                                                className={`page-thumbnail ${selectedPages.has(preview.pageNum) ? 'selected' : ''}`}
                                                onClick={() => togglePageSelection(preview.pageNum)}
                                            >
                                                {preview.canvas ? (
                                                    <img src={preview.canvas} alt={`Page ${preview.pageNum}`} />
                                                ) : (
                                                    <div className="placeholder">
                                                        <i className="fas fa-file-pdf"></i>
                                                    </div>
                                                )}
                                                <div className="page-number">Page {preview.pageNum}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Text Input */}
                            {selectionMethod === 'text' && (
                                <div className="text-method">
                                    <label htmlFor="pageInput">Enter page numbers to delete:</label>
                                    <input
                                        id="pageInput"
                                        type="text"
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        placeholder="e.g., 1,3,5-8,10"
                                        className={!inputValidation.valid ? 'invalid' : ''}
                                    />
                                    <div className={`help-text ${!inputValidation.valid ? 'error' : ''}`}>
                                        <i className={`fas ${inputValidation.valid ? 'fa-info-circle' : 'fa-exclamation-triangle'}`}></i>
                                        {inputValidation.message}
                                    </div>
                                </div>
                            )}

                            {/* Output Options */}
                            <div className="output-options">
                                <label htmlFor="outputFileName">Output filename:</label>
                                <input
                                    id="outputFileName"
                                    type="text"
                                    value={outputFileName}
                                    onChange={(e) => setOutputFileName(e.target.value)}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <button
                                    onClick={handleDeletePages}
                                    disabled={selectedPages.size === 0 || selectedPages.size >= totalPages}
                                    className="pdf-delete-btn"
                                >
                                    <i className="fas fa-trash-alt"></i> Delete Selected Pages
                                </button>
                                {processedPDF && (
                                    <button onClick={() => downloadPDF()} className="pdf-download-btn">
                                        <i className="fas fa-download"></i> Download Again
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </CalculatorSection>

                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                {/* SEO Content */}
                <div className="pdf-converter-content">
                    <ContentSection id="introduction" title="Introduction to PDF Page Deletion">
                        <p>
                            Sometimes PDF documents contain unwanted pages that need to be removed for a cleaner, more focused document. Our PDF page deletion tool is a powerful utility that allows you to selectively remove specific pages or page ranges from your PDF documents. This makes it easier to create streamlined documents, remove sensitive information, or eliminate unnecessary content.
                        </p>
                        <p>
                            Whether you need to remove blank pages, delete confidential sections, extract specific content by removing everything else, or simply clean up a document, our page deletion tool provides the precision and control you need. The tool supports flexible page selection with single pages, ranges, and comma-separated lists while preserving document quality and formatting integrity.
                        </p>
                    </ContentSection>

                    <ContentSection id="how-it-works" title="How PDF Page Deletion Works">
                        <p>Our PDF page deletion tool uses advanced PDF processing technology to selectively remove pages while maintaining the highest quality and formatting integrity of remaining content. Here's the process:</p>
                        <ol className="usage-steps">
                            <li><strong>Upload PDF:</strong> Start by uploading the PDF document from which you want to remove pages using our intuitive drag-and-drop interface.</li>
                            <li><strong>Analyze Document:</strong> The tool analyzes your PDF and displays information about total pages, file size, and document structure.</li>
                            <li><strong>Select Pages:</strong> Specify which pages to delete using flexible syntax - single pages (1,3,5), ranges (5-8), or combinations (1,3,5-8,10).</li>
                            <li><strong>Configure Settings:</strong> Choose options like preserving bookmarks (with automatic adjustment) and setting the output filename.</li>
                            <li><strong>Process Document:</strong> Our tool removes the specified pages and creates a new PDF with the remaining content.</li>
                            <li><strong>Download Result:</strong> Download your processed PDF with unwanted pages removed and all formatting preserved.</li>
                        </ol>
                    </ContentSection>

                    <ContentSection id="features" title="PDF Page Deletion Features">
                        <p>Our PDF page deletion tool offers comprehensive features to ensure precise and reliable page removal:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-hand-pointer"></i> Flexible Page Selection</h3>
                                <p>Delete single pages, page ranges, or complex combinations using intuitive comma-separated syntax.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-bookmark"></i> Smart Bookmark Management</h3>
                                <p>Automatically adjust bookmarks when pages are deleted to maintain proper navigation structure.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-star"></i> Quality Preservation</h3>
                                <p>Maintain the original quality of all images, text, and formatting in remaining pages.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-file-alt"></i> Format Integrity</h3>
                                <p>Preserve document structure, fonts, layouts, and all visual elements after page removal.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-info-circle"></i> Metadata Retention</h3>
                                <p>Keep important document properties while updating page-specific metadata.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-shield-alt"></i> Validation & Safety</h3>
                                <p>Validate page selections and prevent accidental deletion of all pages or invalid ranges.</p>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem' }}>These features ensure that your edited PDF maintains professional quality while providing precise control over content removal.</p>
                    </ContentSection>

                    <ContentSection id="page-selection" title="Page Selection Syntax and Methods">
                        <p>Our PDF page deletion tool offers flexible and intuitive syntax for specifying which pages to remove from your document:</p>
                        <ul className="usage-steps">
                            <li><strong>Single Pages:</strong> Specify individual pages using numbers separated by commas (e.g., "1,3,5,10" removes pages 1, 3, 5, and 10).</li>
                            <li><strong>Page Ranges:</strong> Use hyphen notation to delete consecutive pages (e.g., "5-8" removes pages 5, 6, 7, and 8).</li>
                            <li><strong>Mixed Selection:</strong> Combine single pages and ranges (e.g., "1,3,5-8,10,15-20" for complex selections).</li>
                            <li><strong>Input Validation:</strong> Real-time validation ensures your page selection is valid and within the document's page count.</li>
                            <li><strong>Clear Examples:</strong> Built-in help text and examples guide you through the selection process.</li>
                        </ul>
                        <p>This flexible syntax allows you to precisely control which pages are removed, making it easy to clean up documents or extract specific content by removing everything else.</p>
                    </ContentSection>

                    <ContentSection id="use-cases" title="Applications of PDF Page Deletion">
                        <p>PDF page deletion has extensive practical applications across various industries and use cases:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-briefcase"></i> Business Reports</h3>
                                <p>Remove draft pages, outdated sections, or confidential information from business reports before distribution.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-gavel"></i> Legal Documentation</h3>
                                <p>Delete sensitive exhibits or redacted pages from legal documents while maintaining document integrity.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-graduation-cap"></i> Academic Papers</h3>
                                <p>Remove cover pages, appendices, or specific sections when submitting assignments or research papers.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-presentation"></i> Presentations</h3>
                                <p>Extract specific slides or remove backup slides from presentation PDFs for cleaner delivery.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-file-contract"></i> Proposals</h3>
                                <p>Customize proposals by removing irrelevant sections or tailoring content for specific clients.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-book"></i> Training Materials</h3>
                                <p>Remove outdated lessons or create customized training packages by deleting unnecessary content.</p>
                            </div>
                        </div>
                        <p style={{ marginTop: '1rem' }}>The versatility of PDF page deletion makes it valuable for anyone who needs to create focused, streamlined documents.</p>
                    </ContentSection>

                    <FAQSection faqs={[
                        {
                            question: "What is PDF page deletion?",
                            answer: "PDF page deletion is a process that removes specific pages from PDF documents while preserving the original formatting, quality, and content of the remaining pages."
                        },
                        {
                            question: "How many pages can I delete at once?",
                            answer: "You can delete multiple pages simultaneously using single pages, ranges, or combinations. The only limitation is that at least one page must remain in the document."
                        },
                        {
                            question: "Will the remaining pages maintain their quality?",
                            answer: "Yes, our tool preserves the original quality of all remaining pages, including images, fonts, formatting, and layout elements."
                        },
                        {
                            question: "Can I undo page deletion?",
                            answer: "The tool creates a new PDF file, so your original document remains unchanged. You can always go back to your original file if needed."
                        },
                        {
                            question: "What happens to bookmarks when deleting pages?",
                            answer: "You can choose to preserve bookmarks. Our tool will automatically adjust bookmark references to account for deleted pages."
                        },
                        {
                            question: "Is there a file size limit?",
                            answer: "Individual PDF files should be under 25MB to ensure smooth processing and optimal performance in your browser."
                        }
                    ]} />
                </div>
            </ToolPageLayout>
        </>
    );
};

export default DeletePdfPages;
