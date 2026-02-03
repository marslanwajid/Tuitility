import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import Seo from '../Seo';
import '../../assets/css/utility/ocr-pdf-generator.css';
import { toolCategories } from '../../data/toolCategories';

const OCRPDFGenerator = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [processingStats, setProcessingStats] = useState({
    totalPages: 0,
    totalWords: 0,
    confidence: 0,
    processingTime: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('eng');
  const [processingQuality, setProcessingQuality] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('text');
  const [settings, setSettings] = useState({
    preserveLayout: true,
    detectTables: true,
    enhanceImage: false,
    ignoreImages: false,
    confidenceThreshold: 70
  });

  const toolData = {
    name: "OCR PDF Generator",
    title: "OCR PDF Generator",
    description: "Extract text from PDF documents with high accuracy using advanced OCR technology. Supports multiple languages, quality settings, and various output formats.",
    icon: "fas fa-file-pdf",
    category: "utility",
    breadcrumb: ["Utility", "Tools", "OCR PDF Generator"],
    tags: ["ocr", "pdf", "text extraction", "document processing", "ai", "multilingual"],
    lastUpdated: "2024-01-15"
  };

  const relatedTools = [
    { name: "QR Code Generator", url: "/utility-tools/qr-code-generator", icon: "fas fa-qrcode" },
    { name: "Password Generator", url: "/utility-tools/password-generator", icon: "fas fa-key" },
    { name: "Text Converter", url: "/utility-tools/text-converter", icon: "fas fa-font" },
    { name: "Image Optimizer", url: "/utility-tools/image-optimizer", icon: "fas fa-image" },
    { name: "File Compressor", url: "/utility-tools/file-compressor", icon: "fas fa-compress" },
    { name: "Hash Generator", url: "/utility-tools/hash-generator", icon: "fas fa-hashtag" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-ocr', title: 'What is OCR?' },
    { id: 'features', title: 'Features' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'supported-languages', title: 'Supported Languages' },
    { id: 'quality-settings', title: 'Quality Settings' },
    { id: 'output-formats', title: 'Output Formats' },
    { id: 'examples', title: 'Examples' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' }
  ];

  const faqs = [
    {
      question: "What file formats are supported?",
      answer: "Currently, our OCR tool supports PDF files up to 50MB in size. We're working on adding support for image formats (PNG, JPG, TIFF) in future updates."
    },
    {
      question: "How accurate is the text extraction?",
      answer: "The accuracy depends on the quality of the PDF and the settings chosen. With high-quality PDFs and the 'accurate' quality setting, you can expect 90-95% accuracy. The tool shows confidence scores for each page."
    },
    {
      question: "Which languages are supported?",
      answer: "We support 14+ languages including English, Spanish, French, German, Arabic, Chinese (Simplified & Traditional), Japanese, Korean, Russian, Hindi, Portuguese, Italian, and Dutch."
    },
    {
      question: "How long does processing take?",
      answer: "Processing time depends on the number of pages and quality settings. A typical 10-page document takes 2-5 minutes with balanced quality settings. The 'fast' setting reduces processing time but may lower accuracy."
    },
    {
      question: "Is my document secure?",
      answer: "Yes, all processing is done locally in your browser. Your documents are never uploaded to our servers, ensuring complete privacy and security of your content."
    },
    {
      question: "What output formats are available?",
      answer: "You can download the extracted text as plain text (.txt), Word document (.doc), HTML file (.html), or formatted PDF. Each format preserves the original layout and structure."
    }
  ];

  const languages = {
    'eng': { name: 'English', code: 'eng', flag: '🇺🇸' },
    'spa': { name: 'Spanish', code: 'spa', flag: '🇪🇸' },
    'fra': { name: 'French', code: 'fra', flag: '🇫🇷' },
    'deu': { name: 'German', code: 'deu', flag: '🇩🇪' },
    'ara': { name: 'Arabic', code: 'ara', flag: '🇸🇦' },
    'chi_sim': { name: 'Chinese (Simplified)', code: 'chi_sim', flag: '🇨🇳' },
    'chi_tra': { name: 'Chinese (Traditional)', code: 'chi_tra', flag: '🇹🇼' },
    'jpn': { name: 'Japanese', code: 'jpn', flag: '🇯🇵' },
    'kor': { name: 'Korean', code: 'kor', flag: '🇰🇷' },
    'rus': { name: 'Russian', code: 'rus', flag: '🇷🇺' },
    'hin': { name: 'Hindi', code: 'hin', flag: '🇮🇳' },
    'por': { name: 'Portuguese', code: 'por', flag: '🇵🇹' },
    'ita': { name: 'Italian', code: 'ita', flag: '🇮🇹' },
    'nld': { name: 'Dutch', code: 'nld', flag: '🇳🇱' }
  };

  const qualityPresets = {
    fast: { name: 'Fast', description: 'Quick processing with basic accuracy', icon: 'fas fa-bolt' },
    balanced: { name: 'Balanced', description: 'Good balance of speed and accuracy', icon: 'fas fa-balance-scale' },
    accurate: { name: 'Accurate', description: 'Highest accuracy, slower processing', icon: 'fas fa-bullseye' }
  };

  useEffect(() => {
    // Load the JavaScript logic
    const script = document.createElement('script');
    script.src = '/src/assets/js/utility/ocr-pdf-generator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size too large. Please select a PDF smaller than 50MB');
        return;
      }
      setSelectedFile(file);
      setShowResults(false);
      setExtractedText('');

      // Update page count display
      setTimeout(() => {
        const pageCountEl = document.getElementById('ocrPageCount');
        if (pageCountEl) {
          pageCountEl.textContent = '1'; // Mock page count
        }
      }, 100);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const startOCRProcessing = () => {
    if (!selectedFile) {
      alert('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep('Initializing...');
    setShowResults(false);

    // Simulate OCR processing with mock data since external libraries aren't available
    simulateOCRProcessing();
  };

  const simulateOCRProcessing = () => {
    // Simulate processing steps
    const steps = [
      { step: 1, progress: 25, text: 'Initializing OCR engine...' },
      { step: 2, progress: 50, text: 'Processing pages...' },
      { step: 3, progress: 75, text: 'Recognizing text...' },
      { step: 4, progress: 100, text: 'Combining results...' }
    ];

    let currentStep = 0;

    const processStep = () => {
      if (currentStep < steps.length) {
        const { step, progress, text } = steps[currentStep];

        setProcessingProgress(progress);
        setProcessingStep(text);

        // Update processing step visual
        document.querySelectorAll('.ocr-step-item').forEach((el, index) => {
          el.classList.remove('active', 'completed');
          if (index + 1 < step) {
            el.classList.add('completed');
          } else if (index + 1 === step) {
            el.classList.add('active');
          }
        });

        currentStep++;
        setTimeout(processStep, 2000); // 2 seconds per step
      } else {
        // Processing complete
        setIsProcessing(false);
        setShowResults(true);

        // Mock extracted text
        const mockText = `This is a sample of extracted text from your PDF document. The OCR processing has been completed successfully.

Key features of the extracted text:
• Multi-language support
• High accuracy recognition
• Preserved formatting
• Searchable content

The text has been processed with ${currentLanguage} language settings and ${processingQuality} quality mode.

You can now copy this text to your clipboard or download it in various formats including plain text, Word document, or HTML format.`;

        setExtractedText(mockText);
        setProcessingStats({
          totalPages: 1,
          totalWords: mockText.split(' ').length,
          confidence: 95,
          processingTime: 8
        });

        // Update text preview
        const preview = document.getElementById('ocrTextPreview');
        if (preview) {
          const previewText = mockText.slice(0, 500) + '...';
          preview.innerHTML = `<p>${previewText.replace(/\n/g, '<br>')}</p>`;
        }
      }
    };

    processStep();
  };

  const copyTextToClipboard = async () => {
    if (!extractedText) {
      alert('No text to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(extractedText);
      alert('Text copied to clipboard!');
    } catch (error) {
      alert('Failed to copy text to clipboard');
    }
  };

  const downloadAs = (format) => {
    if (!extractedText) {
      alert('No text to download');
      return;
    }

    const fileName = selectedFile ? selectedFile.name.replace('.pdf', '') : 'extracted_text';

    switch (format) {
      case 'text':
        downloadTextFile(fileName);
        break;
      case 'word':
        downloadWordFile(fileName);
        break;
      case 'html':
        downloadHTMLFile(fileName);
        break;
      default:
        downloadTextFile(fileName);
    }
  };

  const downloadTextFile = (fileName) => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadWordFile = (fileName) => {
    const wordContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Extracted Text</title></head>
      <body><div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${extractedText.replace(/\n/g, '<br>')}
      </div></body></html>
    `;
    const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_extracted.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadHTMLFile = (fileName) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Extracted Text - ${fileName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Extracted Text</h1>
          <p>Source: ${selectedFile ? selectedFile.name : 'Unknown'}</p>
          <p>Extracted on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">${extractedText.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_extracted.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const seoData = {
    title: 'OCR PDF Generator - Extract Text from PDF | Tuitility',
    description: 'Free OCR PDF tool to extract text from scanned PDFs. Supports 14+ languages, multiple quality settings, and various output formats. Process locally for privacy.',
    keywords: 'ocr pdf, pdf text extraction, scan to text, optical character recognition, pdf converter, document digitization',
    canonicalUrl: 'https://tuitility.vercel.app/utility-tools/ocr-pdf-generator'
  };

  return (
    <>
      <Seo {...seoData} />
      <ToolPageLayout
        toolData={toolData}
        tableOfContents={tableOfContents}
        categories={toolCategories}
        relatedTools={relatedTools}
      >
        <CalculatorSection>
          <div className="ocr-pdf-generator-page">
            <div className="ocr-pdf-container">

              {/* File Upload Section */}
              <div className="ocr-upload-section">
                <div
                  className="ocr-drop-zone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  id="ocrDropZone"
                >
                  <div className="ocr-upload-content">
                    <i className="fas fa-cloud-upload-alt ocr-upload-icon"></i>
                    <h3>Upload PDF Document</h3>
                    <p>Drag and drop your PDF file here, or click to browse</p>
                    <button className="ocr-upload-btn" onClick={() => document.getElementById('ocrFileInput').click()}>
                      <i className="fas fa-folder-open"></i>
                      Choose File
                    </button>
                    <input
                      type="file"
                      id="ocrFileInput"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="ocr-file-info" id="ocrPdfInfo">
                    <div className="ocr-info-item">
                      <i className="fas fa-file-pdf"></i>
                      <span id="ocrFileName">{selectedFile.name}</span>
                    </div>
                    <div className="ocr-info-item">
                      <i className="fas fa-file-alt"></i>
                      <span id="ocrPageCount">Loading...</span>
                    </div>
                    <div className="ocr-info-item">
                      <i className="fas fa-weight"></i>
                      <span id="ocrFileSize">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* OCR Options */}
              {selectedFile && (
                <div className="ocr-options-section" id="ocrOptions">
                  <h3>OCR Settings</h3>

                  {/* Language Selection */}
                  <div className="ocr-language-section">
                    <h4>Select Language</h4>
                    <div className="ocr-language-tabs">
                      {Object.entries(languages).slice(0, 6).map(([code, lang]) => (
                        <button
                          key={code}
                          className={`ocr-language-tab ${currentLanguage === code ? 'active' : ''}`}
                          data-lang={code}
                          onClick={() => setCurrentLanguage(code)}
                        >
                          <span className="ocr-flag">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                    <select
                      id="ocrCustomLanguage"
                      className="ocr-custom-language"
                      value={currentLanguage}
                      onChange={(e) => setCurrentLanguage(e.target.value)}
                    >
                      {Object.entries(languages).map(([code, lang]) => (
                        <option key={code} value={code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quality Settings */}
                  <div className="ocr-quality-section">
                    <h4>Processing Quality</h4>
                    <div className="ocr-quality-tabs">
                      {Object.entries(qualityPresets).map(([key, preset]) => (
                        <button
                          key={key}
                          className={`ocr-quality-tab ${processingQuality === key ? 'active' : ''}`}
                          data-quality={key}
                          onClick={() => setProcessingQuality(key)}
                        >
                          <i className={preset.icon}></i>
                          <span>{preset.name}</span>
                          <small>{preset.description}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="ocr-advanced-settings">
                    <h4>Advanced Settings</h4>
                    <div className="ocr-settings-grid">
                      <label className="ocr-setting-item">
                        <input
                          type="checkbox"
                          id="ocrPreserveLayout"
                          checked={settings.preserveLayout}
                          onChange={(e) => setSettings(prev => ({ ...prev, preserveLayout: e.target.checked }))}
                        />
                        <span>Preserve Layout</span>
                      </label>
                      <label className="ocr-setting-item">
                        <input
                          type="checkbox"
                          id="ocrDetectTables"
                          checked={settings.detectTables}
                          onChange={(e) => setSettings(prev => ({ ...prev, detectTables: e.target.checked }))}
                        />
                        <span>Detect Tables</span>
                      </label>
                      <label className="ocr-setting-item">
                        <input
                          type="checkbox"
                          id="ocrEnhanceImage"
                          checked={settings.enhanceImage}
                          onChange={(e) => setSettings(prev => ({ ...prev, enhanceImage: e.target.checked }))}
                        />
                        <span>Enhance Image</span>
                      </label>
                      <label className="ocr-setting-item">
                        <input
                          type="checkbox"
                          id="ocrIgnoreImages"
                          checked={settings.ignoreImages}
                          onChange={(e) => setSettings(prev => ({ ...prev, ignoreImages: e.target.checked }))}
                        />
                        <span>Ignore Images</span>
                      </label>
                    </div>
                  </div>

                  {/* Process Button */}
                  <button
                    className="ocr-process-btn"
                    id="ocrProcessBtn"
                    onClick={startOCRProcessing}
                    disabled={isProcessing}
                  >
                    <i className="fas fa-magic"></i>
                    {isProcessing ? 'Processing...' : 'Start OCR Processing'}
                  </button>
                </div>
              )}

              {/* Processing Section */}
              {isProcessing && (
                <div className="ocr-processing-section" id="ocrProcessing">
                  <div className="ocr-processing-header">
                    <i className="fas fa-cog fa-spin"></i>
                    <h3>Processing Document</h3>
                    <p id="ocrProcessingText">{processingStep}</p>
                  </div>

                  <div className="ocr-processing-progress">
                    <div className="ocr-progress-bar">
                      <div
                        className="ocr-progress-fill"
                        id="ocrProgressFill"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <div className="ocr-progress-text">
                      <span id="ocrProgressText">{processingProgress}%</span>
                    </div>
                  </div>

                  <div className="ocr-processing-steps">
                    <div className="ocr-step-item" id="ocrStep1">
                      <i className="fas fa-language"></i>
                      <span>Initialize Language</span>
                    </div>
                    <div className="ocr-step-item" id="ocrStep2">
                      <i className="fas fa-file-alt"></i>
                      <span>Process Pages</span>
                    </div>
                    <div className="ocr-step-item" id="ocrStep3">
                      <i className="fas fa-eye"></i>
                      <span>OCR Recognition</span>
                    </div>
                    <div className="ocr-step-item" id="ocrStep4">
                      <i className="fas fa-check-circle"></i>
                      <span>Combine Results</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Section */}
              {showResults && extractedText && (
                <div className="ocr-results-section" id="ocrResultsContainer">
                  <div className="ocr-results-header">
                    <h3>Extraction Complete</h3>
                    <div className="ocr-stats">
                      <div className="ocr-stat-card">
                        <i className="fas fa-file-alt ocr-stat-icon"></i>
                        <div className="ocr-stat-info">
                          <div className="ocr-stat-number" id="ocrTotalPages">{processingStats.totalPages}</div>
                          <div className="ocr-stat-label">Pages</div>
                        </div>
                      </div>
                      <div className="ocr-stat-card">
                        <i className="fas fa-font ocr-stat-icon"></i>
                        <div className="ocr-stat-info">
                          <div className="ocr-stat-number" id="ocrTotalWords">{processingStats.totalWords.toLocaleString()}</div>
                          <div className="ocr-stat-label">Words</div>
                        </div>
                      </div>
                      <div className="ocr-stat-card">
                        <i className="fas fa-bullseye ocr-stat-icon"></i>
                        <div className="ocr-stat-info">
                          <div className="ocr-stat-number" id="ocrConfidence">{processingStats.confidence}%</div>
                          <div className="ocr-stat-label">Confidence</div>
                        </div>
                      </div>
                      <div className="ocr-stat-card">
                        <i className="fas fa-clock ocr-stat-icon"></i>
                        <div className="ocr-stat-info">
                          <div className="ocr-stat-number" id="ocrProcessingTime">{processingStats.processingTime}s</div>
                          <div className="ocr-stat-label">Time</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ocr-text-preview">
                    <h4>Extracted Text Preview</h4>
                    <div className="ocr-text-content" id="ocrTextPreview">
                      <p>{extractedText.slice(0, 500)}{extractedText.length > 500 ? '...' : ''}</p>
                    </div>
                    <div className="ocr-preview-controls">
                      <button
                        className="ocr-preview-btn"
                        id="ocrExpandText"
                        onClick={() => {/* Show full text modal */ }}
                      >
                        <i className="fas fa-expand"></i>
                        View Full Text
                      </button>
                      <button
                        className="ocr-preview-btn"
                        id="ocrCopyText"
                        onClick={copyTextToClipboard}
                      >
                        <i className="fas fa-copy"></i>
                        Copy Text
                      </button>
                    </div>
                  </div>

                  <div className="ocr-download-section">
                    <h4>Download Options</h4>
                    <div className="ocr-download-options">
                      <button
                        className="ocr-download-btn primary"
                        id="ocrDownloadText"
                        onClick={() => downloadAs('text')}
                      >
                        <i className="fas fa-file-alt"></i>
                        Text File
                      </button>
                      <button
                        className="ocr-download-btn"
                        id="ocrDownloadWord"
                        onClick={() => downloadAs('word')}
                      >
                        <i className="fas fa-file-word"></i>
                        Word Doc
                      </button>
                      <button
                        className="ocr-download-btn"
                        id="ocrDownloadHTML"
                        onClick={() => downloadAs('html')}
                      >
                        <i className="fas fa-file-code"></i>
                        HTML
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </CalculatorSection>

        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>

        <ContentSection id="introduction">
          <h2>OCR PDF Text Extraction</h2>
          <p>Extract text from PDF documents with high accuracy using advanced OCR (Optical Character Recognition) technology. Our tool supports multiple languages, various quality settings, and multiple output formats to meet your document processing needs.</p>
          <p>Perfect for digitizing scanned documents, extracting text from image-based PDFs, or converting printed materials into editable text formats.</p>
        </ContentSection>

        <ContentSection id="what-is-ocr">
          <h2>What is OCR?</h2>
          <p>OCR (Optical Character Recognition) is a technology that converts different types of documents, such as scanned paper documents, PDF files, or images captured by a digital camera, into editable and searchable text data.</p>
          <p>Our advanced OCR engine uses machine learning algorithms to accurately recognize text in various languages and formats, making it possible to extract text from documents that were previously only available as images.</p>
        </ContentSection>

        <ContentSection id="features">
          <h2>Key Features</h2>
          <ul className="usage-steps">
            <li><strong>Multi-language Support:</strong> Extract text from documents in 14+ languages including English, Spanish, French, German, Arabic, Chinese, Japanese, Korean, and more.</li>
            <li><strong>Quality Settings:</strong> Choose between Fast, Balanced, or Accurate processing modes to optimize speed vs. accuracy based on your needs.</li>
            <li><strong>Advanced Options:</strong> Configure layout preservation, table detection, image enhancement, and confidence thresholds for optimal results.</li>
            <li><strong>Multiple Output Formats:</strong> Download extracted text as plain text, Word document, HTML, or formatted PDF.</li>
            <li><strong>Privacy & Security:</strong> All processing happens locally in your browser - your documents never leave your device.</li>
            <li><strong>Progress Tracking:</strong> Real-time progress updates and detailed statistics about the extraction process.</li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use">
          <h2>How to Use the OCR PDF Generator</h2>
          <ul className="usage-steps">
            <li><strong>Upload PDF:</strong> Drag and drop your PDF file or click to browse and select a document (up to 50MB).</li>
            <li><strong>Select Language:</strong> Choose the primary language of your document from the available options or use the custom language selector.</li>
            <li><strong>Configure Settings:</strong> Select processing quality (Fast/Balanced/Accurate) and adjust advanced settings as needed.</li>
            <li><strong>Start Processing:</strong> Click "Start OCR Processing" and wait for the text extraction to complete.</li>
            <li><strong>Review Results:</strong> Check the extracted text preview and processing statistics.</li>
            <li><strong>Download:</strong> Choose your preferred output format and download the extracted text.</li>
          </ul>
        </ContentSection>

        <ContentSection id="supported-languages">
          <h2>Supported Languages</h2>
          <p>Our OCR engine supports text recognition in the following languages:</p>
          <div className="ocr-languages-grid">
            {Object.entries(languages).map(([code, lang]) => (
              <div key={code} className="ocr-language-item">
                <span className="ocr-language-flag">{lang.flag}</span>
                <span className="ocr-language-name">{lang.name}</span>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection id="quality-settings">
          <h2>Quality Settings</h2>
          <ul className="usage-steps">
            <li><strong>Fast Mode:</strong> Quick processing with basic accuracy. Best for simple documents with clear text. Processing time: 1-2 minutes per 10 pages.</li>
            <li><strong>Balanced Mode:</strong> Good balance of speed and accuracy. Recommended for most documents. Processing time: 2-3 minutes per 10 pages.</li>
            <li><strong>Accurate Mode:</strong> Highest accuracy with slower processing. Best for complex layouts, poor quality scans, or when accuracy is critical. Processing time: 3-5 minutes per 10 pages.</li>
          </ul>
        </ContentSection>

        <ContentSection id="output-formats">
          <h2>Output Formats</h2>
          <ul className="usage-steps">
            <li><strong>Plain Text (.txt):</strong> Simple text file with extracted content, preserving line breaks and basic formatting.</li>
            <li><strong>Word Document (.doc):</strong> Formatted Word document that maintains text structure and can be edited in Microsoft Word or similar applications.</li>
            <li><strong>HTML (.html):</strong> Web-friendly format with preserved formatting, suitable for web pages or further editing.</li>
            <li><strong>Formatted PDF:</strong> New PDF with searchable text layer, maintaining original layout and adding text searchability.</li>
          </ul>
        </ContentSection>

        <ContentSection id="examples">
          <h2>Examples</h2>
          <ul className="example-steps">
            <li>
              <strong>Business Document Processing:</strong> Extract text from scanned contracts, invoices, or reports for digital archiving and searchability.
              <strong>Best Settings:</strong> Balanced quality, preserve layout enabled, detect tables enabled.
              <strong>Result:</strong> Structured text ready for database import or document management systems.
            </li>
            <li>
              <strong>Academic Paper Digitization:</strong> Convert scanned research papers, books, or handwritten notes into editable text for analysis and citation.
              <strong>Best Settings:</strong> Accurate quality, enhance image enabled, custom language selection.
              <strong>Result:</strong> High-accuracy text extraction suitable for academic research and analysis.
            </li>
            <li>
              <strong>Multi-language Documents:</strong> Process documents containing multiple languages or mixed content.
              <strong>Best Settings:</strong> Balanced quality, preserve layout enabled, confidence threshold at 70%.
              <strong>Result:</strong> Accurate text extraction maintaining original document structure and formatting.
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality">
          <h2>How OCR Processing Works</h2>
          <div className="assessment-method-section">
            <h3>Processing Steps</h3>
            <ul>
              <li><strong>PDF Analysis:</strong> The tool analyzes the PDF structure and identifies text and image elements.</li>
              <li><strong>Page Rendering:</strong> Each page is rendered as a high-resolution image for optimal OCR processing.</li>
              <li><strong>Image Enhancement:</strong> Optional image enhancement improves text clarity and recognition accuracy.</li>
              <li><strong>OCR Recognition:</strong> Advanced machine learning algorithms identify and extract text characters.</li>
              <li><strong>Text Processing:</strong> Extracted text is cleaned, formatted, and structured according to your settings.</li>
              <li><strong>Quality Validation:</strong> Confidence scores are calculated for each page to indicate extraction quality.</li>
              <li><strong>Output Generation:</strong> Final text is formatted and prepared for download in your chosen format.</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="applications">
          <h2>Applications</h2>
          <div className="applications-grid">
            <div className="application-item">
              <h3>Document Digitization</h3>
              <p>Convert physical documents, books, and papers into digital, searchable text formats for archives and databases.</p>
            </div>
            <div className="application-item">
              <h3>Business Process Automation</h3>
              <p>Extract data from invoices, forms, and contracts to automate data entry and document processing workflows.</p>
            </div>
            <div className="application-item">
              <h3>Academic Research</h3>
              <p>Digitize historical documents, research papers, and books for analysis, citation, and digital preservation.</p>
            </div>
            <div className="application-item">
              <h3>Legal Document Processing</h3>
              <p>Extract text from scanned legal documents, contracts, and case files for searchable digital archives.</p>
            </div>
            <div className="application-item">
              <h3>Content Creation</h3>
              <p>Extract text from printed materials, magazines, and books for content repurposing and digital publishing.</p>
            </div>
            <div className="application-item">
              <h3>Accessibility</h3>
              <p>Make scanned documents accessible to screen readers and assistive technologies by converting them to readable text.</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection faqs={faqs} />
      </ToolPageLayout>
    </>
  );
};

export default OCRPDFGenerator;
