import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/trauma-assessment-calculator.css';

const TraumaAssessmentCalculator = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const toolData = {
    name: "Trauma Assessment Calculator",
    title: "Trauma Assessment Calculator",
    description: "A comprehensive trauma assessment tool to help identify potential trauma-related symptoms and provide personalized insights for healing and recovery.",
    icon: "fas fa-heart",
    category: "knowledge",
    breadcrumb: ["Knowledge", "Calculators", "Trauma Assessment"],
    tags: ["trauma", "assessment", "mental health", "ptsd", "healing", "recovery"],
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
    { name: "Career Assessment Calculator", url: "/knowledge/calculators/career-assessment-calculator", icon: "fas fa-briefcase" },
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator", icon: "fas fa-language" },
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-birthday-cake" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-trauma-assessment', title: 'What is Trauma Assessment?' },
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
      question: "Is this a diagnostic tool?",
      answer: "No, this assessment is not a diagnostic tool. It's designed to raise awareness about potential trauma impacts and provide insights for self-reflection. For proper diagnosis and treatment, please consult with a qualified mental health professional."
    },
    {
      question: "How accurate are the results?",
      answer: "This assessment provides a general indication of trauma-related symptoms based on your responses. The results should be used as a starting point for self-reflection and discussion with mental health professionals, not as a definitive diagnosis."
    },
    {
      question: "Should I be concerned about my results?",
      answer: "If your results indicate significant symptoms, it's recommended to speak with a mental health professional who specializes in trauma. Remember that healing is possible, and seeking support is an important step toward recovery."
    },
    {
      question: "How long does the assessment take?",
      answer: "The assessment typically takes 5-10 minutes to complete. It includes 20 questions that you can answer at your own pace. Take your time to provide thoughtful responses for the most accurate results."
    },
    {
      question: "Are my results confidential?",
      answer: "Yes, all assessment data is processed locally in your browser and is not stored on our servers. You can download your results as a PDF for your personal records."
    },
    {
      question: "Can I retake the assessment?",
      answer: "Yes, you can retake the assessment as many times as you want. Your responses may change over time as you work on healing and recovery, so periodic reassessment can be valuable."
    }
  ];

  const startAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAssessmentResults(null);
    setShowResults(false);
    setAssessmentStarted(true);
    setAdditionalInfo('');
  };

  const nextQuestion = (answer) => {
    const newAnswers = [...userAnswers, {
      question: traumaQuestions[currentQuestionIndex].question,
      answer: answer,
      category: traumaQuestions[currentQuestionIndex].category,
      weight: traumaQuestions[currentQuestionIndex].weight
    }];
    
    setUserAnswers(newAnswers);
    
    if (currentQuestionIndex < traumaQuestions.length - 1) {
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
        totalScore: Object.values(categoryScores).reduce((sum, score) => sum + score, 0),
        maxScore: traumaQuestions.length * 4
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing results:', error);
      // Fallback results without AI
      const categoryScores = calculateCategoryScores(answers);
      setAssessmentResults({
        categoryScores,
        recommendations: {
          interpretation: "Based on your responses, you may be experiencing some trauma-related symptoms. Consider speaking with a mental health professional for support.",
          selfCareStrategies: [
            "Practice grounding techniques when feeling overwhelmed",
            "Establish a consistent sleep routine",
            "Engage in gentle physical movement",
            "Connect with supportive people",
            "Consider journaling to process feelings"
          ]
        },
        totalScore: Object.values(categoryScores).reduce((sum, score) => sum + score, 0),
        maxScore: traumaQuestions.length * 4
      });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryScores = (answers) => {
    const scores = {
      anxiety: 0,
      intrusive: 0,
      avoidance: 0,
      negative: 0,
      functional: 0
    };

    answers.forEach((answer, index) => {
      const score = answer.answer || 0;
      const category = traumaQuestions[index].category;
      scores[category] += score;
    });

    return scores;
  };

  const getAIRecommendations = async (categoryScores) => {
    try {
      const prompt = `You are a compassionate trauma-informed mental health educator. Based on the following trauma assessment results, provide thoughtful, supportive insights. Focus on validation, normalization of trauma responses, and gentle suggestions for self-care and healing.

Assessment Results:
- Total Score: ${Object.values(categoryScores).reduce((sum, score) => sum + score, 0)} out of 80
- Hyperarousal & Anxiety Score: ${categoryScores.anxiety}/16
- Intrusive Thoughts & Memories Score: ${categoryScores.intrusive}/16
- Avoidance Behaviors Score: ${categoryScores.avoidance}/16
- Negative Mood & Cognition Score: ${categoryScores.negative}/16
- Functional Impairment Score: ${categoryScores.functional}/16

${additionalInfo ? `Additional Information: ${additionalInfo}` : 'No additional information provided.'}

Please provide:
1. A brief, compassionate interpretation of these results
2. Validation of the person's experiences
3. 5-7 specific self-care strategies based on their highest scoring categories
4. A gentle reminder about professional support if needed
5. An encouraging message about healing and resilience

Keep your response under 500 words and use a warm, supportive tone. Format with clear sections: "Understanding Your Results", "Personalized Self-Care Strategies", and "Moving Forward".`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      return {
        interpretation: aiResponse,
        selfCareStrategies: []
      };
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw error;
    }
  };

  const loadPDFLibraries = () => {
    return new Promise((resolve, reject) => {
      if (window.jsPDF) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
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
    const doc = new window.jsPDF();
    
    const logoImg = new Image();
    logoImg.src = '/images/logo.png';
    
    logoImg.onload = function() {
      const imgWidth = 40;
      const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
      doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Trauma Assessment Results', 105, imgHeight + 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 40, { align: 'center' });
      
      generatePDFContent(doc, imgHeight + 50);
    };
    
    logoImg.onerror = function() {
      console.error('Error loading logo image');
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Trauma Assessment Results', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
      
      generatePDFContent(doc, 50);
    };
  };

  const generatePDFContent = (doc, startY) => {
    const wrapText = (text, maxWidth, x, y, doc) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 5);
    };

    const checkPageBreak = (yPos, doc) => {
      if (yPos > 250) {
        doc.addPage();
        return 20;
      }
      return yPos;
    };

    // Add scores
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Assessment Scores', 20, startY);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    let yPos = startY + 15;
    
    const totalScore = assessmentResults.totalScore;
    const maxScore = assessmentResults.maxScore;
    const percentage = (totalScore / maxScore) * 100;
    
    doc.text(`Total Score: ${totalScore}/${maxScore}`, 20, yPos);
    yPos += 10;
    
    let severityLevel = "Minimal";
    if (percentage >= 75) severityLevel = "Significant";
    else if (percentage >= 50) severityLevel = "Moderate";
    else if (percentage >= 25) severityLevel = "Mild";
    
    doc.text(`Severity Level: ${severityLevel}`, 20, yPos);
    yPos += 15;
    
    // Add category scores
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Category Scores:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`• Hyperarousal & Anxiety: ${assessmentResults.categoryScores.anxiety}/16`, 25, yPos);
    yPos += 8;
    doc.text(`• Intrusive Thoughts & Memories: ${assessmentResults.categoryScores.intrusive}/16`, 25, yPos);
    yPos += 8;
    doc.text(`• Avoidance Behaviors: ${assessmentResults.categoryScores.avoidance}/16`, 25, yPos);
    yPos += 8;
    doc.text(`• Negative Mood & Cognition: ${assessmentResults.categoryScores.negative}/16`, 25, yPos);
    yPos += 8;
    doc.text(`• Functional Impairment: ${assessmentResults.categoryScores.functional}/16`, 25, yPos);
    yPos += 15;
    
    // Check for page break before interpretation
    yPos = checkPageBreak(yPos, doc);
    
    // Add interpretation
    if (assessmentResults.recommendations.interpretation) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('AI Analysis & Recommendations', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      // Clean the interpretation text for PDF
      const cleanText = assessmentResults.recommendations.interpretation
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\n\n/g, '\n') // Clean up line breaks
        .trim();
      
      yPos = wrapText(cleanText, 170, 20, yPos, doc);
      yPos += 15;
    }
    
    // Check for page break before disclaimer
    yPos = checkPageBreak(yPos, doc);
    
    // Add professional help recommendation if score is high
    if (totalScore > 40) {
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69); // Red color for emphasis
      doc.text('Important Note:', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      const recommendationText = 'Based on your assessment score, we strongly recommend speaking with a mental health professional who specializes in trauma. Sharing your experiences with a trusted friend or family member can also be beneficial for support.';
      yPos = wrapText(recommendationText, 170, 20, yPos, doc);
      yPos += 15;
    }
    
    // Add disclaimer at the bottom of the last page
    doc.setFontSize(10);
    doc.setTextColor(153, 153, 153);
    const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about potential trauma impacts. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    
    // Position disclaimer at the bottom of the page
    const disclaimerY = doc.internal.pageSize.height - 20;
    doc.text(splitDisclaimer, 20, disclaimerY);
    
    doc.save('trauma-assessment-results.pdf');
  };

  const restartAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAssessmentResults(null);
    setShowResults(false);
    setIsLoading(false);
    setAssessmentStarted(false);
    setAdditionalInfo('');
  };

  const getSeverityLevel = (totalScore, maxScore) => {
    const percentage = (totalScore / maxScore) * 100;
    if (percentage >= 75) return { level: "Significant", color: "#dc3545" };
    if (percentage >= 50) return { level: "Moderate", color: "#fd7e14" };
    if (percentage >= 25) return { level: "Mild", color: "#ffc107" };
    return { level: "Minimal", color: "#28a745" };
  };

  return (
    <ToolPageLayout
      toolData={toolData}
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection>
        <div className="trauma-assessment-calculator-page">
          <div className="trauma-assessment-container">
            {!showResults && !assessmentStarted && (
              <div className="trauma-intro-section">
                <div className="trauma-intro-content">
                  <h2>Trauma Assessment & Recovery Support</h2>
                  <p>Take our comprehensive trauma assessment to better understand your experiences and receive personalized insights for healing and recovery. Our AI-powered analysis provides compassionate guidance based on your responses.</p>
                  <div className="trauma-assessment-info">
                    <div className="trauma-info-item">
                      <i className="fas fa-clock"></i>
                      <span>5-10 minutes</span>
                    </div>
                    <div className="trauma-info-item">
                      <i className="fas fa-question-circle"></i>
                      <span>20 questions</span>
                    </div>
                    <div className="trauma-info-item">
                      <i className="fas fa-heart"></i>
                      <span>Compassionate analysis</span>
                    </div>
                  </div>
                  <button 
                    className="trauma-start-btn"
                    onClick={startAssessment}
                  >
                    <i className="fas fa-play"></i>
                    Start Assessment
                  </button>
                </div>
              </div>
            )}

            {!showResults && assessmentStarted && currentQuestionIndex < traumaQuestions.length && userAnswers.length < traumaQuestions.length && (
              <div className="trauma-question-section">
                <div className="trauma-question-progress">
                  <div className="trauma-progress-bar">
                    <div 
                      className="trauma-progress-fill"
                      style={{ width: `${((currentQuestionIndex + 1) / traumaQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="trauma-question-counter">
                    Question {currentQuestionIndex + 1} of {traumaQuestions.length}
                  </div>
                </div>
                
                <div className="trauma-question-content">
                  <h3 className="trauma-question-text">
                    {traumaQuestions[currentQuestionIndex].question}
                  </h3>
                  
                  <div className="trauma-answer-options">
                    {[0, 1, 2, 3, 4].map((value) => (
                      <button
                        key={value}
                        className="trauma-answer-option"
                        onClick={() => nextQuestion(value)}
                      >
                        <span className="trauma-option-label">
                          {value === 0 && "Not at all"}
                          {value === 1 && "A little bit"}
                          {value === 2 && "Moderately"}
                          {value === 3 && "Quite a bit"}
                          {value === 4 && "Extremely"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!showResults && isLoading && (
              <div className="trauma-loading-section">
                <div className="trauma-loading-content">
                  <div className="trauma-loading-spinner"></div>
                  <h3>Analyzing Your Results</h3>
                  <p>Our AI is processing your responses to provide personalized insights and recommendations...</p>
                </div>
              </div>
            )}

            {showResults && assessmentResults && (
              <div className="trauma-results-section">
                <div className="trauma-results-header">
                  <h2>Your Assessment Results</h2>
                  <div className="trauma-results-actions">
                    <button 
                      className="trauma-download-btn"
                      onClick={downloadResults}
                      disabled={isDownloading}
                    >
                      <i className="fas fa-download"></i>
                      {isDownloading ? 'Generating...' : 'Download Report'}
                    </button>
                    <button 
                      className="trauma-restart-btn"
                      onClick={restartAssessment}
                    >
                      <i className="fas fa-redo"></i>
                      Retake Assessment
                    </button>
                  </div>
                </div>

                <div className="trauma-score-summary">
                  <div className="trauma-total-score">
                    <h3>Total Score</h3>
                    <div className="trauma-score-value">
                      {assessmentResults.totalScore}/{assessmentResults.maxScore}
                    </div>
                    <div 
                      className="trauma-severity-indicator"
                      style={{ color: getSeverityLevel(assessmentResults.totalScore, assessmentResults.maxScore).color }}
                    >
                      {getSeverityLevel(assessmentResults.totalScore, assessmentResults.maxScore).level}
                    </div>
                  </div>
                </div>

                <div className="trauma-category-scores">
                  <h3>Category Breakdown</h3>
                  <div className="trauma-score-bars">
                    <div className="trauma-score-item">
                      <label>Hyperarousal & Anxiety</label>
                      <div className="trauma-score-bar">
                        <div 
                          className="trauma-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.anxiety / 16) * 100}%` }}
                        ></div>
                      </div>
                      <span className="trauma-score-value">{assessmentResults.categoryScores.anxiety}/16</span>
                    </div>
                    <div className="trauma-score-item">
                      <label>Intrusive Thoughts & Memories</label>
                      <div className="trauma-score-bar">
                        <div 
                          className="trauma-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.intrusive / 16) * 100}%` }}
                        ></div>
                      </div>
                      <span className="trauma-score-value">{assessmentResults.categoryScores.intrusive}/16</span>
                    </div>
                    <div className="trauma-score-item">
                      <label>Avoidance Behaviors</label>
                      <div className="trauma-score-bar">
                        <div 
                          className="trauma-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.avoidance / 16) * 100}%` }}
                        ></div>
                      </div>
                      <span className="trauma-score-value">{assessmentResults.categoryScores.avoidance}/16</span>
                    </div>
                    <div className="trauma-score-item">
                      <label>Negative Mood & Cognition</label>
                      <div className="trauma-score-bar">
                        <div 
                          className="trauma-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.negative / 16) * 100}%` }}
                        ></div>
                      </div>
                      <span className="trauma-score-value">{assessmentResults.categoryScores.negative}/16</span>
                    </div>
                    <div className="trauma-score-item">
                      <label>Functional Impairment</label>
                      <div className="trauma-score-bar">
                        <div 
                          className="trauma-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.functional / 16) * 100}%` }}
                        ></div>
                      </div>
                      <span className="trauma-score-value">{assessmentResults.categoryScores.functional}/16</span>
                    </div>
                  </div>
                </div>

                <div className="trauma-recommendations">
                  <h3>Personalized Insights & Recommendations</h3>
                  <div className="trauma-ai-analysis">
                    {assessmentResults.recommendations.interpretation && (
                      <div className="trauma-ai-response">
                        {assessmentResults.recommendations.interpretation}
                      </div>
                    )}
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
        <h2>Understanding Trauma Assessment</h2>
        <p>Trauma assessment is a compassionate process designed to help individuals understand how difficult experiences may be affecting their wellbeing. This tool provides insights into potential trauma-related symptoms and offers personalized recommendations for healing and recovery.</p>
        <p>Our assessment is based on established trauma research and focuses on five key areas: hyperarousal and anxiety, intrusive thoughts and memories, avoidance behaviors, negative mood and cognition, and functional impairment.</p>
      </ContentSection>

      <ContentSection id="what-is-trauma-assessment">
        <h2>What is Trauma Assessment?</h2>
        <p>Trauma assessment is a structured evaluation process that helps identify how traumatic experiences may be impacting an individual's mental health, relationships, and daily functioning. It's not a diagnostic tool, but rather a way to raise awareness and provide guidance for healing.</p>
        <p>This assessment covers the core symptoms associated with trauma-related conditions, including PTSD, and provides a foundation for understanding your experiences and seeking appropriate support.</p>
      </ContentSection>

      <ContentSection id="assessment-categories">
        <h2>Assessment Categories</h2>
        <div className="trauma-categories-grid">
          <div className="trauma-category-item">
            <h4><i className="fas fa-exclamation-triangle"></i> Hyperarousal & Anxiety</h4>
            <p>Constant alertness, difficulty sleeping, being easily startled, and experiencing sudden anxiety or panic.</p>
          </div>
          <div className="trauma-category-item">
            <h4><i className="fas fa-brain"></i> Intrusive Thoughts & Memories</h4>
            <p>Unwanted memories, flashbacks, nightmares, and intense reactions to trauma-related triggers.</p>
          </div>
          <div className="trauma-category-item">
            <h4><i className="fas fa-shield-alt"></i> Avoidance Behaviors</h4>
            <p>Avoiding people, places, or activities that remind you of difficult experiences, and feeling disconnected from others.</p>
          </div>
          <div className="trauma-category-item">
            <h4><i className="fas fa-cloud-rain"></i> Negative Mood & Cognition</h4>
            <p>Persistent negative beliefs, self-blame, difficulty experiencing positive emotions, and ongoing negative feelings.</p>
          </div>
          <div className="trauma-category-item">
            <h4><i className="fas fa-tasks"></i> Functional Impairment</h4>
            <p>Impact on work, relationships, concentration, memory, and engagement in risky or self-destructive behaviors.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use">
        <h2>How to Use the Trauma Assessment</h2>
        <ul className="trauma-usage-steps">
          <li><strong>Start the Assessment:</strong> Click "Start Assessment" to begin the 20-question evaluation. The assessment takes 5-10 minutes to complete.</li>
          <li><strong>Answer Honestly:</strong> Respond to each question based on your experiences over the past month. There are no right or wrong answers.</li>
          <li><strong>Review Your Results:</strong> Get your category scores and AI-powered personalized insights and recommendations.</li>
          <li><strong>Download Your Report:</strong> Save your results as a PDF for future reference and share with mental health professionals if desired.</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method">
        <div className="trauma-assessment-method-section">
          <h2>Assessment Method</h2>
          <p>Our trauma assessment uses a scientifically-based approach to evaluate trauma-related symptoms:</p>
          <ul>
            <li><strong>Category-Based Scoring:</strong> Questions are grouped into five key trauma symptom categories</li>
            <li><strong>Likert Scale:</strong> Each question uses a 0-4 scale (Not at all to Extremely) for precise measurement</li>
            <li><strong>Weighted Analysis:</strong> Different categories may have varying impacts on overall wellbeing</li>
            <li><strong>AI Integration:</strong> Advanced AI analyzes your profile to provide personalized insights</li>
            <li><strong>Comprehensive Recommendations:</strong> Results include self-care strategies and professional support guidance</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="examples">
        <h2>Examples</h2>
        <ul className="trauma-example-steps">
          <li>
            <strong>Minimal Symptoms (0-20 points):</strong> You may experience occasional stress or difficult emotions, but they don't significantly impact your daily life. 
            <strong>Recommendation:</strong> Continue practicing good self-care and consider speaking with a trusted person if symptoms persist.
          </li>
          <li>
            <strong>Mild Symptoms (21-40 points):</strong> You may be experiencing some trauma-related difficulties that could benefit from additional support. 
            <strong>Recommendation:</strong> Consider exploring self-help resources or speaking with a mental health professional.
          </li>
          <li>
            <strong>Moderate to Significant Symptoms (41-80 points):</strong> Your symptoms may be significantly impacting your wellbeing and daily functioning. 
            <strong>Recommendation:</strong> It's recommended to consult with a mental health professional who specializes in trauma.
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="significance">
        <h2>Significance of Trauma Assessment</h2>
        <p>Trauma assessment plays a crucial role in understanding and addressing trauma-related difficulties:</p>
        <ul>
          <li><strong>Self-Awareness:</strong> Helps you recognize how trauma may be affecting your life</li>
          <li><strong>Validation:</strong> Confirms that your experiences and reactions are understandable responses to difficult events</li>
          <li><strong>Guidance:</strong> Provides direction for seeking appropriate support and treatment</li>
          <li><strong>Healing Foundation:</strong> Creates a starting point for recovery and personal growth</li>
          <li><strong>Professional Communication:</strong> Helps you articulate your experiences when speaking with mental health professionals</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality">
        <h2>How the Assessment Works</h2>
        <p>The trauma assessment evaluates your experiences across five key symptom categories:</p>
        <ul>
          <li><strong>Hyperarousal & Anxiety:</strong> Measures constant alertness, sleep difficulties, and anxiety responses</li>
          <li><strong>Intrusive Thoughts & Memories:</strong> Assesses unwanted memories, flashbacks, and trigger reactions</li>
          <li><strong>Avoidance Behaviors:</strong> Evaluates avoidance patterns and emotional detachment</li>
          <li><strong>Negative Mood & Cognition:</strong> Examines negative beliefs, self-blame, and emotional difficulties</li>
          <li><strong>Functional Impairment:</strong> Measures impact on work, relationships, and daily functioning</li>
        </ul>
        <p>Each category is scored independently, and the total score provides an overall indication of trauma-related symptom severity.</p>
      </ContentSection>

      <ContentSection id="applications">
        <h2>Applications</h2>
        <div className="applications-grid">
          <div className="application-item">
            <h3>Self-Reflection</h3>
            <p>Individuals seeking to understand how trauma may be affecting their wellbeing</p>
          </div>
          <div className="application-item">
            <h3>Mental Health Professionals</h3>
            <p>Therapists and counselors using the tool as part of their assessment process</p>
          </div>
          <div className="application-item">
            <h3>Support Groups</h3>
            <p>Trauma support groups using the assessment for group discussions and individual reflection</p>
          </div>
          <div className="application-item">
            <h3>Research & Education</h3>
            <p>Researchers and educators studying trauma responses and recovery processes</p>
          </div>
          <div className="application-item">
            <h3>Family & Friends</h3>
            <p>Loved ones seeking to better understand trauma and how to provide support</p>
          </div>
          <div className="application-item">
            <h3>Healthcare Providers</h3>
            <p>Medical professionals incorporating trauma-informed care into their practice</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqs} />
    </ToolPageLayout>
  );
};

