import React, { useState, useEffect, useRef } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import Seo from '../Seo';
import '../../assets/css/utility/morse-code-translator.css';
import { toolCategories } from '../../data/toolCategories';


const MorseCodeTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [wpm, setWpm] = useState(15);
  const [flashColor, setFlashColor] = useState('white');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Morse Code Dictionary
  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', '!': '-.-.--', '@': '.--.-.', '"': '.-..-.', "'": '.----.',
    '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
    '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '$': '...-..-',
    '/': '-..-.'
  };

  const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
  );

  const handleTextToMorse = (text) => {
    setInputText(text);
    const translated = text.toUpperCase().split('').map(char => {
      if (char === ' ') return '/';
      return morseCode[char] || '';
    }).join(' ').replace(/\s+/g, ' ').trim();

    setOutputText(translated);
  };

  const handleMorseToText = (morse) => {
    setOutputText(morse);
    const translated = morse.split(' ').map(code => {
      if (code === '/') return ' ';
      return reverseMorseCode[code] || '';
    }).join('');
    setInputText(translated);
  };

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopPlayback = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setIsPlaying(false);
    setIsFlashing(false);
    setFlashActive(false);
  };

  const playSound = async () => {
    if (!outputText) return;
    initAudio();
    stopPlayback(); // Cancel any current
    setIsPlaying(true);

    const ctx = audioContextRef.current;
    const dotMs = 1200 / wpm;

    let startTime = ctx.currentTime + 0.1;

    const codes = outputText.split(' ');

    codes.forEach((code, i) => {
      if (code === '/') {
        startTime += (dotMs * 7) / 1000;
        return;
      }

      code.split('').forEach((symbol, j) => {
        const duration = symbol === '.' ? dotMs : dotMs * 3;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + (duration / 1000));

        // Smooth edges
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.005);
        gain.gain.setValueAtTime(0.1, startTime + (duration / 1000) - 0.005);
        gain.gain.linearRampToValueAtTime(0, startTime + (duration / 1000));

        startTime += (duration / 1000);

        if (j < code.length - 1) startTime += (dotMs / 1000);
      });

      if (i < codes.length - 1) startTime += (dotMs * 3) / 1000;
    });

    const totalTimeMs = (startTime - ctx.currentTime) * 1000;
    const t = setTimeout(() => {
      setIsPlaying(false);
    }, totalTimeMs);
    timeoutsRef.current.push(t);
  };

  const startFlash = () => {
    if (!outputText) return;
    stopPlayback();
    setIsFlashing(true);

    const dotMs = 1200 / wpm;
    let delay = 0;

    const codes = outputText.split(' ');
    codes.forEach((code, i) => {
      if (code === '/') {
        delay += (dotMs * 7);
        return;
      }

      code.split('').forEach((symbol, j) => {
        const duration = symbol === '.' ? dotMs : dotMs * 3;

        const tOn = setTimeout(() => setFlashActive(true), delay);
        timeoutsRef.current.push(tOn);

        const tOff = setTimeout(() => setFlashActive(false), delay + duration);
        timeoutsRef.current.push(tOff);

        delay += duration;

        if (j < code.length - 1) delay += dotMs;
      });

      if (i < codes.length - 1) delay += dotMs * 3;
    });

    const tEnd = setTimeout(() => {
      setIsFlashing(false);
      setFlashActive(false);
    }, delay + 200);
    timeoutsRef.current.push(tEnd);
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  // --- Content & Metadata ---

  const toolData = {
    name: "Morse Code Translator",
    title: "Morse Code Translator",
    description: "Convert text to Morse code and back instantly. Features audio playback, visual light signaling, and adjustable transmission speeds for learning and testing.",
    icon: "fas fa-signal",
    category: "Utility",
    breadcrumb: ["Utility", "Tools", "Morse Converter"],
    tags: ["morse", "code", "translator", "audio", "flash", "telegraph", "sos", "signal"]
  };


  const relatedTools = [
    { name: "QR Code Generator", url: "/utility-tools/qr-code-generator", icon: "fas fa-qrcode" },
    { name: "Word Counter", url: "/utility-tools/word-counter", icon: "fas fa-font" },
    { name: "Password Generator", url: "/utility-tools/password-generator", icon: "fas fa-key" },
    { name: "Text Case Converter", url: "/utility-tools/converter-tools/text-case-converter", icon: "fas fa-font" },
    { name: "Binary Calculator", url: "/math/calculators/binary-calculator", icon: "fas fa-calculator" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'mechanics', title: 'Mechanics of Morse Code' },
    { id: 'history', title: 'History & Origins' },
    { id: 'applications', title: 'Modern Applications' },
    { id: 'sos-distress', title: 'SOS & Emergency Signals' },
    { id: 'learning-tips', title: 'Tips for Learning' },
    { id: 'faq', title: 'Frequently Asked Questions' }
  ];

  const faqData = [
    {
      question: "What is the 'Farnsworth Method' for learning Morse code?",
      answer: "The Farnsworth method involves sending characters at a high speed (e.g., 20 WPM) but adding extra spacing between characters and words. This encourages the learner to recognize the rhythm of whole characters rather than counting individual dots and dashes."
    },
    {
      question: "Why is 'SOS' the universal distress signal?",
      answer: "SOS (... --- ...) was chosen not as an acronym for 'Save Our Souls', but because it is distinct, easy to transmit, and easy to recognize even through static. It is a continuous sequence of three dots, three dashes, and three dots."
    },
    {
      question: "Is Morse code still used today?",
      answer: "Yes! While it's no longer the primary mode for naval or military communication, it remains extremely popular in amateur radio (HAM radio) communities. It's also used in navigation aids (beacons) and aviation identification."
    },
    {
      question: "How fast can experts send Morse code?",
      answer: "Professional telegraph operators could typically send at 20-30 words per minute (WPM). The world record is over 75 WPM. Our tool supports speeds up to 50 WPM for advanced practice."
    },
    {
      question: "Can I use this tool to practice receiving?",
      answer: "Absolutely. Type a message in the text box (or paste a random article), cover the text box, and press 'Play Audio'. Try to decode the message by ear. You can also use the 'Flash' function to practice visual decoding."
    }
  ];

  const seoData = {
    title: 'Morse Code Translator - Text to Morse & Audio | Tuitility',
    description: 'Free online Morse code translator with audio playback and visual flashing. Convert text to Morse code and back instantly. Learn Morse code with adjustable speeds.',
    keywords: 'morse code translator, text to morse, morse to text, morse code audio, morse code generator, morse code decoder',
    canonicalUrl: 'https://tuitility.vercel.app/utility-tools/morse-code-translator'
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
        <CalculatorSection title="Morse Code Translator" icon="fas fa-signal">
          <div className="morse-translator-container">

            <div className="morse-controls">
              <div className="morse-control-group">
                <label>
                  <span>Speed (WPM)</span>
                  <span>{wpm} wpm</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={wpm}
                  onChange={(e) => setWpm(Number(e.target.value))}
                  className="morse-range-input"
                />
              </div>

              <div className="morse-control-group">
                <label>Flash Color</label>
                <select
                  value={flashColor}
                  onChange={(e) => setFlashColor(e.target.value)}
                  className="morse-select"
                >
                  <option value="white">White</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                </select>
              </div>
            </div>

            <div className={`morse-flash-display ${isFlashing ? 'visible' : ''}`}>
              <div className={`morse-flash-box ${flashActive ? flashColor : ''} ${flashActive ? 'active' : ''}`}>
                <i className="fas fa-lightbulb morse-flash-icon"></i>
              </div>
            </div>

            <div className="morse-main-actions">
              <button
                className="morse-main-btn morse-btn-primary"
                onClick={playSound}
                disabled={isPlaying || isFlashing || !outputText}
              >
                <i className={`fas ${isPlaying ? 'fa-spinner fa-spin' : 'fa-volume-up'}`}></i>
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </button>
              <button
                className="morse-main-btn morse-btn-outline"
                onClick={startFlash}
                disabled={isPlaying || isFlashing || !outputText}
              >
                <i className="fas fa-lightbulb"></i>
                {isFlashing ? 'Flashing...' : 'Flash Light'}
              </button>
              {(isPlaying || isFlashing) && (
                <button className="morse-main-btn morse-btn-outline" onClick={stopPlayback}>
                  <i className="fas fa-stop"></i> Stop
                </button>
              )}
            </div>

            <div className="morse-grid">
              <div className="morse-box">
                <div className="morse-box-header">
                  <h3>Input Text</h3>
                  <div className="morse-actions-row">
                    <button className="morse-action-btn" onClick={() => { setInputText(''); setOutputText(''); }}>
                      <i className="fas fa-trash"></i> Clear
                    </button>
                  </div>
                </div>
                <textarea
                  className="morse-textarea"
                  placeholder="Type text to translate..."
                  value={inputText}
                  onChange={(e) => handleTextToMorse(e.target.value)}
                />
              </div>

              <div className="morse-box">
                <div className="morse-box-header">
                  <h3>Morse Code</h3>
                  <div className="morse-actions-row">
                    <button className="morse-action-btn" onClick={() => navigator.clipboard.writeText(outputText)}>
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
                <textarea
                  className="morse-textarea morse-code-font"
                  placeholder="... --- ..."
                  value={outputText}
                  onChange={(e) => handleMorseToText(e.target.value)}
                />
              </div>
            </div>

            <div className="morse-dictionary">
              <h3>Morse Dictionary</h3>
              <div className="morse-table-grid">
                {Object.entries(morseCode)
                  .filter(([k]) => k !== ' ') // Skip space
                  .sort()
                  .map(([char, code]) => (
                    <div key={char} className="morse-char-item">
                      <span className="morse-char">{char}</span>
                      <span className="morse-code">{code}</span>
                    </div>
                  ))}
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
            The <strong>Morse Code Translator</strong> is a versatile utility designed to bridge the gap between written text and
            one of the world's most enduring communication methods. Whether you are a student of history, an amateur radio enthusiast,
            or simply curious about cryptography, this tool provides an instant, accurate way to encode and decode Morse messages.
          </p>
          <p>
            Beyond simple text conversion, our tool brings the code to life. You can <strong>listen</strong> to the rhythmic bleeps of your message
            at adjustable speeds or <strong>watch</strong> it transmitted via light pulses, simulating the signal lamps used by naval vessels
            for over a century.
          </p>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use">
          <p>Our translator works bi-directionally and in real-time. Here is how to get the most out of it:</p>
          <ol className="list-decimal pl-6 space-y-2 mt-4">
            <li><strong>Text to Morse:</strong> Simply type or paste your message into the left-hand "Input Text" box. The Morse code equivalent will appear instantly on the right.</li>
            <li><strong>Morse to Text:</strong> Type standard Morse code characters (dots <code>.</code> and dashes <code>-</code>) into the right-hand box. Use a single space to separate letters and a forward slash <code>/</code> or three spaces to separate words.</li>
            <li><strong>Audio Playback:</strong> Press the "Play Audio" button to hear your message using a generated sine wave tone (600Hz). Use the "Speed (WPM)" slider to adjust the tempo. 15 WPM is standard; 5 WPM is great for beginners.</li>
            <li><strong>Visual Signaling:</strong> Press "Flash Light" to see a visual representation. The box below the controls will light up in sync with the code. You can change the flash color (White, Yellow, Red, Blue) to simulate different signal types.</li>
          </ol>
        </ContentSection>

        <ContentSection id="mechanics" title="Mechanics of Morse Code">
          <p>Morse code is a binary system of representation. It breaks down language into two distinct signal durations:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>The Dot (Dit):</strong> This is the basic unit of time. All other elements are measured in relation to the dot.</li>
            <li><strong>The Dash (Dah):</strong> Represents three units of time (3 dots).</li>
            <li><strong>Intra-character Space:</strong> The silence between elements of a single letter is equal to 1 dot.</li>
            <li><strong>Inter-character Space:</strong> The silence between letters is equal to 3 dots.</li>
            <li><strong>Word Space:</strong> The silence between words is equal to 7 dots.</li>
          </ul>
          <p className="mt-4">
            This precise timing is what allows Morse code to be understood by ear (rhythm) or by eye (light pulses) without any confusion,
            even when transmitted at high speeds.
          </p>
        </ContentSection>

        <ContentSection id="history" title="History & Origins">
          <p>
            Developed in the 1830s and 1840s by Samuel Morse and Alfred Vail, Morse code was created for the electrical telegraph.
            Before the telephone, the telegraph was the only way to send messages over long distances instantly.
          </p>
          <p className="mt-4">
            The code was designed with efficiency in mind. Alfred Vail realized that English letters vary in frequency. Therefore, the most common letter,
            <strong>E</strong>, was assigned the shortest code (a single dot <code>.</code>), while less common letters like <strong>Q</strong> (<code>--.-</code>)
            were given longer sequences. This variable-length coding made transmissions faster and more efficient.
          </p>
          <p className="mt-4">
            It became the international standard for maritime communication for over 100 years, saving countless lives—most famously playing a role
            in the Titanic disaster of 1912, where wireless operators transmitted tireless distress calls until the very end.
          </p>
        </ContentSection>

        <ContentSection id="applications" title="Modern Applications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Amateur Radio (Ham Radio)</h4>
              <p className="text-gray-700">Thousands of enthusiasts worldwide still communicate via CW (Continuous Wave) radiotelegraphy. It is prized for its ability to get through weak signal conditions where voice would fail.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Aviation</h4>
              <p className="text-gray-700">Pilots use Morse code to identify VOR (VHF Omnidirectional Range) and NDB (Non-Directional Beacon) navigation stations, which transmit their 3-letter ID in Morse.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Assistive Technology</h4>
              <p className="text-gray-700">For individuals with severe motor disabilities, Morse code inputs (using a single switch or sip-and-puff device) can be an effective way to type and control computers.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Military & Survival</h4>
              <p className="text-gray-700">It remains a fallback method for naval signaling using signal lamps (Aldis lamps) when radio silence is required or electronic systems fail.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="sos-distress" title="SOS & Emergency Signals">
          <p>
            The most famous Morse code signal is undoubtedly <strong>SOS</strong>. Contrary to popular belief, it does not stand for "Save Our Souls"
            or "Save Our Ship". It was chosen because its distinct pattern is unmistakable.
          </p>
          <div className="flex items-center justify-center p-8 my-6 bg-gray-900 text-white rounded-lg text-4xl font-mono tracking-widest">
            ... --- ...
          </div>
          <p>
            It consists of three short signals, three long signals, and three short signals. It is transmitted as a continuous stream without
            standard letter spacing, making it effectively one unique, long character. This ensured that even an untrained operator could recognize the distress call.
          </p>
        </ContentSection>

        <ContentSection id="learning-tips" title="Tips for Learning">
          <ul className="space-y-4">
            <li><strong>Don't visualize dots and dashes:</strong> Try to learn the <em>sound</em> of the letter. Hear "di-dah" for 'A', not "dot dash".</li>
            <li><strong>Start with E, T, A, N:</strong> These are the most common letters. Mastering them first gives you a solid foundation.</li>
            <li><strong>Use Mnemonics:</strong> Many learners use words that start with the letter and mimic the rhythm. For example, "A-part" (di-dah) or "Dog-did-it" (dah-di-dit) for 'D'.</li>
            <li><strong>Practice Daily:</strong> 10-15 minutes of daily practice is far better than a once-a-week marathon session.</li>
          </ul>
        </ContentSection>

        <FAQSection faqs={faqData} />

      </ToolPageLayout>
    </>
  );
};

export default MorseCodeTranslator;
