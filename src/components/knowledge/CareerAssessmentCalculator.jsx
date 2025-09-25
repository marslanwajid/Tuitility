import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/career-assessment-calculator.css';

const CareerAssessmentCalculator = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [showInterestAssessment, setShowInterestAssessment] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toolData = {
    name: "Career Assessment Calculator",
    title: "Career Assessment Calculator",
    description: "Discover your ideal career path with our comprehensive assessment tool. Get AI-powered career recommendations based on your skills, interests, and personality.",
    icon: "fas fa-briefcase",
    category: "knowledge",
    breadcrumb: ["Knowledge", "Calculators", "Career Assessment"],
    tags: ["career", "assessment", "personality", "skills", "job", "profession"],
    lastUpdated: "2024-01-15"
  };

  const categories = [
    { name: "Math Calculators", url: "/math", icon: "fas fa-calculator" },
    { name: "Finance Calculators", url: "/finance", icon: "fas fa-dollar-sign" },
    { name: "Health Calculators", url: "/health", icon: "fas fa-heartbeat" },
    { name: "Knowledge Tools", url: "/knowledge", icon: "fas fa-brain" },
    { name: "Science Calculators", url: "/science", icon: "fas fa-flask" },
    { name: "Utility Tools", url: "/utility", icon: "fas fa-tools" }
  ];

  const relatedTools = [
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator", icon: "fas fa-language" },
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-birthday-cake" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Habit Formation Calculator", url: "/knowledge/calculators/habit-formation-calculator", icon: "fas fa-calendar-check" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-career-assessment', title: 'What is Career Assessment?' },
    { id: 'assessment-categories', title: 'Assessment Categories' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'calculation-method', title: 'Assessment Method' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' }
  ];

  const faqs = [
    {
      question: "How accurate is the career assessment?",
      answer: "Our assessment uses a scientifically-based questionnaire with 50 questions across multiple categories. The AI-powered analysis provides personalized recommendations, but should be used as a starting point for career exploration rather than a definitive answer."
    },
    {
      question: "Can I retake the assessment?",
      answer: "Yes, you can retake the assessment as many times as you want. Your answers may change over time as you gain new experiences and skills, so periodic reassessment can be valuable."
    },
    {
      question: "What if I don't agree with my results?",
      answer: "Career assessments are tools to help guide your thinking, not absolute truths. If the results don't resonate with you, consider what aspects might be accurate and what might not fit your current situation or goals."
    },
    {
      question: "How long does the assessment take?",
      answer: "The assessment typically takes 10-15 minutes to complete. It includes 50 questions that you can answer at your own pace. Take your time to provide thoughtful responses for the most accurate results."
    },
    {
      question: "Are my results confidential?",
      answer: "Yes, all assessment data is processed locally in your browser and is not stored on our servers. You can download your results as a PDF for your personal records."
    },
    {
      question: "Can I use this for career counseling?",
      answer: "This tool can be a helpful starting point for career exploration, but for professional career counseling, we recommend consulting with a certified career counselor who can provide personalized guidance."
    }
  ];

  const startAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAssessmentResults(null);
    setShowResults(false);
    setAssessmentStarted(true);
    setShowInterestAssessment(true);
    setSelectedInterests([]);
  };

  const nextQuestion = (answer) => {
    const newAnswers = [...userAnswers, {
      question: careerQuestions[currentQuestionIndex].question,
      answer: answer,
      category: careerQuestions[currentQuestionIndex].category,
      weight: careerQuestions[currentQuestionIndex].weight
    }];
    
    setUserAnswers(newAnswers);
    
    if (currentQuestionIndex < careerQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Assessment complete
      setIsLoading(true);
      setTimeout(() => {
        analyzeResults(newAnswers);
      }, 2000);
    }
  };

  const analyzeResults = async (answers) => {
    try {
      const categoryScores = calculateCategoryScores(answers);
      const recommendations = await getAIRecommendations(categoryScores);
      
      setAssessmentResults({
        categoryScores,
        recommendations,
        userAnswers: answers,
        timestamp: new Date().toISOString()
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing results:', error);
      // Fallback to basic analysis
      const categoryScores = calculateCategoryScores(answers);
      const basicRecommendations = getBasicRecommendations(categoryScores);
      
      setAssessmentResults({
        categoryScores,
        recommendations: basicRecommendations,
        userAnswers: answers,
        timestamp: new Date().toISOString()
      });
      
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryScores = (answers) => {
    const scores = {
      technical: 0,
      creative: 0,
      leadership: 0,
      interpersonal: 0
    };
    
    const categoryCounts = {
      technical: 0,
      creative: 0,
      leadership: 0,
      interpersonal: 0
    };
    
    const categoryTotals = {
      technical: 0,
      creative: 0,
      leadership: 0,
      interpersonal: 0
    };
    
    answers.forEach(answer => {
      if (scores.hasOwnProperty(answer.category)) {
        scores[answer.category] += answer.answer * answer.weight;
        categoryCounts[answer.category]++;
        categoryTotals[answer.category] += 5 * answer.weight;
      }
    });
    
    Object.keys(scores).forEach(category => {
      if (categoryCounts[category] > 0) {
        const maxPossible = categoryTotals[category];
        const actualScore = scores[category];
        scores[category] = Math.round((actualScore / maxPossible) * 100);
        scores[category] = Math.max(0, Math.min(100, scores[category]));
      }
    });
    
    return scores;
  };

  const getAIRecommendations = async (categoryScores) => {
    try {
      const interestsText = selectedInterests.length > 0 
        ? `\nSelected Interest Areas: ${selectedInterests.join(', ')}`
        : '';

      const prompt = `Based on the following career assessment scores and interests, provide 4-5 specific career recommendations with detailed explanations:

Technical Skills: ${categoryScores.technical}/100
Creative Thinking: ${categoryScores.creative}/100
Leadership Potential: ${categoryScores.leadership}/100
Interpersonal Skills: ${categoryScores.interpersonal}/100${interestsText}

Please recommend careers that match these scores and interests, focusing on modern, in-demand roles including:
- Technology: Software Engineer, AI/ML Engineer, Data Scientist, Cybersecurity Analyst, Cloud Architect, DevOps Engineer, Blockchain Developer, Game Developer, Mobile App Developer, Robotics Engineer, IoT Developer, AR/VR Developer
- Creative: Video Editor, Motion Graphics Designer, UI/UX Designer, Content Creator, Digital Marketing Specialist, Social Media Manager, Photographer, Videographer, Animator, Illustrator, Art Director
- Business: Project Manager, Product Manager, Business Analyst, Management Consultant, Strategy Consultant, Business Development Manager, Operations Manager
- Media: Content Creator, Podcast Producer, Journalist, Broadcast Producer, Film Director, Screenwriter, Streaming Content Creator, Media Planner, Social Media Influencer
- Arts: Fine Artist, Digital Artist, Concept Artist, Fashion Designer, Interior Designer, Architect
- And other relevant modern careers

For each career, provide:
1. Specific job title
2. Match percentage (80-95% for top matches)
3. Brief explanation of why it's a good fit
4. Key skills needed (3-5 specific skills)
5. Potential salary ranges (realistic current market rates)
6. Growth potential (High/Medium/Low)

Format the response as JSON with the following structure:
{
  "careers": [
    {
      "title": "Career Title",
      "match_score": "85%",
      "explanation": "Why this career fits based on scores and interests",
      "required_skills": ["skill1", "skill2", "skill3"],
      "salary_range": "$50,000 - $80,000",
      "growth_potential": "High"
    }
  ],
  "summary": "Overall career path recommendation based on assessment"
}

IMPORTANT: Return ONLY valid JSON, no additional text or formatting.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      let cleanResponse = aiResponse.trim();
      
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      try {
        const parsedResponse = JSON.parse(cleanResponse);
        
        if (parsedResponse.careers && Array.isArray(parsedResponse.careers)) {
          return parsedResponse;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        return getBasicRecommendations(categoryScores);
      }
      
    } catch (error) {
      console.error('AI API Error:', error);
      return getBasicRecommendations(categoryScores);
    }
  };

  const getBasicRecommendations = (categoryScores) => {
    const recommendations = [];
    
    const sortedCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a);
    
    const topCategories = sortedCategories.slice(0, 2);
    
    topCategories.forEach(([category, score]) => {
      const careers = careerCategories[category] || [];
      const topCareers = careers.slice(0, 2);
      
      topCareers.forEach(career => {
        recommendations.push({
          title: career,
          match_score: `${Math.min(95, score + Math.random() * 10).toFixed(0)}%`,
          explanation: `This career aligns with your strong ${category} skills (${score}/100).`,
          required_skills: getSkillsForCareer(career),
          salary_range: getSalaryRange(career),
          growth_potential: "Good"
        });
      });
    });
    
    return {
      careers: recommendations,
      summary: "Career recommendations based on your assessment scores."
    };
  };

  const getSkillsForCareer = (career) => {
    const skillMap = {
      "Software Engineer": ["Programming", "Problem Solving", "Analytical Thinking"],
      "Data Scientist": ["Statistics", "Programming", "Data Analysis"],
      "Graphic Designer": ["Creativity", "Design Software", "Visual Communication"],
      "Teacher": ["Communication", "Patience", "Subject Knowledge"],
      "Business Manager": ["Leadership", "Communication", "Strategic Thinking"],
      "Nurse": ["Patient Care", "Medical Knowledge", "Compassion"],
      "Sales Representative": ["Communication", "Persuasion", "Relationship Building"],
      "Project Manager": ["Leadership", "Organization", "Communication"]
    };
    
    return skillMap[career] || ["Communication", "Problem Solving", "Adaptability"];
  };

  const getSalaryRange = (career) => {
    const salaryMap = {
      "Software Engineer": "$70,000 - $120,000",
      "Data Scientist": "$80,000 - $130,000",
      "Graphic Designer": "$40,000 - $80,000",
      "Teacher": "$40,000 - $70,000",
      "Business Manager": "$60,000 - $100,000",
      "Nurse": "$50,000 - $90,000",
      "Sales Representative": "$40,000 - $80,000",
      "Project Manager": "$70,000 - $110,000"
    };
    
    return salaryMap[career] || "$40,000 - $80,000";
  };

  const loadPDFLibraries = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.jsPDF) {
        resolve();
        return;
      }

      // Load jsPDF
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        // Initialize jsPDF after script is loaded
        window.jsPDF = window.jspdf.jsPDF;
        resolve();
      };
      script.onerror = () => {
        console.error('Error loading PDF library');
        reject(new Error('Failed to load PDF library'));
      };
      document.head.appendChild(script);
    });
  };

  const downloadResults = async () => {
    if (!assessmentResults) {
      alert('No results to download. Please complete the assessment first.');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Check if jsPDF is already loaded, if not load it
      if (!window.jsPDF) {
        await loadPDFLibraries();
      }
      
      if (!window.jsPDF) {
        throw new Error('PDF library not loaded');
      }
      
      generatePDF();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDF = () => {
    // Create PDF document
    const doc = new window.jsPDF();
    
    // Add logo at the top center
    const logoImg = new Image();
    logoImg.src = '/images/logo.png';
    
    // Wait for the image to load before adding it to the PDF
    logoImg.onload = function() {
      // Add logo at the top center
      const imgWidth = 40;
      const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
      doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
      
      // Add title below the logo
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Career Assessment Report', 105, imgHeight + 25, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 40, { align: 'center' });
      
      // Continue with the rest of the PDF generation
      generatePDFContent(doc, imgHeight + 50);
    };
    
    // Handle image loading error
    logoImg.onerror = function() {
      console.error('Error loading logo image');
      // Proceed with PDF generation without the logo
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Career Assessment Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
      
      // Continue with the rest of the PDF generation
      generatePDFContent(doc, 50);
    };
  };

  const generatePDFContent = (doc, startY) => {
    // Helper function to wrap text
    const wrapText = (text, maxWidth, x, y, doc) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 5); // Return new Y position
    };

    // Add skill scores
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Skill Assessment Results', 20, startY);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    let yPos = startY + 15;
    Object.entries(assessmentResults.categoryScores).forEach(([category, score]) => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      doc.text(`${categoryName}: ${score}/100`, 20, yPos);
      yPos += 10;
    });
    
    // Add career recommendations
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Career Recommendations', 20, yPos);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    yPos += 15;
    
    assessmentResults.recommendations.careers.forEach((career, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Career title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${career.title}`, 20, yPos);
      yPos += 10;
      
      // Match score
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Match Score: ${career.match_score}`, 20, yPos);
      yPos += 8;
      
      // Explanation with text wrapping
      doc.setFont(undefined, 'bold');
      doc.text('Explanation:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      yPos = wrapText(career.explanation, 170, 20, yPos, doc);
      yPos += 5;
      
      // Skills with text wrapping
      doc.setFont(undefined, 'bold');
      doc.text('Skills:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      const skillsText = Array.isArray(career.required_skills) ? career.required_skills.join(', ') : career.required_skills;
      yPos = wrapText(skillsText, 170, 20, yPos, doc);
      yPos += 5;
      
      // Salary
      doc.setFont(undefined, 'bold');
      doc.text('Salary:', 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(career.salary_range, 50, yPos);
      yPos += 12;
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Calculator Universe - Career Assessment Calculator', 105, 280, { align: 'center' });
    
    doc.save('career-assessment-report.pdf');
  };

  const restartAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAssessmentResults(null);
    setShowResults(false);
    setIsLoading(false);
    setAssessmentStarted(false);
    setShowInterestAssessment(false);
    setSelectedInterests([]);
  };

  // Interest categories for initial assessment
  const interestCategories = [
    {
      id: 'technology',
      name: 'Technology & Programming',
      icon: 'fas fa-laptop-code',
      description: 'Software development, AI, cybersecurity, data science'
    },
    {
      id: 'creative',
      name: 'Creative & Design',
      icon: 'fas fa-palette',
      description: 'Graphic design, video editing, photography, animation'
    },
    {
      id: 'business',
      name: 'Business & Management',
      icon: 'fas fa-chart-line',
      description: 'Project management, consulting, entrepreneurship'
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Medicine',
      icon: 'fas fa-heartbeat',
      description: 'Medical, nursing, therapy, research'
    },
    {
      id: 'education',
      name: 'Education & Training',
      icon: 'fas fa-graduation-cap',
      description: 'Teaching, training, curriculum development'
    },
    {
      id: 'media',
      name: 'Media & Communication',
      icon: 'fas fa-video',
      description: 'Journalism, content creation, broadcasting'
    },
    {
      id: 'science',
      name: 'Science & Research',
      icon: 'fas fa-flask',
      description: 'Research, laboratory work, environmental science'
    },
    {
      id: 'arts',
      name: 'Arts & Culture',
      icon: 'fas fa-paint-brush',
      description: 'Fine arts, architecture, fashion design'
    },
    {
      id: 'finance',
      name: 'Finance & Economics',
      icon: 'fas fa-dollar-sign',
      description: 'Banking, investment, accounting, analysis'
    },
    {
      id: 'social',
      name: 'Social & Community',
      icon: 'fas fa-users',
      description: 'Counseling, social work, community service'
    }
  ];

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const proceedToQuestions = () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one area of interest to continue.');
      return;
    }
    setShowInterestAssessment(false);
  };

  const getSkillDescription = (score, category) => {
    if (score >= 80) {
      return `Excellent - You have strong ${category} abilities that would be valuable in many careers.`;
    } else if (score >= 60) {
      return `Good - You have solid ${category} skills that can be developed further.`;
    } else if (score >= 40) {
      return `Moderate - You have some ${category} skills that could be enhanced with training.`;
    } else {
      return `Developing - You may want to focus on building your ${category} skills.`;
    }
  };

  return (
    <ToolPageLayout 
      toolData={toolData}
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
     
      
      <CalculatorSection>
        <div className="career-assessment-calculator-page">
          <div className="career-assessment-container">
          {!showResults && !assessmentStarted && (
            <div className="career-intro-section">
              <div className="career-intro-content">
                <h2>Discover Your Ideal Career Path</h2>
                <p>Take our comprehensive career assessment to discover careers that match your skills, interests, and personality. Our AI-powered analysis will provide personalized recommendations based on your responses.</p>
                <div className="assessment-info">
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>10-15 minutes</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-question-circle"></i>
                    <span>50 questions</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-chart-line"></i>
                    <span>AI-powered analysis</span>
                  </div>
                </div>
                <button 
                  className="career-start-btn"
                  onClick={startAssessment}
                >
                  <i className="fas fa-play"></i>
                  Start Assessment
                </button>
              </div>
            </div>
          )}

          {!showResults && assessmentStarted && showInterestAssessment && (
            <div className="career-interest-section">
              <div className="interest-header">
                <h2>What are your areas of interest?</h2>
                <p>Select all areas that interest you. This helps us provide more personalized career recommendations.</p>
              </div>
              
              <div className="interest-categories-grid">
                {interestCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`interest-category ${selectedInterests.includes(category.id) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(category.id)}
                  >
                    <div className="interest-icon">
                      <i className={category.icon}></i>
                    </div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="interest-actions">
                <button 
                  className="career-proceed-btn"
                  onClick={proceedToQuestions}
                  disabled={selectedInterests.length === 0}
                >
                  <i className="fas fa-arrow-right"></i>
                  Continue to Assessment ({selectedInterests.length} selected)
                </button>
              </div>
            </div>
          )}

          {!showResults && assessmentStarted && !showInterestAssessment && currentQuestionIndex < careerQuestions.length && userAnswers.length < careerQuestions.length && (
            <div className="career-question-section">
              <div className="question-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentQuestionIndex + 1) / careerQuestions.length) * 100}%` }}
                  ></div>
                </div>
                <div className="question-counter">
                  Question {currentQuestionIndex + 1} of {careerQuestions.length}
                </div>
              </div>
              
              <div className="question-content">
                <h3 className="question-text">
                  {careerQuestions[currentQuestionIndex].question}
                </h3>
                
                <div className="answer-options">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className="answer-option"
                      onClick={() => nextQuestion(value)}
                    >
                      <span className="option-label">
                        {value === 1 && "Strongly Disagree"}
                        {value === 2 && "Disagree"}
                        {value === 3 && "Neutral"}
                        {value === 4 && "Agree"}
                        {value === 5 && "Strongly Agree"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="career-loading-section">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <h3>Analyzing Your Results</h3>
                <p>Our AI is processing your responses to provide personalized career recommendations...</p>
              </div>
            </div>
          )}

          {showResults && assessmentResults && (
            <div className="career-results-section">
              <div className="results-header">
                <h2>Your Career Assessment Results</h2>
                <div className="results-actions">
                  <button 
                    className="career-download-btn"
                    onClick={downloadResults}
                    disabled={isDownloading}
                  >
                    <i className="fas fa-download"></i>
                    {isDownloading ? 'Generating...' : 'Download Report'}
                  </button>
                  <button 
                    className="career-restart-btn"
                    onClick={restartAssessment}
                  >
                    <i className="fas fa-redo"></i>
                    Retake Assessment
                  </button>
                </div>
              </div>

              <div className="skill-scores">
                <h3>Your Skill Assessment</h3>
                <div className="score-bars">
                  <div className="score-item">
                    <label>Technical Skills</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${assessmentResults.categoryScores.technical}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{assessmentResults.categoryScores.technical}/100</span>
                  </div>
                  <div className="score-item">
                    <label>Creative Thinking</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${assessmentResults.categoryScores.creative}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{assessmentResults.categoryScores.creative}/100</span>
                  </div>
                  <div className="score-item">
                    <label>Leadership Potential</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${assessmentResults.categoryScores.leadership}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{assessmentResults.categoryScores.leadership}/100</span>
                  </div>
                  <div className="score-item">
                    <label>Interpersonal Skills</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${assessmentResults.categoryScores.interpersonal}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{assessmentResults.categoryScores.interpersonal}/100</span>
                  </div>
                </div>
              </div>

              <div className="career-recommendations">
                <h3>Your Top Career Recommendations</h3>
                <div className="recommendations-grid">
                  {assessmentResults.recommendations.careers.map((career, index) => (
                    <div key={index} className="career-card">
                      <div className="career-header">
                        <h4>{index + 1}. {career.title}</h4>
                        <span className="match-score">{career.match_score} Match</span>
                      </div>
                      <div className="career-content">
                        <p className="career-explanation">
                          <strong>Why this career fits:</strong> {career.explanation}
                        </p>
                        <p className="career-skills">
                          <strong>Required Skills:</strong> {Array.isArray(career.required_skills) ? career.required_skills.join(', ') : career.required_skills}
                        </p>
                        <p className="career-salary">
                          <strong>Salary Range:</strong> {career.salary_range}
                        </p>
                        <p className="career-growth">
                          <strong>Growth Potential:</strong> {career.growth_potential}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {assessmentResults.recommendations.summary && (
                  <div className="career-summary">
                    <h4>Summary</h4>
                    <p>{assessmentResults.recommendations.summary}</p>
                  </div>
                )}
              </div>

              <div className="career-analysis">
                <h3>Detailed Analysis</h3>
                <div className="analysis-content">
                  <p>Based on your responses, here's how your skills align with different career paths:</p>
                  <ul>
                    <li><strong>Technical Skills ({assessmentResults.categoryScores.technical}/100):</strong> {getSkillDescription(assessmentResults.categoryScores.technical, 'technical')}</li>
                    <li><strong>Creative Thinking ({assessmentResults.categoryScores.creative}/100):</strong> {getSkillDescription(assessmentResults.categoryScores.creative, 'creative')}</li>
                    <li><strong>Leadership Potential ({assessmentResults.categoryScores.leadership}/100):</strong> {getSkillDescription(assessmentResults.categoryScores.leadership, 'leadership')}</li>
                    <li><strong>Interpersonal Skills ({assessmentResults.categoryScores.interpersonal}/100):</strong> {getSkillDescription(assessmentResults.categoryScores.interpersonal, 'interpersonal')}</li>
                  </ul>
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
        <h2>Introduction</h2>
        <p>Choosing the right career path is one of the most important decisions you'll make in your life. Our Career Assessment Calculator helps you discover careers that align with your natural abilities, interests, and personality traits through a comprehensive 50-question assessment.</p>
        <p>This tool uses advanced AI analysis to provide personalized career recommendations based on your responses, helping you make informed decisions about your professional future.</p>
      </ContentSection>

      <ContentSection id="what-is-career-assessment">
        <h2>What is Career Assessment?</h2>
        <p>Career assessment is a systematic process of evaluating an individual's interests, skills, values, and personality traits to identify suitable career paths. It helps bridge the gap between self-awareness and career decision-making.</p>
        <p>Our assessment evaluates four key dimensions:</p>
        <ul>
          <li><strong>Technical Skills:</strong> Your aptitude for analytical thinking, problem-solving, and working with technology</li>
          <li><strong>Creative Thinking:</strong> Your ability to think innovatively, express creativity, and work in artistic fields</li>
          <li><strong>Leadership Potential:</strong> Your capacity to lead, manage, and influence others</li>
          <li><strong>Interpersonal Skills:</strong> Your ability to work with people, communicate effectively, and provide service</li>
        </ul>
      </ContentSection>

    

      <ContentSection id="how-to-use">
        <h2>How to Use the Career Assessment</h2>
        <ul className="usage-steps">
          <li><strong>Start the Assessment:</strong> Click "Start Assessment" to begin the 50-question evaluation. The assessment takes 10-15 minutes to complete.</li>
          <li><strong>Answer Questions Honestly:</strong> Respond to each question based on your true preferences and experiences. There are no right or wrong answers.</li>
          <li><strong>Review Your Results:</strong> Get your skill scores and AI-powered career recommendations with detailed explanations and salary information.</li>
          <li><strong>Download Your Report:</strong> Save your results as a PDF for future reference and share with career counselors or mentors.</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method">
        <div className="assessment-method-section">
          <h2>Assessment Method</h2>
          <p>Our career assessment uses a scientifically-based approach to evaluate your career preferences:</p>
          <ul>
            <li><strong>Weighted Scoring:</strong> Each question is weighted based on its importance for career prediction</li>
            <li><strong>Category Analysis:</strong> Responses are grouped into four key skill categories</li>
            <li><strong>Percentage Calculation:</strong> Scores are converted to percentages (0-100) for easy interpretation</li>
            <li><strong>AI Integration:</strong> Advanced AI analyzes your profile to suggest specific careers</li>
            <li><strong>Comprehensive Matching:</strong> Recommendations include match scores, required skills, and salary ranges</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="examples">
        <h2>Examples</h2>
        <ul className="example-steps">
          <li>
            <strong>High Technical + Creative:</strong> Strong analytical skills with creative problem-solving abilities. 
            <strong>Recommended Careers:</strong> Software Engineer, UX Designer, Data Visualization Specialist, Game Developer. 
            <strong>Why it works:</strong> These careers combine technical expertise with creative design and innovation.
          </li>
          <li>
            <strong>High Leadership + Interpersonal:</strong> Natural leader with strong people skills and communication abilities. 
            <strong>Recommended Careers:</strong> Business Manager, Human Resources Director, Sales Manager, Project Manager. 
            <strong>Why it works:</strong> These roles require both leadership capabilities and the ability to work effectively with teams.
          </li>
          <li>
            <strong>Balanced Profile:</strong> Moderate scores across all categories with slight preferences. 
            <strong>Recommended Careers:</strong> Consultant, Teacher, Marketing Specialist, Healthcare Administrator. 
            <strong>Why it works:</strong> These careers offer variety and allow you to utilize multiple skill sets.
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="significance">
        <h2>Significance of Career Assessment</h2>
        <p>Career assessment plays a crucial role in career development and decision-making:</p>
        <ul>
          <li><strong>Self-Discovery:</strong> Helps you understand your natural strengths and preferences</li>
          <li><strong>Career Exploration:</strong> Introduces you to career options you may not have considered</li>
          <li><strong>Decision Support:</strong> Provides data-driven insights to support career choices</li>
          <li><strong>Skill Development:</strong> Identifies areas for growth and professional development</li>
          <li><strong>Job Satisfaction:</strong> Increases the likelihood of finding fulfilling work that matches your personality</li>
          <li><strong>Long-term Planning:</strong> Helps you make informed decisions about education and training</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality">
        <h2>Functionality</h2>
        <p>Our Career Assessment Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Comprehensive Questionnaire:</strong> 50 carefully crafted questions covering all major career dimensions</li>
          <li><strong>Real-time Progress:</strong> Visual progress tracking throughout the assessment</li>
          <li><strong>AI-Powered Analysis:</strong> Advanced artificial intelligence provides personalized recommendations</li>
          <li><strong>Detailed Results:</strong> Skill scores, career matches, and detailed explanations</li>
          <li><strong>PDF Reports:</strong> Downloadable reports for personal records and sharing</li>
          <li><strong>Retake Option:</strong> Ability to retake the assessment as your preferences evolve</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications">
        <h2>Applications</h2>
        <div className="applications-grid">
          <div className="application-item">
            <h3>Students</h3>
            <p>High school and college students exploring career options and choosing majors</p>
          </div>
          <div className="application-item">
            <h3>Career Changers</h3>
            <p>Professionals considering a career transition or exploring new opportunities</p>
          </div>
          <div className="application-item">
            <h3>Job Seekers</h3>
            <p>Individuals looking for work and wanting to identify the best career matches</p>
          </div>
          <div className="application-item">
            <h3>Career Counselors</h3>
            <p>Professionals using the tool as part of their career guidance services</p>
          </div>
          <div className="application-item">
            <h3>HR Professionals</h3>
            <p>Human resources teams helping employees with career development</p>
          </div>
          <div className="application-item">
            <h3>Self-Exploration</h3>
            <p>Anyone interested in better understanding their career preferences and potential</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqs} />
     
    </ToolPageLayout>
  );
};

// Career Questions Data
const careerQuestions = [
  // Technical Skills & Problem Solving (10 questions)
  {
    question: "I enjoy solving complex technical problems and puzzles.",
    category: "technical",
    weight: 1.2
  },
  {
    question: "I prefer working with computers and technology over people.",
    category: "technical",
    weight: 1.0
  },
  {
    question: "I like to understand how things work and take them apart to see the mechanisms.",
    category: "technical",
    weight: 1.1
  },
  {
    question: "I enjoy programming or working with software applications.",
    category: "technical",
    weight: 1.3
  },
  {
    question: "I prefer jobs that require analytical thinking and logical reasoning.",
    category: "technical",
    weight: 1.2
  },
  {
    question: "I enjoy working with data and statistics.",
    category: "technical",
    weight: 1.1
  },
  {
    question: "I like to build or create things with my hands.",
    category: "technical",
    weight: 0.9
  },
  {
    question: "I prefer structured, systematic approaches to problem-solving.",
    category: "technical",
    weight: 1.0
  },
  {
    question: "I enjoy learning new technical skills and staying updated with technology.",
    category: "technical",
    weight: 1.1
  },
  {
    question: "I prefer jobs that require precision and attention to detail.",
    category: "technical",
    weight: 1.0
  },

  // Creative & Artistic (10 questions)
  {
    question: "I enjoy expressing myself through art, music, or creative writing.",
    category: "creative",
    weight: 1.3
  },
  {
    question: "I prefer jobs that allow me to be creative and innovative.",
    category: "creative",
    weight: 1.2
  },
  {
    question: "I enjoy thinking outside the box and coming up with unique solutions.",
    category: "creative",
    weight: 1.1
  },
  {
    question: "I like to work on projects that involve design and aesthetics.",
    category: "creative",
    weight: 1.2
  },
  {
    question: "I prefer flexible work environments that allow for creative expression.",
    category: "creative",
    weight: 1.0
  },
  {
    question: "I enjoy storytelling and communicating ideas in engaging ways.",
    category: "creative",
    weight: 1.1
  },
  {
    question: "I like to experiment with different approaches and methods.",
    category: "creative",
    weight: 1.0
  },
  {
    question: "I prefer jobs that involve visual or multimedia content creation.",
    category: "creative",
    weight: 1.2
  },
  {
    question: "I enjoy brainstorming sessions and collaborative creative work.",
    category: "creative",
    weight: 1.0
  },
  {
    question: "I like to work on projects that have artistic or cultural significance.",
    category: "creative",
    weight: 1.1
  },

  // Leadership & Management (10 questions)
  {
    question: "I enjoy taking charge and leading teams or projects.",
    category: "leadership",
    weight: 1.3
  },
  {
    question: "I prefer jobs that involve managing people and resources.",
    category: "leadership",
    weight: 1.2
  },
  {
    question: "I enjoy making important decisions that affect others.",
    category: "leadership",
    weight: 1.1
  },
  {
    question: "I like to motivate and inspire others to achieve their goals.",
    category: "leadership",
    weight: 1.2
  },
  {
    question: "I prefer positions of authority and responsibility.",
    category: "leadership",
    weight: 1.1
  },
  {
    question: "I enjoy strategic planning and long-term thinking.",
    category: "leadership",
    weight: 1.0
  },
  {
    question: "I like to coordinate and organize complex projects.",
    category: "leadership",
    weight: 1.1
  },
  {
    question: "I prefer jobs that involve public speaking or presentations.",
    category: "leadership",
    weight: 1.0
  },
  {
    question: "I enjoy mentoring and developing others' skills.",
    category: "leadership",
    weight: 1.1
  },
  {
    question: "I like to be recognized as an expert or authority in my field.",
    category: "leadership",
    weight: 1.0
  },

  // Interpersonal & Communication (10 questions)
  {
    question: "I enjoy working directly with people and helping them.",
    category: "interpersonal",
    weight: 1.3
  },
  {
    question: "I prefer jobs that involve customer service or client interaction.",
    category: "interpersonal",
    weight: 1.2
  },
  {
    question: "I enjoy teaching or training others.",
    category: "interpersonal",
    weight: 1.1
  },
  {
    question: "I like to work in teams and collaborate with others.",
    category: "interpersonal",
    weight: 1.1
  },
  {
    question: "I prefer jobs that involve counseling or advising people.",
    category: "interpersonal",
    weight: 1.2
  },
  {
    question: "I enjoy networking and building professional relationships.",
    category: "interpersonal",
    weight: 1.0
  },
  {
    question: "I like to mediate conflicts and help people resolve issues.",
    category: "interpersonal",
    weight: 1.1
  },
  {
    question: "I prefer jobs that involve sales or persuasion.",
    category: "interpersonal",
    weight: 1.0
  },
  {
    question: "I enjoy working with diverse groups of people.",
    category: "interpersonal",
    weight: 1.0
  },
  {
    question: "I like to provide emotional support and care to others.",
    category: "interpersonal",
    weight: 1.2
  },

  // Work Environment & Values (10 questions)
  {
    question: "I prefer stable, predictable work environments.",
    category: "environment",
    weight: 1.0
  },
  {
    question: "I enjoy working in fast-paced, dynamic environments.",
    category: "environment",
    weight: 1.0
  },
  {
    question: "I prefer jobs that offer high earning potential.",
    category: "values",
    weight: 1.0
  },
  {
    question: "I value work-life balance over high salaries.",
    category: "values",
    weight: 1.0
  },
  {
    question: "I prefer jobs that allow me to work independently.",
    category: "environment",
    weight: 1.0
  },
  {
    question: "I enjoy jobs that involve travel and new experiences.",
    category: "environment",
    weight: 1.0
  },
  {
    question: "I prefer jobs that contribute to society or help others.",
    category: "values",
    weight: 1.0
  },
  {
    question: "I value job security and benefits over other factors.",
    category: "values",
    weight: 1.0
  },
  {
    question: "I prefer jobs that offer opportunities for advancement.",
    category: "values",
    weight: 1.0
  },
  {
    question: "I enjoy jobs that involve research and continuous learning.",
    category: "values",
    weight: 1.0
  }
];

// Career Categories and their associated careers
const careerCategories = {
  technical: [
    "Software Engineer",
    "Data Scientist",
    "AI/ML Engineer",
    "Cybersecurity Analyst",
    "Systems Administrator",
    "Network Engineer",
    "Database Administrator",
    "DevOps Engineer",
    "Quality Assurance Engineer",
    "Technical Support Specialist",
    "IT Project Manager",
    "Cloud Architect",
    "Blockchain Developer",
    "Game Developer",
    "Mobile App Developer"
  ],
  creative: [
    "Graphic Designer",
    "Video Editor",
    "Motion Graphics Designer",
    "UI/UX Designer",
    "Web Developer",
    "Content Creator",
    "Digital Marketing Specialist",
    "Social Media Manager",
    "Brand Manager",
    "Creative Director",
    "Photographer",
    "Videographer",
    "Animator",
    "Illustrator",
    "Art Director"
  ],
  leadership: [
    "Project Manager",
    "Product Manager",
    "Business Manager",
    "Operations Manager",
    "Human Resources Manager",
    "Sales Manager",
    "Marketing Manager",
    "Executive Director",
    "Consultant",
    "Entrepreneur",
    "Program Manager",
    "Team Lead",
    "Scrum Master",
    "Business Analyst",
    "Strategy Consultant"
  ],
  interpersonal: [
    "Teacher",
    "Counselor",
    "Sales Representative",
    "Customer Success Manager",
    "Human Resources Specialist",
    "Recruiter",
    "Social Worker",
    "Training Coordinator",
    "Community Manager",
    "Customer Service Manager",
    "Life Coach",
    "Career Counselor",
    "Event Coordinator",
    "Public Relations Specialist",
    "Client Relations Manager"
  ],
  healthcare: [
    "Doctor",
    "Nurse Practitioner",
    "Physician Assistant",
    "Physical Therapist",
    "Occupational Therapist",
    "Pharmacist",
    "Medical Laboratory Technician",
    "Radiologic Technologist",
    "Respiratory Therapist",
    "Medical Assistant",
    "Mental Health Counselor",
    "Dental Hygienist",
    "Veterinarian",
    "Medical Researcher",
    "Healthcare Administrator"
  ],
  finance: [
    "Financial Analyst",
    "Accountant",
    "Financial Advisor",
    "Investment Banker",
    "Actuary",
    "Credit Analyst",
    "Budget Analyst",
    "Tax Specialist",
    "Risk Manager",
    "Treasury Analyst",
    "Portfolio Manager",
    "Insurance Underwriter",
    "Real Estate Agent",
    "Financial Planner",
    "Compliance Officer"
  ],
  education: [
    "Teacher",
    "Professor",
    "Educational Administrator",
    "Curriculum Developer",
    "Special Education Teacher",
    "School Counselor",
    "Librarian",
    "Corporate Trainer",
    "Instructional Designer",
    "Education Consultant",
    "Online Course Creator",
    "Educational Technology Specialist",
    "Academic Advisor",
    "Learning and Development Specialist",
    "Educational Researcher"
  ],
  science: [
    "Research Scientist",
    "Data Scientist",
    "Laboratory Technician",
    "Biologist",
    "Chemist",
    "Physicist",
    "Environmental Scientist",
    "Geologist",
    "Meteorologist",
    "Astronomer",
    "Forensic Scientist",
    "Biomedical Engineer",
    "Materials Scientist",
    "Agricultural Scientist",
    "Marine Biologist"
  ],
  media: [
    "Video Editor",
    "Content Creator",
    "Podcast Producer",
    "Journalist",
    "Broadcast Producer",
    "Film Director",
    "Screenwriter",
    "Radio Host",
    "News Anchor",
    "Documentary Filmmaker",
    "Streaming Content Creator",
    "Media Planner",
    "Public Relations Specialist",
    "Social Media Influencer",
    "Digital Content Manager"
  ],
  arts: [
    "Graphic Designer",
    "Illustrator",
    "Animator",
    "Photographer",
    "Videographer",
    "Art Director",
    "Creative Director",
    "Fine Artist",
    "Sculptor",
    "Painter",
    "Digital Artist",
    "Concept Artist",
    "Fashion Designer",
    "Interior Designer",
    "Architect"
  ],
  technology: [
    "Software Engineer",
    "AI/ML Engineer",
    "Data Scientist",
    "Cybersecurity Analyst",
    "Cloud Architect",
    "DevOps Engineer",
    "Blockchain Developer",
    "Game Developer",
    "Mobile App Developer",
    "Robotics Engineer",
    "IoT Developer",
    "AR/VR Developer",
    "Quantum Computing Engineer",
    "Tech Startup Founder",
    "Technology Consultant"
  ],
  business: [
    "Business Analyst",
    "Management Consultant",
    "Entrepreneur",
    "Business Development Manager",
    "Operations Manager",
    "Strategy Consultant",
    "Investment Analyst",
    "Market Research Analyst",
    "Business Intelligence Analyst",
    "Supply Chain Manager",
    "Procurement Manager",
    "Business Operations Specialist",
    "Corporate Development Manager",
    "Business Process Analyst",
    "Startup Advisor"
  ]
};

export default CareerAssessmentCalculator;
