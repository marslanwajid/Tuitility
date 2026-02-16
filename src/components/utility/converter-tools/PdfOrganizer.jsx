import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import TableOfContents from '../../tool/TableOfContents';
import FeedbackForm from '../../tool/FeedbackForm';
import Seo from '../../Seo';
import '../../../assets/css/utility/converter-tools/pdf-organizer.css';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfOrganizer = () => {
    // State
    const [file, setFile] = useState(null);
    const [pagePreviews, setPagePreviews] = useState([]); // { pageNum, imgData, originalIndex }
    const [pdfDoc, setPdfDoc] = useState(null); // Loaded PDFDocument (pdf-lib)
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [touchDragIndex, setTouchDragIndex] = useState(null);
    const [touchOverIndex, setTouchOverIndex] = useState(null);
    const [notification, setNotification] = useState(null); // { message, type }
    const [outputFileName, setOutputFileName] = useState('');
    const [originalOrder, setOriginalOrder] = useState([]); // Store original indices for reset

    // Refs for file input
    const fileInputRef = useRef(null);

    // Initial SEO Data
    const seoData = {
        title: 'PDF Page Organizer - Reorder & Arrange PDF Pages Online | Tuitility',
        description: 'Organize PDF pages easily. Drag and drop to reorder, shuffle, or reverse page sequences. Free online tool, processed locally in your browser.',
        keywords: 'pdf organizer, reorder pdf pages, rearrange pdf, sort pdf pages, free pdf tool',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/pdf-organizer'
    };

    const toolData = {
        name: 'PDF Organizer',
        description: 'Visually reorder and rearrange pages in your PDF documents using an intuitive drag-and-drop interface.',
        icon: 'fas fa-sort-amount-down',
        category: 'Utility',
        breadcrumb: ['Utility', 'PDF Tools', 'PDF Organizer']
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
        { name: 'PDF Splitter', url: '/utility-tools/converter-tools/split-pdf', icon: 'fas fa-cut' },
        { name: 'Merge PDF', url: '/utility-tools/converter-tools/merge-pdf', icon: 'fas fa-object-group' },
        { name: 'PDF to Image', url: '/utility-tools/converter-tools/pdf-to-image-converter', icon: 'fas fa-file-image' },
        { name: 'Delete PDF Pages', url: '/utility-tools/converter-tools/delete-pdf-pages', icon: 'fas fa-trash-alt' },
        { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' }
    ];

    const tableOfContents = [
        { id: 'organizer', title: 'PDF Organizer' },
        { id: 'introduction', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'features', title: 'Features' },
        { id: 'usage-guide', title: 'Usage Guide' },
        { id: 'significance', title: 'Significance' },
        { id: 'applications', title: 'Applications' },
        { id: 'faqs', title: 'FAQs' }
    ];

    // Notification Helper
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // File Handling
    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;
        const selectedFile = files[0];

        if (selectedFile.type !== 'application/pdf') {
            showNotification('Please select a valid PDF file.', 'error');
            return;
        }

        if (selectedFile.size > 25 * 1024 * 1024) {
            showNotification('File size exceeds 25MB limit.', 'error');
            return;
        }

        setFile(selectedFile);
        setOutputFileName(selectedFile.name.replace('.pdf', '_organized.pdf'));
        setIsProcessing(true);
        setProcessingMessage('Analyzing PDF...');

        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdfBuffer = buffer.slice(0);

            // Load with pdfjs for previews
            const pdf = await pdfjsLib.getDocument(buffer).promise;

            // Generate previews
            setProcessingMessage(`Generating previews for ${pdf.numPages} pages...`);
            const previews = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.3 }); // Low scale for thumbnail
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({ canvasContext: context, viewport }).promise;
                    previews.push({
                        id: i, // ID to track uniqueness
                        pageNum: i, // Display number
                        originalIndex: i - 1, // 0-based index for pdf-lib
                        imgData: canvas.toDataURL()
                    });
                } catch (e) {
                    console.error(`Error rendering page ${i}`, e);
                    previews.push({ id: i, pageNum: i, originalIndex: i - 1, imgData: null });
                }
            }

            setPagePreviews(previews);
            setOriginalOrder([...previews]); // Save initial order

            // Load with pdf-lib for processing later
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            setPdfDoc(pdfDoc);

            showNotification(`Loaded ${pdf.numPages} pages successfully!`, 'success');
        } catch (error) {
            console.error('Error loading PDF:', error);
            showNotification('Failed to load PDF. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileSelect(files);
    };

    // Drag & Drop Handling (Desktop)
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set custom drag image if needed
    };

    const handleDragOver = (e, index) => {
        e.preventDefault(); // Necessary to allow dropping
        if (draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDropItem = (e, index) => {
        e.preventDefault();
        const newPreviews = [...pagePreviews];
        const draggedItem = newPreviews[draggedIndex];

        // Remove dragged item
        newPreviews.splice(draggedIndex, 1);
        // Insert at new position
        newPreviews.splice(index, 0, draggedItem);

        setPagePreviews(newPreviews);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Touch Handling (Mobile)
    const handleTouchStart = (e, index) => {
        setTouchDragIndex(index);
        document.body.style.overflow = 'hidden'; // Prevent scrolling while dragging
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const card = element?.closest('.page-card');

        if (card) {
            const indexStr = card.getAttribute('data-index');
            if (indexStr !== null) {
                const index = parseInt(indexStr, 10);
                if (index !== touchDragIndex) {
                    setTouchOverIndex(index);
                }
            }
        }
    };

    const handleTouchEnd = () => {
        if (touchDragIndex !== null && touchOverIndex !== null) {
            const newPreviews = [...pagePreviews];
            const draggedItem = newPreviews[touchDragIndex];

            // Remove dragged item
            newPreviews.splice(touchDragIndex, 1);
            // Insert at new position
            newPreviews.splice(touchOverIndex, 0, draggedItem);

            setPagePreviews(newPreviews);
        }

        setTouchDragIndex(null);
        setTouchOverIndex(null);
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    // Helper Actions
    const reverseOrder = () => {
        setPagePreviews([...pagePreviews].reverse());
        showNotification('Page order reversed!', 'success');
    };

    const shuffleOrder = () => {
        const shuffled = [...pagePreviews].sort(() => Math.random() - 0.5);
        setPagePreviews(shuffled);
        showNotification('Pages shuffled randomly!', 'success');
    };

    const resetOrder = () => {
        setPagePreviews([...originalOrder]);
        showNotification('Reset to original order!', 'info');
    };

    const downloadPDF = async () => {
        if (!pdfDoc || pagePreviews.length === 0) return;

        setIsProcessing(true);
        setProcessingMessage('Creating new PDF...');

        try {
            const newPdf = await PDFDocument.create();

            // Get indices of pages in their new order
            const pageIndices = pagePreviews.map(p => p.originalIndex);

            // Copy pages from source
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);

            // Add pages to new PDF
            copiedPages.forEach(page => newPdf.addPage(page));

            // Generate blob
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            // Trigger download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = outputFileName || 'organized.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification('Failed to generate PDF.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetTool = () => {
        setFile(null);
        setPagePreviews([]);
        setPdfDoc(null);
        setOriginalOrder([]);
        setOutputFileName('');
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
                {notification && (
                    <div className={`toast-notification toast-${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                <CalculatorSection title="" id="organizer">
                    <div className="pdf-organizer-container">
                        {!file ? (
                            <div
                                className="pdf-organizer-upload"
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
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
                                <button className="control-btn primary">Choose File</button>
                            </div>
                        ) : (
                            <div className="organizer-workspace">
                                <div className="organizer-header">
                                    <div className="file-info">
                                        <i className="fas fa-file-pdf"></i>
                                        <div className="file-details">
                                            <h3>{file.name}</h3>
                                            <p>{pagePreviews.length} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <div className="organizer-controls">
                                        <button className="control-btn" onClick={reverseOrder}>
                                            <i className="fas fa-exchange-alt"></i> Reverse
                                        </button>
                                        <button className="control-btn" onClick={shuffleOrder}>
                                            <i className="fas fa-random"></i> Shuffle
                                        </button>
                                        <button className="control-btn" onClick={resetOrder}>
                                            <i className="fas fa-undo"></i> Reset
                                        </button>
                                        <button className="control-btn" onClick={resetTool} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                                            <i className="fas fa-times"></i> Close
                                        </button>
                                    </div>
                                </div>

                                <div className="pages-grid">
                                    {isProcessing && pagePreviews.length === 0 ? (
                                        <div className="loading-overlay">
                                            <div className="spinner"></div>
                                            <p>{processingMessage}</p>
                                        </div>
                                    ) : (
                                        pagePreviews.map((page, index) => (
                                            <div
                                                key={page.id}
                                                data-index={index}
                                                className={`page-card ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''} ${touchDragIndex === index ? 'dragging' : ''} ${touchOverIndex === index ? 'drag-over' : ''}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDropItem(e, index)}
                                                onTouchStart={(e) => handleTouchStart(e, index)}
                                                onTouchMove={handleTouchMove}
                                                onTouchEnd={handleTouchEnd}
                                            >
                                                <div className="page-preview">
                                                    {page.imgData ? (
                                                        <img src={page.imgData} alt={`Page ${page.pageNum}`} draggable={false} />
                                                    ) : (
                                                        <div className="spinner"></div>
                                                    )}
                                                </div>
                                                <div className="page-footer">
                                                    <span className="page-number">Page {page.pageNum}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="action-bar">
                                    <input
                                        type="text"
                                        className="filename-input"
                                        value={outputFileName}
                                        onChange={(e) => setOutputFileName(e.target.value)}
                                        placeholder="Output filename"
                                    />
                                    <button
                                        className="control-btn primary"
                                        onClick={downloadPDF}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-download"></i> Download PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </CalculatorSection>

                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                <div className="pdf-organizer-content">
                    <ContentSection id="introduction" title="Master Your PDF Structure: The Ultimate Page Organizer">
                        <p>
                            In the digital document world, the order of information is just as critical as the information itself. A PDF with pages out of sequence can be confusing, unprofessional, and ineffective. Our <strong>PDF Page Organizer</strong> is a sophisticated yet user-friendly utility designed to give you absolute control over your document's structure. It allows you to visually rearrange, reorder, and restructure your PDF pages using a seamless drag-and-drop interface.
                        </p>
                        <p>
                            Whether you are compiling a business report from multiple sources, fixing the scan order of a physical document, or simply fine-tuning a portfolio for maximum impact, this tool provides the flexibility you need. By processing files directly in your browser, we ensure that your sensitive documents remain private while delivering the speed and precision of a desktop application.
                        </p>
                    </ContentSection>

                    <ContentSection id="how-it-works" title="How to Organize PDF Pages">
                        <p>
                            Our tool leverages advanced browser-based PDF processing to manipulate your document's structure without compromising its quality. Here is the step-by-step process to perfect your PDF:
                        </p>
                        <ol className="usage-steps">
                            <li><strong>Upload Document:</strong> Begin by dragging and dropping your PDF file into the upload zone, or click to browse your device. The tool supports files up to 25MB.</li>
                            <li><strong>Instant Analysis:</strong> The system immediately analyzes the document structure and generates high-resolution thumbnails for every page, giving you a visual overview of the entire file.</li>
                            <li><strong>Visual Reordering:</strong> This is where the magic happens. Click and hold any page thumbnail, then drag it to its new location. The grid automatically adjusts to show the new sequence.</li>
                            <li><strong>Quick Actions:</strong> Use the toolbar to perform bulk operations like reversing the entire order or shuffling pages if needed. You can also reset the view to the original state at any time.</li>
                            <li><strong>Finalize & Download:</strong> Once you are satisfied with the new arrangement, click the "Download PDF" button. The tool constructs a new PDF file with your specified page order, preserving all original content and formatting.</li>
                        </ol>
                    </ContentSection>

                    <ContentSection id="features" title="Powerful Organization Features">
                        <p>
                            Designed for professionals and casual users alike, our PDF Organizer is packed with features that make document management effortless:
                        </p>
                        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="feature-item">
                                <h3><i className="fas fa-th-large"></i> Visual Drag & Drop</h3>
                                <p>Interact with your document visually. Move pages around as easily as shuffling physical papers on a desk.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-eye"></i> Real-Time Preview</h3>
                                <p>See exactly how your final document will look. The thumbnail grid provides immediate visual feedback for every change.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-bolt"></i> Lightning Fast</h3>
                                <p>Powered by modern web assembly technologies, page rendering and processing happen instantly without server uploads.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-shield-alt"></i> Privacy First</h3>
                                <p>Your files never leave your device. All processing is performed locally in your browser, ensuring 100% data security.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-undo"></i> Smart Controls</h3>
                                <p>Made a mistake? Easily reset the document to its original state or reverse the order with a single click.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-check-double"></i> Quality Assurance</h3>
                                <p>We maintain the full integrity of your original file—fonts, images, and layout remain untouched; only the page sequence changes.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <ContentSection id="usage-guide" title="Mastering the Interface">
                        <p>
                            Our interface is designed to be intuitive, but here are some tips to get the most out of it:
                        </p>
                        <ul className="usage-steps">
                            <li><strong>Thumbnail Interaction:</strong> Each card represents a page. Hovering over a card shows its current page number.</li>
                            <li><strong>Drag Dynamics:</strong> When you start dragging, a "ghost" image follows your cursor, and the other pages shift to show where the page will land when dropped.</li>
                            <li><strong>Bulk Operations:</strong> The control bar at the top offers quick actions. "Reverse" is perfect for scanned stacks that were fed in backwards. "Reset" is your safety net.</li>
                            <li><strong>File Info:</strong> The header displays the file name and total page count, helping you verify you're working on the correct document.</li>
                        </ul>
                    </ContentSection>

                    <ContentSection id="significance" title="Why Organization Matters">
                        <p>
                            A well-organized PDF is more than just a file; it's a communication tool. The sequence of information directly influences how the reader processes and understands your content:
                        </p>
                        <ul>
                            <li><strong>Logical Flow:</strong> Ensuring that arguments, data, and conclusions follow a logical progression enhances persuasion and clarity.</li>
                            <li><strong>Professionalism:</strong> A disordered document signals carelessness. A structured PDF reflects attention to detail and professional competence.</li>
                            <li><strong>Usability:</strong> For instructional manuals or reference guides, the correct page order is essential for the document to be useful at all.</li>
                        </ul>
                    </ContentSection>

                    <ContentSection id="applications" title="Common Use Cases">
                        <p>
                            From corporate boardrooms to university libraries, PDF organization is a daily necessity. Here is how different sectors utilize this tool:
                        </p>
                        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="feature-item">
                                <h3><i className="fas fa-briefcase"></i> Corporate & Legal</h3>
                                <p><strong>Contract Assembly:</strong> Merging and ordering contract pages, addendums, and signature pages in the correct legal sequence.</p>
                                <p><strong>Board Reports:</strong> Arranging financial statements, executive summaries, and departmental updates for board meetings.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-graduation-cap"></i> Education & Research</h3>
                                <p><strong>Thesis Compilation:</strong> Ordering chapters, appendices, and bibliographies for final dissertation submission.</p>
                                <p><strong>Study Materials:</strong> Organizing lecture notes and scanned handouts into a coherent study guide.</p>
                            </div>
                            <div className="feature-item">
                                <h3><i className="fas fa-palette"></i> Creative & Portfolios</h3>
                                <p><strong>Project Showcases:</strong> Arranging design samples or photography in a specific narrative order to tell a compelling story.</p>
                                <p><strong>Presentation Decks:</strong> Reordering slides exported as PDF to fine-tune the presentation flow.</p>
                            </div>
                        </div>
                    </ContentSection>

                    <FAQSection faqs={[
                        {
                            question: "How do I move a page from the end to the beginning?",
                            answer: "Simply click and hold the thumbnail of the last page, drag it all the way to the first position, and release. The grid will automatically shift all other pages down."
                        },
                        {
                            question: "Can I undo a change if I drop a page in the wrong spot?",
                            answer: "While there isn't a dedicated 'Undo' button for single moves, you can simply drag the page again to the correct spot. If you want to start over completely, hit the 'Reset' button."
                        },
                        {
                            question: "Will this tool reduce the quality of my images?",
                            answer: "No. The tool manipulates the page structure of the PDF file, not the content within the pages. Your high-resolution images and vector graphics remain exactly as they were in the original file."
                        },
                        {
                            question: "Can I organize password-protected files?",
                            answer: "For security reasons, the browser cannot access the content of encrypted files. You will need to remove the password protection using a PDF unlocking tool before organizing the pages."
                        },
                        {
                            question: "Is there a limit to how many pages I can organize?",
                            answer: "The tool handles most standard documents easily. Very large files (hundreds of pages) may take longer to generate previews depending on your computer's performance, but there is no hard limit on page count."
                        },
                        {
                            question: "Does this save my file to the cloud?",
                            answer: "No. We prioritize your privacy. The file is processed entirely within your web browser's memory. No file is ever uploaded to a remote server."
                        },
                        {
                            question: "Can I delete a page while organizing?",
                            answer: "This tool is focused on reordering. To delete pages, we recommend using our dedicated 'Delete PDF Pages' tool, which offers specific features for page removal."
                        }
                    ]} />
                </div>
            </ToolPageLayout>
        </>
    );
};

export default PdfOrganizer;
