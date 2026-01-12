import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/anxiety-assessment-calculator.css';

const AnxietyAssessmentCalculator = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const toolData = {
    name: "Anxiety Assessment Calculator",
    title: "Anxiety Assessment Calculator",
    description: "A comprehensive anxiety assessment tool to help identify anxiety symptoms and provide personalized insights for managing anxiety and building resilience.",
    icon: "fas fa-heart",
    category: "knowledge",
    breadcrumb: ["Knowledge", "Calculators", "Anxiety Assessment"],
    tags: ["anxiety", "assessment", "mental health", "stress", "wellbeing", "coping"],
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
    { name: "Trauma Assessment Calculator", url: "/knowledge/calculators/trauma-assessment-calculator", icon: "fas fa-heart" },
    { name: "Career Assessment Calculator", url: "/knowledge/calculators/career-assessment-calculator", icon: "fas fa-briefcase" },
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator", icon: "fas fa-language" },
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-birthday-cake" }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-anxiety-assessment', title: 'What is Anxiety Assessment?' },
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
      answer: "No, this assessment is not a diagnostic tool. It's designed to raise awareness about anxiety symptoms and provide insights for self-reflection. For proper diagnosis and treatment, please consult with a qualified mental health professional."
    },
    {
      question: "How accurate are the results?",
      answer: "This assessment provides a general indication of anxiety symptoms based on your responses. The results should be used as a starting point for self-reflection and discussion with mental health professionals, not as a definitive diagnosis."
    },
    {
      question: "Should I be concerned about my results?",
      answer: "If your results indicate significant anxiety symptoms, it's recommended to speak with a mental health professional who specializes in anxiety. Remember that effective treatments are available, and many people experience significant improvement with proper care."
    },
    {
      question: "How long does the assessment take?",
      answer: "The assessment typically takes 5-10 minutes to complete. It includes 21 questions that you can answer at your own pace. Take your time to provide thoughtful responses for the most accurate results."
    },
    {
      question: "Are my results confidential?",
      answer: "Yes, all assessment data is processed locally in your browser and is not stored on our servers. You can download your results as a PDF for your personal records."
    },
    {
      question: "Can I retake the assessment?",
      answer: "Yes, you can retake the assessment as many times as you want. Your responses may change over time as you work on managing anxiety, so periodic reassessment can be valuable."
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
      question: anxietyQuestions[currentQuestionIndex].question,
      answer: answer,
      category: anxietyQuestions[currentQuestionIndex].category,
      weight: anxietyQuestions[currentQuestionIndex].weight
    }];
    
    setUserAnswers(newAnswers);
    
    if (currentQuestionIndex < anxietyQuestions.length - 1) {
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
        maxScore: anxietyQuestions.length * 3
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing results:', error);
      // Fallback results without AI
      const categoryScores = calculateCategoryScores(answers);
      setAssessmentResults({
        categoryScores,
        recommendations: {
          interpretation: "Based on your responses, you may be experiencing some anxiety symptoms. Consider speaking with a mental health professional for support.",
          selfCareStrategies: [
            "Practice deep breathing exercises when feeling anxious",
            "Establish a consistent sleep routine",
            "Engage in regular physical activity",
            "Limit caffeine and alcohol",
            "Try mindfulness meditation",
            "Consider journaling to process anxious thoughts",
            "Connect with supportive people"
          ]
        },
        totalScore: Object.values(categoryScores).reduce((sum, score) => sum + score, 0),
        maxScore: anxietyQuestions.length * 3
      });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryScores = (answers) => {
    const scores = {
      psychological: 0,
      physical: 0,
      behavioral: 0,
      social: 0,
      cognitive: 0
    };

    answers.forEach((answer, index) => {
      const score = answer.answer || 0;
      const category = anxietyQuestions[index].category;
      scores[category] += score;
    });

    return scores;
  };

  const getAIRecommendations = async (categoryScores) => {
    try {
      const prompt = `You are a compassionate mental health educator specializing in anxiety. Based on the following anxiety assessment results, provide thoughtful, supportive insights. Focus on validation, normalization of anxiety responses, and gentle suggestions for self-care and management.

Assessment Results:
- Total Score: ${Object.values(categoryScores).reduce((sum, score) => sum + score, 0)} out of 63
- Psychological Symptoms Score: ${categoryScores.psychological}/15
- Physical Symptoms Score: ${categoryScores.physical}/15
- Behavioral Changes Score: ${categoryScores.behavioral}/15
- Social Impact Score: ${categoryScores.social}/9
- Cognitive Patterns Score: ${categoryScores.cognitive}/9

${additionalInfo ? `Additional Information: ${additionalInfo}` : 'No additional information provided.'}

Please provide:
1. A brief, compassionate interpretation of these results
2. Validation of the person's experiences with anxiety
3. 5-7 specific self-care strategies based on their highest scoring categories
4. A gentle reminder about professional support if needed
5. An encouraging message about managing anxiety and building resilience

Format your response with clear sections: "Understanding Your Results", "Personalized Self-Care Strategies", and "Moving Forward".
Keep your response under 500 words and use a warm, supportive tone.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API}`, {
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
      doc.text('Anxiety Assessment Results', 105, imgHeight + 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, imgHeight + 40, { align: 'center' });
      
      generatePDFContent(doc, imgHeight + 50);
    };
    
    logoImg.onerror = function() {
      console.error('Error loading logo image');
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Anxiety Assessment Results', 105, 20, { align: 'center' });
      
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
    
    let severityLevel = "Minimal Anxiety";
    if (percentage >= 75) severityLevel = "Severe Anxiety";
    else if (percentage >= 50) severityLevel = "Moderate Anxiety";
    else if (percentage >= 25) severityLevel = "Mild Anxiety";
    
    doc.text(`Severity Level: ${severityLevel}`, 20, yPos);
    yPos += 15;
    
    // Add category scores
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Category Scores:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`• Psychological Symptoms: ${assessmentResults.categoryScores.psychological}/15`, 25, yPos);
    yPos += 8;
    doc.text(`• Physical Symptoms: ${assessmentResults.categoryScores.physical}/15`, 25, yPos);
    yPos += 8;
    doc.text(`• Behavioral Changes: ${assessmentResults.categoryScores.behavioral}/15`, 25, yPos);
    yPos += 8;
    doc.text(`• Social Impact: ${assessmentResults.categoryScores.social}/9`, 25, yPos);
    yPos += 8;
    doc.text(`• Cognitive Patterns: ${assessmentResults.categoryScores.cognitive}/9`, 25, yPos);
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
    if (totalScore > 30) {
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69); // Red color for emphasis
      doc.text('Important Note:', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      const recommendationText = 'Based on your assessment score, we recommend speaking with a mental health professional who specializes in anxiety. Sharing your experiences with a trusted friend or family member can also be beneficial for support.';
      yPos = wrapText(recommendationText, 170, 20, yPos, doc);
      yPos += 15;
    }
    
    // Add disclaimer at the bottom of the last page
    doc.setFontSize(10);
    doc.setTextColor(153, 153, 153);
    const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about anxiety symptoms. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    
    // Position disclaimer at the bottom of the page
    const disclaimerY = doc.internal.pageSize.height - 20;
    doc.text(splitDisclaimer, 20, disclaimerY);
    
    doc.save('anxiety-assessment-results.pdf');
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
    if (percentage >= 75) return { level: "Severe Anxiety", color: "#dc3545" };
    if (percentage >= 50) return { level: "Moderate Anxiety", color: "#fd7e14" };
    if (percentage >= 25) return { level: "Mild Anxiety", color: "#ffc107" };
    return { level: "Minimal Anxiety", color: "#28a745" };
  };

  return (
    <ToolPageLayout
      toolData={toolData}
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection>
        <div className="anxiety-assessment-calculator-page">
          <div className="anxiety-assessment-container">
            {!showResults && !assessmentStarted && (
              <div className="anxiety-intro-section">
                <div className="anxiety-intro-content">
                  <h2>Anxiety Assessment & Management Support</h2>
                  <p>Take our comprehensive anxiety assessment to better understand your anxiety symptoms and receive personalized insights for managing anxiety and building resilience. Our AI-powered analysis provides compassionate guidance based on your responses.</p>
                  <div className="anxiety-assessment-info">
                    <div className="anxiety-info-item">
                      <i className="fas fa-clock"></i>
                      <span>5-10 minutes</span>
                    </div>
                    <div className="anxiety-info-item">
                      <i className="fas fa-question-circle"></i>
                      <span>21 questions</span>
                    </div>
                    <div className="anxiety-info-item">
                      <i className="fas fa-heart"></i>
                      <span>Compassionate analysis</span>
                    </div>
                  </div>
                  <button 
                    className="anxiety-start-btn"
                    onClick={startAssessment}
                  >
                    <i className="fas fa-play"></i>
                    Start Assessment
                  </button>
                </div>
              </div>
            )}

            {!showResults && assessmentStarted && currentQuestionIndex < anxietyQuestions.length && userAnswers.length < anxietyQuestions.length && (
              <div className="anxiety-question-section">
                <div className="anxiety-question-progress">
                  <div className="anxiety-progress-bar">
                    <div 
                      className="anxiety-progress-fill"
                      style={{ width: `${((currentQuestionIndex + 1) / anxietyQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="anxiety-question-counter">
                    Question {currentQuestionIndex + 1} of {anxietyQuestions.length}
                  </div>
                </div>
                
                <div className="anxiety-question-content">
                  <h3 className="anxiety-question-text">
                    {anxietyQuestions[currentQuestionIndex].question}
                  </h3>
                  
                  <div className="anxiety-answer-options">
                    {[0, 1, 2, 3].map((value) => (
                      <button
                        key={value}
                        className="anxiety-answer-option"
                        onClick={() => nextQuestion(value)}
                      >
                        <span className="anxiety-option-label">
                          {value === 0 && "Not at all"}
                          {value === 1 && "Several days"}
                          {value === 2 && "More than half the days"}
                          {value === 3 && "Nearly every day"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!showResults && isLoading && (
              <div className="anxiety-loading-section">
                <div className="anxiety-loading-content">
                  <div className="anxiety-loading-spinner"></div>
                  <h3>Analyzing Your Results</h3>
                  <p>Our AI is processing your responses to provide personalized insights and recommendations...</p>
                </div>
              </div>
            )}

            {showResults && assessmentResults && (
              <div className="anxiety-results-section">
                <div className="anxiety-results-header">
                  <h2>Your Assessment Results</h2>
                  <div className="anxiety-results-actions">
                    <button 
                      className="anxiety-download-btn"
                      onClick={downloadResults}
                      disabled={isDownloading}
                    >
                      <i className="fas fa-download"></i>
                      {isDownloading ? 'Generating...' : 'Download Report'}
                    </button>
                    <button 
                      className="anxiety-restart-btn"
                      onClick={restartAssessment}
                    >
                      <i className="fas fa-redo"></i>
                      Retake Assessment
                    </button>
                  </div>
                </div>

                <div className="anxiety-score-summary">
                  <div className="anxiety-total-score">
                    <h3>Total Score</h3>
                    <div className="anxiety-score-value">
                      {assessmentResults.totalScore}/{assessmentResults.maxScore}
                    </div>
                    <div 
                      className="anxiety-severity-indicator"
                      style={{ color: getSeverityLevel(assessmentResults.totalScore, assessmentResults.maxScore).color }}
                    >
                      {getSeverityLevel(assessmentResults.totalScore, assessmentResults.maxScore).level}
                    </div>
                  </div>
                </div>

                <div className="anxiety-category-scores">
                  <h3>Category Breakdown</h3>
                  <div className="anxiety-score-bars">
                    <div className="anxiety-score-item">
                      <label>Psychological Symptoms</label>
                      <div className="anxiety-score-bar">
                        <div 
                          className="anxiety-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.psychological / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="anxiety-score-value">{assessmentResults.categoryScores.psychological}/15</span>
                    </div>
                    <div className="anxiety-score-item">
                      <label>Physical Symptoms</label>
                      <div className="anxiety-score-bar">
                        <div 
                          className="anxiety-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.physical / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="anxiety-score-value">{assessmentResults.categoryScores.physical}/15</span>
                    </div>
                    <div className="anxiety-score-item">
                      <label>Behavioral Changes</label>
                      <div className="anxiety-score-bar">
                        <div 
                          className="anxiety-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.behavioral / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="anxiety-score-value">{assessmentResults.categoryScores.behavioral}/15</span>
                    </div>
                    <div className="anxiety-score-item">
                      <label>Social Impact</label>
                      <div className="anxiety-score-bar">
                        <div 
                          className="anxiety-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.social / 9) * 100}%` }}
                        ></div>
                      </div>
                      <span className="anxiety-score-value">{assessmentResults.categoryScores.social}/9</span>
                    </div>
                    <div className="anxiety-score-item">
                      <label>Cognitive Patterns</label>
                      <div className="anxiety-score-bar">
                        <div 
                          className="anxiety-score-fill"
                          style={{ width: `${(assessmentResults.categoryScores.cognitive / 9) * 100}%` }}
                        ></div>
                      </div>
                      <span className="anxiety-score-value">{assessmentResults.categoryScores.cognitive}/9</span>
                    </div>
                  </div>
                </div>

                <div className="anxiety-recommendations">
                  <h3>Personalized Insights & Recommendations</h3>
                  <div className="anxiety-ai-analysis">
                    {assessmentResults.recommendations.interpretation && (
                      <div className="anxiety-ai-response">
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
        <h2>Understanding Anxiety Assessment</h2>
        <p>Anxiety assessment is a compassionate process designed to help individuals understand how anxiety may be affecting their daily life and wellbeing. This tool provides insights into anxiety symptoms across different categories and offers personalized recommendations for managing anxiety effectively.</p>
        <p>Our assessment is based on established anxiety research and focuses on five key areas: psychological symptoms, physical symptoms, behavioral changes, social impact, and cognitive patterns.</p>
      </ContentSection>

      <ContentSection id="what-is-anxiety-assessment">
        <h2>What is Anxiety Assessment?</h2>
        <p>Anxiety assessment is a structured evaluation process that helps identify how anxiety may be impacting an individual's mental health, physical wellbeing, and daily functioning. It's not a diagnostic tool, but rather a way to raise awareness and provide guidance for anxiety management.</p>
        <p>This assessment covers the core symptoms associated with anxiety disorders and provides a foundation for understanding your experiences and seeking appropriate support.</p>
      </ContentSection>

      <ContentSection id="assessment-categories">
        <h2>Assessment Categories</h2>
        <div className="anxiety-categories-grid">
          <div className="anxiety-category-item">
            <h4><i className="fas fa-brain"></i> Psychological Symptoms</h4>
            <p>Feelings of nervousness, worry, fear, and emotional distress that characterize anxiety experiences.</p>
          </div>
          <div className="anxiety-category-item">
            <h4><i className="fas fa-heartbeat"></i> Physical Symptoms</h4>
            <p>Bodily manifestations of anxiety including racing heart, shortness of breath, muscle tension, and sleep problems.</p>
          </div>
          <div className="anxiety-category-item">
            <h4><i className="fas fa-running"></i> Behavioral Changes</h4>
            <p>Changes in behavior patterns including avoidance, restlessness, appetite changes, and coping strategies.</p>
          </div>
          <div className="anxiety-category-item">
            <h4><i className="fas fa-users"></i> Social Impact</h4>
            <p>How anxiety affects work performance, relationships, and social interactions in daily life.</p>
          </div>
          <div className="anxiety-category-item">
            <h4><i className="fas fa-lightbulb"></i> Cognitive Patterns</h4>
            <p>Thought patterns including concentration difficulties, intrusive thoughts, and overthinking or rumination.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use">
        <h2>How to Use the Anxiety Assessment</h2>
        <ul className="anxiety-usage-steps">
          <li><strong>Start the Assessment:</strong> Click "Start Assessment" to begin the 21-question evaluation. The assessment takes 5-10 minutes to complete.</li>
          <li><strong>Answer Honestly:</strong> Respond to each question based on your experiences over the past 2 weeks. There are no right or wrong answers.</li>
          <li><strong>Review Your Results:</strong> Get your category scores and AI-powered personalized insights and recommendations.</li>
          <li><strong>Download Your Report:</strong> Save your results as a PDF for future reference and share with mental health professionals if desired.</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method">
        <div className="anxiety-assessment-method-section">
          <h2>Assessment Method</h2>
          <p>Our anxiety assessment uses a scientifically-based approach to evaluate anxiety symptoms:</p>
          <ul>
            <li><strong>Category-Based Scoring:</strong> Questions are grouped into five key anxiety symptom categories</li>
            <li><strong>Likert Scale:</strong> Each question uses a 0-3 scale (Not at all to Nearly every day) for precise measurement</li>
            <li><strong>Weighted Analysis:</strong> Different categories may have varying impacts on overall anxiety levels</li>
            <li><strong>AI Integration:</strong> Advanced AI analyzes your profile to provide personalized insights</li>
            <li><strong>Comprehensive Recommendations:</strong> Results include self-care strategies and professional support guidance</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="examples">
        <h2>Examples</h2>
        <ul className="anxiety-example-steps">
          <li>
            <strong>Minimal Anxiety (0-15 points):</strong> You may experience occasional anxiety, but it doesn't significantly impact your daily life. 
            <strong>Recommendation:</strong> Continue practicing good self-care and consider speaking with a trusted person if symptoms persist.
          </li>
          <li>
            <strong>Mild Anxiety (16-31 points):</strong> You may be experiencing some anxiety symptoms that could benefit from additional support. 
            <strong>Recommendation:</strong> Consider exploring self-help resources or speaking with a mental health professional.
          </li>
          <li>
            <strong>Moderate to Severe Anxiety (32-63 points):</strong> Your anxiety symptoms may be significantly impacting your wellbeing and daily functioning. 
            <strong>Recommendation:</strong> It's recommended to consult with a mental health professional who specializes in anxiety.
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="significance">
        <h2>Significance of Anxiety Assessment</h2>
        <p>Anxiety assessment plays a crucial role in understanding and addressing anxiety-related difficulties:</p>
        <ul>
          <li><strong>Self-Awareness:</strong> Helps you recognize how anxiety may be affecting your life</li>
          <li><strong>Validation:</strong> Confirms that your experiences and reactions are understandable responses to stress</li>
          <li><strong>Guidance:</strong> Provides direction for seeking appropriate support and treatment</li>
          <li><strong>Management Foundation:</strong> Creates a starting point for anxiety management and personal growth</li>
          <li><strong>Professional Communication:</strong> Helps you articulate your experiences when speaking with mental health professionals</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality">
        <h2>How the Assessment Works</h2>
        <p>The anxiety assessment evaluates your experiences across five key symptom categories:</p>
        <ul>
          <li><strong>Psychological Symptoms:</strong> Measures emotional aspects like worry, fear, and nervousness</li>
          <li><strong>Physical Symptoms:</strong> Assesses bodily manifestations like heart palpitations and muscle tension</li>
          <li><strong>Behavioral Changes:</strong> Evaluates avoidance patterns and coping behaviors</li>
          <li><strong>Social Impact:</strong> Examines effects on work, relationships, and social functioning</li>
          <li><strong>Cognitive Patterns:</strong> Measures thought patterns like concentration difficulties and rumination</li>
        </ul>
        <p>Each category is scored independently, and the total score provides an overall indication of anxiety symptom severity.</p>
      </ContentSection>

      <ContentSection id="applications">
        <h2>Applications</h2>
        <div className="applications-grid">
          <div className="application-item">
            <h3>Self-Reflection</h3>
            <p>Individuals seeking to understand how anxiety may be affecting their wellbeing</p>
          </div>
          <div className="application-item">
            <h3>Mental Health Professionals</h3>
            <p>Therapists and counselors using the tool as part of their assessment process</p>
          </div>
          <div className="application-item">
            <h3>Support Groups</h3>
            <p>Anxiety support groups using the assessment for group discussions and individual reflection</p>
          </div>
          <div className="application-item">
            <h3>Research & Education</h3>
            <p>Researchers and educators studying anxiety responses and management strategies</p>
          </div>
          <div className="application-item">
            <h3>Family & Friends</h3>
            <p>Loved ones seeking to better understand anxiety and how to provide support</p>
          </div>
          <div className="application-item">
            <h3>Healthcare Providers</h3>
            <p>Medical professionals incorporating anxiety-informed care into their practice</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqs} />
    </ToolPageLayout>
  );
};

// Anxiety Assessment Questions
const anxietyQuestions = [
  // Psychological Symptoms (0-4)
  {
    question: "Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?",
    category: "psychological",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you been unable to stop or control worrying?",
    category: "psychological",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you worried too much about different things?",
    category: "psychological",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you had trouble relaxing?",
    category: "psychological",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you felt afraid, as if something awful might happen?",
    category: "psychological",
    weight: 1.0
  },

  // Physical Symptoms (5-9)
  {
    question: "Over the last 2 weeks, how often have you experienced a racing heart or palpitations?",
    category: "physical",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you experienced shortness of breath or difficulty breathing?",
    category: "physical",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you experienced muscle tension or body aches?",
    category: "physical",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you experienced sweating, hot flashes, or chills?",
    category: "physical",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you experienced sleep problems (difficulty falling asleep, staying asleep, or restless sleep)?",
    category: "physical",
    weight: 1.0
  },

  // Behavioral Changes (10-14)
  {
    question: "Over the last 2 weeks, how often have you avoided situations that might trigger anxiety?",
    category: "behavioral",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you found yourself unable to sit still or feeling restless?",
    category: "behavioral",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you experienced changes in appetite (eating too much or too little)?",
    category: "behavioral",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you relied on substances (alcohol, medication, etc.) to manage anxiety?",
    category: "behavioral",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you engaged in repetitive behaviors to reduce anxiety?",
    category: "behavioral",
    weight: 1.0
  },

  // Social Impact (15-17)
  {
    question: "Over the last 2 weeks, how often has anxiety interfered with your work or academic performance?",
    category: "social",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often has anxiety affected your relationships with family, friends, or colleagues?",
    category: "social",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you avoided social situations due to anxiety?",
    category: "social",
    weight: 1.0
  },

  // Cognitive Patterns (18-20)
  {
    question: "Over the last 2 weeks, how often have you experienced difficulty concentrating due to worry?",
    category: "cognitive",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you experienced intrusive or unwanted thoughts?",
    category: "cognitive",
    weight: 1.0
  },
  {
    question: "Over the last 2 weeks, how often have you found yourself overthinking or ruminating on problems?",
    category: "cognitive",
    weight: 1.0
  }
];

export default AnxietyAssessmentCalculator;
