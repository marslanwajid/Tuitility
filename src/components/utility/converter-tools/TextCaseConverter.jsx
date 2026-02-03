import React, { useState } from 'react'
import ToolPageLayout from '../../tool/ToolPageLayout'
import CalculatorSection from '../../tool/CalculatorSection'
import ContentSection from '../../tool/ContentSection'
import FAQSection from '../../tool/FAQSection'
import TableOfContents from '../../tool/TableOfContents'
import FeedbackForm from '../../tool/FeedbackForm'
import Seo from '../../Seo'
import '../../../assets/css/utility/converter-tools/text-case-converter.css'
import { toolCategories } from '../../../data/toolCategories'

// Text Case Converter Logic
class TextCaseConverterLogic {
    toggleCase(text) {
        let result = ''
        let shouldBeUpper = true
        for (let i = 0; i < text.length; i++) {
            const char = text[i]
            if (/[a-zA-Z]/.test(char)) {
                result += shouldBeUpper ? char.toUpperCase() : char.toLowerCase()
                shouldBeUpper = !shouldBeUpper
            } else {
                result += char
            }
        }
        return result
    }

    sentenceCase(text) {
        return text
            .toLowerCase()
            .replace(/(^\w|\.\s+\w|\!\s+\w|\?\s+\w)/g, letter => letter.toUpperCase())
    }

