// Anxiety Assessment Calculator JavaScript
// API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Assessment questions
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

// Assessment state
let currentQuestion = 0;
let answers = new Array(anxietyQuestions.length).fill(null);
let categoryScores = {
  psychological: 0,
  physical: 0,
  behavioral: 0,
  social: 0,
  cognitive: 0
};

// Start assessment
function startAssessment() {
  currentQuestion = 0;
  answers = new Array(anxietyQuestions.length).fill(null);
  categoryScores = {
    psychological: 0,
    physical: 0,
    behavioral: 0,
    social: 0,
    cognitive: 0
  };
  
  // Hide intro section and show question section
  const introSection = document.getElementById('intro-section');
  const questionSection = document.getElementById('question-section');
  
  if (introSection) introSection.style.display = 'none';
  if (questionSection) questionSection.style.display = 'block';
  
  loadQuestion(0);
}

// Load question
function loadQuestion(index) {
  if (index >= anxietyQuestions.length) {
    showAdditionalInfoSection();
    return;
  }
  
  const questionText = document.getElementById('question-text');
  const questionCounter = document.getElementById('question-counter');
  const progressFill = document.getElementById('progress-fill');
  
  if (questionText) questionText.textContent = anxietyQuestions[index].question;
  if (questionCounter) questionCounter.textContent = `Question ${index + 1}/${anxietyQuestions.length}`;
  if (progressFill) progressFill.style.width = `${((index + 1) / anxietyQuestions.length) * 100}%`;
  
  // Clear previous selection
  document.querySelectorAll('input[name="answer"]').forEach(radio => {
    radio.checked = false;
  });
  
  // Set previous answer if available
  if (answers[index] !== null) {
    const selectedRadio = document.querySelector(`input[name="answer"][value="${answers[index]}"]`);
    if (selectedRadio) selectedRadio.checked = true;
  }
  
  currentQuestion = index;
}

// Handle next question
function handleNextQuestion() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  
  if (selectedOption) {
    answers[currentQuestion] = parseInt(selectedOption.value);
    
    // Move to next question
    if (currentQuestion < anxietyQuestions.length - 1) {
      loadQuestion(currentQuestion + 1);
    } else {
      showAdditionalInfoSection();
    }
  }
}

// Show additional info section
function showAdditionalInfoSection() {
  const questionSection = document.getElementById('question-section');
  const additionalInfoSection = document.getElementById('additional-info-section');
  
  if (questionSection) questionSection.style.display = 'none';
  if (additionalInfoSection) additionalInfoSection.style.display = 'block';
}

// Show loading section
function showLoadingSection() {
  const additionalInfoSection = document.getElementById('additional-info-section');
  const loadingSection = document.getElementById('loading-section');
  
  if (additionalInfoSection) additionalInfoSection.style.display = 'none';
  if (loadingSection) loadingSection.style.display = 'block';
}

// Show results section
function showResultsSection() {
  const loadingSection = document.getElementById('loading-section');
  const resultSection = document.getElementById('result-section');
  
  if (loadingSection) loadingSection.style.display = 'none';
  if (resultSection) resultSection.style.display = 'block';
}

// Calculate scores based on answers
function calculateScores() {
  // Reset category scores
  categoryScores = {
    psychological: 0,
    physical: 0,
    behavioral: 0,
    social: 0,
    cognitive: 0
  };
  
  // Calculate scores for each category
  for (let i = 0; i < answers.length; i++) {
    const score = answers[i] || 0;
    
    // Assign score to appropriate category
    if (i < 5) {
      categoryScores.psychological += score;
    } else if (i < 10) {
      categoryScores.physical += score;
    } else if (i < 15) {
      categoryScores.behavioral += score;
    } else if (i < 18) {
      categoryScores.social += score;
    } else {
      categoryScores.cognitive += score;
    }
  }
}

// Get total score
function getTotalScore() {
  return Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
}

