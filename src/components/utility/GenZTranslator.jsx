import React, { useState, useEffect, useRef } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/utility/genz-translator.css';

const GenZTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [conversionMode, setConversionMode] = useState('to-genz'); // 'to-genz' or 'to-standard'
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  
  const typingTimerRef = useRef(null);

  const API_KEY = import.meta.env.GEMINI_API;
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const translateWithGemini = async (text, toGenZ) => {
    if (!API_KEY) {
      return "Error: API Key not found. Please check your .env file.";
    }

    const prompt = toGenZ 
        ? `Convert this text to Gen Z style language. Give me ONE direct translation only. Make it sound authentic with modern Gen Z slang (no cap, bet, fr, bussin, rizz, etc), abbreviations, and occasional emojis. Keep the core meaning but make it very casual and Gen Z-like. Do not provide multiple options or explanations, just give me the converted text: "${text}"`
        : `Convert this Gen Z style text to standard, formal English. Give me ONE direct translation only. Remove slang, emojis, and informal abbreviations while maintaining the original meaning. Make it clear and professional. Do not provide multiple options or explanations, just give me the converted text: "${text}"`;

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        return data.candidates && data.candidates[0] && data.candidates[0].content 
               ? data.candidates[0].content.parts[0].text 
               : "Translation error.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Translation service unavailable.";
    }
  };

  // Debounced translation or manual trigger
  const handleTranslate = async (text, mode) => {
    if (!text.trim()) {
      setOutputText('');
      return;
    }

    setIsLoading(true);
    const result = await translateWithGemini(text, mode === 'to-genz');
    setOutputText(result);
    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-translate logic with debounce
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    if (inputText) {
      typingTimerRef.current = setTimeout(() => {
        handleTranslate(inputText, conversionMode);
      }, 1000);
    } else {
      setOutputText('');
    }

    return () => clearTimeout(typingTimerRef.current);
  }, [inputText, conversionMode]);

  const handleSwap = () => {
    const newMode = conversionMode === 'to-genz' ? 'to-standard' : 'to-genz';
    setConversionMode(newMode);
    setInputText(outputText); // Swap content
    setOutputText(inputText); // Swap content (roughly, might re-trigger translation)
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  // --- Tool Data ---

  const toolData = {
    name: "Gen Z Translator",
    title: "Gen Z Translator",
    description: "Instantly translate standard English into modern Gen Z slang, or decode confusing Gen Z texts back to formal English using advanced AI.",
    icon: "fas fa-language",
    category: "Language",
    breadcrumb: ["Utility", "Tools", "Gen Z Translator"],
    tags: ["gen z", "slang", "translator", "ai", "gemini", "english"]
  };

  const categories = [
    { name: 'Utility', url: '/utility-tools', icon: 'fas fa-tools' },
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  const relatedTools = [
      { name: "Word Counter", url: "/utility-tools/word-counter", icon: "fas fa-font" },
      { name: "Morse Code Translator", url: "/utility-tools/morse-code-translator", icon: "fas fa-signal" },
      { name: "English to IPA", url: "/utility-tools/converter-tools/english-to-ipa-translator", icon: "fas fa-microphone-alt" },
      { name: "Text Case Converter", url: "/utility-tools/converter-tools/text-case-converter", icon: "fas fa-font" },
      { name: "HTML to Markdown", url: "/utility-tools/html-to-markdown-converter", icon: "fab fa-html5" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'slang-dictionary', title: 'Mini Gen Z Dictionary' },
    { id: 'why-use', title: 'Why Use This Tool?' },
    { id: 'faq', title: 'Frequently Asked Questions' }
  ];

  const faqData = [
    {
      question: "Is the translation 100% accurate?",
      answer: "Slang evolves rapidly! Our tool uses the advanced Gemini AI to stay as current as possible, but context matters. Use the results for fun and informal communication."
    },
    {
      question: "Can I use this for professional emails?",
      answer: "We recommend using the 'Gen Z to Standard' mode if you are trying to decipher a message from a younger colleague. Avoid sending 'Gen Z' style emails in formal business settings unless you have strict vibes with your team."
    },
    {
      question: "What does 'no cap' mean?",
      answer: "'No cap' simply means 'no lie' or 'for real'. It's used to emphasize that a statement is truthful."
    },
    {
      question: "What is 'Rizz'?",
      answer: "Short for 'charisma'. It refers to someone's ability to attract a romantic partner."
    }
  ];

  const inputLabel = conversionMode === 'to-genz' ? 'Standard English' : 'Gen Z Slang';
  const outputLabel = conversionMode === 'to-genz' ? 'Gen Z Output' : 'Standard English Output';
  const inputPlaceholder = conversionMode === 'to-genz' ? 'Hello! How are you doing today?' : 'Yo fam, the vibes correspond fr fr no cap...';

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection title="AI Gen Z Translator" icon="fas fa-robot">
        <div className="genz-translator-container">
          
          <div className="translator-controls">
            <div className="translator-toggles">
              <button 
                className={`lang-toggle-btn ${conversionMode === 'to-genz' ? 'active' : ''}`}
                onClick={() => setConversionMode('to-genz')}
              >
                Standard → Gen Z
              </button>
              <button 
                className={`lang-toggle-btn ${conversionMode === 'to-standard' ? 'active' : ''}`}
                onClick={() => setConversionMode('to-standard')}
              >
                Gen Z → Standard
              </button>
            </div>
            {inputText && !isLoading && !outputText && <span className="text-sm text-gray-500">Press Enter or wait...</span>}
            {isLoading && <span className="text-sm text-gray-500"><i className="fas fa-spinner fa-spin"></i> Translating vibes...</span>}
          </div>

          <div className="translator-grid">
            {/* Input Box */}
            <div className="translation-box">
              <div className="box-header">
                <span className="box-label">{inputLabel}</span>
                <div className="box-actions">
                  <button onClick={() => setInputText('')} title="Clear">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <textarea 
                className="translation-textarea" 
                placeholder={inputPlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            {/* Swap Button (Desktop) */}
            <div className="swap-btn-container">
               <button className="swap-btn" onClick={handleSwap} title="Swap Languages">
                 <i className="fas fa-exchange-alt"></i>
               </button>
            </div>

            {/* Output Box */}
            <div className="translation-box relative">
              <div className="box-header">
                <span className="box-label">
                  {outputLabel} {conversionMode === 'to-genz' && <span className="genz-badge">AI ✨</span>}
                </span>
                <div className="box-actions">
                  <button onClick={handleCopy} title="Copy Result">
                    {copyStatus === 'Copied!' ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
                  </button>
                </div>
              </div>
              <div className="textarea-wrapper" style={{ position: 'relative', flex: 1, display: 'flex' }}>
                <textarea 
                  className={`translation-textarea ${isLoading ? 'loading-blur' : ''}`}
                  placeholder="Translation will appear here..."
                  value={outputText}
                  readOnly
                />
                {isLoading && (
                  <div className="translator-loader-overlay">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="loader-text">Translating Vibes...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <ContentSection id="introduction" title="Introduction">
        <p>
            Language is always evolving, and nowhere is that faster than on the internet. The <strong>Gen Z Translator</strong> bridges the generational gap 
            by using advanced AI to instantly translate between standard, formal English and the expressive, fast-paced slang used by Generation Z.
        </p>
        <p>
            Whether you are a parent trying to understand a text message, a marketer trying to sound authentic (but please, be careful!), 
            or just looking to have some fun, this tool is your pocket guide to modern internet linguistics.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use">
        <p>This tool is powered by Google's Gemini AI for context-aware translations:</p>
        <ol className="list-decimal pl-6 space-y-2 mt-4">
             <li><strong>Choose Logic:</strong> Select "Standard → Gen Z" to slang-ify your text, or "Gen Z → Standard" to decode it.</li>
             <li><strong>Type:</strong> Enter your text in the left (or top) box.</li>
             <li><strong>Wait for AI:</strong> The tool will automatically translate after you stop typing for a second. Look for the "Translating vibes..." indicator.</li>
             <li><strong>Copy:</strong> Click the copy icon on the result box to grab your translated text.</li>
        </ol>
      </ContentSection>

      <ContentSection id="slang-dictionary" title="Mini Gen Z Dictionary">
        <p>Here are a few common terms you might encounter:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 border rounded">
                <strong className="block text-lg mb-1">Bet</strong>
                <span className="text-gray-600">"Yes", "Okay", or "I agree".</span>
            </div>
            <div className="bg-gray-50 p-4 border rounded">
                <strong className="block text-lg mb-1">Cap / No Cap</strong>
                <span className="text-gray-600">"Cap" means a lie. "No cap" means "no lie" or "seriously".</span>
            </div>
            <div className="bg-gray-50 p-4 border rounded">
                <strong className="block text-lg mb-1">Finna</strong>
                <span className="text-gray-600">Going to / preparing to do something.</span>
            </div>
            <div className="bg-gray-50 p-4 border rounded">
                <strong className="block text-lg mb-1">Ghosting</strong>
                <span className="text-gray-600">Suddenly cutting off communication with someone without explanation.</span>
            </div>
            <div className="bg-gray-50 p-4 border rounded">
                <strong className="block text-lg mb-1">Simp</strong>
                <span className="text-gray-600">Someone who does way too much for a person they like.</span>
            </div>
            <div className="bg-gray-50 p-4 border rounded">
                <strong className="block text-lg mb-1">Sus</strong>
                <span className="text-gray-600">Suspicious or shady (popularized by Among Us).</span>
            </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />

    </ToolPageLayout>
  );
};

export default GenZTranslator;
