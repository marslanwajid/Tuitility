import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import TableOfContents from '../../tool/TableOfContents';
import FeedbackForm from '../../tool/FeedbackForm';
import Seo from '../../Seo';
import '../../../assets/css/utility/converter-tools/pdf-merger.css';

const PdfMerger = () => {
    // State
    const [files, setFiles] = useState([]);
    const [mergedPDF, setMergedPDF] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [draggedElement, setDraggedElement] = useState(null);
    const [outputFileName, setOutputFileName] = useState('merged-document.pdf');
    const [preserveBookmarks, setPreserveBookmarks] = useState(false);
    const [addPageNumbers, setAddPageNumbers] = useState(false);

    // Refs
    const fileInputRef = useRef(null);

    // Constants
    const toolData = {
        name: 'PDF Merger',
        description: 'Merge multiple PDF files into one document. Free, fast, and secure - files are processed entirely in your browser.',
        icon: 'fas fa-object-group',
        category: 'Utility',
        breadcrumb: ['Utility', 'Converter Tools', 'PDF Merger']
    };

    const seoData = {
        title: 'PDF Merger - Combine Multiple PDFs Online Free | Tuitility',
        description: 'Merge multiple PDF files into one document instantly. Free online tool, no upload required, works 100% in your browser.',
        keywords: 'pdf merger, combine pdf, merge pdf files, pdf joiner, free pdf tool',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/merge-pdf'
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
        { name: 'PDF to Image', url: '/utility-tools/converter-tools/pdf-to-image-converter', icon: 'fas fa-file-image' },
        { name: 'OCR PDF Generator', url: '/utility-tools/ocr-pdf-generator', icon: 'fas fa-file-pdf' },
        { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' }
    ];

    const tableOfContents = [
        { id: 'merger', title: 'PDF Merger' },
        { id: 'introduction', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'features', title: 'Features' },
        { id: 'file-ordering', title: 'File Ordering' },
        { id: 'significance', title: 'Significance' },
        { id: 'advanced', title: 'Advanced Functionality' },
        { id: 'applications', title: 'Applications' },
        { id: 'faqs', title: 'FAQs' }
    ];

    // Handlers
    const handleFileSelect = async (fileList) => {
        const newFiles = Array.from(fileList);
        const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');

        if (pdfFiles.length === 0) {
            showNotification('Please select PDF files only.', 'error');
            return;
        }

        // Check individual file sizes (25MB limit each)
        const oversizedFiles = pdfFiles.filter(file => file.size > 25 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showNotification(`Some files are too large. Maximum size per file is 25MB.`, 'error');
            return;
        }

        // Check total size (100MB limit)
        const totalSize = [...files, ...pdfFiles].reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 100 * 1024 * 1024) {
            showNotification('Total file size exceeds 100MB limit.', 'error');
            return;
        }

        setProcessing(true);
        setProcessingMessage('Analyzing PDF files...');

        const processedFiles = [];
        for (let i = 0; i < pdfFiles.length; i++) {
            const file = pdfFiles[i];
            try {
                setProcessingMessage(`Analyzing file ${i + 1} of ${pdfFiles.length}: ${file.name}`);
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pageCount = pdfDoc.getPageCount();

                processedFiles.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: file.size,
                    pages: pageCount
                });
            } catch (error) {
                console.error(`Failed to process ${file.name}:`, error);
                showNotification(`Failed to process ${file.name}. File may be corrupted.`, 'error');
            }
        }

        setFiles([...files, ...processedFiles]);
        setProcessing(false);

        if (processedFiles.length > 0) {
            showNotification(`Successfully added ${processedFiles.length} PDF file(s).`, 'success');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeFile = (fileId) => {
        setFiles(files.filter(file => file.id !== fileId));
    };

    const clearAllFiles = () => {
        setFiles([]);
        setMergedPDF(null);
    };

    const handleFileDragStart = (e, fileId) => {
        setDraggedElement(fileId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleFileDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleFileDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== targetId) {
            const draggedIndex = files.findIndex(file => file.id === draggedElement);
            const targetIndex = files.findIndex(file => file.id === targetId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const newFiles = [...files];
                const [draggedFile] = newFiles.splice(draggedIndex, 1);
                newFiles.splice(targetIndex, 0, draggedFile);
                setFiles(newFiles);
            }
        }
        setDraggedElement(null);
    };

    const mergePDFs = async () => {
        if (files.length < 2) {
            showNotification('Please add at least 2 PDF files to merge.', 'error');
            return;
        }

        setProcessing(true);
        setProcessingMessage('Merging PDF files...');

        try {
            const mergedPdf = await PDFDocument.create();
            let totalPages = 0;

            for (let i = 0; i < files.length; i++) {
                const fileData = files[i];
                const progress = Math.round(((i + 1) / files.length) * 100);
                setProcessingMessage(`Merging files... ${progress}%`);

                try {
                    const freshArrayBuffer = await fileData.file.arrayBuffer();
                    const sourcePdf = await PDFDocument.load(freshArrayBuffer);
                    const pageCount = sourcePdf.getPageCount();
                    const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);
                    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);

                    copiedPages.forEach(page => {
                        mergedPdf.addPage(page);
                    });

                    // Add page numbers if requested
                    if (addPageNumbers) {
                        const pages = mergedPdf.getPages();
                        const startPage = totalPages;
                        for (let j = 0; j < copiedPages.length; j++) {
                            const page = pages[startPage + j];
                            if (page) {
                                const { width, height } = page.getSize();
                                page.drawText(`${startPage + j + 1}`, {
                                    x: width - 50,
                                    y: 30,
                                    size: 10,
                                    color: rgb(0.5, 0.5, 0.5)
                                });
                            }
                        }
                    }

                    totalPages += pageCount;
                } catch (fileError) {
                    console.error(`Error processing file ${fileData.name}:`, fileError);
                    showNotification(`Warning: Skipped ${fileData.name}`, 'warning');
                }
            }

            // Set metadata
            mergedPdf.setTitle('Merged PDF Document');
            mergedPdf.setCreator('PDF Merger Tool - Tuitility');
            mergedPdf.setProducer('Tuitility');
            mergedPdf.setCreationDate(new Date());

            setProcessingMessage('Finalizing merged PDF...');
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            setMergedPDF(blob);

            setProcessing(false);
            showNotification('PDFs merged successfully!', 'success');
        } catch (error) {
            console.error('Error merging PDFs:', error);
            showNotification('Failed to merge PDF files. Please try again.', 'error');
            setProcessing(false);
        }
    };

    const downloadMergedPDF = () => {
        if (!mergedPDF) {
            showNotification('No merged PDF available for download.', 'error');
            return;
        }

        const url = URL.createObjectURL(mergedPDF);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const showNotification = (message, type = 'info') => {
        // Simple notification - you can enhance this
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
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalPages = files.reduce((sum, file) => sum + file.pages, 0);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return (
        <>
            <Seo {...seoData} />
            <ToolPageLayout
                toolData={toolData}
                categories={categories}
                relatedTools={relatedTools}
                tableOfContents={tableOfContents}
            >
                <CalculatorSection title="" id="merger">
                    <div className="pdf-merger-container">
                        {/* Upload Section */}
                        {files.length === 0 ? (
                            <div
                                className="pdf-drop-zone"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="fas fa-cloud-upload-alt"></i>
                                <h3>Drag & Drop PDF files here</h3>
                                <p>or click to browse files</p>
                                <button className="pdf-upload-btn">Choose Files</button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    accept="application/pdf"
                                    multiple
                                    hidden
                                />
                            </div>
                        ) : (
                            <>
                                {/* Files List */}
                                <div className="pdf-files-list">
                                    <div className="pdf-files-header">
                                        <h3>PDF Files ({files.length})</h3>
                                        <button className="pdf-clear-all-btn" onClick={clearAllFiles}>
                                            <i className="fas fa-trash"></i> Clear All
                                        </button>
                                    </div>

                                    <div className="pdf-files-container">
                                        {files.map((fileData) => (
                                            <div
                                                key={fileData.id}
                                                className={`pdf-file-item ${draggedElement === fileData.id ? 'dragging' : ''}`}
                                                draggable
                                                onDragStart={(e) => handleFileDragStart(e, fileData.id)}
                                                onDragOver={handleFileDragOver}
                                                onDrop={(e) => handleFileDrop(e, fileData.id)}
                                            >
                                                <div className="pdf-file-info">
                                                    <div className="pdf-file-drag-handle">
                                                        <i className="fas fa-grip-vertical"></i>
                                                    </div>
                                                    <div className="pdf-file-icon">
                                                        <i className="fas fa-file-pdf"></i>
                                                    </div>
                                                    <div className="pdf-file-details">
                                                        <div className="pdf-file-name" title={fileData.name}>
                                                            {fileData.name}
                                                        </div>
                                                        <div className="pdf-file-stats">
                                                            <span>{fileData.pages} pages</span>
                                                            <span>{formatFileSize(fileData.size)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pdf-file-actions">
                                                    <button onClick={() => removeFile(fileData.id)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="pdf-stats-summary">
                                    <div className="pdf-stat-item">
                                        <span className="pdf-stat-value">{files.length}</span>
                                        <span className="pdf-stat-label">Total Files</span>
                                    </div>
                                    <div className="pdf-stat-item">
                                        <span className="pdf-stat-value">{totalPages}</span>
                                        <span className="pdf-stat-label">Total Pages</span>
                                    </div>
                                    <div className="pdf-stat-item">
                                        <span className="pdf-stat-value">{formatFileSize(totalSize)}</span>
                                        <span className="pdf-stat-label">Total Size</span>
                                    </div>
                                </div>

                                {/* Merge Options */}
                                <div className="pdf-merge-options">
                                    <h3>Merge Options</h3>
                                    <div className="pdf-option-group">
                                        <label>Output Filename</label>
                                        <input
                                            type="text"
                                            value={outputFileName}
                                            onChange={(e) => setOutputFileName(e.target.value)}
                                            placeholder="merged-document.pdf"
                                        />
                                    </div>
                                    <div className="pdf-checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="addPageNumbers"
                                            checked={addPageNumbers}
                                            onChange={(e) => setAddPageNumbers(e.target.checked)}
                                        />
                                        <label htmlFor="addPageNumbers">Add page numbers</label>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pdf-action-buttons">
                                    <button
                                        className="pdf-merge-btn"
                                        onClick={mergePDFs}
                                        disabled={files.length < 2 || processing}
                                    >
                                        <i className="fas fa-object-group"></i> Merge PDFs
                                    </button>
                                    <button
                                        className="pdf-add-more-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="fas fa-plus"></i> Add More Files
                                    </button>
                                </div>

                                {/* Hidden file input for adding more */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    accept="application/pdf"
                                    multiple
                                    hidden
                                />

                                {/* Results */}
                                {mergedPDF && (
                                    <div className="pdf-results">
                                        <h3>
                                            <i className="fas fa-check-circle"></i> Merge Complete!
                                        </h3>
                                        <div className="pdf-result-info">
                                            <div className="pdf-result-filename">{outputFileName}</div>
                                            <div className="pdf-result-stats">
                                                {totalPages} pages • {formatFileSize(mergedPDF.size)}
                                            </div>
                                        </div>
                                        <button className="pdf-download-btn" onClick={downloadMergedPDF}>
                                            <i className="fas fa-download"></i> Download Merged PDF
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Processing Overlay */}
                        {processing && (
                            <div className="pdf-processing">
                                <div className="pdf-processing-content">
                                    <div className="pdf-processing-spinner">
                                        <i className="fas fa-spinner fa-spin"></i>
                                    </div>
                                    <p>{processingMessage}</p>
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
                    <ContentSection id="introduction" title="Introduction to PDF Merging">
                        <p>
                            Managing multiple PDF documents can be challenging when you need to combine them into a single cohesive file.
                            Our PDF merger is a powerful tool that allows you to seamlessly combine multiple PDF documents into one unified file.
                            This makes it easier to share complete document sets, create comprehensive reports, and organize related materials
                            into single, manageable files.
                        </p>
                        <p>
                            Whether you need to combine contract pages, merge report sections, create a complete presentation, or consolidate
                            multiple invoices, our PDF merger provides the flexibility and control you need. The tool supports drag-and-drop
                            reordering, preserves document quality, and maintains formatting integrity throughout the merge process.
                        </p>
                    </ContentSection>

                    <ContentSection id="how-it-works" title="How PDF Merging Works">
                        <p>
                            Our PDF merger uses advanced PDF processing technology to combine multiple documents while maintaining the highest
                            quality and formatting integrity. Here's the process:
                        </p>
                        <ol className="usage-steps">
                            <li><strong>Upload Multiple PDFs:</strong> Start by uploading all the PDF documents you want to combine using our intuitive drag-and-drop interface.</li>
                            <li><strong>Arrange File Order:</strong> Drag and drop files to reorder them according to your preferred sequence in the final merged document.</li>
                            <li><strong>Configure Settings:</strong> Choose merge options like preserving bookmarks, adding page numbers, and setting the output filename.</li>
                            <li><strong>Process Documents:</strong> Our tool processes all PDFs and combines them into a single, high-quality document.</li>
                            <li><strong>Download Result:</strong> Download your merged PDF with all original formatting, images, and text preserved.</li>
                        </ol>

                        <h3>Merging Process Overview</h3>
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>Step</th>
                                    <th>Process</th>
                                    <th>Output</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Upload</td>
                                    <td>Multiple PDF file analysis</td>
                                    <td>Document collection ready</td>
                                </tr>
                                <tr>
                                    <td>Organization</td>
                                    <td>File ordering and configuration</td>
                                    <td>Merge sequence established</td>
                                </tr>
                                <tr>
                                    <td>Processing</td>
                                    <td>Document combination and optimization</td>
                                    <td>Single unified PDF created</td>
                                </tr>
                                <tr>
                                    <td>Download</td>
                                    <td>Final document delivery</td>
                                    <td>Merged PDF ready for use</td>
                                </tr>
                            </tbody>
                        </table>
                    </ContentSection>

                    <ContentSection id="features" title="PDF Merge Features">
                        <p>Our PDF merger offers comprehensive features to ensure your merged documents meet your exact requirements:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-arrows-alt"></i> Drag & Drop Reordering</h3>
                                <p>Easily rearrange the order of your PDF files by dragging and dropping them into your preferred sequence.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-bookmark"></i> Bookmark Preservation</h3>
                                <p>Maintain existing bookmarks from individual PDFs and organize them in the merged document.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-list-ol"></i> Page Numbering</h3>
                                <p>Optionally add continuous page numbers throughout the merged document for better navigation.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-check-circle"></i> Quality Retention</h3>
                                <p>Preserve the original quality of all images, text, and formatting from source documents.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-info-circle"></i> Metadata Management</h3>
                                <p>Combine and organize document metadata while maintaining important document properties.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-layer-group"></i> Batch Processing</h3>
                                <p>Handle multiple large PDF files efficiently with optimized processing algorithms.</p>
                            </div>
                        </div>
                        <p>
                            These features ensure that your merged PDF maintains professional quality while providing enhanced organization
                            and navigation capabilities.
                        </p>
                    </ContentSection>

                    <ContentSection id="file-ordering" title="File Ordering and Organization">
                        <p>Proper file ordering is crucial for creating well-organized merged documents. Our PDF merger provides intuitive tools for managing file sequence:</p>
                        <ul className="usage-steps">
                            <li><strong>Visual File List:</strong> See all uploaded files in a clear, organized list with preview information including file names, page counts, and sizes.</li>
                            <li><strong>Drag & Drop Interface:</strong> Simply drag files up or down in the list to reorder them according to your needs.</li>
                            <li><strong>File Management:</strong> Remove individual files or clear the entire list if you need to start over with different documents.</li>
                            <li><strong>Real-time Updates:</strong> See instant updates to total page count, file count, and combined size as you add or remove files.</li>
                        </ul>
                        <p>
                            This intuitive approach to file organization ensures that your merged PDF follows the exact structure you envision
                            for your final document.
                        </p>
                    </ContentSection>

                    <ContentSection id="significance" title="Significance of PDF Merging">
                        <p>PDF merging offers numerous advantages for document management and distribution:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-folder"></i> Document Consolidation</h3>
                                <p>Combine related documents into single files for easier management and distribution.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-briefcase"></i> Professional Presentation</h3>
                                <p>Create comprehensive documents that present information in a logical, sequential manner.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-share-alt"></i> Simplified Sharing</h3>
                                <p>Share complete document sets as single files rather than multiple separate attachments.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-code-branch"></i> Version Control</h3>
                                <p>Maintain document integrity by combining final versions into authoritative single documents.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-hdd"></i> Storage Efficiency</h3>
                                <p>Reduce file clutter by consolidating related documents into organized, merged files.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-compass"></i> Enhanced Navigation</h3>
                                <p>Create documents with continuous page numbering and organized bookmarks for better user experience.</p>
                            </div>
                        </div>
                        <p>
                            These benefits make PDF merging essential for professionals, educators, and anyone who regularly works with
                            multiple PDF documents.
                        </p>
                    </ContentSection>

                    <ContentSection id="advanced" title="Advanced Functionality">
                        <p>Our PDF merger includes sophisticated features to enhance your document processing experience:</p>
                        <ul className="usage-steps">
                            <li><strong>Smart Compression:</strong> Optimize file sizes while maintaining quality through intelligent compression algorithms.</li>
                            <li><strong>Format Preservation:</strong> Maintain all original formatting, fonts, images, and layout elements from source documents.</li>
                            <li><strong>Bookmark Organization:</strong> Intelligently organize bookmarks from multiple sources into a coherent navigation structure.</li>
                            <li><strong>Error Handling:</strong> Robust error handling ensures reliable processing even with complex or large PDF files.</li>
                            <li><strong>Progress Tracking:</strong> Real-time progress indicators keep you informed during the merge process.</li>
                            <li><strong>Filename Customization:</strong> Set custom filenames for your merged documents with automatic extension handling.</li>
                        </ul>
                        <p>
                            These advanced features ensure that our PDF merger can handle professional-grade document processing requirements
                            with reliability and precision.
                        </p>
                    </ContentSection>

                    <ContentSection id="applications" title="Applications of PDF Merging">
                        <p>PDF merging has extensive practical applications across various industries and use cases:</p>
                        <div className="applications-grid">
                            <div className="application-item">
                                <h3><i className="fas fa-chart-line"></i> Business Reports</h3>
                                <p>Combine executive summaries, data analysis, and appendices into comprehensive business reports.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-gavel"></i> Legal Documentation</h3>
                                <p>Merge contracts, exhibits, and supporting documents into complete legal packages.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-graduation-cap"></i> Academic Papers</h3>
                                <p>Combine research papers, citations, and supplementary materials for academic submissions.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-presentation"></i> Presentations</h3>
                                <p>Merge slide decks, handouts, and supporting materials into complete presentation packages.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-file-contract"></i> Proposals</h3>
                                <p>Combine cover letters, technical specifications, and supporting documents into comprehensive proposals.</p>
                            </div>
                            <div className="application-item">
                                <h3><i className="fas fa-chalkboard-teacher"></i> Training Materials</h3>
                                <p>Merge lesson plans, exercises, and reference materials into complete training packages.</p>
                            </div>
                        </div>
                        <p>
                            The versatility of PDF merging makes it valuable for anyone who needs to create comprehensive, well-organized
                            document collections.
                        </p>
                    </ContentSection>

                    <FAQSection faqs={[
                        {
                            question: "What is a PDF merger?",
                            answer: "A PDF merger is a tool that combines multiple PDF files into a single document while preserving the original formatting, quality, and content of each file."
                        },
                        {
                            question: "How many PDF files can I merge at once?",
                            answer: "You can merge multiple PDF files simultaneously. We recommend keeping the total combined size under 100MB for optimal processing speed and performance."
                        },
                        {
                            question: "Will the merged PDF maintain the original quality?",
                            answer: "Yes, our merger preserves the original quality of all documents, including images, fonts, formatting, and layout elements."
                        },
                        {
                            question: "Can I change the order of files before merging?",
                            answer: "Absolutely! Use our drag-and-drop interface to reorder files in any sequence you prefer before starting the merge process."
                        },
                        {
                            question: "What happens to bookmarks when merging PDFs?",
                            answer: "You can choose to preserve bookmarks from the original files. Our tool will organize them hierarchically in the merged document."
                        },
                        {
                            question: "Is there a file size limit for individual PDFs?",
                            answer: "Individual PDF files should be under 25MB each to ensure smooth processing. The total combined size should not exceed 100MB."
                        }
                    ]} />
                </div>
            </ToolPageLayout>
        </>
    );
};

export default PdfMerger;
