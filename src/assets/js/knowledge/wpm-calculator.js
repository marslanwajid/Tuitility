// WPM Calculator Logic
class WPMCalculatorLogic {
  constructor() {
    this.currentText = "";
    this.paragraphs = [];
    this.currentParagraphIndex = 0;
    this.timeLeft = 60;
    this.timer = null;
    this.isTestActive = false;
    this.startTime = 0;
    this.wordCount = 0;
    this.correctCharacters = 0;
    this.totalCharacters = 0;
    this.testDuration = 60;
    
    this.sampleTexts = [
      `The art of programming is a journey that never truly ends. As technology evolves, programmers must constantly adapt and learn new skills. Writing clean, efficient code is not just about making things work; it's about making them work elegantly. Good programmers write code that humans can understand, knowing that maintenance and readability are crucial for long-term success.`,

      `Artificial intelligence and machine learning are revolutionizing the way we interact with technology. From voice assistants to autonomous vehicles, AI systems are becoming increasingly sophisticated. These technologies analyze vast amounts of data to identify patterns and make predictions, helping us make better decisions in fields ranging from healthcare to climate science.`,

      `The history of computing dates back to ancient civilizations using abacuses for calculations. However, the modern computer age began with pioneers like Alan Turing and Ada Lovelace. Their groundbreaking work laid the foundation for today's digital revolution. The development of integrated circuits and microprocessors in the 20th century transformed computers from room-sized machines to portable devices.`,

      `Cybersecurity is more important than ever in our interconnected world. As our reliance on digital systems grows, so does the need to protect sensitive information. Hackers and cybercriminals constantly develop new methods to breach security measures, making it essential for organizations to maintain robust defense mechanisms and stay updated with the latest security protocols.`,

      `The internet of things (IoT) has created a network where everyday objects can communicate and share data. Smart homes, wearable devices, and industrial sensors are just a few examples of IoT applications. This interconnectivity brings convenience but also raises important questions about privacy, security, and the ethical use of personal data.`,

      `Cloud computing has transformed how businesses and individuals store and process data. Instead of maintaining expensive local infrastructure, organizations can now access scalable resources on demand. This shift has democratized access to powerful computing capabilities and enabled new business models and innovations.`,

      `Video game development combines artistry with technical expertise. Game designers must create engaging narratives while implementing complex physics engines and graphics rendering. The gaming industry continues to push technological boundaries, from realistic 3D environments to virtual reality experiences that blur the line between digital and physical worlds.`,

      `Environmental technology is crucial in addressing climate change. Renewable energy systems, smart grids, and energy-efficient buildings demonstrate how technology can help create a sustainable future. Innovation in this field requires understanding both environmental science and engineering principles.`,

      `The field of quantum computing promises to revolutionize computation by harnessing quantum mechanical phenomena. Unlike classical computers that use bits, quantum computers use quantum bits or qubits. This technology could solve complex problems that are currently impossible for traditional computers to handle efficiently.`,

      `Mobile app development has become essential in our smartphone-centric world. Developers must consider user experience, performance optimization, and cross-platform compatibility. The app ecosystem continues to grow, creating opportunities for innovative solutions to everyday problems.`,

      `Data science combines statistical analysis with programming to extract meaningful insights from large datasets. Machine learning algorithms can identify patterns that humans might miss, leading to breakthroughs in fields like medical diagnosis and financial forecasting. The ability to process and analyze big data has become a crucial competitive advantage.`,

      `Web development evolves rapidly with new frameworks and technologies emerging regularly. Modern websites must be responsive, accessible, and secure while providing seamless user experiences. Frontend frameworks like React and Angular have revolutionized how we build interactive web applications.`,

      `Digital photography has transformed how we capture and share moments. Modern cameras use sophisticated algorithms for features like face detection and image stabilization. Post-processing software allows photographers to enhance images in ways that were impossible in the darkroom era.`,

      `Blockchain technology extends far beyond cryptocurrencies. Its decentralized nature and immutable record-keeping have applications in supply chain management, voting systems, and digital identity verification. Smart contracts can automate complex transactions without intermediaries.`,

      `The evolution of human-computer interaction has made technology more intuitive and accessible. From command-line interfaces to touch screens and voice commands, the way we interact with devices continues to become more natural. Understanding human psychology and ergonomics is crucial in designing user interfaces.`,
    ];

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Get elements with WPM-specific IDs
    const textDisplay = document.getElementById("wpm-text-display");
    const typingInput = document.getElementById("wpm-typing-input");
    const startButton = document.getElementById("wpm-start-test");
    const resetButton = document.getElementById("wpm-reset-test");
    const timeDisplay = document.getElementById("wpm-time");
    const wpmDisplay = document.getElementById("wpm-wpm");
    const accuracyDisplay = document.getElementById("wpm-accuracy");
    const resultSection = document.getElementById("wpm-result-section");

    // Debug log to check if elements are found
    console.log("WPM Calculator Elements:", {
      textDisplay,
      typingInput,
      startButton,
      resetButton,
      timeDisplay,
      wpmDisplay,
      accuracyDisplay,
      resultSection,
    });

    if (!textDisplay || !typingInput || !startButton || !resetButton) {
      console.warn("WPM Calculator: Some required elements not found");
      return;
    }

    // Store references
    this.elements = {
      textDisplay,
      typingInput,
      startButton,
      resetButton,
      timeDisplay,
      wpmDisplay,
      accuracyDisplay,
      resultSection
    };

    // Event listeners
    startButton.addEventListener("click", () => this.startTest());
    resetButton.addEventListener("click", () => this.initializeTest());
    
    typingInput.addEventListener('input', (e) => this.handleTypingInput(e));
    typingInput.addEventListener('paste', (e) => e.preventDefault()); // Prevent pasting

    // Initialize the test
    this.initializeTest();
  }

