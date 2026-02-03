import React, { useState } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import FeedbackForm from '../tool/FeedbackForm';
import TableOfContents from '../tool/TableOfContents';
import Seo from '../Seo';
import '../../assets/css/utility/tiktok-downloader.css';
import { toolCategories } from '../../data/toolCategories';


const TikTokDownloader = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [videoResult, setVideoResult] = useState(null);

    const isValidTikTokUrl = (urlString) => {
        // Relaxed check as requested by user
        return urlString && urlString.length > 5;
    };

    const showStatus = (message, type) => {
        setStatus({ message, type });
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
        } catch (err) {
            showStatus('Failed to paste from clipboard', 'error');
        }
    };

    const handleClear = () => {
        setUrl('');
        setVideoResult(null);
        setStatus({ message: '', type: '' });
    };

    const fetchTikTokVideo = async (tikTokUrl) => {

        const apiUrl = 'https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi';
        const apiKey = import.meta.env.RAPID_KEY;

        if (!apiKey) {
            return { success: false, error: 'API Key not configured. Please check .env settings.' };
        }

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com'
            }
        };

        try {
            const fullUrl = `${apiUrl}?url=${encodeURIComponent(tikTokUrl)}`;
            const response = await fetch(fullUrl, options);
            const result = await response.json();

            console.log('API Response:', result);

            const videoUrl = result.url ||
                result.video_url ||
                result.download_url ||
                result.media?.url ||
                result.items?.[0]?.video_url ||
                result.items?.[0]?.url;

            if (videoUrl) {
                return { success: true, videoUrl };
            } else {
                return { success: false, error: 'Video URL not found. Please check if the link is correct.' };
            }

        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: 'Failed to fetch video. Please try again later.' };
        }
    };

    const handleDownload = async () => {
        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            showStatus('Please enter a valid TikTok URL', 'error');
            return;
        }

        setLoading(true);
        showStatus('Processing...', 'info');
        setVideoResult(null);

        const response = await fetchTikTokVideo(trimmedUrl);

        setLoading(false);

        if (response.success) {
            setVideoResult(response.videoUrl);
            showStatus('Video ready for download!', 'success');
        } else {
            showStatus(response.error, 'error');
        }
    };

    // --- Tool Data ---
    const toolData = {
        name: "TikTok Downloader",
        title: "Professional TikTok Downloader",
        description: "Download TikTok videos without watermarks. High-quality downloader supporting all devices.",
        icon: "fab fa-tiktok",
        category: "Utility",
        breadcrumb: ["Utility", "Tools", "Converter Tools"],
        tags: ["tiktok", "downloader", "video", "social", "HD", "no watermark"]
    };


    const relatedTools = [
        { name: "Instagram Reels Downloader", url: "/utility-tools/converter-tools/reels-downloader", icon: "fab fa-instagram" },
        { name: "Audio Bitrate Converter", url: "/utility-tools/audio-bitrate-converter", icon: "fas fa-music" },
        { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
        { name: "QR Code Scanner", url: "/utility-tools/converter-tools/qr-code-scanner", icon: "fas fa-qrcode" },
        { name: "Text Case Converter", url: "/converter-tools/text-case-converter", icon: "fas fa-font" },
        { name: "Gen Z Translator", url: "/genz-translator", icon: "fas fa-language" }
    ];

    const tableOfContents = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'technology', title: 'Technology' },
        { id: 'features', title: 'Features' },
        { id: 'how-works', title: 'How it Works' },
        { id: 'security', title: 'Security' },
        { id: 'applications', title: 'Applications' },
        { id: 'technical-specs', title: 'Specifications' },
        { id: 'best-practices', title: 'Best Practices' },
        { id: 'faqs', title: 'FAQ' }
    ];

    const faqs = [
        {
            question: "Is downloading TikTok videos legal?",
            answer: "Downloading videos for personal usage is generally acceptable. However, verify the copyright status before using content commercially."
        },
        {
            question: "Does it remove watermarks?",
            answer: "Our tool aims to provide the highest quality video available, often without watermarks depending on the source availability."
        },
        {
            question: "Is it free?",
            answer: "Yes, this tool is completely free to use."
        },
        {
            question: "Does it work on mobile?",
            answer: "Yes, it works perfectly on both iOS and Android browsers."
        }
    ];

    const seoData = {
        title: 'TikTok Downloader - Download TikTok Videos HD | Tuitility',
        description: 'Free TikTok video downloader. Download TikTok videos without watermarks in HD quality. Works on all devices, fast and secure.',
        keywords: 'tiktok downloader, download tiktok videos, tiktok video saver, tiktok no watermark, save tiktok',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/tiktok-downloader'
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
                <CalculatorSection title="TikTok Downloader" icon="fab fa-tiktok">
                    <div className="reels-downloader-container">

                        <div className="input-section">
                            <div className="url-input-group">
                                <div className="url-input-wrapper">
                                    <input
                                        type="text"
                                        className="url-input"
                                        placeholder="Paste TikTok URL here..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                    <div className="input-actions">
                                        {url && (
                                            <button className="action-icon-btn" onClick={handleClear} title="Clear">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        )}
                                        <button className="action-icon-btn" onClick={handlePaste} title="Paste">
                                            <i className="fas fa-paste"></i>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="download-btn"
                                    onClick={handleDownload}
                                    disabled={loading || !url}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-download"></i> Download
                                        </>
                                    )}
                                </button>
                            </div>

                            {status.message && (
                                <div className={`status-area ${status.type}`}>
                                    {status.message}
                                </div>
                            )}
                        </div>

                        {videoResult && (
                            <div className="result-section" id="download-result-section">
                                <h3 className="text-xl font-bold mb-4">You're All Set!</h3>
                                <div className="video-wrapper">
                                    <video
                                        src={videoResult}
                                        controls
                                        className="video-preview"
                                        crossOrigin="anonymous"
                                    ></video>
                                </div>

                                <a
                                    href={videoResult}
                                    download="tiktok_video.mp4"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="download-link-btn"
                                >
                                    <i className="fas fa-save"></i> Save Video
                                </a>
                            </div>
                        )}

                    </div>
                </CalculatorSection>

                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                <ContentSection id="introduction" title="Introduction to TikTok Video Downloading">
                    <div className="content-block">
                        <p>TikTok has transformed global entertainment with its endless stream of creative short videos, amassing over a billion active users. Our professional TikTok Downloader is engineered to help you save these viral moments in pristine HD quality, without watermarks, ensuring you can enjoy your favorite content offline, anytime, anywhere.</p>
                        <p>Whether you are archiving your own creative portfolio, curating content for inspiration, or simply saving funny clips to share with friends off-platform, our tool delivers a seamless, secure, and high-quality downloading experience independent of the TikTok app.</p>
                    </div>
                </ContentSection>

                <ContentSection id="technology" title="Advanced Extraction Technology">
                    <div className="content-block">
                        <p>Leveraging high-performance APIs, our TikTok Downloader bypasses standard restrictions to fetch direct video streams:</p>
                        <ul>
                            <li><strong>Watermark Removal:</strong> Smart processing algorithms detect and strip platform watermarks for clean video output.</li>
                            <li><strong>HD Quality Preservation:</strong> Downloads are fetched in the highest available resolution (up to 1080p) directly from source servers.</li>
                            <li><strong>Cross-Platform Compatibility:</strong> Engineered to work flawlessly on iOS, Android, Windows, and macOS browsers.</li>
                            <li><strong>Instant Processing:</strong> Optimized backend ensures video links are generated in milliseconds.</li>
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
                                    <td>No Watermark</td>
                                    <td>Clean videos perfect for reposting or professional use</td>
                                </tr>
                                <tr>
                                    <td>Full HD Support</td>
                                    <td>Crystal clear visual quality for all downloads</td>
                                </tr>
                                <tr>
                                    <td>Unlimited Downloads</td>
                                    <td>Save as many videos as you want without restrictions</td>
                                </tr>
                                <tr>
                                    <td> MP4 Format</td>
                                    <td>Universal file compatibility with all media players</td>
                                </tr>
                                <tr>
                                    <td>Fast & Free</td>
                                    <td>Zero cost, lightning-fast speeds, no ads</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ContentSection>

                <ContentSection id="how-works" title="Step-by-Step Download Guide">
                    <div className="content-block">
                        <p>Download your favorite TikToks in four simple steps:</p>

                        <div className="steps-grid">
                            <div className="step-card">
                                <img src="/images/step 1.png" alt="Find Video" className="step-image" />
                                <span className="step-number">1</span>
                                <span className="step-title">Find Video</span>
                                <p className="step-desc">Open TikTok and find the video you want to save</p>
                            </div>
                            <div className="step-card">
                                <img src="/images/tiktok step 2.png" alt="Copy Link" className="step-image" />
                                <span className="step-number">2</span>
                                <span className="step-title">Copy Link</span>
                                <p className="step-desc">Tap/Click "Save Video" a new tab opens with the video , follow step 3 and 4 to download the video</p>
                            </div>
                            <div className="step-card">
                                <img src="/images/step 3.png" alt="Paste URL" className="step-image" />
                                <span className="step-number">3</span>
                                <span className="step-title">Paste URL</span>
                                <p className="step-desc">Paste the link in the box above and hit Download</p>
                            </div>
                            <div className="step-card">
                                <img src="/images/step 4.png" alt="Save" className="step-image" />
                                <span className="step-number">4</span>
                                <span className="step-title">Save</span>
                                <p className="step-desc">Download the watermark-free video to your device</p>
                            </div>
                        </div>
                    </div>
                </ContentSection>

                <ContentSection id="security" title="Security & Privacy">
                    <div className="content-block">
                        <p>We prioritize your user safety with a transparent and secure service:</p>
                        <ul>
                            <li>No user data logging or tracking of download history.</li>
                            <li>No account registration or personal information required.</li>
                            <li>Files are downloaded directly from the server to your device securely.</li>
                            <li>Regular security audits to ensure safe browsing.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="applications" title="Use Cases">
                    <div className="content-block">
                        <p>Our downloader supports various creative and personal needs:</p>
                        <ul>
                            <li><strong>Content Creation:</strong> Remix and react to trending videos without watermarks cluttering the screen.</li>
                            <li><strong>Offline Viewing:</strong> Watch your favorite compilations during flights or commutes without data.</li>
                            <li><strong>Archiving:</strong> Save your own TikToks to back up your creative work locally.</li>
                            <li><strong>Social Sharing:</strong> Share funny clips easily on other platforms like WhatsApp or Telegram.</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="technical-specs" title="Technical Specifications">
                    <div className="content-block">
                        <div className="specs-box">
                            <h4 className="font-bold mb-3">Requirements</h4>
                            <div className="specs-grid">
                                <div className="spec-item"><i className="fab fa-chrome"></i> <span>Browser: Modern (Chrome, Safari, Edge)</span></div>
                                <div className="spec-item"><i className="fas fa-mobile-alt"></i> <span>Device: Mobile or Desktop</span></div>
                            </div>
                        </div>
                        <ul>
                            <li><strong>Format:</strong> MP4 (Video), MP3 (Audio - coming soon)</li>
                            <li><strong>Resolution:</strong> Max available (720p/1080p)</li>
                            <li><strong>Source:</strong> TikTok Public API</li>
                        </ul>
                    </div>
                </ContentSection>

                <ContentSection id="best-practices" title="Best Practices">
                    <div className="content-block">
                        <p><strong>Note:</strong> Respect the intellectual property rights of content creators. Do not repost downloaded content as your own without permission or proper credit.</p>
                    </div>
                </ContentSection>

                <FAQSection id="faqs" faqs={faqs} />

            </ToolPageLayout>
        </>
    );
};

export default TikTokDownloader;
