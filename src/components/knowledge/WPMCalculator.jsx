import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import ResultSection from '../tool/ResultSection';
import TableOfContents from '../tool/TableOfContents';
import MathFormula from '../tool/MathFormula';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/wpm-calculator.css';

const WPMCalculator = () => {
  const [formData, setFormData] = useState({
    testDuration: 60,
    customText: '',
    useCustomText: false
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [correctCharacters, setCorrectCharacters] = useState(0);
  const [totalCharacters, setTotalCharacters] = useState(0);

  useEffect(() => {
    // Load the JavaScript logic
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/wpm-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    // Initialize the calculator when script loads
    script.onload = () => {
      if (window.wpmCalculator) {
        window.wpmCalculator.setTestDuration(formData.testDuration);
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [formData.testDuration]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startTest = () => {
    setIsTestActive(true);
    setTimeLeft(formData.testDuration);
    setTypedText('');
    setWordCount(0);
    setCorrectCharacters(0);
    setTotalCharacters(0);
    setError('');
    
    // Set initial text for display
    if (formData.useCustomText && formData.customText.trim()) {
      setCurrentText(formData.customText);
    } else {
      // Use random sample text
      const sampleTexts = [
        "The art of programming is a journey that never truly ends. As technology evolves, programmers must constantly adapt and learn new skills. Writing clean, efficient code is not just about making things work; it's about making them work elegantly. Good programmers write code that humans can understand, knowing that maintenance and readability are crucial for long-term success.",
        "Artificial intelligence and machine learning are revolutionizing the way we interact with technology. From voice assistants to autonomous vehicles, AI systems are becoming increasingly sophisticated. These technologies analyze vast amounts of data to identify patterns and make predictions, helping us make better decisions in fields ranging from healthcare to climate science.",
        "The history of computing dates back to ancient civilizations using abacuses for calculations. However, the modern computer age began with pioneers like Alan Turing and Ada Lovelace. Their groundbreaking work laid the foundation for today's digital revolution. The development of integrated circuits and microprocessors in the 20th century transformed computers from room-sized machines to portable devices.",
        "Cybersecurity is more important than ever in our interconnected world. As our reliance on digital systems grows, so does the need to protect sensitive information. Hackers and cybercriminals constantly develop new methods to breach security measures, making it essential for organizations to maintain robust defense mechanisms and stay updated with the latest security protocols.",
        "The internet of things (IoT) has created a network where everyday objects can communicate and share data. Smart homes, wearable devices, and industrial sensors are just a few examples of IoT applications. This interconnectivity brings convenience but also raises important questions about privacy, security, and the ethical use of personal data."
      ];
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      setCurrentText(randomText);
    }
    
    // Focus on typing input after state updates
    setTimeout(() => {
      const typingInput = document.getElementById('wpm-typing-input');
      if (typingInput) {
        typingInput.focus();
      }
    }, 200);
  };

  const resetTest = () => {
    setIsTestActive(false);
    setTimeLeft(formData.testDuration);
    setTypedText('');
    setWordCount(0);
    setCorrectCharacters(0);
    setTotalCharacters(0);
    setResult(null);
    setError('');
    setCurrentText('');
    
    // Reset text display
    const textDisplay = document.getElementById('wpm-text-display');
    if (textDisplay) {
      textDisplay.innerHTML = "Click 'Start Test' to begin typing test...";
    }
    
    // Reset stats display
    const wpmDisplay = document.getElementById('wpm-wpm');
    const accuracyDisplay = document.getElementById('wpm-accuracy');
    if (wpmDisplay) wpmDisplay.textContent = '0';
    if (accuracyDisplay) accuracyDisplay.textContent = '0%';
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTestActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            endTest();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isTestActive && timeLeft !== formData.testDuration) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTestActive, timeLeft, formData.testDuration]);

  // Real-time stats update effect
  useEffect(() => {
    if (isTestActive && wordCount > 0) {
      const timeElapsed = formData.testDuration - timeLeft;
      const currentWPM = timeElapsed > 0 ? Math.round((wordCount / timeElapsed) * 60) : 0;
      const currentAccuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;
      
      // Update the display elements
      const wpmDisplay = document.getElementById('wpm-wpm');
      const accuracyDisplay = document.getElementById('wpm-accuracy');
      
      if (wpmDisplay) wpmDisplay.textContent = currentWPM;
      if (accuracyDisplay) accuracyDisplay.textContent = `${currentAccuracy}%`;
    }
  }, [isTestActive, wordCount, timeLeft, correctCharacters, totalCharacters, formData.testDuration]);

  // Update text display when currentText or typedText changes
  useEffect(() => {
    if (isTestActive && currentText) {
      updateTextDisplay(typedText);
    }
  }, [isTestActive, currentText, typedText]);

  const endTest = () => {
    setIsTestActive(false);
    
    const timeTaken = formData.testDuration - timeLeft;
    const wpm = Math.round((wordCount / timeTaken) * 60);
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;
    
    let category = 'Beginner';
    if (wpm >= 120) category = 'Expert';
    else if (wpm >= 91) category = 'Professional';
    else if (wpm >= 71) category = 'Excellent';
    else if (wpm >= 51) category = 'Good';
    else if (wpm >= 31) category = 'Average';

    setResult({
      wpm,
      accuracy,
      category,
      wordsTyped: wordCount,
      charactersTyped: totalCharacters,
      timeTaken
    });
  };

  // Handle typing input
  const handleTypingInput = (e) => {
    if (!isTestActive) return;

    const inputText = e.target.value;
    
    // Prevent pasting
    if (inputText.length > currentText.length) {
      e.target.value = inputText.substring(0, currentText.length);
      return;
    }

    setTypedText(inputText);
    
    // Calculate statistics
    const inputWords = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const targetWords = currentText.trim().split(/\s+/);
    
    setTotalCharacters(inputText.length);
    setWordCount(inputWords.length);
    
    // Calculate correct characters with proper word matching
    let correct = 0;
    let currentPosition = 0;
    
    // Process each target word
    targetWords.forEach((targetWord, wordIndex) => {
      const inputWord = inputWords[wordIndex] || '';
      
      // Add space before word (except first word)
      if (wordIndex > 0 && currentPosition < inputText.length) {
        if (inputText[currentPosition] === ' ') {
          correct++;
        }
        currentPosition++;
      }
      
      // Compare characters in the word
      for (let i = 0; i < targetWord.length; i++) {
        if (currentPosition < inputText.length) {
          if (i < inputWord.length) {
            if (inputText[currentPosition] === targetWord[i]) {
              correct++;
            }
          }
        }
        currentPosition++;
      }
    });
    
    setCorrectCharacters(correct);
  };

  // Update text display with visual feedback
  const updateTextDisplay = (inputText) => {
    const textDisplay = document.getElementById('wpm-text-display');
    if (!textDisplay || !currentText) return;

    const inputWords = inputText.trim().split(/\s+/);
    const targetWords = currentText.trim().split(/\s+/);
    let html = '';
    let currentPosition = 0;
    
    // Process each target word
    targetWords.forEach((targetWord, wordIndex) => {
      const inputWord = inputWords[wordIndex] || '';
      
      // Add space between words (except for the first word)
      if (wordIndex > 0) {
        if (currentPosition < inputText.length) {
          html += '<span class="correct"> </span>';
        } else {
          html += '<span class="remaining"> </span>';
        }
        currentPosition++;
      }
      
      // Process each character in the word
      for (let i = 0; i < targetWord.length; i++) {
        if (currentPosition < inputText.length) {
          // If we're still within the current input word
          if (i < inputWord.length) {
            if (inputWord[i] === targetWord[i]) {
              html += `<span class="correct">${targetWord[i]}</span>`;
            } else {
              html += `<span class="incorrect">${targetWord[i]}</span>`;
            }
          } else {
            // If the input word is shorter than the target word
            html += `<span class="incorrect">${targetWord[i]}</span>`;
          }
        } else {
          // If we're beyond the current input
          html += `<span class="remaining">${targetWord[i]}</span>`;
        }
        currentPosition++;
      }
    });
    
    textDisplay.innerHTML = html;
  };

  const toolData = {
    name: "WPM Calculator",
    description: "Test your typing speed and accuracy with our comprehensive Words Per Minute (WPM) calculator. Practice with various texts and improve your typing skills with detailed performance metrics.",
    icon: "fas fa-keyboard",
    category: "Knowledge",
    breadcrumb: ["Knowledge", "Calculators", "WPM Calculator"]
  };

  const categories = [
    { name: "Knowledge", url: "/knowledge", icon: "fas fa-graduation-cap" },
    { name: "Math", url: "/math", icon: "fas fa-calculator" },
    { name: "Finance", url: "/finance", icon: "fas fa-dollar-sign" },
    { name: "Health", url: "/health", icon: "fas fa-heartbeat" },
    { name: "Science", url: "/science", icon: "fas fa-flask" }
  ];

  const relatedTools = [
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-calendar-alt" },
    { name: "Love Calculator", url: "/knowledge/calculators/love-calculator", icon: "fas fa-heart" },
    { name: "MBTI Personality", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Carbon Footprint", url: "/knowledge/calculators/carbon-footprint-calculator", icon: "fas fa-leaf" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'what-is-wpm', title: 'What is WPM?', level: 2 },
    { id: 'wpm-categories', title: 'WPM Categories', level: 2 },
    { id: 'how-to-use', title: 'How to Use', level: 2 },
    { id: 'calculation-method', title: 'Calculation Method', level: 2 },
    { id: 'examples', title: 'Examples', level: 2 },
    { id: 'significance', title: 'Significance', level: 2 },
    { id: 'functionality', title: 'Functionality', level: 2 },
    { id: 'applications', title: 'Applications', level: 2 },
    { id: 'faqs', title: 'FAQs', level: 2 }
  ];

  const faqData = [
    {
      question: "What is a good WPM score?",
      answer: "Average typing speed is 40 WPM. Good typists achieve 60-80 WPM, while professional typists can reach 100+ WPM. The world record is over 200 WPM."
    },
    {
      question: "How is WPM calculated?",
      answer: "WPM is calculated as (Total Words Typed ÷ Time in Minutes). A 'word' is typically counted as 5 characters including spaces."
    },
    {
      question: "What affects typing speed?",
      answer: "Factors include practice, keyboard familiarity, text difficulty, typing technique, and individual motor skills. Regular practice is the most important factor."
    },
    {
      question: "Should I focus on speed or accuracy?",
      answer: "Accuracy is more important than speed. It's better to type slowly and correctly than fast with many errors. Focus on accuracy first, then gradually increase speed."
    },
    {
      question: "How can I improve my typing speed?",
      answer: "Practice regularly, use proper finger placement, avoid looking at the keyboard, take typing courses, and use online typing games and exercises."
    },
    {
      question: "What's the difference between WPM and CPM?",
      answer: "WPM (Words Per Minute) counts words, while CPM (Characters Per Minute) counts individual characters. WPM is more commonly used for typing speed measurement."
    }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
    >
     
       
        
        <CalculatorSection title="WPM Calculator">
          <div className="wpm-calculator-form">
            <div className="wpm-form-group">
              <label className="wpm-input-label">Test Duration (seconds)</label>
              <select 
                className="wpm-select-field"
                value={formData.testDuration}
                onChange={(e) => handleInputChange('testDuration', parseInt(e.target.value))}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>

            <div className="wpm-form-group">
              <label className="wpm-input-label">
                <input 
                  type="checkbox"
                  checked={formData.useCustomText}
                  onChange={(e) => handleInputChange('useCustomText', e.target.checked)}
                />
                Use Custom Text
              </label>
            </div>

            {formData.useCustomText && (
              <div className="wpm-form-group">
                <label className="wpm-input-label">Custom Text</label>
                <textarea
                  className="wpm-textarea-field"
                  value={formData.customText}
                  onChange={(e) => handleInputChange('customText', e.target.value)}
                  placeholder="Enter your custom text here..."
                  rows="4"
                />
              </div>
            )}

            <div className="wpm-test-area">
              <div className="wpm-text-display" id="wpm-text-display">
                {currentText || "Click 'Start Test' to begin typing test..."}
              </div>
              
                 <div className="wpm-typing-area">
                  <textarea
                    className="wpm-typing-input"
                    id="wpm-typing-input"
                    value={typedText}
                    onChange={handleTypingInput}
                    onPaste={(e) => e.preventDefault()}
                    placeholder="Start typing here..."
                    disabled={!isTestActive}
                  />
                 </div>
            </div>

            <div className="wpm-stats-display">
              <div className="wpm-stat-item">
                <span className="wpm-stat-label">Time:</span>
                <span className="wpm-stat-value" id="wpm-time">{timeLeft}s</span>
              </div>
              <div className="wpm-stat-item">
                <span className="wpm-stat-label">WPM:</span>
                <span className="wpm-stat-value" id="wpm-wpm">0</span>
              </div>
              <div className="wpm-stat-item">
                <span className="wpm-stat-label">Accuracy:</span>
                <span className="wpm-stat-value" id="wpm-accuracy">0%</span>
              </div>
            </div>

            <div className="wpm-form-actions">
              <button 
                type="button" 
                className="wpm-start-button" 
                id="wpm-start-test"
                onClick={startTest}
                disabled={isTestActive}
              >
                <i className="fas fa-play"></i>
                Start Test
              </button>
              <button 
                type="button" 
                className="wpm-btn-reset" 
                id="wpm-reset-test"
                onClick={resetTest}
                disabled={!isTestActive}
              >
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {result && (
            <div id="wpm-result-section" className="wpm-result-section">
              <div className="wpm-result-header">
                <h3>Test Results</h3>
              </div>
              <div className="wpm-result-content">
                <div className="wpm-result-main">
                  <div className="wpm-result-value">
                    {result.wpm} WPM
                  </div>
                  <div className="wpm-result-category">
                    {result.category}
                  </div>
                </div>
                <div className="wpm-result-details">
                  <div className="wpm-result-item">
                    <span className="wpm-result-label">Accuracy:</span>
                    <span className="wpm-result-value-small">{result.accuracy}%</span>
                  </div>
                  <div className="wpm-result-item">
                    <span className="wpm-result-label">Words Typed:</span>
                    <span className="wpm-result-value-small">{result.wordsTyped}</span>
                  </div>
                  <div className="wpm-result-item">
                    <span className="wpm-result-label">Characters:</span>
                    <span className="wpm-result-value-small">{result.charactersTyped}</span>
                  </div>
                  <div className="wpm-result-item">
                    <span className="wpm-result-label">Time Taken:</span>
                    <span className="wpm-result-value-small">{result.timeTaken}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="wpm-error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
        </CalculatorSection>

        <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

        <ContentSection id="introduction">
          <h2>Introduction</h2>
          <p>
            The Words Per Minute (WPM) Calculator is a comprehensive tool designed to measure and improve your typing speed and accuracy. 
            Whether you're a student, professional, or simply looking to enhance your typing skills, this calculator provides detailed 
            insights into your typing performance.
          </p>
          <p>
            Our WPM calculator offers multiple test durations, custom text options, and real-time feedback to help you track your 
            progress and identify areas for improvement. With detailed statistics and performance analysis, you can set goals and 
            monitor your typing development over time.
          </p>
        </ContentSection>

        <ContentSection id="what-is-wpm">
          <h2>What is WPM?</h2>
          <div className="wpm-definition-grid">
            <div className="wpm-definition-item">
              <h3><i className="fas fa-keyboard"></i> Words Per Minute</h3>
              <p>WPM measures how many words you can type in one minute. It's the standard metric for typing speed assessment.</p>
            </div>
            <div className="wpm-definition-item">
              <h3><i className="fas fa-target"></i> Accuracy</h3>
              <p>Accuracy measures the percentage of correctly typed characters compared to the total characters typed.</p>
            </div>
            <div className="wpm-definition-item">
              <h3><i className="fas fa-clock"></i> Test Duration</h3>
              <p>Different test durations help measure consistency and endurance in typing performance.</p>
            </div>
            <div className="wpm-definition-item">
              <h3><i className="fas fa-chart-line"></i> Performance Metrics</h3>
              <p>Comprehensive metrics including WPM, accuracy, and error analysis for detailed performance evaluation.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="wpm-categories">
          <h2>WPM Categories</h2>
          <div className="wpm-categories-grid">
            <div className="wpm-category-item beginner">
              <h3>Beginner (0-30 WPM)</h3>
              <p>Learning to type, using hunt-and-peck method, or just starting with touch typing.</p>
            </div>
            <div className="wpm-category-item average">
              <h3>Average (31-50 WPM)</h3>
              <p>Basic typing skills, some touch typing knowledge, room for improvement.</p>
            </div>
            <div className="wpm-category-item good">
              <h3>Good (51-70 WPM)</h3>
              <p>Competent typing skills, good touch typing technique, suitable for most jobs.</p>
            </div>
            <div className="wpm-category-item excellent">
              <h3>Excellent (71-90 WPM)</h3>
              <p>Strong typing skills, efficient touch typing, above average performance.</p>
            </div>
            <div className="wpm-category-item professional">
              <h3>Professional (91-120 WPM)</h3>
              <p>Advanced typing skills, professional level performance, suitable for data entry.</p>
            </div>
            <div className="wpm-category-item expert">
              <h3>Expert (120+ WPM)</h3>
              <p>Exceptional typing skills, competitive level, suitable for transcription work.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="how-to-use">
          <h2>How to Use the WPM Calculator</h2>
          <div className="wpm-usage-steps">
            <h3>Step 1: Configure Test Settings</h3>
            <ul className="usage-steps">
              <li><strong>Select Duration:</strong> Choose test duration (30 seconds to 5 minutes)</li>
              <li><strong>Choose Text:</strong> Use default texts or enter custom text</li>
              <li><strong>Prepare:</strong> Ensure comfortable typing position and good lighting</li>
            </ul>

            <h3>Step 2: Start the Test</h3>
            <ul className="usage-steps">
              <li><strong>Click Start:</strong> Press "Start Test" to begin the typing test</li>
              <li><strong>Focus:</strong> Concentrate on accuracy over speed initially</li>
              <li><strong>Type Naturally:</strong> Use your normal typing rhythm and technique</li>
            </ul>

            <h3>Step 3: Monitor Progress</h3>
            <ul className="usage-steps">
              <li><strong>Watch Stats:</strong> Monitor real-time WPM, accuracy, and time remaining</li>
              <li><strong>Stay Calm:</strong> Don't rush - maintain consistent pace</li>
              <li><strong>Focus on Accuracy:</strong> Better to type correctly than fast with errors</li>
            </ul>

            <h3>Step 4: Review Results</h3>
            <ul className="usage-steps">
              <li><strong>Analyze:</strong> Review your WPM, accuracy, and performance category</li>
              <li><strong>Identify Areas:</strong> Note areas for improvement</li>
              <li><strong>Practice:</strong> Use results to guide your practice sessions</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="calculation-method">
          <h2>WPM Calculation Method</h2>
          <div className="wpm-calculation-method">
            <h3>Formula</h3>
            <MathFormula formula="WPM = \frac{Total\ Words\ Typed}{Time\ in\ Minutes}" />
            
            <h3>Word Definition</h3>
            <p>A "word" in typing tests is typically defined as 5 characters, including spaces and punctuation.</p>
            
            <h3>Accuracy Calculation</h3>
            <MathFormula formula="Accuracy = \frac{Correct\ Characters}{Total\ Characters} \times 100\%" />
            
            <h3>Example Calculation</h3>
            <div className="wpm-calculation-example">
              <p><strong>Scenario:</strong> You type 150 characters in 1 minute</p>
              <p><strong>Words:</strong> 150 ÷ 5 = 30 words</p>
              <p><strong>WPM:</strong> 30 words ÷ 1 minute = 30 WPM</p>
              <p><strong>Accuracy:</strong> If 140 characters were correct: (140 ÷ 150) × 100% = 93.3%</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="examples">
          <h2>Typing Speed Examples</h2>
          <div className="wpm-examples-grid">
            <div className="wpm-example-item">
              <h3>Student Level</h3>
              <p><strong>WPM:</strong> 25-40</p>
              <p><strong>Accuracy:</strong> 85-95%</p>
              <p><strong>Description:</strong> Basic typing skills, learning touch typing</p>
            </div>
            <div className="wpm-example-item">
              <h3>Office Worker</h3>
              <p><strong>WPM:</strong> 45-65</p>
              <p><strong>Accuracy:</strong> 90-98%</p>
              <p><strong>Description:</strong> Competent typing for general office work</p>
            </div>
            <div className="wpm-example-item">
              <h3>Data Entry Specialist</h3>
              <p><strong>WPM:</strong> 70-90</p>
              <p><strong>Accuracy:</strong> 95-99%</p>
              <p><strong>Description:</strong> Professional typing for data entry roles</p>
            </div>
            <div className="wpm-example-item">
              <h3>Transcriptionist</h3>
              <p><strong>WPM:</strong> 100-150</p>
              <p><strong>Accuracy:</strong> 98-99%</p>
              <p><strong>Description:</strong> Expert typing for transcription work</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance">
          <h2>Significance of WPM Testing</h2>
          <div className="wpm-significance-grid">
            <div className="wpm-significance-item">
              <h3><i className="fas fa-briefcase"></i> Career Development</h3>
              <p>Many jobs require minimum typing speeds. Improving your WPM can enhance career prospects and job performance.</p>
            </div>
            <div className="wpm-significance-item">
              <h3><i className="fas fa-graduation-cap"></i> Academic Success</h3>
              <p>Faster typing helps students complete assignments more efficiently and reduces time spent on mechanical tasks.</p>
            </div>
            <div className="wpm-significance-item">
              <h3><i className="fas fa-brain"></i> Cognitive Benefits</h3>
              <p>Touch typing improves focus, reduces mental load, and allows better concentration on content rather than mechanics.</p>
            </div>
            <div className="wpm-significance-item">
              <h3><i className="fas fa-chart-line"></i> Productivity</h3>
              <p>Higher typing speeds directly translate to increased productivity in writing, coding, and data entry tasks.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="functionality">
          <h2>WPM Calculator Functionality</h2>
          <div className="wpm-functionality-grid">
            <div className="wpm-functionality-item">
              <h3><i className="fas fa-stopwatch"></i> Multiple Test Durations</h3>
              <p>Choose from 30 seconds to 5 minutes to test different aspects of your typing performance.</p>
            </div>
            <div className="wpm-functionality-item">
              <h3><i className="fas fa-edit"></i> Custom Text Support</h3>
              <p>Use your own text or choose from our curated collection of practice texts.</p>
            </div>
            <div className="wpm-functionality-item">
              <h3><i className="fas fa-chart-bar"></i> Real-time Statistics</h3>
              <p>Monitor your WPM, accuracy, and time remaining as you type.</p>
            </div>
            <div className="wpm-functionality-item">
              <h3><i className="fas fa-trophy"></i> Performance Categories</h3>
              <p>Get categorized feedback on your typing performance level.</p>
            </div>
            <div className="wpm-functionality-item">
              <h3><i className="fas fa-history"></i> Progress Tracking</h3>
              <p>Track your improvement over time with detailed performance metrics.</p>
            </div>
            <div className="wpm-functionality-item">
              <h3><i className="fas fa-mobile-alt"></i> Responsive Design</h3>
              <p>Works seamlessly on desktop, tablet, and mobile devices.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="applications">
          <h2>Applications of WPM Testing</h2>
          <div className="wpm-applications-grid">
            <div className="wpm-application-item">
              <h3><i className="fas fa-user-graduate"></i> Education</h3>
              <p>Students use WPM testing to improve typing skills for academic assignments and computer literacy.</p>
            </div>
            <div className="wpm-application-item">
              <h3><i className="fas fa-building"></i> Employment</h3>
              <p>Employers use WPM tests to assess candidates for data entry, administrative, and writing positions.</p>
            </div>
            <div className="wpm-application-item">
              <h3><i className="fas fa-code"></i> Programming</h3>
              <p>Developers benefit from faster typing for coding, documentation, and technical writing tasks.</p>
            </div>
            <div className="wpm-application-item">
              <h3><i className="fas fa-pen-fancy"></i> Content Creation</h3>
              <p>Writers, bloggers, and content creators use WPM testing to improve writing efficiency.</p>
            </div>
            <div className="wpm-application-item">
              <h3><i className="fas fa-headset"></i> Transcription</h3>
              <p>Transcriptionists and court reporters require high WPM for accurate and timely work.</p>
            </div>
            <div className="wpm-application-item">
              <h3><i className="fas fa-gamepad"></i> Gaming</h3>
              <p>Gamers use WPM testing to improve communication speed in online games and streaming.</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection faqs={faqData} />
        <FeedbackForm />
    
    </ToolPageLayout>
  );
};

export default WPMCalculator;