  getRandomParagraphs() {
    // Get 3 random paragraphs
    const selectedTexts = [];
    const usedIndexes = new Set();
    
    while (selectedTexts.length < 3) {
      const randomIndex = Math.floor(Math.random() * this.sampleTexts.length);
      if (!usedIndexes.has(randomIndex)) {
        selectedTexts.push(this.sampleTexts[randomIndex]);
        usedIndexes.add(randomIndex);
      }
    }
    
    return selectedTexts;
  }

  initializeTest() {
    console.log("WPM Calculator: Initializing test...");
    
    if (!this.elements) return;

    this.elements.textDisplay.style.display = 'none';
    this.elements.typingInput.value = '';
    this.timeLeft = this.testDuration;
    this.isTestActive = false;
    this.wordCount = 0;
    this.correctCharacters = 0;
    this.totalCharacters = 0;
    this.currentParagraphIndex = 0;
    this.paragraphs = this.getRandomParagraphs();
    this.currentText = this.paragraphs[this.currentParagraphIndex];

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.updateDisplays();
    this.elements.startButton.disabled = false;
    this.elements.resetButton.disabled = true;
    this.elements.typingInput.disabled = true;
    
    if (this.elements.resultSection) {
      this.elements.resultSection.style.display = 'none';
    }
    
    this.elements.textDisplay.classList.remove('visible');
    setTimeout(() => {
      this.elements.textDisplay.style.display = 'none';
    }, 300);
  }

