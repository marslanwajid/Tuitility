import React, { useState, useEffect, useRef } from 'react';
import ToolPageLayout from '../../tool/ToolPageLayout';
import CalculatorSection from '../../tool/CalculatorSection';
import ContentSection from '../../tool/ContentSection';
import FAQSection from '../../tool/FAQSection';
import FeedbackForm from '../../tool/FeedbackForm';
import TableOfContents from '../../tool/TableOfContents';
import Seo from '../../Seo';
import { toolCategories } from '../../../data/toolCategories';
import '../../../assets/css/utility/rgb-to-hex-converter.css';

const RgbToHexConverter = () => {
    const [rgb, setRgb] = useState({ r: 0, g: 123, b: 255 }); // Default blueish
    const [hex, setHex] = useState('007BFF');
    const [copied, setCopied] = useState({ hex: false, rgb: false });

    // Image Picker State
    const [activeTab, setActiveTab] = useState('mixer');
    const [uploadedImage, setUploadedImage] = useState(null);
    const canvasRef = useRef(null);

    // Utils
    const rgbToHex = (r, g, b) => {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    };

    const hexToRgb = (h) => {
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Handlers
    const handleRgbChange = (field, val) => {
        let value = parseInt(val);
        if (isNaN(value)) value = 0;
        value = Math.max(0, Math.min(255, value));

        const newRgb = { ...rgb, [field]: value };
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const handleHexChange = (val) => {
        // Strip non-hex chars
        const cleanVal = val.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 6);
        setHex(cleanVal);

        if (cleanVal.length === 6) {
            const newRgb = hexToRgb(cleanVal);
            if (newRgb) {
                setRgb(newRgb);
            }
        }
    };

    const handlePickerChange = (val) => {
        const cleanHex = val.substring(1).toUpperCase(); // Remove #
        setHex(cleanHex);
        const newRgb = hexToRgb(cleanHex);
        if (newRgb) setRgb(newRgb);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    setUploadedImage(img);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    // Draw image when uploaded
    useEffect(() => {
        if (activeTab === 'image' && uploadedImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Scale to fit visually if needed, but keep pixel data accurate? 
            // Better to draw at natural size but style controls max-width
            canvas.width = uploadedImage.width;
            canvas.height = uploadedImage.height;
            ctx.drawImage(uploadedImage, 0, 0);
        }
    }, [uploadedImage, activeTab]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        // Calculate click position relative to canvas
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const newRgb = { r: pixel[0], g: pixel[1], b: pixel[2] };

        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [type]: true });
        setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    };

    // Content Data
    const toolData = {
        name: "RGB to HEX Converter",
        title: "RGB to HEX Converter & Color Picker",
        description: "Convert RGB color codes to Hexadecimal strings and vice-versa. Includes a real-time color preview and instant copy features.",
        icon: "fas fa-palette",
        category: "Converters",
        breadcrumb: ["Utility", "Tools", "Converters"],
        tags: ["rgb", "hex", "color", "converter", "web design", "css", "html"]
    };

    const relatedTools = [
        { name: "RGB to Pantone", url: "/utility-tools/converter-tools/rgb-to-pantone-converter", icon: "fas fa-swatchbook" },
        { name: "Color Blindness Simulator", url: "/utility-tools/image-tools/color-blindness-simulator", icon: "fas fa-eye" },
        { name: "Aspect Ratio Converter", url: "/utility-tools/image-tools/aspect-ratio-converter", icon: "fas fa-expand-arrows-alt" },
        { name: "Image to WebP Converter", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
        { name: "QR Code Generator", url: "/utility-tools/qr-code-generator", icon: "fas fa-qrcode" }
    ];

    const tableOfContents = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'features', title: 'Features' },
        { id: 'how-to', title: 'How to Use' },
        { id: 'rgb-vs-hex', title: 'RGB vs HEX' },
        { id: 'web-design', title: 'Web Design Usage' },
        { id: 'color-theory', title: 'Color Theory Basics' },
        { id: 'common-colors', title: 'Common Color Codes' },
        { id: 'css-formats', title: 'CSS Formats' },
        { id: 'faq', title: 'FAQ' }
    ];

    const faqs = [
        { question: "What is RGB?", answer: "RGB stands for Red, Green, Blue. It's an additive color model used for digital screens." },
        { question: "What is HEX?", answer: "HEX (Hexadecimal) is a 6-digit alphanumeric code representing Red, Green, and Blue intensity. It is standard for HTML and CSS." },
        { question: "How do I convert RGB to HEX manually?", answer: "Divide each RGB value (0-255) by 16. The quotient is the first digit, the remainder is the second. Convert 10-15 to A-F." },
        { question: "Is valid HEX always 6 digits?", answer: "Usually yes, but CSS also supports 3-digit shorthand (e.g., #FFF = #FFFFFF) and 8-digit for Alpha/Transparency." }
    ];

    // Helper for text contrast
    const getContrastColor = (r, g, b) => {
        // YIQ equation
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128 ? '#000000' : '#FFFFFF';
    };

    const textColor = getContrastColor(rgb.r, rgb.g, rgb.b);

    const seoData = {
        title: 'RGB to HEX Converter - Color Code Converter | Tuitility',
        description: 'Free RGB to HEX color converter. Pick colors from images, use the eyedropper, or enter values manually. Get instant hex codes for web design.',
        keywords: 'rgb to hex, hex to rgb, color converter, color picker, eyedropper, web colors, css colors',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/rgb-to-hex-converter'
    };

    return (
        <>
            <Seo {...seoData} />
            <ToolPageLayout toolData={toolData} categories={toolCategories} relatedTools={relatedTools} tableOfContents={tableOfContents}>

                <CalculatorSection title="RGB <-> HEX Converter" icon="fas fa-palette">

                    <div className="r2h-tabs">
                        <button
                            className={`r2h-tab ${activeTab === 'mixer' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mixer')}
                        >
                            <i className="fas fa-sliders-h"></i> Color Mixer
                        </button>
                        <button
                            className={`r2h-tab ${activeTab === 'image' ? 'active' : ''}`}
                            onClick={() => setActiveTab('image')}
                        >
                            <i className="fas fa-image"></i> Pick from Image
                        </button>
                    </div>

                    <div className="r2h-container">
                        {activeTab === 'mixer' ? (
                            <div className="r2h-grid">
                                {/* Left: Controls */}
                                <div className="r2h-controls">
                                    {/* HEX Control */}
                                    <div className="r2h-group">
                                        <label><i className="fas fa-hashtag"></i> HEX Code</label>
                                        <div className="r2h-hex-wrapper">
                                            <span className="r2h-hex-prefix">#</span>
                                            <input
                                                type="text"
                                                className="r2h-input-hex"
                                                value={hex}
                                                onChange={(e) => handleHexChange(e.target.value)}
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>

                                    {/* RGB Control */}
                                    <div className="r2h-group">
                                        <label><i className="fas fa-sliders-h"></i> RGB Values</label>
                                        <div className="r2h-rgb-inputs">
                                            {['r', 'g', 'b'].map((channel) => (
                                                <div key={channel} className="r2h-rgb-field">
                                                    <input
                                                        type="number"
                                                        className="r2h-input-rgb"
                                                        value={rgb[channel]}
                                                        onChange={(e) => handleRgbChange(channel, e.target.value)}
                                                        min={0} max={255}
                                                    />
                                                    <span className="r2h-rgb-label">{channel.toUpperCase()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="r2h-actions">
                                        <button
                                            className={`r2h-btn-copy ${copied.hex ? 'copied' : ''}`}
                                            onClick={() => copyToClipboard(`#${hex}`, 'hex')}
                                        >
                                            {copied.hex ? <><i className="fas fa-check"></i> Copied</> : <><i className="fas fa-copy"></i> Copy HEX</>}
                                        </button>
                                        <button
                                            className={`r2h-btn-copy ${copied.rgb ? 'copied' : ''}`}
                                            onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                                        >
                                            {copied.rgb ? <><i className="fas fa-check"></i> Copied</> : <><i className="fas fa-copy"></i> Copy RGB</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Preview */}
                                <div className="r2h-preview-container">
                                    <div className="r2h-color-preview" style={{ backgroundColor: `#${hex}` }}>
                                        <span className="r2h-preview-text" style={{ color: textColor }}>#{hex}</span>
                                        <span className="r2h-preview-sub" style={{ color: textColor }}>rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
                                    </div>
                                    <div className="r2h-picker-wrapper">
                                        <input
                                            type="color"
                                            className="r2h-native-picker"
                                            value={`#${hex.length === 6 ? hex : '000000'}`}
                                            onChange={(e) => handlePickerChange(e.target.value)}
                                        />
                                        <span className="r2h-picker-label">Click to pick color</span>
                                    </div>

                                    {/* EyeDropper API Button */}
                                    {window.EyeDropper && (
                                        <div className="r2h-eyedropper-wrapper">
                                            <button
                                                className="r2h-btn-eyedropper"
                                                onClick={async () => {
                                                    try {
                                                        const eyeDropper = new window.EyeDropper();
                                                        const result = await eyeDropper.open();
                                                        handleHexChange(result.sRGBHex);
                                                    } catch (e) {
                                                        console.log('EyeDropper failed or canceled');
                                                    }
                                                }}
                                            >
                                                <i className="fas fa-eye-dropper"></i> Pick from Screen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="r2h-image-picker">
                                {!uploadedImage ? (
                                    <div className="r2h-upload-zone"
                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                                        onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('drag-over');
                                            handleImageUpload({ target: { files: e.dataTransfer.files } });
                                        }}
                                    >
                                        <i className="fas fa-image fa-3x mb-3"></i>
                                        <p>Drag & Drop or Click to Upload Image</p>
                                        <input type="file" onChange={handleImageUpload} accept="image/*" className="r2h-file-input" />
                                    </div>
                                ) : (
                                    <div>
                                        <div className="r2h-image-controls">
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '5px', background: `#${hex}`, border: '1px solid #ccc' }}></div>
                                                <strong>Current: #{hex}</strong>
                                            </div>
                                            <button className="r2h-btn-reset" onClick={() => { setUploadedImage(null); }}><i className="fas fa-trash"></i> Remove Image</button>
                                        </div>
                                        <div className="r2h-canvas-wrapper">
                                            <canvas
                                                ref={canvasRef}
                                                className="r2h-canvas"
                                                onClick={handleCanvasClick}
                                            ></canvas>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 text-center"><i className="fas fa-info-circle"></i> Click anywhere on the image to pick that color.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CalculatorSection>

                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                <ContentSection id="introduction" title="Introduction">
                    <div className="content-block">
                        <p>In the digital world, colors are the language of design. Whether you are a web developer crafting a CSS stylesheet, a graphic designer working in Photoshop, or a brand manager ensuring consistency, you will encounter two primary dialects: <strong>RGB</strong> and <strong>HEX</strong>. This tool provides an instant, bidirectional bridge between them. You can convert values manually, pick colors from your screen using the EyeDropper, or even upload an image to extract specific colors pixel-by-pixel.</p>
                    </div>
                </ContentSection>

                <ContentSection id="features" title="Key Features">
                    <div className="content-block">
                        <ul>
                            <li><strong>Bidirectional Conversion:</strong> Type in Hex, get RGB. Adjust RGB sliders, get Hex. Use the color picker to update both.</li>
                            <li><strong>Image Color Picker:</strong> Upload any image (or drag and drop) and click precisely on any pixel to extract its exact color code.</li>
                            <li><strong>Screen EyeDropper:</strong> Use the "Pick from Screen" button to grab colors from anywhere on your display, even outside the browser window.</li>
                            <li><strong>Real-time Preview:</strong> See exactly how your color looks on a large swatch, with adaptive text contrast checking.</li>
                            <li><strong>One-Click Copy:</strong> Instantly copy formatted codes (e.g., `#FFFFFF` or `rgb(255, 255, 255)`).</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="how-to" title="How to Use">
                    <div className="content-block">
                        <ol>
                            <li><strong>Color Mixer Tab:</strong> Enter values manually or use the sliders. You can also use the native system picker or the "Pick from Screen" button to grab colors from other apps.</li>
                            <li><strong>Pick from Image Tab:</strong> Switch to this tab to upload an image. Once uploaded, simply click anywhere on the image to sample the color.</li>
                            <li><strong>Get Results:</strong> The selected color immediately updates the Hex and RGB fields in the Mixer tab, ready for you to copy.</li>
                            <li><strong>Copy:</strong> Click the "Copy HEX" or "Copy RGB" buttons to save the value to your clipboard.</li>
                        </ol>
                    </div>
                </ContentSection>

                <ContentSection id="rgb-vs-hex" title="RGB vs HEX: What's the Difference?">
                    <div className="content-block">
                        <p>While they describe the same thing, they do it differently:</p>
                        <ul>
                            <li><strong>RGB (Red, Green, Blue):</strong> Uses decimal numbers (0-255) to define the intensity of each light channel. `rgb(255, 0, 0)` is pure red. This maps directly to how screen pixels work.</li>
                            <li><strong>HEX (Hexadecimal):</strong> A shorthand code used primarily in web coding. It uses base-16 math (0-9 and A-F). The first two characters are Red, the next two Green, and the last two Blue. `#FF0000` is pure red.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="web-design" title="Web Design Usage">
                    <div className="content-block">
                        <p>In modern CSS, you can use either format efficiently. However, developers often prefer <strong>HEX</strong> for its brevity (7 characters including #) compared to RGB. <strong>RGB</strong> is preferred when you need to add transparency (alpha channel) via `rgba()`, although modern CSS now supports 8-digit Hex codes for transparency too (e.g., `#FF000080` for 50% opacity red).</p>
                    </div>
                </ContentSection>

                <ContentSection id="color-theory" title="Color Theory Basics">
                    <div className="content-block">
                        <p>RGB is an <strong>Additive</strong> color model. This means you start with black (darkness) and add light to create color.</p>
                        <ul>
                            <li><strong>Red + Green = Yellow</strong></li>
                            <li><strong>Green + Blue = Cyan</strong></li>
                            <li><strong>Blue + Red = Magenta</strong></li>
                            <li><strong>Red + Green + Blue = White</strong></li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="common-colors" title="Common Color Codes Reference">
                    <div className="content-block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-2">Color Name</th>
                                    <th className="py-2">Hex Code</th>
                                    <th className="py-2">RGB Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100"><td className="py-2">Black</td><td className="font-mono">#000000</td><td className="font-mono">rgb(0, 0, 0)</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-2">White</td><td className="font-mono">#FFFFFF</td><td className="font-mono">rgb(255, 255, 255)</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-2">Red</td><td className="font-mono">#FF0000</td><td className="font-mono">rgb(255, 0, 0)</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-2">Green</td><td className="font-mono">#00FF00</td><td className="font-mono">rgb(0, 255, 0)</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-2">Blue</td><td className="font-mono">#0000FF</td><td className="font-mono">rgb(0, 0, 255)</td></tr>
                            </tbody>
                        </table>
                    </div>
                </ContentSection>

                <ContentSection id="css-formats" title="Other CSS Color Formats">
                    <div className="content-block">
                        <p>Beyond RGB and HEX, CSS supports:</p>
                        <ul>
                            <li><strong>HSL (Hue, Saturation, Lightness):</strong> Often more intuitive for humans to tweak colors (e.g., "make this lighter" is just increasing the L value).</li>
                            <li><strong>LAB / LCH:</strong> Newer, perceptually uniform color spaces supported in modern browsers for higher fidelity.</li>
                        </ul>
                    </div>
                </ContentSection>

                <FAQSection id="faq" faqs={faqs} />

            </ToolPageLayout>
        </>
    );
};

export default RgbToHexConverter;
