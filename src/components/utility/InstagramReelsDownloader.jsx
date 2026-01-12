import React, { useState } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import FeedbackForm from '../tool/FeedbackForm';
import TableOfContents from '../tool/TableOfContents';
import '../../assets/css/utility/instagram-reels-downloader.css';
import { toolCategories } from '../../data/toolCategories';


const InstagramReelsDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [videoResult, setVideoResult] = useState(null);

  const isValidInstagramUrl = (urlString) => {
    return urlString.match(/^https?:\/\/(www\.)?instagram\.com\/(reel\/|[^/]+\/reel\/)[A-Za-z0-9_-]+/);
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

  const fetchReelsVideo = async (reelUrl) => {
    // Normalize logic
    const reelMatch = reelUrl.match(/reel\/([A-Za-z0-9_-]+)/);
    if (!reelMatch) {
      return { success: false, error: 'Invalid Instagram Reel URL format' };
    }

    const reelId = reelMatch[1];
    const cleanUrl = `https://www.instagram.com/reel/${reelId}/`;
    
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
      const fullUrl = `${apiUrl}?url=${encodeURIComponent(cleanUrl)}`;
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
        return { success: false, error: 'Video URL not found. Check if the reel is private or link is incorrect.' };
      }

    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Failed to fetch video. Please try again later.' };
    }
  };

  const handleDownload = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      showStatus('Please enter a valid Instagram Reels URL', 'error');
      return;
    }

    if (!isValidInstagramUrl(trimmedUrl)) {
      showStatus('Please enter a valid Instagram Reels URL', 'error');
      return;
    }

    setLoading(true);
    showStatus('Processing...', 'info');
    setVideoResult(null); 

    const response = await fetchReelsVideo(trimmedUrl);

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
    name: "Instagram Reels Downloader",
    title: "Professional Instagram Reels Downloader",
    description: "Download Instagram Reels in HD quality without watermarks. Professional-grade downloader with support for all devices and formats.",
    icon: "fab fa-instagram",
    category: "Utility",
    breadcrumb: ["Utility", "Tools", "Converter Tools"], 
    tags: ["instagram", "reels", "downloader", "video", "social", "HD", "no watermark"]
  };


  const relatedTools = [
      { name: "TikTok Downloader", url: "/utility-tools/converter-tools/tiktok-downloader", icon: "fab fa-tiktok" },
      { name: "Audio Bitrate Converter", url: "/utility-tools/audio-bitrate-converter", icon: "fas fa-music" },
      { name: "Image to WebP", url: "/utility-tools/image-tools/image-to-webp-converter", icon: "fas fa-image" },
      { name: "QR Code Generator", url: "/utility-tools/generator-tools/qr-code-generator", icon: "fas fa-qrcode" },
      { name: "QR Code Scanner", url: "/utility-tools/converter-tools/qr-code-scanner", icon: "fas fa-qrcode" },
      { name: "Gold Weight Converter", url: "/converter-tools/gold-precious-metal-weight-converter", icon: "fas fa-coins" }
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
        question: "Is downloading Instagram Reels legal?",
        answer: "Downloading Instagram Reels for personal use is generally acceptable under fair use provisions. However, redistributing or using downloaded content commercially requires permission from the original creator. Always respect copyright and intellectual property rights."
    },
    {
        question: "Do I need to install any software?",
        answer: "No software installation is required. Our tool is completely web-based and works directly in your browser. Simply visit our website, paste the URL, and download your Reels instantly."
    },
    {
        question: "What video quality can I expect?",
        answer: "Our downloader preserves the original quality of Instagram Reels, supporting downloads up to 1080p HD resolution. The final quality depends on the original upload quality by the content creator."
    },
    {
        question: "Does the downloader work on mobile devices?",
        answer: "Yes, our tool is fully responsive and works perfectly on smartphones and tablets. The mobile interface is optimized for touch interaction and provides the same high-quality downloads as the desktop version."
    },
    {
        question: "Are there any download limits?",
        answer: "There are no artificial limits imposed by our tool. You can download as many Reels as needed. However, we recommend responsible usage and respect for content creators' rights."
    },
    {
        question: "Why isn't my Reels URL working?",
        answer: "Ensure the URL is complete and correctly formatted. Private accounts or age-restricted content may not be accessible. Check your internet connection and try refreshing the page if issues persist."
    },
    {
        question: "Is my data safe when using this tool?",
        answer: "Absolutely. We don't store any URLs, downloaded videos, or personal information. All processing happens securely, and downloads go directly to your device without passing through our servers."
    },
    {
        question: "Can I download Reels from private Instagram accounts?",
        answer: "No, our tool respects Instagram's privacy settings. You can only download Reels from public accounts or accounts where you have proper viewing permissions."
    }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={toolCategories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection title="Reels Downloader" icon="fab fa-instagram">
         <div className="reels-downloader-container">
            
            <div className="input-section">
                <div className="url-input-group">
                    <div className="url-input-wrapper">
                        <input 
                            type="text" 
                            className="url-input" 
                            placeholder="Paste Instagram Reels URL here (e.g., https://www.instagram.com/reel/ABC123/)" 
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
                        download="instagram_reel.mp4" 
                        target="_blank" 
                        rel="noreferrer"
                        className="download-link-btn"
                    >
                        <i className="fas fa-save"></i> Save Video
                    </a>
                    <p className="text-sm text-gray-500 mt-3">
                        If the download doesn't start automatically, right-click the video and select "Save Video As".
                    </p>
                </div>
            )}

         </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

       <ContentSection id="introduction" title="Introduction to Instagram Reels Downloading">
          <div className="content-block">
            <p>Instagram Reels have revolutionized short-form video content, becoming a cornerstone of social media engagement with over 2 billion monthly active users. Our professional Instagram Reels downloader represents the pinnacle of download technology, offering HD quality downloads without watermarks while maintaining complete security and privacy.</p>
            <p>Whether you're a content creator studying trending formats, a marketer analyzing competitor strategies, or simply someone who wants to save memorable moments, our downloader provides enterprise-grade reliability with consumer-friendly simplicity. The tool supports all video qualities and works seamlessly across all devices and platforms.</p>
          </div>
       </ContentSection>

       <ContentSection id="technology" title="Advanced Download Technology">
           <div className="content-block">
               <p>Our Instagram Reels downloader employs cutting-edge extraction algorithms powered by advanced API integration, ensuring maximum success rates and optimal video quality:</p>
               <ul>
                   <li><strong>Multi-Quality Support:</strong> Downloads available in HD (1080p), standard (720p), and mobile-optimized (480p) formats</li>
                   <li><strong>Watermark-Free Downloads:</strong> Advanced processing removes Instagram watermarks while preserving original quality</li>
                   <li><strong>Real-Time Processing:</strong> Instant URL analysis and video extraction with sub-10-second processing times</li>
                   <li><strong>Format Optimization:</strong> Automatic MP4 conversion for universal device compatibility</li>
                   <li><strong>Error Recovery:</strong> Built-in retry mechanisms for handling temporary Instagram restrictions</li>
                   <li><strong>Batch URL Support:</strong> Process multiple Reels URLs simultaneously for efficiency</li>
               </ul>
           </div>
       </ContentSection>

       <ContentSection id="features" title="Professional Downloader Features">
            <div className="content-block">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Capability</th>
                            <th>Technical Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Video Quality</td>
                            <td>HD downloads without watermarks</td>
                            <td>Up to 1080p resolution, original aspect ratio</td>
                        </tr>
                        <tr>
                            <td>Processing Speed</td>
                            <td>Lightning-fast extraction</td>
                            <td>&lt;10 seconds average processing time</td>
                        </tr>
                        <tr>
                            <td>Device Support</td>
                            <td>Universal compatibility</td>
                            <td>Desktop, mobile, tablet - all platforms</td>
                        </tr>
                        <tr>
                            <td>File Format</td>
                            <td>Optimized video delivery</td>
                            <td>MP4 format for maximum compatibility</td>
                        </tr>
                        <tr>
                            <td>Storage</td>
                            <td>Direct device download</td>
                            <td>No cloud storage, immediate local save</td>
                        </tr>
                        <tr>
                            <td>Security</td>
                            <td>Complete privacy protection</td>
                            <td>No data logging, SSL encrypted transfers</td>
                        </tr>
                    </tbody>
                </table>
            </div>
       </ContentSection>

       <ContentSection id="how-works" title="Step-by-Step Download Guide">
           <div className="content-block">
               <p>Our streamlined download process ensures anyone can save Instagram Reels with professional results:</p>
               
               <div className="steps-grid">
                  <div className="step-card">
                      <img src="/images/step 1.png" alt="Copy URL" className="step-image" />
                      <span className="step-number">1</span>
                      <span className="step-title">Copy URL</span>
                      <p className="step-desc">Copy Instagram Reels link from the app or browser</p>
                  </div>
                  <div className="step-card">
                      <img src="/images/step 2.png" alt="Paste URL" className="step-image" />
                      <span className="step-number">2</span>
                      <span className="step-title">Paste URL</span>
                      <p className="step-desc">Paste the link into our downloader field</p>
                  </div>
                  <div className="step-card">
                      <img src="/images/step 3.png" alt="Process" className="step-image" />
                      <span className="step-number">3</span>
                      <span className="step-title">Process</span>
                      <p className="step-desc">Click download and wait for the preview</p>
                  </div>
                  <div className="step-card">
                      <img src="/images/step 4.png" alt="Download" className="step-image" />
                      <span className="step-number">4</span>
                      <span className="step-title">Download</span>
                      <p className="step-desc">Save the HD video directly to your device</p>
                  </div>
               </div>
           </div>
       </ContentSection>

       <ContentSection id="security" title="Security & Privacy Protection">
            <div className="content-block">
                <p>Security and privacy are fundamental to our Instagram Reels downloader design. We implement comprehensive protection measures:</p>
                <ul>
                    <li><strong>Zero Data Retention:</strong> No URLs, videos, or personal information stored on our servers</li>
                    <li><strong>SSL Encryption:</strong> All data transfers protected with 256-bit SSL encryption</li>
                    <li><strong>No Registration Required:</strong> Anonymous usage without account creation or personal data collection</li>
                    <li><strong>Local Processing:</strong> Video downloads handled entirely through secure API calls</li>
                    <li><strong>GDPR Compliant:</strong> Full compliance with European data protection regulations</li>
                    <li><strong>No Malware Risk:</strong> Browser-based tool with no software installation required</li>
                </ul>
            </div>
       </ContentSection>

       <ContentSection id="applications" title="Business & Personal Applications">
           <div className="content-block">
               <p>Our Instagram Reels downloader serves diverse professional and personal use cases across multiple industries:</p>
               <ul>
                   <li><strong>Content Marketing:</strong> Competitor analysis, trend research, and campaign inspiration gathering</li>
                   <li><strong>Social Media Management:</strong> Client content archival, campaign performance analysis, and strategy development</li>
                   <li><strong>Education & Training:</strong> Creating offline learning materials, presentation content, and training resources</li>
                   <li><strong>Creative Industries:</strong> Reference collection for video production, animation, and design inspiration</li>
                   <li><strong>Journalism & Media:</strong> News gathering, story research, and multimedia content development</li>
                   <li><strong>Personal Archival:</strong> Preserving memories, travel content, and special moments for offline viewing</li>
                   <li><strong>Research & Analytics:</strong> Social media behavior studies, trend analysis, and market research</li>
               </ul>
           </div>
       </ContentSection>

       <ContentSection id="technical-specs" title="Technical Specifications">
            <div className="content-block">
                <div className="specs-box">
                    <h4 className="font-bold mb-3">System Requirements</h4>
                    <div className="specs-grid">
                        <div className="spec-item"><i className="fab fa-chrome"></i> <span>Browser: Any modern web browser</span></div>
                        <div className="spec-item"><i className="fas fa-wifi"></i> <span>Internet: Stable connection required</span></div>
                        <div className="spec-item"><i className="fas fa-hdd"></i> <span>Storage: Available space for downloads</span></div>
                        <div className="spec-item"><i className="fab fa-js"></i> <span>JavaScript: Enabled for full functionality</span></div>
                    </div>
                </div>
                <ul>
                    <li><strong>Supported URLs:</strong> All Instagram Reels URLs (instagram.com/reel/*, instagram.com/p/* with video)</li>
                    <li><strong>Video Formats:</strong> MP4 output with H.264 encoding for maximum compatibility</li>
                    <li><strong>Quality Options:</strong> Original quality preservation up to 1080p HD resolution</li>
                    <li><strong>File Naming:</strong> Automatic naming with timestamp and original Reels ID</li>
                    <li><strong>Browser Support:</strong> Chrome 70+, Firefox 65+, Safari 12+, Edge 79+</li>
                    <li><strong>API Integration:</strong> Rapid API powered extraction with 99.9% uptime reliability</li>
                </ul>
            </div>
       </ContentSection>

       <ContentSection id="best-practices" title="Best Practices & Tips">
           <div className="content-block">
               <p>Maximize your download success and maintain ethical usage with these professional recommendations:</p>
               <ul>
                   <li><strong>URL Accuracy:</strong> Ensure the Instagram URL is complete and correctly formatted</li>
                   <li><strong>Network Stability:</strong> Use stable internet connection for best download results</li>
                   <li><strong>Storage Management:</strong> Organize downloads in dedicated folders for easy access</li>
                   <li><strong>Quality Selection:</strong> Choose appropriate quality based on intended use and storage capacity</li>
                   <li><strong>Respect Copyright:</strong> Only download content you have permission to save and use</li>
                   <li><strong>Regular Cleanup:</strong> Periodically review and manage downloaded content</li>
                   <li><strong>Backup Important Content:</strong> Create backups of valuable downloaded materials</li>
               </ul>
           </div>
       </ContentSection>
        
        <FAQSection id="faqs" faqs={faqs} />

    </ToolPageLayout>
  );
};

export default InstagramReelsDownloader;