  startTest() {
    console.log("WPM Calculator: Starting test...");
    
    if (!this.elements) return;

    if (this.timer) {
      clearInterval(this.timer);
    }

    // Show first paragraph
    this.currentText = this.paragraphs[this.currentParagraphIndex];
    this.elements.textDisplay.textContent = this.currentText;
    this.elements.textDisplay.style.display = 'block';
    
    requestAnimationFrame(() => {
      this.elements.textDisplay.classList.add('visible');
    });

    this.isTestActive = true;
    this.startTime = new Date().getTime();
    this.elements.typingInput.disabled = false;
    this.elements.typingInput.value = '';
    this.elements.startButton.disabled = true;
    this.elements.resetButton.disabled = false;
    
    // Focus and scroll to typing area when test starts
    requestAnimationFrame(() => {
      this.elements.typingInput.focus();
      this.scrollToTypingArea();
    });

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateDisplays();

      if (this.timeLeft <= 0) {
        this.endTest();
      }
    }, 1000);
  }

  checkParagraphCompletion(inputText) {
    // Check if current paragraph is completed correctly
    if (inputText === this.currentText) {
      this.currentParagraphIndex++;
      
      // If there are more paragraphs, show the next one
      if (this.currentParagraphIndex < this.paragraphs.length) {
        this.currentText = this.paragraphs[this.currentParagraphIndex];
        this.elements.textDisplay.textContent = this.currentText;
        this.elements.typingInput.value = '';
        
        // Add visual feedback
        this.elements.textDisplay.style.backgroundColor = '#f0fff0';
        setTimeout(() => {
          this.elements.textDisplay.style.backgroundColor = '#f7f9fc';
        }, 500);

        // Scroll to typing area when new paragraph starts
        requestAnimationFrame(() => {
          this.scrollToTypingArea();
        });
      } else {
        // All paragraphs completed
        this.endTest();
      }
    }
  }

  scrollToTypingArea() {
    if (!this.elements) return;

    const offset = 100; // Adjust this value to control scroll position
    const rect = this.elements.typingInput.getBoundingClientRect();
    const isInView = (
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );

    if (!isInView) {
      window.scrollTo({
        top: this.elements.typingInput.offsetTop - offset,
        behavior: 'smooth'
      });
    }
  }

  checkWords(inputText) {
    if (!this.elements) return;

    const inputWords = inputText.split(' ');
    const targetWords = this.currentText.split(' ');
    let html = '';
    let currentPosition = 0;
    
    // Process each word
    targetWords.forEach((word, wordIndex) => {
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
      for (let i = 0; i < word.length; i++) {
        if (currentPosition < inputText.length) {
          // If we're still within the current input word
          if (i < inputWord.length) {
            if (inputWord[i] === word[i]) {
              html += `<span class="correct">${word[i]}</span>`;
            } else {
              html += `<span class="incorrect">${word[i]}</span>`;
            }
          } else {
            // If the input word is shorter than the target word
            html += `<span class="incorrect">${word[i]}</span>`;
          }
        } else {
          // If we're beyond the current input
          html += `<span class="remaining">${word[i]}</span>`;
        }
        currentPosition++;
      }
      
      // If input word is longer than target word, don't count extra characters
      if (inputWord.length > word.length) {
        currentPosition += inputWord.length - word.length;
      }
    });
    
    this.elements.textDisplay.innerHTML = html;
  }

  handleTypingInput(event) {
    if (!this.isTestActive || !this.elements) return;

    const inputText = this.elements.typingInput.value;
    
    // Prevent any form of pasting
    if (inputText.length > this.currentText.length) {
      this.elements.typingInput.value = inputText.substring(0, this.currentText.length);
      return;
    }

    const inputWords = inputText.trim().split(/\s+/);
    const targetWords = this.currentText.trim().split(/\s+/);
    
    this.totalCharacters = inputText.length;
    this.correctCharacters = 0;
    this.wordCount = inputWords.filter(word => word.length > 0).length;

    // Check character accuracy and update display
    this.checkWords(inputText);
    
    // Count correct characters word by word
    inputWords.forEach((word, index) => {
      if (index < targetWords.length) {
        const targetWord = targetWords[index];
        for (let i = 0; i < Math.min(word.length, targetWord.length); i++) {
          if (word[i] === targetWord[i]) {
            this.correctCharacters++;
          }
        }
        // Count space after word if it exists
        if (index < inputWords.length - 1) {
          this.correctCharacters++;
        }
      }
    });

    // Check if paragraph is completed
    this.checkParagraphCompletion(inputText);
    this.updateDisplays();
    
    // Auto-scroll when typing reaches bottom of viewport
    this.scrollToTypingArea();
  }

  endTest() {
    console.log("WPM Calculator: Ending test...");
    
    if (!this.elements) return;

    clearInterval(this.timer);
    this.isTestActive = false;
    this.elements.typingInput.disabled = true;
    this.elements.textDisplay.style.display = 'none';

    const timeTaken = (new Date().getTime() - this.startTime) / 1000;
    const wpm = Math.round((this.wordCount / timeTaken) * 60);
    const accuracy = Math.round((this.correctCharacters / this.totalCharacters) * 100);

    this.showResults(wpm, accuracy);
  }

  updateDisplays() {
    if (!this.elements) return;

    if (this.elements.timeDisplay) {
      this.elements.timeDisplay.textContent = `Time: ${this.timeLeft}s`;
    }
    
    if (this.elements.wpmDisplay) {
      this.elements.wpmDisplay.textContent = `WPM: ${this.calculateCurrentWPM()}`;
    }
    
    if (this.elements.accuracyDisplay) {
      this.elements.accuracyDisplay.textContent = `Accuracy: ${this.calculateAccuracy()}%`;
    }
  }

  calculateCurrentWPM() {
    if (!this.startTime) return 0;
    const timeTaken = (new Date().getTime() - this.startTime) / 1000;
    return Math.round((this.wordCount / timeTaken) * 60);
  }

  calculateAccuracy() {
    if (this.totalCharacters === 0) return 0;
    return Math.round((this.correctCharacters / this.totalCharacters) * 100);
  }

  showResults(wpm, accuracy) {
    if (!this.elements || !this.elements.resultSection) return;

    const category = this.getWPMCategory(wpm);
    
    this.elements.resultSection.style.display = 'block';
    
    // Update result content
    const resultValue = this.elements.resultSection.querySelector('.wpm-result-value');
    const resultCategory = this.elements.resultSection.querySelector('.wpm-result-category');
    
    if (resultValue) {
      resultValue.textContent = `${wpm} WPM`;
    }
    
    if (resultCategory) {
      resultCategory.textContent = category;
    }

    // Update detailed results
    const accuracyValue = this.elements.resultSection.querySelector('.wpm-result-item:nth-child(1) .wpm-result-value-small');
    const wordsValue = this.elements.resultSection.querySelector('.wpm-result-item:nth-child(2) .wpm-result-value-small');
    const charactersValue = this.elements.resultSection.querySelector('.wpm-result-item:nth-child(3) .wpm-result-value-small');
    const timeValue = this.elements.resultSection.querySelector('.wpm-result-item:nth-child(4) .wpm-result-value-small');

    if (accuracyValue) accuracyValue.textContent = `${accuracy}%`;
    if (wordsValue) wordsValue.textContent = this.wordCount;
    if (charactersValue) charactersValue.textContent = this.totalCharacters;
    if (timeValue) timeValue.textContent = `${this.testDuration - this.timeLeft}s`;

    // Scroll to results
    this.elements.resultSection.scrollIntoView({ behavior: 'smooth' });
  }

  getWPMCategory(wpm) {
    if (wpm >= 120) return 'Expert';
    if (wpm >= 91) return 'Professional';
    if (wpm >= 71) return 'Excellent';
    if (wpm >= 51) return 'Good';
    if (wpm >= 31) return 'Average';
    return 'Beginner';
  }

  setTestDuration(duration) {
    this.testDuration = duration;
    this.timeLeft = duration;
  }
}

// Initialize the WPM Calculator when the script loads
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if we're on the WPM calculator page
  if (document.getElementById("wpm-text-display")) {
    window.wpmCalculator = new WPMCalculatorLogic();
  }
});