// Update score display
function updateScoreDisplay() {
  const totalScore = getTotalScore();
  const maxScore = anxietyQuestions.length * 3;
  const percentage = (totalScore / maxScore) * 100;
  
  // Update total score
  const totalScoreElement = document.getElementById('total-score');
  if (totalScoreElement) totalScoreElement.textContent = totalScore;
  
  // Set severity level
  const severityLevelElement = document.getElementById('severity-level');
  if (severityLevelElement) {
    if (percentage < 25) {
      severityLevelElement.textContent = "Minimal Anxiety";
      severityLevelElement.className = "severity-indicator minimal";
    } else if (percentage < 50) {
      severityLevelElement.textContent = "Mild Anxiety";
      severityLevelElement.className = "severity-indicator mild";
    } else if (percentage < 75) {
      severityLevelElement.textContent = "Moderate Anxiety";
      severityLevelElement.className = "severity-indicator moderate";
    } else {
      severityLevelElement.textContent = "Severe Anxiety";
      severityLevelElement.className = "severity-indicator severe";
    }
  }
  
  // Update category scores
  updateCategoryScores();
}

// Update category score displays
function updateCategoryScores() {
  const maxCategoryScores = {
    psychological: 15,
    physical: 15,
    behavioral: 15,
    social: 9,
    cognitive: 9
  };
  
  // Update score bars and values
  Object.keys(categoryScores).forEach(category => {
    const score = categoryScores[category];
    const maxScore = maxCategoryScores[category];
    const percentage = (score / maxScore) * 100;
    
    const barElement = document.getElementById(`${category}-score`);
    const valueElement = document.getElementById(`${category}-value`);
    
    if (barElement) {
      barElement.style.width = `${percentage}%`;
      setBarColor(barElement, score, maxScore);
    }
    
    if (valueElement) {
      valueElement.textContent = `${score}/${maxScore}`;
    }
  });
}

// Set bar color based on score
function setBarColor(barElement, score, maxScore) {
  const percentage = (score / maxScore) * 100;
  
  if (percentage < 25) {
    barElement.style.backgroundColor = "#28a745"; // Green
  } else if (percentage < 50) {
    barElement.style.backgroundColor = "#ffc107"; // Yellow
  } else if (percentage < 75) {
    barElement.style.backgroundColor = "#fd7e14"; // Orange
  } else {
    barElement.style.backgroundColor = "#dc3545"; // Red
  }
}

// Set basic interpretation
function setBasicInterpretation(totalScore, maxScore) {
  const percentage = (totalScore / maxScore) * 100;
  const assessmentInterpretationElement = document.getElementById('assessment-interpretation');
  
  if (!assessmentInterpretationElement) return;
  
  let interpretation = "";
  
  if (percentage < 25) {
    interpretation = `
      <p>Your responses suggest minimal anxiety symptoms. While everyone experiences anxiety at times, your current symptom level appears to be within a manageable range.</p>
      <p>It's always beneficial to maintain good self-care practices and healthy coping strategies to support your continued wellbeing.</p>
    `;
  } else if (percentage < 50) {
    interpretation = `
      <p>Your responses suggest mild anxiety symptoms. You may be experiencing some difficulties that could benefit from additional support or coping strategies.</p>
      <p>Consider exploring self-help resources or speaking with a trusted person about your experiences. If symptoms persist or worsen, consulting with a mental health professional could be helpful.</p>
    `;
  } else if (percentage < 75) {
    interpretation = `
      <p>Your responses suggest moderate anxiety symptoms. This level of anxiety can significantly impact daily functioning and quality of life.</p>
      <p>Consider speaking with a healthcare provider about your symptoms. There are effective treatments available, including therapy, lifestyle changes, and sometimes medication.</p>
    `;
  } else {
    interpretation = `
      <p>Your responses suggest severe anxiety symptoms. This level of anxiety can substantially interfere with daily activities and wellbeing.</p>
      <p>It's strongly recommended to consult with a mental health professional who can provide appropriate support and treatment options. Remember that effective treatments are available, and many people experience significant improvement with proper care.</p>
    `;
  }
  
  assessmentInterpretationElement.innerHTML = interpretation;
}

