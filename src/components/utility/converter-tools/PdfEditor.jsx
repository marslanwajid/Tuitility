import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Tesseract from 'tesseract.js';
import * as fabric from 'fabric';
import '../../../assets/css/utility/converter-tools/pdf-editor.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Helper to convert Fabric/Canvas top-left coords to PDF bottom-left coords
const convertToPdfCoords = (canvasVal, pdfHeight, scale = 2, isY = false, height = 0) => {
    const unscaled = canvasVal / scale;
    if (isY) {
        return pdfHeight - unscaled - (height / scale);
    }
    return unscaled;
};

const TOOLS = [
    { id: 'select', name: 'Select', icon: 'fas fa-mouse-pointer' },
    { id: 'text', name: 'Text', icon: 'fas fa-font' },
    { id: 'image', name: 'Image', icon: 'fas fa-image' },
    { id: 'shapes', name: 'Shapes', icon: 'fas fa-shapes' },
];

const PdfEditor = () => {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pagesData, setPagesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [zoom, setZoom] = useState(1);
    const [selectedTool, setSelectedTool] = useState('select');

    // We store the fabric canvas instances to retrieve their objects on save
    const fabricCanvasesRef = useRef({});

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    // Sync tools across all canvases
    useEffect(() => {
        Object.values(fabricCanvasesRef.current).forEach(fCanvas => {
            if (!fCanvas) return;
            fCanvas.defaultCursor = selectedTool === 'select' ? 'default' : 'crosshair';
            fCanvas.selection = selectedTool === 'select';
            fCanvas.forEachObject(obj => {
                obj.selectable = selectedTool === 'select';
                obj.evented = selectedTool === 'select';
            });
            fCanvas.renderAll();
        });
    }, [selectedTool, pagesData]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setLoadingMessage('Loading PDF Document...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const doc = await loadingTask.promise;

            setPdfDoc(doc);
            setPdfFile(file);

            const pages = [];
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                pages.push({
                    pageNumber: i,
                    originalPage: page
                });
            }
            setPagesData(pages);
            // Reset canvases ref on new file
            fabricCanvasesRef.current = {};

        } catch (err) {
            console.error(err);
            alert('Failed to load PDF.');
        }

        setLoading(false);
    };

    const addImageOverlay = async (file) => {
        if (!file) return;
        const src = URL.createObjectURL(file);
        
        // Add to the first page's canvas for now (in a real app, track active page)
        const firstCanvas = fabricCanvasesRef.current[0];
        if (firstCanvas) {
            fabric.Image.fromURL(src, (img) => {
                img.set({
                    left: 100,
                    top: 100,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    isNewElement: true,
                    isModified: true
                });
                firstCanvas.add(img);
                firstCanvas.setActiveObject(img);
                firstCanvas.renderAll();
            });
        }
    };

    const savePdf = async () => {
        if (!pdfFile) return;

        setLoading(true);
        setLoadingMessage('Applying OCR edits to PDF...');

        try {
            const existingPdfBytes = await pdfFile.arrayBuffer();
            const pdfDocLib = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDocLib.getPages();

            const helveticaFont = await pdfDocLib.embedFont(StandardFonts.Helvetica);
            const helveticaBoldFont = await pdfDocLib.embedFont(StandardFonts.HelveticaBold);

            // The scale used for rendering and OCR
            const OCR_SCALE = 2; 

            for (let i = 0; i < pagesData.length; i++) {
                const page = pages[i];
                const fCanvas = fabricCanvasesRef.current[i];
                if (!fCanvas) continue; // Canvas wasn't loaded/initialized

                const objects = fCanvas.getObjects();

                for (const obj of objects) {
                    // Only process modified OCR objects or totally new elements
                    if (!obj.isModified) continue;

                    // If it's a modified OCR text box, whiteout the original location
                    if (obj.originalBbox) {
                        const { x0, y0, x1, y1 } = obj.originalBbox;
                        const origWidth = x1 - x0;
                        const origHeight = y1 - y0;
                        
                        // Convert OCR bbox back to PDF points
                        const pdfOrigX = convertToPdfCoords(x0, page.getHeight(), OCR_SCALE, false);
                        const pdfOrigY = convertToPdfCoords(y0, page.getHeight(), OCR_SCALE, true, origHeight);
                        
                        page.drawRectangle({
                            x: pdfOrigX - 2, // Slight padding
                            y: pdfOrigY - 2,
                            width: (origWidth / OCR_SCALE) + 4,
                            height: (origHeight / OCR_SCALE) + 4,
                            color: rgb(1, 1, 1),
                            opacity: 1
                        });
                    }

                    // Draw the updated/new object
                    if (obj.type === 'textbox' || obj.type === 'i-text') {
                        const pdfX = convertToPdfCoords(obj.left, page.getHeight(), OCR_SCALE, false);
                        const pdfY = convertToPdfCoords(obj.top, page.getHeight(), OCR_SCALE, true, obj.height);
                        
                        // Fabric width/height does not strictly map to PDF font bounding box 1:1, so we calculate font size
                        const pdfFontSize = (obj.fontSize / OCR_SCALE) * obj.scaleY;

                        let font = helveticaFont;
                        if (obj.fontWeight === 'bold') {
                            font = helveticaBoldFont;
                        }

                        // Parse color from fabric
                        let r = 0, g = 0, b = 0;
                        if (obj.fill && obj.fill.startsWith('#')) {
                            const hex = obj.fill.replace('#', '');
                            r = parseInt(hex.substring(0, 2), 16) / 255;
                            g = parseInt(hex.substring(2, 4), 16) / 255;
                            b = parseInt(hex.substring(4, 6), 16) / 255;
                        }

                        // Handle multiline
                        const textLines = obj.text.split('\n');
                        const lineHeight = obj.lineHeight * pdfFontSize;

                        textLines.forEach((line, lineIndex) => {
                            page.drawText(line, {
                                x: pdfX,
                                // Adjust y for baseline and lines
                                y: pdfY + (obj.height / OCR_SCALE) - pdfFontSize - (lineIndex * lineHeight),
                                size: pdfFontSize,
                                font,
                                color: rgb(r, g, b)
                            });
                        });
                    } else if (obj.type === 'image') {
                        // Handle dragged image overlays
                        const base64 = obj.getSrc();
                        const imageBytes = await fetch(base64).then(res => res.arrayBuffer());
                        
                        let embeddedImage;
                        if (base64.includes('png')) {
                            embeddedImage = await pdfDocLib.embedPng(imageBytes);
                        } else {
                            embeddedImage = await pdfDocLib.embedJpg(imageBytes);
                        }

                        const pdfX = convertToPdfCoords(obj.left, page.getHeight(), OCR_SCALE, false);
                        const pdfY = convertToPdfCoords(obj.top, page.getHeight(), OCR_SCALE, true, obj.getScaledHeight());

                        page.drawImage(embeddedImage, {
                            x: pdfX,
                            y: pdfY,
                            width: obj.getScaledWidth() / OCR_SCALE,
                            height: obj.getScaledHeight() / OCR_SCALE
                        });
                    }
                }
            }

            const pdfBytes = await pdfDocLib.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `sejda-level-${pdfFile.name}`;
            a.click();

        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving PDF.");
        }

        setLoading(false);
    };

    return (
        <div className="pdf-editor-container">
            <header className="editor-top-toolbar">
                <div className="toolbar-logo">
                    <i className="fas fa-file-pdf"></i>
                    <span>Tuitility PDF Editor (OCR)</span>
                </div>

                <div className="toolbar-tools">
                    {TOOLS.map(tool => (
                        <button
                            key={tool.id}
                            className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedTool(tool.id);
                                if (tool.id === 'text') {
                                    // Add a sample textbox to the first page when clicking text tool
                                    const firstCanvas = fabricCanvasesRef.current[0];
                                    if (firstCanvas) {
                                        const textbox = new fabric.Textbox('Add text here', {
                                            left: 50,
                                            top: 50,
                                            width: 150,
                                            fontSize: 20,
                                            fill: '#000000',
                                            backgroundColor: 'white',
                                            isModified: true
                                        });
                                        firstCanvas.add(textbox);
                                        firstCanvas.setActiveObject(textbox);
                                        firstCanvas.renderAll();
                                    }
                                }
                            }}
                        >
                            <i className={tool.icon}></i>
                            <span>{tool.name}</span>
                        </button>
                    ))}
                </div>

                <div className="toolbar-actions">
                    <button className="tool-btn" onClick={() => setZoom(prev => prev + 0.1)}>
                        <i className="fas fa-search-plus"></i>
                    </button>
                    <button className="tool-btn" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>
                        <i className="fas fa-search-minus"></i>
                    </button>
                    <button className="tool-btn" onClick={() => imageInputRef.current.click()}>
                        <i className="fas fa-image"></i>
                    </button>
                    <button className="apply-btn" onClick={savePdf}>
                        Save PDF
                    </button>
                </div>
            </header>

            {!pdfDoc && (
                <div className="upload-placeholder">
                    <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                        Upload PDF to Begin OCR
                    </button>
                    <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                </div>
            )}

            <input
                type="file"
                hidden
                accept="image/*"
                ref={imageInputRef}
                onChange={(e) => addImageOverlay(e.target.files[0])}
            />

            <div className="editor-pages-scroll">
                {pagesData.map((page, idx) => (
                    <PdfPage
                        key={idx}
                        pageData={page}
                        pageIndex={idx}
                        zoom={zoom}
                        fabricCanvasesRef={fabricCanvasesRef}
                    />
                ))}
            </div>

            {loading && (
                <div className="editor-loading">
                    <div className="spinner"></div>
                    <p style={{marginTop: '1rem'}}>{loadingMessage}</p>
                </div>
            )}
        </div>
    );
};