    capitalizeWords(text) {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    alternateCase(text) {
        return text
            .split('')
            .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
            .join('')
    }

    inverseCase(text) {
        return text
            .split('')
            .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
            .join('')
    }
}

const TextCaseConverter = () => {
    const [inputText, setInputText] = useState('')
    const [outputText, setOutputText] = useState('')
    const [activeCase, setActiveCase] = useState('')
    const [notification, setNotification] = useState({ message: '', type: '', show: false })
    const [outputFileName, setOutputFileName] = useState('converted-text')

    const converter = new TextCaseConverterLogic()

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type, show: true })
        setTimeout(() => setNotification({ message: '', type: '', show: false }), 2500)
    }

    const convertCase = (caseType) => {
        if (!inputText.trim()) {
            showNotification('Please enter some text first!', 'error')
            return
        }

        setActiveCase(caseType)
        let result = ''

        switch (caseType) {
            case 'toggle':
                result = converter.toggleCase(inputText)
                break
            case 'sentence':
                result = converter.sentenceCase(inputText)
                break
            case 'lower':
                result = inputText.toLowerCase()
                break
            case 'upper':
                result = inputText.toUpperCase()
                break
            case 'capitalize':
                result = converter.capitalizeWords(inputText)
                break
            case 'alternate':
                result = converter.alternateCase(inputText)
                break
            case 'inverse':
                result = converter.inverseCase(inputText)
                break
            default:
                result = inputText
        }

        setOutputText(result)
        showNotification(`Converted to ${caseType} case!`, 'success')
    }

    const handleInputChange = (value) => {
        setInputText(value)
        if (activeCase && value.trim()) {
            // Auto-convert when text changes if a case is selected
        }
    }

    const copyText = async () => {
        if (!outputText) {
            showNotification('No text to copy!', 'error')
            return
        }
        try {
            await navigator.clipboard.writeText(outputText)
            showNotification('Text copied to clipboard!', 'success')
        } catch (err) {
            showNotification('Failed to copy text', 'error')
        }
    }

    const clearText = () => {
        setInputText('')
        setOutputText('')
        setActiveCase('')
        showNotification('Text cleared!', 'info')
    }

    const downloadText = () => {
        if (!outputText) {
            showNotification('No text to download!', 'error')
            return
        }
        try {
            const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${outputFileName || 'converted-text'}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)
            showNotification('Text downloaded successfully!', 'success')
        } catch (err) {
            showNotification('Failed to download text', 'error')
        }
    }

    const charCount = inputText.length
    const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length

    const toolData = {
        name: 'Text Case Converter',
        description: 'Convert text between different cases: uppercase, lowercase, sentence case, title case, and more.',
        icon: 'fas fa-font',
        category: 'Utility',
        breadcrumb: ['Utility', 'Converter Tools', 'Text Case Converter']
    }

    const relatedTools = [
        { name: 'Word Counter', url: '/utility-tools/word-counter', icon: 'fas fa-font' },
        { name: 'Morse Code Translator', url: '/utility-tools/morse-code-translator', icon: 'fas fa-signal' },
        { name: 'Gen Z Translator', url: '/utility-tools/genz-translator', icon: 'fas fa-language' },
        { name: 'HTML to Markdown', url: '/utility-tools/html-to-markdown-converter', icon: 'fab fa-html5' }
    ]

    const tableOfContents = [
        { id: 'converter', title: 'Converter' },
        { id: 'introduction', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'case-types', title: 'Case Types' },
        { id: 'features', title: 'Features' },
        { id: 'applications', title: 'Applications' },
        { id: 'faqs', title: 'FAQs' }
    ]

    const faqData = [
        {
            question: "What is text case conversion?",
            answer: "Text case conversion is the process of changing the capitalization of letters in text. This includes converting to uppercase (all capitals), lowercase (all small letters), sentence case (first letter capitalized), title case (each word capitalized), and other formats."
        },
        {
            question: "What case types are supported?",
            answer: "Our converter supports: Uppercase (ALL CAPS), Lowercase (all small), Sentence case (First letter capital), Title Case (Each Word Capitalized), Toggle case (aLtErNaTiNg), Alternate case (aLtErNaTe), and Inverse case (swap existing cases)."
        },
        {
            question: "Is there a character limit?",
            answer: "There is no strict character limit. However, for optimal performance, we recommend keeping text under 100,000 characters. The tool processes text instantly in your browser."
        },
        {
            question: "Can I download the converted text?",
            answer: "Yes! After converting your text, you can download it as a .txt file by clicking the Download button. You can also specify a custom filename before downloading."
        },
        {
            question: "Is my text stored or sent to servers?",
            answer: "No. All text conversion happens entirely in your browser. Your text is never uploaded to any server, ensuring complete privacy and security."
        },
        {
            question: "What is Toggle Case vs Alternate Case?",
            answer: "Toggle Case alternates capitalization per letter (HeLLo → hElLO). Alternate Case capitalizes every other character starting from the second (hElLo WoRlD). Both create a distinctive visual pattern."
        }
    ]

    const caseButtons = [
        { type: 'sentence', label: 'Sentence case', icon: 'fas fa-text-height' },
        { type: 'lower', label: 'lowercase', icon: 'fas fa-font' },
        { type: 'upper', label: 'UPPERCASE', icon: 'fas fa-font' },
        { type: 'capitalize', label: 'Title Case', icon: 'fas fa-heading' },
        { type: 'toggle', label: 'tOGGLE cASE', icon: 'fas fa-exchange-alt' },
        { type: 'alternate', label: 'aLtErNaTe', icon: 'fas fa-random' },
        { type: 'inverse', label: 'InVeRsE', icon: 'fas fa-sync-alt' }
    ]

    const seoData = {
        title: 'Text Case Converter - Change Text Capitalization | Tuitility',
        description: 'Free online text case converter. Transform text to uppercase, lowercase, title case, sentence case, and more. Instant conversion with copy and download options.',
        keywords: 'text case converter, uppercase converter, lowercase converter, title case, sentence case, text formatter',
        canonicalUrl: 'https://tuitility.vercel.app/utility-tools/converter-tools/text-case-converter'
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
                {notification.show && (
                    <div className={`tcc-notification ${notification.type}`}>
                        <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                        {notification.message}
                    </div>
                )}

                <CalculatorSection
                    id="converter"
                    title="Text Case Converter"
                    subtitle="Transform your text into any case format instantly"
                    icon="fas fa-font"
                >
                    <div className="tcc-container">
                        {/* Input Section */}
                        <div className="tcc-input-section">
                            <label className="tcc-label">Enter Your Text</label>
                            <textarea
                                className="tcc-textarea"
                                placeholder="Type or paste your text here..."
                                value={inputText}
                                onChange={(e) => handleInputChange(e.target.value)}
                                rows="6"
                            />
                            <div className="tcc-stats">
                                <span><i className="fas fa-font"></i> {charCount} characters</span>
                                <span><i className="fas fa-text-width"></i> {wordCount} words</span>
                            </div>
                        </div>

                        {/* Case Buttons */}
                        <div className="tcc-buttons-section">
                            <label className="tcc-label">Select Case Type</label>
                            <div className="tcc-buttons-grid">
                                {caseButtons.map((btn) => (
                                    <button
                                        key={btn.type}
                                        className={`tcc-case-btn ${activeCase === btn.type ? 'active' : ''}`}
                                        onClick={() => convertCase(btn.type)}
                                    >
                                        <i className={btn.icon}></i>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Output Section */}
                        <div className="tcc-output-section">
                            <label className="tcc-label">Converted Text</label>
                            <textarea
                                className="tcc-textarea tcc-output"
                                placeholder="Converted text will appear here..."
                                value={outputText}
                                readOnly
                                rows="6"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="tcc-actions">
                            <div className="tcc-filename-input">
                                <label>Filename:</label>
                                <input
                                    type="text"
                                    value={outputFileName}
                                    onChange={(e) => setOutputFileName(e.target.value)}
                                    placeholder="converted-text"
                                />
                                <span>.txt</span>
                            </div>
                            <div className="tcc-action-buttons">
                                <button className="tcc-action-btn tcc-copy-btn" onClick={copyText}>
                                    <i className="fas fa-copy"></i> Copy
                                </button>
                                <button className="tcc-action-btn tcc-download-btn" onClick={downloadText}>
                                    <i className="fas fa-download"></i> Download
                                </button>
                                <button className="tcc-action-btn tcc-clear-btn" onClick={clearText}>
                                    <i className="fas fa-trash"></i> Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </CalculatorSection>

                {/* Table of Contents and Feedback */}
                <div className="tool-bottom-section">
                    <TableOfContents items={tableOfContents} />
                    <FeedbackForm toolName={toolData.name} />
                </div>

                {/* SEO Content Sections */}
                <ContentSection id="introduction" title="What is Text Case Conversion?">
                    <p>
                        Text case conversion is the process of transforming the capitalization of letters in text from one format to another.
                        Whether you need to convert text to uppercase for emphasis, lowercase for consistency, or title case for headings,
                        our free online Text Case Converter makes it easy and instant.
                    </p>
                    <p>
                        This tool is perfect for writers, content creators, programmers, and anyone who works with text regularly.
                        All processing happens directly in your browser, ensuring your text remains private and secure.
                    </p>
                </ContentSection>

                <ContentSection id="how-it-works" title="How Text Case Conversion Works">
                    <p>Our Text Case Converter uses sophisticated algorithms to transform your text:</p>
                    <ol className="tcc-steps-list">
                        <li><strong>Enter Text:</strong> Type or paste your text into the input area</li>
                        <li><strong>Select Case Type:</strong> Choose from 7 different case conversion options</li>
                        <li><strong>Instant Conversion:</strong> Your text is converted immediately</li>
                        <li><strong>Copy or Download:</strong> Copy to clipboard or download as a text file</li>
                    </ol>
                    <p>
                        The conversion happens entirely in your browser using JavaScript, which means your text is never sent to any server.
                        This ensures maximum privacy and near-instant results regardless of text length.
                    </p>
                </ContentSection>

                <ContentSection id="case-types" title="Available Case Types">
                    <div className="applications-grid">
                        <div className="application-item">
                            <h3><i className="fas fa-text-height"></i> Sentence Case</h3>
                            <p>Capitalizes the first letter of each sentence. Perfect for proper paragraph formatting.</p>
                            <p><em>Example: "hello world. how are you?" → "Hello world. How are you?"</em></p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-font"></i> Lowercase</h3>
                            <p>Converts all letters to lowercase. Useful for normalization and consistency.</p>
                            <p><em>Example: "HELLO World" → "hello world"</em></p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-font"></i> UPPERCASE</h3>
                            <p>Converts all letters to capitals. Great for headings and emphasis.</p>
                            <p><em>Example: "hello world" → "HELLO WORLD"</em></p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-heading"></i> Title Case</h3>
                            <p>Capitalizes the first letter of each word. Ideal for titles and headings.</p>
                            <p><em>Example: "hello world" → "Hello World"</em></p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-exchange-alt"></i> Toggle Case</h3>
                            <p>Alternates between upper and lowercase for each letter.</p>
                            <p><em>Example: "hello" → "HeLlO"</em></p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-sync-alt"></i> Inverse Case</h3>
                            <p>Swaps the case of each letter (upper becomes lower, lower becomes upper).</p>
                            <p><em>Example: "HeLLo" → "hEllO"</em></p>
                        </div>
                    </div>
                </ContentSection>

                <ContentSection id="features" title="Key Features">
                    <div className="applications-grid">
                        <div className="application-item">
                            <h3><i className="fas fa-bolt"></i> Instant Conversion</h3>
                            <p>Convert text instantly with a single click. No waiting, no delays.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-shield-alt"></i> 100% Private</h3>
                            <p>All processing happens in your browser. Your text never leaves your device.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-download"></i> Download Support</h3>
                            <p>Download converted text as a .txt file with a custom filename.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-clipboard"></i> One-Click Copy</h3>
                            <p>Copy converted text to clipboard instantly for easy pasting.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-mobile-alt"></i> Mobile Friendly</h3>
                            <p>Works perfectly on all devices - desktop, tablet, and mobile.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-infinity"></i> No Limits</h3>
                            <p>Convert as much text as you need. No character limits or usage restrictions.</p>
                        </div>
                    </div>
                </ContentSection>

                <ContentSection id="applications" title="Common Applications">
                    <div className="applications-grid">
                        <div className="application-item">
                            <h3><i className="fas fa-pen"></i> Content Writing</h3>
                            <p>Format blog posts, articles, and social media content with proper capitalization.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-code"></i> Programming</h3>
                            <p>Convert variable names between camelCase, CONSTANT_CASE, and other formats.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-file-alt"></i> Document Formatting</h3>
                            <p>Standardize text formatting in documents, emails, and reports.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-database"></i> Data Cleaning</h3>
                            <p>Normalize text data for databases and spreadsheets.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-heading"></i> Creating Titles</h3>
                            <p>Generate properly formatted titles and headings for documents.</p>
                        </div>
                        <div className="application-item">
                            <h3><i className="fas fa-hashtag"></i> Social Media</h3>
                            <p>Create eye-catching posts with stylized text formatting.</p>
                        </div>
                    </div>
                </ContentSection>

                <FAQSection faqs={faqData} />
            </ToolPageLayout>
        </>
    )
}

export default TextCaseConverter
