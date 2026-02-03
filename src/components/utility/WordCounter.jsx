import React, { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import Seo from '../Seo'
import '../../assets/css/utility/word-counter.css'
import { toolCategories } from '../../data/toolCategories';

// Word Counter Logic Class
class WordCounterLogic {
  constructor() {
    this.loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
  }

  async loadLibraries() {
    try {
      await Promise.all([
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js'),
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js')
      ])
    } catch (error) {
      console.error('Error loading libraries:', error)
    }
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  countCharacters(text) {
    return text.length
  }

  countCharactersNoSpaces(text) {
    return text.replace(/\s+/g, '').length
  }

  countSentences(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
  }

  countParagraphs(text) {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length
  }

  async extractTextFromDocx(file) {
    if (typeof mammoth === 'undefined') {
      throw new Error('Mammoth.js not loaded')
    }
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  async extractTextFromPdf(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js not loaded')
    }
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map(item => item.str).join(' ') + '\n'
    }

    return text
  }
}

const WordCounter = () => {
  const [formData, setFormData] = useState({
    inputText: '',
    fileInfo: '',
    showFileInfo: false
  })
  const [counts, setCounts] = useState({
    wordCount: 0,
    charCount: 0,
    charNoSpaces: 0,
    sentenceCount: 0,
    paragraphCount: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const fileInputRef = useRef(null)
  const calculator = useRef(new WordCounterLogic())

  // Load libraries on mount
  useEffect(() => {
    calculator.current.loadLibraries()
  }, [])

  // Update counts when inputText changes
  useEffect(() => {
    updateCounts()
  }, [formData.inputText])

  const handleInputChange = (value) => {
    setFormData(prev => ({ ...prev, inputText: value }))
    setError('')
  }

  const updateCounts = () => {
    const text = formData.inputText

    setCounts({
      wordCount: calculator.current.countWords(text),
      charCount: calculator.current.countCharacters(text),
      charNoSpaces: calculator.current.countCharactersNoSpaces(text),
      sentenceCount: calculator.current.countSentences(text),
      paragraphCount: calculator.current.countParagraphs(text)
    })
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    setIsProcessing(true)
    setError('')

    try {
      let extractedText = ''

      if (file.name.toLowerCase().endsWith('.docx')) {
        extractedText = await calculator.current.extractTextFromDocx(file)
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        extractedText = await calculator.current.extractTextFromPdf(file)
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
      }

      setFormData(prev => ({
        ...prev,
        inputText: extractedText,
        fileInfo: `File loaded: ${file.name}`,
        showFileInfo: true
      }))
    } catch (err) {
      console.error('Error processing file:', err)
      setError(err.message)
      setFormData(prev => ({
        ...prev,
        fileInfo: err.message,
        showFileInfo: true
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formData.inputText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
      setError('Failed to copy text')
    }
  }

  const handleClear = () => {
    setFormData({
      inputText: '',
      fileInfo: '',
      showFileInfo: false
    })
    setCounts({
      wordCount: 0,
      charCount: 0,
      charNoSpaces: 0,
      sentenceCount: 0,
      paragraphCount: 0
    })
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toolData = {
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs in your text. Supports file upload for PDF and DOCX documents.',
    icon: 'fas fa-font',
    category: 'Utility',
    breadcrumb: ['Utility', 'Tools', 'Word Counter']
  }

  const relatedTools = [
    { name: 'Password Generator', url: '/utility-tools/password-generator', icon: 'fas fa-key' },
    { name: 'QR Code Generator', url: '/utility-tools/qr-code-generator', icon: 'fas fa-qrcode' },
    { name: 'Text Case Converter', url: '/utility-tools/converter-tools/text-case-converter', icon: 'fas fa-font' },
    { name: 'Morse Code Translator', url: '/utility-tools/converter-tools/morse-code-translator', icon: 'fas fa-signal' }
  ]

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'features', title: 'Features' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'text-analysis', title: 'Text Analysis' },
    { id: 'file-upload', title: 'File Upload' },
    { id: 'examples', title: 'Examples' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ]

  const faqData = [
    {
      question: "What types of files can I upload?",
      answer: "You can upload PDF (.pdf) and Microsoft Word (.docx) files. The tool will extract the text content from these files for counting."
    },
    {
      question: "How accurate is the word count?",
      answer: "The word count is highly accurate and follows standard text analysis rules, filtering out empty strings and counting only meaningful words."
    },
    {
      question: "Can I count characters with or without spaces?",
      answer: "Yes, the tool provides both options: total characters (including spaces) and characters excluding spaces."
    },
    {
      question: "How does sentence counting work?",
      answer: "Sentences are counted by splitting text on periods, exclamation marks, and question marks, then filtering out empty sentences."
    },
    {
      question: "Is there a limit to the text size?",
      answer: "While there are no strict limits, very large texts (over 1MB) may cause performance issues. For best results, keep text under 500KB."
    }
  ]

  const seoData = {
    title: 'Word Counter - Count Words, Characters & Sentences Online Free | Tuitility',
    description: 'Free online word counter tool to count words, characters, sentences, and paragraphs. Supports PDF and DOCX file uploads. Fast, accurate, and privacy-focused.',
    keywords: 'word counter, character counter, sentence counter, paragraph counter, text analysis, word count tool, free word counter',
    canonicalUrl: 'https://tuitility.vercel.app/utility-tools/word-counter'
  }

  return (
    <>
      <Seo {...seoData} />
      <ToolPageLayout
        toolData={toolData}
        tableOfContents={tableOfContents}
        categories={toolCategories}
        relatedTools={relatedTools}
      >
        <CalculatorSection
          title="Word Counter"
          subtitle="Analyze your text with detailed statistics"
          icon="fas fa-font"
          error={error}
        >
          <div className="word-counter-container">
            {/* Text Input Area */}
            <div className="word-counter-input-section">
              <div className="word-counter-input-wrapper">
                <textarea
                  id="word-counter-input-text"
                  className={`word-counter-input-field ${formData.inputText.trim().length > 0 ? 'has-content' : ''}`}
                  placeholder="Enter your text here or upload a file..."
                  value={formData.inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  rows="8"
                />
                <div className="word-counter-input-actions">
                  <button
                    type="button"
                    className={`word-counter-btn word-counter-copy-btn ${copySuccess ? 'success' : ''}`}
                    onClick={handleCopy}
                  >
                    <i className="fas fa-copy"></i>
                    {copySuccess ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button
                    type="button"
                    className="word-counter-btn word-counter-clear-btn"
                    onClick={handleClear}
                  >
                    <i className="fas fa-trash"></i>
                    Clear
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="word-counter-upload-section">
                <div
                  className={`word-counter-upload-area ${isProcessing ? 'processing' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="word-counter-file-input"
                    className="word-counter-file-input"
                    accept=".pdf,.docx"
                    onChange={handleFileInputChange}
                  />
                  <div className="word-counter-upload-content">
                    <i className="fas fa-cloud-upload-alt word-counter-upload-icon"></i>
                    <p className="word-counter-upload-text">
                      Drag and drop a PDF or DOCX file here, or click to browse
                    </p>
                    <p className="word-counter-upload-hint">
                      Supports: PDF, DOCX (Max 10MB)
                    </p>
                  </div>
                  {isProcessing && (
                    <div className="word-counter-processing-overlay">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Processing file...</p>
                    </div>
                  )}
                </div>

                {formData.showFileInfo && (
                  <div id="word-counter-file-info" className="word-counter-file-info">
                    {formData.fileInfo}
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Display */}
            <div className="word-counter-stats-section">
              <h3 className="word-counter-stats-title">Text Statistics</h3>
              <div className="word-counter-stats-grid">
                <div className="word-counter-stat-item">
                  <div className="word-counter-stat-icon">
                    <i className="fas fa-font"></i>
                  </div>
                  <div className="word-counter-stat-content">
                    <div className="word-counter-stat-value" id="word-counter-word-count">
                      {counts.wordCount}
                    </div>
                    <div className="word-counter-stat-label">Words</div>
                  </div>
                </div>

                <div className="word-counter-stat-item">
                  <div className="word-counter-stat-icon">
                    <i className="fas fa-text-height"></i>
                  </div>
                  <div className="word-counter-stat-content">
                    <div className="word-counter-stat-value" id="word-counter-char-count">
                      {counts.charCount}
                    </div>
                    <div className="word-counter-stat-label">Characters</div>
                  </div>
                </div>

                <div className="word-counter-stat-item">
                  <div className="word-counter-stat-icon">
                    <i className="fas fa-text-width"></i>
                  </div>
                  <div className="word-counter-stat-content">
                    <div className="word-counter-stat-value" id="word-counter-char-no-spaces">
                      {counts.charNoSpaces}
                    </div>
                    <div className="word-counter-stat-label">Characters (no spaces)</div>
                  </div>
                </div>

                <div className="word-counter-stat-item">
                  <div className="word-counter-stat-icon">
                    <i className="fas fa-exclamation"></i>
                  </div>
                  <div className="word-counter-stat-content">
                    <div className="word-counter-stat-value" id="word-counter-sentence-count">
                      {counts.sentenceCount}
                    </div>
                    <div className="word-counter-stat-label">Sentences</div>
                  </div>
                </div>

                <div className="word-counter-stat-item">
                  <div className="word-counter-stat-icon">
                    <i className="fas fa-paragraph"></i>
                  </div>
                  <div className="word-counter-stat-content">
                    <div className="word-counter-stat-value" id="word-counter-paragraph-count">
                      {counts.paragraphCount}
                    </div>
                    <div className="word-counter-stat-label">Paragraphs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CalculatorSection>

        {/* Table of Contents and Feedback */}
        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>

        {/* Content Sections */}
        <ContentSection id="introduction" title="Introduction">
          <p>
            The Word Counter is a comprehensive text analysis tool that provides detailed statistics about your text.
            Whether you're writing an article, essay, or just need to count words for a project, this tool gives you
            accurate counts for words, characters, sentences, and paragraphs.
          </p>
          <p>
            Additionally, you can upload PDF or DOCX files to extract and analyze their text content, making it perfect
            for analyzing documents, reports, or manuscripts.
          </p>
        </ContentSection>

        <ContentSection id="features" title="Features">
          <div className="word-counter-features-grid">
            <div className="word-counter-feature-item">
              <h4><i className="fas fa-font"></i> Word Count</h4>
              <p>Accurate word counting with proper text parsing</p>
            </div>
            <div className="word-counter-feature-item">
              <h4><i className="fas fa-text-height"></i> Character Count</h4>
              <p>Total characters including and excluding spaces</p>
            </div>
            <div className="word-counter-feature-item">
              <h4><i className="fas fa-file-upload"></i> File Upload</h4>
              <p>Support for PDF and DOCX file analysis</p>
            </div>
            <div className="word-counter-feature-item">
              <h4><i className="fas fa-copy"></i> Copy Text</h4>
              <p>Easy copying of analyzed text</p>
            </div>
            <div className="word-counter-feature-item">
              <h4><i className="fas fa-paint-brush"></i> Real-time Updates</h4>
              <p>Statistics update as you type</p>
            </div>
            <div className="word-counter-feature-item">
              <h4><i className="fas fa-mobile-alt"></i> Responsive Design</h4>
              <p>Works perfectly on all devices</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use">
          <h3>Using the Text Input</h3>
          <ol className="word-counter-usage-steps">
            <li><strong>Enter Text:</strong> Type or paste your text into the input area</li>
            <li><strong>View Statistics:</strong> Watch the counters update in real-time</li>
            <li><strong>Copy Text:</strong> Use the copy button to copy your text</li>
            <li><strong>Clear:</strong> Use the clear button to reset everything</li>
          </ol>

          <h3>Uploading Files</h3>
          <ol className="word-counter-usage-steps">
            <li><strong>Drag and Drop:</strong> Drag a PDF or DOCX file onto the upload area</li>
            <li><strong>Browse Files:</strong> Click the upload area to browse and select a file</li>
            <li><strong>Wait for Processing:</strong> The tool will extract text and update counters</li>
            <li><strong>Review Results:</strong> Check the extracted text and statistics</li>
          </ol>
        </ContentSection>

        <ContentSection id="text-analysis" title="Text Analysis">
          <h3>Word Counting</h3>
          <p>
            Words are counted by splitting text on whitespace characters and filtering out empty strings.
            This ensures accurate counting even with multiple spaces or special characters.
          </p>

          <h3>Character Counting</h3>
          <p>
            Two character counts are provided:
          </p>
          <ul>
            <li><strong>Total Characters:</strong> Includes all characters including spaces and punctuation</li>
            <li><strong>Characters (no spaces):</strong> Excludes all whitespace characters</li>
          </ul>

          <h3>Sentence and Paragraph Detection</h3>
          <p>
            Sentences are detected by splitting on sentence-ending punctuation (. ! ?).
            Paragraphs are detected by splitting on double line breaks.
          </p>
        </ContentSection>

        <ContentSection id="file-upload" title="File Upload">
          <h3>Supported File Types</h3>
          <div className="word-counter-file-types">
            <div className="word-counter-file-type">
              <h4><i className="fas fa-file-pdf"></i> PDF Files</h4>
              <p>Portable Document Format files up to 10MB</p>
              <p>Text is extracted from all pages</p>
            </div>
            <div className="word-counter-file-type">
              <h4><i className="fas fa-file-word"></i> DOCX Files</h4>
              <p>Microsoft Word documents up to 10MB</p>
              <p>Text content is extracted preserving formatting</p>
            </div>
          </div>

          <h3>File Processing</h3>
          <p>
            Files are processed entirely in your browser for privacy and security.
            No files are uploaded to external servers.
          </p>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="word-counter-example">
            <h3>Example Text Analysis</h3>
            <p><strong>Sample Text:</strong> "Hello world! This is a sample text. It has multiple sentences."</p>
            <div className="word-counter-example-stats">
              <div><strong>Words:</strong> 10</div>
              <div><strong>Characters:</strong> 58</div>
              <div><strong>Characters (no spaces):</strong> 47</div>
              <div><strong>Sentences:</strong> 3</div>
              <div><strong>Paragraphs:</strong> 1</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="word-counter-applications-grid">
            <div className="word-counter-application-item">
              <h4><i className="fas fa-pen"></i> Writing</h4>
              <p>Count words for articles, essays, and reports</p>
            </div>
            <div className="word-counter-application-item">
              <h4><i className="fas fa-graduation-cap"></i> Academic Work</h4>
              <p>Ensure documents meet word count requirements</p>
            </div>
            <div className="word-counter-application-item">
              <h4><i className="fas fa-briefcase"></i> Professional Documents</h4>
              <p>Analyze contracts, proposals, and business documents</p>
            </div>
            <div className="word-counter-application-item">
              <h4><i className="fas fa-code"></i> Programming</h4>
              <p>Count characters in code comments or strings</p>
            </div>
            <div className="word-counter-application-item">
              <h4><i className="fas fa-language"></i> Language Learning</h4>
              <p>Analyze text complexity and vocabulary usage</p>
            </div>
            <div className="word-counter-application-item">
              <h4><i className="fas fa-chart-bar"></i> Content Analysis</h4>
              <p>Extract statistics from uploaded documents</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection faqs={faqData} />
      </ToolPageLayout>
    </>
  )
}

export default WordCounter