// Generate AI insights using Gemini API
async function generateAIInsights() {
  const additionalInfoInput = document.getElementById('additional-info');
  const additionalInfo = additionalInfoInput ? additionalInfoInput.value.trim() : '';
  const totalScore = getTotalScore();
  const maxScore = anxietyQuestions.length * 3;
  const percentage = (totalScore / maxScore) * 100;
  
  // Determine anxiety level for prompt
  let anxietyLevel = "minimal";
  if (percentage >= 75) anxietyLevel = "severe";
  else if (percentage >= 50) anxietyLevel = "moderate";
  else if (percentage >= 25) anxietyLevel = "mild";
  
  // Prepare data for AI analysis
  const promptData = {
    contents: [
      {
        parts: [
          {
            text: `You are a compassionate mental health educator specializing in anxiety. You're analyzing results from an anxiety assessment tool. Please provide thoughtful, supportive insights based on the following assessment results. Focus on validation, normalization of anxiety responses, and gentle suggestions for self-care and management. Do NOT provide a diagnosis or claim to replace professional mental health care.

Assessment Results:
- Total Score: ${totalScore} out of ${maxScore} (${anxietyLevel} anxiety level)
- Psychological Symptoms Score: ${categoryScores.psychological}/15
- Physical Symptoms Score: ${categoryScores.physical}/15
- Behavioral Changes Score: ${categoryScores.behavioral}/15
- Social Impact Score: ${categoryScores.social}/9
- Cognitive Patterns Score: ${categoryScores.cognitive}/9

${additionalInfo ? `Additional Information Provided: ${additionalInfo}` : 'No additional information provided.'}

Please provide:
1. A brief, compassionate interpretation of these results
2. Validation of the person's experiences with anxiety
3. 5-7 specific self-care strategies that might be helpful based on their highest scoring categories
4. A gentle reminder about the importance of professional support if needed (especially if their anxiety level is moderate or severe)
5. An encouraging message about managing anxiety and building resilience

Format your response with clear sections for "Understanding Your Results", "Personalized Self-Care Strategies", and "Moving Forward".
Keep your response under 500 words and use a warm, supportive tone.`
          }
        ]
      }
    ]
  };
  
  try {
    const aiAnalysisElement = document.getElementById('ai-analysis');
    if (aiAnalysisElement) {
      aiAnalysisElement.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Generating personalized insights...</p>
      `;
    }
    
    console.log('Making API request to Gemini...');
    
    // Set timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out')), 15000);
    });
    
    // Make API request with timeout
    const response = await Promise.race([
      fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptData)
      }),
      timeoutPromise
    ]);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`Failed to generate insights: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response received:', data);
    
    // Extract text from the response
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Store the AI response for PDF generation
    window.aiResponseText = aiResponse;
    
    // Format and display AI insights
    if (aiAnalysisElement) {
      aiAnalysisElement.innerHTML = `<div class="ai-response">${formatAIResponse(aiResponse)}</div>`;
    }
    
  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    // Show fallback content if API fails
    const fallbackContent = `
      <h4>Understanding Your Results</h4>
      <p>Based on your responses, you may be experiencing some anxiety symptoms that are impacting your wellbeing.</p>
      
      <h4>Personalized Self-Care Strategies</h4>
      <ul>
        <li>Practice deep breathing exercises when feeling anxious (inhale for 4 counts, hold for 2, exhale for 6)</li>
        <li>Establish a consistent sleep routine to support your nervous system</li>
        <li>Engage in regular physical activity, even if it's just a short daily walk</li>
        <li>Limit caffeine and alcohol, which can worsen anxiety symptoms</li>
        <li>Try mindfulness meditation to help stay present and reduce worry</li>
        <li>Consider journaling to process anxious thoughts</li>
        <li>Connect with supportive people who understand your experiences</li>
      </ul>
      
      <h4>Moving Forward</h4>
      <p>If your anxiety symptoms are significantly impacting your daily life, consider speaking with a mental health professional. Many effective treatments exist for anxiety, including therapy, lifestyle changes, and sometimes medication.</p>
      <p>Remember that experiencing anxiety doesn't mean you're weak - it's a common human experience, and with the right support and tools, you can learn to manage it effectively.</p>
    `;
    
    // Store fallback content for PDF
    window.aiResponseText = fallbackContent.replace(/<[^>]*>/g, '');
    
    const aiAnalysisElement = document.getElementById('ai-analysis');
    if (aiAnalysisElement) {
      aiAnalysisElement.innerHTML = fallbackContent;
    }
  }
}

// Format AI response with simple markdown-like formatting
function formatAIResponse(text) {
  // Replace line breaks with paragraphs
  let formatted = text.replace(/\n\n/g, '</p><p>');
  
  // Format section headers
  formatted = formatted.replace(/^(Understanding Your Results|Personalized Self-Care Strategies|Moving Forward):/gm, '<h4>$1</h4>');
  
  // Format numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  
  // Format bullet points
  formatted = formatted.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap lists in ul tags
  formatted = formatted.replace(/(<li>.+<\/li>)\n(<li>.+<\/li>)/gs, '<ul>$1$2</ul>');
  
  // Format bold text
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Wrap in paragraph tags if not already
  if (!formatted.startsWith('<p>') && !formatted.startsWith('<h4>') && !formatted.startsWith('<ul>')) {
    formatted = '<p>' + formatted + '</p>';
  }
  
  return formatted;
}

// Submit assessment and show results
async function submitAssessment() {
  // Hide additional info section
  const additionalInfoSection = document.getElementById('additional-info-section');
  if (additionalInfoSection) additionalInfoSection.style.display = 'none';
  
  // Show loading section
  showLoadingSection();
  
  // Calculate scores
  calculateScores();
  
  // Update UI with scores
  updateScoreDisplay();
  
  // Generate basic interpretation
  setBasicInterpretation(getTotalScore(), anxietyQuestions.length * 3);
  
  try {
    // Generate AI insights with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI analysis timed out')), 15000)
    );
    
    await Promise.race([
      generateAIInsights(),
      timeoutPromise
    ]);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Show fallback content if AI analysis fails or times out
    const aiAnalysisElement = document.getElementById('ai-analysis');
    if (aiAnalysisElement) {
      aiAnalysisElement.innerHTML = `
        <p>We've prepared a basic analysis based on your responses. Here are some general recommendations:</p>
        <ul>
          <li>Practice regular self-care activities that help you feel grounded and safe</li>
          <li>Consider speaking with a trusted friend, family member, or professional about your experiences</li>
          <li>Explore mindfulness and relaxation techniques to help manage difficult emotions</li>
          <li>Remember that healing from anxiety takes time and patience with yourself</li>
        </ul>
      `;
    }
  } finally {
    // Hide loading section
    const loadingSection = document.getElementById('loading-section');
    if (loadingSection) loadingSection.style.display = 'none';
    
    // Show result section
    showResultsSection();
  }
}