const PdfPage = ({ pageData, pageIndex, zoom, fabricCanvasesRef }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const fabricCanvasElRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [viewport, setViewport] = useState(null);
    const [isOcrProcessing, setIsOcrProcessing] = useState(false);
    const [ocrDone, setOcrDone] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const OCR_SCALE = 2; 

        const renderPageAndOcr = async () => {
            if (ocrDone) return;
            const canvas = canvasRef.current;
            if (!canvas) return;

            const vp = pageData.originalPage.getViewport({ scale: OCR_SCALE });
            setViewport(vp);

            canvas.width = vp.width;
            canvas.height = vp.height;

            const context = canvas.getContext('2d');
            
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel(); } catch(e) {}
            }

            renderTaskRef.current = pageData.originalPage.render({ canvasContext: context, viewport: vp });
            
            try {
                await renderTaskRef.current.promise;
            } catch (err) {
                if (err.name === 'RenderingCancelledException') return;
                console.error("PDF Render Error:", err);
                return;
            }

            if (!isMounted) return;

            // Initialize Fabric Canvas if not already
            if (!fabricCanvasesRef.current[pageIndex]) {
                const fCanvas = new fabric.Canvas(fabricCanvasElRef.current, {
                    width: vp.width,
                    height: vp.height,
                    selection: true
                });
                fabricCanvasesRef.current[pageIndex] = fCanvas;

                fCanvas.on('object:modified', (e) => {
                    if (e.target) {
                        e.target.isModified = true;
                        if (e.target.type === 'textbox') e.target.set({ backgroundColor: 'white' });
                        fCanvas.renderAll();
                    }
                });

                fCanvas.on('text:changed', (e) => {
                    if (e.target) {
                        e.target.isModified = true;
                        e.target.set({ backgroundColor: 'white' });
                        fCanvas.renderAll();
                    }
                });
            }

            const fCanvas = fabricCanvasesRef.current[pageIndex];

            // Run Tesseract OCR
            setIsOcrProcessing(true);
            try {
                const imgData = canvas.toDataURL('image/png');
                const worker = await Tesseract.createWorker('eng', 1, {
                    logger: m => console.log(m)
                });
                
                const result = await worker.recognize(imgData);
                const lines = result.data?.lines || [];
                
                lines.forEach(line => {
                    const text = line.text.trim();
                    if (!text) return;

                    const bbox = line.bbox;
                    const width = bbox.x1 - bbox.x0;
                    const height = bbox.y1 - bbox.y0;
                    const fontSize = Math.max(10, height * 0.75);

                    const textbox = new fabric.Textbox(text, {
                        left: bbox.x0,
                        top: bbox.y0,
                        width: width + 10,
                        fontSize: fontSize,
                        fontFamily: 'sans-serif',
                        fill: '#000000',
                        backgroundColor: 'transparent',
                        borderColor: '#2563eb',
                        cornerColor: '#2563eb',
                        cornerSize: 8,
                        transparentCorners: false,
                        padding: 4,
                        originalBbox: bbox,
                        isModified: false
                    });

                    fCanvas.add(textbox);
                });

                await worker.terminate();

                if (isMounted) {
                    setIsOcrProcessing(false);
                    setOcrDone(true);
                    fCanvas.renderAll();
                }
            } catch (err) {
                console.error("OCR Error:", err);
                if (isMounted) setIsOcrProcessing(false);
            }
        };

        renderPageAndOcr();

        return () => { 
            isMounted = false; 
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel(); } catch(e) {}
            }
        };
    }, [pageData, pageIndex]);

    // Handle Zoom and Viewport changes natively in Fabric
    useEffect(() => {
        const fCanvas = fabricCanvasesRef.current[pageIndex];
        if (fCanvas && viewport) {
            const finalZoom = zoom; 
            fCanvas.setZoom(finalZoom);
            fCanvas.setDimensions({
                width: viewport.width * finalZoom / 2,
                height: viewport.height * finalZoom / 2
            });
            fCanvas.renderAll();
        }
    }, [zoom, viewport, pageIndex]);

    // Apply zoom by scaling the container via CSS
    const scaledWidth = viewport ? viewport.width * (zoom / 2) : 'auto';
    const scaledHeight = viewport ? viewport.height * (zoom / 2) : 'auto';

    return (
        <div 
            className="pdf-page-container" 
            ref={containerRef}
            style={{ 
                position: 'relative', 
                width: viewport ? viewport.width * zoom / 2 : 'auto', 
                height: viewport ? viewport.height * zoom / 2 : 'auto',
                backgroundColor: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            }}>
                {/* Background Rendered PDF */}
                <canvas 
                    ref={canvasRef} 
                    className="pdf-page-canvas"
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                />
                
                {/* Fabric Interactive Layer */}
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                    <canvas ref={fabricCanvasElRef} />
                </div>
            </div>

            {isOcrProcessing && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                }}>
                    <div className="spinner"></div>
                    <p style={{fontWeight: 'bold', marginTop: '10px', color: '#2563eb'}}>Running Tesseract OCR...</p>
                    <p style={{fontSize: '0.8rem', color: '#666'}}>Extracting editable text lines</p>
                </div>
            )}
        </div>
    );
};

export default PdfEditor;