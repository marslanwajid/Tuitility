import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import FeedbackForm from '../tool/FeedbackForm';
import TableOfContents from '../tool/TableOfContents';
import Seo from '../Seo';
import '../../assets/css/utility/qr-code-scanner.css';
import { toolCategories } from '../../data/toolCategories';


const QRCodeScanner = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [stream, setStream] = useState(null);

    // Stop camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const showStatus = (message, type) => {
        setStatus({ message, type });
    };

    const startCamera = async () => {
        setStatus({ message: '', type: '' });
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });

                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    // Required for iOS
                    videoRef.current.setAttribute('playsinline', true);
                    videoRef.current.style.display = 'block';
                    videoRef.current.play();
                    setScanning(true);
                    requestAnimationFrame(scanQRCode);
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                showStatus('Could not access the camera. Please make sure you have granted permission.', 'error');
            }
        } else {
            showStatus('Sorry, your browser does not support accessing the camera.', 'error');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.style.display = 'none';
        }
        setScanning(false);
    };

    const toggleCamera = () => {
        if (scanning) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current) return;

        // If stopped externally
        if (!stream && !scanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                setResult(code.data);
                // Optional: Stop after scan
                // stopCamera();
                showStatus('QR Code detected!', 'success');
            }
        }

        if (scanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

    // Image File Handling
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (scanning) {
            stopCamera();
        }

        showStatus('Processing image...', 'info');
        setResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                processImageWithEnhancement(img);
            };
            img.onerror = () => {
                showStatus('Error loading image. Please try another file.', 'error');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const displayResult = (data) => {
        setResult(data);
        showStatus('QR Code found!', 'success');
    };

    // --- User's Enhancement Logic Adapted ---

    const processImageWithEnhancement = (img) => {
        if (tryProcessingImage(img, 1.0, "attemptBoth")) return;
        if (tryWithPreprocessing(img)) return;
        if (tryWithMultipleSettings(img)) return;

        showStatus("No QR code found in the image. Try a clearer image or different format.", 'error');
    };

    const tryProcessingImage = (img, scale, inversionMode) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const scaledWidth = Math.floor(img.width * scale);
        const scaledHeight = Math.floor(img.height * scale);

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        try {
            const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: inversionMode
            });
            if (code) {
                displayResult(code.data);
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    };

    const tryWithPreprocessing = (img) => {
        const scales = [1.0, 1.5, 2.0, 0.8, 0.5];
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        for (const scale of scales) {
            const scaledWidth = Math.floor(img.width * scale);
            const scaledHeight = Math.floor(img.height * scale);

            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                enhanceContrast(imageData.data);
                ctx.putImageData(imageData, 0, 0);

                const enhancedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(enhancedData.data, enhancedData.width, enhancedData.height, {
                    inversionAttempts: "attemptBoth"
                });

                if (code) {
                    displayResult(code.data);
                    return true;
                }
            } catch (e) { console.error(e); }
        }
        return false;
    };

    const enhanceContrast = (data) => {
        const factor = 1.5;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const newVal = factor * (avg - 128) + 128;
            const finalVal = newVal > 128 ? 255 : 0;
            data[i] = finalVal;
            data[i + 1] = finalVal;
            data[i + 2] = finalVal;
        }
    };

    const tryWithMultipleSettings = (img) => {
        const scales = [1.0, 1.5, 2.0, 0.8, 0.5, 3.0];
        const inversionModes = ["attemptBoth", "dontInvert", "onlyInvert"];
        for (const scale of scales) {
            for (const mode of inversionModes) {
                if (tryProcessingImage(img, scale, mode)) return true;
            }
        }
        return false;
    };

    const isValidURL = (string) => {
        try { return Boolean(new URL(string)); } catch (e) { return false; }
    };

    // --- Tool Data ---
    const toolData = {
        name: "QR Code Scanner",
        title: "Online QR Code Scanner",
        description: "Scan QR codes instantly directly from your browser using your webcam or by uploading an image. Fast, secure, and privacy-focused.",
        icon: "fas fa-qrcode",
        category: "Utility",
        breadcrumb: ["Utility", "Tools", "Generator Tools"],
        tags: ["qr", "scanner", "barcode", "reader", "camera"]
    };


    const relatedTools = [
        { name: "QR Code Generator", url: "/utility-tools/generator-tools/qr-code-generator", icon: "fas fa-qrcode" },
        { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
        { name: "TikTok Downloader", url: "/utility-tools/converter-tools/tiktok-downloader", icon: "fab fa-tiktok" },
        { name: "Instagram Reels Downloader", url: "/utility-tools/converter-tools/reels-downloader", icon: "fab fa-instagram" },
        { name: "Password Generator", url: "/password-generator", icon: "fas fa-key" },
        { name: "Text to Speech", url: "/converter-tools/text-to-speech-converter", icon: "fas fa-volume-up" }
    ];

    const tableOfContents = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'technology', title: 'Technology' },
        { id: 'features', title: 'Key Features' },
        { id: 'how-works', title: 'How it Works' },
        { id: 'security', title: 'Security' },
        { id: 'applications', title: 'Applications' },
        { id: 'technical-specs', title: 'Specifications' },
        { id: 'best-practices', title: 'Best Practices' },
        { id: 'faqs', title: 'FAQ' }
    ];

    const faqs = [
        {
            question: "Is my camera feed recorded?",
            answer: "No. The scanning process effectively happens entirely in your browser's memory. No video or image data is sent to our servers."
        },
        {
            question: "Why can't I access the camera?",
            answer: "Please ensure you have granted camera permissions to this website. Also, check if another application is using the camera."
        },
        {
            question: "What formats are supported?",
            answer: "Our scanner works with standard QR codes containing URLs, text, Wi-Fi info, and more."
        },
        {
            question: "Can I scan from an image file?",
            answer: "Yes, you can upload an image file (PNG, JPG, etc.) if you don't have a webcam or want to scan a saved code."
        },
        {
            question: "Does it work offline?",
            answer: "Yes, once the page is loaded, the scanning logic works locally. However, an internet connection is needed to visit any URL you scan."
        },
        {
            question: "Is it safe to scan any QR code?",
            answer: "Always be cautious. Our scanner reveals the content first so you can verify the URL before visiting it, protecting you from malicious links."
        },
        {
            question: "Why is the scanner not detecting my code?",
            answer: "Ensure adequate lighting and that the code is in focus. For files, try to crop the image closer to the QR code or adjust the contrast."
        },
        {
            question: "Can I scan barcodes?",
            answer: "Currently, this tool is optimized specifically for QR (Quick Response) codes, not traditional linear barcodes."
        }
    ];

    const seoData = {
        title: 'QR Code Scanner - Scan QR Codes Online Free | Tuitility',
        description: 'Free online QR code scanner. Scan QR codes using your camera or upload images. Fast, secure, and privacy-focused with local processing.',
        keywords: 'qr code scanner, scan qr code, qr reader, online qr scanner, camera qr scan, upload qr image',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/qr-code-scanner'
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
                <CalculatorSection title="QR Code Scanner" icon="fas fa-qrcode">
                    <div className="qr-scanner-container">
                        <div className="scanner-controls">
                            <button
                                className={`scan-btn camera-btn ${scanning ? 'active' : ''}`}
                                onClick={toggleCamera}
                            >
                                <i className={`fas ${scanning ? 'fa-stop-circle' : 'fa-camera'}`}></i>
                                {scanning ? 'Stop Camera' : 'Start Camera'}
                            </button>

                            <div className="file-upload-wrapper">
                                <button className="scan-btn file-btn">
                                    <i className="fas fa-file-upload"></i> Upload Image
                                </button>
                                <input
                                    type="file"
                                    id="qrFileInput"
                                    accept="image/*"
                                    className="file-input"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        <div className="scanner-wrapper">
                            {status.message && (
                                <div className={`status-bubble ${status.type} mb-4 p-2 rounded text-sm font-semibold ` + (status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                                    {status.message}
                                </div>
                            )}

                            <video
                                ref={videoRef}
                                id="qrVideo"
                                className="video-preview"
                                muted
                                playsInline
                            ></video>

                            <canvas ref={canvasRef} id="qrCanvas" style={{ display: 'none' }}></canvas>

                            {result && (
                                <div className="qr-result-area" id="qr-result">
                                    <div className="result-label">Scan Result</div>
                                    <div className="result-content" id="resultContent">
                                        {isValidURL(result) ? (
                                            <p>QR Code contains a URL: <br />
                                                <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
                                            </p>
                                        ) : (
                                            result
                                        )}
                                    </div>
                                </div>
                            )}

                            {!result && !scanning && !status.message && (
                                <div className="text-gray-400 mt-4">
                                    <i className="fas fa-qrcode fa-3x mb-3"></i>
                                    <p>Start Camera or Upload an Image to Scan</p>
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
                    <div className="content-block">
                        <p>Our Online QR Code Scanner provides a secure and instant way to decode QR codes directly from your browser. Whether using a live webcam feed or uploading a saved image, our tool processes data locally on your device, ensuring privacy and speed. Experience the convenience of a dedicated scanner app without the need for installation.</p>
                    </div>
                </ContentSection>

                <ContentSection id="technology" title="Advanced Scanning Technology">
                    <div className="content-block">
                        <p>Powered by the robust <code>jsQR</code> library and custom image enhancement algorithms, our scanner pushes the boundaries of browser-based detection:</p>
                        <ul>
                            <li><strong>Local Processing Engine:</strong> Utilizing WebAssembly and JavaScript to process video frames in real-time within the client.</li>
                            <li><strong>Contrast Enhancement:</strong> Automatic image pre-processing improves detection rates for low-contrast or faded codes.</li>
                            <li><strong>Multi-Scale Analysis:</strong> Smart algorithms scan images at various scales to detect small or distant QR codes.</li>
                            <li><strong>Error Correction:</strong> Capable of reading partially damaged or obscured codes thanks to standard Reed-Solomon error correction.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="features" title="Key Features">
                    <div className="content-block">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th>Benefit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Dual Mode</td>
                                    <td>Supports both live camera scanning and file uploads</td>
                                </tr>
                                <tr>
                                    <td>Privacy First</td>
                                    <td>No data is sent to the cloud; all processing is local</td>
                                </tr>
                                <tr>
                                    <td>Device Support</td>
                                    <td>Works on desktop, mobile (iOS/Android), and tablets</td>
                                </tr>
                                <tr>
                                    <td>Safety Check</td>
                                    <td>Preview URLs before visiting to avoid malicious sites</td>
                                </tr>
                                <tr>
                                    <td>Instant Results</td>
                                    <td>Zero latency decoding for immediate access</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ContentSection>

                <ContentSection id="how-works" title="How it Works">
                    <div className="content-block">
                        <p>Scanning is simple and requires no software installation:</p>
                        <ul>
                            <li><strong>Camera Mode:</strong> Click "Start Camera" and allow browser permissions. Point your camera at the QR code.</li>
                            <li><strong>Image Mode:</strong> Click "Upload Image" and select a file containing a QR code from your device.</li>
                            <li><strong>Results:</strong> The content (URL, text, etc.) will appear instantly below the scanning area.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="security" title="Security & Privacy">
                    <div className="content-block">
                        <p>Your privacy is paramount. Unlike many online scanners that upload your images to a server, our tool strictly uses your browser's capabilities. This means sensitive QR codes (like 2FA secrets or private keys) remain safe on your device and are never intercepted. We do not store, log, or transmit your scan data.</p>
                    </div>
                </ContentSection>

                <ContentSection id="applications" title="Common Applications">
                    <div className="content-block">
                        <p>QR codes are ubiquitous in modern life. Our tool helps you interact with:</p>
                        <ul>
                            <li><strong>Website Links:</strong> Quickly access restaurant menus, event pages, or product info.</li>
                            <li><strong>Wi-Fi Access:</strong> Scan network credentials to connect instantly.</li>
                            <li><strong>Contact Sharing:</strong> Decode vCards to save contact information.</li>
                            <li><strong>Authentication:</strong> Scan 2FA setup codes (though we recommend using a dedicated authenticator app for this).</li>
                            <li><strong>Payments:</strong> Verify payment addresses or invoice details encoded in QR.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="technical-specs" title="Technical Specifications">
                    <div className="content-block">
                        <div className="specs-box">
                            <h4 className="font-bold mb-3">System Requirements</h4>
                            <div className="specs-grid">
                                <div className="spec-item"><i className="fab fa-chrome"></i> <span>Browser: Modern (Chrome, Safari, Edge)</span></div>
                                <div className="spec-item"><i className="fas fa-camera"></i> <span>Hardware: Camera (for live scan)</span></div>
                            </div>
                        </div>
                        <ul>
                            <li><strong>Library:</strong> jsQR 1.4.0</li>
                            <li><strong>Supported Formats:</strong> QR Code (Model 1 & 2), Micro QR</li>
                            <li><strong>Input Formats:</strong> Video Stream, PNG, JPG, GIF, WebP</li>
                            <li><strong>Processing:</strong> Client-side Canvas API</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="best-practices" title="Best Practices">
                    <div className="content-block">
                        <p>For the best scanning experience:</p>
                        <ul>
                            <li><strong>Lighting:</strong> Ensure the QR code is well-lit but avoid strong glare/reflection.</li>
                            <li><strong>Distance:</strong> Hold the camera about 6-10 inches away depending on the code size.</li>
                            <li><strong>Stability:</strong> Keep the device steady; motion blur is the #1 enemy of scanning.</li>
                            <li><strong>Clean Lens:</strong> A smudged camera lens can prevent the autofocus from locking on.</li>
                        </ul>
                    </div>
                </ContentSection>

                <FAQSection id="faqs" faqs={faqs} />

            </ToolPageLayout>
        </>
    );
};

export default QRCodeScanner;