// Download results as PDF
function downloadResults() {
  // Check if jsPDF is available
  if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
    alert('PDF generation is not available. Please try again later.');
    return;
  }
  
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  
  // Add logo
  const logoImg = new Image();
  logoImg.src = '/images/logo.png';
  
  logoImg.onload = function() {
    // Calculate aspect ratio to maintain proportions
    const imgWidth = 40;
    const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
    
    // Add logo at top center
    doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text('Anxiety Assessment Results', 105, imgHeight + 25, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, imgHeight + 40);
    
    // Add scores
    doc.setFontSize(16);
    doc.text('Assessment Scores', 20, imgHeight + 50);
    
    doc.setFontSize(12);
    doc.text(`Total Score: ${getTotalScore()}/${anxietyQuestions.length * 3}`, 20, imgHeight + 60);
    
    const totalScore = getTotalScore();
    const maxScore = anxietyQuestions.length * 3;
    const percentage = (totalScore / maxScore) * 100;
    let severityLevel = "Minimal Anxiety";
    if (percentage >= 75) severityLevel = "Severe Anxiety";
    else if (percentage >= 50) severityLevel = "Moderate Anxiety";
    else if (percentage >= 25) severityLevel = "Mild Anxiety";
    
    doc.text(`Severity Level: ${severityLevel}`, 20, imgHeight + 67);
    
    // Add category scores
    doc.text('Category Scores:', 20, imgHeight + 77);
    doc.text(`• Psychological Symptoms: ${categoryScores.psychological}/15`, 25, imgHeight + 84);
    doc.text(`• Physical Symptoms: ${categoryScores.physical}/15`, 25, imgHeight + 91);
    doc.text(`• Behavioral Changes: ${categoryScores.behavioral}/15`, 25, imgHeight + 98);
    doc.text(`• Social Impact: ${categoryScores.social}/9`, 25, imgHeight + 105);
    doc.text(`• Cognitive Patterns: ${categoryScores.cognitive}/9`, 25, imgHeight + 112);
    
    // Add basic interpretation
    doc.setFontSize(16);
    doc.text('Basic Interpretation', 20, imgHeight + 125);
    
    // Get basic interpretation text
    const assessmentInterpretationElement = document.getElementById('assessment-interpretation');
    const basicInterpretation = assessmentInterpretationElement ? assessmentInterpretationElement.textContent.trim() : '';
    
    // Add basic interpretation with word wrapping
    doc.setFontSize(12);
    const splitBasicInterpretation = doc.splitTextToSize(basicInterpretation, 170);
    doc.text(splitBasicInterpretation, 20, imgHeight + 135);
    
    // Calculate the Y position after the basic interpretation
    let yPosition = imgHeight + 135 + (splitBasicInterpretation.length * 7);
    
    // Add AI insights if available
    const aiAnalysisElement = document.getElementById('ai-analysis');
    if (aiAnalysisElement && aiAnalysisElement.textContent.trim()) {
      // Add some spacing
      yPosition += 10;
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text('AI Analysis & Personalized Recommendations', 20, yPosition);
      yPosition += 10;
      
      // Get AI analysis HTML content
      const aiAnalysisHTML = aiAnalysisElement.innerHTML;
      
      // Extract sections from AI analysis
      const sections = extractSectionsFromHTML(aiAnalysisHTML);
      
      // Add each section
      for (const section of sections) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Add section title
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text(section.title, 20, yPosition);
        yPosition += 8;
        
        // Add section content
        doc.setFontSize(12);
        doc.setTextColor(33, 37, 41);
        const splitContent = doc.splitTextToSize(section.content, 170);
        doc.text(splitContent, 20, yPosition);
        yPosition += (splitContent.length * 7) + 5;
      }
    }
    
    // Check if we need a new page for the recommendation
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add professional help recommendation if score is high
    if (totalScore > 30) {
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69); // Red color for emphasis
      doc.text('Important Note:', 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      const recommendationText = 'Based on your assessment score, we recommend speaking with a mental health professional who specializes in anxiety. Sharing your experiences with a trusted friend or family member can also be beneficial for support.';
      const splitRecommendation = doc.splitTextToSize(recommendationText, 170);
      doc.text(splitRecommendation, 20, yPosition);
      yPosition += (splitRecommendation.length * 7) + 10;
    }
    
    // Add disclaimer at the bottom of the last page
    doc.setFontSize(10);
    doc.setTextColor(153, 153, 153);
    const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about anxiety symptoms. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    
    // Position disclaimer at the bottom of the page
    const disclaimerY = doc.internal.pageSize.height - 20;
    doc.text(splitDisclaimer, 20, disclaimerY);
    
    // Save PDF
    doc.save('anxiety-assessment-results.pdf');
  };
  
  logoImg.onerror = function() {
    // If logo fails to load, continue without it
    console.error('Failed to load logo for PDF');
    
    // Add title without logo
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text('Anxiety Assessment Results', 105, 20, { align: 'center' });
    
    // Continue with the rest of the PDF generation (same as above but with adjusted Y positions)
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.setFontSize(16);
    doc.text('Assessment Scores', 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Total Score: ${getTotalScore()}/${anxietyQuestions.length * 3}`, 20, 50);
    
    const totalScore = getTotalScore();
    const maxScore = anxietyQuestions.length * 3;
    const percentage = (totalScore / maxScore) * 100;
    let severityLevel = "Minimal Anxiety";
    if (percentage >= 75) severityLevel = "Severe Anxiety";
    else if (percentage >= 50) severityLevel = "Moderate Anxiety";
    else if (percentage >= 25) severityLevel = "Mild Anxiety";
    
    doc.text(`Severity Level: ${severityLevel}`, 20, 57);
    
    doc.text('Category Scores:', 20, 67);
    doc.text(`• Psychological Symptoms: ${categoryScores.psychological}/15`, 25, 74);
    doc.text(`• Physical Symptoms: ${categoryScores.physical}/15`, 25, 81);
    doc.text(`• Behavioral Changes: ${categoryScores.behavioral}/15`, 25, 88);
    doc.text(`• Social Impact: ${categoryScores.social}/9`, 25, 95);
    doc.text(`• Cognitive Patterns: ${categoryScores.cognitive}/9`, 25, 102);
    
    doc.setFontSize(16);
    doc.text('Basic Interpretation', 20, 115);
    
    const assessmentInterpretationElement = document.getElementById('assessment-interpretation');
    const basicInterpretation = assessmentInterpretationElement ? assessmentInterpretationElement.textContent.trim() : '';
    
    doc.setFontSize(12);
    const splitBasicInterpretation = doc.splitTextToSize(basicInterpretation, 170);
    doc.text(splitBasicInterpretation, 20, 125);
    
    let yPosition = 125 + (splitBasicInterpretation.length * 7);
    
    const aiAnalysisElement = document.getElementById('ai-analysis');
    if (aiAnalysisElement && aiAnalysisElement.textContent.trim()) {
      yPosition += 10;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text('AI Analysis & Personalized Recommendations', 20, yPosition);
      yPosition += 10;
      
      const aiAnalysisHTML = aiAnalysisElement.innerHTML;
      const sections = extractSectionsFromHTML(aiAnalysisHTML);
      
      for (const section of sections) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text(section.title, 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(12);
        doc.setTextColor(33, 37, 41);
        const splitContent = doc.splitTextToSize(section.content, 170);
        doc.text(splitContent, 20, yPosition);
        yPosition += (splitContent.length * 7) + 5;
      }
    }
    
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (totalScore > 30) {
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69);
      doc.text('Important Note:', 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      const recommendationText = 'Based on your assessment score, we recommend speaking with a mental health professional who specializes in anxiety. Sharing your experiences with a trusted friend or family member can also be beneficial for support.';
      const splitRecommendation = doc.splitTextToSize(recommendationText, 170);
      doc.text(splitRecommendation, 20, yPosition);
      yPosition += (splitRecommendation.length * 7) + 10;
    }
    
    doc.setFontSize(10);
    doc.setTextColor(153, 153, 153);
    const disclaimer = 'IMPORTANT: This assessment is not a diagnostic tool. It is designed to raise awareness about anxiety symptoms. For proper diagnosis and treatment, please consult with a qualified mental health professional.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    
    const disclaimerY = doc.internal.pageSize.height - 20;
    doc.text(splitDisclaimer, 20, disclaimerY);
    
    doc.save('anxiety-assessment-results.pdf');
  };
}

// Helper function to extract sections from HTML content
function extractSectionsFromHTML(html) {
  const sections = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Find all h4 elements (section titles)
  const h4Elements = tempDiv.querySelectorAll('h4');
  
  h4Elements.forEach((h4, index) => {
    const title = h4.textContent.trim();
    let content = '';
    let currentElement = h4.nextElementSibling;
    
    // Collect all content until the next h4 or end
    while (currentElement && currentElement.tagName !== 'H4') {
      // For lists, format them with bullet points
      if (currentElement.tagName === 'UL') {
        const listItems = currentElement.querySelectorAll('li');
        listItems.forEach(li => {
          content += `• ${li.textContent.trim()}\n`;
        });
      } else {
        content += currentElement.textContent.trim() + '\n\n';
      }
      currentElement = currentElement.nextElementSibling;
    }
    
    sections.push({ title, content: content.trim() });
  });
  
  // If no sections were found, extract all text
  if (sections.length === 0) {
    sections.push({
      title: 'Personalized Insights',
      content: tempDiv.textContent.trim()
    });
  }
  
  return sections;
}

// Reset assessment
function resetAssessment() {
  // Reset state
  currentQuestion = 0;
  answers = new Array(anxietyQuestions.length).fill(null);
  categoryScores = {
    psychological: 0,
    physical: 0,
    behavioral: 0,
    social: 0,
    cognitive: 0
  };
  
  // Reset UI
  const resultSection = document.getElementById('result-section');
  const introSection = document.getElementById('intro-section');
  
  if (resultSection) resultSection.style.display = 'none';
  if (introSection) introSection.style.display = 'block';
  
  // Clear additional info
  const additionalInfoInput = document.getElementById('additional-info');
  if (additionalInfoInput) additionalInfoInput.value = '';
}

// Export functions for use in React component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startAssessment,
    loadQuestion,
    handleNextQuestion,
    showAdditionalInfoSection,
    showLoadingSection,
    showResultsSection,
    calculateScores,
    getTotalScore,
    updateScoreDisplay,
    updateCategoryScores,
    setBarColor,
    setBasicInterpretation,
    generateAIInsights,
    formatAIResponse,
    submitAssessment,
    downloadResults,
    extractSectionsFromHTML,
    resetAssessment,
    anxietyQuestions
  };
}
