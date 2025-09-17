// MBTI Calculator Logic
class MBTICalculatorLogic {
  constructor() {
    this.currentQuestion = 0;
    this.answers = [];
    this.questions = this.getQuestions();
    this.scores = {
      EI: 0, // Extraversion vs Introversion
      SN: 0, // Sensing vs Intuition
      TF: 0, // Thinking vs Feeling
      JP: 0  // Judging vs Perceiving
    };
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadPDFLibraries();
  }

  initializeElements() {
    this.introSection = document.getElementById('mbti-intro-section');
    this.questionSection = document.getElementById('mbti-question-section');
    this.resultSection = document.getElementById('mbti-result-section');
    this.questionText = document.getElementById('mbti-question-text');
    this.questionCounter = document.getElementById('mbti-question-counter');
    this.progressFill = document.getElementById('mbti-progress-fill');
    this.nextButton = document.getElementById('mbti-next-question');
    this.startButton = document.getElementById('mbti-start-test');
    this.downloadButton = document.getElementById('mbti-download-result');
    this.restartButton = document.getElementById('mbti-restart-test');
  }

  attachEventListeners() {
    if (this.startButton) {
      this.startButton.addEventListener('click', () => this.startTest());
    }
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextQuestion());
    }
    if (this.downloadButton) {
      this.downloadButton.addEventListener('click', () => this.downloadResults());
    }
    if (this.restartButton) {
      this.restartButton.addEventListener('click', () => this.restartTest());
    }
    
    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="mbti-answer"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (this.nextButton) {
          this.nextButton.disabled = false;
        }
      });
    });
  }

  getQuestions() {
    return [
      // Extraversion (E) vs. Introversion (I) Questions
      { text: "I feel energized after spending time with a group of people", dimension: "EI", direction: "E" },
      { text: "I prefer one-on-one conversations as compared to group activities", dimension: "EI", direction: "I" },
      { text: "I often take initiative in social situations", dimension: "EI", direction: "E" },
      { text: "I need time alone to recharge after social activities", dimension: "EI", direction: "I" },
      { text: "I enjoy being the center of attention", dimension: "EI", direction: "E" },
      { text: "I prefer to think before speaking", dimension: "EI", direction: "I" },
      { text: "I make friends easily and enjoy meeting new people", dimension: "EI", direction: "E" },
      { text: "I prefer working independently as compared to working in teams", dimension: "EI", direction: "I" },
      { text: "I often speak up in group discussions", dimension: "EI", direction: "E" },
      { text: "I prefer quiet, solitary activities", dimension: "EI", direction: "I" },
      { text: "I get excited about social events and gatherings", dimension: "EI", direction: "E" },
      { text: "I find it draining to be in busy social situations", dimension: "EI", direction: "I" },
      { text: "I tend to be outgoing and sociable", dimension: "EI", direction: "E" },
      { text: "I prefer deep, one-on-one conversations", dimension: "EI", direction: "I" },
      { text: "I feel comfortable in crowds and parties", dimension: "EI", direction: "E" },
      { text: "I need private time to process my thoughts and feelings", dimension: "EI", direction: "I" },
      { text: "I enjoy group activities and team projects", dimension: "EI", direction: "E" },
      
      // Sensing (S) vs. Intuition (N) Questions
      { text: "I focus more on present realities than future possibilities", dimension: "SN", direction: "S" },
      { text: "I enjoy thinking about abstract theories and concepts", dimension: "SN", direction: "N" },
      { text: "I trust my direct experiences more than theoretical possibilities", dimension: "SN", direction: "S" },
      { text: "I enjoy imagining different scenarios and possibilities", dimension: "SN", direction: "N" },
      { text: "I prefer practical, hands-on learning", dimension: "SN", direction: "S" },
      { text: "I often think about the bigger picture and future implications", dimension: "SN", direction: "N" },
      { text: "I rely on my five senses and concrete facts", dimension: "SN", direction: "S" },
      { text: "I enjoy exploring new ideas and possibilities", dimension: "SN", direction: "N" },
      { text: "I prefer step-by-step instructions", dimension: "SN", direction: "S" },
      { text: "I trust my hunches and intuitive insights", dimension: "SN", direction: "N" },
      { text: "I focus on details and specific facts", dimension: "SN", direction: "S" },
      { text: "I enjoy metaphors and analogies", dimension: "SN", direction: "N" },
      { text: "I prefer traditional and proven methods", dimension: "SN", direction: "S" },
      { text: "I enjoy discovering patterns and hidden meanings", dimension: "SN", direction: "N" },
      { text: "I trust what I can see and touch", dimension: "SN", direction: "S" },
      { text: "I enjoy thinking about possibilities for the future", dimension: "SN", direction: "N" },
      { text: "I prefer working with concrete facts and details", dimension: "SN", direction: "S" },
      
      // Thinking (T) vs. Feeling (F) Questions
      { text: "I make decisions based on logical analysis", dimension: "TF", direction: "T" },
      { text: "I consider how others will feel when making decisions", dimension: "TF", direction: "F" },
      { text: "I value truth over tact", dimension: "TF", direction: "T" },
      { text: "I am sensitive to others' emotions", dimension: "TF", direction: "F" },
      { text: "I prefer objective criteria when making decisions", dimension: "TF", direction: "T" },
      { text: "I consider the impact on people when making choices", dimension: "TF", direction: "F" },
      { text: "I tend to be direct and straightforward", dimension: "TF", direction: "T" },
      { text: "I value harmony in relationships", dimension: "TF", direction: "F" },
      { text: "I focus on efficiency and effectiveness", dimension: "TF", direction: "T" },
      { text: "I am empathetic to others' situations", dimension: "TF", direction: "F" },
      { text: "I prefer to analyze problems objectively", dimension: "TF", direction: "T" },
      { text: "I make decisions based on personal values", dimension: "TF", direction: "F" },
      { text: "I value competence over cooperation", dimension: "TF", direction: "T" },
      { text: "I enjoy helping others achieve their goals", dimension: "TF", direction: "F" },
      { text: "I prefer clear rules and guidelines", dimension: "TF", direction: "T" },
      { text: "I consider everyone's feelings in group situations", dimension: "TF", direction: "F" },
      { text: "I value logic over emotions in decision-making", dimension: "TF", direction: "T" },
      { text: "I enjoy supporting others emotionally", dimension: "TF", direction: "F" },
      
      // Judging (J) vs. Perceiving (P) Questions
      { text: "I prefer to have things planned and organized", dimension: "JP", direction: "J" },
      { text: "I enjoy being spontaneous and flexible", dimension: "JP", direction: "P" },
      { text: "I like to have clear deadlines and schedules", dimension: "JP", direction: "J" },
      { text: "I prefer to keep my options open", dimension: "JP", direction: "P" },
      { text: "I enjoy having a structured routine", dimension: "JP", direction: "J" },
      { text: "I adapt easily to change and new situations", dimension: "JP", direction: "P" },
      { text: "I like to make decisions and stick to them", dimension: "JP", direction: "J" },
      { text: "I prefer to go with the flow", dimension: "JP", direction: "P" },
      { text: "I feel stressed when things are disorganized", dimension: "JP", direction: "J" },
      { text: "I enjoy exploring different possibilities", dimension: "JP", direction: "P" },
      { text: "I prefer to complete one project before starting another", dimension: "JP", direction: "J" },
      { text: "I like to stay open to new information", dimension: "JP", direction: "P" },
      { text: "I enjoy creating and following schedules", dimension: "JP", direction: "J" },
      { text: "I prefer flexibility over structure", dimension: "JP", direction: "P" },
      { text: "I like to have things settled and decided", dimension: "JP", direction: "J" },
      { text: "I enjoy improvising and adapting", dimension: "JP", direction: "P" },
      { text: "I prefer clear expectations and guidelines", dimension: "JP", direction: "J" },
      { text: "I value predictability and stability", dimension: "JP", direction: "J" }
    ];
  }

  startTest() {
    if (this.introSection) {
      this.introSection.classList.remove('active');
      this.introSection.classList.add('hidden');
    }
    if (this.questionSection) {
      this.questionSection.classList.remove('hidden');
      this.questionSection.classList.add('active');
    }
    this.displayQuestion();
  }

  displayQuestion() {
    const question = this.questions[this.currentQuestion];
    if (this.questionText) {
      this.questionText.textContent = question.text;
    }
    if (this.questionCounter) {
      this.questionCounter.textContent = `Question ${this.currentQuestion + 1}/${this.questions.length}`;
    }
    if (this.progressFill) {
      this.progressFill.style.width = `${((this.currentQuestion + 1) / this.questions.length) * 100}%`;
    }
    
    // Reset radio buttons
    document.querySelectorAll('input[name="mbti-answer"]').forEach(radio => {
      radio.checked = false;
    });
    if (this.nextButton) {
      this.nextButton.disabled = true;
    }
  }

  nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="mbti-answer"]:checked');
    if (!selectedAnswer) return;

    const question = this.questions[this.currentQuestion];
    const answerValue = parseInt(selectedAnswer.value);
    
    // Calculate score based on 5-point scale (1-5)
    // 1 & 2 favor the first preference, 4 & 5 favor the second preference, 3 is neutral
    const scoreChange = (() => {
      if (answerValue === 1) return 2;
      if (answerValue === 2) return 1;
      if (answerValue === 4) return -1;
      if (answerValue === 5) return -2;
      return 0; // neutral
    })();

    // Apply score change based on question direction
    if (question.direction === 'E' || question.direction === 'S' || 
        question.direction === 'T' || question.direction === 'J') {
      this.scores[question.dimension] += scoreChange;
    } else {
      this.scores[question.dimension] -= scoreChange;
    }

    this.answers.push({
      question: question.text,
      answer: answerValue,
      dimension: question.dimension,
      direction: question.direction
    });

    // Reset radio buttons
    selectedAnswer.checked = false;
    if (this.nextButton) {
      this.nextButton.disabled = true;
    }

    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
      this.displayQuestion();
    } else {
      this.showResults();
    }
  }

  calculateType() {
    // Calculate percentages for each dimension
    const getPreference = (score, dimension) => {
      // Normalize score to percentage
      const total = this.answers.filter(a => a.dimension === dimension).length * 2; // maximum possible score
      const percentage = ((score + total) / (total * 2)) * 100;
      
      // Determine preference based on percentage
      switch(dimension) {
        case 'EI': return percentage < 50 ? 'E' : 'I';
        case 'SN': return percentage < 50 ? 'S' : 'N';
        case 'TF': return percentage < 50 ? 'T' : 'F';
        case 'JP': return percentage < 50 ? 'J' : 'P';
      }
    };

    return [
      getPreference(this.scores.EI, 'EI'),
      getPreference(this.scores.SN, 'SN'),
      getPreference(this.scores.TF, 'TF'),
      getPreference(this.scores.JP, 'JP')
    ].join('');
  }

  showResults() {
    const personalityType = this.calculateType();
    const typeInfo = this.getTypeDescription(personalityType);
    const cognitiveInfo = this.getCognitiveFunctions(personalityType);
    const compatibilityInfo = this.getCompatibilityInfo(personalityType);
    const famousPeople = this.getFamousPeople(personalityType);
    const detailedAnalysis = this.getDetailedAnalysis(personalityType);
    
    if (document.getElementById('mbti-personality-type')) {
      document.getElementById('mbti-personality-type').innerHTML = `
        <h2>${personalityType} - ${typeInfo.title}</h2>
      `;
    }
    
    if (document.getElementById('mbti-type-description')) {
      document.getElementById('mbti-type-description').innerHTML = `
        <div class="mbti-type-description-content">
          ${typeInfo.description.replace(/\n/g, '<br>')}
          
          <div class="mbti-cognitive-functions">
            <h3>Your Cognitive Functions</h3>
            ${cognitiveInfo.html}
          </div>

          <div class="mbti-compatibility">
            <h3>Relationship Compatibility</h3>
            ${compatibilityInfo}
          </div>

          <div class="mbti-famous-people">
            <h3>Famous ${personalityType}s</h3>
            ${famousPeople}
          </div>

          <div class="mbti-detailed-analysis">
            <h3>Detailed Type Analysis</h3>
            ${detailedAnalysis}
          </div>
        </div>
      `;
    }
    
    // Update dimension scores with percentages and explanations
    this.updateDetailedScores();
    
    if (this.questionSection) {
      this.questionSection.classList.remove('active');
      this.questionSection.classList.add('hidden');
    }
    if (this.resultSection) {
      this.resultSection.classList.remove('hidden');
      this.resultSection.classList.add('active');
    }
  }

  updateDetailedScores() {
    const dimensions = {
      EI: {
        label: 'Extraversion (E) - Introversion (I)',
        explanation: score => {
          const total = this.answers.filter(a => a.dimension === 'EI').length * 2;
          const percentage = ((score + total) / (total * 2)) * 100;
          return percentage > 50 
            ? `You are ${Math.round(percentage)}% introverted, meaning you prefer to recharge through solitary activities.`
            : `You are ${Math.round(100-percentage)}% extraverted, meaning you gain energy from social interaction.`;
        }
      },
      SN: {
        label: 'Sensing (S) - Intuition (N)',
        explanation: score => {
          const total = this.answers.filter(a => a.dimension === 'SN').length * 2;
          const percentage = ((score + total) / (total * 2)) * 100;
          return percentage > 50
            ? `You are ${Math.round(percentage)}% intuitive, focusing on patterns and possibilities.`
            : `You are ${Math.round(100-percentage)}% sensing, preferring concrete facts and details.`;
        }
      },
      TF: {
        label: 'Thinking (T) - Feeling (F)',
        explanation: score => {
          const total = this.answers.filter(a => a.dimension === 'TF').length * 2;
          const percentage = ((score + total) / (total * 2)) * 100;
          return percentage > 50
            ? `You are ${Math.round(percentage)}% feeling-oriented, prioritizing harmony and personal values.`
            : `You are ${Math.round(100-percentage)}% thinking-oriented, preferring logical analysis.`;
        }
      },
      JP: {
        label: 'Judging (J) - Perceiving (P)',
        explanation: score => {
          const total = this.answers.filter(a => a.dimension === 'JP').length * 2;
          const percentage = ((score + total) / (total * 2)) * 100;
          return percentage > 50
            ? `You are ${Math.round(percentage)}% perceiving, preferring flexibility and spontaneity.`
            : `You are ${Math.round(100-percentage)}% judging, favoring structure and planning.`;
        }
      }
    };

    Object.entries(this.scores).forEach(([dimension, score]) => {
      const element = document.getElementById(`mbti-${dimension.toLowerCase()}-score`);
      if (element) {
        const total = this.answers.filter(a => a.dimension === dimension).length * 2;
        const percentage = ((score + total) / (total * 2)) * 100;
        
        // Update the score bar width
        element.style.width = `${percentage}%`;
        
        // Add or update the score explanation
        const container = element.parentElement.parentElement;
        let explanationElement = container.querySelector('.mbti-score-explanation');
        if (!explanationElement) {
          explanationElement = document.createElement('div');
          explanationElement.className = 'mbti-score-explanation';
          container.appendChild(explanationElement);
        }
        explanationElement.textContent = dimensions[dimension].explanation(score);
      }
    });
  }

  getTypeDescription(type) {
    const descriptions = {
      'INTJ': {
        title: 'The Architect',
        description: `As an INTJ, you are a strategic thinker with a rare combination of imagination and reliability. Your primary mode of living focuses on gathering information to create far-reaching insights and ideas.`,
        strengths: [
          'Highly analytical and strategic thinking',
          'Strong ability to predict long-term outcomes',
          'Independent and decisive',
          'High standards and drive for improvement'
        ],
        opportunities: [
          'May need to develop better emotional intelligence',
          'Can work on being more patient with others',
          'Could benefit from more flexibility in approaches'
        ],
        careers: [
          'Strategic Planning',
          'Scientific Research',
          'Systems Engineering',
          'Business Analysis',
          'Academic Research'
        ]
      },
      'ESFJ': {
        title: 'The Consul',
        description: `As an ESFJ, you are warm-hearted, conscientious, and cooperative. You have a strong desire to help others and create harmony in your environment.`,
        strengths: [
          'Reliable and organized',
          'Strong interpersonal skills',
          'Practical and grounded',
          'Supportive and caring'
        ],
        opportunities: [
          'May need to be more assertive',
          'Can work on handling criticism',
          'Could benefit from more independence'
        ],
        careers: [
          'Teaching',
          'Healthcare Administration',
          'Human Resources',
          'Social Work',
          'Customer Service Management'
        ]
      }
    };

    return descriptions[type] || {
      title: 'Personality Type',
      description: 'Detailed description will be added soon.',
      strengths: ['Information will be added soon.'],
      opportunities: ['Information will be added soon.'],
      careers: ['Information will be added soon.']
    };
  }

  getCognitiveFunctions(type) {
    const functions = {
      'INTJ': {
        dominant: 'Introverted Intuition (Ni)',
        auxiliary: 'Extraverted Thinking (Te)',
        tertiary: 'Introverted Feeling (Fi)',
        inferior: 'Extraverted Sensing (Se)',
        html: `
          <div class="mbti-function-stack">
            <p><strong>Dominant:</strong> Introverted Intuition (Ni) - Focuses on understanding complex patterns and future implications</p>
            <p><strong>Auxiliary:</strong> Extraverted Thinking (Te) - Implements logical systems and efficient solutions</p>
            <p><strong>Tertiary:</strong> Introverted Feeling (Fi) - Develops personal values and moral judgments</p>
            <p><strong>Inferior:</strong> Extraverted Sensing (Se) - Experiences and interacts with the immediate environment</p>
          </div>
        `
      },
      'ESFJ': {
        dominant: 'Extraverted Feeling (Fe)',
        auxiliary: 'Introverted Sensing (Si)',
        tertiary: 'Extraverted Intuition (Ne)',
        inferior: 'Introverted Thinking (Ti)',
        html: `
          <div class="mbti-function-stack">
            <p><strong>Dominant:</strong> Extraverted Feeling (Fe) - Focuses on creating harmony and meeting others' needs</p>
            <p><strong>Auxiliary:</strong> Introverted Sensing (Si) - Relies on past experiences and established methods</p>
            <p><strong>Tertiary:</strong> Extraverted Intuition (Ne) - Explores possibilities and new perspectives</p>
            <p><strong>Inferior:</strong> Introverted Thinking (Ti) - Analyzes and makes logical decisions</p>
          </div>
        `
      }
    };
    return functions[type] || {
      dominant: 'Information not available',
      auxiliary: 'Information not available',
      tertiary: 'Information not available',
      inferior: 'Information not available',
      html: '<p>Cognitive functions information for this type will be added soon.</p>'
    };
  }

  getCompatibilityInfo(type) {
    const compatibility = {
      'INTJ': `
        <div class="mbti-compatibility-info">
          <h4>Best Matches:</h4>
          <ul>
            <li>ENFP - Complementary intuition with balanced extroversion/introversion</li>
            <li>ENTP - Strong intellectual connection and shared analytical approach</li>
          </ul>
          <h4>Good Matches:</h4>
          <ul>
            <li>INFJ - Shared intuitive understanding and depth</li>
            <li>ENTJ - Similar thinking patterns and goals</li>
          </ul>
          <h4>Potential Challenges:</h4>
          <ul>
            <li>Sensing types may find INTJ too theoretical</li>
            <li>Feeling types may find INTJ too logical and direct</li>
          </ul>
        </div>
      `,
      'ESFJ': `
        <div class="mbti-compatibility-info">
          <h4>Best Matches:</h4>
          <ul>
            <li>ISFP - Balanced sensing and feeling functions</li>
            <li>ISTP - Complementary cognitive functions</li>
          </ul>
          <h4>Good Matches:</h4>
          <ul>
            <li>ESTJ - Shared values and communication style</li>
            <li>ISFJ - Similar approaches to life</li>
          </ul>
          <h4>Potential Challenges:</h4>
          <ul>
            <li>May struggle with highly abstract types</li>
            <li>Need patience with more independent types</li>
          </ul>
        </div>
      `
    };
    return compatibility[type] || 'Compatibility information for this type will be added soon.';
  }

  getFamousPeople(type) {
    const famousPeople = {
      'INTJ': `
        <ul class="mbti-famous-people-list">
          <li>Elon Musk - Entrepreneur and Innovator</li>
          <li>Stephen Hawking - Theoretical Physicist</li>
          <li>Michelle Obama - Former First Lady and Author</li>
          <li>Mark Zuckerberg - Facebook Founder</li>
          <li>Nikola Tesla - Inventor and Engineer</li>
        </ul>
      `,
      'ESFJ': `
        <ul class="mbti-famous-people-list">
          <li>Taylor Swift - Singer-Songwriter</li>
          <li>Bill Clinton - Former US President</li>
          <li>Anne Hathaway - Actress</li>
          <li>Sam Walton - Walmart Founder</li>
          <li>Hugh Jackman - Actor</li>
        </ul>
      `
    };
    return famousPeople[type] || '<p>Famous people information for this type will be added soon.</p>';
  }

  getDetailedAnalysis(type) {
    const analysis = {
      'INTJ': `
        <div class="mbti-detailed-analysis-content">
          <h4>How INTJs Process Information:</h4>
          <p>INTJs use their dominant Introverted Intuition (Ni) to process information by looking for underlying patterns and generating insights about future implications. This is supported by their auxiliary Extraverted Thinking (Te), which helps them create efficient systems and logical frameworks.</p>

          <h4>Communication Style:</h4>
          <p>INTJs typically communicate in a direct, logical manner, focusing on efficiency and accuracy over emotional sensitivity. They prefer deep, meaningful conversations about ideas and concepts rather than small talk.</p>

          <h4>In the Workplace:</h4>
          <ul>
            <li>Excel at strategic planning and system design</li>
            <li>Prefer working independently or in small, competent teams</li>
            <li>Value efficiency and logical solutions</li>
            <li>May struggle with office politics and emotional dynamics</li>
          </ul>

          <h4>Personal Growth Suggestions:</h4>
          <ul>
            <li>Practice active listening and emotional validation</li>
            <li>Develop patience with those who process information differently</li>
            <li>Learn to appreciate and engage with present-moment experiences</li>
            <li>Work on expressing feelings and connecting emotionally</li>
          </ul>
        </div>
      `,
      'ESFJ': `
        <div class="mbti-detailed-analysis-content">
          <h4>How ESFJs Process Information:</h4>
          <p>ESFJs primarily use Extraverted Feeling (Fe) to understand and respond to others' emotions and needs. Their Introverted Sensing (Si) helps them remember and apply past experiences to current situations.</p>

          <h4>Communication Style:</h4>
          <p>ESFJs are warm and engaging communicators who excel at creating harmony in groups. They are attentive listeners and skilled at reading emotional cues.</p>

          <h4>In the Workplace:</h4>
          <ul>
            <li>Natural team players and organizers</li>
            <li>Excel at creating positive work environments</li>
            <li>Strong attention to detail and deadlines</li>
            <li>Value structure and clear expectations</li>
          </ul>

          <h4>Personal Growth Suggestions:</h4>
          <ul>
            <li>Practice setting healthy boundaries</li>
            <li>Develop comfort with conflict when necessary</li>
            <li>Learn to prioritize personal needs</li>
            <li>Embrace change and new perspectives</li>
          </ul>
        </div>
      `
    };
    return analysis[type] || 'Detailed analysis for this type will be added soon.';
  }

  loadPDFLibraries() {
    // Load jsPDF and its dependencies
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
    ];

    Promise.all(scripts.map(src => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    })).then(() => {
      // Initialize jsPDF after scripts are loaded
      window.jsPDF = window.jspdf.jsPDF;
    }).catch(error => {
      console.error('Error loading PDF libraries:', error);
    });
  }

  async downloadResults() {
    try {
      if (!window.jsPDF) {
        throw new Error('PDF library not loaded');
      }

      const type = this.calculateType();
      const typeInfo = this.getTypeDescription(type);
      const cognitiveInfo = this.getCognitiveFunctions(type);
      const compatibilityInfo = this.getCompatibilityInfo(type);
      const famousPeople = this.getFamousPeople(type);
      const detailedAnalysis = this.getDetailedAnalysis(type);
      
      // Create PDF document
      const doc = new window.jsPDF();
      
      // Add logo
      try {
        const logoImg = new Image();
        logoImg.src = '../../asset/images/logo.png';
        doc.addImage(logoImg, 'PNG', 15, 10, 50, 20);
      } catch (logoError) {
        console.warn('Logo could not be added:', logoError);
      }

      // Title
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.text('MBTI Personality Profile', 105, 25, { align: 'center' });
      
      // Type and Title
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text(`${type} - ${typeInfo.title}`, 105, 35, { align: 'center' });

      // Description
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const splitDescription = doc.splitTextToSize(typeInfo.description, 180);
      doc.text(splitDescription, 15, 45);

      let currentY = 45 + (splitDescription.length * 7);

      // Dimension Scores Section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Personality Dimensions', 15, currentY);
      currentY += 15;

      // Add dimension score bars
      const dimensions = {
        EI: ['Extraversion (E)', 'Introversion (I)'],
        SN: ['Sensing (S)', 'Intuition (N)'],
        TF: ['Thinking (T)', 'Feeling (F)'],
        JP: ['Judging (J)', 'Perceiving (P)']
      };

      Object.entries(this.scores).forEach(([dimension, score], index) => {
        const total = this.answers.filter(a => a.dimension === dimension).length * 2;
        const percentage = ((score + total) / (total * 2)) * 100;
        
        // Draw dimension label
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        doc.text(`${dimensions[dimension][0]} - ${dimensions[dimension][1]}`, 15, currentY);

        // Draw score bar background
        doc.setFillColor(236, 240, 241);
        doc.rect(15, currentY + 2, 140, 6, 'F');

        // Draw score bar
        doc.setFillColor(41, 128, 185);
        doc.rect(15, currentY + 2, (percentage * 1.4), 6, 'F');

        // Add percentage text
        doc.text(`${Math.round(percentage)}%`, 160, currentY + 6);

        currentY += 20;
      });

      currentY += 10;

      // Key Strengths
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Key Strengths:', 15, currentY);
      currentY += 10;

      // Add strengths as bullet points
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      typeInfo.strengths.forEach(strength => {
        doc.text(`• ${strength}`, 20, currentY);
        currentY += 7;
      });

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      } else {
        currentY += 15;
      }

      // Growth Opportunities
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Growth Opportunities:', 15, currentY);
      currentY += 10;

      // Add opportunities as bullet points
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      typeInfo.opportunities.forEach(opportunity => {
        doc.text(`• ${opportunity}`, 20, currentY);
        currentY += 7;
      });

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      } else {
        currentY += 15;
      }

      // Career Paths
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Career Paths:', 15, currentY);
      currentY += 10;

      // Add career paths as bullet points
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      typeInfo.careers.forEach(career => {
        doc.text(`• ${career}`, 20, currentY);
        currentY += 7;
      });

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      } else {
        currentY += 15;
      }

      // Cognitive Functions Section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Cognitive Functions', 15, currentY);
      currentY += 10;
      
      // Function details
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const functions = [
        { title: 'Dominant', value: cognitiveInfo.dominant },
        { title: 'Auxiliary', value: cognitiveInfo.auxiliary },
        { title: 'Tertiary', value: cognitiveInfo.tertiary },
        { title: 'Inferior', value: cognitiveInfo.inferior }
      ];

      functions.forEach(func => {
        doc.setFont(undefined, 'bold');
        doc.text(`${func.title}:`, 15, currentY);
        doc.setFont(undefined, 'normal');
        doc.text(func.value, 50, currentY);
        currentY += 8;
      });

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      } else {
        currentY += 15;
      }

      // Compatibility Section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Relationship Compatibility', 15, currentY);
      currentY += 10;
      
      // Compatibility content
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const compatibilityText = compatibilityInfo.replace(/<[^>]*>/g, '')
        .replace(/Best Matches:/g, '\nBest Matches:\n')
        .replace(/Good Matches:/g, '\nGood Matches:\n')
        .replace(/Potential Challenges:/g, '\nPotential Challenges:\n');
      const splitCompatibility = doc.splitTextToSize(compatibilityText, 180);
      doc.text(splitCompatibility, 15, currentY);
      currentY += splitCompatibility.length * 7 + 10;

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Famous People Section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text(`Famous ${type}s`, 15, currentY);
      currentY += 10;
      
      // Famous people content
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const famousPeopleText = famousPeople.replace(/<[^>]*>/g, '')
        .split('\n')
        .filter(line => line.trim());
      famousPeopleText.forEach(person => {
        doc.text(`• ${person.trim()}`, 20, currentY);
        currentY += 7;
      });

      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      } else {
        currentY += 15;
      }

      // Detailed Analysis Section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Detailed Type Analysis', 15, currentY);
      currentY += 10;
      
      // Analysis content
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const analysisText = detailedAnalysis.replace(/<[^>]*>/g, '')
        .replace(/How.*Process Information:/g, '\nInformation Processing:\n')
        .replace(/Communication Style:/g, '\nCommunication Style:\n')
        .replace(/In the Workplace:/g, '\nIn the Workplace:\n')
        .replace(/Personal Growth Suggestions:/g, '\nPersonal Growth Suggestions:\n');
      const splitAnalysis = doc.splitTextToSize(analysisText, 180);
      doc.text(splitAnalysis, 15, currentY);

      // Footer on each page
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Generated by Calculator Universe', 105, 297, { align: 'center' });
      }

      // Save the PDF
      doc.save(`MBTI-${type}-Profile.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    }
  }

  restartTest() {
    this.currentQuestion = 0;
    this.answers = [];
    this.scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    
    if (this.resultSection) {
      this.resultSection.classList.remove('active');
      this.resultSection.classList.add('hidden');
    }
    if (this.introSection) {
      this.introSection.classList.remove('hidden');
      this.introSection.classList.add('active');
    }
  }
}

// Initialize the evaluator when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the MBTI calculator page
  if (document.getElementById('mbti-intro-section') || document.querySelector('.mbti-calculator-container')) {
    window.mbtiCalculator = new MBTICalculatorLogic();
  }
});