// Trauma Assessment Questions
const traumaQuestions = [
  // Hyperarousal & Anxiety (0-3)
  {
    question: "I feel constantly on edge or alert for danger.",
    category: "anxiety",
    weight: 1.0
  },
  {
    question: "I am easily startled by unexpected noises or movements.",
    category: "anxiety",
    weight: 1.0
  },
  {
    question: "I have difficulty falling or staying asleep.",
    category: "anxiety",
    weight: 1.0
  },
  {
    question: "I experience sudden feelings of anxiety or panic.",
    category: "anxiety",
    weight: 1.0
  },

  // Intrusive Thoughts & Memories (4-7)
  {
    question: "I have unwanted memories of distressing events that come into my mind suddenly.",
    category: "intrusive",
    weight: 1.0
  },
  {
    question: "I experience flashbacks where I feel like I'm reliving a distressing event.",
    category: "intrusive",
    weight: 1.0
  },
  {
    question: "I have nightmares related to difficult experiences.",
    category: "intrusive",
    weight: 1.0
  },
  {
    question: "Certain triggers (sounds, smells, situations) cause intense emotional or physical reactions.",
    category: "intrusive",
    weight: 1.0
  },

  // Avoidance Behaviors (8-11)
  {
    question: "I avoid people, places, or activities that might remind me of distressing experiences.",
    category: "avoidance",
    weight: 1.0
  },
  {
    question: "I find it difficult to talk about certain past experiences.",
    category: "avoidance",
    weight: 1.0
  },
  {
    question: "I try to push away thoughts or feelings related to difficult experiences.",
    category: "avoidance",
    weight: 1.0
  },
  {
    question: "I feel detached or disconnected from others.",
    category: "avoidance",
    weight: 1.0
  },

  // Negative Mood & Cognition (12-15)
  {
    question: "I have persistent negative beliefs about myself, others, or the world.",
    category: "negative",
    weight: 1.0
  },
  {
    question: "I blame myself for bad things that have happened.",
    category: "negative",
    weight: 1.0
  },
  {
    question: "I experience persistent negative emotions (fear, horror, anger, guilt, or shame).",
    category: "negative",
    weight: 1.0
  },
  {
    question: "I have difficulty experiencing positive emotions like happiness or love.",
    category: "negative",
    weight: 1.0
  },

  // Functional Impairment (16-19)
  {
    question: "My symptoms interfere with my ability to work or study.",
    category: "functional",
    weight: 1.0
  },
  {
    question: "My symptoms affect my relationships with family or friends.",
    category: "functional",
    weight: 1.0
  },
  {
    question: "I have difficulty concentrating or remembering things.",
    category: "functional",
    weight: 1.0
  },
  {
    question: "I engage in risky or self-destructive behavior.",
    category: "functional",
    weight: 1.0
  }
];

export default TraumaAssessmentCalculator;
