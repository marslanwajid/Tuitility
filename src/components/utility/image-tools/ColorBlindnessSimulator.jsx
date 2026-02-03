import React, { useState, useRef, useEffect } from 'react';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import FeedbackForm from '../../tool/FeedbackForm';
import TableOfContents from '../../tool/TableOfContents';
import Seo from '../../Seo';
import { toolCategories } from '../../../data/toolCategories';
import '../../../assets/css/utility/color-blindness-simulator.css';

const ColorBlindnessSimulator = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Canvas refs
    const originalCanvasRef = useRef(null);
    const protanopiaCanvasRef = useRef(null);
    const deuteranopiaCanvasRef = useRef(null);
    const tritanopiaCanvasRef = useRef(null);
    const achromatopsiaCanvasRef = useRef(null);
    const protanomalyCanvasRef = useRef(null);
    const deuteranomalyCanvasRef = useRef(null);

    const maxWidth = 800;
    const maxHeight = 600;

    // Matrices provided by user
    const colorBlindnessMatrices = {
        protanopia: [ // Red-blind
            0.567, 0.433, 0, 0,
            0.558, 0.442, 0, 0,
            0, 0.242, 0.758, 0,
            0, 0, 0, 1
        ],
        deuteranopia: [ // Green-blind
            0.625, 0.375, 0, 0,
            0.7, 0.3, 0, 0,
            0, 0.3, 0.7, 0,
            0, 0, 0, 1
        ],
        tritanopia: [ // Blue-blind
            0.95, 0.05, 0, 0,
            0, 0.433, 0.567, 0,
            0, 0.475, 0.525, 0,
            0, 0, 0, 1
        ],
        achromatopsia: [ // Monochromacy
            0.299, 0.587, 0.114, 0,
            0.299, 0.587, 0.114, 0,
            0.299, 0.587, 0.114, 0,
            0, 0, 0, 1
        ],
        protanomaly: [ // Red-weak
            0.817, 0.183, 0, 0,
            0.333, 0.667, 0, 0,
            0, 0.125, 0.875, 0,
            0, 0, 0, 1
        ],
        deuteranomaly: [ // Green-weak
            0.8, 0.2, 0, 0,
            0.258, 0.742, 0, 0,
            0, 0.142, 0.858, 0,
            0, 0, 0, 1
        ]
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            setStatusMessage({ type: 'error', text: 'Please select an image file (JPG, PNG, GIF, etc.)' });
            return;
        }

        setStatusMessage({ type: 'info', text: 'Image loaded. Click "Simulate" to process.' });
        setSelectedImage(URL.createObjectURL(file));
        setShowResults(false);
        setIsSimulating(false);
    };

    // Auto-draw original image when selected
    useEffect(() => {
        if (selectedImage && originalCanvasRef.current) {
            const img = new Image();
            img.onload = () => {
                drawImageToCanvas(img, originalCanvasRef.current);
            };
            img.src = selectedImage;
        }
    }, [selectedImage]);

    const drawImageToCanvas = (image, canvas) => {
        const ctx = canvas.getContext('2d');
        const dimensions = calculateAspectRatioFit(image.width, image.height, maxWidth, maxHeight);
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth * ratio, height: srcHeight * ratio };
    };

    const simulateColorBlindness = () => {
        if (!selectedImage) return;

        setIsSimulating(true);
        setStatusMessage({ type: 'info', text: 'Simulating color blindness...' });

        const img = new Image();
        img.onload = () => {
            // Process all in sequence
            applyFilter(img, protanopiaCanvasRef.current, 'protanopia');
            applyFilter(img, deuteranopiaCanvasRef.current, 'deuteranopia');
            applyFilter(img, tritanopiaCanvasRef.current, 'tritanopia');
            applyFilter(img, achromatopsiaCanvasRef.current, 'achromatopsia');
            applyFilter(img, protanomalyCanvasRef.current, 'protanomaly');
            applyFilter(img, deuteranomalyCanvasRef.current, 'deuteranomaly');

            setIsSimulating(false);
            setShowResults(true);
            setStatusMessage({ type: 'success', text: 'Simulation complete.' });
        };
        img.src = selectedImage;
    };

    const applyFilter = (image, canvas, type) => {
        const ctx = canvas.getContext('2d');
        const dimensions = calculateAspectRatioFit(image.width, image.height, maxWidth, maxHeight);
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const matrix = colorBlindnessMatrices[type];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = r * matrix[0] + g * matrix[1] + b * matrix[2] + matrix[3];
            data[i + 1] = r * matrix[4] + g * matrix[5] + b * matrix[6] + matrix[7];
            data[i + 2] = r * matrix[8] + g * matrix[9] + b * matrix[10] + matrix[11];
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const resetSimulation = () => {
        setSelectedImage(null);
        setShowResults(false);
        setStatusMessage({ type: '', text: '' });
    };

    const downloadCanvas = (canvasRef, filename) => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    // Tool Data
    const toolData = {
        name: "Color Blindness Simulator",
        title: "Color Blindness Simulator",
        description: "Visualize how your images appear to people with different types of color blindness (Protanopia, Deuteranopia, Tritanopia, etc.). Essential for accessible design.",
        icon: "fas fa-eye",
        category: "Image Tools",
        breadcrumb: ["Utility", "Tools", "Image Tools"],
        tags: ["color blindness", "simulator", "accessibility", "design", "filter", "vision"]
    };

    const relatedTools = [
        { name: "RGB to Pantone", url: "/utility-tools/converter-tools/rgb-to-pantone-converter", icon: "fas fa-palette" },
        { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
        { name: "QR Code Scanner", url: "/utility-tools/converter-tools/qr-code-scanner", icon: "fas fa-qrcode" },
        { name: "RGB to HEX", url: "/converter-tools/rgb-to-hex-converter", icon: "fas fa-palette" },
        { name: "Contrast Checker", url: "/image-tools/contrast-checker", icon: "fas fa-adjust" }
    ];

    const tableOfContents = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'features', title: 'Features' },
        { id: 'types-explained', title: 'Types of Color Blindness' },
        { id: 'how-to-use', title: 'How to Use' },
        { id: 'science', title: 'The Science of Vision' },
        { id: 'accessibility', title: 'Web Accessibility (WCAG)' },
        { id: 'design-impact', title: 'Design Impact' },
        { id: 'who-needs', title: 'Who Needs This?' },
        { id: 'faq', title: 'FAQ' }
    ];

    const faqs = [
        { question: "What is the most common color blindness?", answer: "Deuteranomaly (Green-weak) is the most common, affecting about 5% of males." },
        { question: "Is this simulation accurate?", answer: "It uses scientifically derived confusion matrices to simulate the color perception, providing a very close approximation of the experience." },
        { question: "Why is accessibility important?", answer: "Approximately 1 in 12 men and 1 in 200 women have some form of color vision deficiency. Accessible design ensures your content is legible to everyone." },
        { question: "Does this tool upload my images?", answer: "No. All processing is done locally in your browser using HTML5 Canvas technology. Your privacy is guaranteed." }
    ];

    const seoData = {
        title: 'Color Blindness Simulator - Test Accessibility | Tuitility',
        description: 'Free color blindness simulator to test your designs for accessibility. Simulate Protanopia, Deuteranopia, Tritanopia, and more. Essential for WCAG compliance.',
        keywords: 'color blindness simulator, accessibility testing, protanopia, deuteranopia, tritanopia, wcag color, cvd simulator',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/image-tools/color-blindness-simulator'
    };

    return (
        <>
            <Seo {...seoData} />
            <ToolPageLayout
                toolData={toolData}
                categories={toolCategories}
                relatedTools={relatedTools}
                tableOfContents={tableOfContents}
            >
                <CalculatorSection title="Color Blindness Simulation" icon="fas fa-eye">
                    <div className="cb-simulator-container">

                        <div className="cb-upload-section"
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('drag-over');
                                if (e.dataTransfer.files.length) handleImageUpload({ target: { files: e.dataTransfer.files } });
                            }}
                        >
                            {!selectedImage ? (
                                <div className="cb-upload-prompt">
                                    <i className="fas fa-cloud-upload-alt fa-3x"></i>
                                    <p>Drag & Drop your image here or</p>
                                    <label className="cb-file-btn">
                                        Browse File
                                        <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                                    </label>
                                </div>
                            ) : (
                                <div className="cb-preview-controls">
                                    <img src={selectedImage} alt="Preview" className="cb-mini-preview" />
                                    <div className="cb-actions">
                                        {!showResults && (
                                            <button className="cb-action-btn primary" onClick={simulateColorBlindness} disabled={isSimulating}>
                                                {isSimulating ? 'Processing...' : 'Simulate Vision'}
                                            </button>
                                        )}
                                        <button className="cb-action-btn secondary" onClick={resetSimulation}>Reset</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {statusMessage.text && (
                            <div className={`cb-status-message ${statusMessage.type}`}>
                                {statusMessage.text}
                            </div>
                        )}

                        {/* Hidden canvas for original processing */}
                        <canvas ref={originalCanvasRef} style={{ display: 'none' }}></canvas>

                        {/* Results Grid */}
                        <div className="cb-results-grid" style={{ display: showResults ? 'grid' : 'none' }}>

                            {/* Protanopia */}
                            <div className="cb-result-card">
                                <div className="cb-card-header">
                                    <h4>Protanopia</h4>
                                    <span className="cb-tag">Red-Blind</span>
                                    <button onClick={() => downloadCanvas(protanopiaCanvasRef, 'protanopia.png')} title="Download">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                                <canvas ref={protanopiaCanvasRef} className="cb-result-canvas"></canvas>
                                <p className="cb-desc">Lacking red cones. Red appears dark/grey.</p>
                            </div>

                            {/* Deuteranopia */}
                            <div className="cb-result-card">
                                <div className="cb-card-header">
                                    <h4>Deuteranopia</h4>
                                    <span className="cb-tag">Green-Blind</span>
                                    <button onClick={() => downloadCanvas(deuteranopiaCanvasRef, 'deuteranopia.png')} title="Download">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                                <canvas ref={deuteranopiaCanvasRef} className="cb-result-canvas"></canvas>
                                <p className="cb-desc">Lacking green cones. Most common severe form.</p>
                            </div>

                            {/* Tritanopia */}
                            <div className="cb-result-card">
                                <div className="cb-card-header">
                                    <h4>Tritanopia</h4>
                                    <span className="cb-tag">Blue-Blind</span>
                                    <button onClick={() => downloadCanvas(tritanopiaCanvasRef, 'tritanopia.png')} title="Download">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                                <canvas ref={tritanopiaCanvasRef} className="cb-result-canvas"></canvas>
                                <p className="cb-desc">Lacking blue cones. Very rare.</p>
                            </div>

                            {/* Achromatopsia */}
                            <div className="cb-result-card">
                                <div className="cb-card-header">
                                    <h4>Achromatopsia</h4>
                                    <span className="cb-tag">Monochromacy</span>
                                    <button onClick={() => downloadCanvas(achromatopsiaCanvasRef, 'achromatopsia.png')} title="Download">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                                <canvas ref={achromatopsiaCanvasRef} className="cb-result-canvas"></canvas>
                                <p className="cb-desc">Total color blindness. Seeing in greyscale.</p>
                            </div>

                            {/* Protanomaly */}
                            <div className="cb-result-card">
                                <div className="cb-card-header">
                                    <h4>Protanomaly</h4>
                                    <span className="cb-tag">Red-Weak</span>
                                    <button onClick={() => downloadCanvas(protanomalyCanvasRef, 'protanomaly.png')} title="Download">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                                <canvas ref={protanomalyCanvasRef} className="cb-result-canvas"></canvas>
                            </div>

                            {/* Deuteranomaly */}
                            <div className="cb-result-card">
                                <div className="cb-card-header">
                                    <h4>Deuteranomaly</h4>
                                    <span className="cb-tag">Green-Weak</span>
                                    <button onClick={() => downloadCanvas(deuteranomalyCanvasRef, 'deuteranomaly.png')} title="Download">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                                <canvas ref={deuteranomalyCanvasRef} className="cb-result-canvas"></canvas>
                            </div>

                        </div>
                    </div>
                </CalculatorSection>

                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                <ContentSection id="introduction" title="Introduction">
                    <div className="content-block">
                        <p>Welcome to the <strong>Color Blindness Simulator</strong>, a professional-grade tool designed to help you visualize how your images are perceived by individuals with various forms of Color Vision Deficiency (CVD). Color blindness affects approximately 1 in 12 men (8%) and 1 in 200 women worldwide. In the digital age, ensuring your content is accessible to this significant demographic is not just a regulatory requirement—it's a moral imperative and a design best practice. Our simulator uses scientifically accurate confusion matrices to apply filters to your images, allowing you to instantly see the world through the eyes of someone with Protanopia, Deuteranopia, Tritanopia, or Achromatopsia.</p>
                    </div>
                </ContentSection>

                <ContentSection id="features" title="Key Features">
                    <div className="content-block">
                        <ul>
                            <li><strong>Multi-Spectrum Simulation:</strong> Simultaneously generate simulations for 6 distinct types of color blindness, including Red-Blind, Green-Blind, and Blue-Blind conditions.</li>
                            <li><strong>Instant Browser Processing:</strong> All image processing is performed locally within your browser using HTML5 Canvas technology. No images are ever uploaded to a server, ensuring 100% privacy and security.</li>
                            <li><strong>High-Fidelity Rendering:</strong> We utilize industry-standard linear algebra algorithms (matrices) to manipulate pixel data, providing the most accurate representation of CVD possible.</li>
                            <li><strong>Export Capability:</strong> Download any of the simulated images with a single click to share with stakeholders, include in accessibility reports, or use for before-and-after comparisons.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="types-explained" title="Types of Color Blindness Explained">
                    <div className="content-block">
                        <p>Understanding the nuances of CVD is crucial for inclusive design:</p>
                        <ul>
                            <li><strong>Protanopia (Red-Blind):</strong> A complete absence of red cones. Colors like red, orange, and yellow often appear as shades of yellow or green. Red traffic lights may appear dark or extinguished.</li>
                            <li><strong>Deuteranopia (Green-Blind):</strong> A complete absence of green cones. This is a severe form where red and green are indistinguishable. It is the classic "Daltonism".</li>
                            <li><strong>Tritanopia (Blue-Blind):</strong> A rare absence of blue cones. Users confuse blue with green and yellow with violet. It dramatically changes the perception of cool colors.</li>
                            <li><strong>Anomalous Trichromacy:</strong> The most common category, including <strong>Protanomaly</strong> (Red-Weak) and <strong>Deuteranomaly</strong> (Green-Weak). People with these conditions have all three cone types, but one is malfunctioned, leading to reduced color sensitivity.</li>
                            <li><strong>Achromatopsia (Monochromacy):</strong> The complete inability to see color. The world is seen in shades of grey, often accompanied by high light sensitivity.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="how-to-use" title="How to Use This Tool">
                    <div className="content-block">
                        <ol>
                            <li><strong>Upload Your Image:</strong> Click "Browse File" or drag and drop an image (JPG, PNG, GIF) onto the canvas area.</li>
                            <li><strong>Run Simulation:</strong> Click the "Simulate Vision" button. The tool will process the image against 6 different CVD matrices.</li>
                            <li><strong>Analyze Results:</strong> Scroll down to see the output presented in a 2-column grid. Compare the Original with the Protanopia, Deuteranopia, etc.</li>
                            <li><strong>Download:</strong> Use the download icon on any specific card to save that version of the image for your records.</li>
                        </ol>
                    </div>
                </ContentSection>

                <ContentSection id="science" title="The Science of Vision">
                    <div className="content-block">
                        <p>Human color vision relies on specialized cells in the retina called <strong>photoreceptors</strong>. There are two main types: rods (for low light) and cones (for color). Most humans are trichromats, possessing three types of cones sensitive to Short (Blue), Medium (Green), and Long (Red) wavelengths.</p>
                        <p>Color blindness occurs when one or more of these cone types are missing or defective. Our simulator mimics this by mathematically remapping the RGB values of every pixel in your image to the "confusion lines" experienced by dichromats (people with only two working cone types).</p>
                    </div>
                </ContentSection>

                <ContentSection id="accessibility" title="Web Accessibility (WCAG)">
                    <div className="content-block">
                        <p>The <strong>Web Content Accessibility Guidelines (WCAG)</strong> are the international standard for web accessibility. WCAG 2.1 Success Criterion 1.4.1 states: <em>"Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element."</em></p>
                        <p>Using this simulator helps you audit your compliance. If a chart, button, or alert message becomes unreadable in the Deuteranopia view, you are likely failing this criterion and excluding users.</p>
                    </div>
                </ContentSection>

                <ContentSection id="design-impact" title="Design Impact & Best Practices">
                    <div className="content-block">
                        <p>Designing for CVD doesn't mean making your designs black and white. It means creating <strong>redundant coding</strong>:</p>
                        <ul>
                            <li><strong>Use Patterns:</strong> In charts, use hatched lines or dots in addition to color to distinguish data series.</li>
                            <li><strong>Add Icons:</strong> Don't rely on a red border to indicate an error. Add an exclamation mark icon.</li>
                            <li><strong>Underline Links:</strong> Don't rely solely on blue text to denote hyperlinks; keeps underlines or add hover effects.</li>
                            <li><strong>Check Contrast:</strong> Ensure high contrast between text and background. This helps everyone, not just those with CVD.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="who-needs" title="Who Needs This Tool?">
                    <div className="content-block">
                        <p>This tool is essential for:</p>
                        <ul>
                            <li><strong>UI/UX Designers:</strong> To stress-test interface elements.</li>
                            <li><strong>Game Developers:</strong> To ensure HUDs and team colors are distinguishable.</li>
                            <li><strong>Data Scientists:</strong> To verify that visualizations are readable.</li>
                            <li><strong>Educators:</strong> To create inclusive learning materials.</li>
                            <li><strong>Digital Marketers:</strong> To ensure call-to-action buttons stand out to every potential customer.</li>
                        </ul>
                    </div>
                </ContentSection>

                <FAQSection id="faq" faqs={faqs} />
            </ToolPageLayout>
        </>
    );
};

export default ColorBlindnessSimulator;
