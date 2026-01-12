import React, { useState } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/utility/english-to-ipa-translator.css';

const EnglishToIPATranslator = () => {
  const [conversionType, setConversionType] = useState('to-ipa'); // 'to-ipa' or 'to-english'
  const [accent, setAccent] = useState('british'); // 'british' or 'american'
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');

  // --- Dictionaries (Condensed from User Input) ---
  
  const commonWordsBritish = {
    'hello': 'hɛˈləʊ', 'world': 'wɜːld', 'the': 'ðə', 'a': 'ə', 'an': 'ən', 'and': 'ænd', 
    'is': 'ɪz', 'are': 'ɑː', 'to': 'tuː', 'of': 'ɒv', 'for': 'fɔː', 'in': 'ɪn', 'on': 'ɒn', 
    'at': 'æt', 'with': 'wɪð', 'by': 'baɪ', 'from': 'frɒm', 'about': 'əˈbaʊt', 'into': 'ˈɪntuː', 
    'over': 'ˈəʊvə', 'after': 'ˈɑːftə', 'under': 'ˈʌndə', 'through': 'θruː', 'between': 'bɪˈtwiːn', 
    'yes': 'jɛs', 'no': 'nəʊ', 'please': 'pliːz', 'thank': 'θæŋk', 'you': 'juː', 'sorry': 'ˈsɒri', 
    'what': 'wɒt', 'where': 'weə', 'when': 'wɛn', 'why': 'waɪ', 'who': 'huː', 'how': 'haʊ', 
    'which': 'wɪtʃ', 'there': 'ðeə', 'here': 'hɪə', 'this': 'ðɪs', 'that': 'ðæt', 'these': 'ðiːz', 
    'those': 'ðəʊz', 'they': 'ðeɪ', 'them': 'ðɛm', 'their': 'ðeə', 'she': 'ʃiː', 'he': 'hiː', 
    'it': 'ɪt', 'we': 'wiː', 'I': 'aɪ', 'me': 'miː', 'my': 'maɪ', 'your': 'jɔː', 'his': 'hɪz', 
    'her': 'hɜː', 'our': 'aʊə', 'its': 'ɪts', 'good': 'gʊd', 'bad': 'bæd', 'big': 'bɪg', 
    'small': 'smɔːl', 'high': 'haɪ', 'low': 'ləʊ', 'long': 'lɒŋ', 'short': 'ʃɔːt', 'new': 'njuː', 
    'old': 'əʊld', 'young': 'jʌŋ', 'happy': 'ˈhæpi', 'sad': 'sæd', 'time': 'taɪm', 'day': 'deɪ', 
    'night': 'naɪt', 'year': 'jɪə', 'month': 'mʌnθ', 'week': 'wiːk', 'today': 'təˈdeɪ', 
    'tomorrow': 'təˈmɒrəʊ', 'yesterday': 'ˈjɛstədeɪ', 'now': 'naʊ', 'then': 'ðɛn', 'always': 'ˈɔːlweɪz', 
    'never': 'ˈnɛvə', 'sometimes': 'ˈsʌmtaɪmz', 'often': 'ˈɒfn', 'usually': 'ˈjuːʒuəli', 
    'one': 'wʌn', 'two': 'tuː', 'three': 'θriː', 'four': 'fɔː', 'five': 'faɪv', 'six': 'sɪks', 
    'seven': 'ˈsɛvn', 'eight': 'eɪt', 'nine': 'naɪn', 'ten': 'tɛn', 'hundred': 'ˈhʌndrəd', 
    'thousand': 'ˈθaʊzənd', 'million': 'ˈmɪljən', 'billion': 'ˈbɪljən'
  };

  const commonWordsAmerican = {
    'the': 'ðə', 'a': 'ə', 'an': 'ən', 'and': 'ænd', 'is': 'ɪz', 'are': 'ɑr', 'to': 'tu', 
    'of': 'əv', 'for': 'fɔr', 'in': 'ɪn', 'on': 'ɑn', 'at': 'æt', 'with': 'wɪð', 'by': 'baɪ', 
    'from': 'frəm', 'about': 'əˈbaʊt', 'into': 'ˈɪntu', 'over': 'ˈoʊvər', 'after': 'ˈæftər', 
    'under': 'ˈʌndər', 'through': 'θru', 'between': 'bɪˈtwin', 'hello': 'həˈloʊ', 
    'goodbye': 'ˌgʊdˈbaɪ', 'yes': 'jɛs', 'no': 'noʊ', 'please': 'pliz', 'thank': 'θæŋk', 
    'you': 'ju', 'sorry': 'ˈsɑri', 'what': 'wət', 'where': 'wɛr', 'when': 'wɛn', 'why': 'waɪ', 
    'who': 'hu', 'how': 'haʊ', 'which': 'wɪtʃ', 'there': 'ðɛr', 'here': 'hɪr', 'this': 'ðɪs', 
    'that': 'ðæt', 'these': 'ðiz', 'those': 'ðoʊz', 'they': 'ðeɪ', 'them': 'ðɛm', 'their': 'ðɛr', 
    'she': 'ʃi', 'he': 'hi', 'it': 'ɪt', 'we': 'wi', 'I': 'aɪ', 'me': 'mi', 'my': 'maɪ', 
    'your': 'jɔr', 'his': 'hɪz', 'her': 'hɜr', 'our': 'aʊr', 'its': 'ɪts', 'quick': 'kwɪk', 
    'brown': 'braʊn', 'fox': 'fɑks', 'jumps': 'dʒʌmps', 'lazy': 'ˈleɪzi', 'dog': 'dɔg'
  };

  // --- Helper Functions ---

  const countSyllables = (word) => {
    const vowelSounds = word.match(/[aeiouæɑɒəɛɪɔʊʌ]/g) || [];
    return vowelSounds.length;
  };

  const applyBritishRules = (word) => {
    return word
      // Consonant combinations
      .replace(/th(?=[aeiou])/g, 'ð').replace(/th/g, 'θ')
      .replace(/ch/g, 'tʃ').replace(/sh/g, 'ʃ').replace(/zh/g, 'ʒ')
      .replace(/ng/g, 'ŋ').replace(/(?<=[aeiou])r/g, 'r')
      .replace(/ph/g, 'f').replace(/(?<=[aeiou])gh(?=[aeiou])/g, 'g')
      .replace(/gh/g, '').replace(/wh/g, 'w')
      .replace(/(?<=[aeiou])ck/g, 'k').replace(/kn/g, 'n')
      .replace(/mb$/g, 'm').replace(/ps/g, 's')
      .replace(/gn/g, 'n').replace(/wr/g, 'r').replace(/qu/g, 'kw')
      
      // Vowel combinations - British
      .replace(/ee/g, 'iː').replace(/ea(?=d\b)/g, 'ɛ').replace(/ea(?=th)/g, 'ɛ')
      .replace(/ea/g, 'iː').replace(/ei(?=gh)/g, 'eɪ').replace(/ei/g, 'aɪ')
      .replace(/ey(?=\b)/g, 'iː').replace(/ey/g, 'eɪ')
      .replace(/ie(?=\b)/g, 'iː').replace(/ie/g, 'aɪ').replace(/igh/g, 'aɪ')
      .replace(/oo(?=k)/g, 'ʊ').replace(/oo(?=d)/g, 'ʊ').replace(/oo/g, 'uː')
      .replace(/ou(?=gh\b)/g, 'ɔː').replace(/ou(?=ld)/g, 'ʊ').replace(/ou(?=l)/g, 'əʊ')
      .replace(/ou/g, 'aʊ').replace(/ow(?=\b)/g, 'əʊ').replace(/ow/g, 'aʊ')
      .replace(/oy/g, 'ɔɪ').replace(/oi/g, 'ɔɪ')
      .replace(/ai/g, 'eɪ').replace(/ay/g, 'eɪ')
      .replace(/aw/g, 'ɔː').replace(/au/g, 'ɔː')
      .replace(/oa/g, 'əʊ').replace(/oe/g, 'əʊ')
      
      // Single vowels - British
      .replace(/a(?=\w*[^aeiou][^aeiou]\b)/g, 'æ').replace(/a(?=[^aeiou]\b)/g, 'æ')
      .replace(/a(?=\w*[^aeiou]e\b)/g, 'eɪ').replace(/a/g, 'ə')
      .replace(/e(?=\w*[^aeiou][^aeiou]\b)/g, 'ɛ').replace(/e(?=[^aeiou]\b)/g, 'ɛ')
      .replace(/e(?=\b)/g, '').replace(/e/g, 'ə')
      .replace(/i(?=\w*[^aeiou][^aeiou]\b)/g, 'ɪ').replace(/i(?=[^aeiou]\b)/g, 'ɪ')
      .replace(/i(?=\w*[^aeiou]e\b)/g, 'aɪ').replace(/i/g, 'ɪ')
      .replace(/o(?=\w*[^aeiou][^aeiou]\b)/g, 'ɒ').replace(/o(?=[^aeiou]\b)/g, 'ɒ')
      .replace(/o(?=\w*[^aeiou]e\b)/g, 'əʊ').replace(/o/g, 'ə')
      .replace(/u(?=\w*[^aeiou][^aeiou]\b)/g, 'ʌ').replace(/u(?=[^aeiou]\b)/g, 'ʌ')
      .replace(/u(?=\w*[^aeiou]e\b)/g, 'juː').replace(/u/g, 'ə')
      
      // Basic Consonants
      .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k')
      .replace(/g(?=[eiy])/g, 'dʒ').replace(/x/g, 'ks').replace(/q(?!u)/g, 'k');
  };

  const applyAmericanRules = (word) => {
    return word
      // Consonants
      .replace(/th(?=[aeiou])/g, 'ð').replace(/th/g, 'θ')
      .replace(/ch/g, 'tʃ').replace(/sh/g, 'ʃ').replace(/zh/g, 'ʒ')
      .replace(/ng/g, 'ŋ').replace(/(?<=[aeiou])r/g, 'r')
      .replace(/ph/g, 'f').replace(/(?<=[aeiou])gh(?=[aeiou])/g, 'g')
      .replace(/gh/g, '').replace(/wh/g, 'w')
      .replace(/(?<=[aeiou])ck/g, 'k').replace(/kn/g, 'n')
      .replace(/mb$/g, 'm').replace(/ps/g, 's')
      .replace(/gn/g, 'n').replace(/wr/g, 'r').replace(/qu/g, 'kw')

      // Vowels - American
      .replace(/ee/g, 'i').replace(/ea(?=d\b)/g, 'ɛ').replace(/ea(?=th)/g, 'ɛ')
      .replace(/ea/g, 'i').replace(/ei(?=gh)/g, 'eɪ').replace(/ei/g, 'aɪ')
      .replace(/ey(?=\b)/g, 'i').replace(/ey/g, 'eɪ')
      .replace(/ie(?=\b)/g, 'i').replace(/ie/g, 'aɪ').replace(/igh/g, 'aɪ')
      .replace(/oo(?=k)/g, 'ʊ').replace(/oo(?=d)/g, 'ʊ').replace(/oo/g, 'u')
      .replace(/ou(?=gh\b)/g, 'ɔ').replace(/ou(?=ld)/g, 'ʊ').replace(/ou(?=l)/g, 'oʊ')
      .replace(/ou/g, 'aʊ').replace(/ow(?=\b)/g, 'oʊ').replace(/ow/g, 'aʊ')
      .replace(/oy/g, 'ɔɪ').replace(/oi/g, 'ɔɪ')
      .replace(/ai/g, 'eɪ').replace(/ay/g, 'eɪ')
      .replace(/aw/g, 'ɔ').replace(/au/g, 'ɔ')
      .replace(/oa/g, 'oʊ').replace(/oe/g, 'oʊ')

      // Single Vowels - American
      .replace(/a(?=\w*[^aeiou][^aeiou]\b)/g, 'æ').replace(/a(?=[^aeiou]\b)/g, 'æ')
      .replace(/a(?=\w*[^aeiou]e\b)/g, 'eɪ').replace(/a/g, 'ə')
      .replace(/e(?=\w*[^aeiou][^aeiou]\b)/g, 'ɛ').replace(/e(?=[^aeiou]\b)/g, 'ɛ')
      .replace(/e(?=\b)/g, '').replace(/e/g, 'ə')
      .replace(/i(?=\w*[^aeiou][^aeiou]\b)/g, 'ɪ').replace(/i(?=[^aeiou]\b)/g, 'ɪ')
      .replace(/i(?=\w*[^aeiou]e\b)/g, 'aɪ').replace(/i/g, 'ɪ')
      .replace(/o(?=\w*[^aeiou][^aeiou]\b)/g, 'ɑ').replace(/o(?=[^aeiou]\b)/g, 'ɑ')
      .replace(/o(?=\w*[^aeiou]e\b)/g, 'oʊ').replace(/o/g, 'ə')
      .replace(/u(?=\w*[^aeiou][^aeiou]\b)/g, 'ʌ').replace(/u(?=[^aeiou]\b)/g, 'ʌ')
      .replace(/u(?=\w*[^aeiou]e\b)/g, 'ju').replace(/u/g, 'ə')

      .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k')
      .replace(/g(?=[eiy])/g, 'dʒ').replace(/x/g, 'ks').replace(/q(?!u)/g, 'k');
  };

  const englishToIPAConverter = (text, currentAccent) => {
    const commonWords = currentAccent === 'british' ? commonWordsBritish : commonWordsAmerican;
    const words = text.toLowerCase().split(/\s+/);

    return words.map(word => {
      // Punctuation handling
      const leadingPunctuation = word.match(/^[.,/#!$%^&*;:{}=\-_`~()]+/) || [''];
      const trailingPunctuation = word.match(/[.,/#!$%^&*;:{}=\-_`~()]+$/) || [''];
      
      let cleanWord = word.replace(/^[.,/#!$%^&*;:{}=\-_`~()]+|[.,/#!$%^&*;:{}=\-_`~()]+$/g, '');
      if (!cleanWord) return word;

      // Dictionary Lookup
      if (commonWords[cleanWord]) {
        return leadingPunctuation[0] + commonWords[cleanWord] + trailingPunctuation[0];
      }

      // Rules fallback
      let ipaWord = cleanWord;
      if (currentAccent === 'british') {
        ipaWord = applyBritishRules(ipaWord);
      } else {
        ipaWord = applyAmericanRules(ipaWord);
      }

      // Default stress
      if (countSyllables(ipaWord) > 1 && !ipaWord.includes('ˈ')) {
        ipaWord = 'ˈ' + ipaWord;
      }

      // British length marks final check
      if (currentAccent === 'british') {
        ipaWord = ipaWord
          .replace(/ɑ(?=r)/g, 'ɑː')
          .replace(/ɔ(?=[^ɪ])/g, 'ɔː')
          .replace(/ɜ/g, 'ɜː');
      }

      return leadingPunctuation[0] + ipaWord + trailingPunctuation[0];
    }).join(' ');
  };

  const ipaToEnglishConverter = (text) => {
    const ipaToCommonWords = {};
    const combinedDict = {...commonWordsBritish, ...commonWordsAmerican};
    
    for (const [word, ipa] of Object.entries(combinedDict)) {
      ipaToCommonWords[ipa] = word;
    }

    const ipaWords = text.split(/\s+/);
    return ipaWords.map(ipaWord => {
      if (ipaToCommonWords[ipaWord]) {
        return ipaToCommonWords[ipaWord];
      }

      // Reverse Rules
      let englishWord = ipaWord
        .replace(/ˈ/g, '').replace(/ˌ/g, '')
        .replace(/θ/g, 'th').replace(/ð/g, 'th')
        .replace(/ʃ/g, 'sh').replace(/tʃ/g, 'ch')
        .replace(/dʒ/g, 'j').replace(/ŋ/g, 'ng').replace(/ʒ/g, 'zh')
        
        .replace(/æ/g, 'a').replace(/ɑː/g, 'ar').replace(/ɑ/g, 'a')
        .replace(/ɒ/g, 'o').replace(/ɔː/g, 'or').replace(/ɔ/g, 'o')
        .replace(/eə/g, 'are').replace(/ɪə/g, 'ear').replace(/ʊə/g, 'ure')
        .replace(/eɪ/g, 'ay').replace(/ɛ/g, 'e')
        .replace(/iː/g, 'ee').replace(/i/g, 'ee').replace(/ɪ/g, 'i')
        .replace(/aɪ/g, 'igh').replace(/ɜː/g, 'er').replace(/ɜr/g, 'er')
        .replace(/əʊ/g, 'ow').replace(/oʊ/g, 'ow').replace(/ɔɪ/g, 'oy')
        .replace(/uː/g, 'oo').replace(/u/g, 'oo').replace(/ʊ/g, 'oo')
        .replace(/aʊ/g, 'ow').replace(/ʌ/g, 'u').replace(/ə/g, 'a');

      return englishWord;
    }).join(' ');
  };

  const handleConvert = () => {
    if (!inputText.trim()) return;
    
    if (conversionType === 'to-ipa') {
      setOutputText(englishToIPAConverter(inputText, accent));
    } else {
      setOutputText(ipaToEnglishConverter(inputText));
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 1500);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  // --- Tool Metadata & Content ---

  const toolData = {
    name: "English to IPA",
    title: "English to IPA Converter",
    description: "Convert English text to International Phonetic Alphabet (IPA) notation with support for British and American accents.",
    icon: "fas fa-microphone-alt",
    category: "Language",
    breadcrumb: ["Utility", "Tools", "English to IPA"],
    tags: ["english", "ipa", "phonetic", "transcription", "pronunciation", "accent"]
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
      { name: "Gen Z Translator", url: "/utility-tools/genz-translator", icon: "fas fa-language" },
      { name: "Word Counter", url: "/utility-tools/word-counter", icon: "fas fa-font" },
      { name: "Morse Code Translator", url: "/utility-tools/morse-code-translator", icon: "fas fa-signal" },
      { name: "Text Case Converter", url: "/utility-tools/converter-tools/text-case-converter", icon: "fas fa-font" },
      { name: "HTML to Markdown", url: "/utility-tools/html-to-markdown-converter", icon: "fab fa-html5" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'ipa-chart', title: 'Common IPA Symbols' },
    { id: 'accents', title: 'British vs American IPA' },
    { id: 'faq', title: 'Frequently Asked Questions' }
  ];

  const faqData = [
    {
      question: "What is IPA?",
      answer: "The International Phonetic Alphabet (IPA) is a system of phonetic notation used to represent the sounds of spoken language. It provides a consistent way to write down how words are pronounced."
    },
    {
      question: "Why does the tool support different accents?",
      answer: "English pronunciation varies significantly between regions. British English (Received Pronunciation) and American English (General American) often use different vowel sounds and stress patterns."
    },
    {
      question: "Is the conversion 100% accurate?",
      answer: "English spelling is irregular, so rule-based conversion isn't perfect. We use a dictionary for common words and rules for others, but there may be exceptions."
    }
  ];

  const inputLabel = conversionType === 'to-ipa' ? 'English Text' : 'IPA Text';
  const outputLabel = conversionType === 'to-ipa' ? 'IPA Transcription' : 'English Text';

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection title="IPA Converter" icon="fas fa-microphone-alt">
        <div className="ipa-translator-container">
          
          <div className="translator-controls">
            <div className="control-group">
              <button 
                className={`mode-toggle-btn ${conversionType === 'to-ipa' ? 'active' : ''}`}
                onClick={() => setConversionType('to-ipa')}
              >
                English to IPA
              </button>
              <button 
                className={`mode-toggle-btn ${conversionType === 'to-english' ? 'active' : ''}`}
                onClick={() => setConversionType('to-english')}
              >
                IPA to English
              </button>
            </div>

            {conversionType === 'to-ipa' && (
              <select 
                className="accent-select"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              >
                <option value="british">British Accent</option>
                <option value="american">American Accent</option>
              </select>
            )}

            <div className="action-buttons">
               <button className="action-btn danger" onClick={handleClear}>
                <i className="fas fa-trash"></i> Clear
              </button>
              <button className="action-btn secondary" onClick={handleConvert}>
                <i className="fas fa-sync"></i> Convert
              </button>
            </div>
          </div>

          <div className="editor-grid">
            <div className="editor-pane">
              <div className="pane-header">
                <span className="pane-title"><i className="fas fa-font"></i> {inputLabel}</span>
              </div>
              <textarea 
                className="editor-textarea" 
                placeholder={`Type ${conversionType === 'to-ipa' ? 'English' : 'IPA'} text here...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="editor-pane">
              <div className="pane-header">
                <span className="pane-title"><i className="fas fa-microphone-lines"></i> {outputLabel}</span>
                <div className="pane-actions">
                  <button onClick={handleCopy} title="Copy to Clipboard">
                    {copyStatus === 'Copied!' ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
                  </button>
                </div>
              </div>
               <textarea 
                className="editor-textarea" 
                placeholder="Result will appear here..."
                value={outputText}
                readOnly
              />
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
            The <strong>English to IPA Converter</strong> helps linguistics students, singers, actors, and language learners master English pronunciation. 
            By converting standard English text into the International Phonetic Alphabet (IPA), it reveals the precise sounds behind the spelling.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use">
        <ol className="list-decimal pl-6 space-y-2 mt-4">
             <li><strong>Select Mode:</strong> Choose "English to IPA" to get phonetic transcription, or "IPA to English" to decode symbols.</li>
             <li><strong>Choose Accent:</strong> Switch between British (RP) and American (GenAm) pronunciations.</li>
             <li><strong>Input Text:</strong> Type or paste your text into the left box.</li>
             <li><strong>Convert:</strong> Click "Convert" to see the result.</li>
        </ol>
      </ContentSection>

      <ContentSection id="ipa-chart" title="Common IPA Symbols">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 border rounded">
                <h4 className="font-bold border-b pb-2 mb-2">Vowels (Short)</h4>
                <code>ɪ</code> (bit) • <code>ɛ</code> (bet) • <code>æ</code> (cat)<br/>
                <code>ɒ</code> (hot, UK) • <code>ʌ</code> (cut) • <code>ʊ</code> (put)
            </div>
             <div className="bg-gray-50 p-4 border rounded">
                <h4 className="font-bold border-b pb-2 mb-2">Vowels (Long)</h4>
                <code>iː</code> (see) • <code>ɑː</code> (car) • <code>ɔː</code> (door)<br/>
                <code>uː</code> (too) • <code>ɜː</code> (her)
            </div>
        </div>
      </ContentSection>

       <FAQSection faqs={faqData} />

    </ToolPageLayout>
  );
};

export default EnglishToIPATranslator;
