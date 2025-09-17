import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import ResultSection from '../tool/ResultSection';
import TableOfContents from '../tool/TableOfContents';
import MathFormula from '../tool/MathFormula';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/mbti-calculator.css';

const MBTICalculator = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({ EI: 0, SN: 0, TF: 0, JP: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const questions = [
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

  useEffect(() => {
    // Load the JavaScript logic
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/mbti-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const startTest = () => {
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setScores({ EI: 0, SN: 0, TF: 0, JP: 0 });
    setResult(null);
    setError('');
    setTestCompleted(false);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerValue) => {
    setSelectedAnswer(answerValue);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;

    const question = questions[currentQuestion];
    
    // Calculate score based on 5-point scale (1-5)
    const scoreChange = (() => {
      if (selectedAnswer === 1) return 2;
      if (selectedAnswer === 2) return 1;
      if (selectedAnswer === 4) return -1;
      if (selectedAnswer === 5) return -2;
      return 0; // neutral
    })();

    // Apply score change based on question direction
    let newScores = { ...scores };
    if (question.direction === 'E' || question.direction === 'S' || 
        question.direction === 'T' || question.direction === 'J') {
      newScores[question.dimension] += scoreChange;
    } else {
      newScores[question.dimension] -= scoreChange;
    }

    const newAnswers = [...answers, {
      question: question.text,
      answer: selectedAnswer,
      dimension: question.dimension,
      direction: question.direction
    }];

    setAnswers(newAnswers);
    setScores(newScores);
    setSelectedAnswer(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test completed
      setTestCompleted(true);
      calculateResults(newScores, newAnswers);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      // Remove the last answer if going back
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
      
      // Recalculate scores without the last answer
      const newScores = { EI: 0, SN: 0, TF: 0, JP: 0 };
      newAnswers.forEach(answer => {
        const scoreChange = (() => {
          if (answer.answer === 1) return 2;
          if (answer.answer === 2) return 1;
          if (answer.answer === 4) return -1;
          if (answer.answer === 5) return -2;
          return 0;
        })();

        const question = questions[newAnswers.indexOf(answer)];
        if (question.direction === 'E' || question.direction === 'S' || 
            question.direction === 'T' || question.direction === 'J') {
          newScores[question.dimension] += scoreChange;
        } else {
          newScores[question.dimension] -= scoreChange;
        }
      });

      setScores(newScores);
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  const calculateResults = (finalScores, finalAnswers) => {
    const personalityType = calculateType(finalScores, finalAnswers);
    const typeInfo = getTypeDescription(personalityType);
    const cognitiveInfo = getCognitiveFunctions(personalityType);
    const compatibilityInfo = getCompatibilityInfo(personalityType);
    const famousPeople = getFamousPeople(personalityType);
    const detailedAnalysis = getDetailedAnalysis(personalityType);
    
    setResult({
      type: personalityType,
      typeInfo,
      cognitiveInfo,
      compatibilityInfo,
      famousPeople,
      detailedAnalysis,
      scores: finalScores,
      answers: finalAnswers
    });
  };

  const calculateType = (finalScores, finalAnswers) => {
    const getPreference = (score, dimension) => {
      const total = finalAnswers.filter(a => a.dimension === dimension).length * 2;
      const percentage = ((score + total) / (total * 2)) * 100;
      
      switch(dimension) {
        case 'EI': return percentage < 50 ? 'E' : 'I';
        case 'SN': return percentage < 50 ? 'S' : 'N';
        case 'TF': return percentage < 50 ? 'T' : 'F';
        case 'JP': return percentage < 50 ? 'J' : 'P';
        default: return 'X';
      }
    };

    return [
      getPreference(finalScores.EI, 'EI'),
      getPreference(finalScores.SN, 'SN'),
      getPreference(finalScores.TF, 'TF'),
      getPreference(finalScores.JP, 'JP')
    ].join('');
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      'INTJ': {
        title: 'The Architect',
        description: 'As an INTJ, you are a strategic thinker with a rare combination of imagination and reliability. Your primary mode of living focuses on gathering information to create far-reaching insights and ideas.',
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
      'INTP': {
        title: 'The Thinker',
        description: 'As an INTP, you are a philosophical innovator, fascinated by logical analysis, systems, and design. You are driven to understand the fundamental principles behind everything.',
        strengths: [
          'Exceptional analytical and logical thinking',
          'Creative problem-solving abilities',
          'Independent and flexible',
          'Strong theoretical understanding'
        ],
        opportunities: [
          'May need to develop practical application skills',
          'Can work on following through with projects',
          'Could benefit from more structure and deadlines'
        ],
        careers: [
          'Software Development',
          'Research and Development',
          'Philosophy and Academia',
          'Systems Analysis',
          'Theoretical Physics'
        ]
      },
      'ENTJ': {
        title: 'The Commander',
        description: 'As an ENTJ, you are a bold, imaginative leader who is always finding a way forward. You are driven to lead and have a strong desire to achieve your goals.',
        strengths: [
          'Natural leadership abilities',
          'Strategic and long-term thinking',
          'Confident and decisive',
          'Excellent organizational skills'
        ],
        opportunities: [
          'May need to develop emotional intelligence',
          'Can work on being more patient with others',
          'Could benefit from considering others\' feelings'
        ],
        careers: [
          'Executive Leadership',
          'Management Consulting',
          'Investment Banking',
          'Entrepreneurship',
          'Politics and Government'
        ]
      },
      'ENTP': {
        title: 'The Debater',
        description: 'As an ENTP, you are a smart and curious thinker who cannot resist an intellectual challenge. You are drawn to complex problems and innovative solutions.',
        strengths: [
          'Quick and creative thinking',
          'Excellent communication skills',
          'Adaptable and flexible',
          'Natural problem-solver'
        ],
        opportunities: [
          'May need to develop follow-through skills',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Entrepreneurship',
          'Marketing and Advertising',
          'Journalism',
          'Law',
          'Consulting'
        ]
      },
      'INFJ': {
        title: 'The Advocate',
        description: 'As an INFJ, you are a creative and insightful individual who is guided by strong values and seeks to help others. You have a unique ability to understand people and situations.',
        strengths: [
          'Deep insight into people and situations',
          'Strong values and principles',
          'Creative and imaginative',
          'Excellent communication skills'
        ],
        opportunities: [
          'May need to develop practical skills',
          'Can work on being more assertive',
          'Could benefit from setting boundaries'
        ],
        careers: [
          'Counseling and Therapy',
          'Writing and Journalism',
          'Human Resources',
          'Social Work',
          'Education'
        ]
      },
      'INFP': {
        title: 'The Mediator',
        description: 'As an INFP, you are a poetic, kind, and altruistic person, always eager to help a good cause. You are driven by your values and seek to make a positive impact.',
        strengths: [
          'Strong personal values',
          'Creative and artistic',
          'Empathetic and understanding',
          'Flexible and adaptable'
        ],
        opportunities: [
          'May need to develop practical skills',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Writing and Literature',
          'Art and Design',
          'Counseling',
          'Social Work',
          'Education'
        ]
      },
      'ENFJ': {
        title: 'The Protagonist',
        description: 'As an ENFJ, you are a charismatic and inspiring leader, able to mesmerize their listeners. You have a natural ability to understand and motivate others.',
        strengths: [
          'Natural leadership abilities',
          'Excellent communication skills',
          'Empathetic and understanding',
          'Inspiring and motivating'
        ],
        opportunities: [
          'May need to develop practical skills',
          'Can work on being more objective',
          'Could benefit from setting boundaries'
        ],
        careers: [
          'Teaching and Education',
          'Human Resources',
          'Politics',
          'Public Relations',
          'Counseling'
        ]
      },
      'ENFP': {
        title: 'The Campaigner',
        description: 'As an ENFP, you are a passionate, creative, and sociable free spirit, always able to find a reason to smile. You are driven by your values and seek to inspire others.',
        strengths: [
          'Enthusiastic and energetic',
          'Creative and innovative',
          'Excellent communication skills',
          'Flexible and adaptable'
        ],
        opportunities: [
          'May need to develop focus and follow-through',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Marketing and Advertising',
          'Event Planning',
          'Journalism',
          'Counseling',
          'Entrepreneurship'
        ]
      },
      'ISTJ': {
        title: 'The Logistician',
        description: 'As an ISTJ, you are a practical and fact-minded individual, whose reliability cannot be doubted. You are thorough, responsible, and committed to your duties.',
        strengths: [
          'Reliable and responsible',
          'Detail-oriented and thorough',
          'Practical and realistic',
          'Strong work ethic'
        ],
        opportunities: [
          'May need to develop flexibility',
          'Can work on being more open to new ideas',
          'Could benefit from more spontaneity'
        ],
        careers: [
          'Accounting and Finance',
          'Law Enforcement',
          'Engineering',
          'Administration',
          'Healthcare'
        ]
      },
      'ISFJ': {
        title: 'The Protector',
        description: 'As an ISFJ, you are a very dedicated and warm protector, always ready to defend your loved ones. You are practical, responsible, and committed to helping others.',
        strengths: [
          'Caring and supportive',
          'Reliable and responsible',
          'Practical and organized',
          'Strong attention to detail'
        ],
        opportunities: [
          'May need to develop assertiveness',
          'Can work on setting boundaries',
          'Could benefit from more self-care'
        ],
        careers: [
          'Healthcare',
          'Education',
          'Social Work',
          'Counseling',
          'Administration'
        ]
      },
      'ESTJ': {
        title: 'The Executive',
        description: 'As an ESTJ, you are a dedicated manager, unsurpassed at managing things or people. You are practical, realistic, and committed to getting things done.',
        strengths: [
          'Natural leadership abilities',
          'Organized and efficient',
          'Practical and realistic',
          'Strong decision-making skills'
        ],
        opportunities: [
          'May need to develop flexibility',
          'Can work on being more patient',
          'Could benefit from considering others\' feelings'
        ],
        careers: [
          'Management and Administration',
          'Law Enforcement',
          'Military',
          'Finance',
          'Government'
        ]
      },
      'ESFJ': {
        title: 'The Consul',
        description: 'As an ESFJ, you are a warm-hearted, conscientious, and cooperative. You have a strong desire to help others and create harmony in your environment.',
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
      },
      'ISTP': {
        title: 'The Virtuoso',
        description: 'As an ISTP, you are a bold and practical experimenter, master of all kinds of tools. You are practical, realistic, and focused on the present moment.',
        strengths: [
          'Practical and hands-on',
          'Flexible and adaptable',
          'Independent and self-reliant',
          'Excellent problem-solving skills'
        ],
        opportunities: [
          'May need to develop long-term planning',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Engineering',
          'Mechanics',
          'Emergency Services',
          'Technology',
          'Sports and Athletics'
        ]
      },
      'ISFP': {
        title: 'The Adventurer',
        description: 'As an ISFP, you are a flexible and charming artist, always ready to explore new possibilities. You are gentle, caring, and focused on living in the present.',
        strengths: [
          'Creative and artistic',
          'Flexible and adaptable',
          'Caring and supportive',
          'Independent and self-reliant'
        ],
        opportunities: [
          'May need to develop planning skills',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Art and Design',
          'Counseling',
          'Healthcare',
          'Education',
          'Social Work'
        ]
      },
      'ESTP': {
        title: 'The Entrepreneur',
        description: 'As an ESTP, you are a smart, energetic, and perceptive person, truly enjoy living on the edge. You are practical, realistic, and focused on immediate results.',
        strengths: [
          'Energetic and enthusiastic',
          'Practical and realistic',
          'Flexible and adaptable',
          'Excellent people skills'
        ],
        opportunities: [
          'May need to develop long-term planning',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Sales and Marketing',
          'Entrepreneurship',
          'Emergency Services',
          'Sports and Athletics',
          'Entertainment'
        ]
      },
      'ESFP': {
        title: 'The Entertainer',
        description: 'As an ESFP, you are a spontaneous, energetic, and enthusiastic person who loves life and people. You are practical, realistic, and focused on helping others.',
        strengths: [
          'Enthusiastic and energetic',
          'Caring and supportive',
          'Practical and realistic',
          'Excellent people skills'
        ],
        opportunities: [
          'May need to develop planning skills',
          'Can work on being more organized',
          'Could benefit from more structure'
        ],
        careers: [
          'Entertainment',
          'Sales and Marketing',
          'Healthcare',
          'Education',
          'Social Work'
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
  };

  const getCognitiveFunctions = (type) => {
    const functions = {
      'INTJ': {
        dominant: 'Introverted Intuition (Ni)',
        auxiliary: 'Extraverted Thinking (Te)',
        tertiary: 'Introverted Feeling (Fi)',
        inferior: 'Extraverted Sensing (Se)'
      },
      'ESFJ': {
        dominant: 'Extraverted Feeling (Fe)',
        auxiliary: 'Introverted Sensing (Si)',
        tertiary: 'Extraverted Intuition (Ne)',
        inferior: 'Introverted Thinking (Ti)'
      }
    };
    return functions[type] || {
      dominant: 'Information not available',
      auxiliary: 'Information not available',
      tertiary: 'Information not available',
      inferior: 'Information not available'
    };
  };

  const getCompatibilityInfo = (type) => {
    const compatibility = {
      'INTJ': [
        { type: 'ENFP', description: 'Complementary intuition with balanced extroversion/introversion' },
        { type: 'ENTP', description: 'Strong intellectual connection and shared analytical approach' }
      ],
      'ESFJ': [
        { type: 'ISFP', description: 'Balanced sensing and feeling functions' },
        { type: 'ISTP', description: 'Complementary cognitive functions' }
      ]
    };
    return compatibility[type] || [{ type: 'Information not available', description: 'Compatibility information will be added soon.' }];
  };

  const getFamousPeople = (type) => {
    const famousPeople = {
      'INTJ': [
        'Elon Musk - Entrepreneur and Innovator',
        'Stephen Hawking - Theoretical Physicist',
        'Michelle Obama - Former First Lady and Author',
        'Mark Zuckerberg - Facebook Founder',
        'Nikola Tesla - Inventor and Engineer'
      ],
      'ESFJ': [
        'Taylor Swift - Singer-Songwriter',
        'Bill Clinton - Former US President',
        'Anne Hathaway - Actress',
        'Sam Walton - Walmart Founder',
        'Hugh Jackman - Actor'
      ]
    };
    return famousPeople[type] || ['Famous people information will be added soon.'];
  };

  const getDetailedAnalysis = (type) => {
    const analysis = {
      'INTJ': {
        processing: 'INTJs use their dominant Introverted Intuition (Ni) to process information by looking for underlying patterns and generating insights about future implications.',
        communication: 'INTJs typically communicate in a direct, logical manner, focusing on efficiency and accuracy over emotional sensitivity.',
        workplace: [
          'Excel at strategic planning and system design',
          'Prefer working independently or in small, competent teams',
          'Value efficiency and logical solutions',
          'May struggle with office politics and emotional dynamics'
        ],
        growth: [
          'Practice active listening and emotional validation',
          'Develop patience with those who process information differently',
          'Learn to appreciate and engage with present-moment experiences',
          'Work on expressing feelings and connecting emotionally'
        ]
      },
      'ESFJ': {
        processing: 'ESFJs primarily use Extraverted Feeling (Fe) to understand and respond to others\' emotions and needs.',
        communication: 'ESFJs are warm and engaging communicators who excel at creating harmony in groups.',
        workplace: [
          'Natural team players and organizers',
          'Excel at creating positive work environments',
          'Strong attention to detail and deadlines',
          'Value structure and clear expectations'
        ],
        growth: [
          'Practice setting healthy boundaries',
          'Develop comfort with conflict when necessary',
          'Learn to prioritize personal needs',
          'Embrace change and new perspectives'
        ]
      }
    };
    return analysis[type] || {
      processing: 'Detailed analysis will be added soon.',
      communication: 'Communication style information will be added soon.',
      workplace: ['Workplace information will be added soon.'],
      growth: ['Growth suggestions will be added soon.']
    };
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setScores({ EI: 0, SN: 0, TF: 0, JP: 0 });
    setResult(null);
    setError('');
    setSelectedAnswer(null);
    setIsDownloading(false);
  };

  const loadPDFLibraries = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.jsPDF) {
        resolve();
        return;
      }

      // Load jsPDF and its dependencies
      const scripts = [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
      ];

      Promise.all(scripts.map(src => {
        return new Promise((scriptResolve, scriptReject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = scriptResolve;
          script.onerror = scriptReject;
          document.head.appendChild(script);
        });
      })).then(() => {
        // Initialize jsPDF after scripts are loaded
        window.jsPDF = window.jspdf.jsPDF;
        resolve();
      }).catch(error => {
        console.error('Error loading PDF libraries:', error);
        reject(error);
      });
    });
  };

  const downloadReport = async () => {
    try {
      setIsDownloading(true);
      
      // Check if jsPDF is already loaded, if not load it
      if (!window.jsPDF) {
        await loadPDFLibraries();
      }
      
      if (!window.jsPDF) {
        throw new Error('PDF library not loaded');
      }
      
      const type = result.type;
      const typeInfo = result.typeInfo;
      const cognitiveInfo = result.cognitiveInfo;
      
      // Create PDF document
      const doc = new window.jsPDF();
      
      // Add logo
      try {
        const logoImg = new Image();
        logoImg.src = '/images/logo.png';
        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            try {
              doc.addImage(logoImg, 'PNG', 75, 10, 50, 20);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          logoImg.onerror = reject;
        });
      } catch (logoError) {
        console.warn('Logo could not be added:', logoError);
      }

      // Title
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185);
      doc.text('MBTI Personality Profile', 105, 40, { align: 'center' });
      
      // Disclaimer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('This is an evaluation tool and results may contain errors. For professional assessment,', 105, 50, { align: 'center' });
      doc.text('please consult with a qualified psychologist or certified MBTI practitioner.', 105, 55, { align: 'center' });
      
      // Type and Title
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text(`${type} - ${typeInfo.title}`, 105, 70, { align: 'center' });

      // Description
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const splitDescription = doc.splitTextToSize(typeInfo.description, 180);
      doc.text(splitDescription, 15, 85);

      let currentY = 85 + (splitDescription.length * 7);

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

      Object.entries(result.scores).forEach(([dimension, score]) => {
        const total = result.answers.filter(a => a.dimension === dimension).length * 2;
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

      // Footer on each page
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Generated by Tuitility', 105, 297, { align: 'center' });
      }

      // Save the PDF
      doc.save(`MBTI-${type}-Profile.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('There was an error generating your PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const toolData = {
    name: "MBTI Personality Evaluation Test",
    description: "Discover your personality type with our comprehensive Myers-Briggs Type Indicator (MBTI) evaluation. Get detailed insights into your cognitive functions, compatibility, and personal growth opportunities.",
    icon: "fas fa-user-friends",
    category: "Knowledge",
    breadcrumb: ["Knowledge", "Calculators", "MBTI Personality Test"]
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
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Habit Formation Calculator", url: "/knowledge/calculators/habit-formation-calculator", icon: "fas fa-calendar-check" },
    { name: "Love Calculator", url: "/knowledge/calculators/love-calculator", icon: "fas fa-heart" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'what-is-mbti', title: 'What is MBTI?', level: 2 },
    { id: 'mbti-dimensions', title: 'MBTI Dimensions', level: 2 },
    { id: 'how-to-use', title: 'How to Use', level: 2 },
    { id: 'cognitive-functions', title: 'Cognitive Functions', level: 2 },
    { id: 'personality-types', title: 'Personality Types', level: 2 },
    { id: 'significance', title: 'Significance', level: 2 },
    { id: 'functionality', title: 'Functionality', level: 2 },
    { id: 'applications', title: 'Applications', level: 2 },
    { id: 'faqs', title: 'FAQs', level: 2 }
  ];

  const faqData = [
    {
      question: "What is the MBTI personality test?",
      answer: "The Myers-Briggs Type Indicator (MBTI) is a psychological assessment that categorizes personality into 16 different types based on four key dimensions: Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving."
    },
    {
      question: "How accurate is the MBTI test?",
      answer: "The MBTI provides valuable insights into personality preferences and behavioral patterns. While it's a useful tool for self-awareness and understanding others, it should be used as a starting point for personal development rather than a definitive personality assessment."
    },
    {
      question: "Can my personality type change over time?",
      answer: "While your core personality preferences tend to remain relatively stable, you can develop and strengthen different aspects of your personality through conscious effort and personal growth. The MBTI measures preferences, not abilities."
    },
    {
      question: "What are cognitive functions?",
      answer: "Cognitive functions are the mental processes that determine how you perceive and process information. Each MBTI type has a specific order of cognitive functions that influence how you think, make decisions, and interact with the world."
    },
    {
      question: "How long does the test take?",
      answer: "Our MBTI evaluation consists of 72 carefully crafted questions and typically takes 10-15 minutes to complete. Take your time to answer honestly for the most accurate results."
    },
    {
      question: "Can I retake the test?",
      answer: "Yes, you can retake the test as many times as you'd like. However, for the most accurate results, it's recommended to wait a few weeks between tests and answer based on your natural preferences rather than how you think you should answer."
    }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="MBTI Personality Evaluation Test"
        onCalculate={startTest}
        calculateButtonText="Start MBTI Test"
        error={error}
        result={null}
      >
        {!testStarted ? (
          <div className="mbti-intro-section">
            <div className="mbti-intro-content">
              <h3>Welcome to the MBTI Personality Test</h3>
              <p>This comprehensive evaluation will help you discover your Myers-Briggs personality type through 72 carefully crafted questions.</p>
              <div className="mbti-test-info">
                <div className="mbti-info-item">
                  <i className="fas fa-clock"></i>
                  <span>10-15 minutes</span>
                </div>
                <div className="mbti-info-item">
                  <i className="fas fa-question-circle"></i>
                  <span>72 questions</span>
                </div>
                <div className="mbti-info-item">
                  <i className="fas fa-chart-bar"></i>
                  <span>Detailed analysis</span>
                </div>
              </div>
            </div>
          </div>
        ) : !testCompleted ? (
          <div className="mbti-question-section">
            <div className="mbti-progress-bar">
              <div className="mbti-progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
            <div className="mbti-question-counter">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="mbti-question-text">
              {questions[currentQuestion].text}
            </div>
             <div className="mbti-answer-options">
               {[1, 2, 3, 4, 5].map((value) => (
                 <label key={value} className="mbti-radio-label">
                   <input
                     type="radio"
                     name="mbti-answer"
                     value={value}
                     checked={selectedAnswer === value}
                     onChange={() => handleAnswerSelect(value)}
                   />
                   <span className="mbti-radio-text">
                     {value === 1 && "Strongly Disagree"}
                     {value === 2 && "Disagree"}
                     {value === 3 && "Neutral"}
                     {value === 4 && "Agree"}
                     {value === 5 && "Strongly Agree"}
                   </span>
                 </label>
               ))}
             </div>
             
             {/* Navigation Buttons */}
             <div className="mbti-navigation-buttons">
               <button 
                 type="button" 
                 className="mbti-btn-back" 
                 onClick={previousQuestion}
                 disabled={currentQuestion === 0}
               >
                 <i className="fas fa-arrow-left"></i>
                 Back
               </button>
               
               <button 
                 type="button" 
                 className="mbti-btn-next" 
                 onClick={nextQuestion}
                 disabled={selectedAnswer === null}
               >
                 {currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next'}
                 <i className="fas fa-arrow-right"></i>
               </button>
             </div>
          </div>
        ) : (
          <div className="mbti-result-section">
            {result && (
               <div className="mbti-formation-calculator-result">
                 <h3 className="mbti-result-title">Your MBTI Personality Type</h3>
                 <div className="mbti-disclaimer">
                   <p><i className="fas fa-info-circle"></i> <strong>Disclaimer:</strong> This is an evaluation tool and results may contain errors. For professional assessment, please consult with a qualified psychologist or certified MBTI practitioner.</p>
                 </div>
                 <div className="mbti-result-content">
                  <div className="mbti-result-main">
                    <div className="mbti-result-item">
                      <strong>Personality Type:</strong>
                      <span className="mbti-result-value mbti-result-final">
                        {result.type}
                      </span>
                    </div>
                    <div className="mbti-result-item">
                      <strong>Type Title:</strong>
                      <span className="mbti-result-value">
                        {result.typeInfo.title}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mbti-type-description">
                    <h4>Type Description</h4>
                    <p>{result.typeInfo.description}</p>
                  </div>

                  <div className="mbti-cognitive-functions">
                    <h4>Cognitive Functions</h4>
                    <div className="mbti-function-stack">
                      <p><strong>Dominant:</strong> {result.cognitiveInfo.dominant}</p>
                      <p><strong>Auxiliary:</strong> {result.cognitiveInfo.auxiliary}</p>
                      <p><strong>Tertiary:</strong> {result.cognitiveInfo.tertiary}</p>
                      <p><strong>Inferior:</strong> {result.cognitiveInfo.inferior}</p>
                    </div>
                  </div>

                  <div className="mbti-strengths">
                    <h4>Key Strengths</h4>
                    <ul>
                      {result.typeInfo.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mbti-opportunities">
                    <h4>Growth Opportunities</h4>
                    <ul>
                      {result.typeInfo.opportunities.map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  </div>

                   <div className="mbti-careers">
                     <h4>Career Paths</h4>
                     <ul>
                       {result.typeInfo.careers.map((career, index) => (
                         <li key={index}>{career}</li>
                       ))}
                     </ul>
                   </div>
                 </div>
               </div>
             )}
           </div>
         )}

         {/* Form Actions */}
         <div className="mbti-form-actions">
           {result && (
             <button 
               type="button" 
               className="mbti-btn-download" 
               onClick={downloadReport}
               disabled={isDownloading}
             >
               <i className={isDownloading ? "fas fa-spinner fa-spin" : "fas fa-download"}></i>
               {isDownloading ? 'Generating...' : 'Download Report'}
             </button>
           )}
           <button type="button" className="mbti-btn-reset" onClick={resetTest}>
             <i className="fas fa-redo"></i>
             Reset Test
           </button>
         </div>

        {error && (
          <div className="mbti-error-message">
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
          The Myers-Briggs Type Indicator (MBTI) is one of the most widely used personality assessments in the world. 
          Developed by Katharine Briggs and Isabel Myers, it helps individuals understand their personality preferences 
          and how they interact with the world around them.
        </p>
        <p>
          Our comprehensive MBTI evaluation consists of 72 carefully crafted questions designed to assess your preferences 
          across four key dimensions of personality. The results provide detailed insights into your cognitive functions, 
          behavioral patterns, and personal growth opportunities.
        </p>
      </ContentSection>

      <ContentSection id="what-is-mbti">
        <h2>What is MBTI?</h2>
        <div className="mbti-definition-grid">
          <div className="mbti-definition-item">
            <h3><i className="fas fa-brain"></i> Personality Assessment</h3>
            <p>MBTI categorizes personality into 16 distinct types based on psychological preferences and behavioral patterns.</p>
          </div>
          <div className="mbti-definition-item">
            <h3><i className="fas fa-chart-line"></i> Four Dimensions</h3>
            <p>Personality is measured across four key dimensions: Energy, Information, Decisions, and Lifestyle.</p>
          </div>
          <div className="mbti-definition-item">
            <h3><i className="fas fa-users"></i> Self-Awareness</h3>
            <p>Helps individuals understand their natural preferences and how they differ from others.</p>
          </div>
          <div className="mbti-definition-item">
            <h3><i className="fas fa-lightbulb"></i> Personal Growth</h3>
            <p>Provides insights for personal development and improving relationships with others.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="mbti-dimensions">
        <h2>MBTI Dimensions</h2>
        <div className="mbti-factors-grid">
          <div className="mbti-factor-item">
            <h3><i className="fas fa-bolt"></i> Extraversion (E) vs Introversion (I)</h3>
            <p>How you gain energy and focus your attention - from the outer world or your inner world.</p>
          </div>
          <div className="mbti-factor-item">
            <h3><i className="fas fa-eye"></i> Sensing (S) vs Intuition (N)</h3>
            <p>How you take in information - through concrete facts and details or patterns and possibilities.</p>
          </div>
          <div className="mbti-factor-item">
            <h3><i className="fas fa-balance-scale"></i> Thinking (T) vs Feeling (F)</h3>
            <p>How you make decisions - through logical analysis or personal values and harmony.</p>
          </div>
          <div className="mbti-factor-item">
            <h3><i className="fas fa-calendar-alt"></i> Judging (J) vs Perceiving (P)</h3>
            <p>How you approach the outside world - in a structured, planned way or flexible, adaptable way.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="personality-types">
        <h2>Personality Types</h2>
        <p>
          The 16 MBTI personality types are organized into four main groups, each with distinct characteristics and strengths:
        </p>
        <ul>
          <li><strong>Analysts (NT):</strong> INTJ, INTP, ENTJ, ENTP - Strategic, logical, and innovative thinkers</li>
          <li><strong>Diplomats (NF):</strong> INFJ, INFP, ENFJ, ENFP - Empathetic, creative, and idealistic</li>
          <li><strong>Sentinels (SJ):</strong> ISTJ, ISFJ, ESTJ, ESFJ - Practical, reliable, and organized</li>
          <li><strong>Explorers (SP):</strong> ISTP, ISFP, ESTP, ESFP - Spontaneous, adaptable, and hands-on</li>
        </ul>

        <h3>All 16 MBTI Personality Types</h3>
        <div className="mbti-types-grid">
          <div className="mbti-type-item">
            <div className="mbti-type-code">INTJ</div>
            <div className="mbti-type-name">The Architect</div>
            <div className="mbti-type-group">Analyst</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">INTP</div>
            <div className="mbti-type-name">The Thinker</div>
            <div className="mbti-type-group">Analyst</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ENTJ</div>
            <div className="mbti-type-name">The Commander</div>
            <div className="mbti-type-group">Analyst</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ENTP</div>
            <div className="mbti-type-name">The Debater</div>
            <div className="mbti-type-group">Analyst</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">INFJ</div>
            <div className="mbti-type-name">The Advocate</div>
            <div className="mbti-type-group">Diplomat</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">INFP</div>
            <div className="mbti-type-name">The Mediator</div>
            <div className="mbti-type-group">Diplomat</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ENFJ</div>
            <div className="mbti-type-name">The Protagonist</div>
            <div className="mbti-type-group">Diplomat</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ENFP</div>
            <div className="mbti-type-name">The Campaigner</div>
            <div className="mbti-type-group">Diplomat</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ISTJ</div>
            <div className="mbti-type-name">The Logistician</div>
            <div className="mbti-type-group">Sentinel</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ISFJ</div>
            <div className="mbti-type-name">The Protector</div>
            <div className="mbti-type-group">Sentinel</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ESTJ</div>
            <div className="mbti-type-name">The Executive</div>
            <div className="mbti-type-group">Sentinel</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ESFJ</div>
            <div className="mbti-type-name">The Consul</div>
            <div className="mbti-type-group">Sentinel</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ISTP</div>
            <div className="mbti-type-name">The Virtuoso</div>
            <div className="mbti-type-group">Explorer</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ISFP</div>
            <div className="mbti-type-name">The Adventurer</div>
            <div className="mbti-type-group">Explorer</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ESTP</div>
            <div className="mbti-type-name">The Entrepreneur</div>
            <div className="mbti-type-group">Explorer</div>
          </div>
          <div className="mbti-type-item">
            <div className="mbti-type-code">ESFP</div>
            <div className="mbti-type-name">The Entertainer</div>
            <div className="mbti-type-group">Explorer</div>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use">
        <h2>How to Use the MBTI Test</h2>
        <div className="mbti-usage-steps">
          <h3>Step 1: Prepare for the Test</h3>
          <ul className="usage-steps">
            <li><strong>Find a Quiet Space:</strong> Choose a comfortable environment free from distractions</li>
            <li><strong>Set Aside Time:</strong> Allow 10-15 minutes to complete all 72 questions</li>
            <li><strong>Be Honest:</strong> Answer based on your natural preferences, not how you think you should answer</li>
          </ul>

          <h3>Step 2: Answer the Questions</h3>
          <ul className="usage-steps">
            <li><strong>Read Carefully:</strong> Take time to understand each question fully</li>
            <li><strong>Choose Your Response:</strong> Select the option that best reflects your natural tendency</li>
            <li><strong>Don't Overthink:</strong> Go with your first instinct for the most accurate results</li>
          </ul>

          <h3>Step 3: Review Your Results</h3>
          <ul className="usage-steps">
            <li><strong>Read Your Type Description:</strong> Understand your personality type and its characteristics</li>
            <li><strong>Explore Cognitive Functions:</strong> Learn about how your mind processes information</li>
            <li><strong>Consider Growth Opportunities:</strong> Identify areas for personal development</li>
          </ul>

          <h3>Step 4: Apply the Insights</h3>
          <ul className="usage-steps">
            <li><strong>Career Planning:</strong> Use your type to guide career and educational decisions</li>
            <li><strong>Relationship Building:</strong> Understand how to communicate better with different types</li>
            <li><strong>Personal Development:</strong> Focus on developing your weaker functions</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="cognitive-functions">
        <h2>Cognitive Functions</h2>
        <div className="mbti-calculation-method">
          <h3>Function Stack</h3>
          <p>Each MBTI type has a specific order of cognitive functions that determine how you process information and make decisions:</p>
          
          <div className="mbti-calculation-example">
            <p><strong>Dominant Function:</strong> Your strongest, most natural way of processing information</p>
            <p><strong>Auxiliary Function:</strong> Your second strongest function that supports your dominant</p>
            <p><strong>Tertiary Function:</strong> A function you can use but may not be as comfortable with</p>
            <p><strong>Inferior Function:</strong> Your weakest function that may cause stress when overused</p>
          </div>
        </div>
      </ContentSection>

      

      <ContentSection id="significance">
        <h2>Significance of MBTI</h2>
        <p>Understanding your MBTI personality type is valuable for:</p>
        <ul>
          <li><strong>Self-Awareness:</strong> Recognizing your natural strengths and areas for growth</li>
          <li><strong>Relationships:</strong> Improving communication and understanding in personal and professional relationships</li>
          <li><strong>Career Development:</strong> Guiding career choices and helping you thrive in the right work environment</li>
          <li><strong>Personal Growth:</strong> Providing a framework for developing weaker functions and becoming more balanced</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality">
        <h2>MBTI Test Functionality</h2>
        <p>Our MBTI Personality Evaluation Test provides comprehensive functionality:</p>
        <ul>
          <li><strong>Comprehensive Assessment:</strong> 72 carefully crafted questions covering all four personality dimensions</li>
          <li><strong>Detailed Analysis:</strong> In-depth insights into your cognitive functions, strengths, and growth opportunities</li>
          <li><strong>Compatibility Insights:</strong> Learn about relationship compatibility and effective communication strategies</li>
          <li><strong>Career Guidance:</strong> Personalized career recommendations based on your personality type</li>
          <li><strong>PDF Report:</strong> Download a comprehensive report with your results for future reference</li>
          <li><strong>Mobile Friendly:</strong> Take the test on any device with our responsive design</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications">
        <h2>Applications of MBTI</h2>
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-user-graduate"></i> Education</h4>
            <p>Help students understand their learning styles and choose appropriate academic paths.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Career Counseling</h4>
            <p>Guide individuals toward careers that align with their personality preferences and strengths.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Team Building</h4>
            <p>Improve workplace dynamics by understanding team members' communication and work styles.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heart"></i> Relationship Counseling</h4>
            <p>Help couples understand their differences and improve communication and compatibility.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Leadership Development</h4>
            <p>Develop leadership skills by understanding your natural leadership style and areas for growth.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-brain"></i> Personal Development</h4>
            <p>Create personalized development plans based on your personality type and cognitive functions.</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
      
    </ToolPageLayout>
  );
};

export default MBTICalculator;
